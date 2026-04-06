import { Fragment, useEffect, useRef, useState } from "react";
import {
  data,
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
  useRevalidator,
} from "react-router";

import type { Route } from "./+types/account.api-keys";
import { copyToClipboard } from "~/lib/copy-to-clipboard";
import {
  createApiKey,
  listApiKeysForUser,
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
  | { ok: true; plaintextKey?: string }
  | { ok: false; error: string };

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
      { ok: true, plaintextKey: result.plaintextKey },
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

/** Session-only: full secret is not stored server-side; this lets users copy again until dismiss. */
const REVEALED_KEY_STORAGE = "inta_portal_last_plain_api_key";

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
  const navigation = useNavigation();
  const busy = navigation.state !== "idle";
  const revalidator = useRevalidator();
  const sessionSyncRef = useRef(0);
  const [sessionHardFail, setSessionHardFail] = useState(false);
  /** Plaintext only exists right after create; kept in memory + sessionStorage until dismiss. */
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
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
      const s = sessionStorage.getItem(REVEALED_KEY_STORAGE);
      if (s) setRevealedKey(s);
    } catch {
      /* private mode */
    }
  }, []);

  useEffect(() => {
    if (actionData?.ok === true && actionData.plaintextKey) {
      setRevealedKey(actionData.plaintextKey);
      try {
        sessionStorage.setItem(REVEALED_KEY_STORAGE, actionData.plaintextKey);
      } catch {
        /* ignore */
      }
    }
  }, [actionData]);

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
          (required in production — long random secret for hashing keys).
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
          {actionData?.ok === false ? (
            <p
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100"
              role="alert"
            >
              {actionData.error}
            </p>
          ) : null}

          {revealedKey ? (
            <div
              className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/50 dark:text-amber-50"
              role="status"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <p className="font-medium sm:pt-0.5">
                  Your new secret key — we only store a hash. Use{" "}
                  <span className="whitespace-nowrap">Copy key</span> anytime; dismiss
                  when you’re done (this tab won’t show it again after that).
                </p>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <CopyApiKeyButton secret={revealedKey} />
                  <button
                    type="button"
                    className={`${btnSecondaryClass} text-zinc-600 dark:text-zinc-300`}
                    onClick={() => {
                      setRevealedKey(null);
                      try {
                        sessionStorage.removeItem(REVEALED_KEY_STORAGE);
                      } catch {
                        /* ignore */
                      }
                    }}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
              <pre className="mt-3 overflow-x-auto rounded bg-white/80 px-3 py-2 font-mono text-xs text-zinc-900 select-all dark:bg-zinc-950 dark:text-zinc-100">
                {revealedKey}
              </pre>
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
              No keys yet. Create one to get a secret you can use from your
              servers or tooling (store it safely; we only keep a hash).
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
                        <td className="py-3 pr-4 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                          {k.keyPrefix}
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
