/**
 * FAQ Chatbot Server - Elysia + HTMX
 */
import { Elysia } from 'elysia';
import { staticPlugin } from '@elysiajs/static';
import { html } from '@elysiajs/html';
import { getEmbedding } from './embeddings';
import { findBestMatches, determineConfidence, isGreeting, isThanks } from './search';
import type { FAQItem } from './types';

// Load FAQ data
const faqPath = './data/faqs.json';
let faqs: FAQItem[] = [];

try {
    const file = Bun.file(faqPath);
    if (await file.exists()) {
        faqs = await file.json();
        console.log(`📚 Loaded ${faqs.length} FAQs`);
    } else {
        console.warn('⚠️  FAQ file not found. Run: bun run precompute');
    }
} catch (e) {
    console.error('❌ Error loading FAQs:', e);
}

// Greeting responses
const greetingResponses = [
    'Olá! Como posso ajudar? 👋',
    'Oi! Em que posso ajudar?',
    'Olá! Estou aqui para esclarecer suas dúvidas.',
];

// Thanks responses
const thanksResponses = [
    'De nada! Fico feliz em ajudar! 😊',
    'Disponha! Sempre que precisar.',
    'Foi um prazer ajudar! 👍',
];

// No answer message
const noAnswerMessage = 'Hmm, não tenho informações sobre isso no meu FAQ. 🤔 Posso ajudar apenas com perguntas relacionadas a este chatbot e suas funcionalidades.';

// Random pick
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Render message HTML
function renderMessage(text: string, sender: 'user' | 'bot', suggestions?: string[]): string {
    const msgClass = sender === 'user' ? 'msg-user' : 'msg-bot';
    let html = `<div class="message ${msgClass}">${escapeHtml(text)}</div>`;

    if (suggestions && suggestions.length > 0) {
        html += '<div class="suggestions">';
        html += '<span class="suggestions-label">Talvez você quis perguntar:</span>';
        for (const s of suggestions) {
            html += `<button class="suggestion-btn" hx-post="/api/chat" hx-target="#messages" hx-swap="beforeend" hx-vals='{"query": "${escapeHtml(s)}"}'>${escapeHtml(s)}</button>`;
        }
        html += '</div>';
    }

    return html;
}

// Escape HTML
function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Create Elysia app
const app = new Elysia()
    .use(html())
    .use(staticPlugin({ prefix: '/public', assets: './public' }))

    // Serve index.html
    .get('/', () => Bun.file('./views/index.html'))

    // Health check
    .get('/health', () => ({ status: 'ok', faqs: faqs.length }))

    // Chat endpoint (HTMX)
    .post('/api/chat', async ({ body }) => {
        const query = (body as any)?.query?.trim() || '';

        if (!query) {
            return renderMessage('Por favor, digite uma pergunta.', 'bot');
        }

        // User message
        let response = renderMessage(query, 'user');

        // Check greeting
        if (isGreeting(query)) {
            response += renderMessage(pick(greetingResponses), 'bot');
            return response;
        }

        // Check thanks
        if (isThanks(query)) {
            response += renderMessage(pick(thanksResponses), 'bot');
            return response;
        }

        // Semantic search
        try {
            const queryEmbed = await getEmbedding(query);
            const results = findBestMatches(queryEmbed, faqs, 3);

            // Debug logging
            const threshold = 0.60;
            console.log(`\n🔍 Query: "${query}"`);
            console.log(`   Threshold: ${threshold}`);
            results.forEach((r, i) => {
                const status = i === 0 && r.similarity >= threshold ? '✅' : '  ';
                console.log(`   ${status} [${i + 1}] ${r.similarity.toFixed(4)} | "${r.item.pergunta.slice(0, 60)}..."`);
            });

            if (results.length === 0 || results[0].similarity < threshold) {
                console.log(`   ❌ Nenhum match acima do threshold`);
                response += renderMessage(noAnswerMessage, 'bot');
                return response;
            }

            const best = results[0];
            const confidence = determineConfidence(best.similarity);

            // Build suggestions from other results
            const suggestions = confidence !== 'high' && results.length > 1
                ? results.slice(1).map(r => r.item.pergunta)
                : [];

            response += renderMessage(best.item.resposta, 'bot', suggestions);
            return response;

        } catch (e) {
            console.error('Search error:', e);
            response += renderMessage('Ocorreu um erro. Tente novamente.', 'bot');
            return response;
        }
    })

    .listen(3000);

console.log(`🚀 FAQ Chatbot running at http://localhost:${app.server?.port}`);
