import { Loader2, X } from 'lucide-react'
import { Button } from '@gia-cb/ui'
import type { ProgressoDiario } from '../hooks/use-consulta-diaria'

interface Props {
  progresso: ProgressoDiario | null
  /** `true` = os pedidos do delivery já estão na tabela; só o iFood está chegando. */
  comPedidos: boolean
  onCancelar: () => void
}

const plural = (n: number, um: string, varios: string) =>
  `${n.toLocaleString('pt-BR')} ${n === 1 ? um : varios}`

/** Fração das páginas do iFood concluídas, de 0 a 100. */
function percentual(p: ProgressoDiario | null): number {
  if (!p) return 0
  if (p.paginasTotal === null || p.paginasTotal === 0) return p.vendasProntas ? 100 : 0
  return Math.round((p.paginasConcluidas / p.paginasTotal) * 100)
}

/**
 * As duas etapas numa linha: "Vendas no iFood (5 restaurantes): 3 de 9 páginas ·
 * Pedidos do delivery: aguardando".
 */
function resumo(p: ProgressoDiario | null): string {
  if (!p) return 'Iniciando…'
  const vendas =
    p.paginasTotal === null
      ? 'sem restaurante no cadastro'
      : p.vendasProntas
        ? p.vendas === 0
          ? 'sem vendas'
          : `pronto (${plural(p.vendas, 'venda', 'vendas')})`
        : `${p.paginasConcluidas} de ${plural(p.paginasTotal, 'página', 'páginas')} · ${plural(p.vendas, 'venda', 'vendas')}`
  const restaurantes =
    p.restaurantes > 1 ? ` (${plural(p.restaurantes, 'restaurante', 'restaurantes')})` : ''
  const pedidos = p.pedidosProntos
    ? `pronto (${plural(p.pedidos ?? 0, 'pedido', 'pedidos')})`
    : 'aguardando (em loja grande, até 1 minuto)'
  return `Vendas no iFood${restaurantes}: ${vendas} · Pedidos do delivery: ${pedidos}`
}

/**
 * Andamento da consulta numa faixa fina acima da tabela (como no Fechamento iFood
 * Mensal): a tabela aparece assim que os pedidos do delivery chegam e vai sendo
 * cruzada com o iFood; os valores do dia só saem no fim.
 */
export function ProgressoConsulta({ progresso, comPedidos, onCancelar }: Props) {
  const pct = percentual(progresso)
  return (
    <div
      className="flex shrink-0 flex-col gap-2 rounded-lg border border-border bg-surface px-3 py-2 sm:flex-row sm:items-center sm:gap-3"
      role="status"
      aria-live="polite"
      data-tour="fechamento-ifood-diario-progresso"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <p className="flex items-center gap-2 text-sm text-foreground">
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" aria-hidden />
          <span className="min-w-0">
            {comPedidos ? 'Ainda chegando vendas do iFood' : 'Montando o fechamento'} —{' '}
            <span className="text-muted-foreground">
              {comPedidos
                ? 'os pedidos em espera aparecem apagados; os valores do dia saem no fim.'
                : 'os pedidos aparecem na tabela assim que o delivery responder.'}
            </span>
          </span>
        </p>
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-border"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          aria-label="Vendas no iFood"
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-slow ease-default"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs tabular-nums text-muted-foreground">{resumo(progresso)}</p>
      </div>
      <Button variant="ghost" className="h-11 shrink-0" onClick={onCancelar}>
        <X className="h-4 w-4" /> Cancelar
      </Button>
    </div>
  )
}
