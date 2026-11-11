import type { ModuleFaq } from '@gia-cb/sdk/modules'

// FAQ do Dashboard de Contas — no menu, Dashboards > Planos > Dashboard de Contas.
//
// ── ESTE TEXTO É FONTE DE RESPOSTA, NÃO SÓ DE LEITURA ───────────────────────
//
// A IA do portal de produção responde perguntas sobre os módulos a partir da
// FAQ. O que não estiver escrito aqui ela não sabe — e inventa ou se cala. Por
// isso cada controle, coluna, gráfico, cor, número e mensagem da tela tem a sua
// explicação, com o nome EXATO que aparece na tela (é por ele que o usuário
// pergunta). Mudou algo na tela, muda aqui na mesma entrega.
//
// Voz de sistema: nada em primeira pessoa ("o painel mostra", nunca "mostro").

export const faq: ModuleFaq = {
  summary:
    'O **Dashboard de Contas** (no menu, **Dashboards > Planos > Dashboard de Contas**) é o painel comparativo do Plano de Contas das lojas: o resultado que cada operação registra todo mês — faturamento por área, matéria-prima, impostos, custos operacionais, investimentos, lucro e os indicadores gerenciais. Num mês ou num período de até 12 meses, ele mostra o resultado consolidado das operações escolhidas contra o período anterior (**Visão geral**), o plano de contas inteiro em árvore, somado ou mês a mês (**Plano de contas**), cada operação — ou região, estado, matriz — contra a média, a melhor e a pior loja da seleção (**Comparativos**), o ranking das lojas em qualquer conta escolhida (**Por índice**) e, do BI mensal da controladoria, o realizado ao lado do ano passado e do orçado, loja por loja (**Análises adicionais**). O painel abre **sem nenhuma operação selecionada**: escolha as operações no seletor do topo e clique em **Consultar**. É somente leitura — nada é gravado no Plano de Contas. Permissões: `dashboard-contas.ler` (ver) e `dashboard-contas.exportar` (baixar planilhas).',
  sections: [
    {
      id: 'o-que-e',
      title: 'O que é o painel e o que cada termo significa',
      content: `
O painel **Plano de Contas** responde "qual foi o resultado das lojas, do que ele
é feito e como cada loja se compara às outras", a partir do **Plano de Contas**
que cada operação registra todo mês. O painel só LÊ esse dado: não cria, não
corrige e não entrega plano.

## Termos usados na tela

- **Operação** — a unidade que tem um Plano de Contas por mês, com um nome como
  **01.CB GOIANIA** ou **08.VST TERESINA**. "Loja" e "operação" são sinônimos
  no painel.
- **Conta** — cada linha do plano, com o código e a descrição: **1 FATURAMENTO**,
  **1.2 DELIVERY**, **4.1 FOLHA**... O código diz o nível: **1** é nível 1,
  **1.2** é nível 2, **1.2.2** é nível 3.
- **Indicador gerencial** — as linhas de código 10000 em diante
  (**10000 RENTABILIDADE**, **10200 LABOR**, **20001**...). Algumas somam contas
  do plano de outro jeito (os 10100 a 10700 reagrupam as despesas por natureza),
  outras são razões.
- **Operações na conta** — as operações cujos números estão somados na tela:
  marcadas no seletor de operações E aprovadas pelos **Filtros**.
- **Status do plano** de uma operação no mês: **Pendente** (o plano do mês existe
  e ainda não foi entregue), **Entregue** (a loja entregou) e **Auditado** (o
  plano entregue já foi auditado). **Sem plano** é a operação que não tem plano
  daquele mês.
- **Consolidado** — as operações na conta tratadas como se fossem uma loja só
  (ver "Como os números são consolidados").
- **Período anterior** — o mesmo número de meses, terminando no mês antes do
  início: de **jun/26** é **mai/26**; de **jan–jun/26** é **jul–dez/25**.
- **Nas mesmas lojas** — toda variação do painel compara só as lojas com plano
  nos dois períodos, para que loja nova ou loja sem plano não pareça crescimento
  ou queda.
- **% Fat.** — a parte da conta no faturamento das mesmas lojas: matéria-prima
  de 25,76% quer dizer que ela consumiu 25,76% do faturamento.
- **p.p. (pontos percentuais)** — a diferença entre dois percentuais: de 25,76%
  para 27,65% são 1,89 p.p.
- **Referência** — na aba Comparativos, o número contra o qual cada coluna é
  comparada: a média das lojas selecionadas, a melhor ou a pior.
      `,
    },
    {
      id: 'primeiros-passos',
      title: 'Primeiros passos: da tela vazia aos números',
      content: `
1. No menu, abra **Dashboards > Planos > Dashboard de Contas**. A tela abre com a
   mensagem
   **"Nenhuma operação selecionada"** — é o esperado: o painel não busca número
   nenhum antes de você dizer o que quer ver.
2. Clique no botão azul **Selecionar operações**, no topo. Marque as operações
   (ou **Selecionar todas**) e feche o painel.
3. Confira o **mês** no topo. O painel abre no mês anterior ao atual, o último
   mês fechado. O **botão de calendário** ao lado troca para um período de até 12
   meses.
4. Clique em **Consultar**. Só esse clique busca os números.
5. Enquanto os números chegam, a tela mostra um **esqueleto** (blocos cinzas no
   formato da página). Em seguida aparece a **Visão geral**.
6. Use as abas **Visão geral**, **Plano de contas**, **Comparativos** e
   **Por índice** para ver o mesmo recorte de quatro jeitos.

A seleção continua valendo quando você troca de mês ou de aba. Ela volta ao
vazio quando a página é recarregada.

Para aprender a tela: o botão com ícone de capelo ao lado do nome **Dashboard de
Contas** reabre o tour guiado, e o botão de capelo ao lado das abas (**Conhecer
as abas**) percorre as cinco abas.
      `,
    },
    {
      id: 'barra-do-topo',
      title: 'A barra do topo, controle por controle',
      content: `
Tudo o que aparece nas abas obedece à barra do topo. Nenhuma aba tem seleção
própria de operação ou de mês.

## Dashboard de Contas e o botão do tour
O nome do painel abre a barra. O botão de capelo ao lado dele reabre o **tour
guiado**.

## O selo de contagem (ex.: 86/104)
O primeiro número conta as operações na conta; o segundo, todas as operações do
seu acesso. Sem operação marcada ele mostra **0/104**, em amarelo. O primeiro
número cai quando você desmarca operações ou filtra o status.

## O número em âmbar ao lado (ex.: 21)
Aparece quando alguma operação na conta **ainda não entregou** o plano do
período — está **Pendente** ou **Sem plano**. Clique nele para ver a lista, em
**Sem entregar em ...**, com o que falta de cada uma. Todas continuam na conta
com o que têm hoje: os números podem mudar quando entregarem.

## Seletor de operações
- O botão mostra **Selecionar operações** (em azul) quando nenhuma está marcada,
  **Todas as operações** quando todas estão, o nome da operação quando só uma
  está, ou **N operações**. Quando a seleção é exatamente uma região ou um estado
  inteiro, ele mostra o nome, como **NE · 14 operações**.
- Ao abrir: a busca (por nome, código, estado ou região), os modos **Por
  operação / Por estado / Por região**, a caixa **Selecionar todas** e a lista.
- **Por operação** — uma linha por operação, com a **região da rede** (NCO, NE,
  SPC, SPISE, SUL) ao lado.
- **Por estado** e **Por região** — uma linha por estado ou região, com a
  contagem de marcadas. A caixa do grupo marca ou desmarca o grupo inteiro; um
  traço na caixa indica que só parte está marcada. A seta abre o grupo.
  Operação sem estado ou região no cadastro fica em **Sem estado** / **Sem
  região**.
- **As unidades de teste da tecnologia ficam fora do lote.** O cadastro da rede
  tem as unidades de homologação, de código **999** — elas entregam Plano de
  Contas como as outras, mas com número de teste, que entraria na média da rede,
  no ranking e na régua de comparação. **Selecionar todas** e a caixa de um
  estado ou de uma região nunca as marcam, e a tela não avisa nada. Para incluir
  uma, marque a caixa dela na lista; para tirar, qualquer desmarcação serve, inclusive a do grupo.
- O rodapé diz quantas estão marcadas ("12 de 104" ou "Todas marcadas"); sem
  nenhuma, diz "Marque ao menos uma operação" e o **Consultar** fica desabilitado.
  **Todas marcadas** conta as operações de verdade: com as duas unidades de
  teste na lista, o contador do topo mostra 102 de 104 e o rótulo do botão
  continua sendo **Todas as operações**.
- A lista é a de **todas as operações da rede** para quem tem a permissão
  \`dashboard-contas.ler-rede\`; sem ela, só as do seu acesso no portal.

### Consolidar matriz e filiais
O interruptor no alto do seletor faz matriz e filiais contarem como **uma loja
só**, em todas as abas — não só numa lista. Vem desligado.

- **De onde sai o vínculo:** do cadastro de empresas do portal, o mesmo que a tela
  de Empresas mostra. Não é deduzido do nome nem do CNPJ.
- **Ligado**, a linha da lista é o GRUPO: a caixa é dele, o selo diz quantas
  operações ele soma e a seta abre os nomes, em ordem de número de loja. O grupo
  é **indivisível** — para olhar uma operação sozinha, desligue.
- **O que muda no número:** os planos das operações do grupo são somados ANTES de
  qualquer conta, e as razões (rentabilidade, CMV, labor…) são recalculadas sobre
  a soma. O total da rede não muda; o que muda é o tamanho de cada "loja" — e,
  com isso, a média por loja, o ranking e as comparações.
- O botão do seletor ganha **· consolidado** no fim, para a tela dizer em que modo
  está.

## Mês ou período
- As setas **‹ ›** andam um mês; **« »** andam um ano. O mês no meio abre o
  calendário.
- O **botão de calendário** à esquerda troca para **período**: aparecem duas
  pontas, o primeiro e o último mês, com **ATÉ** entre elas. Clicar de novo volta
  para uma competência só.
- O período vai até **12 meses**. Se você escolher mais, o painel ajusta a outra
  ponta e avisa, ao lado do nome: **"O período vai até 12 meses; o intervalo foi
  ajustado."**

## Filtros
O botão **Filtros** abre dois recortes. Com um filtro ligado, o botão mostra qual
(ex.: **Auditado**, **Mesmas lojas**); com os dois, **Filtros · 2**.
- **Status do plano** — **Todos os status**, **Pendente**, **Entregue** ou
  **Auditado**. Só as operações com esse status entram na conta. Num período, a
  operação entra se tiver o status em **algum** mês dele.
- **Comparar com** — contra o que a variação compara: **Período anterior** (a
  janela logo antes, do mesmo tamanho: ago/26 contra jul/26, jan–jun/26 contra
  jul–dez/25) ou **Ano passado** (o mesmo intervalo doze meses atrás: ago/26
  contra ago/25). Num recorte de 12 meses as duas caem no mesmo intervalo, e o
  painel avisa. A escolha vale para as quatro primeiras abas, e o rótulo da
  variação muda junto ("vs. mesmo mês do ano passado"). A aba **Análises
  adicionais** não depende dela: mostra o ano passado e o orçado juntos, sempre.
- **Mesmas lojas** — só as operações com plano em **todos** os meses do período
  E do período anterior. Tira do número o efeito de lojas que abriram, fecharam
  ou ainda não entregaram: o crescimento que sobra é o das lojas que já
  existiam.

## Consultar
Busca os números do recorte escolhido. Operações, mês, período e filtros só
montam o recorte; a tela continua mostrando a última consulta até este clique.
O botão acende quando há mudança por aplicar.

## A seta de recolher
Em tela estreita, a seta **⌄** no fim da primeira linha recolhe os controles e
deixa mais espaço para a aba (**Ocultar filtros** / **Mostrar filtros**).
      `,
    },
    {
      id: 'consolidacao',
      title: 'Como os números são consolidados',
      content: `
O painel soma as operações na conta como se fossem uma loja só, seguindo a
natureza de cada conta:

- **Contas de fluxo** (faturamento, matéria-prima, impostos, custos, lucro,
  investimentos e os indicadores 10100 a 10700): **somam** — entre lojas e entre
  os meses do período.
- **Contas de saldo** (**10102 Estoque total (em R$) no final do mês** e
  **10012 Pagamentos antecipados em cofre**): no período, vale o **último mês com
  plano** de cada loja; entre lojas, somam (o estoque da seleção é a soma dos
  estoques).
- **Razões** (**10000 RENTABILIDADE**, **10001 Rentabilidade (variação de
  estoque)**, **10101 Materia Prima sobre Venda Restaurante**, **20001**,
  **20002**, **20003**): **nunca somam**. São recalculadas sobre as somas — a
  rentabilidade da seleção é o lucro somado dividido pelo faturamento somado, e
  não a soma das rentabilidades.
- **11003 Lucro Liquido Corrigido Estoque** e **11004 Lucro Liquido Corrigido
  Estoque e Perse** também são recalculadas: 11003 = 11000 + 10103 (lucro mais a
  variação de estoque) e 11004 = 11003 − 10014 (menos a Tese PERSE).

Razão sem base (divisor zero, como motoboy sobre delivery numa loja sem
delivery) aparece como **—**, "sem dado". Ela nunca vira zero: zero sairia como
a melhor loja numa comparação.

## Por que recalcular em vez de usar o que está gravado
O que cada plano grava nas razões está **arredondado em duas casas** em parte dos
planos, e as linhas 11003 e 11004 aparecem gravadas com **sinais diferentes**
entre planos. Recalculado a partir das contas que as compõem, o número é o mesmo
em toda loja e em todo recorte.

## A variação
Toda variação da tela (**vs. mês anterior** num mês, **vs. período anterior** num
período) compara **só as lojas com plano nos dois períodos**. A que tem plano em
só um deles continua no número do período, mas fica fora da variação — o selo
**N lojas de fora**, ao lado do título **Desempenho geral**, diz quais e por quê
(**Sem plano em ...** ou **Sem plano no período escolhido**).

⚠️ **Uma exceção, e ela vem rotulada.** Na tabela que os gráficos de evolução
mostram em tela cheia (e na planilha baixada), a coluna **vs. mês anterior
(lojas de cada mês)** compara os dois pontos DO DESENHO — e cada mês traz as
lojas que tinham plano nele. Em ago/26 ela dá **+7,6%** de faturamento, enquanto
o cartão do topo dá **+9,7%**: são 89 lojas contra 91. A nota embaixo da tabela
repete o aviso. Para "quanto a rede cresceu", use o cartão; para "quanto mudou
de uma barra para a outra", use a coluna.
      `,
    },
    {
      id: 'cartoes-de-grafico',
      title: 'Cartões de gráfico: tela cheia e planilha em Excel',
      content: `
Todo gráfico do painel mora num **cartão** com o mesmo desenho: título,
subtítulo dizendo o que ele mostra e dois botões no canto do título. Eles
aparecem ao passar o ponteiro sobre o cartão; em tela de toque ficam sempre à
vista.

Quando o título não cabe na largura do cartão, ele sai cortado
("Rentabilidade m…") e passar o ponteiro sobre ele mostra o nome inteiro.

## Expandir em tela cheia
O cartão passa a ocupar a tela inteira, sem o menu do portal, e **Esc** sai.
Três coisas mudam em tela cheia:

- os gráficos que **paginam** — o ranking de lojas, o de regiões, o **Onde
  está o dinheiro** e o **Atingimento do orçado** — mostram **a lista inteira
  de uma vez**, com rolagem no lugar dos botões de página, e o nome de cada
  loja (ou conta) sai inteiro;
- abaixo do desenho aparece a **tabela com os valores**, mês a mês (ou loja a
  loja): os mesmos números da dica, escritos, sem precisar passar o ponteiro
  ponto a ponto;
- os cartões que **já são tabela** — Faturamento por área e Despesas por
  natureza — não repetem a tabela.

A tabela **Desempenho das lojas**, no fim da Visão geral, tem o mesmo botão no
canto dela: em tela cheia ela mostra **todas as lojas** (ou regiões) de uma vez,
sem páginas, na ordem escolhida no cabeçalho. As grades das abas **Plano de
contas**, **Comparativos** e **Por índice** também expandem; nas duas últimas, a
tela cheia leva junto a barra de controles.

## Baixar os dados em Excel
Gera um \`.xlsx\` com duas abas:

- **Dados** — os números do gráfico em colunas, **número como número**, com o
  formato de R$, % ou p.p. já aplicado: dá para somar e ordenar no Excel;
- **Gráfico** — a imagem do desenho como estava na tela.

O arquivo sai com o nome do painel, do cartão e do período (ex.: **GIA -
Dashboard de Contas - Ranking de lojas · Faturamento - 2026-08.xlsx**). O botão
exige a permissão \`dashboard-contas.exportar\`, e cartão sem dado avisa **"Não
há dados neste gráfico para baixar."**
      `,
    },
    {
      id: 'visao-geral',
      title: 'Aba Visão geral: os cartões e cada gráfico, com o que mostra e como é calculado',
      content: `
A aba se lê de cima para baixo, em quatro blocos: **Desempenho geral**,
**Evolução do resultado**, **Composição do faturamento e das despesas** e
**Desempenho das lojas**. Ela rola como página; os rankings paginam em vez de
rolar por dentro.

O subtítulo do primeiro bloco diz quantas lojas têm plano no período e contra o
quê a variação compara ("89 lojas com plano em ago/26 · variação vs. mês
anterior, nas mesmas lojas"), com o selo **N lojas de fora** ao lado.

## Os quatro cartões grandes
- **Faturamento total** — a conta **1**: tudo o que as lojas na conta faturaram.
- **Despesas totais** — as contas **2 + 3 + 4** (matéria-prima, impostos e
  custos operacionais): tudo o que sai do faturamento até o lucro sem
  investimentos.
- **Lucro líquido** — a conta **6** (índice 7000), o lucro **sem** investimentos.
- **Rentabilidade** — o índice **10000**: a conta 6 ÷ o faturamento.

Cada cartão traz quatro coisas:

- **o número do recorte** — num mês, o mês; num **período**, o total do período
  inteiro (e não uma média mensal);
- **a variação**, com seta, contra o período de comparação e **só nas lojas com
  plano nos dois** — verde a favor e vermelho contra, então despesa caindo é
  verde. Nos percentuais ela vem em **p.p.**;
- **um risquinho** com os 12 meses que terminam no fim do período, com o último
  ponto marcado;
- a **origem** ao lado do nome (**CONTA 1**, **CONTAS 2 + 3 + 4**, **CONTA 6
  (7000)**, **CONTA 10000**). Em tela estreita ela sai para o nome caber
  inteiro. Passe o ponteiro sobre o cartão para ver de quais contas ele sai.

Quando não há variação, o cartão diz por quê: **nenhuma loja com plano nos dois
períodos** ou **sem base no período anterior**.

## Os gráficos, um a um
Passe o ponteiro sobre qualquer marca para ver a dica com o valor. Os dois
botões do canto de cada cartão estão na seção "Cartões de gráfico".

### Resultado mês a mês
- **Onde fica:** primeiro cartão de **Evolução do resultado**, à esquerda.
- **O que mostra:** o faturamento, as despesas totais e o lucro líquido sem
  investimentos da rede em cada um dos **12 meses** que terminam no mês (ou no
  último mês do período) escolhido no topo.
- **Como ler:** três colunas por mês — **Faturamento** em azul, **Despesas
  totais** em laranja e **Lucro líquido** em verde-azulado. A **faixa cinza**
  marca os meses do período escolhido. Coluna abaixo da linha do zero é
  prejuízo. A escala é a mesma nos 12 meses, então a altura compara.
- **Como o valor é calculado:** em cada mês, a **soma** das lojas selecionadas
  que têm plano **naquele mês** — faturamento = conta 1; despesas = 2 + 3 + 4;
  lucro = conta 6. São valores em reais somados; nada aqui é média.
- **Cuidado ao ler:** o conjunto de lojas **muda de mês para mês**, e a dica diz
  quantas foram. Degrau isolado costuma ser loja que entrou ou deixou de
  entregar, e não mudança de resultado. Mês de **imposto trimestral** (janeiro,
  abril, julho e outubro) derruba o lucro da rede inteira.
- **Num período:** continuam os mesmos 12 meses; o que muda é a faixa cinza.
- **Dica:** o mês, os três valores e quantas lojas com plano.
- **Em tela cheia:** a tabela dos 12 meses, com a coluna **vs. mês anterior
  (lojas de cada mês)** — leia o aviso da seção "A variação" antes de comparar
  esse número com o do cartão.

### Rentabilidade mês a mês
- **Onde fica:** à direita do Resultado mês a mês.
- **O que mostra:** a rentabilidade da rede nos mesmos 12 meses, em duas linhas.
- **Como ler:** a linha cheia é a **Rentabilidade** (índice 10000: lucro sem
  investimentos ÷ faturamento) e a **tracejada** é **Com variação de estoque**
  (índice 10001: a mesma conta somando o quanto o estoque variou no mês). O eixo
  é percentual e a faixa cinza marca o período.
- **Como o valor é calculado:** em cada mês, o lucro somado ÷ o faturamento
  somado das lojas com plano naquele mês — **nunca** a média das rentabilidades
  das lojas.
- **Cuidado ao ler:** quando as duas linhas se afastam, o mês foi ajudado (ou
  prejudicado) por compra que ficou parada no estoque. Mês de imposto trimestral
  derruba as duas juntas.
- **Num período:** o mesmo desenho, com a faixa cinza nos meses escolhidos.
- **Dica:** o mês, as duas linhas e quantas lojas com plano.

### Indicadores mês a mês
- **Onde fica:** abaixo dos dois gráficos, ocupando a largura do bloco.
- **O que mostra:** os **dez indicadores do plano** — cada um com o valor do
  período e a variação — e a linha de 12 meses do que estiver escolhido.
- **Como ler:** **clique num indicador** e a linha de baixo passa a ser a dele;
  o escolhido fica marcado. O painel abre no **CMV**. No celular os dez ficam
  em duas colunas, e no tablet em cinco, com o gráfico logo abaixo.
- **Como o valor é calculado:** cada um é uma razão **sobre as somas** do
  recorte — a lista com as fórmulas está na seção "Os indicadores do plano, um a
  um". A variação vem em **p.p.**, exceto em Vinhos e Couvert, que são múltiplos
  e variam em %.
- **Num período:** o número é o do **período inteiro** e a variação é contra o
  período de comparação, nas mesmas lojas; a linha continua sendo de 12 meses.
- **Dica:** o mês, o valor do indicador e quantas lojas entraram.
- **A linha tracejada, em cinza:** os mesmos 12 meses **um ano antes** — a coluna
  2025 dos cartões do BI mensal, desenhada mês a mês. A legenda no canto do
  cartão diz qual linha é qual, e a dica traz os dois valores do mês. Ela só
  aparece quando as lojas na conta têm plano no ano anterior.

### Faturamento por área
- **Onde fica:** bloco **Composição do faturamento e das despesas**, à esquerda.
- **O que mostra:** as contas do grupo **1 FATURAMENTO** (Restaurante, Delivery,
  Gorjeta, Eventos, Parquinho, Estacionamento / vallet, Outras receitas, Compra
  coletiva), do maior para o menor.
- **Como ler:** **#** (a posição), **Conta**, **Valor (R$)**, **Participação**
  (a parte no total, com barra de proporção em tela larga) e **Var.** (a
  variação do valor, nas mesmas lojas). Na receita, subir é verde. Conta que
  sai de quase zero pode variar mais de 999%: a célula mostra **> +999%**, e
  passar o ponteiro sobre ela mostra o valor exato.
- **Como o valor é calculado:** a soma de cada conta filha de 1, e a
  participação sobre o faturamento total. As áreas **somam exatamente o
  faturamento** — a linha **Total** no fim confere.
- **Cuidado ao ler:** **Vinhos** e **Couvert** não aparecem aqui: são contas de
  terceiro nível (1.1.3 e 1.1.4), já dentro de Restaurante. Somá-las seria
  contar duas vezes.
- **Num período:** os valores são a soma do período e a variação é contra o
  período de comparação.
- **No celular:** o valor sai abreviado (**104,5 mi**) e a coluna **#** some.

### Despesas por natureza
- **Onde fica:** à direita do Faturamento por área.
- **O que mostra:** os indicadores gerenciais **10100 a 10700** — Labor,
  Matéria-prima, Ocupação e indiretos, Impostos, Marketing, Despesas
  financeiras, Outras despesas, Administrativas e Despesas corporativas —, do
  maior para o menor.
- **Como ler:** as mesmas colunas do Faturamento por área. Na despesa, subir é
  **vermelho**.
- **Como o valor é calculado:** cada indicador reagrupa contas do plano por
  natureza (o Labor junta folha, encargos e benefícios, que no plano estão em
  grupos diferentes). Eles **somam exatamente as despesas totais** (contas 2 + 3
  + 4) — é o mesmo dinheiro, arrumado de outro jeito. O **10600 OUTRAS
  DESPESAS** entra pelos três filhos (Marketing, Despesas financeiras e Outras
  despesas), para não contar duas vezes.
- **Cuidado ao ler:** o **Impostos** daqui (10400) é **menor** que a conta 3 do
  plano, porque os impostos sobre a folha estão dentro do **Labor**. O total não
  muda.
- **Num período:** como no Faturamento por área.

### Ranking de lojas
- **Onde fica:** bloco **Desempenho das lojas**, à esquerda.
- **O que mostra:** as operações na conta ordenadas pela métrica escolhida no
  seletor ao lado do título: **Faturamento**, **Lucro líquido**,
  **Rentabilidade**, **Matéria-prima (CMV)**, **Labor** ou **Delivery**.
- **Como ler:** uma barra deitada por loja, com o valor na ponta, **10 por
  página** (os botões **‹ ›** embaixo mostram as outras). A escala vale para a
  lista inteira, então a barra de uma página compara com a de outra. A **régua
  tracejada** é a referência. Barra de valor negativo cresce para a **esquerda**,
  em vermelho. No **celular**, o nome da loja fica em cima da barra, inteiro.
- **Qual é a régua:** nos valores em reais, a **Média** por loja da seleção
  (o total ÷ quantas lojas); nos percentuais, a **Seleção** consolidada (soma
  sobre soma). O rótulo na régua diz qual das duas.
- **Como o valor é calculado:** o indicador de cada loja sozinha, com a mesma
  fórmula do cartão (a rentabilidade da loja = lucro da loja ÷ faturamento da
  loja).
- **Quem fica de fora:** operação sem plano no período — ela não vira barra.
- **Ordem:** do maior para o menor, **exceto** em Matéria-prima (CMV) e Labor,
  onde menor é melhor e a lista vai do menor para o maior.
- **Em tela cheia:** todas as lojas de uma vez, com rolagem.
- **Dica:** o nome da loja e o valor.

### Regiões
- **Onde fica:** à direita do ranking de lojas.
- **O que mostra:** o mesmo ranking com as operações **somadas por região da
  rede** (NCO, NE, SPC, SPISE, SUL). A métrica é a escolhida no ranking de
  lojas — este cartão não tem seletor próprio.
- **Como o valor é calculado:** soma de verdade: o percentual da região sai
  sobre o faturamento **dela**, e não da média das lojas dela.
- **Quem fica de fora:** ninguém. Operação sem região no cadastro cai em **Sem
  região**, que aparece como mais uma barra.
- **Dica:** o nome da região e o valor.

### Desempenho das lojas (a tabela)
- **Onde fica:** abaixo dos dois rankings, fechando a aba.
- **O que mostra:** **Por loja** ou **Por região**, uma linha por operação (ou
  região) com **Faturamento (R$)**, **Despesas (R$)**, **Lucro líquido (R$)** e
  **Rentabilidade**, cada um com a **Var.** ao lado — a da rentabilidade em
  **Var. (p.p.)**.
- **Como ler:** abre ordenada pelo faturamento; clique no cabeçalho para
  reordenar por qualquer coluna. O subtítulo traz o total da seleção
  ("R$ 164,9 mi de faturamento, R$ 139,4 mi de despesas…").
- **Como o valor é calculado:** o mesmo consolidado dos cartões, loja a loja; a
  variação é contra o período de comparação, e **loja sem plano lá mostra —**.
- **Exportar:** leva a tabela como está na tela, em **Excel** (exige a permissão
  de exportar).
- **Em tela cheia:** o botão de expandir, no canto da tabela, mostra **todas as
  lojas** de uma vez, sem páginas, e mantém a ordem escolhida; **Esc** sai.
- **No celular:** cada loja vira um cartão com os quatro números e as variações.
      `,
    },
    {
      id: 'indicadores',
      title: 'Os indicadores do plano, um a um: como cada um é calculado',
      content: `
Todo indicador do painel sai **sobre as somas** do recorte: primeiro as contas
somam, depois a conta do indicador é refeita. Nenhum deles é média de
percentual de loja, e nenhum é lido como o plano gravou (ver "A consolidação").

## Os dez do cartão Indicadores mês a mês
- **CMV** — **Matéria-prima (CMV)**: a conta **2** ÷ o faturamento.
- **Labor** — o indicador **10200** ÷ o faturamento. O labor junta folha,
  encargos e benefícios, que no plano estão em grupos diferentes.
- **Impostos** — a conta **3** ÷ o faturamento.
- **Custos op.** — **Custos operacionais**: a conta **4** ÷ o faturamento.
- **Lucro c/ inv.** — **Lucro líq. com investimentos**: a conta **7** ÷ o
  faturamento, já descontando os investimentos.
- **Rent. c/ estoque** — **Rentabilidade (variação de estoque)**, o índice
  **10001**: (conta 6 + variação de estoque) ÷ faturamento.
- **MP restaurante** — **Matéria-prima sobre venda restaurante**, o índice
  **10101**: a conta 2 ÷ o faturamento **do restaurante** — o total menos
  couvert, taxas de entrega, parquinho, estacionamento, gorjeta e outras
  receitas.
- **Motoboy/delivery** — o índice **20001**: 4.10.1 Motoboys ÷ 1.2 DELIVERY.
- **Vinhos** — o índice **20002**: 1.1.3 Vinhos (receita) ÷ 2.2.2 Vinhos
  (despesa). É **múltiplo**, não percentual: 1,90 quer dizer que a venda cobre
  1,90 vez o custo. Maior é melhor.
- **Couvert** — o índice **20003**: 1.1.4 Couvert ÷ 4.10.2 Músicos, também
  múltiplo.

Nos oito primeiros a variação vem em **p.p.**; nos dois múltiplos, em **%**.

## Os gerenciais de natureza (10100 a 10700)
Reagrupam as despesas por **natureza**, e não pelo grupo do plano. Eles **somam
exatamente as despesas totais** (contas 2 + 3 + 4):

- **10100 MATÉRIA PRIMA** — a conta 2 inteira.
- **10200 LABOR** — folha, encargos, benefícios, vale-transporte, 13º, férias e
  rescisões, mais os encargos que estão no grupo 3.
- **10201 Labor sem despesa de Diretores** — o mesmo labor, tirando a conta de
  diretores. Não entra na soma das despesas: é uma leitura do labor.
- **10300 OCUPAÇÃO E INDIRETOS** — aluguel, condomínio, energia, água,
  manutenção e o que mais sustenta o ponto.
- **10400 IMPOSTOS** — os impostos que sobram fora do labor. **É menor que a
  conta 3**, porque os impostos sobre a folha estão dentro do 10200.
- **10500 ADMINISTRATIVAS**.
- **10600 OUTRAS DESPESAS** — soma dos três filhos: **10601 Marketing**,
  **10602 Despesas Financeiras** e **10603 Outras Despesas**. Nas telas, entram
  os filhos, para não contar duas vezes.
- **10700 DESPESAS CORPORATIVAS** — o rateio da estrutura corporativa.

## Os lucros (11000 a 11004)
- **11000 LUCRO LÍQUIDO** e **11001 Lucro Liquido (sem investimentos)** — a
  conta **6**.
- **11002 Lucro Liquido (descontando os investimentos)** — a conta **7**.
- **11003 Lucro Liquido Corrigido Estoque** — **11000 + 10103**: o lucro
  somando o quanto o estoque variou.
- **11004 Lucro Liquido Corrigido Estoque e Perse** — **11003 − 10014**, tirando
  a tese PERSE.

⚠️ **11003 e 11004 são refeitos pelo painel.** Os planos gravaram os dois com
sinais diferentes ao longo de 2026, e ler o gravado dava número diferente de
loja para loja.

## Estoque e informativos
- **10102 Estoque total no final do mês** — é **saldo**: vale o último mês com
  plano de cada loja, e os estoques das lojas somam. O **%** dele é sobre o
  faturamento **médio mensal**, e não sobre o faturamento do período.
- **10103 Variação estoque total** — o quanto o estoque mudou no mês.
- **10104 CMV Corrigido** — **10100 − 10103**: a matéria-prima corrigida pelo
  que entrou ou saiu do estoque.
- **10014 Tese PERSE** — o valor da tese, quando houver.

Os três primeiros são **informativos**: não têm "melhor" nem "pior" na
comparação, e ficam em cinza.

## Os cinco calculados pelo painel
Não existem no Plano de Contas: nascem aqui, sobre as somas do recorte
(**LABOR / Faturamento salão**, **(Motoboy − Receita com entrega) / Venda
delivery**, **Receita com entrega / Venda delivery**, **Estoque / Faturamento
mensal** e **DIO — dias de estoque**). Cada um está descrito na seção "Aba
Plano de contas", onde eles aparecem marcados **calc.**
      `,
    },
    {
      id: 'aba-plano',
      title: 'Aba Plano de contas',
      content: `
A grade **Plano de contas consolidado** mostra o plano inteiro das operações na
conta, no mesmo formato do Plano de Contas da loja, somado segundo as regras de
consolidação.

## Colunas
- **Conta** — o código e a descrição. A seta **›** abre os subitens da conta.
- **Realizado (R$)** — o valor consolidado. Nas razões, a própria razão.
- **% Fat.** — a parte da conta no faturamento, com uma barra de proporção.
  Numa conta de saldo (estoque), é o saldo sobre o faturamento **médio mensal**.
- **Var. R$** — quanto o valor mudou em reais contra o período anterior, nas
  mesmas lojas.
- **Var. %** — a mesma mudança, em percentual do valor anterior.
- **Δ p.p.** — a mudança do % Fat. em pontos percentuais; nas linhas de razão,
  a mudança da própria razão.

As três colunas de variação são os três GAP do BI mensal (abas COA - ACUMULADO
e COA - MENSAL) e contam histórias diferentes: uma conta pode crescer em reais
e cair em pontos percentuais, quando o faturamento cresceu mais depressa que
ela. Nas linhas de razão, Var. R$ e Var. % mostram "—".

Verde é a favor (receita e lucro subindo, custo caindo) e vermelho é contra.
Valor negativo aparece em vermelho.

## Controles
- **Abrir até** **1 / 2 / 3** — abre a árvore inteira até aquele nível. A seta de
  cada conta abre ou fecha só ela, e a dica de cada número resume o que ele
  contém.

  O nível é a profundidade do código da conta:
  - **Nível 1** — as **7 contas raiz**: 1 FATURAMENTO, 2 MATERIA PRIMA,
    3 IMPOSTOS, 4 CUSTOS OPERACIONAIS, 5 INVESTIMENTOS, 6 LUCRO LÍQUIDO (sem
    investimentos) e 7 LUCRO LÍQUIDO (descontando os investimentos). É o
    resultado em sete linhas — a grade mostra **36 linhas**, contando os
    indicadores.
  - **Nível 2** — as **37 contas** de um ponto, que dividem cada raiz por
    assunto: 1.1 RESTAURANTE, 1.2 DELIVERY, 2.2 BEBIDAS, 4.1 FOLHA,
    4.10 SERVIÇOS TERCEIRIZADOS… São **73 linhas**.
  - **Nível 3** — as **94 contas** de dois pontos, o detalhe de cada assunto:
    1.1.1 Comidas, 1.1.2 Bebidas, 1.2.2 Taxas de entrega, 4.10.1 Motoboys
    delivery, 4.10.2 Músicos… São **167 linhas**, o plano inteiro.

  Cada conta é a soma das filhas dela, então **não some níveis diferentes**: o
  grupo já contém os subitens. A seção **INDICADORES E VALIDAÇÕES** não depende
  do nível — ela aparece sempre, com os indicadores gerenciais e os calculados.
- **Período / Mês a mês** — aparece quando o topo tem um período. **Período**
  mostra o total; **Mês a mês** mostra um grupo de colunas (**R$** e **%**) por
  mês, mais o grupo **Período** no fim.
- **Exportar** — baixa a grade como está na tela (exige a permissão
  \`dashboard-contas.exportar\`).
- O ícone **ⓘ** ao lado do título (**Como ler a grade**) resume a leitura das
  colunas e das cores.

## Indicadores e validações
Abaixo das contas, a seção **INDICADORES E VALIDAÇÕES** traz os indicadores
gerenciais do plano (10100 a 10700, 11000 a 11004, 20001 a 20003, 10014, 10102,
10103, 10104) e cinco **indicadores calculados** pelo painel, marcados
**calc.**:
- **LABOR / Faturamento salão** — 10200 LABOR ÷ (faturamento − 1.2 DELIVERY − 1.6
  ESTACIONAMENTO / VALLET). O peso da equipe sobre a venda atendida no salão.
- **(Motoboy − Receita com entrega) / Venda delivery** — (4.10.1 Motoboys
  delivery − 1.2.2 Taxas de entrega) ÷ 1.2 DELIVERY. O custo líquido da entrega
  própria.
- **Receita com entrega / Venda delivery** — 1.2.2 Taxas de entrega ÷ 1.2
  DELIVERY. Quanto da venda de delivery a taxa de entrega recupera.
- **Estoque / Faturamento mensal** — o estoque no fim do período ÷ o
  faturamento médio mensal. Menor é operação mais enxuta; muito baixo pode ser
  risco de falta.
- **DIO — dias de estoque** — o estoque no fim do período ÷ (matéria-prima
  média mensal ÷ 30). Sai com uma casa (**34,5 dias**), para fechar com a
  diferença da comparação. Quantos dias de consumo o estoque cobre: 45 dias é um mês e
  meio de matéria-prima parada.

Passe o ponteiro sobre um indicador com **ⓘ** para ver de quais contas ele é
feito (**Composição:** com cada conta e o sinal).

No celular, cada conta vira um cartão com **Realizado**, **% Fat.** e **Var. /
Δ**, e o botão **Abrir** mostra os subitens.
      `,
    },
    {
      id: 'aba-comparativos',
      title: 'Aba Comparativos',
      content: `
A grade **Comparativo** mostra o plano de contas com **uma coluna por
operação** na conta — ou por região e estado —, cada uma medida contra a
**referência**.

Cada loja traz **R$**, **%** e a distância para a referência. Em **Mostrar** dá
para deixar só UM desses números: a coluna fica três vezes mais estreita e a
grade, bem mais leve para percorrer a rede inteira. A cor é sempre a distância:
verde a favor, vermelho contra, mais forte quanto mais longe. Passe o ponteiro
sobre qualquer célula para ver os quatro números juntos — o valor em R$, o % da
loja, a distância e o ganho até a referência.

## Controles
**Comparar com**, **Mostrar** e **Colunas** ficam na barra ACIMA da grade, na
mesma linha do **Resumo das N colunas**. O **Abrir até** fica no cabeçalho da
grade, antes do filtro, como na aba Plano de contas.

Em tela baixa, a grade ocupa a altura inteira da aba: role a aba para baixo e a
barra e o resumo saem da vista; role para cima para voltar a eles.

- **Comparar com** — contra o que cada coluna é medida:
  - **Média** — o **índice médio** da seleção: a linha **somada** dividida pelo
    faturamento **somado** das lojas. Loja maior pesa mais, porque ela pesa mais
    no resultado da rede. Não é a média aritmética dos percentuais de cada loja —
    as duas contas dão números diferentes sempre que as lojas têm tamanhos
    diferentes. É a mesma régua dos rankings da Visão geral. Confere na tela: a
    coluna **Média %** é exatamente a **Média R$** da linha dividida pela
    **Média R$** do faturamento;
  - **Média do grupo** — o mesmo índice médio, mas de **todas as lojas da rede**,
    marcadas ou não: a linha somada dividida pelo faturamento somado do grupo
    inteiro. As unidades de teste ficam de fora, e os filtros de **status** e de
    **Mesmas lojas** valem igual. Escolhida, ela abre o bloco **Grupo · N lojas**
    ao lado de **Lojas selecionadas**, e a distância de cada coluna (**Δ grupo**)
    passa a ser contra a média do grupo. A opção só aparece quando há loja da rede
    fora da seleção: com todas marcadas, a média do grupo é a própria **Média**.
    Nada é consultado de novo — o plano da rede inteira já vem com a consulta;
  - **Melhor** e **Pior** — a melhor e a pior loja da seleção naquela conta;
  - **Período** — em vez das outras lojas, a própria operação em OUTRO período:
    cada uma ganha o período do topo, o período comparado e a diferença entre os
    dois. **Cada período traz dois números: o valor em R$ e o percentual sobre o
    faturamento** daquele mesmo período, com o **1 FATURAMENTO** em 100% — o
    mesmo percentual da grade do Plano de contas. As razões (rentabilidade,
    motoboy/delivery, vinhos, couvert) ficam com "—" na coluna de **%**: elas já
    SÃO um percentual ou um múltiplo, e esse número é o que aparece na coluna ao
    lado. O **Δ** é outra conta — a mudança de um período para o outro —, e não o
    percentual sobre o faturamento. Entram só as operações com plano nos dois períodos — comparar conjuntos
    diferentes de loja mediria a troca de lojas, não a mudança do resultado —, e o
    grupo **Lojas selecionadas** traz o consolidado nos dois. A diferença é
    relativa nas contas em reais e em pontos nas razões.

    **Contra qual período** — ao lado das pílulas aparece um seletor de mês. Ele
    escolhe o **primeiro mês** do período comparado; o último acompanha o
    **tamanho do período do topo**, e o texto ao lado diz qual ficou (*a ago/25 ·
    6 meses*). Comparar seis meses com três mediria o tamanho do recorte, não o
    resultado. Ele abre no período anterior e aceita qualquer mês, inclusive
    depois do período do topo.

    Esta escolha é **só desta aba**: os cartões da Visão geral, o mês a mês e a
    coluna **Var.** do Plano de contas continuam com o que o **Comparar com** dos
    **Filtros** manda.

  Nas quatro primeiras a referência é sempre de **lojas**, mesmo com as colunas
  por região.
- **Mostrar** — que número aparece na coluna de cada loja:
  - **%** — o percentual da conta sobre o faturamento daquela loja. É o número
    que compara lojas de tamanhos diferentes;
  - **R$** — o valor da conta em reais. Razão e indicador calculado não têm
    valor em reais, e saem com a própria razão;
  - **Δ p.p.** — só a distância para a referência, em pontos percentuais (no
    DIO, em dias);
  - **Ganho R$** — quanto a loja ganharia em reais se a conta fosse igual à
    referência. **+** é ganho disponível (a loja está pior que a referência) e
    **−** é o quanto ela já está melhor; abaixo de R$ 500 a célula fica vazia;
  - **Tudo** — as três colunas por loja: **R$**, **%** e a distância. É como a
    grade abre. Com a rede inteira ela fica **três vezes maior** que as demais:
    com muitas lojas na tela, escolher um número só deixa a rolagem e a abertura
    de contas visivelmente mais rápidas.

  Seja qual for o escolhido, a dica da célula traz todos. O controle não aparece
  em **Período**, onde a coluna já é a própria loja nos dois períodos.
- **Colunas** — **Operação** (uma coluna por loja com plano no período),
  **Região** (as lojas somadas por região da rede) ou **Estado**. O cabeçalho do
  grupo mostra quantas lojas ele soma (**NCO · 18**); passe o ponteiro para ver
  quais.

  Não há "por matriz e filiais" aqui: quem junta o grupo é o interruptor
  **Consolidar matriz e filiais**, no seletor de operações, que vale para as
  cinco abas — e a seta abaixo abre as partes.
- **A seta do grupo (›)** — com a consolidação ligada, cada coluna de grupo com
  **duas ou mais operações** ganha uma seta no cabeçalho. Clicando, as operações
  aparecem **ao lado do total do grupo**: o total continua à esquerda (com o
  nome **Total**) e cada operação ganha uma coluna, com o mesmo número que
  **Mostrar** escolheu. A seta não muda nenhum número — só mostra de que partes
  o total é feito. Ela não aparece em **Comparar com: Período**, onde o detalhe
  precisaria existir nos dois períodos.

  As filiais abertas **não disputam** melhor e pior: quem está na conta é o
  grupo. No **Exportar**, elas saem junto, como estão na tela.
- **Abrir até** **1 / 2 / 3**, no cabeçalho da grade — abre a árvore até aquele nível: as 7 contas raiz,
  as 37 de um ponto (1.1, 4.10…) ou as 94 de dois pontos (1.1.1, 4.10.1…). A dica
  de cada número diz o que ele contém; ver "Aba Plano de contas".
- **Exportar** e **Tela cheia**, no canto da grade. A tela cheia leva a barra de
  controles junto: dá para trocar de referência e de nível sem sair dela.

O selo ao lado do título — **15 operações de fora**, por exemplo — nomeia as
operações marcadas que não entraram na comparação e o motivo de cada uma.

No celular os controles viram seletores compactos, dois por linha
(**Comparar com**, **Mostrar**, **Colunas**); o **Abrir até** vira um seletor no
cabeçalho da grade.

## Sobre o que média, melhor e pior são calculados
Média, melhor e pior precisam de **mais de um ponto** para existir. Com **uma
loja marcada**, a média das lojas é a própria loja, melhor e pior são ela também
e a distância dá **0,00 em todas as linhas** — o que se lê como resultado, e não
como "não se aplica". Por isso a referência segue o eixo que TEM mais de um
ponto:

- **Duas lojas ou mais** — a referência são as **lojas**, como descrito acima. É
  o caso normal, e nada muda.
- **Uma loja, período de vários meses** — a referência passa a ser **os meses
  dessa loja**. As pílulas mudam de nome junto: **Média dos meses**, **Melhor
  mês** e **Pior mês**; o grupo de colunas passa a se chamar **Meses desta loja ·
  N**, e a primeira coluna vira **Média R$/mês**, porque ali o valor é o de um
  mês médio, e não o do período inteiro. A coluna da loja continua sendo o
  **período consolidado**.
- **Uma loja e um mês só** — não há eixo nenhum. As colunas de referência e a de
  distância mostram **"—"**, e um aviso pede para marcar mais lojas ou escolher
  um período maior.

Na régua dos meses **ninguém é marcado como melhor ou pior**: a coluna é uma
loja, e dizer que ela é "a melhor" quando ela empata com o melhor mês dela seria
dizer que ela é a melhor de si mesma.

A mesma regra vale para a aba **Por índice**, com uma diferença: lá o eixo
principal são as **linhas exibidas**, e não as lojas. Com **Linhas por: Região**,
três lojas de uma região só dão UMA linha — e a referência passa a ser os meses
do mesmo jeito.

O modo **Comparar com: Período** não muda em nenhum dos casos: ali a referência
é a própria operação no outro período, e ela funciona com uma loja só.

## As colunas
- O grupo **Lojas selecionadas · N** traz a referência de cada conta:
  **Média R$**, **Média %**, **Melhor %** e **Pior %**. Com uma loja marcada e um
  período de vários meses ele vira **Meses desta loja · N**, com **Média R$/mês**,
  **Média dos meses**, **Melhor mês** e **Pior mês**.
- Com **Comparar com: Média do grupo**, o bloco **Grupo · N lojas** aparece ao
  lado, com as mesmas quatro colunas — **Média R$**, **Média %**, **Melhor %** e
  **Pior %** — calculadas sobre todas as lojas da rede. O contorno de melhor e
  pior nas colunas das lojas continua sendo o da seleção. Passe o ponteiro sobre
  o nome do bloco para ver quem entra nele. No **Exportar**, o bloco sai junto.
- **O alfinete**, ao lado do nome de cada bloco — **Lojas selecionadas** e
  **Grupo** —, fixa aquele bloco à esquerda, junto da **Conta**: ele fica à vista
  enquanto você rola pelas lojas. Clique de novo para soltar. Os dois começam
  soltos, e cada um fixa sozinho; fixado só o **Grupo**, ele passa para antes de
  **Lojas selecionadas**. Os dois juntos ocupam boa parte da grade, e só ficam
  fixados ao mesmo tempo quando ainda sobra espaço para duas lojas — na tela
  cheia de um monitor largo, por exemplo. Onde não sobra, fixar um solta o
  outro, e a dica do alfinete avisa antes. Em **Comparar com: Período**, o
  alfinete fixa o bloco do consolidado.
- Cada loja tem **uma coluna**, com o número de **Mostrar** — ou três, em
  **Mostrar: Tudo**.
- A melhor e a pior loja da seleção aparecem **contornadas**, em verde e em
  vermelho. Empate marca todas as empatadas; conta igual em todas (o faturamento
  é 100% em toda loja) não marca ninguém. Na referência por **meses** ninguém é
  contornado.
- O cabeçalho mostra o nome da loja cortado quando não cabe; a dica traz o nome
  inteiro.

## As cores
A célula é pintada pela **distância para a referência**, em qualquer modo de
**Mostrar**: verde é a favor e vermelho contra — custo abaixo da referência,
receita e lucro acima. A cor fica mais forte com a distância: **0,2 / 0,4 / 0,8
/ 1,6 p.p.** (no DIO, 2 / 4 / 8 / 16 dias). Abaixo de 0,2 p.p. é ruído, em
cinza.

Em **Mostrar: Ganho R$** só o lado CONTRA é colorido: o que já está melhor que a
referência aparece em cinza, com sinal **−**.

A dica de qualquer célula traz os quatro números de uma vez: o valor em R$, o %
da loja, a distância para a referência (com o valor dela) e o ganho disponível.

**Não some a coluna entre níveis:** o grupo já contém os subitens.

## As colunas fora da vista
Com a rede inteira são dezenas de colunas, e o painel desenha só as que estão na
tela mais uma folga de cada lado — as outras aparecem conforme a rolagem
avança, sem que a barra de rolagem ou a posição das colunas mudem. É o que
mantém a grade rápida com 89 lojas.

Duas consequências: a **busca do navegador** (Ctrl+F) só acha o que está
desenhado — para ir a uma loja, use o seletor **Operações** do topo —, e o
**Exportar** não é afetado: o arquivo sai com todas as lojas, estejam elas na
tela ou não.

## Resumo das colunas
A faixa **Resumo das N colunas**, acima da grade, abre um cartão por coluna com o
faturamento, **MATÉRIA-PRIMA**, **CUSTOS OPERAC.** e **LUCRO LÍQ.** e a diferença
de cada um para a referência. Os selos **Maior fat.** e **Menor fat.** marcam os
extremos. Ele abre sozinho com até 8 colunas; a seta abre e fecha. Em tela
baixa, rolar a aba para baixo leva o resumo para fora da vista, e a grade fica
com a aba inteira.



## Quem fica de fora
Operação sem plano no período não vira coluna nem entra na média. O subtítulo
da grade diz quantas ficaram de fora (**18 operações sem plano ficam de fora**).
Com menos de duas lojas, não há média, melhor nem pior — a tela avisa **"Marque
duas lojas ou mais para haver média, melhor e pior."**

## Desempenho
Com a rede inteira e o plano aberto no nível 3 são 89 lojas e 167 linhas. Três
coisas seguram a grade de pé:

- **escolher um número** em **Mostrar** deixa a loja com uma coluna em vez de
  três — é a troca mais barata quando a grade ficar pesada;
- **só as colunas da vista** são desenhadas (acima);
- **abrir ou fechar uma conta** não redesenha o resto: as linhas que continuam
  na tela são reaproveitadas, e só as que entram são desenhadas.

O que ainda muda a grade inteira: **trocar de agrupamento** (Colunas), entrar e
sair de **Comparar com: Período** e entrar e sair de **Mostrar: Tudo** — nesses
casos a grade é outra, e o **esqueleto** aparece enquanto ela é montada. Trocar
a referência ou o número mostrado mantém as mesmas colunas e só reescreve o que
há dentro delas.

Toda espera do painel é mostrada com **esqueleto** — os blocos cinzas no formato
da tela —, nunca com a tela apagada ou parada com números velhos.
      `,
    },
    {
      id: 'aba-por-indice',
      title: 'Aba Por índice',
      content: `
A aba **Por índice** é a Comparativos virada de lado: uma linha por operação e
uma coluna por **índice** escolhido — qualquer conta do plano ou indicador. Ela
responde "quem é o maior e o menor NESTE índice", que é o que a grade de 89
colunas não consegue mostrar.

**Índice** aqui é qualquer linha do plano: uma conta (**2 MATERIA PRIMA**,
**4.10.1 Motoboys delivery**), um indicador gerencial (**10200 LABOR**) ou um
dos calculados pelo painel.

A lista desta aba é MAIOR que as grades das abas Plano de contas e Comparativos:
ela traz também os indicadores que aquelas duas não mostram, porque os cartões da
Visão geral já os apresentam — **10000 RENTABILIDADE**, **10001** (a rentabilidade
com a variação de estoque) e **10101** (matéria-prima sobre a venda do
restaurante), entre outros. Eles aparecem no fim do grupo **Indicadores** e se
acham pela busca. O único que fica de fora é o **9999**, a linha de validação do
plano: ela mede se o plano fecha com o contas a pagar, não como a loja foi.

## Controles
- **Índices** — o seletor de múltipla escolha, com busca por nome ou código. Não
  há teto: quantos índices forem marcados viram coluna. As colunas saem sempre na
  ordem do plano, não na ordem em que foram marcadas, e a tabela rola na
  horizontal com a posição e o nome da linha fixados à esquerda.
- **Mostrar** — **%** (o percentual da conta), **R$** (o valor; as contas de
  razão mostram "—", porque não têm valor em reais), **Δ média** (a distância
  até a média das linhas exibidas, em pontos percentuais, com a mesma escala de
  cor da Comparativos) ou **Δ ano passado** — **Δ anterior**, conforme o
  **Comparar com** do topo: a mudança do percentual de cada linha contra ela
  mesma no período comparado, em pontos percentuais. Nesse modo só entram as
  linhas com plano nas duas pontas, e a linha do topo é a variação da seleção
  inteira.
- **Linhas** — **Operação**, **Região** ou **Estado**. Para juntar matriz e
  filiais, use o interruptor **Consolidar matriz e filiais** do seletor de
  operações.
- **Com gráfico / Só a tabela** — o gráfico fica ao lado da tabela na tela larga
  e embaixo dela na estreita. **Só a tabela** dá toda a altura para a grade.

## A ordem
Clique no nome de um índice para ordenar **do maior para o menor**; de novo,
**do menor para o maior**; uma terceira vez volta à ordem alfabética. A coluna
**#** mostra a posição na ordem vigente, e o gráfico de barras acompanha o índice
que está ordenando.

A aba abre ordenada pelo **primeiro índice**, do maior para o menor. Operação sem
o índice no período fica **sempre no fim**, nos dois sentidos: sem plano naquela
conta não é "a menor de todas".

## A régua
A linha **Média das linhas**, fixa no topo da grade, é o **índice médio** da
seleção — a linha somada dividida pelo faturamento somado —, e não a média
aritmética do que
está na tela — cada linha pesa igual —, e é ela que vira a régua tracejada do
gráfico. **Verde** marca quem está melhor e **vermelho** quem está pior naquele
índice, seguindo o que é bom em cada conta (custo menor, receita e lucro
maiores).

⚠️ Esta régua é das **linhas exibidas**, e não das lojas da seleção como na
Comparativos. Com **Linhas: Região**, a média é das regiões.

## O gráfico do índice em foco
- **Onde fica:** ao lado da tabela na tela larga, embaixo dela na estreita.
  **Só a tabela**, no controle **Gráfico**, esconde o cartão e dá toda a altura
  para a grade.
- **O que mostra:** as mesmas linhas da tabela, na mesma ordem, no índice que
  está ordenando — o título traz o código e o nome dele.
- **Como ler:** uma barra por linha, com o valor na ponta, e a **régua
  tracejada** na **Média das linhas**. Quantas barras aparecem de uma vez
  depende da altura do cartão; os botões **‹ ›** mostram as outras. Valor
  negativo cresce para a esquerda, em vermelho.
- **Como o valor é calculado:** é a célula da tabela, no que **Mostrar**
  escolher — **%**, **R$** ou **Δ média**. Em Δ média a régua fica no zero.
- **Quem fica de fora:** linha sem valor no índice não vira barra (na tabela ela
  aparece com **—**, sempre no fim da ordem).
- **Muda com a ordem:** sim — clicar em outro índice troca o gráfico inteiro.

## Exportar e tela cheia
**Exportar** baixa a tabela como está, em **Excel**, com R$ e % de cada índice;
o ícone de download do gráfico baixa o ranking, também em Excel. A tela cheia
leva a barra de controles junto — dá para trocar de índice e de ordem sem sair
dela. As duas exigem \`dashboard-contas.exportar\`.

No celular, cada operação vira um cartão com a posição, o nome e um índice por
linha.
      `,
    },
    {
      id: 'analises',
      title: 'Aba Análises adicionais',
      content: `
A aba **Análises adicionais** traz o que o **BI mensal** da controladoria (o
"Print Mensal BI") tinha e o painel ainda não: o **realizado**, o **ano
passado** e o **orçado** lado a lado, loja por loja. As outras abas comparam um
período com outro, um de cada vez; esta mostra os três juntos, como os cartões
do BI.

O **orçado** vem do **Plano de Orçamentos** que cada loja lança todo ano — o
mesmo módulo do portal, lido direto. Todo número que sai dele leva o **selo de
origem**: o ícone de prancheta ao lado do título ou do cabeçalho, com a dica
"Origem: Plano de Orçamentos". O **ano passado** são os mesmos meses do
período, um ano antes.

## O seletor de loja
No topo da aba, o seletor escolhe de quem são o resultado, os gráficos e o
plano de contas da loja: **Seleção** (as lojas consultadas somadas) ou uma loja. A
**média** e a **melhor** são sempre das lojas consultadas — o painel compara o
que foi marcado no seletor de operações. Para comparar uma loja contra a rede
inteira, como no BI, marque todas as operações.

## Resultado da loja
Uma tabela com três leituras, escolhidas no **Contra**, ao lado do título da
seção:

- **Lojas** — a loja contra as outras lojas consultadas: o cartão das abas
  GRUPO 1 a 5 e PRINT RESUMO do BI. É a leitura que abre.
- **Orçado** — a loja contra o orçado dela, do faturamento ao lucro: a aba REAL
  VS ORÇADO do BI.
- **Ano passado** — a loja contra os mesmos meses um ano antes: a aba COA do
  BI.

A leitura **Lojas** e as outras duas respondem perguntas diferentes: a primeira
é "como a loja está contra a rede", as outras, "a loja cumpriu o orçado, ou
cresceu". Os percentuais que elas têm em comum são os mesmos números.

### Contra: Lojas
Os sete indicadores — **CMV corrigido**,
**Labor**, **Ocupação e indiretos**, **Administrativas**, **Marketing**,
**Despesas financeiras** e **Outras despesas** —, cada um em percentual do
faturamento.

- **Realizado** — o percentual no período escolhido.
- **Ano passado** — nos mesmos meses, um ano antes (a coluna 2025 do BI).
- **Orçado** — no orçamento da loja para o mesmo período.
- **Média** — o índice das lojas consultadas: a linha somada dividida pelo
  faturamento somado.
- **Gap p/ média** — realizado menos média, em pontos percentuais. Verde é a
  favor (abaixo da média, nas despesas), vermelho é contra.
- **Impacto R$** — logo ao lado do gap, quanto ele vale em reais: quanto o
  resultado mudaria se a linha tivesse o percentual da média (o gap
  multiplicado pelo faturamento da loja). É o IMPACTO R$ da aba Análise
  Comparativa do BI. Positivo (vermelho) é o que a loja gasta a mais que a
  média; negativo (verde), o que ela já economiza. Abaixo de R$ 500 aparece
  "—".
- **Melhor** — o menor percentual entre as lojas consultadas, com o nome da
  loja embaixo (na planilha baixada, **Melhor loja** é uma coluna à parte).
- **Gap p/ melhor** — realizado menos melhor, em pontos.

Com **Seleção** escolhida, o cartão fica sobre a própria média: gap zero e
impacto "—" — o cartão GRUPO CB do BI. Com uma loja só consultada, não há média
nem melhor, e as colunas mostram "—". No celular, cada indicador vira um cartão,
com a melhor loja numa linha própria.

## Caderno da reunião
O botão **Caderno**, no canto do Resultado da loja com **Contra: Lojas**, baixa
um Excel com o cartão de
**todas as lojas consultadas** de uma vez — as abas GRUPO 1 a GRUPO 5 e PRINT
RESUMO do BI. A aba **Caderno** do arquivo traz o cartão da seleção primeiro e
depois o de cada loja, um embaixo do outro, em A4 deitado, três por página, sem
partir um cartão ao meio: é só imprimir. A aba **Tabela** traz os mesmos números
numa tabela só, com a loja em coluna, para filtrar e ordenar. Os números vão
como número, com o formato aplicado, e os gaps saem verdes ou vermelhos como na
tela. O botão exige a permissão de exportar.

### Contra: Orçado e Contra: Ano passado
As abas REAL VS ORÇADO e COA do BI, que têm o mesmo desenho: doze linhas —
Faturamento, CMV corrigido, Labor, Ocupação e indiretos, Impostos,
Administrativas, Outras despesas (com as três parcelas marcadas com **#**:
Marketing, Despesas financeiras e Outras despesas), Despesas corporativas e o
Lucro líquido corrigido.

- Colunas: **Realizado** em reais e em percentual, o **comparado** em reais e
  em percentual, e os três gaps — **Gap R$** (quanto mudou em reais), **Gap %**
  (sobre o valor comparado) e **Gap p.p.** (quanto mudou o percentual sobre o
  faturamento).
- Na **Seleção**, só entram as lojas com os dois lados — com plano no período E
  com orçamento (ou com plano no ano passado). O subtítulo diz quantas.
- A linha **Faturamento** não tem **Gap p.p.**: ela é a base do percentual,
  100% dos dois lados, e mostra "—".

## Onde está o dinheiro
As contas de despesa de **nível 2** — de matéria-prima, impostos e custos
operacionais — em que a loja escolhida mais se afasta da **média** das lojas
consultadas, em reais, da maior para a menor — **10 por página** (os botões
**‹ ›** embaixo mostram as outras) e, em tela cheia, todas de uma vez. O
subtítulo soma o ganho de todas as contas acima da média e diz em quantas a
loja já está melhor. A dica de cada barra traz o percentual da loja e o da
média.

- É o mesmo número da aba **Comparativos** em **Mostrar: Ganho R$** contra a
  Média, só que em ordem — e a coluna IMPACTO R$ do BI, conta por conta.
- Só o nível 2 entra: somar a conta e as filhas dela contaria o mesmo dinheiro
  duas vezes. Investimentos (5) ficam de fora.
- Com **Seleção** escolhida não há gráfico: a seleção é a própria média.

## Realizado contra orçado
O faturamento (ou as despesas totais, ou o lucro líquido, pelo seletor
**Mostrar**) da loja escolhida mês a mês, nos 12 meses até o fim do período:
a coluna azul é o realizado e a cinza, o orçado. A faixa cinza marca os meses
do período escolhido. Mês sem orçamento lançado fica sem a coluna cinza.

## Atingimento do orçado
Uma barra por loja consultada: o faturamento do período dividido pelo orçado
dela, menos 1. **+5%** quer dizer que a loja faturou 5% acima do orçado. A
régua tracejada é a **Seleção** — as mesmas lojas somadas. Loja sem orçamento
de faturamento fica de fora. São **10 lojas por página**; em tela cheia, todas
de uma vez.

## Curva ABC do faturamento
As lojas consultadas em ordem de faturamento no período, da maior para a menor,
e quanto do faturamento total elas somam até cada uma — a curva ABC da aba
RANKING do BI.

- A linha sobe da esquerda (a loja que mais fatura) para a direita até 100%. As
  linhas tracejadas marcam **70%** e **90%**. As faixas ao fundo são as
  classes: **A**, as lojas que somadas a partir da maior fazem os primeiros 70%
  do faturamento; **B**, as seguintes, até 90%; **C**, o resto. Abaixo, quantas
  lojas e quanto do faturamento há em cada classe.
- A fatia é o faturamento da loja dividido pelo das lojas consultadas; o
  acumulado de cada loja inclui a fatia dela. A maior loja é sempre **A**.
- O total é o das lojas consultadas: com a rede inteira marcada, a curva é a do
  BI. Com **Consolidar matriz e filiais** ligado, cada grupo conta como uma loja.
- A letra é do **faturamento**, não de um indicador: uma loja **A** é das que
  mais faturam, e pode ter o pior labor da rede.

## Plano de contas completo
A aba **Análise Comparativa** do BI: todas as contas da loja escolhida, na árvore
da aba Plano de contas — **Abrir até** 1, 2 ou 3, ou a seta de cada conta. O
seletor **Mostrar** troca entre duas leituras:

- **Percentual** — cada conta em percentual do faturamento: **Realizado**,
  **Ano passado**, **Orçado**, a **Média** das lojas consultadas, o **Gap p/
  média**, o **Impacto R$** (a mesma conta do cartão) e a **Melhor no
  indicador** com o **Gap p/ melhor**.
- **Reais** — cada conta em reais: **Realizado**, **Ano passado**, **Var. R$**
  (realizado menos ano passado), **Orçado**, **Gap p/ melhor R$** e **Gap p/
  melhor**.

**O gap é sempre contra a melhor**, nas duas leituras: em pontos percentuais
(**Gap p/ melhor**, a coluna GAP P/ MELHOR do BI) e em reais (**Gap p/ melhor
R$**). O gap em reais é quanto a linha mudaria se a loja tivesse o percentual da
melhor: os pontos de diferença × o faturamento da própria loja. Os reais da
melhor não são subtraídos dos da loja, porque são de outra loja, de outro
tamanho. Exemplo: labor de 28,46% contra 20,50% da melhor = 7,96 p.p.; com
R$ 1,85 mi de faturamento, **+R$ 147 mil**. Positivo em despesa é o que a loja
gasta a mais que a melhor. O **Impacto R$** da leitura Percentual é outra conta:
contra a **média** das lojas, como a coluna IMPACTO R$ (vs MÉDIA) do BI. Para o
realizado contra o orçado, use o **Resultado da loja** com **Contra: Orçado**.

**Melhor no indicador** não é a melhor loja em cada conta: é a loja com o melhor
percentual no **indicador** a que a conta pertence — nas contas de matéria-prima,
a de melhor CMV corrigido —, e o número é o dela naquela conta. Mostra de onde
vem a vantagem da melhor loja, conta a conta, como a coluna MELHOR 2026 do BI.
Conta que não entra em nenhum dos sete indicadores (o faturamento, os impostos
sobre o faturamento, a 4.20 Despesas corporativas, os investimentos) fica sem.

A que indicador cada conta pertence sai da composição dos indicadores: **2**
Matéria-prima e as filhas no CMV corrigido; **3.2** Folha, **4.1**, **4.2** e
**4.4** a **4.7** no Labor; **4.3**, **4.9**, **4.12** e **4.17** em Ocupação e
indiretos; **4.8** em Administrativas; **4.13**, **4.20.3** e **4.20.7** em
Marketing; **4.19** em Despesas financeiras; **4.10**, **4.11**, **4.14**,
**4.15**, **4.16** e **4.18** em Outras despesas — a coluna LEGENDA do BI.

Nome de conta longo demais para a coluna aparece inteiro ao passar o ponteiro. A
planilha baixada leva **todas** as contas até o nível 3, com o R$ e o % de cada
lado e a legenda, qualquer que seja a árvore aberta na tela.

## Por que um número pode não bater com o BI
- **O orçado das Despesas corporativas (4.20)** — o BI não usa o que a loja
  lançou nessa conta no Plano de Orçamentos. No mês de agosto/26 ele vem
  **zerado**; no acumulado jan–ago, vem um valor calculado na própria planilha.
  A 4.20 alimenta duas linhas: **Despesas corporativas** (10700) e, pela Folha
  Marketing (4.20.3) e pelas Publicidades corporativas (4.20.7), o **Marketing**
  (10601). Por isso só essas duas linhas, **Outras despesas** (10600, que soma o
  Marketing) e o **lucro** orçado diferem do BI. Todas as outras batem no
  centavo. Exemplo conferido, **51.CB CAMPO GRANDE**, jan–ago/26: Marketing
  434.120,49 no painel contra 477.294,01 no BI, Despesas corporativas 254.260,82
  contra 258.452,08, lucro 2.994.863,76 contra 2.947.498,98. O painel mostra o
  que a loja orçou.
- **O lucro líquido corrigido realizado** — o painel refaz a conta pela regra
  atual (lucro mais a variação de estoque). O valor gravado no plano mistura duas
  regras ao longo do ano, e o BI soma o gravado.
- **O total da rede** — o BI soma uma lista de lojas mantida à mão; o painel, as
  lojas consultadas. Loja a loja os números batem.
      `,
    },
    {
      id: 'origem-dos-dados',
      title: 'De onde vêm os números, e o que desconfiar',
      content: `
Os números saem do **Plano de Contas** que cada operação registra, lido do
data-warehouse (esquema \`plano_conta\`). Vale a **versão vigente** de cada plano:
planos excluídos e versões substituídas ficam de fora. A região da rede sai do
cadastro de empresas do portal.

## O que parece erro e não é
- **Um mês com prejuízo na rede inteira** — quase sempre é **imposto
  trimestral**: janeiro, abril, julho e outubro concentram IRPJ e CSLL. Em
  jul/26 os impostos foram 24,01% do faturamento e o lucro, 1,56%; em ago/26 o
  lucro variou **+1.019,6%** contra julho. É o dado, não defeito do painel.
- **Pior % absurdo na Comparativos** (ex.: custos operacionais de 334%, lucro de
  −440%) — loja com faturamento muito pequeno no período, como uma loja em
  inauguração com despesa de pré-abertura. Ela pesa igual às outras na média
  simples; use **Mesmas lojas** ou desmarque a loja para tirar o efeito.
- **Número diferente do que está gravado numa razão do plano** — o painel
  recalcula as razões a partir das contas (ver "Como os números são
  consolidados"); o gravado está arredondado em parte dos planos.
- **Operação que não aparece como coluna** — não tem plano no período. Ela
  continua no selo âmbar do topo.

## A correção
Número errado se corrige no **Plano de Contas da loja**. O painel guarda cada mês
consultado enquanto a página está aberta; para ver o número corrigido,
**recarregue a página** e consulte de novo.
      `,
    },
    {
      id: 'mensagens',
      title: 'Mensagens da tela e o que fazer',
      content: `
- **Nenhuma operação selecionada** — nada foi consultado ainda. Marque as
  operações no seletor do topo e clique em **Consultar**.
- **Nenhuma operação marcada passa nos filtros. Confira o status do plano e a
  opção Mesmas lojas em Filtros.** — os filtros tiraram todas as operações
  marcadas. Afrouxe o status ou desligue **Mesmas lojas**.
- **Nenhuma operação na conta** — o mesmo, na aba Plano de contas ou
  Comparativos.
- **Nada para comparar neste período** — nenhuma das operações marcadas tem plano
  gravado no período. Troque o período.
- **Os números não puderam ser carregados** — a consulta ao data-warehouse
  falhou. Troque o período ou recarregue a página; se persistir, avise o suporte.
- **O período vai até 12 meses; o intervalo foi ajustado.** — o período pedido
  passava de 12 meses e a outra ponta foi puxada.
- **O painel exige a permissão dashboard-contas.ler. Peça ao administrador do
  portal.** — o seu usuário não tem acesso ao painel.
- **N lojas de fora** (selo âmbar) — lojas fora da variação por não terem plano
  nos dois períodos. Clique para ver quais.
      `,
    },
    {
      id: 'acesso-e-exportacao',
      title: 'Acesso, exportação e celular',
      content: `
- **\`dashboard-contas.ler\`** — abre o painel e consulta os números. Sem ela, a
  tela mostra o aviso de permissão e nenhuma consulta é feita.
- **\`dashboard-contas.ler-rede\`** — compara **todas as lojas da rede**, e não
  só as do seu escopo de empresa. Sem ela, o seletor lista apenas as operações do
  seu acesso. O painel continua somente leitura nos dois casos.
- **\`dashboard-contas.exportar\`** — mostra o botão **Exportar** nas grades
  (Desempenho das lojas, Plano de contas consolidado, Comparativo). Sem ela, o
  botão não aparece.
- As operações que aparecem no seletor são as do seu acesso no portal.
- **Tudo sai em Excel** (\`.xlsx\`), nas grades e nos cartões de gráfico: cada
  coluna já vem no formato dela — real com R$, percentual com %, pontos com
  "p.p." —, o cabeçalho fica congelado e o recorte vai escrito em cima da
  tabela. O arquivo é nomeado com o painel, o conteúdo e o período (ex.:
  **GIA - Dashboard de Contas - Plano de contas consolidado - 2026-08.xlsx**;
  num período, **2026-01 a 2026-06**) e traz os números por extenso, sem
  abreviação.

**No celular** o painel funciona inteiro: as abas viram um seletor, as grades
viram cartões e os controles da Comparativos viram seletores compactos. Use a
seta **⌄** do topo para recolher os filtros e ganhar espaço.
      `,
    },
  ],
  qa: [
    {
      category: 'Uso',
      items: [
        {
          q: 'Por que o painel abre vazio?',
          a: 'O painel não busca número nenhum antes de você escolher o recorte. Marque as operações no seletor do topo (o botão azul **Selecionar operações**) e clique em **Consultar**.',
        },
        {
          q: 'Troquei o mês e os números não mudaram. Por quê?',
          a: 'Operações, mês, período e filtros só montam o recorte. Os números mudam ao clicar em **Consultar**, que acende quando há mudança por aplicar.',
        },
        {
          q: 'Como vejo um período de vários meses?',
          a: 'Clique no **botão de calendário** ao lado do mês, no topo, escolha o primeiro e o último mês (até 12) e clique em **Consultar**. Na aba Plano de contas, **Mês a mês** mostra cada mês do período lado a lado.',
        },
        {
          q: 'Como comparo uma região com outra?',
          a: 'Na aba **Comparativos**, escolha **Colunas por: Região**. Cada coluna soma as lojas da região; a referência continua sendo a média, a melhor ou a pior **loja** da seleção.',
        },
        {
          q: 'Como acho lojas parecidas com a minha para comparar?',
          a: 'Pelo seletor **Operações**, no topo da página: marque as lojas e clique em **Consultar**. Não há atalho em nenhuma outra tela — até 24/09/2026 os cartões do Resumo das colunas sugeriam lojas de faturamento parecido, e isso foi retirado.',
        },
        {
          q: 'Como vejo um indicador ao longo do tempo?',
          a: 'No cartão **Indicadores mês a mês**, na Visão geral, clique no indicador: a linha do próprio cartão passa a ser a dele, nos 12 meses até o fim do período.',
        },
        {
          q: 'Dá para ver um gráfico maior?',
          a: 'Sim. Cada cartão de gráfico tem o botão **Expandir em tela cheia** no canto do título; **Esc** sai. Nos rankings, a tela cheia mostra todas as lojas de uma vez, com rolagem no lugar dos botões de página.',
        },
        {
          q: 'Como leio os valores de um gráfico sem passar o ponteiro por cima?',
          a: 'Expanda o cartão em tela cheia: abaixo do desenho vem a tabela com o valor de cada mês (ou de cada loja), na mesma ordem do gráfico. Para levar embora, use **Baixar os dados em Excel**.',
        },
        {
          q: 'Como levo os números de um gráfico para o Excel?',
          a: 'No canto do título do cartão, **Baixar os dados em Excel**: o arquivo vem com a aba **Dados** (os números em colunas, prontos para somar) e a aba **Gráfico** (a imagem do desenho). Exige a permissão `dashboard-contas.exportar`.',
        },
        {
          q: 'Como volto a ver o tour?',
          a: 'O botão de capelo ao lado do nome **Dashboard de Contas** reabre o tour do painel; o de capelo ao lado das abas (**Conhecer as abas**) percorre as cinco abas.',
        },
        {
          q: 'Como comparo uma loja contra a rede inteira, como no BI mensal?',
          a: 'Marque todas as operações (**Selecionar todas**, no seletor do topo) e clique em **Consultar**. A **Média** do painel é sempre a das lojas consultadas: com a rede inteira marcada, ela é a média da rede — a mesma conta do BI mensal, a linha somada dividida pelo faturamento somado. Com três lojas marcadas, a média é a das três.',
        },
        {
          q: 'Como vejo o cartão de uma loja como no caderno do BI mensal?',
          a: 'Na aba **Análises adicionais**, escolha a loja no seletor do topo: o **Resultado da loja**, com **Contra: Lojas**, traz os sete indicadores do BI com o realizado, o ano passado, o orçado, a média, a melhor e o impacto em reais. Para ter o cartão de todas as lojas consultadas de uma vez, clique em **Caderno**: ele baixa um Excel com um cartão por loja.',
        },
        {
          q: 'Onde vejo em que contas uma loja mais perde dinheiro?',
          a: 'Na aba **Análises adicionais**, escolha a loja no seletor do topo e veja o gráfico **Onde está o dinheiro**: as contas de despesa em que ela mais se afasta da média das lojas consultadas, em reais, da maior para a menor.',
        },
        {
          q: 'Onde vejo o orçado?',
          a: 'Na aba **Análises adicionais**: o **Resultado da loja** com **Contra: Orçado** (e a coluna Orçado em **Contra: Lojas**), o gráfico **Realizado contra orçado** mês a mês, o **Atingimento do orçado** loja a loja e, conta a conta, a coluna **Orçado** do **Plano de contas completo**. O orçado vem do **Plano de Orçamentos** de cada loja, e o ícone de prancheta marca todo número que sai dele.',
        },
        {
          q: 'Onde está a Análise Comparativa do BI, com todas as contas da loja?',
          a: 'Na aba **Análises adicionais**, no fim: o **Plano de contas completo** da loja escolhida no seletor do topo, com o realizado, o ano passado, o orçado, a média, o impacto R$ e a melhor loja no indicador de cada conta. Use **Abrir até** para descer na árvore; **Exportar** baixa todas as contas.',
        },
        {
          q: 'Como imprimo o caderno da reunião, com o cartão de todas as lojas?',
          a: 'Na aba **Análises adicionais**, clique em **Caderno**, no canto do Resultado da loja com **Contra: Lojas**. Ele baixa um Excel com o cartão da seleção e o de cada loja consultada, um embaixo do outro, três por página em A4 deitado — é só imprimir a aba **Caderno**. A aba **Tabela** tem os mesmos números para filtrar.',
        },
        {
          q: 'Por que o orçado do painel não bate com o do BI em algumas linhas?',
          a: 'Porque o BI não usa o orçado que a loja lançou na conta **4.20 Despesas corporativas**: em agosto/26 ele vem zerado, e no acumulado vem um valor calculado na própria planilha. A 4.20 entra em **Despesas corporativas** e, pela Folha Marketing e pelas Publicidades corporativas, em **Marketing** — então só essas duas linhas, Outras despesas e o lucro orçado diferem. O painel mostra o que cada loja orçou no Plano de Orçamentos; as demais linhas batem no centavo.',
        },
      ],
    },
    {
      category: 'Números',
      items: [
        {
          q: 'A rentabilidade do painel é a média das rentabilidades das lojas?',
          a: 'São a mesma conta desde a versão de 24/09/2026. Em toda tela do painel, a rentabilidade (e qualquer razão) é o lucro somado das lojas dividido pelo faturamento somado — loja maior pesa mais, porque pesa mais no resultado da rede. Até então a **Média** da aba Comparativos era a média aritmética do % de cada loja, com cada loja pesando igual, e dava um número diferente das outras abas.',
        },
        {
          q: 'Por que a variação não bate com a diferença entre os dois números?',
          a: 'A variação compara **só as lojas com plano nos dois períodos**. O número do período inclui também as que têm plano só nele. O selo **N lojas de fora**, ao lado de **Desempenho geral**, lista quais ficaram fora e por quê.',
        },
        {
          q: 'O que é o "período anterior" num período de seis meses?',
          a: 'Os seis meses que terminam no mês antes do início: para **jan–jun/26**, é **jul–dez/25**.',
        },
        {
          q: 'Como o estoque é somado num período?',
          a: 'Estoque é saldo: vale o **último mês com plano** de cada loja, e os estoques das lojas se somam. **Estoque / Faturamento mensal** e **DIO** dividem esse estoque pelo faturamento e pela matéria-prima **médios mensais** do período.',
        },
        {
          q: 'O que quer dizer "—" numa célula?',
          a: 'Sem dado: a loja não tem plano no período, ou a razão não tem base (o divisor é zero, como motoboy sobre delivery numa loja sem delivery). Nunca é zero.',
        },
        {
          q: 'Por que o lucro de um mês caiu tanto?',
          a: 'Confira a linha **IMPOSTOS**. Janeiro, abril, julho e outubro concentram impostos trimestrais e costumam ter lucro bem menor que os meses vizinhos.',
        },
        {
          q: 'O que é o CMV corrigido e o lucro corrigido estoque?',
          a: '**10104 CMV Corrigido** é o do próprio plano. **11003 Lucro Liquido Corrigido Estoque** é o lucro líquido (11000) mais a variação de estoque (10103); **11004** desconta ainda a **10014 Tese PERSE**. O painel recalcula 11003 e 11004 a partir dessas contas.',
        },
      ],
    },
    {
      category: 'Comparativos',
      items: [
        {
          q: 'Contra o que cada loja é comparada?',
          a: 'Contra a **referência** escolhida em **Comparar com**: a **Média** das lojas selecionadas com plano — o índice médio, a linha somada dividida pelo faturamento somado —, a **Melhor** ou a **Pior** loja da seleção naquela conta. Com **uma loja marcada** e um período de vários meses, a referência passa a ser os **meses dessa loja** — as pílulas viram **Média dos meses**, **Melhor mês** e **Pior mês**. Com uma loja e um mês só não há referência, e as colunas mostram "—".',
        },
        {
          q: 'O que são as Oportunidades em R$?',
          a: 'Quanto a coluna ganharia em reais se a conta dela tivesse o % da referência. **+** é ganho disponível (a coluna está pior); **−**, o quanto ela já está melhor. Valores abaixo de R$ 500 ficam em branco.',
        },
        {
          q: 'Por que a cor de uma diferença é fraca e a de outra é forte?',
          a: 'A intensidade acompanha a distância para a referência: 0,2, 0,4, 0,8 e 1,6 p.p. marcam os degraus (no DIO, 2, 4, 8 e 16 dias). Abaixo de 0,2 p.p. fica cinza.',
        },
        {
          q: 'Por que algumas operações não viram coluna?',
          a: 'Não têm plano no período escolhido. O subtítulo da grade conta quantas ficaram de fora, e elas aparecem no número âmbar do topo.',
        },
      ],
    },
    {
      category: 'Acesso',
      items: [
        {
          q: 'Por que não aparece o botão Exportar?',
          a: 'A exportação exige a permissão `dashboard-contas.exportar`. Peça ao administrador do portal.',
        },
        {
          q: 'O painel altera o Plano de Contas da loja?',
          a: 'Não. O painel é somente leitura. A correção de um número é feita no Plano de Contas da loja; depois, recarregue a página e consulte de novo.',
        },
      ],
    },
  ],
}
