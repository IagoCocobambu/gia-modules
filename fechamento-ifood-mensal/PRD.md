# PRD — Fechamento iFood Mensal

## Metadata (obrigatório)

| Campo                  | Valor                                     |
| ---------------------- | ----------------------------------------- |
| **module_id**          | `fechamento-ifood-mensal`                 |
| **Label visível**      | Fechamento iFood Mensal                   |
| **Categoria**          | `vendas`                                  |
| **Autor**              | Iago Pereira (iago.pereira@cocobambu.com) |
| **Versão do PRD**      | `1.1`                                     |
| **Status**             | `em-dev`                                  |
| **Última atualização** | 2026-11-10                                |
| **SDK version mínima** | `@gia-cb/sdk@0.1.0-alpha.70`              |

---

## 1. Problema / Contexto (obrigatório)

### 1.1 Qual o problema?

O financeiro fecha o mês do iFood loja a loja: confere o que o iFood registrou
(vendas, comissões, taxas, promoções, ocorrências) contra o que a loja lançou no
caixa (o **borderô**), monta o DRE do mês, confere o repasse com o extrato
bancário e registra os cancelados pós-entrega. Sem a conciliação, diferença de
caixa e cobrança indevida do iFood passam sem ninguém ver.

### 1.2 Como é feito hoje?

Na tela **Fechamento Mensal iFood** do GIA legado (UniGUI + React embutido,
`TfrmFechamentoMensalIfood`). A ponte de eventos Ajax do UniGUI é frágil (payload
grande quebrava no caminho — houve que criar diagnóstico de JSON), a credencial do
iFood está escrita no código-fonte Delphi e a tela não funciona no celular.

### 1.3 Por que vale a pena resolver?

- O acesso ao iFood e ao banco passa a ser server-side (Edge Function), com a
  credencial no hub de Credenciais.
- A tela segue o padrão do portal, inclusive no celular.
- O módulo lê e grava **nas mesmas tabelas** do legado (`ifood_fechamento.*` no
  banco do Maestro): o fechamento continua de onde parou.
- As **regras de cálculo são as do legado, sem alteração** (decisão do produto em
  06/11/2026): os números têm de bater com a tela antiga. Os pontos em que a regra
  parece engano estão em §11 (Decisões pendentes), para o financeiro decidir.

---

## 2. Personas e cenários (obrigatório)

### 2.1 Personas

| Persona                       | Permissões         | Frequência de uso | Conhecimento técnico |
| ----------------------------- | ------------------ | ----------------- | -------------------- |
| Analista do financeiro        | `.ler` + `.editar` | Mensal (por loja) | Médio                |
| Gerente / coordenador de loja | `.ler`             | Mensal            | Baixo                |
| Auditoria / controladoria     | `.ler`             | Eventual          | Médio                |

### 2.2 Cenários primários

- **C1**: Como analista do financeiro, quero consultar o mês de uma loja e ver as
  diferenças iFood × caixa dia a dia (Online e Adquirentes) pra saber o que
  conferir.
- **C2**: Como analista do financeiro, quero preencher previsões, CB Desc. LOJA,
  comentários, o breakdown da Conferência, o extrato e os cancelados pós e salvar
  pra fechar o mês.
- **C3**: Como gerente de loja, quero consultar o fechamento das minhas lojas pra
  acompanhar o repasse e os descontos, sem poder alterar nada.
- **C4**: Como analista, quero fazer o fechamento no celular quando estou fora do
  computador.

### 2.3 Edge cases / Cenários secundários

- **Sem `.editar`**: os campos aparecem como texto; não há Nova linha, lápis,
  lixeira nem Salvar; o handler `salvar` responde 403.
- **Operação fora do escopo**: todos os handlers respondem 403 (`requireOperacao`).
- **Operação sem iFood** (Empresa sem `locRefs.IFOOD` e fora de
  `OPERACOES_IFOOD_PROPRIO`): aparece "Sem iFood" e Consultar é recusado (422).
