# PRD — Fechamento Maestro

## Metadata (obrigatório)

| Campo                  | Valor                                     |
| ---------------------- | ----------------------------------------- |
| **module_id**          | `fechamento-maestro`                      |
| **Label visível**      | Fechamento Maestro                        |
| **Categoria**          | `operacional`                             |
| **Autor**              | Iago Pereira (iago.pereira@cocobambu.com) |
| **Versão do PRD**      | `1.0`                                     |
| **Status**             | `em-dev`                                  |
| **Última atualização** | 2026-10-30                                |
| **SDK version mínima** | `@gia-cb/sdk@0.1.0-alpha.66`              |

---

## 1. Problema / Contexto (obrigatório)

### 1.1 Qual o problema?

O financeiro e as lojas precisam fechar o caixa do delivery: saber, por dia, quanto
dos pedidos do Maestro (App Coco Bambu, iFood, 99Food e pedidos manuais) foi pago
**online** (no app ou no parceiro), quanto entrou pelas **adquirentes** (cartão na
maquininha na entrega) e quanto em **dinheiro**, e achar os pedidos cuja conta não
fecha (formas de pagamento que não somam o total pago, descontos que não somam o
desconto total).

### 1.2 Como é feito hoje?

Pela tela **Fechamento Diário Maestro** do GIA legado (UniGUI/Delphi,
`TfrmFechamentoMaestro` + `TDmFechamentoMaestro`): um frontend React embutido num
`UniHTMLFrame` busca os pedidos da API do DW (`/Delivery/`) e cruza as formas de
pagamento com um cadastro de classificações (`gia_relatorios.formas_pagamento`, no
banco do Maestro), editável na própria tela. O token da API é obtido com
usuário/senha fixos no servidor Delphi.

O código desse frontend React (onde ficava a conta do fechamento) **não veio** com
o legado; só o backend Delphi.

### 1.3 Por que vale a pena resolver?

A migração para o GIA tira a credencial do código (hub de Credenciais), aplica o
escopo de lojas no servidor, funciona no celular e exporta em Excel. E, por decisão
do negócio, o módulo usa **somente a API** — sem consultar banco —, então a
classificação das formas de pagamento passa a ser uma **regra fixa e documentada**
(RN-4) em vez de um cadastro que cada um podia alterar.

---

## 2. Personas e cenários (obrigatório)

### 2.1 Personas

| Persona                 | Permissões                                              | Frequência de uso | Conhecimento técnico |
| ----------------------- | ------------------------------------------------------- | ----------------- | -------------------- |
| Gerente de loja         | `fechamento-maestro.ler`                                | Diário            | Baixo                |
| Financeiro / tesouraria | `fechamento-maestro.ler`, `fechamento-maestro.exportar` | Diário            | Médio                |
| Analista de delivery    | `fechamento-maestro.ler`, `fechamento-maestro.exportar` | Semanal           | Médio                |

### 2.2 Cenários primários

- **C1**: Como financeiro, quero o fechamento de ontem da loja dividido em Online,
  Adquirentes e Offline para conciliar com o extrato das adquirentes e o caixa.
- **C2**: Como financeiro, quero ver só os pedidos com divergência e o motivo de
  cada uma para corrigir antes de fechar o mês.
- **C3**: Como gerente, quero ver os pedidos de um dia específico e o detalhe de
  pagamento de um pedido.
- **C4**: Como financeiro, quero exportar o fechamento do mês em Excel (por dia e
  por pedido).

### 2.3 Edge cases / Cenários secundários

