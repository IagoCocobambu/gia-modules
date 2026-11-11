# INTEGRATION.md — handoff de `Dashboard de Contas` (`dashboard-contas`)

> **Preenchido pelo parceiro, consumido pelo time GIA.** É o checklist do que
> falta pra "plugar" o módulo no portal real depois do `gia install`. Viaja
> dentro do `.tgz`.

## Novidades da versão 0.1.4

**Ajustes sobre a 0.1.3**, pedidos pelo Davi Nascimento. Nada de novo para
plugar: nenhuma migration, nenhum secret novo, nenhuma permissão nova, nenhuma
leitura nova. No Plano de contas completo o gap passa a ser sempre contra a melhor
loja, em p.p. e em R$, e todas as tabelas seguem o listrado da grade. Detalhes no
`CHANGELOG.md`.

### Da 0.1.2, para quem ainda não a instalou

**Uma aba nova, Análises adicionais**, sobre a 0.1.1. Nada de novo para plugar:
nenhuma migration, nenhum secret novo, nenhuma permissão nova.

A aba traz o que o painel ainda não tinha do BI mensal da controladoria: o
**resultado da loja** contra as outras lojas, contra o **orçado** e contra o ano
passado; o **plano de contas completo** da loja; o **caderno da reunião** em
Excel; o atingimento do orçado loja a loja e a curva ABC. Para o orçado, o painel
passa a ler **`plano_orcamento.resumo`** no data-warehouse, pelo mesmo secret. O
`SELECT` nesse schema já existe para ele — a GIA confirmou na devolutiva r2 do
Dashboard de RH (17/09/2026), que lê a mesma tabela. Ver a seção 2.2.

Fora a aba, detalhes nas abas de sempre e uma revisão de telas: a tela cheia
mostra a lista inteira onde há paginação, e nada quebra de 375 a 1920 px.

As RPCs `public.operacoes_da_rede(p_permissao)` e
`public.empresas_da_rede(p_permissao)`, exigidas desde a 0.1.1, continuam
necessárias. Ver a seção 2.2.

O que o módulo é, na primeira entrega: painel comparativo do Plano de Contas das
lojas, somente leitura, sobre as operações do escopo do usuário. É o irmão do
Dashboard de RH (`dashboard-rh`), no mesmo grupo de menu e com a mesma
arquitetura: nenhuma migration, dois handlers de leitura no data-warehouse e o
secret que o RH já usa.

- **Três abas:** Visão geral (quatro cartões, evolução em 12 meses, o cartão
  **Indicadores mês a mês** com os dez indicadores do plano, composição do faturamento e das despesas, ranking de
  lojas e regiões), Plano de contas (a árvore somada, ou mês a mês num período) e
  Comparativos (cada operação — ou região, estado, matriz — contra a média, a
  melhor e a pior loja da seleção).
- **Tela cheia em todo cartão de gráfico e em toda grade**, com Esc para sair.
- **Compara a REDE**, e não só o escopo de empresa do usuário — ver a permissão
  nova na seção 5 e a leitura de `gia.operacoes` na 2.2.
- **Consolidar matriz e filiais** no seletor de operações, valendo nas quatro abas.
- **Comparar com**: a variação compara com a janela anterior ou com o mesmo
  período do ano passado, à escolha do usuário.
- **Dois períodos** na aba Comparativos: cada operação no período do topo, no de
  comparação e a diferença.
- **Baixar em Excel** (`.xlsx`) em todo cartão de gráfico — com os dados e a
  imagem do desenho — e nas quatro grades. Nenhuma tela exporta CSV. Ambos
  exigem `dashboard-contas.exportar`.
- **Um mês ou um período de até 12 meses**, sempre contra o período anterior do
  mesmo tamanho, e a variação só nas lojas com plano nos dois períodos.
- **Nenhum controle consulta sozinho**: o botão **Consultar** busca o recorte
  inteiro de uma vez (a regra que o RH ganhou na 0.1.1).

Detalhes no `CHANGELOG.md`.

## 1. Identificação

- **Módulo**: `dashboard-contas` — Dashboard de Contas (no menu, Dashboards > Planos > Dashboard de Contas)
- **Versão do pacote**: 0.1.4
- **Autor / contato**: Joao Victor de Souza <joao.souza@cocobambu.com>
- **Versão do SDK usada**: `@gia-cb/*` 0.1.0-alpha.70

## 2. Banco de dados

### 2.1 Migrations incluídas (o parceiro entrega)

