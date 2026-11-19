# INTEGRATION.md — handoff de `Fechamento iFood Mensal` (`fechamento-ifood-mensal`)

## 1. Identificação

- **Módulo**: `fechamento-ifood-mensal` — Fechamento iFood Mensal
- **Versão do pacote**: 0.1.2
- **Autor / contato**: Iago Pereira <iago.pereira@cocobambu.com>
- **Versão do SDK usada**: `@gia-cb/*` 0.1.0-alpha.71 (fixada; mínimo para `integracoes` em `GiaOperacao`)
- **Substitui**: tela Fechamento Mensal iFood do GIA legado (`TfrmFechamentoMensalIfood`,
  bundle `files/modules/fechamento_ifood_mensal`).

## 2. Banco de dados

### 2.1 Migrations incluídas

Nenhuma migration do portal. **Uma tabela nova no banco do Maestro**:
`ifood_fechamento.historico` — rodar **`sql-maestro/001_historico.sql`** (vai no
pacote; idempotente) no Maestro antes de ligar o módulo, e dar ao usuário do módulo
`SELECT, INSERT` nela + `USAGE` na sequence `historico_id_seq` (sem UPDATE/DELETE:
o histórico é só de inclusão). Sem a tabela, o Salvar é recusado com "banco não
preparado para o histórico" e o diálogo Histórico mostra o mesmo aviso.

O resto usa o schema **`ifood_fechamento` que já existe no banco do
Maestro** (criado para o legado por `create_fechamento_mensal_schema.sql`), para o
fechamento continuar de onde parou no GIA antigo.

**O que o schema precisa ter** (a gravação depende disso — confira antes de ligar
o módulo; no schema do legado já está assim):

| Tabela                  | Restrição exigida                                                        | Usada por                                         |
| ----------------------- | ------------------------------------------------------------------------ | ------------------------------------------------- |
| `fechamentos_mensais`   | índice único `(loc_ref, ano, mes) WHERE deletado_em IS NULL`             | um cabeçalho ativo por loja/mês (`salvar.ts`)     |
| `online_dia`            | `UNIQUE (fechamento_id, data_pedido)`                                    | `INSERT … ON CONFLICT` do dia (`salvar.ts`)       |
| `adquirente_dia`        | `UNIQUE (fechamento_id, data_pedido)`                                    | `INSERT … ON CONFLICT` do dia (`salvar.ts`)       |
| `conferencia_breakdown` | `UNIQUE (fechamento_id, centro_custo)`                                   | `INSERT … ON CONFLICT` do breakdown (`salvar.ts`) |
| todas as filhas         | `fechamento_id` → `fechamentos_mensais(id)`; `id` com sequence (`USAGE`) | inclusão de linhas                                |

Nomes no banco do legado: `uq_fechamento_mensal_ativo`, `uq_online_dia`,
`uq_adquirente_dia`, `uq_conferencia_breakdown`. Sem esses índices o `ON CONFLICT`
falha e o Salvar mostra "falha no banco de dados".

Conferir no Maestro:

```sql
select indexrelid::regclass, pg_get_indexdef(indexrelid)
from pg_index i join pg_class c on c.oid = i.indrelid
where c.relnamespace = 'ifood_fechamento'::regnamespace and i.indisunique and not i.indisprimary;
```

### 2.2 Fontes a conectar

| Handler (`src/server/`) | Fonte                                                                                          | Acesso                                      |
| ----------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `lojas.ts`              | `ctx.empresas()` (Empresas do escopo) + `ctx.operacoes()` → `integracoes` IFOOD (restaurantes) | —                                           |
| `ledger.ts`             | `merchant-api.ifood.com.br` — `financial/v3.0/merchants/{merchant}/sales`                      | `ctx.credencial('ifood')`                   |
| `manual.ts`             | banco do Maestro: `SELECT` em `bordero.borderos` e `ifood_fechamento.*`                        | `sql` (`GIA_SERVER_DATABASE_URL`)           |
| `salvar.ts`             | banco do Maestro: `INSERT/UPDATE` em `ifood_fechamento.*` (transação)                          | `getDbClient()` (`GIA_SERVER_DATABASE_URL`) |
| `historico.ts`          | banco do Maestro: `SELECT` em `ifood_fechamento.historico`                                     | `sql` (`GIA_SERVER_DATABASE_URL`)           |

