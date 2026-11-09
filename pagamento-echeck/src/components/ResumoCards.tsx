import type { ComponentType, SVGProps } from 'react'
import { AlertTriangle, Banknote, CircleCheck, Hash, Ticket } from 'lucide-react'
import { Skeleton } from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'
import { formatBRL, formatInt } from '../helpers'
import type { FiltroTotal, Resumo } from '../types'
import { Dica } from './Dica'

// Barra de totais no padrão dos módulos do workspace (AGENTS.md da raiz, §3;
// referência: fechamento-ifood-diario/src/components/ResumoCards.tsx).

/** Cor do indicador: tinge o quadradinho do ícone e o valor. */
type Tom = 'neutro' | 'success' | 'info' | 'primary' | 'warning' | 'destructive'

const TOM_ICONE: Record<Tom, string> = {
  neutro: 'bg-muted text-muted-foreground',
  success: 'bg-success/10 text-success',
  info: 'bg-info/10 text-info',
  primary: 'bg-primary/10 text-primary',
  warning: 'bg-warning/10 text-warning',
  destructive: 'bg-destructive/10 text-destructive',
}

const TOM_VALOR: Record<Tom, string> = {
  neutro: 'text-foreground',
  success: 'text-success',
  info: 'text-info',
  primary: 'text-primary',
  warning: 'text-warning',
  destructive: 'text-destructive',
}

type Icone = ComponentType<SVGProps<SVGSVGElement>>

interface Item {
  id: string
  rotulo: string
  dica: string
  icone: Icone
  tom: Tom
  valor: string | null
  /** Card que filtra a tabela; `null` = só informa (soma a pesquisa inteira). */
  filtro: FiltroTotal | null
  zerado: boolean
}

/** Cards de filtro: por status. */
const CARDS_FILTRO: {
  filtro: FiltroTotal
  rotulo: string
  dica: string
  icone: Icone
  tom: (valor: number) => Tom
}[] = [
  {
    filtro: 'aprovadas',
    rotulo: 'aprovadas',
    dica: 'Valor das transações com status PAGO',
    icone: CircleCheck,
    tom: () => 'success',
  },
  {
    filtro: 'nao_aprovadas',
    rotulo: 'não aprovadas',
    dica: 'Valor das transações com status diferente de PAGO — o normal é zero',
    icone: AlertTriangle,
    tom: (v) => (v !== 0 ? 'destructive' : 'neutro'),
  },
]

function Indicador({
  icone: Icone,
  tom,
  valor,
  rotulo,
}: Pick<Item, 'icone' | 'tom' | 'valor' | 'rotulo'>) {
  return (
    <>
      <span
        className={cn(
          'grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors duration-fast ease-default',
          TOM_ICONE[tom]
        )}
      >
        <Icone aria-hidden className="h-4 w-4" />
      </span>
      <span className="flex min-w-0 flex-col leading-tight">
        {valor === null ? (
          <Skeleton className="my-0.5 h-4 w-20" />
        ) : (
          <span className={cn('truncate text-base font-semibold tabular-nums', TOM_VALOR[tom])}>
            {valor}
          </span>
        )}
        <span className="truncate text-xs text-muted-foreground">{rotulo}</span>
      </span>
    </>
  )
}

interface ResumoCardsProps {
  /** Totais da pesquisa; `null` enquanto não há resultado. */
  resumo: Resumo | null
  carregando: boolean
  /** Card que está filtrando a tabela (`null` = sem filtro). */
  filtro: FiltroTotal | null
  /** Clique num card de filtro: filtra a tabela por ele; clicar de novo tira o filtro. */
  onFiltroChange: (filtro: FiltroTotal | null) => void
  className?: string
}

const ITEM = cn(
  'flex min-h-11 min-w-0 items-center gap-2.5 whitespace-nowrap rounded-lg px-2 py-1.5 text-left',
  'transition-colors duration-fast ease-default',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
)

const DICA_FILTRO = 'Clique para ver na tabela só as transações que entram nesta conta.'

