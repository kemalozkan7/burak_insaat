import { Link } from "react-router-dom";
import { fmtMoney, listingTypes, statusLabels } from "../data";
import { useCatalog } from "../hooks/useCatalog";
import { localizeDelivery } from "../i18n/pages";
import { useI18n } from "../i18n/I18nProvider";
import { Icon } from "../icons";
import BeforeAfter from "./BeforeAfter";

export function ProjectCard({ p }) {
  const { lang, t, tx } = useI18n();
  const title = tx(p, "title") || p.title;
  const location = tx(p, "location") || p.location;
  const blurb = tx(p, "summary") || p.summary || "";
  return (
    <article className="card reveal">
      <Link className="card__media" to={`/projeler/${p.id}`}>
        <img src={p.image} alt={title} loading="lazy" />
        <span className={`badge badge--${p.status}`}>{t(`status.${p.status}`) || statusLabels[p.status] || p.status}</span>
      </Link>
      <div className="card__body">
        <span className="card__loc"><Icon name="pin" /> {location}</span>
        <h3><Link to={`/projeler/${p.id}`}>{title}</Link></h3>
        {blurb ? <p className="tender-card__excerpt">{blurb.slice(0, 120)}{blurb.length > 120 ? "…" : ""}</p> : null}
        <ul className="specs">
          <li><Icon name="building" /> {p.units || "—"}</li>
          <li><Icon name="layers" /> {p.floors || "—"}</li>
          <li><Icon name="bed" /> {p.rooms || "—"}</li>
        </ul>
        {p.status === "ongoing" ? (
          <>
            <div className="progress" title={`%${p.progress || 0}`}><span style={{ width: (p.progress || 0) + "%" }} /></div>
            <div className="progress__meta"><span>{t("home.ongoing")}</span><strong>%{p.progress || 0}</strong></div>
          </>
        ) : (
          <div className="progress__meta"><span>{p.status === "soon" ? t("home.soon") : t("home.completed")}</span><strong>{localizeDelivery(p.delivery, lang) || "—"}</strong></div>
        )}
        <Link className="link" to={`/projeler/${p.id}`}>{t("projects.view")} <Icon name="arrow" /></Link>
      </div>
    </article>
  );
}

export function ListingCard({ p }) {
  const { labelOf } = useCatalog();
  const { t, tx } = useI18n();
  const title = tx(p, "title") || p.title;
  const location = tx(p, "location") || p.location;
  return (
    <article className="card reveal">
      <Link className="card__media" to={`/emlaklar/${p.id}`}>
        <img src={p.image} alt={title} loading="lazy" />
        <span className={`badge badge--${p.status}`}>{t(`status.${p.status}`) || p.status}</span>
        <span className="card__price">{fmtMoney(p.price, p.currency)}</span>
      </Link>
      <div className="card__body">
        <span className="card__loc"><Icon name="pin" /> {location}</span>
        <h3><Link to={`/emlaklar/${p.id}`}>{title}</Link></h3>
        <ul className="specs">
          <li><Icon name="bed" /> {labelOf("rooms", p.rooms) || p.rooms || "—"}</li>
          <li><Icon name="area" /> {p.area ? Number(p.area).toLocaleString("tr-TR") + " m²" : "—"}</li>
          <li><Icon name="layers" /> {labelOf("listing_type", p.type) || listingTypes[p.type] || p.type}</li>
        </ul>
        <Link className="link" to={`/emlaklar/${p.id}`}>{p.status === "rent" ? t("listings.viewRent") : t("listings.viewSale")} <Icon name="arrow" /></Link>
      </div>
    </article>
  );
}

export function TenderCard({ t: item }) {
  const { t, tx } = useI18n();
  const title = tx(item, "title") || item.title;
  const location = tx(item, "location") || item.location || "";
  const description = tx(item, "description") || item.description || "";
  return (
    <article className="tender-card reveal">
      <div className="tender-card__media">
        <BeforeAfter before={item.beforeImage} after={item.afterImage} title={title} />
      </div>
      <div className="card__body">
        <span className="card__loc"><Icon name="pin" /> {location} {item.year ? "· " + item.year : ""}</span>
        <h3><Link to={`/ihaleler/${item.id}`}>{title}</Link></h3>
        <p className="tender-card__excerpt">{description.slice(0, 140)}{description.length > 140 ? "…" : ""}</p>
        <Link className="link" to={`/ihaleler/${item.id}`}>{t("tenders.view")} <Icon name="arrow" /></Link>
      </div>
    </article>
  );
}

export function PageHero({ title, text, crumb, img }) {
  const { t } = useI18n();
  return (
    <section className="page-hero">
      <img src={img} alt="" />
      <div className="container">
        <div className="crumbs"><Link to="/">{t("nav.home")}</Link><span>{crumb || title}</span></div>
        <h1>{title}</h1>
        {text && <p>{text}</p>}
      </div>
    </section>
  );
}

export function InquiryForm({ kind, refSlug, preset = "", setToast }) {
  const { t } = useI18n();
  const onSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await (await import("../api")).postInquiry({
        kind,
        name: fd.get("name"),
        phone: fd.get("phone"),
        email: fd.get("email") || "",
        message: fd.get("message") || "",
        ref_slug: refSlug || ""
      });
      e.target.reset();
      setToast?.(t("inquiry.success"));
    } catch {
      setToast?.(t("inquiry.fail"));
    }
  };
  return (
    <form onSubmit={onSubmit}>
      <div className="field"><label>{t("common.name")}</label><input name="name" required /></div>
      <div className="field"><label>{t("common.phone")}</label><input name="phone" required /></div>
      <div className="field"><label>{t("common.message")}</label><textarea name="message" defaultValue={preset} /></div>
      <button className="btn btn--gold btn--block" type="submit">{t("common.send")}</button>
    </form>
  );
}
