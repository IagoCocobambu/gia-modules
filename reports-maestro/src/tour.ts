import { defineTour } from '@gia-cb/sdk/modules'

export const tour = defineTour({
  module_id: 'reports-maestro',
  steps: [
    {
      id: 'filtros',
      screen: '/reports-maestro',
      target: '[data-tour="reports-maestro-filtros"]',
      title: 'Loja e período',
      body: 'Escolha a **loja** e as **datas** (no máximo 31 dias, sem datas futuras). As datas começam em *ontem*.',
      placement: 'bottom',
    },
    {
      id: 'pesquisar',
      screen: '/reports-maestro',
      target: '[data-tour="reports-maestro-pesquisar"]',
      title: 'Pesquisar',
      body: 'Busca os pedidos de delivery da loja no Maestro. Períodos longos levam alguns segundos — até ~45 s para 31 dias. Ao terminar, a tabela mostra os pedidos e os botões **Filtros** e **Totais** do cabeçalho da tabela passam a funcionar.',
      placement: 'bottom',
    },
    {
      id: 'abas',
      screen: '/reports-maestro',
      target: '[data-tour="reports-maestro-abas"]',
      title: 'Operacional e Pedidos',
      body: '**Operacional** é a aba em que a tela abre: o dashboard da loja e do período — quanto tempo o pedido leva dentro da loja (aceite, preparo, expedição), em que dias e horários trava e quem cancela. **Pedidos** é a lista, pedido a pedido; os próximos passos mostram essa lista. As duas abas usam a mesma busca: trocar de aba não pesquisa de novo (31 dias levam até ~45 s).',
      placement: 'bottom',
    },
    {
      id: 'filtros-status-origem',
      screen: '/reports-maestro',
      target: '[data-tour="reports-maestro-filtros-toggle"]',
      title: 'Filtros de status e origem',
      body: 'Clique em **Filtros** para abrir uma janela com os botões de **status** e de **origem** que existem nos pedidos pesquisados. Marque o que quiser (dá para combinar os dois) e clique em **Ver N pedidos** para filtrar a tabela, os totais e o Excel — antes disso nada muda. Depois de aplicado, o número no botão mostra quantos estão marcados.',
      placement: 'bottom',
    },
    {
      id: 'totais',
      screen: '/reports-maestro',
      target: '[data-tour="reports-maestro-totais-toggle"]',
      title: 'Totais em R$',
      body: 'Depois de pesquisar, clique em **Totais** para abrir, acima da tabela, a barra com a soma de Valor pedido, Valor entrega, Total pago e Desconto total (passe o mouse num total para ver a conta). Clique de novo para fechar. Os totais seguem os filtros de status e de origem.',
      placement: 'bottom',
    },
    {
      id: 'toolbar',
      screen: '/reports-maestro',
      target: '[data-tour="reports-maestro-toolbar"]',
      title: 'Busca, colunas e Excel',
      body: 'Filtre pelo cabeçalho de cada coluna (no celular, busque por pedido, cliente ou forma de pagamento), escolha as **colunas** visíveis e **exporte** em Excel (com a permissão de exportação). Tipo de entrega, parceiro, taxas e incentivos começam **ocultos** — mostre pelo botão de colunas; no Excel eles vão sempre.',
      placement: 'bottom',
    },
    {
      id: 'frame',
      screen: '/reports-maestro',
      target: '[data-tour="reports-maestro-frame"]',
      title: 'Pedidos',
      body: 'Uma linha por pedido, com cliente, status, valores e formas de pagamento. Sem a permissão de ver dados do cliente, CPF, e-mail, telefone e número do endereço aparecem com **\\*\\*\\*** — a busca encontra só a parte à vista; procure pelo nome do cliente. O Excel exportado traz uma linha **Total** que soma só as linhas exportadas.',
      placement: 'top',
    },
  ],
})
