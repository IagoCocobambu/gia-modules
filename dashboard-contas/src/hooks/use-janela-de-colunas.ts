import { useEffect, useRef, useState } from 'react'
import { janelaDeColunas, type Janela } from '../janela-de-colunas'

/**
 * Enquanto a grade não foi medida, a janela supõe esta largura. Errar para MAIS
 * custa algumas colunas a mais no primeiro desenho; errar para menos deixaria
 * um vazio à direita até a primeira medida. O ajuste vem no quadro seguinte.
 */
const VISTA_SUPOSTA = 1600

/**
 * A janela de colunas de uma grade larga — as colunas fora da vista deixam de
 * ser desenhadas (o porquê e o preço estão em `janela-de-colunas.ts`).
 *
 * Devolve a `ref` para o elemento que ENVOLVE a grade e a janela atual. As
 * larguras precisam vir memorizadas: elas são a dependência do efeito.
 *
 * ── ☠️ CONTORNO: O CONTAINER QUE ROLA É DA SDK ──────────────────────────────
 *
 * Quem rola na horizontal é um `div` interno do `DataReport`, que o módulo não
 * recebe por prop nem por ref. A posição vem do EVENTO de rolagem, ouvido na
 * fase de CAPTURA — `scroll` não borbulha, mas propaga na captura, então o
 * evento passa pelo elemento de fora qualquer que seja a profundidade dele.
 *
 * O que quebra se eles mudarem a grade: nada enquanto ela rolar sozinha na
 * horizontal. Se a rolagem passar para a PÁGINA (sem container próprio), o
 * evento deixa de passar por aqui, a janela congela na primeira e a grade
 * mostra só as primeiras colunas — o sintoma a procurar. Nenhum seletor de
 * classe, id ou estrutura é usado.
 */
export function useJanelaDeColunas(
  larguras: readonly number[],
  inicio: number,
  /**
   * Recebe a largura da vista a cada mudança — para quem decide o que cabe nela
   * (os alfinetes da Comparativos). Precisa de identidade estável.
   */
  aoMedirVista?: (largura: number) => void
) {
  const alvo = useRef<HTMLDivElement>(null)
  // A última rolagem conhecida, mais a ESCALA entre a largura real da tabela e a
  // largura que as contas preveem (`meta.width` é piso, não medida fixa).
  const medida = useRef({ esquerda: 0, vista: 0, escala: 1 })
  const [janela, setJanela] = useState<Janela>(() =>
    janelaDeColunas(larguras, inicio, { esquerda: 0, vista: VISTA_SUPOSTA })
  )

  useEffect(() => {
    const el = alvo.current
    if (!el) return
    const total = larguras.reduce((a, b) => a + b, inicio)

    const recalcular = () => {
      const { esquerda, vista, escala } = medida.current
      const nova = janelaDeColunas(larguras, inicio, {
        esquerda: esquerda / escala,
        vista: (vista || VISTA_SUPOSTA) / escala,
      })
      setJanela((atual) => (atual.de === nova.de && atual.ate === nova.ate ? atual : nova))
    }

    const aoRolar = (e: Event) => {
      const rolado = e.target
      if (!(rolado instanceof HTMLElement)) return
      // Rolagem VERTICAL (a mesma grade rola nos dois eixos) não move a janela.
      if (rolado.scrollWidth <= rolado.clientWidth) return
      const escala = rolado.scrollWidth / total
      medida.current = {
        esquerda: rolado.scrollLeft,
        vista: rolado.clientWidth,
        // Escala absurda é medida de outra coisa — vale 1, e a folga cobre.
        escala: escala > 0.5 && escala < 2 ? escala : 1,
      }
      recalcular()
    }

    el.addEventListener('scroll', aoRolar, true)
    // A largura muda por tela cheia, pelo seletor de viewport e pela janela do
    // navegador. O elemento de fora é um pouco mais largo que o container que
    // rola (o cartão tem recuo), e sobrar largura só aumenta a folga.
    const obs = new ResizeObserver(() => {
      const largura = el.clientWidth
      if (largura > 0) aoMedirVista?.(largura)
      if (largura === 0 || Math.abs(medida.current.vista - largura) < 1) return
      medida.current = { ...medida.current, vista: largura }
      recalcular()
    })
    obs.observe(el)
    recalcular()

    return () => {
      el.removeEventListener('scroll', aoRolar, true)
      obs.disconnect()
    }
  }, [larguras, inicio, aoMedirVista])

  return { alvo, janela }
}
