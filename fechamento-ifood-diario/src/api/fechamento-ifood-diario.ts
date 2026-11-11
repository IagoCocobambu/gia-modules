import { useQuery } from '@tanstack/react-query'
import { createServerClient } from '@gia-cb/sdk/server-client'
import type { FechamentoLoja, RespostaPedidos, RespostaVendas } from '../types'

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

/** Pedidos do DW da operação no dia e o cadastro de formas ONLINE VR. */
export function buscarPedidos(body: { operacaoRef: string; data: string }) {
  return server.call<RespostaPedidos>('pedidos', body)
}

/** Uma página (20) das vendas do dia no iFood, já reduzidas ao que o cruzamento usa. */
export function buscarPaginaVendas(body: { operacaoRef: string; data: string; pagina: number }) {
  return server.call<RespostaVendas>('vendas', body)
}
