import { useCallback, useLayoutEffect, useState } from "react";

import { dismissAppToast, subscribeAppToasts, type AppToastItem } from "~/lib/app-toast";

/**
 * Renders global toasts (success / error). Mount once under the app shell (inside `I18nProvider`).
 * Subscribes in `useLayoutEffect` so it runs before most route `useEffect` toasts; `app-toast` also
 * defers pushes until the first subscriber exists.
 */
export function AppToastViewport() {
  const [toasts, setToasts] = useState<AppToastItem[]>([]);

  useLayoutEffect(() => {
    return subscribeAppToasts((action) => {
      if (action.type === "push") {
        setToasts((prev) => [action.item, ...prev]);
      } else {
        setToasts((prev) => prev.filter((t) => t.id !== action.id));
      }
    });
  }, []);

  const onDismiss = useCallback((id: number) => {
    dismissAppToast(id);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed right-0 top-[calc(3.75rem+0.5rem)] z-200 flex max-h-[min(40vh,20rem)] w-full max-w-sm flex-col gap-2 overflow-y-auto p-4 sm:p-6"
      aria-live="polite"
      aria-relevant="additions text"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg backdrop-blur-sm ${
            t.variant === "success"
              ? "border-emerald-200/80 bg-emerald-50/95 text-emerald-950 dark:border-emerald-900/50 dark:bg-emerald-950/90 dark:text-emerald-50"
              : "border-red-200/80 bg-red-50/95 text-red-950 dark:border-red-900/50 dark:bg-red-950/90 dark:text-red-50"
          }`}
          role="status"
        >
          <p className="min-w-0 flex-1 leading-snug">{t.message}</p>
          <button
            type="button"
            onClick={() => onDismiss(t.id)}
            className="shrink-0 rounded-md p-0.5 text-current opacity-70 transition hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/10"
            aria-label="Dismiss"
          >
            <span aria-hidden className="block text-base leading-none">
              ×
            </span>
          </button>
        </div>
      ))}
    </div>
  );
}
