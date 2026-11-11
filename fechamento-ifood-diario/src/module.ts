import { defineModule, registerModule } from '@gia-cb/sdk/modules'
import { fechamentoIfoodDiarioPermissions } from './permissions'
import { fechamentoIfoodDiarioRoutes } from './routes'

export const fechamentoIfoodDiarioModule = defineModule({
  id: 'fechamento-ifood-diario',
  label: 'Fechamento iFood Diário',
  version: '0.2.2',
  description:
    'Fechamento diário dos pedidos iFood de uma loja: cruza os pedidos do DW com a API financeira do iFood, classifica as formas de pagamento (Online, Adquirentes/VR, Offline) e soma os cards do fechamento.',
  icon: 'ReceiptText',
  defaultNavPath: '/fechamento-ifood-diario',
  // Menu: Plataformas › iFood › Fechamento iFood Diário. O `navGroup` é o grupo RAIZ
  // ('cardapio' = Plataformas): é o que o host grava em nav_group quando a tela entra
  // na NAV_TREE. O subgrupo iFood (id `ifood`, já existe em Plataformas) é wirado pelo
  // time GIA na NAV_TREE — ver INTEGRATION.md §3.
  navGroup: 'cardapio',
  permissions: fechamentoIfoodDiarioPermissions,
  dependsOn: [],
  // Só leitura; a loja é escolhida na própria tela.
  requiresContext: { empresa: false, operacao: false },
})

registerModule(fechamentoIfoodDiarioModule, () =>
  Promise.resolve({ routes: fechamentoIfoodDiarioRoutes })
)
