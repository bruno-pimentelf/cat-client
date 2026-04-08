"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { FadeIn } from "./motion";

const D = 1.7;
function prob3pl(theta: number, a: number, b: number, c: number) {
  return c + (1 - c) / (1 + Math.exp(-D * a * (theta - b)));
}
function infoItem(theta: number, a: number, b: number, c: number) {
  const p = prob3pl(theta, a, b, c);
  const q = 1 - p;
  return D ** 2 * a ** 2 * (q / p) * ((p - c) ** 2 / (1 - c) ** 2);
}
function eapEstimate(responses: number[], params: { a: number; b: number; c: number }[]) {
  const n = 100;
  const points = Array.from({ length: n }, (_, i) => -4 + (8 * i) / (n - 1));
  const weights = points.map((p) => Math.exp(-0.5 * p * p) / Math.sqrt(2 * Math.PI));
  const wSum = weights.reduce((a, b) => a + b, 0);
  weights.forEach((_, i) => (weights[i] /= wSum));
  const logLik = new Array(n).fill(0);
  for (let j = 0; j < responses.length; j++) {
    const { a, b, c } = params[j];
    for (let k = 0; k < n; k++) {
      let p = prob3pl(points[k], a, b, c);
      p = Math.max(1e-10, Math.min(1 - 1e-10, p));
      logLik[k] += responses[j] === 1 ? Math.log(p) : Math.log(1 - p);
    }
  }
  const posterior = logLik.map((ll, k) => Math.exp(ll) * weights[k]);
  const postSum = posterior.reduce((a, b) => a + b, 0);
  posterior.forEach((_, i) => (posterior[i] /= postSum));
  const theta = posterior.reduce((s, p, k) => s + points[k] * p, 0);
  const se = Math.sqrt(posterior.reduce((s, p, k) => s + (points[k] - theta) ** 2 * p, 0));
  return { theta, se };
}

const ITEMS = [
  { id: 0, b: -1.5, a: 1.2, c: 0.15 },
  { id: 1, b: -0.8, a: 1.8, c: 0.18 },
  { id: 2, b: -0.2, a: 2.1, c: 0.20 },
  { id: 3, b: 0.3, a: 1.9, c: 0.15 },
  { id: 4, b: 0.8, a: 2.3, c: 0.12 },
  { id: 5, b: 1.3, a: 1.6, c: 0.10 },
  { id: 6, b: 1.8, a: 2.0, c: 0.08 },
  { id: 7, b: -2.0, a: 1.0, c: 0.20 },
  { id: 8, b: 0.0, a: 2.5, c: 0.17 },
  { id: 9, b: 2.2, a: 1.4, c: 0.05 },
];

interface Step {
  step: number;
  theta: number;
  se: number;
  correct: boolean;
  itemB: number;
}

const EASE = [0.32, 0.72, 0, 1] as const;
const TRUE_THETA = 0.8;

const chartConfig = {
  theta: { label: "Proficiência", color: "var(--color-chart-1)" },
} satisfies ChartConfig;

type Phase = "idle" | "question" | "calculating" | "result" | "done";

