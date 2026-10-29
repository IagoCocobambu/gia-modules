import { defineModule, registerModule } from '@gia-cb/sdk/modules'
import { reportsMaestroPermissions } from './permissions'
import { reportsMaestroRoutes } from './routes'

export const reportsMaestroModule = defineModule({
  id: 'reports-maestro',
  label: 'Reports Maestro',
  version: '0.1.0',
  description:
    'Lista os pedidos de delivery do Maestro (app, iFood, 99Food, manual) de uma loja num período, com cliente, valores e formas de pagamento.',
  icon: 'Bike',
  defaultNavPath: '/reports-maestro',
  // navGroup agrupa o módulo num grupo do menu lateral. Sem ele, o módulo fica
  // "solto" na raiz. Grupos de fábrica: 'geral' | 'cadastros' | 'administracao'
  // | 'operacional' | 'integracoes' | 'simphony' | 'cardapio' | 'conteudo' |
  // 'suporte' | 'relatorios'. Você também pode declarar um grupo NOVO.
  navGroup: 'relatorios',
  permissions: reportsMaestroPermissions,
  dependsOn: [],
  // Read-only sobre fonte externa; a loja é escolhida na própria tela.
  requiresContext: { empresa: false, operacao: false },
})

registerModule(reportsMaestroModule, () => Promise.resolve({ routes: reportsMaestroRoutes }))
