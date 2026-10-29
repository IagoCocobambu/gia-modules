import { defineModule, registerModule } from '@gia-cb/sdk/modules'
import { testePermissions } from './permissions'
import { testeRoutes } from './routes'

export const testeModule = defineModule({
  version: '0.1.0',
  id: 'teste',
  label: 'Teste',
  description: 'Teste — gerencia uma lista de items com filtros, criação, edição e exclusão.',
  icon: 'test-tube-diagonal',
  defaultNavPath: '/teste',
  // navGroup agrupa o módulo num grupo do menu lateral. Sem ele, o módulo fica
  // "solto" na raiz. Grupos de fábrica: 'geral' | 'cadastros' | 'administracao'
  // | 'operacional' | 'integracoes' | 'simphony' | 'cardapio' | 'conteudo' |
  // 'suporte' | 'relatorios'. Você também pode declarar um grupo NOVO (qualquer
  // id kebab-case, ex: 'vendas-b2b') — é um default; o host reposiciona no menu.
  // navGroup: 'operacional',
  permissions: testePermissions,
  dependsOn: [],
  requiresContext: { empresa: false, operacao: false },
})

registerModule(testeModule, () => Promise.resolve({ routes: testeRoutes }))
