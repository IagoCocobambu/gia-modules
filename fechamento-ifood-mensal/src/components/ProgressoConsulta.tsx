import { Loader2, X } from 'lucide-react'
import { Button } from '@gia-cb/ui'
import { formatNum } from '../helpers'
import type { ProgressoConsulta as Progresso } from '../hooks/use-consulta-mensal'

interface Props {
  progresso: Progresso | null
  onCancelar: () => void
  /**
   * `true` = o caixa da loja já chegou e as abas estão na tela (os lançamentos do
   * iFood continuam chegando). `false` = nada chegou ainda; a tabela está carregando.
   */
  comDados: boolean
}

function percentual(p: Progresso | null): number {
  return p ? Math.min(99, Math.round(p.fracao * 100)) : 0
}

function resumo(p: Progresso | null): string {
  if (!p || p.paginasConcluidas === 0) return 'Iniciando…'
  return `${p.janelasConcluidas} de ${p.totalJanelas} partes do mês · ${p.paginasConcluidas} de ${p.paginasConhecidas} páginas · ${formatNum(p.linhas)} lançamentos`
}

function Barra({ pct }: { pct: number }) {
  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-border"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
    >
      <div
        className="h-full rounded-full bg-primary transition-[width] duration-slow ease-default"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

/**
 * Andamento da consulta ao iFood numa faixa fina acima da tabela, do começo ao fim
 * (padrão 9 do AGENTS.md do workspace): nada de painel no lugar da tabela.
 */
export function ProgressoConsulta({ progresso, onCancelar, comDados }: Props) {
  const pct = percentual(progresso)
  return (
    <div
      className="flex shrink-0 flex-col gap-2 rounded-lg border border-border bg-surface px-3 py-2 sm:flex-row sm:items-center sm:gap-3"
      role="status"
      aria-live="polite"
      data-tour="fechamento-ifood-mensal-progresso"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <p className="flex items-center gap-2 text-sm text-foreground">
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" aria-hidden />
          <span className="min-w-0">
            {comDados ? 'Ainda chegando lançamentos do iFood' : 'Consultando o iFood'} —{' '}
            <span className="text-muted-foreground">
              {comDados
                ? 'os dias em espera aparecem apagados; Conferência e Recebimento fecham no fim.'
                : 'as abas abrem assim que o caixa da loja chegar; quanto mais movimento, mais tempo.'}
            </span>
          </span>
        </p>
        <Barra pct={pct} />
        <p className="text-xs tabular-nums text-muted-foreground">{resumo(progresso)}</p>
      </div>
      <Button variant="ghost" className="h-11 shrink-0" onClick={onCancelar}>
        <X className="h-4 w-4" /> Cancelar
      </Button>
    </div>
  )
}
