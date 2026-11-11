# PRD — Dashboard do Plano de Contas

Painel comparativo multi-loja do Plano de Contas.

> **No portal: Dashboards > Planos > Dashboard de Contas** (decisão do João,
> 21/09/2026; entre 18 e 21/09 o rótulo era só "Plano de Contas"). O
> `id` é `dashboard-contas`. O módulo de lançamento continua em Planos > Plano de
> Contas (`plano-contas`); o grupo do menu é o que diz qual dos dois é o painel.

---

## 1. Resumo executivo

O **Dashboard do Plano de Contas** responde a uma pergunta que o módulo
`plano-contas` não responde: *como está o resultado da rede, e como cada loja se
compara com as outras?*

O `plano-contas` é a tela de trabalho de uma loja: lança e calcula as 169 contas
do mês — faturamento, matéria-prima, impostos, custos operacionais,
investimentos, os lucros e os indicadores gerenciais. Feito isso, o dado fica no
data-warehouse, uma linha por conta/mês/loja, e não há tela no portal que junte
as lojas. Quem precisa da visão da rede monta planilha — o HTML "Painel de
Lojas", que é a especificação funcional deste módulo, é exatamente isso.

Este módulo consolida e compara. O usuário escolhe um mês ou um período de até 12
meses, marca as operações que entram na conta (uma a uma, por estado ou por
região), filtra pelo status do plano e lê o mesmo recorte em quatro abas:

- **Visão geral** — o desempenho da seleção contra o período anterior: cartões,
  evolução mês a mês, composição do faturamento e das despesas, e o desempenho
  de cada loja e de cada região.
- **Plano de contas** — o plano consolidado em árvore (nível 1, 2 e 3), com o
  percentual sobre o faturamento, a variação contra o período anterior, os
  indicadores gerenciais e os indicadores calculados.
- **Comparativos** — o plano de contas com uma coluna por operação, região ou
  estado, cada uma contra a média das lojas selecionadas, a melhor e a pior. A
  loja traz R$, % e a distância; "Mostrar" reduz a coluna a um número só (%, R$,
  a distância ou o ganho em reais), e a célula é pintada pela distância.

É um módulo **somente leitura**. Quem escreve no data-warehouse é o
`plano-contas`.

## 2. Problema / oportunidade

A consolidação do resultado da rede é feita fora do portal. O HTML "Painel de
Lojas" (elaborado a partir do arquivo mensal do Plano de Contas) e o desenho "BI —
Plano de Contas" do designer são a especificação deste módulo.

Três custos do arquivo:

1. **Retrabalho mensal.** Alguém extrai o dado do data-warehouse, monta o arquivo
   e distribui. Todo mês, de novo.
2. **Divergência.** O arquivo é uma cópia congelada. Se uma loja corrige o plano
   depois da extração, o consolidado fica errado e ninguém percebe.
3. **A regra mora num arquivo.** Como somar um período, o que é saldo, como se
   calcula cada razão — tudo isso vive em código de planilha ou de script, sem
   explicação para quem herdar.

Há um quarto, descoberto ao medir o data-warehouse em 18/09/2026: **o dado
gravado não é homogêneo** (ver §6.3). Somar o que está gravado, como faz um
arquivo, produz números errados sem nenhum aviso.

## 3. Solução proposta

- Seleção de **mês** ou de **período** de até 12 meses (o `SeletorDeCompetencia`
  da SDK), sempre comparado com o **período anterior** do mesmo tamanho.
- Seleção de **operações** no topo — **todas as da rede** para quem tem
  `dashboard-contas.ler-rede`, e só as do escopo para os demais —, com a opção de
  **consolidar matriz e filiais** (o grupo vira uma loja só em todas as abas): uma a uma,
  todas, ou por **estado** e por **região** (a regional da rede — NCO, NE, SPC,
  SPISE, SUL —, lida do cadastro de empresas).
