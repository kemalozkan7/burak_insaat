import { useEffect, useMemo, useState } from "react";
import { getListings } from "../api";
import { ListingCard, PageHero } from "../components/Cards";
import { useCatalog } from "../hooks/useCatalog";
import { useI18n } from "../i18n/I18nProvider";
import { useReveal } from "../hooks";
import { Icon } from "../icons";

export default function Listings() {
  const reveal = useReveal();
  const { t, tx } = useI18n();
  const { catalog, locationOptions } = useCatalog();
  const [all, setAll] = useState([]);
  const [f, setF] = useState({ q: "", loc: "", status: "", type: "", rooms: "", sort: "featured" });
  useEffect(() => { getListings().then(setAll); }, []);
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const rows = useMemo(() => {
    const list = all.filter((x) => {
      const title = tx(x, "title");
      const loc = tx(x, "location") || x.location;
      if (f.q && !(`${title} ${loc} ${x.title} ${x.location}`.toLowerCase().includes(f.q.toLowerCase()))) return false;
      if (f.loc && x.location !== f.loc) return false;
      if (f.status && x.status !== f.status) return false;
      if (f.type && x.type !== f.type) return false;
      if (f.rooms && x.rooms !== f.rooms) return false;
      return true;
    });
    if (f.sort === "price-asc") list.sort((a, b) => (a.price ?? 1e15) - (b.price ?? 1e15));
    if (f.sort === "price-desc") list.sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
    return list;
  }, [all, f, tx]);

  return (
    <div ref={reveal}>
      <PageHero title={t("listings.title")} crumb={t("listings.crumb")} text={t("listings.intro")} img="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1800&q=80" />
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <form className="filters filters--emlak" onSubmit={(e) => e.preventDefault()}>
            <div className="field"><label>{t("common.search")}</label><input value={f.q} onChange={(e) => set("q", e.target.value)} placeholder={t("listings.searchPh")} /></div>
            <div className="field"><label>{t("common.location")}</label>
              <select value={f.loc} onChange={(e) => set("loc", e.target.value)}>
                <option value="">{t("common.all")}</option>
                {locationOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="field"><label>{t("listings.status")}</label>
              <select value={f.status} onChange={(e) => set("status", e.target.value)}>
                <option value="">{t("common.all")}</option>
                <option value="sale">{t("listings.sale")}</option>
                <option value="rent">{t("listings.rent")}</option>
              </select>
            </div>
            <div className="field"><label>{t("listings.property")}</label>
              <select value={f.type} onChange={(e) => set("type", e.target.value)}>
                <option value="">{t("common.all")}</option>
                {(catalog.listing_type || []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="field"><label>{t("listings.rooms")}</label>
              <select value={f.rooms} onChange={(e) => set("rooms", e.target.value)}>
                <option value="">{t("common.all")}</option>
                {(catalog.rooms || []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <button className="btn btn--ghost" type="button" onClick={() => setF({ q: "", loc: "", status: "", type: "", rooms: "", sort: "featured" })}>{t("common.clear")}</button>
          </form>
          <div className="results-bar">
            <div><strong>{rows.length}</strong> {f.status === "sale" ? t("listings.countSale") : f.status === "rent" ? t("listings.countRent") : t("listings.countAll")}</div>
            <div className="chips">
              {[["sale", t("listings.sale")], ["rent", t("listings.rent")], ["", t("listings.allChip")]].map(([v, l]) => (
                <button key={v || "all"} type="button" className={`chip ${f.status === v ? "active" : ""}`} onClick={() => set("status", v)}>{l}</button>
              ))}
            </div>
            <div className="field" style={{ minWidth: 180 }}>
              <select value={f.sort} onChange={(e) => set("sort", e.target.value)} aria-label="Sort">
                <option value="featured">{t("listings.sortFeatured")}</option>
                <option value="price-asc">{t("listings.sortAsc")}</option>
                <option value="price-desc">{t("listings.sortDesc")}</option>
              </select>
            </div>
          </div>
          <div className="grid grid--3">
            {rows.length ? rows.map((p) => <ListingCard key={p.id} p={p} />) : <div className="empty"><Icon name="home" /><p>{t("listings.empty")}</p></div>}
          </div>
        </div>
      </section>
    </div>
  );
}
