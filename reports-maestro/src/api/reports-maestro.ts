import { useQuery } from '@tanstack/react-query'
import { createServerClient } from '@gia-cb/sdk/server-client'
import type { LojasResposta, PedidosResposta } from '../types'

// `call(...)` chaveia o transporte sozinho: em dev bate no runner do `gia dev`
// (src/server/*.ts no Node); em prod, na Edge Function gerada pelo `gia pack`.
const server = createServerClient('reports-maestro')

interface Periodo {
  empresaId: number
  de: string
  ate: string
}

export function useLojasReportsMaestro(enabled: boolean) {
  return useQuery({
    queryKey: ['reports-maestro', 'lojas'],
    queryFn: () => server.call<LojasResposta>('lojas'),
    staleTime: 10 * 60_000,
    refetchOnWindowFocus: false,
    enabled,
  })
}

/**
 * Pedidos de delivery da loja no período. É uma FOTO do clique em "Pesquisar": a
 * consulta é lenta (até ~25 s para 31 dias), então não rebusca sozinha ao voltar
 * o foco nem ao reconectar — só pelo botão. O resultado fica 30 min em cache.
 *
 * `verDadosCliente` entra na chave porque o servidor mascara os dados pessoais
 * conforme essa permissão: se ela mudar (ex.: troca de persona), o resultado em
 * cache não vale mais e a consulta é refeita — senão a tela seguiria mostrando os
 * dados completos de quem tinha a permissão.
 */
export function usePedidosReportsMaestro(periodo: Periodo | null, verDadosCliente: boolean) {
  return useQuery({
    queryKey: ['reports-maestro', 'pedidos', periodo, { verDadosCliente }],
    queryFn: () => server.call<PedidosResposta>('pedidos', periodo!),
    enabled: periodo !== null,
    staleTime: Infinity,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  })
}