- Usuário sem `fechamento-maestro.ler`: tela mostra acesso negado; handlers respondem 403.
- Loja fora do escopo do usuário (body adulterado): `ctx.requireEmpresa` → 403.
- Empresa sem número no começo do nome: não aparece no seletor; handler responde 422.
- Período > 31 dias, data final < inicial ou data futura: recusado com mensagem.
- API demora mais de 90 s: 504 com a sugestão de reduzir o período.
- API fora do ar ou integração não liberada: estado de erro com a mensagem e "Tentar de novo".
- Forma de pagamento nova (não reconhecida pela RN-4): vai para "Não classificado" e o pedido fica divergente.
- Forma de pagamento ou desconto sem valor entre parênteses: pedido divergente, com o item citado.
- Loja sem delivery no período: estado vazio "Nenhum pedido".

---

## 3. Requisitos funcionais (obrigatório)

### RF-1: Seleção de loja

- Lista as Empresas do escopo do usuário cujo nome começa com o número da loja
  (`"01.CB GOIANIA"`), em ordem natural. A primeira vem selecionada.
- Lojas inativas aparecem com a marca "Inativa".

### RF-2: Filtro de período

- Data inicial e final começam em ontem; sem datas futuras; final ≥ inicial; máx. 31 dias.
- "Pesquisar" fica desativado se loja e datas são as da pesquisa na tela.

### RF-3: Leitura e conciliação (API do DW)

- O handler `fechamento` chama `GET /Delivery/?loc_ref&start_date&end_date` com a
  credencial `apidw` e concilia cada pedido no servidor (RN-4 a RN-7).
- Nenhuma consulta a banco de dados.

### RF-4: Visão Por dia (fechamento)

- Uma linha por dia (data de criação): Pedidos, Cancelados, Total pago, Online,
  Adquirentes, Offline, Não classificado, Descontos, Valor pedido, Valor entrega e
  Divergências; linha **Total** no rodapé.
- Clicar num dia abre a visão Pedidos filtrada no dia.

### RF-5: Visão Pedidos (conciliação)

- Uma linha por pedido com origem, status, Check pagamentos, Check descontos, os
  valores por grupo, venda concluída, textos originais de pagamento/desconto.
- Filtro "Só divergências" (com a contagem do período) e filtro de dia removível.
- Linha divergente destacada; clicar abre o detalhe (RF-6).

### RF-6: Detalhe do pedido

- Cada forma de pagamento com valor e grupo, cada desconto, os dois checks, os
  totais e as divergências por extenso.

### RF-7: Cards de totais

- Total pago, Online, Adquirentes, Offline, Descontos e Pedidos com divergência do
  período inteiro (sem cancelados). Abre/fecha pelo botão "Totais".

### RF-8: Exportar Excel

- Permissão `fechamento-maestro.exportar`. Arquivo `.xlsx` com 3 abas:
  Fechamento diário, Pedidos (sem cancelados) e Cancelados; linhas Total com
  SUBTOTAL(109). Segue o que está na tabela da visão aberta.

---

## 4. Telas e fluxos (obrigatório)

### 4.1 Mapa de telas

| Rota                  | Tela               | Permissão                |
| --------------------- | ------------------ | ------------------------ |
| `/fechamento-maestro` | Fechamento Maestro | `fechamento-maestro.ler` |

### 4.2 Fluxos principais

1. **Fechar o dia**: loja + datas → Pesquisar → visão Por dia → linha Total.
2. **Investigar divergência**: Pedidos → Só divergências → clicar no pedido → detalhe.
3. **Ver um dia**: Por dia → clicar no dia → Pedidos filtrados → X para tirar o filtro.
4. **Exportar**: Exportar → `.xlsx` de 3 abas.

---

## 5. Requisitos técnicos

### 5.1 Schema de banco

Não se aplica — o módulo não grava nem lê banco. Só API.

### 5.2 Permissões (obrigatório)

| Key                           | Descrição                                   | Granularidade     |
| ----------------------------- | ------------------------------------------- | ----------------- |
| `fechamento-maestro.ler`      | Consultar o fechamento das lojas do escopo  | Leitura           |
| `fechamento-maestro.exportar` | Exportar o fechamento e os pedidos em Excel | Operação especial |