- **Mês ainda aberto**: aviso de que os lançamentos vão só até o último dia que
  veio do iFood.
- **iFood fora ou com limite (429)**: a página é tentada de novo até 2 vezes; página que passa de 30 s (504) não é repetida;
  depois a consulta para com mensagem curta e "Tentar de novo".
- **iFood recusa a credencial ou a loja (401/403)**: erro na hora (424), sem nova
  tentativa, com a orientação de quem resolver.
- **Banco do Maestro fora**: mensagem curta "falha no banco de dados"; o detalhe vai
  para o log. O que estava preenchido continua na tela.
- **Troca de loja/mês ou fechar a aba com alteração pendente**: pede confirmação.
- **Duas gravações do mesmo mês ao mesmo tempo**: o índice único
  `(loc_ref, ano, mes)` recusa o segundo cabeçalho; quem perdeu vê "falha no banco"
  e salva de novo.

---

## 3. Requisitos funcionais (obrigatório)

### RF-1: Consultar o mês de uma loja

**Descrição**: escolher a operação (loja) e o mês de referência e buscar os
lançamentos do iFood do mês, o borderô e o que já foi gravado.

**Critério de pronto**:

- [ ] O seletor lista as operações do escopo (busca por **operação**, exceção deste
      módulo); "Inativa" e "Sem iFood" aparecem embaixo do nome.
- [ ] O padrão é o mês anterior; o seletor não passa do mês atual.
- [ ] O mês é dividido em janelas de até 8 dias, paginadas; até 3 páginas ao mesmo
      tempo, com faixa de progresso e Cancelar.
- [ ] As abas abrem quando o borderô chega e os lançamentos entram aos poucos; dias
      ainda em espera aparecem apagados; Salvar só libera no fim.

**Prioridade**: must-have

### RF-2: Conferência diária Online e Adquirentes

**Descrição**: uma linha por dia com SD (iFood), CB (borderô) e # (diferença), e os
campos digitáveis do dia.

**Critério de pronto**:

- [ ] Colunas e contas da §6 (RN-4 a RN-7).
- [ ] Quantidade e valor na mesma coluna, com o selo `3×` antes do R$ (padrão 6 do
      workspace); o diálogo do dia mostra "3× R$ 30,00".
- [ ] Previsão, CB Desc. LOJA (só Online) e comentário editáveis na grade e no
      diálogo do dia.

**Prioridade**: must-have

### RF-3: Conferência (DRE), Extrato, Recebimento e Cancelados pós

**Descrição**: DRE do mês por categoria com checks de 7%/3% e breakdown digitado;
extrato bancário e cancelados pós-entrega com inclusão, edição e remoção;
recebimento por data de pagamento × extrato.

**Critério de pronto**:

- [ ] Contas da §6 (RN-8 a RN-11).
- [ ] Extrato e Cancelados com formulário validado (data e valor obrigatórios,
      tamanho dos textos) e remoção com confirmação.

**Prioridade**: must-have

### RF-4: Barra de totais por aba

**Descrição**: os totais ficam em cards acima da tabela (nunca linha de total
dentro da grade), com dica no mouse e filtro por clique.

**Critério de pronto**:

- [ ] Um card por coluna que somaria; 4 principais à vista + "Ver todos os totais
      (+N)" nas abas com mais de 5 cards (Lançamentos, Online, Adquirentes).
- [ ] Cards que são recorte de linhas filtram a tabela (RN-12); o botão com o nome do
      filtro e o X tira o filtro; consultar de novo também.
- [ ] Botão **Totais** abre e fecha a barra; abre sozinha em tela alta fora do
      celular.

**Prioridade**: should-have

### RF-5: Salvar o fechamento

**Descrição**: gravar de uma vez tudo o que é digitado no mês da loja.

**Critério de pronto**:

