import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getListings, getProjects, getTenders } from "../api";
import { ListingCard, ProjectCard, TenderCard } from "../components/Cards";
import { stats } from "../data";
import { useCatalog } from "../hooks/useCatalog";
import { getContent } from "../i18n/content";
import { getPages } from "../i18n/pages";
import { useI18n } from "../i18n/I18nProvider";
import { useCountUp, useReveal } from "../hooks";
import { Icon } from "../icons";

const HERO = [
  "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1800&q=80",
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1800&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=80"
];

export default function Home() {
  const nav = useNavigate();
  const reveal = useReveal();
  const count = useCountUp();
  const { lang, t } = useI18n();
  const { locationOptions } = useCatalog();
  const c = getContent(lang);
  const pg = getPages(lang);
  const h = pg.home;
  const [slide, setSlide] = useState(0);
  const [tenders, setTenders] = useState([]);
  const [listings, setListings] = useState([]);
  const [projects, setProjects] = useState([]);
  const [ti, setTi] = useState(0);

  useEffect(() => {
    getTenders().then((d) => setTenders(d.slice(0, 2)));
    getProjects().then(setProjects);
    getListings("?status=sale").then((d) => setListings(d.slice(0, 4)));
  }, []);

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % HERO.length), 6000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTi((i) => (i + 1) % pg.reviews.length), 7000);
    return () => clearInterval(t);
  }, [pg.reviews.length]);

  const ongoing = projects.filter((p) => p.status === "ongoing").slice(0, 4);

  const search = (e) => {
    e.preventDefault();
    const q = new URLSearchParams(new FormData(e.target));
    [...q.keys()].forEach((k) => { if (!q.get(k)) q.delete(k); });
    nav("/projeler" + (q.toString() ? "?" + q : ""));
  };

  return (
    <div ref={(n) => { reveal.current = n; count.current = n; }}>
      <section className="hero" data-hero>
        {HERO.map((src, i) => (
          <div key={src} className={`hero__slide ${i === slide ? "active" : ""}`}><img src={src} alt={pg.heroAlts[i] || ""} /></div>
        ))}
        <div className="container hero__in">
          <span className="hero__badge"><span className="dot" /> {t("home.badge")}</span>
          <h1>{t("home.title1")}<br /><em>{t("home.title2")}</em> {t("home.title3")}</h1>
          <p className="lead">{t("home.lead")}</p>
          <div className="hero__actions">
            <Link className="btn btn--gold" to="/projeler">{t("home.ctaProjects")} <Icon name="arrow" /></Link>
            <Link className="btn btn--ghost-light" to="/iletisim#teklif">{t("home.ctaQuote")}</Link>
          </div>
          <form className="search" onSubmit={search}>
            <div className="field">
              <label htmlFor="s-loc">{t("common.location")}</label>
              <select id="s-loc" name="loc"><option value="">{t("common.all")}</option>{locationOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
            </div>
            <div className="field">
              <label htmlFor="s-status">{t("home.stage")}</label>
              <select id="s-status" name="status">
                <option value="">{t("common.all")}</option>
                <option value="ongoing">{t("home.ongoing")}</option>
                <option value="completed">{t("home.completed")}</option>
                <option value="soon">{t("home.soon")}</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="s-type">{t("home.type")}</label>
              <select id="s-type" name="type">
                <option value="">{t("common.all")}</option>
                <option value="residence">{pg.types.residence}</option>
                <option value="villa">{pg.types.villa}</option>
                <option value="apartment">{pg.types.apartment}</option>
                <option value="commercial">{pg.types.commercial}</option>
              </select>
            </div>
            <button className="btn btn--dark" type="submit"><Icon name="search" /> {t("common.search")}</button>
          </form>
        </div>
        <div className="hero__nav">
          <button type="button" aria-label={pg.prev} onClick={() => setSlide((s) => (s - 1 + HERO.length) % HERO.length)}><Icon name="arrowL" /></button>
          <button type="button" aria-label={pg.next} onClick={() => setSlide((s) => (s + 1) % HERO.length)}><Icon name="arrow" /></button>
        </div>
        <div className="hero__dots">
          {HERO.map((_, i) => <button key={i} className={i === slide ? "active" : ""} aria-label={`${pg.slide} ${i + 1}`} onClick={() => setSlide(i)} />)}
        </div>
      </section>

      <section className="stats">
        <div className="container stats__grid">
          {stats.map((s, i) => (
            <div className="stat" key={c.stats[i] || s.label}><strong data-count={s.value} data-suffix={s.suffix}>0</strong><span>{c.stats[i] || s.label}</span></div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head reveal">
            <div><span className="eyebrow">{h.projectsEyebrow}</span><h2>{h.projectsTitle}</h2><p>{h.projectsLead}</p></div>
            <Link className="link" to="/projeler?status=ongoing">{t("common.seeAll")} <Icon name="arrow" /></Link>
          </div>
          <div className="grid grid--4">{ongoing.map((p) => <ProjectCard key={p.id} p={p} />)}</div>
        </div>
      </section>

      <section className="section section--cream">
        <div className="container">
          <div className="section-head reveal">
            <div><span className="eyebrow">{h.salesEyebrow}</span><h2>{h.salesTitle}</h2><p>{h.salesLead}</p></div>
            <Link className="link" to="/emlaklar">{h.salesAll} <Icon name="arrow" /></Link>
          </div>
          <div className="grid grid--4">{listings.map((p) => <ListingCard key={p.id} p={p} />)}</div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head reveal">
            <div><span className="eyebrow">{h.tendersEyebrow}</span><h2>{h.tendersTitle}</h2><p>{h.tendersLead}</p></div>
            <Link className="link" to="/ihaleler">{h.tendersAll} <Icon name="arrow" /></Link>
          </div>
          <div className="grid grid--2">{tenders.map((t) => <TenderCard key={t.id} t={t} />)}</div>
        </div>
      </section>

      <section className="section">
        <div className="container welcome">
          <div className="welcome__text reveal">
            <span className="eyebrow">{h.welcomeEyebrow}</span>
            <h2>{h.welcomeTitle}</h2>
            <p>{h.welcomeP1}</p>
            <p>{h.welcomeP2}</p>
            <Link className="link" to="/hakkimizda">{h.welcomeLink} <Icon name="arrow" /></Link>
          </div>
          <aside className="site-card reveal">
            <div className="site-card__head"><span className="dot" /> {h.siteHead}</div>
            <ul>
              <li><span>{h.site1}</span><strong>4</strong></li>
              <li><span>{h.site2}</span><strong>21.400 m²</strong></li>
              <li><span>{h.site3}</span><strong>86</strong></li>
              <li><span>{h.site4}</span><strong>Lapta · 2026 Q4</strong></li>
            </ul>
            <Link className="btn btn--gold btn--sm" to="/projeler?status=ongoing">{h.siteCta} <Icon name="arrow" /></Link>
          </aside>
        </div>
      </section>

      <section className="section section--cream">
        <div className="container">
          <div className="section-head reveal">
            <div><span className="eyebrow">{c.servicesHome.eyebrow}</span><h2>{c.servicesHome.title}</h2></div>
            <Link className="link" to="/hizmetler">{t("common.seeAll")} <Icon name="arrow" /></Link>
          </div>
          <div className="grid grid--3">
            {c.services.map((s, i) => (
              <Link key={s.title} className="service reveal" to={`/hizmetler#hizmet-${i + 1}`}>
                <div className="service__icon"><Icon name={s.icon} /></div>
                <h3>{s.title}</h3><p>{s.text}</p>
                <span className="link">{c.homeExtra.details} <Icon name="arrow" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--dark">
        <div className="container">
          <div className="section-head center reveal" style={{ justifyContent: "center", textAlign: "center" }}>
            <div><span className="eyebrow eyebrow--light">{c.servicesPage.howEyebrow}</span><h2>{c.servicesPage.howTitle}</h2></div>
          </div>
          <div className="process">
            {c.process.map((step) => <div className="step reveal" key={step.step}><div className="step__num">{step.step}</div><h3>{step.title}</h3><p>{step.text}</p></div>)}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container why">
          <div className="why__media reveal">
            <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1000&q=80" alt={pg.siteAlt} />
            <div className="why__badge"><strong>17+</strong><span>{h.years}</span></div>
          </div>
          <div className="reveal">
            <span className="eyebrow">{h.whyEyebrow}</span>
            <h2>{h.whyTitle}</h2>
            <p className="muted">{h.whyLead}</p>
            <div className="features">
              {h.features.map((f) => (
                <div className="feature" key={f.title}><div className="feature__icon"><Icon name={f.icon} /></div><div><h4>{f.title}</h4><p>{f.text}</p></div></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section section--cream">
        <div className="container">
          <div className="section-head center reveal" style={{ justifyContent: "center", textAlign: "center" }}>
            <div><span className="eyebrow">{h.reviewsEyebrow}</span><h2>{h.reviewsTitle}</h2></div>
          </div>
          <div className="testi-wrap reveal">
            <div className="testi__track" style={{ transform: `translateX(-${ti * 100}%)` }}>
              {pg.reviews.map((item) => (
                <figure className="testi" key={item.name}>
                  <div className="testi__stars">{[1, 2, 3, 4, 5].map((n) => <Icon key={n} name="star" />)}</div>
                  <blockquote>“{item.text}”</blockquote>
                  <figcaption><strong>{item.name}</strong><span>{item.role}</span></figcaption>
                </figure>
              ))}
            </div>
            <div className="testi__dots">
              {pg.reviews.map((_, i) => <button key={i} className={i === ti ? "active" : ""} onClick={() => setTi(i)} />)}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
