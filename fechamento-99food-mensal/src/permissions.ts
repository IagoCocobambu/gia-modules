import { definePermissions } from '@gia-cb/sdk/permissions'

// groupPath monta a árvore do editor de Grupos/Papéis. Convenção do portal:
// TODAS as permissões do módulo compartilham UM groupPath. A AÇÃO (ler/editar)
// fica na `description`, NÃO num nível de grupo — assim o nó agrega (2/2).
//
// Mesmas chaves do Fechamento iFood Mensal (decisão de 17/11/2026).
export const fechamento99foodMensalPermissions = definePermissions({
  moduleId: 'fechamento-99food-mensal',
  permissions: [
    {
      key: 'fechamento-99food-mensal.ler',
      description:
        'Consultar o fechamento mensal da 99Food (lançamentos, Online, Adquirentes, Conferência, Extrato, Recebimento e Cancelados pós) das lojas do seu escopo',
      groupPath: ['Fechamento 99Food Mensal'],
    },
    {
      key: 'fechamento-99food-mensal.editar',
      description:
        'Preencher e salvar o fechamento mensal: previsão de pagamento, CB Descontos LOJA, comentários, breakdown da Conferência, extrato bancário e cancelados pós-entrega',
      groupPath: ['Fechamento 99Food Mensal'],
    },
  ],
})