O módulo não tem escrita.

### 5.3 Integrações externas

| Integração                          | Propósito          | Camada                             | Credencial                             |
| ----------------------------------- | ------------------ | ---------------------------------- | -------------------------------------- |
| `api-dw.cocobambu.com` `/Delivery/` | Pedidos do Maestro | handler `fechamento`               | hub de Credenciais, integração `apidw` |
| Cadastro de Empresas do portal      | Lojas do escopo    | handler `lojas` (`ctx.empresas()`) | —                                      |

### 5.4 BFF / processamento em segundo plano

Nenhum. Uma loja × no máximo 31 dias (~25 s, ~3 MB no pior caso medido no Reports
Maestro) — síncrono, com o botão em carregamento. Excel gerado no navegador.

### 5.5 Realtime

Não usa.

---

## 6. Regras de negócio (obrigatório)

- **RN-1**: O `loc_ref` da API é o número antes do primeiro ponto no nome da Empresa,
  com 2 dígitos (`"01.CB GOIANIA"` → `01`) — porte do `ExtrairNumeroLoja` do legado.
- **RN-2**: Período de 1 a 31 dias, sem datas futuras, data final ≥ inicial.
- **RN-3**: Só dados da API do DW. Nenhuma consulta a banco (decisão do negócio,
  2026-10-30) — o cadastro `gia_relatorios.formas_pagamento` do legado não é usado.
- **RN-4**: Classificação das formas de pagamento — regra fixa, sobre o nome sem
  acento e em maiúsculas, a primeira que casar vence:
  1. **Offline**: contém `CASH` ou `DINHEIRO`.
  2. **Online**: contém `PRE PAGO` ou `ONLINE`.
  3. **Adquirente**: contém `CREDIT`, `DEBIT`, `CREDITO`, `DEBITO`, `VOUCHER`,
     `VALE`, `TICKET`, `ALELO`, `SODEXO`, `PLUXEE` ou `VR`.
  4. Senão, **Não classificado**.
- **RN-5**: Check pagamentos OK ⇔ todas as formas têm valor e classificação e a soma
  delas = `total_pago`, centavo a centavo.
- **RN-6**: Check descontos OK ⇔ todos os descontos têm valor e a soma = `desconto_total`.
- **RN-7**: Venda concluída ⇔ status `DELIVERED` ou `COMPLETED`.
- **RN-8**: Pedidos `CANCELLED` ficam fora de todos os valores e da contagem de
  divergências; contam em Pedidos/Cancelados e vão numa aba própria do Excel.
- **RN-9**: O dia do fechamento é a data de criação do pedido (horário de São Paulo).

> **A validar com o negócio**: RN-4, RN-7, RN-8 e RN-9 foram deduzidas de 3.107
> pedidos reais (loja 08, maio/2026) porque o frontend do legado, onde a conta
> ficava, não veio. Na amostra, 100% das formas foram classificadas e Online +
> Adquirentes + Offline = total pago.

---

## 7. Critérios de aceite (obrigatório)

- [ ] Seletor mostra só lojas do escopo com número no nome
- [ ] Período inválido é recusado com mensagem
- [ ] Visão Por dia soma por data de criação, sem cancelados, com linha Total
- [ ] Online + Adquirentes + Offline + Não classificado = Total pago em cada dia
- [ ] Clicar num dia abre os pedidos do dia; o X tira o filtro
- [ ] "Só divergências" mostra só pedidos não cancelados com check divergente
- [ ] Detalhe do pedido mostra grupo de cada forma e o motivo das divergências
- [ ] Excel com 3 abas e totais que batem com a tela
- [ ] Sem `fechamento-maestro.exportar` não há botão Exportar
- [ ] Mobile (375x667), tablet (768x1024), desktop (1280x720) funcionam; tabelas viram cards
- [ ] Tema light/dark coerentes
- [ ] FAQ cobre todas as funcionalidades e regras
- [ ] `gia validate` passa sem erros

