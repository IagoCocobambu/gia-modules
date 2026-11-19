import { useCallback, useRef, useState } from 'react'
import { buscarManual, buscarPaginaLedger } from '../api/fechamento-ifood-mensal'
import { MODULE_ID, valeTentarDeNovo } from '../helpers'
import type { Consulta, LinhaLedger, RespostaLedger, RespostaManual } from '../types'

/** A API Financial do iFood aceita no máximo 8 dias por consulta (a "janela"). */
const DIAS_POR_JANELA = 8
/**
 * Quantas páginas buscamos ao mesmo tempo — **adaptativo**. As janelas são
 * independentes; com várias em paralelo o tempo total vira o da janela mais lenta.
 * Medido em 16/11/2026 (20 cb, mai/26): com carga alta o iFood devolve cada vez mais
 * páginas vazias (18% → 50% em 2 min com 8 ao mesmo tempo). Por isso começa em 3,
 * baixa 1 quando uma página precisa de várias repetições ou volta para a fila, e
 * sobe 1 depois de `LIMPAS_PARA_SUBIR` páginas seguidas sem nenhuma repetição.
 */
const CONCORRENCIA_MAX = 3
const CONCORRENCIA_MIN = 1
const LIMPAS_PARA_SUBIR = 8
/** Intervalo mínimo entre duas reduções (uma rajada de falhas reduz uma vez só). */
const INTERVALO_REDUCAO_MS = 3000
/**
 * Freio: com o saldo da cota do iFood abaixo disto, todas as chamadas param até a
 * cota renovar (`ifood-ratelimit-reset`) — antes de levar o 429 de cota esgotada.
 * A cota é uma só para a credencial inteira (outros módulos e usuários também usam).
 */
const SALDO_MINIMO = 20
/** Vezes que a mesma página pode voltar para a fila (vendas vazias / 429 com saldo). */
const ADIAMENTOS_MAX = 3
/** Pausas por cota esgotada que a mesma página aguenta antes de a consulta desistir. */
const PAUSAS_COTA_MAX = 5
/** Esperas antes de cada nova tentativa em falha de rede ou do servidor (5xx). */
const ESPERAS_NOVA_TENTATIVA_MS = [1500, 4000]

export interface ProgressoConsulta {
  /** Restaurantes da loja no iFood que estão sendo consultados. */
  restaurantes: number
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
  /** Restaurantes que o iFood negou (403) — ficaram de fora do fechamento. */
  avisos: Array<{ operacao: string; aviso: string }>
}

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms))
/** ±30% de variação: trabalhadores que falham juntos não repetem no mesmo instante. */
const comVariacao = (ms: number) => Math.round(ms * (0.7 + Math.random() * 0.6))

class Cancelada extends Error {}

/**
 * Erro decidido pela tela (a página do `ledger` foi adiada vezes demais). Leva a
 * `requisicao` no mesmo formato que o server-client do SDK anexa às falhas, para a
 * `MensagemErro` mostrar a origem ("Lançamentos do iFood"), a frase e os detalhes.
 */
function erroDaPagina(status: number, mensagem: string, body: Record<string, unknown>): Error {
  const corpo = JSON.stringify(body)
  return Object.assign(new Error(mensagem), {
    status,
    requisicao: {
      quando: new Date().toISOString(),
      moduleId: MODULE_ID,
      handler: 'ledger',
      tela: typeof location !== 'undefined' ? location.pathname : undefined,
      status,
      mensagem,
      resumo: { chaves: Object.keys(body), listas: {}, bytes: corpo.length },
      amostra: {},
      corpoEnviado: corpo,
    },
  })
}

/**
 * Tenta de novo com espera crescente (1,5 s e 4 s, com variação) — cobre falha de rede
 * e 5xx; 504 não repete. O 429 e a página vazia não chegam aqui: o `ledger` responde
 * `adiar` e a fila trata.
 */
