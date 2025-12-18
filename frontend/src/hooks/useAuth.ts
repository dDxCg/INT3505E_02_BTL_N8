export type Role = "staff" | "admin";

type AuthState = {
  token: string;
  role: Role;
  name?: string;
};

const KEY = "restro_auth";

export function getAuth(): AuthState | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AuthState) : null;
  } catch {
    return null;
  }
}

export function setAuth(data: AuthState) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function clearAuth() {
  localStorage.removeItem(KEY);
}
