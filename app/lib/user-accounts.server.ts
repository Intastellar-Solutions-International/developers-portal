import { ObjectId } from "mongodb";

import type { PortalAccountSession } from "./intastellar-portal-session.server";
import { USER_ACCOUNTS_COLLECTION } from "./mongodb-schema.server";
import { getCollection } from "./mongodb.server";

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
  identities: UserIdentity[];
  createdAt: Date;
  updatedAt: Date;
};

export type GitHubUserInput = {
  id: number | string;
  login: string;
  /** Verified primary email from GitHub API, if user granted scope and has one */
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Upsert account from Intastellar profile data (SDK-provided user object).
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
  const normEmail = input.email ? normalizeEmail(input.email) : null;

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

  if (normEmail) {
    const linked = await coll.findOne({
      $or: [
        { primaryEmail: normEmail },
        {
          identities: {
            $elemMatch: { provider: "intastellar", subject: normEmail },
          },
        },
      ],
    });

    if (linked) {
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
                email: normEmail,
                login: input.login,
                avatarUrl: input.avatarUrl ?? undefined,
                linkedAt: now,
              },
            },
            $set: {
              primaryEmail: linked.primaryEmail ?? normEmail,
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

export async function getUserAccountById(
  id: ObjectId,
): Promise<UserAccountRecord & { _id: ObjectId } | null> {
  const coll = await getCollection<UserAccountRecord>(USER_ACCOUNTS_COLLECTION);
  if (!coll) return null;
  const doc = await coll.findOne({ _id: id });
  return doc;
}
