import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
} from "react-router";

import type { Route } from "./+types/account.api-keys";
import {
  createApiKey,
  listApiKeysForUser,
  revokeApiKey,
} from "~/lib/api-keys.server";
import { getIntastellarClientConfig } from "~/lib/intastellar-config";
import { isMongoConfigured } from "~/lib/mongodb.server";
import { getResolvedPortalUser } from "~/lib/portal-user.server";
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

export async function loader({ request }: Route.LoaderArgs): Promise<ApiKeysLoaderData> {
  const ssoConfigured = getIntastellarClientConfig() != null;
  const mongoConfigured = isMongoConfigured();
  const user = await getResolvedPortalUser(request);
  const keys =
    user && mongoConfigured
      ? await listApiKeysForUser(user.accountId, user.email)
      : [];
  return {
    ssoConfigured,
    mongoConfigured,
    signedInOnServer: user != null,
    keys,
  };
}

export type ApiKeysActionData =
  | { ok: true; plaintextKey?: string }
  | { ok: false; error: string };

export async function action({ request }: Route.ActionArgs): Promise<ApiKeysActionData> {
  const user = await getResolvedPortalUser(request);
  if (!user) {
    return { ok: false, error: "Sign in again to manage API keys." };
  }
  if (!isMongoConfigured()) {
    return { ok: false, error: "Database is not configured on the server." };
  }

  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");

  if (intent === "revoke") {
    const keyId = String(form.get("keyId") ?? "");
    const result = await revokeApiKey(user.accountId, user.email, keyId);
    if (!result.ok) {
      return { ok: false, error: result.error };
    }
    return { ok: true };
  }

  if (intent === "create") {
    const label = String(form.get("label") ?? "");
    const result = await createApiKey(user.accountId, user.email, label);
    if (!result.ok) {
      return { ok: false, error: result.error };
    }
    return { ok: true, plaintextKey: result.plaintextKey };
  }

  return { ok: false, error: "Unknown action." };
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
  const {
    authReady,
    configured: clientConfigured,
    isSignedIn: clientSignedIn,
  } = useIntastellarAuth();

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
        <div className="mt-4 space-y-2 text-sm text-amber-800 dark:text-amber-200">
          <p>
            The server could not verify your session cookie. Try refreshing this
            page after sign-in, or sign out and sign in again.
          </p>
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

          {actionData?.ok === true && actionData.plaintextKey ? (
            <div
              className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/50 dark:text-amber-50"
              role="status"
            >
              <p className="font-medium">Copy this key now — it won’t be shown again.</p>
              <pre className="mt-2 overflow-x-auto rounded bg-white/80 px-3 py-2 font-mono text-xs text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
                {actionData.plaintextKey}
              </pre>
            </div>
          ) : null}

          {canUseKeys ? (
            <Form method="post" className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <input type="hidden" name="intent" value="create" />
              <div className="min-w-0 flex-1">
                <label
                  htmlFor="key-label"
                  className="block text-xs font-medium text-zinc-600 dark:text-zinc-400"
                >
                  Label
                </label>
                <input
                  id="key-label"
                  name="label"
                  type="text"
                  required
                  maxLength={120}
                  placeholder="e.g. Production website"
                  className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
                />
              </div>
              <button type="submit" disabled={busy} className={btnPrimaryClass}>
                {busy ? "…" : "Create key"}
              </button>
            </Form>
          ) : null}

          {canUseKeys && keys.length === 0 ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              No keys yet. Create one to get a secret you can use from your
              servers or tooling (store it safely; we only keep a hash).
            </p>
          ) : null}

          {canUseKeys && keys.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[20rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-600 dark:text-zinc-400">
                    <th className="pb-2 pr-4 font-medium">Label</th>
                    <th className="pb-2 pr-4 font-medium">Key</th>
                    <th className="pb-2 pr-4 font-medium">Created</th>
                    <th className="pb-2 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {keys.map((k) => (
                    <tr
                      key={k.id}
                      className="border-b border-zinc-100 dark:border-zinc-700/80"
                    >
                      <td className="py-3 pr-4 text-zinc-900 dark:text-zinc-100">
                        {k.label}
                      </td>
                      <td className="py-3 pr-4 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                        {k.keyPrefix}
                      </td>
                      <td className="py-3 pr-4 text-zinc-600 dark:text-zinc-400">
                        {formatCreated(k.createdAt)}
                      </td>
                      <td className="py-3 text-right">
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
                      </td>
                    </tr>
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
