/** Intastellar SSO (`@intastellar/signin-sdk-react`). Set in `.env` for local dev and in hosting env for production. */
export function getIntastellarClientConfig():
  | { clientId: string; appName: string }
  | null {
  const clientId = import.meta.env.VITE_INTASTELLAR_CLIENT_ID?.trim();
  if (!clientId) return null;
  const appName =
    import.meta.env.VITE_INTASTELLAR_APP_NAME?.trim() || "inta.dev";
  return { clientId, appName };
}
