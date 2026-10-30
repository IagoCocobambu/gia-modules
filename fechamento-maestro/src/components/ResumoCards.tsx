import { AlertTriangle, BadgePercent, CreditCard, Globe, HandCoins, Wallet } from 'lucide-react'
import { Skeleton, StatCard, type StatCardProps } from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'
import { formatBRL } from '../helpers'
import type { ResumoDia } from '../types'

const CARDS: {
  campo: keyof ResumoDia
  label: string
  icon: StatCardProps['icon']
  iconColor: StatCardProps['iconColor']
  moeda: boolean
}[] = [
  { campo: 'total_pago', label: 'Total pago', icon: Wallet, iconColor: 'green', moeda: true },
  { campo: 'online', label: 'Online', icon: Globe, iconColor: 'blue', moeda: true },
  {
    campo: 'adquirentes',
    label: 'Adquirentes',
    icon: CreditCard,
    iconColor: 'indigo',
    moeda: true,
  },
  { campo: 'offline', label: 'Offline', icon: HandCoins, iconColor: 'amber', moeda: true },
  { campo: 'descontos', label: 'Descontos', icon: BadgePercent, iconColor: 'slate', moeda: true },
  {
    campo: 'divergentes',
    label: 'Pedidos com divergência',
    icon: AlertTriangle,
    iconColor: 'rose',
    moeda: false,
  },
]

interface ResumoCardsProps {
  /** Total do período (sem cancelados); `null` enquanto não há resultado. */
  resumo: ResumoDia | null
  carregando: boolean
  compacto: boolean
  className?: string
}

/**
 * Totais do fechamento do período: o total pago dividido em Online, Adquirentes e
 * Offline, os descontos e quantos pedidos têm divergência. Mesma conta da linha
 * Total da visão por dia — cancelados ficam fora.
 */
export function ResumoCards({ resumo, carregando, compacto, className }: ResumoCardsProps) {
  return (
    <div className={cn('grid gap-3', compacto ? 'grid-cols-2' : 'grid-cols-6', className)}>
      {CARDS.map((c) => (
        <StatCard
          key={c.campo}
          className="sm:p-4"
          icon={c.icon}
          iconColor={c.iconColor}
          label={c.label}
          value={
            carregando || !resumo ? (
              <Skeleton className="my-1 h-5 w-24 sm:h-7 sm:w-28" />
            ) : (
              <span className="tabular-nums">
                {c.moeda
                  ? formatBRL(resumo[c.campo] as number)
                  : (resumo[c.campo] as number).toLocaleString('pt-BR')}
              </span>
            )
          }
        />
      ))}
    </div>
  )
}
