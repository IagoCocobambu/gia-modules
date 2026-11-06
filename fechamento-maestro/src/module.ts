import { defineModule, registerModule } from '@gia-cb/sdk/modules'
import { fechamentoMaestroPermissions } from './permissions'
import { fechamentoMaestroRoutes } from './routes'

export const fechamentoMaestroModule = defineModule({
  id: 'fechamento-maestro',
  label: 'Fechamento Maestro',
  version: '0.2.1',
  description:
    'Fechamento diário dos pedidos de delivery do Maestro: concilia as formas de pagamento de cada pedido (Online, Adquirentes online/offline, Offline) e aponta as divergências, por loja e período. Para o financeiro e as lojas fecharem o caixa do delivery. Substitui a tela Fechamento Diário Maestro do GIA antigo.',
  icon: 'ReceiptText',
  defaultNavPath: '/fechamento-maestro',
  // navGroup agrupa o módulo num grupo do menu lateral. Sem ele, o módulo fica
  // "solto" na raiz. Grupos de fábrica: 'geral' | 'cadastros' | 'administracao'
  // | 'operacional' | 'integracoes' | 'simphony' | 'cardapio' | 'conteudo' |
  // 'suporte' | 'relatorios'. Você também pode declarar um grupo NOVO.
  // 'cardapio' é o grupo Plataformas; o subgrupo Maestro (Plataformas › Maestro ›
  // Fechamento Maestro, ao lado do Reports Maestro) é criado pelo time GIA na instalação.
  navGroup: 'maestro',
  permissions: fechamentoMaestroPermissions,
  dependsOn: [],
  // Read-only sobre a API do DW; a loja é escolhida na própria tela.
  requiresContext: { empresa: false, operacao: false },
})

registerModule(fechamentoMaestroModule, () => Promise.resolve({ routes: fechamentoMaestroRoutes }))
