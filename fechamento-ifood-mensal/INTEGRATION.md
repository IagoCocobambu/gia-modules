# INTEGRATION.md — handoff de `Fechamento iFood Mensal` (`fechamento-ifood-mensal`)

## 1. Identificação

- **Módulo**: `fechamento-ifood-mensal` — Fechamento iFood Mensal
- **Versão do pacote**: 0.1.0
- **Autor / contato**: Iago Pereira <iago.pereira@cocobambu.com>
- **Versão do SDK usada**: `@gia-cb/*` 0.1.0-alpha.70 (fixada)
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

| Handler (`src/server/`) | Fonte                                                                     | Acesso                                      |
| ----------------------- | ------------------------------------------------------------------------- | ------------------------------------------- |
| `operacoes.ts`          | `ctx.operacoes()` (operações do escopo) + `ctx.empresas()` (merchant)     | —                                           |
| `ledger.ts`             | `merchant-api.ifood.com.br` — `financial/v3.0/merchants/{merchant}/sales` | `ctx.credencial('ifood')`                   |
| `manual.ts`             | banco do Maestro: `SELECT` em `bordero.borderos` e `ifood_fechamento.*`   | `sql` (`GIA_SERVER_DATABASE_URL`)           |
| `salvar.ts`             | banco do Maestro: `INSERT/UPDATE` em `ifood_fechamento.*` (transação)     | `getDbClient()` (`GIA_SERVER_DATABASE_URL`) |
| `historico.ts`          | banco do Maestro: `SELECT` em `ifood_fechamento.historico`                | `sql` (`GIA_SERVER_DATABASE_URL`)           |

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

- [ ] **Busca por OPERAÇÃO (exceção deste módulo)**: o seletor lista as operações
      do escopo (`ctx.operacoes()`) e os handlers validam com `ctx.requireOperacao`.
      A lista é a mesma do Fechamento iFood Diário (todas as operações do escopo,
      inclusive duas da mesma Empresa, como `08 cb` e `08 vst`). O **número do
      `operacao_ref`** (`"02 cb"` → `"02"`) é a chave da loja no banco do Maestro
      (`ifood_fechamento.fechamentos_mensais.loc_ref`, como no legado — o fechamento
      já gravado continua aparecendo) e o `bordero.borderos.property_number`.
      ⚠️ Operações do mesmo número (`08 cb` e `08 vst`) **dividem o mesmo
      fechamento** no banco — o legado também juntava. Operação cujo ref não começa
      pelo número é recusada.
- [ ] **Cadastro de Empresas**: o merchant do iFood vem da integração **IFOOD** da
      **Empresa dona da operação** (`locRefs.IFOOD` = merchant UUID — o antigo
      `gia.empresas_integracoes` tipo IFOOD); todas as operações da Empresa usam o
      mesmo merchant — menos as do Vasto na loja do CB (`08/17/25/69/86 vst`), cujo
      merchant está em `OPERACOES_IFOOD_PROPRIO` (`operacoes.ts` e `ledger.ts`, a mesma
      tabela do Fechamento iFood Diário), até o SDK expor `locRefs` por operação.
      Operação sem merchant aparece como "Sem iFood" e é recusada ao Consultar.

## 3. Menu / navegação

- **navGroup**: `cardapio` (Plataformas), junto do Fechamento iFood Diário.
  Sugestão: subgrupo **iFood** › Fechamento iFood Diário / Fechamento iFood Mensal.

| Tela      | path                       | label                   | ícone (lucide)  | permissão                     | faqId                     |
| --------- | -------------------------- | ----------------------- | --------------- | ----------------------------- | ------------------------- |
| Principal | `/fechamento-ifood-mensal` | Fechamento iFood Mensal | `CalendarRange` | `fechamento-ifood-mensal.ler` | `fechamento-ifood-mensal` |

## 4. Edge functions & secrets

- `edge-functions/fechamento-ifood-mensal/` — gerada pelo `gia pack` a partir de
  `src/server/` (`operacoes`, `ledger`, `manual`, `salvar`, `historico`).
- Secrets: `GIA_SERVER_DATABASE_URL`. Integração do hub: `ifood`.
- `GIA_DEV_IFOOD_MENSAL_DEMO` e `GIA_DEV_IFOOD_MENSAL_DEMO_ATRASO_MS` são só do
  `gia dev` (dados fictícios; prefixo `GIA_DEV_`, como as demais variáveis do dev
  shell) — **não** configurar no portal.
- **Erros**: o detalhe técnico (corpo da resposta do iFood, erro do Postgres) vai
  para o **log da Edge Function** com o prefixo `[fechamento-ifood-mensal]`; a tela
  mostra só uma mensagem curta ("o iFood não conseguiu responder agora (código N)",
  "falha no banco de dados"). Para investigar um relato, procure o horário no log.
  Status usados: 422 (entrada inválida, loja sem iFood), 424 (iFood recusou a
  credencial ou o acesso à loja — a tela não tenta de novo), 502 (iFood fora — a tela
  tenta de novo até 2 vezes), 504 (o iFood passou de 30 s — sem nova tentativa), 503 (banco do Maestro).

## 5. Permissões declaradas

- `fechamento-ifood-mensal.ler` — consultar todas as abas.
- `fechamento-ifood-mensal.editar` — preencher e salvar (previsões, CB Desc. LOJA,
  comentários, breakdown, extrato, cancelados).

No legado as duas telas do iFood ficavam atrás de `gia / relfechamentoifood`;
quem tinha essa permissão deve receber `.ler` (e `.editar`, se preenchia o mês).

## 6. Realtime

Não usa.

## 7. Pendências / decisões abertas

- [ ] **Regras do legado mantidas** que o financeiro precisa confirmar (PRD §9):
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
