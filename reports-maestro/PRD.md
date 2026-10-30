# PRD — Reports Maestro

## Metadata (obrigatório)

| Campo                  | Valor                                     |
| ---------------------- | ----------------------------------------- |
| **module_id**          | `reports-maestro`                         |
| **Label visível**      | Reports Maestro                           |
| **Categoria**          | `operacional`                             |
| **Autor**              | Iago Pereira (iago.pereira@cocobambu.com) |
| **Versão do PRD**      | `1.0`                                     |
| **Status**             | `em-dev`                                  |
| **Última atualização** | 2026-10-29                                |
| **SDK version mínima** | `@gia-cb/sdk@0.1.0-alpha.66`              |

---

## 1. Problema / Contexto (obrigatório)

### 1.1 Qual o problema?

As lojas e o backoffice precisam consultar os pedidos de delivery que passaram pelo
Maestro (App Coco Bambu, iFood, 99Food e pedidos manuais): quem pediu, para onde,
quem confirmou ou cancelou, quanto foi pago e de que forma. É a base para conferir
o caixa do delivery, investigar reclamações de cliente e cancelamentos.

### 1.2 Como é feito hoje?

Pela tela **Reports Maestro** do GIA legado (UniGUI/Delphi, `TfrmMaestroReports`):
escolhe a loja e o período, clica em "Listar" e a tela mostra uma grade de 26
colunas lida da API do DW (`/Delivery/`), com exportação em CSV. O token da API é
obtido com usuário/senha fixos no servidor Delphi.

### 1.3 Por que vale a pena resolver?

A migração para o GIA tira a credencial do código (hub de Credenciais do portal),
aplica o escopo de lojas do usuário no servidor, exporta em Excel formatado com
totais, funciona no celular e corrige defeitos do legado: período longo que
travava sem resposta (a API devolve 524 depois de ~2 min) e lojas sem número no
nome que eram consultadas como loja "00".

---

## 2. Personas e cenários (obrigatório)

### 2.1 Personas

| Persona                 | Permissões                                        | Frequência de uso | Conhecimento técnico |
| ----------------------- | ------------------------------------------------- | ----------------- | -------------------- |
| Gerente de loja         | `reports-maestro.ler`                             | Diário            | Baixo                |
| Analista de delivery    | `reports-maestro.ler`, `reports-maestro.exportar` | Diário            | Médio                |
| Financeiro / tesouraria | `reports-maestro.ler`, `reports-maestro.exportar` | Semanal           | Médio                |

### 2.2 Cenários primários

- **C1**: Como gerente, quero ver os pedidos de delivery de ontem da minha loja
  para conferir confirmações e cancelamentos do turno.
- **C2**: Como analista, quero achar um pedido pelo número, CPF ou nome do cliente
  para responder uma reclamação.
- **C3**: Como financeiro, quero exportar os pedidos do mês em Excel para conferir
  os pagamentos por forma de pagamento.

### 2.3 Edge cases / Cenários secundários

- Usuário sem `reports-maestro.ler`: tela mostra acesso negado; handlers respondem 403.
- Loja fora do escopo do usuário (body adulterado): `ctx.requireEmpresa` → 403.
- Empresa sem número no começo do nome: não aparece no seletor; handler responde 422.
- Período > 31 dias, data final < inicial ou data futura: recusado com mensagem.
- API demora mais de 90 s: 504 com a sugestão de reduzir o período.
- API fora do ar ou integração não liberada: estado de erro com a mensagem do servidor (403/502/503/504) e "Tentar de novo".
- Loja sem delivery no período: estado vazio "Nenhum pedido".

---

## 3. Requisitos funcionais (obrigatório)

### RF-1: Seleção de loja

**Descrição**: o seletor lista as Empresas do escopo do usuário cujo nome começa
com o número da loja seguido de ponto ("01.CB GOIANIA"), em ordem alfabética, com
busca. Mesma origem do legado (`gia.empresas.nome_fantasia` + `user_empresas`).

**Critério de pronto**:

- [ ] Empresas sem número no nome não aparecem
- [ ] A primeira loja vem pré-selecionada

**Prioridade**: must-have

### RF-2: Filtro de período

**Descrição**: data inicial e final, as duas com padrão _ontem_ (como no legado).

**Critério de pronto**:

- [ ] Datas futuras, final < inicial e intervalo > 31 dias são recusados com mensagem
- [ ] A consulta usa o snapshot do clique em Pesquisar; sem mudança, o botão fica desativado

**Prioridade**: must-have

### RF-3: Leitura dos pedidos (API do DW)

**Descrição**: handler `pedidos` chama `GET /Delivery/?loc_ref=<nº loja>&start_date&end_date`
com o token do hub de Credenciais (integração `apidw`). O `loc_ref` é derivado do
nome da Empresa **no servidor** (o body só traz `empresaId`).

