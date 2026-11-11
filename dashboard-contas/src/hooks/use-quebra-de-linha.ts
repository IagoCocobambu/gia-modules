import { useEffect, useState, type RefObject } from 'react'

/**
 * As peças da linha cabem lado a lado, na largura que ela tem?
 *
 * A conta é a LARGURA NATURAL de cada filho — a soma dos filhos visíveis dele,
 * com o espaçamento — contra a largura do elemento. Não é "algum filho desceu de
 * linha": a barra do topo MUDA de arranjo quando não cabe (os filtros vão para
 * uma linha só deles), e medir a quebra depois da mudança diria "quebrou" para
 * sempre, mesmo com a janela voltando a ter espaço. A largura natural não depende
 * do arranjo, então a resposta não se autoalimenta.
 *
 * Filho marcado com `data-fora-da-medida` não entra: é a seta de recolher, que só
 * existe QUANDO não cabe — contá-la faria a barra não caber por causa dela.
 *
 * ── ☠️ NADA QUE DEPENDA DA RESPOSTA PODE MUDAR A MEDIDA ──────────────────────
 *
 * Elemento que aparece só quando a barra CABE precisa ocupar o lugar dele nos
 * dois arranjos (`invisible`, não `hidden`); elemento que aparece só quando ela
 * NÃO cabe precisa de `data-fora-da-medida`. Quebrar isso não dá tela vermelha:
 * a barra troca de arranjo para sempre, dezenas de vezes por segundo, e o
 * usuário vê a linha piscando (aconteceu em 23/09/2026 com o risquinho
 * separador, que custava 7 px numa folga de 2).
 *
 * A FOLGA abaixo é a rede de segurança dessa regra. Ela é assimétrica de
 * propósito: SAIR de "cabe" é imediato — a barra nunca continua dizendo que
 * cabe depois de não caber —, e ENTRAR exige sobra. Assim, qualquer peça que
 * nasça ao caber e custe menos que a folga não consegue derrubar a resposta que
 * a trouxe.
 *
 * `medir` desliga a medição com a barra recolhida: sem os filtros à vista, tudo
 * cabe, e a resposta esconderia a seta que os traz de volta.
 */
/** A sobra exigida para a barra VOLTAR a caber. Ver a nota acima. */
const FOLGA = 8

export function useCabeNumaLinha(ref: RefObject<HTMLElement | null>, medir: boolean): boolean {
  const [cabe, setCabe] = useState(true)

  useEffect(() => {
    const el = ref.current
    if (!el || !medir) return

    const larguraNatural = (no: HTMLElement): number => {
      const filhos = [...no.children].filter(
        (c): c is HTMLElement =>
          c instanceof HTMLElement && c.offsetHeight > 0 && !c.hasAttribute('data-fora-da-medida')
      )
      if (filhos.length === 0) return no.scrollWidth
      const gap = parseFloat(getComputedStyle(no).columnGap) || 0
      return filhos.reduce((soma, f) => soma + f.scrollWidth, 0) + gap * (filhos.length - 1)
    }

    const obs = new ResizeObserver(() => {
      const pecas = [...el.children].filter(
        (c): c is HTMLElement => c instanceof HTMLElement && c.offsetHeight > 0
      )
      const gap = parseFloat(getComputedStyle(el).columnGap) || 0
      const necessario =
        pecas.reduce((soma, p) => soma + larguraNatural(p), 0) + gap * Math.max(pecas.length - 1, 0)
      setCabe((atual) => {
        const limite = el.clientWidth + 1
        return atual ? necessario <= limite : necessario <= limite - FOLGA
      })
    })
    obs.observe(el)
    for (const peca of el.children) {
      obs.observe(peca)
      for (const parte of peca.children) obs.observe(parte)
    }
    return () => obs.disconnect()
  }, [ref, medir])

  return cabe
}
