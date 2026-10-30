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

A tela abre na visão **Por dia**: uma linha por dia do período, com a linha
**Total** no fim.

## As duas visões

Os botões **Por dia** e **Pedidos**, no cabeçalho da tabela, trocam a visão:

- **Por dia** — o fechamento. Cada linha soma os pedidos criados naquele dia.
  **Clique numa linha** para abrir a visão Pedidos já filtrada naquele dia.
- **Pedidos** — uma linha por pedido, com quanto dele foi Online, Adquirentes e
  Offline e o resultado dos dois checks. **Clique num pedido** para abrir o
  detalhe da conciliação.

Na visão Pedidos, quando um dia está filtrado, aparece um botão com a data e um
**X**: clique nele para voltar a ver todos os dias.

## Só divergências

Na visão Pedidos, o botão **Só divergências** mostra apenas os pedidos (não
cancelados) com algum check **Divergente**. O número no botão é quantos pedidos
do período têm divergência — em vermelho quando há algum. Clique de novo para
voltar a ver todos. Nas linhas da tabela, pedido com divergência fica com o
fundo levemente vermelho.

## Cards de totais

O botão **Totais** abre e fecha, acima da tabela, os cards do período inteiro:

| Card | O que soma |
|---|---|
| **Total pago** | total pago dos pedidos não cancelados |
| **Online** | parte paga online (app, iFood) |
| **Adquirentes** | parte paga com cartão na maquininha, na entrega |
| **Offline** | parte paga em dinheiro |
| **Descontos** | desconto total dos pedidos não cancelados |
| **Pedidos com divergência** | quantos pedidos não cancelados têm algum check divergente |

Os cards começam **abertos** em telas com 700 px de altura ou mais e
**fechados** em telas mais baixas. Eles mostram sempre o período inteiro — o
filtro de dia, o *Só divergências* e a busca não mudam os cards.

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

Pedidos **cancelados** aparecem na visão Pedidos e contam nas colunas *Pedidos*
e *Cancelados* da visão por dia, mas ficam **fora de todos os valores** do
fechamento (total pago, Online, Adquirentes, Offline, descontos) e da contagem
de divergências. No Excel eles vão numa aba à parte.

## Em que dia o pedido cai

O dia do fechamento é a **data de criação** do pedido, no horário de São Paulo.
Um pedido criado às 23h50 do dia 10 e entregue no dia 11 entra no dia **10**.
      `,
    },
    {
      id: 'colunas',
      title: 'O que cada coluna mostra',
      content: `
## Visão Por dia

| Coluna | O que é |
|---|---|
| **Data** | dia do fechamento (data de criação dos pedidos) |
| **Pedidos** | quantos pedidos foram criados no dia, inclusive cancelados |
| **Cancelados** | quantos desses foram cancelados |
| **Total pago** | soma do total pago dos pedidos não cancelados |
| **Online / Adquirentes / Offline** | o total pago dividido pelos três grupos |
| **Não classificado** | valor em formas que a regra não reconheceu (deveria ser zero) |
| **Descontos** | soma do desconto total |
| **Valor pedido / Valor entrega** | subtotal dos pedidos (sem entrega) e taxas de entrega |
| **Divergências** | quantos pedidos do dia têm algum check divergente |

A linha **Total**, no fim da tabela, soma os dias que estão na tabela (se você
buscar, soma só os dias que sobraram).

## Visão Pedidos

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

O campo de busca procura em todas as colunas da visão aberta. Clique no
cabeçalho de uma coluna para **ordenar**; o funil abre o **filtro** da coluna.
O botão de **colunas** esconde as que você não precisa (vale até recarregar a
página).

## No celular

As duas visões viram **cartões**: o dia mostra data, total pago e divergências;
o pedido mostra número, data, total pago e o check de pagamentos. Toque em
**ver mais** para os outros campos, e no cartão para abrir o detalhe (no pedido)
ou os pedidos do dia (no dia). Todos os botões funcionam igual ao computador.
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

O que vai para o arquivo segue a tela:

- na visão **Por dia**, os pedidos dos dias que estão na tabela (se você buscar,
  só dos dias que sobraram);
- na visão **Pedidos**, os pedidos que estão na tabela — com o filtro de dia, o
  *Só divergências*, a busca e os filtros de coluna.

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
          a: 'Não nos valores. Eles contam nas colunas Pedidos e Cancelados da visão por dia e aparecem na visão Pedidos, mas ficam fora do total pago, de Online, Adquirentes, Offline, dos descontos e da contagem de divergências. No Excel vão numa aba Cancelados à parte.',
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
          q: 'Como vejo os pedidos de um dia específico?',
          a: 'Na visão Por dia, clique na linha do dia (no celular, no cartão). A tela troca para a visão Pedidos já filtrada naquele dia. Para voltar a ver todos os dias, clique no botão com a data e o X, no cabeçalho da tabela.',
        },
        {
          q: 'Os cards de totais não mudaram quando filtrei. Está certo?',
          a: 'Está. Os cards mostram sempre o período inteiro da pesquisa (sem cancelados). O filtro de dia, o Só divergências e a busca mudam só a tabela. Para ver a soma de um recorte, use a linha Total da visão por dia ou exporte o Excel.',
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
