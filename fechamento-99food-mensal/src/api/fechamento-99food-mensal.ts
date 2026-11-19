import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createServerClient } from '@gia-cb/sdk/server-client'
import { MODULE_ID, valeTentarDeNovo } from '../helpers'
import type {
  DadosManuais,
  Loja99,
  RespostaHistorico,
  RespostaLedger,
  RespostaManual,
} from '../types'

// `call(...)` chaveia o transporte sozinho: em dev bate no runner do `gia dev`
// (src/server/*.ts no Node); em prod, na Edge Function gerada pelo `gia pack`.
const server = createServerClient(MODULE_ID)

export function useLojas99(enabled: boolean) {
  return useQuery({
    queryKey: [MODULE_ID, 'lojas'],
    queryFn: () => server.call<{ lojas: Loja99[]; testePorOperacao: boolean }>('lojas'),
    staleTime: 10 * 60_000,
    refetchOnWindowFocus: false,
    enabled,
  })
}

export function buscarPaginaLedger(body: {
  empresaId: number
  mes: string
  /** Restaurante (merchant) da loja na 99Food. */
  merchant: string
  janela: number
  pagina: number
}) {
  return server.call<RespostaLedger>('bill', body)
}

export function buscarManual(body: { empresaId: number; mes: string }) {
  return server.call<RespostaManual>('manual', body)
}

export function useSalvarFechamento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { empresaId: number; mes: string } & DadosManuais) =>
      server.call<{ gravadoEm: string; alteracoes: number }>('salvar', body),
    // A gravação entra no histórico: a próxima abertura busca de novo.
    onSuccess: () => qc.invalidateQueries({ queryKey: [MODULE_ID, 'historico'] }),
  })
}

/** Histórico das gravações do mês da loja — só busca quando o diálogo abre. */
export function useHistorico(empresaId: number, mes: string, enabled: boolean) {
  return useQuery({
    queryKey: [MODULE_ID, 'historico', empresaId, mes],
    queryFn: () => server.call<RespostaHistorico>('historico', { empresaId, mes }),
    enabled,
    // Só o que pode passar sozinho (rede, 5xx, 429), e uma vez: recusa (403, 422) e
    // "tabela ausente" aparecem na hora.
    retry: (falhas, e) => falhas < 1 && valeTentarDeNovo(e),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })
}
