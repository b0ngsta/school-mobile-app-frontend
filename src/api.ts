// Fetch wrapper + session (mirrors src/api.js in the web app).
// Accepts ALL roles: student, teacher, admin, principal, sub_admin,
// coordinator, driver. The theme + tabs adapt to session.user_type.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadCache, remember, resetCache } from './cache';
// import { API_URL } from './config';
import { t } from './i18n';
import { applyRoleTheme } from './theme';
import type { Session } from './types';

const KEY = 'sw_app_session';
let session: Session | null = null;
const API_URL = 'https://school-app-docker-v1.onrender.com';

/** Whose cached responses these are (user type + id). */
const cacheOwner = (s: Session | null): string | null => (s ? `${s.user_type}:${s.user_id}` : null);

export { peek } from './cache';

export async function loadSession(): Promise<Session | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    session = raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    session = null;
  }
  if (session) applyRoleTheme(session.user_type, session.theme_color);
  await loadCache(cacheOwner(session));
  return session;
}

export const getSession = (): Session | null => session;

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: Record<string, unknown>;
  formData?: FormData;
}

export async function api<T = any>(path: string, { method = 'GET', body, formData }: ApiOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (session?.token) headers.Authorization = `Bearer ${session.token}`;
  if (body) headers['Content-Type'] = 'application/json';
  // multipart: let fetch set the boundary — do NOT set Content-Type
  const requestOwner = cacheOwner(session);
  let res: Response;
  // Request logging only in dev: in release builds console.log still runs
  // and serialises every body (incl. upload FormData) on the JS thread.
  if (__DEV__) console.log(`${method} ${API_URL}${path}`);
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: formData ?? (body ? JSON.stringify(body) : undefined),
    });
  } catch {
    throw new Error(t('err.network'));
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.detail === 'string' ? data.detail : t('err.request', { code: res.status }));
  }
  if (method === 'GET') remember(path, data, requestOwner);
  return data as T;
}

interface LoginResponse {
  access_token: string;
  user_id: number;
  full_name: string;
  user_type: Session['user_type'];
  theme_color?: string | null;
}

export async function login(username: string, password: string): Promise<Session> {
  const data = await api<LoginResponse>('/auth/login', { method: 'POST', body: { username, password } });
  session = {
    token: data.access_token,
    user_id: data.user_id,
    full_name: data.full_name,
    user_type: data.user_type,
    theme_color: '#ff3333',
  };
  applyRoleTheme(session.user_type, session.theme_color);
  resetCache(cacheOwner(session)); // fresh login: never show a previous user's data
  await AsyncStorage.setItem(KEY, JSON.stringify(session));
  return session;
}

export async function logout(): Promise<void> {
  session = null;
  resetCache(null);
  applyRoleTheme(null);
  await AsyncStorage.removeItem(KEY);
}

export const photoUrl = (p?: string | null): string | null =>
  p ? `${API_URL}/${p}`.replace(/([^:])\/\//g, '$1/') : null;
