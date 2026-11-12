import { defineTour } from '@gia-cb/sdk/modules'

export const tour = defineTour({
  module_id: 'fechamento-ifood-diario',
  steps: [
    {
      id: 'filtros',
      screen: '/fechamento-ifood-diario',
      target: '[data-tour="fechamento-ifood-diario-filtros"]',
      title: 'Loja e dia',
      body: 'Escolha a **loja** e o **dia** do fechamento (já vem com *ontem*, sem datas futuras). A pesquisa junta **todas as operações da loja** (Coco Bambu, Express, Pizzaria, Vasto…); a marcada *Sem iFood* não tem restaurante do iFood no cadastro.',
      placement: 'bottom',
    },
    {
      id: 'pesquisar',
      screen: '/fechamento-ifood-diario',
      target: '[data-tour="fechamento-ifood-diario-pesquisar"]',
      title: 'Pesquisar',
      body: 'Busca os pedidos do dia e as vendas de cada restaurante da loja no iFood ao mesmo tempo. O **andamento** aparece numa faixa acima da tabela (com **Cancelar**), e os pedidos entram na tabela conforme chegam — os que ainda esperam o iFood ficam apagados, com o selo *Aguardando iFood*. Em loja grande pode levar até 1 minuto. No celular, a barra se recolhe depois da pesquisa; a seta do cabeçalho reabre.',
      placement: 'bottom',
    },
    {
      id: 'totais',
      screen: '/fechamento-ifood-diario',
      target: '[data-tour="fechamento-ifood-diario-totais"]',
      title: 'Cards do dia',
      body: 'Mostra e esconde os **cards** do fechamento. À vista ficam iFood online, iFood adquirentes, desconto copart e pagamentos sem classificação; os descontos e o valor sem classificação ficam em **Ver todos os totais**. **Clique num card para filtrar a tabela** pelos pedidos que entram nele. Os valores saem quando a consulta termina.',
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
