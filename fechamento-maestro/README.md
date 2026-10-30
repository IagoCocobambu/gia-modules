# Fechamento Maestro

Módulo GIA — categoria: operacional. Monta o **fechamento diário dos pedidos de
delivery do Maestro** (App Coco Bambu, iFood, 99Food, manual) de uma loja num
período: divide o total pago em **Online**, **Adquirentes** e **Offline**, confere
pagamentos e descontos de cada pedido e aponta as divergências. Exporta em Excel.

Porte da tela **Fechamento Diário Maestro** do GIA legado (UniGUI). Só usa a API
do DW — nenhum banco é consultado. Produto, regras e critérios de aceite:
[`PRD.md`](PRD.md). Handoff para o time GIA: [`INTEGRATION.md`](INTEGRATION.md).

## Desenvolver

```bash
cp .env.example .env   # preencha GIA_DEV_CRED_APIDW_TOKEN
npm install
npm run dev            # gia dev — dev-shell em http://localhost:6010
npm run validate       # gia validate
npm run pack           # gia pack — gera o .tgz (+ Edge Function)
```

No `gia dev` o handler `src/server/fechamento.ts` roda no Node e chama a API do DW
**de verdade**, com o token do `.env`.

## Estrutura

- `src/server/lojas.ts` — lojas do escopo do usuário (Empresas com o nº da loja no nome).
- `src/server/fechamento.ts` — `GET /Delivery/` da api-dw + conciliação de cada pedido
  (a regra de classificação das formas de pagamento está em `REGRAS_PAGAMENTO`).
- `src/api/fechamento-maestro.ts` — hooks React Query que chamam os handlers.
- `src/views/FechamentoMaestroView.tsx` — filtros, cards de totais, visões Por dia e Pedidos.
- `src/helpers.ts` — datas, formatação, resumo por dia e a planilha `.xlsx`.
