import { useQuery } from '@tanstack/react-query'
import { createServerClient } from '@gia-cb/sdk/server-client'
import type { DashboardLoja, DashboardResumo, Funcionario, ItemVendido } from '../types'

// `call(...)` chaveia o transporte sozinho: em dev bate no runner do `gia dev`
// (src/server/*.ts no Node); em prod, na Edge Function gerada pelo `gia pack`.
const server = createServerClient('dashboard-simphony')

/** Mesmo comportamento para as três partes: é uma FOTO do clique em Pesquisar. */
const FOTO = {
  staleTime: Infinity,
  gcTime: 30 * 60_000,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: false,
} as const

export function useLojasDashboard(enabled: boolean) {
  return useQuery({
    queryKey: ['dashboard-simphony', 'lojas'],
    queryFn: () => server.call<DashboardLoja[]>('lojas'),
    staleTime: 10 * 60_000,
    refetchOnWindowFocus: false,
    enabled,
  })
}

/**
 * Totais do dia. Sem `data`, a BI diz qual é o último dia de negócio da loja — o
 * dia que volta aqui é o que as outras duas partes usam.
 * O botão Atualizar da tabela busca de novo (`refetch`).
 */
export function useResumoDashboard(consulta: { empresaId: number; data: string } | null) {
  return useQuery({
    queryKey: ['dashboard-simphony', 'resumo', consulta],
    queryFn: () =>
      server.call<DashboardResumo>('resumo', {
        empresaId: consulta!.empresaId,
        data: consulta!.data || undefined,
      }),
    enabled: consulta !== null,
    ...FOTO,
  })
}

type Dia = { empresaId: number; data: string } | null

export function useItensDashboard(dia: Dia) {
  return useQuery({
    queryKey: ['dashboard-simphony', 'itens', dia],
    queryFn: () =>
      server.call<{ itens: ItemVendido[] }>('itens', {
        empresaId: dia!.empresaId,
        data: dia!.data,
      }),
    enabled: dia !== null,
    select: (r) => r.itens,
    ...FOTO,
  })
}

export function useFuncionariosDashboard(dia: Dia) {
  return useQuery({
    queryKey: ['dashboard-simphony', 'funcionarios', dia],
    queryFn: () =>
      server.call<{ funcionarios: Funcionario[] }>('funcionarios', {
        empresaId: dia!.empresaId,
        data: dia!.data,
      }),
    enabled: dia !== null,
    select: (r) => r.funcionarios,
    ...FOTO,
  })
}