- [ ] **Hub de Credenciais — integração `ifood`** (a mesma do Fechamento iFood
      Diário): base `https://merchant-api.ifood.com.br`, token do OAuth
      `client_credentials` (`POST authentication/v1.0/oauth/token` com
      `grantType`, `clientId`, `clientSecret` em form-urlencoded; validade ~6 h).
      Liberar este módulo na integração (`integracoes: ['ifood']` no handler `ledger`).
      ⚠️ O pacote legado traz `client_id`/`client_secret` **reais** em
      `CONSTANTES/uiFoodConsts.pas` — cadastre no hub e considere rotacionar.
      **Renovação do token (obrigatória no hub):** o `accessToken` do iFood vale
      `expiresIn` = 21600 s (**6 h**) e não há refresh token — renova-se pedindo um
      token novo com o mesmo `client_credentials`. O módulo **não renova nada** (contrato
      do `ctx.credencial()`): o hub tem de entregar sempre um token válido, renovando
      antes de vencer (sugestão: com folga de 30 min ou quando faltar < 10 % do prazo).
      Se o hub entregar token vencido, a tela mostra "O iFood recusou a credencial
      (401)…" e pede para avisar o administrador do portal. Em dev, o script
      `../scripts/token-ifood.mjs` (`npm run token:ifood`, e o `predev`) faz esse
      papel com o client id/secret do `.env`.
- [ ] **Secret `GIA_SERVER_DATABASE_URL`** da Edge Function: banco do **Maestro**
      (o mesmo do Fechamento Maestro). O usuário precisa de:
  - `SELECT` em `bordero.borderos`;
  - `SELECT, INSERT` em `ifood_fechamento.historico` (+ `USAGE` em `historico_id_seq`);
  - `SELECT, INSERT, UPDATE` em `ifood_fechamento.fechamentos_mensais`,
    `online_dia`, `adquirente_dia`, `conferencia_breakdown`, `extrato_bancario`,
    `cancelados_pos` + `USAGE` nas sequences delas.

  (Se o Fechamento Maestro usar um usuário só leitura, este módulo precisa de
  outro usuário ou do GRANT acima.)

- [ ] **Busca por EMPRESA, juntando todas as operações** (como o Fechamento iFood
      Diário desde a 0.2.4): o seletor lista as Empresas do escopo (`ctx.empresas()`,
      `tipoRegistro === 'empresa'`) e os handlers validam com `ctx.requireEmpresa`. O
      **número da loja** — do nome da Empresa ("01.CB GOIANIA" → "01") ou, na falta,
      do vínculo BIAPI — é a chave no banco do Maestro
      (`ifood_fechamento.fechamentos_mensais.loc_ref`, como no legado — o fechamento já
      gravado continua aparecendo) e o `bordero.borderos.property_number`. Loja sem
      número é recusada.
- [ ] **Restaurantes do iFood de cada loja**: são os vínculos **IFOOD** ativos das
      operações da Empresa no cadastro do portal (`gia.operacoes_integracoes`, lidos em
      `ctx.operacoes()` → `integracoes`, SDK alpha.71) — os mesmos do Fechamento iFood
      Diário. Nada fica fixo no módulo: loja nova ou conta movida de operação vale na
      próxima consulta. Conferir que cada operação com iFood tem o vínculo IFOOD (o
      `locRef` = id do restaurante no iFood); o vínculo IFOOD da Empresa
      (`locRefs.IFOOD`) não é lido. O `ledger` só aceita restaurante da loja pedida (422
      para restaurante de outra loja).
- [ ] **Restaurante negado (403) ou não reconhecido (404) pelo iFood**: fica de fora e a
      tela avisa qual; os demais restaurantes da loja seguem. 401 (credencial) para a
      consulta inteira. Caso conhecido: o 2º vínculo IFOOD da `43 cbx`, com o UUID com
      um caractere a menos — a correção do cadastro é do time GIA.

## 3. Menu / navegação

- **Caminho**: **Plataformas › iFood › Fechamento iFood Mensal**, no subgrupo **iFood**
  de Plataformas, ao lado do Fechamento iFood Diário.
- **navGroup**: `cardapio` (Plataformas) — o subgrupo **iFood** já existe na NAV_TREE;
  na instalação, pôr a tela nele (sem esse passo, ela aparece direto em Plataformas).

| Tela      | path                       | label                   | ícone (lucide)  | permissão                     | faqId                     |
| --------- | -------------------------- | ----------------------- | --------------- | ----------------------------- | ------------------------- |
| Principal | `/fechamento-ifood-mensal` | Fechamento iFood Mensal | `CalendarRange` | `fechamento-ifood-mensal.ler` | `fechamento-ifood-mensal` |

## 4. Edge functions & secrets

- `edge-functions/fechamento-ifood-mensal/` — gerada pelo `gia pack` a partir de
  `src/server/` (`lojas`, `ledger`, `manual`, `salvar`, `historico`).
- Secrets: `GIA_SERVER_DATABASE_URL`. Integração do hub: `ifood`.
- **Trava de teste — `FECHAMENTO_IFOOD_MENSAL_EMPRESA_TESTE`** (opcional, id
  numérico da Empresa no portal). Homologação e produção gravam no **mesmo DW**:
  - **Homologação**: definir com o id da Empresa `999.CB TECH HOMOLOG` (93 no
    cadastro usado no `gia dev`; conferir o id no cadastro de homologação). O `salvar`
    recusa qualquer outra Empresa com **403** ("Este ambiente é de teste…") **antes**
    de abrir a transação — nem o cabeçalho do mês é criado. Consulta e Histórico
    continuam em qualquer loja.
  - **Produção**: **não** definir. Sem a variável nada muda.
  - Valor que não é um id (ex.: o nome da loja) **recusa toda gravação** (503, com o
    motivo no log) — erro de configuração não abre a trava.
  - Fica fora do `config.secrets` (e do `secrets_required` do `_meta.json`) de
    propósito, para a instalação em produção não exigi-la; é lida com `envOptional`.
