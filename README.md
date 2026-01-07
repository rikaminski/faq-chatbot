# FAQ Chatbot

Chatbot FAQ minimalista com busca semântica local.

## Stack

- **Runtime**: [Bun](https://bun.sh)
- **Server**: [Elysia](https://elysiajs.com)
- **Frontend**: HTML + CSS + [HTMX](https://htmx.org)
- **AI**: [@huggingface/transformers](https://huggingface.co/docs/transformers.js) (all-MiniLM-L6-v2)

## Quick Start

```bash
# Instalar dependências
bun install

# Pré-calcular embeddings (primeira vez)
bun run precompute

# Rodar servidor
bun run dev
```

Acesse: http://localhost:3000

## Customização

1. Edite `data/faqs.example.json` com suas perguntas/respostas
2. Renomeie para `faqs.json` ou rode `bun run precompute`
3. Customize cores em `public/styles.css` (CSS Variables)

## Estrutura

```
faq-chatbot/
├── src/
│   ├── index.ts       # Servidor Elysia
│   ├── search.ts      # Busca semântica
│   ├── embeddings.ts  # Modelo de IA local
│   └── types.ts       # TypeScript types
├── views/
│   └── index.html     # Chat UI
├── public/
│   └── styles.css     # Estilos
└── data/
    └── faqs.json      # FAQ com embeddings
```

## Docker

```bash
# Build
docker build -t faq-chatbot .

# Run
docker run -p 3000:3000 faq-chatbot

# Run com volume (para atualizar FAQs sem rebuild)
docker run -p 3000:3000 -v $(pwd)/data:/app/data faq-chatbot
```


