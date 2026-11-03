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
      id: 'totais',
      screen: '/fechamento-maestro',
      target: '[data-tour="fechamento-maestro-totais-toggle"]',
      title: 'Totais do período',
      body: 'Abre e fecha a barra de totais do período: total pago dividido em **Online**, **Adquirentes** e **Offline**, o que foi **cancelado** (com a mesma divisão), os descontos da **loja** e do **parceiro** e o que ficou **sem classificação**. Passe o mouse num indicador para ver a conta; se o de pagamentos sem classificação ficar vermelho, clique nele para ver a lista.',
      placement: 'bottom',
    },
    {
      id: 'dashboard',
      screen: '/fechamento-maestro',
      target: '[data-tour="fechamento-maestro-dashboard"]',
      title: 'Dashboard',
      body: 'Abre o gráfico de **vendas por canal**: quanto do total pago veio de cada origem (App Coco Bambu, iFood, 99Food...), em valor e em porcentagem. Passe o mouse num canal para ver os números dele.',
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
      body: 'Na tabela de pedidos, linhas com fundo vermelho têm divergência. Use **Só divergências** para ver só elas e clique num pedido para ver cada forma de pagamento, o grupo em que caiu e o motivo da divergência.',
      placement: 'top',
    },
  ],
})
