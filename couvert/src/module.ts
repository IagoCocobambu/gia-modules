import { defineModule, registerModule } from '@gia-cb/sdk/modules'
import { couvertPermissions } from './permissions'
import { couvertRoutes } from './routes'

export const couvertModule = defineModule({
  id: 'couvert',
  label: 'Couvert',
  description:
    'Couvert — exemplo de consumo de API externa: lista países de uma API pública (Banco Mundial) numa tabela com busca e export.',
  icon: 'utensils',
  defaultNavPath: '/couvert',
  // navGroup agrupa o módulo num grupo do menu lateral. Sem ele, o módulo fica
  // "solto" na raiz. Grupos de fábrica: 'geral' | 'cadastros' | 'administracao'
  // | 'operacional' | 'integracoes' | 'simphony' | 'cardapio' | 'conteudo' |
  // 'suporte' | 'relatorios'. Você também pode declarar um grupo NOVO.
  // navGroup: 'relatorios',
  permissions: couvertPermissions,
  dependsOn: [],
  // Read-only sobre fonte externa — não depende de Empresa/Operação.
  requiresContext: { empresa: false, operacao: false },
})

registerModule(couvertModule, () => Promise.resolve({ routes: couvertRoutes }))
