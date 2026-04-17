import { authStorage } from "@/lib/auth-storage";

const AUTH_API_URL =
  process.env.NEXT_PUBLIC_AUTH_API_URL ||
  "https://smartprova-v2-api.trieduconline.com.br";

export interface Turma {
  Id: string;
  Nome: string;
}

async function smartRequest<T>(path: string): Promise<T | null> {
  const token = authStorage.getToken();
  if (!token) return null;

  const res = await fetch(`${AUTH_API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    return null;
  }

  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export const trieducApi = {
  async getTurmas(usuarioId: string): Promise<Turma[]> {
    const comNotas = await smartRequest<Turma[]>(
      `/api/usuarios/${usuarioId}/turmas?possuiNota=true`
    );
    if (comNotas && comNotas.length > 0) return comNotas;

    const todas = await smartRequest<Turma[]>(
      `/api/usuarios/${usuarioId}/turmas`
    );
    return todas ?? [];
  },
};
