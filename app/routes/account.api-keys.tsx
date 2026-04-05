import { Link } from "react-router";

import type { Route } from "./+types/account.api-keys";
import { useIntastellarAuth } from "~/providers/intastellar-auth-provider";

export function meta({}: Route.MetaArgs) {
  return [{ title: "API keys · inta.dev" }];
}

export default function AccountApiKeys() {
  const { authReady, configured, isSignedIn } = useIntastellarAuth();

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
      <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
        API keys
      </h2>
      {!authReady ? (
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Loading…
        </p>
      ) : configured && !isSignedIn ? (
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
          <Link
            to="/account/login"
            className="font-medium text-brand hover:text-brand-hover"
          >
            Sign in
          </Link>{" "}
          to manage API keys when your backend is connected.
        </p>
      ) : (
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          List, create, and revoke keys via a loader/action wired to your
          backend. This UI is a placeholder until your API is hooked up.
        </p>
      )}
    </section>
  );
}
