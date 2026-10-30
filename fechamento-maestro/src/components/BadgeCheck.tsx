import { CircleAlert, CircleCheck } from 'lucide-react'
import { Badge } from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'

interface BadgeCheckProps {
  ok: boolean
  className?: string
}

/** Resultado de um check do fechamento: "OK" em verde, "Divergente" em vermelho. */
export function BadgeCheck({ ok, className }: BadgeCheckProps) {
  const Icone = ok ? CircleCheck : CircleAlert
  return (
    <Badge
      variant={ok ? 'success' : 'destructive'}
      className={cn('gap-1 whitespace-nowrap', className)}
    >
      <Icone aria-hidden className="h-3 w-3" />
      {ok ? 'OK' : 'Divergente'}
    </Badge>
  )
}
