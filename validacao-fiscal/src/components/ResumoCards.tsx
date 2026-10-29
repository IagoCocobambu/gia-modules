import type { ComponentType, ReactNode, SVGProps } from 'react'
import { ArrowDown, ArrowUp, Equal, ListChecks, Receipt, Scale, Store } from 'lucide-react'
import { Skeleton, Tooltip } from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'
import { formatBRL, TOLERANCIA_DIFERENCA_TOTAL } from '../helpers'
import type { FiltroStatus, SummaryStats } from '../types'

// Os 4 cards têm a MESMA estrutura em 3 faixas — rótulo (1 linha), valor e rodapé
// (1 linha) — para que os valores fiquem sempre na mesma altura, lado a lado.

interface ResumoCardsProps {
  stats: SummaryStats | null
  loading: boolean
  filtro: FiltroStatus
  onFiltroChange: (filtro: FiltroStatus) => void
  /** Layout de celular: bloco enxuto (diferença, totais numa linha e chips de status). */
  compacto: boolean
}

type Tom = 'primary' | 'info' | 'success' | 'destructive' | 'muted'

const TOM_ICONE: Record<Tom, string> = {
  primary: 'bg-primary/10 text-primary',
  info: 'bg-info/15 text-info',
  success: 'bg-success/15 text-success',
  destructive: 'bg-destructive/15 text-destructive',
  muted: 'bg-muted text-muted-foreground',
}

function CardResumo({
  icon: Icon,
  tom,
  label,
  children,
  rodape,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  tom: Tom
  label: string
  children: ReactNode
  rodape: ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2 rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex min-w-0 items-center gap-2">
        <span className={cn('shrink-0 rounded-md p-1.5', TOM_ICONE[tom])}>
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <span className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="flex h-11 min-w-0 items-center text-2xl font-bold tabular-nums text-foreground">
        {children}
      </div>
      <div className="truncate text-xs text-muted-foreground">{rodape}</div>
    </div>
  )
}

