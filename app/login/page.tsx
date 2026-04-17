"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { AuthApiError } from "@/lib/auth-api";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/teste";

  const { signIn, isAuthenticated, isHydrated } = useAuth();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.replace(next);
    }
  }, [isHydrated, isAuthenticated, next, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signIn({ email: email.trim(), senha });
      router.replace(next);
    } catch (err) {
      const message =
        err instanceof AuthApiError
          ? err.message
          : "Não foi possível entrar. Tente novamente.";
      setError(message);
      setLoading(false);
    }
  };

  if (!isHydrated || isAuthenticated) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-4">
          <Link href="/" className="inline-block">
            <Image
              src="/trieduc-logo.png"
              alt="TRIEduc"
              width={1075}
              height={274}
              priority
              className="h-10 w-auto dark:invert"
            />
          </Link>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Entrar</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Acesse sua conta para iniciar um teste.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive animate-in fade-in slide-in-from-top-1 duration-200"
            >
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
            >
              Login
            </label>
            <input
              id="email"
              type="text"
              autoComplete="username"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              disabled={loading}
              className="w-full rounded-xl border border-border/60 bg-card px-3.5 py-3 text-sm transition-all duration-150 placeholder:text-muted-foreground/60 hover:border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 disabled:opacity-60"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="senha"
              className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
            >
              Senha
            </label>
            <input
              id="senha"
              type="password"
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              className="w-full rounded-xl border border-border/60 bg-card px-3.5 py-3 text-sm transition-all duration-150 placeholder:text-muted-foreground/60 hover:border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 disabled:opacity-60"
            />
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={loading || !email || !senha}
            className="w-full rounded-xl h-12 text-sm font-medium"
          >
            {loading ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </Button>
        </form>

        <p className="text-center text-[11px] text-muted-foreground">
          Ao continuar, você concorda com os termos de uso.
        </p>
      </div>
    </div>
  );
}
