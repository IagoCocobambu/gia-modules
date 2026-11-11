import { useEffect, useMemo, useState } from 'react'
import { Skeleton, usePrefersReducedMotion } from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'
import { formatBRL } from '../helpers'
import { Dica } from './Dica'
import type { VendaCanal } from '../types'

/**
 * Cor de cada canal — a mesma do `BadgeOrigemPedido` (App Coco Bambu azul, iFood
 * rosa, 99Food âmbar, pedido manual e canais novos em cinza), para o anel bater
 * com a coluna Origem. Classes literais (o Tailwind só gera o que encontra escrito).
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
const RAIO = 50
const ESPESSURA = 16
/** Respiro entre fatias, em % do anel. */
const RESPIRO = 0.8
/** Fatia mínima visível: canal com venda > 0 nunca some do anel. */
const MINIMO = 0.6

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

interface PainelCanaisProps {
  /** Venda de cada canal da pesquisa inteira (do maior para o menor), sem cancelados. */
  canais: VendaCanal[]
  /** Canal escolhido; `null` = todos. */
  canal: string | null
  onCanalChange: (canal: string | null) => void
  carregando: boolean
}

/**
 * Canais da seção de totais (opção A validada em 11/11/2026, no lugar do
 * Dashboard): só o anel, com a fatia de cada canal no total pago — sem legenda.
 * Clicar numa fatia escolhe o canal e a tela recorta os totais, a tabela e o
 * Exportar; clicar de novo nela (ou no miolo, "ver todos") volta à pesquisa
 * inteira. O seletor Canal da barra de filtros faz o mesmo (e é o caminho pelo
 * teclado). O anel é sempre da pesquisa inteira.
 *
 * Com mouse, a dica de cada fatia diz o canal, o valor, a % e os pedidos, e a
 * fatia sob o mouse acende (padrão 2: só com `hover: hover` e `pointerType`
 * mouse — no toque o navegador emula o mouse). No toque não há dica: o miolo
 * mostra o nome e os números do canal escolhido.
 */
export function PainelCanais({ canais, canal, onCanalChange, carregando }: PainelCanaisProps) {
  const reduzido = usePrefersReducedMotion()
  const [sobre, setSobre] = useState<string | null>(null)
  const [comHover] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches
  )
  const entrar = (c: string) => (e: { pointerType: string }) => {
    if (comHover && e.pointerType === 'mouse') setSobre(c)
  }
  const sair = (e: { pointerType: string }) => {
    if (comHover && e.pointerType === 'mouse') setSobre(null)
  }

  // O anel "cresce" ao aparecer: começa vazio e vai ao valor no frame seguinte.
  const [cheio, setCheio] = useState(reduzido)
  useEffect(() => {
    if (reduzido || carregando) return
    let id = requestAnimationFrame(() => {
      id = requestAnimationFrame(() => setCheio(true))
    })
    return () => cancelAnimationFrame(id)
  }, [reduzido, carregando])

  const total = useMemo(
    () => canais.reduce((acc, c) => acc + Math.round(Math.max(c.valor, 0) * 100), 0) / 100,
    [canais]
  )
  const totalPedidos = useMemo(() => canais.reduce((acc, c) => acc + c.pedidos, 0), [canais])
  const fatias = useMemo(() => montarFatias(canais, total), [canais, total])

  // O miolo: o canal escolhido; senão, o total.
  const escolhido = fatias.find((f) => f.canal === canal) ?? null
  const valorCentro = formatBRL(escolhido ? escolhido.valor : total)
  // Fatia acesa: a do mouse ou a escolhida; com nenhuma, todas acesas.
  const acesa = sobre ?? canal

  if (carregando) {
    return (
      <div className="grid place-items-center p-2">
        <Skeleton className="h-36 w-36 rounded-full" />
      </div>
    )
  }

  const miolo = (
    // Cabe no buraco do anel (~100 px de diâmetro): largura fixa de 88 px; o nome
    // do canal quebra em até 2 linhas e corta com "…" (nome longo não invade as fatias).
    <div className="flex w-[88px] flex-col items-center gap-px text-center leading-tight">
      <span className="line-clamp-2 max-w-full break-words text-[11px] font-medium text-muted-foreground">
        {escolhido ? escolhido.canal : 'Total pago'}
      </span>
      <span
        className={cn(
          'font-semibold tabular-nums text-foreground',
          valorCentro.length > 10 ? 'text-xs' : 'text-sm',
          'max-w-full truncate'
        )}
      >
        {valorCentro}
      </span>
      <span className="max-w-full truncate text-[10px] tabular-nums text-muted-foreground">
        {escolhido
          ? `${formatPct(escolhido.fracao)} · ${formatPedidos(escolhido.pedidos)}`
          : formatPedidos(totalPedidos)}
      </span>
      {escolhido && <span className="text-[10px] font-medium text-primary">ver todos</span>}
    </div>
  )

  return (
    <div className="grid place-items-center p-2" onPointerLeave={sair}>
      <div className="relative h-36 w-36">
        <svg
          viewBox="0 0 120 120"
          className="h-full w-full -rotate-90"
          role="img"
          aria-label={`Vendas por canal: ${fatias
            .map((f) => `${f.canal} ${formatBRL(f.valor)} (${formatPct(f.fracao)})`)
            .join(', ')}. Total ${formatBRL(total)}.`}
        >
          <circle
            cx={60}
            cy={60}
            r={RAIO}
            fill="none"
            strokeWidth={ESPESSURA}
            className="stroke-muted"
          />
          {fatias.map((f) =>
            f.tamanho > 0 ? (
              <Dica
                key={f.canal}
                content={`${f.canal}: ${formatBRL(f.valor)} · ${formatPct(f.fracao)} · ${formatPedidos(f.pedidos)}. ${
                  canal === f.canal
                    ? 'Clique para voltar a todos os canais.'
                    : 'Clique para ver os totais e os pedidos só deste canal.'
                }`}
              >
                <circle
                  cx={60}
                  cy={60}
                  r={RAIO}
                  fill="none"
                  strokeWidth={ESPESSURA}
                  pathLength={100}
                  className={cn(
                    corDoCanal(f.canal).traco,
                    'cursor-pointer outline-none',
                    !reduzido && 'transition-all duration-slow ease-default',
                    acesa !== null && acesa !== f.canal && 'opacity-30'
                  )}
                  style={{
                    strokeDasharray: `${cheio ? f.tamanho : 0} 100`,
                    strokeDashoffset: cheio ? -f.inicio : 0,
                  }}
                  onPointerEnter={entrar(f.canal)}
                  onPointerLeave={sair}
                  onClick={() => onCanalChange(canal === f.canal ? null : f.canal)}
                />
              </Dica>
            ) : null
          )}
        </svg>
        {/* Com um canal escolhido, o miolo volta a todos (alvo de toque de 64 px). */}
        {escolhido ? (
          <button
            type="button"
            aria-label={`${escolhido.canal} escolhido. Voltar a todos os canais`}
            onClick={() => onCanalChange(null)}
            className="absolute inset-[18%] grid place-items-center rounded-full text-center transition-colors duration-fast ease-default hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {miolo}
          </button>
        ) : (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 grid place-items-center text-center"
          >
            {miolo}
          </div>
        )}
      </div>
    </div>
  )
}
