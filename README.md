# Marcos Bricches — site pessoal

Site pessoal e escrita, construídos com o meu harness sobre o Claude Code.

No ar: https://marcosbricches.vercel.app

## Sobre

Sou AI Engineer. Trabalho na camada em volta do modelo: o harness que decide o que o Claude Code pode fazer e o que é bloqueado antes de virar commit.

Este site faz parte desse trabalho, à mostra. Ele foi construído e é mantido com o mesmo harness sobre o qual eu escrevo, então o código aqui é uma amostra do que esse harness produz. O harness em si (os agentes, skills e hooks) não está neste repositório.

Vim do design de produto e passei pelo código. Escrevo sobre como trabalho na seção de escrita.

## Stack

- Next.js 16 (App Router, React Server Components)
- TypeScript
- next-intl (PT padrão, EN em paralelo)
- Velite (MDX tipado para a escrita)
- GSAP + Lenis (motion), OGL (hero em shader WebGL)
- Fontes Clash Display / General Sans, self-hosted
- Deploy na Vercel

## Desenvolvimento

```bash
pnpm install
pnpm dev      # http://localhost:3000  (EN em /en)
pnpm build    # build de produção
```

## Estrutura

- `src/app/[locale]/`: rotas i18n (home e escrita).
- `content/escrita/*.mdx`: posts (sufixo `.en` = versão em inglês).
- `src/app/globals.css` + `src/lib/site.ts`: design tokens (oklch e hex).
- `src/components/`: Hero, ShaderBackground, header/footer, renderização de MDX.
- `scripts/gen-assets.mjs`: gera ícones e preview de link a partir do monograma, via Chrome.
- SEO: `layout.tsx` (OpenGraph, hreflang), `sitemap.ts`, `robots.ts`, `manifest.ts`. Headers de segurança em `next.config.ts`.

## Identidade

Âmbar-cobre `#e5a14b` sobre preto quente `#100908`, off-white `#e9e4de`. Dark luxury técnico, com um acento só.
