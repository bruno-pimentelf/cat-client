"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCat } from "@/hooks/use-cat";
import { QuestionCard, FeedbackBanner } from "@/components/cat/question-card";
import { ThetaChart } from "@/components/cat/theta-chart";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default function TestePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
        </div>
      }
    >
      <TesteContent />
    </Suspense>
  );
}

function TesteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const disciplina = searchParams.get("disciplina");
  const anoEscolar = searchParams.get("ano");

  const {
    session,
    history,
    isStarting,
    isAnswering,
    error,
    startSession,
    submitAnswer,
  } = useCat();

  useEffect(() => {
    if (!session && !isStarting && !error) {
      startSession({
        disciplina: disciplina ?? undefined,
        anoEscolar: anoEscolar ?? undefined,
        maxItems: 20,
        seThreshold: 0.3,
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Loading
  if (!session) {
    return (
      <div className="flex min-h-svh items-center justify-center px-4">
        {error ? (
          <div className="text-center space-y-4">
            <p className="text-sm text-destructive">{error}</p>
            <Button onClick={() => router.push("/")} variant="outline" className="rounded-xl">
              Voltar
            </Button>
          </div>
        ) : (
          <div className="space-y-3 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
            <p className="text-sm text-muted-foreground">Preparando teste...</p>
          </div>
        )}
      </div>
    );
  }

  const correctCount = history.filter((h) => h.correct).length;

  // Completado
  if (session.completed) {
    return <CompletedView session={session} history={history} correctCount={correctCount} router={router} />;
  }

  // Em andamento - split view
  const progress = ((session.step - 1) / session.totalSteps) * 100;

  return (
    <div className="min-h-svh">
      {/* Mobile: stacked / Desktop: split */}
      <div className="lg:flex lg:h-svh">
        {/* Painel esquerdo - stats e grafico (sticky no desktop) */}
        <aside className="border-b border-border/60 bg-muted/20 px-4 py-5 lg:w-[400px] xl:w-[440px] lg:border-b-0 lg:border-r lg:overflow-y-auto lg:shrink-0 lg:py-8 lg:px-6">
          <div className="mx-auto max-w-2xl lg:max-w-none space-y-5">
            {/* Contexto */}
            {(disciplina || anoEscolar) && (
              <div className="flex flex-wrap gap-1.5">
                {disciplina && <Badge variant="secondary" className="text-[11px]">{disciplina}</Badge>}
                {anoEscolar && <Badge variant="secondary" className="text-[11px]">{anoEscolar}</Badge>}
              </div>
            )}

            {/* Progresso */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="font-medium uppercase tracking-wider">Progresso</span>
                <span className="font-mono">{session.step} / {session.totalSteps}</span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <StatMini label="Proficiencia" value={`${session.theta >= 0 ? "+" : ""}${session.theta.toFixed(2)}`} />
              <StatMini label="Erro Padrao" value={session.se != null ? session.se.toFixed(3) : "—"} />
              <StatMini label="Acertos" value={`${correctCount}`} />
              <StatMini label="Respondidas" value={`${session.step - 1}`} />
            </div>

            {/* Grafico */}
            {history.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-semibold">Evolucao</h2>
                  <div className="flex items-center gap-2.5 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Acerto
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
                      Erro
                    </span>
                  </div>
                </div>
                <div className="rounded-xl border border-border/60 bg-card p-2.5">
                  <ThetaChart history={history} currentTheta={session.theta} />
                </div>
              </div>
            )}

            {/* Historico compacto */}
            {history.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {history.map((h, i) => (
                  <div
                    key={i}
                    className={`w-7 h-7 rounded-md text-[11px] flex items-center justify-center font-medium ${
                      h.correct
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                        : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                    }`}
                    title={`Questao ${h.step}: θ=${h.theta.toFixed(2)}`}
                  >
                    {h.step}
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Painel direito - questao (scrollavel) */}
        <main className="flex-1 overflow-y-auto px-4 py-5 lg:py-8 lg:px-8 xl:px-12">
          <div className="mx-auto max-w-2xl lg:max-w-xl">
            {session.item && (
              <QuestionCard
                item={session.item}
                step={session.step}
                totalSteps={session.totalSteps}
                previousAnswer={session.previousAnswer}
                onSubmit={submitAnswer}
                loading={isAnswering}
              />
            )}
            {error && <p className="text-sm text-destructive text-center mt-4">{error}</p>}
          </div>
        </main>
      </div>
    </div>
  );
}

function CompletedView({
  session,
  history,
  correctCount,
  router,
}: {
  session: NonNullable<ReturnType<typeof useCat>["session"]>;
  history: ReturnType<typeof useCat>["history"];
  correctCount: number;
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <div className="min-h-svh px-4 py-8 md:py-12">
      <div className="mx-auto max-w-xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/30">
            <svg className="h-6 w-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight">Teste Concluido</h1>
          <p className="text-sm text-muted-foreground">{session.step} questoes respondidas</p>
        </div>

        {/* Feedback ultima resposta */}
        {session.previousAnswer && <FeedbackBanner answer={session.previousAnswer} />}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Proficiencia" value={`θ ${session.theta >= 0 ? "+" : ""}${session.theta.toFixed(2)}`} />
          <StatCard label="Erro Padrao" value={session.se != null ? session.se.toFixed(3) : "—"} />
          <StatCard label="Acertos" value={`${correctCount} / ${session.step}`} />
          <StatCard label="Taxa" value={`${session.step > 0 ? Math.round((correctCount / session.step) * 100) : 0}%`} />
        </div>

        {/* Grafico */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Evolucao</h2>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                Acerto
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
                Erro
              </span>
            </div>
          </div>
          <div className="rounded-xl border border-border/60 bg-card p-3 md:p-4">
            <ThetaChart history={history} currentTheta={session.theta} showSE={true} />
          </div>
        </div>

        <Separator />

        {/* Historico */}
        {history.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold">Respostas</h2>
            <div className="flex flex-wrap gap-1.5">
              {history.map((h, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-lg text-xs flex items-center justify-center font-medium ${
                    h.correct
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                      : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                  }`}
                  title={`Questao ${h.step}: θ=${h.theta.toFixed(2)}`}
                >
                  {h.step}
                </div>
              ))}
            </div>
          </div>
        )}

        <Button onClick={() => router.push("/")} className="w-full rounded-xl h-12 text-sm font-medium">
          Novo Teste
        </Button>
      </div>
    </div>
  );
}

function StatMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card px-3 py-2.5">
      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
      <p className="text-base font-semibold font-mono tracking-tight mt-0.5">{value}</p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-3 md:p-4 space-y-1">
      <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
      <p className="text-lg md:text-xl font-semibold font-mono tracking-tight">{value}</p>
    </div>
  );
}
