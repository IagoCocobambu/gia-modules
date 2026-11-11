import { useMemo, useState } from 'react'
import { COR, eixoComZero, escala, mesesRotulados } from '../../graficos'
import { useAnimarMarcas } from '../../hooks/use-entrada'
import { useTamanho } from '../../hooks/use-tamanho'
import { DicaGrafico, LinhaDica } from './DicaGrafico'

// Colunas agrupadas por mês: faturamento, despesas e lucro lado a lado.
//
// ── AS TRÊS NA MESMA RÉGUA, E POR ISSO EM COLUNAS ───────────────────────────
//
// As três séries são reais, na mesma escala, e a leitura é "quanto entrou, quanto
// saiu, quanto sobrou" em cada mês — comparação de magnitude dentro do grupo. Em
// linhas, o lucro (uma fração do faturamento) ficaria colado no chão e a
// diferença entre despesa e faturamento viraria duas linhas quase paralelas.
//
// O EIXO CONTÉM O ZERO, SEMPRE: mês de prejuízo desce abaixo da linha do zero, e
// a ponta arredondada da coluna fica do lado do dado (em cima na positiva,
// embaixo na negativa), a base reta encostada no zero.
//
// Cores validadas para daltonismo nos dois temas (ver `graficos.ts`); a legenda
// sempre presente e a dica nomeiam cada série — a cor nunca vai sozinha.
//
// ── O PONTEIRO MIRA O MÊS ───────────────────────────────────────────────────
//
// A faixa inteira do mês é o alvo: acertar uma coluna de 10 px é mira difícil. A
// dica lista as três séries e quantas lojas entraram no mês.

export interface SerieDeColunas {
  id: string
  nome: string
  cor: string
  valores: Array<number | null>
}

export interface MesDaColuna {
  rotulo: string
  /** O mês está no período escolhido no topo: ganha a faixa de fundo. */
  noPeriodo: boolean
  /** Quantas lojas da conta têm plano no mês. */
  lojas: number
}

interface Props {
  meses: MesDaColuna[]
  series: SerieDeColunas[]
  /** Rótulo curto do eixo (`R$ 1,5 mi`). */
  formatarEixo: (v: number) => string
  /** Valor por extenso da dica. */
  formatarValor: (v: number | null) => string
  altura?: number
}

const MARGEM = { topo: 8, direita: 8, base: 22, esquerda: 70 }

