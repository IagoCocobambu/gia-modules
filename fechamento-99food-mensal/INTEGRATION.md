# INTEGRATION.md — handoff de `Fechamento 99Food Mensal` (`fechamento-99food-mensal`)

## 1. Identificação

- **Módulo**: `fechamento-99food-mensal` — Fechamento 99Food Mensal
- **Versão do pacote**: 0.1.0
- **Autor / contato**: Iago Pereira <iago.pereira@cocobambu.com>
- **Versão do SDK usada**: `@gia-cb/*` 0.1.0-alpha.71 (fixada; mínimo para `integracoes` em `GiaOperacao`)
- **Substitui**: nada (não há tela da 99 no GIA legado). Espelho do
  `fechamento-ifood-mensal` 0.1.2 para a 99Food.

## 2. Banco de dados

### 2.1 Migrations incluídas

Nenhuma migration do portal. **Schema novo no banco do Maestro**: `fechamento_99food`
(mesma estrutura do `ifood_fechamento` + `historico`), criado por
**`sql-maestro/001_schema.sql`** (vai no pacote; idempotente; traz os GRANTs
comentados). **Ainda não rodado** — decisão de 17/11/2026: aplicar depois, na ordem do
§7.

Enquanto o schema não existe: a consulta funciona (lançamentos da 99 + borderô, sem
nada gravado) e o Salvar e o Histórico respondem **503** "o banco do Maestro ainda não
está preparado para o Fechamento 99Food Mensal".

| Tabela                  | Restrição exigida                                            | Usada por                           |
| ----------------------- | ------------------------------------------------------------ | ----------------------------------- |
| `fechamentos_mensais`   | índice único `(loc_ref, ano, mes) WHERE deletado_em IS NULL` | um cabeçalho ativo por loja/mês     |
| `online_dia`            | `UNIQUE (fechamento_id, data_pedido)`                        | `salvar.ts`                         |
| `adquirente_dia`        | `UNIQUE (fechamento_id, data_pedido)`                        | `salvar.ts`                         |
| `conferencia_breakdown` | `UNIQUE (fechamento_id, centro_custo)`                       | `INSERT … ON CONFLICT` do breakdown |
| `historico`             | só inclusão (`SELECT, INSERT`)                               | `salvar.ts`, `historico.ts`         |

### 2.2 Fontes a conectar

| Handler (`src/server/`) | Fonte                                                                             | Acesso                                      |
| ----------------------- | --------------------------------------------------------------------------------- | ------------------------------------------- |
| `lojas.ts`              | `ctx.empresas()` + `ctx.operacoes()` → `integracoes` 99FOOD                       | —                                           |
| `bill.ts`               | `openapi.99food.com` — `POST /v3/finance/finance/getShopBillDetail`               | `ctx.credencial('99food')`                  |
| `manual.ts`             | Maestro: `SELECT` em `bordero.borderos`, `bordero.fields` e `fechamento_99food.*` | `sql` (`GIA_SERVER_DATABASE_URL`)           |
| `salvar.ts`             | Maestro: `INSERT/UPDATE` em `fechamento_99food.*` (transação)                     | `getDbClient()` (`GIA_SERVER_DATABASE_URL`) |
| `historico.ts`          | Maestro: `SELECT` em `fechamento_99food.historico`                                | `sql` (`GIA_SERVER_DATABASE_URL`)           |

- [ ] **Hub de Credenciais — integração `99food`** (nova): base
      `https://openapi.99food.com`; token do `POST /v3/auth/authtoken/signIn` com
      `{ retailer: app_id, secret: app_secret }`, resposta `accessToken` + `expiresIn`
      (21600 s = **6 h**). O módulo não renova: o hub entrega sempre um token válido.
      **A Financial API exige autorização especial da 99, pedida por e-mail** — sem
      ela, cada loja volta 403 (aviso na tela). Liberar este módulo na integração.
- [ ] **Vínculo 99FOOD nas operações** (`gia.operacoes_integracoes`): o `locRef` é o
      `app_shop_id` da loja na 99Food (o `acceptor_code` da Financial API) —
      **confirmar** com o time GIA e cadastrar. Operação sem vínculo = loja "Sem 99Food".
      O `gia.config.ts` usa vínculos fictícios (`demo-<operação>`).
- [ ] **Secret `GIA_SERVER_DATABASE_URL`**: banco do Maestro (o mesmo do Fechamento
      iFood Mensal). O usuário precisa de `SELECT` em `bordero.borderos` e
      `bordero.fields` e dos GRANTs do `001_schema.sql` no `fechamento_99food`.
