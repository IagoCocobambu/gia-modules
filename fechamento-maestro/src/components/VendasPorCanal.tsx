import { useEffect, useMemo, useState } from 'react'
import { Skeleton, usePrefersReducedMotion } from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'
import { formatBRL } from '../helpers'
import type { VendaCanal } from '../types'

/**
 * Cor de cada canal — a mesma do `BadgeOrigemPedido` (App Coco Bambu azul, iFood
 * rosa, 99Food âmbar, pedido manual cinza), pra o gráfico bater com a tabela.
 * Canal novo da API fica cinza até ganhar uma entrada aqui; a legenda diz o nome.
 * Classes literais (o Tailwind só gera o que encontra escrito).
 */
const COR_CANAL: Record<string, { traco: string; ponto: string }> = {
  'app coco bambu': { traco: 'stroke-accent-group', ponto: 'bg-accent-group' },
  ifood: { traco: 'stroke-accent-exception', ponto: 'bg-accent-exception' },
  '99food': { traco: 'stroke-accent-role', ponto: 'bg-accent-role' },
}
const COR_OUTROS = { traco: 'stroke-muted-foreground', ponto: 'bg-muted-foreground' }

function corDoCanal(canal: string) {
  return COR_CANAL[canal.trim().toLowerCase()] ?? COR_OUTROS
}

// Geometria do anel (viewBox 120×120). `pathLength=100` deixa os traços em %.
const RAIO = 52
const ESPESSURA = 14
/** Respiro entre fatias, em % do anel (~2px no tamanho do card). */
const RESPIRO = 0.6
/** Fatia mínima visível: canal com venda > 0 nunca some do anel. */
const MINIMO = 0.4

function formatPct(fracao: number): string {
  const pct = fracao * 100
  if (pct > 0 && pct < 1) return '<1%'
  return `${Math.round(pct)}%`
}

function formatPedidos(qtd: number): string {
  return `${qtd.toLocaleString('pt-BR')} ${qtd === 1 ? 'pedido' : 'pedidos'}`
}

interface Fatia extends VendaCanal {
  /** Parte do total (0–1). */
  fracao: number
  /** Onde a fatia começa no anel, em % (0–100). */
  inicio: number
  /** Comprimento desenhado, em %, já sem o respiro. */
  tamanho: number
}

/** Posição de cada canal no anel, na ordem da lista (a primeira fatia começa no topo). */
function montarFatias(canais: VendaCanal[], total: number): Fatia[] {
  const respiro = canais.filter((c) => c.valor > 0).length > 1 ? RESPIRO : 0
  const fatias: Fatia[] = []
  let inicio = 0
  for (const c of canais) {
    const fracao = total > 0 ? Math.max(c.valor, 0) / total : 0
    const tamanho = c.valor > 0 ? Math.max(fracao * 100 - respiro, MINIMO) : 0
    fatias.push({ ...c, fracao, inicio, tamanho })
    inicio += fracao * 100
  }
  return fatias
}

interface VendasPorCanalProps {
  canais: VendaCanal[]
  carregando: boolean
  className?: string
}

/**
 * Card "Vendas por canal": anel com a fatia de cada origem no total pago, o total
 * no miolo e a legenda com nome, % e valor (a legenda é a versão em tabela do
 * gráfico — nada depende só da cor). Passar o mouse (ou o foco) numa fatia ou
 * numa linha da legenda destaca o canal e mostra os números dele no miolo; no
 * celular, tocar na legenda faz o mesmo.
 */
