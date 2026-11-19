import { useCallback, useEffect, useRef, useState } from 'react'
import { buscarPaginaVendas, buscarPedidos } from '../api/fechamento-ifood-diario'
import { montarFechamento, type RestauranteNomeado } from '../regras'
import type {
  Consulta,
  FechamentoResposta,
  RespostaPedidos,
  RespostaVendas,
  VendaIfood,
} from '../types'

/**
 * Páginas do iFood buscadas ao mesmo tempo — **adaptativo**, como no Fechamento iFood
 * Mensal 0.1.1. Medido no Mensal em 16/11/2026: com carga alta o iFood devolve cada vez
 * mais páginas vazias (18% → 50% em 2 min com 8 ao mesmo tempo). Por isso começa em 3,
 * baixa 1 quando uma página precisa de várias repetições ou volta para a fila, e sobe 1
 * depois de `LIMPAS_PARA_SUBIR` páginas seguidas sem nenhuma repetição.
 */
const CONCORRENCIA_MAX = 3
const CONCORRENCIA_MIN = 1
const LIMPAS_PARA_SUBIR = 8
/** Intervalo mínimo entre duas reduções (uma rajada de falhas reduz uma vez só). */
const INTERVALO_REDUCAO_MS = 3000
/**
 * Freio: com o saldo da cota do iFood abaixo disto, todas as chamadas param até a cota
 * renovar (`ifood-ratelimit-reset`) — antes de levar o 429 de cota esgotada. A cota é
 * uma só para a credencial inteira (outros módulos e usuários também usam).
 */
const SALDO_MINIMO = 20
/** Vezes que a mesma página pode voltar para a fila (vendas vazias / 429 com saldo). */
const ADIAMENTOS_MAX = 3
/** Pausas por cota esgotada que a mesma página aguenta antes de a pesquisa desistir. */
const PAUSAS_COTA_MAX = 5
/** Esperas antes de cada nova tentativa em falha de rede ou do servidor (5xx). */
const ESPERAS_NOVA_TENTATIVA_MS = [1500, 4000]

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
/** ±30% de variação: trabalhadores que falham juntos não repetem no mesmo instante. */
const comVariacao = (ms: number) => Math.round(ms * (0.7 + Math.random() * 0.6))

class Cancelada extends Error {}

function statusDoErro(e: unknown): number | undefined {
  const erro = e as { status?: unknown; requisicao?: { status?: unknown } } | null
  const status = erro?.status ?? erro?.requisicao?.status
  return typeof status === 'number' ? status : undefined
}

/**
 * Vale tentar de novo? Só o que pode passar sozinho e é rápido: rede, limite (429) e
 * falha do servidor (5xx). Tempo esgotado (408/504) NÃO se repete — a chamada já esperou
 * 20 s, e repetir prenderia o usuário (padrão 9 do workspace). Recusa (4xx: permissão,
 * restaurante de outra loja, credencial do iFood — 424, o `STATUS_FALHA_CREDENCIAL` de
 * `server/vendas.ts`) também não muda tentando de novo.
 */
function valeTentarDeNovo(e: unknown): boolean {
  const status = statusDoErro(e)
  if (status === 408 || status === 504) return false
  return status === undefined || status === 429 || status >= 500
}

/**
 * Erro decidido pela tela (a página de `vendas` foi adiada vezes demais). Leva a
 * `requisicao` no mesmo formato que o server-client do SDK anexa às falhas, para a
 * `MensagemErro` mostrar a origem ("Vendas no iFood"), a frase e os detalhes.
 */
