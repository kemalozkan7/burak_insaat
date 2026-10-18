const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const dataDir = path.join(__dirname, "..", "data");
fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, "burak.db"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS tenders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    location TEXT DEFAULT '',
    year INTEGER,
    description TEXT DEFAULT '',
    before_image TEXT NOT NULL,
    after_image TEXT NOT NULL,
    published INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    location TEXT DEFAULT '',
    type TEXT DEFAULT 'residence',
    status TEXT DEFAULT 'ongoing',
    progress INTEGER DEFAULT 0,
    delivery TEXT DEFAULT '',
    rooms TEXT DEFAULT '',
    area REAL,
    units INTEGER,
    floors INTEGER,
    code TEXT DEFAULT '',
    summary TEXT DEFAULT '',
    features TEXT DEFAULT '[]',
    image TEXT DEFAULT '',
    gallery TEXT DEFAULT '[]',
    featured INTEGER DEFAULT 0,
    published INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS listings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    location TEXT DEFAULT '',
    type TEXT DEFAULT 'apartment',
    status TEXT DEFAULT 'sale',
    price INTEGER,
    currency TEXT DEFAULT 'TRY',
    rooms TEXT DEFAULT '',
    area REAL,
    floor TEXT DEFAULT '',
    description TEXT DEFAULT '',
    image TEXT DEFAULT '',
    gallery TEXT DEFAULT '[]',
    featured INTEGER DEFAULT 0,
    published INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS tender_photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tender_id INTEGER NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
    image TEXT NOT NULL,
    before_image TEXT DEFAULT '',
    caption TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kind TEXT DEFAULT 'quote',
    name TEXT,
    phone TEXT,
    email TEXT,
    message TEXT,
    ref_slug TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS catalog_options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_key TEXT NOT NULL,
    value TEXT NOT NULL,
    label TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    active INTEGER DEFAULT 1,
    UNIQUE(group_key, value)
  );
`);

const photoCols = db.prepare("PRAGMA table_info(tender_photos)").all().map((c) => c.name);
if (!photoCols.includes("before_image")) {
  db.exec("ALTER TABLE tender_photos ADD COLUMN before_image TEXT DEFAULT ''");
}

function ensureColumn(table, column, ddl) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all().map((c) => c.name);
  if (!cols.includes(column)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${ddl}`);
}
ensureColumn("tenders", "map_query", "map_query TEXT DEFAULT ''");
ensureColumn("projects", "map_query", "map_query TEXT DEFAULT ''");
ensureColumn("listings", "map_query", "map_query TEXT DEFAULT ''");
ensureColumn("listings", "bathrooms", "bathrooms TEXT DEFAULT ''");
ensureColumn("listings", "heating", "heating TEXT DEFAULT ''");
ensureColumn("listings", "furnished", "furnished TEXT DEFAULT ''");
ensureColumn("listings", "parking", "parking TEXT DEFAULT ''");
ensureColumn("listings", "balcony", "balcony TEXT DEFAULT ''");
ensureColumn("listings", "deed", "deed TEXT DEFAULT ''");
ensureColumn("listings", "building_age", "building_age TEXT DEFAULT ''");
ensureColumn("listings", "dues", "dues TEXT DEFAULT ''");
ensureColumn("listings", "deposit", "deposit TEXT DEFAULT ''");
ensureColumn("listings", "amenities", "amenities TEXT DEFAULT '[]'");
ensureColumn("listings", "i18n", "i18n TEXT DEFAULT '{}'");
ensureColumn("projects", "i18n", "i18n TEXT DEFAULT '{}'");
ensureColumn("tenders", "i18n", "i18n TEXT DEFAULT '{}'");
ensureColumn("catalog_options", "i18n", "i18n TEXT DEFAULT '{}'");
ensureColumn("inquiries", "is_read", "is_read INTEGER DEFAULT 0");

