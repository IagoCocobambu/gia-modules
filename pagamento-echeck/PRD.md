# PRD — Pagamento eCheck

## Metadata (obrigatório)

| Campo                  | Valor                                     |
| ---------------------- | ----------------------------------------- |
| **module_id**          | `pagamento-echeck`                        |
| **Label visível**      | Pagamento eCheck                          |
| **Categoria**          | `vendas`                                  |
| **Autor**              | Iago Pereira (iago.pereira@cocobambu.com) |
| **Versão do PRD**      | `1.0`                                     |
| **Status**             | `em-dev`                                  |
| **Última atualização** | 2026-11-06                                |
| **SDK version mínima** | `@gia-cb/sdk@0.1.0-alpha.70`              |

---

## 1. Problema / Contexto (obrigatório)

### 1.1 Qual o problema?

O financeiro e as lojas precisam conferir os **pagamentos eCheck** de uma loja: cada
transação, com
data e hora, modalidade, bandeira, status e valor — e ver de relance quanto entrou
no período, em quantas transações, o ticket médio, em que horas a loja mais vende e
por qual método de pagamento.

### 1.2 Como é feito hoje?

Pela tela **Relatório de Pagamentos - eCheck** do GIA legado (UniGUI/Delphi,
`TfrmRelECheckPayments` + `TDmRelEcheckPay`): um frontend React
(`echeck-report-ok`) embutido num `UniHTMLFrame` recebe do Delphi o usuário e as
lojas (Empresas do usuário com integração `TS2` em `gia.empresas_integracoes`) e
chama a API do DW (`/payments/`) **direto do navegador**, com o token da API escrito
no código Delphi e injetado na página (`window.__API_TOKEN`).

Código do legado em `legacy-gia/pagamento-echeck`. A pasta `FECHAMENTO_IFOOD` que
veio junto não faz parte desta tela e não foi portada.

### 1.3 Por que vale a pena resolver?

A migração tira o token do navegador e do código (hub de Credenciais, chamada
server-side), aplica o escopo de lojas no servidor, funciona no celular e segue o
padrão visual e de exportação dos outros módulos do portal.

---

## 2. Personas e cenários (obrigatório)

### 2.1 Personas

| Persona                 | Permissões                                          | Frequência de uso | Conhecimento técnico |
| ----------------------- | --------------------------------------------------- | ----------------- | -------------------- |
| Gerente de loja         | `pagamento-echeck.ler`                              | Diário            | Baixo                |
| Financeiro / tesouraria | `pagamento-echeck.ler`, `pagamento-echeck.exportar` | Diário            | Médio                |
| Auditoria               | `pagamento-echeck.ler`, `pagamento-echeck.exportar` | Mensal            | Médio                |

### 2.2 Cenários primários

1. **Conferir o dia anterior**: a tela abre em _ontem_, 08:00–23:59, com a primeira
   loja selecionada; o usuário clica em Pesquisar e confere o valor total e a lista.
2. **Achar uma transação**: filtra a coluna Cód. Aut., Conta ou Descrição (cartão
   mascarado) para localizar um pagamento contestado.
3. **Analisar o movimento**: abre os Gráficos para ver o pico de vendas por hora e
   a participação de cada modalidade.
4. **Levar para planilha**: exporta o período em Excel para conciliar com o extrato.

### 2.3 Edge cases / Cenários secundários

- Loja sem código na API (sem vínculo BIAPI nem TS2): não aparece no seletor.
- Loja inativa: continua no seletor, marcada "Inativa" (histórico legível).
- Período sem transações: estado vazio "Nenhuma transação".
- Período com mais de 30 mil transações: recusado com mensagem para reduzir.
- API lenta ou fora do ar: erro claro com "Tentar de novo" (504/502).

---

## 3. Requisitos funcionais (obrigatório)

### RF-1: Seleção de loja

Seletor com busca das lojas do escopo do usuário com CNPJ e com o código da loja na
API (RN-1). A primeira da lista vem selecionada, como no legado.

### RF-2: Período e faixa de horário

Data inicial e final (padrão: ontem) e hora inicial e final (padrão: 08:00 e 23:59),
com as regras da RN-2 e RN-3. Pesquisar só dispara quando algum filtro mudou.

### RF-3: Leitura das transações (API do DW)

Handler `pagamentos` lê `/payments/` página a página (RN-4) e devolve as transações
normalizadas (RN-5), das mais recentes para as mais antigas.

### RF-4: Barra de totais