Nenhuma. O módulo é **somente leitura** e não tem schema próprio: não grava nada,
em banco nenhum.

### 2.2 Tabelas do HOST a conectar (o parceiro NÃO controla)

- [ ] **Data-warehouse**, só leitura, pelo secret `GIA_SERVER_DATABASE_URL`:
  - `plano_conta.indices` — o catálogo de contas (código, descrição, grupo).
  - `plano_conta.planos` — os planos por loja e mês; o handler lê só os vigentes
    (`deletado_em IS NULL` e `is_last`), um por loja-mês.
  - `plano_conta.resumo` — os valores de cada conta por plano.
  - `plano_orcamento.resumo` — o orçado de cada conta por loja e mês, só na aba
    **Análises adicionais** e só com ela aberta. Esse schema não tem tabela de
    planos: o handler lê a última versão pelo `is_last` da própria linha. Os
    índices são os mesmos de `plano_conta.indices`. Novo na 0.1.2.

  É o mesmo secret e o mesmo `SELECT` em `plano_conta` e `plano_orcamento` que o
  `dashboard-rh` já usa (confirmado pela GIA na devolutiva r2 do RH, 17/09/2026).
- [ ] **Operações do escopo do usuário**: `ctx.operacoes()` nos handlers. O `ref`
  de cada operação tem de ser o `loc_ref` com que o data-warehouse grava os planos
  (ex.: `01 cb`); a comparação ignora caixa e espaços nas pontas.
- [ ] **Todas as operações da rede**: a RPC `public.operacoes_da_rede(p_permissao)`,
  chamada pelo cliente da SDK com `dashboard-contas.ler-rede`. Ela é
  `security definer` e confere a chave contra quem chama; sem a chave, devolve
  vazio. O handler continua sendo a base da lista (e a única que responde no
  dev-shell); a rede é o acréscimo.

  ⚠️ **Não é a tabela `gia.operacoes`.** Até 23/09/2026 era, e não funcionava:
  a tabela tem RLS por escopo
  (`has_empresa_access(empresa_id) or check_permission('operacoes.editar')`), e um
  diretor de loja com a chave concedida lia UMA linha — sem erro, sem aviso. Quem
  valida tem escopo total ou `operacoes.editar` e atravessa a policy, então o
  defeito só aparece em produção, com o público do recurso. A RPC foi criada pelo
  time da GIA para resolver isso; se ela não existir no ambiente, o painel volta a
  mostrar só o escopo.
- [ ] **Estado, região da rede e matriz das operações**: `gia.empresas`, colunas
  `empresa_id`, `nome_fantasia`, `estado`, **`regiao_cb`**, `is_matriz` e
  `empresa_matriz_id` (filtro `tipo_registro = 'empresa'` e `deleted_at IS NULL`),
  lidas direto pelo cliente da SDK (`supabase.schema('gia').from('empresas')`) —
  o `useEmpresas` tem lista fixa de colunas e não traz `regiao_cb` nem as duas de
  matriz. É o que alimenta o seletor **Por região**, a coluna Região, o ranking de
  regiões, o **Colunas por: Região / Estado** e o vínculo de matriz e filiais
  da consolidação.

  ⚠️ **Esta tabela tem a mesma RLS por escopo** (`empresa_id in (select
  empresas_do_usuario())`), então ela sozinha devolveria a rede sem estado, sem
  região e sem vínculo de matriz para quem não tem escopo total. Por isso o
  cadastro da REDE vem da RPC `public.empresas_da_rede(p_permissao)`, irmã da de
  operações e com o mesmo gate, criada pelo time da GIA em 23/09/2026. A tabela
  continua sendo lida como base do escopo — ela responde a quem não tem a chave,
  e é a fonte no empate.

## 3. Menu / navegação

- **Grupo pretendido**: `dashboards`. O caminho no menu é
  **Dashboards > Planos > Dashboard de Contas** — o mesmo sub-grupo em que o
  `dashboard-rh` já está (Dashboards > Planos > Dashboard de RH).

⚠️ **O `navGroup` é de um nível só e não expressa o sub-grupo.** O manifesto
declara `dashboards`; quem aninha em **Planos** é o `nav_tree` do host. Ao
posicionar, pendure o item no mesmo sub-grupo do Dashboard de RH.

| Tela | path | label | ícone (lucide) | permissão | faqId |
|---|---|---|---|---|---|
| Principal | `/dashboard-contas` | Dashboard de Contas | `chart-column` | `dashboard-contas.ler` | `dashboard-contas` |

