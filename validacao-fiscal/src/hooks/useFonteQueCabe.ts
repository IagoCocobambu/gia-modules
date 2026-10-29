import { useLayoutEffect } from 'react'

/** Menor escala aceita — abaixo disso o texto fica ilegível; prefere-se transbordar. */
const ESCALA_MINIMA = 0.6
const PASSO = 0.05

/**
 * Reduz a fonte quando um elemento começa a invadir o outro. Grava no elemento a
 * variável CSS `--escala` (1 = tamanho normal) — quem quer encolher usa
 * `text-[length:calc(<tamanho>*var(--escala,1))]`. As linhas a vigiar levam o
 * atributo `data-cabe`; se alguma transborda (`scrollWidth > clientWidth`), a escala
 * desce em passos de 5% até tudo caber ou chegar em {@link ESCALA_MINIMA}.
 *
 * Recebe o elemento via callback ref (`useState` + `ref={setEl}`), como o
 * `useModoCompacto`. `conteudo` refaz a medida quando o texto muda (ex.: os totais).
 */
export function useFonteQueCabe(el: HTMLElement | null, conteudo: unknown): void {
  // Layout effect: ajusta antes da 1ª pintura — sem piscar o texto sobreposto.
  useLayoutEffect(() => {
    if (!el) return

    const ajustar = () => {
      const linhas = Array.from(el.querySelectorAll<HTMLElement>('[data-cabe]'))
      const transborda = () => linhas.some((l) => l.scrollWidth > l.clientWidth)
      let escala = 1
      el.style.setProperty('--escala', '1')
      while (escala > ESCALA_MINIMA && transborda()) {
        escala = Math.max(ESCALA_MINIMA, Math.round((escala - PASSO) * 100) / 100)
        el.style.setProperty('--escala', String(escala))
      }
    }

    ajustar()
    if (typeof ResizeObserver === 'undefined') return

    // Só a LARGURA importa; a altura muda com a própria fonte e não deve re-disparar.
    let largura = el.getBoundingClientRect().width
    const ro = new ResizeObserver(() => {
      const nova = el.getBoundingClientRect().width
      if (nova === largura) return
      largura = nova
      ajustar()
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [el, conteudo])
}
