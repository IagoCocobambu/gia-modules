import { useState } from 'react'

/**
 * `true` quando o aparelho tem hover de verdade (mouse/trackpad). Em tela de
 * toque o módulo não mostra tooltip nem destaque por "passar o mouse" (padrão 2
 * do `AGENTS.md` do workspace) — ver `Dica`.
 */
export function useComHover(): boolean {
  const [comHover] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches
  )
  return comHover
}
