# Reports Maestro

Módulo GIA — categoria: operacional. Lista os **pedidos de delivery do Maestro**
(App Coco Bambu, iFood, 99Food, manual) de uma loja num período, com cliente,
valores e formas de pagamento, e exporta em Excel.

Porte da tela **Reports Maestro** do GIA legado (UniGUI). Produto, regras e
critérios de aceite: [`PRD.md`](PRD.md). Handoff para o time GIA:
[`INTEGRATION.md`](INTEGRATION.md).

## Desenvolver

```bash
cp .env.example .env   # preencha GIA_DEV_CRED_APIDW_TOKEN
npm install
npm run dev            # gia dev — dev-shell em http://localhost:6010
npm run validate       # gia validate
npm run pack           # gia pack — gera o .tgz (+ Edge Function)
```

No `gia dev` o handler `src/server/pedidos.ts` roda no Node e chama a API do DW
**de verdade**, com o token do `.env`.

## Estrutura

- `src/server/lojas.ts` — lojas do escopo do usuário (Empresas com o nº da loja no nome).
- `src/server/pedidos.ts` — `GET /Delivery/` da api-dw, via `ctx.credencial('apidw')`.
- `src/api/reports-maestro.ts` — hooks React Query que chamam os handlers.
- `src/views/ReportsMaestroView.tsx` — filtros + `DataReport` (cards no celular).
- `src/helpers.ts` — datas, formatação e a planilha `.xlsx` no template do GIA.
