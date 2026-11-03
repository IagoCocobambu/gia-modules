import type { ModuleFaq } from '@gia-cb/sdk/modules'

export const faq: ModuleFaq = {
  summary:
    'O **Fechamento Maestro** monta o fechamento diário dos **pedidos de delivery** de uma loja num período: soma o que foi pago em cada dia e divide em **Online** (pago no app ou no parceiro), **Adquirentes** (cartão na maquininha na entrega) e **Offline** (dinheiro). Também confere cada pedido — se as formas de pagamento somam o total pago e se os descontos somam o desconto total — e aponta as **divergências**. Os dados vêm da API do DW na hora da pesquisa; nada é gravado no portal.',
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

A tela mostra, de cima para baixo:

- a **barra de totais** do período inteiro;
- a **tabela de pedidos**: uma linha por pedido, com quanto dele foi Online,
  Adquirentes e Offline e o resultado dos dois checks. **Clique num pedido** para
  abrir o detalhe da conciliação.

Para ver os valores de um dia só, pesquise com a **data inicial e a final iguais**
àquele dia. O fechamento somado dia a dia de um período está na aba
**Fechamento diário** do Excel.

## Só divergências

O botão **Só divergências** mostra apenas os pedidos (não
cancelados) com algum check **Divergente**. O número no botão é quantos pedidos
do período têm divergência — em vermelho quando há algum. Clique de novo para
voltar a ver todos. Nas linhas da tabela, pedido com divergência fica com o
fundo levemente vermelho.

## Totais do período

O botão **Totais** abre e fecha, acima da tabela, uma **barra de indicadores**
do período inteiro. Cada indicador tem um ícone, o **valor** em destaque e o
nome embaixo. Os indicadores ocupam a largura toda, em colunas iguais: 6 por
linha em telas largas, 4 ou 3 em telas médias e 2 no celular.

As cores ajudam a ler de relance: os grupos de pagamento têm cada um a sua cor;
**Cancelado** fica vermelho quando há valor cancelado e **sem classificação**
fica amarelo quando há valor — o normal é zero. Passe o mouse sobre um
indicador (ou chegue nele com Tab) para ver a explicação da conta.

Os indicadores, na ordem:

| Indicador | O que soma |
|---|---|
| **Total pago** | total pago dos pedidos não cancelados |
| **Online** | parte paga online (app, iFood) |
| **Adquirentes** | parte paga com cartão na maquininha, na entrega |
| **Offline** | parte paga em dinheiro |
| **Cancelado** | total pago dos pedidos **cancelados** |
| **Cancelado online / adquirentes / offline** | o valor cancelado dividido pelos mesmos três grupos |
| **Descontos loja** | parte do desconto bancada pela loja: desconto total menos o incentivo do parceiro |
| **Descontos parceiro** | parte do desconto bancada pelo parceiro (ex.: iFood) — o *incentivo parceiro* do pedido |
| **Sem classificação** (valor) | valor em formas de pagamento que a regra não reconheceu (o normal é zero) |
| **Pagamentos sem classificação** | quantas formas de pagamento ficaram sem classificação |

Total pago = Online + Adquirentes + Offline + Sem classificação. Descontos loja
+ Descontos parceiro = desconto total dos pedidos não cancelados.

Quando há **pagamento sem classificação**, o último indicador fica **vermelho**:
clique nele para ver a lista, agrupada pelo nome da forma de pagamento, com o
valor e os pedidos de cada uma. Clique num pedido da lista para abrir o detalhe.
Sem nenhum, ele mostra **0** em verde.

A barra fica **aberta** em telas com 700 px de altura ou mais e **fechada** em
telas mais baixas, para sobrar espaço para a tabela — e acompanha a janela se
você mudar o tamanho dela. Depois que você clica em **Totais**, vale a sua
escolha até recarregar a página. A barra mostra sempre o período inteiro — o
*Só divergências* e a busca não mudam os totais.

## Dashboard — vendas por canal

O botão **Dashboard** abre, numa janela, o gráfico **Vendas por canal**: um anel
com a fatia de cada **origem** do pedido (App Coco Bambu, iFood, 99Food, Pedido
manual...) no **total pago** do período. No meio do anel fica o **total** — o
mesmo *Total pago* da barra de totais — e quantos pedidos entraram nele.

Ao lado (embaixo, no celular) fica a **legenda**: cada canal com a cor, o valor
pago e a porcentagem do total, do maior para o menor. As cores são as mesmas das
etiquetas da coluna *Origem* da tabela.

- Passe o mouse sobre uma **fatia** ou uma **linha da legenda** para destacar o
  canal: o meio do anel passa a mostrar o valor, a porcentagem e os pedidos dele.
- No celular, **toque** na linha da legenda para destacar; toque de novo para
  voltar ao total.

Como nos totais, entram só os pedidos **não cancelados**, e o gráfico mostra o
período inteiro da pesquisa — o *Só divergências* e a busca não mudam o
dashboard. Pedido sem origem informada pela API aparece como **Sem origem**.

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
## Formas de pagamento → Online, Adquirentes, Offline

Cada pedido traz as formas de pagamento num texto como
*PIX ONLINE PIX - PRE PAGO (144.9), BENEFICIO IFOOD ENTREGA - PRE PAGO (4.31)*.
O módulo separa cada forma com o seu valor e classifica pelo nome, nesta ordem
(a primeira regra que servir vale):

| Grupo | Quando | Exemplos |
|---|---|---|
| **Offline** | dinheiro recebido na entrega | *CASH OFFLINE* |
| **Online** | pago antes, no app ou no parceiro — o nome tem *PRE PAGO* ou *ONLINE* | *PIX - PRE PAGO*, *CREDIT ONLINE VISA - PRE PAGO*, *APPLE_PAY - PRE PAGO*, *BENEFICIO IFOOD - PRE PAGO*, *Wallet - Apple Pay - PRE PAGO* |
| **Adquirentes** | cartão ou voucher passado na maquininha na entrega | *CREDIT OFFLINE*, *DEBIT OFFLINE*, *Master - Débito* |
| **Não classificado** | nenhuma das regras acima | uma forma nova que o Maestro passe a mandar |

Os benefícios do iFood (*BENEFICIO IFOOD...*) contam como **Online**: são pagos
pelo iFood, não pelo cliente na entrega.

A regra é fixa no módulo — não há cadastro de classificações. Se aparecer uma
forma **Não classificado**, o pedido fica divergente; avise o time GIA para a
regra ganhar essa forma.

## Os dois checks

Cada pedido passa por dois checks:

| Check | Fica **OK** quando | Fica **Divergente** quando |
|---|---|---|
| **Check pagamentos** | todas as formas têm valor e classificação, e a soma delas é igual ao **Total pago** | alguma forma está *Não classificado* ou sem valor, ou a soma não bate com o total pago |
| **Check descontos** | a soma dos descontos listados é igual ao **Desconto total** | a soma não bate, ou algum desconto veio sem valor |

A comparação é **centavo a centavo** — não há tolerância. O detalhe do pedido
(clique na linha) mostra o motivo exato de cada divergência, por exemplo
*Soma das formas de pagamento (R$ 120,00) diferente do total pago (R$ 125,00)*.

## Venda concluída

Um pedido é **venda concluída** quando o status é *Entregue* (DELIVERED) ou
*Concluído* (COMPLETED). A coluna *Venda concluída* e o Excel mostram isso;
pedidos ainda em rota (por exemplo, *Despachado*) entram no fechamento
normalmente, só não aparecem como concluídos.

## Pedidos cancelados

Pedidos **cancelados** aparecem na tabela de pedidos, mas ficam **fora dos
valores de venda** do fechamento (total pago, Online, Adquirentes, Offline,
descontos, sem classificação) e da contagem de divergências. O que foi cancelado
tem indicadores próprios: **Cancelado** e a divisão dele em online, adquirentes e
offline. No Excel eles vão numa aba à parte.

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

| Coluna | O que é |
|---|---|
| **Nº pedido** | número exibido ao cliente e à operação |
| **Data criação** | quando o pedido foi criado (horário de São Paulo) |
| **Origem** | canal: App Coco Bambu, iFood, iFood Vasto, 99Food ou Pedido manual |
| **Status pedido** | situação atual do pedido no Maestro, em português |
| **Check pagamentos / Check descontos** | **OK** ou **Divergente** (veja *Como a conciliação funciona*) |
| **Total pago** | soma dos pagamentos do pedido, como veio do Maestro |
| **Online / Adquirentes / Offline / Não classificado** | quanto de cada grupo há no pedido |
| **Desconto total** | soma dos descontos do pedido, como veio do Maestro |
| **Valor pedido / Valor entrega** | subtotal e taxa de entrega |
| **Incentivo parceiro** | parte do desconto bancada pelo parceiro (ex.: iFood) |
| **Venda concluída** | *Sim* quando o status é Entregue ou Concluído |
| **Forma pgto / Descontos** | o texto original do Maestro, com o valor de cada item |
| **Cliente / Tipo entrega** | nome do cliente e se a entrega é própria |

## Busca, ordenação e colunas

O campo de busca procura em todas as colunas da tabela de pedidos. Clique no
cabeçalho de uma coluna para **ordenar**; o funil abre o **filtro** da coluna.
O botão de **colunas** esconde as que você não precisa (vale até recarregar a
página).

## No celular

Os totais ficam em duas colunas; o indicador de pagamentos sem classificação
abre a lista com um toque. A tabela de pedidos vira **cartões** com número, data, total pago e o check de
pagamentos: toque em **ver mais** para os outros campos, e no cartão para abrir
o detalhe. Todos os botões funcionam igual ao computador.
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
soma esses mesmos pedidos por dia; sem nenhum filtro, a soma dela bate com os
totais do período.

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
que lê o Maestro — a mesma fonte do **Reports Maestro**. A cada **Pesquisar** o
portal busca os dados na hora e faz a conciliação; nada é gravado no portal e
nenhum banco de dados é consultado.

A loja é identificada pelo **número no começo do nome** da Empresa no cadastro do
portal: *01.CB GOIANIA* consulta a loja **01** no Maestro. Por isso só aparecem no
seletor as lojas cujo nome começa com um número seguido de ponto.

O resultado de uma pesquisa fica guardado por **30 minutos**: pesquisar de novo a
mesma loja e o mesmo período nesse prazo mostra o resultado na hora. Para buscar
dados atualizados antes disso, recarregue a página (F5) e pesquise de novo.

O seletor mostra só as lojas do **seu escopo** de Empresas no portal. O servidor
confere isso de novo a cada pesquisa.
      `,
    },
  ],
  qa: [
    {
      category: 'Conciliação',
      items: [
        {
          q: 'O que significa um pedido "Divergente"?',
          a: 'Que a conta do pedido não fechou: ou a soma das formas de pagamento é diferente do total pago, ou alguma forma não foi reconhecida (Não classificado), ou a soma dos descontos é diferente do desconto total. Clique no pedido para ver o motivo exato e os valores de cada item.',
        },
        {
          q: 'Apareceu valor em "Não classificado". O que faço?',
          a: 'É uma forma de pagamento que a regra do módulo ainda não conhece — o Maestro passou a mandar um nome novo. Abra o pedido, anote o nome da forma e avise o time GIA para incluí-la na regra (Online, Adquirentes ou Offline). Até lá, o valor fica fora dos três grupos, mas continua no total pago.',
        },
        {
          q: 'Por que os benefícios do iFood contam como Online?',
          a: 'Porque não são pagos pelo cliente na entrega: o iFood banca o valor e repassa à loja, como um pagamento online. Eles vêm com "PRE PAGO" no nome (ex.: BENEFICIO IFOOD ENTREGA - PRE PAGO), e tudo que é pré-pago conta como Online.',
        },
        {
          q: 'Qual a diferença entre Adquirentes e Offline?',
          a: 'Os dois são pagos na entrega. Adquirentes é cartão ou voucher passado na maquininha (CREDIT OFFLINE, DEBIT OFFLINE, Master - Débito) — o dinheiro chega pela adquirente. Offline é dinheiro em espécie (CASH OFFLINE), que o entregador traz para a loja.',
        },
        {
          q: 'Posso cadastrar ou mudar a classificação de uma forma de pagamento?',
          a: 'Não pela tela. A classificação é uma regra fixa do módulo, aplicada ao nome que o Maestro manda, e não há cadastro de classificações como no sistema antigo. Para mudar ou incluir uma forma, peça ao time GIA — a mudança sai numa nova versão do módulo e vale para todas as lojas.',
        },
        {
          q: 'Pedidos cancelados entram no fechamento?',
          a: 'Não nos valores de venda. Eles aparecem na tabela de pedidos, mas ficam fora do total pago, de Online, Adquirentes, Offline, dos descontos e da contagem de divergências. O valor cancelado aparece nos indicadores Cancelado, Cancelado online, Cancelado adquirentes e Cancelado offline. No Excel vão numa aba Cancelados à parte.',
        },
        {
          q: 'Como os descontos são divididos entre loja e parceiro?',
          a: 'Cada pedido traz o desconto total e o incentivo do parceiro (a parte que o iFood ou outro parceiro banca). Descontos parceiro soma esse incentivo; Descontos loja é o desconto total menos o incentivo. Os dois juntos dão o desconto total dos pedidos não cancelados.',
        },
        {
          q: 'O indicador "Pagamentos sem classificação" ficou vermelho. O que faço?',
          a: 'Clique nele para ver as formas de pagamento que a regra não reconheceu, com o valor e os pedidos de cada uma. Anote o nome da forma e avise o time GIA para incluí-la em Online, Adquirentes ou Offline. Até lá, o valor aparece em Valor sem classificação e o pedido fica divergente.',
        },
        {
          q: 'Um pedido entregue depois da meia-noite cai em qual dia?',
          a: 'No dia em que foi criado. O fechamento usa a data de criação do pedido, no horário de São Paulo: um pedido feito às 23h50 do dia 10 e entregue no dia 11 entra no fechamento do dia 10.',
        },
        {
          q: 'O que é "Venda concluída"?',
          a: 'É Sim quando o pedido está com status Entregue (DELIVERED) ou Concluído (COMPLETED). Pedidos ainda despachados ou a caminho entram no fechamento do mesmo jeito; a coluna só indica se o Maestro já registrou a entrega.',
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
          a: 'Total pago fica verde e cada grupo de pagamento (Online, Adquirentes, Offline) tem a sua cor. Os indicadores de alerta só ganham cor quando há algo a olhar: Cancelado fica vermelho quando há valor cancelado, Sem classificação fica amarelo quando há valor e Pagamentos sem classificação fica vermelho (e vira botão) quando há algum. Passe o mouse sobre um indicador para ver a explicação da conta. Para esconder a barra, clique no botão Totais.',
        },
        {
          q: 'Quanto cada canal (iFood, app, 99Food) vendeu no período?',
          a: 'Clique em Dashboard. O gráfico Vendas por canal mostra a fatia de cada origem no total pago, com o valor e a porcentagem na legenda. Passe o mouse (ou toque, no celular) num canal para ver também quantos pedidos ele teve. Pedidos cancelados não entram.',
        },
        {
          q: 'O total do dashboard é diferente do total pago da barra de totais. Por quê?',
          a: 'Não deveria ser: os dois somam o total pago dos pedidos não cancelados do período inteiro. Se a pesquisa ainda estiver carregando, espere terminar. Se a diferença continuar, avise o suporte informando a loja e o período.',
        },
        {
          q: 'Os totais não mudaram quando filtrei. Está certo?',
          a: 'Está. Os totais mostram sempre o período inteiro da pesquisa. O Só divergências e a busca mudam só a tabela de pedidos. Para ver a soma de um recorte, exporte o Excel: a aba Fechamento diário soma só os pedidos que estão na tabela.',
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
          q: 'Por que minha loja não aparece no seletor?',
          a: 'O seletor lista só as lojas do seu escopo de Empresas no portal e, entre elas, só as que têm o número no começo do nome (ex.: "01.CB GOIANIA"). Se a loja é sua e não aparece, peça ao administrador para conferir seu escopo ou o nome da Empresa no cadastro.',
        },
      ],
    },
    {
      category: 'Erros comuns',
      items: [
        {
          q: 'A tela mostrou "Não foi possível consultar os dados". O que faço?',
          a: 'Leia a mensagem abaixo do título: ela diz o motivo. "Demorou demais" pede um período menor. "A API de delivery respondeu 5xx" é instabilidade da API do DW; clique em Tentar de novo em alguns minutos. Mensagem de credencial ou integração (403/503) é com o administrador do portal.',
        },
        {
          q: 'A pesquisa voltou sem nenhum pedido. Está certo?',
          a: 'Pode estar: a loja pode não ter tido delivery no período. Se você esperava pedidos, confira as datas e a loja. Se mesmo assim nada aparecer, avise o suporte informando loja e período.',
        },
      ],
    },
  ],
}