export function DemoSection() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [history, setHistory] = useState<Step[]>([]);
  const [usedIds, setUsedIds] = useState<Set<number>>(new Set());
  const [theta, setTheta] = useState(0);
  const [se, setSe] = useState<number | null>(null);
  const [currentItem, setCurrentItem] = useState<(typeof ITEMS)[0] | null>(null);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);

  const selectNext = useCallback((t: number, used: Set<number>) => {
    let best = -1, bestI = -Infinity;
    for (const item of ITEMS) {
      if (used.has(item.id)) continue;
      const inf = infoItem(t, item.a, item.b, item.c);
      if (inf > bestI) { bestI = inf; best = item.id; }
    }
    return best >= 0 ? ITEMS[best] : null;
  }, []);

  const start = () => {
    setHistory([]);
    setUsedIds(new Set());
    setTheta(0);
    setSe(null);
    setLastCorrect(null);
    const first = ITEMS.reduce((a, b) => Math.abs(a.b) < Math.abs(b.b) ? a : b);
    setCurrentItem(first);
    setPhase("question");
  };

  const answer = (correct: boolean) => {
    if (!currentItem) return;
    setLastCorrect(correct);
    setPhase("calculating");

    const newUsed = new Set(usedIds);
    newUsed.add(currentItem.id);

    const responses = [...history.map((h) => (h.correct ? 1 : 0)), correct ? 1 : 0];
    const params = [...history.map((h) => {
      const item = ITEMS.find((it) => Math.abs(it.b - h.itemB) < 0.001)!;
      return { a: item.a, b: item.b, c: item.c };
    }), { a: currentItem.a, b: currentItem.b, c: currentItem.c }];

    const { theta: newTheta, se: newSe } = eapEstimate(responses, params);
    const step = history.length + 1;
    const entry: Step = { step, theta: +newTheta.toFixed(3), se: +newSe.toFixed(3), correct, itemB: currentItem.b };

    // Show calculating animation, then transition
    setTimeout(() => {
      const newHistory = [...history, entry];
      setHistory(newHistory);
      setUsedIds(newUsed);
      setTheta(+newTheta.toFixed(3));
      setSe(+newSe.toFixed(3));

      if (step >= 8 || (step >= 5 && newSe < 0.3)) {
        setCurrentItem(null);
        setPhase("done");
      } else {
        const next = selectNext(newTheta, newUsed);
        setCurrentItem(next);
        setPhase("result");
        // Auto-advance to next question
        setTimeout(() => setPhase("question"), 1800);
      }
    }, 1400);
  };

  const chartData = history.map((h) => ({
    step: h.step,
    theta: h.theta,
    upper: +(h.theta + h.se).toFixed(3),
    lower: +(h.theta - h.se).toFixed(3),
    correct: h.correct,
  }));

  return (
    <section className="py-20 sm:py-32 overflow-hidden">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <FadeIn>
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-foreground/[0.06] bg-foreground/[0.03] px-3.5 py-1.5 mb-5">
              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Interativo
              </span>
            </div>
            <h2 className="font-display tracking-[-0.03em]" style={{ fontSize: "clamp(1.6rem, 4vw, 2.8rem)" }}>
              Veja o CAT <span className="text-primary">em ação</span>
            </h2>
            <p className="mt-4 text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Simule respostas e observe o algoritmo recalculando a proficiência em tempo real. O aluno simulado tem proficiência θ = 0,8.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div className="rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] overflow-hidden">
            <AnimatePresence mode="wait">
              {phase === "idle" && <IdleScreen key="idle" onStart={start} />}

              {(phase === "question" || phase === "calculating" || phase === "result") && (
                <motion.div
                  key="active"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col"
                >
                  {/* Top: stats bar */}
                  <div className="px-5 pt-5 sm:px-6 sm:pt-6">
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatPill label="Questão" value={`${history.length + (phase === "question" ? 1 : 0)} de 8`} />
                      <StatPill label="θ estimado" value={theta >= 0 ? `+${theta.toFixed(2)}` : theta.toFixed(2)} highlight />
                      {se != null && <StatPill label="Erro padrão" value={se.toFixed(3)} />}
                      <StatPill label="Acertos" value={`${history.filter((h) => h.correct).length}`} />
                      <div className="flex-1" />
                      {/* History dots */}
                      <div className="flex gap-1">
                        {history.map((h, i) => (
                          <motion.div
                            key={i}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`w-5 h-5 rounded-full text-[9px] flex items-center justify-center font-bold ${
                              h.correct
                                ? "bg-emerald-500 text-white"
                                : "bg-red-500 text-white"
                            }`}
                          >
                            {h.correct ? "✓" : "✗"}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Main area: question left, chart right */}
                  <div className="grid lg:grid-cols-[1fr_1.3fr] gap-0">
                    {/* Right: question / calculating / result */}
                    <div className="p-5 sm:p-6 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-foreground/[0.06] min-h-[260px] order-1 lg:order-none">
                      <AnimatePresence mode="wait">
                        {phase === "question" && currentItem && (
                          <QuestionPanel
                            key={`q-${currentItem.id}`}
                            item={currentItem}
                            stepNum={history.length + 1}
                            theta={theta}
                            onAnswer={answer}
                          />
                        )}
                        {phase === "calculating" && (
                          <CalculatingPanel key="calc" lastCorrect={lastCorrect} />
                        )}
                        {phase === "result" && (
                          <ResultPanel key="res" theta={theta} se={se!} lastCorrect={lastCorrect!} />
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Chart */}
                    <div className="p-5 sm:p-6 order-2 lg:order-none">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-2">
                        Proficiência estimada
                      </p>
                      <ChartContainer config={chartConfig} className="aspect-[2/1] w-full">
                        <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
                          <defs>
                            <linearGradient id="dg" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.2} />
                              <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0.02} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                          <XAxis dataKey="step" tickLine={false} axisLine={false} fontSize={10} className="fill-muted-foreground" />
                          <YAxis domain={[-2, 2]} tickLine={false} axisLine={false} fontSize={10} className="fill-muted-foreground" ticks={[-2, -1, 0, 1, 2]} />
                          <ReferenceLine y={TRUE_THETA} strokeDasharray="6 3" stroke="var(--color-primary)" strokeOpacity={0.35} />
                          <ReferenceLine y={0} strokeDasharray="3 3" className="stroke-border" />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Area dataKey="upper" stroke="none" fill="var(--color-chart-1)" fillOpacity={0.06} type="monotone" dot={false} activeDot={false} />
                          <Area dataKey="lower" stroke="none" fill="var(--color-background)" fillOpacity={1} type="monotone" dot={false} activeDot={false} />
                          <Area
                            dataKey="theta"
                            stroke="var(--color-chart-1)"
                            strokeWidth={2}
                            fill="url(#dg)"
                            type="monotone"
                            dot={(props: any) => {
                              const { cx, cy, index } = props;
                              if (cx == null || cy == null) return <></>;
                              const e = chartData[index];
                              return (
                                <circle key={index} cx={cx} cy={cy} r={4}
                                  fill={e?.correct ? "hsl(142 71% 45%)" : "hsl(0 84% 60%)"}
                                  stroke="var(--color-background)" strokeWidth={2}
                                />
                              );
                            }}
                            isAnimationActive animationDuration={500}
                          />
                        </AreaChart>
                      </ChartContainer>
                      {/* Legend */}
                      <div className="flex items-center justify-center gap-4 mt-2 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Acerto</span>
                        <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-red-500" />Erro</span>
                        <span className="flex items-center gap-1"><span className="h-3 w-px bg-primary/40" style={{ borderLeft: "2px dashed" }} />θ real = {TRUE_THETA}</span>
                      </div>
                    </div>

                  </div>
                </motion.div>
              )}

              {phase === "done" && (
                <DoneScreen
                  key="done"
                  theta={theta}
                  se={se!}
                  history={history}
                  onReset={start}
                />
              )}
            </AnimatePresence>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ---- Sub-components ---- */