- **Comparar com**: a variação compara com a janela anterior (padrão) ou com o
  mesmo período do ano passado.
- Filtro por **status do plano** (Todos, Pendente, Entregue, Auditado) e opção de
  **mesmas lojas** (só as operações com plano em todos os meses dos dois
  períodos).
- Botão **Consultar**: nenhum controle da barra busca dado sozinho.
- **Visão geral**: quatro cartões (faturamento, despesas totais, lucro líquido e
  rentabilidade); evolução de 12 meses; o cartão **Indicadores mês a mês**, com os
  dez indicadores gerenciais como ESCOLHA e a linha do escolhido no mesmo desenho;
  composição do faturamento e das despesas; ranking e tabela de desempenho por
  loja e por região. Todo cartão de gráfico **expande em tela cheia**, e os que
  paginam mostram a lista inteira com rolagem.
- **Plano de contas**: a árvore do plano consolidado, abrindo por nível ou conta a
  conta, com % do faturamento, período anterior e variação; os indicadores
  gerenciais com a composição de cada um; os indicadores calculados com a
  explicação da conta. Num período, também o **mês a mês**.
- **Comparativos**: o plano com colunas por operação, região, estado ou grupo de
  matriz e filiais, cada uma contra o que **Comparar com** escolher — **média das
  lojas selecionadas**, **melhor**, **pior** ou o **período** de comparação (o
  período do topo contra OUTRO, escolhido na própria aba, só nas lojas com plano
  nos dois). A loja traz **R$**, **%** e a distância, e **Mostrar** reduz a
  coluna a um desses — ou ao ganho em reais —, sempre com a escala de cor da
  distância; resumo de cada coluna. Os controles ficam na barra acima da grade,
  e a tela cheia leva essa barra junto.
- **Por índice**: a mesma conta virada de lado — uma linha por operação (ou
  região, estado, matriz) e uma coluna por **índice escolhido**, sem teto, de
  qualquer conta do plano ou indicador (incluídos os que as grades escondem,
  como a **10000 RENTABILIDADE**). Clicar no nome do índice ordena do maior
  para o menor, e o gráfico de barras ao lado acompanha o índice que ordena, com
  a régua da média. Responde "quem é o maior e o menor nesta conta", que a grade
  de 89 colunas não mostra.
- **Exportação**: tudo em `.xlsx` (decisão do João, 22/09/2026) — as quatro
  grades e os cartões de gráfico, estes com os números em colunas e a imagem do
  desenho. Nada sai em CSV: CSV chega ao Excel sem formato, e quem recebe refaz
  a formatação à mão.

Fora do escopo: ver §11.

## 4. Personas

| Persona | Acesso típico |
|---|---|
| Visitante | nada — o módulo não aparece na sidebar |
| Gerente de loja | `dashboard-contas.ler` no escopo das lojas dele |
| Controladoria / financeiro | `dashboard-contas.ler` + `dashboard-contas.exportar`, escopo amplo |
| Diretoria | igual à controladoria — é o consumidor típico da comparação |

O painel não tem persona de escrita: ninguém edita dado por aqui.

## 5. Telas / fluxos

### 5.1 Mapa de telas

- `/dashboard-contas` — tela única, com a barra do topo (operações, período,
  filtros e Consultar) e quatro abas sobre o mesmo recorte: **Visão geral**,
  **Plano de contas**, **Comparativos** e **Por índice**.

A tela é única de propósito, como no Dashboard de RH: as abas são leituras do
mesmo consolidado, e separá-las em rotas obrigaria a refazer a seleção — e
permitiria duas abas discordarem do mesmo número.

### 5.2 Fluxos críticos

**Ver o resultado da rede no mês:** o painel abre no último mês fechado, sem
operação marcada — só a lista de operações carrega. O usuário marca as operações
(ou "Selecionar todas") e clica em **Consultar**. A Visão geral mostra os cartões
com a variação contra o mês anterior, a evolução de 12 meses e a composição.

