import type {
  CreateSessionPayload,
  FilterOption,
  HistoryStep,
  SessionResponse,
} from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_CAT_API_URL || "http://localhost:8000";

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(body.detail || `Erro ${res.status}`, res.status);
  }

  return res.json();
}

export const catApi = {
  getFilters(): Promise<FilterOption[]> {
    return request("/api/v1/cat/filters");
  },

  createSession(payload: CreateSessionPayload): Promise<SessionResponse> {
    return request("/api/v1/cat/sessions", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  submitAnswer(
    sessionId: string,
    alternativaId: string
  ): Promise<SessionResponse> {
    return request(`/api/v1/cat/sessions/${sessionId}/answer`, {
      method: "POST",
      body: JSON.stringify({ alternativaId }),
    });
  },

  getSession(sessionId: string): Promise<SessionResponse> {
    return request(`/api/v1/cat/sessions/${sessionId}`);
  },

  getHistory(sessionId: string): Promise<HistoryStep[]> {
    return request(`/api/v1/cat/sessions/${sessionId}/history`);
  },
};
