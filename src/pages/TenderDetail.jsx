import { useEffect, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import { getTender, getTenders } from "../api";
import BeforeAfter from "../components/BeforeAfter";
import { InquiryForm, TenderCard } from "../components/Cards";
import MapSection from "../components/MapSection";
import { getPages } from "../i18n/pages";
import { useI18n } from "../i18n/I18nProvider";
import { useReveal } from "../hooks";
import { Icon } from "../icons";

function captionAt(item, lang, index) {
  if (lang === "tr") return "";
  const raw = item.i18n?.[lang]?.captions;
  if (typeof raw !== "string" || !raw.trim()) return "";
  return raw.split("\n")[index]?.trim() || "";
}

export default function TenderDetail() {
  const { id } = useParams();
  const { setToast } = useOutletContext();
  const { lang, t, tx } = useI18n();
  const d = getPages(lang).tender;
  const reveal = useReveal();
  const [item, setItem] = useState(null);
  const [related, setRelated] = useState([]);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    getTender(id).then((d) => {
      if (!d) setMissing(true);
      else setItem(d);
    });
    getTenders().then((all) => setRelated(all.filter((t) => t.id !== id).slice(0, 2)));
  }, [id]);

  if (missing) {
    return <div className="section"><div className="container empty"><Icon name="layers" /><p>{d.missing}</p><Link className="link" to="/ihaleler">{d.back}</Link></div></div>;
  }
  if (!item) return null;
  const title = tx(item, "title") || item.title;
  const location = tx(item, "location") || item.location;
  const description = tx(item, "description") || item.description;

  return (
    <div ref={reveal}>
      <section className="section" style={{ paddingTop: "2rem" }}>
        <div className="container">
          <div className="crumbs" style={{ color: "var(--muted)" }}><Link to="/">{t("nav.home")}</Link><span><Link to="/ihaleler">{t("nav.tenders")}</Link></span><span>{title}</span></div>
          <div className="detail detail--tender">
            <div>
              <BeforeAfter before={item.beforeImage} after={item.afterImage} title={title} xl />
              <div className="detail__title">
                <div>
                  <span className="card__loc"><Icon name="pin" /> {location} {item.year ? "· " + item.year : ""}</span>
                  <h1>{title}</h1>
                </div>
              </div>
              <h2>{t("tenders.title")}</h2>
              <p className="detail__text">{description}</p>
              {item.photos && item.photos.length > 0 && (
                <div className="tender-shots">
                  <h2>{d.photos}</h2>
                  {item.photos.map((p, i) => {
                    const after = p.afterImage || p.image;
                    const caption = captionAt(item, lang, i) || p.caption;
                    return (
                      <figure key={p.id || after}>
                        {p.beforeImage && after ? (
                          <BeforeAfter before={p.beforeImage} after={after} title={caption || title} xl />
                        ) : (
                          <img src={after || p.beforeImage} alt={caption || title} />
                        )}
                        {caption ? <figcaption>{caption}</figcaption> : null}
                      </figure>
                    );
                  })}
                </div>
              )}
            </div>
            <aside className="sidebar">
              <div className="panel">
                <h3>{d.ask}</h3>
                <InquiryForm kind="tender" refSlug={item.id} setToast={setToast} />
              </div>
            </aside>
          </div>
        </div>
      </section>
      <MapSection mapQuery={item.mapQuery} location={location} title={t("tenders.mapTitle")} />
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div><span className="eyebrow">{t("nav.tenders")}</span><h2>{t("tenders.title")}</h2></div>
            <Link className="link" to="/ihaleler">{t("common.seeAll")} <Icon name="arrow" /></Link>
          </div>
          <div className="grid grid--2">{related.map((t) => <TenderCard key={t.id} t={t} />)}</div>
        </div>
      </section>
    </div>
  );
}
