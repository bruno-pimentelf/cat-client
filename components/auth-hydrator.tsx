"use client";

import { useEffect } from "react";
import { authStorage } from "@/lib/auth-storage";

export function AuthHydrator() {
  useEffect(() => {
    authStorage.hydrate();
  }, []);
  return null;
}
