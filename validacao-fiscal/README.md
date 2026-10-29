# Validação Fiscal

Módulo GIA — categoria: fiscal. Concilia as contas fechadas no PDV (Simphony, via DW) com as notas fiscais (NFC-e) da API do DW, por loja e período. Ver `PRD.md` e `INTEGRATION.md`.

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

## Configurar o `.env` (dev)

Copie `.env.example` para `.env` e preencha:

- `GIA_SERVER_DATABASE_URL` — DW (contas, schema `simphony_api_bi`, só leitura);
- `GIA_DEV_CRED_APIDW_BASE_URL` / `GIA_DEV_CRED_APIDW_TOKEN` — API de notas;

Ajuste `empresas[].locRefs.BIAPI` no `gia.config.ts` para os `loc_ref` reais das lojas.

## Estrutura

- `src/server/lojas.ts` — Empresas do escopo com vínculo BIAPI.
- `src/server/contas.ts` — contas do Simphony no DW.
- `src/server/notas.ts` — notas da `api-dw` (`ctx.credencial('apidw')`), de D−1 a D+1.
- `src/helpers.ts` — regra de conciliação (`validateData`) e linhas do Excel.
- `src/views/ValidacaoFiscalView.tsx` — tela (filtros, cards, tabela, export `.xlsx`).
