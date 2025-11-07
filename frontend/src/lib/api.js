const API_URL = import.meta.env.VITE_API_URL || '/api';

async function apiFetch(path, { method = 'GET', token, data } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined
  });

  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail.error || detail.message || 'Request failed');
  }

  return res.status === 204 ? null : res.json();
}

export const api = {
  joinFamily: (payload) => apiFetch('/auth/join-family', { method: 'POST', data: payload }),
  getProfile: (token) => apiFetch('/me', { token }),
  getEvents: (token, params = {}) => {
    const query = new URLSearchParams();
    if (params.from) query.set('from', params.from);
    if (params.to) query.set('to', params.to);
    const qs = query.toString();
    return apiFetch(`/events${qs ? `?${qs}` : ''}`, { token });
  },
  createEvent: (token, payload) => apiFetch('/events', { method: 'POST', token, data: payload }),
  updateEvent: (token, id, payload) => apiFetch(`/events/${id}`, { method: 'PUT', token, data: payload }),
  deleteEvent: (token, id) => apiFetch(`/events/${id}`, { method: 'DELETE', token }),
  saveSubscription: (token, subscription) => apiFetch('/push/subscribe', {
    method: 'POST',
    token,
    data: { subscription }
  }),
  getPushKey: () => apiFetch('/push/public-key')
};
