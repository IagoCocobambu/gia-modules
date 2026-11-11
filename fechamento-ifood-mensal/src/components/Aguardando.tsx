import { cn } from '@gia-cb/ui/cn'

/**
 * Selo no lugar de um valor que só vale no fim da consulta (padrão 9 do AGENTS.md
 * do workspace): a diferença de um dia cujos lançamentos ainda estão chegando, um
 * total da Conferência antes de todas as páginas do iFood.
 */
export function Aguardando({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground',
        className
      )}
    >
      Aguardando iFood
    </span>
  )
}
