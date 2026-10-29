import { useQuery } from '@tanstack/react-query'
import { createServerClient } from '@gia-cb/sdk/server-client'
import type { ContasResposta, NotasResposta, ValidacaoFiscalLoja } from '../types'

// `call(...)` chaveia o transporte sozinho: em dev bate no runner do `gia dev`
// (src/server/*.ts no Node); em prod, na Edge Function gerada pelo `gia pack`.
const server = createServerClient('validacao-fiscal')

// A validação é uma FOTO do clique em "Pesquisar": contas e notas não se atualizam
// sozinhas. Sem isto, o React Query rebusca ao voltar o foco para a aba/janela (e
// ao reconectar) assim que o dado fica "velho" — a tela inteira voltava a carregar
// (cards em esqueleto, tabela em loading) só por trocar de aba. Rebuscar é só pelo
// botão Pesquisar (o mesmo período força o refetch na view).
const SNAPSHOT = {
  staleTime: Infinity,
  // Ao sair da tela, o resultado fica em cache por 30 min: voltando nesse prazo, a
  // última pesquisa reaparece na hora (depois disso, é refeita sozinha ao voltar).
  gcTime: 30 * 60_000,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: false,
} as const

interface Periodo {
  empresaId: number
  de: string
  ate: string
}

export function useLojasValidacaoFiscal(enabled: boolean) {
  return useQuery({
    queryKey: ['validacao-fiscal', 'lojas'],
    queryFn: () => server.call<ValidacaoFiscalLoja[]>('lojas'),
    staleTime: 10 * 60_000,
    // A lista de lojas muda raramente: não rebusca ao voltar o foco.
    refetchOnWindowFocus: false,
    enabled,
  })
}

/** Contas do Simphony (DW). As janelas de tempo NÃO entram na chave: mudam só a regra. */
export function useContasValidacaoFiscal(periodo: Periodo | null) {
  return useQuery({
    queryKey: ['validacao-fiscal', 'contas', periodo],
    queryFn: () => server.call<ContasResposta>('contas', periodo!),
    enabled: periodo !== null,
    ...SNAPSHOT,
  })
}

/** Notas fiscais (API do DW), já com a folga de −1/+1 dia aplicada no servidor. */
export function useNotasValidacaoFiscal(periodo: Periodo | null) {
  return useQuery({
    queryKey: ['validacao-fiscal', 'notas', periodo],
    queryFn: () => server.call<NotasResposta>('notas', periodo!),
    enabled: periodo !== null,
    ...SNAPSHOT,
  })
}