**Ver uma região ou uma loja:** no seletor de operações, modo "Por região" ou
"Por estado", marca o grupo inteiro — ou só uma operação — e consulta. Todas as
abas passam a mostrar aquele recorte.

**Ler o plano de contas consolidado:** na aba Plano de contas, abre até o nível
desejado (1, 2 ou 3) ou conta a conta; lê o valor, o % do faturamento, o período
anterior e a variação. Passa o ponteiro sobre um indicador gerencial para ver de
quais contas ele é feito.

**Comparar lojas com a média:** na aba Comparativos, cada operação marcada vira
uma coluna com o valor, o % e a diferença para a média das lojas selecionadas —
ou para a melhor, ou para a pior. A cor da diferença diz se a conta está a favor
ou contra, com a intensidade pela distância em pontos percentuais. No modo
**Oportunidades em R$**, a diferença vira o ganho em reais de levar a conta à
referência.

**Comparar regiões ou grupos:** na aba Comparativos, "Colunas por: Região"
(ou Estado) soma as operações marcadas de cada grupo numa
coluna. A referência continua sendo a média das lojas.

**Achar lojas parecidas:** no resumo das colunas da aba Comparativos, cada loja
mostra as de faturamento até 10% acima ou abaixo; um clique acrescenta a loja à
comparação.

**Consultar um período:** o botão de calendário do topo abre "de … até …", com
teto de 12 meses. O período soma o que é fluxo, usa o último mês do que é saldo e
recalcula as razões; o período anterior tem o mesmo número de meses.

## 6. Regras de negócio — a consolidação

**Consolidar não é somar tudo.** O Plano de Contas tem três tipos de conta, e
cada um consolida de um jeito — entre lojas e entre meses:

| Tipo | Contas | Entre lojas | Entre meses |
|---|---|---|---|
| **Fluxo** | todas as contas do plano (1 a 7) e os indicadores em reais (10010–10014, 10100–10700, 11000–11004, 9999) | soma | soma |
| **Saldo** | 10102 (estoque no fim do mês) e 10012 (pagamentos antecipados em cofre) | soma das lojas | o **último mês** com plano de cada loja |
| **Razão** | 10000, 10001, 10101, 20001, 20002, 20003 | recalculada **sobre as somas** | recalculada sobre as somas |

Fórmulas das razões (as mesmas do `plano-contas`):

| Conta | Fórmula |
|---|---|
| 10000 Rentabilidade | 7 LUCRO LÍQUIDO (sem investimentos) ÷ 1 FATURAMENTO |
| 10001 Rentabilidade (variação de estoque) | (7 + 10103) ÷ 1 |
| 10101 Matéria-prima sobre venda restaurante | 2 ÷ (1 − 1.1.4 − 1.2.2 − 1.5 − 1.6 − 1.7 − 1.8) |
| 20001 Despesas com motoboy / receita com delivery | 4.10.1 ÷ 1.2 |
| 20002 Receita com vinhos / despesa com vinho | 1.1.3 ÷ 2.2.2 |
| 20003 Receita com couvert / despesa com músicos | 1.1.4 ÷ 4.10.2 |

Razão sem base (divisor zero) é "sem dado" — nunca zero, que sairia como a melhor
loja numa comparação.

**Média de percentual não é o percentual da rede.** O % da seleção é a soma da
conta sobre a soma do faturamento. A média simples dos percentuais das lojas
existe, mas só como **referência da aba Comparativos** (§6.2), com esse nome.

### 6.1 Indicadores calculados

Cinco indicadores do HTML de especificação, recalculados em qualquer recorte:

- **Labor / faturamento salão**: 10200 LABOR ÷ (1 FATURAMENTO − 1.2 DELIVERY − 1.6
  ESTACIONAMENTO/VALLET). Menor é melhor.
