export const API_BASE = '/api/v1';

export type Session = { access_token: string; user: { email: string; display_name: string; role: string } };

export function getToken() {
  return typeof window === 'undefined' ? null : sessionStorage.getItem('ciberguate_token');
}

export function setToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) sessionStorage.setItem('ciberguate_token', token);
  else sessionStorage.removeItem('ciberguate_token');
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(init.headers ?? {}) },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({ detail: 'No fue posible completar la operación' })) as { detail?: string };
    if (response.status === 401 && token) setToken(null);
    throw new Error(body.detail ?? `Error HTTP ${response.status}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function downloadProtected(path = '/reports/executive.pdf', filename = 'informe-ejecutivo-riesgos.pdf') {
  const response = await fetch(`${API_BASE}${path}`, { headers: { Authorization: `Bearer ${getToken()}` } });
  if (!response.ok) throw new Error('No fue posible generar el informe');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(await response.blob());
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

export const downloadReport = () => downloadProtected();
