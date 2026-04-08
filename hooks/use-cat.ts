"use client";

import { useState, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { catApi } from "@/lib/api";
import { queryClient } from "@/lib/query-client";
import type {
  SessionResponse,
  CreateSessionPayload,
  HistoryStep,
} from "@/lib/types";

export function useCatSession(sessionId: string | null) {
  return useQuery({
    queryKey: ["cat-session", sessionId],
    queryFn: () => catApi.getSession(sessionId!),
    enabled: !!sessionId,
  });
}

export function useCatHistory(sessionId: string | null) {
  return useQuery({
    queryKey: ["cat-history", sessionId],
    queryFn: () => catApi.getHistory(sessionId!),
    enabled: !!sessionId,
  });
}

export function useCat() {
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [history, setHistory] = useState<HistoryStep[]>([]);

  const createSession = useMutation({
    mutationFn: (payload: CreateSessionPayload) =>
      catApi.createSession(payload),
    onSuccess: (data) => {
      setSession(data);
      setHistory([]);
    },
  });

  const submitAnswer = useMutation({
    mutationFn: (alternativaId: string) => {
      if (!session) throw new Error("Nenhuma sessao ativa");
      return catApi.submitAnswer(session.sessionId, alternativaId);
    },
    onSuccess: (data) => {
      setSession(data);

      if (data.se !== null) {
        setHistory((prev) => [
          ...prev,
          {
            step: prev.length + 1,
            itemCodigo: "",
            theta: data.theta,
            se: data.se,
            correct: data.previousAnswer?.correct ?? false,
          },
        ]);
      }

      if (data.completed && data.history) {
        setHistory(data.history);
      }

      // Invalidar cache da sessao
      if (data.completed) {
        queryClient.invalidateQueries({
          queryKey: ["cat-session", data.sessionId],
        });
        queryClient.invalidateQueries({
          queryKey: ["cat-history", data.sessionId],
        });
      }
    },
  });

  const startSession = useCallback(
    (payload: CreateSessionPayload) => createSession.mutate(payload),
    [createSession]
  );

  const answer = useCallback(
    (alternativaId: string) => submitAnswer.mutate(alternativaId),
    [submitAnswer]
  );

  return {
    session,
    history,
    isStarting: createSession.isPending,
    isAnswering: submitAnswer.isPending,
    error:
      createSession.error?.message ?? submitAnswer.error?.message ?? null,
    startSession,
    submitAnswer: answer,
  };
}
