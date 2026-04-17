"use client";

import { useQuery } from "@tanstack/react-query";
import { trieducApi } from "@/lib/trieduc-api";
import { useAuth } from "@/hooks/use-auth";

export function useStudentTurmas() {
  const { user, token, isHydrated } = useAuth();
  return useQuery({
    queryKey: ["student-turmas", user?.id],
    queryFn: async () => {
      const turmas = await trieducApi.getTurmas(user!.id);
      if (turmas.length > 0) {
        console.debug("[trieduc] turmas do aluno:", turmas);
      }
      return turmas;
    },
    enabled: isHydrated && !!user?.id && !!token,
    staleTime: 5 * 60 * 1000,
    retry: 0,
  });
}