- **(Motoboy − receita com entrega) / venda delivery**: (4.10.1 − 1.2.2) ÷ 1.2.
  Menor é melhor.
- **Receita com entrega / venda delivery**: 1.2.2 ÷ 1.2. Maior é melhor.
- **Estoque / faturamento mensal**: estoque no fim do período (10102 do último mês
  de cada loja) ÷ faturamento médio mensal (a média de cada loja nos meses em que
  ela tem plano, somada). Menor é melhor.
- **DIO — dias de estoque**: estoque no fim do período ÷ (matéria-prima média
  mensal ÷ 30). Menor é melhor.

### 6.2 Comparativos

- **Colunas**: as operações na conta (marcadas no seletor do topo e com status que
  passa no filtro). Com "Colunas por: Região / Estado", as
  operações de cada grupo são somadas numa coluna — o % do grupo é a soma sobre a
  soma, como em qualquer consolidado. Matriz e filiais usam o vínculo declarado
  no cadastro (`is_matriz`, `empresa_matriz_id`).
- **Referência** (decisão do João, 18/09/2026): a **média das lojas selecionadas**
  — a média simples do % de cada loja na conta, com cada loja pesando igual. Com
  "Comparar com" é possível trocar para a **melhor** ou a **pior** loja da
  seleção. A referência é sempre calculada sobre LOJAS, mesmo com as colunas
  agrupadas.
- **Direção do bom**: receitas (1) e lucros (6, 7) — maior é melhor; matéria-prima,
  impostos, custos e investimentos (2 a 5) — menor é melhor. Nos indicadores
  gerenciais, a direção é a do HTML de especificação; 9999, 10012, 10013, 10102 e
  10103 são informativos, sem cor.
- **Escala de cor** da diferença, em pontos percentuais: abaixo de 0,2 p.p. é
  ruído (cinza); 0,2–0,4, 0,4–0,8, 0,8–1,6 e acima de 1,6 p.p. em intensidade
  crescente. Verde = a favor, vermelho = contra. No DIO a escala é em dias: 2, 4,
  8 e 16.
- **Ganho em R$**: o impacto no resultado se a conta da coluna fosse igual
  à referência — (% da coluna − % da referência) × faturamento da coluna, com o
  sinal pela direção do bom. Nas razões, a base é o denominador da razão. Só o
  lado desfavorável é colorido; a vantagem aparece em texto discreto, com sinal −.
  Menos de R$ 500 fica em branco (é a própria referência).
- **Uma coluna por loja** (decisão do João, 22/09/2026): "Mostrar" reduz as
  TRÊS colunas da loja (R$, % e a distância) a uma só, com o número escolhido. A
  grade abre em "Tudo", com as três; a dica de cada célula traz os quatro
  números, de forma que reduzir não esconde nada.
- **Janela de colunas**: com a rede inteira são 89 colunas, e a grade desenha só
  as que estão na vista mais uma folga de cada lado; o que ficou de fora vira uma
  coluna vazia da largura exata, em cada ponta, para a rolagem não mudar de
  tamanho. A exportação não passa pela janela — o arquivo sai com todas as
  lojas. Medido em 22/09/2026, no nível 3 com a rede inteira: 27.200 células no
  DOM e 888 ms de tarefa mais longa antes; 1.700 células e 278 ms depois.
- **Semelhantes — RETIRADO em 24/09/2026.** O HTML de especificação punha em
  cada cartão do resumo as seis lojas fora da comparação com faturamento entre
  90% e 110% do da coluna, cada uma um botão que a acrescentava num clique. Foi
  entregue na 0.1.0 e tirada a pedido do João: ninguém sabia que existia, e ela
  pesava a faixa de cartões — até seis botões por coluna, numa faixa que já rola
  de lado. Quem acrescenta uma loja usa o seletor de operações. **Não repor sem
  pedido novo**, mesmo estando no HTML.
