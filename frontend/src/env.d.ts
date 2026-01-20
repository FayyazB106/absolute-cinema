/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_I18N_LOAD_PATH?: string;
  readonly VITE_I18N_TOKEN?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}