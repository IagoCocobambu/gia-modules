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
      body: 'Busca os pedidos de delivery da loja no Maestro. Períodos longos levam alguns segundos — até ~30 s para 31 dias. Ao terminar, a tabela mostra os pedidos e os botões **Filtros** e **Totais** do cabeçalho da tabela passam a funcionar.',
      placement: 'bottom',
    },
    {
      id: 'filtros-status-origem',
      screen: '/reports-maestro',
      target: '[data-tour="reports-maestro-filtros-toggle"]',
      title: 'Filtros de status e origem',
      body: 'Clique em **Filtros** para abrir os botões de **status** e de **origem** — eles filtram a tabela, os totais e o Excel, e dá para combinar os dois. Fechar o painel não tira o filtro: o número no botão mostra quantos estão marcados.',
      placement: 'bottom',
    },
    {
      id: 'totais',
      screen: '/reports-maestro',
      target: '[data-tour="reports-maestro-totais-toggle"]',
      title: 'Totais em R$',
      body: 'Depois de pesquisar, clique em **Totais** para abrir os cards com a soma de Valor pedido, Valor entrega, Total pago e Desconto total. Clique de novo para fechar. Os totais seguem os filtros de status e de origem.',
      placement: 'bottom',
    },
    {
      id: 'toolbar',
      screen: '/reports-maestro',
      target: '[data-tour="reports-maestro-toolbar"]',
      title: 'Busca, colunas e Excel',
      body: 'Busque por pedido, cliente ou forma de pagamento, escolha as **colunas** visíveis e **exporte** em Excel (com a permissão de exportação).',
      placement: 'bottom',
    },
    {
      id: 'frame',
      screen: '/reports-maestro',
      target: '[data-tour="reports-maestro-frame"]',
      title: 'Pedidos',
      body: 'Uma linha por pedido, com cliente, status, valores e formas de pagamento. O Excel exportado traz uma linha **Total** que soma só as linhas exportadas.',
      placement: 'top',
    },
  ],
})
