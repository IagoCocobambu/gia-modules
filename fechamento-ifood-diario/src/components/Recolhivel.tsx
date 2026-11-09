import type { ReactNode } from 'react'
import { cn } from '@gia-cb/ui/cn'

interface RecolhivelProps {
  visivel: boolean
  children: ReactNode
  className?: string
}

/**
 * Mostra/esconde o conteúdo com fade + altura (grid-rows 0fr ↔ 1fr). O `-mb-3`
 * recolhido cancela o `gap-3` do container, pra não sobrar espaço vazio.
 */
export function Recolhivel({ visivel, children, className }: RecolhivelProps) {
  return (
    <div
      aria-hidden={!visivel}
      inert={!visivel}
      className={cn(
        'grid transition-all duration-default ease-default',
        visivel ? 'grid-rows-[1fr] opacity-100' : '-mb-3 grid-rows-[0fr] opacity-0',
        className
      )}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  )
}
