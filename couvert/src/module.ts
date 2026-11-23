import { defineModule, registerModule } from '@gia-cb/sdk/modules'
import { couvertPermissions } from './permissions'
import { couvertRoutes } from './routes'

export const couvertModule = defineModule({
  id: 'couvert',
  label: 'Couvert',
  version: '0.1.0',
  description:
    'Conferência do couvert artístico: as mesas abertas do salão e onde o couvert lançado no Simphony não bate com o número de pessoas.',
  icon: 'music',
  defaultNavPath: '/couvert',
  // Menu: Simphony › Couvert (decidido com o usuário em 19/11/2026).
  navGroup: 'simphony',
  permissions: couvertPermissions,
  dependsOn: [],
  // A loja é escolhida na própria tela (seletor de Empresas com a BI do Simphony).
  requiresContext: { empresa: false, operacao: false },
})

registerModule(couvertModule, () => Promise.resolve({ routes: couvertRoutes }))
