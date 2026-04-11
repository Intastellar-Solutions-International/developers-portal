import { ObjectId } from "mongodb";

import type { PortalAccountSession } from "./intastellar-portal-session.server";
import { USER_ACCOUNTS_COLLECTION } from "./mongodb-schema.server";
import { getCollection } from "./mongodb.server";
import {
  clampBookmarkTitle,
  normalizeSavedDocumentationPath,
  type SavedDocumentationBookmark,
} from "./saved-documentation.server";

export type { SavedDocumentationBookmark } from "./saved-documentation.server";

const MAX_SAVED_DOCUMENTATION = 40;

/** Supported external identity providers (extend when adding e.g. Google). */
export type AuthProviderId = "intastellar" | "github";

/**
 * One linked login method. `subject` is stable per provider:
 * - intastellar: normalized email
 * - github: numeric user id as string
 */
export type UserIdentity = {
  provider: AuthProviderId;
  subject: string;
  email?: string;
  login?: string;
  avatarUrl?: string;
  linkedAt: Date;
};

/**
 * Portal user document — one account, many provider identities (linked logins).
 */
export type UserAccountRecord = {
  /** Normalized email when known (helps linking + display). */
  primaryEmail?: string;
  displayName?: string;
  avatarUrl?: string;
  /** Bookmarked docs (`/docs/...` canonical paths). */
  savedDocumentation?: SavedDocumentationBookmark[];
  identities: UserIdentity[];
  createdAt: Date;
  updatedAt: Date;
};

