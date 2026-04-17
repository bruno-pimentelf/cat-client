export interface AnoDetectado {
  numero: number;
  etapa: "EF" | "EM";
}

const EM_WORDS = /(EM|ensino\s*m[ée]dio|m[ée]dio)/i;
const ANO_PATTERN = /(\d{1,2})\s*[ºª]?\s*(ano|s[ée]rie|EF|EM|ensino|m[ée]dio)/i;

export function parseAno(turmaNome: string | null | undefined): AnoDetectado | null {
  if (!turmaNome) return null;
  const match = turmaNome.match(ANO_PATTERN);
  if (!match) return null;

  const numero = parseInt(match[1], 10);
  if (!Number.isFinite(numero) || numero < 1) return null;

  const isEM = EM_WORDS.test(turmaNome) || numero >= 1 && /EM|m[ée]dio/i.test(match[2]);

  if (isEM) {
    if (numero < 1 || numero > 3) return null;
    return { numero, etapa: "EM" };
  }

  if (numero < 1 || numero > 9) return null;
  return { numero, etapa: "EF" };
}

export function matchAnoInFilters(
  detectado: AnoDetectado,
  anosDisponiveis: string[]
): string | null {
  if (!anosDisponiveis?.length) return null;

  const num = detectado.numero;
  const etapa = detectado.etapa;

  for (const ano of anosDisponiveis) {
    const normalized = ano.trim();
    const anoMatch = normalized.match(/(\d{1,2})/);
    if (!anoMatch) continue;
    const anoNum = parseInt(anoMatch[1], 10);
    if (anoNum !== num) continue;

    const etapaMatch = etapa === "EM"
      ? /EM|m[ée]dio/i.test(normalized)
      : /EF|fundamental|\bano\b|s[ée]rie/i.test(normalized);
    if (etapaMatch) return ano;
  }

  return null;
}
