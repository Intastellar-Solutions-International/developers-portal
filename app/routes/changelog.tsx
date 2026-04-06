import { Link, useLoaderData, useSearchParams } from "react-router";

import type { Route } from "./+types/changelog";
import type {
  ChangelogEntry,
  GithubChangelogResult,
  NpmChangelogEntry,
  NpmChangelogResult,
} from "~/lib/changelog.server";
import {
  fetchGithubChangelog,
  fetchNpmPackageVersions,
} from "~/lib/changelog.server";
import { formatDateMedium } from "~/lib/format-datetime";
import { translatePath } from "~/lib/i18n/messages";
import { resolveMetaLocale } from "~/lib/seo";

const DEFAULT_CONSENTS_REPO = "felixaschultz/intastellar-cookie-solutions";
const DEFAULT_SIGNIN_REPO = "Intastellar-Solutions-International/intastellar-signin";
const SIGNIN_NPM_PACKAGE = "@intastellar/signin-sdk-react";

export async function loader(_: Route.LoaderArgs) {
  const consentsRepo = (
    process.env.CHANGELOG_GITHUB_REPO ?? DEFAULT_CONSENTS_REPO
  ).trim();
  const signinRepo = (
    process.env.SIGNIN_CHANGELOG_GITHUB_REPO ?? DEFAULT_SIGNIN_REPO
  ).trim();
  const signinNpmPackage = (
    process.env.SIGNIN_NPM_PACKAGE ?? SIGNIN_NPM_PACKAGE
  ).trim();

  const [consents, signinGithub, signinNpm] = await Promise.all([
    fetchGithubChangelog(consentsRepo),
    fetchGithubChangelog(signinRepo),
    fetchNpmPackageVersions(signinNpmPackage),
  ]);

  return {
    consents,
    signinGithub,
    signinNpm,
  };
}

export function meta({ matches, location }: Route.MetaArgs) {
  const locale = resolveMetaLocale(matches, location.pathname);
  return [
    { title: translatePath(locale, "seo.changelogTitle") },
    {
      name: "description",
      content: translatePath(locale, "seo.changelogDescription"),
    },
  ];
}

function formatDate(iso: string | null) {
  if (!iso) return null;
  return formatDateMedium(iso);
}

type Platform = "consents" | "signin";
type SigninSource = "npm" | "github";

function changelogHref(platform: Platform, signinSource?: SigninSource) {
  if (platform === "consents") return "/changelog";
  const sp = new URLSearchParams();
  sp.set("platform", "signin");
  if (signinSource === "github") sp.set("source", "github");
  return `/changelog?${sp.toString()}`;
}

function tabClass(active: boolean) {
  return active
    ? "bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900"
    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100";
}

function GithubEntryList({
  data,
  emptyHint,
}: {
  data: GithubChangelogResult;
  emptyHint: string;
}) {
  const { entries, repo, error } = data;
  return (
    <>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Repository{" "}
        <a
          href={`https://github.com/${repo}`}
          className="text-brand hover:text-brand-hover"
          target="_blank"
          rel="noreferrer noopener"
        >
          {repo}
        </a>
        .{" "}
        <strong className="font-medium text-zinc-800 dark:text-zinc-200">
          Releases
        </strong>{" "}
        are listed when available; otherwise{" "}
        <strong className="font-medium text-zinc-800 dark:text-zinc-200">
          tags
        </strong>{" "}
        appear without notes.
      </p>
      {error && entries.length === 0 ? (
        <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
          {error}
        </p>
      ) : null}
      <ol className="mt-10 space-y-10">
        {entries.map((e) => (
          <GithubEntry key={e.tag} e={e} />
        ))}
      </ol>
      {entries.length === 0 && !error ? (
        <p className="mt-8 text-sm text-zinc-600 dark:text-zinc-400">
          {emptyHint}
        </p>
      ) : null}
    </>
  );
}

