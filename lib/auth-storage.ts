import type { AuthUser } from "@/lib/auth-types";

const STORAGE_KEY = "cat_auth";

interface StoredAuth {
  token: string;
  user: AuthUser;
}

type Listener = () => void;
const listeners = new Set<Listener>();

let memory: StoredAuth | null = null;
let hydrated = false;

function readStorage(): StoredAuth | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAuth;
    if (!parsed?.token || !parsed?.user) return null;
    return parsed;
  } catch {
    return null;
  }
}

function emit() {
  listeners.forEach((l) => l());
}

export const authStorage = {
  hydrate() {
    if (hydrated) return;
    memory = readStorage();
    hydrated = true;
    emit();
  },
  isHydrated() {
    return hydrated;
  },
  getToken() {
    return memory?.token ?? null;
  },
  getUser() {
    return memory?.user ?? null;
  },
  setAuth(token: string, user: AuthUser) {
    memory = { token, user };
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
    }
    emit();
  },
  clearAuth() {
    memory = null;
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    emit();
  },
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY) return;
    memory = readStorage();
    emit();
  });
}
