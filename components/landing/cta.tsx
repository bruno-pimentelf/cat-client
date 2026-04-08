"use client";

import Link from "next/link";
import { FadeIn } from "./motion";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="py-20 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <FadeIn>
          <div className="relative rounded-3xl border border-foreground/[0.06] bg-foreground/[0.02] overflow-hidden">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute left-1/2 bottom-0 -translate-x-1/2 h-[300px] w-[500px] rounded-full bg-primary/[0.06] blur-[100px]" />
            </div>

            <div className="relative px-6 py-16 sm:px-12 sm:py-20 text-center">
              <h2
                className="font-display tracking-[-0.03em]"
                style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.5rem)" }}
              >
                Pronto para medir{" "}
                <span className="text-primary">proficiência</span>?
              </h2>
              <p className="mt-4 text-muted-foreground max-w-md mx-auto leading-relaxed">
                Inicie um teste adaptativo agora. Selecione a disciplina,
                a série, e acompanhe a estimativa em tempo real.
              </p>
              <div className="mt-8">
                <Button asChild size="lg" className="rounded-xl h-12 px-8 text-sm font-medium">
                  <Link href="/teste">Começar Agora</Link>
                </Button>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
