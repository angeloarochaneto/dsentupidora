# Diretório de Desentupidoras

Site estático (Astro, TypeScript) de diretório local por cidade/UF, com página de urgência ("24h") e página de bairro por cidade.

## Stack

- Astro 7, `output: "static"`
- Content Collections (`src/content/cities/*.json`) com schema Zod
- `@astrojs/sitemap`
- Sem framework de UI — só `.astro` + CSS puro

## Rotas geradas

- `/{uf}/{cidade}/` — página principal da cidade
- `/{uf}/{cidade}/desentupidora-24h/` — variante de urgência (mesmo layout, hero diferente)
- `/{uf}/{cidade}/{bairro}/` — uma por item em `areas[]` (só se a cidade tiver bairros cadastrados)

## Adicionar uma cidade nova

Crie `src/content/cities/{uf}-{cidade-slug}.json` seguindo o schema em `src/content.config.ts`. As rotas são geradas automaticamente no build — nenhum código precisa mudar.

## Rodar localmente

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
```

Define a URL canônica via variável de ambiente `PUBLIC_SITE_URL` (fallback: `http://localhost:4321`):

```sh
PUBLIC_SITE_URL=https://seudominio.com.br npm run build
```

## Deploy na Vercel

Nenhuma configuração extra é necessária — o preset padrão do Astro já funciona na Vercel. Conecte o repositório pelo painel da Vercel (Add New → Project → selecione este repo) e defina `PUBLIC_SITE_URL` nas Environment Variables do projeto, ou rode:

```sh
npm i -g vercel
vercel --prod
```

## Conversão (Leadster / WhatsApp)

Botões marcados com `data-cta-primary` disparam automaticamente conforme o campo `conversionMode` de cada cidade (ver `src/layouts/Layout.astro`):

- `leadster`: chama `window.leadster.open()` — cole o script de embed do Leadster no comentário indicado em `Layout.astro`, antes do `</body>`.
- `partner-whatsapp`: abre `wa.me` com o número e mensagem da cidade.
