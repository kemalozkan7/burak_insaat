import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getPages } from "./pages";
import { getMessage, LANGS, messages } from "./messages";

const I18nContext = createContext(null);
const STORAGE_KEY = "bi.lang";

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && messages[saved]) return saved;
    } catch { /* ignore */ }
    return "tr";
  });

  const setLang = (code) => {
    if (!messages[code]) return;
    setLangState(code);
    try { localStorage.setItem(STORAGE_KEY, code); } catch { /* ignore */ }
  };

  useEffect(() => {
    const meta = LANGS.find((l) => l.code === lang) || LANGS[0];
    document.documentElement.lang = lang === "fa" ? "fa" : lang;
    document.documentElement.dir = meta.dir;
    document.body.classList.toggle("is-rtl", meta.dir === "rtl");
    document.title = getPages(lang).metaTitle || document.title;
  }, [lang]);

  const value = useMemo(() => {
    const t = (path, vars) => {
      let s = getMessage(lang, path);
      if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
          s = s.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        });
      }
      return s;
    };
    /** Pick translated CMS field; fall back to Turkish / base. */
    const tx = (item, field) => {
      if (!item) return "";
      if (lang === "tr") return item[field] ?? "";
      const fromI18n = item.i18n?.[lang]?.[field];
      if (fromI18n != null && String(fromI18n).trim() !== "") return fromI18n;
      return item[field] ?? "";
    };
    const optionLabel = (opt) => {
      if (!opt) return "";
      if (lang === "tr") return opt.label || opt.value || "";
      return opt.i18n?.[lang]?.label || opt.label || opt.value || "";
    };
    return { lang, setLang, t, tx, optionLabel, langs: LANGS, dir: (LANGS.find((l) => l.code === lang) || LANGS[0]).dir };
  }, [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
