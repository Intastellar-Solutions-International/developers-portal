import type { Route } from "./+types/account.profile";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Profile · inta.dev" }];
}

export default function AccountProfile() {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
        Profile
      </h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Replace this route with your session loader and profile forms. Same
        origin as docs keeps cookies simple on <code className="text-sm">inta.dev</code>.
      </p>
    </section>
  );
}
