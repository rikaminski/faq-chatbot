/**
 * Local embeddings using @huggingface/transformers
 * Model: all-MiniLM-L6-v2 (~22MB, 384 dimensions)
 */
import { pipeline, type FeatureExtractionPipeline } from '@huggingface/transformers';

let embedder: FeatureExtractionPipeline | null = null;

/** Initialize the embeddings model (lazy loading) */
async function getEmbedder(): Promise<FeatureExtractionPipeline> {
    if (!embedder) {
        console.log('🔄 Loading embedding model (first time only)...');
        // Type cast to any is needed because the pipeline function has too many overloads
        // which causes TypeScript to hit a complexity limit when inferring the return type.
        embedder = await (pipeline as any)('feature-extraction', /*'Xenova/all-MiniLM-L6-v2',*/ 'Xenova/multilingual-e5-small' ,{
            dtype: 'fp32',
        });
        console.log('✅ Embedding model loaded!');
    }
    return embedder!;
}

/** Generate embedding for a single text */
export async function getEmbedding(text: string): Promise<number[]> {
    const model = await getEmbedder();
    const output = await model(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data as Float32Array);
}

/** Generate embeddings for multiple texts */
export async function getEmbeddings(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];
    for (const text of texts) {
        embeddings.push(await getEmbedding(text));
    }
    return embeddings;
}
