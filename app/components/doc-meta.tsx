export function DocMeta({
  lastUpdated,
  lastUpdatedSource,
}: {
  lastUpdated: string;
  lastUpdatedSource: "frontmatter" | "file";
}) {
  const formatted = new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(lastUpdated));

  const hint =
    lastUpdatedSource === "frontmatter"
      ? "Set in front matter"
      : "From file modification time";

  return (
    <p
      className="mt-10 border-t border-zinc-200 pt-6 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400"
      title={hint}
    >
      Last updated{" "}
      <time dateTime={lastUpdated}>{formatted}</time>
    </p>
  );
}