export type GitHubUserInput = {
  id: number | string;
  login: string;
  /**
   * Preferred address for sessions / display: GitHub primary+verified when set, else first
   * verified address from `GET /user/emails`.
   */
  email: string | null;
  /**
   * Every **verified** email GitHub returned (normalized). Any one may match an Intastellar
   * account when linking or signing in.
   */
  verifiedEmails: string[];
  name: string | null;
  avatarUrl: string | null;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Upsert account from Intastellar profile data (SDK-provided user object).
 * If the user previously signed up with GitHub and the SSO email matches that account, links
 * Intastellar onto the same document (symmetric with `ensureUserFromGitHub` email matching).
 */
export async function ensureUserFromIntastellar(
  session: PortalAccountSession,
): Promise<ObjectId | null> {
  const coll = await getCollection<UserAccountRecord>(USER_ACCOUNTS_COLLECTION);
  if (!coll) return null;

  const subject = normalizeEmail(session.email);
  const now = new Date();

  const existing = await coll.findOne({
    identities: { $elemMatch: { provider: "intastellar", subject } },
  });

  if (existing) {
    const $set: Record<string, unknown> = {
      primaryEmail: subject,
      displayName: session.displayName,
      updatedAt: now,
    };
    if (session.imageUrl) {
      $set.avatarUrl = session.imageUrl;
    }
    await coll.updateOne({ _id: existing._id }, { $set });
    return existing._id;
  }

  /**
   * GitHub-first signup: same person later signs in with Intastellar (SSO email matches a verified
   * GitHub email we stored on a GitHub-only row). Merge Intastellar onto that account instead of
   * creating a duplicate.
   */
  const githubOnlyWithMatchingEmail = await coll.findOne({
    identities: { $elemMatch: { provider: "github" } },
    $nor: [{ identities: { $elemMatch: { provider: "intastellar" } } }],
    $or: [
      { primaryEmail: subject },
      {
        identities: {
          $elemMatch: { provider: "github", email: subject },
        },
      },
    ],
  });
  if (githubOnlyWithMatchingEmail) {
    const emails = portalAccountEmailSet(githubOnlyWithMatchingEmail);
    if (emails.has(subject)) {
      const $set: Record<string, unknown> = {
        primaryEmail: subject,
        displayName:
          session.displayName?.trim() || githubOnlyWithMatchingEmail.displayName,
        updatedAt: now,
      };
      if (session.imageUrl) {
        $set.avatarUrl = session.imageUrl;
      }
      await coll.updateOne(
        { _id: githubOnlyWithMatchingEmail._id },
        {
          $push: {
            identities: {
              provider: "intastellar",
              subject,
              email: subject,
              linkedAt: now,
            },
          },
          $set,
        },
      );
      return githubOnlyWithMatchingEmail._id;
    }
  }

  const insertResult = await coll.insertOne({
    primaryEmail: subject,
    displayName: session.displayName,
    ...(session.imageUrl ? { avatarUrl: session.imageUrl } : {}),
    identities: [
      {
        provider: "intastellar",
        subject,
        email: subject,
        linkedAt: now,
      },
    ],
    createdAt: now,
    updatedAt: now,
  });

  return insertResult.insertedId;
}

/**
 * Upsert / link GitHub identity. Call from GitHub OAuth callback (when you add that route).
 * If a verified email matches an existing Intastellar identity, links GitHub onto the same account.
 */
export async function ensureUserFromGitHub(
  input: GitHubUserInput,
): Promise<ObjectId | null> {
  const coll = await getCollection<UserAccountRecord>(USER_ACCOUNTS_COLLECTION);
  if (!coll) return null;

  const subject = String(input.id);
  const now = new Date();
  const verifiedUnique = [
    ...new Set(
      (input.verifiedEmails?.length
        ? input.verifiedEmails
        : input.email
          ? [input.email]
          : []
      ).map((e) => normalizeEmail(e)),
    ),
  ];
  const normEmail =
    input.email != null && String(input.email).trim()
      ? normalizeEmail(String(input.email))
      : verifiedUnique[0] ?? null;

  const byGithub = await coll.findOne({
    identities: { $elemMatch: { provider: "github", subject } },
  });

  if (byGithub) {
    await coll.updateOne(
      { _id: byGithub._id },
      {
        $set: {
          displayName: input.name?.trim() || input.login,
          avatarUrl: input.avatarUrl ?? byGithub.avatarUrl,
          primaryEmail: normEmail ?? byGithub.primaryEmail,
          updatedAt: now,
        },
      },
    );
    return byGithub._id;
  }

  if (verifiedUnique.length > 0) {
    const orConds = verifiedUnique.flatMap((norm) => [
      { primaryEmail: norm },
      {
        identities: {
          $elemMatch: { provider: "intastellar", subject: norm },
        },
      },
    ]);
    const linked = await coll.findOne({ $or: orConds });

    if (linked) {
      const accepted = portalAccountEmailSet(linked);
      const matchedEmail =
        pickGitHubEmailMatchingPortal(accepted, verifiedUnique) ?? verifiedUnique[0];
      const hasGithub = linked.identities.some(
        (i) => i.provider === "github" && i.subject === subject,
      );
      if (!hasGithub) {
        await coll.updateOne(
          { _id: linked._id },
          {
            $push: {
              identities: {
                provider: "github",
                subject,
                email: matchedEmail,
                login: input.login,
                avatarUrl: input.avatarUrl ?? undefined,
                linkedAt: now,
              },
            },
            $set: {
              primaryEmail: linked.primaryEmail ?? matchedEmail,
              displayName: linked.displayName || input.name?.trim() || input.login,
              avatarUrl: input.avatarUrl ?? linked.avatarUrl,
              updatedAt: now,
            },
          },
        );
      } else {
        await coll.updateOne(
          { _id: linked._id },
          { $set: { updatedAt: now } },
        );
      }
      return linked._id;
    }
  }

  const insertResult = await coll.insertOne({
    primaryEmail: normEmail ?? undefined,
    displayName: input.name?.trim() || input.login,
    avatarUrl: input.avatarUrl ?? undefined,
    identities: [
      {
        provider: "github",
        subject,
        email: normEmail ?? undefined,
        login: input.login,
        avatarUrl: input.avatarUrl ?? undefined,
        linkedAt: now,
      },
    ],
    createdAt: now,
    updatedAt: now,
  });

  return insertResult.insertedId;
}

/** First GitHub verified address that also appears on the portal account (normalized). */
function pickGitHubEmailMatchingPortal(
  accepted: Set<string>,
  verifiedEmails: string[],
): string | null {
  for (const raw of verifiedEmails) {
    const n = normalizeEmail(raw);
    if (accepted.has(n)) return n;
  }
  return null;
}

/** All normalized emails we treat as “this portal account” for GitHub link verification. */
function portalAccountEmailSet(doc: UserAccountRecord): Set<string> {
  const s = new Set<string>();
  const p = doc.primaryEmail?.trim();
  if (p) s.add(normalizeEmail(p));
  for (const id of doc.identities ?? []) {
    if (id.provider === "intastellar" && typeof id.subject === "string") {
      const sub = id.subject.trim();
      if (sub) s.add(normalizeEmail(sub));
    }
    if (typeof id.email === "string" && id.email.trim()) {
      s.add(normalizeEmail(id.email));
    }
  }
  return s;
}

export type LinkGitHubToPortalAccountError =
  | "not_found"
  | "email_mismatch"
  | "github_taken"
  | "no_verified_email";

/**
 * Attach a GitHub identity to an **already logged-in** portal account.
 * Succeeds if **any** verified GitHub address matches the account’s Intastellar / primary emails.
 */
export async function linkGitHubIdentityToPortalAccount(
  accountId: ObjectId,
  input: GitHubUserInput,
): Promise<{ ok: true } | { ok: false; error: LinkGitHubToPortalAccountError }> {
  const coll = await getCollection<UserAccountRecord>(USER_ACCOUNTS_COLLECTION);
  if (!coll) return { ok: false, error: "not_found" };

  const verifiedUnique = [
    ...new Set(
      (input.verifiedEmails?.length
        ? input.verifiedEmails
        : input.email
          ? [input.email]
          : []
      ).map((e) => normalizeEmail(e)),
    ),
  ];
  if (verifiedUnique.length === 0) {
    return { ok: false, error: "no_verified_email" };
  }

  const subject = String(input.id);
  const now = new Date();

  const other = await coll.findOne({
    _id: { $ne: accountId },
    identities: { $elemMatch: { provider: "github", subject } },
  });
  if (other) {
    return { ok: false, error: "github_taken" };
  }

  const doc = await coll.findOne({ _id: accountId });
  if (!doc) {
    return { ok: false, error: "not_found" };
  }

  const accepted = portalAccountEmailSet(doc);
  const matchedEmail = pickGitHubEmailMatchingPortal(accepted, verifiedUnique);
  if (!matchedEmail) {
    return { ok: false, error: "email_mismatch" };
  }

  const hasGithub = doc.identities.some(
    (i) => i.provider === "github" && i.subject === subject,
  );
  if (hasGithub) {
    await coll.updateOne(
      { _id: accountId },
      {
        $set: {
          displayName: doc.displayName || input.name?.trim() || input.login,
          avatarUrl: input.avatarUrl ?? doc.avatarUrl,
          updatedAt: now,
        },
      },
    );
    return { ok: true };
  }

  await coll.updateOne(
    { _id: accountId },
    {
      $push: {
        identities: {
          provider: "github",
          subject,
          email: matchedEmail,
          login: input.login,
          avatarUrl: input.avatarUrl ?? undefined,
          linkedAt: now,
        },
      },
      $set: {
        displayName: doc.displayName || input.name?.trim() || input.login,
        avatarUrl: input.avatarUrl ?? doc.avatarUrl,
        updatedAt: now,
      },
    },
  );

  return { ok: true };
}

export async function getUserAccountById(
  id: ObjectId,
): Promise<UserAccountRecord & { _id: ObjectId } | null> {
  const coll = await getCollection<UserAccountRecord>(USER_ACCOUNTS_COLLECTION);
  if (!coll) return null;
  const doc = await coll.findOne({ _id: id });
  return doc;
}

export async function addSavedDocumentationBookmark(
  accountId: ObjectId,
  pathInput: string,
  titleInput: string,
): Promise<{ ok: true } | { ok: false; error: "invalid_path" | "not_found" }> {
  const path = normalizeSavedDocumentationPath(pathInput);
  if (!path) return { ok: false, error: "invalid_path" };
  const coll = await getCollection<UserAccountRecord>(USER_ACCOUNTS_COLLECTION);
  if (!coll) return { ok: false, error: "not_found" };

  const existing = await coll.findOne({ _id: accountId });
  if (!existing) return { ok: false, error: "not_found" };

  const title = clampBookmarkTitle(titleInput);
  const now = new Date();
  const prev = [...(existing.savedDocumentation ?? [])].filter(
    (b) => b.path !== path,
  );
  const entry: SavedDocumentationBookmark = { path, title, savedAt: now };
  const next = [entry, ...prev].slice(0, MAX_SAVED_DOCUMENTATION);

  await coll.updateOne(
    { _id: accountId },
    { $set: { savedDocumentation: next, updatedAt: now } },
  );
  return { ok: true };
}

export async function removeSavedDocumentationBookmark(
  accountId: ObjectId,
  pathInput: string,
): Promise<{ ok: true } | { ok: false; error: "invalid_path" | "not_found" }> {
  const path = normalizeSavedDocumentationPath(pathInput);
  if (!path) return { ok: false, error: "invalid_path" };
  const coll = await getCollection<UserAccountRecord>(USER_ACCOUNTS_COLLECTION);
  if (!coll) return { ok: false, error: "not_found" };

  const existing = await coll.findOne({ _id: accountId });
  if (!existing) return { ok: false, error: "not_found" };

  const now = new Date();
  const next = (existing.savedDocumentation ?? []).filter((b) => b.path !== path);

  await coll.updateOne(
    { _id: accountId },
    { $set: { savedDocumentation: next, updatedAt: now } },
  );
  return { ok: true };
}
