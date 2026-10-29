# Teste

Módulo GIA — categoria: outros. Gerado a partir do template
**rich** (CRUD genérico com lista, busca, modal de cadastro/edição,
exclusão com confirmação, gates de permissão).

> 🤖 Este projeto tem um **`AGENTS.md`** na raiz com o contexto pra IA da sua
> IDE — e a doc completa do SDK fica em `node_modules/@gia-cb/dev-shell/docs/`
> após o `npm install`.

## Desenvolver

```bash
npm install
npm run dev          # gia dev — sobe dev-shell em http://localhost:6010
npm run validate     # gia validate — roda checklist
npm run pack         # gia pack — gera .tgz
```

## O que está pronto

- **View principal** (`src/views/TesteView.tsx`) — DataReport
  com busca + ações inline. Loading/error/empty states cobertos.
- **Modal de cadastro/edição** (`src/components/TesteEditModal.tsx`)
  — FormModal com `useGiaForm` + Zod (`src/schemas.ts`). Atualiza a
  lista no sucesso via `queryClient.invalidateQueries`.
- **Excluir com confirmação** (ConfirmDialog).
- **4 permissões** — `teste.ler/criar/editar/excluir`.
- **Hooks de dados** (`src/api/items.ts`) — `useList`, `useCreate`,
  `useUpdate`, `useDelete`.
- **3 fixtures** no `gia.config.ts` pra você ver a tela populada
  imediatamente no `gia dev`.
- **FAQ + Tour preenchidos** com conteúdo realista.

## O que substituir antes de empacotar

- `PRD.md` — preenchido com exemplo; troque pelo seu domínio
- `src/types.ts` — `TesteItem` é genérico; substitua pelas
  colunas reais
- `src/schemas.ts` — Zod schema do form
- `src/api/items.ts` — usa `supabase.schema('mod_teste').from('lojas'|'items'|'sync_info')`
  (schema dedicado do módulo). Ajuste nomes de tabela e colunas pro seu DDL.
  **Nunca** dotted `.from('mod_x.tabela')` — ver `api-reference.md §1.4`.
- `src/views/TesteView.tsx` — colunas do DataReport
- `migrations/0001_init.sql` — CRIE este arquivo com o DDL da sua
  tabela (schema `mod_teste` + tabelas + RLS/GRANT + `notify pgrst`)
- `faq.ts` e `tour.ts` — texto realista pro seu caso

## Estrutura

```
src/
├── module.ts                  defineModule({ id, label, ... })
├── permissions.ts             4 permissões (ler/criar/editar/excluir)
├── faq.ts                     5 entradas pré-preenchidas
├── tour.ts                    3 steps
├── routes.tsx                 1 rota: /teste
├── schemas.ts                 Zod schema do form
├── types.ts                   Item interface
├── api/
│   └── items.ts               useList/useCreate/useUpdate/useDelete
├── components/
│   └── TesteEditModal.tsx
└── views/
    └── TesteView.tsx
```

Consulte [`docs/extensibility/quickstart.md`](../../docs/extensibility/quickstart.md)
e [`docs/extensibility/conventions.md`](../../docs/extensibility/conventions.md)
no repo do portal.
