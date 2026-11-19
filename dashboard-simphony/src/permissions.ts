import { definePermissions } from '@gia-cb/sdk/permissions'

// groupPath monta a árvore do editor de Grupos/Papéis. Convenção do portal:
// TODAS as permissões do módulo compartilham UM groupPath — `['Dashboard Simphony']` ou
// `['Área', 'Dashboard Simphony']`. A AÇÃO (ler/exportar) fica na `description`, NÃO num
// nível de grupo — assim o nó agrega (2/2) em vez de virar dois "1/1". Máx. 2
// níveis (o `gia validate` avisa se passar).
export const dashboardSimphonyPermissions = definePermissions({
  moduleId: 'dashboard-simphony',
  permissions: [
    {
      key: 'dashboard-simphony.ler',
      description: 'Visualizar a lista de países de Dashboard Simphony',
      groupPath: ['Dashboard Simphony'],
    },
    {
      key: 'dashboard-simphony.exportar',
      description: 'Exportar a lista de países em CSV',
      groupPath: ['Dashboard Simphony'],
    },
  ],
})
