export function resolveBackendUrl() {
  const raw =
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.BACKEND_URL ??
    'https://climatefood-backend.up.railway.app';

  return `${raw.startsWith('http://') || raw.startsWith('https://') ? raw : `https://${raw}`}`
    .replace(/\/$/, '')
    .replace(/\/api$/, '');
}
