/** FAQ Item structure */
export interface FAQItem {
    id: number;
    pergunta: string;
    resposta: string;
    embedding?: number[];
}

/** Search result with similarity score */
export interface SearchResult {
    item: FAQItem;
    similarity: number;
}

/** Chat message for rendering */
export interface ChatMessage {
    text: string;
    sender: 'user' | 'bot';
    suggestions?: string[];
}

/** Confidence levels */
export type ConfidenceLevel = 'high' | 'medium' | 'low';
