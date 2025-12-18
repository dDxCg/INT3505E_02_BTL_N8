type Session = {
  token: string;
  role: string;
};

const KEY = "session";

function decodeJWT(token: string) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export const auth = {
  login(token: string) {
    const payload = decodeJWT(token);

    const session: Session = {
      token,
      role: payload?.role ?? "user",
    };

    sessionStorage.setItem(KEY, JSON.stringify(session));
  },

  logout() {
    sessionStorage.removeItem(KEY);
  },

  get session(): Session | null {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  },

  isLoggedIn() {
    return !!this.session;
  },

  role() {
    return this.session?.role;
  },
};
