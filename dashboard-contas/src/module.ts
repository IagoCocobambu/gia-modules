import { defineModule, registerModule } from '@gia-cb/sdk/modules'
import { dashboardContasPermissions } from './permissions'
import { dashboardContasRoutes } from './routes'

export const dashboardContasModule = defineModule({
  id: 'dashboard-contas',
  // Acompanha a `version` do `package.json` — o `validate` compara as duas.
  version: '0.1.5',
  label: 'Dashboard de Contas',
  description:
    'Painel comparativo do Plano de Contas: consolida as lojas selecionadas num mês ou período, compara com o período anterior e coloca cada loja, região ou grupo contra a média das lojas.',
  icon: 'chart-column',
  defaultNavPath: '/dashboard-contas',
  // Grupo próprio dos painéis, e não Planos: "o dashboard tem que ficar separado
  // dos planos" (Davi Nascimento, 17/09/2026). Ler a mesma fonte do
  // `plano-contas` não muda isso — painel comparativo mora em Dashboards, ao
  // lado do de RH.
  //
  // O rótulo repete o nome do plano de propósito (decisão do João, 18/09/2026):
  // é o nome que o usuário procura, e o grupo diz qual dos dois é o painel.
  navGroup: 'dashboards',
  permissions: dashboardContasPermissions,
  dependsOn: [],
  // Sem a barra de contexto do host. O painel é deliberadamente MULTI-LOJA: a
  // pergunta que ele responde ("como as lojas se comparam") morre se o host
  // obrigar a uma loja por vez. A seleção é um filtro do próprio módulo.
  requiresContext: { empresa: false, operacao: false },
})

registerModule(dashboardContasModule, () => Promise.resolve({ routes: dashboardContasRoutes }))
