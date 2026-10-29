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

A tabela mostra **uma linha por pedido**, na ordem de criação. Logo abaixo dos
cabeçalhos fica a linha **Total**, com a soma de *Valor pedido*, *Valor entrega*,
*Total pago* e *Desconto total* de tudo o que está filtrado na tabela.

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

É o **último status conhecido** do pedido no Maestro:

| Status | Significado |
|---|---|
| **CONFIRMED** | confirmado — veja quem confirmou em *Confirmado por* |
| **DISPATCHED** | despachado |
| **CANCELLED** | cancelado — veja quem cancelou em *Cancelado por* |

Pedidos cancelados **entram** na lista e nos totais, como no relatório antigo. Para
tirá-los da soma, filtre a coluna *Status pedido*.
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
coluna abre o **filtro** daquela coluna. A linha **Total** recalcula sozinha a cada
busca ou filtro.

## Colunas visíveis

São 26 colunas. Use o botão de **colunas** da barra da tabela para esconder as que
você não precisa. A escolha vale até você recarregar a página.

## No celular

No celular cada pedido vira um **cartão** com número, data, status e total pago;
toque em **ver mais** para abrir os outros campos. A busca funciona igual. A
linha Total não aparece nos cartões: o total pago do período fica no subtítulo,
acima da lista.
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
          a: 'Entram, como no relatório antigo: a lista traz todos os pedidos do período. Para somar só os válidos, filtre a coluna "Status pedido" e deixe de fora o CANCELLED — a linha Total recalcula na hora.',
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
