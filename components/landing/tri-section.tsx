"use client";

import { FadeIn } from "./motion";

export function TriSection() {
  return (
    <section className="relative py-20 sm:py-32 overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-primary/[0.03] blur-[120px]" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
          {/* Text */}
          <div>
            <FadeIn>
              <div className="inline-flex items-center gap-2 rounded-full border border-foreground/[0.06] bg-foreground/[0.03] px-3.5 py-1.5 mb-5">
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  Fundamentacao
                </span>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h2
                className="font-display tracking-[-0.03em]"
                style={{ fontSize: "clamp(1.6rem, 4vw, 2.8rem)" }}
              >
                Modelo <span className="text-primary">3PL</span> da Teoria de Resposta ao Item
              </h2>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="mt-6 space-y-4 text-[15px] text-muted-foreground leading-relaxed">
                <p>
                  A TRI modela a probabilidade de acerto como funcao da
                  proficiencia do aluno e das caracteristicas do item,
                  independente da amostra de alunos ou itens utilizados.
                </p>
                <p>
                  O modelo logistico de 3 parametros (3PL) considera:
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="mt-6 space-y-3">
                {[
                  {
                    param: "a",
                    name: "Discriminacao",
                    desc: "Capacidade do item de diferenciar alunos com proficiencias proximas",
                    color: "bg-primary",
                  },
                  {
                    param: "b",
                    name: "Dificuldade",
                    desc: "Nivel de proficiencia necessario para 50% de chance de acerto (acima de c)",
                    color: "bg-chart-2",
                  },
                  {
                    param: "c",
                    name: "Acerto ao acaso",
                    desc: "Probabilidade de acerto por chute, mesmo com proficiencia muito baixa",
                    color: "bg-destructive",
                  },
                ].map((item) => (
                  <div
                    key={item.param}
                    className="flex items-start gap-3 rounded-xl border border-foreground/[0.06] bg-foreground/[0.02] p-4"
                  >
                    <div className={`mt-0.5 h-8 w-8 shrink-0 rounded-lg ${item.color}/10 flex items-center justify-center`}>
                      <span className={`text-sm font-mono font-bold ${item.color === "bg-primary" ? "text-primary" : item.color === "bg-chart-2" ? "text-chart-2" : "text-destructive"}`}>
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

          {/* Formula visual */}
          <FadeIn direction="right" delay={0.2}>
            <div className="rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] p-6 sm:p-8 backdrop-blur-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-6">
                Funcao de Resposta ao Item
              </p>

              {/* Formula */}
              <div className="rounded-xl bg-foreground/[0.03] p-5 text-center mb-8">
                <p className="text-lg sm:text-xl font-mono tracking-tight">
                  P(θ) = <span className="text-destructive">c</span> +{" "}
                  <span className="text-muted-foreground">(1 - <span className="text-destructive">c</span>)</span> /{" "}
                  <span className="text-muted-foreground">(1 + e</span>
                  <sup className="text-xs">
                    -D<span className="text-primary">a</span>(θ - <span className="text-chart-2">b</span>)
                  </sup>
                  <span className="text-muted-foreground">)</span>
                </p>
                <p className="text-[11px] text-muted-foreground mt-3">
                  D = 1.7 (constante de escala)
                </p>
              </div>

              {/* Info visual */}
              <div className="space-y-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Informacao de Fisher
                </p>
                <div className="rounded-xl bg-foreground/[0.03] p-5 text-center">
                  <p className="text-base font-mono tracking-tight">
                    I(θ) = D<sup>2</sup><span className="text-primary">a</span><sup>2</sup>{" "}
                    <span className="text-muted-foreground">·</span>{" "}
                    Q/P{" "}
                    <span className="text-muted-foreground">·</span>{" "}
                    (P - <span className="text-destructive">c</span>)<sup>2</sup> / (1 - <span className="text-destructive">c</span>)<sup>2</sup>
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-3">
                    Maximo proximo de θ = b, usado para selecao adaptativa
                  </p>
                </div>
              </div>

              {/* EAP */}
              <div className="mt-6 space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Estimacao EAP
                </p>
                <p className="text-[12px] text-muted-foreground leading-relaxed">
                  Esperanca a posteriori com quadratura normal de 100 pontos.
                  A distribuicao posterior e proporcional a verossimilhanca multiplicada
                  pela priori (normal padrao), integrada numericamente.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