export function ColunasAgrupadas({
  meses,
  series,
  formatarEixo,
  formatarValor,
  altura = 260,
}: Props) {
  const { ref, largura } = useTamanho<HTMLDivElement>()
  const [indice, setIndice] = useState<number | null>(null)
  // A animação acompanha o DADO: trocar de recorte redesenha crescendo; passar o
  // ponteiro não.
  useAnimarMarcas(ref, largura > 0, series)

  const eixo = useMemo(
    () =>
      eixoComZero(
        series.flatMap((s) => s.valores.filter((v): v is number => v != null)),
        4
      ),
    [series]
  )
  const util = Math.max(largura - MARGEM.esquerda - MARGEM.direita, 1)
  const faixa = util / Math.max(meses.length, 1)
  const grupo = Math.min(faixa * 0.72, series.length * 22)
  const coluna = Math.max(Math.min(grupo / series.length - 2, 18), 2)
  const py = escala(eixo.inicio, eixo.fim, altura - MARGEM.base, MARGEM.topo)
  const zero = py(0)

  // Os rótulos do eixo X saem da largura: com 12 meses num celular, "jan/26" e
  // "fev/26" se atropelavam (ver `mesesRotulados`).
  const rotulados = useMemo(() => mesesRotulados(meses.length, util), [meses.length, util])

  return (
    <div ref={ref} className="relative w-full" style={{ height: altura }}>
      {largura > 0 && (
        <svg
          width={largura}
          height={altura}
          role="img"
          aria-label={`${series.map((s) => s.nome).join(', ')} em ${meses.length} meses`}
          onPointerMove={(e) => {
            const caixa = ref.current?.getBoundingClientRect()
            if (!caixa) return
            const x = e.clientX - caixa.left - MARGEM.esquerda
            const i = Math.floor(x / faixa)
            setIndice(i >= 0 && i < meses.length ? i : null)
          }}
          onPointerLeave={() => setIndice(null)}
        >
          {/* Faixa de fundo dos meses do período escolhido no topo. */}
          {meses.map((m, i) =>
            m.noPeriodo ? (
              <rect
                key={`p-${m.rotulo}`}
                x={MARGEM.esquerda + i * faixa}
                y={MARGEM.topo}
                width={faixa}
                height={altura - MARGEM.base - MARGEM.topo}
                className="fill-muted"
                opacity={0.6}
              />
            ) : null
          )}
          {indice != null && (
            <rect
              x={MARGEM.esquerda + indice * faixa}
              y={MARGEM.topo}
              width={faixa}
              height={altura - MARGEM.base - MARGEM.topo}
              className="fill-muted"
            />
          )}

          {eixo.marcas.map((t) => (
            <g key={t}>
              <line
                x1={MARGEM.esquerda}
                x2={largura - MARGEM.direita}
                y1={py(t)}
                y2={py(t)}
                stroke={COR.recessiva}
                strokeWidth={t === 0 ? 1.5 : 1}
              />
              <text
                x={MARGEM.esquerda - 6}
                y={py(t)}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-muted-foreground text-[10px] tabular-nums"
              >
                {formatarEixo(t)}
              </text>
            </g>
          ))}

          {meses.map((m, i) => {
            const x0 = MARGEM.esquerda + i * faixa + (faixa - grupo) / 2
            return (
              <g key={m.rotulo}>
                {series.map((s, j) => {
                  const v = s.valores[i]
                  if (v == null) return null
                  const x = x0 + j * (grupo / series.length) + 1
                  const y = py(v)
                  const topo = Math.min(y, zero)
                  const h = Math.max(Math.abs(y - zero), v !== 0 ? 1.5 : 0)
                  return (
                    <path
                      key={s.id}
                      d={colunaArredondada(x, topo, coluna, h, v < 0)}
                      fill={s.cor}
                      data-marca="coluna"
                      data-origem={v < 0 ? 'top' : undefined}
                      data-ordem={i}
                      opacity={indice != null && indice !== i ? 0.55 : 1}
                    />
                  )
                })}
                {rotulados.has(i) && (
                  <text
                    x={MARGEM.esquerda + i * faixa + faixa / 2}
                    y={altura - 6}
                    textAnchor="middle"
                    className="fill-muted-foreground text-[10px]"
                  >
                    {m.rotulo}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      )}

      {indice != null && meses[indice] && (
        <DicaGrafico
          x={MARGEM.esquerda + indice * faixa + faixa / 2}
          y={MARGEM.topo}
          larguraContainer={largura}
        >
          <p className="mb-1 font-medium text-foreground">
            {meses[indice].rotulo}
            {meses[indice].noPeriodo && (
              <span className="font-normal text-muted-foreground"> · no período</span>
            )}
          </p>
          {series.map((s) => (
            <LinhaDica
              key={s.id}
              cor={s.cor}
              rotulo={s.nome}
              valor={formatarValor(s.valores[indice] ?? null)}
            />
          ))}
          <p className="mt-1 text-muted-foreground">
            {meses[indice].lojas === 0
              ? 'Nenhuma loja da conta com plano no mês.'
              : meses[indice].lojas === 1
                ? '1 loja com plano no mês.'
                : `${meses[indice].lojas} lojas com plano no mês.`}
          </p>
        </DicaGrafico>
      )}
    </div>
  )
}

/**
 * Coluna com a ponta do DADO arredondada e a base reta no zero: em cima na
 * positiva, embaixo na negativa. Arredondar os quatro cantos descolaria a marca
 * da linha do zero.
 */
function colunaArredondada(x: number, y: number, w: number, h: number, negativa: boolean): string {
  const r = Math.max(0, Math.min(3, w / 2, h))
  if (r === 0 || h <= 0) return `M${x} ${y}h${w}v${Math.max(h, 0)}h${-w}Z`
  if (!negativa) {
    return `M${x} ${y + h}v${-(h - r)}a${r} ${r} 0 0 1 ${r} ${-r}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - r}Z`
  }
  return `M${x} ${y}v${h - r}a${r} ${r} 0 0 0 ${r} ${r}h${w - 2 * r}a${r} ${r} 0 0 0 ${r} ${-r}v${-(h - r)}Z`
}

/** A legenda das séries: sempre presente com duas ou mais, com o nome escrito. */
export function LegendaDeSeries({
  series,
}: {
  series: Array<{ id: string; nome: string; cor: string; tracejada?: boolean }>
}) {
  return (
    <ul className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
      {series.map((s) => (
        <li key={s.id} className="flex items-center gap-1.5">
          <span
            aria-hidden
            className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
            style={
              s.tracejada
                ? { background: 'transparent', border: `1.5px dashed ${s.cor}` }
                : { background: s.cor }
            }
          />
          {s.nome}
        </li>
      ))}
    </ul>
  )
}
