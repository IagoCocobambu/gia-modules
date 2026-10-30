import { Badge, type BadgeProps } from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'
import { ROTULO_TIPO } from '../helpers'
import type { TipoPagamento } from '../types'

const VARIANTE_TIPO: Record<TipoPagamento, BadgeProps['variant']> = {
  online: 'info',
  adquirente: 'group',
  offline: 'warning',
  nao_classificado: 'destructive',
}

interface BadgeTipoPagamentoProps {
  tipo: TipoPagamento
  className?: string
}

/** Grupo da forma de pagamento no fechamento (Online, Adquirente, Offline...). */
export function BadgeTipoPagamento({ tipo, className }: BadgeTipoPagamentoProps) {
  return (
    <Badge variant={VARIANTE_TIPO[tipo]} className={cn('whitespace-nowrap', className)}>
      {ROTULO_TIPO[tipo]}
    </Badge>
  )
}
