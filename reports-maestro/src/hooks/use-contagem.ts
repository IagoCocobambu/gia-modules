import { useLayoutEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '@gia-cb/ui'

// A contagem do zero até o valor dos números de destaque — ver o comentário em
// components/graficos/NumeroAnimado.tsx, que é quem usa este hook em HTML.

export type Formatar = (v: number | null) => string

/** Duração da contagem, a partir do token de movimento do portal. */
function duracaoDaContagem(el: Element): number {
  const bruto = getComputedStyle(el).getPropertyValue('--duration-slow').trim()
  const n = parseFloat(bruto)
  const ms = !Number.isFinite(n)
    ? 350
    : bruto.endsWith('ms')
      ? n
      : bruto.endsWith('s')
        ? n * 1000
        : n
  return ms * 2
}

/**
 * Liga a contagem a um elemento cujo único filho é o texto formatado do valor.
 * Devolve a `ref` para o elemento e o texto final para renderizar.
 */
export function useContagem<T extends Element>(
  valor: number | null | undefined,
  formatar: Formatar
) {
  const ref = useRef<T>(null)
  const reduzido = usePrefersReducedMotion()
  const formatarRef = useRef(formatar)
  useLayoutEffect(() => {
    formatarRef.current = formatar
  })
  const texto = formatar(valor ?? null)

  useLayoutEffect(() => {
    const el = ref.current
    const no = el?.firstChild
    if (!el || !no || no.nodeType !== Node.TEXT_NODE) return
    const fmt = formatarRef.current
    const final = fmt(valor ?? null)
    no.nodeValue = final
    if (valor == null || !Number.isFinite(valor) || valor === 0 || reduzido) return

    const inteiro = Number.isInteger(valor)
    const escrever = (v: number) => {
      no.nodeValue = fmt(inteiro ? Math.round(v) : v)
    }
    escrever(0)

    const duracao = duracaoDaContagem(el)
    let quadro = 0
    let inicio = 0
    const passo = (t: number) => {
      if (!inicio) inicio = t
      const p = Math.min((t - inicio) / duracao, 1)
      // Saída cúbica: rápido no começo, assenta devagar no valor.
      escrever(valor * (1 - (1 - p) ** 3))
      if (p < 1) quadro = requestAnimationFrame(passo)
      else no.nodeValue = final
    }
    const observador = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return
        observador.disconnect()
        quadro = requestAnimationFrame(passo)
      },
      { threshold: 0.1 }
    )
    observador.observe(el)
    return () => {
      observador.disconnect()
      cancelAnimationFrame(quadro)
      no.nodeValue = final
    }
  }, [valor, reduzido])

  return { ref, texto }
}
