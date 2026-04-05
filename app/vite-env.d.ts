/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_INTASTELLAR_CLIENT_ID?: string;
  readonly VITE_INTASTELLAR_APP_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
