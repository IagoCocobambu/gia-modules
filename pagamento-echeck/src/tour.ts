import { defineTour } from '@gia-cb/sdk/modules'

export const tour = defineTour({
  module_id: 'pagamento-echeck',
  steps: [
    {
      id: 'filtros',
      screen: '/pagamento-echeck',
      target: '[data-tour="pagamento-echeck-filtros"]',
      title: 'Loja e período',
      body: 'Escolha a **loja** e as **datas** (no máximo 31 dias, sem datas futuras). As datas começam em *ontem*.',
      placement: 'bottom',
    },
    {
      id: 'horario',
      screen: '/pagamento-echeck',
      target: '[data-tour="pagamento-echeck-horario"]',
      title: 'Faixa de horário',
      body: 'A **hora inicial** vale para a data inicial e a **hora final**, para a data final — a pesquisa pega tudo entre esses dois momentos, não um horário de cada dia. Por padrão, das 08:00 às 23:59.',
      placement: 'bottom',
    },
    {
      id: 'pesquisar',
      screen: '/pagamento-echeck',
      target: '[data-tour="pagamento-echeck-pesquisar"]',
      title: 'Pesquisar',
      body: 'Busca as transações eCheck da loja na API do DW. Um mês de uma loja movimentada leva cerca de 10 segundos.',
      placement: 'bottom',
    },
    {
      id: 'resumo',
      screen: '/pagamento-echeck',
      target: '[data-tour="pagamento-echeck-totais"]',
      title: 'Totais',
      body: 'Abre e fecha a **barra de totais** da pesquisa: valor total, transações, ticket médio, aprovadas e não aprovadas. Passe o mouse num indicador para ver a conta e **clique nele para filtrar a tabela** só pelas transações que entram nele; clique de novo (ou no botão com o nome dele) para ver todas.',
      placement: 'bottom',
    },
    {
      id: 'graficos',
      screen: '/pagamento-echeck',
      target: '[data-tour="pagamento-echeck-graficos"]',
      title: 'Gráficos',
      body: 'Abre o **volume de vendas por hora** e os **métodos de pagamento** (parte de cada modalidade no total). Passe o mouse ou toque numa barra ou modalidade para ver os números dela.',
      placement: 'bottom',
    },
    {
      id: 'toolbar',
      screen: '/pagamento-echeck',
      target: '[data-tour="pagamento-echeck-toolbar"]',
      title: 'Colunas e Excel',
      body: 'Ligue as **colunas** que começam desligadas (códigos, terminal, conta, mesa...) e **exporte** em Excel (com a permissão de exportação). Para filtrar, use o funil de cada coluna; no celular há um campo de busca.',
      placement: 'bottom',
    },
  ],
})
