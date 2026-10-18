export async function api(url, opts) {
  const res = await fetch(url, { credentials: "include", ...opts });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || "İstek başarısız");
    err.status = res.status;
    throw err;
  }
  return data;
}

export const getProjects = () => api("/api/projects").catch(() => []);
export const getProject = (id) => api("/api/projects/" + encodeURIComponent(id)).catch(() => null);
export const getTenders = () => api("/api/tenders").catch(() => []);
export const getTender = (id) => api("/api/tenders/" + encodeURIComponent(id)).catch(() => null);
export const getListings = (q = "") => api("/api/listings" + q).catch(() => []);
export const getListing = (id) => api("/api/listings/" + encodeURIComponent(id)).catch(() => null);
export const getOptions = () => api("/api/options").catch(() => ({ groups: {}, options: {} }));

export function postInquiry(body) {
  return api("/api/inquiries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}
