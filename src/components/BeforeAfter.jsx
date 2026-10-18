import { useEffect, useRef, useState } from "react";
import { getPages } from "../i18n/pages";
import { useI18n } from "../i18n/I18nProvider";

export default function BeforeAfter({ before, after, title, xl }) {
  const { lang } = useI18n();
  const labels = getPages(lang);
  const el = useRef(null);
  const [pos, setPos] = useState(50);

  useEffect(() => {
    const node = el.current;
    if (!node) return;
    const img = node.querySelector(".ba__before");
    const sync = () => {
      if (img) img.style.width = node.clientWidth + "px";
    };
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, [before]);

  const move = (ev) => {
    const rect = el.current.getBoundingClientRect();
    const x = (ev.touches ? ev.touches[0].clientX : ev.clientX) - rect.left;
    setPos(Math.max(0, Math.min(100, (x / rect.width) * 100)));
  };

  return (
    <div
      className={`ba ${xl ? "ba--xl" : ""}`}
      ref={el}
      onPointerDown={(e) => {
        if (e.target.closest(".ba__range")) return;
        el.current.setPointerCapture(e.pointerId);
        move(e);
      }}
      onPointerMove={(e) => {
        if (el.current.hasPointerCapture(e.pointerId)) move(e);
      }}
    >
      <img className="ba__after" src={after} alt={`${title} — ${labels.after}`} />
      <div className="ba__before-wrap" style={{ width: pos + "%" }}>
        <img className="ba__before" src={before} alt={`${title} — ${labels.before}`} />
      </div>
      <input className="ba__range" type="range" min="0" max="100" value={pos} onChange={(e) => setPos(+e.target.value)} aria-label={`${labels.before} / ${labels.after}`} />
      <div className="ba__handle" style={{ left: pos + "%" }} />
      <span className="ba__tag ba__tag--before">{labels.before}</span>
      <span className="ba__tag ba__tag--after">{labels.after}</span>
    </div>
  );
}
