# Couvert

Módulo GIA — categoria: operacional. Gerado a partir do template **rich-api**:
um exemplo **funcional** de consumo de **API externa** — lista países da API
pública [Banco Mundial](https://api.worldbank.org) numa tabela com busca e
export CSV.

> 🤖 Este projeto tem um **`AGENTS.md`** na raiz com o contexto pra IA da sua
> IDE — e a doc completa do SDK fica em `node_modules/@gia-cb/dev-shell/docs/`
> após o `npm install`. Comece por `dados-externos.md`.

## Desenvolver

```bash
npm install
npm run dev          # gia dev — sobe dev-shell em http://localhost:6010
npm run validate     # gia validate — roda checklist
npm run pack         # gia pack — gera .tgz (+ Edge Function do handler)
```

Ao rodar `gia dev`, a tabela carrega países **de verdade** — o handler
`src/server/paises.ts` roda no Node e bate na API real. **Sem Supabase, sem
Docker, sem `.env`** (a API é pública).

## O que está pronto (o padrão de dados externos, ponta a ponta)

- **Handler server-side** (`src/server/paises.ts`) — `fetch` no Banco Mundial,
  mapeia o JSON e devolve a lista. Roda no Node em dev; vira Edge Function no
  `gia pack`.
- **Cliente** (`src/api/paises.ts`) — `createServerClient('couvert').call('paises')`
  dentro de `useQuery`. Switch dev↔prod automático.
- **View** (`src/views/CouvertView.tsx`) — `DataReport` com busca global,
  export CSV (gated por permissão) e estados loading/erro/vazio (com "tentar de
  novo").
- **2 permissões** — `couvert.ler` + `couvert.exportar`.
- **FAQ + Tour** preenchidos.

## O que trocar pra virar SEU módulo

- `src/server/paises.ts` — troque a URL/parse pela SUA fonte (API ou DB). Se ela
  exigir segredo, use `env('MINHA_CHAVE')` e declare em `config.secrets` +
  `.env.example`.
- `src/types.ts` / colunas da view — pelo shape do seu dado.
- `PRD.md`, `faq.ts`, `tour.ts`, `permissions.ts` — pelo seu domínio.

Guia completo: `dados-externos.md` (no `/_docs` do dev-shell).
