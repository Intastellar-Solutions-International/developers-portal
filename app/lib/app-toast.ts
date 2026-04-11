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
let idSeq = 0;

function emit(action: AppToastAction) {
  for (const l of listeners) {
    l(action);
  }
}

export function subscribeAppToasts(listener: ToastListener): () => void {
  listeners.add(listener);
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
  const id = ++idSeq;
  emit({ type: "push", item: { id, variant, message } });
  window.setTimeout(() => {
    emit({ type: "remove", id });
  }, durationMs);
}

export function dismissAppToast(id: number): void {
  emit({ type: "remove", id });
}
