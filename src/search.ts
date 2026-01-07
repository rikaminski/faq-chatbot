/**
 * Semantic search using cosine similarity
 */
import type { FAQItem, SearchResult, ConfidenceLevel } from './types';

/** Calculate cosine similarity between two vectors */
export function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }

    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 0 : dot / denom;
}

/** Find best matching FAQs for a query embedding */
export function findBestMatches(
    queryEmbedding: number[],
    faqs: FAQItem[],
    topK: number = 3
): SearchResult[] {
    const results: SearchResult[] = faqs
        .filter(faq => faq.embedding)
        .map(faq => ({
            item: faq,
            similarity: cosineSimilarity(queryEmbedding, faq.embedding!)
        }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, topK);

    return results;
}

/** Determine confidence level based on similarity score */
export function determineConfidence(similarity: number): ConfidenceLevel {
    if (similarity >= 0.7) return 'high';
    if (similarity >= 0.5) return 'medium';
    return 'low';
}

/** Check if text is a greeting */
export function isGreeting(text: string): boolean {
    const normalized = text.toLowerCase().trim();
    const greetings = ['oi', 'olá', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'hey', 'hello', 'hi', 'e ai', 'eai'];
    return greetings.some(g => normalized === g || normalized.startsWith(g + ' '));
}

/** Check if text is a thanks message */
export function isThanks(text: string): boolean {
    const normalized = text.toLowerCase().trim();
    const thanks = ['obrigado', 'obrigada', 'valeu', 'thanks', 'vlw', 'brigado', 'brigada'];
    return thanks.some(t => normalized.includes(t));
}