/** Filter / form option groups managed from admin. */
const OPTION_GROUPS = {
  location: { label: "Konumlar", hint: "Emlak, proje ve filtrelerdeki konum listesi" },
  listing_type: { label: "Gayrimenkul tipi", hint: "Daire, villa, arsa…" },
  rooms: { label: "Oda sayısı", hint: "1+0, 2+1, 3+1…" },
  floor: { label: "Kat", hint: "Zemin, 1, 2, Çatı…" },
  bathrooms: { label: "Banyo", hint: "1, 2, 3…" },
  heating: { label: "Isıtma", hint: "Klima, yerden ısıtma…" },
  furnished: { label: "Eşya durumu", hint: "Eşyalı / eşyasız" },
  parking: { label: "Otopark", hint: "Kapalı, açık…" },
  balcony: { label: "Balkon / teras", hint: "Var / yok / teras" },
  deed: { label: "Tapu durumu", hint: "Koçan, eşdeğer…" },
  building_age: { label: "Bina yaşı", hint: "0–5, 5–10…" },
  amenity: { label: "Özellik / olanak", hint: "İlan formundaki işaretlenebilir özellikler" }
};

function seedCatalogOptions() {
  const count = db.prepare("SELECT COUNT(*) AS c FROM catalog_options").get().c;
  if (count > 0) return;
  const insert = db.prepare(
    "INSERT INTO catalog_options (group_key, value, label, sort_order, active) VALUES (?, ?, ?, ?, 1)"
  );
  const add = (group, items) => items.forEach((item, i) => {
    const value = typeof item === "string" ? item : item.value;
    const label = typeof item === "string" ? item : item.label;
    insert.run(group, value, label, i);
  });
  add("location", [
    "Girne – Merkez", "Girne – Alsancak", "Girne – Lapta", "Girne – Çatalköy",
    "Girne – Esentepe", "Lefkoşa – Merkez", "Lefkoşa – Gönyeli",
    "Gazimağusa – Merkez", "İskele – Long Beach"
  ]);
  add("listing_type", [
    { value: "apartment", label: "Daire" },
    { value: "villa", label: "Villa" },
    { value: "land", label: "Arsa" },
    { value: "commercial", label: "Ticari" }
  ]);
  add("rooms", ["1+0", "1+1", "2+1", "3+1", "4+1", "5+1", "Dükkan", "Arsa", "Villa"]);
  add("floor", ["Bodrum", "Zemin", "Bahçe katı", "1", "2", "3", "4", "5+", "Çatı katı", "Dubleks"]);
  add("bathrooms", ["1", "2", "3", "4+"]);
  add("heating", ["Klima", "Merkezi sistem", "Yerden ısıtma", "Şömine", "Yok"]);
  add("furnished", ["Eşyalı", "Eşyasız", "Yarı eşyalı"]);
  add("parking", ["Yok", "Açık otopark", "Kapalı otopark", "Garaj"]);
  add("balcony", ["Yok", "Balkon", "Fransız balkon", "Teras", "Bahçe"]);
  add("deed", ["Türk Koçanı", "Eşdeğer Koçan", "Tahsis", "Sözleşmeli", "Belirsiz"]);
  add("building_age", ["Sıfır / yeni", "0–5 yıl", "5–10 yıl", "10–20 yıl", "20+ yıl"]);
  add("amenity", [
    { value: "pool", label: "Havuz" },
    { value: "sea_view", label: "Deniz manzarası" },
    { value: "mountain_view", label: "Dağ manzarası" },
    { value: "elevator", label: "Asansör" },
    { value: "generator", label: "Jeneratör" },
    { value: "security", label: "Güvenlik" },
    { value: "furnished_kitchen", label: "Ankastre mutfak" },
    { value: "ac", label: "Klima" },
    { value: "internet", label: "Fiber internet" },
    { value: "pet", label: "Evcil hayvan uygun" },
    { value: "site", label: "Site içinde" },
    { value: "near_beach", label: "Plaja yakın" }
  ]);
}

seedCatalogOptions();

function publicOption(row) {
  if (!row) return null;
  return {
    id: row.id,
    group: row.group_key,
    value: row.value,
    label: row.label,
    sortOrder: row.sort_order,
    active: !!row.active,
    i18n: parseJson(row.i18n, {})
  };
}

function listOptions(groupKey, { activeOnly = true } = {}) {
  if (groupKey) {
    return db.prepare(
      activeOnly
        ? "SELECT * FROM catalog_options WHERE group_key = ? AND active = 1 ORDER BY sort_order, id"
        : "SELECT * FROM catalog_options WHERE group_key = ? ORDER BY sort_order, id"
    ).all(groupKey).map(publicOption);
  }
  const rows = db.prepare(
    activeOnly
      ? "SELECT * FROM catalog_options WHERE active = 1 ORDER BY group_key, sort_order, id"
      : "SELECT * FROM catalog_options ORDER BY group_key, sort_order, id"
  ).all().map(publicOption);
  const grouped = {};
  Object.keys(OPTION_GROUPS).forEach((k) => { grouped[k] = []; });
  rows.forEach((r) => {
    if (!grouped[r.group]) grouped[r.group] = [];
    grouped[r.group].push(r);
  });
  return grouped;
}

