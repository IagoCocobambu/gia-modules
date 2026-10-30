import { BadgePercent, Bike, ShoppingBag, Wallet } from 'lucide-react'
import { Skeleton, StatCard, type StatCardProps } from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'
import { formatBRL, type TotaisPedidos } from '../helpers'

const CARDS: {
  campo: keyof TotaisPedidos
  label: string
  icon: StatCardProps['icon']
  iconColor: StatCardProps['iconColor']
}[] = [
  { campo: 'valor_do_pedido', label: 'Valor pedido', icon: ShoppingBag, iconColor: 'blue' },
  { campo: 'valor_da_entrega', label: 'Valor entrega', icon: Bike, iconColor: 'amber' },
  { campo: 'total_pago', label: 'Total pago', icon: Wallet, iconColor: 'green' },
  { campo: 'desconto_total', label: 'Desconto total', icon: BadgePercent, iconColor: 'rose' },
]

interface TotaisCardsProps {
  /** Somas dos pedidos do período (no status escolhido); `null` enquanto não há resultado. */
  totais: TotaisPedidos | null
  carregando: boolean
  compacto: boolean
  className?: string
}

/**
 * Soma de cada coluna monetária dos pedidos do período pesquisado, no status
 * escolhido no filtro de status — a mesma conta da linha Total do Excel. A busca
 * e os filtros de coluna da tabela não entram.
 */
export function TotaisCards({ totais, carregando, compacto, className }: TotaisCardsProps) {
  return (
    <div className={cn('grid gap-3', compacto ? 'grid-cols-2' : 'grid-cols-4', className)}>
      {CARDS.map((c) => (
        <StatCard
          key={c.campo}
          className="sm:p-4"
          icon={c.icon}
          iconColor={c.iconColor}
          label={c.label}
          value={
            carregando || !totais ? (
              <Skeleton className="my-1 h-5 w-24 sm:h-7 sm:w-32" />
            ) : (
              <span className="tabular-nums">{formatBRL(totais[c.campo])}</span>
            )
          }
        />
      ))}
    </div>
  )
}
