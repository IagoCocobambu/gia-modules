# INTEGRATION.md — handoff de `Fechamento iFood Diário` (`fechamento-ifood-diario`)

## 1. Identificação

- **Módulo**: `fechamento-ifood-diario` — Fechamento iFood Diário
- **Versão do pacote**: 0.2.5
- **Autor / contato**: Iago Pereira <iago.pereira@cocobambu.com>
- **Versão do SDK usada**: `@gia-cb/*` 0.1.0-alpha.71 (fixada; mínimo para `integracoes` em `GiaOperacao`)

## 2. Fontes de dados externas

Módulo **read-only** — não cria tabela nem migration no portal e não grava nada.

| Handler (`src/server/`) | Fonte                                                                                                  | Acesso                            |
| ----------------------- | ------------------------------------------------------------------------------------------------------ | --------------------------------- |
| `lojas.ts`              | `ctx.empresas()` (Empresas do escopo) + `ctx.operacoes()` → `integracoes` IFOOD (restaurantes da loja) | —                                 |
| `pedidos.ts`            | `api-dw.cocobambu.com/Delivery/?loc_ref=<nº loja>&start_date=<dia>&end_date=<dia>`                     | `ctx.credencial('apidw')`         |
| `vendas.ts`             | `merchant-api.ifood.com.br/financial/v3.0/merchants/<merchant>/sales?beginSalesDate&endSalesDate&page` | `ctx.credencial('ifood')`         |
| `pedidos.ts`            | banco do Maestro: `SELECT` em `gia_relatorios.formas_pagamento`                                        | `sql` (`GIA_SERVER_DATABASE_URL`) |

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

- [ ] **Busca por Empresa, com todas as operações juntas (0.2.4):** o seletor lista
      `ctx.empresas()` e os handlers `pedidos` e `vendas` recebem o `empresaId` e
      chamam `requireEmpresa`. O nº da loja no DW sai do vínculo `BIAPI` ou do começo
      do nome da Empresa ("54.CB MINAS SHOPPING" → `54`).
- [ ] **Restaurantes do iFood de cada loja (0.2.5):** são os vínculos **IFOOD**
      ativos das operações da Empresa no cadastro do portal (`gia.operacoes_integracoes`,
      lidos em `ctx.operacoes()` → `integracoes`, SDK alpha.71) — cb, cbx, pzcb, dani,
      adgcb, burger, vst, vstss…; uma operação pode ter mais de um. Nada fica fixo no
      módulo: loja nova ou conta movida de uma operação para outra vale na próxima
      pesquisa. Conferir que cada operação com iFood tem o vínculo IFOOD (o
      `locRef` = id do restaurante no iFood). Operação sem vínculo: os pedidos dela
      ficam Cancelado; loja sem nenhum aparece como "Sem iFood".
- [ ] **Cadastro a corrigir (com o time GIA):** a operação `43 cbx` tem um 2º vínculo
      IFOOD com o UUID com um caractere a menos (`ca22641e-8cfb-43a4-ba8f-2dc803a3bd3`).
      Até sair, o iFood responde 404 para ele e a tela mostra o aviso daquele
      restaurante; as outras operações da loja seguem normais.
- [ ] O handler `vendas` também lista os restaurantes da conta no iFood
      (`GET /merchant/v1.0/merchants`, guardado 30 min), só para mostrar o nome do
      restaurante na tabela — mesma credencial `ifood`.
- [ ] O vínculo `IFOOD` da **Empresa** (`locRefs.IFOOD`) não é mais lido (o vínculo
      do iFood é sempre da operação). Loja sem vínculo em nenhuma operação aparece no
      seletor como "Sem iFood" e a pesquisa avisa que os pedidos não foram cruzados.

## 3. Posição no menu

- **Caminho**: Plataformas › iFood › Fechamento iFood Diário.
- **Grupo**: `cardapio` (Plataformas) — é o `navGroup` do manifest.
- **Subgrupo**: **iFood** (id `ifood`), que **já existe** na NAV_TREE dentro de
  Plataformas (hoje com a tela Lojas, do `delivery-manager`).
- [ ] Adicionar a tela abaixo em `screens` do subgrupo `ifood` de `cardapio` na NAV_TREE.
      Sem isso, o módulo aparece direto em Plataformas (fallback do `navGroup`).

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
