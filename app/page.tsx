"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { catApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  const router = useRouter();
  const [selectedDisciplina, setSelectedDisciplina] = useState<string | null>(null);
  const [selectedAno, setSelectedAno] = useState<string | null>(null);

  const { data: filters, isLoading } = useQuery({
    queryKey: ["cat-filters"],
    queryFn: () => catApi.getFilters(),
  });

  const selectedFilter = filters?.find((f) => f.disciplina === selectedDisciplina);
  const anos = selectedFilter?.anos ?? [];

  const canStart = selectedDisciplina && selectedAno;

  const handleStart = () => {
    if (!canStart) return;
    const params = new URLSearchParams({
      disciplina: selectedDisciplina,
      ano: selectedAno,
    });
    router.push(`/teste?${params.toString()}`);
  };

  const handleSelectDisciplina = (disc: string) => {
    if (selectedDisciplina === disc) {
      setSelectedDisciplina(null);
      setSelectedAno(null);
    } else {
      setSelectedDisciplina(disc);
      setSelectedAno(null);
    }
  };

  // Ordenar anos: extrair numero e ordenar
  const sortedAnos = [...anos].sort((a, b) => {
    const na = parseInt(a.replace(/\D/g, "")) || 0;
    const nb = parseInt(b.replace(/\D/g, "")) || 0;
    return na - nb;
  });

  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <svg
              className="h-6 w-6 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Teste Adaptativo</h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
            Selecione a disciplina e a serie para iniciar a avaliacao adaptativa.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
          </div>
        ) : (
          <>
            {/* Disciplina */}
            <div className="space-y-3">
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Disciplina
              </label>
              <div className="grid grid-cols-2 gap-2">
                {filters?.map((f) => {
                  const isActive = selectedDisciplina === f.disciplina;
                  return (
                    <button
                      key={f.disciplina}
                      type="button"
                      onClick={() => handleSelectDisciplina(f.disciplina)}
                      className={`
                        flex items-center justify-between rounded-xl border p-3 text-left
                        transition-all duration-150 cursor-pointer
                        ${
                          isActive
                            ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                            : "border-border/60 hover:border-border hover:bg-muted/40"
                        }
                      `}
                    >
                      <span className="text-sm font-medium">{f.disciplina}</span>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-mono">
                        {f.total}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ano Escolar */}
            {selectedDisciplina && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Serie / Ano
                </label>
                <div className="flex flex-wrap gap-2">
                  {sortedAnos.map((ano) => {
                    const isActive = selectedAno === ano;
                    return (
                      <button
                        key={ano}
                        type="button"
                        onClick={() => setSelectedAno(isActive ? null : ano)}
                        className={`
                          rounded-xl border px-4 py-2.5 text-sm font-medium
                          transition-all duration-150 cursor-pointer
                          ${
                            isActive
                              ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                              : "border-border/60 hover:border-border hover:bg-muted/40"
                          }
                        `}
                      >
                        {ano}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CTA */}
            <Button
              onClick={handleStart}
              disabled={!canStart}
              size="lg"
              className="w-full rounded-xl h-12 text-sm font-medium"
            >
              Iniciar Teste
            </Button>

            <p className="text-[11px] text-muted-foreground text-center">
              Ate 20 questoes · Encerra automaticamente quando a precisao e suficiente
            </p>
          </>
        )}
      </div>
    </div>
  );
}
