const LANGS = [
  { code: "en", label: "EN" },
  { code: "de", label: "DE" },
  { code: "fa", label: "FA" }
];

/**
 * EN/DE/FA fields for CMS content. Turkish stays in the main form.
 * Empty values are auto-translated from Turkish on save.
 */
export default function I18nFields({ fields, existing = {}, lang, onLang }) {
  const active = lang || "en";
  return (
    <div className="i18n-box">
      <div className="i18n-box__head">
        <strong>Çeviriler (EN / DE / FA)</strong>
        <p className="muted">Ana alanlar Türkçe. Boş bırakılan çeviriler kayıtta otomatik doldurulur; isterseniz elle düzenleyin.</p>
        <div className="i18n-tabs">
          {LANGS.map((l) => (
            <button key={l.code} type="button" className={active === l.code ? "on" : ""} onClick={() => onLang?.(l.code)}>{l.label}</button>
          ))}
        </div>
      </div>
      {LANGS.map((l) => (
        <div key={l.code} className="i18n-pane" style={{ display: active === l.code ? "grid" : "none" }} aria-hidden={active !== l.code}>
          {fields.map(({ name, label, multiline }) => {
            const val = (existing?.[l.code] || {})[name] || "";
            const inputName = `i18n_${l.code}_${name}`;
            return (
              <div className="field" key={inputName}>
                <label>{label} ({l.label})</label>
                {multiline
                  ? <textarea name={inputName} rows="3" defaultValue={val} />
                  : <input name={inputName} defaultValue={val} />}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
