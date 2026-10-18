import { Link } from "react-router-dom";
import { PageHero } from "../components/Cards";
import { stats, team } from "../data";
import { getContent } from "../i18n/content";
import { useI18n } from "../i18n/I18nProvider";
import { useCountUp, useReveal } from "../hooks";
import { Icon } from "../icons";

export default function About() {
  const reveal = useReveal();
  const count = useCountUp();
  const { lang } = useI18n();
  const a = getContent(lang).about;
  const statLabels = getContent(lang).stats;

  return (
    <div ref={(n) => { reveal.current = n; count.current = n; }}>
      <PageHero title={a.title} text={a.intro} img="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1800&q=80" />
      <section className="section">
        <div className="container about-grid">
          <div className="reveal">
            <span className="eyebrow">{a.storyEyebrow}</span>
            <h2>{a.storyTitle}</h2>
            <p>{a.p1}</p>
            <p>{a.p2}</p>
            <p>{a.p3}</p>
            <div className="hero__actions" style={{ margin: "1.4rem 0 0" }}>
              <Link className="btn btn--gold" to="/projeler">{a.ctaProjects} <Icon name="arrow" /></Link>
              <Link className="btn btn--ghost" to="/iletisim">{a.ctaContact}</Link>
            </div>
          </div>
          <div className="about-media reveal">
            <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80" alt="" />
            <img src="https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=800&q=80" alt="" />
          </div>
        </div>
      </section>
      <section className="stats">
        <div className="container stats__grid">
          {stats.map((s, i) => (
            <div className="stat" key={statLabels[i] || s.label}>
              <strong data-count={s.value} data-suffix={s.suffix}>0</strong>
              <span>{statLabels[i] || s.label}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="section section--cream">
        <div className="container">
          <div className="section-head center reveal" style={{ justifyContent: "center", textAlign: "center" }}>
            <div><span className="eyebrow">{a.valuesEyebrow}</span><h2>{a.valuesTitle}</h2></div>
          </div>
          <div className="values">
            {a.values.map((v) => (
              <div className="value reveal" key={v.title}>
                <div className="feature__icon"><Icon name={v.icon} /></div>
                <h3>{v.title}</h3><p>{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section section--dark">
        <div className="container">
          <div className="section-head center reveal" style={{ justifyContent: "center", textAlign: "center" }}>
            <div><span className="eyebrow eyebrow--light">{a.milesEyebrow}</span><h2>{a.milesTitle}</h2></div>
          </div>
          <div className="timeline">{a.milestones.map((m) => <div className="milestone reveal" key={m.year}><strong>{m.year}</strong><p>{m.text}</p></div>)}</div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="section-head center reveal" style={{ justifyContent: "center", textAlign: "center" }}>
            <div><span className="eyebrow">{a.teamEyebrow}</span><h2>{a.teamTitle}</h2></div>
          </div>
          <div className="team">{team.map((member, i) => (
            <div className="member reveal" key={member.name}>
              <img src={member.img} alt={member.name} />
              <strong>{member.name}</strong>
              <span>{a.roles[i] || member.role}</span>
            </div>
          ))}</div>
        </div>
      </section>
    </div>
  );
}
