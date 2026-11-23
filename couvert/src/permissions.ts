import { definePermissions } from '@gia-cb/sdk/permissions'

// Um groupPath para todas as permissões do módulo (máx. 2 níveis): Simphony › Couvert.
export const couvertPermissions = definePermissions({
  moduleId: 'couvert',
  permissions: [
    {
      key: 'couvert.ler',
      description: 'Consultar as mesas abertas e o couvert artístico lançado em cada uma',
      groupPath: ['Simphony', 'Couvert'],
    },
    {
      key: 'couvert.exportar',
      // Reservada: a tela não tem Exportar (saiu em 23/11/2026). O `gia validate` exige uma
      // chave de ação além da `.ler` — ver docs/questionamentos-sdk/Q-03.
      description: 'Reservada — hoje não libera nada na tela (não precisa atribuir)',
      groupPath: ['Simphony', 'Couvert'],
    },
  ],
})
