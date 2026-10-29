import { definePermissions } from '@gia-cb/sdk/permissions'

// groupPath monta a árvore do editor de Grupos/Papéis. Convenção do portal:
// TODAS as permissões do módulo compartilham UM groupPath — `['Meu Modulo']`
// (módulo solto) ou `['Área', 'Meu Modulo']` (dentro de uma área maior, ex.
// ['Simphony', 'Lojas']). A AÇÃO (ler/sincronizar/exportar) fica na
// `description`, NÃO num nível de grupo. Assim o nó do módulo agrega (3/3) em
// vez de virar três sub-grupos de "1/1". Máx. 2 níveis — o `gia validate` avisa
// se passar disso.
export const meuModuloPermissions = definePermissions({
  moduleId: 'meu-modulo',
  permissions: [
    {
      key: 'meu-modulo.ler',
      description: 'Visualizar a lista de itens de Meu Modulo por loja',
      groupPath: ['Meu Modulo'],
    },
    {
      key: 'meu-modulo.sincronizar',
      description: 'Disparar a sincronização manual dos itens',
      groupPath: ['Meu Modulo'],
    },
    {
      key: 'meu-modulo.exportar',
      description: 'Exportar a lista de itens em CSV',
      groupPath: ['Meu Modulo'],
    },
  ],
})
