import { useMemo, useState } from 'react'
import { usePrefersReducedMotion } from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'
import { COR_SERIE, formatPct } from '../graficos'
import { formatBRL, formatHora, formatInt } from '../helpers'
import type { VolumeHora } from '../types'

interface VolumePorHoraProps {
  horas: VolumeHora[]
  className?: string
}

/**
 * "Volume de vendas por hora": uma barra por hora, da primeira à última hora com
 * transação (horas vazias no meio aparecem zeradas, para o eixo não pular). A
 * linha de cima mostra os números da hora em destaque — a de maior valor, até o
 * usuário passar o mouse (ou tocar) numa barra. Nada depende só da altura.
 */
export function VolumePorHora({ horas, className }: VolumePorHoraProps) {
  const reduzido = usePrefersReducedMotion()
  const [ativa, setAtiva] = useState<number | null>(null)
  // Destaque ao passar por cima só com hover de verdade (padrão do workspace):
  // no toque, o "mouse" emulado ligava e desligava o destaque sozinho.
  const [comHover] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches
  )

  const barras = useMemo(() => {
    if (horas.length === 0) return []
    const porHora = new Map(horas.map((h) => [h.hora, h]))
    const primeira = horas[0].hora
    const ultima = horas[horas.length - 1].hora
    return Array.from(
      { length: ultima - primeira + 1 },
      (_, i) => porHora.get(primeira + i) ?? { hora: primeira + i, valor: 0, transacoes: 0 }
    )
  }, [horas])

  const maximo = Math.max(0, ...barras.map((b) => b.valor))
  const total = barras.reduce((acc, b) => acc + b.valor, 0)
  const pico = barras.reduce<VolumeHora | null>((m, b) => (m && m.valor >= b.valor ? m : b), null)
  const destaque = barras.find((b) => b.hora === ativa) ?? pico

  return (
    <section
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm',
        className
      )}
    >
      <header>
        <h3 className="text-base font-medium text-foreground">Volume de vendas por hora</h3>
        <p className="text-xs text-muted-foreground">Soma do valor das transações em cada hora</p>
      </header>

      {barras.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Sem dados no período.</p>
      ) : (
        <>
          {destaque && (
            <p className="text-sm tabular-nums text-foreground" aria-live="polite">
              <span className="font-semibold">
                {formatHora(destaque.hora)}–{formatHora(destaque.hora).slice(0, 2)}:59
              </span>
              {ativa === null && <span className="text-muted-foreground"> (pico)</span>} ·{' '}
              {formatBRL(destaque.valor)} ·{' '}
              <span className="text-muted-foreground">
                {formatInt(destaque.transacoes)}{' '}
                {destaque.transacoes === 1 ? 'transação' : 'transações'} ·{' '}
                {formatPct(total > 0 ? destaque.valor / total : 0)} do total
              </span>
            </p>
          )}
          <div
            className="flex h-48 items-end gap-0.5 border-b border-border sm:gap-1"
            onPointerLeave={(e) => {
              if (comHover && e.pointerType === 'mouse') setAtiva(null)
            }}
          >
            {barras.map((b) => (
              <button
                key={b.hora}
                type="button"
                aria-label={`${formatHora(b.hora)}: ${formatBRL(b.valor)}, ${formatInt(b.transacoes)} transações`}
                aria-pressed={ativa === b.hora}
                onPointerEnter={(e) => {
                  if (comHover && e.pointerType === 'mouse') setAtiva(b.hora)
                }}
                onClick={() => setAtiva((a) => (a === b.hora ? null : b.hora))}
                className="group flex h-full min-w-0 flex-1 items-end rounded-t-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span
                  className={cn(
                    'block w-full rounded-t-sm',
                    !reduzido && 'transition-all duration-default ease-default',
                    destaque?.hora === b.hora ? 'opacity-100' : 'opacity-60 group-hover:opacity-90'
                  )}
                  style={{
                    height:
                      maximo > 0
                        ? `${Math.max((b.valor / maximo) * 100, b.valor > 0 ? 1.5 : 0)}%`
                        : 0,
                    background: COR_SERIE,
                  }}
                />
              </button>
            ))}
          </div>
          <div className="flex gap-0.5 sm:gap-1" aria-hidden>
            {barras.map((b, i) => (
              <span
                key={b.hora}
                className={cn(
                  'min-w-0 flex-1 text-center text-[10px] tabular-nums text-muted-foreground sm:text-xs',
                  // Muitas horas no celular: rótulo sim, rótulo não.
                  barras.length > 12 && i % 2 === 1 && 'invisible sm:visible'
                )}
              >
                {String(b.hora).padStart(2, '0')}
              </span>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
