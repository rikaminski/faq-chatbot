/**
 * Pre-compute embeddings for all FAQ items
 * Run: bun run precompute
 */
import { getPassageEmbedding } from '../src/embeddings';
import type { FAQItem } from '../src/types';

const inputPath = './data/faqs.example.json';
const outputPath = './data/faqs.json';

async function main() {
    console.log('🚀 Pre-computing embeddings for FAQ items...\n');

    // Load FAQ
    const file = Bun.file(inputPath);
    if (!(await file.exists())) {
        console.error(`❌ File not found: ${inputPath}`);
        console.log('Create your FAQ file first, or copy faqs.example.json');
        process.exit(1);
    }

    const faqs: FAQItem[] = await file.json();
    console.log(`📚 Loaded ${faqs.length} FAQ items\n`);

    // Generate embeddings for each question
    for (let i = 0; i < faqs.length; i++) {
        const faq = faqs[i];
        console.log(`[${i + 1}/${faqs.length}] Processing: "${faq.pergunta.slice(0, 50)}..."`);

        try {
            faq.embedding = await getPassageEmbedding(faq.pergunta);
            console.log(`  ✅ Generated ${faq.embedding.length}-dim embedding`);
        } catch (e) {
            console.error(`  ❌ Error:`, e);
        }
    }

    // Save output
    await Bun.write(outputPath, JSON.stringify(faqs, null, 2));
    console.log(`\n💾 Saved to ${outputPath}`);
    console.log('✅ Done! You can now run: bun run dev');
}

main().catch(console.error);
