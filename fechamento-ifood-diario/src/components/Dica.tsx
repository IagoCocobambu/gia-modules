import { useState, type ReactElement, type ReactNode } from 'react'
import { Tooltip } from '@gia-cb/ui'

/** `true` quando o aparelho tem hover de verdade (mouse/trackpad). */
function useComHover(): boolean {
  const [comHover] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches
  )
  return comHover
}

interface DicaProps {
  content: ReactNode
  children: ReactElement
}

/**
 * Tooltip só em aparelho com mouse. Em tela de toque (celular, tablet) ele não
 * abre pelo dedo e ainda atrapalha: o navegador emula um "mouse" no ponto do
 * último toque, e o tooltip do elemento que ficava ali abria sozinho e cobria o
 * vizinho. Lá, o elemento vai sem tooltip — o rótulo visível e a FAQ explicam.
 *
 * `asChild` é obrigatório: o filho é sempre um elemento interativo (botão). Sem ele,
 * o Radix envolve o filho num `<button>` extra quando o tooltip arma (no 1º hover ou
 * foco) — botão dentro de botão, e a remontagem tira o foco do teclado (o Tab caía no
 * `<body>` a cada indicador).
 */
export function Dica({ content, children }: DicaProps) {
  const comHover = useComHover()
  return comHover ? (
    <Tooltip content={content} asChild>
      {children}
    </Tooltip>
  ) : (
    children
  )
}
