import { useLayoutEffect, useRef, type CSSProperties, type RefObject } from 'react'
import { usePrefersReducedMotion } from '@gia-cb/ui'

// A entrada da Visão geral: os blocos surgem em cascata ao fim do carregamento,
// os que estão mais abaixo surgem quando a rolagem chega neles, e dentro de cada
// gráfico os dados surgem — a barra cresce, a linha se desenha, o ponto aparece.
//
// ── POR QUE A API DE ANIMAÇÃO DO NAVEGADOR, E NÃO FRAMER MOTION ─────────────
//
// A SDK recomenda os presets de Framer Motion para o que se CONSTRÓI além dos
// componentes dela, mas o `framer-motion` não é dependência deste módulo — só
// da SDK —, e nenhum módulo do repositório o importa. As marcas daqui são
// elementos de SVG desenhados à mão (um `<path>` por barra, um `<circle>` por
// loja); embrulhar cada um num `motion.*` mudaria os oito gráficos. O
// `element.animate()` anima o elemento que já existe, a partir de um atributo.
//
// A duração e a curva são os TOKENS da SDK (`--duration-slow`,
// `--ease-default`), lidos da folha de estilos em tempo de execução — mudar o
// token no portal muda a animação aqui.
//
// ── APARECER AO ROLAR ───────────────────────────────────────────────────────
//
// Pedido do João (14/09/2026). O bloco que já está à vista quando o carregamento
// termina entra na cascata, como antes. O que está abaixo da dobra ganha a MESMA
// animação, criada PAUSADA no primeiro quadro — é o que o mantém invisível, sem
// estilo inline para desfazer depois —, e um `IntersectionObserver` a toca
// quando o bloco entra na área visível. Uma vez só: rolar para cima e para baixo
// não o faz sumir de novo.
//
// As marcas de um gráfico escondido nascem pausadas também, e esperam o evento
// `EVENTO_REVELADO` do bloco. Sem isso elas cresceriam fora da tela, no
// carregamento, e o usuário chegaria nelas já paradas.
//
// O custo é um observador para ~16 blocos, e animação só de opacidade e
// deslocamento, que o compositor resolve sem recalcular o layout. O gráfico já
// está montado; a rolagem só toca a animação dele.
//
// ── RÁPIDA DE PROPÓSITO ─────────────────────────────────────────────────────
//
// A animação existe para mostrar DE ONDE vem o número, não para fazer esperar.
// O último bloco da cascata começa a ~0,5 s e as marcas de um gráfico se
// espalham em no máximo 0,3 s.
//
// ── MOVIMENTO REDUZIDO E IMPRESSÃO ──────────────────────────────────────────
//
// Com `prefers-reduced-motion` não há cascata nem espera pela rolagem: tudo
// esmaece de uma vez — a regra dos componentes da SDK (`conventions.md` §8: o
// fade continua, slide e scale desligam).
//
// Antes de imprimir, toda animação pendente é concluída: o que ainda não tinha
// sido rolado sairia em branco no papel.

const DESLOCAMENTO_PX = 8
/** Folga entre o bloco começar a surgir e as marcas dele começarem. */
const FOLGA_MARCAS_MS = 80
/** Espalhamento máximo da cascata de marcas de um gráfico. */
const TETO_CASCATA_MARCAS_MS = 300
const PASSO_MARCA_MS = 25
/** Intervalo entre blocos que entram na tela na mesma rolagem. */
const PASSO_REVELACAO_MS = 70
/** Quanto do bloco precisa aparecer para ele surgir. */
const LIMIAR_VISIVEL = 0.12
/** Um bloco com menos que isto à vista no carregamento espera a rolagem. */
const BORDA_VISIVEL_PX = 24

const ID_ENTRADA = 'entrada-do-bloco'
const ID_MARCA = 'entrada-da-marca'
const EVENTO_REVELADO = 'entrada:revelado'

function msDoToken(el: Element, token: string, padrao: number): number {
  const bruto = getComputedStyle(el).getPropertyValue(token).trim()
  const n = parseFloat(bruto)
  if (!Number.isFinite(n)) return padrao
  return bruto.endsWith('ms') ? n : bruto.endsWith('s') ? n * 1000 : n
}

