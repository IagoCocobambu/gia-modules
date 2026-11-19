-- Fechamento 99Food Mensal — schema `fechamento_99food` (banco do MAESTRO).
--
-- ONDE: banco do Maestro (o mesmo de `bordero.*` e `ifood_fechamento.*`), o de
--       GIA_SERVER_DATABASE_URL da Edge Function. NÃO é migration do portal.
-- QUEM: o DBA (ou o time GIA com permissão de DDL no Maestro).
-- QUANDO: uma vez, ANTES de ligar o Salvar do módulo — e só DEPOIS de a trava
--       FECHAMENTO_99FOOD_MENSAL_EMPRESA_TESTE estar definida em homologação
--       (INTEGRATION.md §2). Ainda NÃO rodado (decisão de 17/11/2026: aplicar depois).
--
-- Mesma estrutura do `ifood_fechamento` (Fechamento iFood Mensal), num schema próprio
-- para não mexer nas tabelas que a tela antiga do iFood grava. O borderô NÃO é
-- gravado: é lido na hora de `bordero.borderos` + `bordero.fields`.
--
-- Idempotente (IF NOT EXISTS): pode rodar de novo sem efeito. Imutável depois de
-- entregue — correção vem num arquivo novo (002_…).

BEGIN;

CREATE SCHEMA IF NOT EXISTS fechamento_99food;

COMMENT ON SCHEMA fechamento_99food IS
  'Persistência do Fechamento 99Food Mensal — o que o usuário digita e importa';

