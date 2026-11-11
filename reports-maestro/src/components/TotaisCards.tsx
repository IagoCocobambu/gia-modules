import type { ComponentType, SVGProps } from 'react'
import { BadgePercent, Bike, ShoppingBag, Wallet } from 'lucide-react'
import { Skeleton } from '@gia-cb/ui'
import { Dica } from './Dica'
import { cn } from '@gia-cb/ui/cn'
import { formatBRL, type TotaisPedidos } from '../helpers'
import { NumeroAnimado } from './graficos/NumeroAnimado'

// Os totais em R$ acima da tabela, no desenho dos indicadores do Fechamento
// Diário Maestro (`fechamento-maestro/src/components/ResumoCards.tsx`), a pedido
// do usuário em 05/11/2026: uma barra só, com cada total como ícone num
// quadradinho tingido + valor + rótulo discreto — em vez de quatro cartões
// grandes. Ocupa menos altura e deixa mais espaço para a tabela.

/** Cor do indicador: tinge o quadradinho do ícone e o valor. */
type Tom = 'neutro' | 'primary' | 'warning' | 'success' | 'destructive'

const TOM_ICONE: Record<Tom, string> = {
  neutro: 'bg-muted text-muted-foreground',
  primary: 'bg-primary/10 text-primary',
  warning: 'bg-warning/10 text-warning',
  success: 'bg-success/10 text-success',
  destructive: 'bg-destructive/10 text-destructive',
}

const TOM_VALOR: Record<Tom, string> = {
  neutro: 'text-foreground',
  primary: 'text-primary',
  warning: 'text-warning',
  success: 'text-success',
  destructive: 'text-destructive',
}

const INDICADORES: {
  campo: keyof TotaisPedidos
  rotulo: string
  dica: string
  icone: ComponentType<SVGProps<SVGSVGElement>>
  /** O de alerta só ganha cor quando há algo a olhar. */
  tom: (valor: number) => Tom
}[] = [
  {
    campo: 'valor_do_pedido',
    rotulo: 'valor pedido',
    dica: 'Soma do valor dos pedidos (coluna Valor pedido)',
    icone: ShoppingBag,
    tom: () => 'primary',
  },
  {
    campo: 'valor_da_entrega',
    rotulo: 'valor entrega',
    dica: 'Soma do valor de entrega cobrado (coluna Valor entrega)',
    icone: Bike,
    tom: () => 'warning',
  },
  {
    campo: 'total_pago',
    rotulo: 'total pago',
    dica: 'Soma do que foi pago pelos pedidos (coluna Total pago)',
    icone: Wallet,
    tom: () => 'success',
  },
  {
    campo: 'desconto_total',
    rotulo: 'desconto total',
    dica: 'Soma dos descontos dados nos pedidos (coluna Desconto total)',
    icone: BadgePercent,
    tom: (v) => (v > 0 ? 'destructive' : 'neutro'),
  },
]

interface TotaisCardsProps {
  /** Somas dos pedidos do período (nos filtros aplicados); `null` enquanto não há resultado. */
  totais: TotaisPedidos | null
  carregando: boolean
  className?: string
}

/**
 * Soma de cada coluna monetária dos pedidos do período pesquisado, nos filtros de
 * status e origem aplicados — a mesma conta da linha Total do Excel. A busca e os
 * filtros de coluna da tabela não entram.
 *
 * Grade que ocupa a largura toda, com 2 ou 4 colunas pela largura da barra
 * (container query): as linhas fecham cheias. A dica de cada um diz a conta.
 */
export function TotaisCards({ totais, carregando, className }: TotaisCardsProps) {
  const pronto = !carregando && totais !== null

  return (
    <div
      className={cn(
        '@container rounded-xl border border-border bg-surface p-1.5 shadow-sm',
        className
      )}
    >
      <div
        role="list"
        aria-label="Totais em R$"
        className="grid grid-cols-2 gap-x-1 gap-y-0.5 @2xl:grid-cols-4"
      >
        {INDICADORES.map(({ campo, rotulo, dica, icone: Icone, tom }) => {
          const valor = pronto ? totais[campo] : 0
          const t = pronto ? tom(valor) : 'neutro'
          return (
            // A dica num alvo por cima do item, e não em volta dele: o `Tooltip`
            // remonta o que embrulha no primeiro hover, e o número voltaria a
            // contar do zero (ver CartaoIndicador).
            <div
              key={campo}
              role="listitem"
              className="relative flex min-w-0 items-center gap-2.5 whitespace-nowrap rounded-lg px-2 py-1.5 text-left"
            >
              <span
                className={cn(
                  'grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors duration-fast ease-default',
                  TOM_ICONE[t]
                )}
              >
                <Icone aria-hidden className="h-4 w-4" />
              </span>
              <span className="flex min-w-0 flex-col leading-tight">
                {pronto ? (
                  <span
                    className={cn(
                      'truncate text-base font-semibold tabular-nums transition-colors duration-fast ease-default',
                      TOM_VALOR[t]
                    )}
                  >
                    <NumeroAnimado valor={valor} formatar={formatBRL} />
                  </span>
                ) : (
                  <Skeleton className="my-0.5 h-4 w-20" />
                )}
                <span className="truncate text-xs text-muted-foreground">{rotulo}</span>
              </span>
              <Dica content={dica}>
                <span
                  tabIndex={0}
                  aria-label={`${rotulo}: ${dica}`}
                  className="absolute inset-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </Dica>
            </div>
          )
        })}
      </div>
    </div>
  )
}
