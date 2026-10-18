const path = require("path");
const fs = require("fs");
const express = require("express");
const session = require("express-session");
const multer = require("multer");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const {
  db, slugify, uniqueSlug, publicTender, publicProject, publicListing, publicInquiry,
  publicOption, listOptions, OPTION_GROUPS, parseAmenities,
  savePhotos, expandMapQuery, backfillShortMapQueries
} = require("./db");
const { i18nFromBody, mergeI18n, fillMissingTranslations, fillOptionLabel, parseI18n, translateText } = require("./translate");

const ROOT = path.join(__dirname, "..");
const PORT = Number(process.env.PORT) || 3000;
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "burak2026";

fs.mkdirSync(path.join(ROOT, "uploads"), { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(ROOT, "uploads")),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase() || ".jpg";
    const safe = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null, safe);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /^image\/(jpeg|png|webp|gif)$/i.test(file.mimetype);
    cb(ok ? null : new Error("Yalnızca görsel yükleyebilirsiniz."), ok);
  }
});

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    name: "bi.sid",
    secret: process.env.SESSION_SECRET || "burak-insaat-dev",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: "lax", maxAge: 1000 * 60 * 60 * 12 }
  })
);

app.use("/assets", express.static(path.join(ROOT, "assets")));
app.use("/uploads", express.static(path.join(ROOT, "uploads")));

const dist = path.join(ROOT, "dist");
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
}

function requireAuth(req, res, next) {
  if (req.session && req.session.admin) return next();
  if (req.path.startsWith("/api/")) return res.status(401).json({ error: "Oturum gerekli" });
  return res.redirect("/admin/login");
}

function fileOrUrl(file, fallback) {
  if (file) return "/uploads/" + file.filename;
  return fallback || "";
}

function photosFromRequest(body, files) {
  let meta = [];
  try {
    meta = JSON.parse(body.photos_json || "[]");
  } catch {
    meta = [];
  }
  const befores = (files && files.photo_befores) || [];
  const afters = (files && files.photo_afters) || [];
  let bi = 0;
  let ai = 0;
  return meta.map((item) => {
    let before = item.before || "";
    let image = item.after || item.image || "";
    if (item.newBefore) {
      const f = befores[bi++];
      if (f) before = "/uploads/" + f.filename;
    }
    if (item.newAfter) {
      const f = afters[ai++];
      if (f) image = "/uploads/" + f.filename;
    }
    if (String(before).startsWith("blob:")) before = "";
    if (String(image).startsWith("blob:")) image = "";
    return { before, image, caption: item.caption || "" };
  }).filter((p) => p.image || p.before);
}


function galleryFromBody(body, files, image, existing) {
  const galleryFiles = ((files && files.gallery) || []).map((f) => "/uploads/" + f.filename);
  const extra = (body.gallery_urls || "").split("\n").map((s) => s.trim()).filter(Boolean);
  if (!galleryFiles.length && !extra.length && existing) return existing;
  return [image, ...galleryFiles, ...extra].filter((v, i, a) => v && a.indexOf(v) === i);
}

app.get("/api/projects", (_req, res) => {
  const rows = db.prepare("SELECT * FROM projects WHERE published = 1 ORDER BY featured DESC, id DESC").all();
  res.json(rows.map(publicProject));
});

app.get("/api/projects/:slug", (req, res) => {
  const row = db.prepare("SELECT * FROM projects WHERE slug = ? AND published = 1").get(req.params.slug);
  if (!row) return res.status(404).json({ error: "Proje bulunamadı" });
  res.json(publicProject(row));
});

app.get("/api/tenders", (_req, res) => {
  const rows = db.prepare("SELECT * FROM tenders WHERE published = 1 ORDER BY year DESC, id DESC").all();
  res.json(rows.map(publicTender));
});

app.get("/api/tenders/:slug", (req, res) => {
  const row = db.prepare("SELECT * FROM tenders WHERE slug = ? AND published = 1").get(req.params.slug);
  if (!row) return res.status(404).json({ error: "İhale bulunamadı" });
  res.json(publicTender(row));
});

