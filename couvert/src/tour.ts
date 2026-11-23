import { defineTour } from '@gia-cb/sdk/modules'

// Os passos das mesas apontam para elementos que só existem com mesas na tela: o SDK
// espera em silêncio até o alvo aparecer.
export const tour = defineTour({
  module_id: 'couvert',
  steps: [
    {
      id: 'filtros',
      screen: '/couvert',
      target: '[data-tour="couvert-filtros"]',
      title: 'Loja e salão',
      body: 'Escolha a **loja** e o **RVC** (o salão) e clique em **Pesquisar**: o tour continua quando as mesas aparecerem. A tela abre com a loja 01 já escolhida, se ela está liberada para você. No celular, a barra se recolhe ao pesquisar; a seta abre de novo.',
      placement: 'bottom',
    },
    {
      id: 'mesas',
      screen: '/couvert',
      target: '[data-tour="couvert-mesa"]',
      title: 'Uma mesa por card',
      body: 'Cada card é uma mesa aberta: mostra o **couvert artístico** lançado (a nota musical), a **mesa** com o número de **pessoas** e o **buffet** (a tampa de travessa). Toque no card para ver a conta da mesa. Quadrinho **amarelo**: nada lançado. **Vermelho**: lançado diferente das pessoas, com o selo da diferença (−2, +1). Mesa com 0 pessoas leva o selo "sem pessoas": **neutra** sem lançamento, **vermelha** se já tem couvert ou buffet.',
      placement: 'bottom',
    },
    {
      id: 'chips',
      screen: '/couvert',
      target: '[data-tour="couvert-chips"]',
      title: 'Filtrar e conferir de novo',
      body: 'Os **chips** acima das mesas (no celular, uma **lista**) contam e filtram: **Divergentes**, **Sem lançamento**, **Sem pessoas**, **Tudo lançado**. Busque pela **mesa** ou ordene por **Atenção** para ver primeiro o que precisa de ajuste. Depois de corrigir no PDV, clique em **Atualizar** — as mesas não mudam sozinhas.',
      placement: 'bottom',
    },
  ],
})
