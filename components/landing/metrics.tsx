"use client";

import { FadeIn, Stagger, StaggerItem, AnimatedCounter } from "./motion";

export function Metrics() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Stagger className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6" staggerDelay={0.1}>
          {[
            { value: 2353, suffix: "", label: "Itens calibrados", sub: "no banco de questões" },
            { value: 8, suffix: "", label: "Disciplinas", sub: "do ensino fundamental" },
            { value: 20, suffix: "", label: "Questões máx.", sub: "por avaliação" },
            { value: 100, suffix: "", label: "Pontos de quadratura", sub: "na estimação EAP" },
          ].map((m) => (
            <StaggerItem key={m.label}>
              <div className="rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] p-5 sm:p-6 text-center">
                <p className="text-3xl sm:text-4xl font-display tracking-tight text-foreground">
                  <AnimatedCounter value={m.value} suffix={m.suffix} />
                </p>
                <p className="text-sm font-medium mt-2">{m.label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{m.sub}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
