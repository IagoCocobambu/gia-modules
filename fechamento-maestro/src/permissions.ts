import { definePermissions } from '@gia-cb/sdk/permissions'

// groupPath monta a árvore do editor de Grupos/Papéis. Convenção do portal:
// TODAS as permissões do módulo compartilham UM groupPath. A AÇÃO (ler/exportar)
// fica na `description`, NÃO num nível de grupo — assim o nó agrega (2/2).
export const fechamentoMaestroPermissions = definePermissions({
  moduleId: 'fechamento-maestro',
  permissions: [
    {
      key: 'fechamento-maestro.ler',
      description:
        'Consultar o fechamento e a conciliação dos pedidos de delivery do Maestro das lojas do seu escopo',
      groupPath: ['Fechamento Maestro'],
    },
    {
      key: 'fechamento-maestro.exportar',
      description: 'Exportar o fechamento e os pedidos em Excel (.xlsx)',
      groupPath: ['Fechamento Maestro'],
    },
  ],
})