- [ ] Uma transação só; apagar um valor e salvar limpa o valor gravado.
- [ ] Extrato e cancelados regravados por inteiro, com exclusão lógica das linhas
      anteriores.
- [ ] Autor e data nas colunas `criado_por`/`atualizado_por` + `logAudit`.
- [ ] Aviso de alteração não salva (ponto no botão, aviso no rodapé, contador
      Alterados, confirmação ao trocar e ao fechar a aba).

**Prioridade**: must-have

### RF-6: Uso no celular e em tela estreita

**Descrição**: todas as ações no celular; o máximo de altura para a tabela em
monitor pequeno.

**Critério de pronto**:

- [ ] Padrões 1, 2, 7 e 8 do `AGENTS.md` do workspace (ver §7).
- [ ] Grades viram cartões; o cartão do dia abre o diálogo com os campos.

**Prioridade**: must-have

### RF-7: Histórico das gravações

**Descrição**: ver quem salvou o fechamento do mês, quando e o que mudou.

**Critério de pronto**:

- [ ] Botão **Histórico** no rodapé (linha de informação embaixo da barra de abas), depois da consulta (`.ler`).
- [ ] Gravações da mais recente para a primeira, com autor, data/hora e o antes →
      depois por aba (`AuditDiff` do `@gia-cb/ui`); linhas incluídas (+) e removidas (−).
- [ ] Mês sem gravação e gravações anteriores ao histórico explicados no diálogo.
- [ ] Gravado na mesma transação do Salvar: se o histórico falha, nada é gravado.

**Prioridade**: must-have

---

## 4. Telas e fluxos (obrigatório)

### 4.1 Mapa de telas

| View                    | Rota                       | Permissão mínima                 | Descrição em uma frase                                         |
| ----------------------- | -------------------------- | -------------------------------- | -------------------------------------------------------------- |
| Fechamento do mês       | `/fechamento-ifood-mensal` | `fechamento-ifood-mensal.ler`    | Filtros + sete abas (barra de abas embaixo da tabela)          |
| Dia completo (diálogo)  | overlay                    | `fechamento-ifood-mensal.ler`    | Todos os números do dia e os campos editáveis (Online/Adquir.) |
| Linha do extrato / caso | overlay                    | `fechamento-ifood-mensal.editar` | Formulário de inclusão/edição                                  |
| Histórico (diálogo)     | overlay                    | `fechamento-ifood-mensal.ler`    | Gravações do mês: quem, quando e o antes → depois              |

### 4.2 Fluxos principais

**Fechar o mês de uma loja (C1 + C2)**

1. Escolher a loja e o mês → **Consultar** (progresso por janela/página). Fora do
   celular a barra de filtros vira uma linha só depois da consulta.
2. **Online** e **Adquirentes**: conferir as colunas `#` (os cards `#` filtram os
   dias com diferença); preencher previsão, CB Desc. LOJA e comentários.
3. **Conferência**: conferir valor a depositar e os checks de 7%/3%; digitar o
   breakdown por centro de custo.
4. **Extrato**: incluir as linhas do malote; conferir o **Recebimento**.
5. **Cancelados pós**: registrar os casos do mês.
6. **Salvar**.

**Consultar sem editar (C3)**: passo 1 e as abas, sem campos digitáveis.

**Celular (C4)**: Consultar recolhe os filtros (a seta do cabeçalho reabre); as
grades viram cartões; o cartão do dia abre o diálogo do dia; Extrato e Cancelados
usam o mesmo formulário do desktop.

### 4.3 Wireframes / Mockups

Comparações de layout da grade e dos totais em `docs/` (fora do pacote).

---

## 5. Requisitos técnicos

### 5.1 Schema de banco

Sem migrations: o schema `ifood_fechamento` já existe no banco do Maestro
(`SQL/create_fechamento_mensal_schema.sql` do pacote legado). As restrições
únicas que a gravação exige estão no `INTEGRATION.md` §2.1.

