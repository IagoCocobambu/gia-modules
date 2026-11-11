import { definePermissions } from '@gia-cb/sdk/permissions'

// O painel é SÓ LEITURA: ele consolida o que o `plano-contas` gravou e não
// escreve nada no data-warehouse. Por isso não há `.editar` aqui — a
// granularidade que faz sentido separar é "ver o painel" de "levar o
// consolidado para fora", a mesma do Dashboard de RH.
//
// `groupPath` de dois níveis, compartilhado pelas duas permissões, para o nó
// agregar 2/2 na árvore de Grupos e Papéis. Acompanha o menu: Dashboards >
// Plano de Contas.
export const dashboardContasPermissions = definePermissions({
  moduleId: 'dashboard-contas',
  permissions: [
    {
      key: 'dashboard-contas.ler',
      description: 'Visualizar o painel comparativo do Plano de Contas',
      groupPath: ['Dashboards', 'Dashboard de Contas'],
    },
    {
      key: 'dashboard-contas.exportar',
      description: 'Exportar as grades do painel em planilha',
      groupPath: ['Dashboards', 'Dashboard de Contas'],
    },
    {
      // Painel comparativo mostra a REDE, não só o escopo de empresa do usuário
      // (decisão do João, 21/09/2026, a mesma do Dashboard de RH): comparar a
      // própria loja com as outras é o produto deste módulo, e com o escopo
      // recortado a comparação perde sentido.
      //
      // A intenção é conceder esta chave a todo papel que tem a de visualizar;
      // ela é separada porque é assim que a SDK reconhece leitura ampla, e
      // porque conceder (ou não) é do administrador do portal, não do módulo.
      //
      // O NOME É IMPOSTO PELA SDK: ela procura literalmente por
      // `<moduleId>.ler-rede`. Renomear não dá erro — desliga a ampliação em
      // silêncio, e o painel volta a mostrar só o escopo.
      //
      // Ampliar aqui não amplia gravação em lugar nenhum: o módulo é somente
      // leitura, e não existe handler que escreva.
      key: 'dashboard-contas.ler-rede',
      description:
        'Comparar todas as lojas da rede no painel, e não apenas as do seu escopo. O painel é somente leitura',
      groupPath: ['Dashboards', 'Dashboard de Contas'],
    },
  ],
})
