import { useLayoutEffect, useState } from 'react'

/** Abaixo desta largura (px) a tela usa o layout de celular — o mesmo corte do
 *  `DataReport` (`@3xl` = 48rem), que vira lista de cards nesse ponto. */
export const LARGURA_COMPACTA = 768

/**
 * `true` quando o CONTAINER da tela é estreito (celular). Mede a largura do
 * elemento — não da janela — pelo mesmo motivo do `DataReport`: o seletor de
 * Viewport do dev-shell e painéis estreitos do portal limitam a largura da área
 * do módulo sem mudar a janela, e media query (`sm:`/`md:`) não enxerga isso.
 *
 * Recebe o elemento (via callback ref, ex. `useState` + `ref={setEl}`), para
 * voltar a medir quando ele monta depois do primeiro render.
 */
export function useModoCompacto(el: HTMLElement | null): boolean {
  const [compacto, setCompacto] = useState(false)

  // Layout effect: mede antes da 1ª pintura — sem piscar o layout de desktop no celular.
  useLayoutEffect(() => {
    if (!el || typeof ResizeObserver === 'undefined') return
    const medir = (largura: number) => setCompacto(largura > 0 && largura < LARGURA_COMPACTA)
    medir(el.getBoundingClientRect().width)
    const ro = new ResizeObserver((entries) => medir(entries[0]?.contentRect.width ?? 0))
    ro.observe(el)
    return () => ro.disconnect()
  }, [el])

  return compacto
}
