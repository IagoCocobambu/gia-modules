import { definePermissions } from '@gia-cb/sdk/permissions'

// groupPath monta a árvore do editor de Grupos/Papéis. Convenção do portal:
// TODAS as permissões do módulo compartilham UM groupPath — `['Couvert']` ou
// `['Área', 'Couvert']`. A AÇÃO (ler/exportar) fica na `description`, NÃO num
// nível de grupo — assim o nó agrega (2/2) em vez de virar dois "1/1". Máx. 2
// níveis (o `gia validate` avisa se passar).
export const couvertPermissions = definePermissions({
  moduleId: 'couvert',
  permissions: [
    {
      key: 'couvert.ler',
      description: 'Visualizar a lista de países de Couvert',
      groupPath: ['Couvert'],
    },
    {
      key: 'couvert.exportar',
      description: 'Exportar a lista de países em CSV',
      groupPath: ['Couvert'],
    },
  ],
})
