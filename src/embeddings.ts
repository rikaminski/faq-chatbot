/**
 * Local embeddings using @huggingface/transformers
 * Model: multilingual-e5-small (~120MB, 384 dimensions)
 * 
 * IMPORTANT: E5 models require prefixes:
 * - "query: " for search queries
 * - "passage: " for documents/FAQs
 */
import { pipeline, type FeatureExtractionPipeline } from '@huggingface/transformers';

let embedder: FeatureExtractionPipeline | null = null;

/** Initialize the embeddings model (lazy loading) */
async function getEmbedder(): Promise<FeatureExtractionPipeline> {
    if (!embedder) {
        console.log('🔄 Loading embedding model (first time only)...');
        // Type cast to any is needed because the pipeline function has too many overloads
        // which causes TypeScript to hit a complexity limit when inferring the return type.
        embedder = await (pipeline as any)('feature-extraction', 'Xenova/multilingual-e5-small', {
            dtype: 'fp32',
        });
        console.log('✅ Embedding model loaded!');
    }
    return embedder!;
}

/** Generate embedding for a query (user input) */
export async function getQueryEmbedding(text: string): Promise<number[]> {
    const model = await getEmbedder();
    const output = await model(`query: ${text}`, { pooling: 'mean', normalize: true });
    return Array.from(output.data as Float32Array);
}

/** Generate embedding for a passage (FAQ question) */
export async function getPassageEmbedding(text: string): Promise<number[]> {
    const model = await getEmbedder();
    const output = await model(`passage: ${text}`, { pooling: 'mean', normalize: true });
    return Array.from(output.data as Float32Array);
}

/** Generate embedding for a single text (legacy, use getQueryEmbedding or getPassageEmbedding) */
export async function getEmbedding(text: string): Promise<number[]> {
    return getQueryEmbedding(text);
}

/** Generate passage embeddings for multiple texts (for precompute) */
export async function getPassageEmbeddings(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];
    for (const text of texts) {
        embeddings.push(await getPassageEmbedding(text));
    }
    return embeddings;
}
