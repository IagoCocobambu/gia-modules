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
import { Skeleton, Tooltip } from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'
import { formatBRL } from '../helpers'
import type { TotaisPeriodo } from '../types'

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
  /** Abre a lista das formas de pagamento sem classificação. */
  onVerSemClassificacao: () => void
  className?: string
}

const ITEM = cn(
  'flex min-w-0 items-center gap-2.5 whitespace-nowrap rounded-lg px-2 py-1.5 text-left',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
)

/**
 * Totais do fechamento do período numa barra com os 12 indicadores do legado: o
 * que foi pago (Online, Adquirentes online/offline, Offline), o que foi cancelado
 * (com a mesma divisão), os descontos da loja e do parceiro e o que ficou sem
 * classificação.
 *
 * Grade que ocupa a largura toda, com colunas que sempre dividem 12 (2, 3, 4 ou
 * 6, pela largura da barra — container query): as linhas fecham cheias, sem
 * sobra vazia no fim. O tooltip de cada um explica a conta; o de pagamentos sem
 * classificação, quando > 0, é um botão que abre a lista.
 */
export function ResumoCards({
  totais,
  carregando,
  onVerSemClassificacao,
  className,
}: ResumoCardsProps) {
  const pronto = !carregando && totais !== null
  const semClassificacao = pronto ? totais.pagamentos_sem_classificacao : 0
  const clicavel = semClassificacao > 0

  return (
    <div
      className={cn(
        '@container rounded-xl border border-border bg-surface p-1.5 shadow-sm',
        className
      )}
    >
      <div
        role="list"
        aria-label="Totais do período"
        className="grid grid-cols-2 gap-x-1 gap-y-0.5 @lg:grid-cols-3 @2xl:grid-cols-4 @5xl:grid-cols-6"
      >
        {INDICADORES.map((i) => {
          const valor = pronto ? totais[i.campo] : 0
          return (
            <Tooltip key={i.campo} content={i.dica}>
              <div role="listitem" tabIndex={0} className={ITEM}>
                <Indicador
                  icone={i.icone}
                  tom={pronto ? i.tom(valor) : 'neutro'}
                  valor={pronto ? formatBRL(valor) : null}
                  rotulo={i.rotulo}
                />
              </div>
            </Tooltip>
          )
        })}

        <Tooltip
          content={
            clicavel
              ? 'Formas de pagamento que a regra não reconheceu — clique para ver a lista'
              : 'Todas as formas de pagamento foram classificadas'
          }
        >
          {clicavel ? (
            <button
              type="button"
              role="listitem"
              onClick={onVerSemClassificacao}
              aria-label={`${semClassificacao} pagamentos sem classificação. Ver a lista`}
              className={cn(
                ITEM,
                'bg-destructive/5 transition-colors duration-fast ease-default hover:bg-destructive/10'
              )}
            >
              <Indicador
                icone={AlertTriangle}
                tom="destructive"
                valor={semClassificacao.toLocaleString('pt-BR')}
                rotulo="pagamentos sem classificação"
              />
            </button>
          ) : (
            <div role="listitem" tabIndex={0} className={ITEM}>
              <Indicador
                icone={AlertTriangle}
                tom={pronto ? 'success' : 'neutro'}
                valor={pronto ? '0' : null}
                rotulo="pagamentos sem classificação"
              />
            </div>
          )}
        </Tooltip>
      </div>
    </div>
  )
}
