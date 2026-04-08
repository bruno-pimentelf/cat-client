export interface Alternativa {
  id: string;
  conteudo: string;
  ordem: number;
}

export interface TextoBase {
  id: string;
  codigo?: string;
  titulo?: string;
  conteudo?: string;
  referencia?: string;
}

export interface Item {
  id: string;
  codigo: string;
  conteudo: string;
  textosBase: TextoBase[];
  alternativas: Alternativa[];
}

export interface PreviousAnswer {
  correct: boolean;
  feedback?: string | null;
}

export interface HistoryStep {
  step: number;
  itemCodigo: string;
  theta: number;
  se: number | null;
  correct: boolean;
}

export interface SessionResponse {
  sessionId: string;
  step: number;
  totalSteps: number;
  theta: number;
  se: number | null;
  item: Item | null;
  previousAnswer: PreviousAnswer | null;
  completed: boolean;
  history: HistoryStep[] | null;
}

export interface FilterOption {
  disciplina: string;
  anos: string[];
  total: number;
}

export interface CreateSessionPayload {
  area?: string;
  disciplina?: string;
  anoEscolar?: string;
  initialTheta?: number;
  maxItems?: number;
  seThreshold?: number;
}
