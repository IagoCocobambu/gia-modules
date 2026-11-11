import type { ModuleFaq } from '@gia-cb/sdk/modules'

export const faq: ModuleFaq = {
  summary:
    'O **Fechamento Maestro** monta o fechamento diário dos **pedidos de delivery** de uma loja num período: soma o que foi pago em cada dia e divide em **Online** (pago no app ou no parceiro), **Adquirentes** (vale-refeição e benefícios, o tipo ONLINE VR) e **Offline** (pago na entrega). Também confere cada pedido — se as formas de pagamento somam o total pago e se os descontos somam o desconto total — e aponta as **divergências**. Os pedidos vêm da API do DW na hora da pesquisa e os vales, do cadastro de formas de pagamento do Maestro; nada é gravado no portal.',
  sections: [
    {
      id: 'primeiros-passos',
      title: 'Primeiros passos',
      content: `
## Montando o fechamento

1. Escolha a **Loja** no seletor (dá para digitar parte do nome). A primeira loja
   da lista já vem selecionada.
2. Informe a **Data inicial** e a **Data final** — as duas começam em *ontem*.
3. Clique em **Pesquisar**.

No alto da tela fica o título do módulo, à esquerda, e a loja e as datas, à
direita (no celular, embaixo do título, recolhíveis). Depois de pesquisar, a
tela mostra, de cima para baixo:

- a **seção de canais e totais**: os **canais** de venda e os **totais** do
  período inteiro — ou só do **canal** escolhido (no celular, ela abre pelo
  botão **Totais**);
- a **tabela de pedidos**: uma linha por pedido, com número, cliente, origem, status, total pago, forma de pagamento e o
  **Tipo** de cada forma (ONLINE, ONLINE VR, OFFLINE). Outras colunas (valores
  por grupo, checks, endereço...) se ligam no botão de colunas. **Clique num
  pedido** para abrir o detalhe da conciliação, com os valores e os checks.

Para ver os valores de um dia só, pesquise com a **data inicial e a final iguais**
àquele dia. O fechamento somado dia a dia de um período está na aba
**Fechamento diário** do Excel.

## Só divergências

O botão **Só divergências** mostra apenas os pedidos (não
cancelados) com algum check **Divergente**. O número no botão é quantos pedidos
do período têm divergência — em vermelho quando há algum. Clique de novo para
voltar a ver todos. Nas linhas da tabela, pedido com divergência fica com o
fundo levemente vermelho.

## Canais (iFood, App, 99Food...)

À esquerda da seção de totais (em cima, no celular) fica o **anel de canais**:
cada fatia é um canal de venda (App Coco Bambu, iFood, 99Food, Pedido
manual...), do tamanho da parte dele no **total pago**. No meio do anel ficam o
total pago e quantos pedidos entraram nele. As cores são as mesmas das
etiquetas da coluna *Origem* da tabela. Entram só os pedidos **não
cancelados**.

No computador, **passe o mouse** sobre uma fatia: a dica mostra o **nome do
canal**, o **valor pago**, a **porcentagem** do total e quantos **pedidos** ele
teve.

Clique (ou toque) numa fatia — por exemplo, a do **iFood** — e **tudo passa a
ser só dele**: os **12 totais** ao lado, a **tabela**, o número do **Só
divergências** e o **Exportar**. Assim dá para ver, por exemplo, quanto entrou em
Adquirentes online só no iFood. O anel apaga os outros canais, o meio dele passa
a mostrar o nome, o valor, a porcentagem e os pedidos do canal escolhido, e os
totais mostram o aviso *Totais só de iFood · 230 de 410 pedidos* — quantos
pedidos do canal entraram, de quantos da pesquisa. Para voltar à pesquisa inteira, clique no **meio do anel** (*ver
todos*) ou na fatia escolhida de novo.

O seletor **Canal**, na barra de filtros, à esquerda do **Pesquisar**, faz o
mesmo — é por ele que se escolhe um canal com a seção de totais fechada, um canal
que só teve cancelados (que não tem fatia no anel) ou um canal pelo teclado. O
seletor e o anel andam juntos: escolher num muda o outro. Diferente da loja e das
datas, o canal **vale na hora**, sem precisar pesquisar de novo. Ele fica
desativado antes da primeira pesquisa e quando a pesquisa só tem pedidos de um
canal. Ao pesquisar outra loja ou período, o canal escolhido continua — se a
pesquisa nova não tiver pedidos daquele canal, volta a **Todos os canais**. O anel é sempre da pesquisa inteira: ele não muda de tamanho quando
você escolhe um canal. Pedido sem origem informada aparece como **Sem origem**.

## Totais do período

O botão **Totais**, na barra da tabela, abre e fecha a seção acima da tabela,
com os canais e os **12 indicadores** do fechamento do período inteiro. Cada indicador tem
um ícone, o **valor** em destaque e o nome embaixo. Ficam **à vista os 4 grupos
de pagamento** — **Online**, **Adquirentes online**, **Adquirentes offline** e
**Offline** — e, ao lado, o botão **Ver todos os totais (+8)**, que abre logo
abaixo os demais: os 4 **cancelados**, **Descontos loja**, **Descontos parceiro**
e os dois **sem classificação**. Clique em **Ocultar os demais totais** para
fechar. Fechada, a barra ocupa uma linha só e sobra mais espaço para a tabela.
Quando há valor **sem classificação** escondido, o botão mostra um **ponto
vermelho**. Se um dos indicadores escondidos está filtrando a tabela, a parte de
baixo fica aberta até você tirar o filtro. **No celular** a seção fica acima da lista de pedidos, com um indicador por
linha, e começa fechada: toque em **Totais** para abri-la.

As cores ajudam a ler de relance: os grupos de pagamento têm cada um a sua cor;
os **cancelados** ficam vermelhos quando há valor e **sem classificação** fica
amarelo quando há valor — o normal é zero. No computador, **passe o mouse** sobre
um indicador para ver a explicação da conta (a tabela abaixo traz a mesma
explicação de cada um).

**Cada indicador é um filtro da tabela.** Clique (ou toque) num indicador e a
tabela passa a mostrar **só os pedidos que entram naquela conta** — por exemplo,
em **Adquirentes online**, só os pedidos não cancelados com vale pago antes; em
**Cancelado offline**, só os cancelados com parte paga na entrega. O indicador
fica marcado e aparece, na barra da tabela, um botão com o nome dele: clique nele
(ou no indicador de novo) para voltar a ver todos os pedidos. Pesquisar de novo
também tira o filtro. Os valores da barra de totais **não mudam** com o filtro do
indicador — se mudassem, os outros indicadores zerariam. Eles seguem só o
**Canal** escolhido. Indicador zerado não tem pedido para mostrar
e não filtra. O filtro combina com **Só divergências** (mostra os divergentes
dentro do indicador) e vale para o **Exportar**: o Excel sai com os pedidos
filtrados e o subtítulo de cada aba diz qual filtro estava ligado.

Os indicadores, na ordem:

| Indicador | O que soma |
|---|---|
| **Online** | formas ONLINE (pagas antes, no app ou no parceiro), **menos** o incentivo que foi para Descontos parceiro |
| **Adquirentes online** | vales ONLINE VR pagos antes, no app ou no parceiro (o nome termina em *PRE PAGO*) |
| **Adquirentes offline** | vales ONLINE VR passados na entrega, sem *PRE PAGO* (ex.: *VR Refeição*) |
| **Offline** | parte paga na entrega, em dinheiro ou na maquininha (tipo OFFLINE) |
| **Cancelado online / adquirentes online / adquirentes offline / offline** | o mesmo, só dos pedidos **cancelados** |
| **Descontos loja** | desconto total dos pedidos **despachados ou entregues** (venda concluída) |
| **Descontos parceiro** | incentivo do parceiro dos pedidos que **não são 99Food** e têm alguma forma ONLINE VR ou OFFLINE |
| **Valor sem classificação** | valor em formas de pagamento que vieram sem nome (o normal é zero) |
| **Pagamentos sem classificação** | quantas formas de pagamento ficaram sem classificação |

O incentivo que entra em **Descontos parceiro** sai do
**Online** quando o pedido tem parte online: ele foi pago pelo parceiro, não
pelo cliente. Por isso Online + Adquirentes online + Adquirentes offline +
Offline + Sem classificação pode ficar abaixo do total pago, pela diferença do
que foi para Descontos parceiro. O incentivo do 99Food não entra em Descontos
parceiro.

Quando há **pagamento sem classificação**, o último indicador fica **vermelho**:
clique nele para ver na tabela os pedidos com forma de pagamento sem nome, e num
pedido para abrir o detalhe com cada forma. Sem nenhum, ele mostra **0** em verde.

No computador, a seção fica **aberta** em telas com 700 px de altura ou mais e
**fechada** em telas mais baixas, para sobrar espaço para a tabela — e acompanha a janela se
você mudar o tamanho dela. Depois que você clica em **Totais**, vale a sua
escolha até recarregar a página. A barra mostra o período inteiro do **Canal**
escolhido (ou de todos) — o *Só divergências*, a busca e os filtros de coluna
não mudam os totais. Para recortar os totais, escolha um **canal** no anel ou no seletor **Canal**.

## Limites do período

- As datas **não podem ser futuras**.
- A data final **não pode ser menor** que a inicial.
- O intervalo é de **no máximo 31 dias**.

Períodos longos demoram: 31 dias de uma loja movimentada levam cerca de 25 a 30
segundos. Enquanto carrega, o botão **Pesquisar** fica girando — não precisa
clicar de novo.

Se você mudar a loja ou as datas depois de pesquisar, a tela continua mostrando
a pesquisa anterior até você clicar em **Pesquisar** de novo. Se nada mudou, o
botão fica desativado.
      `,
    },
    {
      id: 'conciliacao',
      title: 'Como a conciliação funciona',
      content: `
## Tipo das formas de pagamento → Online, Adquirentes, Offline

Cada pedido traz as formas de pagamento num texto como
*PIX ONLINE PIX - PRE PAGO (144.9), BENEFICIO IFOOD ENTREGA - PRE PAGO (4.31)*.
O módulo separa cada forma com o seu valor e dá a ela um **tipo**, por estas
regras, nesta ordem (a primeira que servir vale):

| Tipo | Soma em | Quando | Exemplos |
|---|---|---|---|
| **SEM CLASSIFICAÇÃO** | Sem classificação | a forma veio sem nome ou como *DESCONHECIDO* | — |
| **ONLINE VR** | Adquirentes online (com *PRE PAGO*) ou Adquirentes offline (sem) | o nome contém uma forma marcada como *ONLINE VR* no **cadastro de formas de pagamento** do Maestro (a da mesma origem do pedido, ou sem origem) | online: *MEAL_VOUCHER ONLINE ALELO - PRE PAGO*, *PLUXEE - PRE PAGO*; offline: *VR Refeição*, *Alelo Refeição* |
| **ONLINE** | Online | o nome termina em *- PRE PAGO* | *PIX - PRE PAGO*, *CREDIT ONLINE VISA - PRE PAGO*, *BENEFICIO IFOOD - PRE PAGO* |
| **OFFLINE** | Offline | qualquer outra forma | *CREDIT OFFLINE*, *DEBIT OFFLINE*, *CASH OFFLINE* |

A coluna **Tipo** da tabela mostra os tipos de cada pedido (ex.: *ONLINE; ONLINE
VR* quando o pedido foi pago parte no cartão e parte no vale). Use o filtro da
coluna para ver, por exemplo, só os pedidos com ONLINE VR.

Os benefícios do iFood (*BENEFICIO IFOOD...*) contam como **ONLINE**: são pagos
pelo iFood, não pelo cliente na entrega.

A lista do que é ONLINE VR vem do **cadastro de formas de pagamento** do Maestro,
lido a cada pesquisa. Uma forma nova de vale que não
esteja no cadastro entra como ONLINE (se for pré-paga) ou OFFLINE — peça ao time
de TI para incluí-la no cadastro.

## Os dois checks

Cada pedido passa por dois checks:

| Check | Fica **OK** quando | Fica **Divergente** quando |
|---|---|---|
| **Check pagamentos** | todas as formas têm valor e classificação, e a soma delas é igual ao **Total pago** | alguma forma está *SEM CLASSIFICAÇÃO* ou sem valor, ou a soma não bate com o total pago |
| **Check descontos** | a soma dos descontos listados é igual ao **Desconto total** | a soma não bate, ou algum desconto veio sem valor |

A comparação é **centavo a centavo** — não há tolerância. O detalhe do pedido
(clique na linha) mostra o motivo exato de cada divergência, por exemplo
*Soma das formas de pagamento (R$ 120,00) diferente do total pago (R$ 125,00)*.

## Venda concluída

Um pedido é **venda concluída** quando o status é *Despachado* (DISPATCHED) ou
*Entregue* (DELIVERED) — o pedido saiu da loja. *Concluído* (COMPLETED) é o prato
pronto na cozinha, ainda não despachado, e **não** conta. A coluna *Venda
concluída* e o Excel mostram isso, e só os pedidos com venda concluída entram
em **Descontos loja**. Os demais pedidos não cancelados entram no fechamento
normalmente.

## Pedidos cancelados

Pedidos **cancelados** aparecem na tabela de pedidos, mas ficam **fora dos
valores de venda** do fechamento (Online, Adquirentes, Offline, descontos, sem
classificação) e da contagem de divergências. O que foi cancelado tem
indicadores próprios: **Cancelado online, adquirentes online, adquirentes
offline e offline**. No Excel eles vão numa aba à parte.

## Em que dia o pedido cai

O dia do fechamento é a **data de criação** do pedido, no horário de São Paulo.
Um pedido criado às 23h50 do dia 10 e entregue no dia 11 entra no dia **10**.
      `,
    },
    {
      id: 'colunas',
      title: 'O que cada campo mostra',
      content: `
## Tabela de pedidos

De cara, a tabela mostra: **Nº
pedido, Data criação, Nº parceiro, Nº conta, Nome cliente, Origem, Status do
pedido, Total pago, Desconto total, Forma de pagamento e Tipo**. As outras
colunas começam **desligadas**: ligue-as no botão de **colunas** da barra da
tabela. Nº pedido, Data criação, Nome cliente, Origem, Status do pedido, Forma
de pagamento e Tipo são **obrigatórias** e não podem ser escondidas.

Colunas que aparecem de cara:

| Coluna | O que é |
|---|---|
| **Nº pedido** | número exibido ao cliente e à operação |
| **Data criação** | quando o pedido foi criado (horário de São Paulo) |
| **Nº parceiro** | número do pedido no parceiro (ex.: iFood) |
| **Nº conta** | número da conta do pedido no Maestro |
| **Nome cliente** | nome do cliente |
| **Origem** | canal: App Coco Bambu, iFood, iFood Vasto, 99Food ou Pedido manual |
| **Status do pedido** | situação atual do pedido no Maestro, em português |
| **Total pago** | soma dos pagamentos do pedido, como veio do Maestro |
| **Desconto total** | soma dos descontos do pedido, como veio do Maestro |
| **Forma de pagamento** | o texto original do Maestro, com o valor de cada forma |
| **Tipo** | o tipo de cada forma de pagamento: ONLINE, ONLINE VR, OFFLINE ou SEM CLASSIFICAÇÃO (veja *Como a conciliação funciona*) |

Colunas desligadas (ligue pelo botão de colunas):

| Coluna | O que é |
|---|---|
| **Data** | dia do fechamento em que o pedido cai (a data de criação) |
| **Total pago online / adquirentes online / adquirentes offline / offline** | quanto do pedido foi ONLINE, ONLINE VR com e sem *PRE PAGO* e OFFLINE (o online do pedido sem abatimento do incentivo) |
| **Total de descontos** | soma dos descontos listados no pedido |
| **Venda concluída** | *Sim* quando o status é Despachado ou Entregue |
| **Check pagamentos / Check descontos** | **OK** ou **Divergente** (veja *Como a conciliação funciona*) |
| **Data de ação** | quando o pedido teve a última ação no Maestro |
| **CPF / Email / Telefone cliente** | contato do cliente — podem vir mascarados (veja *Dados pessoais do cliente*) |
| **Qtd pedidos** | quantos pedidos o cliente já fez |
| **Rua / Número / Referência** | endereço de entrega — número e referência podem vir mascarados |
| **Retirada** | se o cliente retirou na loja |
| **Confirmado por / Cancelado por** | quem confirmou ou cancelou o pedido |
| **Valor do pedido / Valor da entrega** | subtotal e taxa de entrega |
| **Descontos** | o texto original dos descontos do Maestro, com o valor de cada item |
| **Tipo de entrega** | se a entrega é própria ou do parceiro |
| **Nome loja** | nome da loja como veio do Maestro |

Mesmo com os checks desligados, o pedido com divergência fica com o fundo
levemente vermelho, e o botão **Só divergências** continua funcionando.

## Busca, ordenação e colunas

No computador, filtre pelo **funil** de cada coluna (por exemplo, o Tipo ONLINE
VR ou um número de pedido) e clique no cabeçalho para **ordenar**. No celular
há um **campo de busca** que procura em todas as colunas de uma vez. O botão de
**colunas** liga e desliga as colunas (vale até recarregar a página; ao abrir
de novo, volta ao padrão).

## Dados pessoais do cliente

CPF, e-mail, telefone, número e referência do endereço só aparecem completos
para quem tem a permissão **Ver os dados pessoais completos do cliente**. Para
os demais, eles chegam **mascarados** do servidor:

| Campo | Completo | Mascarado |
|---|---|---|
| **CPF cliente** | 123.456.789-01 | \\*\\*\\*.456.789-\\*\\* |
| **Email cliente** | joao.silva@gmail.com | jo\\*\\*\\*@gmail.com |
| **Telefone cliente** | (11) 98765-4321 | (11) \\*\\*\\*\\*\\*-4321 |
| **Número / Referência** | 120 / Ap. 42 | \\*\\*\\* |

O nome do cliente e o nome da rua aparecem sempre. O mascaramento é feito no
servidor: sem a permissão, o dado completo nem chega ao seu navegador.

## No celular

No celular, toque em **Totais** para abrir, acima da lista, a seção com os
**canais** e os **totais** (ela começa fechada, para sobrar espaço para a lista).
Toque numa fatia do anel para ver só aquele canal (o meio do anel mostra o
nome e os números dele; toque no meio para voltar a todos), e num indicador para
filtrar a lista pelos pedidos dele. A explicação de cada indicador está em *Totais do período*, nesta
ajuda.
O título fica em cima, com a loja e as datas embaixo. Ao tocar em **Pesquisar**,
a loja e as datas **se recolhem** para a tela ficar com o resultado; toque na
**seta** ao lado do título para abri-las de novo e fazer outra pesquisa. Se a
pesquisa for recusada (por exemplo, data final antes da inicial), elas ficam
abertas para você corrigir. Os botões da barra da tabela mostram sempre o nome, não só o ícone. A tabela de pedidos vira **cartões** com número, data,
total pago e tipo: toque em **ver mais** para os outros campos ligados, e no
cartão para abrir o detalhe. Use o **campo de busca** para achar um pedido. O
botão de **colunas** também funciona no celular: as colunas que você ligar
aparecem no *ver mais*. Só divergências e Exportar funcionam igual ao
computador.
      `,
    },
    {
      id: 'exportar',
      title: 'Exportando para Excel',
      content: `
Com a permissão de exportação, o botão **Exportar** da barra da tabela baixa um
arquivo **.xlsx** com **3 abas**:

| Aba | O que tem |
|---|---|
| **Fechamento diário** | uma linha por dia, com a linha **Total** |
| **Pedidos** | os pedidos **não cancelados**, com a conciliação de cada um e as divergências por extenso |
| **Cancelados** | os pedidos cancelados, à parte |

O que vai para o arquivo segue a tabela: os pedidos que estão nela — com o
*Só divergências*, a busca e os filtros de coluna. A aba **Fechamento diário**
soma esses mesmos pedidos por dia; sem nenhum filtro, a linha **Total** de cada
aba bate com os totais do período. Por isso a coluna **Online** do arquivo é o
Online **líquido** (sem o incentivo que foi para Descontos parceiro), e os
descontos saem em duas colunas, **Descontos loja** e **Descontos parceiro**, com
a mesma regra dos cards. Com algum filtro ligado, o subtítulo de cada aba avisa
quantos pedidos entraram (ex.: *filtrado: 12 de 340 pedidos*).

As linhas **Total** usam a fórmula SUBTOTAL: se você filtrar no próprio Excel,
o total acompanha. O nome do arquivo segue o padrão do portal:
*GIA - Fechamento Maestro - &lt;loja&gt; - &lt;período&gt;.xlsx*.
      `,
    },
    {
      id: 'origem-dos-dados',
      title: 'De onde vêm os dados',
      content: `
Os pedidos vêm da **API do DW** (\`api-dw.cocobambu.com\`, consulta *Delivery*),
que lê o Maestro — a mesma fonte do **Reports Maestro**. A lista de formas
**ONLINE VR** vem do **cadastro de formas de pagamento** do Maestro. A cada **Pesquisar** o portal busca os dois na hora e faz a
conciliação; nada é gravado no portal.

A loja é identificada pelo **número da loja** no cadastro da Empresa no portal.
Ele vem do **vínculo da Empresa com a BI do Simphony**, que começa sempre pelo
número (ex.: *01 CB Go* → loja **01**). Se a Empresa não tiver esse vínculo, vale o
**número no começo do nome** (ex.: *01.CB GOIANIA* → loja **01**).

O resultado de uma pesquisa fica guardado por **30 minutos**: pesquisar de novo a
mesma loja e o mesmo período nesse prazo mostra o resultado na hora. Para buscar
dados atualizados antes disso, recarregue a página (F5) e pesquise de novo.

O seletor mostra só as lojas do **seu escopo** de Empresas no portal, e só as
cadastradas como **empresa** (com CNPJ) — operações/propriedades sem CNPJ
próprio, como escritório e centro de distribuição, ficam de fora. O servidor
confere isso de novo a cada pesquisa. Se uma loja do seletor não tiver número em
nenhum dos dois lugares, a pesquisa avisa que falta o número no cadastro.
      `,
    },
  ],
  qa: [
    {
      category: 'Conciliação',
      items: [
        {
          q: 'O que significa um pedido "Divergente"?',
          a: 'Que a conta do pedido não fechou: ou a soma das formas de pagamento é diferente do total pago, ou alguma forma veio sem nome (SEM CLASSIFICAÇÃO), ou a soma dos descontos é diferente do desconto total. Clique no pedido para ver o motivo exato e os valores de cada item.',
        },
        {
          q: 'O que significa a coluna Tipo?',
          a: 'É o tipo de cada forma de pagamento do pedido: ONLINE (pago antes, no app ou no parceiro), ONLINE VR (vale-refeição e benefícios, que somam em Adquirentes), OFFLINE (pago na entrega) e SEM CLASSIFICAÇÃO. Um pedido pago de duas formas mostra os dois tipos, separados por ponto e vírgula. Use o filtro da coluna para ver só um tipo.',
        },
        {
          q: 'Apareceu valor em "Sem classificação". O que faço?',
          a: 'É uma forma de pagamento que veio do Maestro sem nome ou como DESCONHECIDO — não dá para saber o tipo dela. Abra o pedido e confira-o no Maestro. O valor fica fora de Online, Adquirentes e Offline, mas continua no total pago, e o pedido fica divergente.',
        },
        {
          q: 'Por que os benefícios do iFood contam como Online?',
          a: 'Porque não são pagos pelo cliente na entrega: o iFood banca o valor e repassa à loja, como um pagamento online. Eles vêm com "PRE PAGO" no nome (ex.: BENEFICIO IFOOD ENTREGA - PRE PAGO) e não estão no cadastro como ONLINE VR, então contam como ONLINE.',
        },
        {
          q: 'Qual a diferença entre Adquirentes e Offline?',
          a: 'Adquirentes (ONLINE VR) é o que foi pago com vale-refeição ou benefício que está no cadastro de formas de pagamento como ONLINE VR. Offline é o resto do que é pago na entrega e não é pré-pago: dinheiro (CASH OFFLINE) e cartão na maquininha (CREDIT OFFLINE, DEBIT OFFLINE).',
        },
        {
          q: 'Qual a diferença entre Adquirentes online e Adquirentes offline?',
          a: 'Os dois são vales ONLINE VR. Adquirentes online é o vale pago antes, no app ou no parceiro — o nome termina em PRE PAGO (ex.: MEAL_VOUCHER ONLINE ALELO - PRE PAGO, PLUXEE - PRE PAGO). Adquirentes offline é o vale passado na entrega, sem PRE PAGO (ex.: VR Refeição, Alelo Refeição, Ticket Refeição).',
        },
        {
          q: 'Um vale-refeição entrou em Online ou Offline em vez de Adquirentes. Por quê?',
          a: 'Porque o nome dele não está no cadastro de formas de pagamento do Maestro como ONLINE VR (para a origem do pedido ou para todas). Sem isso, a forma pré-paga entra como ONLINE e a não pré-paga como OFFLINE. Peça ao time de TI para incluir a forma no cadastro; a mudança vale na próxima pesquisa.',
        },
        {
          q: 'Posso cadastrar ou mudar a classificação de uma forma de pagamento?',
          a: 'Não por esta tela. A lista ONLINE VR vem do cadastro de formas de pagamento do Maestro. Para incluir ou mudar uma forma, peça ao time de TI; a mudança vale para todas as lojas a partir da próxima pesquisa.',
        },
        {
          q: 'Pedidos cancelados entram no fechamento?',
          a: 'Não nos valores de venda. Eles aparecem na tabela de pedidos, mas ficam fora de Online, Adquirentes, Offline, dos descontos e da contagem de divergências. O valor cancelado aparece nos indicadores Cancelado online, Cancelado adquirentes online, Cancelado adquirentes offline e Cancelado offline. No Excel vão numa aba Cancelados à parte.',
        },
        {
          q: 'Como são calculados Descontos loja e Descontos parceiro?',
          a: 'Descontos loja soma o desconto total dos pedidos despachados ou entregues (status Despachado ou Entregue); pedido só Concluído (prato pronto) ou cancelado fica de fora. Descontos parceiro soma o incentivo do parceiro dos pedidos que não são do 99Food e têm alguma forma ONLINE VR ou OFFLINE. Esse incentivo sai do Online quando o pedido tem parte online, porque foi o parceiro, não o cliente, que pagou.',
        },
        {
          q: 'Por que Online + Adquirentes + Offline não dá o total pago?',
          a: 'Porque o incentivo que vai para Descontos parceiro sai do Online. Some de volta o valor de Descontos parceiro dos pedidos com parte online e a conta fecha com o total pago dos pedidos não cancelados — o mesmo total do meio do anel de canais.',
        },
        {
          q: 'O indicador "Pagamentos sem classificação" ficou vermelho. O que faço?',
          a: 'Clique ou toque nele (no celular, ele está no botão Totais): a tabela passa a mostrar só os pedidos com forma de pagamento sem nome ou DESCONHECIDO. Clique num pedido para abrir o detalhe, veja qual forma ficou sem classificação e confira-o no Maestro. O valor aparece em Valor sem classificação e o pedido fica divergente.',
        },
        {
          q: 'Um pedido entregue depois da meia-noite cai em qual dia?',
          a: 'No dia em que foi criado. O fechamento usa a data de criação do pedido, no horário de São Paulo: um pedido feito às 23h50 do dia 10 e entregue no dia 11 entra no fechamento do dia 10.',
        },
        {
          q: 'O que é "Venda concluída"?',
          a: 'É Sim quando o pedido está com status Despachado (DISPATCHED) ou Entregue (DELIVERED) — o pedido já saiu da loja. Concluído (COMPLETED) é o prato pronto na cozinha, ainda não despachado, e fica como Não. Só os pedidos com venda concluída entram em Descontos loja.',
        },
      ],
    },
    {
      category: 'Operações',
      items: [
        {
          q: 'Como vejo o fechamento de um dia específico?',
          a: 'Pesquise com a data inicial e a final iguais àquele dia: os totais passam a mostrar só ele. Para ver todos os dias de um período lado a lado, exporte o Excel e abra a aba Fechamento diário.',
        },
        {
          q: 'O que significam as cores na barra de totais?',
          a: 'Cada grupo de pagamento (Online, Adquirentes online e offline, Offline) tem a sua cor. Os indicadores de alerta só ganham cor quando há algo a olhar: os cancelados ficam vermelhos quando há valor, Valor sem classificação fica amarelo quando há valor e Pagamentos sem classificação fica vermelho quando há algum. Passe o mouse num indicador para ver a explicação da conta; clique nele para filtrar a tabela pelos pedidos dele. Para esconder a barra, clique no botão Totais.',
        },
        {
          q: 'Como vejo quais pedidos formam um total?',
          a: 'Clique (ou toque) no indicador na barra de totais: a tabela mostra só os pedidos que entram naquela conta — em Descontos parceiro, por exemplo, só os pedidos com incentivo do parceiro. Um botão com o nome do indicador aparece na barra da tabela; clique nele (ou no indicador de novo) para voltar a ver todos. Os totais não mudam com o filtro do indicador (só com o Canal), e o Exportar sai com os pedidos filtrados.',
        },
        {
          q: 'Onde vejo os totais no celular?',
          a: 'Toque no botão Totais, na barra da tabela: a seção com os canais e os 12 indicadores abre acima da lista (no celular ela começa fechada). Toque numa fatia do anel para ver só aquele canal e num indicador para filtrar a lista pelos pedidos dele. O fechamento dia a dia está na aba Fechamento diário do Excel.',
        },
        {
          q: 'Quanto cada canal (iFood, app, 99Food) vendeu no período?',
          a: 'Na seção de totais (botão Totais): o anel mostra a fatia de cada canal no total pago. Passe o mouse numa fatia para ver o nome do canal, o valor, a porcentagem e os pedidos; no celular, toque na fatia e o meio do anel mostra esses números. Pedidos cancelados não entram.',
        },
        {
          q: 'Como vejo os totais só do iFood (ou de outro canal)?',
          a: 'Depois de pesquisar, clique na fatia do canal no anel, à esquerda dos totais, ou escolha no seletor Canal da barra de filtros (ao lado do Pesquisar). Os 12 totais, a tabela, o Só divergências e o Exportar passam a ser só daquele canal, e a barra de totais avisa: Totais só de iFood · 230 de 410 pedidos. Clique no meio do anel (ver todos) ou escolha Todos os canais no seletor para ver a pesquisa inteira.',
        },
        {
          q: 'Os totais não mudaram quando filtrei. Está certo?',
          a: 'Depende do filtro. O canal (anel ou seletor Canal) muda os totais: eles passam a ser só do canal escolhido. Já o Só divergências, o clique num indicador, a busca e os filtros de coluna (o funil de cada coluna) mudam só a tabela de pedidos. Para ver a soma de outro recorte, exporte o Excel: a aba Fechamento diário soma só os pedidos que estão na tabela.',
        },
        {
          q: 'Por que a consulta demora?',
          a: 'A API do DW monta os pedidos na hora, com pagamentos e descontos. Um dia sai em 2 a 3 segundos; 31 dias de uma loja movimentada levam de 25 a 30 segundos. Se passar de 90 segundos, a tela avisa e pede um período menor.',
        },
        {
          q: 'Por que o período é limitado a 31 dias?',
          a: 'Acima disso a API do DW passa do tempo limite e a consulta falha. Para fechar meses inteiros, pesquise um mês por vez e exporte cada um.',
        },
        {
          q: 'Mudei as datas, mas a tabela continua igual. Por quê?',
          a: 'A tela mostra sempre a última pesquisa. Depois de mudar a loja ou as datas, clique em Pesquisar de novo. Se o botão estiver desativado, é porque a loja e as datas são as mesmas da pesquisa na tela.',
        },
      ],
    },
    {
      category: 'Permissões',
      items: [
        {
          q: 'Por que não vejo o botão Exportar?',
          a: 'A exportação exige a permissão `fechamento-maestro.exportar`. Com apenas `fechamento-maestro.ler` você consulta o fechamento na tela, mas não baixa a planilha. Peça a permissão ao gestor do seu grupo.',
        },
        {
          q: 'Por que vejo o CPF, o e-mail e o telefone com asteriscos (***)?',
          a: 'Porque você não tem a permissão "Ver os dados pessoais completos do cliente" (fechamento-maestro.ver-dados-cliente). Sem ela, CPF, e-mail, telefone, número e referência do endereço chegam mascarados. O nome do cliente e o nome da rua continuam visíveis. Se o seu trabalho exige os dados completos, peça a permissão ao gestor do seu grupo.',
        },
        {
          q: 'Por que minha loja não aparece no seletor?',
          a: 'O seletor lista todas as lojas com CNPJ do seu escopo de Empresas no portal. Escritórios, centros de distribuição e outros lugares sem CNPJ próprio ficam de fora. Se a sua loja tem CNPJ e mesmo assim não aparece, ela não está no seu escopo — peça ao gestor para conferir.',
        },
      ],
    },
    {
      category: 'Erros comuns',
      items: [
        {
          q: 'A tela mostrou "Não foi possível consultar os dados". O que faço?',
          a: 'Leia a mensagem abaixo do título: ela diz o motivo. "Demorou demais" pede um período menor. "A API de delivery respondeu 5xx" é instabilidade da API do DW, e "Não foi possível ler o cadastro de formas de pagamento" é falha no banco do Maestro; nos dois casos, clique em Tentar de novo em alguns minutos. Mensagem de credencial ou integração (403/503) é com o administrador do portal.',
        },
        {
          q: 'A pesquisa voltou sem nenhum pedido. Está certo?',
          a: 'Pode estar: a loja pode não ter tido delivery no período. Se você esperava pedidos, confira as datas e a loja. Se mesmo assim nada aparecer, avise o suporte informando loja e período.',
        },
        {
          q: 'Apareceu "A loja não tem número de loja no cadastro". O que faço?',
          a: 'A API de delivery identifica a loja pelo número (ex.: "01"). Ele vem do vínculo da Empresa com a BI do Simphony ou, na falta, do começo do nome (ex.: "01.CB GOIANIA"). Se a Empresa não tem nenhum dos dois, não há como buscar os pedidos dela — peça ao time do Portal GIA para completar o cadastro.',
        },
      ],
    },
  ],
}
