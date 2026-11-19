# Dashboard Simphony — conceito

> Módulo `dashboard-simphony` · SDK `0.1.0-alpha.71` · template `rich-api`
> Situação: **rascunho** (19/11/2026)
> Marque com **(suposição)** tudo que não veio do usuário.
> Origem: tela **Dashboard** do SIMDASH no GIA antigo
> (`legacy-gia/dashboard-e-couvert`, `view.simphony.simdash.dashboard.pas` e
> `model.simphony.simdash.pas`). O **Couvert**, que divide o mesmo código no GIA
> antigo, fica para outro módulo.

## 1. Para que serve

Mostrar, para uma loja, **como foi o dia de vendas** no Simphony: os totais do dia
(venda líquida, pessoas, contas, descontos, estornos e cancelamentos), os itens
mais vendidos e o desempenho de cada funcionário (venda e taxa de serviço). É uma
consulta rápida, só de leitura, direto da BI do Simphony.

## 2. Quem usa

| Perfil | Para quê | Onde (computador / celular) |
| --- | --- | --- |
| Gerente da loja **(suposição)** | acompanhar o dia, ver quem vendeu mais e o que mais saiu | computador e celular |
| Gestão / operações **(suposição)** | conferir o dia de uma loja específica | computador |

## 3. Fluxo de uso

1. Abre o módulo em **Simphony › Dashboard Simphony** (lugar provisório — pergunta 1
   do gestor).
2. Escolhe a **loja** (só aparecem as lojas ativas do seu escopo com vínculo à BI do
   Simphony).
3. Deixa o **dia de negócio** vazio (“Último dia”) ou escolhe um dia (provisório —
   pergunta 4 do gestor) e clica em **Pesquisar**.
4. Vê os **totais do dia** numa barra no alto e, embaixo, a tabela com o **Mix de
   vendas** e a dos **Funcionários** (troca pelas abas embaixo da tabela).
5. Pode ordenar e filtrar as colunas, buscar, **Atualizar** (busca de novo o mesmo
   dia) e **Exportar** para Excel.

No celular: os filtros recolhem ao pesquisar (padrão 1), os totais começam fechados
e abrem pelo botão **Totais** (padrão 3), e a tabela vira lista de cards.

## 4. Dados

| Dado | Fonte | Chave e período | Lê ou grava |
| --- | --- | --- | --- |
| Lojas | Portal — `ctx.empresas()`, vínculo `locRefs.BIAPI` | Empresa ativa do escopo | lê |
| Último dia de negócio | BI do Simphony — `getLatestBusDt` | loja | lê |
| Totais do dia | BI do Simphony — `getOperationsDailyTotals` | loja + dia | lê |
| Vendas por item | BI do Simphony — `getMenuItemDailyTotals` | loja + dia | lê |
| Nome dos itens | BI do Simphony — `getMenuItemDimensions` (provisório — pergunta 3 do gestor; no GIA antigo vinha de uma tabela do banco dele) | loja | lê |
| Vendas por funcionário | BI do Simphony — `getEmployeeDailyTotals` | loja + dia | lê |
| Nome dos funcionários | BI do Simphony — `getEmployeeDimensions` | loja | lê |

- **Não grava nada** — sem trava de teste nem ambiente de teste.
- Credencial da BI pelo **hub de Credenciais** do portal (`ctx.credencial`), integração
  `simphony-bi` provisória (pergunta 2 do gestor). No GIA antigo o token era lido de
  uma tabela do banco do Simphony.
- A loja chega ao servidor só como `empresaId`; o `locRef` da BI o servidor busca no
  cadastro (nunca vem do navegador).

## 5. Regras de negócio

Todas vêm do código do GIA antigo (o comportamento que as lojas já conhecem).

| # | Regra | Exemplo | Origem |
| --- | --- | --- | --- |
| R1 | Sem dia escolhido, vale o **último dia de negócio** que a BI informa para a loja. | BI diz 18/11/2026 → tudo é do dia 18/11 | GIA antigo (`GetLastBusDt`) |
| R2 | Os totais do dia são a **soma de todos os centros de receita** da loja: venda líquida (`netSlsTtl`), pessoas (`gstCnt`), contas (`chkCnt`), descontos (`itmDscTtl`), estornos (`vdTtl`) e cancelamentos/correções (`errCorTtl`). | Salão R$ 48.210,35 + Bar R$ 9.120,10 → venda líquida R$ 57.330,45 | GIA antigo (`CarregaSales`) |
| R3 | Valores mostrados **como a BI devolve**, sem trocar sinal **(suposição: o GIA antigo também não trocava)**. | descontos −R$ 2.040,40 | GIA antigo |
| R4 | **Mix de vendas**: soma quantidade e total de cada item em todos os centros de receita; ordem do maior total para o menor. Item sem nome no cadastro aparece como “Item 1234” **(suposição: no GIA antigo ficava em branco)**. | Caipirinha 12× no Salão + 5× no Bar → 17× | GIA antigo (`SimphonyGetSalesMix`) |
| R5 | **Funcionários**: soma contas, venda líquida e taxa de serviço de cada funcionário em todos os centros de receita; nome “número - nome sobrenome”; ordem pela venda líquida. | “101 - Ana Souza”, 14 contas, R$ 3.920,00, serviço R$ 313,60 | GIA antigo (`CarregaEmployees`) |
| R6 | **Ranking da taxa de serviço**: os mesmos funcionários, do maior serviço para o menor. | — | GIA antigo (quadro “Top Service Charge”) |
| R7 | Lojas do seletor: Empresas **ativas**, do escopo do usuário, com vínculo com a BI do Simphony. | — | GIA antigo (`QryLojas`, tipo `BIAPI`) |

