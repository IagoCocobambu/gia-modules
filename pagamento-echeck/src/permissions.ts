import { definePermissions } from '@gia-cb/sdk/permissions'

// groupPath monta a árvore do editor de Grupos/Papéis. Convenção do portal:
// TODAS as permissões do módulo compartilham UM groupPath. A AÇÃO (ler/exportar)
// fica na `description`, NÃO num nível de grupo — assim o nó agrega (2/2).
//
// Módulo só de leitura: não há permissão de escrita.
export const pagamentoEcheckPermissions = definePermissions({
  moduleId: 'pagamento-echeck',
  permissions: [
    {
      key: 'pagamento-echeck.ler',
      description:
        'Consultar os pagamentos eCheck (transações, totais e gráficos) das lojas do seu escopo',
      groupPath: ['Pagamento eCheck'],
    },
    {
      key: 'pagamento-echeck.exportar',
      description: 'Exportar as transações eCheck em Excel (.xlsx)',
      groupPath: ['Pagamento eCheck'],
    },
  ],
})