**Critério de pronto**:

- [ ] `requirePermission('reports-maestro.ler')` + `requireEmpresa(empresaId)`
- [ ] Timeout de 90 s (igual ao legado) com mensagem clara
- [ ] Resposta sem a lista `data` é tratada como erro, não como "zero pedidos"

**Prioridade**: must-have

### RF-4: Tabela de pedidos

**Descrição**: uma linha por pedido, ordenada pela criação, com as **26 colunas do
legado, nos mesmos nomes e ordem**: Loja · ID · Nº pedido · Data criação · Data
ação · Nº parceiro · Nº conta · CPF cliente · Nome cliente · Qtd pedidos · Email
cliente · Tel. cliente · Rua · Núm. · Referência · Retirada · Confirmado por ·
Cancelado por · Origem · Status pedido · Valor pedido · Valor entrega · Total pago ·
Desconto total · Forma pgto · Descontos. Busca global, filtro e ordenação por
coluna e escolha de colunas visíveis. Acima da tabela:

- **4 cards de totais** (acima da tabela, começam abertos se a altura da tela for
  > = 700 px e fechados abaixo disso; o botão **Totais** no
  > cabeçalho da tabela abre/fecha, com transição de altura + fade; desativado antes da
  > 1ª pesquisa; o estado vale enquanto a tela está aberta) — Valor pedido, Valor
  > entrega, Total pago e Desconto total —
  > com a soma dos pedidos do período nos status e origens marcados (todos, se nada). A busca
  > e os filtros de coluna da tabela não mudam os totais; para somar esse recorte,
  > use a linha **Total** do Excel (RF-5).
- **Dialog de filtros** (`Modal` da `@gia-cb/ui`, tela cheia no celular, aberto
  pelo botão **Filtros** no cabeçalho da tabela; desativado antes da 1ª pesquisa).
  Marcar chips **não** filtra na hora: o dialog edita um rascunho (começa do filtro
  aplicado ao abrir). Rodapé: **Limpar filtros** (desmarca as duas barras no
  rascunho) e **Ver N pedidos** (aplica o rascunho e fecha; N = pedidos que sobram
  com o rascunho). X, clique fora e Esc fecham **descartando** o rascunho. Filtro
  aplicado continua valendo com o dialog fechado — o botão mostra quantos chips
  estão aplicados.
  O botão é próprio do módulo: o de filtros condicionais do `DataReport` não expõe
  o estado e some no celular. Dentro do dialog:
- **Filtro de status** (no dialog de filtros, visual de chips/pílulas, distinto dos
  cards de totais) — Todos e um chip por status **presente nos pedidos** (com
  quantidade > 0 respeitando o filtro de origem marcado), traduzido e ordenado pelo
  dicionário (RN-6, ordem da vida do pedido); status fora do dicionário depois, em
  ordem alfabética. Cada chip mostra a quantidade de pedidos. Seleção **múltipla**
  (liga/desliga por status), "Todos" limpa; aplicada em "Ver N pedidos", filtra a
  tabela, os cards de totais e o export. Chip que entra/sai da lista tem transição
  (fade + escala). Nova pesquisa limpa a seleção.
