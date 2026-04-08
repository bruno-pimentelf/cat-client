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
import { Badge } from "@/components/ui/badge";
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
  const pts = Array.from({ length: n }, (_, i) => -4 + (8 * i) / (n - 1));
  const w = pts.map((p) => Math.exp(-0.5 * p * p) / Math.sqrt(2 * Math.PI));
  const ws = w.reduce((a, b) => a + b, 0);
  w.forEach((_, i) => (w[i] /= ws));
  const ll = new Array(n).fill(0);
  for (let j = 0; j < responses.length; j++) {
    const { a, b, c } = params[j];
    for (let k = 0; k < n; k++) {
      let p = prob3pl(pts[k], a, b, c);
      p = Math.max(1e-10, Math.min(1 - 1e-10, p));
      ll[k] += responses[j] === 1 ? Math.log(p) : Math.log(1 - p);
    }
  }
  const post = ll.map((l, k) => Math.exp(l) * w[k]);
  const ps = post.reduce((a, b) => a + b, 0);
  post.forEach((_, i) => (post[i] /= ps));
  const theta = post.reduce((s, p, k) => s + pts[k] * p, 0);
  const se = Math.sqrt(post.reduce((s, p, k) => s + (pts[k] - theta) ** 2 * p, 0));
  return { theta, se };
}

const QUESTIONS = [
  { b: -1.11, a: 1.67, c: 0.20, correctIdx: 3,
    question: "Maria foi a uma papelaria e encontrou pacotes de canetas contendo 5 unidades cada. Ela decidiu levar 3 pacotes. Quantas canetas Maria comprou?",
    alternatives: ["2", "5", "8", "15"] },
  { b: -0.79, a: 1.97, c: 0.20, correctIdx: 2,
    question: "Paula compra 25 bananas, 12 mangas e 2 mamões para produzir salada de frutas. Quantas frutas, ao todo, Paula compra?",
    alternatives: ["14", "37", "39", "57"] },
  { b: -0.39, a: 2.36, c: 0.20, correctIdx: 3,
    question: "Jonas tinha figurinhas e deu 12 para Pedro, ficando com 64. Quantas figurinhas Jonas tinha?",
    alternatives: ["12", "52", "64", "76"] },
  { b: -0.13, a: 1.43, c: 0.20, correctIdx: 3,
    question: "Camila treina na academia 1h30 por dia. Se o treino começar às 9h15, terminará às:",
    alternatives: ["9h45", "10h15", "10h30", "10h45"] },
  { b: 0.09, a: 1.91, c: 0.19, correctIdx: 1,
    question: "Fabiana enrola 50 brigadeiros em 20 minutos. Mantendo esse ritmo, quantos minutos levará para enrolar 300 brigadeiros?",
    alternatives: ["70", "120", "370", "750"] },
  { b: 0.56, a: 1.01, c: 0.20, correctIdx: 1,
    question: "Um navio partiu do ponto A(1,3) ao ponto B(5,3) em linha reta, onde cada unidade equivale a 100 km. Qual a distância percorrida?",
    alternatives: ["300 km", "400 km", "1.200 km", "1.600 km"] },
  { b: 1.05, a: 2.48, c: 0.15, correctIdx: 0,
    question: "Fabrício reserva a quarta parte de seu salário na poupança. Se ganha R$ 4.800,00, quanto deposita?",
    alternatives: ["R$ 1.200,00", "R$ 1.600,00", "R$ 2.400,00", "R$ 4.796,00"] },
  { b: 1.50, a: 0.94, c: 0.20, correctIdx: 2,
    question: "João quer saber se um endereço fica do lado direito ou esquerdo da rua. Para isso, deve dividir o número por qual valor e verificar o resto?",
    alternatives: ["Zero", "Um", "Dois", "Três"] },
];

interface Step { step: number; theta: number; se: number; correct: boolean; qIdx: number; }

const EASE = [0.32, 0.72, 0, 1] as const;
const TRUE_THETA = 0.8;
const chartConfig = { theta: { label: "Proficiência", color: "var(--color-chart-1)" } } satisfies ChartConfig;