- **O período comparado é da ABA** (decisão do João, 22/09/2026, apontando o
  Dashboard de RH): em "Comparar com: Período", um seletor de mês escolhe o
  PRIMEIRO mês do período comparado, e o último vem do tamanho do período do
  topo. O "Comparar com" dos Filtros continua mandando na variação do painel
  inteiro — cartões, mês a mês e a coluna Var. do Plano —, que esta escolha não
  toca. Os meses escolhidos são buscados pela aba, no mesmo cache por mês do
  período do topo.

### 6.3 O dado gravado não é homogêneo (medido em 18/09/2026)

- **11003 e 11004 estão gravados com dois sinais.** O `plano-contas` corrigiu o
  11003 para `11000 + 10103` em 05/08/2026; os planos calculados antes guardam
  `11000 − 10103`. De jan/25 a jun/26, cerca de 75% dos planos estão na convenção
  antiga, e de jul/26 em diante todos na nova — no MESMO mês convivem as duas.
  O painel **recalcula** 11003 = 11000 + 10103 e 11004 = 11003 − 10014, a regra
  vigente, em vez de somar o gravado.
- **As razões gravadas estão arredondadas a 2 casas em parte dos planos**
  (0,19 no lugar de 0,1912). O painel recalcula toda razão a partir das contas.
- Consequência: para planos antigos, o 11003 e o 11004 do painel podem diferir do
  que a tela do `plano-contas` mostra até o plano ser recalculado lá.

### 6.4 Período anterior e mesmas lojas

- O **período anterior** tem o mesmo número de meses e termina no mês antes do
  início do período escolhido (jun/26 → mai/26; jan–jun/26 → jul–dez/25).
- **Toda variação compara as mesmas lojas**: cartões, composição e tabela de lojas
  contam só as operações com plano nos dois períodos (a regra do Dashboard de RH,
  decidida pelo João em 15/09/2026). As que ficam de fora são nomeadas na tela,
  com o motivo.
- O filtro **Mesmas lojas** vai além: restringe o painel INTEIRO às operações com
  plano em todos os meses dos dois períodos — tira do número o efeito de
  aberturas, fechamentos e entregas atrasadas.
- **Status num período**: a operação passa no filtro se ALGUM mês do período tem o
  status escolhido.

## 7. Dados

Fonte: o **data-warehouse**, schema `plano_conta` — o mesmo que o `plano-contas`
lê e escreve. O módulo **não tem schema próprio** e não cria migrations.

Tabelas lidas:

- `plano_conta.planos` — o plano vigente de cada loja no mês (`deletado_em IS
  NULL` e `COALESCE(is_last, TRUE)`); o status sai de `entregue`/`auditado`.
  **A PK `id` é bigint** e chega como string.
- `plano_conta.resumo` — o valor por conta/mês/loja, casado por `plano_id`.
- `plano_conta.indices` — o catálogo das 169 contas, com o código formatado que
  dá a hierarquia.

E do portal: `gia.empresas` (estado, `regiao_cb`, matriz), lido pelo cliente da
SDK, e `ctx.operacoes()` para o escopo.

Três handlers em `src/server/`, com o `sql` de `@gia-cb/sdk/server` contra
`GIA_SERVER_DATABASE_URL`:

- `operacoes` — a lista do escopo, sem consulta ao data-warehouse.
- `contas` — a matriz do mês: 169 contas × lojas do escopo com plano. Uma chamada
  por mês, cada uma no seu cache.
- `serie` — oito contas por loja nos 12 meses que terminam no fim do período, para
  a evolução.

**Volume (medido em 18/09/2026, DW de produção):** um mês tem 16.055 linhas (95
lojas × 169 contas) e a consulta leva ~0,7 s. É consulta síncrona comum: a regra
de job em segundo plano da SDK não se aplica. Um período de 12 meses são 12
chamadas desse tamanho, mais as 12 do período anterior, cada uma no cache do mês.

