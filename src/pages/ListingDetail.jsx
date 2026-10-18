import { useEffect, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import { getListing, getListings } from "../api";
import { InquiryForm, ListingCard } from "../components/Cards";
import MapSection from "../components/MapSection";
import PhotoViewer from "../components/PhotoViewer";
import { fmtMoney } from "../data";
import { useCatalog } from "../hooks/useCatalog";
import { getPages } from "../i18n/pages";
import { useI18n } from "../i18n/I18nProvider";
import { useReveal } from "../hooks";
import { Icon } from "../icons";

export default function ListingDetail() {
  const { id } = useParams();
  const { setToast } = useOutletContext();
  const reveal = useReveal();
  const { t, tx } = useI18n();
  const { catalog, labelOf } = useCatalog();
  const [p, setP] = useState(null);
  const [related, setRelated] = useState([]);
  const [img, setImg] = useState(0);
  const [open, setOpen] = useState(false);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    setImg(0);
    setOpen(false);
    getListing(id).then((d) => { if (!d) setMissing(true); else setP(d); });
    getListings().then((all) => setRelated(all.filter((x) => x.id !== id).slice(0, 3)));
  }, [id]);

  if (missing) return <div className="section"><div className="container empty"><Icon name="home" /><p>{t("common.notFound")}</p></div></div>;
  if (!p) return null;
  const gallery = p.gallery?.length ? p.gallery : [p.image];
  const title = tx(p, "title") || p.title;
  const location = tx(p, "location") || p.location;
  const description = tx(p, "description") || p.description;

  return (
    <div ref={reveal}>
      <section className="section" style={{ paddingTop: "2rem" }}>
        <div className="container">
          <div className="crumbs" style={{ color: "var(--muted)" }}><Link to="/">{t("nav.home")}</Link><span><Link to="/emlaklar">{t("nav.listings")}</Link></span><span>{title}</span></div>
          <div className="detail">
            <div>
              <div className="gallery__main">
                <button type="button" className="gallery__open" onClick={() => setOpen(true)} aria-label="Zoom">
                  <img key={gallery[img]} src={gallery[img]} alt={title} />
                </button>
                <span className={`badge badge--${p.status}`}>{t(`status.${p.status}`)}</span>
                <span className="gallery__count"><Icon name="camera" /> {img + 1} / {gallery.length}</span>
              </div>
              {open && (
                <PhotoViewer
                  images={gallery}
                  index={img}
                  title={title}
                  onClose={() => setOpen(false)}
                  onIndex={setImg}
                />
              )}
              <div className="gallery__thumbs">
                {gallery.map((g, i) => (
                  <button key={g + i} type="button" className={i === img ? "active" : ""} onClick={() => setImg(i)}><img src={g} alt="" /></button>
                ))}
              </div>
              <div className="detail__title">
                <div>
                  <span className="card__loc"><Icon name="pin" /> {location}</span>
                  <h1>{title}</h1>
                </div>
                <div className="detail__price"><strong>{fmtMoney(p.price, p.currency)}</strong><span>{p.status === "rent" ? t("listings.monthly") : t("listings.salePrice")}</span></div>
              </div>
              <div className="spec-grid">
                {[
                  ["bed", t("specs.rooms"), labelOf("rooms", p.rooms) || p.rooms],
                  ["area", t("specs.area"), p.area ? p.area.toLocaleString("tr-TR") + " m²" : ""],
                  ["layers", t("specs.floor"), labelOf("floor", p.floor) || p.floor],
                  ["home", t("specs.type"), labelOf("listing_type", p.type) || p.type],
                  ["home", t("specs.bathrooms"), labelOf("bathrooms", p.bathrooms) || p.bathrooms],
                  ["compass", t("specs.heating"), labelOf("heating", p.heating) || p.heating],
                  ["building", t("specs.furnished"), labelOf("furnished", p.furnished) || p.furnished],
                  ["pin", t("specs.parking"), labelOf("parking", p.parking) || p.parking],
                  ["layers", t("specs.balcony"), labelOf("balcony", p.balcony) || p.balcony],
                  ["shield", t("specs.deed"), labelOf("deed", p.deed) || p.deed],
                  ["clock", t("specs.buildingAge"), labelOf("building_age", p.buildingAge) || p.buildingAge],
                  ["handshake", t("specs.dues"), p.dues],
                  ["handshake", t("specs.deposit"), p.deposit]
                ].filter(([, , v]) => v).map(([icon, lab, val]) => (
                  <div className="spec" key={lab}><Icon name={icon} /><div><small>{lab}</small><strong>{val}</strong></div></div>
                ))}
              </div>
              {p.amenities?.length ? (
                <ul className="amenity-list">
                  {p.amenities.map((a) => (
                    <li key={a}>{labelOf("amenity", a) || (catalog.amenity || []).find((x) => x.value === a)?.label || a}</li>
                  ))}
                </ul>
              ) : null}
              <h2>{p.status === "rent" ? t("listings.rentTitle") : t("listings.saleTitle")}</h2>
              <p className="detail__text">{description}</p>
            </div>
            <aside className="sidebar">
              <div className="panel">
                <h3>{p.status === "rent" ? t("listings.rentForm") : t("listings.buyForm")}</h3>
                <InquiryForm kind="listing" refSlug={p.id} preset={(p.status === "rent" ? getPages(lang).rentPreset : getPages(lang).buyPreset).replace("{title}", title)} setToast={setToast} />
              </div>
            </aside>
          </div>
        </div>
      </section>
      <MapSection mapQuery={p.mapQuery} location={location} title={t("listings.mapTitle")} />
      <section className="section">
        <div className="container">
          <div className="section-head"><div><span className="eyebrow">{t("listings.other")}</span><h2>{t("listings.related")}</h2></div><Link className="link" to="/emlaklar">{t("common.seeAll")} <Icon name="arrow" /></Link></div>
          <div className="grid grid--3">{related.map((x) => <ListingCard key={x.id} p={x} />)}</div>
        </div>
      </section>
    </div>
  );
}
