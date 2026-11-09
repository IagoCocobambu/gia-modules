import { useQuery } from '@tanstack/react-query'
import { createServerClient } from '@gia-cb/sdk/server-client'
import type { PagamentoLoja, PagamentosResposta } from '../types'

// `call(...)` chaveia o transporte sozinho: em dev bate no runner do `gia dev`
// (src/server/*.ts no Node); em prod, na Edge Function gerada pelo `gia pack`.
const server = createServerClient('pagamento-echeck')

interface Filtro {
  empresaId: number
  de: string
  ate: string
  horaInicio: number
  horaFim: number
}

export function useLojasPagamentoEcheck(enabled: boolean) {
  return useQuery({
    queryKey: ['pagamento-echeck', 'lojas'],
    queryFn: () => server.call<PagamentoLoja[]>('lojas'),
    staleTime: 10 * 60_000,
    refetchOnWindowFocus: false,
    enabled,
  })
}

/**
 * Transações da loja no período. É uma FOTO do clique em "Pesquisar": a consulta
 * leva alguns segundos (~10 s para 31 dias de uma loja movimentada), então não
 * rebusca sozinha ao voltar o foco nem ao reconectar — só pelo botão.
 */
export function usePagamentosEcheck(filtro: Filtro | null) {
  return useQuery({
    queryKey: ['pagamento-echeck', 'pagamentos', filtro],
    queryFn: () => server.call<PagamentosResposta>('pagamentos', filtro!),
    enabled: filtro !== null,
    staleTime: Infinity,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  })
}
