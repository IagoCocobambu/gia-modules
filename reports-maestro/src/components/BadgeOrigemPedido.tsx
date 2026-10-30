import { Badge, type BadgeProps } from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'

/**
 * Cor do badge por origem (canal), pelo nome que a API devolve. Usa as
 * variantes suaves do `Badge`, próximas da cor de cada marca: iFood rosa,
 * 99Food âmbar, App Coco Bambu azul; pedido manual em cinza. Origem nova da API
 * aparece com contorno neutro até ganhar uma entrada aqui.
 */
const VARIANTE_ORIGEM: Record<string, BadgeProps['variant']> = {
  'app coco bambu': 'group',
  ifood: 'exception',
  '99food': 'role',
  'pedido manual': 'secondary',
}

interface BadgeOrigemPedidoProps {
  /** Valor de `origem` como veio da API (já em português). */
  origem: string
  className?: string
}

/** Badge da origem do pedido, colorido por canal. */
export function BadgeOrigemPedido({ origem, className }: BadgeOrigemPedidoProps) {
  const variante = VARIANTE_ORIGEM[origem.trim().toLowerCase()] ?? 'outline'
  return (
    <Badge variant={variante} className={cn('whitespace-nowrap', className)}>
      {origem}
    </Badge>
  )
}
