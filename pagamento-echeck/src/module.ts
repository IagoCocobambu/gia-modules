import { defineModule, registerModule } from '@gia-cb/sdk/modules'
import { pagamentoEcheckPermissions } from './permissions'
import { pagamentoEcheckRoutes } from './routes'

export const pagamentoEcheckModule = defineModule({
  id: 'pagamento-echeck',
  label: 'Pagamento eCheck',
  version: '0.1.1',
  description:
    'Relatório dos pagamentos eCheck de uma loja num período e faixa de horário: valor total, transações, ticket médio, gráficos por hora e por modalidade e a lista detalhada das transações, com exportação em Excel. Substitui a tela Relatório de Pagamentos eCheck do GIA antigo.',
  icon: 'CreditCard',
  defaultNavPath: '/pagamento-echeck',
  // No legado a tela ficava em Relatórios. Grupos de fábrica: 'geral' |
  // 'cadastros' | 'administracao' | 'operacional' | 'integracoes' | 'simphony' |
  // 'cardapio' | 'conteudo' | 'suporte' | 'relatorios'.
  navGroup: 'relatorios',
  permissions: pagamentoEcheckPermissions,
  dependsOn: [],
  // Read-only sobre a API do DW; a loja é escolhida na própria tela.
  requiresContext: { empresa: false, operacao: false },
})

registerModule(pagamentoEcheckModule, () => Promise.resolve({ routes: pagamentoEcheckRoutes }))
