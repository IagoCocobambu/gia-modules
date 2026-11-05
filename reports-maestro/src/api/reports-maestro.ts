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
 * A pesquisa: os pedidos de delivery da loja no período E o resumo do dashboard
 * Operacional, numa chamada só à API — as duas abas leem o MESMO resultado, e
 * trocar de aba não busca de novo (pedido do usuário em 05/11/2026). Sai assim que
 * há uma pesquisa, qualquer que seja a aba aberta.
 *
 * É uma FOTO do clique em "Pesquisar": a consulta é lenta (até ~45 s para 31 dias
 * de uma loja movimentada, por causa do histórico de status), então não rebusca
 * sozinha ao voltar o foco nem ao reconectar — só pelo botão. O resultado fica
 * 30 min em cache.
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
