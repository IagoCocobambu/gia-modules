import { useQuery } from '@tanstack/react-query'
import { createServerClient } from '@gia-cb/sdk/server-client'
import type { PedidosResposta, ReportsMaestroLoja } from '../types'

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
    queryFn: () => server.call<ReportsMaestroLoja[]>('lojas'),
    staleTime: 10 * 60_000,
    refetchOnWindowFocus: false,
    enabled,
  })
}

/**
 * Pedidos de delivery da loja no período. É uma FOTO do clique em "Pesquisar": a
 * consulta é lenta (até ~25 s para 31 dias), então não rebusca sozinha ao voltar
 * o foco nem ao reconectar — só pelo botão. O resultado fica 30 min em cache.
 */
export function usePedidosReportsMaestro(periodo: Periodo | null) {
  return useQuery({
    queryKey: ['reports-maestro', 'pedidos', periodo],
    queryFn: () => server.call<PedidosResposta>('pedidos', periodo!),
    enabled: periodo !== null,
    staleTime: Infinity,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  })
}
