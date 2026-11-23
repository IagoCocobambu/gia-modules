# Changelog — Couvert

## 0.1.0 — 19/11/2026

Primeira versão, migrada da tela Couvert do GIA antigo (`dashboard-e-couvert`).

- Tela única em **Simphony › Couvert**: loja e RVC, mesas abertas em cards no desenho
  aprovado pelo usuário (`docs/artefatos/mesas-referencia-usuario.png`), chips de
  situação que filtram (Todas, Divergentes, Sem lançamento, Tudo lançado), busca por
  mesa, ordem Mesa/Atenção, Atualizar com "atualizado há", tela cheia e Exportar em
  Excel.
- Couvert artístico e, na loja com buffet, buffet contra o número de pessoas; selo da
  diferença (−2, +1) e "sem pessoas".
- Fontes: `ctx.empresas()` (lojas, `locRefs.BIAPI` e `empresa.couvert`) e BI do
  Simphony pela credencial `simphony-bi` (`getLatestBusDt` + `getGuestChecks`). Sem
  banco externo.
- Diferenças para o legado: dia de negócio pelo `getLatestBusDt` (não pela data do
  servidor); configuração de couvert do cadastro do portal (não de `gia.empresas`);
  token do hub (não de `auth.token_bi`); tempo limite de 120 s (o legado esperava 180 s);
  sem pesquisa automática ao abrir — a tela vem com a última loja e RVC do usuário.
- SDK `0.1.0-alpha.72` fixada.
- Buffet sempre à vista no card (ícone tampa de travessa), como no legado; na loja sem
  buffet configurado ele não conta para a situação.
- Detalhe da conta ao tocar num card (`Modal` em duas colunas): contadores, garçom,
  rodadas, último lançamento, pré-conta, valores e todos os itens com assento, rodada,
  hora e valor. Handler novo `nomes` para os nomes de itens e garçom.
- Loja de demonstração no `gia dev` (`GIA_DEV_COUVERT_DEMO=1`, vínculo `DEMO`).