---

## 8. Fora de escopo

- Cadastro/edição de classificações das formas de pagamento (era do legado; sai
  pela RN-3). Mudança de classificação = nova versão do módulo.
- Consulta multi-loja e períodos acima de 31 dias.
- Conciliação com extrato de adquirente ou com o Simphony.

---

## 9. Métricas / Telemetria

| Métrica                     | Como medir                            | Onde olhar            |
| --------------------------- | ------------------------------------- | --------------------- |
| Consultas por dia           | invocações do handler `fechamento`    | Logs da Edge Function |
| Taxa de erro/timeout da API | respostas 5xx do handler `fechamento` | Logs da Edge Function |

---

## 10. Riscos e mitigações

| Risco                                         | Mitigação                                                     |
| --------------------------------------------- | ------------------------------------------------------------- |
| Regra de classificação diferente da do legado | RN-4 documentada e marcada "a validar"; divergências visíveis |
| Forma de pagamento nova não reconhecida       | Cai em "Não classificado" e marca o pedido divergente         |
| API lenta em períodos longos                  | Limite de 31 dias e timeout de 90 s com mensagem clara        |
| Dados pessoais do cliente na resposta         | Só nome do cliente vai à tela; acesso por permissão + escopo  |

---

## 11. Dependências

### Outros módulos do GIA

- Cadastro de Empresas (nome com o número da loja).

### Serviços externos

- `api-dw.cocobambu.com` `/Delivery/`.

### Decisões pendentes

- [ ] Validar RN-4, RN-7, RN-8 e RN-9 com o financeiro.
- [ ] Liberação deste módulo na integração `apidw` do hub de Credenciais — time GIA, na instalação.

---

## 12. Insumo pra FAQ (obrigatório)

1. Como monto o fechamento de uma loja?
2. Qual a diferença entre as visões Por dia e Pedidos?
3. Como uma forma de pagamento vira Online, Adquirentes ou Offline?
4. O que significa um pedido "Divergente"?
5. O que faço com valor em "Não classificado"?
6. Por que os benefícios do iFood contam como Online?
7. Pedidos cancelados entram no fechamento?
8. Em que dia cai um pedido entregue depois da meia-noite?
9. O que é "Venda concluída"?
10. Como vejo os pedidos de um dia específico?
11. Por que os cards de totais não mudam com os filtros?
12. Como exporto e o que vai no Excel?
13. Posso cadastrar a classificação de uma forma de pagamento?
14. Por que não vejo o botão Exportar?
15. Por que minha loja não aparece no seletor?
16. Por que a consulta demora e o período é limitado a 31 dias?

---

## 13. Insumo pra Tour (obrigatório)

| #   | Tela       | Target                                           | Mensagem               |
| --- | ---------- | ------------------------------------------------ | ---------------------- |
| 1   | Fechamento | `[data-tour="fechamento-maestro-filtros"]`       | Loja e período         |
| 2   | Fechamento | `[data-tour="fechamento-maestro-pesquisar"]`     | Pesquisar              |
| 3   | Fechamento | `[data-tour="fechamento-maestro-visao"]`         | Por dia ou por pedido  |
| 4   | Fechamento | `[data-tour="fechamento-maestro-totais-toggle"]` | Totais do período      |
| 5   | Fechamento | `[data-tour="fechamento-maestro-toolbar"]`       | Busca, colunas e Excel |
| 6   | Fechamento | `[data-tour="fechamento-maestro-frame"]`         | Divergências           |

---

## 14. Histórico

### 2026-10-30 — v1.0 inicial

- Criado por Iago Pereira a partir do Fechamento Diário Maestro legado (UniGUI,
  `view.relatorios.maestro.fechamentoDiario` + `model.relatorios.maestro.fechamentoMaestro`).
- Só API (sem banco); classificação de pagamentos como regra fixa (RN-4).