Barra de indicadores no padrão do workspace (`../AGENTS.md` §3), da pesquisa
inteira (RN-6): Valor total, Transações (com quantas aprovadas) e Ticket médio —
os 3 do legado, só informativos — e 2 indicadores que **filtram a tabela** ao
clique (RN-9): Aprovadas e Não aprovadas. Dica com a conta só com mouse; no celular, a explicação
fica na FAQ. Botão **Totais** abre e fecha a barra (aberta em tela alta fora do
celular, fechada no celular).

### RF-5: Tabela de transações

17 colunas na ordem do legado; de cara só Data/Hora, Loja, Modalidade, Bandeira,
Status e Valor; as demais pelo menu de colunas. Ordenação por coluna, filtro por
coluna (desktop), busca geral (celular), 100 linhas
por página. Status verde quando PAGO, vermelho nos demais; modalidade com `_` → espaço.

### RF-6: Gráficos

Dialog com **Volume de vendas por hora** (barras) e **Métodos de pagamento** (rosca
por modalidade, com legenda numérica), da pesquisa inteira (RN-7).

### RF-7: Exportar Excel

Com `pagamento-echeck.exportar`: `.xlsx` com as 17 colunas, as linhas filtradas na
tabela, cabeçalho com loja e faixa consultada, linha Total (SUBTOTAL) e data/valor
tipados.

---

## 4. Telas e fluxos (obrigatório)

### 4.1 Mapa de telas

| Rota                | Tela                                                      |
| ------------------- | --------------------------------------------------------- |
| `/pagamento-echeck` | Filtros + resumo + tabela de transações + dialog Gráficos |

### 4.2 Fluxos principais

1. Abrir → loja/datas/horas → Pesquisar → resumo e tabela.
2. Tabela → filtros de coluna / colunas → Exportar.
3. Tabela → Gráficos → passar o mouse ou tocar numa barra/modalidade.

---

## 5. Requisitos técnicos

### 5.1 Schema de banco

Nenhum. O módulo não cria tabela nem migration e não grava nada.

### 5.2 Permissões (obrigatório)

| Key                         | Descrição                                          | Granularidade     |
| --------------------------- | -------------------------------------------------- | ----------------- |
| `pagamento-echeck.ler`      | Consultar os pagamentos eCheck das lojas do escopo | Leitura           |
| `pagamento-echeck.exportar` | Exportar as transações em Excel                    | Operação especial |

O módulo não tem escrita. O legado calculava um papel VIEW/EDIT/AUDIT pelos níveis
de bordero/RH/compras do usuário, mas a tela não usava esse papel para nada — não
foi portado.

### 5.3 Integrações externas

| Integração                          | Propósito         | Camada                             | Credencial                             |
| ----------------------------------- | ----------------- | ---------------------------------- | -------------------------------------- |
| `api-dw.cocobambu.com` `/payments/` | Transações eCheck | handler `pagamentos`               | hub de Credenciais, integração `apidw` |
| Cadastro de Empresas do portal      | Lojas do escopo   | handler `lojas` (`ctx.empresas()`) | —                                      |

### 5.4 BFF / processamento em segundo plano

Nenhum. Uma loja × no máximo 31 dias: ~7 mil transações, ~10 s e ~3 MB no pior caso
medido (loja 17, out/2026). Síncrono, com o botão em carregamento. Excel gerado no
navegador.

### 5.5 Realtime

Não usa.

---

## 6. Regras de negócio (obrigatório)

- **RN-1 (código da loja)**: o `loc_ref` da API é o código da loja na BI do
  Simphony — `locRefs.BIAPI` da Empresa (`'17. CB R'`, `'01 CB Go'`, `'13CBMa'`),
  enviado em minúsculas, como o legado fazia. Na falta, vale `locRefs.TS2` (a
  integração que o legado lia). Os códigos BIAPI foram conferidos na API em
  06/11/2026 (01, 13, 17, 27, 54 e 71 devolvem transações). Loja sem nenhum dos
  dois fica fora do seletor (o legado só listava lojas com a integração).
- **RN-2 (período)**: datas não futuras, final ≥ inicial, no máximo **31 dias**.
  O legado aceitava 6 meses, mas a API responde 500 nesse volume (medido em
  06/11/2026) e 3 meses levam ~60 s; 31 dias é o mesmo teto do Fechamento Maestro.
- **RN-3 (faixa de horário, regra do legado)**: a hora inicial vale para a data
  inicial e a final, para a data final — a consulta é
  `start_date = <de> HH:00:00` e `end_date = <ate> HH:00:00`, com a hora final 23
  indo até `23:59:59`. Não é um recorte de horário dentro de cada dia. Hora final >
  hora inicial.
