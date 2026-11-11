-- Fechamento iFood Mensal — tabela de histórico das gravações (banco do MAESTRO).
--
-- Não é migration do portal: o schema `ifood_fechamento` mora no banco do Maestro
-- (fora do Supabase do portal), então o DBA roda este arquivo lá, uma vez, antes
-- de ligar o módulo. Idempotente (pode rodar de novo sem efeito).
--
-- Cada linha é UMA gravação (botão Salvar): quem, quando e o antes → depois de
-- cada campo e de cada linha incluída/removida, em `alteracoes` (jsonb). A tabela
-- é só de inclusão — o usuário do módulo recebe SELECT e INSERT, nunca UPDATE/DELETE.

CREATE TABLE IF NOT EXISTS ifood_fechamento.historico (
  id            bigserial    PRIMARY KEY,
  fechamento_id bigint       NOT NULL
                -- RESTRICT: o cabeçalho só tem exclusão lógica; apagar de verdade não
                -- pode levar o histórico junto.
                REFERENCES ifood_fechamento.fechamentos_mensais (id) ON DELETE RESTRICT,
  gravado_em    timestamptz  NOT NULL DEFAULT now(),
  -- Operação em que foi salvo ("02 cb" e "02 vst" dividem o mesmo fechamento).
  operacao_ref  varchar(30),
  -- Mesmo id das colunas criado_por/atualizado_por (legacyUserId ou id do portal).
  autor         uuid,
  -- Nome no momento da gravação (o cadastro pode mudar depois).
  autor_nome    varchar(200),
  -- [{ secao, item, campo, de, para, tipo } | { secao, item, acao: 'incluida'|'removida' }]
  alteracoes    jsonb        NOT NULL
                CONSTRAINT historico_alteracoes_array CHECK (jsonb_typeof(alteracoes) = 'array')
);

-- Bancos que rodaram a primeira versão deste arquivo.
ALTER TABLE ifood_fechamento.historico ADD COLUMN IF NOT EXISTS operacao_ref varchar(30);

CREATE INDEX IF NOT EXISTS idx_historico_fechamento
  ON ifood_fechamento.historico (fechamento_id, gravado_em DESC);

-- Troque <usuario_do_modulo> pelo usuário de GIA_SERVER_DATABASE_URL:
-- GRANT SELECT, INSERT ON ifood_fechamento.historico TO <usuario_do_modulo>;
-- GRANT USAGE ON SEQUENCE ifood_fechamento.historico_id_seq TO <usuario_do_modulo>;
