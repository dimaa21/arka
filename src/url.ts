/** Join the Vite base path with a site-relative path. */
export function siteUrl(path = '', base = import.meta.env.BASE_URL): string {
  const normalized = base.endsWith('/') ? base : `${base}/`;
  return `${normalized}${path.replace(/^\//, '')}`;
}

export function currentSection(base = import.meta.env.BASE_URL): string {
  const normalized = base.endsWith('/') ? base.slice(0, -1) : base;
  const path = window.location.pathname.replace(normalized, '') || '/';
  return path.startsWith('/') ? path : `/${path}`;
}
