import { useEffect } from "react";

import { SearchPanel } from "~/components/search-panel";
import type { SearchDocument } from "~/lib/search-index.server";

export function SearchOverlay({
  open,
  onClose,
  documents,
  loading,
  onNavigate,
}: {
  open: boolean;
  onClose: () => void;
  documents: SearchDocument[];
  loading: boolean;
  onNavigate: (href: string) => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/50 px-4 pt-[min(12vh,6rem)] pb-8"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-overlay-title"
        className="flex max-h-[min(75vh,640px)] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <div className="p-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Loading search index…
          </div>
        ) : (
          <SearchPanel
            documents={documents}
            variant="overlay"
            autoFocus={open}
            onPick={(href) => {
              onClose();
              onNavigate(href);
            }}
          />
        )}
      </div>
    </div>
  );
}
