import { defineTour } from '@gia-cb/sdk/modules'

export const tour = defineTour({
  module_id: 'fechamento-maestro',
  steps: [
    {
      id: 'filtros',
      screen: '/fechamento-maestro',
      target: '[data-tour="fechamento-maestro-filtros"]',
      title: 'Loja e período',
      body: 'Escolha a **loja** e as **datas** (no máximo 31 dias, sem datas futuras). As datas começam em *ontem*.',
      placement: 'bottom',
    },
    {
      id: 'pesquisar',
      screen: '/fechamento-maestro',
      target: '[data-tour="fechamento-maestro-pesquisar"]',
      title: 'Pesquisar',
      body: 'Busca os pedidos de delivery da loja no Maestro e concilia os pagamentos de cada um. Períodos longos levam alguns segundos — até ~30 s para 31 dias.',
      placement: 'bottom',
    },
    {
      id: 'visao',
      screen: '/fechamento-maestro',
      target: '[data-tour="fechamento-maestro-visao"]',
      title: 'Por dia ou por pedido',
      body: '**Por dia** é o fechamento: o total pago de cada dia dividido em **Online**, **Adquirentes** e **Offline**, com a linha **Total** no fim. **Pedidos** mostra a conciliação de cada pedido. Clique num dia para ver só os pedidos dele.',
      placement: 'bottom',
    },
    {
      id: 'totais',
      screen: '/fechamento-maestro',
      target: '[data-tour="fechamento-maestro-totais-toggle"]',
      title: 'Totais do período',
      body: 'Abre e fecha os cards com o total pago, Online, Adquirentes, Offline, descontos e quantos pedidos têm **divergência**. Pedidos cancelados ficam fora dos valores.',
      placement: 'bottom',
    },
    {
      id: 'toolbar',
      screen: '/fechamento-maestro',
      target: '[data-tour="fechamento-maestro-toolbar"]',
      title: 'Busca, colunas e Excel',
      body: 'Busque, escolha as **colunas** visíveis e **exporte** em Excel (com a permissão de exportação). O arquivo traz 3 abas: fechamento diário, pedidos e cancelados.',
      placement: 'bottom',
    },
    {
      id: 'frame',
      screen: '/fechamento-maestro',
      target: '[data-tour="fechamento-maestro-frame"]',
      title: 'Divergências',
      body: 'Na visão **Pedidos**, linhas com fundo vermelho têm divergência. Use **Só divergências** para ver só elas e clique num pedido para ver cada forma de pagamento, o grupo em que caiu e o motivo da divergência.',
      placement: 'top',
    },
  ],
})
