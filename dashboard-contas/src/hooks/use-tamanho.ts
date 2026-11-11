import { useEffect, useRef, useState } from 'react'

/**
 * Mede o elemento e reage a mudanças de tamanho.
 *
 * Gráfico em SVG precisa da largura em pixels para posicionar marca — não dá
 * para desenhar em porcentagem sem distorcer texto e espessura de traço. E a
 * largura muda por três caminhos que o painel usa de verdade: o botão de
 * expandir largura do `WidthFrame`, o seletor de viewport e a janela do
 * navegador. `ResizeObserver` cobre os três; `window.onresize` só cobriria um.
 *
 * ── ☠️ SEM LISTA DE DEPENDÊNCIAS, DE PROPÓSITO ──────────────────────────────
 *
 * Com `[]`, o efeito observava só o que já estivesse na tela no PRIMEIRO
 * render. Gráfico que nasce escondido atrás de um controle nunca era observado,
 * e a medida ficava em ZERO para sempre.
 *
 * Foi o que aconteceu na aba Por índice em 22/09/2026: ao voltar de **Só a
 * tabela** para **Com gráfico**, o cartão remontava sem observador, a altura
 * lida era 0 e o ranking caía no piso de 4 barras dentro de um cartão de 900 px.
 *
 * Sem lista, o efeito roda a cada render e o observador aponta sempre para o
 * elemento que está na tela AGORA. Criar um `ResizeObserver` custa quase nada, e
 * ele não realimenta o ciclo: a primeira medida chega igual à anterior e o
 * `setTamanho` devolve o MESMO objeto, que o React descarta sem redesenhar.
 *
 * Não troque por `[]` nem por uma lista com o elemento: as duas formas perdem o
 * elemento que aparece depois, que é exatamente o caso que este efeito existe
 * para cobrir.
 */
export function useTamanho<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [tamanho, setTamanho] = useState({ largura: 0, altura: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new ResizeObserver(([entrada]) => {
      const r = entrada.contentRect
      setTamanho((atual) =>
        Math.abs(atual.largura - r.width) < 1 && Math.abs(atual.altura - r.height) < 1
          ? atual
          : { largura: r.width, altura: r.height }
      )
    })
    obs.observe(el)
    return () => obs.disconnect()
  })

  return { ref, ...tamanho }
}
