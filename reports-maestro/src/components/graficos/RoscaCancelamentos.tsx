import { useRef, useState, type PointerEvent } from 'react'
import { cn } from '@gia-cb/ui/cn'
import { COR_QUEM_CANCELOU } from '../../graficos'
import { useAnimarMarcas } from '../../hooks/use-entrada'
import {
  QUEM_CANCELOU,
  fmtBRLCompacto,
  fmtDuracao,
  fmtInt,
  fmtPct,
  TRACO,
  type CancelamentosPorQuem,
} from '../../operacional'
import { DicaGrafico, LinhaDica } from './DicaGrafico'
import { useContagem } from '../../hooks/use-contagem'
import { NumeroAnimado } from './NumeroAnimado'

const fmtIntOuTraco = (v: number | null) => (v == null ? TRACO : fmtInt(v))
const fmtBRLOuTraco = (v: number | null) => (v == null ? TRACO : fmtBRLCompacto(v))

// Quem cancelou: uma rosca com o total no meio e a legenda ao lado.
//
// Escolha do usuário em 05/11/2026, entre cinco propostas de desenho. As barras de antes deixavam o
// card quase vazio (2, 1 e 1 cancelamentos numa moldura alta); a rosca põe o
// total em destaque e a "parte do todo" se lê de relance.
//
// ── A LEGENDA CARREGA OS NÚMEROS ────────────────────────────────────────────
//
// Ângulo é difícil de comparar com precisão. Por isso a legenda escreve tudo —
// quantos, a parte do total, o valor perdido e a média até cancelar —, e a
// rosca serve para a proporção. A dica repete os números sobre a fatia; nada
// existe só nela.
//
// ── CADA FATIA É UM ARCO DESENHADO COM TRAÇO ────────────────────────────────
//
// A fatia é o arco do meio do anel com um traço da espessura do anel, e não uma
// área: assim a animação `linha` do `useAnimarMarcas` desenha a fatia do começo
// ao fim, e a rosca se completa a cada mudança dos dados. Entre fatias fica uma
// fresta fixa em pixels.

interface Props {
  grupos: CancelamentosPorQuem[]
}

const TAMANHO = 168
const ESPESSURA = 22
const RAIO = (TAMANHO - ESPESSURA) / 2
/** A fresta entre fatias, em pixels sobre o arco do meio. */
const FRESTA_PX = 3

/** Ponto do arco no ângulo `a` (radianos, 0 = topo, sentido horário). */
function ponto(a: number) {
  const c = TAMANHO / 2
  return [c + RAIO * Math.sin(a), c - RAIO * Math.cos(a)] as const
}

function arco(a0: number, a1: number) {
  const [x0, y0] = ponto(a0)
  const [x1, y1] = ponto(a1)
  const grande = a1 - a0 > Math.PI ? 1 : 0
  return `M${x0} ${y0} A${RAIO} ${RAIO} 0 ${grande} 1 ${x1} ${y1}`
}

