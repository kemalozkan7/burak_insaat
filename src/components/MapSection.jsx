import { Icon } from "../icons";
import { useI18n } from "../i18n/I18nProvider";

function cleanAddress(text) {
  return String(text || "")
    .replace(/[–—]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractQuery(raw) {
  const text = String(raw || "").trim();
  if (!text) return "";
  if (/maps\.app\.goo\.gl|goo\.gl\/maps/i.test(text)) return "";

  const d3 = text.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  if (d3) return `${d3[1]},${d3[2]}`;
  const at = text.match(/@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/);
  if (at) return `${at[1]},${at[2]}`;
  const ll = text.match(/[?&](?:ll|center)=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/i);
  if (ll) return `${ll[1]},${ll[2]}`;
  const bare = text.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
  if (bare) return `${bare[1]},${bare[2]}`;

  try {
    const u = new URL(text);
    const q = u.searchParams.get("q") || u.searchParams.get("query");
    if (q) return cleanAddress(q);
    const place = u.pathname.match(/\/place\/([^/]+)/);
    if (place) return cleanAddress(decodeURIComponent(place[1].replace(/\+/g, " ")));
  } catch { /* plain address */ }

  return cleanAddress(text);
}

/** Turn a pasted Maps URL / coords / address into embed + open links. */
export function mapLinks(mapQuery, fallbackLocation = "") {
  const raw = String(mapQuery || "").trim();
  const fallback = cleanAddress(fallbackLocation);
  let query = extractQuery(raw) || fallback;
  if (!query) return null;

  // Prefer coords zoom; addresses get a city-level zoom
  const isCoords = /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(query);
  const zoom = isCoords ? 17 : 15;
  const enc = encodeURIComponent(query);

  return {
    query,
    embed: `https://maps.google.com/maps?q=${enc}&hl=tr&z=${zoom}&output=embed`,
    open: raw && /^https?:\/\//i.test(raw)
      ? raw
      : `https://www.google.com/maps/search/?api=1&query=${enc}`
  };
}

export default function MapSection({ mapQuery, location, title = "Konum" }) {
  const { t } = useI18n();
  const links = mapLinks(mapQuery, location ? `${location}, KKTC` : "");
  if (!links) return null;
  return (
    <section className="section section--cream map-section">
      <div className="container">
        <div className="section-head map-section__head">
          <div>
            <span className="eyebrow">{t("specs.googleMaps")}</span>
            <h2>{title}</h2>
            {location ? <p className="muted map-section__loc"><Icon name="pin" /> {location}</p> : null}
          </div>
          <a className="link" href={links.open} target="_blank" rel="noopener">{t("common.openInMaps")} <Icon name="arrow" /></a>
        </div>
        <div className="map">
          <iframe
            src={links.embed}
            title={title}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}