A consolidação roda no cliente: trocar operação, filtro, aba, agrupamento ou
referência não vai à rede.

## 8. Integrações

Nenhuma integração com terceiros. O único sistema externo ao portal é o
data-warehouse, e o segredo é a connection string `GIA_SERVER_DATABASE_URL`.
O painel não chama outro módulo do portal e não tem acoplamento de código com o
`plano-contas`.

## 9. Riscos / dependências

- **Depende do `plano-contas` ter dado.** Mês sem plano mostra "sem plano", o que
  é informação, não erro.
- **Escopo de loja.** O usuário só consolida lojas do escopo dele; a validação é
  do servidor (`ctx.operacoes()`), e o corpo da requisição não carrega loja.
- **Dado heterogêneo** (§6.3). Se o `plano-contas` mudar outra fórmula, o painel
  precisa acompanhar — as fórmulas recalculadas aqui estão listadas em §6.
- **Região é cadastro.** Três empresas estão sem `regiao_cb` (57, 98 e 999) e caem
  em "Sem região".
- **Mês em entrega.** O mês corrente pode ter lojas pendentes; o selo âmbar do topo
  diz quais, e a variação compara só as mesmas lojas.

## 10. Métricas de sucesso

- O arquivo mensal "Painel de Lojas" deixa de ser produzido.
- A diretoria lê o consolidado no dia em que a última loja entrega.
- Divergência entre o painel e o data-warehouse deixa de existir por construção.

## 11. Out-of-scope

- **Escrita.** O painel não corrige plano de loja; a correção é no `plano-contas`.
- ~~**Orçado × realizado.** O Plano de Orçamentos não entra nesta versão.~~
  Entrou na 0.1.2, na aba **Análises adicionais** (o que faltava do BI mensal,
  decisão do João em 28/09/2026), lendo `plano_orcamento.resumo`.
- **Grupos livres de lojas** (arrastar uma loja sobre outra para formar grupo, como
  no HTML). Os grupos são os do cadastro: região, estado e matriz e filiais.
- **Série além de 12 meses.**
- **Qualidade do dado** (validação 9999, contas fora do plausível) numa aba
  própria — candidata à próxima versão.

## 12. Insumos pra FAQ

- Por que o % da rede não é a média dos percentuais das lojas.
- O que é fluxo, saldo e razão, e como cada um soma num período.
- Por que o 11003 do painel pode ser diferente do que aparece no Plano de Contas.
- O que é o período anterior, e por que a variação ignora algumas lojas.
- O que o filtro Mesmas lojas faz.
- O que muda ao filtrar por Pendente, Entregue ou Auditado.
- Como ler a cor da diferença na aba Comparativos.
- O que é a média das lojas selecionadas, a melhor e a pior.
- O que são as Oportunidades em R$ e como a conta é feita.
- O que a região quer dizer (NCO, NE, SPC, SPISE, SUL) e de onde vem.
- Como os indicadores calculados (Labor / faturamento salão, DIO…) são feitos.
- Por que o botão de exportar pode não aparecer.
- O que significa o painel vazio, e o que fazer.

## 13. Insumos pra tour

- A barra do topo: operações, período, filtros e Consultar.
- Os selos de contagem e de pendências.
- As abas e o que cada uma responde.
- Na Visão geral: cartões, evolução, composição e desempenho das lojas.
- No Plano de contas: os níveis e os indicadores.
- No Comparativos: colunas por, comparar com e o que "Mostrar" escolhe.

## 14. Roadmap futuro

- Aba de qualidade do dado (validação 9999, contas implausíveis).
- ~~Orçado × realizado com o Plano de Orçamentos.~~ Feito na 0.1.2 (aba
  Análises adicionais).
- Grupos livres de lojas na aba Comparativos.
- Ocultar grupos de contas (ex.: Investimentos) nas grades, como no desenho.
