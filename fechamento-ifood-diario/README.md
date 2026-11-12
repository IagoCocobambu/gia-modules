# Fechamento iFood Diário

Módulo GIA — menu: Plataformas › iFood. Monta o **fechamento dos pedidos iFood** de uma
loja num dia: cruza os pedidos de delivery do DW com as vendas da API financeira
do iFood, classifica as formas de pagamento (ONLINE, ONLINE VR, OFFLINE) e soma
os cards do fechamento (iFood online, iFood adquirentes, descontos da loja e do
iFood, desconto copart). Exporta em Excel.

Porte da tela **Fechamento iFood Diário** do GIA legado (UniGUI). Produto, regras
e critérios de aceite: [`PRD.md`](PRD.md). Handoff para o time GIA:
[`INTEGRATION.md`](INTEGRATION.md).

## Desenvolver

```bash
cp .env.example .env   # preencha os tokens do DW e do iFood e GIA_SERVER_DATABASE_URL
npm install
npm run dev            # gia dev — dev-shell em http://localhost:6010
npm run validate       # gia validate
npm run pack           # gia pack — gera o .tgz (+ Edge Function)
```

No `gia dev` os handlers `src/server/pedidos.ts` e `vendas.ts` rodam no Node e chamam
o DW e o iFood **de verdade**, com os tokens do `.env`. Os restaurantes do iFood de cada
loja são os vínculos IFOOD das operações dela (`integracoes` em `operacoes` do
`gia.config.ts`; em produção, `ctx.operacoes()`).

## Estrutura

- `src/server/lojas.ts` — Empresas do escopo (nº da loja e os restaurantes do iFood de todas as operações).
- `src/server/pedidos.ts` — pedidos iFood e iFood Vasto do DW da loja + cadastro de formas ONLINE VR.
- `src/server/vendas.ts` — uma página das vendas de um restaurante da loja no iFood, reduzida ao que o cruzamento usa.
- `src/hooks/use-consulta-diaria.ts` — conduz a consulta em partes, em paralelo, com progresso.
- `src/regras.ts` — cruzamento e colunas calculadas (regras do legado).
- `src/api/fechamento-ifood-diario.ts` — hooks React Query que chamam os handlers.
- `src/views/FechamentoIfoodDiarioView.tsx` — filtros, avisos, cards e tabela.
- `src/helpers.ts` — cards (`resumirTotais`), filtro por card e a planilha `.xlsx`.
