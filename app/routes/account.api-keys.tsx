import { Fragment, useEffect, useRef, useState } from "react";
import {
  data,
  Form,
  Link,
  useActionData,
  useFetcher,
  useLoaderData,
  useNavigation,
  useRevalidator,
} from "react-router";

import type { Route } from "./+types/account.api-keys";
import { copyToClipboard } from "~/lib/copy-to-clipboard";
import {
  createApiKey,
  listApiKeysForUser,
  revealApiKeyPlaintext,
  revokeApiKey,
  updateApiKeySignInMetadata,
} from "~/lib/api-keys.server";
import { getIntastellarClientConfig } from "~/lib/intastellar-config";
import { isMongoConfigured } from "~/lib/mongodb.server";
import {
  resolvePortalSessionForRequest,
} from "~/lib/portal-account.server";
import { publicAccountToResolved } from "~/lib/portal-user.server";
import { useIntastellarAuth } from "~/providers/intastellar-auth-provider";

export function meta(_: Route.MetaArgs) {
  return [{ title: "API keys · inta.dev" }];
}

export type ApiKeysLoaderData = {
  ssoConfigured: boolean;
  mongoConfigured: boolean;
  signedInOnServer: boolean;
  keys: Awaited<ReturnType<typeof listApiKeysForUser>>;
};

function loaderHeadersFromSetCookie(setCookieHeaders: string[]): Headers {
  const headers = new Headers();
  for (const c of setCookieHeaders) {
    headers.append("Set-Cookie", c);
  }
  return headers;
}

export async function loader({ request }: Route.LoaderArgs) {
  const ssoConfigured = getIntastellarClientConfig() != null;
  const mongoConfigured = isMongoConfigured();
  const { account, setCookieHeaders } =
    await resolvePortalSessionForRequest(request);

  const user = publicAccountToResolved(account);
  const keys =
    user && mongoConfigured
      ? await listApiKeysForUser(user.accountId, user.email)
      : [];
  const payload: ApiKeysLoaderData = {
    ssoConfigured,
    mongoConfigured,
    signedInOnServer: user != null,
    keys,
  };
  if (setCookieHeaders.length === 0) {
    return payload;
  }
  return data(payload, { headers: loaderHeadersFromSetCookie(setCookieHeaders) });
}

export type ApiKeysActionData =
  | {
      ok: true;
      plaintextKey?: string;
      newKeyId?: string;
      revealKeyId?: string;
    }
  | { ok: false; error: string; revealKeyId?: string };

function actionResponse(
  body: ApiKeysActionData,
  setCookieHeaders: string[],
): ApiKeysActionData | ReturnType<typeof data> {
  if (setCookieHeaders.length === 0) return body;
  const headers = new Headers();
  for (const c of setCookieHeaders) {
    headers.append("Set-Cookie", c);
  }
  return data(body, { headers });
}

