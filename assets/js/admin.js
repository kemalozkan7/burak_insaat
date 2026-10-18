(function () {
  const $ = (s, r = document) => r.querySelector(s);
  let tab = "tenders";
  let rows = [];
  let editing = null;

  const tenderFields = () => `
    <div class="field"><label>Başlık *</label><input name="title" required></div>
    <div class="form-grid">
      <div class="field"><label>Konum</label><input name="location" placeholder="Alanya – Mahmutlar"></div>
      <div class="field"><label>Yıl</label><input name="year" type="number" min="1990" max="2100"></div>
    </div>
    <div class="field"><label>Açıklama</label><textarea name="description" rows="5"></textarea></div>
    <div class="form-grid">
      <div class="field"><label>Önce görseli (dosya)</label><input name="before_image" type="file" accept="image/*"></div>
      <div class="field"><label>veya görsel URL</label><input name="before_url" placeholder="https://..."></div>
    </div>
    <div class="form-grid">
      <div class="field"><label>Sonra görseli (dosya)</label><input name="after_image" type="file" accept="image/*"></div>
      <div class="field"><label>veya görsel URL</label><input name="after_url" placeholder="https://..."></div>
    </div>
    <label class="consent"><input type="checkbox" name="published" value="1" checked> Sitede yayınla</label>
  `;

  const listingFields = () => `
    <div class="field"><label>Başlık *</label><input name="title" required></div>
    <div class="form-grid">
      <div class="field"><label>Konum</label><input name="location"></div>
      <div class="field"><label>Gayrimenkul</label>
        <select name="type">
          <option value="apartment">Daire</option>
          <option value="villa">Villa</option>
          <option value="land">Arsa</option>
          <option value="commercial">Ticari</option>
        </select>
      </div>
      <div class="field"><label>İlan tipi</label>
        <select name="status">
          <option value="sale">Satılık</option>
          <option value="rent">Kiralık</option>
        </select>
      </div>
      <div class="field"><label>Fiyat</label><input name="price" type="number" min="0"></div>
      <div class="field"><label>Para birimi</label>
        <select name="currency"><option>TRY</option><option>EUR</option><option>USD</option></select>
      </div>
      <div class="field"><label>Oda</label><input name="rooms" placeholder="2+1"></div>
      <div class="field"><label>Alan (m²)</label><input name="area" type="number" step="0.1"></div>
      <div class="field"><label>Kat</label><input name="floor" placeholder="3 / 6"></div>
    </div>
    <div class="field"><label>Açıklama</label><textarea name="description" rows="5"></textarea></div>
    <div class="form-grid">
      <div class="field"><label>Kapak görseli</label><input name="image" type="file" accept="image/*"></div>
      <div class="field"><label>veya kapak URL</label><input name="image_url"></div>
    </div>
    <div class="field"><label>Ek galeri görselleri</label><input name="gallery" type="file" accept="image/*" multiple></div>
    <div class="field"><label>Ek görsel URL (satır satır)</label><textarea name="gallery_urls" rows="3"></textarea></div>
    <label class="consent"><input type="checkbox" name="featured" value="1"> Öne çıkar</label>
    <label class="consent"><input type="checkbox" name="published" value="1" checked> Sitede yayınla</label>
  `;

  async function api(url, opts) {
    const res = await fetch(url, opts);
    if (res.status === 401) { location.href = "/admin/login"; throw new Error("auth"); }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Hata");
    return data;
  }

  async function load() {
    const stats = await api("/api/admin/stats");
    $("#stats").textContent = `${stats.tenders} ihale · ${stats.listings} emlak ilanı`;
    rows = await api(tab === "tenders" ? "/api/admin/tenders" : "/api/admin/listings");
    renderTable();
  }

  function renderTable() {
    $("#title").textContent = tab === "tenders" ? "İhaleler" : "Emlaklar";
    if (!rows.length) {
      $("#table").innerHTML = `<div class="empty"><p>Kayıt yok. Yeni kayıt ekleyin.</p></div>`;
      return;
    }
    if (tab === "tenders") {
      $("#table").innerHTML = `<table class="admin-table">
        <thead><tr><th>Önce / Sonra</th><th>Başlık</th><th>Konum</th><th>Yıl</th><th></th></tr></thead>
        <tbody>${rows.map(r => `<tr>
          <td><div class="thumbs"><img src="${r.beforeImage}" alt=""><img src="${r.afterImage}" alt=""></div></td>
          <td><strong>${r.title}</strong></td>
          <td>${r.location || "—"}</td>
          <td>${r.year || "—"}</td>
          <td class="nowrap">
            <button type="button" data-edit="${r.dbId}">Düzenle</button>
            <button type="button" data-del="${r.dbId}" class="danger">Sil</button>
          </td>
        </tr>`).join("")}</tbody></table>`;
    } else {
      $("#table").innerHTML = `<table class="admin-table">
        <thead><tr><th>Görsel</th><th>Başlık</th><th>Durum</th><th>Fiyat</th><th></th></tr></thead>
        <tbody>${rows.map(r => `<tr>
          <td><img class="thumb" src="${r.image}" alt=""></td>
          <td><strong>${r.title}</strong><br><small>${r.location}</small></td>
          <td>${r.status === "rent" ? "Kiralık" : "Satılık"} · ${r.type}</td>
          <td>${r.price != null ? Number(r.price).toLocaleString("tr-TR") + " " + r.currency : "—"}</td>
          <td class="nowrap">
            <button type="button" data-edit="${r.dbId}">Düzenle</button>
            <button type="button" data-del="${r.dbId}" class="danger">Sil</button>
          </td>
        </tr>`).join("")}</tbody></table>`;
    }
  }

  function openModal(row) {
    editing = row;
    $("#modalTitle").textContent = row ? "Kaydı düzenle" : "Yeni kayıt";
    $("#fields").innerHTML = tab === "tenders" ? tenderFields() : listingFields();
    $("#formErr").hidden = true;
    const f = $("#form");
    if (row && tab === "tenders") {
      f.title.value = row.title;
      f.location.value = row.location || "";
      f.year.value = row.year || "";
      f.description.value = row.description || "";
      f.before_url.value = row.beforeImage || "";
      f.after_url.value = row.afterImage || "";
      f.published.checked = row.published !== false;
    }
    if (row && tab === "listings") {
      f.title.value = row.title;
      f.location.value = row.location || "";
      f.type.value = row.type;
      f.status.value = row.status;
      f.price.value = row.price || "";
      f.currency.value = row.currency || "TRY";
      f.rooms.value = row.rooms || "";
      f.area.value = row.area || "";
      f.floor.value = row.floor || "";
      f.description.value = row.description || "";
      f.image_url.value = row.image || "";
      f.gallery_urls.value = (row.gallery || []).join("\n");
      f.featured.checked = !!row.featured;
      f.published.checked = row.published !== false;
    }
    $("#modal").showModal();
  }

  document.querySelectorAll("[data-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      tab = btn.dataset.tab;
      document.querySelectorAll("[data-tab]").forEach((b) => b.classList.toggle("on", b === btn));
      load();
    });
  });

  $("#newBtn").addEventListener("click", () => openModal(null));
  $("#cancel").addEventListener("click", () => $("#modal").close());

  $("#table").addEventListener("click", async (e) => {
    const edit = e.target.closest("[data-edit]");
    const del = e.target.closest("[data-del]");
    if (edit) {
      const row = rows.find((r) => String(r.dbId) === edit.dataset.edit);
      openModal(row);
    }
    if (del && confirm("Bu kaydı silmek istiyor musunuz?")) {
      const path = tab === "tenders" ? "/api/admin/tenders/" : "/api/admin/listings/";
      await api(path + del.dataset.del, { method: "DELETE" });
      load();
    }
  });

  $("#form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const err = $("#formErr");
    err.hidden = true;
    const fd = new FormData(e.target);
    if (!e.target.published.checked) fd.set("published", "0");
    else fd.set("published", "1");
    if (tab === "listings") fd.set("featured", e.target.featured.checked ? "1" : "0");
    const base = tab === "tenders" ? "/api/admin/tenders" : "/api/admin/listings";
    try {
      await api(editing ? `${base}/${editing.dbId}` : base, {
        method: editing ? "PUT" : "POST",
        body: fd
      });
      $("#modal").close();
      load();
    } catch (ex) {
      err.textContent = ex.message;
      err.hidden = false;
    }
  });

  $("#logout").addEventListener("click", async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    location.href = "/admin/login";
  });

  load().catch(() => { location.href = "/admin/login"; });
})();
