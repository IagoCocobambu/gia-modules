import { useCallback, useRef, useState } from 'react'
import { buscarManual, buscarPaginaLedger } from '../api/fechamento-ifood-mensal'
import { valeTentarDeNovo } from '../helpers'
import type { Consulta, LinhaLedger, RespostaManual } from '../types'

/** A API Financial do iFood aceita no máximo 8 dias por consulta (a "janela"). */
const DIAS_POR_JANELA = 8
/**
 * Quantas páginas buscamos ao mesmo tempo. As janelas são independentes; com
 * várias em paralelo o tempo total vira o da janela mais lenta, não a soma.
 * Teto baixo de propósito: o iFood tem limite de requisições por minuto — com 4,
 * a consulta real de um mês (49 páginas) levou 429 em parte delas (11/11/2026).
 */
const CONCORRENCIA = 3
/** Esperas antes de cada nova tentativa (a API oscila e pode responder 429). */
const ESPERAS_NOVA_TENTATIVA_MS = [1500, 4000]

export interface ProgressoConsulta {
  totalJanelas: number
  janelasConcluidas: number
  paginasConcluidas: number
  /** Páginas conhecidas até agora (cada janela revela as suas na página 1). */
  paginasConhecidas: number
  linhas: number
  /** Fração concluída, de 0 a 1. */
  fracao: number
}

export type FaseConsulta = 'ocioso' | 'consultando' | 'pronto' | 'erro'

export interface ResultadoConsulta {
  consulta: Consulta
  /** Borderô + o que foi gravado. Chega primeiro e não muda durante a consulta. */
  manual: RespostaManual
  /** Lançamentos que já chegaram, na ordem das janelas e páginas. */
  ledger: LinhaLedger[]
  /** `true` quando todas as janelas terminaram. */
  completo: boolean
  /** Dias (`AAAA-MM-DD`) cujos lançamentos ainda podem chegar. Vazio quando completo. */
  diasPendentes: ReadonlySet<string>
  /** Requisições à API do iFood (uma por página). */
  requisicoes: number
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
      if (espera === undefined || !valeTentarDeNovo(e)) throw e
      await esperar(espera)
      if (!ativo()) throw new Cancelada()
    }
  }
}

/** Dias do mês e a que janela cada um pertence. */
function janelasDoMes(mes: string): { dias: string[]; totalJanelas: number } {
  const [a, m] = mes.split('-').map(Number)
  const total = new Date(a, m, 0).getDate()
  const dias = Array.from({ length: total }, (_, i) => `${mes}-${String(i + 1).padStart(2, '0')}`)
  return { dias, totalJanelas: Math.ceil(total / DIAS_POR_JANELA) }
}

/**
 * Dias que ainda podem receber lançamentos. O dia da janela que não terminou está
 * pendente; o ÚLTIMO dia de cada janela também espera a janela seguinte, porque o
 * pedido feito antes das 6h do dia seguinte conta nele e chega na próxima janela.
 */
function calcularPendentes(dias: string[], concluidas: boolean[]): Set<string> {
  const pendentes = new Set<string>()
  dias.forEach((dia, i) => {
    const j = Math.floor(i / DIAS_POR_JANELA)
    const ultimoDaJanela = (i + 1) % DIAS_POR_JANELA === 0 && j + 1 < concluidas.length
    if (!concluidas[j] || (ultimoDaJanela && !concluidas[j + 1])) pendentes.add(dia)
  })
  return pendentes
}

/**
 * A consulta do mês, o mais rápido que o iFood permite:
 *
 * 1. **Em paralelo**: a página 1 de todas as janelas sai junto; cada página 1 diz
 *    quantas páginas a janela tem, e as demais entram na fila. Até `CONCORRENCIA`
 *    chamadas ao mesmo tempo, com nova tentativa em caso de falha.
 * 2. **Aos poucos**: assim que a parte manual (borderô + gravado) chega, a tela já
 *    abre; os lançamentos vão entrando conforme as páginas terminam, e
 *    `diasPendentes` diz quais dias ainda podem mudar.
 *
 * Uma consulta nova (ou "Cancelar") abandona a anterior.
 */
