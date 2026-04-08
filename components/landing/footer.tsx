export function Footer() {
  return (
    <footer className="border-t border-foreground/[0.06] py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono font-bold tracking-[0.1em] text-foreground">CAT</span>
            <span className="text-[11px] text-muted-foreground">Teste Adaptativo Computadorizado</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Baseado na Teoria de Resposta ao Item · Modelo 3PL · Escala SAEB
          </p>
        </div>
      </div>
    </footer>
  );
}