O label **não** repete "Plano de Contas" de propósito: esse é o nome do módulo de
LANÇAMENTO, em Planos > Plano de Contas, e com "Planos" também no caminho deste
os dois se confundiriam. Os arquivos exportados saem como
`GIA - Dashboard de Contas - ...`.

## 4. Edge functions & secrets

- [ ] Uma Edge Function, gerada pelo `gia pack` a partir de `src/server/`, com os
  handlers:
  - `operacoes` — as operações do escopo (`ctx.operacoes()`).
  - `contas` — a matriz de um mês: o catálogo e o valor de cada conta de cada loja
    com plano vigente. Chamado uma vez por mês do período e do período anterior.
  - `serie` — 20 contas em 12 meses, para os gráficos de evolução, os risquinhos
    dos cartões e a linha do tempo de cada indicador escolhido: as oito do
    resultado (faturamento, matéria-prima, impostos, custos operacionais,
    investimentos, os dois lucros líquidos e a variação de estoque) e as parcelas
    das razões (10200, 1.1.3, 1.1.4, 1.2, 1.2.2, 1.5, 1.6, 1.7, 1.8, 2.2.2,
    4.10.1 e 4.10.2). Num ano de 95 lojas são ~22 mil linhas.

  `contas` e `serie` aceitam `fonte: 'orcado'` (0.1.2): a mesma resposta, lida
  de `plano_orcamento.resumo` em vez de `plano_conta`. Os três exigem
  `dashboard-contas.ler`.
- [ ] Secret: `GIA_SERVER_DATABASE_URL` — connection string do data-warehouse com
  leitura em `plano_conta` e `plano_orcamento` (o mesmo do `dashboard-rh`).

## 5. Permissões declaradas

`groupPath`: `['Dashboards', 'Dashboard de Contas']` — a árvore de permissões
aceita dois níveis, então ela não repete o sub-grupo **Planos** do menu.

- `dashboard-contas.ler` — abre o painel e as quatro abas; os handlers recusam sem
  ela.
- `dashboard-contas.exportar` — o botão Exportar das quatro grades e o "Baixar
  os dados em Excel" dos sete cartões de gráfico. Tudo em `.xlsx`.
- `dashboard-contas.ler-rede` — **comparar todas as lojas da rede**, e não só as
  do escopo de empresa do usuário. ⚠️ **A intenção é conceder esta chave a todo
  papel que já tem a de visualizar:** um painel comparativo com o escopo recortado
  compara a loja com ela mesma. Ela é separada porque é assim que a SDK reconhece
  leitura ampla, e porque conceder é do administrador do portal. O nome é imposto
  pela SDK (`<moduleId>.ler-rede`). Sem ela, o painel funciona mostrando apenas o
  escopo.

⚠️ **Como a ampliação funciona** (o mesmo caminho do Dashboard de RH e do Plano
de Porcionamento): `ctx.operacoes()` não tem modo amplo para LISTAR, então o
cliente manda a lista de lojas no corpo (`lojas: [{ref, nome}]`) e o servidor só
a considera para quem tem a chave — o universo de cada handler é "escopo ∪ lista
do cliente". Sem a chave, a lista do corpo é ignorada por inteiro. Loja inventada
no corpo não vira acesso a nada: é só chave de busca, e volta sem linha.

## 6. Realtime (se usar)

Não usa.

## 7. Pendências / decisões abertas pro time GIA

- [ ] **Índice em `plano_conta.resumo (plano_id)`.** O handler `contas` resolve os
  planos vigentes do mês e busca o resumo por `plano_id` — o mesmo caminho do
  `plano-contas` e do `dashboard-rh`, que já registraram a falta desse índice.
  Medido no DW de produção em 18/09/2026: um mês tem 16.055 linhas (95 lojas ×
  169 contas) e a consulta leva ~0,7 s. Um período de 12 meses faz 24 consultas
  dessas (o período e o anterior), em paralelo e guardadas no cliente.
- [ ] **Dado heterogêneo no `resumo`, só para conhecimento.** As razões gravadas
  (10000, 10001, 10101, 20001–20003) estão arredondadas em duas casas em parte
  dos planos, e as linhas 11003/11004 aparecem com convenções de sinal diferentes
  entre planos. O painel não lê essas linhas: recalcula todas a partir das contas
  que as compõem. Se o `plano-contas` passar a gravá-las de outro jeito, nada
  muda aqui.
