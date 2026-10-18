import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getPages } from "../i18n/pages";
import { useI18n } from "../i18n/I18nProvider";
import { Icon } from "../icons";

export default function PhotoViewer({ images, index, title, onClose, onIndex }) {
  const { lang } = useI18n();
  const labels = getPages(lang);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const drag = useRef(null);
  const stage = useRef(null);
  const total = images.length;

  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [index]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndex((index + 1) % total);
      if (e.key === "ArrowLeft") onIndex((index - 1 + total) % total);
      if (e.key === "+" || e.key === "=") setZoom((z) => Math.min(4, +(z + 0.25).toFixed(2)));
      if (e.key === "-" || e.key === "_") {
        setZoom((z) => {
          const next = Math.max(1, +(z - 0.25).toFixed(2));
          if (next === 1) setPan({ x: 0, y: 0 });
          return next;
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [index, total, onClose, onIndex]);

  const setScale = (next) => {
    const z = Math.min(4, Math.max(1, next));
    setZoom(z);
    if (z === 1) setPan({ x: 0, y: 0 });
  };

  useEffect(() => {
    const node = stage.current;
    if (!node) return;
    const onWheel = (e) => {
      e.preventDefault();
      setZoom((z) => {
        const next = Math.min(4, Math.max(1, +(z + (e.deltaY < 0 ? 0.2 : -0.2)).toFixed(2)));
        if (next === 1) setPan({ x: 0, y: 0 });
        return next;
      });
    };
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, []);

  return createPortal(
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={`${title} ${labels.photos}`} onClick={onClose}>
      <div className="lightbox__bar" onClick={(e) => e.stopPropagation()}>
        <span>{index + 1} / {total}</span>
        <div className="lightbox__zoom">
          <button type="button" onClick={() => setScale(zoom - 0.25)} aria-label={labels.zoomOut}>−</button>
          <button type="button" onClick={() => setScale(1)}>{Math.round(zoom * 100)}%</button>
          <button type="button" onClick={() => setScale(zoom + 0.25)} aria-label={labels.zoomIn}>+</button>
        </div>
        <button type="button" className="lightbox__close" onClick={onClose} aria-label={labels.close}><Icon name="close" /></button>
      </div>
      {total > 1 && (
        <button type="button" className="lightbox__nav lightbox__nav--prev" aria-label={labels.prevPhoto} onClick={(e) => {
          e.stopPropagation();
          setZoom(1);
          setPan({ x: 0, y: 0 });
          onIndex((index - 1 + total) % total);
        }}>
          <Icon name="arrowL" />
        </button>
      )}
      <div
        ref={stage}
        className={`lightbox__stage ${dragging ? "is-drag" : ""}`}
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={() => setScale(zoom > 1 ? 1 : 2)}
        onPointerDown={(e) => {
          if (zoom <= 1) return;
          drag.current = { x: e.clientX, y: e.clientY, pan };
          setDragging(true);
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          setPan({
            x: drag.current.pan.x + (e.clientX - drag.current.x),
            y: drag.current.pan.y + (e.clientY - drag.current.y)
          });
        }}
        onPointerUp={() => { drag.current = null; setDragging(false); }}
      >
        <div key={images[index] + index} className="lightbox__fade">
          <img
            src={images[index]}
            alt={`${title} ${index + 1}`}
            style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, cursor: zoom > 1 ? "grab" : "zoom-in" }}
            draggable="false"
          />
        </div>
      </div>
      {total > 1 && (
        <button type="button" className="lightbox__nav lightbox__nav--next" aria-label={labels.nextPhoto} onClick={(e) => {
          e.stopPropagation();
          setZoom(1);
          setPan({ x: 0, y: 0 });
          onIndex((index + 1) % total);
        }}>
          <Icon name="arrow" />
        </button>
      )}
    </div>,
    document.body
  );
}
