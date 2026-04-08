"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Item, PreviousAnswer } from "@/lib/types";

interface QuestionCardProps {
  item: Item;
  step: number;
  totalSteps: number;
  previousAnswer: PreviousAnswer | null;
  onSubmit: (alternativaId: string) => void;
  loading: boolean;
}

export function QuestionCard({
  item,
  step,
  totalSteps,
  previousAnswer,
  onSubmit,
  loading,
}: QuestionCardProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSubmit = () => {
    if (selected) {
      onSubmit(selected);
      setSelected(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Feedback da resposta anterior */}
      {previousAnswer && <FeedbackBanner answer={previousAnswer} />}

      {/* Textos base */}
      {item.textosBase.map((tb) => (
        <div
          key={tb.id}
          className="rounded-xl border border-border/60 bg-muted/30 p-4 md:p-5"
        >
          {tb.titulo && (
            <p className="text-sm font-semibold mb-2">{tb.titulo}</p>
          )}
          {tb.conteudo && (
            <div
              className="prose prose-sm dark:prose-invert max-w-none [&_img]:max-w-full [&_img]:rounded-lg"
              dangerouslySetInnerHTML={{ __html: tb.conteudo }}
            />
          )}
          {tb.referencia && (
            <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
              {tb.referencia}
            </p>
          )}
        </div>
      ))}

      {/* Enunciado */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 mb-3">
          <Badge
            variant="secondary"
            className="text-[11px] font-medium px-2 py-0.5"
          >
            Questao {step}/{totalSteps}
          </Badge>
          <span className="text-[11px] text-muted-foreground font-mono">
            {item.codigo}
          </span>
        </div>
        <div
          className="text-[15px] leading-relaxed"
          dangerouslySetInnerHTML={{ __html: item.conteudo }}
        />
      </div>

      {/* Alternativas */}
      <div className="space-y-2">
        {item.alternativas
          .sort((a, b) => a.ordem - b.ordem)
          .map((alt, idx) => {
            const isSelected = selected === alt.id;
            return (
              <button
                key={alt.id}
                type="button"
                onClick={() => setSelected(alt.id)}
                className={`
                  w-full text-left flex items-start gap-3 rounded-xl border p-3.5 md:p-4
                  transition-all duration-150 cursor-pointer
                  ${
                    isSelected
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border/60 hover:border-border hover:bg-muted/40"
                  }
                `}
              >
                <span
                  className={`
                    shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold
                    transition-colors duration-150
                    ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }
                  `}
                >
                  {String.fromCharCode(65 + idx)}
                </span>
                <div
                  className="text-sm leading-relaxed pt-0.5 [&_p]:m-0"
                  dangerouslySetInnerHTML={{ __html: alt.conteudo }}
                />
              </button>
            );
          })}
      </div>

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={!selected || loading}
        size="lg"
        className="w-full rounded-xl h-12 text-sm font-medium"
      >
        {loading ? "Enviando..." : "Confirmar Resposta"}
      </Button>
    </div>
  );
}

export function FeedbackBanner({
  answer,
}: {
  answer: { correct: boolean; feedback?: string | null };
}) {
  return (
    <div
      className={`rounded-xl p-4 text-sm border transition-colors ${
        answer.correct
          ? "bg-emerald-50 border-emerald-200/60 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800/40 dark:text-emerald-200"
          : "bg-red-50 border-red-200/60 text-red-900 dark:bg-red-950/40 dark:border-red-800/40 dark:text-red-200"
      }`}
    >
      <p className="font-semibold text-[13px] mb-1">
        {answer.correct ? "Correto!" : "Incorreto"}
      </p>
      {answer.feedback && (
        <div
          className="text-[12px] leading-relaxed opacity-90 [&_p]:m-0"
          dangerouslySetInnerHTML={{ __html: answer.feedback }}
        />
      )}
    </div>
  );
}
