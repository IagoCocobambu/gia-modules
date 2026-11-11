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
      id: 'canais',
      screen: '/fechamento-maestro',
      target: '[data-tour="fechamento-maestro-totais-canais"]',
      title: 'Vendas por canal',
      body: 'Depois de pesquisar, o **anel** mostra quanto do total pago veio de cada canal (iFood, App Coco Bambu, 99Food...). No meio, o **total pago** e quantos pedidos entraram. Passe o mouse numa fatia para ver o canal, o valor, a porcentagem e os pedidos. **Clique numa fatia** para os totais, a tabela e o Excel passarem a ser só daquele canal; clique no **meio do anel** (*ver todos*) para voltar a todos.',
      placement: 'right',
    },
    {
      id: 'indicadores',
      screen: '/fechamento-maestro',
      target: '[data-tour="fechamento-maestro-totais-indicadores"]',
      title: 'Totais do fechamento',
      body: 'À vista, os grupos de pagamento: **Online**, **Adquirentes online**, **Adquirentes offline** e **Offline**. Em **Ver todos os totais** abrem os **cancelados**, os **descontos** da loja e do parceiro e o que ficou **sem classificação** (o normal é zero; o vermelho pede atenção). Passe o mouse num indicador para ver a conta e **clique nele para filtrar a tabela** só pelos pedidos daquele total; clique de novo para tirar o filtro.',
      placement: 'bottom',
    },
    {
      id: 'totais',
      screen: '/fechamento-maestro',
      target: '[data-tour="fechamento-maestro-totais-toggle"]',
      title: 'Mostrar e esconder os totais',
      body: 'O botão **Totais** abre e fecha a seção de canais e totais, para dar mais espaço à tabela. Em telas baixas e no celular ela começa fechada.',
      placement: 'bottom',
    },
    {
      id: 'toolbar',
      screen: '/fechamento-maestro',
      target: '[data-tour="fechamento-maestro-toolbar"]',
      title: 'Colunas e Excel',
      body: 'Ligue as **colunas** que começam desligadas (valores por grupo, checks, endereço...) e **exporte** em Excel (com a permissão de exportação). O arquivo traz 3 abas: fechamento diário, pedidos e cancelados. Para ver só um canal (iFood, App...), clique na fatia dele no anel da seção de totais ou escolha no seletor **Canal** da barra de filtros, ao lado do Pesquisar. Para filtrar só a tabela, use o funil de cada coluna; no celular há um campo de busca.',
      placement: 'bottom',
    },
    {
      id: 'frame',
      screen: '/fechamento-maestro',
      target: '[data-tour="fechamento-maestro-divergencias"]',
      title: 'Divergências',
      body: 'Na tabela de pedidos, linhas com fundo vermelho têm divergência. Use **Só divergências** para ver só elas e clique num pedido para ver cada forma de pagamento, o grupo em que caiu e o motivo da divergência.',
      placement: 'bottom',
    },
  ],
})