app.get("/api/listings", (req, res) => {
  let sql = "SELECT * FROM listings WHERE published = 1";
  const params = [];
  const { status, type, loc, q } = req.query;
  if (status) { sql += " AND status = ?"; params.push(status); }
  if (type) { sql += " AND type = ?"; params.push(type); }
  if (loc) { sql += " AND location = ?"; params.push(loc); }
  if (q) { sql += " AND (title LIKE ? OR location LIKE ?)"; params.push(`%${q}%`, `%${q}%`); }
  sql += " ORDER BY featured DESC, id DESC";
  res.json(db.prepare(sql).all(...params).map(publicListing));
});

app.get("/api/listings/:slug", (req, res) => {
  const row = db.prepare("SELECT * FROM listings WHERE slug = ? AND published = 1").get(req.params.slug);
  if (!row) return res.status(404).json({ error: "İlan bulunamadı" });
  res.json(publicListing(row));
});

app.get("/api/options", (_req, res) => {
  res.json({
    groups: OPTION_GROUPS,
    options: listOptions(null, { activeOnly: true })
  });
});

app.post("/api/inquiries", (req, res) => {
  const { kind, name, phone, email, message, ref_slug } = req.body || {};
  if (!name || !phone) return res.status(400).json({ error: "Ad ve telefon zorunlu" });
  db.prepare(
    "INSERT INTO inquiries (kind, name, phone, email, message, ref_slug) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(kind || "quote", name, phone, email || "", message || "", ref_slug || "");
  res.json({ ok: true });
});

app.post("/api/admin/login", (req, res) => {
  const { user, password } = req.body || {};
  if (user === ADMIN_USER && password === ADMIN_PASSWORD) {
    req.session.admin = true;
    return res.json({ ok: true });
  }
  res.status(401).json({ error: "Kullanıcı adı veya şifre hatalı" });
});

app.post("/api/admin/logout", (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get("/api/admin/me", (req, res) => {
  res.json({ admin: !!(req.session && req.session.admin) });
});

app.get("/api/admin/stats", requireAuth, (_req, res) => {
  res.json({
    tenders: db.prepare("SELECT COUNT(*) AS c FROM tenders").get().c,
    projects: db.prepare("SELECT COUNT(*) AS c FROM projects").get().c,
    listings: db.prepare("SELECT COUNT(*) AS c FROM listings").get().c,
    inquiries: db.prepare("SELECT COUNT(*) AS c FROM inquiries").get().c,
    unreadInquiries: db.prepare("SELECT COUNT(*) AS c FROM inquiries WHERE is_read = 0").get().c
  });
});

app.get("/api/admin/inquiries", requireAuth, (_req, res) => {
  const rows = db.prepare("SELECT * FROM inquiries ORDER BY id DESC").all().map(publicInquiry);
  res.json(rows);
});

app.get("/api/admin/inquiries/:id", requireAuth, (req, res) => {
  const row = db.prepare("SELECT * FROM inquiries WHERE id = ?").get(Number(req.params.id));
  if (!row) return res.status(404).json({ error: "Mesaj bulunamadı" });
  if (!row.is_read) db.prepare("UPDATE inquiries SET is_read = 1 WHERE id = ?").run(row.id);
  res.json(publicInquiry(db.prepare("SELECT * FROM inquiries WHERE id = ?").get(row.id)));
});

app.post("/api/admin/inquiries/:id/read", requireAuth, (req, res) => {
  const id = Number(req.params.id);
  const row = db.prepare("SELECT * FROM inquiries WHERE id = ?").get(id);
  if (!row) return res.status(404).json({ error: "Mesaj bulunamadı" });
  db.prepare("UPDATE inquiries SET is_read = 1 WHERE id = ?").run(id);
  res.json(publicInquiry(db.prepare("SELECT * FROM inquiries WHERE id = ?").get(id)));
});

app.delete("/api/admin/inquiries/:id", requireAuth, (req, res) => {
  db.prepare("DELETE FROM inquiries WHERE id = ?").run(Number(req.params.id));
  res.json({ ok: true });
});

app.get("/api/admin/options", requireAuth, (_req, res) => {
  res.json({
    groups: OPTION_GROUPS,
    options: listOptions(null, { activeOnly: false })
  });
});

app.post("/api/admin/options", requireAuth, async (req, res) => {
  const { group, value, label, sortOrder, i18n: bodyI18n, autoTranslate } = req.body || {};
  if (!group || !OPTION_GROUPS[group]) return res.status(400).json({ error: "Geçersiz grup" });
  const lab = String(label || "").trim();
  const val = String(value || lab).trim();
  if (!lab || !val) return res.status(400).json({ error: "Etiket zorunlu" });
  const max = db.prepare("SELECT COALESCE(MAX(sort_order), -1) AS m FROM catalog_options WHERE group_key = ?").get(group).m;
  let i18n = parseI18n(bodyI18n);
  if (autoTranslate !== false) i18n = await fillOptionLabel(lab, i18n);
  try {
    const info = db.prepare(
      "INSERT INTO catalog_options (group_key, value, label, sort_order, active, i18n) VALUES (?, ?, ?, ?, 1, ?)"
    ).run(group, val, lab, sortOrder != null && sortOrder !== "" ? Number(sortOrder) : max + 1, JSON.stringify(i18n));
    res.json(publicOption(db.prepare("SELECT * FROM catalog_options WHERE id = ?").get(info.lastInsertRowid)));
  } catch {
    res.status(400).json({ error: "Bu değerde seçenek zaten var" });
  }
});

app.put("/api/admin/options/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const current = db.prepare("SELECT * FROM catalog_options WHERE id = ?").get(id);
  if (!current) return res.status(404).json({ error: "Seçenek yok" });
  const { label, value, sortOrder, active, i18n: bodyI18n, autoTranslate } = req.body || {};
  const lab = label !== undefined ? String(label).trim() : current.label;
  const val = value !== undefined ? String(value).trim() : current.value;
  if (!lab || !val) return res.status(400).json({ error: "Etiket ve değer zorunlu" });
  let i18n = bodyI18n !== undefined ? parseI18n(bodyI18n) : parseI18n(current.i18n);
  if (autoTranslate !== false && (label !== undefined || !Object.keys(i18n).length)) {
    i18n = await fillOptionLabel(lab, i18n);
  }
  try {
    db.prepare(
      "UPDATE catalog_options SET value=?, label=?, sort_order=?, active=?, i18n=? WHERE id=?"
    ).run(
      val,
      lab,
      sortOrder != null && sortOrder !== "" ? Number(sortOrder) : current.sort_order,
      active === false || active === 0 || active === "0" ? 0 : 1,
      JSON.stringify(i18n),
      id
    );
    res.json(publicOption(db.prepare("SELECT * FROM catalog_options WHERE id = ?").get(id)));
  } catch {
    res.status(400).json({ error: "Bu değerde seçenek zaten var" });
  }
});

app.post("/api/admin/translate", requireAuth, async (req, res) => {
  const { text, target } = req.body || {};
  if (!text || !target) return res.status(400).json({ error: "text ve target gerekli" });
  const translated = await translateText(text, target);
  res.json({ text: translated });
});

app.post("/api/admin/translate-backfill", requireAuth, async (_req, res) => {
  let n = 0;
  const opts = db.prepare("SELECT id, label, i18n FROM catalog_options").all();
  for (const row of opts) {
    const filled = await fillOptionLabel(row.label, row.i18n);
    db.prepare("UPDATE catalog_options SET i18n = ? WHERE id = ?").run(JSON.stringify(filled), row.id);
    n += 1;
  }
  const projects = db.prepare("SELECT id, title, summary, location, features, i18n FROM projects").all();
  for (const row of projects) {
    const features = (() => { try { return JSON.parse(row.features || "[]"); } catch { return []; } })();
    const filled = await fillMissingTranslations(
      { title: row.title, summary: row.summary, location: row.location, features: features.join("\n") },
      ["title", "summary", "location", "features"],
      row.i18n
    );
    db.prepare("UPDATE projects SET i18n = ? WHERE id = ?").run(JSON.stringify(filled), row.id);
    n += 1;
  }
  const tenders = db.prepare("SELECT id, title, description, location, i18n FROM tenders").all();
  for (const row of tenders) {
    const captions = db.prepare("SELECT caption FROM tender_photos WHERE tender_id = ? ORDER BY sort_order, id").all(row.id).map((p) => p.caption || "").join("\n");
    const filled = await fillMissingTranslations(
      { title: row.title, description: row.description, location: row.location, captions },
      ["title", "description", "location", "captions"],
      row.i18n
    );
    db.prepare("UPDATE tenders SET i18n = ? WHERE id = ?").run(JSON.stringify(filled), row.id);
    n += 1;
  }
  const listings = db.prepare("SELECT id, title, description, location, i18n FROM listings").all();
  for (const row of listings) {
    const filled = await fillMissingTranslations(
      { title: row.title, description: row.description, location: row.location },
      ["title", "description", "location"],
      row.i18n
    );
    db.prepare("UPDATE listings SET i18n = ? WHERE id = ?").run(JSON.stringify(filled), row.id);
    n += 1;
  }
  res.json({ ok: true, updated: n });
});

app.delete("/api/admin/options/:id", requireAuth, (req, res) => {
  db.prepare("DELETE FROM catalog_options WHERE id = ?").run(Number(req.params.id));
  res.json({ ok: true });
});

app.get("/api/admin/tenders", requireAuth, (_req, res) => {
  res.json(db.prepare("SELECT * FROM tenders ORDER BY id DESC").all().map(publicTender));
});

app.post(
  "/api/admin/tenders",
  requireAuth,
  upload.fields([
    { name: "before_image", maxCount: 1 },
    { name: "after_image", maxCount: 1 },
    { name: "photo_befores", maxCount: 20 },
    { name: "photo_afters", maxCount: 20 }
  ]),
  async (req, res) => {
    const b = req.body;
    const files = req.files || {};
    const before = fileOrUrl(files.before_image && files.before_image[0], b.before_url);
    const after = fileOrUrl(files.after_image && files.after_image[0], b.after_url);
    if (!b.title || !before || !after) {
      return res.status(400).json({ error: "Başlık, önce ve sonra görselleri zorunlu" });
    }
    const slug = uniqueSlug("tenders", slugify(b.title));
    const mapQuery = await expandMapQuery(b.map_query || (b.location ? `${b.location}, KKTC` : ""));
    const photos = photosFromRequest(b, files);
    const captions = (photos.length ? photos : [{ caption: "" }]).map((p) => p.caption || "").join("\n");
    const i18n = await fillMissingTranslations(
      { title: b.title, description: b.description || "", location: b.location || "", captions },
      ["title", "description", "location", "captions"],
      i18nFromBody(b, ["title", "description", "location"])
    );
    const info = db.prepare(`
      INSERT INTO tenders (slug, title, location, map_query, year, description, before_image, after_image, published, i18n)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      slug,
      b.title,
      b.location || "",
      mapQuery,
      b.year ? Number(b.year) : null,
      b.description || "",
      before,
      after,
      b.published === "0" ? 0 : 1,
      JSON.stringify(i18n)
    );
    savePhotos(info.lastInsertRowid, photos.length ? photos : [{ before, image: after, caption: "" }]);
    const row = db.prepare("SELECT * FROM tenders WHERE id = ?").get(info.lastInsertRowid);
    res.json(publicTender(row));
  }
);

app.put(
  "/api/admin/tenders/:id",
  requireAuth,
  upload.fields([
    { name: "before_image", maxCount: 1 },
    { name: "after_image", maxCount: 1 },
    { name: "photo_befores", maxCount: 20 },
    { name: "photo_afters", maxCount: 20 }
  ]),
  async (req, res) => {
    const id = Number(req.params.id);
    const current = db.prepare("SELECT * FROM tenders WHERE id = ?").get(id);
    if (!current) return res.status(404).json({ error: "Kayıt yok" });
    const b = req.body;
    const files = req.files || {};
    const before = fileOrUrl(files.before_image && files.before_image[0], b.before_url || current.before_image);
    const after = fileOrUrl(files.after_image && files.after_image[0], b.after_url || current.after_image);
    const slug = uniqueSlug("tenders", slugify(b.title || current.title), id);
    const mapQuery = b.map_query !== undefined
      ? await expandMapQuery(b.map_query)
      : await expandMapQuery(current.map_query || ((b.location ?? current.location) ? `${b.location ?? current.location}, KKTC` : ""));
    const title = b.title || current.title;
    const location = b.location ?? current.location;
    const description = b.description ?? current.description;
    const incomingPhotos = b.photos_json !== undefined ? photosFromRequest(b, files) : null;
    const captionRows = incomingPhotos
      ? incomingPhotos.map((p) => p.caption || "")
      : db.prepare("SELECT caption FROM tender_photos WHERE tender_id = ? ORDER BY sort_order, id").all(id).map((p) => p.caption || "");
    const i18n = await fillMissingTranslations(
      { title, description: description || "", location: location || "", captions: captionRows.join("\n") },
      ["title", "description", "location", "captions"],
      mergeI18n(current.i18n, i18nFromBody(b, ["title", "description", "location"]))
    );
    db.prepare(`
      UPDATE tenders SET slug=?, title=?, location=?, map_query=?, year=?, description=?, before_image=?, after_image=?, published=?, i18n=?
      WHERE id=?
    `).run(
      slug,
      title,
      location,
      mapQuery,
      b.year ? Number(b.year) : current.year,
      description,
      before,
      after,
      b.published === "0" ? 0 : 1,
      JSON.stringify(i18n),
      id
    );
    if (incomingPhotos) savePhotos(id, incomingPhotos);
    res.json(publicTender(db.prepare("SELECT * FROM tenders WHERE id = ?").get(id)));
  }
);

app.delete("/api/admin/tenders/:id", requireAuth, (req, res) => {
  db.prepare("DELETE FROM tenders WHERE id = ?").run(Number(req.params.id));
  res.json({ ok: true });
});

async function projectPayload(b, files, current) {
  const image = fileOrUrl(files.image && files.image[0], b.image_url || (current && current.image) || "");
  const existing = current ? JSON.parse(current.gallery || "[]") : null;
  const gallery = galleryFromBody(b, files, image, existing);
  const features = (b.features || "").split("\n").map((s) => s.trim()).filter(Boolean);
  const status = ["ongoing", "completed", "soon"].includes(b.status) ? b.status : (current && current.status) || "ongoing";
  const location = b.location ?? (current ? current.location : "");
  const mapQuery = b.map_query !== undefined
    ? await expandMapQuery(b.map_query)
    : await expandMapQuery((current && current.map_query) || (location ? `${location}, KKTC` : ""));
  const title = b.title || (current && current.title) || "";
  const summary = b.summary !== undefined ? (b.summary || "") : (current ? current.summary : "");
  const featureList = b.features !== undefined ? features : (current ? JSON.parse(current.features || "[]") : []);
  const i18n = await fillMissingTranslations(
    { title, summary: summary || "", location: location || "", features: featureList.join("\n") },
    ["title", "summary", "location", "features"],
    mergeI18n(current && current.i18n, i18nFromBody(b, ["title", "summary", "location"]))
  );
  return {
    title,
    location,
    mapQuery,
    i18n,
    type: b.type || (current && current.type) || "residence",
    status,
    progress: b.progress !== undefined && b.progress !== "" ? Number(b.progress) : (current ? current.progress : 0),
    delivery: b.delivery ?? (current ? current.delivery : ""),
    rooms: b.rooms ?? (current ? current.rooms : ""),
    area: b.area ? Number(b.area) : (current ? current.area : null),
    units: b.units ? Number(b.units) : (current ? current.units : null),
    floors: b.floors ? Number(b.floors) : (current ? current.floors : null),
    code: b.code ?? (current ? current.code : ""),
    summary,
    features: featureList,
    image,
    gallery,
    featured: b.featured === "1" ? 1 : 0,
    published: b.published === "0" ? 0 : 1
  };
}

app.get("/api/admin/projects", requireAuth, (_req, res) => {
  res.json(db.prepare("SELECT * FROM projects ORDER BY id DESC").all().map(publicProject));
});

app.post(
  "/api/admin/projects",
  requireAuth,
  upload.fields([{ name: "image", maxCount: 1 }, { name: "gallery", maxCount: 12 }]),
  async (req, res) => {
    const data = await projectPayload(req.body, req.files || {});
    if (!data.title || !data.image) return res.status(400).json({ error: "Başlık ve kapak görseli zorunlu" });
    const slug = uniqueSlug("projects", slugify(data.title));
    const info = db.prepare(`
      INSERT INTO projects (slug, title, location, map_query, type, status, progress, delivery, rooms, area, units, floors, code, summary, features, image, gallery, featured, published, i18n)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      slug, data.title, data.location, data.mapQuery, data.type, data.status, data.progress, data.delivery, data.rooms,
      data.area, data.units, data.floors, data.code, data.summary, JSON.stringify(data.features),
      data.image, JSON.stringify(data.gallery), data.featured, data.published, JSON.stringify(data.i18n || {})
    );
    res.json(publicProject(db.prepare("SELECT * FROM projects WHERE id = ?").get(info.lastInsertRowid)));
  }
);

app.put(
  "/api/admin/projects/:id",
  requireAuth,
  upload.fields([{ name: "image", maxCount: 1 }, { name: "gallery", maxCount: 12 }]),
  async (req, res) => {
    const id = Number(req.params.id);
    const current = db.prepare("SELECT * FROM projects WHERE id = ?").get(id);
    if (!current) return res.status(404).json({ error: "Kayıt yok" });
    const data = await projectPayload(req.body, req.files || {}, current);
    const slug = uniqueSlug("projects", slugify(data.title), id);
    db.prepare(`
      UPDATE projects SET slug=?, title=?, location=?, map_query=?, type=?, status=?, progress=?, delivery=?, rooms=?, area=?, units=?, floors=?, code=?, summary=?, features=?, image=?, gallery=?, featured=?, published=?, i18n=?
      WHERE id=?
    `).run(
      slug, data.title, data.location, data.mapQuery, data.type, data.status, data.progress, data.delivery, data.rooms,
      data.area, data.units, data.floors, data.code, data.summary, JSON.stringify(data.features),
      data.image, JSON.stringify(data.gallery), data.featured, data.published, JSON.stringify(data.i18n || {}), id
    );
    res.json(publicProject(db.prepare("SELECT * FROM projects WHERE id = ?").get(id)));
  }
);

app.delete("/api/admin/projects/:id", requireAuth, (req, res) => {
  db.prepare("DELETE FROM projects WHERE id = ?").run(Number(req.params.id));
  res.json({ ok: true });
});

app.get("/api/admin/listings", requireAuth, (_req, res) => {
  res.json(db.prepare("SELECT * FROM listings ORDER BY id DESC").all().map(publicListing));
});

app.post(
  "/api/admin/listings",
  requireAuth,
  upload.fields([{ name: "image", maxCount: 1 }, { name: "gallery", maxCount: 8 }]),
  async (req, res) => {
    const b = req.body;
    const files = req.files || {};
    const image = fileOrUrl(files.image && files.image[0], b.image_url);
    if (!b.title || !image) return res.status(400).json({ error: "Başlık ve kapak görseli zorunlu" });
    const galleryFiles = (files.gallery || []).map((f) => "/uploads/" + f.filename);
    const extra = (b.gallery_urls || "").split("\n").map((s) => s.trim()).filter(Boolean);
    const gallery = [image, ...galleryFiles, ...extra].filter((v, i, a) => a.indexOf(v) === i);
    const slug = uniqueSlug("listings", slugify(b.title));
    const mapQuery = await expandMapQuery(b.map_query || (b.location ? `${b.location}, KKTC` : ""));
    const amenities = JSON.stringify(parseAmenities(b));
    const i18n = await fillMissingTranslations(
      { title: b.title, description: b.description || "", location: b.location || "" },
      ["title", "description", "location"],
      i18nFromBody(b, ["title", "description", "location"])
    );
    const info = db.prepare(`
      INSERT INTO listings (
        slug, title, location, map_query, type, status, price, currency, rooms, area, floor,
        bathrooms, heating, furnished, parking, balcony, deed, building_age, dues, deposit, amenities,
        description, image, gallery, featured, published, i18n
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      slug,
      b.title,
      b.location || "",
      mapQuery,
      b.type || "apartment",
      b.status || "sale",
      b.price ? Number(b.price) : null,
      b.currency || "TRY",
      b.rooms || "",
      b.area ? Number(b.area) : null,
      b.floor || "",
      b.bathrooms || "",
      b.heating || "",
      b.furnished || "",
      b.parking || "",
      b.balcony || "",
      b.deed || "",
      b.building_age || "",
      b.dues || "",
      b.deposit || "",
      amenities,
      b.description || "",
      image,
      JSON.stringify(gallery),
      b.featured === "1" ? 1 : 0,
      b.published === "0" ? 0 : 1,
      JSON.stringify(i18n)
    );
    res.json(publicListing(db.prepare("SELECT * FROM listings WHERE id = ?").get(info.lastInsertRowid)));
  }
);

app.put(
  "/api/admin/listings/:id",
  requireAuth,
  upload.fields([{ name: "image", maxCount: 1 }, { name: "gallery", maxCount: 8 }]),
  async (req, res) => {
    const id = Number(req.params.id);
    const current = db.prepare("SELECT * FROM listings WHERE id = ?").get(id);
    if (!current) return res.status(404).json({ error: "Kayıt yok" });
    const b = req.body;
    const files = req.files || {};
    const image = fileOrUrl(files.image && files.image[0], b.image_url || current.image);
    const existing = JSON.parse(current.gallery || "[]");
    const galleryFiles = (files.gallery || []).map((f) => "/uploads/" + f.filename);
    const extra = (b.gallery_urls || "").split("\n").map((s) => s.trim()).filter(Boolean);
    const gallery = extra.length || galleryFiles.length
      ? [image, ...galleryFiles, ...extra].filter((v, i, a) => a.indexOf(v) === i)
      : existing;
    const slug = uniqueSlug("listings", slugify(b.title || current.title), id);
    const mapQuery = b.map_query !== undefined
      ? await expandMapQuery(b.map_query)
      : await expandMapQuery(current.map_query || ((b.location ?? current.location) ? `${b.location ?? current.location}, KKTC` : ""));
    const amenities = JSON.stringify(parseAmenities(b));
    const title = b.title || current.title;
    const location = b.location ?? current.location;
    const description = b.description ?? current.description;
    const i18n = await fillMissingTranslations(
      { title, description: description || "", location: location || "" },
      ["title", "description", "location"],
      mergeI18n(current.i18n, i18nFromBody(b, ["title", "description", "location"]))
    );
    db.prepare(`
      UPDATE listings SET slug=?, title=?, location=?, map_query=?, type=?, status=?, price=?, currency=?, rooms=?, area=?, floor=?,
        bathrooms=?, heating=?, furnished=?, parking=?, balcony=?, deed=?, building_age=?, dues=?, deposit=?, amenities=?,
        description=?, image=?, gallery=?, featured=?, published=?, i18n=?
      WHERE id=?
    `).run(
      slug,
      title,
      location,
      mapQuery,
      b.type || current.type,
      b.status || current.status,
      b.price ? Number(b.price) : current.price,
      b.currency || current.currency,
      b.rooms ?? current.rooms,
      b.area ? Number(b.area) : current.area,
      b.floor ?? current.floor,
      b.bathrooms ?? current.bathrooms ?? "",
      b.heating ?? current.heating ?? "",
      b.furnished ?? current.furnished ?? "",
      b.parking ?? current.parking ?? "",
      b.balcony ?? current.balcony ?? "",
      b.deed ?? current.deed ?? "",
      b.building_age ?? current.building_age ?? "",
      b.dues ?? current.dues ?? "",
      b.deposit ?? current.deposit ?? "",
      amenities,
      description,
      image,
      JSON.stringify(gallery),
      b.featured === "1" ? 1 : 0,
      b.published === "0" ? 0 : 1,
      JSON.stringify(i18n),
      id
    );
    res.json(publicListing(db.prepare("SELECT * FROM listings WHERE id = ?").get(id)));
  }
);

app.delete("/api/admin/listings/:id", requireAuth, (req, res) => {
  db.prepare("DELETE FROM listings WHERE id = ?").run(Number(req.params.id));
  res.json({ ok: true });
});

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/uploads") || req.path.startsWith("/assets")) return next();
  if (fs.existsSync(path.join(dist, "index.html"))) {
    return res.sendFile(path.join(dist, "index.html"));
  }
  res.status(503).send("Önce npm run build çalıştırın veya geliştirme için npm run dev kullanın.");
});

app.use((err, _req, res, _next) => {
  if (res.headersSent) return;
  res.status(400).json({ error: err.message || "İstek işlenemedi" });
});

require("./seed");

app.listen(PORT, async () => {
  try {
    await backfillShortMapQueries();
  } catch (err) {
    console.warn("Harita kısa link genişletme:", err.message);
  }
  console.log(`API http://localhost:${PORT}`);
  console.log(`Geliştirme (React) http://localhost:5173`);
  console.log(`Yönetim /admin  (${ADMIN_USER})`);
});
