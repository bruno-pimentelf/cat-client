"use client";

import { formatSaeb, thetaToSaeb } from "@/lib/saeb";

interface StatsBarProps {
  theta: number;
  se: number | null;
  step: number;
  totalSteps: number;
  correctCount?: number;
}

export function StatsBar({
  theta,
  se,
  step,
  totalSteps,
  correctCount,
}: StatsBarProps) {
  // SE na escala SAEB = 50 × SE_theta
  const seSaeb = se != null ? Math.round(50 * se) : null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatCard
        label="Proficiência"
        value={`${formatSaeb(theta)} pts`}
        sublabel="Escala SAEB"
      />
      <StatCard
        label="Erro Padrão"
        value={seSaeb != null ? `±${seSaeb} pts` : "—"}
        sublabel={seSaeb != null && seSaeb < 15 ? "Precisão alta" : "Estimando..."}
      />
      <StatCard
        label="Questão"
        value={`${step} / ${totalSteps}`}
        sublabel={`${Math.round(((step - 1) / totalSteps) * 100)}% concluído`}
      />
      {correctCount !== undefined && (
        <StatCard
          label="Acertos"
          value={`${correctCount}`}
          sublabel={`de ${step - 1} respondidas`}
        />
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  sublabel,
}: {
  label: string;
  value: string;
  sublabel?: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-3 md:p-4 space-y-1">
      <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
        {label}
      </p>
      <p className="text-lg md:text-xl font-semibold font-mono tracking-tight">
        {value}
      </p>
      {sublabel && (
        <p className="text-[11px] text-muted-foreground">{sublabel}</p>
      )}
    </div>
  );
}