async function comNovaTentativa<T>(fn: () => Promise<T>, ativo: () => boolean): Promise<T> {
  for (let tentativa = 0; ; tentativa++) {
    try {
      return await fn()
    } catch (e) {
      if (!ativo()) throw new Cancelada()
      const espera = ESPERAS_NOVA_TENTATIVA_MS[tentativa]
      if (espera === undefined || !valeTentarDeNovo(e)) throw e
      await esperar(comVariacao(espera))
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
 *    quantas páginas a janela tem, e as demais entram na fila. Até `CONCORRENCIA_MAX`
 *    chamadas ao mesmo tempo — menos quando o iFood oscila (concorrência adaptativa).
 * 2. **Aos poucos**: assim que a parte manual (borderô + gravado) chega, a tela já
 *    abre; os lançamentos vão entrando conforme as páginas terminam, e
 *    `diasPendentes` diz quais dias ainda podem mudar.
 * 3. **Retentativa** (medida em 13 e 16/11/2026, `docs/teste-ifood-*`):
 *    - vendas vazias ou 429 com saldo: o servidor repete na hora; se não passar, a
 *      página volta para o fim da fila (até `ADIAMENTOS_MAX` vezes);
 *    - cota esgotada (saldo 0): TODAS as chamadas pausam até o `ifood-ratelimit-reset`
 *      + 1 s, e a página volta para o começo da fila; com saldo abaixo de
 *      `SALDO_MINIMO`, a pausa vem antes do 429 (freio);
 *    - rede ou servidor (5xx): até 2 novas tentativas (1,5 s e 4 s, com variação);
 *      tempo esgotado (504) não se repete.
 *
 * Uma consulta nova (ou "Cancelar") abandona a anterior.
 */
export function useConsultaMensal() {
  const [fase, setFase] = useState<FaseConsulta>('ocioso')
  const [progresso, setProgresso] = useState<ProgressoConsulta | null>(null)
  const [resultado, setResultado] = useState<ResultadoConsulta | null>(null)
  const [erro, setErro] = useState<unknown>(null)
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
    const { empresaId, mes, restaurantes } = consulta
    const { dias, totalJanelas } = janelasDoMes(mes)
    const R = restaurantes.length

    // Estado da consulta, por restaurante e janela (mutável aqui; a tela recebe cópias).
    const porRestaurante = <T>(f: () => T) =>
      restaurantes.map(() => Array.from({ length: totalJanelas }, f))
    const paginas: LinhaLedger[][][][] = porRestaurante(() => [])
    const totalPaginas: (number | null)[][] = porRestaurante(() => null)
    const feitas: number[][] = porRestaurante(() => 0)
    const avisos: Array<{ operacao: string; aviso: string }> = []
    let requisicoes = 0
    let manual: RespostaManual | null = null
    // Ritmo da consulta, dividido por todos os trabalhadores.
    const concorrenciaMax = Math.max(1, Math.min(CONCORRENCIA_MAX, R * totalJanelas))
    let limite = concorrenciaMax
    let limpasSeguidas = 0
    let ultimaReducao = 0
    let pausa: { ate: number } | null = null

    setFase('consultando')
    setErro(null)
    setResultado(null)
    setProgresso({
      restaurantes: R,
      totalJanelas,
      janelasConcluidas: 0,
      paginasConcluidas: 0,
      paginasConhecidas: R * totalJanelas,
      linhas: 0,
      fracao: 0,
    })

    // Uma janela só está concluída quando TODOS os restaurantes terminaram nela.
    const concluidas = () =>
      Array.from({ length: totalJanelas }, (_, j) =>
        restaurantes.every(
          (_r, r) => totalPaginas[r][j] !== null && feitas[r][j] >= totalPaginas[r][j]!
        )
      )
    const publicar = () => {
      if (!ativo()) return
      const conc = concluidas()
      const ledger = paginas.flatMap((porJanela) => porJanela.flatMap((ps) => ps.flat()))
      let soma = 0
      for (let r = 0; r < R; r++)
        for (let j = 0; j < totalJanelas; j++)
          soma += totalPaginas[r][j] ? feitas[r][j] / totalPaginas[r][j]! : 0
      setProgresso({
        restaurantes: R,
        totalJanelas,
        janelasConcluidas: conc.filter(Boolean).length,
        paginasConcluidas: feitas.flat().reduce((s, f) => s + f, 0),
        paginasConhecidas: totalPaginas.flat().reduce<number>((s, t) => s + (t ?? 1), 0),
        linhas: ledger.length,
        fracao: R === 0 ? 1 : soma / (R * totalJanelas),
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
        avisos: [...avisos],
      })
    }

    // Fila de páginas: começa com a página 1 de cada janela de cada restaurante.
    type Item = { r: number; janela: number; pagina: number; adiamentos: number; pausas: number }
    const fila: Item[] = restaurantes.flatMap((_r, r) =>
      Array.from({ length: totalJanelas }, (_, i) => ({
        r,
        janela: i + 1,
        pagina: 1,
        adiamentos: 0,
        pausas: 0,
      }))
    )

    /** Pausa TODAS as chamadas até `ms` daqui (a maior pausa pedida vale). */
    const pausar = (ms: number) => {
      const ate = Date.now() + ms + Math.round(Math.random() * 500)
      if (!pausa || pausa.ate < ate) pausa = { ate }
    }
    const aguardarPausa = async () => {
      while (pausa && pausa.ate > Date.now()) {
        if (!ativo()) throw new Cancelada()
        await esperar(Math.min(250, pausa.ate - Date.now()))
      }
      pausa = null
    }
    /** Concorrência adaptativa: cai quando o iFood oscila, volta quando normaliza. */
    const ajustarRitmo = (resp: RespostaLedger) => {
      const ruim = resp.repeticoes >= 2 || (resp.adiar !== null && resp.adiar.motivo !== 'cota')
      if (ruim) {
        limpasSeguidas = 0
        if (limite > CONCORRENCIA_MIN && Date.now() - ultimaReducao >= INTERVALO_REDUCAO_MS) {
          limite -= 1
          ultimaReducao = Date.now()
        }
      } else if (resp.repeticoes === 0 && !resp.adiar) {
        limpasSeguidas += 1
        if (limpasSeguidas >= LIMPAS_PARA_SUBIR && limite < concorrenciaMax) {
          limite += 1
          limpasSeguidas = 0
        }
      }
    }

    const buscar = async (item: Item) => {
      const { r, janela, pagina } = item
      const { operacao, merchant } = restaurantes[r]
      const resp = await comNovaTentativa(
        () => buscarPaginaLedger({ empresaId, mes, merchant, janela, pagina }),
        ativo
      )
      if (!ativo()) throw new Cancelada()
      ajustarRitmo(resp)
      if (resp.adiar) {
        // A página não veio: pede de novo depois. Nada do que já chegou é refeito.
        if (resp.adiar.motivo === 'cota') {
          item.pausas += 1
          if (item.pausas > PAUSAS_COTA_MAX)
            throw erroDaPagina(
              429,
              'O limite de consultas do iFood continuou esgotado por vários minutos. Tente consultar de novo mais tarde.',
              { empresaId, mes, merchant, janela, pagina }
            )
          fila.unshift(item)
          pausar(resp.adiar.esperarMs)
        } else {
          item.adiamentos += 1
          if (item.adiamentos > ADIAMENTOS_MAX)
            throw erroDaPagina(
              502,
              resp.adiar.motivo === 'incompleta'
                ? 'O iFood devolveu vendas sem os lançamentos financeiros várias vezes seguidas. Tente consultar de novo em alguns minutos.'
                : 'O iFood recusou as consultas várias vezes seguidas (muitas requisições). Tente consultar de novo em alguns minutos.',
              { empresaId, mes, merchant, janela, pagina }
            )
          fila.push(item)
        }
        publicar()
        return
      }
      // Freio: saldo da cota quase no fim — para todos até renovar, antes do 429.
      if (resp.cota && resp.cota.restantes < SALDO_MINIMO) pausar(resp.cota.resetS * 1000 + 1000)
      requisicoes += 1
      const j = janela - 1
      paginas[r][j][pagina - 1] = resp.linhas.map((l) => ({ ...l, operacao }))
      feitas[r][j] += 1
      if (pagina === 1) {
        totalPaginas[r][j] = resp.totalPaginas
        // Restaurante negado pelo iFood: um aviso só (não um por janela).
        if (resp.aviso && !avisos.some((a) => a.operacao === operacao))
          avisos.push({ operacao, aviso: resp.aviso })
        for (let p = 2; p <= resp.totalPaginas; p++)
          fila.push({ r, janela, pagina: p, adiamentos: 0, pausas: 0 })
      }
      publicar()
    }
    // Cada "trabalhador" tira da fila até ela esvaziar e os outros terminarem; respeita
    // a pausa compartilhada e o limite de chamadas ao mesmo tempo (adaptativo).
    let emAndamento = 0
    const trabalhador = async () => {
      for (;;) {
        // Consulta cancelada, trocada por outra ou com erro: para sem pedir mais nada.
        if (!ativo()) return
        await aguardarPausa()
        if (emAndamento >= limite) {
          await esperar(50)
          continue
        }
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
      const manualPromise = comNovaTentativa(() => buscarManual({ empresaId, mes }), ativo).then(
        (m) => {
          manual = m
          publicar() // a tela abre aqui, mesmo sem nenhum lançamento ainda
        }
      )
      await Promise.all([manualPromise, ...Array.from({ length: concorrenciaMax }, trabalhador)])
      if (!ativo()) return
      publicar()
      setFase('pronto')
    } catch (e) {
      if (e instanceof Cancelada || !ativo()) return
      geracao.current += 1 // para os trabalhadores que ainda estão rodando
      setResultado(null)
      setProgresso(null)
      // O erro inteiro (com a requisição que o SDK anexa) vai para a mensagem padrão.
      setErro(e)
      setFase('erro')
    } finally {
      if (geracao.current === minha) setProgresso(null)
    }
  }, [])

  return { fase, progresso, resultado, erro, consultar, cancelar }
}