- **RN-4 (paginação)**: a API aceita no máximo 500 por página. A primeira página
  traz `total_records`; as demais saem em paralelo (4 de cada vez). Sem o total,
  segue por `has_next`. Uma nova tentativa em erro 5xx (como no legado). Teto de 60
  páginas (30 mil transações) — acima disso, 422 pedindo período menor. Transação
  repetida entre páginas (mesmo `id`) entra uma vez.
- **RN-5 (normalização)**: os campos aceitam as grafias que a API já usou (`Valor`
  / `VALOR`, `Cod_Aut` / `Cod. Aut.` ...), como o `normalizeTransactionRecord` do
  legado. O valor vem como número; texto "R$ 1.234,56" também é lido.
- **RN-6 (resumo, igual ao legado)**: Valor total = soma de **todas** as transações
  (qualquer status); Transações = quantidade; aprovadas = status `PAGO`; Ticket
  médio = Valor total ÷ Transações. Somas em centavos.
- **RN-9 (filtros dos totais)**: Aprovadas = status `PAGO`; Não aprovadas = os
  demais. Indicadores por Tipo (`lio`, `todo_cartoes`, `cb_app`...) ficaram de fora
  por enquanto: o significado de cada valor não está confirmado e outras lojas podem
  usar outras maquinetas (decisão de 09/11/2026).
  O clique mostra na tabela só as transações do indicador; os valores da barra não
  mudam; o filtro vale para o Excel (o subtítulo diz qual). Pesquisar tira o filtro.
- **RN-7 (gráficos, igual ao legado)**: por hora, a soma do valor das transações
  pela hora de São Paulo (horas de dias diferentes se somam); por modalidade, a soma
  pela modalidade com `_` trocado por espaço (sem juntar grafias diferentes, como
  "CREDITO A VISTA" e "CREDITO AVISTA").
- **RN-8 (escopo)**: o body traz `empresaId`; o handler confere com
  `ctx.requireEmpresa` e tira o código da loja do cadastro no servidor.

---

## 7. Critérios de aceite (obrigatório)

- [ ] Seletor mostra só as lojas com CNPJ do escopo que têm código BIAPI ou TS2; Propriedade e loja sem código não aparecem
- [ ] Loja inativa aparece marcada "Inativa"
- [ ] Período e horas inválidos são recusados com mensagem (toast) e a barra de filtros continua aberta
- [ ] Mesma loja, período e faixa: valor total, transações e ticket médio iguais aos do legado
- [ ] Faixa 01/10 08:00 a 03/10 18:00 traz a madrugada de 02/10 e nada depois de 03/10 18:00:00 (RN-3)
- [ ] Hora final 23 inclui as transações até 23:59:59
- [ ] Período de 31 dias de uma loja movimentada carrega em segundos, com todas as transações (contagem = `total_records` da API)
- [ ] Tabela abre com as 6 colunas do legado; as outras 11 ligam pelo menu de colunas
- [ ] Cabeçalho da tabela no padrão dos outros módulos (sem linha de totais)
- [ ] Barra de totais no padrão do workspace; Aprovadas + Não aprovadas = Valor total
- [ ] Clicar num indicador de filtro mostra só as transações dele (rodapé = quantidade do indicador); clicar de novo ou no botão do filtro tira
- [ ] Indicador zerado e os 3 do legado não filtram
- [ ] Dica do indicador só com mouse; no celular não aparece tooltip e a FAQ explica cada indicador
- [ ] Gráficos: soma das barras = soma das modalidades = Valor total
- [ ] No celular, os filtros recolhem sozinhos quando a pesquisa começa (recusada: ficam abertos) e a seta do cabeçalho os reabre
- [ ] Em tela de toque não há tooltip; os botões da barra mostram o nome; tocar numa barra/modalidade mostra os números dela
- [ ] Sem `pagamento-echeck.exportar` não há botão Exportar
- [ ] Excel com as 17 colunas, as linhas filtradas, Data/Hora como data e Valor como moeda, e linha Total
- [ ] Token da API não aparece no navegador (DevTools → Rede só mostra a chamada ao handler)
- [ ] Mobile (375x667), tablet (768x1024), desktop (1280x720) funcionam; tabela vira cards
- [ ] Tema light/dark coerentes
- [ ] FAQ cobre todas as funcionalidades e regras
- [ ] `gia validate` passa sem erros

---

## 8. Fora de escopo

- Consulta multi-loja e períodos acima de 31 dias.
- Papel VIEW/EDIT/AUDIT do legado (calculado e não usado pela tela).
- Tours concluídos por usuário (`gia.tours` do legado) — o portal tem tour próprio.
- As telas de Fechamento iFood que vieram na mesma pasta do legado.