function erroDaPagina(status: number, mensagem: string, body: Record<string, unknown>): Error {
  const corpo = JSON.stringify(body)
  return Object.assign(new Error(mensagem), {
    status,
    requisicao: {
      quando: new Date().toISOString(),
      moduleId: 'fechamento-ifood-diario',
      handler: 'vendas',
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
 * e 5xx; 504 e recusas (4xx) não repetem. O 429 e a página vazia não chegam aqui: o
 * handler `vendas` responde `adiar` e a fila trata.
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

/**
 * A consulta do dia em partes, para a tabela aparecer antes do fim:
 *
 * 1. **Ao mesmo tempo**: os pedidos do DW (uma chamada, a loja inteira) e as vendas do
 *    iFood de cada restaurante da loja, numa fila com até `CONCORRENCIA_MAX` chamadas
 *    juntas (menos quando o iFood oscila): primeiro a página 1 de cada restaurante (que
 *    diz quantas páginas ele tem), e as demais entram na fila conforme chegam.
 * 2. **Aos poucos**: assim que os pedidos do DW chegam, a tabela aparece e vai sendo
 *    cruzada a cada página do iFood (`completo: false`); o pedido ainda não achado fica
 *    Aguardando. Os valores do dia só saem com as duas partes completas — número
 *    parcial não pode ficar na tela como se fosse o do dia.
 * 3. **Retentativa** (a do Fechamento iFood Mensal 0.1.1, medida em 13 e 16/11/2026):
 *    - vendas vazias ou 429 com saldo: o servidor repete na hora; se não passar, a
 *      página volta para o fim da fila (até `ADIAMENTOS_MAX` vezes);
 *    - cota esgotada (saldo 0): TODAS as chamadas pausam até o `ifood-ratelimit-reset`
 *      + 1 s, e a página volta para o começo da fila; com saldo abaixo de
 *      `SALDO_MINIMO`, a pausa vem antes do 429 (freio);
 *    - rede ou servidor (5xx): até 2 novas tentativas (1,5 s e 4 s, com variação);
 *      tempo esgotado (504) não se repete.
 *
 * Falha nos pedidos do DW derruba a consulta (sem eles não há fechamento) e não é
 * repetida (a chamada pode levar até 90 s antes de falhar). Página do iFood que esgota
 * as tentativas, ou a credencial do iFood recusada, também derruba: um pedido não pode
 * aparecer como Cancelado porque o iFood não respondeu. Só a recusa definitiva de UM
 * restaurante (403/404) vira aviso, e os outros seguem. Uma consulta nova abandona a
 * anterior.
 */
export function useConsultaDiaria() {
  const [fase, setFase] = useState<FaseConsulta>('ocioso')
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

  const consultar = useCallback(async (consulta: Consulta) => {
    const minha = ++geracao.current
    const ativo = () => geracao.current === minha
    const { empresaId, data, restaurantes } = consulta

    setFase('consultando')
    setErro(null)
    setErroOriginal(null)
    setResultado(null)

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

    // Vendas do iFood: fila de páginas (restaurante, página), com trabalhadores que
    // respeitam a pausa compartilhada e o limite de chamadas ao mesmo tempo (adaptativo).
    // A página 1 de cada restaurante põe as demais dele na fila.
    const buscarVendas = async () => {
      const rotulo = (merchant: string) => {
        const r = nomes.get(merchant)
        if (!r) return 'iFood'
        return r.operacao && r.nome !== r.operacao ? `${r.nome} (${r.operacao})` : r.nome
      }
      type Item = { merchant: string; pagina: number; adiamentos: number; pausas: number }
      const fila: Item[] = restaurantes.map((r) => ({
        merchant: r.merchant,
        pagina: 1,
        adiamentos: 0,
        pausas: 0,
      }))
      const concorrenciaMax = Math.max(1, Math.min(CONCORRENCIA_MAX, restaurantes.length))
      let limite = concorrenciaMax
      let limpasSeguidas = 0
      let ultimaReducao = 0
      let pausa: { ate: number } | null = null
      let emAndamento = 0
      // Primeira falha: os outros trabalhadores param sem pedir mais nada.
      let falha: unknown = null

      /** Pausa TODAS as chamadas até `ms` daqui (a maior pausa pedida vale). */
      const pausar = (ms: number) => {
        const ate = Date.now() + ms + Math.round(Math.random() * 500)
        if (!pausa || pausa.ate < ate) pausa = { ate }
      }
      const aguardarPausa = async () => {
        while (pausa && pausa.ate > Date.now()) {
          if (!ativo() || falha) return
          await esperar(Math.min(250, pausa.ate - Date.now()))
        }
        pausa = null
      }
      /** Concorrência adaptativa: cai quando o iFood oscila, volta quando normaliza. */
      const ajustarRitmo = (resp: RespostaVendas) => {
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
        const { merchant, pagina } = item
        const resp = await comNovaTentativa(
          () => buscarPaginaVendas({ empresaId, data, merchant, pagina }),
          ativo
        )
        if (!ativo()) throw new Cancelada()
        ajustarRitmo(resp)
        if (resp.adiar) {
          // A página não veio: pede de novo depois. Nada do que já chegou é refeito.
          const body = { empresaId, data, merchant, pagina }
          if (resp.adiar.motivo === 'cota') {
            item.pausas += 1
            if (item.pausas > PAUSAS_COTA_MAX)
              throw erroDaPagina(
                429,
                'O limite de consultas do iFood continuou esgotado por vários minutos. Tente pesquisar de novo mais tarde.',
                body
              )
            fila.unshift(item)
            pausar(resp.adiar.esperarMs)
          } else {
            item.adiamentos += 1
            if (item.adiamentos > ADIAMENTOS_MAX)
              throw erroDaPagina(
                502,
                resp.adiar.motivo === 'incompleta'
                  ? `O iFood devolveu as vendas de ${rotulo(merchant)} sem os dados financeiros várias vezes seguidas. Tente pesquisar de novo em alguns minutos.`
                  : 'O iFood recusou as consultas várias vezes seguidas (muitas requisições). Tente pesquisar de novo em alguns minutos.',
                body
              )
            fila.push(item)
          }
          return
        }
        // Freio: saldo da cota quase no fim — para todos até renovar, antes do 429.
        if (resp.cota && resp.cota.restantes < SALDO_MINIMO) pausar(resp.cota.resetS * 1000 + 1000)
        if (pagina === 1) {
          if (resp.restaurante) {
            nomes.set(merchant, {
              nome: resp.restaurante,
              operacao: nomes.get(merchant)?.operacao ?? '',
            })
          }
          // Recusa definitiva deste restaurante (403/404): aviso; os outros seguem.
          if (resp.aviso) avisos.push(`${rotulo(merchant)}: ${resp.aviso}`)
          for (let n = 2; n <= resp.totalPaginas; n++)
            fila.push({ merchant, pagina: n, adiamentos: 0, pausas: 0 })
        }
        vendas.push(...resp.vendas)
        publicarParcial()
      }

      const trabalhador = async () => {
        for (;;) {
          // Pesquisa trocada por outra ou com erro: para sem pedir mais nada.
          if (!ativo() || falha) return
          await aguardarPausa()
          if (!ativo() || falha) return
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
          } catch (e) {
            falha ??= e
            return
          } finally {
            emAndamento -= 1
          }
        }
      }

      await Promise.all(Array.from({ length: concorrenciaMax }, trabalhador))
      if (!ativo()) throw new Cancelada()
      if (falha) throw falha
    }

    try {
      const [dw] = await Promise.all([
        // Sem nova tentativa: a chamada ao DW pode levar até 90 s antes de falhar.
        buscarPedidos({ empresaId, data }).then((r: RespostaPedidos) => {
          if (!ativo()) throw new Cancelada()
          dwPronto = r
          publicarParcial()
          return r
        }),
        buscarVendas(),
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
      setResultado(null)
      setErro(e instanceof Error ? e.message : 'Falha ao consultar o fechamento.')
      setErroOriginal(e)
      setFase('erro')
    }
  }, [])

  return { fase, resultado, erro, erroOriginal, consultar }
}
