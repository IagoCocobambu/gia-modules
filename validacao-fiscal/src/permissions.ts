import { definePermissions } from '@gia-cb/sdk/permissions'

// groupPath monta a árvore do editor de Grupos/Papéis. Convenção do portal:
// TODAS as permissões do módulo compartilham UM groupPath — `['Validação Fiscal']` ou
// `['Área', 'Validação Fiscal']`. A AÇÃO (ler/exportar) fica na `description`, NÃO num
// nível de grupo — assim o nó agrega (2/2) em vez de virar dois "1/1". Máx. 2
// níveis (o `gia validate` avisa se passar).
export const validacaoFiscalPermissions = definePermissions({
  moduleId: 'validacao-fiscal',
  permissions: [
    {
      key: 'validacao-fiscal.ler',
      description:
        'Consultar a validação fiscal (contas do PDV × notas fiscais) das lojas do seu escopo',
      groupPath: ['Validação Fiscal'],
    },
    {
      key: 'validacao-fiscal.exportar',
      description: 'Exportar o resultado da validação fiscal em Excel (.xlsx)',
      groupPath: ['Validação Fiscal'],
    },
  ],
})
