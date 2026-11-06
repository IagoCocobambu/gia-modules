import type { ComponentType, SVGProps } from 'react'
import {
  AlertTriangle,
  CircleHelp,
  CircleX,
  CreditCard,
  Globe,
  HandCoins,
  Handshake,
  Store,
} from 'lucide-react'
import { Skeleton } from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'
import { formatBRL } from '../helpers'
import type { FiltroTotal, TotaisPeriodo } from '../types'
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

type CampoValor = Exclude<keyof TotaisPeriodo, 'pagamentos_sem_classificacao' | 'divergentes'>

/**
 * Indicadores de valor — os do Fechamento Diário do legado, na mesma ordem: venda,
 * cancelados, descontos/sem classificação. `tom` recebe o valor: os de alerta só
 * ganham cor quando há algo a olhar.
 */
const INDICADORES: {
  campo: CampoValor
  rotulo: string
  dica: string
  icone: ComponentType<SVGProps<SVGSVGElement>>
  tom: (valor: number) => Tom
}[] = [
  {
    campo: 'online',
    rotulo: 'online',
    dica: 'Formas ONLINE (PRE PAGO), menos o incentivo que foi para Descontos parceiro',
    icone: Globe,
    tom: () => 'info',
  },
  {
    campo: 'adquirentes_online',
    rotulo: 'adquirentes online',
    dica: 'Vales ONLINE VR pagos antes, no app ou no parceiro (PRE PAGO)',
    icone: CreditCard,
    tom: () => 'primary',
  },
  {
    campo: 'adquirentes_offline',
    rotulo: 'adquirentes offline',
    dica: 'Vales ONLINE VR passados na entrega, sem PRE PAGO (ex.: VR Refeição)',
    icone: CreditCard,
    tom: () => 'primary',
  },
  {
    campo: 'offline',
    rotulo: 'offline',
    dica: 'Parte paga na entrega (dinheiro ou maquininha): formas sem PRE PAGO',
    icone: HandCoins,
    tom: () => 'warning',
  },
  {
    campo: 'cancelado_online',
    rotulo: 'cancelado online',
    dica: 'Parte online dos pedidos cancelados (fora do fechamento)',
    icone: CircleX,
    tom: (v) => (v > 0 ? 'destructive' : 'neutro'),
  },
  {
    campo: 'cancelado_adquirentes_online',
    rotulo: 'cancelado adquirentes online',
    dica: 'Parte em adquirentes online dos pedidos cancelados',
    icone: CircleX,
    tom: (v) => (v > 0 ? 'destructive' : 'neutro'),
  },
  {
    campo: 'cancelado_adquirentes_offline',
    rotulo: 'cancelado adquirentes offline',
    dica: 'Parte em adquirentes offline dos pedidos cancelados',
    icone: CircleX,
    tom: (v) => (v > 0 ? 'destructive' : 'neutro'),
  },
  {
    campo: 'cancelado_offline',
    rotulo: 'cancelado offline',
    dica: 'Parte offline dos pedidos cancelados',
    icone: CircleX,
    tom: (v) => (v > 0 ? 'destructive' : 'neutro'),
  },
  {
    campo: 'descontos_loja',
    rotulo: 'descontos loja',
    dica: 'Desconto total dos pedidos despachados ou entregues (DISPATCHED / DELIVERED)',
    icone: Store,
    tom: () => 'neutro',
  },
  {
    campo: 'descontos_parceiro',
    rotulo: 'descontos parceiro',
    dica: 'Incentivo do parceiro em pedidos (fora do 99Food) com ONLINE VR ou OFFLINE; sai do Online',
    icone: Handshake,
    tom: () => 'neutro',
  },
  {
    campo: 'nao_classificado',
    rotulo: 'sem classificação',
    dica: 'Valor em formas de pagamento sem nome (vazia ou DESCONHECIDO) — o normal é zero',
    icone: CircleHelp,
    tom: (v) => (v !== 0 ? 'warning' : 'neutro'),
  },
]

interface IndicadorProps {
  icone: ComponentType<SVGProps<SVGSVGElement>>
  tom: Tom
  valor: string | null
  rotulo: string
}

/** Ícone num quadradinho tingido + valor em negrito, com o rótulo discreto embaixo. */
function Indicador({ icone: Icone, tom, valor, rotulo }: IndicadorProps) {
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
  /** Totais do período; `null` enquanto não há resultado. */
  totais: TotaisPeriodo | null
  carregando: boolean
  /** Indicador que está filtrando a tabela (`null` = sem filtro). */
  filtro: FiltroTotal | null
  /** Clique num indicador: filtra a tabela por ele; clicar de novo tira o filtro. */
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
 * Totais do fechamento do período numa barra com os 12 indicadores do legado: o
 * que foi pago (Online, Adquirentes online/offline, Offline), o que foi cancelado
 * (com a mesma divisão), os descontos da loja e do parceiro e o que ficou sem
 * classificação.
 *
 * Grade que ocupa a largura toda, com colunas que sempre dividem 12 (1, 2, 3, 4
 * ou 6, pela largura — container query; 1 no celular, para valor e nome
 * inteiros): as linhas fecham cheias, sem sobra vazia no fim.
 *
 * Cada indicador é um FILTRO da tabela: o clique mostra só os pedidos que somaram
 * nele (`pedidosDoTotal`) e o indicador fica marcado; clicar de novo tira o
 * filtro. O tooltip explica a conta ao passar o mouse e fecha no clique. Indicador
 * zerado não tem pedido para mostrar: fica sem ação.
 */
export function ResumoCards({
  totais,
  carregando,
  filtro,
  onFiltroChange,
  className,
}: ResumoCardsProps) {
  const pronto = !carregando && totais !== null
  const semClassificacao = pronto ? totais.pagamentos_sem_classificacao : 0

  const itens: {
    campo: FiltroTotal
    rotulo: string
    dica: string
    icone: ComponentType<SVGProps<SVGSVGElement>>
    tom: Tom
    valor: string | null
    zerado: boolean
  }[] = [
    ...INDICADORES.map((i) => {
      const v = pronto ? totais[i.campo] : 0
      return {
        campo: i.campo,
        rotulo: i.rotulo,
        dica: i.dica,
        icone: i.icone,
        tom: pronto ? i.tom(v) : ('neutro' as Tom),
        valor: pronto ? formatBRL(v) : null,
        zerado: v === 0,
      }
    }),
    {
      campo: 'pagamentos_sem_classificacao',
      rotulo: 'pagamentos sem classificação',
      dica:
        semClassificacao > 0
          ? 'Formas de pagamento que a regra não reconheceu (vazia ou DESCONHECIDO)'
          : 'Todas as formas de pagamento foram classificadas',
      icone: AlertTriangle,
      tom: !pronto ? 'neutro' : semClassificacao > 0 ? 'destructive' : 'success',
      valor: pronto ? semClassificacao.toLocaleString('pt-BR') : null,
      zerado: semClassificacao === 0,
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
        aria-label="Totais do período — clique num indicador para filtrar a tabela"
        className="grid grid-cols-1 gap-x-1 gap-y-0.5 @sm:grid-cols-2 @lg:grid-cols-3 @2xl:grid-cols-4 @5xl:grid-cols-6"
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
    </div>
  )
}
