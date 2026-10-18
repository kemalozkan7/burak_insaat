import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getProjects } from "../api";
import { PageHero, ProjectCard } from "../components/Cards";
import { useCatalog } from "../hooks/useCatalog";
import { getPages } from "../i18n/pages";
import { useI18n } from "../i18n/I18nProvider";
import { useReveal } from "../hooks";
import { Icon } from "../icons";

export default function Projects() {
  const [sp, setSp] = useSearchParams();
  const reveal = useReveal();
  const { lang, t } = useI18n();
  const pg = getPages(lang);
  const { locationOptions } = useCatalog();
  const [all, setAll] = useState([]);
  const f = {
    q: sp.get("q") || "",
    loc: sp.get("loc") || "",
    status: sp.get("status") || "",
    type: sp.get("type") || ""
  };
  const set = (k, v) => {
    const n = new URLSearchParams(sp);
    if (v) n.set(k, v); else n.delete(k);
    setSp(n, { replace: true });
  };

  useEffect(() => { getProjects().then(setAll); }, []);

  const list = useMemo(() => all.filter((p) =>
    (!f.q || (p.title + " " + (p.code || "")).toLowerCase().includes(f.q.toLowerCase())) &&
    (!f.loc || p.location === f.loc) &&
    (!f.status || p.status === f.status) &&
    (!f.type || p.type === f.type)
  ), [all, f.q, f.loc, f.status, f.type]);

  return (
    <div ref={reveal}>
      <PageHero title={t("projects.title")} crumb={t("projects.crumb")} text={t("projects.intro")} img="https://images.unsplash.com/photo-1429497419816-9ca5cfb4571a?auto=format&fit=crop&w=1800&q=80" />
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <form className="filters" onSubmit={(e) => e.preventDefault()}>
            <div className="field"><label>{t("common.search")}</label><input value={f.q} onChange={(e) => set("q", e.target.value)} placeholder={t("projects.searchPh")} /></div>
            <div className="field"><label>{t("common.location")}</label>
              <select value={f.loc} onChange={(e) => set("loc", e.target.value)}><option value="">{t("common.all")}</option>{locationOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
            </div>
            <div className="field"><label>{t("projects.stage")}</label>
              <select value={f.status} onChange={(e) => set("status", e.target.value)}>
                <option value="">{t("common.all")}</option>
                <option value="ongoing">{t("home.ongoing")}</option>
                <option value="completed">{t("home.completed")}</option>
                <option value="soon">{t("home.soon")}</option>
              </select>
            </div>
            <div className="field"><label>{t("projects.type")}</label>
              <select value={f.type} onChange={(e) => set("type", e.target.value)}>
                <option value="">{t("common.all")}</option>
                <option value="residence">{pg.types.residence}</option>
                <option value="villa">{pg.types.villa}</option>
                <option value="apartment">{pg.types.apartment}</option>
                <option value="commercial">{pg.types.commercial}</option>
              </select>
            </div>
            <button className="btn btn--ghost" type="button" onClick={() => setSp({}, { replace: true })}>{t("common.clear")}</button>
          </form>
          <div className="results-bar">
            <div><strong>{list.length}</strong> {t("projects.count")}</div>
            <div className="chips">
              {[["", t("listings.allChip")], ["ongoing", t("home.ongoing")], ["completed", t("home.completed")], ["soon", t("home.soon")]].map(([v, l]) => (
                <button key={v || "all"} type="button" className={`chip ${f.status === v ? "active" : ""}`} onClick={() => set("status", v)}>{l}</button>
              ))}
            </div>
          </div>
          <div className="grid grid--3">
            {list.length ? list.map((p) => <ProjectCard key={p.id} p={p} />) : (
              <div className="empty"><Icon name="search" /><h3>{pg.project.emptyTitle}</h3><p>{pg.project.emptyText} <Link className="link" to="/iletisim">{pg.project.emptyLink}</Link>.</p></div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