- [ ] **Chave da loja**: o número da loja (nome da Empresa "01.CB GOIANIA" → "01" ou
      BIAPI) é o `loc_ref` do fechamento e o `property_number` do borderô.

## 3. Menu / navegação

- **Caminho**: **Plataformas › 99Food › Fechamento 99Food Mensal** (subgrupo **99Food**
  de Plataformas; criar se ainda não existir, como o subgrupo iFood).
- **navGroup**: `cardapio` (Plataformas).

| Tela      | path                        | label                    | ícone (lucide)  | permissão                      | faqId                      |
| --------- | --------------------------- | ------------------------ | --------------- | ------------------------------ | -------------------------- |
| Principal | `/fechamento-99food-mensal` | Fechamento 99Food Mensal | `CalendarRange` | `fechamento-99food-mensal.ler` | `fechamento-99food-mensal` |

## 4. Edge functions & secrets

- `edge-functions/fechamento-99food-mensal/` — gerada pelo `gia pack` a partir de
  `src/server/` (`lojas`, `bill`, `manual`, `salvar`, `historico`).
- Secrets: `GIA_SERVER_DATABASE_URL`. Integração do hub: `99food`.
- **Trava de teste — `FECHAMENTO_99FOOD_MENSAL_EMPRESA_TESTE`** (opcional, id numérico
  da Empresa no portal). Homologação e produção gravam no **mesmo banco do Maestro**:
  - **Homologação**: definir com o id da `999.CB TECH HOMOLOG` (93 no `gia dev`;
    conferir no cadastro de homologação). O `salvar` recusa qualquer outra Empresa com
    **403** ("Este ambiente é de teste…") **antes** de tocar no banco.
  - **Produção**: **não** definir. Sem a variável nada muda.
  - Valor que não é id recusa **toda** gravação (503, motivo no log).
  - Fora do `config.secrets` de propósito (lida com `envOptional`).
- `GIA_DEV_99FOOD_MENSAL_DEMO`, `GIA_DEV_99FOOD_MENSAL_DEMO_ATRASO_MS` e
  `GIA_DEV_99FOOD_MENSAL_POR_OPERACAO` são só do `gia dev` — **não** configurar no portal.
- **Erros**: detalhe técnico no log da Edge Function com o prefixo
  `[fechamento-99food-mensal]`; a tela mostra uma frase curta. Status usados: 422
  (entrada inválida, loja da 99 de outra Empresa, mês com mais de 3 meses — errno
  110004), 424 (credencial recusada: 401 ou errno 10101/10102/14105/14106 — sem nova
  tentativa), 403 da 99 numa loja vira **aviso** e as outras seguem, 502 (99Food fora
  ou errno desconhecido — a tela tenta de novo até 2 vezes), 504 (passou de 30 s — sem
  nova tentativa), 503 (banco do Maestro, ou schema ainda não criado).
- **Limite de chamadas**: a 99 não documenta nem manda saldo de cota (`cota: null`). A
  fila da tela é a do iFood Mensal (até 3 páginas ao mesmo tempo, adaptativa).

## 5. Permissões declaradas

- `fechamento-99food-mensal.ler` — consultar todas as abas.
- `fechamento-99food-mensal.editar` — preencher e salvar (previsões, CB Desc. LOJA,
  comentários, breakdown, extrato, cancelados).

Sugestão de público: as mesmas pessoas do Fechamento iFood Mensal.

## 6. Realtime

Não usa.

## 7. Pendências / decisões abertas

- [ ] **Regras provisórias** (PRD §6 e §11): o lado 99 (lançamentos, status, DRE) e o
      de-para dos campos do borderô precisam da validação do financeiro com um mês
      fechado à mão **antes da entrega**.
- [ ] **Campos do borderô pendentes** (PRD §11, itens 1 a 4): duvidosos, nomes sem
      sufixo (`99food`, `99_food`…), `desconto_99food_off`, padronização dos nomes.
- [ ] **Financial API**: liberação pela 99, credencial no hub, tabela dos códigos de
      pagamento (para OFFLINE), fuso do `businessDateTime`, limite de chamadas.
- [ ] **Vínculos 99FOOD** com o `app_shop_id` de cada operação (time GIA).
- [ ] **Ordem da instalação**: (1) instalar em homologação com
      `FECHAMENTO_99FOOD_MENSAL_EMPRESA_TESTE` definida; (2) só então rodar o
      `sql-maestro/001_schema.sql` no Maestro e dar os GRANTs; (3) testar a gravação só
      na 999.