/**
 * Barra com os totais da pesquisa (sempre da pesquisa inteira, mesmo com filtro).
 * Os 3 primeiros são os indicadores do legado e só informam; os outros 2 são
 * FILTROS da tabela (as transações que somam neles) — clicar de novo tira o
 * filtro. Card zerado não tem transação para mostrar e fica sem ação. A dica de
 * cada card só aparece com mouse (`Dica`); no toque, a FAQ explica cada conta.
 */
export function ResumoCards({
  resumo,
  carregando,
  filtro,
  onFiltroChange,
  className,
}: ResumoCardsProps) {
  const r = !carregando ? resumo : null

  const itens: Item[] = [
    {
      id: 'valor_total',
      rotulo: 'valor total',
      dica: 'Soma de todas as transações da pesquisa, de qualquer status',
      icone: Banknote,
      tom: 'info',
      valor: r ? formatBRL(r.valorTotal) : null,
      filtro: null,
      zerado: false,
    },
    {
      id: 'transacoes',
      rotulo: r ? `transações · ${formatInt(r.aprovadas)} aprovadas` : 'transações',
      dica: 'Quantas transações a pesquisa trouxe; ao lado, quantas estão com status PAGO',
      icone: Hash,
      tom: 'neutro',
      valor: r ? formatInt(r.transacoes) : null,
      filtro: null,
      zerado: false,
    },
    {
      id: 'ticket_medio',
      rotulo: 'ticket médio',
      dica: 'Valor total ÷ número de transações',
      icone: Ticket,
      tom: 'neutro',
      valor: r ? formatBRL(r.ticketMedio) : null,
      filtro: null,
      zerado: false,
    },
    ...CARDS_FILTRO.map((c): Item => {
      const v = r ? r.valores[c.filtro] : 0
      const qtd = r ? r.quantidades[c.filtro] : 0
      return {
        id: c.filtro,
        rotulo: r ? `${c.rotulo} · ${formatInt(qtd)}` : c.rotulo,
        dica: c.dica,
        icone: c.icone,
        tom: r ? c.tom(v) : 'neutro',
        valor: r ? formatBRL(v) : null,
        filtro: c.filtro,
        zerado: qtd === 0,
      }
    }),
  ]

  return (
    <div
      data-tour="pagamento-echeck-resumo"
      className={cn(
        '@container rounded-xl border border-border bg-surface p-1.5 shadow-sm',
        className
      )}
    >
      <div
        role="group"
        aria-label="Totais da pesquisa — clique num card de filtro para filtrar a tabela"
        className="grid grid-cols-1 gap-x-1 gap-y-0.5 @sm:grid-cols-2 @2xl:grid-cols-3 @5xl:grid-cols-5"
      >
        {itens.map((i) => {
          const ativo = i.filtro !== null && filtro === i.filtro
          const semAcao = r === null || i.filtro === null || (i.zerado && !ativo)
          return (
            <Dica key={i.id} content={semAcao ? i.dica : `${i.dica}. ${DICA_FILTRO}`}>
              <button
                type="button"
                aria-pressed={i.filtro === null ? undefined : ativo}
                aria-disabled={semAcao}
                aria-label={`${i.rotulo}: ${i.valor ?? 'carregando'}`}
                onClick={() => !semAcao && onFiltroChange(ativo ? null : i.filtro)}
                className={cn(
                  ITEM,
                  semAcao ? 'cursor-default' : 'hover:bg-muted/60',
                  ativo && 'bg-primary/10 ring-1 ring-inset ring-primary/40 hover:bg-primary/15',
                  i.filtro === 'nao_aprovadas' &&
                    r !== null &&
                    !i.zerado &&
                    !ativo &&
                    'bg-destructive/5 hover:bg-destructive/10'
                )}
              >
                <Indicador icone={i.icone} tom={i.tom} valor={i.valor} rotulo={i.rotulo} />
              </button>
            </Dica>
          )
        })}
      </div>
    </div>
  )
}
