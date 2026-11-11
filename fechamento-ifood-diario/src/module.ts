import { defineModule, registerModule } from '@gia-cb/sdk/modules'
import { fechamentoIfoodDiarioPermissions } from './permissions'
import { fechamentoIfoodDiarioRoutes } from './routes'

export const fechamentoIfoodDiarioModule = defineModule({
  id: 'fechamento-ifood-diario',
  label: 'Fechamento iFood Diário',
  version: '0.2.0',
  description:
    'Fechamento diário dos pedidos iFood de uma loja: cruza os pedidos do DW com a API financeira do iFood, classifica as formas de pagamento (Online, Adquirentes/VR, Offline) e soma os cards do fechamento.',
  icon: 'ReceiptText',
  defaultNavPath: '/fechamento-ifood-diario',
  // Menu: Plataformas › iFood › Fechamento iFood Diário. 'cardapio' é o grupo
  // Plataformas; o subgrupo iFood (`navGroup: 'ifood'`, como o 'maestro' do Fechamento
  // Maestro) é posicionado dentro de Plataformas pelo time GIA na instalação.
  navGroup: 'ifood',
  permissions: fechamentoIfoodDiarioPermissions,
  dependsOn: [],
  // Só leitura; a loja é escolhida na própria tela.
  requiresContext: { empresa: false, operacao: false },
})

registerModule(fechamentoIfoodDiarioModule, () =>
  Promise.resolve({ routes: fechamentoIfoodDiarioRoutes })
)
