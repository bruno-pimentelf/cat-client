"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-transparent backdrop-blur-xl bg-background/80">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-sm font-mono font-bold tracking-[0.15em]">CAT</span>
        </Link>

        <nav className="hidden sm:flex items-center gap-6">
          <a href="#como-funciona" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">
            Como funciona
          </a>
          <a href="#metodologia" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">
            Metodologia
          </a>
        </nav>

        <Button asChild size="sm" className="rounded-lg h-8 px-4 text-xs font-medium">
          <Link href="/teste">Iniciar Teste</Link>
        </Button>
      </div>
    </header>
  );
}