---

## 9. Métricas / Telemetria

| Métrica                     | Como medir                            | Onde olhar            |
| --------------------------- | ------------------------------------- | --------------------- |
| Consultas por dia           | invocações do handler `pagamentos`    | Logs da Edge Function |
| Taxa de erro/timeout da API | respostas 5xx do handler `pagamentos` | Logs da Edge Function |

---

## 10. Riscos e mitigações

| Risco                                    | Probabilidade | Impacto | Mitigação                                                      |
| ---------------------------------------- | ------------- | ------- | -------------------------------------------------------------- |
| Empresa sem vínculo BIAPI no portal      | Médio         | Médio   | Reserva no TS2; loja sem código some do seletor; FAQ explica   |
| API lenta ou instável em períodos longos | Médio         | Médio   | Teto de 31 dias, páginas em paralelo, retry em 5xx, erro claro |
| Usuário acostumado com 6 meses do legado | Médio         | Baixo   | FAQ explica o limite; pesquisar mês a mês                      |

---

## 11. Dependências

### Outros módulos do GIA

Nenhum.

### Serviços externos

- `api-dw.cocobambu.com/payments/` (integração `apidw` do hub de Credenciais).
- Cadastro de Empresas do portal (vínculo BIAPI/TS2).

### Decisões pendentes

- Confirmar com o time GIA que o vínculo BIAPI das Empresas tem o mesmo código que a
  integração TS2 do legado (RN-1).
- Confirmar o teto de 31 dias com o financeiro (RN-2).
- Confirmar o que significa cada valor do campo Tipo da API (`lio`, `todo_cartoes`,
  `cb_app`, `unknown`, `wallet`, `individual_check`) e se outras lojas usam outras
  maquinetas, antes de voltar com indicadores por Tipo (RN-9).

---

## 12. Insumo pra FAQ (obrigatório)

1. Como faço uma pesquisa?
2. Como funciona a faixa de horário (vale para o período inteiro)?
3. Por que o período é limitado a 31 dias, se o legado aceitava 6 meses?
4. O que cada indicador da barra de totais soma? O Valor total inclui o que não está PAGO?
5. O que é cada coluna (Cód. Aut., Cód. Cielo, Terminal, Conta, Mesa, Tipo, ADHOC)?
6. Por que aparecem modalidades parecidas separadas?
7. Como leio os gráficos? Por que não mudam com o filtro?
8. Como exporto e o que vai no Excel?
9. Por que minha loja não aparece no seletor?
10. Não veio nenhuma transação — está certo?
11. Por que não vejo o botão Exportar?
12. Como uso no celular?

---

## 13. Insumo pra Tour (obrigatório)

| #   | Tela      | Target                                     | Mensagem         |
| --- | --------- | ------------------------------------------ | ---------------- |
| 1   | Pagamento | `[data-tour="pagamento-echeck-filtros"]`   | Loja e período   |
| 2   | Pagamento | `[data-tour="pagamento-echeck-horario"]`   | Faixa de horário |
| 3   | Pagamento | `[data-tour="pagamento-echeck-pesquisar"]` | Pesquisar        |
| 4   | Pagamento | `[data-tour="pagamento-echeck-totais"]`    | Totais           |
| 5   | Pagamento | `[data-tour="pagamento-echeck-graficos"]`  | Gráficos         |
| 6   | Pagamento | `[data-tour="pagamento-echeck-toolbar"]`   | Colunas e Excel  |

---

## 14. Histórico

### 2026-11-06 — v1.0 inicial

- Criado por Iago Pereira a partir do Relatório de Pagamentos eCheck legado
  (UniGUI, `view.relatorios.echeck.payments` + `model.relatorios.echeck.payment`
  - frontend `echeck-report-ok`).
- API chamada no servidor (handler `pagamentos`) com a credencial `apidw` do hub,
  no lugar do token fixo injetado no navegador.
- Slider de horário virou dois seletores de hora (mesma regra, RN-3); gráficos
  saíram da página para o dialog Gráficos; Excel com as 17 colunas.
- Período máximo de 6 meses → 31 dias (RN-2).
- Cabeçalho da tabela no padrão dos outros módulos: sem a linha Total (o total
  das linhas filtradas fica no Excel).
- Totais no padrão de barra de indicadores do workspace (`../AGENTS.md` §3), com
  2 indicadores novos que filtram a tabela (RN-9) e botão Totais. Os indicadores
  por Tipo (origem) foram retirados até o significado dos valores ser confirmado.
