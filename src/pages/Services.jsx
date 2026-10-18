import { Link } from "react-router-dom";
import { PageHero } from "../components/Cards";
import { serviceImgs } from "../data";
import { getContent } from "../i18n/content";
import { useI18n } from "../i18n/I18nProvider";
import { useReveal } from "../hooks";
import { Icon } from "../icons";

export default function Services() {
  const reveal = useReveal();
  const { lang } = useI18n();
  const c = getContent(lang);
  const { servicesPage: p, services, process } = c;

  return (
    <div ref={reveal}>
      <PageHero title={p.title} crumb={p.crumb} text={p.intro} img="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1800&q=80" />
      <section className="section section--cream">
        <div className="container">
          <div className="grid grid--3">
            {services.map((s, i) => (
              <a key={s.title} className="service reveal" href={`#hizmet-${i + 1}`}>
                <div className="service__icon"><Icon name={s.icon} /></div>
                <h3>{s.title}</h3><p>{s.text}</p>
                <span className="link">{p.details} <Icon name="arrow" /></span>
              </a>
            ))}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          {services.map((s, i) => (
            <div className="service-row" id={`hizmet-${i + 1}`} key={s.title}>
              <div className="service-row__media reveal"><img src={`https://images.unsplash.com/${serviceImgs[i]}?auto=format&fit=crop&w=1000&q=80`} alt={s.title} /></div>
              <div className="reveal">
                <div className="service-row__num">0{i + 1}</div>
                <h2>{s.title}</h2>
                <p>{s.detail}</p>
                <ul className="check-list">{s.bullets.map((b) => <li key={b}><Icon name="check" /> {b}</li>)}</ul>
                <Link className="btn btn--dark" to="/iletisim#teklif">{p.quoteFor} <Icon name="arrow" /></Link>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="section section--dark">
        <div className="container">
          <div className="section-head center" style={{ justifyContent: "center", textAlign: "center" }}>
            <div><span className="eyebrow eyebrow--light">{p.howEyebrow}</span><h2>{p.howTitle}</h2></div>
          </div>
          <div className="process">{process.map((step) => <div className="step reveal" key={step.step}><div className="step__num">{step.step}</div><h3>{step.title}</h3><p>{step.text}</p></div>)}</div>
        </div>
      </section>
    </div>
  );
}
