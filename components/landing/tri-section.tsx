"use client";

import { FadeIn } from "./motion";
import { Latex } from "./latex";

export function TriSection() {
  return (
    <section className="relative py-20 sm:py-32 overflow-hidden">
      <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-primary/[0.03] blur-[120px]" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
          {/* Text */}
          <div>
            <FadeIn>
              <div className="inline-flex items-center gap-2 rounded-full border border-foreground/[0.06] bg-foreground/[0.03] px-3.5 py-1.5 mb-5">
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  Fundamentação
                </span>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h2
                className="font-display tracking-[-0.03em]"
                style={{ fontSize: "clamp(1.6rem, 4vw, 2.8rem)" }}
              >
                Modelo{" "}
                <span className="text-primary">3PL</span> da Teoria de
                Resposta ao Item
              </h2>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="mt-6 space-y-4 text-[15px] text-muted-foreground leading-relaxed">
                <p>
                  A TRI modela a probabilidade de acerto como função da
                  proficiência do aluno e das características do item,
                  independente da amostra de alunos ou itens utilizados.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="mt-6 space-y-3">
                {[
                  {
                    param: "a",
                    name: "Discriminação",
                    desc: "Capacidade do item de diferenciar alunos com proficiências próximas",
                    color: "text-primary",
                    bg: "bg-primary/10",
                  },
                  {
                    param: "b",
                    name: "Dificuldade",
                    desc: "Nível de proficiência necessário para 50% de chance de acerto (acima de c)",
                    color: "text-chart-2",
                    bg: "bg-chart-2/10",
                  },
                  {
                    param: "c",
                    name: "Acerto ao acaso",
                    desc: "Probabilidade de acerto por chute, mesmo com proficiência muito baixa",
                    color: "text-destructive",
                    bg: "bg-destructive/10",
                  },
                ].map((item) => (
                  <div
                    key={item.param}
                    className="flex items-start gap-3 rounded-xl border border-foreground/[0.06] bg-foreground/[0.02] p-4"
                  >
                    <div className={`mt-0.5 h-8 w-8 shrink-0 rounded-lg ${item.bg} flex items-center justify-center`}>
                      <span className={`text-sm font-mono font-bold ${item.color}`}>
                        {item.param}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item.name}</p>
                      <p className="text-[12px] text-muted-foreground leading-relaxed mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>

          {/* Fórmulas */}
          <FadeIn direction="right" delay={0.2}>
            <div className="rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] p-6 sm:p-8 backdrop-blur-sm space-y-8">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-4">
                  Função de Resposta ao Item
                </p>
                <div className="rounded-xl bg-foreground/[0.03] p-5 flex justify-center overflow-x-auto">
                  <Latex
                    math="P(\theta) = \textcolor{#ef4444}{c} + \frac{1 - \textcolor{#ef4444}{c}}{1 + e^{-D \textcolor{#6366f1}{a}(\theta - \textcolor{#3b82f6}{b})}}"
                    display
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-3 text-center">
                  <Latex math="D = 1{,}7" /> (constante de escala logística)
                </p>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-4">
                  Informação de Fisher
                </p>
                <div className="rounded-xl bg-foreground/[0.03] p-5 flex justify-center overflow-x-auto">
                  <Latex
                    math="I(\theta) = D^2 \textcolor{#6366f1}{a}^2 \cdot \frac{Q}{P} \cdot \frac{(P - \textcolor{#ef4444}{c})^2}{(1 - \textcolor{#ef4444}{c})^2}"
                    display
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-3 text-center">
                  Máxima próxima de <Latex math="\theta = b" />, usada na seleção adaptativa
                </p>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-4">
                  Estimação EAP
                </p>
                <div className="rounded-xl bg-foreground/[0.03] p-5 flex justify-center overflow-x-auto">
                  <Latex
                    math="\hat{\theta}_{EAP} = \frac{\sum_{k=1}^{Q} \theta_k \cdot L(\theta_k) \cdot w_k}{\sum_{k=1}^{Q} L(\theta_k) \cdot w_k}"
                    display
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-3 text-center">
                  Quadratura normal com <Latex math="Q = 100" /> pontos em{" "}
                  <Latex math="[-4,\; 4]" />
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