export function ResumoCards({
  stats,
  loading,
  filtro,
  onFiltroChange,
  compacto,
}: ResumoCardsProps) {
  if (loading || !stats) {
    if (compacto) return <Skeleton className="h-[7.5rem] rounded-lg" />
    return (
      <div className="grid grid-cols-2 gap-3 @5xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-[8.5rem] rounded-xl" />
        ))}
      </div>
    )
  }

  const diferencaOk = Math.abs(stats.difference) < TOLERANCIA_DIFERENCA_TOTAL
  const fiscal = diferencaOk
    ? { Icone: Equal, texto: 'Valores iguais' }
    : stats.totalFiscal > stats.totalSystem
      ? { Icone: ArrowUp, texto: 'Valor Fiscal maior que Sistema' }
      : { Icone: ArrowDown, texto: 'Valor Fiscal menor que Sistema' }

  const statusBotoes: {
    filtro: FiltroStatus
    label: string
    valor: number
    cor: string
    ponto: string
  }[] = [
    { filtro: 'OK', label: 'OK', valor: stats.countOk, cor: 'text-success', ponto: 'bg-success' },
    {
      filtro: 'ERROS',
      label: 'Erros',
      valor: stats.countErrors,
      cor: 'text-destructive',
      ponto: 'bg-destructive',
    },
    {
      filtro: 'DUPLICIDADE',
      label: 'Alertas',
      valor: stats.countWarnings,
      cor: 'text-warning',
      ponto: 'bg-warning',
    },
  ]

  if (compacto) {
    // Celular: só o essencial — a diferença em destaque, os dois totais numa linha
    // e os filtros de status como chips leves (cada um com 44 px de toque).
    return (
      <section
        aria-label="Resumo"
        className="rounded-lg border border-border bg-surface px-3 pb-1 pt-3"
        data-tour="validacao-fiscal-resumo"
      >
        {/** em teste */}
        <div className="flex justify-between border-b border-border pb-2 gap-3">
          <div className="flex flex-col items-baseline justify-between gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Sistema
            </span>
            <span className={cn('whitespace-nowrap text-x font-bold tabular-nums')}>
              {formatBRL(stats.totalSystem)}
            </span>
          </div>
          <div className="flex flex-col items-baseline justify-between gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground self-end">
              Fiscal
            </span>
            <span className={cn('whitespace-nowrap text-x font-bold tabular-nums')}>
              {formatBRL(stats.totalFiscal)}
            </span>
          </div>
        </div>
        {/** fim em teste */}
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Diferença
          </span>
          <span
            className={cn(
              'whitespace-nowrap text-x font-bold tabular-nums',
              diferencaOk ? 'text-success' : 'text-destructive'
            )}
          >
            {formatBRL(stats.difference)}
          </span>
        </div>
        {/* <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">
          Sistema {formatBRL(stats.totalSystem)} · Fiscal {formatBRL(stats.totalFiscal)}
        </p> */}
        {}
        <div className="mt-1 grid grid-cols-3 gap-1" role="group" aria-label="Filtrar por status">
          {statusBotoes.map((b) => (
            <button
              key={b.filtro}
              type="button"
              aria-pressed={filtro === b.filtro}
              aria-label={`${b.valor} ${b.label} — filtrar a lista`}
              onClick={() => onFiltroChange(filtro === b.filtro ? 'TODOS' : b.filtro)}
              className={cn(
                'flex h-11 items-center justify-center gap-1.5 rounded-md text-sm',
                'transition-colors duration-fast ease-default hover:bg-muted',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                filtro === b.filtro && 'bg-muted'
              )}
            >
              <span className={cn('h-2 w-2 shrink-0 rounded-full', b.ponto)} aria-hidden />
              <span className="font-semibold tabular-nums text-foreground">{b.valor}</span>
              <span className="text-muted-foreground">{b.label}</span>
            </button>
          ))}
        </div>
      </section>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 @5xl:grid-cols-4" data-tour="validacao-fiscal-resumo">
      <CardResumo
        icon={Store}
        tom="primary"
        label="Total Sistema (PDV)"
        rodape={`${stats.countSystem} contas · soma das contas processadas`}
      >
        <span className="truncate">{formatBRL(stats.totalSystem)}</span>
      </CardResumo>

      <CardResumo
        icon={Receipt}
        tom="info"
        label="Total Fiscal (XML)"
        rodape={`${stats.countFiscal} notas · vinculadas + sem conta`}
      >
        <span className="truncate">{formatBRL(stats.totalFiscal)}</span>
        <Tooltip content={fiscal.texto}>
          <span className="ml-1.5 inline-flex shrink-0 text-muted-foreground">
            <fiscal.Icone className="h-4 w-4" aria-label={fiscal.texto} />
          </span>
        </Tooltip>
      </CardResumo>

      <CardResumo
        icon={Scale}
        tom={diferencaOk ? 'success' : 'destructive'}
        label="Diferença"
        rodape="Total Sistema − Total Fiscal"
      >
        <span className={cn('truncate', diferencaOk ? 'text-success' : 'text-destructive')}>
          {formatBRL(stats.difference)}
        </span>
      </CardResumo>

      <CardResumo
        icon={ListChecks}
        tom="muted"
        label="Status dos Registros"
        rodape={
          <span className="grid grid-cols-3 text-center">
            {statusBotoes.map((b) => (
              <span key={b.filtro}>{b.label}</span>
            ))}
          </span>
        }
      >
        <div className="-mx-1 grid w-full grid-cols-3 gap-1">
          {statusBotoes.map((b) => (
            <Tooltip key={b.filtro} content={`Filtrar a tabela: ${b.label}`}>
              <button
                type="button"
                aria-pressed={filtro === b.filtro}
                aria-label={`${b.valor} ${b.label} — filtrar a tabela`}
                onClick={() => onFiltroChange(filtro === b.filtro ? 'TODOS' : b.filtro)}
                className={cn(
                  'flex h-11 items-center justify-center rounded-md tabular-nums',
                  'transition-colors duration-fast hover:bg-muted',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  filtro === b.filtro && 'bg-muted ring-1 ring-border',
                  b.cor
                )}
              >
                {b.valor}
              </button>
            </Tooltip>
          ))}
        </div>
      </CardResumo>
    </div>
  )
}
