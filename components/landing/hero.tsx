"use client";

import Link from "next/link";
import { FadeIn } from "./motion";
import { Button } from "@/components/ui/button";
import { ItemCurveHero } from "./item-curve-hero";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-primary/[0.04] blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-32 pb-20 sm:pt-40 sm:pb-28 md:pt-48 md:pb-36">
        <div className="grid gap-12 lg:grid-cols-[1fr_420px] lg:gap-16 items-center">
          {/* Text */}
          <div>
            <FadeIn delay={0}>
              <div className="inline-flex items-center gap-2 rounded-full border border-foreground/[0.06] bg-foreground/[0.03] px-3.5 py-1.5 mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  Avaliação Inteligente
                </span>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h1
                className="font-display tracking-[-0.03em] leading-[1.1]"
                style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)" }}
              >
                Medir proficiência com{" "}
                <span className="text-primary">precisão</span>,{" "}
                <br className="hidden sm:block" />
                usando menos{" "}
                <span className="font-display italic text-muted-foreground/60">
                  questões
                </span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.2}>
              <p className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-lg">
                Teste Adaptativo Computadorizado baseado no modelo 3PL da Teoria
                de Resposta ao Item. Cada questão é selecionada em tempo real
                para maximizar a informação sobre o aluno.
              </p>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="rounded-xl h-12 px-6 text-sm font-medium">
                  <Link href="/teste">Iniciar Teste</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="rounded-xl h-12 px-6 text-sm font-medium"
                >
                  <a href="#como-funciona">Como funciona</a>
                </Button>
              </div>
            </FadeIn>
          </div>

          {/* Interactive ICC curve */}
          <FadeIn direction="right" delay={0.3} className="hidden lg:block">
            <ItemCurveHero />
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
