import type { Route } from "./+types/account.api-keys";

export function meta({}: Route.MetaArgs) {
  return [{ title: "API keys · inta.dev" }];
}

export default function AccountApiKeys() {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
      <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
        API keys
      </h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        List, create, and revoke keys via a loader/action wired to your backend.
      </p>
    </section>
  );
}
