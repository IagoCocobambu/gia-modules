import { defineModule, registerModule } from '@gia-cb/sdk/modules'
import { meuModuloPermissions } from './permissions'
import { meuModuloRoutes } from './routes'

export const meuModuloModule = defineModule({
  id: 'meu-modulo',
  label: 'Meu Modulo',
  description:
    'Meu Modulo — gerencia uma lista de items com filtros, criação, edição e exclusão.',
  icon: 'box',
  defaultNavPath: '/meu-modulo',
  // navGroup agrupa o módulo num grupo do menu lateral. Sem ele, o módulo fica
  // "solto" na raiz. Grupos de fábrica: 'geral' | 'cadastros' | 'administracao'
  // | 'operacional' | 'integracoes' | 'simphony' | 'cardapio' | 'conteudo' |
  // 'suporte' | 'relatorios'. Você também pode declarar um grupo NOVO (qualquer
  // id kebab-case, ex: 'vendas-b2b') — é um default; o host reposiciona no menu.
  // navGroup: 'operacional',
  permissions: meuModuloPermissions,
  dependsOn: [],
  requiresContext: { empresa: false, operacao: false },
})

registerModule(meuModuloModule, () => Promise.resolve({ routes: meuModuloRoutes }))
