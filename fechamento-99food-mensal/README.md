# Fechamento 99Food Mensal

Módulo GIA — menu: Plataformas › 99Food. Monta o **fechamento mensal da 99Food** de
uma loja: busca os lançamentos financeiros do mês na Financial API da 99Food (o mês
inteiro numa consulta, página a página) e confere com o caixa da loja — os **campos
da 99 no borderô** (`bordero.fields`) — nas abas Online, Adquirentes, Conferência
(DRE), Extrato, Recebimento e Cancelados pós. Quem tem permissão preenche os campos
manuais e salva.

Espelho do **Fechamento iFood Mensal** (mesma tela, mesmas contas), com as regras do
lado 99 **provisórias, a validar pelo financeiro**. Produto, regras e pendências:
[`PRD.md`](PRD.md). Handoff para o time GIA: [`INTEGRATION.md`](INTEGRATION.md).
Mudanças por versão: [`CHANGELOG.md`](CHANGELOG.md).

## Desenvolver

```bash
cp .env.example .env   # credencial da 99Food e banco do Maestro — ou GIA_DEV_99FOOD_MENSAL_DEMO=1
npm install
npm run dev            # gia dev — dev-shell em http://localhost:6010
npm run validate       # gia validate
npm run pack           # gia pack — gera o .tgz (+ Edge Function)
```

Com `GIA_DEV_99FOOD_MENSAL_DEMO=1`, o `bill` devolve lançamentos fictícios (a
Financial API ainda não foi liberada); sem `GIA_SERVER_DATABASE_URL`, o borderô também
é fictício. O Salvar exige o banco **e** o schema `fechamento_99food`
(`sql-maestro/001_schema.sql`, ainda não rodado).

## Estrutura

- `src/server/` — handlers: `lojas` (Empresas do escopo com os vínculos 99FOOD das
  operações), `bill` (uma página do `getShopBillDetail` → lançamentos no formato do
  iFood), `manual` (campos da 99 no borderô, classificados por regex, + o gravado),
  `salvar` (transação em `fechamento_99food.*`, com a trava de teste), `historico`.
- `src/hooks/use-consulta-mensal.ts` — a consulta do mês em paralelo, com fila de
  retentativa, progresso e Cancelar (a mesma do iFood Mensal, com uma janela só).
- `src/regras.ts` + `src/conferencia.ts` — cálculos das abas (os do iFood Mensal) e
  as categorias do DRE da 99.
- `src/views/Fechamento99foodMensalView.tsx` — filtros, estado editável, avisos e abas.
- `src/components/Aba*.tsx` — uma aba por arquivo.
- `sql-maestro/001_schema.sql` — schema do banco do Maestro (o DBA roda; ver INTEGRATION §7).
