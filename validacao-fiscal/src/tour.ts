import { defineTour } from '@gia-cb/sdk/modules'

export const tour = defineTour({
  module_id: 'validacao-fiscal',
  steps: [
    {
      id: 'filtros',
      screen: '/validacao-fiscal',
      target: '[data-tour="validacao-fiscal-filtros"]',
      title: 'Loja e período',
      body: 'Escolha a **loja** e as **datas** (no máximo 31 dias, sem datas futuras). As datas começam em *ontem*.',
      placement: 'bottom',
    },
    {
      id: 'janelas',
      screen: '/validacao-fiscal',
      target: '[data-tour="validacao-fiscal-janelas"]',
      title: 'Janelas de tempo',
      body: 'A nota é ligada à conta se foi emitida até **12 h antes** ou **12 h depois** do fechamento. Para mudar (de 0 a 24 h), clique no **cadeado**.',
      placement: 'bottom',
    },
    {
      id: 'pesquisar',
      screen: '/validacao-fiscal',
      target: '[data-tour="validacao-fiscal-pesquisar"]',
      title: 'Pesquisar',
      body: 'Busca as contas do PDV e as notas fiscais e faz o cruzamento. Mudou um filtro? Clique de novo.',
      placement: 'bottom',
    },
    {
      id: 'toolbar',
      screen: '/validacao-fiscal',
      target: '[data-tour="validacao-fiscal-toolbar"]',
      title: 'Status e Excel',
      body: 'Filtre por **status** (com quantidade e R$) e **exporte** o resultado em Excel.',
      placement: 'bottom',
    },
    {
      id: 'frame',
      screen: '/validacao-fiscal',
      target: '[data-tour="validacao-fiscal-frame"]',
      title: 'Detalhe de cada linha',
      body: 'Clique numa linha para ver a conta, a nota principal e as duplicadas. Dúvidas sobre os status? Abra a **FAQ**.',
      placement: 'top',
    },
  ],
})
