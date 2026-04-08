"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Item, PreviousAnswer } from "@/lib/types";

interface QuestionCardProps {
  item: Item;
  step: number;
  totalSteps: number;
  onSubmit: (alternativaId: string) => void;
  loading: boolean;
  feedback: PreviousAnswer | null;
  onFeedbackDone: () => void;
}

export function QuestionCard({
  item,
  step,
  totalSteps,
  onSubmit,
  loading,
  feedback,
  onFeedbackDone,
}: QuestionCardProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const feedbackRef = useRef<HTMLDivElement>(null);

  // Quando recebe feedback, scroll para ele
  useEffect(() => {
    if (feedback && submitted) {
      setTimeout(() => {
        feedbackRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  }, [feedback, submitted]);

  // Resetar estado quando muda o item
  useEffect(() => {
    setSelected(null);
    setSubmitted(false);
  }, [item.id]);

  const handleSubmit = () => {
    if (selected) {
      setSubmitted(true);
      onSubmit(selected);
    }
  };

  const showingFeedback = submitted && feedback;

  return (
    <div className="space-y-5">
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
            Questão {step}/{totalSteps}
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
            const isDisabled = showingFeedback;
            return (
              <button
                key={alt.id}
                type="button"
                onClick={() => !isDisabled && setSelected(alt.id)}
                disabled={!!isDisabled}
                className={`
                  w-full text-left flex items-start gap-3 rounded-xl border p-3.5 md:p-4
                  transition-all duration-200
                  ${isDisabled ? "cursor-default" : "cursor-pointer"}
                  ${
                    isSelected && showingFeedback
                      ? feedback?.correct
                        ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-700"
                        : "border-red-400 bg-red-50 dark:bg-red-950/30 dark:border-red-700"
                      : isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "border-border/60 hover:border-border hover:bg-muted/40"
                  }
                  ${isDisabled && !isSelected ? "opacity-50" : ""}
                `}
              >
                <span
                  className={`
                    shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold
                    transition-colors duration-200
                    ${
                      isSelected && showingFeedback
                        ? feedback?.correct
                          ? "bg-emerald-500 text-white"
                          : "bg-red-500 text-white"
                        : isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                    }
                  `}
                >
                  {isSelected && showingFeedback
                    ? feedback?.correct ? "✓" : "✗"
                    : String.fromCharCode(65 + idx)
                  }
                </span>
                <div
                  className="text-sm leading-relaxed pt-0.5 [&_p]:m-0"
                  dangerouslySetInnerHTML={{ __html: alt.conteudo }}
                />
              </button>
            );
          })}
      </div>

      {/* Botão de confirmar (esconde durante feedback) */}
      {!showingFeedback && (
        <Button
          onClick={handleSubmit}
          disabled={!selected || loading}
          size="lg"
          className="w-full rounded-xl h-12 text-sm font-medium"
        >
          {loading ? "Enviando..." : "Confirmar Resposta"}
        </Button>
      )}

      {/* Feedback inline - aparece abaixo das alternativas */}
      {showingFeedback && (
        <div
          ref={feedbackRef}
          className={`rounded-xl p-4 border animate-in fade-in slide-in-from-bottom-3 duration-300 ${
            feedback.correct
              ? "bg-emerald-50 border-emerald-200/60 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800/40 dark:text-emerald-200"
              : "bg-red-50 border-red-200/60 text-red-900 dark:bg-red-950/40 dark:border-red-800/40 dark:text-red-200"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                feedback.correct ? "bg-emerald-500" : "bg-red-500"
              }`}
            >
              {feedback.correct ? "✓" : "✗"}
            </span>
            <span className="text-sm font-semibold">
              {feedback.correct ? "Resposta correta!" : "Resposta incorreta"}
            </span>
          </div>
          {feedback.feedback && (
            <div
              className="text-[13px] leading-relaxed opacity-90 [&_p]:m-0 ml-8"
              dangerouslySetInnerHTML={{ __html: feedback.feedback }}
            />
          )}
        </div>
      )}

      {/* Botão próxima questão (aparece após feedback carregar) */}
      {showingFeedback && (
        <Button
          onClick={() => {
            setSelected(null);
            setSubmitted(false);
            onFeedbackDone();
          }}
          size="lg"
          className="w-full rounded-xl h-12 text-sm font-medium animate-in fade-in duration-300"
        >
          Próxima Questão
        </Button>
      )}
    </div>
  );
}
