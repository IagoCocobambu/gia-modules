import { defineModule, registerModule } from '@gia-cb/sdk/modules'
import { fechamentoIfoodDiarioPermissions } from './permissions'
import { fechamentoIfoodDiarioRoutes } from './routes'

export const fechamentoIfoodDiarioModule = defineModule({
  id: 'fechamento-ifood-diario',
  label: 'Fechamento iFood Diário',
  version: '0.1.0',
  description:
    'Fechamento diário dos pedidos iFood de uma loja: cruza os pedidos do DW com a API financeira do iFood, classifica as formas de pagamento (Online, Adquirentes/VR, Offline) e soma os cards do fechamento. Substitui a tela Fechamento iFood Diário do GIA antigo.',
  icon: 'ReceiptText',
  defaultNavPath: '/fechamento-ifood-diario',
  // Grupo Plataformas (`cardapio`), como os módulos do Maestro. O subgrupo (iFood)
  // é definido pelo time GIA na instalação.
  navGroup: 'cardapio',
  permissions: fechamentoIfoodDiarioPermissions,
  dependsOn: [],
  // Só leitura; a loja é escolhida na própria tela.
  requiresContext: { empresa: false, operacao: false },
})

registerModule(fechamentoIfoodDiarioModule, () =>
  Promise.resolve({ routes: fechamentoIfoodDiarioRoutes })
)
