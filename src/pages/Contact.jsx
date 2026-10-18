import { useOutletContext } from "react-router-dom";
import { postInquiry } from "../api";
import { PageHero } from "../components/Cards";
import { company, whatsappLink } from "../data";
import { useCatalog } from "../hooks/useCatalog";
import { getPages } from "../i18n/pages";
import { useI18n } from "../i18n/I18nProvider";
import { useReveal } from "../hooks";
import { Icon } from "../icons";

export default function Contact() {
  const { setToast } = useOutletContext();
  const reveal = useReveal();
  const { lang, t } = useI18n();
  const budgets = getPages(lang).budgets;
  const { locationOptions } = useCatalog();

  const submit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await postInquiry({
        kind: "contact",
        name: fd.get("name"),
        phone: fd.get("phone"),
        email: fd.get("email"),
        message: `${fd.get("topic")} · ${fd.get("loc") || "—"} · ${fd.get("budget") || "—"}\n${fd.get("msg") || ""}`
      });
      e.target.reset();
      setToast(t("contact.success"));
    } catch {
      setToast(t("contact.fail"));
    }
  };

  const cards = [
    ["phone", t("common.phone"), <a href={`tel:${company.phoneRaw}`}>{company.phone}</a>],
    ["mail", t("common.email"), <a href={`mailto:${company.email}`}>{company.email}</a>],
    ["pin", t("contact.address"), <p>{company.address}</p>],
    ["clock", t("contact.hours"), <p>{getPages(lang).hours}</p>]
  ];

  return (
    <div ref={reveal}>
      <PageHero title={t("contact.title")} crumb={t("contact.crumb")} text={t("contact.intro")} img="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1800&q=80" />
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="contact-cards">
            {cards.map(([i, label, v]) => (
              <div className="contact-card reveal" key={label}><div className="feature__icon"><Icon name={i} /></div><h4>{label}</h4>{v}</div>
            ))}
          </div>
        </div>
      </section>
      <section className="section section--cream" id="teklif" style={{ paddingTop: "2rem" }}>
        <div className="container contact-grid">
          <div className="panel reveal">
            <span className="eyebrow">{t("contact.freeQuote")}</span>
            <h2 style={{ fontSize: "1.6rem" }}>{t("contact.formTitle")}</h2>
            <p className="muted">{t("contact.formLead")}</p>
            <form className="form-grid" onSubmit={submit}>
              <div className="field"><label>{t("common.name")} *</label><input name="name" required /></div>
              <div className="field"><label>{t("common.phone")} *</label><input name="phone" type="tel" required placeholder="+90 5__ ___ __ __" /></div>
              <div className="field"><label>{t("common.email")}</label><input name="email" type="email" /></div>
              <div className="field">
                <label>{t("contact.topic")} *</label>
                <select name="topic" required>
                  <option value="">—</option>
                  <option>{t("contact.topics.buy")}</option>
                  <option>{t("contact.topics.land")}</option>
                  <option>{t("contact.topics.urban")}</option>
                  <option>{t("contact.topics.reno")}</option>
                  <option>{t("contact.topics.arch")}</option>
                  <option>{t("contact.topics.other")}</option>
                </select>
              </div>
              <div className="field"><label>{t("common.location")}</label>
                <select name="loc"><option value="">—</option>{locationOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
              </div>
              <div className="field"><label>{t("contact.budget")}</label>
                <select name="budget"><option value="">—</option>{budgets.map((b) => <option key={b}>{b}</option>)}</select>
              </div>
              <div className="field field--full"><label>{t("contact.yourMessage")}</label><textarea name="msg" /></div>
              <label className="consent field--full"><input type="checkbox" required /> {t("contact.consent")}</label>
              <div className="field--full"><button className="btn btn--gold" type="submit">{t("contact.submit")} <Icon name="arrow" /></button></div>
            </form>
          </div>
          <div className="contact-side">
            <div className="panel panel--dark reveal">
              <h3>{t("contact.visit")}</h3>
              <p>{company.address}</p>
              <p><Icon name="clock" /> {getPages(lang).hours}</p>
              <a className="btn btn--gold btn--block" href={whatsappLink()} target="_blank" rel="noopener"><Icon name="whatsapp" /> {t("contact.wa")}</a>
            </div>
            <div className="map reveal" style={{ aspectRatio: "4/3" }}>
              <iframe src={`https://www.google.com/maps?q=${encodeURIComponent(company.mapQuery)}&output=embed`} title="Ofis konumu" loading="lazy" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
