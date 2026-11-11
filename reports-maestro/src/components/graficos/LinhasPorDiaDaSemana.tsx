import { useState, type PointerEvent } from 'react'
import { cn } from '@gia-cb/ui/cn'
import { COR, escala } from '../../graficos'
import { useAnimarMarcas } from '../../hooks/use-entrada'
import { useTamanho } from '../../hooks/use-tamanho'
import { media } from '../../operacional'
import { DicaGrafico, LinhaDica } from './DicaGrafico'

// A leitura "Por dia da semana" do dia × hora: uma linha por dia da semana, com
// as horas no eixo horizontal e a métrica no vertical.
//
// Escolha do usuário em 05/11/2026, entre cinco propostas de desenho. O mapa de calor só mostrava o
// número no hover; a linha mostra a FORMA do dia (subida do almoço, vale da
// tarde, pico do jantar) e o valor se lê no eixo. A leitura "Por dia" (uma linha
// por data, até 31) continua no mapa de calor: 31 linhas viram um feixe.
//
// ── UMA COR POR DIA, E UM DESTAQUE ──────────────────────────────────────────
//
// Cada dia tem a sua cor (`COR_DIA_DA_SEMANA`, pedido do usuário em 05/11/2026),
// e a linha grossa neutra é a MÉDIA dos dias em cada hora — o dia típico. Sete
// cores não se separam todas sob daltonismo, então a cor só ajuda a seguir a
// linha: para ler um dia, ele é DESTACADO pela legenda (de botões) — fica por
// cima, mais grosso, com um halo da própria cor e os pontos, e os outros recuam.
// A dica, na hora apontada, lista todos os dias com o valor: nenhum número
// depende de achar a linha certa.
//
// Hora sem medida (poucas entregas, ou nenhum pedido) DESCE ATÉ A BASE do
// gráfico, para a linha não ficar quebrada (pedido do usuário em 05/11/2026).
// A base não é um valor: no dia destacado o ponto dessa hora é VAZADO, e a dica
// diz "sem medida" — quem lê não confunde a descida com tempo baixo.

export interface SerieDoDia {
  chave: string
  rotulo: string
  /** Um valor por hora de `horas`; `null` = sem medida nessa hora. */
  valores: Array<number | null>
  /** A cor da linha do dia (`COR_DIA_DA_SEMANA`). */
  cor: string
}

interface Props {
  /** ESTÁVEL entre renders (memo no pai): mudar a série redesenha as linhas. */
  series: SerieDoDia[]
  horas: number[]
  /** Nome do que o eixo mede, para a dica ("Tempo na loja (média)"). */
  metrica: string
  formatar: (v: number | null) => string
  /** Rótulo curto do eixo vertical ("min", "pedidos"). */
  unidade: string
  /** O eixo começa no zero (contagem) em vez de perto do menor valor (tempo). */
  doZero?: boolean
}

const ALTURA = 220
const ALTURA_CELULAR = 190
const EIXO_Y = 36
const EIXO_X = 20
const TOPO = 14

/** Passo "redondo" (1, 2, 5 × 10ⁿ) para umas quatro marcas no eixo. */
function passoRedondo(amplitude: number) {
  const bruto = amplitude / 4
  const ordem = 10 ** Math.floor(Math.log10(Math.max(bruto, Number.EPSILON)))
  const n = bruto / ordem
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * ordem
}

/** A linha inteira, sem buracos: hora sem medida vai para `yBase`. */
function caminho(
  valores: Array<number | null>,
  px: (j: number) => number,
  py: (v: number) => number,
  yBase: number
) {
  return valores
    .map((v, j) => `${j === 0 ? 'M' : 'L'}${px(j)} ${v == null ? yBase : py(v)}`)
    .join(' ')
}