function IdleScreen({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-10 sm:p-14 text-center"
    >
      <div className="mx-auto max-w-xs space-y-5">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <svg className="h-7 w-7 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
          </svg>
        </div>
        <div>
          <p className="text-base font-semibold">Simulação interativa do CAT</p>
          <p className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed">
            Clique em <strong>Acertou</strong> ou <strong>Errou</strong> para cada questao e observe o algoritmo se adaptando em tempo real.
          </p>
        </div>
        <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
          <span>10 itens no pool</span>
          <span className="h-3 w-px bg-border" />
          <span>θ real = {TRUE_THETA}</span>
          <span className="h-3 w-px bg-border" />
          <span>Máx. 8 questões</span>
        </div>
        <Button onClick={onStart} size="lg" className="rounded-xl h-11 px-8 text-sm">
          Iniciar Simulação
        </Button>
      </div>
    </motion.div>
  );
}

function QuestionPanel({
  item,
  stepNum,
  theta,
  onAnswer,
}: {
  item: (typeof ITEMS)[0];
  stepNum: number;
  theta: number;
  onAnswer: (correct: boolean) => void;
}) {
  const pCorrect = prob3pl(TRUE_THETA, item.a, item.b, item.c);
  const info = infoItem(theta, item.a, item.b, item.c);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="w-full max-w-xs space-y-5"
    >
      <div className="text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Questão {stepNum}
        </p>
        <p className="text-[22px] font-display mt-1">O aluno respondeu...</p>
      </div>

      {/* Item info card */}
      <div className="rounded-xl bg-foreground/[0.03] border border-foreground/[0.06] p-4 space-y-2.5">
        <div className="flex justify-between text-[11px]">
          <span className="text-muted-foreground">Dificuldade do item</span>
          <span className="font-mono font-medium">b = {item.b.toFixed(1)}</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-muted-foreground">Chance de acerto</span>
          <span className="font-mono font-medium">{(pCorrect * 100).toFixed(0)}%</span>
        </div>
        {/* Visual probability bar */}
        <div className="h-1.5 rounded-full bg-foreground/[0.06] overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${pCorrect * 100}%` }}
            transition={{ duration: 0.6, ease: EASE }}
          />
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-muted-foreground">Informação</span>
          <span className="font-mono font-medium">{info.toFixed(2)}</span>
        </div>
      </div>

      {/* Answer buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={() => onAnswer(true)}
          className="rounded-xl h-12 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium"
        >
          Acertou
        </Button>
        <Button
          onClick={() => onAnswer(false)}
          className="rounded-xl h-12 bg-red-600 hover:bg-red-700 text-white text-sm font-medium"
        >
          Errou
        </Button>
      </div>
    </motion.div>
  );
}

function CalculatingPanel({ lastCorrect }: { lastCorrect: boolean | null }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-xs text-center space-y-5"
    >
      {/* Correct/wrong badge */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold ${
          lastCorrect ? "bg-emerald-500" : "bg-red-500"
        }`}
      >
        {lastCorrect ? "✓" : "✗"}
      </motion.div>

      <p className="text-sm font-medium">
        {lastCorrect ? "Resposta correta" : "Resposta incorreta"}
      </p>

      {/* Calculating steps animation */}
      <div className="space-y-2">
        {[
          "Atualizando verossimilhança...",
          "Calculando posterior via EAP...",
          "Selecionando próximo item...",
        ].map((text, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.35, duration: 0.3 }}
            className="flex items-center gap-2"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.35 + 0.2 }}
              className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.35 + 0.4 }}
                className="h-1.5 w-1.5 rounded-full bg-primary"
              />
            </motion.div>
            <span className="text-[12px] text-muted-foreground">{text}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function ResultPanel({
  theta,
  se,
  lastCorrect,
}: {
  theta: number;
  se: number;
  lastCorrect: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="w-full max-w-xs text-center space-y-3"
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
        Estimativa atualizada
      </p>
      <motion.p
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="text-3xl font-display"
      >
        θ = {theta >= 0 ? "+" : ""}{theta.toFixed(3)}
      </motion.p>
      <p className="text-[12px] text-muted-foreground">
        Erro padrão: {se.toFixed(3)}
      </p>
      <p className="text-[11px] text-muted-foreground/60">
        Selecionando próximo item...
      </p>
    </motion.div>
  );
}

function DoneScreen({
  theta,
  se,
  history,
  onReset,
}: {
  theta: number;
  se: number;
  history: Step[];
  onReset: () => void;
}) {
  const correct = history.filter((h) => h.correct).length;
  const error = Math.abs(theta - TRUE_THETA);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-6 sm:p-10"
    >
      <div className="mx-auto max-w-md space-y-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="mx-auto w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center"
        >
          <svg className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </motion.div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-2">
            Resultado da simulação
          </p>
          <p className="text-4xl font-display">θ = {theta >= 0 ? "+" : ""}{theta.toFixed(3)}</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-foreground/[0.03] border border-foreground/[0.06] p-3">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Erro</p>
            <p className="text-sm font-mono font-semibold mt-0.5">{error.toFixed(3)}</p>
          </div>
          <div className="rounded-xl bg-foreground/[0.03] border border-foreground/[0.06] p-3">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">SE</p>
            <p className="text-sm font-mono font-semibold mt-0.5">{se.toFixed(3)}</p>
          </div>
          <div className="rounded-xl bg-foreground/[0.03] border border-foreground/[0.06] p-3">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Acertos</p>
            <p className="text-sm font-mono font-semibold mt-0.5">{correct}/{history.length}</p>
          </div>
        </div>

        <p className="text-[12px] text-muted-foreground leading-relaxed">
          O algoritmo estimou a proficiência em <strong>{history.length} questões</strong> com
          erro de <strong>{error.toFixed(3)}</strong> em relação ao valor real (θ = {TRUE_THETA}).
        </p>

        <Button onClick={onReset} variant="outline" className="rounded-xl h-10 px-6 text-sm">
          Simular novamente
        </Button>
      </div>
    </motion.div>
  );
}

function StatPill({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] border ${
      highlight ? "border-primary/20 bg-primary/5" : "border-foreground/[0.06] bg-foreground/[0.02]"
    }`}>
      <span className="text-muted-foreground">{label}</span>
      <motion.span
        key={value}
        initial={{ opacity: 0, y: 2 }}
        animate={{ opacity: 1, y: 0 }}
        className={`font-mono font-semibold ${highlight ? "text-primary" : ""}`}
      >
        {value}
      </motion.span>
    </div>
  );
}
