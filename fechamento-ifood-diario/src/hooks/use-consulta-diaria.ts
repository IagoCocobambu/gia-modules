import { useCallback, useEffect, useRef, useState } from 'react'
import { buscarPaginaVendas, buscarPedidos } from '../api/fechamento-ifood-diario'
import { montarFechamento } from '../regras'
import type { Consulta, FechamentoResposta, RespostaPedidos, VendaIfood } from '../types'

/**
 * Páginas do iFood buscadas ao mesmo tempo (o mesmo do Fechamento iFood Mensal). Cada
 * página leva 3–4 s e tem 20 vendas; teto baixo porque o iFood limita requisições.
 */
const CONCORRENCIA = 4
/** Esperas antes de cada nova tentativa (a API oscila e pode responder 429). */
const ESPERAS_NOVA_TENTATIVA_MS = [1500, 4000]

export interface ProgressoDiario {
  /** Pedidos do delivery (DW): uma chamada só, a mais demorada em loja grande. */
  pedidosProntos: boolean
  pedidos: number | null
  /** Vendas do iFood: páginas concluídas / conhecidas (a página 1 diz o total). */
  paginasConcluidas: number
  paginasTotal: number | null
  vendasProntas: boolean
  vendas: number
}

export type FaseConsulta = 'ocioso' | 'consultando' | 'pronto' | 'erro'

/**
 * O fechamento na tela. `completo: false` = os pedidos do delivery já chegaram, mas
 * ainda faltam páginas do iFood: o pedido não achado fica Aguardando (não Cancelado),
 * e os valores do dia, o filtro pelos cards e o Excel esperam o fim.
 */
export interface ResultadoDiario extends FechamentoResposta {
  completo: boolean
}

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms))

class Cancelada extends Error {}

/** Tenta de novo com espera crescente — cobre oscilação e o 429 do iFood. */
async function comNovaTentativa<T>(fn: () => Promise<T>, ativo: () => boolean): Promise<T> {
  for (let tentativa = 0; ; tentativa++) {
    try {
      return await fn()
    } catch (e) {
      if (!ativo()) throw new Cancelada()
      const espera = ESPERAS_NOVA_TENTATIVA_MS[tentativa]
      if (espera === undefined) throw e
      await esperar(espera)
      if (!ativo()) throw new Cancelada()
    }
  }
}

/**
 * A consulta do dia em partes, para mostrar o andamento:
 *
 * 1. **Ao mesmo tempo**: os pedidos do DW (uma chamada) e a página 1 das vendas do
 *    iFood; a página 1 diz quantas páginas há, e as demais entram na fila, até
 *    `CONCORRENCIA` chamadas juntas, com nova tentativa em caso de falha.
 * 2. **Aos poucos**: assim que os pedidos do DW chegam, a tabela aparece e vai sendo
 *    cruzada a cada página do iFood (`completo: false`); o pedido ainda não achado fica
 *    Aguardando. Os valores do dia só saem com as duas partes completas — número
 *    parcial não pode ficar na tela como se fosse o do dia.
 *
 * Falha nos pedidos do DW derruba a consulta (sem eles não há fechamento) e não é
 * repetida (a chamada pode levar até 90 s antes de falhar). Falha no
 * iFood não: vira aviso, e os pedidos não achados ficam como Cancelado (como no legado).
 * Uma consulta nova (ou "Cancelar") abandona a anterior.
 */