export function LinhasPorDiaDaSemana({ series, horas, metrica, formatar, unidade, doZero }: Props) {
  const { ref, largura } = useTamanho<HTMLDivElement>()
  useAnimarMarcas(ref, largura > 0, series)
  const [fixo, setFixo] = useState<string | null>(null)
  const [previa, setPrevia] = useState<string | null>(null)
  const [apontada, setApontada] = useState<{ j: number; x: number; y: number } | null>(null)
  const destaque = previa ?? fixo

  const variosDias = series.length > 1
  // A média dos dias em cada hora: o dia típico. Só com 2 dias ou mais medidos.
  const mediaDosDias = horas.map((_, j) => {
    const vs = series.map((s) => s.valores[j]).filter((v): v is number => v != null)
    return vs.length >= 2 ? media(vs) : null
  })

  const todos = series.flatMap((s) => s.valores).filter((v): v is number => v != null)
  const maior = todos.length ? Math.max(...todos) : 1
  const menor = todos.length ? Math.min(...todos) : 0
  const passo = passoRedondo(Math.max(maior - (doZero ? 0 : menor), 1))
  const base = doZero ? 0 : Math.max(0, Math.floor(menor / passo) * passo)
  const teto = Math.max(Math.ceil(maior / passo) * passo, base + passo)
  const marcas: number[] = []
  for (let v = base; v <= teto + passo / 2; v += passo) marcas.push(v)

  const altura = largura < 480 ? ALTURA_CELULAR : ALTURA
  const x0 = EIXO_Y
  const x1 = Math.max(largura - 8, x0 + 40)
  const yBase = altura - EIXO_X
  const px = (j: number) =>
    horas.length > 1 ? escala(0, horas.length - 1, x0, x1)(j) : (x0 + x1) / 2
  const py = escala(base, teto, yBase, TOPO)
  // Rótulo de hora de N em N, para não se atropelarem no celular.
  const passoHora = Math.max(1, Math.ceil(30 / Math.max((x1 - x0) / Math.max(horas.length, 1), 1)))

  const aoMover = (ev: PointerEvent<SVGSVGElement>) => {
    const caixa = ref.current?.getBoundingClientRect()
    if (!caixa || horas.length === 0) return
    const x = ev.clientX - caixa.left
    const j = Math.round(((x - x0) / Math.max(x1 - x0, 1)) * (horas.length - 1))
    setApontada({ j: Math.min(Math.max(j, 0), horas.length - 1), x, y: ev.clientY - caixa.top })
  }

  const serieDestaque = series.find((s) => s.chave === destaque) ?? (variosDias ? null : series[0])
  const naHora = apontada
    ? series
        .map((s) => ({ s, v: s.valores[apontada.j] }))
        .sort((a, b) => (b.v ?? -Infinity) - (a.v ?? -Infinity))
    : []

  return (
    <div className="flex flex-col gap-2">
      <div ref={ref} className="relative">
        {largura > 0 && horas.length > 0 && (
          <svg
            width={largura}
            height={altura}
            role="img"
            aria-label={`${metrica} por hora do pedido, uma linha por dia da semana: ${series.map((s) => s.rotulo).join(', ')}`}
            className="block touch-pan-y"
            onPointerMove={aoMover}
            onPointerDown={aoMover}
            onPointerLeave={() => setApontada(null)}
          >
            {/* Grade e eixo vertical. */}
            {marcas.map((v) => (
              <g key={v}>
                <line x1={x0} x2={x1} y1={py(v)} y2={py(v)} stroke={COR.recessiva} />
                <text
                  x={x0 - 6}
                  y={py(v)}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className="fill-muted-foreground text-[10px] tabular-nums"
                >
                  {v.toLocaleString('pt-BR')}
                </text>
              </g>
            ))}
            <text x={0} y={TOPO - 6} className="fill-muted-foreground text-[10px]">
              {unidade}
            </text>
            {horas.map((h, j) =>
              j % passoHora === 0 ? (
                <text
                  key={h}
                  x={px(j)}
                  y={altura - 4}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[10px] tabular-nums"
                >
                  {h}h
                </text>
              ) : null
            )}

            {/* A hora apontada. */}
            {apontada && (
              <line
                x1={px(apontada.j)}
                x2={px(apontada.j)}
                y1={TOPO}
                y2={yBase}
                stroke="var(--color-muted-foreground)"
                strokeDasharray="3 3"
              />
            )}

            {/* A média dos dias, por baixo das cores. */}
            {variosDias && (
              <path
                data-marca="linha"
                d={caminho(mediaDosDias, px, py, yBase)}
                fill="none"
                stroke="var(--color-foreground)"
                strokeWidth={3}
                strokeLinejoin="round"
                strokeLinecap="round"
                className={cn(
                  'transition-opacity duration-fast',
                  serieDestaque && variosDias ? 'opacity-20' : 'opacity-90'
                )}
              />
            )}

            {/* Os dias, cada um na sua cor. O destacado vai por último (por cima),
                mais grosso, com um halo da própria cor e os pontos; os outros
                recuam. Largura e opacidade mudam com transição. */}
            {[...series]
              .sort((a, b) => Number(a === serieDestaque) - Number(b === serieDestaque))
              .map((s) => {
                const emDestaque = s === serieDestaque && variosDias
                const recuada = serieDestaque != null && !emDestaque && variosDias
                const d = caminho(s.valores, px, py, yBase)
                return (
                  <g key={s.chave}>
                    <path
                      aria-hidden
                      d={d}
                      fill="none"
                      stroke={s.cor}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      className={cn(
                        'transition-[opacity,stroke-width] duration-default',
                        emDestaque ? 'opacity-25' : 'opacity-0'
                      )}
                      style={{ strokeWidth: emDestaque ? 10 : 2 }}
                    />
                    <path
                      data-marca="linha"
                      d={d}
                      fill="none"
                      stroke={s.cor}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      className={cn(
                        'transition-[opacity,stroke-width] duration-default',
                        recuada ? 'opacity-15' : 'opacity-100'
                      )}
                      style={{ strokeWidth: emDestaque ? 3.5 : recuada ? 1.25 : 1.75 }}
                    />
                    {/* Ponto cheio = valor medido; vazado na base = sem medida. */}
                    {/* Sempre no DOM, para surgirem com transição ao destacar. */}
                    {s.valores.map((v, j) => (
                      <circle
                        key={j}
                        cx={px(j)}
                        cy={v == null ? yBase : py(v)}
                        r={4}
                        fill={v == null ? 'var(--color-surface)' : s.cor}
                        stroke={v == null ? s.cor : 'var(--color-surface)'}
                        strokeWidth={1.5}
                        className={cn(
                          'transition-opacity duration-default',
                          emDestaque || !variosDias ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                    ))}
                  </g>
                )
              })}
          </svg>
        )}
        {apontada && (
          <DicaGrafico x={apontada.x} y={apontada.y} larguraContainer={largura}>
            <p className="mb-1 font-medium text-foreground">
              {horas[apontada.j]}h · {metrica}
            </p>
            {variosDias && (
              <LinhaDica
                cor="var(--color-foreground)"
                rotulo="Média dos dias"
                valor={formatar(mediaDosDias[apontada.j])}
              />
            )}
            {naHora.map(({ s, v }) => (
              <LinhaDica
                key={s.chave}
                cor={s.cor}
                rotulo={s.rotulo}
                valor={v == null ? 'sem medida' : formatar(v)}
              />
            ))}
          </DicaGrafico>
        )}
      </div>

      {/* A legenda É o seletor do destaque: passar o mouse mostra, clicar fixa. */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
        {variosDias && (
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="h-[3px] w-4 rounded-full bg-foreground" />
            Média dos dias
          </span>
        )}
        <div role="group" aria-label="Destacar um dia" className="flex flex-wrap gap-1">
          {series.map((s) => {
            const ativo = destaque === s.chave
            return (
              <button
                key={s.chave}
                type="button"
                aria-pressed={fixo === s.chave}
                onClick={() => setFixo((f) => (f === s.chave ? null : s.chave))}
                // Prévia só com mouse: no toque o navegador emula um "mouse" no
                // ponto tocado e a prévia ligaria e desligaria sozinha (padrão 2
                // do workspace). No toque, o clique fixa o dia.
                onPointerEnter={(e) => {
                  if (e.pointerType === 'mouse') setPrevia(s.chave)
                }}
                onPointerLeave={() => setPrevia(null)}
                onFocus={() => setPrevia(s.chave)}
                onBlur={() => setPrevia(null)}
                className={cn(
                  'flex items-center gap-1.5 rounded-md border px-2 py-0.5 outline-none [@media(hover:none)]:min-h-11 [@media(hover:none)]:px-3 transition-[color,background-color,border-color,opacity] duration-fast focus-visible:ring-2 focus-visible:ring-ring',
                  ativo
                    ? 'font-medium text-foreground'
                    : 'border-border text-muted-foreground hover:text-foreground',
                  destaque && !ativo && 'opacity-60'
                )}
                style={
                  ativo
                    ? {
                        borderColor: s.cor,
                        background: `color-mix(in oklab, ${s.cor} 16%, transparent)`,
                      }
                    : undefined
                }
              >
                <span
                  aria-hidden
                  className={cn(
                    'rounded-full transition-[height,width] duration-fast',
                    ativo ? 'h-1 w-4' : 'h-0.5 w-3'
                  )}
                  style={{ background: s.cor }}
                />
                {s.rotulo}
              </button>
            )
          })}
        </div>
        {variosDias && <span>Toque num dia para destacá-lo.</span>}
      </div>
    </div>
  )
}