function publicInquiry(row) {
  if (!row) return null;
  return {
    id: row.id,
    kind: row.kind || "quote",
    name: row.name || "",
    phone: row.phone || "",
    email: row.email || "",
    message: row.message || "",
    refSlug: row.ref_slug || "",
    isRead: !!row.is_read,
    createdAt: row.created_at
  };
}

/** Keep pasted text trimmed. Short Maps links are expanded before save. */
function normalizeMapQuery(value) {
  return String(value || "").trim();
}

function isShortMapsUrl(value) {
  return /maps\.app\.goo\.gl|goo\.gl\/maps/i.test(String(value || ""));
}

/** Extract lat,lng or place query from a Maps URL / address. */
function resolveMapQuery(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const d3 = raw.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  if (d3) return `${d3[1]},${d3[2]}`;
  const at = raw.match(/@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/);
  if (at) return `${at[1]},${at[2]}`;
  const ll = raw.match(/[?&](?:ll|center)=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/i);
  if (ll) return `${ll[1]},${ll[2]}`;
  try {
    const u = new URL(raw);
    const q = u.searchParams.get("q") || u.searchParams.get("query");
    if (q) return q;
    const place = u.pathname.match(/\/place\/([^/]+)/);
    if (place) return decodeURIComponent(place[1].replace(/\+/g, " "));
  } catch { /* plain address */ }
  const bare = raw.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
  if (bare) return `${bare[1]},${bare[2]}`;
  if (isShortMapsUrl(raw)) return "";
  return raw.replace(/[–—]/g, " ").replace(/\s+/g, " ").trim();
}

