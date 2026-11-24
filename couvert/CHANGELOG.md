# Changelog — Couvert

## 0.1.1 — 24/11/2026

- A tela usa sempre a largura toda, sem os botões de expandir/restaurar das bordas.
- `PRD.md` e `INTEGRATION.md` com o público sugerido das permissões.

## 0.1.0 — 23/11/2026

Primeira versão, migrada da tela Couvert do GIA antigo (`dashboard-e-couvert`).

- Tela única em **Simphony › Couvert**: loja e RVC, mesas abertas em cards no desenho
  aprovado pelo usuário (`docs/artefatos/mesas-referencia-usuario.png`), chips de
  situação que filtram (Todas, Divergentes, Sem lançamento, Tudo lançado), busca por
  mesa, ordem Mesa/Atenção, Atualizar com "atualizado há" e tela cheia. Sem
  Exportar: `couvert.exportar` está declarada só porque o `gia validate` exige uma chave
  de ação (Q-03).
- Couvert artístico e, na loja com buffet, buffet contra o número de pessoas; selo da
  diferença (−2, +1) e "sem pessoas". Na lista da conta, o couvert aparece em ciano.
- Fontes: `ctx.empresas()` (lojas, `locRefs.BIAPI` e `empresa.couvert`) e BI do
  Simphony pela credencial `simphony-bi` (`getLatestBusDt` + `getGuestChecks`). Sem
  banco externo.
- Diferenças para o legado: dia de negócio pelo `getLatestBusDt` (não pela data do
  servidor); configuração de couvert do cadastro do portal (não de `gia.empresas`);
  token do hub (não de `auth.token_bi`); tempo limite de 120 s nas contas (o legado esperava 180 s);
  sem pesquisa automática ao abrir — a tela vem com a loja 01 e o 1º RVC dela (sem a 01
  no escopo, com a última loja e RVC do usuário).
- SDK `0.1.0-alpha.72` fixada.
- Buffet sempre à vista no card (ícone tampa de travessa), como no legado; na loja sem
  buffet configurado ele não conta para a situação.
- Detalhe da conta ao tocar num card (`Modal` em duas colunas): contadores, garçom,
  rodadas, último lançamento, pré-conta, valores e todos os itens com assento, rodada,
  hora e valor. Handler novo `nomes` para os nomes de itens e garçom.
- Loja de demonstração no `gia dev` (`GIA_DEV_COUVERT_DEMO=1`, vínculo `DEMO`).
- Mesa com 0 pessoas: vermelha (Divergente) só com couvert ou buffet lançado; sem
  lançamento fica neutra, com chip próprio (no legado ficava sempre vermelha).
- No celular, os chips de situação viram uma lista suspensa e a tela cheia fica ao lado do
  Atualizar; barra de filtros numa linha também em telas médias e no tablet em pé.
- Com erro na pesquisa, a barra de filtros volta à completa.
- Tour: os passos das mesas esperam as mesas aparecerem.
- Filtro, busca e ordem reorganizam os cards com animação (`framer-motion` e os presets do
  SDK); a busca espera uma pausa de 250 ms na digitação.
- Ordem Atenção: dentro da situação, o maior número de divergências primeiro e, por
  último, a mesa.
