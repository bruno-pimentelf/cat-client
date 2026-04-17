import type { LoginPayload, LoginResponse } from "@/lib/auth-types";

const AUTH_API_URL =
  process.env.NEXT_PUBLIC_AUTH_API_URL ||
  "https://smartprova-v2-api.trieduconline.com.br";

export class AuthApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const body: Record<string, unknown> = {
    email: payload.email,
    senha: payload.senha,
    lembrar: payload.lembrar ?? false,
  };

  if (payload.subDominio) {
    body.subDominio = payload.subDominio;
  }

  const res = await fetch(`${AUTH_API_URL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const message =
      (typeof data?.message === "string" && data.message) ||
      (typeof data?.detail === "string" && data.detail) ||
      (res.status === 400 || res.status === 401
        ? "Login ou senha inválidos"
        : `Erro ${res.status}`);
    throw new AuthApiError(message, res.status);
  }

  const data = await res.json();
  if (!data?.token || typeof data.token !== "string" || !data?.usuario) {
    console.error("[auth] resposta inesperada do /api/login", data);
    throw new AuthApiError(
      "Resposta de login em formato inesperado",
      500
    );
  }
  return data as LoginResponse;
}
