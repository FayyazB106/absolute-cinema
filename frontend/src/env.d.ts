/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_I18N_LOAD_PATH?: string;
  readonly VITE_I18N_TOKEN?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'swiper/css';
declare module 'swiper/css/navigation';
declare module 'swiper/css/pagination';
declare module 'swiper/css/effect-fade';