import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import I18nFields from "../components/I18nFields";
import { locations as fallbackLocations } from "../data";
import "../../assets/css/admin.css";

function MapsUrlBox({ value }) {
  return (
    <div className="maps-url-box">
      <label htmlFor="map_query">Maps URL</label>
      <textarea
        id="map_query"
        name="map_query"
        rows="3"
        defaultValue={value || ""}
        placeholder="Google Maps'ten kopyaladığınız linki buraya yapıştırın&#10;Örn: https://maps.app.goo.gl/... veya https://www.google.com/maps/place/..."
      />
      <p>Google Maps → konum → <strong>Paylaş</strong> → bağlantıyı kopyala → buraya yapıştır → Kaydet. Sitede harita bu konumdan görünür.</p>
    </div>
  );
}

function OptSelect({ name, label, options = [], defaultValue = "", allowEmpty = true }) {
  const list = [...options];
  if (defaultValue && !list.some((o) => o.value === defaultValue || o.label === defaultValue)) {
    list.unshift({ value: defaultValue, label: defaultValue });
  }
  return (
    <div className="field">
      <label>{label}</label>
      <select name={name} defaultValue={defaultValue || ""}>
        {allowEmpty ? <option value="">Seçin</option> : null}
        {list.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function OptionsPanel({ groups, optionsByGroup, onChanged }) {
  const groupKeys = Object.keys(groups || {});
  const [group, setGroup] = useState(groupKeys[0] || "location");
  const [err, setErr] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ label: "", value: "" });
  const rows = optionsByGroup[group] || [];

  useEffect(() => {
    if (!groupKeys.includes(group) && groupKeys[0]) setGroup(groupKeys[0]);
  }, [groupKeys.join("|")]);

  const reload = () => onChanged?.();

  const add = async (e) => {
    e.preventDefault();
    setErr("");
    const fd = new FormData(e.target);
    try {
      await api("/api/admin/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group,
          label: fd.get("label"),
          value: fd.get("value") || fd.get("label")
        })
      });
      e.target.reset();
      reload();
    } catch (ex) {
      setErr(ex.message);
    }
  };

  const saveEdit = async (id) => {
    setErr("");
    try {
      await api(`/api/admin/options/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft)
      });
      setEditingId(null);
      reload();
    } catch (ex) {
      setErr(ex.message);
    }
  };

  const toggle = async (row) => {
    await api(`/api/admin/options/${row.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: row.active ? 0 : 1, label: row.label, value: row.value, autoTranslate: false })
    });
    reload();
  };

  const remove = async (id) => {
    if (!confirm("Bu seçeneği silmek istiyor musunuz?")) return;
    await api(`/api/admin/options/${id}`, { method: "DELETE" });
    reload();
  };

  return (
    <div className="options-panel">
      <p className="muted">Filtre ve ilan formlarındaki listeleri buradan ekleyin veya çıkarın. Pasif olanlar sitede görünmez.</p>
      <div className="options-groups">
        {groupKeys.map((k) => (
          <button key={k} type="button" className={`chip ${group === k ? "active" : ""}`} onClick={() => { setGroup(k); setEditingId(null); }}>
            {groups[k]?.label || k}
            <small>{(optionsByGroup[k] || []).length}</small>
          </button>
        ))}
      </div>
      <div className="options-group-head">
        <div>
          <h3>{groups[group]?.label || group}</h3>
          <p className="muted">{groups[group]?.hint}</p>
        </div>
      </div>
      <form className="options-add" onSubmit={add}>
        <div className="field"><label>Görünen ad *</label><input name="label" required placeholder="Örn: 3+1 veya Girne – Lapta" /></div>
        <div className="field"><label>Değer (opsiyonel)</label><input name="value" placeholder="Boş bırakılırsa ad kullanılır" /></div>
        <button className="btn btn--gold" type="submit">Ekle</button>
      </form>
      {err ? <p className="admin-error">{err}</p> : null}
      {!rows.length ? <div className="empty"><p>Bu grupta seçenek yok.</p></div> : (
        <table className="admin-table">
          <thead><tr><th>Etiket</th><th>Değer</th><th>Durum</th><th /></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className={r.active ? "" : "is-inactive"}>
                <td>
                  {editingId === r.id
                    ? <input value={draft.label} onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))} />
                    : <strong>{r.label}</strong>}
                </td>
                <td>
                  {editingId === r.id
                    ? <input value={draft.value} onChange={(e) => setDraft((d) => ({ ...d, value: e.target.value }))} />
                    : <code>{r.value}</code>}
                </td>
                <td>{r.active ? "Aktif" : "Pasif"}</td>
                <td className="nowrap">
                  {editingId === r.id ? (
                    <>
                      <button type="button" onClick={() => saveEdit(r.id)}>Kaydet</button>
                      <button type="button" onClick={() => setEditingId(null)}>Vazgeç</button>
                    </>
                  ) : (
                    <>
                      <button type="button" onClick={() => { setEditingId(r.id); setDraft({ label: r.label, value: r.value }); }}>Düzenle</button>
                      <button type="button" onClick={() => toggle(r)}>{r.active ? "Pasifleştir" : "Aktifleştir"}</button>
                      <button type="button" className="danger" onClick={() => remove(r.id)}>Sil</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export function AdminLogin() {
  const nav = useNavigate();
  const [err, setErr] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await api("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: fd.get("user"), password: fd.get("password") })
      });
      nav("/admin");
    } catch (ex) {
      setErr(ex.message);
    }
  };
  return (
    <div className="admin-login">
      <form className="admin-card" onSubmit={submit}>
        <p className="eyebrow">Burak İnşaat · KKTC</p>
        <h1>Yönetim paneli</h1>
        <p className="muted">Proje tanıtımları, satış ilanları ve ihale restorasyonlarını buradan yönetin.</p>
        <div className="field"><label>Kullanıcı adı</label><input name="user" required autoComplete="username" /></div>
        <div className="field"><label>Şifre</label><input name="password" type="password" required autoComplete="current-password" /></div>
        {err && <p className="admin-error">{err}</p>}
        <button className="btn btn--gold btn--block" type="submit">Giriş yap</button>
      </form>
    </div>
  );
}