export async function action({ request }: Route.ActionArgs) {
  const { account, setCookieHeaders } =
    await resolvePortalSessionForRequest(request);
  const user = publicAccountToResolved(account);

  if (!user?.email) {
    return actionResponse(
      { ok: false, error: "Sign in again to manage API keys." },
      setCookieHeaders,
    );
  }
  if (!isMongoConfigured()) {
    return actionResponse(
      { ok: false, error: "Database is not configured on the server." },
      setCookieHeaders,
    );
  }

  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");

  if (intent === "reveal") {
    const keyId = String(form.get("keyId") ?? "");
    const result = await revealApiKeyPlaintext(
      user.accountId,
      user.email,
      keyId,
    );
    if (!result.ok) {
      return actionResponse(
        { ok: false, error: result.error, revealKeyId: keyId },
        setCookieHeaders,
      );
    }
    return actionResponse(
      {
        ok: true,
        plaintextKey: result.plaintextKey,
        revealKeyId: keyId,
      },
      setCookieHeaders,
    );
  }

  if (intent === "revoke") {
    const keyId = String(form.get("keyId") ?? "");
    const result = await revokeApiKey(user.accountId, user.email, keyId);
    if (!result.ok) {
      return actionResponse({ ok: false, error: result.error }, setCookieHeaders);
    }
    return actionResponse({ ok: true }, setCookieHeaders);
  }

  if (intent === "create") {
    const label = String(form.get("label") ?? "");
    const signInDomain = String(form.get("signInDomain") ?? "");
    const signInLogoUrl = String(form.get("signInLogoUrl") ?? "");
    const result = await createApiKey(user.accountId, user.email, label, {
      signInDomain,
      signInLogoUrl,
    });
    if (!result.ok) {
      return actionResponse({ ok: false, error: result.error }, setCookieHeaders);
    }
    return actionResponse(
      {
        ok: true,
        plaintextKey: result.plaintextKey,
        newKeyId: result.id,
      },
      setCookieHeaders,
    );
  }

  if (intent === "update_sign_in") {
    const keyId = String(form.get("keyId") ?? "");
    const signInDomain = String(form.get("signInDomain") ?? "");
    const signInLogoUrl = String(form.get("signInLogoUrl") ?? "");
    const result = await updateApiKeySignInMetadata(
      user.accountId,
      user.email,
      keyId,
      signInDomain,
      signInLogoUrl,
    );
    if (!result.ok) {
      return actionResponse({ ok: false, error: result.error }, setCookieHeaders);
    }
    return actionResponse({ ok: true }, setCookieHeaders);
  }

  return actionResponse({ ok: false, error: "Unknown action." }, setCookieHeaders);
}

