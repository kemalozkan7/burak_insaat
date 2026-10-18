import { useEffect, useMemo, useState } from "react";
import { getOptions } from "../api";
import { locations as fallbackLocations, listingTypes as fallbackTypes } from "../data";
import { useI18n } from "../i18n/I18nProvider";

const empty = {
  location: [],
  listing_type: [],
  rooms: [],
  floor: [],
  bathrooms: [],
  heating: [],
  furnished: [],
  parking: [],
  balcony: [],
  deed: [],
  building_age: [],
  amenity: []
};

export function useCatalog() {
  const { lang, optionLabel } = useI18n();
  const [raw, setRaw] = useState(empty);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getOptions().then((data) => {
      const opts = data.options || {};
      const next = { ...empty };
      Object.keys(empty).forEach((k) => {
        next[k] = Array.isArray(opts[k]) ? opts[k] : [];
      });
      if (!next.location.length) {
        next.location = fallbackLocations.map((l) => ({ value: l, label: l, i18n: {} }));
      }
      if (!next.listing_type.length) {
        next.listing_type = Object.entries(fallbackTypes).map(([value, label]) => ({ value, label, i18n: {} }));
      }
      setRaw(next);
      setReady(true);
    });
  }, []);

  const catalog = useMemo(() => {
    const next = {};
    Object.keys(empty).forEach((k) => {
      next[k] = (raw[k] || []).map((o) => ({
        ...o,
        value: o.value || o.label,
        label: optionLabel(o)
      }));
    });
    return next;
  }, [raw, lang, optionLabel]);

  const labelOf = (group, value) => {
    if (!value) return "";
    const hit = (raw[group] || []).find((o) => o.value === value || o.label === value);
    return hit ? optionLabel(hit) : value;
  };

  /** Turkish/storage value + translated label for selects & filters */
  const locationOptions = catalog.location || [];
  const locations = locationOptions.map((o) => o.value);

  return { catalog, locations, locationOptions, labelOf, ready };
}