| Tabela                                                 | Acesso           | Uso                                                                                                           |
| ------------------------------------------------------ | ---------------- | ------------------------------------------------------------------------------------------------------------- |
| `bordero.borderos`                                     | leitura          | CB Online, CB Desc. iFood, Adquirentes caixa por dia (versão vigente: última alteração ou o original)         |
| `ifood_fechamento.fechamentos_mensais`                 | leitura/gravação | cabeçalho loja (`loc_ref` = número do `operacao_ref`, "02 cb" → "02"; `08 cb` e `08 vst` dividem) + ano + mês |
| `ifood_fechamento.online_dia` / `adquirente_dia`       | leitura/gravação | previsão, CB Desc. LOJA, comentário por dia                                                                   |
| `ifood_fechamento.conferencia_breakdown`               | leitura/gravação | `valor_site_cc1..4`                                                                                           |
| `ifood_fechamento.extrato_bancario` / `cancelados_pos` | leitura/gravação | listas, regravadas a cada Salvar (as anteriores recebem `deletado_em`)                                        |
| `ifood_fechamento.historico` (**nova**)                | leitura/inclusão | uma linha por Salvar com mudança: autor, data, antes → depois (`sql-maestro/001_historico.sql`)               |

### 5.2 Permissões (obrigatório)

| Key                              | Descrição                                                  | Granularidade |
| -------------------------------- | ---------------------------------------------------------- | ------------- |
| `fechamento-ifood-mensal.ler`    | Consultar o fechamento (todas as abas) das lojas do escopo | Leitura       |
| `fechamento-ifood-mensal.editar` | Preencher e salvar os campos manuais, extrato e cancelados | Escrita       |

No legado as telas diária e mensal ficavam atrás de uma permissão só
(`gia / relfechamentoifood`). O filtro de loja por usuário do legado
(`UsuarioTemAcessoLocRef`) virou `ctx.requireOperacao` em todos os handlers.

### 5.3 Integrações externas

| Integração                                                         | Propósito           | Camada                              | Credencial                             |
| ------------------------------------------------------------------ | ------------------- | ----------------------------------- | -------------------------------------- |
| API Financial do iFood `financial/v3.0/merchants/{merchant}/sales` | Lançamentos do mês  | handler `ledger`                    | hub de Credenciais, integração `ifood` |
| Banco do Maestro (`bordero`, `ifood_fechamento`)                   | Borderô e o gravado | handlers `manual` e `salvar`        | secret `GIA_SERVER_DATABASE_URL`       |
| Operações do escopo e Empresa da operação (`locRefs.IFOOD`)        | Lojas e merchant    | `ctx.operacoes()`, `ctx.empresas()` | —                                      |

**Leitura do iFood**: cada `orderEvents[].fullCode = FINANCIAL_BILLED_ORDER_ENTRY` →
`metadata.entries[]` vira uma linha, com o mapeamento do legado
(`AppendLedgerLineMensal`) — RN-1 a RN-3.

### 5.4 BFF / processamento em segundo plano

| Endpoint (handler) | Propósito                                   | Segundo plano? | Email ao concluir? |
| ------------------ | ------------------------------------------- | -------------- | ------------------ |
| `operacoes`        | Operações do escopo com o status do iFood   | Não            | —                  |
| `ledger`           | Uma página de uma janela de 8 dias do iFood | Não            | —                  |
| `manual`           | Borderô vigente + o que foi gravado no mês  | Não            | —                  |
| `salvar`           | Grava o fechamento do mês (transação)       | Não            | —                  |
| `historico`        | Gravações do mês com o antes → depois       | Não            | —                  |

Sem job em segundo plano: a consulta é de **uma loja**, em chamadas curtas (uma por
página, ~4 s cada), até 3 ao mesmo tempo, com progresso e Cancelar. Medido no dev
com 8 páginas de 1,5 s: 16,3 s uma a uma × 4,6 s em paralelo. Não é multi-loja nem
export volumoso (conventions §15) — mesma escolha do Fechamento Maestro.

