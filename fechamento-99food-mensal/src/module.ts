import { defineModule, registerModule } from '@gia-cb/sdk/modules'
import { fechamento99foodMensalPermissions } from './permissions'
import { fechamento99foodMensalRoutes } from './routes'

export const fechamento99foodMensalModule = defineModule({
  id: 'fechamento-99food-mensal',
  label: 'Fechamento 99Food Mensal',
  version: '0.1.0',
  description:
    'Fechamento mensal da 99Food por loja: busca os lançamentos financeiros do mês na Financial API da 99Food e confere com o caixa da loja (campos da 99 no borderô) — vendas online, adquirentes (vale-refeição), descontos, DRE de conferência, recebimento × extrato bancário e cancelados pós-entrega. Espelho do Fechamento iFood Mensal.',
  icon: 'CalendarRange',
  defaultNavPath: '/fechamento-99food-mensal',
  // 'cardapio' é o grupo Plataformas (o mesmo do Fechamento iFood Mensal); o subgrupo
  // 99Food é wirado pelo time GIA na NAV_TREE (INTEGRATION.md §3).
  navGroup: 'cardapio',
  permissions: fechamento99foodMensalPermissions,
  dependsOn: [],
  // A loja é escolhida na própria tela.
  requiresContext: { empresa: false, operacao: false },
})

registerModule(fechamento99foodMensalModule, () =>
  Promise.resolve({ routes: fechamento99foodMensalRoutes })
)
