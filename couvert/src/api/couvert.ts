import { useQuery } from '@tanstack/react-query'
import { createServerClient } from '@gia-cb/sdk/server-client'
import type { Consulta, LojaCouvert, Nomes, RespostaMesas } from '../types'

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

/**
 * Nomes dos itens e do garçom de uma mesa, só ao abrir o detalhe (a conta traz os
 * códigos). Guardados enquanto a tela está aberta; sem nova busca automática.
 */
export function useNomes(empresaId: number | null, itens: number[], garcons: number[]) {
  const chave = [...itens].sort((a, b) => a - b).join(',') + '|' + garcons.join(',')
  return useQuery({
    queryKey: ['couvert', 'nomes', empresaId, chave],
    queryFn: () => server.call<Nomes>('nomes', { empresaId, itens, garcons }),
    enabled: empresaId !== null && (itens.length > 0 || garcons.length > 0),
    staleTime: Infinity,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  })
}