**Erros**: o detalhe técnico vai para o log do servidor; a tela recebe mensagem
curta. 422 (entrada inválida, loja sem iFood), 424 (iFood recusou credencial/loja —
sem nova tentativa), 502 (iFood fora — até 2 novas tentativas), 504 (página passou de 30 s — sem nova tentativa), 503
(banco). O modo de demonstração (`GIA_DEV_IFOOD_MENSAL_DEMO`) é só do `gia dev`.

### 5.5 Realtime

Não usa.

---

## 6. Regras de negócio (obrigatório)

Todas as contas são as do legado (`formulasLedger.ts` / `conferenciaCategorias.ts`),
portadas em `src/regras.ts` e `src/conferencia.ts`.

- **RN-1 — Data do lançamento**: `createdAt` do pedido (sem conversão de fuso);
  pedido antes das 6h conta no dia anterior. Lançamento sem pedido = "Ocorrências".
- **RN-1b — Página completa**: o iFood às vezes devolve a página "leve" (as vendas
  sem os eventos financeiros, e portanto sem lançamentos). O handler `ledger` pede a
  página de novo (até 4 vezes) enquanto houver venda sem evento financeiro e, se não
  completar, responde erro — a tela tenta de novo. Medido em 11/11/2026 (loja 01,
  out/2026): 19 de 49 páginas vieram leves na 1ª chamada; aceitar essas páginas fazia o
  mês sair com cerca de metade dos lançamentos. No 429 (limite) espera o `Retry-After`.
- **RN-2 — TOTAL**: o valor só conta como venda em Venda/Cancelamento Total e só
  para Entrada Financeira, promoções iFood/rede/indústria, taxa de serviço e taxa de
  conveniência; nas outras linhas é zero.
- **RN-3 — Status**: responsável IFOOD → `ONLINE VR` se vale-refeição com bandeira
  ≠ IFOOD_MEAL_VOUCHER, senão `ONLINE`; responsável LOJA → `ONLINE` se Entrada
  Financeira com impacto, senão `OFFLINE`.
- **RN-4 — Online**: SD Online = soma do TOTAL ONLINE do dia; # Online = SD − CB
  Online (borderô); SD Desc. iFood = Desc. OFF + Desc. VR; # Desc. iFood = SD − CB
  Desc. iFood (borderô); SD Desc. LOJA = Desc. LOJA On + Off; # Desc. LOJA = SD − CB
  Desc. LOJA (digitado).
- **RN-5 — # Total (Online)** = # Online + # Desc. iFood (o # Desc. LOJA fica de
  fora — regra do legado, ver §11).
- **RN-6 — Adquirentes**: SD ONLINE VR = iFood ONLINE VR − Descontos iFood; # Total
  = SD − Caixa (borderô). "Desc. LOJA VR" usa o mesmo filtro dos descontos iFood
  (§11).
- **RN-7 — Borderô vigente**: por dia, a última alteração do borderô original, ou o
  original quando não há alteração; só borderô não temporário.
- **RN-8 — Conferência**: lançamentos da competência do mês somados por descrição em
  Recebido / Incentivos / Taxas / Outros; Valor a depositar = soma dos quatro;
  Diferença = Valor a depositar − breakdown digitado (até 4 centros de custo).
- **RN-9 — Checks**: média do percentual da comissão (esperado 7%) e da taxa de
  transação (esperado 3%).
- **RN-10 — Recebimento**: lançamentos com impacto no repasse agrupados pela data de
  pagamento; Extrato = malote num raio de 1 dia; Diferença = Site − Extrato; data
  repetida desconta o Site vizinho para não contar o malote em dobro.
- **RN-11 — Chave da loja**: número do `operacao_ref` ("02 cb" → "02") é o
  `loc_ref` do fechamento e o `property_number` do borderô; operações de mesmo
  número dividem o fechamento. Ref que não começa pelo número é recusado.