export function useConsultaMensal() {
  const [fase, setFase] = useState<FaseConsulta>('ocioso')
  const [progresso, setProgresso] = useState<ProgressoConsulta | null>(null)
  const [resultado, setResultado] = useState<ResultadoConsulta | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const geracao = useRef(0)

  // Cancelar descarta o que veio pela metade: número parcial não pode ficar na tela
  // como se fosse o fechamento.
  const cancelar = useCallback(() => {
    geracao.current += 1
    setProgresso(null)
    setResultado(null)
    setFase('ocioso')
  }, [])

  const consultar = useCallback(async (consulta: Consulta) => {
    const minha = ++geracao.current
    const ativo = () => geracao.current === minha
    const { operacaoRef, mes } = consulta
    const { dias, totalJanelas } = janelasDoMes(mes)

    // Estado da consulta (mutável aqui dentro; a tela recebe cópias).
    const paginas: LinhaLedger[][][] = Array.from({ length: totalJanelas }, () => [])
    const totalPaginas: (number | null)[] = Array(totalJanelas).fill(null)
    const feitas: number[] = Array(totalJanelas).fill(0)
    let requisicoes = 0
    let manual: RespostaManual | null = null

    setFase('consultando')
    setErro(null)
    setResultado(null)
    setProgresso({
      totalJanelas,
      janelasConcluidas: 0,
      paginasConcluidas: 0,
      paginasConhecidas: totalJanelas,
      linhas: 0,
      fracao: 0,
    })

    const concluidas = () => feitas.map((f, j) => totalPaginas[j] !== null && f >= totalPaginas[j]!)
    const publicar = () => {
      if (!ativo()) return
      const conc = concluidas()
      const ledger = paginas.flatMap((ps) => ps.flat())
      const fracao =
        feitas.reduce((s, f, j) => s + (totalPaginas[j] ? f / totalPaginas[j]! : 0), 0) /
        totalJanelas
      setProgresso({
        totalJanelas,
        janelasConcluidas: conc.filter(Boolean).length,
        paginasConcluidas: feitas.reduce((s, f) => s + f, 0),
        paginasConhecidas: totalPaginas.reduce<number>((s, t) => s + (t ?? 1), 0),
        linhas: ledger.length,
        fracao,
      })
      if (!manual) return
      const completo = conc.every(Boolean)
      setResultado({
        consulta,
        manual,
        ledger,
        completo,
        diasPendentes: completo ? new Set() : calcularPendentes(dias, conc),
        requisicoes,
      })
    }

    // Fila de páginas: começa com a página 1 de cada janela.
    const fila: Array<{ janela: number; pagina: number }> = Array.from(
      { length: totalJanelas },
      (_, i) => ({ janela: i + 1, pagina: 1 })
    )
    const buscar = async ({ janela, pagina }: { janela: number; pagina: number }) => {
      const r = await comNovaTentativa(
        () => buscarPaginaLedger({ operacaoRef, mes, janela, pagina }),
        ativo
      )
      if (!ativo()) throw new Cancelada()
      requisicoes += 1
      const j = janela - 1
      paginas[j][pagina - 1] = r.linhas
      feitas[j] += 1
      if (pagina === 1) {
        totalPaginas[j] = r.totalPaginas
        for (let p = 2; p <= r.totalPaginas; p++) fila.push({ janela, pagina: p })
      }
      publicar()
    }
    // Cada "trabalhador" tira da fila até ela esvaziar e os outros terminarem.
    let emAndamento = 0
    const trabalhador = async () => {
      for (;;) {
        const proxima = fila.shift()
        if (!proxima) {
          if (emAndamento === 0) return
          await esperar(50) // outro trabalhador pode estar para colocar páginas na fila
          continue
        }
        emAndamento += 1
        try {
          await buscar(proxima)
        } finally {
          emAndamento -= 1
        }
      }
    }

    try {
      const manualPromise = comNovaTentativa(() => buscarManual({ operacaoRef, mes }), ativo).then(
        (m) => {
          manual = m
          publicar() // a tela abre aqui, mesmo sem nenhum lançamento ainda
        }
      )
      await Promise.all([
        manualPromise,
        ...Array.from({ length: Math.min(CONCORRENCIA, totalJanelas) }, trabalhador),
      ])
      if (!ativo()) return
      publicar()
      setFase('pronto')
    } catch (e) {
      if (e instanceof Cancelada || !ativo()) return
      geracao.current += 1 // para os trabalhadores que ainda estão rodando
      setResultado(null)
      setProgresso(null)
      setErro(e instanceof Error ? e.message : 'Falha ao consultar o fechamento.')
      setFase('erro')
    } finally {
      if (geracao.current === minha) setProgresso(null)
    }
  }, [])

  return { fase, progresso, resultado, erro, consultar, cancelar }
}
