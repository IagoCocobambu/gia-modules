import { defineTour } from '@gia-cb/sdk/modules'

export const tour = defineTour({
  module_id: 'meu-modulo',
  steps: [
    {
      id: 'loja',
      screen: '/meu-modulo',
      target: '[data-tour="meu-modulo-loja"]',
      title: 'Escolha a loja',
      body: 'Meu Modulo trabalha **por loja** — cada loja tem o próprio conjunto de itens. Use o seletor (com busca) pra trocar entre lojas.',
      placement: 'bottom',
    },
    {
      id: 'actions',
      screen: '/meu-modulo',
      target: '[data-tour="meu-modulo-actions"]',
      title: 'Sincronizar, histórico e exportar',
      body: '**Sincronizar** dispara a coleta dos itens da loja selecionada. **Histórico** mostra todas as execuções anteriores. **Exportar** gera um CSV com as linhas filtradas. Os botões aparecem conforme suas permissões (`meu-modulo.sincronizar`, `meu-modulo.exportar`).',
      placement: 'bottom',
    },
    {
      id: 'toolbar',
      screen: '/meu-modulo',
      target: '[data-tour="meu-modulo-toolbar"]',
      title: 'Busca e filtros',
      body: 'Use a busca em tempo real pra filtrar pela coluna que quiser. Os filtros por coluna (ícone de funil) aceitam operadores (igual, contém, vazio, etc).',
      placement: 'bottom',
    },
  ],
})
