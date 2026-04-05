import { Link } from "react-router";

import logoDark from "./logo-dark.svg";
import logoLight from "./logo-light.svg";

export function Welcome() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-20">
      <div className="w-full max-w-lg text-center">
        <div className="mx-auto mb-10 w-48">
          <img
            src={logoLight}
            alt=""
            className="block w-full dark:hidden"
            aria-hidden
          />
          <img
            src={logoDark}
            alt=""
            className="hidden w-full dark:block"
            aria-hidden
          />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Intastellar developer platform
        </h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          Documentation, API references, and account tools on{" "}
          <span className="font-medium text-zinc-800 dark:text-zinc-200">
            inta.dev
          </span>
          .
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/docs"
            className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            Browse docs
          </Link>
          <Link
            to="/account/profile"
            className="rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            Account
          </Link>
        </div>
      </div>
    </div>
  );
}
