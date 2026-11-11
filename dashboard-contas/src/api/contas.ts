import { useMemo } from 'react'
import { keepPreviousData, useQueries, useQuery, type UseQueryResult } from '@tanstack/react-query'
import { createServerClient } from '@gia-cb/sdk/server-client'
import type { MesAno } from '../periodo'
import type { FonteDoPlano, MatrizDoMes, SerieDeContas } from '../types'
import { useOperacoes, type LojaDoPedido } from './operacoes'

// Cliente BFF do módulo — `call('contas')` bate no handler `src/server/contas.ts`
// (Node em dev, Edge Function em prod), que lê o data-warehouse.
const server = createServerClient('dashboard-contas')

// ── AS LOJAS VÃO NO PEDIDO ──────────────────────────────────────────────────
//
// O servidor conhece, sozinho, só o ESCOPO DE EMPRESA do usuário:
// `ctx.operacoes()` não tem modo amplo. Quem sabe a rede inteira é o cliente,
// que lê o cadastro do portal (ver `./operacoes`) — então é ele que manda a
// lista, com o NOME junto (para a loja de fora do escopo, o servidor não tem
// como saber como ela se chama).
//
// Isso NÃO amplia acesso: o servidor só consolida loja de fora do escopo para
// quem tem `dashboard-contas.ler-rede`, e ignora a lista para todos os outros.
//
// Enquanto a lista não chegou, o pedido vai sem ela e o servidor responde pelo
// escopo — o mesmo comportamento de antes, que é o certo se a consulta do
// cadastro falhar.
function useLojasDoPedido(): LojaDoPedido[] {
  const { data } = useOperacoes()
  return useMemo(() => data.map((o) => ({ ref: o.ref, nome: o.nome })), [data])
}

function corpo<T extends object>(base: T, lojas: LojaDoPedido[]): T {
  return lojas.length > 0 ? { ...base, lojas } : base
}

// ── A FONTE ENTRA NA CHAVE ──────────────────────────────────────────────────
//
// O orçado de um mês e o realizado do mesmo mês são duas matrizes diferentes,
// cada uma no seu lugar do cache. O realizado mantém a chave de sempre; o orçado
// só é pedido quando o "Comparar com" do topo o escolhe.
function corpoDaFonte<T extends object>(base: T, fonte: FonteDoPlano): T {
  return fonte === 'orcado' ? { ...base, fonte } : base
}

function consultaDoMes({ ano, mes }: MesAno, lojas: LojaDoPedido[], fonte: FonteDoPlano) {
  return {
    // As lojas entram na chave: a lista muda quando o escopo do usuário muda, e
    // a matriz guardada não serve para outra lista.
    queryKey: [
      'dashboard-contas',
      fonte === 'orcado' ? 'orcado' : 'contas',
      ano,
      mes,
      lojas,
    ] as const,
    queryFn: () =>
      server.call<MatrizDoMes>('contas', corpoDaFonte(corpo({ ano, mes }, lojas), fonte)),
    // Alto porque o dado é fechado: o plano de um mês passado não muda, e o do
    // mês corrente muda quando uma loja entrega — não a cada segundo.
    staleTime: 300_000,
  }
}

export interface MatrizesDoPeriodo {
  /** Uma matriz por mês, na ordem dos meses — `null` até TODAS chegarem. */
  matrizes: MatrizDoMes[] | null
  erro: Error | null
}

// Fora do componente de propósito: o `useQueries` só reaproveita o resultado do
// `combine` quando a função é a MESMA entre renders.
function combinar(resultados: UseQueryResult<MatrizDoMes>[]): MatrizesDoPeriodo {
  const completos = resultados.length > 0 && resultados.every((r) => r.data)
  return {
    matrizes: completos ? resultados.map((r) => r.data as MatrizDoMes) : null,
    erro: (resultados.find((r) => r.error)?.error as Error | undefined) ?? null,
  }
}

/**
 * Uma matriz por mês — cada uma na chave de cache do mês. O período e o período
 * anterior pedem pelo mesmo hook: trocar de jan–jun para fev–jul só busca os
 * meses novos, e voltar a um período já visto não busca nada.
 */
export function useMatrizes(
  meses: MesAno[],
  habilitado = true,
  fonte: FonteDoPlano = 'realizado'
): MatrizesDoPeriodo {
  const lojas = useLojasDoPedido()
  return useQueries({
    queries: meses.map((m) => ({ ...consultaDoMes(m, lojas, fonte), enabled: habilitado })),
    combine: combinar,
  })
}

/**
 * A série da evolução: oito contas por loja nos `meses` que terminam em
 * (`ano`, `mes`). Consulta separada de propósito — esticar a matriz de 169
 * contas por 12 meses seriam ~190 mil linhas para desenhar oito números por mês.
 */
export function useSerie(
  ano: number,
  mes: number,
  meses: number,
  habilitado = true,
  fonte: FonteDoPlano = 'realizado'
) {
  const lojas = useLojasDoPedido()
  return useQuery({
    queryKey: [
      'dashboard-contas',
      fonte === 'orcado' ? 'serie-orcado' : 'serie',
      ano,
      mes,
      meses,
      lojas,
    ],
    queryFn: () =>
      server.call<SerieDeContas>('serie', corpoDaFonte(corpo({ ano, mes, meses }, lojas), fonte)),
    staleTime: 300_000,
    // Trocar de mês segura a série anterior enquanto a nova chega: os gráficos
    // mostram o esqueleto próprio em vez de sumir.
    placeholderData: keepPreviousData,
    enabled: habilitado,
  })
}
