import type { ComponentType, SVGProps } from 'react'
import {
  AlertTriangle,
  CircleHelp,
  CreditCard,
  Percent,
  Receipt,
  ShoppingBag,
  Tag,
} from 'lucide-react'
import { Skeleton } from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'
import { formatBRL } from '../helpers'
import type { FiltroTotal, TotaisDia } from '../types'
import { Dica } from './Dica'

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

type CampoValor = Exclude<FiltroTotal, 'pagamentos_sem_classificacao'>

/**
 * Os cards do Fechamento iFood Diário do legado, na mesma ordem. As contas só
 * levam os pedidos com Cancelamento = OK e um tipo de pagamento só.
 */
const INDICADORES: {
  campo: CampoValor
  rotulo: string
  dica: string
  icone: ComponentType<SVGProps<SVGSVGElement>>
  tom: (valor: number) => Tom
}[] = [
  {
    campo: 'ifood_online',
    rotulo: 'iFood online',
    dica: 'Pedidos OK só com formas ONLINE: Total do pedido − Desconto copart',
    icone: ShoppingBag,
    tom: () => 'info',
  },
  {
    campo: 'descontos_offline_vr',
    rotulo: 'descontos offline e VR',
    dica: 'Pedidos OK só OFFLINE ou só ONLINE VR: incentivo promocional do iFood',
    icone: Percent,
    tom: () => 'neutro',
  },
  {
    campo: 'ifood_adquirentes',
    rotulo: 'iFood adquirentes',
    dica: 'Pedidos OK só com ONLINE VR: Total do pedido − incentivo do iFood − Desconto copart',
    icone: CreditCard,
    tom: () => 'primary',
  },
  {
    campo: 'descontos_loja_online',
    rotulo: 'descontos loja — online',
    dica: 'Pedidos OK só com formas ONLINE: incentivo promocional da loja',
    icone: Tag,
    tom: () => 'neutro',
  },
  {
    campo: 'descontos_loja_offline',
    rotulo: 'descontos loja — offline',
    dica: 'Pedidos OK só com formas OFFLINE: incentivo promocional da loja',
    icone: Tag,
    tom: () => 'neutro',
  },
  {
    campo: 'descontos_loja_vr',
    rotulo: 'descontos loja — VR',
    dica: 'Pedidos OK só com formas ONLINE VR: incentivo promocional da loja',
    icone: Tag,
    tom: () => 'neutro',
  },
  {
    campo: 'desconto_copart',
    rotulo: 'desconto copart',
    dica: 'Todos os pedidos OK: incentivo do iFood − taxa de serviço',
    icone: Receipt,
    tom: () => 'neutro',
  },
  {
    campo: 'valor_sem_classificacao',
    rotulo: 'valor sem classificação',
    dica: 'Valor das formas de pagamento sem nome (vazias ou DESCONHECIDO), de todos os pedidos — o normal é zero',
    icone: CircleHelp,
    tom: (v) => (v !== 0 ? 'warning' : 'neutro'),
  },
]

function Indicador({
  icone: Icone,
  tom,
  valor,
  rotulo,
}: {
  icone: ComponentType<SVGProps<SVGSVGElement>>
  tom: Tom
  valor: string | null
  rotulo: string
}) {
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
  /** Totais do dia; `null` enquanto não há resultado. */
  totais: TotaisDia | null
  carregando: boolean
  /** Card que está filtrando a tabela (`null` = sem filtro). */
  filtro: FiltroTotal | null
  /** Clique num card: filtra a tabela por ele; clicar de novo tira o filtro. */
  onFiltroChange: (filtro: FiltroTotal | null) => void
  className?: string
}

const ITEM = cn(
  'flex min-h-11 min-w-0 items-center gap-2.5 whitespace-nowrap rounded-lg px-2 py-1.5 text-left',
  'transition-colors duration-fast ease-default',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
)

const DICA_FILTRO = 'Clique para ver na tabela só os pedidos que entram nesta conta.'

/**
 * Os 9 cards do legado numa barra: 8 de valor e o contador de pagamentos sem
 * classificação. Cada card é um FILTRO da tabela (os pedidos que somaram nele);
 * clicar de novo tira o filtro. Card zerado não tem pedido para mostrar e fica
 * sem ação. As formas sem classificação aparecem por extenso abaixo da barra —
 * no legado ficavam num tooltip, que não abre no toque.
 */
export function ResumoCards({
  totais,
  carregando,
  filtro,
  onFiltroChange,
  className,
}: ResumoCardsProps) {
  const pronto = !carregando && totais !== null
  const qtdSem = pronto ? totais.pagamentos_sem_classificacao : 0

  const itens = [
    ...INDICADORES.map((i) => {
      const v = pronto ? totais[i.campo] : 0
      return {
        campo: i.campo as FiltroTotal,
        rotulo: i.rotulo,
        dica: i.dica,
        icone: i.icone,
        tom: pronto ? i.tom(v) : ('neutro' as Tom),
        valor: pronto ? formatBRL(v) : null,
        zerado: v === 0,
      }
    }),
    {
      campo: 'pagamentos_sem_classificacao' as FiltroTotal,
      rotulo: 'pagamentos sem classificação',
      dica:
        qtdSem > 0
          ? 'Formas de pagamento que a regra não reconheceu (vazias ou DESCONHECIDO)'
          : 'Todas as formas de pagamento foram classificadas',
      icone: AlertTriangle,
      tom: (!pronto ? 'neutro' : qtdSem > 0 ? 'destructive' : 'success') as Tom,
      valor: pronto ? qtdSem.toLocaleString('pt-BR') : null,
      zerado: qtdSem === 0,
    },
  ]

  return (
    <div
      className={cn(
        '@container rounded-xl border border-border bg-surface p-1.5 shadow-sm',
        className
      )}
    >
      <div
        role="group"
        aria-label="Totais do dia — clique num card para filtrar a tabela"
        className="grid grid-cols-1 gap-x-1 gap-y-0.5 @sm:grid-cols-2 @2xl:grid-cols-3 @5xl:grid-cols-5"
      >
        {itens.map((i) => {
          const ativo = filtro === i.campo
          const semAcao = !pronto || (i.zerado && !ativo)
          return (
            <Dica key={i.campo} content={semAcao ? i.dica : `${i.dica}. ${DICA_FILTRO}`}>
              <button
                type="button"
                aria-pressed={ativo}
                aria-disabled={semAcao}
                aria-label={`${i.rotulo}: ${i.valor ?? 'carregando'}`}
                onClick={() => !semAcao && onFiltroChange(ativo ? null : i.campo)}
                className={cn(
                  ITEM,
                  semAcao ? 'cursor-default' : 'hover:bg-muted/60',
                  ativo && 'bg-primary/10 ring-1 ring-inset ring-primary/40 hover:bg-primary/15',
                  i.campo === 'pagamentos_sem_classificacao' &&
                    pronto &&
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
      {pronto && totais.formas_sem_classificacao.length > 0 && (
        <p className="px-2 pb-1 pt-1.5 text-xs text-destructive">
          <span className="font-medium">Formas não mapeadas:</span>{' '}
          {totais.formas_sem_classificacao.join(' · ')}
        </p>
      )}
    </div>
  )
}
