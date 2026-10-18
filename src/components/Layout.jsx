import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { company, whatsappLink } from "../data";
import { Icon } from "../icons";
import { postInquiry } from "../api";
import { useCatalog } from "../hooks/useCatalog";
import { getPages } from "../i18n/pages";
import { useI18n } from "../i18n/I18nProvider";
import { useToast } from "../hooks";

export default function Layout() {
  const loc = useLocation();
  const { locationOptions } = useCatalog();
  const { lang, setLang, t, langs } = useI18n();
  const slogan = getPages(lang).slogan;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [top, setTop] = useState(false);
  const [toast, setToast] = useToast();

  const navItems = [
    ["/", t("nav.home")],
    ["/projeler", t("nav.projects")],
    ["/ihaleler", t("nav.tenders")],
    ["/emlaklar", t("nav.listings")],
    ["/hizmetler", t("nav.services")],
    ["/hakkimizda", t("nav.about")],
    ["/iletisim", t("nav.contact")]
  ];

  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
  }, [loc.pathname]);

  useEffect(() => {
    document.body.classList.toggle("no-scroll", open);
  }, [open]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      setTop(window.scrollY > 500);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onNewsletter = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await postInquiry({
        kind: "newsletter",
        name: "Bülten",
        phone: "-",
        email: fd.get("email"),
        message: "Bülten aboneliği"
      });
      e.target.reset();
      setToast(t("footer.subscribed"));
    } catch {
      setToast(t("inquiry.fail"));
    }
  };

  return (
    <>
      <header>
        <div className="topbar">
          <div className="container topbar__in">
            <div className="topbar__contact">
              <a href={`tel:${company.phoneRaw}`}><Icon name="phone" /><span>{company.phone}</span></a>
              <a href={`mailto:${company.email}`}><Icon name="mail" /><span>{company.email}</span></a>
              <span className="topbar__hours"><Icon name="clock" /><span>{getPages(lang).hours}</span></span>
            </div>
            <div className="topbar__right">
              <div className="socials">
                <a href={company.social.instagram} aria-label="Instagram"><Icon name="instagram" /></a>
                <a href={company.social.facebook} aria-label="Facebook"><Icon name="facebook" /></a>
                <a href={company.social.linkedin} aria-label="LinkedIn"><Icon name="linkedin" /></a>
              </div>
              <div className="lang" role="navigation" aria-label="Language">
                {langs.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    className={lang === l.code ? "active" : ""}
                    onClick={() => setLang(l.code)}
                    title={l.name}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className={`navbar ${scrolled ? "scrolled" : ""}`}>
          <div className="container navbar__in">
            <Link className="brand" to="/" aria-label={company.name}>
              <span className="brand__mark"><img src="/assets/img/logo-mark.png" alt="" onError={(e) => { e.target.style.display = "none"; }} /></span>
              <span className="brand__text"><strong>BURAK</strong><small>{getPages(lang).brand}</small></span>
            </Link>
            <nav className={`nav ${open ? "open" : ""}`}>
              {navItems.map(([to, label]) => (
                <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => (isActive ? "active" : "")}>{label}</NavLink>
              ))}
              <Link to="/iletisim#teklif" className="btn btn--gold nav__cta">{t("nav.quote")} <Icon name="arrow" /></Link>
            </nav>
            <button className="burger" aria-label={t("common.menu")} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
              <Icon name={open ? "close" : "menu"} />
            </button>
          </div>
        </div>
      </header>

      <Outlet context={{ setToast }} />

      <footer>
        <div className="footer__cta">
          <div className="container footer__cta-in">
            <div>
              <span className="eyebrow eyebrow--light">{t("footer.freeExplore")}</span>
              <h3>{t("footer.plan")}</h3>
            </div>
            <div className="footer__cta-actions">
              <Link className="btn btn--gold" to="/iletisim#teklif">{t("footer.quoteForm")} <Icon name="arrow" /></Link>
              <a className="btn btn--ghost-light" href={whatsappLink()} target="_blank" rel="noopener"><Icon name="whatsapp" /> WhatsApp</a>
            </div>
          </div>
        </div>
        <div className="container footer__grid">
          <div className="footer__brand">
            <div className="footer__logo"><img src="/assets/img/logo-full.png" alt={company.name} onError={(e) => { e.target.closest(".footer__logo").style.display = "none"; }} /></div>
            <p>{slogan} {t("footer.brandBlurb", { year: company.founded })}</p>
            <ul className="footer__contact">
              <li><Icon name="pin" /><span>{company.address}</span></li>
              <li><Icon name="phone" /><a href={`tel:${company.phoneRaw}`}>{company.phone}</a></li>
              <li><Icon name="mail" /><a href={`mailto:${company.email}`}>{company.email}</a></li>
            </ul>
          </div>
          <div>
            <h4>{t("footer.quick")}</h4>
            <ul className="footer__links">
              {navItems.map(([to, l]) => <li key={to}><Link to={to}>{l}</Link></li>)}
              <li><Link to="/ihaleler">{t("nav.tenderRestorations")}</Link></li>
              <li><Link to="/emlaklar">{t("nav.listingAds")}</Link></li>
            </ul>
          </div>
          <div>
            <h4>{t("footer.locations")}</h4>
            <ul className="footer__links">
              {locationOptions.slice(0, 6).map((o) => (
                <li key={o.value}><Link to={`/projeler?loc=${encodeURIComponent(o.value)}`}>{o.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4>{t("footer.newsletter")}</h4>
            <p className="muted-light">{t("footer.newsletterLead")}</p>
            <form className="newsletter" onSubmit={onNewsletter}>
              <input type="email" name="email" required placeholder={t("footer.emailPh")} aria-label={t("common.email")} />
              <button className="btn btn--gold" type="submit">{t("common.subscribe")}</button>
            </form>
            <div className="socials socials--footer">
              <a href={company.social.instagram} aria-label="Instagram"><Icon name="instagram" /></a>
              <a href={company.social.facebook} aria-label="Facebook"><Icon name="facebook" /></a>
              <a href={company.social.linkedin} aria-label="LinkedIn"><Icon name="linkedin" /></a>
              <a href={company.social.youtube} aria-label="YouTube"><Icon name="youtube" /></a>
            </div>
          </div>
        </div>
        <div className="footer__bottom">
          <div className="container footer__bottom-in">
            <span>© {new Date().getFullYear()} {company.name}. {t("footer.rights")}</span>
            <span className="footer__legal"><a href="#">{t("footer.kvkk")}</a><a href="#">{t("footer.cookies")}</a></span>
          </div>
        </div>
      </footer>

      <div className="floating">
        <a className="fab fab--wa" href={whatsappLink(t("footer.waPrefill"))} target="_blank" rel="noopener" aria-label="WhatsApp">
          <Icon name="whatsapp" /><span>WhatsApp</span>
        </a>
        <button className={`fab fab--top ${top ? "show" : ""}`} aria-label={getPages(lang).top} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <Icon name="up" />
        </button>
      </div>
      <div id="toast" className={toast ? "show" : ""}>
        <Icon name="check" /><span>{toast}</span>
      </div>
    </>
  );
}