type Phase = "idle" | "question" | "calculating" | "result" | "done";

export function DemoSection() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [history, setHistory] = useState<Step[]>([]);
  const [usedQs, setUsedQs] = useState<Set<number>>(new Set());
  const [theta, setTheta] = useState(0);
  const [se, setSe] = useState<number | null>(null);
  const [curIdx, setCurIdx] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);

  const selectNext = useCallback((t: number, used: Set<number>) => {
    let best = -1, bestI = -Infinity;
    QUESTIONS.forEach((q, i) => {
      if (used.has(i)) return;
      const inf = infoItem(t, q.a, q.b, q.c);
      if (inf > bestI) { bestI = inf; best = i; }
    });
    return best;
  }, []);

  const start = () => {
    setHistory([]); setUsedQs(new Set()); setTheta(0); setSe(null);
    setLastCorrect(null); setSelected(null);
    // First item: closest to theta=0
    const first = QUESTIONS.reduce((bi, q, i) => Math.abs(q.b) < Math.abs(QUESTIONS[bi].b) ? i : bi, 0);
    setCurIdx(first);
    setPhase("question");
  };

  const submit = () => {
    if (curIdx === null || selected === null) return;
    const q = QUESTIONS[curIdx];
    const correct = selected === q.correctIdx;
    setLastCorrect(correct);
    setPhase("calculating");

    const newUsed = new Set(usedQs); newUsed.add(curIdx);
    const responses = [...history.map((h) => (h.correct ? 1 : 0)), correct ? 1 : 0];
    const params = [...history.map((h) => QUESTIONS[h.qIdx]), q];
    const { theta: nt, se: ns } = eapEstimate(responses, params.map((p) => ({ a: p.a, b: p.b, c: p.c })));
    const step = history.length + 1;
    const entry: Step = { step, theta: +nt.toFixed(3), se: +ns.toFixed(3), correct, qIdx: curIdx };

    setTimeout(() => {
      const nh = [...history, entry];
      setHistory(nh); setUsedQs(newUsed); setTheta(+nt.toFixed(3)); setSe(+ns.toFixed(3));
      setSelected(null);

      if (step >= 8 || (step >= 5 && ns < 0.3)) {
        setCurIdx(null); setPhase("done");
      } else {
        const next = selectNext(nt, newUsed);
        setCurIdx(next); setPhase("result");
        setTimeout(() => setPhase("question"), 1600);
      }
    }, 1400);
  };

  const chartData = history.map((h) => ({
    step: h.step, theta: h.theta,
    upper: +(h.theta + h.se).toFixed(3), lower: +(h.theta - h.se).toFixed(3),
    correct: h.correct,
  }));

  const curQ = curIdx !== null ? QUESTIONS[curIdx] : null;

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
              Responda questões reais e observe o algoritmo recalculando a proficiência em tempo real.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div className="rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] overflow-hidden">
            <AnimatePresence mode="wait">
              {phase === "idle" && (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -10 }} className="p-10 sm:p-14 text-center">
                  <div className="mx-auto max-w-sm space-y-5">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                      <svg className="h-7 w-7 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-base font-semibold">Simulação interativa do CAT</p>
                      <p className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed">
                        Responda questões de Matemática e veja como o algoritmo adaptativo seleciona os itens e estima a proficiência.
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
                      <span>8 questões reais</span>
                      <span className="h-3 w-px bg-border" />
                      <span>Modelo 3PL</span>
                      <span className="h-3 w-px bg-border" />
                      <span>Estimação EAP</span>
                    </div>
                    <Button onClick={start} size="lg" className="rounded-xl h-11 px-8 text-sm">
                      Iniciar Simulação
                    </Button>
                  </div>
                </motion.div>
              )}

              {(phase === "question" || phase === "calculating" || phase === "result") && (
                <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col">
                  {/* Stats bar */}
                  <div className="px-5 pt-5 sm:px-6 sm:pt-6">
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatPill label="Questão" value={`${history.length + (phase === "question" ? 1 : 0)} de 8`} />
                      <StatPill label="θ estimado" value={theta >= 0 ? `+${theta.toFixed(2)}` : theta.toFixed(2)} highlight />
                      {se != null && <StatPill label="Erro padrão" value={se.toFixed(3)} />}
                      <StatPill label="Acertos" value={`${history.filter((h) => h.correct).length}`} />
                      <div className="flex-1" />
                      <div className="flex gap-1">
                        {history.map((h, i) => (
                          <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }}
                            className={`w-5 h-5 rounded-full text-[9px] flex items-center justify-center font-bold ${h.correct ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
                            {h.correct ? "✓" : "✗"}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Main: question left, chart right */}
                  <div className="grid lg:grid-cols-[1fr_1.1fr] gap-0">
                    {/* LEFT: Question */}
                    <div className="p-5 sm:p-6 border-b lg:border-b-0 lg:border-r border-foreground/[0.06] min-h-[320px] flex items-center">
                      <AnimatePresence mode="wait">
                        {phase === "question" && curQ && (
                          <motion.div key={`q-${curIdx}`} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }}
                            transition={{ duration: 0.35, ease: EASE }} className="w-full space-y-5">
                            <div>
                              <Badge variant="secondary" className="text-[10px] mb-3">Questão {history.length + 1}</Badge>
                              <p className="text-[15px] leading-relaxed">{curQ.question}</p>
                            </div>

                            <div className="space-y-2">
                              {curQ.alternatives.map((alt, i) => (
                                <button key={i} type="button" onClick={() => setSelected(i)}
                                  className={`w-full text-left flex items-center gap-3 rounded-xl border p-3 transition-all duration-150 cursor-pointer ${
                                    selected === i
                                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                                      : "border-foreground/[0.06] hover:border-foreground/10 hover:bg-foreground/[0.02]"
                                  }`}>
                                  <span className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold transition-colors ${
                                    selected === i ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                  }`}>
                                    {String.fromCharCode(65 + i)}
                                  </span>
                                  <span className="text-sm">{alt}</span>
                                </button>
                              ))}
                            </div>

                            <Button onClick={submit} disabled={selected === null} className="w-full rounded-xl h-11 text-sm font-medium">
                              Confirmar Resposta
                            </Button>
                          </motion.div>
                        )}

                        {phase === "calculating" && (
                          <motion.div key="calc" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                            className="w-full text-center space-y-5 py-8">
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
                              className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold ${lastCorrect ? "bg-emerald-500" : "bg-red-500"}`}>
                              {lastCorrect ? "✓" : "✗"}
                            </motion.div>
                            <p className="text-sm font-medium">{lastCorrect ? "Resposta correta!" : "Resposta incorreta"}</p>
                            <div className="space-y-2 max-w-[200px] mx-auto">
                              {["Atualizando verossimilhança...", "Calculando posterior via EAP...", "Selecionando próximo item..."].map((t, i) => (
                                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.35 }}
                                  className="flex items-center gap-2">
                                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.35 + 0.2 }}
                                    className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.35 + 0.4 }}
                                      className="h-1.5 w-1.5 rounded-full bg-primary" />
                                  </motion.div>
                                  <span className="text-[12px] text-muted-foreground">{t}</span>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        )}

                        {phase === "result" && (
                          <motion.div key="res" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="w-full text-center space-y-3 py-8">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Estimativa atualizada</p>
                            <motion.p initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-3xl font-display">
                              θ = {theta >= 0 ? "+" : ""}{theta.toFixed(3)}
                            </motion.p>
                            <p className="text-[12px] text-muted-foreground">Erro padrão: {se?.toFixed(3)}</p>
                            <p className="text-[11px] text-muted-foreground/60 animate-pulse">Carregando próxima questão...</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* RIGHT: Chart + stats */}
                    <div className="p-5 sm:p-6 space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Evolução da proficiência</p>
                          <div className="flex items-center gap-2.5 text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Acerto</span>
                            <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-red-500" />Erro</span>
                          </div>
                        </div>
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
                            <ReferenceLine y={0} strokeDasharray="3 3" className="stroke-border" />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Area dataKey="upper" stroke="none" fill="var(--color-chart-1)" fillOpacity={0.06} type="monotone" dot={false} activeDot={false} />
                            <Area dataKey="lower" stroke="none" fill="var(--color-background)" fillOpacity={1} type="monotone" dot={false} activeDot={false} />
                            <Area dataKey="theta" stroke="var(--color-chart-1)" strokeWidth={2} fill="url(#dg)" type="monotone"
                              dot={(props: any) => {
                                const { cx, cy, index } = props;
                                if (cx == null || cy == null) return <></>;
                                const e = chartData[index];
                                return <circle key={index} cx={cx} cy={cy} r={4} fill={e?.correct ? "hsl(142 71% 45%)" : "hsl(0 84% 60%)"} stroke="var(--color-background)" strokeWidth={2} />;
                              }}
                              isAnimationActive animationDuration={500}
                            />
                          </AreaChart>
                        </ChartContainer>
                      </div>

                      {/* Item info */}
                      {curQ && phase === "question" && (
                        <motion.div key={`info-${curIdx}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className="rounded-xl bg-foreground/[0.03] border border-foreground/[0.06] p-4 space-y-2">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Parâmetros do item atual</p>
                          <div className="grid grid-cols-3 gap-3 text-center">
                            <div>
                              <p className="text-[10px] text-muted-foreground">Discriminação</p>
                              <p className="text-sm font-mono font-semibold text-primary">a = {curQ.a.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-muted-foreground">Dificuldade</p>
                              <p className="text-sm font-mono font-semibold text-chart-2">b = {curQ.b >= 0 ? "+" : ""}{curQ.b.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-muted-foreground">Acerto ao acaso</p>
                              <p className="text-sm font-mono font-semibold text-destructive">c = {curQ.c.toFixed(2)}</p>
                            </div>
                          </div>
                          <div className="pt-1 text-[11px] text-muted-foreground">
                            Informação neste θ: <span className="font-mono font-medium text-foreground">{infoItem(theta, curQ.a, curQ.b, curQ.c).toFixed(2)}</span>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {phase === "done" && (
                <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 sm:p-10">
                  <div className="mx-auto max-w-md space-y-6 text-center">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      className="mx-auto w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <svg className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                    </motion.div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-2">Resultado da simulação</p>
                      <p className="text-4xl font-display">θ = {theta >= 0 ? "+" : ""}{theta.toFixed(3)}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-foreground/[0.03] border border-foreground/[0.06] p-3">
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Erro padrão</p>
                        <p className="text-sm font-mono font-semibold mt-0.5">{se?.toFixed(3)}</p>
                      </div>
                      <div className="rounded-xl bg-foreground/[0.03] border border-foreground/[0.06] p-3">
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Acertos</p>
                        <p className="text-sm font-mono font-semibold mt-0.5">{history.filter((h) => h.correct).length}/{history.length}</p>
                      </div>
                    </div>
                    <p className="text-[12px] text-muted-foreground leading-relaxed">
                      O algoritmo estimou a proficiência em <strong>{history.length} questões</strong> usando
                      seleção adaptativa por máxima informação de Fisher.
                    </p>
                    <Button onClick={start} variant="outline" className="rounded-xl h-10 px-6 text-sm">
                      Simular novamente
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function StatPill({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] border ${
      highlight ? "border-primary/20 bg-primary/5" : "border-foreground/[0.06] bg-foreground/[0.02]"
    }`}>
      <span className="text-muted-foreground">{label}</span>
      <motion.span key={value} initial={{ opacity: 0, y: 2 }} animate={{ opacity: 1, y: 0 }}
        className={`font-mono font-semibold ${highlight ? "text-primary" : ""}`}>
        {value}
      </motion.span>
    </div>
  );
}
