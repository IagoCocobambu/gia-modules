# INTEGRATION.md — handoff de `Fechamento iFood Diário` (`fechamento-ifood-diario`)

## 1. Identificação

- **Módulo**: `fechamento-ifood-diario` — Fechamento iFood Diário
- **Versão do pacote**: 0.1.0
- **Autor / contato**: Iago Pereira <iago.pereira@cocobambu.com>
- **Versão do SDK usada**: `@gia-cb/*` 0.1.0-alpha.70 (fixada)

## 2. Fontes de dados externas

Módulo **read-only** — não cria tabela nem migration no portal e não grava nada.

| Handler (`src/server/`) | Fonte                                                                                                       | Acesso                            |
| ----------------------- | ----------------------------------------------------------------------------------------------------------- | --------------------------------- |
| `lojas.ts`              | `ctx.operacoes()` (todas as operações do escopo — exceção: busca por operação) + `locRefs.IFOOD` da Empresa | —                                 |
| `fechamento.ts`         | `api-dw.cocobambu.com/Delivery/?loc_ref=<nº loja>&start_date=<dia>&end_date=<dia>`                          | `ctx.credencial('apidw')`         |
| `fechamento.ts`         | `merchant-api.ifood.com.br/financial/v3.0/merchants/<merchant>/sales?beginSalesDate&endSalesDate&page`      | `ctx.credencial('ifood')`         |
| `fechamento.ts`         | banco do Maestro: `SELECT` em `gia_relatorios.formas_pagamento`                                             | `sql` (`GIA_SERVER_DATABASE_URL`) |

### 2.1 Credenciais / integrações

- [ ] **Hub de Credenciais — `apidw`**: já cadastrada (a mesma do Fechamento
      Maestro e do Reports Maestro). Falta liberar este módulo nela.
- [ ] **Hub de Credenciais — `ifood`** (nova, se ainda não existir): Merchant API
      do iFood, base `https://merchant-api.ifood.com.br`, OAuth
      `client_credentials` em `authentication/v1.0/oauth/token` (campos
      `grantType`, `clientId`, `clientSecret`; resposta `accessToken` /
      `expiresIn`). O `client_id`/`client_secret` de produção estão no legado em
      `CONSTANTES/uiFoodConsts.pas` — **devem sair do código** e ir para o hub.
      O handler só lê vendas (escopo de leitura do módulo Financial). Liberar
      este módulo nela.
      **Renovação do token (obrigatória no hub):** o `accessToken` do iFood vale
      `expiresIn` = 21600 s (**6 h**) e não há refresh token — renova-se pedindo um
      token novo com o mesmo `client_credentials`. O módulo **não renova nada** (contrato
      do `ctx.credencial()`): o hub tem de entregar sempre um token válido, renovando
      antes de vencer (sugestão: com folga de 30 min ou quando faltar < 10 % do prazo).
      Se o hub entregar token vencido, a tela mostra "O iFood recusou a credencial
      (401)…" e pede para avisar o administrador do portal. Em dev, o script
      `../scripts/token-ifood.mjs` (`npm run token:ifood`, e o `predev`) faz esse
      papel com o client id/secret do `.env`.
- [ ] **Secret `GIA_SERVER_DATABASE_URL`** da Edge Function: connection string do
      **banco do Maestro** (o `UniConnMaestro` do legado, schema
      `gia_relatorios`). Usuário **só leitura** com `SELECT` em
      `gia_relatorios.formas_pagamento` — o mesmo do Fechamento Maestro.

### 2.2 Cadastro de Empresas e operações

- [ ] **Busca por operação (exceção deste módulo):** o seletor lista `ctx.operacoes()`
      e o handler `fechamento` recebe o `operacao_ref` e chama `requireOperacao`. O nº
      da loja no DW é o número do começo do `operacao_ref` ("54 cb" → `54`).
- [ ] A operação não tem vínculo iFood no SDK: o restaurante principal vem da
      **Empresa dona da operação**. As operações Vasto na loja do CB (`08 vst`,
      `17 vst`, `25 vst`, `69 vst`, `86 vst`) têm o restaurante numa tabela do
      módulo (`OPERACOES_IFOOD_PROPRIO`, em `lojas.ts` e `fechamento.ts`) —
      provisório. Pedido ao time do SDK: expor `locRefs` em `GiaOperacao`.
- [ ] O handler `fechamento` também lista os restaurantes da conta no iFood
      (`GET /merchant/v1.0/merchants`, guardado 30 min), só para mostrar o nome do
      restaurante na tabela — mesma credencial `ifood`.
- [ ] Cada Empresa precisa da integração **`IFOOD`** com o UUID do merchant no iFood
      (`locRefs.IFOOD`) — no legado ficava em `gia.empresas_integracoes`
      (`tipo = 'IFOOD'`, coluna `locref`). Loja sem ela aparece no seletor como
      "Sem iFood" e a pesquisa avisa que os pedidos não foram cruzados.

## 3. Posição no menu

- **Grupo**: `cardapio` (Plataformas). Subgrupo a definir pelo time GIA na
  instalação (sugestão: **iFood**, junto do futuro Fechamento iFood Mensal).

| Tela      | path                       | label                   | ícone (lucide) | permissão                     | faqId                     |
| --------- | -------------------------- | ----------------------- | -------------- | ----------------------------- | ------------------------- |
| Principal | `/fechamento-ifood-diario` | Fechamento iFood Diário | `ReceiptText`  | `fechamento-ifood-diario.ler` | `fechamento-ifood-diario` |

## 4. Permissões

- `fechamento-ifood-diario.ler` — consultar o fechamento (no legado:
  `gia / relfechamentoifood`).
- `fechamento-ifood-diario.exportar` — exportar em Excel.

## 5. Observações

- **Substitui** a tela Fechamento iFood Diário do legado
  (`TfrmFechamentoDiarioIfood` / `TDmFechamentoDiarioIfood`).
- **Regras de cálculo iguais às do legado** (PRD §6), conferidas contra uma cópia
  literal do código antigo sobre pedidos reais do DW.
- **Cadastro de formas só leitura**: a janela de manutenção (Admin/TI) do legado
  não foi portada — o cadastro é do Maestro.
- **Falha no iFood não derruba a pesquisa** (como no legado), mas aparece como
  aviso na tela.
- **Volume/latência**: uma loja × um dia (~4 s no DW; iFood paginado, 60 s de
  timeout por página).
