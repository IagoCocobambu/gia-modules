import { defineModule, registerModule } from '@gia-cb/sdk/modules'
import { fechamentoMaestroPermissions } from './permissions'
import { fechamentoMaestroRoutes } from './routes'

export const fechamentoMaestroModule = defineModule({
  id: 'fechamento-maestro',
  label: 'Fechamento Maestro',
  version: '0.1.0',
  description:
    'Fechamento diário dos pedidos de delivery do Maestro: concilia as formas de pagamento de cada pedido (Online, Adquirentes, Offline) e aponta as divergências, por loja e período.',
  icon: 'ReceiptText',
  defaultNavPath: '/fechamento-maestro',
  // navGroup agrupa o módulo num grupo do menu lateral. Sem ele, o módulo fica
  // "solto" na raiz. Grupos de fábrica: 'geral' | 'cadastros' | 'administracao'
  // | 'operacional' | 'integracoes' | 'simphony' | 'cardapio' | 'conteudo' |
  // 'suporte' | 'relatorios'. Você também pode declarar um grupo NOVO.
  navGroup: 'relatorios',
  permissions: fechamentoMaestroPermissions,
  dependsOn: [],
  // Read-only sobre a API do DW; a loja é escolhida na própria tela.
  requiresContext: { empresa: false, operacao: false },
})

registerModule(fechamentoMaestroModule, () => Promise.resolve({ routes: fechamentoMaestroRoutes }))
