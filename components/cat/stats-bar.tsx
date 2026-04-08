"use client";

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
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatCard
        label="Proficiencia"
        value={`θ ${theta >= 0 ? "+" : ""}${theta.toFixed(2)}`}
        sublabel="Escala SAEB"
      />
      <StatCard
        label="Erro Padrao"
        value={se != null ? se.toFixed(3) : "—"}
        sublabel={se != null && se < 0.3 ? "Precisao alta" : "Estimando..."}
      />
      <StatCard
        label="Questao"
        value={`${step} / ${totalSteps}`}
        sublabel={`${Math.round(((step - 1) / totalSteps) * 100)}% concluido`}
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
