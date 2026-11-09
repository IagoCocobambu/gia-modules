import { useEffect, useMemo, useState } from 'react'
import { usePrefersReducedMotion } from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'
import { corDaFatia, formatPct } from '../graficos'
import { formatBRL, formatInt } from '../helpers'
import type { VolumeModalidade } from '../types'

// Geometria do anel (viewBox 120×120). `pathLength=100` deixa os traços em %.
const RAIO = 52
const ESPESSURA = 14
/** Respiro entre fatias, em % do anel. */
const RESPIRO = 0.6
/** Fatia mínima visível: modalidade com valor > 0 nunca some do anel. */
const MINIMO = 0.4

interface Fatia extends VolumeModalidade {
  cor: string
  fracao: number
  inicio: number
  tamanho: number
}

function montarFatias(itens: VolumeModalidade[], total: number): Fatia[] {
  const respiro = itens.filter((c) => c.valor > 0).length > 1 ? RESPIRO : 0
  const fatias: Fatia[] = []
  let inicio = 0
  itens.forEach((c, i) => {
    const fracao = total > 0 ? Math.max(c.valor, 0) / total : 0
    const tamanho = c.valor > 0 ? Math.max(fracao * 100 - respiro, MINIMO) : 0
    fatias.push({ ...c, cor: corDaFatia(i), fracao, inicio, tamanho })
    inicio += fracao * 100
  })
  return fatias
}

interface RoscaModalidadesProps {
  modalidades: VolumeModalidade[]
  className?: string
}

/**
 * "Métodos de pagamento": anel com a parte de cada modalidade no valor total, o
 * total no miolo e a legenda com nome, valor e % (a legenda é a versão em tabela
 * do gráfico — nada depende só da cor). Mouse (ou foco) numa fatia ou linha da
 * legenda destaca a modalidade; no celular, o toque faz o mesmo.
 */
export function RoscaModalidades({ modalidades, className }: RoscaModalidadesProps) {
  const reduzido = usePrefersReducedMotion()
  const [ativa, setAtiva] = useState<string | null>(null)
  const [comHover] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches
  )
  const entrar = (m: string) => (e: { pointerType: string }) => {
    if (comHover && e.pointerType === 'mouse') setAtiva(m)
  }
  const sair = (e: { pointerType: string }) => {
    if (comHover && e.pointerType === 'mouse') setAtiva(null)
  }
  const alternar = (m: string) => setAtiva((a) => (a === m ? null : m))

  // O anel "cresce" ao abrir: começa vazio e vai ao valor no frame seguinte.
  const [cheio, setCheio] = useState(reduzido)
  useEffect(() => {
    if (reduzido) return
    let id = requestAnimationFrame(() => {
      id = requestAnimationFrame(() => setCheio(true))
    })
    return () => cancelAnimationFrame(id)
  }, [reduzido])

  const total = useMemo(
    () => modalidades.reduce((acc, c) => acc + Math.round(c.valor * 100), 0) / 100,
    [modalidades]
  )
  const totalTransacoes = modalidades.reduce((acc, c) => acc + c.transacoes, 0)
  const fatias = useMemo(() => montarFatias(modalidades, total), [modalidades, total])
  const destaque = fatias.find((f) => f.modalidade === ativa) ?? null
  const valorCentro = formatBRL(destaque ? destaque.valor : total)

  return (
    <section
      className={cn(
        '@container flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm',
        className
      )}
    >
      <header>
        <h3 className="text-base font-medium text-foreground">Métodos de pagamento</h3>
        <p className="text-xs text-muted-foreground">Valor das transações por modalidade</p>
      </header>

      {total <= 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Sem dados no período.</p>
      ) : (
        <div
          className="flex flex-col items-center gap-4 @md:flex-row @md:items-start"
          onPointerLeave={sair}
        >
          <div className="relative h-48 w-48 shrink-0">
            <svg
              viewBox="0 0 120 120"
              className="h-full w-full -rotate-90"
              role="img"
              aria-label={`Métodos de pagamento: ${fatias
                .map((f) => `${f.modalidade} ${formatPct(f.fracao)}`)
                .join(', ')}. Total ${formatBRL(total)}.`}
            >
              {fatias.map((f) =>
                f.tamanho > 0 ? (
                  <circle
                    key={f.modalidade}
                    cx={60}
                    cy={60}
                    r={RAIO}
                    fill="none"
                    strokeWidth={ESPESSURA}
                    pathLength={100}
                    className={cn(
                      'cursor-pointer',
                      !reduzido && 'transition-all duration-slow ease-default',
                      ativa !== null && ativa !== f.modalidade && 'opacity-30'
                    )}
                    style={{
                      stroke: f.cor,
                      strokeDasharray: `${cheio ? f.tamanho : 0} 100`,
                      strokeDashoffset: cheio ? -f.inicio : 0,
                    }}
                    onPointerEnter={entrar(f.modalidade)}
                    onClick={() => alternar(f.modalidade)}
                  />
                ) : null
              )}
            </svg>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 grid place-items-center text-center"
            >
              <div className="flex max-w-32 flex-col items-center gap-0.5">
                <span className="max-w-full truncate text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {destaque ? destaque.modalidade : 'Total'}
                </span>
                <span
                  className={cn(
                    'font-semibold tabular-nums text-foreground',
                    valorCentro.length > 13 ? 'text-sm' : 'text-base'
                  )}
                >
                  {valorCentro}
                </span>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {destaque
                    ? `${formatPct(destaque.fracao)} · ${formatInt(destaque.transacoes)}`
                    : `${formatInt(totalTransacoes)} transações`}
                </span>
              </div>
            </div>
          </div>

          <ul
            aria-label="Legenda dos métodos de pagamento"
            className="max-h-64 w-full space-y-0.5 overflow-y-auto rounded-lg border border-border p-1.5 @md:min-w-0 @md:flex-1"
          >
            {fatias.map((f) => (
              <li key={f.modalidade}>
                <button
                  type="button"
                  aria-pressed={ativa === f.modalidade}
                  onPointerEnter={entrar(f.modalidade)}
                  onPointerLeave={sair}
                  onClick={() => alternar(f.modalidade)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm',
                    'transition-all duration-fast ease-default hover:bg-muted/60',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    ativa === f.modalidade && 'bg-muted/60',
                    ativa !== null && ativa !== f.modalidade && 'opacity-50'
                  )}
                >
                  <span
                    aria-hidden
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: f.cor }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-foreground">
                      {f.modalidade}
                    </span>
                    <span className="block truncate text-xs tabular-nums text-muted-foreground">
                      {formatBRL(f.valor)} · {formatInt(f.transacoes)}{' '}
                      {f.transacoes === 1 ? 'transação' : 'transações'}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
                    {formatPct(f.fracao)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