function curvaPadrao(el: Element): string {
  return (
    getComputedStyle(el).getPropertyValue('--ease-default').trim() || 'cubic-bezier(0.4, 0, 0.2, 1)'
  )
}

/**
 * Marca um bloco para a entrada, com o atraso dele na cascata.
 *
 * O atraso vai numa propriedade CSS, e não num atributo, porque é herdável: os
 * gráficos dentro do bloco não precisam recebê-lo por prop.
 */
export function entrada(atrasoMs: number): { 'data-entrada': string; style: CSSProperties } {
  return {
    'data-entrada': '',
    style: { ['--atraso-entrada' as string]: `${atrasoMs}ms` } as CSSProperties,
  }
}

const EVENTO_REVELAR_JA = 'entrada:revelar-ja'

/**
 * Revela AGORA um bloco que ainda espera a rolagem — o cartão que vai para a
 * tela cheia. Em tela cheia ele é `position: fixed`, e o `IntersectionObserver`
 * preso ao contêiner que rola nunca o vê cruzar: sem isto, o cartão expandido
 * antes de chegar à vista ficaria invisível. Bloco já revelado ignora o aviso.
 */
export function revelarJa(bloco: HTMLElement | null): void {
  bloco?.dispatchEvent(new CustomEvent(EVENTO_REVELAR_JA))
}

/**
 * Anima os blocos `[data-entrada]` de dentro de `ref` quando `ativo` vira
 * verdadeiro — o fim do carregamento. `ref` é o contêiner que ROLA: é contra a
 * área visível dele que se decide o que já está à vista.
 *
 * Trocar de indicador ou de tema não repete nada: a entrada é a chegada dos
 * dados, não a reação a cada clique. Voltar a carregar (outro mês) desmonta a
 * visão, e a próxima montagem anima de novo.
 */
export function useEntradaEmCascata(ref: RefObject<HTMLElement | null>, ativo: boolean) {
  const reduzido = usePrefersReducedMotion()
  const jaAnimou = useRef(false)

  useLayoutEffect(() => {
    const raiz = ref.current
    if (!ativo || !raiz || jaAnimou.current || typeof raiz.animate !== 'function') return
    jaAnimou.current = true
    const duracao = msDoToken(raiz, '--duration-slow', 320)
    const easing = curvaPadrao(raiz)
    const blocos = [...raiz.querySelectorAll<HTMLElement>('[data-entrada]')]

    if (reduzido) {
      const animacoes = blocos.map((el) =>
        el.animate([{ opacity: 0 }, { opacity: 1 }], {
          id: ID_ENTRADA,
          duration: duracao,
          easing,
          fill: 'backwards',
        })
      )
      return () => {
        animacoes.forEach((a) => a.cancel())
        jaAnimou.current = false
      }
    }

    const quadros = [
      { opacity: 0, transform: `translateY(${DESLOCAMENTO_PX}px)` },
      { opacity: 1, transform: 'translateY(0)' },
    ]
    const areaVisivel = raiz.getBoundingClientRect()
    const animacoes: Animation[] = []
    const aguardando = new Map<HTMLElement, Animation>()

    for (const el of blocos) {
      const r = el.getBoundingClientRect()
      const aVista = r.top < areaVisivel.bottom - BORDA_VISIVEL_PX && r.bottom > areaVisivel.top
      const atraso = parseFloat(getComputedStyle(el).getPropertyValue('--atraso-entrada')) || 0
      const a = el.animate(quadros, {
        id: ID_ENTRADA,
        duration: duracao,
        delay: aVista ? atraso : 0,
        easing,
        fill: 'backwards',
      })
      animacoes.push(a)
      if (!aVista) {
        // Pausada no instante zero, a animação aplica o primeiro quadro: o
        // bloco fica invisível e deslocado até a rolagem chegar nele.
        a.pause()
        aguardando.set(el, a)
      }
    }

    const revelar = (el: HTMLElement, atraso: number) => {
      const a = aguardando.get(el)
      if (!a) return
      aguardando.delete(el)
      a.effect?.updateTiming({ delay: atraso })
      a.play()
      el.dispatchEvent(new CustomEvent(EVENTO_REVELADO, { detail: { atraso } }))
    }

    const observador = new IntersectionObserver(
      (entradas) => {
        // Os que entram juntos surgem em ordem de leitura — de cima para baixo,
        // da esquerda para a direita —, com um passo curto entre eles.
        const visiveis = entradas
          .filter((e) => e.isIntersecting && aguardando.has(e.target as HTMLElement))
          .sort(
            (a, b) =>
              a.boundingClientRect.top - b.boundingClientRect.top ||
              a.boundingClientRect.left - b.boundingClientRect.left
          )
        visiveis.forEach((e, i) => {
          observador.unobserve(e.target)
          revelar(e.target as HTMLElement, i * PASSO_REVELACAO_MS)
        })
      },
      { root: raiz, threshold: LIMIAR_VISIVEL }
    )
    aguardando.forEach((_, el) => observador.observe(el))

    // O bloco que ainda espera a rolagem pode ser chamado à vista na hora — é o
    // cartão que vai para a tela cheia (ver `revelarJa`).
    const revelarJaAoPedir = (ev: Event) => {
      const el = ev.currentTarget as HTMLElement
      observador.unobserve(el)
      revelar(el, 0)
    }
    aguardando.forEach((_, el) => el.addEventListener(EVENTO_REVELAR_JA, revelarJaAoPedir))

    const antesDeImprimir = () => {
      observador.disconnect()
      aguardando.clear()
      document.getAnimations().forEach((a) => {
        if (a.id === ID_ENTRADA || a.id === ID_MARCA) a.finish()
      })
    }
    window.addEventListener('beforeprint', antesDeImprimir)

    return () => {
      window.removeEventListener('beforeprint', antesDeImprimir)
      blocos.forEach((el) => el.removeEventListener(EVENTO_REVELAR_JA, revelarJaAoPedir))
      observador.disconnect()
      animacoes.forEach((a) => a.cancel())
      // No modo estrito do React o efeito roda, desfaz e roda de novo: sem
      // devolver a trava, a segunda rodada não animaria nada.
      jaAnimou.current = false
    }
  }, [ref, ativo, reduzido])
}

