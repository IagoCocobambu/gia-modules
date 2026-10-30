import type { ModuleFaq } from '@gia-cb/sdk/modules'

export const faq: ModuleFaq = {
  summary:
    'O **Reports Maestro** lista, para uma loja e um período, todos os **pedidos de delivery** que passaram pelo Maestro — App Coco Bambu, iFood, 99Food e pedidos manuais — com número do pedido, cliente, endereço, quem confirmou ou cancelou, status, valores e formas de pagamento. Os dados vêm da API do DW na hora da pesquisa; nada é gravado no portal. Quem tem a permissão de exportação baixa o resultado em Excel.',
  sections: [
    {
      id: 'primeiros-passos',
      title: 'Primeiros passos',
      content: `
## Consultando os pedidos

1. Escolha a **Loja** no seletor (dá para digitar parte do nome). A primeira loja
   da lista já vem selecionada.
2. Informe a **Data inicial** e a **Data final** — as duas começam em *ontem*.
3. Clique em **Pesquisar**.

A tabela mostra **uma linha por pedido**, na ordem de criação.

## Cards de totais

O botão **Totais**, no cabeçalho da tabela (ao lado de Filtros), abre e fecha,
acima da tabela, **4 cards** com a soma, em R$, dos pedidos do período **nos
status e nas origens marcados** nos filtros (todos, se nada estiver marcado). Os
cards começam **abertos** em telas com 700 px de altura ou mais e **fechados** em
telas mais baixas (para sobrar espaço para a tabela); com eles abertos o botão
fica preenchido. O botão só
funciona depois da primeira pesquisa, e a escolha de aberto/fechado vale até
você sair da tela (pesquisar de novo não fecha os cards):

| Card | Soma da coluna |
|---|---|
| **Valor pedido** | *Valor pedido* — subtotal, sem a taxa de entrega |
| **Valor entrega** | *Valor entrega* — taxas de entrega |
| **Total pago** | *Total pago* — pagamentos recebidos |
| **Desconto total** | *Desconto total* — descontos concedidos |

A busca e os filtros de coluna da tabela **não** mudam os totais — só os filtros
de status e de origem mudam. Enquanto a pesquisa carrega, os cards mostram uma
barra cinza piscando no lugar do valor. Para somar outro recorte (por exemplo,
só uma forma de pagamento), filtre a tabela e exporte: a linha **Total** do
Excel soma só o que foi exportado.

## Filtro de status

O botão **Filtros**, no cabeçalho da tabela (ao lado de Totais), abre uma
janela no meio da tela (no celular, em tela cheia) com os filtros de status e de
origem. Marque quantos botões quiser: **nada muda na tabela enquanto você
marca**. O filtro só vale quando você clica em **Ver N pedidos**, no rodapé — o
*N* já mostra quantos pedidos vão sobrar com o que está marcado. **Limpar
filtros** desmarca tudo na janela (clique em *Ver N pedidos* depois para
aplicar). Fechar pelo **X**, com um clique fora ou com **Esc** **descarta** o
que você marcou e deixa a tabela como estava. O botão só funciona depois da
primeira pesquisa.

A janela tem duas listas lado a lado (no celular, uma embaixo da outra). A
primeira é **Status**: um botão arredondado por status, cada um com a
**quantidade de pedidos** à direita. Só aparecem os status que existem nos
pedidos pesquisados — por exemplo, se nenhum pedido do período foi cancelado,
não há botão *Cancelados*:

| Botão | Conta |
|---|---|
| **Todos** | todos os pedidos |
| **Recebidos** | status *Recebido* |
| **Confirmados** | status *Confirmado* |
| **Embalados** | status *Embalado* |
| **Despachados** | status *Despachado* |
| **Em rota** | status *Em rota* |
| **A caminho** | status *A caminho* |
| **Entregues** | status *Entregue* |
| **Concluídos** | status *Concluído* |
| **Não entregues** | status *Não entregue* |
| **Retornando** | status *Retornando* |
| **Retornados** | status *Retornado* |
| **Cancelados** | status *Cancelado* |

Os botões seguem a ordem da vida do pedido, e a cor do ícone mostra a fase
(veja *O que cada coluna mostra → Status do pedido*). Se a API trouxer um
status fora desta lista, ele ganha um botão no fim, com o próprio nome (e *Sem
status* para pedido sem status).

## Filtro de origem

Ao lado fica a lista **Origem**, que funciona igual: um botão
só para cada canal que tem pedido na pesquisa (ex.: *99Food*, *App Coco Bambu*, *iFood*,
*Pedido manual*), em ordem alfabética, cada um com a quantidade de pedidos.
Pedido sem origem aparece em *Sem origem*. Os nomes são os mesmos que o Maestro
usa — a coluna **Origem** da tabela mostra o mesmo nome num badge colorido por
canal: *iFood* em rosa, *99Food* em âmbar, *App Coco Bambu* em azul e *Pedido
manual* em cinza. Um canal novo que o Maestro passe a mandar aparece só com
contorno, sem cor.

## Como os dois filtros funcionam

- **Marque os botões e clique em Ver N pedidos** — o botão marcado fica
  preenchido com a cor de destaque. Dá para marcar **mais de um** na mesma
  barra (ex.: *Entregues* + *Concluídos*, para ver só o que chegou ao cliente).
- Clique de novo num botão marcado para desmarcar, ou em **Todos** para limpar
  aquela barra. Uma nova pesquisa limpa as duas.
- **Depois de aplicar, o filtro fica valendo.** Com algo aplicado, o botão
  **Filtros** mostra quantos estão marcados (ex.: *Filtros 2*) — é o aviso de que
  a tabela, os totais e o Excel estão filtrados. Para tirar, abra de novo,
  clique em **Limpar filtros** e depois em **Ver N pedidos**.
- Os dois filtros **se somam**: marcar *Cancelados* e *iFood* mostra só os
  pedidos cancelados do iFood.
- **As quantidades de uma barra seguem a outra.** Com *iFood* marcado na origem,
  os botões de status contam só os pedidos do iFood (e vice-versa) — e os status
  que o iFood não tem **somem** da lista enquanto *iFood* estiver marcado.
  Marcar um botão **não** muda as quantidades da própria barra.
- Botão já marcado que ficou com **0** pela outra barra continua aparecendo, para
  você poder desmarcar.

Os filtros valem para a **tabela**, para os **cards de totais** e para o **Excel
exportado**. A busca e os filtros de coluna da tabela continuam funcionando por
cima deles.

## Limites do período

- As datas **não podem ser futuras**.
- A data final **não pode ser menor** que a inicial.
- O intervalo é de **no máximo 31 dias**.

Períodos longos demoram: 31 dias de uma loja movimentada levam cerca de 25 a 30
segundos. Enquanto carrega, o botão **Pesquisar** fica girando — não precisa
clicar de novo.

Se você mudar a loja ou as datas depois de pesquisar, a tabela continua mostrando
a pesquisa anterior até você clicar em **Pesquisar** de novo. Se nada mudou, o
botão fica desativado: o resultado na tela já é desta pesquisa.
      `,
    },
    {
      id: 'colunas',
      title: 'O que cada coluna mostra',
      content: `
As colunas são as mesmas do relatório antigo (UniGUI), na mesma ordem:

| Coluna | O que é |
|---|---|
| **Loja** | nome da loja no Maestro |
| **ID** | identificador único do pedido no Maestro |
| **Nº pedido** | número exibido ao cliente e à operação |
| **Data criação** | quando o pedido foi criado (horário de São Paulo) |
| **Data ação** | data e hora da ação registrada no pedido (horário de São Paulo) |
| **Nº parceiro** | identificador do pedido no parceiro (iFood, 99Food); vazio nos pedidos do app e manuais |
| **Nº conta** | número da conta (check) gerada no Simphony para o pedido |
| **CPF / Nome / Email / Tel. cliente** | dados do cliente informados no pedido |
| **Qtd pedidos** | quantos pedidos esse cliente já fez na plataforma |
| **Rua / Núm. / Referência** | endereço de entrega (na retirada vem *TAKEOUT* / *RETIRADA*) |
| **Retirada** | *SIM* quando o pedido é retirada na loja; *NÃO* quando é delivery |
| **Confirmado por / Cancelado por** | usuário que confirmou ou cancelou o pedido |
| **Origem** | canal: App Coco Bambu, iFood, 99Food ou Pedido manual |
| **Status pedido** | situação atual (ver abaixo) |
| **Valor pedido** | subtotal do pedido, sem a taxa de entrega |
| **Valor entrega** | taxa de entrega aplicada ao pedido |
| **Total pago** | soma dos pagamentos do pedido |
| **Desconto total** | soma dos descontos do pedido |
| **Forma pgto** | formas de pagamento e o valor de cada uma, ex.: *PIX - PRE PAGO (112.92)* |
| **Descontos** | descrição de cada desconto e o valor, ex.: *Desconto Taxa iFood (3.99)* |

## Status do pedido

É o **último status conhecido** do pedido no Maestro. A tela mostra o nome em
português; o **Excel** traz o valor original do Maestro (como no relatório
antigo):

| Na tela | No Excel | Fase (cor) |
|---|---|---|
| **Recebido** | *RECEIVED* | antes de sair da loja (azul) |
| **Confirmado** | *CONFIRMED* | antes de sair da loja (azul) — veja quem confirmou em *Confirmado por* |
| **Embalado** | *PACKED* | antes de sair da loja (azul) |
| **Despachado** | *DISPATCHED* | em trânsito (amarelo) |
| **Em rota** | *ON_ROUTE* | em trânsito (amarelo) |
| **A caminho** | *GOING_TO_DESTINATION* | em trânsito (amarelo) |
| **Entregue** | *DELIVERED* | entregue (verde) |
| **Concluído** | *COMPLETED* | entregue (verde) |
| **Não entregue** | *ORDER_NOT_DELIVERED* | não entregue / retorno (rosa) |
| **Retornando** | *RETURN_TO_ORIGIN* | não entregue / retorno (rosa) — voltando para a loja |
| **Retornado** | *RETURNED* | não entregue / retorno (rosa) — já voltou para a loja |
| **Cancelado** | *CANCELLED* | cancelado (vermelho) — veja quem cancelou em *Cancelado por* |

A cor do status na tabela (e do ícone no filtro) indica a fase; o nome e o ícone
diferenciam os status dentro dela. Status que não estiver nesta lista aparece em
cinza, com o nome que veio do Maestro. A busca e o filtro da coluna *Status
pedido* usam o nome em português (digite "cancelado", não "CANCELLED").

Pedidos cancelados **entram** na lista, nos cards de totais e nos totais do
Excel, como no relatório antigo. Para tirá-los da soma, marque no filtro de
status todos os status que têm pedidos, **menos** *Cancelados*: a tabela, os
totais e o Excel passam a ignorar os cancelados.
      `,
    },
    {
      id: 'tabela',
      title: 'Buscando, filtrando e escolhendo colunas',
      content: `
## Busca

O campo de busca no topo da tabela procura em **todas as colunas** de uma vez:
digite o número do pedido, parte do nome do cliente, o CPF ou uma forma de
pagamento.

## Filtros e ordenação

Clique no cabeçalho de uma coluna para **ordenar**. O ícone de funil de cada
coluna abre o **filtro** daquela coluna. A busca e os filtros também valem para o
Excel exportado.

## Colunas visíveis

São 26 colunas. Use o botão de **colunas** da barra da tabela para esconder as que
você não precisa. A escolha vale até você recarregar a página.

## No celular

No celular cada pedido vira um **cartão** com número, data, status e total pago;
toque em **ver mais** para abrir os outros campos. A busca funciona igual.
      `,
    },
    {
      id: 'exportar',
      title: 'Exportando para Excel',
      content: `
Com a permissão de exportação, o botão **Exportar** da barra da tabela baixa um
arquivo **.xlsx** com:

- **o que está filtrado na tela** — busca e filtros de coluna valem para o arquivo;
- as **26 colunas** do relatório, mesmo as que você escondeu na tela;
- valores em R$ e datas como data do Excel (dá para somar e ordenar);
- uma linha **Total** no fim, que soma só as linhas visíveis se você filtrar no
  próprio Excel.

O nome do arquivo segue o padrão do portal:
*GIA - Reports Maestro - &lt;loja&gt; - &lt;período&gt;.xlsx*.

O relatório antigo exportava CSV; o Excel traz as mesmas colunas já formatadas.
      `,
    },
    {
      id: 'origem-dos-dados',
      title: 'De onde vêm os dados',
      content: `
Os pedidos vêm da **API do DW** (\`api-dw.cocobambu.com\`, consulta *Delivery*), que
lê o Maestro. A cada **Pesquisar** o portal busca os dados na hora — não há cópia
guardada no portal.

A loja é identificada pelo **número no começo do nome** da Empresa no cadastro do
portal: *01.CB GOIANIA* consulta a loja **01** no Maestro. Por isso só aparecem no
seletor as lojas cujo nome começa com um número seguido de ponto.

O resultado de uma pesquisa fica guardado por **30 minutos**: pesquisar de novo a
mesma loja e o mesmo período nesse prazo mostra o resultado na hora. Para
buscar dados atualizados antes disso, recarregue a página (F5) e pesquise de novo.

O seletor mostra só as lojas do **seu escopo** de Empresas no portal. O servidor
confere isso de novo a cada pesquisa.
      `,
    },
  ],
  qa: [
    {
      category: 'Operações',
      items: [
        {
          q: 'Por que a consulta demora?',
          a: 'A API do DW monta os pedidos na hora, com pagamentos e descontos. Um dia sai em 2 a 3 segundos; 31 dias de uma loja movimentada levam de 25 a 30 segundos. Se passar de 90 segundos, a tela avisa e pede um período menor.',
        },
        {
          q: 'Por que o período é limitado a 31 dias?',
          a: 'Acima disso a API do DW passa do tempo limite e a consulta falha (no relatório antigo ela simplesmente não voltava). Para meses inteiros, pesquise um mês por vez e exporte cada um.',
        },
        {
          q: 'Pedidos cancelados entram no total?',
          a: 'Entram, como no relatório antigo: sem nenhum status marcado no filtro de status, a lista e os cards de totais trazem todos os pedidos do período. Para somar só os válidos, marque no filtro de status todos os status que aparecem, menos Cancelados, e clique em "Ver N pedidos" — a tabela, os cards de totais e o Excel exportado passam a deixar os cancelados de fora.',
        },
        {
          q: 'Onde estão os filtros de status e de origem?',
          a: 'Clique no botão Filtros, no cabeçalho da tabela, ao lado de Totais. Ele abre uma janela no meio da tela com os dois filtros. Marque os botões e clique em "Ver N pedidos" para aplicar. O botão fica desativado até você fazer a primeira pesquisa.',
        },
        {
          q: 'Marquei um status e a tabela não mudou. Por quê?',
          a: 'O filtro só vale quando você clica em "Ver N pedidos", no rodapé da janela — o N mostra quantos pedidos vão sobrar com o que está marcado. Se você fechar a janela pelo X, com um clique fora ou com Esc, o que marcou é descartado e a tabela fica como estava.',
        },
        {
          q: 'Fechei a janela de filtros e a tabela continua filtrada. Por quê?',
          a: 'Um filtro aplicado em "Ver N pedidos" continua valendo para a tabela, os totais e o Excel depois que a janela fecha. O número ao lado de "Filtros" mostra quantos estão marcados. Para tirar, abra de novo, clique em "Limpar filtros" e depois em "Ver N pedidos" — ou faça uma nova pesquisa.',
        },
        {
          q: 'Onde estão os totais em R$?',
          a: 'Clique no botão Totais, no cabeçalho da tabela, ao lado de Exportar. Ele abre, acima da tabela, os cards com a soma de Valor pedido, Valor entrega, Total pago e Desconto total; clique de novo para fechar. Os cards já começam abertos em telas com 700 px de altura ou mais e fechados em telas mais baixas (como celular deitado ou notebook pequeno), e o botão fica desativado até você fazer a primeira pesquisa.',
        },
        {
          q: 'Filtrei a tabela, mas os cards de totais não mudaram. Por quê?',
          a: 'Os cards de totais só acompanham os filtros de status e de origem. A busca e os filtros de coluna da tabela servem para achar pedidos e não mudam os cards. Para ver a soma só do que está filtrado na tabela, exporte: a linha Total do Excel soma as linhas exportadas.',
        },
        {
          q: 'Marquei um status e as quantidades dos outros botões de status não mudaram. Está certo?',
          a: 'Está: marcar um botão não muda as quantidades da própria barra, para você ver o quadro todo enquanto filtra. O que muda são as quantidades da OUTRA barra (marcar iFood faz os status contarem só os pedidos do iFood) e, depois de "Ver N pedidos", a tabela, os cards de totais e o Excel. Para desmarcar, clique de novo no botão marcado ou em "Todos".',
        },
        {
          q: 'Por que um status (ou uma origem) não aparece no filtro?',
          a: 'O filtro só mostra o que existe nos pedidos pesquisados. Se nenhum pedido do período tem aquele status, não há botão para ele. E a outra barra também conta: com iFood marcado na origem, somem os status que nenhum pedido do iFood tem (e vice-versa). Desmarque a outra barra para ver todos de novo.',
        },
        {
          q: 'Os cards de totais batem com o Excel?',
          a: 'Batem quando você exporta sem busca nem filtro de coluna na tabela: o Excel traz os pedidos dos status e origens marcados nos filtros (todos, se nada estiver marcado), e a linha Total soma as mesmas colunas (Valor pedido, Valor entrega, Total pago e Desconto total), arredondadas em centavos.',
        },
        {
          q: 'Qual a diferença entre "Valor pedido" e "Total pago"?',
          a: 'Valor pedido é o subtotal do pedido, sem a taxa de entrega (que fica em "Valor entrega"). Total pago é a soma dos pagamentos do pedido — os mesmos que aparecem, com o valor de cada um, na coluna "Forma pgto".',
        },
        {
          q: 'Mudei as datas, mas a tabela continua igual. Por quê?',
          a: 'A tabela mostra sempre a última pesquisa. Depois de mudar a loja ou as datas, clique em Pesquisar de novo. Se o botão estiver desativado, é porque os filtros são os mesmos da pesquisa na tela.',
        },
      ],
    },
    {
      category: 'Permissões',
      items: [
        {
          q: 'Por que não vejo o botão Exportar?',
          a: 'A exportação exige a permissão `reports-maestro.exportar`. Com apenas `reports-maestro.ler` você consulta os pedidos na tela, mas não baixa a planilha. Peça a permissão ao gestor do seu grupo.',
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
