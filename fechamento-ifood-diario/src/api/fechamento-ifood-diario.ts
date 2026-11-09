import { useQuery } from '@tanstack/react-query'
import { createServerClient } from '@gia-cb/sdk/server-client'
import type { FechamentoLoja, FechamentoResposta } from '../types'

// `call(...)` chaveia o transporte sozinho: em dev bate no runner do `gia dev`
// (src/server/*.ts no Node); em prod, na Edge Function gerada pelo `gia pack`.
const server = createServerClient('fechamento-ifood-diario')

export function useLojasFechamentoIfood(enabled: boolean) {
  return useQuery({
    queryKey: ['fechamento-ifood-diario', 'lojas'],
    queryFn: () => server.call<FechamentoLoja[]>('lojas'),
    staleTime: 10 * 60_000,
    refetchOnWindowFocus: false,
    enabled,
  })
}

/**
 * Fechamento da loja no dia. É uma FOTO do clique em "Pesquisar": junta o DW e a
 * API do iFood, então não rebusca sozinha ao voltar o foco nem ao reconectar — só
 * pelo botão. O resultado fica 30 min em cache.
 */
export function useFechamentoIfood(consulta: { operacaoRef: string; data: string } | null) {
  return useQuery({
    queryKey: ['fechamento-ifood-diario', 'fechamento', consulta],
    queryFn: () => server.call<FechamentoResposta>('fechamento', consulta!),
    enabled: consulta !== null,
    staleTime: Infinity,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  })
}
