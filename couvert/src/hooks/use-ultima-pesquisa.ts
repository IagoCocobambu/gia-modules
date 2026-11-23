import { createPersistedStore } from '@gia-cb/sdk/state'
import type { Consulta } from '../types'

/**
 * Última loja e RVC pesquisados, por usuário, para a tela abrir com eles escolhidos
 * (sem pesquisar sozinha). É preferência de tela — só os dois ids, nenhum dado de
 * negócio — e a tela confere se a loja ainda está no escopo antes de usar.
 *
 * Provisório: `createPersistedStore` do SDK até a resposta do
 * docs/questionamentos-sdk/Q-02-lembrar-ultima-loja.md.
 */
interface UltimaPesquisaState {
  porUsuario: Record<string, Consulta>
  gravar: (usuarioId: string, consulta: Consulta) => void
}

export const useUltimaPesquisa = createPersistedStore<UltimaPesquisaState>(
  { name: 'couvert:ultima-pesquisa' },
  (set) => ({
    porUsuario: {},
    gravar: (usuarioId, consulta) =>
      set((s) => ({ porUsuario: { ...s.porUsuario, [usuarioId]: consulta } })),
  })
)
