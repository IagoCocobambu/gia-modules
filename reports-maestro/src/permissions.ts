import { definePermissions } from '@gia-cb/sdk/permissions'

// groupPath monta a árvore do editor de Grupos/Papéis. Convenção do portal:
// TODAS as permissões do módulo compartilham UM groupPath — `['Reports Maestro']` ou
// `['Área', 'Reports Maestro']`. A AÇÃO (ler/exportar) fica na `description`, NÃO num
// nível de grupo — assim o nó agrega (2/2) em vez de virar dois "1/1". Máx. 2
// níveis (o `gia validate` avisa se passar).
export const reportsMaestroPermissions = definePermissions({
  moduleId: 'reports-maestro',
  permissions: [
    {
      key: 'reports-maestro.ler',
      description: 'Consultar os pedidos de delivery do Maestro das lojas do seu escopo',
      groupPath: ['Reports Maestro'],
    },
    {
      key: 'reports-maestro.exportar',
      description: 'Exportar os pedidos de delivery em Excel (.xlsx)',
      groupPath: ['Reports Maestro'],
    },
  ],
})
