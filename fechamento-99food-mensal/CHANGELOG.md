# Changelog — Fechamento 99Food Mensal

## 0.1.0 — 17/11/2026

Primeira versão, criada como espelho do Fechamento iFood Mensal 0.1.2. **Não
entregar antes da validação das regras pelo financeiro** (PRD §11).

### Adicionado

- Tela com as mesmas abas, cards, filtros, histórico e comportamento no celular do
  Fechamento iFood Mensal.
- Handler `bill`: Financial API da 99Food (`getShopBillDetail`, até 31 dias por
  consulta, 200 por página); cada linha da 99 vira lançamentos no formato do iFood
  (mapeamento provisório, PRD §6 RN-1/RN-2). Ids de 19 dígitos lidos como texto.
  Modo demo no `gia dev` (`GIA_DEV_99FOOD_MENSAL_DEMO=1`).
- Handler `manual`: CB lido dos campos da 99 em `bordero.fields` (borderô vigente),
  classificados por regex em Online, Desconto e Adquirentes; os demais (cancelados,
  offline, sem sufixo, não reconhecidos) num quadro "campos fora da conferência".
- Conferência (DRE) com as categorias da 99 e o check da comissão média.
- Gravação no schema novo `fechamento_99food` do Maestro, com a trava
  `FECHAMENTO_99FOOD_MENSAL_EMPRESA_TESTE` (padrão 12) e o SQL em
  `sql-maestro/001_schema.sql` (ainda não rodado). Sem o schema, a consulta funciona e
  Salvar/Histórico respondem 503 com mensagem clara.
- Vínculos `99FOOD` das operações (`ctx.operacoes()`); no `gia.config.ts`, fictícios.