- **RN-12 — Cards que filtram**: Lançamentos (repasse, online, VR, offline, taxas,
  promoções, ocorrências); Online (# online, # desc. iFood, # desc. loja, # total →
  dias com diferença na coluna); Adquirentes (# total e divergência absoluta → dias
  com # Total ≠ 0); Recebimento (datas com diferença); Cancelados pós (reembolsado →
  casos com reembolso). Os valores dos cards são do mês inteiro; card zerado não
  filtra.
- **RN-13 — Gravação**: dia que ficou vazio é limpo no banco; extrato e cancelados
  são regravados por inteiro com exclusão lógica (`deletado_em`); até 5000 linhas
  por lista; textos com o tamanho das colunas do banco; dia dentro do mês.
- **RN-14 — Histórico**: as tabelas ficam no banco do Maestro, fora do Supabase do
  portal (sem trigger do portal). Cada Salvar que muda alguma coisa grava UMA linha em
  `ifood_fechamento.historico`, **na mesma transação**: autor (id e nome), data e o
  antes → depois de cada campo (Online/Adquirentes por dia, breakdown, anulação) e
  cada linha do Extrato/Cancelados incluída, removida ou editada (a editada mostra só os
  campos que mudaram). Registra também a operação em que foi salvo (`02 cb`/`02 vst`). Salvar sem mudança não gera linha. A tabela é só de inclusão. Além
  disso: `criado_por`/`atualizado_por`/`deletado_por` nas tabelas (id do usuário no
  GIA antigo, via `legacyUserId`, ou o id do portal) e `logAudit`
  (`fechamento-ifood-mensal.fechamento.salvo`, com o número de alterações). A tela
  mostra o histórico no botão **Histórico** (RF-7).

---

## 7. Critérios de aceite (obrigatório)

- [ ] C1: consulta de um mês mostra o progresso por janela/página e pode ser
      cancelada; os números das abas batem com a tela antiga para os mesmos loja/mês.
- [ ] C2: Salvar grava tudo numa transação; apagar um valor e salvar limpa o valor
      gravado; trocar de loja/mês com alteração pendente pede confirmação.
- [ ] C3: sem `.editar`, nenhum campo é digitável e não há Salvar; o handler
      `salvar` responde 403. Operação fora do escopo responde 403 em todos os
      handlers.
- [ ] Erro do iFood ou do banco mostra mensagem curta, sem detalhe técnico; recusa
      do iFood (424) aparece sem nova tentativa.
- [ ] **Celular — filtros (padrão 1)**: ao Consultar, a barra de filtros **recolhe**;
      a seta do cabeçalho reabre; pesquisa recusada (loja não escolhida, nada mudou)
      deixa a barra aberta.
- [ ] **Celular**: grades em cartões; o cartão do dia abre o diálogo com os campos;
      Extrato e Cancelados incluem/editam/removem pelo formulário.
- [ ] **Toque (padrão 2)**: sem tooltip; os botões de ícone mostram o rótulo
      (Ver o dia, Editar, Remover); a FAQ explica cada card e coluna.
- [ ] **Totais (padrão 3)**: nenhuma linha de total dentro das tabelas; 4 cards
      principais + "Ver todos os totais (+N)" em Lançamentos, Online e Adquirentes;
      card escondido que filtra abre a parte de baixo e desativa o botão; os cards da
      RN-12 filtram a tabela, com o botão do filtro e o X.
- [ ] **Selo de quantidade (padrão 6)**: `3×` antes do R$ nas colunas de quantidade + valor; sem selo quando é zero; a calculadora lê só o R$.
- [ ] **Abas embaixo (padrão 7)**: `GridTabsBar` embaixo da tabela, compacta a
      partir de `md`, com Total da aba e Alterados.
- [ ] **Filtros enxutos (padrão 8)**: fora do celular, depois da consulta a barra vira
      uma linha só, com `aria-label` nos campos; erro ou cancelamento volta à barra
      completa.