- **Filtro de origem** (ao lado do de status no desktop, abaixo no celular; mesmo visual e regras) — um chip por
  origem presente nos pedidos (quantidade > 0 respeitando o status marcado; a API já devolve em português: "iFood", "App Coco
  Bambu", ...; sem dicionário), em ordem alfabética, "Sem origem" por último. Os
  dois filtros se combinam (E); a contagem de cada um respeita o OUTRO filtro, não
  o próprio. Chip marcado que ficou com 0 continua visível e desmarcável.
- **Coluna Origem** mostra a origem num badge centralizado, como o status, colorido
  por canal (iFood rosa, 99Food âmbar, App Coco Bambu azul, Pedido manual cinza;
  canal desconhecido só com contorno).

**Prioridade**: must-have

### RF-5: Exportar Excel

**Descrição**: com `reports-maestro.exportar`, gera `.xlsx` das linhas filtradas
com as 26 colunas, no **template de exportação do GIA** (título na linha 1,
subtítulo cinza na 2, cabeçalho `#DBE9FF` na 4, congelado e com autofiltro),
valores em R$, datas como data e linha **Total** com `SUBTOTAL(109)`. Nome
`GIA - Reports Maestro - <loja> - <período>.xlsx`.

**Prioridade**: must-have

---

## 4. Telas e fluxos (obrigatório)

### 4.1 Mapa de telas

| View    | Rota               | Permissão mínima      | Descrição em uma frase                      |
| ------- | ------------------ | --------------------- | ------------------------------------------- |
| Pedidos | `/reports-maestro` | `reports-maestro.ler` | Filtros de loja/período e tabela de pedidos |

### 4.2 Fluxos principais

**Fluxo C1 — Consultar**: abre `/reports-maestro` → loja e período → Pesquisar →
handler `pedidos` → cards de totais, filtros de status e de origem + tabela de pedidos.

**Fluxo C4 — Filtrar por status/origem**: clica em um ou mais chips de status e/ou de origem → tabela,
totais e export passam a mostrar só esses status e origens → "Todos" limpa cada barra.

**Fluxo C2 — Achar um pedido**: digita número, CPF ou nome na busca da tabela.

**Fluxo C3 — Exportar**: botão Exportar da tabela → `.xlsx` das linhas filtradas.

---

## 5. Requisitos técnicos

### 5.1 Schema de banco

Não se aplica — o módulo não grava nada.

### 5.2 Permissões (obrigatório)

| Key                        | Descrição                                | Granularidade     |
| -------------------------- | ---------------------------------------- | ----------------- |
| `reports-maestro.ler`      | Consultar os pedidos das lojas do escopo | Leitura           |
| `reports-maestro.exportar` | Exportar os pedidos em Excel             | Operação especial |

O módulo não tem escrita.

### 5.3 Integrações externas

| Integração                          | Propósito          | Camada                             | Credencial                             |
| ----------------------------------- | ------------------ | ---------------------------------- | -------------------------------------- |
| `api-dw.cocobambu.com` `/Delivery/` | Pedidos do Maestro | handler `pedidos`                  | hub de Credenciais, integração `apidw` |
| Cadastro de Empresas do portal      | Lojas do escopo    | handler `lojas` (`ctx.empresas()`) | —                                      |

### 5.4 BFF / processamento em segundo plano

Nenhum. A consulta é de **uma loja** e no máximo **31 dias** (~25 s e ~3 MB no pior
caso medido, loja 01 em 2026-09-28 a 2026-10-28) — síncrona, com o botão em
carregamento. O Excel é gerado no navegador a partir do que já está na tela
(`import()` dinâmico do `exceljs`).

### 5.5 Realtime

Não usa.

---

## 6. Regras de negócio (obrigatório)

- **RN-1**: O `loc_ref` da API é o número antes do primeiro ponto no nome da
  Empresa, com 2 dígitos ("01.CB GOIANIA" → `01`; "48. VASTO SUL" → `48`) — porte
  do `ExtrairNumeroLoja` do legado. Sem número, a loja não é consultável (o legado
  consultava "00" e voltava vazio).
- **RN-2**: O período é de 1 a 31 dias, sem datas futuras, data final ≥ inicial.
  As datas são interpretadas pela API no fuso America/Sao_Paulo.
- **RN-3**: Todos os pedidos do período entram, inclusive `CANCELLED` (igual ao
  legado). Sem status marcado no filtro, os totais somam todos os pedidos do período
  (cancelados inclusive); com status marcados, só os desses status. A linha Total do
  Excel soma o que estava na tabela (status + busca + filtros de coluna) ao exportar.
- **RN-4**: Datas exibidas e exportadas em horário de São Paulo (`data_de_criacao_horario_sp`,
  `data_de_acao_horario_sp`), sem conversão de fuso no navegador.
- **RN-5**: O módulo mostra dados pessoais do cliente (CPF, nome, email, telefone,
  endereço), como o legado — acesso restrito a quem tem `reports-maestro.ler` e às
  lojas do seu escopo.
- **RN-6**: O status do pedido é traduzido por um dicionário único
  (`src/status-pedido.ts`), usado pelo filtro de status (plural: "Cancelados") e
  pela coluna da tabela (singular: "Cancelado"), inclusive na busca e no filtro de
  coluna. Ordem da vida do pedido; a cor agrupa por fase:
  - antes de sair (info): `RECEIVED` → Recebido, `CONFIRMED` → Confirmado,
    `PACKED` → Embalado;
  - em trânsito (warning): `DISPATCHED` → Despachado, `ON_ROUTE` → Em rota,
    `GOING_TO_DESTINATION` → A caminho;
  - entregue (success): `DELIVERED` → Entregue, `COMPLETED` → Concluído;
  - não entregue/retorno (exception): `ORDER_NOT_DELIVERED` → Não entregue,
    `RETURN_TO_ORIGIN` → Retornando, `RETURNED` → Retornado;
  - `CANCELLED` → Cancelado (destructive).

  Status fora do dicionário aparece como veio da API, em cinza. O Excel mantém o valor original
  da API, como o legado.

Histórico: o módulo não altera dados, então não há trilha de mutação.

---

## 7. Critérios de aceite (obrigatório)

- [ ] Usuário executa C1, C2 e C3 do início ao fim
- [ ] Leitor sem `reports-maestro.exportar` não vê o botão Exportar
- [ ] Handler recusa (403) empresa fora do escopo
- [ ] Mesma loja e período trazem os mesmos pedidos que o Reports Maestro legado
- [ ] Linha Total do Excel bate com a soma das colunas em R$ das linhas exportadas
- [ ] Cards de totais batem com a linha Total do Excel exportado sem busca/filtro de coluna
- [ ] Quantidades de cada filtro de chips somam o "Todos" e não mudam ao marcar chip da própria barra
- [ ] Marcar origem recalcula as quantidades de status (e vice-versa); chip marcado com 0 continua desmarcável
- [ ] Coluna Origem mostra badge centralizado
- [ ] Botão Totais abre/fecha os cards de totais acima da tabela (abertos de início se a altura da tela for >= 700 px, fechados abaixo), em desktop e mobile
- [ ] Botão Filtros abre o dialog de status/origem; marcar chips não fecha; "Limpar filtros" desmarca tudo; tabela só muda em "Ver N pedidos" (que fecha); X/fora/Esc descartam o marcado; filtros mostram só status/origens com pedidos; fechado com filtro ativo, o botão mostra a quantidade marcada
- [ ] Clicar em status filtra tabela, totais e export; "Todos" limpa
- [ ] Mobile (375x667), tablet (768x1024), desktop (1280x720) funcionam; tabela vira cards
- [ ] Tema light/dark coerentes
- [ ] FAQ cobre todas as funcionalidades e regras
- [ ] `gia validate` passa sem erros

---

## 8. Fora de escopo

- **Fechamento Diário Maestro** (segunda tela do legado: conciliação de pagamentos
  com cadastro de classificações em `gia_relatorios.formas_pagamento`). A regra de
  conciliação vivia num frontend React que não veio com o legado; fica para uma
  próxima entrega.
- Campos novos da API que o legado não mostrava (`tipo_entrega`, `parceiro`,
  incentivos, `taxa_entrega`, `entregue_por`).
- Consulta multi-loja e períodos acima de 31 dias.

---

## 9. Métricas / Telemetria

| Métrica                     | Como medir                         | Onde olhar            |
| --------------------------- | ---------------------------------- | --------------------- |
| Consultas por dia           | invocações do handler `pedidos`    | Logs da Edge Function |
| Taxa de erro/timeout da API | respostas 5xx do handler `pedidos` | Logs da Edge Function |

---

## 10. Riscos e mitigações

| Risco                                   | Probabilidade | Impacto | Mitigação                                           |
| --------------------------------------- | ------------- | ------- | --------------------------------------------------- |
| Nome da Empresa sem o número da loja    | Médio         | Médio   | Loja some do seletor; FAQ explica; cadastro corrige |
| API lenta em períodos longos            | Médio         | Médio   | Limite de 31 dias + timeout de 90 s com mensagem    |
| Exposição de dados pessoais de clientes | Baixo         | Alto    | Permissão + escopo de loja checados no servidor     |

---

## 11. Dependências

### Outros módulos do GIA

- Cadastro de Empresas (nome com o número da loja).

### Serviços externos

- `api-dw.cocobambu.com` `/Delivery/` (Druid, via API do DW).

### Decisões pendentes

- [ ] Liberação deste módulo na integração `apidw` do hub de Credenciais — time GIA, na instalação.

---

## 12. Insumo pra FAQ (obrigatório)

1. Como consulto os pedidos de delivery de uma loja?
2. De onde vêm os dados?
3. O que significa cada coluna?
4. O que significa cada status do pedido?
5. Pedidos cancelados entram no total?
6. Qual a diferença entre "Valor pedido" e "Total pago"?
7. Por que o período é limitado a 31 dias e não aceita datas futuras?
8. Por que a consulta demora?
9. Como busco um pedido pelo número, CPF ou cliente?
10. Como escolho as colunas visíveis?
11. Como exporto para Excel e o que vai no arquivo?
12. Por que não vejo o botão Exportar?
13. Por que minha loja não aparece no seletor?
14. Mudei as datas e a tabela não mudou — por quê?
15. A tela mostrou erro. O que faço?

---

## 13. Insumo pra Tour (obrigatório)

| #   | Tela    | Target                                    | Mensagem               |
| --- | ------- | ----------------------------------------- | ---------------------- |
| 1   | Pedidos | `[data-tour="reports-maestro-filtros"]`   | Escolha loja e período |
| 2   | Pedidos | `[data-tour="reports-maestro-pesquisar"]` | Pesquisar              |
| 3   | Pedidos | `[data-tour="reports-maestro-toolbar"]`   | Busca, colunas e Excel |
| 4   | Pedidos | `[data-tour="reports-maestro-frame"]`     | Pedidos                |

---

## 14. Histórico

### 2026-10-29 — v1.0 inicial

- Criado por Iago Pereira a partir do Reports Maestro legado (UniGUI,
  `view.maestro.relatorio` + `model.maestro`), só a tela de relatório.
