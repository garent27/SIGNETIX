export type Difficulty = "E" | "M" | "H";

export interface Category {
  id: number;
  name: string;
  description: string;
  image: string | null;
  status: number;
  quantity: number;
}

export interface Module {
  id: number;
  category_id: number;
  sentence: string;
  gloss_sentence: string;
  difficulty: Difficulty;
}

export interface Gloss {
  id: number;
  name: string;
  link: string | null;
}

export interface Top5Entry {
  label: string;
  confidence: number;
}

/** Message shape sent by the backend over /ws/predict. */
export interface PredictionMessage {
  prediction?: string;
  confidence?: number;
  top_5?: Top5Entry[];
  scores?: Record<string, number>;
  calibrating?: boolean;
  progress?: number;
  error?: string;
  detail?: string;
}

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  E: "Easy",
  M: "Moderate",
  H: "Hard",
};
