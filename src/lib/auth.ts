export type AuthRole = 'user' | 'admin';

const TOKEN_KEY = 'bh_token';
const ROLE_KEY = 'bh_role';

export function setAuth(token: string, role: AuthRole) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ROLE_KEY, role);
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getAuthRole(): AuthRole | null {
  const role = localStorage.getItem(ROLE_KEY);
  if (role === 'user' || role === 'admin') return role;
  return null;
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
}
