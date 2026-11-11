import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createServerClient } from '@gia-cb/sdk/server-client'
import { MODULE_ID, valeTentarDeNovo } from '../helpers'
import type {
  DadosManuais,
  OperacaoIfood,
  RespostaHistorico,
  RespostaLedger,
  RespostaManual,
} from '../types'

// `call(...)` chaveia o transporte sozinho: em dev bate no runner do `gia dev`
// (src/server/*.ts no Node); em prod, na Edge Function gerada pelo `gia pack`.
const server = createServerClient(MODULE_ID)

export function useOperacoesIfood(enabled: boolean) {
  return useQuery({
    queryKey: [MODULE_ID, 'operacoes'],
    queryFn: () => server.call<OperacaoIfood[]>('operacoes'),
    staleTime: 10 * 60_000,
    refetchOnWindowFocus: false,
    enabled,
  })
}

export function buscarPaginaLedger(body: {
  operacaoRef: string
  mes: string
  janela: number
  pagina: number
}) {
  return server.call<RespostaLedger>('ledger', body)
}

export function buscarManual(body: { operacaoRef: string; mes: string }) {
  return server.call<RespostaManual>('manual', body)
}

export function useSalvarFechamento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { operacaoRef: string; mes: string } & DadosManuais) =>
      server.call<{ gravadoEm: string; alteracoes: number }>('salvar', body),
    // A gravação entra no histórico: a próxima abertura busca de novo — em todas as
    // operações, porque "02 cb" e "02 vst" dividem o mesmo fechamento.
    onSuccess: () => qc.invalidateQueries({ queryKey: [MODULE_ID, 'historico'] }),
  })
}

/** Histórico das gravações do mês da loja — só busca quando o diálogo abre. */
export function useHistorico(operacaoRef: string, mes: string, enabled: boolean) {
  return useQuery({
    queryKey: [MODULE_ID, 'historico', operacaoRef, mes],
    queryFn: () => server.call<RespostaHistorico>('historico', { operacaoRef, mes }),
    enabled,
    // Só o que pode passar sozinho (rede, 5xx, 429), e uma vez: recusa (403, 422) e
    // "tabela ausente" aparecem na hora.
    retry: (falhas, e) => falhas < 1 && valeTentarDeNovo(e),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })
}