export function RoscaCancelamentos({ grupos }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  useAnimarMarcas(ref, true, grupos)
  const [ativo, setAtivo] = useState<string | null>(null)
  const [dica, setDica] = useState<{ x: number; y: number; g: CancelamentosPorQuem } | null>(null)

  const total = grupos.reduce((s, g) => s + g.pedidos, 0)
  // O total no meio da rosca conta do zero, como os números da legenda.
  const { ref: refCentro, texto: textoCentro } = useContagem<SVGTextElement>(total, fmtIntOuTraco)
  const fresta = grupos.length > 1 ? FRESTA_PX / RAIO : 0
  /** Ângulo de cada fatia: começa onde a soma das anteriores termina. */
  const angulo = (pedidos: number) => (pedidos / total) * Math.PI * 2
  const fatias = grupos.map((g, i) => {
    const a0 = grupos.slice(0, i).reduce((s, x) => s + angulo(x.pedidos), 0)
    return { g, a0, a1: a0 + angulo(g.pedidos) }
  })

  return (
    <div ref={ref} className="relative flex flex-wrap items-center gap-6">
      <svg
        width={TAMANHO}
        height={TAMANHO}
        role="img"
        aria-label={`${fmtInt(total)} cancelamentos: ${grupos
          .map((g) => `${QUEM_CANCELOU[g.por]} ${fmtInt(g.pedidos)}`)
          .join(', ')}`}
        className="shrink-0"
      >
        {fatias.map(({ g, a0, a1 }) => {
          const cor = COR_QUEM_CANCELOU[g.por]
          const apagada = ativo != null && ativo !== g.por
          const comum = {
            'data-marca': 'linha',
            fill: 'none',
            stroke: cor,
            strokeWidth: ESPESSURA,
            className: cn(
              'transition-opacity duration-fast',
              apagada ? 'opacity-40' : 'opacity-100'
            ),
            // Destaque e dica da fatia só com mouse (padrão 2 do workspace): no
            // toque, os números estão escritos na lista ao lado.
            onPointerEnter: (ev: PointerEvent) => {
              if (ev.pointerType === 'mouse') setAtivo(g.por)
            },
            onPointerMove: (ev: PointerEvent) => {
              if (ev.pointerType !== 'mouse') return
              const caixa = ref.current?.getBoundingClientRect()
              if (!caixa) return
              setDica({ x: ev.clientX - caixa.left, y: ev.clientY - caixa.top, g })
            },
            onPointerLeave: () => {
              setAtivo(null)
              setDica(null)
            },
          }
          // Um grupo só: o anel inteiro (um arco de 360° não se desenha).
          return grupos.length === 1 ? (
            <path
              key={g.por}
              d={`${arco(0, Math.PI)} ${arco(Math.PI, Math.PI * 2).replace(/^M[^A]+/, '')}`}
              {...comum}
            />
          ) : (
            <path key={g.por} d={arco(a0 + fresta / 2, a1 - fresta / 2)} {...comum} />
          )
        })}
        <text
          x={TAMANHO / 2}
          y={TAMANHO / 2 + 4}
          textAnchor="middle"
          className="fill-foreground text-2xl font-semibold"
          ref={refCentro}
        >
          {textoCentro}
        </text>
        <text
          x={TAMANHO / 2}
          y={TAMANHO / 2 + 22}
          textAnchor="middle"
          className="fill-muted-foreground text-xs"
        >
          {total === 1 ? 'cancelamento' : 'cancelamentos'}
        </text>
      </svg>

      {/* A legenda é uma tabela: as colunas de número se alinham entre as linhas
          (subgrid), à direita e com dígitos de largura fixa. No cartão estreito
          (celular) cada grupo vira duas linhas, com os mesmos números. */}
      <ul className="grid min-w-[12rem] flex-1 grid-cols-1 gap-y-1 @2xl:grid-cols-[auto_minmax(0,1fr)_auto_auto_auto_auto] @2xl:gap-x-5">
        <li
          aria-hidden
          className="hidden px-1.5 pb-1 text-xs text-muted-foreground @2xl:col-span-6 @2xl:grid @2xl:grid-cols-subgrid"
        >
          <span />
          <span>Quem</span>
          <span className="text-right">Qtd.</span>
          <span className="text-right">Do total</span>
          <span className="text-right">Valor</span>
          <span className="text-right">Média até cancelar</span>
        </li>
        {grupos.map((g) => (
          <li
            key={g.por}
            tabIndex={0}
            onPointerEnter={(ev) => {
              if (ev.pointerType === 'mouse') setAtivo(g.por)
            }}
            onPointerLeave={() => setAtivo(null)}
            onFocus={() => setAtivo(g.por)}
            onBlur={() => setAtivo(null)}
            className={cn(
              'grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2.5 rounded-md px-1.5 py-1.5 tabular-nums outline-none transition-[opacity,background-color] duration-fast hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring @2xl:col-span-6 @2xl:grid-cols-subgrid',
              ativo != null && ativo !== g.por ? 'opacity-50' : 'opacity-100'
            )}
          >
            <span
              aria-hidden
              className="size-2.5 rounded-[3px]"
              style={{ background: COR_QUEM_CANCELOU[g.por] }}
            />
            <span className="min-w-0">
              <span className="block truncate text-sm text-foreground">{QUEM_CANCELOU[g.por]}</span>
              {/* Estreito: valor e média na segunda linha. */}
              <span className="block truncate text-xs text-muted-foreground @2xl:hidden">
                <NumeroAnimado valor={g.valor} formatar={fmtBRLOuTraco} /> · média{' '}
                <NumeroAnimado valor={g.mediaMin} formatar={fmtDuracao} />
              </span>
            </span>
            {/* Estreito: quantidade e parte do total empilhadas. */}
            <span className="text-right @2xl:hidden">
              <span className="block text-sm font-semibold text-foreground">
                <NumeroAnimado valor={g.pedidos} formatar={fmtIntOuTraco} />
              </span>
              <span className="block text-xs text-muted-foreground">
                <NumeroAnimado valor={g.pedidos / total} formatar={fmtPct} />
              </span>
            </span>
            {/* Largo: uma coluna para cada número. */}
            <span className="hidden text-right text-sm font-semibold text-foreground @2xl:block">
              {fmtInt(g.pedidos)}
            </span>
            <span className="hidden text-right text-sm text-muted-foreground @2xl:block">
              <NumeroAnimado valor={g.pedidos / total} formatar={fmtPct} />
            </span>
            <span className="hidden text-right text-sm text-foreground @2xl:block">
              <NumeroAnimado valor={g.valor} formatar={fmtBRLOuTraco} />
            </span>
            <span className="hidden text-right text-sm text-foreground @2xl:block">
              <NumeroAnimado valor={g.mediaMin} formatar={fmtDuracao} />
            </span>
          </li>
        ))}
      </ul>

      {dica && (
        <DicaGrafico x={dica.x} y={dica.y}>
          <p className="mb-1 font-medium text-foreground">{QUEM_CANCELOU[dica.g.por]}</p>
          <LinhaDica rotulo="Cancelamentos" valor={fmtInt(dica.g.pedidos)} />
          <LinhaDica rotulo="Parte do total" valor={fmtPct(dica.g.pedidos / total)} />
          <LinhaDica rotulo="Valor" valor={fmtBRLCompacto(dica.g.valor)} />
          <LinhaDica rotulo="Média até cancelar" valor={fmtDuracao(dica.g.mediaMin)} />
        </DicaGrafico>
      )}
    </div>
  )
}