function formatCreated(iso: string) {
  try {
    return new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

const panelClass =
  "rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800";
const linkClass =
  "font-medium text-brand hover:text-brand-hover underline-offset-2 hover:underline";
const btnPrimaryClass =
  "rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground shadow-sm transition-colors hover:bg-brand-hover disabled:opacity-60";
const btnDangerClass =
  "rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-60 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/40";
const btnSecondaryClass =
  "rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800";
const btnIconClass =
  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-300 bg-white text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800";

const inputClass =
  "mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100";

function KeyLogoThumb({ url }: { url: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return <span className="text-xs text-zinc-400">Unloaded</span>;
  }
  return (
    <img
      src={url}
      alt=""
      className="h-8 max-w-[6rem] object-contain object-left"
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

/**
 * Same-tab only: optional restore after refresh. Returning later uses the eye + server decrypt.
 */
const VISIBLE_KEY_STORAGE = "inta_portal_visible_api_key";

function IconEye({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconEyeOff({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

function CopyApiKeyButton({ secret }: { secret: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  return (
    <button
      type="button"
      className={btnSecondaryClass}
      onClick={() => {
        void (async () => {
          const ok = await copyToClipboard(secret);
          setState(ok ? "copied" : "failed");
          window.setTimeout(() => setState("idle"), ok ? 2000 : 2500);
        })();
      }}
    >
      {state === "copied"
        ? "Copied"
        : state === "failed"
          ? "Copy failed"
          : "Copy key"}
    </button>
  );
}

export default function AccountApiKeys() {
  const {
    ssoConfigured,
    mongoConfigured,
    signedInOnServer,
    keys,
  } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const revealFetcher = useFetcher<typeof action>();
  const navigation = useNavigation();
  const busy = navigation.state !== "idle";
  const revalidator = useRevalidator();
  const sessionSyncRef = useRef(0);
  /** Until the new key appears in `keys`, don’t treat “missing id” as revoked. */
  const pendingNewKeyIdRef = useRef<string | null>(null);
  const storageSyncPass = useRef(0);
  const [sessionHardFail, setSessionHardFail] = useState(false);
  /** Plaintext shown in UI: after create, reveal, or sessionStorage restore (same tab). */
  const [visibleSecrets, setVisibleSecrets] = useState<Record<string, string>>(
    {},
  );
  const [showNewKeyBanner, setShowNewKeyBanner] = useState(false);
  const [editingKeyId, setEditingKeyId] = useState<string | null>(null);
  const {
    authReady,
    configured: clientConfigured,
    isSignedIn: clientSignedIn,
  } = useIntastellarAuth();

  const sessionUiMismatch =
    mongoConfigured &&
    clientConfigured &&
    clientSignedIn &&
    !signedInOnServer;

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(VISIBLE_KEY_STORAGE);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { id?: string; s?: string };
      if (typeof parsed.id === "string" && typeof parsed.s === "string") {
        setVisibleSecrets((p) => ({ ...p, [parsed.id!]: parsed.s! }));
      }
    } catch {
      /* private mode / bad JSON */
    }
  }, []);

  useEffect(() => {
    const d = revealFetcher.data;
    if (!d || d.ok !== true || !d.plaintextKey || !d.revealKeyId) return;
    setVisibleSecrets((p) => ({ ...p, [d.revealKeyId!]: d.plaintextKey! }));
  }, [revealFetcher.data]);

  useEffect(() => {
    if (actionData?.ok !== true || !actionData.plaintextKey) return;
    if (actionData.revealKeyId) return;
    if (actionData.newKeyId) {
      pendingNewKeyIdRef.current = actionData.newKeyId;
      setShowNewKeyBanner(true);
      setVisibleSecrets((p) => ({
        ...p,
        [actionData.newKeyId!]: actionData.plaintextKey!,
      }));
    }
  }, [actionData]);

  useEffect(() => {
    const pid = pendingNewKeyIdRef.current;
    if (pid && keys.some((k) => k.id === pid)) {
      pendingNewKeyIdRef.current = null;
    }
  }, [keys]);

  useEffect(() => {
    setVisibleSecrets((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const id of Object.keys(next)) {
        if (keys.some((k) => k.id === id)) continue;
        if (id === pendingNewKeyIdRef.current) continue;
        delete next[id];
        changed = true;
      }
      return changed ? next : prev;
    });
  }, [keys]);

  useEffect(() => {
    storageSyncPass.current += 1;
    if (storageSyncPass.current === 1) return;
    try {
      const ids = Object.keys(visibleSecrets);
      if (ids.length === 1) {
        const id = ids[0]!;
        sessionStorage.setItem(
          VISIBLE_KEY_STORAGE,
          JSON.stringify({ id, s: visibleSecrets[id]! }),
        );
      } else {
        sessionStorage.removeItem(VISIBLE_KEY_STORAGE);
      }
    } catch {
      /* ignore */
    }
  }, [visibleSecrets]);

  useEffect(() => {
    if (actionData?.ok !== true) return;
    if ("plaintextKey" in actionData && actionData.plaintextKey) return;
    setEditingKeyId(null);
  }, [actionData]);

  useEffect(() => {
    if (!sessionUiMismatch) {
      sessionSyncRef.current = 0;
      setSessionHardFail(false);
      return;
    }
    if (revalidator.state !== "idle") return;
    if (sessionSyncRef.current >= 8) {
      setSessionHardFail(true);
      return;
    }
    sessionSyncRef.current += 1;
    revalidator.revalidate();
  }, [sessionUiMismatch, revalidator.state, revalidator.revalidate]);

  const canUseKeys =
    ssoConfigured &&
    mongoConfigured &&
    signedInOnServer &&
    clientSignedIn &&
    clientConfigured;

  const revealFd = revealFetcher.formData;
  const revealingKeyId =
    revealFetcher.state !== "idle" &&
    revealFd &&
    revealFd.get("intent") === "reveal"
      ? String(revealFd.get("keyId") ?? "")
      : null;

  const actionFormError =
    actionData?.ok === false ? actionData.error : null;

  return (
    <section className={panelClass}>
      <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
        API keys
      </h2>

      {!authReady ? (
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>
      ) : !ssoConfigured ? (
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
          Set{" "}
          <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-900">
            VITE_INTASTELLAR_CLIENT_ID
          </code>{" "}
          to enable sign-in, then configure MongoDB below.
        </p>
      ) : !clientConfigured || !clientSignedIn ? (
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
          <Link to="/account/login" className={linkClass}>
            Sign in
          </Link>{" "}
          with Intastellar to create and revoke keys. Keys are tied to your
          account email.
        </p>
      ) : !mongoConfigured ? (
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
          Add{" "}
          <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-900">
            MONGODB_URI
          </code>{" "}
          (Atlas connection string) to your server environment. Optional:{" "}
          <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-900">
            MONGODB_DB
          </code>{" "}
          (default{" "}
          <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-900">
            inta_portal
          </code>
          ),{" "}
          <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-900">
            API_KEY_PEPPER
          </code>{" "}
          (required in production — hashing and encrypted-at-rest reveal in this
          portal).
        </p>
      ) : !signedInOnServer ? (
        <div className="mt-4 space-y-3 text-sm text-amber-800 dark:text-amber-200">
          {sessionUiMismatch && revalidator.state !== "idle" ? (
            <p className="text-zinc-600 dark:text-zinc-400">
              Syncing your session with the server…
            </p>
          ) : null}
          {sessionUiMismatch && sessionHardFail ? (
            <div className="space-y-2">
              <p>
                Signed in in the app, but the API keys request still has no portal
                session cookie. Common causes: stale loader cache,{" "}
                <code className="mx-1 text-xs">localhost</code> vs{" "}
                <code className="text-xs">127.0.0.1</code>, or missing{" "}
                <code className="text-xs">SESSION_SECRET</code> in production (the
                signed session cookie cannot be created).
              </p>
              <ul className="list-inside list-disc space-y-1 text-zinc-700 dark:text-zinc-300">
                <li>
                  Hard-refresh this page (full reload), or open API keys in a new
                  tab.
                </li>
                <li>
                  Use one host only for dev (
                  <code className="text-xs">localhost</code> or{" "}
                  <code className="text-xs">127.0.0.1</code>).
                </li>
                <li>
                  Set <code className="text-xs">SESSION_SECRET</code> in production.
                </li>
              </ul>
              <p>
                <Link to="/account/login" className={linkClass}>
                  Sign in again
                </Link>
              </p>
            </div>
          ) : sessionUiMismatch ? (
            <p className="text-zinc-600 dark:text-zinc-400">
              Aligning server session with your account… If this persists, reload
              the page.
            </p>
          ) : (
            <p>
              The server could not verify your session cookie. Try refreshing this
              page after sign-in, or{" "}
              <Link to="/account/login" className={linkClass}>
                sign out and sign in again
              </Link>
              .
            </p>
          )}
        </div>
      ) : (
        <div className="mt-4 space-y-6">
          {actionFormError ? (
            <p
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100"
              role="alert"
            >
              {actionFormError}
            </p>
          ) : null}

          {showNewKeyBanner ? (
            <div
              className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-50"
              role="status"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <p className="font-medium sm:pt-0.5">
                  Key created. The full secret is in the table below — use{" "}
                  <span className="whitespace-nowrap">Copy key</span> there. You
                  can hide it with the eye icon; open the eye anytime while signed in
                  to reveal and copy again (we keep an encrypted copy server-side).
                </p>
                <button
                  type="button"
                  className={`${btnSecondaryClass} shrink-0 text-zinc-600 dark:text-zinc-300`}
                  onClick={() => setShowNewKeyBanner(false)}
                >
                  Dismiss
                </button>
              </div>
            </div>
          ) : null}

          {canUseKeys ? (
            <div className="space-y-3">
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Optional <strong className="font-medium">Sign-in domain</strong> and{" "}
                <strong className="font-medium">logo URL</strong> are used with Intastellar
                Sign-In (hostname we store; logo must be{" "}
                <code className="rounded bg-zinc-100 px-1 text-[0.7rem] dark:bg-zinc-900">
                  https://
                </code>
                ).
              </p>
              <Form method="post" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <input type="hidden" name="intent" value="create" />
                <div className="min-w-0 sm:col-span-2 lg:col-span-1">
                  <label
                    htmlFor="key-label"
                    className="block text-xs font-medium text-zinc-600 dark:text-zinc-400"
                  >
                    Label <span className="text-red-600 dark:text-red-400">*</span>
                  </label>
                  <input
                    id="key-label"
                    name="label"
                    type="text"
                    required
                    maxLength={120}
                    placeholder="e.g. Production website"
                    className={inputClass}
                  />
                </div>
                <div className="min-w-0">
                  <label
                    htmlFor="key-sign-in-domain"
                    className="block text-xs font-medium text-zinc-600 dark:text-zinc-400"
                  >
                    Sign-in domain
                  </label>
                  <input
                    id="key-sign-in-domain"
                    name="signInDomain"
                    type="text"
                    maxLength={253}
                    placeholder="app.example.com"
                    className={inputClass}
                    autoComplete="off"
                  />
                </div>
                <div className="min-w-0 sm:col-span-2 lg:col-span-1">
                  <label
                    htmlFor="key-sign-in-logo"
                    className="block text-xs font-medium text-zinc-600 dark:text-zinc-400"
                  >
                    Logo URL
                  </label>
                  <input
                    id="key-sign-in-logo"
                    name="signInLogoUrl"
                    type="url"
                    inputMode="url"
                    maxLength={2048}
                    placeholder="https://cdn.example.com/logo.svg"
                    className={inputClass}
                    autoComplete="off"
                  />
                </div>
                <div className="flex items-end sm:col-span-2 lg:col-span-1">
                  <button
                    type="submit"
                    disabled={busy}
                    className={`${btnPrimaryClass} w-full sm:w-auto`}
                  >
                    {busy ? "…" : "Create key"}
                  </button>
                </div>
              </Form>
            </div>
          ) : null}

          {canUseKeys && keys.length === 0 ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              No keys yet. Create one to get a secret for your servers or tooling.
              We store a hash for validation and an encrypted copy so you can reveal
              and copy it later from this page.
            </p>
          ) : null}

          {canUseKeys && keys.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[36rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-600 dark:text-zinc-400">
                    <th className="pb-2 pr-4 font-medium">Label</th>
                    <th className="pb-2 pr-4 font-medium">Key</th>
                    <th className="pb-2 pr-4 font-medium">Sign-in domain</th>
                    <th className="pb-2 pr-4 font-medium">Logo</th>
                    <th className="pb-2 pr-4 font-medium">Created</th>
                    <th className="pb-2 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {keys.map((k) => (
                    <Fragment key={k.id}>
                      <tr className="border-b border-zinc-100 dark:border-zinc-700/80">
                        <td className="py-3 pr-4 text-zinc-900 dark:text-zinc-100">
                          {k.label}
                        </td>
                        <td className="max-w-[min(100%,24rem)] py-3 pr-4 align-top">
                          <div className="flex flex-col gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-xs text-zinc-600 dark:text-zinc-400">
                                {k.keyPrefix}
                              </span>
                              {visibleSecrets[k.id] ? (
                                <>
                                  <CopyApiKeyButton
                                    secret={visibleSecrets[k.id]!}
                                  />
                                  <button
                                    type="button"
                                    className={btnIconClass}
                                    aria-label="Hide key"
                                    onClick={() =>
                                      setVisibleSecrets((p) => {
                                        const { [k.id]: _, ...rest } = p;
                                        return rest;
                                      })
                                    }
                                  >
                                    <IconEyeOff className="h-4 w-4" />
                                  </button>
                                </>
                              ) : k.canReveal ? (
                                <revealFetcher.Form method="post" className="inline">
                                  <input
                                    type="hidden"
                                    name="intent"
                                    value="reveal"
                                  />
                                  <input type="hidden" name="keyId" value={k.id} />
                                  <button
                                    type="submit"
                                    className={btnIconClass}
                                    disabled={revealFetcher.state !== "idle"}
                                    aria-label={
                                      revealingKeyId === k.id
                                        ? "Loading…"
                                        : "Reveal key to copy"
                                    }
                                  >
                                    {revealingKeyId === k.id ? (
                                      <span className="text-xs font-medium text-zinc-500">
                                        …
                                      </span>
                                    ) : (
                                      <IconEye className="h-4 w-4" />
                                    )}
                                  </button>
                                </revealFetcher.Form>
                              ) : null}
                            </div>
                            {visibleSecrets[k.id] ? (
                              <pre className="max-h-24 overflow-auto rounded border border-zinc-200 bg-zinc-50 px-2 py-1.5 font-mono text-[0.65rem] leading-snug text-zinc-900 select-all dark:border-zinc-600 dark:bg-zinc-900/60 dark:text-zinc-100">
                                {visibleSecrets[k.id]}
                              </pre>
                            ) : !k.canReveal ? (
                              <p className="text-[0.65rem] leading-snug text-zinc-500 dark:text-zinc-400">
                                No encrypted secret on file (usually an older key).
                                Create a new key to enable reveal and copy later.
                              </p>
                            ) : null}
                            {revealFetcher.state === "idle" &&
                            revealFetcher.data?.ok === false &&
                            revealFetcher.data.revealKeyId === k.id ? (
                              <p
                                className="text-[0.65rem] leading-snug text-red-600 dark:text-red-400"
                                role="alert"
                              >
                                {revealFetcher.data.error}
                              </p>
                            ) : null}
                          </div>
                        </td>
                        <td className="max-w-[10rem] truncate py-3 pr-4 text-zinc-700 dark:text-zinc-300">
                          {k.signInDomain ?? (
                            <span className="text-zinc-400">—</span>
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          {k.signInLogoUrl ? (
                            <KeyLogoThumb url={k.signInLogoUrl} />
                          ) : (
                            <span className="text-zinc-400">—</span>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-zinc-600 dark:text-zinc-400">
                          {formatCreated(k.createdAt)}
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            <button
                              type="button"
                              className={btnSecondaryClass}
                              disabled={busy}
                              onClick={() =>
                                setEditingKeyId((id) =>
                                  id === k.id ? null : k.id,
                                )
                              }
                            >
                              {editingKeyId === k.id ? "Close" : "Sign-in"}
                            </button>
                            <Form method="post" className="inline">
                              <input type="hidden" name="intent" value="revoke" />
                              <input type="hidden" name="keyId" value={k.id} />
                              <button
                                type="submit"
                                disabled={busy}
                                className={btnDangerClass}
                              >
                                Revoke
                              </button>
                            </Form>
                          </div>
                        </td>
                      </tr>
                      {editingKeyId === k.id ? (
                        <tr className="border-b border-zinc-100 bg-zinc-50 dark:border-zinc-700/80 dark:bg-zinc-900/40">
                          <td colSpan={6} className="px-4 py-4">
                            <Form method="post" className="mx-auto max-w-2xl space-y-3">
                              <input
                                type="hidden"
                                name="intent"
                                value="update_sign_in"
                              />
                              <input type="hidden" name="keyId" value={k.id} />
                              <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                Intastellar Sign-In — domain &amp; logo for this
                                key
                              </p>
                              <div className="grid gap-3 sm:grid-cols-2">
                                <div>
                                  <label
                                    htmlFor={`edit-domain-${k.id}`}
                                    className="block text-xs font-medium text-zinc-600 dark:text-zinc-400"
                                  >
                                    Sign-in domain
                                  </label>
                                  <input
                                    id={`edit-domain-${k.id}`}
                                    name="signInDomain"
                                    type="text"
                                    maxLength={253}
                                    defaultValue={k.signInDomain ?? ""}
                                    placeholder="app.example.com"
                                    className={inputClass}
                                    autoComplete="off"
                                  />
                                </div>
                                <div>
                                  <label
                                    htmlFor={`edit-logo-${k.id}`}
                                    className="block text-xs font-medium text-zinc-600 dark:text-zinc-400"
                                  >
                                    Logo URL (https)
                                  </label>
                                  <input
                                    id={`edit-logo-${k.id}`}
                                    name="signInLogoUrl"
                                    type="url"
                                    maxLength={2048}
                                    defaultValue={k.signInLogoUrl ?? ""}
                                    placeholder="https://…"
                                    className={inputClass}
                                    autoComplete="off"
                                  />
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="submit"
                                  disabled={busy}
                                  className={btnPrimaryClass}
                                >
                                  {busy ? "…" : "Save sign-in settings"}
                                </button>
                                <button
                                  type="button"
                                  className={btnSecondaryClass}
                                  onClick={() => setEditingKeyId(null)}
                                >
                                  Cancel
                                </button>
                              </div>
                            </Form>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