export function VendasPorCanal({ canais, carregando, className }: VendasPorCanalProps) {
  const reduzido = usePrefersReducedMotion()
  const [ativo, setAtivo] = useState<string | null>(null)
  // Destaque ao passar por cima só em aparelho com hover de verdade. No toque o
  // navegador emula eventos de mouse (até com pointerType "mouse", quando o
  // painel aparece sob o dedo) e ligava/desligava o destaque sozinho; lá vale só
  // o toque (onClick).
  const [comHover] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches
  )
  const entrar = (canal: string) => (e: { pointerType: string }) => {
    if (comHover && e.pointerType === 'mouse') setAtivo(canal)
  }
  const sair = (e: { pointerType: string }) => {
    if (comHover && e.pointerType === 'mouse') setAtivo(null)
  }

  // O anel "cresce" ao abrir: começa vazio e vai ao valor no frame seguinte.
  const [cheio, setCheio] = useState(reduzido)
  useEffect(() => {
    if (reduzido || carregando) return
    let id = requestAnimationFrame(() => {
      id = requestAnimationFrame(() => setCheio(true))
    })
    return () => cancelAnimationFrame(id)
  }, [reduzido, carregando])

  const total = useMemo(
    () => canais.reduce((acc, c) => acc + Math.round(c.valor * 100), 0) / 100,
    [canais]
  )
  const totalPedidos = useMemo(() => canais.reduce((acc, c) => acc + c.pedidos, 0), [canais])

  const fatias = useMemo(() => montarFatias(canais, total), [canais, total])

  const destaque = fatias.find((f) => f.canal === ativo) ?? null
  const semVenda = !carregando && total <= 0

  const valorCentro = destaque ? formatBRL(destaque.valor) : formatBRL(total)

  return (
    <section
      className={cn(
        '@container flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm',
        className
      )}
    >
      <header>
        <h3 className="text-base font-medium text-foreground">Vendas por canal</h3>
        <p className="text-xs text-muted-foreground">
          Total pago dos pedidos não cancelados, por origem do pedido
        </p>
      </header>

      {carregando ? (
        <div className="flex flex-col items-center gap-4 @md:flex-row @md:items-start">
          <Skeleton className="h-52 w-52 shrink-0 rounded-full" />
          <div className="w-full space-y-2 @md:ml-auto @md:max-w-64">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </div>
        </div>
      ) : semVenda ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Nenhuma venda no período — os pedidos estão todos cancelados ou sem valor pago.
        </p>
      ) : (
        <div
          className="flex flex-col items-center gap-4 @md:flex-row @md:items-start"
          onPointerLeave={sair}
        >
          <div className="relative h-52 w-52 shrink-0">
            <svg
              viewBox="0 0 120 120"
              className="h-full w-full -rotate-90"
              role="img"
              aria-label={`Vendas por canal: ${fatias
                .map((f) => `${f.canal} ${formatPct(f.fracao)}`)
                .join(', ')}. Total ${formatBRL(total)}.`}
            >
              {fatias.map((f) =>
                f.tamanho > 0 ? (
                  <circle
                    key={f.canal}
                    cx={60}
                    cy={60}
                    r={RAIO}
                    fill="none"
                    strokeWidth={ESPESSURA}
                    pathLength={100}
                    className={cn(
                      corDoCanal(f.canal).traco,
                      'cursor-pointer',
                      !reduzido && 'transition-all duration-slow ease-default',
                      ativo !== null && ativo !== f.canal && 'opacity-30'
                    )}
                    style={{
                      strokeDasharray: `${cheio ? f.tamanho : 0} 100`,
                      strokeDashoffset: cheio ? -f.inicio : 0,
                    }}
                    onPointerEnter={entrar(f.canal)}
                    onClick={() => setAtivo((a) => (a === f.canal ? null : f.canal))}
                  />
                ) : null
              )}
            </svg>

            {/* Miolo: o total, ou os números do canal em destaque. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 grid place-items-center text-center"
            >
              <div className="flex max-w-36 flex-col items-center gap-0.5">
                <span className="max-w-full truncate text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {destaque ? destaque.canal : 'Total'}
                </span>
                <span
                  className={cn(
                    'font-semibold tabular-nums text-foreground',
                    valorCentro.length > 13 ? 'text-base' : 'text-lg'
                  )}
                >
                  {valorCentro}
                </span>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {destaque
                    ? `${formatPct(destaque.fracao)} · ${formatPedidos(destaque.pedidos)}`
                    : formatPedidos(totalPedidos)}
                </span>
              </div>
            </div>
          </div>

          <ul
            aria-label="Legenda de vendas por canal"
            className="w-full space-y-0.5 rounded-lg border border-border p-1.5 @md:ml-auto @md:max-w-72"
          >
            {fatias.map((f) => (
              <li key={f.canal}>
                <button
                  type="button"
                  aria-pressed={ativo === f.canal}
                  onPointerEnter={entrar(f.canal)}
                  onPointerLeave={sair}
                  onClick={() => setAtivo((a) => (a === f.canal ? null : f.canal))}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm',
                    'transition-all duration-fast ease-default hover:bg-muted/60',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    ativo === f.canal && 'bg-muted/60',
                    ativo !== null && ativo !== f.canal && 'opacity-50'
                  )}
                >
                  <span
                    aria-hidden
                    className={cn('h-2.5 w-2.5 shrink-0 rounded-full', corDoCanal(f.canal).ponto)}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-foreground">{f.canal}</span>
                    <span className="block truncate text-xs tabular-nums text-muted-foreground">
                      {formatBRL(f.valor)}
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
