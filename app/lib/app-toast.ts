export type AppToastVariant = "success" | "error";

export type AppToastItem = {
  id: number;
  variant: AppToastVariant;
  message: string;
};

type ToastListener = (action: AppToastAction) => void;

type AppToastAction =
  | { type: "push"; item: AppToastItem }
  | { type: "remove"; id: number };

const listeners = new Set<ToastListener>();

/** Actions emitted before any viewport subscribed (e.g. route `useEffect` runs before sibling `AppToastViewport`). */
const deferred: AppToastAction[] = [];

let idSeq = 0;

function broadcast(action: AppToastAction) {
  for (const l of Array.from(listeners)) {
    try {
      l(action);
    } catch {
      /* listener must not break dispatch */
    }
  }
}

function dispatch(action: AppToastAction) {
  if (listeners.size === 0) {
    deferred.push(action);
    return;
  }
  broadcast(action);
}

export function subscribeAppToasts(listener: ToastListener): () => void {
  listeners.add(listener);
  if (deferred.length > 0) {
    const pending = deferred.splice(0, deferred.length);
    for (const action of pending) {
      broadcast(action);
    }
  }
  return () => listeners.delete(listener);
}

/**
 * Shows a short-lived toast (fixed viewport). Safe to call from route components after mutations.
 */
export function pushAppToast(
  variant: AppToastVariant,
  message: string,
  durationMs = 4800,
): void {
  if (typeof window === "undefined") return;
  const text = typeof message === "string" ? message : String(message ?? "");
  const id = ++idSeq;
  dispatch({ type: "push", item: { id, variant, message: text } });
  window.setTimeout(() => {
    dispatch({ type: "remove", id });
  }, durationMs);
}

export function dismissAppToast(id: number): void {
  dispatch({ type: "remove", id });
}