function GithubEntry({ e }: { e: ChangelogEntry }) {
  return (
    <li className="border-b border-zinc-200 pb-10 dark:border-zinc-700">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <a
          href={e.url}
          target="_blank"
          rel="noreferrer noopener"
          className="text-lg font-semibold text-brand hover:text-brand-hover"
        >
          {e.title}
        </a>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          {formatDate(e.date) ?? e.tag}
          {e.prerelease ? (
            <span className="ml-2 rounded bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
              Pre-release
            </span>
          ) : null}
          {e.source === "tag" ? (
            <span className="ml-2 text-xs">(tag only)</span>
          ) : null}
        </span>
      </div>
      {e.body ? (
        <div className="mt-4 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
          {e.body.split("\n").map((line, i) =>
            line.trim() === "" ? (
              <br key={i} />
            ) : (
              <p key={i}>{line}</p>
            ),
          )}
        </div>
      ) : e.source === "tag" ? (
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          No GitHub release notes for this tag—open the link to compare on
          GitHub.
        </p>
      ) : null}
    </li>
  );
}

function NpmEntryList({ data }: { data: NpmChangelogResult }) {
  const { entries, packageName, error } = data;
  const npmWeb = `https://www.npmjs.com/package/${encodeURIComponent(packageName)}`;
  return (
    <>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Publish history from the npm registry for{" "}
        <a
          href={npmWeb}
          className="text-brand hover:text-brand-hover"
          target="_blank"
          rel="noreferrer noopener"
        >
          {packageName}
        </a>
        . Dates reflect package publish time; detailed notes may appear on the
        GitHub tab when maintainers write releases.
      </p>
      {error && entries.length === 0 ? (
        <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
          {error}
        </p>
      ) : null}
      <ol className="mt-10 space-y-8">
        {entries.map((e: NpmChangelogEntry) => (
          <li
            key={e.version}
            className="border-b border-zinc-200 pb-8 dark:border-zinc-700"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <a
                href={e.url}
                target="_blank"
                rel="noreferrer noopener"
                className="text-lg font-semibold text-brand hover:text-brand-hover"
              >
                v{e.version}
              </a>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                {formatDate(e.date) ?? "—"}
              </span>
            </div>
          </li>
        ))}
      </ol>
      {entries.length === 0 && !error ? (
        <p className="mt-8 text-sm text-zinc-600 dark:text-zinc-400">
          No versions returned from the registry.
        </p>
      ) : null}
    </>
  );
}

export default function ChangelogPage() {
  const { consents, signinGithub, signinNpm } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const platform: Platform =
    searchParams.get("platform") === "signin" ? "signin" : "consents";
  const signinSource: SigninSource =
    searchParams.get("source") === "github" ? "github" : "npm";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Changelog
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Product version history on inta.dev. Choose a platform below.
      </p>

      <div
        className="mt-8 flex flex-wrap gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-700 dark:bg-zinc-900/50"
        aria-label="Choose product"
      >
        <Link
          to={changelogHref("consents")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${tabClass(platform === "consents")}`}
        >
          Intastellar Consents
        </Link>
        <Link
          to={changelogHref(
            "signin",
            platform === "signin" ? signinSource : "npm",
          )}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${tabClass(platform === "signin")}`}
        >
          Intastellar Sign-In
        </Link>
      </div>

      {platform === "consents" ? (
        <section className="mt-10" aria-labelledby="consents-heading">
          <h2
            id="consents-heading"
            className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
          >
            Intastellar Consents
          </h2>
          <GithubEntryList
            data={consents}
            emptyHint="No releases or tags returned for this repository."
          />
        </section>
      ) : (
        <section className="mt-10" aria-labelledby="signin-heading">
          <h2
            id="signin-heading"
            className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
          >
            Intastellar Sign-In
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            The web SDK is published as{" "}
            <strong className="font-medium text-zinc-800 dark:text-zinc-200">
              {signinNpm.packageName}
            </strong>
            ; the source repo is{" "}
            <strong className="font-medium text-zinc-800 dark:text-zinc-200">
              {signinGithub.repo}
            </strong>
            .
          </p>

          <div
            className="mt-6 flex flex-wrap gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-700 dark:bg-zinc-900/50"
            aria-label="Sign-In: npm or GitHub"
          >
            <Link
              to={changelogHref("signin", "npm")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${tabClass(signinSource === "npm")}`}
            >
              npm package
            </Link>
            <Link
              to={changelogHref("signin", "github")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${tabClass(signinSource === "github")}`}
            >
              GitHub releases
            </Link>
          </div>

          <div className="mt-8">
            {signinSource === "npm" ? (
              <NpmEntryList data={signinNpm} />
            ) : (
              <GithubEntryList
                data={signinGithub}
                emptyHint="No releases or tags returned for this repository."
              />
            )}
          </div>
        </section>
      )}
    </div>
  );
}
