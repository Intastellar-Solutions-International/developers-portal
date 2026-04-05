import { Link } from "react-router";

import type { Route } from "./+types/account.profile";
import { useIntastellarAuth } from "~/providers/intastellar-auth-provider";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Profile · inta.dev" }];
}

export default function AccountProfile() {
  const { configured, isLoading, isSignedIn, users, signin, logout, error } =
    useIntastellarAuth();

  const user = users[0];

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
      <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
        Profile
      </h2>

      {!configured ? (
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
          Connect Intastellar SSO by setting{" "}
          <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-900">
            VITE_INTASTELLAR_CLIENT_ID
          </code>{" "}
          in your environment. See the{" "}
          <Link
            to="/account/login"
            className="font-medium text-brand hover:text-brand-hover"
          >
            Sign in
          </Link>{" "}
          page for details.
        </p>
      ) : isLoading ? (
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
          Loading session…
        </p>
      ) : !isSignedIn || !user ? (
        <div className="mt-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            You are signed out. Sign in with your Intastellar account to see
            your profile here.
          </p>
          {error ? (
            <p
              className="mt-2 text-sm text-red-600 dark:text-red-400"
              role="alert"
            >
              {error}
            </p>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => void signin()}
              className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground shadow-sm transition-colors hover:bg-brand-hover disabled:opacity-60"
            >
              Sign in with Intastellar
            </button>
            <Link
              to="/account/login"
              className="rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:border-brand/50 hover:text-brand dark:border-zinc-600 dark:text-zinc-300"
            >
              Open sign-in page
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
          {user.image ? (
            <img
              src={user.image}
              alt=""
              className="h-20 w-20 shrink-0 rounded-full border border-zinc-200 object-cover dark:border-zinc-600"
            />
          ) : null}
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-base font-medium text-zinc-900 dark:text-zinc-50">
              {user.name.first} {user.name.last}
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {user.email}
            </p>
            {user.phone ? (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {user.phone}
              </p>
            ) : null}
            <button
              type="button"
              onClick={logout}
              className="mt-4 text-sm font-medium text-brand hover:text-brand-hover"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
