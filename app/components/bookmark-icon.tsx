export function BookmarkIcon({ filled }: { filled: boolean }) {
  const d = "M7 2h10a2 2 0 0 1 2 2v18l-8-4.9-8 4.9V4a2 2 0 0 1 2-2Z";
  if (filled) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className="h-5 w-5"
        aria-hidden
      >
        <path fill="currentColor" d={d} />
      </svg>
    );
  }
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={d} />
    </svg>
  );
}
