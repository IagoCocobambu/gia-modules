import { defineModule, registerModule } from '@gia-cb/sdk/modules'
import { validacaoFiscalPermissions } from './permissions'
import { validacaoFiscalRoutes } from './routes'

export const validacaoFiscalModule = defineModule({
  id: 'validacao-fiscal',
  label: 'Validação Fiscal',
  version: '0.1.1',
  description:
    'Concilia as contas fechadas no PDV (Simphony) com as notas fiscais (NFC-e) emitidas por loja e período.',
  icon: 'FileCheck',
  defaultNavPath: '/validacao-fiscal',
  // navGroup agrupa o módulo num grupo do menu lateral. Sem ele, o módulo fica
  // "solto" na raiz. Grupos de fábrica: 'geral' | 'cadastros' | 'administracao'
  // | 'operacional' | 'integracoes' | 'simphony' | 'cardapio' | 'conteudo' |
  // 'suporte' | 'relatorios'. Você também pode declarar um grupo NOVO.
  navGroup: 'simphony',
  permissions: validacaoFiscalPermissions,
  dependsOn: [],
  // Read-only sobre fontes externas; a loja é escolhida na própria tela.
  requiresContext: { empresa: false, operacao: false },
})

registerModule(validacaoFiscalModule, () => Promise.resolve({ routes: validacaoFiscalRoutes }))
