import { defineModule, registerModule } from '@gia-cb/sdk/modules'
import { dashboardSimphonyPermissions } from './permissions'
import { dashboardSimphonyRoutes } from './routes'

export const dashboardSimphonyModule = defineModule({
  id: 'dashboard-simphony',
  label: 'Dashboard Simphony',
  description:
    'Dashboard Simphony — exemplo de consumo de API externa: lista países de uma API pública (Banco Mundial) numa tabela com busca e export.',
  icon: 'chart-column',
  defaultNavPath: '/dashboard-simphony',
  // navGroup agrupa o módulo num grupo do menu lateral. Sem ele, o módulo fica
  // "solto" na raiz. Grupos de fábrica: 'geral' | 'cadastros' | 'administracao'
  // | 'operacional' | 'integracoes' | 'simphony' | 'cardapio' | 'conteudo' |
  // 'suporte' | 'relatorios'. Você também pode declarar um grupo NOVO.
  // navGroup: 'relatorios',
  permissions: dashboardSimphonyPermissions,
  dependsOn: [],
  // Read-only sobre fonte externa — não depende de Empresa/Operação.
  requiresContext: { empresa: false, operacao: false },
})

registerModule(dashboardSimphonyModule, () => Promise.resolve({ routes: dashboardSimphonyRoutes }))