## 6. Permissões

| Chave | O que libera |
| --- | --- |
| `dashboard-simphony.ler` | abrir a tela e consultar as lojas do seu escopo |
| `dashboard-simphony.exportar` | exportar a tabela em Excel **(suposição: o GIA antigo não exportava)** |

## 7. Fora do escopo

- **Couvert** (a outra tela do SIMDASH): outro módulo.
- Várias lojas ao mesmo tempo, período de vários dias e comparação entre dias.
- Gráficos (o GIA antigo não tinha).
- Detalhe de uma conta ou de um item (só os totais do dia).

## 8. Componentes

Inventário feito contra `@gia-cb/ui` e `@gia-cb/sdk` `0.1.0-alpha.71`, os padrões do
`AGENTS.md` da raiz e os outros módulos do workspace.

| Peça | Onde existe | Decisão | Artefato |
| --- | --- | --- | --- |
| Barra de filtros (título, loja, dia, Pesquisar) | SDK — `ListHeader` + `Field`; workspace — padrões 1 e 8 (`fechamento-maestro/FiltrosBar`) | usar do SDK, como no padrão | — |
| Seletor de loja | SDK — `SearchableSelect` (o `SeletorDeLojas` do SDK é para replicar uma decisão em várias lojas — não serve) | usar do SDK | — |
| Dia de negócio | SDK — `DatePicker` (`placeholder` “Último dia”, `max` hoje) | usar do SDK; seletor provisório (pergunta 4 do gestor) | — |
| Totais do dia (6 indicadores) | SDK — `StatCard` (“card de estatística pro Dashboard”); workspace — padrão 3 (`BarraIndicadores`, referência `fechamento-ifood-mensal`) | **a decidir** — o padrão 3 e o SDK apontam para lados diferentes | `artefatos/totais-propostas.html` + Q-01 |
| Mix de vendas, Funcionários e Taxa de serviço (os 3 quadros do GIA antigo) | SDK — `DataReport` (tabela, busca, ordenar, Exportar, Atualizar, cards no celular) e `GridTabsBar` (abas embaixo — padrão 7) | **a decidir** — como distribuir os 3 quadros | `artefatos/quadros-propostas.html` |
| Abre/fecha dos totais | workspace — `Recolhivel` (padrões 3 e 10) | cópia da referência | — |
| Totais recolhem com menos de 5 linhas na tabela | workspace — padrão 10 (`useCabemTotais`, `fechamento-maestro`) | cópia do hook, adaptado às abas | — |
| Dica (tooltip só com mouse) | SDK — `Tooltip`; workspace — padrão 2 (`Dica`) | cópia da referência | — |
| Mensagem de erro | workspace — padrão 11 (`MensagemErro`); o `OperationFailureDialog` do SDK é diálogo de gravação | cópia da referência | — |
| Estado vazio | SDK — `EmptyState` | usar do SDK | — |
| Exportar (.xlsx) | SDK — `onExport` do `DataReport` + `nomeArquivoExport`; workspace — exceljs como nos fechamentos | usar do SDK + exceljs | — |
| Rever o tour | SDK — `TourReplayButton` | usar do SDK | — |
| Carregamento | SDK — `loading` do `DataReport`, `Skeleton` | usar do SDK (consulta rápida — o padrão 9 não se aplica) | — |

## 9. Questionamentos ao SDK

| Nº | Tema | Situação | Solução provisória |
| --- | --- | --- | --- |
| Q-01 | `StatCard` do SDK × barra de indicadores do workspace (padrão 3) | aberto | a proposta escolhida em `totais-propostas.html` |

## 10. Perguntas em aberto

Para o gestor (detalhe em `perguntas-gestor.md`):

- [ ] 1. Nome e lugar no menu (provisório: “Dashboard Simphony”, grupo Simphony).
- [ ] 2. Integração da BI do Simphony no hub de Credenciais (provisório: `simphony-bi`, org `GCB`).
- [ ] 3. Fonte do nome dos itens (provisório: cadastro da própria BI).
- [ ] 4. Escolher o dia ou sempre o último dia (provisório: seletor que abre no último dia).

Para você:

- [ ] 5. Ao abrir, a tela já pesquisa a 1ª loja da lista, como o GIA antigo, ou espera
  o **Pesquisar** (padrão das outras telas do portal)? **(suposição: espera o
  Pesquisar)**
- [ ] 6. Exportar em Excel com permissão própria (`exportar`)? **(suposição: sim)**
- [ ] 7. Totais: proposta de `totais-propostas.html`.
- [ ] 8. Quadros: proposta de `quadros-propostas.html`.
