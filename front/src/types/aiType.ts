// types/aiType.ts
export interface AISuggestion {
  blockId: string;
  originalText: string;
  suggestedText: string;
  isLoading: boolean;
  isVisible: boolean;
}

export type AIGenerateFunction = (_text: string) => Promise<string>;