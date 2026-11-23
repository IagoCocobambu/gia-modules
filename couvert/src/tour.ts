import { defineTour } from '@gia-cb/sdk/modules'

export const tour = defineTour({
  module_id: 'couvert',
  steps: [
    {
      id: 'filtros',
      screen: '/couvert',
      target: '[data-tour="couvert-filtros"]',
      title: 'Loja e salão',
      body: 'Escolha a **loja** e o **RVC** (o salão) e clique em **Pesquisar**. A tela lembra a última loja e o último salão que você pesquisou. No celular, a barra se recolhe ao pesquisar; a seta abre de novo.',
      placement: 'bottom',
    },
    {
      id: 'mesas',
      screen: '/couvert',
      target: '[data-tour="couvert-conteudo"]',
      title: 'Uma mesa por card',
      body: 'Cada mesa aberta mostra o **couvert artístico** lançado (a nota musical), a **mesa** com o número de **pessoas** e o **buffet** (a tampa de travessa). Toque no card para ver a conta da mesa. Card **amarelo**: nenhum couvert lançado. **Vermelho**: couvert diferente das pessoas, com o selo da diferença (−2, +1). Mesa sem pessoas lançadas fica **neutra**, com o selo "sem pessoas".',
      placement: 'top',
    },
    {
      id: 'chips',
      screen: '/couvert',
      target: '[data-tour="couvert-conteudo"]',
      title: 'Filtrar e conferir de novo',
      body: 'Os **chips** acima das mesas contam e filtram: **Divergentes**, **Sem lançamento**, **Sem pessoas**, **Tudo lançado**. Busque pela **mesa** ou ordene por **Atenção** para ver primeiro o que precisa de ajuste. Depois de corrigir no PDV, clique em **Atualizar** — as mesas não mudam sozinhas. **Exportar** baixa a planilha das mesas da tela.',
      placement: 'top',
    },
  ],
})
