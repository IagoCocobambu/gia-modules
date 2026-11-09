import { defineTour } from '@gia-cb/sdk/modules'

export const tour = defineTour({
  module_id: 'fechamento-ifood-diario',
  steps: [
    {
      id: 'filtros',
      screen: '/fechamento-ifood-diario',
      target: '[data-tour="fechamento-ifood-diario-filtros"]',
      title: 'Loja e dia',
      body: 'Escolha a **loja** e o **dia** do fechamento (já vem com *ontem*, sem datas futuras). O seletor lista todas as operações do seu escopo; a marcada *Sem iFood* não tem a integração com o iFood no cadastro.',
      placement: 'bottom',
    },
    {
      id: 'pesquisar',
      screen: '/fechamento-ifood-diario',
      target: '[data-tour="fechamento-ifood-diario-pesquisar"]',
      title: 'Pesquisar',
      body: 'Busca os pedidos do dia no DW, cruza com as vendas da API financeira do iFood e classifica as formas de pagamento. No celular, a barra se recolhe depois da pesquisa; a seta do cabeçalho reabre.',
      placement: 'bottom',
    },
    {
      id: 'totais',
      screen: '/fechamento-ifood-diario',
      target: '[data-tour="fechamento-ifood-diario-totais"]',
      title: 'Cards do dia',
      body: 'Mostra e esconde os **cards** do fechamento: iFood online, iFood adquirentes, descontos da loja e do iFood, desconto copart e o que ficou sem classificação. **Clique num card para filtrar a tabela** pelos pedidos que entram nele.',
      placement: 'bottom',
    },
    {
      id: 'toolbar',
      screen: '/fechamento-ifood-diario',
      target: '[data-tour="fechamento-ifood-diario-toolbar"]',
      title: 'Colunas e Excel',
      body: 'Ligue as **colunas** de cancelamento e contestação, que começam desligadas, e **exporte** em Excel (com a permissão de exportação): aba Resumo com os cards e aba Pedidos.',
      placement: 'bottom',
    },
  ],
})
