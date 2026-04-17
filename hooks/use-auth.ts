"use client";

import { useCallback, useSyncExternalStore } from "react";
import { authStorage } from "@/lib/auth-storage";
import { login as apiLogin } from "@/lib/auth-api";
import type { AuthUser, LoginPayload } from "@/lib/auth-types";

interface AuthSnapshot {
  token: string | null;
  user: AuthUser | null;
  isHydrated: boolean;
}

const EMPTY_SNAPSHOT: AuthSnapshot = {
  token: null,
  user: null,
  isHydrated: false,
};

function getSnapshot(): AuthSnapshot {
  return {
    token: authStorage.getToken(),
    user: authStorage.getUser(),
    isHydrated: authStorage.isHydrated(),
  };
}

function getServerSnapshot(): AuthSnapshot {
  return EMPTY_SNAPSHOT;
}

let cachedSnapshot: AuthSnapshot = EMPTY_SNAPSHOT;

function subscribe(listener: () => void) {
  return authStorage.subscribe(() => {
    cachedSnapshot = getSnapshot();
    listener();
  });
}

function cachedGetSnapshot(): AuthSnapshot {
  const next = getSnapshot();
  if (
    next.token === cachedSnapshot.token &&
    next.user === cachedSnapshot.user &&
    next.isHydrated === cachedSnapshot.isHydrated
  ) {
    return cachedSnapshot;
  }
  cachedSnapshot = next;
  return cachedSnapshot;
}

export function useAuth() {
  const { token, user, isHydrated } = useSyncExternalStore(
    subscribe,
    cachedGetSnapshot,
    getServerSnapshot
  );

  const signIn = useCallback(async (payload: LoginPayload) => {
    const res = await apiLogin(payload);
    authStorage.setAuth(res.token, res.usuario);
    return res;
  }, []);

  const signOut = useCallback(() => {
    authStorage.clearAuth();
  }, []);

  return {
    token,
    user,
    isAuthenticated: !!token,
    isHydrated,
    signIn,
    signOut,
  };
}
