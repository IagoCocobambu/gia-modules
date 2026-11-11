import { definePermissions } from '@gia-cb/sdk/permissions'

// groupPath monta a árvore do editor de Grupos/Papéis. Convenção do portal:
// TODAS as permissões do módulo compartilham UM groupPath. A AÇÃO (ler/editar)
// fica na `description`, NÃO num nível de grupo — assim o nó agrega (2/2).
//
// No legado as duas telas do iFood (diário e mensal) ficavam atrás de uma só
// permissão (`gia / relfechamentoifood`); aqui cada módulo tem a sua.
export const fechamentoIfoodMensalPermissions = definePermissions({
  moduleId: 'fechamento-ifood-mensal',
  permissions: [
    {
      key: 'fechamento-ifood-mensal.ler',
      description:
        'Consultar o fechamento mensal do iFood (lançamentos, Online, Adquirentes, Conferência, Extrato, Recebimento e Cancelados pós) das lojas do seu escopo',
      groupPath: ['Fechamento iFood Mensal'],
    },
    {
      key: 'fechamento-ifood-mensal.editar',
      description:
        'Preencher e salvar o fechamento mensal: previsão de pagamento, CB Descontos LOJA, comentários, breakdown da Conferência, extrato bancário e cancelados pós-entrega',
      groupPath: ['Fechamento iFood Mensal'],
    },
  ],
})
