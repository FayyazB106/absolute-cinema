import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";

// Bundle EN & AR now
const modules = import.meta.glob("./locales/{en,ar}/translation.json", {
  eager: true,
  import: "default",
}) as Record<string, Record<string, string>>;

const resources: Record<string, { translation: Record<string, string> }> = {};
for (const [path, content] of Object.entries(modules)) {
  const m = path.match(/\.\/locales\/([^/]+)\/translation\.json$/);
  if (!m) continue;
  const lng = m[1];
  resources[lng] = { translation: content };
}

const supportedLngs = Object.keys(resources);

// Optional: only enable remote CMS when an env var is set
const cmsLoadPath = import.meta.env.VITE_I18N_LOAD_PATH as string | undefined;
if (cmsLoadPath) {
  i18n.use(HttpBackend);
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    supportedLngs,
    nonExplicitSupportedLngs: true, // 'en-GB' → 'en'
    load: "languageOnly",
    partialBundledLanguages: true,

    ns: ["translation"],
    defaultNS: "translation",

    // Only used if cmsLoadPath is provided
    backend: cmsLoadPath
      ? {
          loadPath: `${cmsLoadPath}/{{lng}}/{{ns}}.json`,
          // Example for auth later:
          // requestOptions: { headers: { Authorization: `Bearer ${import.meta.env.VITE_I18N_TOKEN}` } }
        }
      : undefined,

    interpolation: { escapeValue: false },
    returnNull: false,
    detection: {
      // sensible defaults; tweak if you like
      order: ["querystring", "localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
    },
  });

// Keep RTL switch
i18n.on("languageChanged", (lng) => {
  const rtl = ["ar", "he", "fa", "ur"];
  document.documentElement.dir = rtl.includes(lng) ? "rtl" : "ltr";
});

export default i18n;