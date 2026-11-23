import { useQuery } from '@tanstack/react-query'
import { createServerClient } from '@gia-cb/sdk/server-client'
import type { Consulta, LojaCouvert, RespostaMesas } from '../types'

// `call(...)` chaveia o transporte sozinho: em dev bate no runner do `gia dev`
// (src/server/*.ts no Node); em prod, na Edge Function gerada pelo `gia pack`.
const server = createServerClient('couvert')

export function useLojasCouvert(enabled: boolean) {
  return useQuery({
    queryKey: ['couvert', 'lojas'],
    queryFn: () => server.call<LojaCouvert[]>('lojas'),
    staleTime: 10 * 60_000,
    refetchOnWindowFocus: false,
    enabled,
  })
}

/**
 * Mesas abertas do salão. É uma FOTO do clique: não rebusca sozinha ao voltar o foco
 * nem ao reconectar (R10: só pelo botão Atualizar ou trocando loja/RVC). Atualizar
 * chama `refetch()`.
 */
export function useMesas(consulta: Consulta | null) {
  return useQuery({
    queryKey: ['couvert', 'mesas', consulta],
    queryFn: () => server.call<RespostaMesas>('mesas', consulta!),
    enabled: consulta !== null,
    staleTime: Infinity,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  })
}
