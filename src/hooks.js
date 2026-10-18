import { useEffect, useRef, useState } from "react";

export function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const els = root.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  });
  return ref;
}

export function useCountUp() {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const els = root.querySelectorAll("[data-count]");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((x) => {
          if (!x.isIntersecting) return;
          const el = x.target;
          const target = +el.dataset.count;
          const suffix = el.dataset.suffix || "";
          const start = performance.now();
          const tick = (now) => {
            const p = Math.min(1, (now - start) / 1600);
            const e = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * e).toLocaleString("tr-TR") + suffix;
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          io.unobserve(el);
        });
      },
      { threshold: 0.4 }
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  });
  return ref;
}

export function useToast() {
  const [msg, setMsg] = useState("");
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(""), 3800);
    return () => clearTimeout(t);
  }, [msg]);
  return [msg, setMsg];
}

const FAV = "bi_favs";
export function getFavs() {
  try {
    return JSON.parse(localStorage.getItem(FAV) || "[]");
  } catch {
    return [];
  }
}
export function toggleFav(id) {
  const f = getFavs();
  const i = f.indexOf(id);
  i > -1 ? f.splice(i, 1) : f.push(id);
  localStorage.setItem(FAV, JSON.stringify(f));
  return i === -1;
}
