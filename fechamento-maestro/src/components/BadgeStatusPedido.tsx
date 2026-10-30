import { Badge } from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'
import { statusPedido } from '../status-pedido'

interface BadgeStatusPedidoProps {
  /** Valor de `status_do_pedido` como veio da API. */
  status: string
  className?: string
}

/**
 * Badge do status do pedido, traduzido pelo dicionário (`status-pedido.ts`), com
 * um ponto na cor do status e um halo que pulsa de leve. O halo só anima com
 * `motion-safe` — quem pediu menos movimento no sistema vê o ponto parado.
 */
export function BadgeStatusPedido({ status, className }: BadgeStatusPedidoProps) {
  const def = statusPedido(status)
  return (
    <Badge variant={def.variante} className={cn('gap-1.5 whitespace-nowrap', className)}>
      <span aria-hidden className="relative flex size-1.5 shrink-0">
        <span
          className={cn(
            'absolute inline-flex size-full rounded-full opacity-50 motion-safe:animate-ping',
            def.corPonto
          )}
        />
        <span className={cn('relative inline-flex size-1.5 rounded-full', def.corPonto)} />
      </span>
      {def.rotulo}
    </Badge>
  )
}
