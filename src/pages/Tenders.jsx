import { useEffect, useState } from "react";
import { getTenders } from "../api";
import { PageHero, TenderCard } from "../components/Cards";
import { getContent } from "../i18n/content";
import { useI18n } from "../i18n/I18nProvider";
import { useReveal } from "../hooks";
import { Icon } from "../icons";

export default function Tenders() {
  const reveal = useReveal();
  const { lang } = useI18n();
  const p = getContent(lang).tendersPage;
  const [rows, setRows] = useState([]);
  useEffect(() => { getTenders().then(setRows); }, []);
  return (
    <div ref={reveal}>
      <PageHero title={p.title} crumb={p.crumb} text={p.intro} img="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1800&q=80" />
      <section className="section" style={{ paddingTop: "2.5rem" }}>
        <div className="container">
          <div className="results-bar"><div><strong>{rows.length}</strong> {p.count}</div></div>
          <div className="grid grid--2">
            {rows.length ? rows.map((t) => <TenderCard key={t.id} t={t} />) : <div className="empty"><Icon name="layers" /><p>{p.empty}</p></div>}
          </div>
        </div>
      </section>
    </div>
  );
}