- [ ] Mobile (375x667), tablet (768x1024) e desktop (1280x720); tema claro/escuro.
- [ ] FAQ cobre todas as funcionalidades e regras, sem menção ao sistema antigo;
      tour com 6 passos.
- [ ] **Histórico**: cada Salvar com mudança aparece no botão Histórico com autor,
      data/hora e o antes → depois; Salvar sem mudança não gera linha.
- [ ] `gia validate` passa sem erros nem avisos.

---

## 8. Fora de escopo

- Abas **Ocorrências** e **Anulação** do protótipo legado (não estavam no menu da tela).
- Exportação para Excel (o legado não tinha).
- Consulta de várias lojas de uma vez.
- Edição do borderô (é feita no próprio borderô).

---

## 9. Métricas / Telemetria

| Métrica                           | Como medir                                            | Onde olhar            |
| --------------------------------- | ----------------------------------------------------- | --------------------- |
| Fechamentos gravados por mês      | `logAudit` `fechamento-ifood-mensal.fechamento.salvo` | Auditoria do portal   |
| Falhas do iFood / do banco        | log `[fechamento-ifood-mensal]` da Edge Function      | Logs da Edge Function |
| Números iguais aos da tela antiga | Conferência por amostragem com o financeiro na virada | —                     |

---

## 10. Riscos e mitigações

| Risco                                     | Probabilidade | Impacto | Mitigação                                                                                              |
| ----------------------------------------- | ------------- | ------- | ------------------------------------------------------------------------------------------------------ |
| Mês grande → muitas páginas do iFood      | Médio         | Médio   | 3 chamadas em paralelo, espera do `Retry-After` no 429, progresso, Cancelar, nova tentativa em 429/5xx |
| Hub entrega token do iFood vencido        | Médio         | Alto    | Hub renova o token (6 h, sem refresh); erro 424 orienta avisar o admin                                 |
| Gravação concorrente com a tela do legado | Médio         | Alto    | Desligar a tela do legado na virada (`INTEGRATION.md` §7)                                              |
| Índices únicos ausentes no Maestro        | Baixo         | Alto    | Conferência listada no `INTEGRATION.md` §2.1                                                           |
| Falha do banco no meio do Salvar          | Baixo         | Médio   | Transação única; nada parcial; mensagem curta e o preenchido fica na tela                              |

---

## 11. Dependências

### Outros módulos do GIA

Nenhum. Usa o cadastro de operações/Empresas do portal (`ctx.operacoes()`,
`ctx.empresas()`) e o hub de Credenciais.

### Serviços externos

- API Financial do iFood (integração `ifood` do hub, a mesma do Fechamento iFood
  Diário).
- Banco do Maestro (`GIA_SERVER_DATABASE_URL`).

### Decisões pendentes

Regras do legado mantidas de propósito (decisão do financeiro):

- [ ] **Recebimento — coluna Extrato sempre zerada**: o legado só reconhece a data do
      movimento em `DD/MM/AAAA`, mas o extrato é gravado em `AAAA-MM-DD`.
- [ ] **Recebimento — ordem das datas**: `DD/MM/AAAA` ordenado como texto.
- [ ] **Adquirentes — "Desc. LOJA VR"** usa o mesmo filtro de "Descontos iFood".
- [ ] **Online — "# Total"** sem o # Desc. LOJA.
- [ ] **Conferência — "Recebido Via iFood"** soma um id inexistente
      (`incentivos_loja`) em vez de `incentivos_loja_recebido`.
- [ ] **Cancelamentos**: o mapeamento só gera fato gerador `Venda` ou `Ocorrência
Avulsa`, então Cancel. total/parcial ficam zeradas.

Do portal:

- [ ] **Criar `ifood_fechamento.historico` no Maestro** antes de ligar o módulo
      (`sql-maestro/001_historico.sql`, `INTEGRATION.md` §2.1). Sem ela o Salvar
      é recusado ("banco não preparado para o histórico").