/**
 * Onde está o bloco em volta das marcas: ainda esperando a rolagem (`aguardando`),
 * surgindo (quanto falta para começar), ou já surgido.
 */
function estadoDoBloco(el: Element): { aguardando: HTMLElement | null; atraso: number } {
  const bloco = el.closest<HTMLElement>('[data-entrada]')
  const anim = bloco?.getAnimations().find((a) => a.id === ID_ENTRADA && a.playState !== 'finished')
  if (!bloco || !anim) return { aguardando: null, atraso: 0 }
  if (anim.playState === 'paused') return { aguardando: bloco, atraso: 0 }
  const atraso = Number(anim.effect?.getTiming().delay ?? 0)
  const decorrido = Number(anim.currentTime ?? 0)
  return { aguardando: null, atraso: Math.max(0, atraso - decorrido) + FOLGA_MARCAS_MS }
}

type Marca = 'barra' | 'coluna' | 'linha' | 'ponto' | 'celula' | 'aparecer'

/**
 * Faz os dados de um gráfico surgirem: as marcas `[data-marca]` de dentro de
 * `ref`.
 *
 * - `barra` cresce na horizontal a partir de `data-origem` (`left`/`right`);
 * - `coluna` cresce de baixo para cima (de cima para baixo com `data-origem="top"`);
 * - `linha` se desenha do começo ao fim;
 * - `ponto` aparece crescendo do centro;
 * - `celula` e `aparecer` esmaecem — `aparecer` (rótulos, réguas) vem depois
 *   das marcas, para o número não chegar antes do dado.
 *
 * `data-ordem` define a posição na cascata (a linha do mapa de calor); sem ele,
 * vale a ordem no documento.
 *
 * Roda quando o SVG passa a existir (`pronto`) e quando `dados` muda — trocar
 * de indicador redesenha as barras crescendo. Por isso `dados` precisa ser
 * ESTÁVEL entre renders: um array recriado a cada render faria o gráfico
 * reanimar a cada passada do ponteiro.
 */
