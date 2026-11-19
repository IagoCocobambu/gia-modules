import { defineTour } from '@gia-cb/sdk/modules'

export const tour = defineTour({
  module_id: 'dashboard-simphony',
  steps: [
    {
      id: 'frame',
      screen: '/dashboard-simphony',
      target: '[data-tour="dashboard-simphony-frame"]',
      title: 'Lista de países',
      body: 'Estes dados vêm de uma **API pública externa** (Banco Mundial), carregados por um handler server-side do módulo. Em telas largas, os botões `<` `>` nas laterais expandem a largura.',
      placement: 'bottom',
    },
    {
      id: 'busca',
      screen: '/dashboard-simphony',
      target: '[data-tour="dashboard-simphony-toolbar"]',
      title: 'Busca em tempo real',
      body: 'Filtre por **país, região ou capital** enquanto digita. Os filtros por coluna (ícone de funil) aceitam operadores (igual, contém, vazio…).',
      placement: 'bottom',
    },
    {
      id: 'exportar',
      screen: '/dashboard-simphony',
      target: '[data-tour="dashboard-simphony-toolbar"]',
      title: 'Exportar em CSV',
      body: 'O botão de exportar baixa a lista atual em CSV — respeitando a busca/filtro aplicado. Aparece só com a permissão `dashboard-simphony.exportar`.',
      placement: 'bottom',
    },
  ],
})