export function useConsultaDiaria() {
  const [fase, setFase] = useState<FaseConsulta>('ocioso')
  const [progresso, setProgresso] = useState<ProgressoDiario | null>(null)
  const [resultado, setResultado] = useState<ResultadoDiario | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const geracao = useRef(0)

  // Saiu da tela: abandona a consulta (os trabalhadores param na próxima página).
  useEffect(
    () => () => {
      geracao.current += 1
    },
    []
  )

  const cancelar = useCallback(() => {
    geracao.current += 1
    setProgresso(null)
    setResultado(null)
    setFase('ocioso')
  }, [])

  const consultar = useCallback(async (consulta: Consulta) => {
    const minha = ++geracao.current
    const ativo = () => geracao.current === minha
    const { operacaoRef, data } = consulta

    const estado: ProgressoDiario = {
      pedidosProntos: false,
      pedidos: null,
      paginasConcluidas: 0,
      paginasTotal: null,
      vendasProntas: false,
      vendas: 0,
    }
    const publicar = () => {
      if (ativo()) setProgresso({ ...estado })
    }
    setFase('consultando')
    setErro(null)
    setResultado(null)
    publicar()

    const vendas: VendaIfood[] = []
    const avisos: string[] = []
    // Pedidos do DW, quando chegarem: daí em diante a tabela aparece e vai sendo cruzada.
    let dwPronto: RespostaPedidos | null = null
    const publicarParcial = () => {
      if (!ativo() || !dwPronto) return
      setResultado({
        pedidos: montarFechamento(dwPronto, vendas, dwPronto.restaurante ?? 'iFood', false),
        avisos: [],
        completo: false,
      })
    }

    // Vendas do iFood: página 1, depois a fila com até CONCORRENCIA trabalhadores.
    const buscarVendas = async () => {
      const pagina = (n: number) =>
        comNovaTentativa(() => buscarPaginaVendas({ operacaoRef, data, pagina: n }), ativo)
      let primeira
      try {
        primeira = await pagina(1)
      } catch (e) {
        if (e instanceof Cancelada) throw e
        avisos.push(e instanceof Error ? e.message : 'Falha ao consultar o iFood.')
        return
      }
      if (!ativo()) throw new Cancelada()
      if (primeira.aviso) avisos.push(primeira.aviso)
      vendas.push(...primeira.vendas)
      estado.paginasTotal = primeira.totalPaginas
      estado.paginasConcluidas = Math.min(1, primeira.totalPaginas)
      estado.vendas = vendas.length
      publicar()
      publicarParcial()

      const fila = Array.from({ length: Math.max(0, primeira.totalPaginas - 1) }, (_, i) => i + 2)
      let falhou = false
      const trabalhador = async () => {
        for (let n = fila.shift(); n !== undefined && !falhou; n = fila.shift()) {
          try {
            const r = await pagina(n)
            if (!ativo()) throw new Cancelada()
            vendas.push(...r.vendas)
            estado.paginasConcluidas += 1
            estado.vendas = vendas.length
            publicar()
            publicarParcial()
          } catch (e) {
            if (e instanceof Cancelada) throw e
            // Como no legado: uma página que falha encerra a busca; o que veio fica.
            falhou = true
            avisos.push(e instanceof Error ? e.message : 'Falha ao consultar o iFood.')
          }
        }
      }
      await Promise.all(Array.from({ length: Math.min(CONCORRENCIA, fila.length) }, trabalhador))
    }

    try {
      const [dw] = await Promise.all([
        // Sem nova tentativa: a chamada ao DW pode levar até 90 s antes de falhar.
        buscarPedidos({ operacaoRef, data }).then((r: RespostaPedidos) => {
          if (!ativo()) throw new Cancelada()
          estado.pedidosProntos = true
          estado.pedidos = r.pedidos.length
          publicar()
          dwPronto = r
          publicarParcial()
          return r
        }),
        buscarVendas().then(() => {
          estado.vendasProntas = true
          publicar()
        }),
      ])
      if (!ativo()) return
      setResultado({
        pedidos: montarFechamento(dw, vendas, dw.restaurante ?? 'iFood'),
        avisos,
        completo: true,
      })
      setFase('pronto')
    } catch (e) {
      if (e instanceof Cancelada || !ativo()) return
      geracao.current += 1 // para os trabalhadores que ainda estão rodando
      setProgresso(null)
      setResultado(null)
      setErro(e instanceof Error ? e.message : 'Falha ao consultar o fechamento.')
      setFase('erro')
    } finally {
      if (geracao.current === minha) setProgresso(null)
    }
  }, [])

  return { fase, progresso, resultado, erro, consultar, cancelar }
}
