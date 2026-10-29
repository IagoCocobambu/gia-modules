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
      body: 'Busca os pedidos de delivery da loja no Maestro. Períodos longos levam alguns segundos — até ~30 s para 31 dias.',
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
      title: 'Pedidos e totais',
      body: 'Uma linha por pedido. A linha **Total**, logo abaixo dos cabeçalhos, soma valores, entrega, total pago e descontos do que está filtrado.',
      placement: 'top',
    },
  ],
})