Correções feitas (perda de dado, não cálculo):

- Dia que ficou **vazio** é limpo no banco — o legado ignorava o dia e o valor
  antigo voltava.
- **"Vale no cofre?"** dos cancelados virou um campo só (o legado lia "Veio" e
  gravava "Vale").
- Falha ao ler o banco **interrompe** a consulta com erro (o legado mostrava a tela
  zerada, e um Salvar em seguida apagaria extrato/cancelados).

---

## 12. Insumo pra FAQ (obrigatório)

1. Como consulto um mês? Por que demora? Posso cancelar?
2. O que é cada aba? Por que as abas ficam embaixo e o que são Total e Alterados?
3. O que significam SD, CB e #? De onde vêm CB Online e Caixa? Por que estão zerados?
4. Por que o pedido da madrugada cai no dia anterior?
5. O que é o selo "3×" antes do valor?
6. O que cada card de total soma? Quais filtram a tabela e como tiro o filtro?
7. O que eu preencho e quando é gravado? O que acontece se trocar de loja sem salvar?
8. Por que não vejo Salvar? Por que a loja não aparece? O que é "fora do escopo"?
9. Por que a coluna Extrato do Recebimento está zerada?
10. A consulta deu erro no meio — perdi algo? O que fazer com "falha no banco"?
11. Como funciona no celular e na tela de toque?
12. Por que a barra de filtros vira uma linha só depois da consulta?
13. Como sei quem alterou um valor? O que aparece no Histórico?

---

## 13. Insumo pra Tour (obrigatório)

| #   | Tela       | Target (data-tour)                  | Mensagem                                                               |
| --- | ---------- | ----------------------------------- | ---------------------------------------------------------------------- |
| 1   | Fechamento | `fechamento-ifood-mensal-filtros`   | Loja e mês (padrão: mês anterior); "Sem iFood"                         |
| 2   | Fechamento | `fechamento-ifood-mensal-consultar` | Consulta em partes, abas abrem antes do fim; clicar para continuar     |
| 3   | Fechamento | `fechamento-ifood-mensal-abas`      | Abas embaixo da tabela, Total e Alterados (aparece após consultar)     |
| 4   | Fechamento | `fechamento-ifood-mensal-conteudo`  | Cards de totais, colunas #, campos digitáveis (aparece após consultar) |
| 5   | Fechamento | `fechamento-ifood-mensal-historico` | Histórico: quem salvou, quando e o antes → depois                      |
| 6   | Fechamento | `fechamento-ifood-mensal-salvar`    | Salvar (só com `.editar`; último passo, para não travar o leitor)      |

Passos cujo alvo ainda não está na tela aguardam em silêncio até ele aparecer
(contrato do `TourStep`), por isso 3, 4 e 5 vêm depois de Consultar e Salvar é o último.

---

## 14. Histórico

### 2026-11-06 — v1.0 inicial

- Criado por Iago Pereira a partir do Fechamento Mensal iFood do GIA legado
  (`legacy-gia/entrega-ifood`).
- Regras do legado portadas sem alteração; pendências listadas para o financeiro.

### 2026-11-10 — v1.1

- PRD no formato do template do SDK (Metadata, cenários, RF, RN, histórico).
- Consulta em paralelo com exibição aos poucos; busca por operação; barra de totais
  com 4 principais + "Ver todos"; selo `3×`; abas embaixo; filtros enxutos.
- Cards de diferença filtram a tabela em Online, Adquirentes, Recebimento e
  Cancelados pós; rótulo visível nos botões de ícone em tela de toque.
- Erros do iFood e do banco sem detalhe técnico na tela; recusa do iFood sem nova
  tentativa; modo de demonstração só no `gia dev`.
- Histórico das gravações (RF-7, RN-14): tabela nova `ifood_fechamento.historico`
  no Maestro, gravada pelo Salvar na mesma transação, e o botão **Histórico**.