export function useAnimarMarcas(
  ref: RefObject<HTMLElement | null>,
  pronto: boolean,
  dados: unknown
) {
  const reduzido = usePrefersReducedMotion()

  useLayoutEffect(() => {
    const raiz = ref.current
    if (!pronto || !raiz || typeof raiz.animate !== 'function') return
    const duracao = msDoToken(raiz, '--duration-slow', 320)
    const easing = curvaPadrao(raiz)
    const { aguardando, atraso: base } = estadoDoBloco(raiz)

    const porTipo = new Map<Marca, SVGGraphicsElement[]>()
    for (const el of raiz.querySelectorAll<SVGGraphicsElement>('[data-marca]')) {
      const tipo = el.dataset.marca as Marca
      porTipo.set(tipo, [...(porTipo.get(tipo) ?? []), el])
    }

    /** Cada animação com o atraso PRÓPRIO dela, sem o do bloco. */
    const animacoes: Array<{ a: Animation; deslocamento: number }> = []
    const criar = (
      el: Element,
      quadros: Keyframe[],
      deslocamento: number,
      duracaoDaMarca = duracao
    ) => {
      const a = el.animate(quadros, {
        id: ID_MARCA,
        duration: duracaoDaMarca,
        delay: base + deslocamento,
        easing,
        fill: 'backwards',
      })
      if (aguardando) a.pause()
      animacoes.push({ a, deslocamento })
      return a
    }

    porTipo.forEach((els, tipo) => {
      const ordens = els.map((el, i) => (el.dataset.ordem != null ? Number(el.dataset.ordem) : i))
      const maiorOrdem = Math.max(...ordens, 1)
      const passo = Math.min(PASSO_MARCA_MS, TETO_CASCATA_MARCAS_MS / maiorOrdem)

      els.forEach((el, i) => {
        const opacidadeFinal = getComputedStyle(el).opacity || '1'
        if (reduzido) {
          criar(el, [{ opacity: 0 }, { opacity: opacidadeFinal }], 0)
          return
        }

        const deslocamento =
          tipo === 'aparecer'
            ? Math.min(TETO_CASCATA_MARCAS_MS, passo * maiorOrdem) + duracao / 2
            : ordens[i] * passo

        if (tipo === 'linha' && el instanceof SVGGeometryElement) {
          const comprimento = el.getTotalLength()
          el.style.strokeDasharray = `${comprimento}`
          // A linha é a única marca que atravessa o gráfico inteiro: no tempo
          // de uma barra ela passaria como um risco.
          const a = criar(
            el,
            [{ strokeDashoffset: comprimento }, { strokeDashoffset: 0 }],
            deslocamento,
            duracao * 2
          )
          const limpar = () => {
            el.style.strokeDasharray = ''
          }
          a.onfinish = limpar
          a.oncancel = limpar
          return
        }

        let quadros: Keyframe[]
        if (tipo === 'barra') {
          el.style.transformBox = 'fill-box'
          el.style.transformOrigin = `${el.dataset.origem === 'right' ? 'right' : 'left'} center`
          quadros = [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }]
        } else if (tipo === 'coluna') {
          el.style.transformBox = 'fill-box'
          // A coluna negativa cresce da linha do zero para BAIXO: a base dela é
          // o topo da caixa (`data-origem="top"`).
          el.style.transformOrigin = `center ${el.dataset.origem === 'top' ? 'top' : 'bottom'}`
          quadros = [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }]
        } else if (tipo === 'ponto') {
          el.style.transformBox = 'fill-box'
          el.style.transformOrigin = 'center'
          quadros = [
            { opacity: 0, transform: 'scale(0)' },
            { opacity: opacidadeFinal, transform: 'scale(1)' },
          ]
        } else {
          quadros = [{ opacity: 0 }, { opacity: opacidadeFinal }]
        }
        criar(el, quadros, deslocamento)
      })
    })

    // O bloco ainda está abaixo da dobra: as marcas ficam no primeiro quadro e
    // tocam junto com ele, com a mesma folga de quem já estava à vista.
    const aoRevelar = (e: Event) => {
      const atrasoDoBloco = (e as CustomEvent<{ atraso: number }>).detail?.atraso ?? 0
      for (const { a, deslocamento } of animacoes) {
        a.effect?.updateTiming({ delay: atrasoDoBloco + FOLGA_MARCAS_MS + deslocamento })
        a.play()
      }
    }
    aguardando?.addEventListener(EVENTO_REVELADO, aoRevelar, { once: true })

    return () => {
      aguardando?.removeEventListener(EVENTO_REVELADO, aoRevelar)
      animacoes.forEach(({ a }) => a.cancel())
    }
  }, [ref, pronto, dados, reduzido])
}
