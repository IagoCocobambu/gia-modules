import type { ReactElement, ReactNode } from 'react'
import { Tooltip } from '@gia-cb/ui'
import { useComHover } from '../hooks/use-com-hover'

interface DicaProps {
  content: ReactNode
  children: ReactElement
}

/**
 * Tooltip só em aparelho com mouse. Em tela de toque (celular, tablet) ele não
 * abre pelo dedo e ainda atrapalha: o navegador emula um "mouse" no ponto do
 * último toque, e o tooltip do elemento que ficava ali abria sozinho e cobria o
 * vizinho. Lá, o elemento vai sem tooltip — o que a dica diz tem que estar
 * escrito na tela ou na FAQ (padrão 2 do `AGENTS.md` do workspace).
 */
export function Dica({ content, children }: DicaProps) {
  const comHover = useComHover()
  return comHover ? <Tooltip content={content}>{children}</Tooltip> : children
}
