import { useEffect, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import { getProject, getProjects } from "../api";
import { InquiryForm, ProjectCard } from "../components/Cards";
import MapSection from "../components/MapSection";
import { company, statusLabels, team, typeLabels, whatsappLink } from "../data";
import { getPages, localizeDelivery } from "../i18n/pages";
import { useI18n } from "../i18n/I18nProvider";
import { useReveal } from "../hooks";
import { Icon } from "../icons";

function featureLines(project, lang) {
  const base = project.features || [];
  if (lang === "tr") return base;
  const raw = project.i18n?.[lang]?.features;
  if (Array.isArray(raw) && raw.length) return raw;
  if (typeof raw === "string" && raw.trim()) return raw.split("\n").map((s) => s.trim()).filter(Boolean);
  return base;
}

export default function ProjectDetail() {
  const { id } = useParams();
  const { setToast } = useOutletContext();
  const { lang, t, tx } = useI18n();
  const d = getPages(lang).project;
  const types = getPages(lang).types;
  const reveal = useReveal();
  const [p, setP] = useState(null);
  const [related, setRelated] = useState([]);
  const [img, setImg] = useState(0);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    setImg(0);
    setMissing(false);
    setP(null);
    getProject(id).then((d) => { if (!d) setMissing(true); else setP(d); });
    getProjects().then((all) => setRelated(all.filter((x) => x.id !== id).slice(0, 3)));
  }, [id]);

  if (missing) {
    return <div className="section"><div className="container empty"><Icon name="building" /><p>{d.missing}</p><Link className="link" to="/projeler">{d.back}</Link></div></div>;
  }
  if (!p) return null;

  const gallery = p.gallery?.length ? p.gallery : [p.image];
  const title = tx(p, "title") || p.title;
  const location = tx(p, "location") || p.location;
  const summary = tx(p, "summary") || p.summary;
  const phases = d.phases;
  const phaseIdx = Math.min(4, Math.floor((p.progress || 0) / 20));
  return (
    <div ref={reveal}>
      <section className="section" style={{ paddingTop: "2rem" }}>
        <div className="container">
          <div className="crumbs" style={{ color: "var(--muted)" }}><Link to="/">{t("nav.home")}</Link><span><Link to="/projeler">{t("nav.projects")}</Link></span><span>{title}</span></div>
          <div className="detail">
            <div>
              <div className="gallery">
                <div className="gallery__main">
                  <img src={gallery[img]} alt={title} />
                  <span className={`badge badge--${p.status}`}>{t(`status.${p.status}`) || statusLabels[p.status] || p.status}</span>
                  <span className="gallery__count"><Icon name="camera" /> {gallery.length}</span>
                </div>
                <div className="gallery__thumbs">
                  {gallery.map((g, i) => (
                    <button key={g + i} type="button" className={i === img ? "active" : ""} onClick={() => setImg(i)}><img src={g} alt="" /></button>
                  ))}
                </div>
              </div>
              <div className="detail__title">
                <div>
                  <span className="card__loc"><Icon name="pin" /> {location} · {types[p.type] || typeLabels[p.type] || p.type}</span>
                  <h1>{title}</h1>
                  {p.code ? <span className="muted" style={{ fontSize: ".85rem" }}>{d.code}: {p.code}</span> : null}
                </div>
                <div className="detail__price"><strong>{localizeDelivery(p.delivery, lang) || d.askSchedule}</strong><span>{d.planned}</span></div>
              </div>
              <div className="spec-grid">
                <div className="spec"><Icon name="bed" /><div><small>{d.rooms}</small><strong>{p.rooms || "—"}</strong></div></div>
                <div className="spec"><Icon name="area" /><div><small>{d.area}</small><strong>{p.area ? Number(p.area).toLocaleString("tr-TR") + " m²" : "—"}</strong></div></div>
                <div className="spec"><Icon name="layers" /><div><small>{d.floors}</small><strong>{p.floors || "—"}</strong></div></div>
                <div className="spec"><Icon name="building" /><div><small>{d.units}</small><strong>{p.units || "—"}</strong></div></div>
              </div>
              {p.status === "ongoing" && (
                <div className="progress-card">
                  <div className="site-card__head"><span className="dot" /> {d.report}</div>
                  <div className="progress"><span style={{ width: (p.progress || 0) + "%" }} /></div>
                  <div className="progress__meta"><span>{d.plannedDelivery}: <strong>{localizeDelivery(p.delivery, lang) || "—"}</strong></span><strong>%{p.progress || 0} {d.done}</strong></div>
                  <div className="phase-list">{phases.map((ph, i) => <div key={ph} className={`phase ${i < phaseIdx ? "done" : i === phaseIdx ? "done now" : ""}`}><i />{ph}</div>)}</div>
                </div>
              )}
              <h2>{t("projects.title")}</h2>
              <p className="detail__text">{summary}</p>
              {p.features?.length > 0 && (
                <>
                  <h2>{d.features}</h2>
                  <ul className="amenities">{featureLines(p, lang).map((f) => <li key={f}><Icon name="check" /> {f}</li>)}</ul>
                </>
              )}
              <p className="muted">{d.salesNote} <Link className="link" to="/emlaklar">{t("nav.listings")}</Link> {d.salesIn}</p>
            </div>
            <aside className="sidebar">
              <div className="panel">
                <div className="agent">
                  <img src={team[0].img} alt={team[0].name} />
                  <div><strong>{team[0].name}</strong><span>{d.contact} · {company.phone}</span></div>
                </div>
                <h3>{d.ask}</h3>
                <InquiryForm kind="project" refSlug={p.id} preset={getPages(lang).askPreset.replace("{title}", title)} setToast={setToast} />
              </div>
              <div className="panel panel--dark">
                <h3>{d.visitTitle}</h3>
                <p>{d.visitText}</p>
                <a className="btn btn--gold btn--block" href={whatsappLink(t("footer.waPrefill"))} target="_blank" rel="noopener"><Icon name="whatsapp" /> {d.wa}</a>
                <Link className="btn btn--ghost-light btn--block" style={{ marginTop: ".6rem" }} to="/emlaklar">{d.goListings}</Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
      <MapSection mapQuery={p.mapQuery} location={location} title={t("projects.mapTitle")} />
      <section className="section">
        <div className="container">
          <div className="section-head"><div><span className="eyebrow">{d.otherEyebrow}</span><h2>{d.otherTitle}</h2></div><Link className="link" to="/projeler">{t("common.seeAll")} <Icon name="arrow" /></Link></div>
          <div className="grid grid--3">{related.map((x) => <ProjectCard key={x.id} p={x} />)}</div>
        </div>
      </section>
    </div>
  );
}
