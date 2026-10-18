const TARGETS = ["en", "de", "fa"];

async function translateText(text, target) {
  const q = String(text || "").trim();
  if (!q || target === "tr") return q;
  if (q.length > 450) {
    // MyMemory free tier prefers shorter chunks
    const parts = q.match(/[^。.!?؟\n]+[.。.!?؟\n]?/g) || [q];
    const out = [];
    for (const part of parts) {
      const t = part.trim();
      if (!t) continue;
      out.push(await translateText(t, target));
      await sleep(200);
    }
    return out.join(" ").trim();
  }
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(q)}&langpair=tr|${target}`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    const data = await res.json();
    const translated = data?.responseData?.translatedText;
    if (translated && !/^MYMEMORY WARNING/i.test(translated)) return translated;
  } catch { /* keep original */ }
  return q;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function parseI18n(raw) {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw) || {};
  } catch {
    return {};
  }
}

/** Merge form i18n_* fields and optional JSON. */
function i18nFromBody(body, fields) {
  const base = parseI18n(body.i18n_json);
  for (const lang of TARGETS) {
    base[lang] = base[lang] || {};
    for (const field of fields) {
      const key = `i18n_${lang}_${field}`;
      if (body[key] !== undefined && body[key] !== null && String(body[key]).trim() !== "") {
        base[lang][field] = String(body[key]).trim();
      }
    }
  }
  return base;
}

function mergeI18n(base, patch) {
  const out = { ...parseI18n(base) };
  const p = parseI18n(patch);
  for (const lang of Object.keys(p)) {
    out[lang] = { ...(out[lang] || {}), ...(p[lang] || {}) };
  }
  return out;
}

/**
 * Fill missing translations for given Turkish source fields.
 * existingI18n is preserved where already set.
 */
async function fillMissingTranslations(source, fields, existingI18n = {}) {
  const out = parseI18n(existingI18n);
  for (const lang of TARGETS) {
    out[lang] = { ...(out[lang] || {}) };
    for (const field of fields) {
      const raw = source[field];
      const src = Array.isArray(raw) ? raw.join("\n").trim() : String(raw || "").trim();
      if (!src) continue;
      if (out[lang][field] && String(out[lang][field]).trim()) continue;
      out[lang][field] = await translateText(src, lang);
    }
  }
  return out;
}

async function fillOptionLabel(labelTr, existingI18n = {}) {
  return fillMissingTranslations({ label: labelTr }, ["label"], existingI18n);
}

module.exports = {
  TARGETS,
  translateText,
  parseI18n,
  i18nFromBody,
  mergeI18n,
  fillMissingTranslations,
  fillOptionLabel
};