-- -----------------------------------------------------------------------------
-- Cabeçalho: 1 registro por loja/mês
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fechamento_99food.fechamentos_mensais (
  id                BIGSERIAL PRIMARY KEY,
  loc_ref           VARCHAR(10)  NOT NULL,
  ano               SMALLINT     NOT NULL CHECK (ano >= 2000),
  mes               SMALLINT     NOT NULL CHECK (mes BETWEEN 1 AND 12),
  mes_ref           VARCHAR(7)   GENERATED ALWAYS AS (
                      ano::TEXT || '-' || LPAD(mes::TEXT, 2, '0')
                    ) STORED,

  anulacao_verificar NUMERIC(14, 2) NOT NULL DEFAULT 0,

  criado_em         TIMESTAMPTZ  NOT NULL DEFAULT now(),
  criado_por        UUID,
  atualizado_em     TIMESTAMPTZ,
  atualizado_por    UUID,
  deletado_em       TIMESTAMPTZ,
  deletado_por      UUID
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_fechamento_mensal_ativo
  ON fechamento_99food.fechamentos_mensais (loc_ref, ano, mes)
  WHERE deletado_em IS NULL;

COMMENT ON TABLE fechamento_99food.fechamentos_mensais IS
  'Cabeçalho do fechamento por loja (loc_ref) e competência.';

CREATE INDEX IF NOT EXISTS idx_fechamentos_mensais_loc_mes
  ON fechamento_99food.fechamentos_mensais (loc_ref, ano, mes)
  WHERE deletado_em IS NULL;

CREATE INDEX IF NOT EXISTS idx_fechamentos_mensais_mes_ref
  ON fechamento_99food.fechamentos_mensais (mes_ref)
  WHERE deletado_em IS NULL;

-- -----------------------------------------------------------------------------
-- Aba Online — input por dia (CB Online / CB Descontos 99 = borderô, bordero.fields)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fechamento_99food.online_dia (
  id                      BIGSERIAL PRIMARY KEY,
  fechamento_id           BIGINT       NOT NULL
                            REFERENCES fechamento_99food.fechamentos_mensais(id)
                            ON DELETE CASCADE,
  data_pedido             DATE         NOT NULL,

  previsao_pagamento      DATE,
  cb_descontos_loja       NUMERIC(14, 2),
  comentario              TEXT,

  criado_em               TIMESTAMPTZ  NOT NULL DEFAULT now(),
  criado_por              UUID,
  atualizado_em           TIMESTAMPTZ,
  atualizado_por          UUID,

  CONSTRAINT uq_online_dia UNIQUE (fechamento_id, data_pedido)
);

COMMENT ON TABLE fechamento_99food.online_dia IS
  'Aba Online — previsão, CB Descontos LOJA e comentário por dia.';

CREATE INDEX IF NOT EXISTS idx_online_dia_fechamento
  ON fechamento_99food.online_dia (fechamento_id);

-- -----------------------------------------------------------------------------
-- Aba Adquirentes — input por dia (Caixa = borderô, bordero.fields)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fechamento_99food.adquirente_dia (
  id                      BIGSERIAL PRIMARY KEY,
  fechamento_id           BIGINT       NOT NULL
                            REFERENCES fechamento_99food.fechamentos_mensais(id)
                            ON DELETE CASCADE,
  data_pedido             DATE         NOT NULL,

  previsao_pagamento      DATE,
  comentario              TEXT,

  criado_em               TIMESTAMPTZ  NOT NULL DEFAULT now(),
  criado_por              UUID,
  atualizado_em           TIMESTAMPTZ,
  atualizado_por          UUID,

  CONSTRAINT uq_adquirente_dia UNIQUE (fechamento_id, data_pedido)
);

COMMENT ON TABLE fechamento_99food.adquirente_dia IS
  'Aba Adquirentes — previsão e comentário por dia.';

CREATE INDEX IF NOT EXISTS idx_adquirente_dia_fechamento
  ON fechamento_99food.adquirente_dia (fechamento_id);

-- -----------------------------------------------------------------------------
-- Aba Extrato — importação do extrato bancário
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fechamento_99food.extrato_bancario (
  id                      BIGSERIAL PRIMARY KEY,
  fechamento_id           BIGINT       NOT NULL
                            REFERENCES fechamento_99food.fechamentos_mensais(id)
                            ON DELETE CASCADE,

  loja                    VARCHAR(20),
  banco                   VARCHAR(100),
  tipo                    VARCHAR(100),
  mes_ano                 VARCHAR(20),
  classificacao           VARCHAR(150),
  sub_classificacao       VARCHAR(150),
  data_movimento          DATE         NOT NULL,
  historico               TEXT,
  documento               VARCHAR(100),
  malote                  NUMERIC(14, 2) NOT NULL DEFAULT 0,
  competencia             VARCHAR(7),

  criado_em               TIMESTAMPTZ  NOT NULL DEFAULT now(),
  criado_por              UUID,
  atualizado_em           TIMESTAMPTZ,
  atualizado_por          UUID,
  deletado_em             TIMESTAMPTZ,
  deletado_por            UUID
);

COMMENT ON TABLE fechamento_99food.extrato_bancario IS
  'Extrato bancário importado — base da aba Recebimento (malote).';

CREATE INDEX IF NOT EXISTS idx_extrato_fechamento
  ON fechamento_99food.extrato_bancario (fechamento_id)
  WHERE deletado_em IS NULL;

CREATE INDEX IF NOT EXISTS idx_extrato_data_movimento
  ON fechamento_99food.extrato_bancario (data_movimento)
  WHERE deletado_em IS NULL;

CREATE INDEX IF NOT EXISTS idx_extrato_competencia
  ON fechamento_99food.extrato_bancario (competencia)
  WHERE deletado_em IS NULL;

-- -----------------------------------------------------------------------------
-- Aba Cancelados pós
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fechamento_99food.cancelados_pos (
  id                      BIGSERIAL PRIMARY KEY,
  fechamento_id           BIGINT       NOT NULL
                            REFERENCES fechamento_99food.fechamentos_mensais(id)
                            ON DELETE CASCADE,

  data_pedido             DATE         NOT NULL,
  estabelecimento         VARCHAR(150),
  cnpj                    VARCHAR(20),
  nome_cliente            VARCHAR(200),
  numero_pedido           VARCHAR(50),
  id_99food                VARCHAR(50),
  valor_pedido_taxa       NUMERIC(14, 2),
  valor_reembolso         NUMERIC(14, 2),
  centro_venda            VARCHAR(100),
  origem_cancelamento     VARCHAR(100),
  justificativa           TEXT,
  andamento               VARCHAR(150),
  protocolo               VARCHAR(100),
  vale_no_cofre           VARCHAR(20),
  data_anulacao           DATE,
  data_reembolso          DATE,

  criado_em               TIMESTAMPTZ  NOT NULL DEFAULT now(),
  criado_por              UUID,
  atualizado_em           TIMESTAMPTZ,
  atualizado_por          UUID,
  deletado_em             TIMESTAMPTZ,
  deletado_por            UUID
);

COMMENT ON TABLE fechamento_99food.cancelados_pos IS
  'Cancelamentos pós-entrega — contestações e reembolsos.';

CREATE INDEX IF NOT EXISTS idx_cancelados_pos_fechamento
  ON fechamento_99food.cancelados_pos (fechamento_id)
  WHERE deletado_em IS NULL;

CREATE INDEX IF NOT EXISTS idx_cancelados_pos_id_99food
  ON fechamento_99food.cancelados_pos (id_99food)
  WHERE deletado_em IS NULL;

-- -----------------------------------------------------------------------------
-- Aba Conferência — breakdown loja (valor site por centro de custo)
-- valor_site_cc1 = loja principal (label na UI = nome da loja); cc2–cc4 = centros de custo
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fechamento_99food.conferencia_breakdown (
  id                      BIGSERIAL PRIMARY KEY,
  fechamento_id           BIGINT       NOT NULL
                            REFERENCES fechamento_99food.fechamentos_mensais(id)
                            ON DELETE CASCADE,
  centro_custo            VARCHAR(20)  NOT NULL,
  valor                   NUMERIC(14, 2) NOT NULL DEFAULT 0,

  criado_em               TIMESTAMPTZ  NOT NULL DEFAULT now(),
  criado_por              UUID,
  atualizado_em           TIMESTAMPTZ,
  atualizado_por          UUID,

  CONSTRAINT uq_conferencia_breakdown UNIQUE (fechamento_id, centro_custo),
  CONSTRAINT ck_conferencia_centro_custo CHECK (
    centro_custo IN (
      'valor_site_cc1',
      'valor_site_cc2',
      'valor_site_cc3',
      'valor_site_cc4'
    )
  )
);

COMMENT ON TABLE fechamento_99food.conferencia_breakdown IS
  'Breakdown loja na Conferência — valor site por centro de custo (cc1–cc4).';

-- -----------------------------------------------------------------------------
-- Histórico das gravações: uma linha por Salvar (quem, quando, antes → depois).
-- Só de inclusão: o usuário do módulo recebe SELECT e INSERT, nunca UPDATE/DELETE.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fechamento_99food.historico (
  id            bigserial    PRIMARY KEY,
  fechamento_id bigint       NOT NULL
                -- RESTRICT: o cabeçalho só tem exclusão lógica; apagar de verdade não
                -- pode levar o histórico junto.
                REFERENCES fechamento_99food.fechamentos_mensais (id) ON DELETE RESTRICT,
  gravado_em    timestamptz  NOT NULL DEFAULT now(),
  -- Mesmo id das colunas criado_por/atualizado_por (legacyUserId ou id do portal).
  autor         uuid,
  -- Nome no momento da gravação (o cadastro pode mudar depois).
  autor_nome    varchar(200),
  -- [{ secao, item, campo, de, para, tipo } | { secao, item, acao: 'incluida'|'removida' }]
  alteracoes    jsonb        NOT NULL
                CONSTRAINT historico_alteracoes_array CHECK (jsonb_typeof(alteracoes) = 'array')
);

CREATE INDEX IF NOT EXISTS idx_historico_fechamento
  ON fechamento_99food.historico (fechamento_id, gravado_em DESC);


COMMIT;

-- GRANTs — troque <usuario_do_modulo> pelo usuário de GIA_SERVER_DATABASE_URL:
-- GRANT USAGE ON SCHEMA fechamento_99food TO <usuario_do_modulo>;
-- GRANT SELECT, INSERT, UPDATE ON
--   fechamento_99food.fechamentos_mensais, fechamento_99food.online_dia,
--   fechamento_99food.adquirente_dia, fechamento_99food.conferencia_breakdown,
--   fechamento_99food.extrato_bancario, fechamento_99food.cancelados_pos
--   TO <usuario_do_modulo>;
-- GRANT SELECT, INSERT ON fechamento_99food.historico TO <usuario_do_modulo>;
-- GRANT USAGE ON ALL SEQUENCES IN SCHEMA fechamento_99food TO <usuario_do_modulo>;
-- Leitura do borderô (se o usuário ainda não tiver):
-- GRANT USAGE ON SCHEMA bordero TO <usuario_do_modulo>;
-- GRANT SELECT ON bordero.borderos, bordero.fields TO <usuario_do_modulo>;
