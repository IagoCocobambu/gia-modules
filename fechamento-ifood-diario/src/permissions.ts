import { definePermissions } from '@gia-cb/sdk/permissions'

// Convenção do portal: TODAS as permissões do módulo compartilham UM groupPath.
// A AÇÃO (ler/exportar) fica na `description`, não num nível de grupo.
export const fechamentoIfoodDiarioPermissions = definePermissions({
  moduleId: 'fechamento-ifood-diario',
  permissions: [
    {
      key: 'fechamento-ifood-diario.ler',
      description:
        'Consultar o fechamento diário dos pedidos iFood das lojas do seu escopo (DW cruzado com a API do iFood)',
      groupPath: ['Fechamento iFood Diário'],
    },
    {
      key: 'fechamento-ifood-diario.exportar',
      description: 'Exportar o fechamento e os pedidos iFood em Excel (.xlsx)',
      groupPath: ['Fechamento iFood Diário'],
    },
  ],
})