const KIND_LABEL = {
  contact: "İletişim",
  quote: "Teklif",
  listing: "Emlak",
  project: "Proje",
  tender: "İhale"
};

function formatWhen(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(String(iso).includes("T") ? iso : String(iso).replace(" ", "T"));
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString("tr-TR", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
  } catch {
    return iso;
  }
}

export function AdminHome() {
  const nav = useNavigate();
  const [tab, setTab] = useState("tenders");
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState(null);
  const [editing, setEditing] = useState(undefined);
  const [viewing, setViewing] = useState(null);
  const [err, setErr] = useState("");
  const [photoRows, setPhotoRows] = useState([]);
  const [optGroups, setOptGroups] = useState({});
  const [optByGroup, setOptByGroup] = useState({});
  const [i18nLang, setI18nLang] = useState("en");
  const [backfillBusy, setBackfillBusy] = useState(false);

  const locOptions = useMemo(() => {
    const list = optByGroup.location || [];
    if (list.length) return list;
    return fallbackLocations.map((l) => ({ value: l, label: l, active: true }));
  }, [optByGroup]);

  const loadOptions = async () => {
    const data = await api("/api/admin/options");
    setOptGroups(data.groups || {});
    setOptByGroup(data.options || {});
  };

  const startEdit = (row) => {
    setEditing(row);
    if (tab !== "tenders") return;
    if (row && row.photos && row.photos.length) {
      setPhotoRows(row.photos.map((p, i) => ({
        key: "p" + (p.id || i),
        before: p.beforeImage || "",
        after: p.afterImage || p.image || "",
        caption: p.caption || "",
        beforeFile: null,
        afterFile: null
      })));
    } else {
      setPhotoRows([{ key: "p0", before: "", after: "", caption: "", beforeFile: null, afterFile: null }]);
    }
  };

  const load = async () => {
    try {
      const me = await api("/api/admin/me");
      if (!me.admin) return nav("/admin/login");
      setStats(await api("/api/admin/stats"));
      await loadOptions();
      if (tab === "options") {
        setRows([]);
        return;
      }
      const path =
        tab === "tenders" ? "/api/admin/tenders"
          : tab === "projects" ? "/api/admin/projects"
            : tab === "inquiries" ? "/api/admin/inquiries"
              : "/api/admin/listings";
      setRows(await api(path));
    } catch {
      nav("/admin/login");
    }
  };
  useEffect(() => { load(); setViewing(null); setEditing(undefined); }, [tab]);

  const openInquiry = async (row) => {
    try {
      const full = await api(`/api/admin/inquiries/${row.id}`);
      setViewing(full);
      setRows((list) => list.map((r) => (r.id === full.id ? { ...r, isRead: true } : r)));
      setStats((s) => (s ? { ...s, unreadInquiries: Math.max(0, (s.unreadInquiries || 0) - (row.isRead ? 0 : 1)) } : s));
    } catch (ex) {
      setErr(ex.message);
    }
  };

  const save = async (e) => {
    e.preventDefault();
    if (tab === "inquiries" || tab === "options") return;
    setErr("");
    const fd = new FormData(e.target);
    fd.set("published", e.target.published.checked ? "1" : "0");
    if (tab === "listings" || tab === "projects") fd.set("featured", e.target.featured?.checked ? "1" : "0");
    if (tab === "tenders") {
      fd.set("photos_json", JSON.stringify(photoRows.map((p) => ({
        before: p.beforeFile ? "" : (p.before || ""),
        after: p.afterFile ? "" : (p.after || ""),
        caption: p.caption || "",
        newBefore: !!p.beforeFile,
        newAfter: !!p.afterFile
      }))));
      photoRows.forEach((p) => { if (p.beforeFile) fd.append("photo_befores", p.beforeFile); });
      photoRows.forEach((p) => { if (p.afterFile) fd.append("photo_afters", p.afterFile); });
    }
    const base = tab === "tenders" ? "/api/admin/tenders" : tab === "projects" ? "/api/admin/projects" : "/api/admin/listings";
    try {
      await api(editing ? `${base}/${editing.dbId}` : base, { method: editing ? "PUT" : "POST", body: fd });
      setEditing(undefined);
      load();
    } catch (ex) {
      setErr(ex.message);
    }
  };

  const del = async (id) => {
    if (!confirm("Bu kaydı silmek istiyor musunuz?")) return;
    const base =
      tab === "tenders" ? "/api/admin/tenders/"
        : tab === "projects" ? "/api/admin/projects/"
          : tab === "inquiries" ? "/api/admin/inquiries/"
            : "/api/admin/listings/";
    await api(base + id, { method: "DELETE" });
    if (viewing?.id === id) setViewing(null);
    load();
  };

  const titles = {
    tenders: "İhaleler",
    projects: "Proje tanıtımları",
    listings: "Satılık emlaklar",
    inquiries: "Gelen mesajlar",
    options: "Filtre & seçenekler"
  };

  const activeOpts = (key) => (optByGroup[key] || []).filter((o) => o.active !== false);

  return (
    <div className="admin-app">
      <aside className="admin-side">
        <Link className="brand" to="/"><strong>BURAK</strong><small>YÖNETİM</small></Link>
        <nav>
          <button type="button" className={tab === "projects" ? "on" : ""} onClick={() => setTab("projects")}>Projeler</button>
          <button type="button" className={tab === "listings" ? "on" : ""} onClick={() => setTab("listings")}>Emlaklar</button>
          <button type="button" className={tab === "tenders" ? "on" : ""} onClick={() => setTab("tenders")}>İhaleler</button>
          <button type="button" className={tab === "inquiries" ? "on" : ""} onClick={() => setTab("inquiries")}>
            Mesajlar{stats?.unreadInquiries ? <span className="admin-badge">{stats.unreadInquiries}</span> : null}
          </button>
          <button type="button" className={tab === "options" ? "on" : ""} onClick={() => setTab("options")}>Seçenekler</button>
        </nav>
        <Link className="btn btn--ghost-light btn--sm" to="/">Siteye dön</Link>
        <button type="button" className="btn btn--sm" onClick={async () => { await api("/api/admin/logout", { method: "POST" }); nav("/admin/login"); }}>Çıkış</button>
      </aside>
      <main className="admin-main">
        <header className="admin-head">
          <div>
            <h1>{titles[tab]}</h1>
            <p className="muted">{stats
              ? tab === "inquiries"
                ? `${stats.inquiries || 0} mesaj${stats.unreadInquiries ? ` · ${stats.unreadInquiries} okunmamış` : ""}`
                : tab === "options"
                  ? "Konum, oda, tip ve diğer filtre seçeneklerini yönetin"
                  : `${stats.projects || 0} proje · ${stats.listings} emlak · ${stats.tenders} ihale · ${stats.inquiries || 0} mesaj`
              : ""}</p>
          </div>
          {tab === "options" ? (
            <button
              className="btn btn--gold"
              type="button"
              disabled={backfillBusy}
              onClick={async () => {
                if (!confirm("Mevcut tüm Türkçe içerik ve seçenekler EN/DE/FA için çevrilecek. Birkaç dakika sürebilir. Devam?")) return;
                setBackfillBusy(true);
                try {
                  const r = await api("/api/admin/translate-backfill", { method: "POST" });
                  alert(`Çeviri tamamlandı (${r.updated} kayıt).`);
                  loadOptions();
                } catch (ex) {
                  alert(ex.message);
                } finally {
                  setBackfillBusy(false);
                }
              }}
            >
              {backfillBusy ? "Çeviriliyor…" : "Eksik çevirileri doldur"}
            </button>
          ) : tab !== "inquiries" ? (
            <button className="btn btn--gold" type="button" onClick={() => startEdit(null)}>Yeni kayıt</button>
          ) : null}
        </header>
        {tab === "options" ? (
          <OptionsPanel groups={optGroups} optionsByGroup={optByGroup} onChanged={loadOptions} />
        ) : !rows.length ? <div className="empty"><p>{tab === "inquiries" ? "Henüz mesaj yok." : "Kayıt yok."}</p></div> : tab === "inquiries" ? (
          <table className="admin-table">
            <thead><tr><th>Tarih</th><th>Gönderen</th><th>Kaynak</th><th>Mesaj</th><th /></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className={r.isRead ? "" : "is-unread"}>
                  <td className="nowrap">{formatWhen(r.createdAt)}</td>
                  <td>
                    <strong>{r.name}</strong>
                    {!r.isRead ? <span className="admin-dot" title="Okunmadı" /> : null}
                    <br /><small>{r.phone}{r.email ? ` · ${r.email}` : ""}</small>
                  </td>
                  <td>
                    <span className="admin-kind">{KIND_LABEL[r.kind] || r.kind}</span>
                    {r.refSlug ? <><br /><small>{r.refSlug}</small></> : null}
                  </td>
                  <td className="msg-preview">{(r.message || "").slice(0, 90)}{(r.message || "").length > 90 ? "…" : ""}</td>
                  <td className="nowrap">
                    <button type="button" onClick={() => openInquiry(r)}>Görüntüle</button>
                    <button type="button" className="danger" onClick={() => del(r.id)}>Sil</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : tab === "tenders" ? (
          <table className="admin-table">
            <thead><tr><th>Önce / Sonra</th><th>Başlık</th><th>Konum</th><th>Yıl</th><th /></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.dbId}>
                  <td><div className="thumbs"><img src={r.beforeImage} alt="" /><img src={r.afterImage} alt="" /></div></td>
                  <td><strong>{r.title}</strong></td>
                  <td>{r.location || "—"}</td>
                  <td>{r.year || "—"}</td>
                  <td className="nowrap">
                    <button type="button" onClick={() => startEdit(r)}>Düzenle</button>
                    <button type="button" className="danger" onClick={() => del(r.dbId)}>Sil</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : tab === "projects" ? (
          <table className="admin-table">
            <thead><tr><th>Görsel</th><th>Proje</th><th>Aşama</th><th>Teslim</th><th /></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.dbId}>
                  <td><img className="thumb" src={r.image} alt="" /></td>
                  <td><strong>{r.title}</strong><br /><small>{r.location}</small></td>
                  <td>{r.status === "ongoing" ? "Devam eden" : r.status === "soon" ? "Yakında" : "Tamamlanan"}</td>
                  <td>{r.delivery || "—"}</td>
                  <td className="nowrap">
                    <button type="button" onClick={() => startEdit(r)}>Düzenle</button>
                    <button type="button" className="danger" onClick={() => del(r.dbId)}>Sil</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="admin-table">
            <thead><tr><th>Görsel</th><th>Başlık</th><th>Durum</th><th>Fiyat</th><th /></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.dbId}>
                  <td><img className="thumb" src={r.image} alt="" /></td>
                  <td><strong>{r.title}</strong><br /><small>{r.location}</small></td>
                  <td>{r.status === "rent" ? "Kiralık" : "Satılık"}</td>
                  <td>{r.price != null ? Number(r.price).toLocaleString("tr-TR") + " " + r.currency : "—"}</td>
                  <td className="nowrap">
                    <button type="button" onClick={() => startEdit(r)}>Düzenle</button>
                    <button type="button" className="danger" onClick={() => del(r.dbId)}>Sil</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
      {viewing && (
        <dialog className="admin-modal" open>
          <div className="admin-form">
            <h2>Mesaj detayı</h2>
            <dl className="inquiry-meta">
              <div><dt>Tarih</dt><dd>{formatWhen(viewing.createdAt)}</dd></div>
              <div><dt>Kaynak</dt><dd>{KIND_LABEL[viewing.kind] || viewing.kind}{viewing.refSlug ? ` · ${viewing.refSlug}` : ""}</dd></div>
              <div><dt>Ad Soyad</dt><dd>{viewing.name}</dd></div>
              <div><dt>Telefon</dt><dd><a href={`tel:${viewing.phone}`}>{viewing.phone}</a></dd></div>
              {viewing.email ? <div><dt>E-posta</dt><dd><a href={`mailto:${viewing.email}`}>{viewing.email}</a></dd></div> : null}
            </dl>
            <div className="inquiry-body">
              <strong>Mesaj</strong>
              <p>{viewing.message || "—"}</p>
            </div>
            <div className="admin-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setViewing(null)}>Kapat</button>
              <a className="btn btn--gold" href={`tel:${viewing.phone}`}>Ara</a>
            </div>
          </div>
        </dialog>
      )}
      {editing !== undefined && tab !== "inquiries" && (
        <dialog className="admin-modal" open>
          <form className="admin-form" key={`${tab}-${editing?.dbId ?? "new"}`} onSubmit={save}>
            <h2>{editing ? "Kaydı düzenle" : "Yeni kayıt"}</h2>
            {tab === "tenders" ? (
              <>
                <div className="field"><label>Başlık *</label><input name="title" required defaultValue={editing?.title} /></div>
                <div className="form-grid">
                  <OptSelect name="location" label="Konum" options={locOptions} defaultValue={editing?.location || ""} />
                  <div className="field"><label>Yıl</label><input name="year" type="number" defaultValue={editing?.year || ""} /></div>
                </div>
                <MapsUrlBox value={editing?.mapQuery} />
                <div className="field"><label>Açıklama</label><textarea name="description" rows="5" defaultValue={editing?.description} /></div>
                <I18nFields
                  lang={i18nLang}
                  onLang={setI18nLang}
                  existing={editing?.i18n}
                  fields={[
                    { name: "title", label: "Başlık" },
                    { name: "location", label: "Konum" },
                    { name: "description", label: "Açıklama", multiline: true }
                  ]}
                />
                <div className="form-grid">
                  <div className="field"><label>Önce görseli</label><input name="before_image" type="file" accept="image/*" /></div>
                  <div className="field"><label>veya URL</label><input name="before_url" defaultValue={editing?.beforeImage} /></div>
                </div>
                <div className="form-grid">
                  <div className="field"><label>Sonra görseli (karşılaştırma)</label><input name="after_image" type="file" accept="image/*" /></div>
                  <div className="field"><label>veya URL</label><input name="after_url" defaultValue={editing?.afterImage} /></div>
                </div>
                <div className="photo-editor">
                  <strong>Restorasyon karşılaştırmaları</strong>
                  <p className="muted" style={{ margin: 0 }}>Her satır, üstteki kaydırıcı gibi önce ve sonra fotoğrafıdır. Açıklama boş bırakılabilir.</p>
                  {photoRows.map((row, i) => (
                    <div className="photo-row" key={row.key}>
                      <div className="photo-pair">
                        <div>
                          {row.before ? <img src={row.before} alt="" /> : null}
                          <div className="field"><label>Fotoğraf {i + 1} — önce</label>
                            <input type="file" accept="image/*" onChange={(e) => {
                              const file = e.target.files && e.target.files[0];
                              if (!file) return;
                              setPhotoRows((list) => list.map((p, idx) => idx === i ? { ...p, beforeFile: file, before: URL.createObjectURL(file) } : p));
                            }} />
                          </div>
                        </div>
                        <div>
                          {row.after ? <img src={row.after} alt="" /> : null}
                          <div className="field"><label>Fotoğraf {i + 1} — sonra</label>
                            <input type="file" accept="image/*" onChange={(e) => {
                              const file = e.target.files && e.target.files[0];
                              if (!file) return;
                              setPhotoRows((list) => list.map((p, idx) => idx === i ? { ...p, afterFile: file, after: URL.createObjectURL(file) } : p));
                            }} />
                          </div>
                        </div>
                      </div>
                      <div className="field"><label>Bu karşılaştırmanın altındaki açıklama</label>
                        <textarea rows="3" value={row.caption} placeholder="Opsiyonel" onChange={(e) => {
                          const caption = e.target.value;
                          setPhotoRows((list) => list.map((p, idx) => idx === i ? { ...p, caption } : p));
                        }} />
                      </div>
                      <button type="button" className="danger" onClick={() => setPhotoRows((list) => list.filter((_, idx) => idx !== i))}>Bu fotoyu çıkar</button>
                    </div>
                  ))}
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => setPhotoRows((list) => [...list, { key: "n" + Date.now(), before: "", after: "", caption: "", beforeFile: null, afterFile: null }])}>Fotoğraf ekle</button>
                </div>
              </>
            ) : tab === "projects" ? (
              <>
                <p className="muted">Bu kayıt satış ilanı değil; projenin tanıtımıdır. Fiyat ve stok Emlaklar sekmesindedir.</p>
                <div className="field"><label>Başlık *</label><input name="title" required defaultValue={editing?.title} /></div>
                <div className="form-grid">
                  <OptSelect name="location" label="Konum" options={locOptions} defaultValue={editing?.location || ""} />
                  <div className="field"><label>Tip</label>
                    <select name="type" defaultValue={editing?.type || "residence"}>
                      <option value="residence">Rezidans</option><option value="villa">Villa</option><option value="apartment">Apartman</option><option value="commercial">Ticari</option>
                    </select>
                  </div>
                  <div className="field"><label>Aşama</label>
                    <select name="status" defaultValue={editing?.status || "ongoing"}>
                      <option value="ongoing">Devam eden</option><option value="completed">Tamamlanan</option><option value="soon">Yakında</option>
                    </select>
                  </div>
                  <div className="field"><label>İlerleme %</label><input name="progress" type="number" min="0" max="100" defaultValue={editing?.progress ?? 0} /></div>
                  <div className="field"><label>Teslim</label><input name="delivery" defaultValue={editing?.delivery} placeholder="2027 – Q2" /></div>
                  <div className="field"><label>Proje kodu</label><input name="code" defaultValue={editing?.code} /></div>
                  <div className="field"><label>Daire tipleri</label><input name="rooms" defaultValue={editing?.rooms} placeholder="2+1 / 3+1" /></div>
                  <div className="field"><label>Örnek alan (m²)</label><input name="area" type="number" step="0.1" defaultValue={editing?.area || ""} /></div>
                  <div className="field"><label>Kat sayısı</label><input name="floors" type="number" defaultValue={editing?.floors || ""} /></div>
                  <div className="field"><label>Bağımsız bölüm</label><input name="units" type="number" defaultValue={editing?.units || ""} /></div>
                </div>
                <MapsUrlBox value={editing?.mapQuery} />
                <div className="field"><label>Tanıtım metni</label><textarea name="summary" rows="5" defaultValue={editing?.summary} /></div>
                <I18nFields
                  lang={i18nLang}
                  onLang={setI18nLang}
                  existing={editing?.i18n}
                  fields={[
                    { name: "title", label: "Başlık" },
                    { name: "location", label: "Konum" },
                    { name: "summary", label: "Tanıtım", multiline: true }
                  ]}
                />
                <div className="field"><label>Özellikler (satır satır)</label><textarea name="features" rows="4" defaultValue={(editing?.features || []).join("\n")} /></div>
                <div className="form-grid">
                  <div className="field"><label>Kapak *</label><input name="image" type="file" accept="image/*" /></div>
                  <div className="field"><label>veya URL</label><input name="image_url" defaultValue={editing?.image} /></div>
                </div>
                <div className="field"><label>Galeri fotoğrafları</label><input name="gallery" type="file" accept="image/*" multiple /></div>
                <div className="field"><label>Galeri URL (satır satır)</label><textarea name="gallery_urls" rows="3" defaultValue={(editing?.gallery || []).join("\n")} /></div>
                <label className="consent"><input type="checkbox" name="featured" defaultChecked={!!editing?.featured} /> Öne çıkar</label>
              </>
            ) : (
              <>
                <p className="muted">İlan detayları ve seçenek listeleri (oda, konum, tip…) Seçenekler sekmesinden yönetilir.</p>
                <div className="field"><label>Başlık *</label><input name="title" required defaultValue={editing?.title} /></div>
                <div className="form-grid">
                  <OptSelect name="location" label="Konum" options={locOptions} defaultValue={editing?.location || ""} />
                  <OptSelect name="type" label="Gayrimenkul" options={activeOpts("listing_type")} defaultValue={editing?.type || "apartment"} allowEmpty={false} />
                  <div className="field"><label>İlan tipi</label>
                    <select name="status" defaultValue={editing?.status || "sale"}><option value="sale">Satılık</option><option value="rent">Kiralık</option></select>
                  </div>
                  <div className="field"><label>Fiyat</label><input name="price" type="number" defaultValue={editing?.price || ""} /></div>
                  <div className="field"><label>Para birimi</label>
                    <select name="currency" defaultValue={editing?.currency || "GBP"}><option>GBP</option><option>EUR</option><option>TRY</option></select>
                  </div>
                  <OptSelect name="rooms" label="Oda sayısı" options={activeOpts("rooms")} defaultValue={editing?.rooms || ""} />
                  <div className="field"><label>Alan (m²)</label><input name="area" type="number" step="0.1" defaultValue={editing?.area || ""} /></div>
                  <OptSelect name="floor" label="Kat" options={activeOpts("floor")} defaultValue={editing?.floor || ""} />
                  <OptSelect name="bathrooms" label="Banyo" options={activeOpts("bathrooms")} defaultValue={editing?.bathrooms || ""} />
                  <OptSelect name="heating" label="Isıtma" options={activeOpts("heating")} defaultValue={editing?.heating || ""} />
                  <OptSelect name="furnished" label="Eşya durumu" options={activeOpts("furnished")} defaultValue={editing?.furnished || ""} />
                  <OptSelect name="parking" label="Otopark" options={activeOpts("parking")} defaultValue={editing?.parking || ""} />
                  <OptSelect name="balcony" label="Balkon / teras" options={activeOpts("balcony")} defaultValue={editing?.balcony || ""} />
                  <OptSelect name="deed" label="Tapu durumu" options={activeOpts("deed")} defaultValue={editing?.deed || ""} />
                  <OptSelect name="building_age" label="Bina yaşı" options={activeOpts("building_age")} defaultValue={editing?.buildingAge || ""} />
                  <div className="field"><label>Aidat</label><input name="dues" defaultValue={editing?.dues || ""} placeholder="Örn: 150 £" /></div>
                  <div className="field"><label>Depozito</label><input name="deposit" defaultValue={editing?.deposit || ""} placeholder="Kiralık için" /></div>
                </div>
                <div className="amenity-box">
                  <strong>Özellikler</strong>
                  <p className="muted">Seçenekler sekmesindeki “Özellik / olanak” listesinden gelir.</p>
                  <div className="amenity-grid">
                    {activeOpts("amenity").map((a) => (
                      <label key={a.value} className="consent">
                        <input
                          type="checkbox"
                          name="amenities"
                          value={a.value}
                          defaultChecked={(editing?.amenities || []).includes(a.value)}
                        />
                        {a.label}
                      </label>
                    ))}
                    {!activeOpts("amenity").length ? <span className="muted">Henüz özellik eklenmedi.</span> : null}
                  </div>
                </div>
                <MapsUrlBox value={editing?.mapQuery} />
                <div className="field"><label>Açıklama</label><textarea name="description" rows="5" defaultValue={editing?.description} /></div>
                <I18nFields
                  lang={i18nLang}
                  onLang={setI18nLang}
                  existing={editing?.i18n}
                  fields={[
                    { name: "title", label: "Başlık" },
                    { name: "location", label: "Konum" },
                    { name: "description", label: "Açıklama", multiline: true }
                  ]}
                />
                <div className="form-grid">
                  <div className="field"><label>Kapak</label><input name="image" type="file" accept="image/*" /></div>
                  <div className="field"><label>veya URL</label><input name="image_url" defaultValue={editing?.image} /></div>
                </div>
                <div className="field"><label>Galeri URL (satır satır)</label><textarea name="gallery_urls" rows="3" defaultValue={(editing?.gallery || []).join("\n")} /></div>
                <label className="consent"><input type="checkbox" name="featured" defaultChecked={!!editing?.featured} /> Öne çıkar</label>
              </>
            )}
            <label className="consent"><input type="checkbox" name="published" defaultChecked={editing ? editing.published !== false : true} /> Sitede yayınla</label>
            {err && <p className="admin-error">{err}</p>}
            <div className="admin-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setEditing(undefined)}>Vazgeç</button>
              <button type="submit" className="btn btn--gold">Kaydet</button>
            </div>
          </form>
        </dialog>
      )}
    </div>
  );
}