/** Follow maps.app.goo.gl redirects and return a coords/place query for embed. */
async function expandMapQuery(value) {
  const raw = normalizeMapQuery(value);
  if (!raw) return "";
  let resolved = resolveMapQuery(raw);
  if (resolved) return resolved;
  if (!isShortMapsUrl(raw)) return raw;
  try {
    const res = await fetch(raw, {
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml"
      }
    });
    resolved = resolveMapQuery(res.url || "");
    if (resolved) return resolved;
    const html = await res.text();
    const fromHtml =
      resolveMapQuery(html) ||
      (() => {
        const m = html.match(/https:\/\/www\.google\.[^"'\\\s]+\/maps[^"'\\\s]*/i);
        return m ? resolveMapQuery(m[0]) : "";
      })();
    return fromHtml || raw;
  } catch {
    return raw;
  }
}

/** Expand any stored short Maps links so embeds use coordinates. */
async function backfillShortMapQueries() {
  const tables = ["tenders", "projects", "listings"];
  for (const table of tables) {
    const rows = db.prepare(`SELECT id, map_query FROM ${table} WHERE map_query LIKE '%goo.gl%'`).all();
    for (const row of rows) {
      const expanded = await expandMapQuery(row.map_query);
      if (expanded && expanded !== row.map_query) {
        db.prepare(`UPDATE ${table} SET map_query = ? WHERE id = ?`).run(expanded, row.id);
      }
    }
  }
}

function slugify(text) {
  const map = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", â: "a", î: "i", û: "u" };
  return String(text || "")
    .toLocaleLowerCase("tr-TR")
    .replace(/[çğıöşüâîû]/g, (ch) => map[ch] || ch)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "kayit";
}

function uniqueSlug(table, base, excludeId) {
  let slug = base;
  let n = 2;
  while (true) {
    const row = excludeId
      ? db.prepare(`SELECT id FROM ${table} WHERE slug = ? AND id != ?`).get(slug, excludeId)
      : db.prepare(`SELECT id FROM ${table} WHERE slug = ?`).get(slug);
    if (!row) return slug;
    slug = `${base}-${n++}`;
  }
}

function parseJson(value, fallback) {
  try {
    return JSON.parse(value || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

function listPhotos(tenderId) {
  return db.prepare(
    "SELECT id, before_image, image, caption FROM tender_photos WHERE tender_id = ? ORDER BY sort_order, id"
  ).all(tenderId).map((p) => ({
    id: p.id,
    beforeImage: p.before_image || "",
    afterImage: p.image,
    image: p.image,
    caption: p.caption || ""
  }));
}

function savePhotos(tenderId, items) {
  db.prepare("DELETE FROM tender_photos WHERE tender_id = ?").run(tenderId);
  const insert = db.prepare(
    "INSERT INTO tender_photos (tender_id, before_image, image, caption, sort_order) VALUES (?, ?, ?, ?, ?)"
  );
  items.forEach((item, i) => {
    const after = item.image || item.after || "";
    const before = item.before || item.beforeImage || "";
    if (!after && !before) return;
    insert.run(tenderId, before, after || before, item.caption || "", i);
  });
}

function backfillPhotos() {
  const insert = db.prepare(
    "INSERT INTO tender_photos (tender_id, image, caption, sort_order) VALUES (?, ?, '', 0)"
  );
  const count = db.prepare("SELECT COUNT(*) AS c FROM tender_photos WHERE tender_id = ?");
  db.prepare("SELECT id, after_image FROM tenders").all().forEach((t) => {
    if (count.get(t.id).c === 0 && t.after_image) insert.run(t.id, t.after_image);
  });
}

backfillPhotos();

function publicTender(row) {
  if (!row) return null;
  return {
    id: row.slug,
    dbId: row.id,
    title: row.title,
    location: row.location,
    mapQuery: row.map_query || "",
    year: row.year,
    description: row.description,
    beforeImage: row.before_image,
    afterImage: row.after_image,
    photos: listPhotos(row.id),
    published: !!row.published,
    createdAt: row.created_at,
    i18n: parseJson(row.i18n, {})
  };
}

function publicProject(row) {
  if (!row) return null;
  return {
    id: row.slug,
    dbId: row.id,
    title: row.title,
    location: row.location,
    mapQuery: row.map_query || "",
    type: row.type,
    status: row.status === "sale" ? "completed" : row.status,
    progress: row.progress || 0,
    delivery: row.delivery || "",
    rooms: row.rooms || "",
    area: row.area,
    units: row.units,
    floors: row.floors,
    code: row.code || "",
    summary: row.summary || "",
    features: parseJson(row.features, []),
    image: row.image,
    gallery: parseJson(row.gallery, []),
    featured: !!row.featured,
    published: !!row.published,
    createdAt: row.created_at,
    i18n: parseJson(row.i18n, {})
  };
}

function publicListing(row) {
  if (!row) return null;
  return {
    id: row.slug,
    dbId: row.id,
    title: row.title,
    location: row.location,
    mapQuery: row.map_query || "",
    type: row.type,
    status: row.status,
    price: row.price,
    currency: row.currency,
    rooms: row.rooms,
    area: row.area,
    floor: row.floor,
    bathrooms: row.bathrooms || "",
    heating: row.heating || "",
    furnished: row.furnished || "",
    parking: row.parking || "",
    balcony: row.balcony || "",
    deed: row.deed || "",
    buildingAge: row.building_age || "",
    dues: row.dues || "",
    deposit: row.deposit || "",
    amenities: parseJson(row.amenities, []),
    description: row.description,
    image: row.image,
    gallery: parseJson(row.gallery, []),
    featured: !!row.featured,
    published: !!row.published,
    createdAt: row.created_at,
    i18n: parseJson(row.i18n, {})
  };
}

function parseAmenities(body) {
  if (Array.isArray(body.amenities)) return body.amenities.map(String).filter(Boolean);
  if (typeof body.amenities === "string" && body.amenities.trim()) {
    try {
      const parsed = JSON.parse(body.amenities);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch { /* form multi */ }
    return body.amenities.split(",").map((s) => s.trim()).filter(Boolean);
  }
  const multi = body["amenities[]"];
  if (Array.isArray(multi)) return multi.map(String).filter(Boolean);
  if (multi) return [String(multi)];
  return [];
}

module.exports = {
  db,
  slugify,
  uniqueSlug,
  publicTender,
  publicProject,
  publicListing,
  publicInquiry,
  publicOption,
  listOptions,
  OPTION_GROUPS,
  parseAmenities,
  savePhotos,
  listPhotos,
  normalizeMapQuery,
  resolveMapQuery,
  expandMapQuery,
  backfillShortMapQueries,
  isShortMapsUrl
};
