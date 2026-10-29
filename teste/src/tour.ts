import { defineTour } from '@gia-cb/sdk/modules'

export const tour = defineTour({
  module_id: 'teste',
  steps: [
    {
      id: 'loja',
      screen: '/teste',
      target: '[data-tour="teste-loja"]',
      title: 'Escolha a loja',
      body: 'Teste trabalha **por loja** — cada loja tem o próprio conjunto de itens. Use o seletor (com busca) pra trocar entre lojas.',
      placement: 'bottom',
    },
    {
      id: 'actions',
      screen: '/teste',
      target: '[data-tour="teste-actions"]',
      title: 'Sincronizar, histórico e exportar',
      body: '**Sincronizar** dispara a coleta dos itens da loja selecionada. **Histórico** mostra todas as execuções anteriores. **Exportar** gera um CSV com as linhas filtradas. Os botões aparecem conforme suas permissões (`teste.sincronizar`, `teste.exportar`).',
      placement: 'bottom',
    },
    {
      id: 'toolbar',
      screen: '/teste',
      target: '[data-tour="teste-toolbar"]',
      title: 'Busca e filtros',
      body: 'Use a busca em tempo real pra filtrar pela coluna que quiser. Os filtros por coluna (ícone de funil) aceitam operadores (igual, contém, vazio, etc).',
      placement: 'bottom',
    },
  ],
})