- `GIA_DEV_IFOOD_MENSAL_DEMO`, `GIA_DEV_IFOOD_MENSAL_DEMO_ATRASO_MS` e
  `GIA_DEV_IFOOD_MENSAL_DEMO_LIMITE` são só do `gia dev` (dados fictícios; o
  `_LIMITE` simula a instabilidade do iFood — `sempre` e `cota` forçam a falha; prefixo
  `GIA_DEV_`, como as demais variáveis do dev shell) — **não** configurar no portal. O mesmo vale para
  `GIA_DEV_IFOOD_MENSAL_POR_OPERACAO` (teste: `1` mostra um seletor para consultar uma
  operação só; ausente = junta todas as operações da loja, o comportamento de produção).
- **Erros**: o detalhe técnico (corpo da resposta do iFood, erro do Postgres) vai
  para o **log da Edge Function** com o prefixo `[fechamento-ifood-mensal]`; a tela
  mostra só uma mensagem curta ("o iFood não conseguiu responder agora (código N)",
  "falha no banco de dados"). Para investigar um relato, procure o horário no log.
  Status usados: 422 (entrada inválida, loja sem iFood, registro que não é Empresa),
  424 (iFood recusou a credencial, 401 — a tela não tenta de novo; restaurante negado
  (403) ou não encontrado (404) vira aviso e os outros seguem), 502 (iFood fora — a tela
  tenta de novo até 2 vezes), 504 (o iFood passou de 30 s — sem nova tentativa), 503 (banco do Maestro).
- **Limite do iFood**: 429 e páginas vazias **não** viram erro HTTP. Página com vendas
  vazias e 429 com saldo de cota sobrando: o `ledger` repete na hora (até 3 vezes) e,
  se não passar, responde 200 com `adiar: { motivo: 'incompleta' | 'instavel' }` — a
  página volta para a fila da tela (até 3 vezes). 429 com a cota esgotada (saldo 0) ou
  com `Retry-After`: responde na hora `adiar: { motivo: 'cota', esperarMs }` e a tela
  pausa todas as chamadas pelo `Retry-After` ou pelo `ifood-ratelimit-reset` + 1 s
  (teto 60 s; até 5 pausas por página); com saldo abaixo de 20 a tela pausa antes do 429. Chamadas ao mesmo tempo: até 3, adaptativo. Toda resposta traz `cota: { restantes, resetS }` (cabeçalhos
  `ifood-ratelimit-*`) e `repeticoes`. A cota é a mesma para todos os módulos e sistemas
  que usam a credencial do iFood.

## 5. Permissões declaradas

- `fechamento-ifood-mensal.ler` — consultar todas as abas.
- `fechamento-ifood-mensal.editar` — preencher e salvar (previsões, CB Desc. LOJA,
  comentários, breakdown, extrato, cancelados).

No legado as duas telas do iFood ficavam atrás de `gia / relfechamentoifood`;
quem tinha essa permissão deve receber `.ler` (e `.editar`, se preenchia o mês).

## 6. Realtime

Não usa.

## 7. Pendências / decisões abertas

- [ ] **Regras do legado mantidas** que o financeiro precisa confirmar (PRD §11, Decisões pendentes):
      coluna Extrato do Recebimento sempre zerada, ordenação das datas de
      pagamento, "Desc. LOJA VR", "# Total" sem o desconto da loja, subtotal
      "Recebido Via iFood" e colunas de cancelamento sempre zeradas.
- [ ] **Histórico**: criar `ifood_fechamento.historico` no Maestro
      (`sql-maestro/001_historico.sql`) com os GRANTs. O módulo grava ali o antes →
      depois de cada Salvar (mesma transação), além do autor/data nas colunas do
      legado e do `logAudit` (`fechamento-ifood-mensal.fechamento.salvo`). Gravações
      feitas pela tela do legado NÃO entram no histórico — mais um motivo para
      desligá-la na virada.
- [ ] **Desligar a tela do legado** depois da virada, para não haver gravação
      concorrente nas mesmas tabelas.
- [ ] **Data da virada**: combinar com o financeiro e o time GIA o mês a partir do
      qual o fechamento é feito só no portal. Até lá, se as duas telas gravarem o
      mesmo mês da mesma loja, vale a última gravação.
- [ ] **Ordem da instalação**: (1) instalar a 0.1.2 em homologação com
      `FECHAMENTO_IFOOD_MENSAL_EMPRESA_TESTE` definida; (2) só então criar
      `ifood_fechamento.historico` no DW (`sql-maestro/001_historico.sql`); (3) testar
      a gravação só na 999.
