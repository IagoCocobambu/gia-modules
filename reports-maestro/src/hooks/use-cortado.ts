import { useEffect, useState, type RefObject } from 'react'

/**
 * O texto do elemento está CORTADO pelo `truncate`?
 *
 * Serve para só mostrar a dica quando ela acrescenta algo: título que cabe
 * inteiro não precisa de dica, e uma dica que repete o que está à vista vira
 * ruído em sete cartões (pedido do João, 21/09/2026 — "Rentabilidade m…").
 *
 * A resposta muda com a LARGURA (o cartão encolhe, a tela vira retrato) e com o
 * TEXTO (o título do cartão de indicadores muda a cada escolha), então o
 * `ResizeObserver` observa o elemento e o `texto` entra nas dependências.
 *
 * `scrollWidth > clientWidth` é a medida do próprio navegador para "não coube".
 * O +1 absorve o arredondamento de subpixel de fonte escalada, que faria um
 * título justo oscilar entre cortado e inteiro a cada redesenho.
 */
export function useCortado(ref: RefObject<HTMLElement | null>, texto: string): boolean {
  const [cortado, setCortado] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const medir = () => {
      // ☠️ Largura ZERO não é "coube": é elemento escondido. O cartão nasce
      // dentro da cascata de entrada e o `ResizeObserver` chega a vê-lo em 0×0 —
      // medido em 21/09/2026, era essa medição que apagava a dica logo depois de
      // ela aparecer. Enquanto não há largura, vale a última resposta.
      if (el.clientWidth === 0) return
      setCortado(el.scrollWidth > el.clientWidth + 1)
    }
    medir()
    const obs = new ResizeObserver(medir)
    obs.observe(el)
    return () => obs.disconnect()
  }, [ref, texto])

  return cortado
}
