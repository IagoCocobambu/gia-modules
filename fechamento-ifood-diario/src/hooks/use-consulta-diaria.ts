import { useCallback, useEffect, useRef, useState } from 'react'
import { buscarPaginaVendas, buscarPedidos } from '../api/fechamento-ifood-diario'
import { montarFechamento, type RestauranteNomeado } from '../regras'
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
  /** Restaurantes do iFood da loja (um por operação com iFood). */
  restaurantes: number
  /**
   * Vendas do iFood: páginas concluídas / previstas. A página 1 de cada restaurante diz
   * quantas ele tem; até ela chegar, o restaurante conta 1. `null` = sem restaurante.
   */
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
 * 1. **Ao mesmo tempo**: os pedidos do DW (uma chamada, a loja inteira) e as vendas do
 *    iFood de cada restaurante da loja, numa fila com até `CONCORRENCIA` chamadas
 *    juntas: primeiro a página 1 de cada restaurante (que diz quantas páginas ele
 *    tem), e as demais entram na fila conforme chegam; nova tentativa em caso de falha.
 * 2. **Aos poucos**: assim que os pedidos do DW chegam, a tabela aparece e vai sendo
 *    cruzada a cada página do iFood (`completo: false`); o pedido ainda não achado fica
 *    Aguardando. Os valores do dia só saem com as duas partes completas — número
 *    parcial não pode ficar na tela como se fosse o do dia.
 *
 * Falha nos pedidos do DW derruba a consulta (sem eles não há fechamento) e não é
 * repetida (a chamada pode levar até 90 s antes de falhar). Falha no iFood não: vira
 * aviso (com o restaurante), as páginas que faltam daquele restaurante são deixadas, e
 * os pedidos não achados ficam como Cancelado (como no legado). Uma consulta nova (ou
 * "Cancelar") abandona a anterior.
 */
export function useConsultaDiaria() {
  const [fase, setFase] = useState<FaseConsulta>('ocioso')
  const [progresso, setProgresso] = useState<ProgressoDiario | null>(null)
  const [resultado, setResultado] = useState<ResultadoDiario | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  /** O erro como veio (com o `.requisicao` do SDK), para os detalhes técnicos. */
  const [erroOriginal, setErroOriginal] = useState<unknown>(null)
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
    const { empresaId, data, restaurantes } = consulta

    const estado: ProgressoDiario = {
      pedidosProntos: false,
      pedidos: null,
      restaurantes: restaurantes.length,
      paginasConcluidas: 0,
      paginasTotal: restaurantes.length > 0 ? restaurantes.length : null,
      vendasProntas: false,
      vendas: 0,
    }
    const publicar = () => {
      if (ativo()) setProgresso({ ...estado })
    }
    setFase('consultando')
    setErro(null)
    setErroOriginal(null)
    setResultado(null)
    publicar()

    const vendas: VendaIfood[] = []
    const avisos: string[] = []
    // Nome de cada restaurante (vem na página 1 dele); até lá, a operação.
    const nomes = new Map<string, RestauranteNomeado>(
      restaurantes.map((r) => [r.merchant, { nome: r.operacao || 'iFood', operacao: r.operacao }])
    )
    // Pedidos do DW, quando chegarem: daí em diante a tabela aparece e vai sendo cruzada.
    let dwPronto: RespostaPedidos | null = null
    const publicarParcial = () => {
      if (!ativo() || !dwPronto) return
      setResultado({
        pedidos: montarFechamento(dwPronto, vendas, nomes, false),
        avisos: [],
        completo: false,
      })
    }

    if (restaurantes.length === 0) {
      avisos.push(
        'A loja não tem restaurante do iFood no cadastro: os pedidos não foram cruzados com o iFood e contam como Cancelado.'
      )
    }

    // Vendas do iFood: fila de páginas (restaurante, página) com até CONCORRENCIA
    // chamadas juntas. A página 1 de cada restaurante põe as demais dele na fila.
    const buscarVendas = () =>
      new Promise<void>((terminou, falhou) => {
        const fila = restaurantes.map((r) => ({ merchant: r.merchant, pagina: 1 }))
        const desistiu = new Set<string>()
        let rodando = 0
        let encerrada = false
        const rotulo = (merchant: string) => {
          const r = nomes.get(merchant)
          if (!r) return 'iFood'
          return r.operacao && r.nome !== r.operacao ? `${r.nome} (${r.operacao})` : r.nome
        }
        const avisar = (merchant: string, msg: string) => avisos.push(`${rotulo(merchant)}: ${msg}`)
        const proxima = () => {
          if (encerrada) return
          if (!ativo()) {
            encerrada = true
            falhou(new Cancelada())
            return
          }
          if (rodando === 0 && fila.length === 0) {
            encerrada = true
            terminou()
            return
          }
          while (rodando < CONCORRENCIA && fila.length > 0) {
            const tarefa = fila.shift()!
            if (desistiu.has(tarefa.merchant)) {
              // Restaurante que falhou: as páginas que faltavam saem da previsão.
              estado.paginasTotal = (estado.paginasTotal ?? 1) - 1
              continue
            }
            rodando += 1
            void executar(tarefa).finally(() => {
              rodando -= 1
              proxima()
            })
          }
          if (rodando === 0 && fila.length === 0) proxima()
        }
        const executar = async ({ merchant, pagina }: { merchant: string; pagina: number }) => {
          try {
            const r = await comNovaTentativa(
              () => buscarPaginaVendas({ empresaId, data, merchant, pagina }),
              ativo
            )
            if (!ativo()) return
            if (pagina === 1) {
              if (r.restaurante) {
                nomes.set(merchant, {
                  nome: r.restaurante,
                  operacao: nomes.get(merchant)?.operacao ?? '',
                })
              }
              if (r.aviso) avisar(merchant, r.aviso)
              // A previsão contava 1 página para ele; agora sabe o total (0 = sem vendas).
              estado.paginasTotal = (estado.paginasTotal ?? 0) - 1 + Math.max(1, r.totalPaginas)
              for (let n = 2; n <= r.totalPaginas; n++) fila.push({ merchant, pagina: n })
            }
            vendas.push(...r.vendas)
            estado.paginasConcluidas += 1
            estado.vendas = vendas.length
            publicar()
            publicarParcial()
          } catch (e) {
            if (e instanceof Cancelada || !ativo()) return
            // Como no legado: uma página que falha encerra a busca daquele restaurante;
            // o que veio fica.
            desistiu.add(merchant)
            estado.paginasConcluidas += 1
            avisar(merchant, e instanceof Error ? e.message : 'Falha ao consultar o iFood.')
            publicar()
          }
        }
        proxima()
      })

    try {
      const [dw] = await Promise.all([
        // Sem nova tentativa: a chamada ao DW pode levar até 90 s antes de falhar.
        buscarPedidos({ empresaId, data }).then((r: RespostaPedidos) => {
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
        pedidos: montarFechamento(dw, vendas, nomes),
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
      setErroOriginal(e)
      setFase('erro')
    } finally {
      if (geracao.current === minha) setProgresso(null)
    }
  }, [])

  return { fase, progresso, resultado, erro, erroOriginal, consultar, cancelar }
}
