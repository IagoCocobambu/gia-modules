import { defineModule, registerModule } from '@gia-cb/sdk/modules'
import { fechamentoIfoodMensalPermissions } from './permissions'
import { fechamentoIfoodMensalRoutes } from './routes'

export const fechamentoIfoodMensalModule = defineModule({
  id: 'fechamento-ifood-mensal',
  label: 'Fechamento iFood Mensal',
  version: '0.1.0',
  description:
    'Fechamento mensal do iFood por loja: busca os lançamentos financeiros do mês na API do iFood e confere com o caixa da loja (borderô) — vendas online, adquirentes (vale-refeição), descontos, DRE de conferência, recebimento × extrato bancário e cancelados pós-entrega.',
  icon: 'CalendarRange',
  defaultNavPath: '/fechamento-ifood-mensal',
  // 'cardapio' é o grupo Plataformas (o mesmo do Fechamento iFood Diário).
  navGroup: 'cardapio',
  permissions: fechamentoIfoodMensalPermissions,
  dependsOn: [],
  // A loja é escolhida na própria tela.
  requiresContext: { empresa: false, operacao: false },
})

registerModule(fechamentoIfoodMensalModule, () =>
  Promise.resolve({ routes: fechamentoIfoodMensalRoutes })
)
