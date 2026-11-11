import { useMemo, useState } from 'react'
import { COR, caminhoDeLinha, eixoComZero, escala, mesesRotulados } from '../../graficos'
import { useAnimarMarcas } from '../../hooks/use-entrada'
import { useTamanho } from '../../hooks/use-tamanho'
import { DicaGrafico, LinhaDica } from './DicaGrafico'

// Linhas no tempo — percentuais mês a mês, na MESMA régua.
//
// ── UM EIXO SÓ ──────────────────────────────────────────────────────────────
//
// O desenho do designer punha faturamento, despesas, lucro e rentabilidade no
// mesmo gráfico: reais e percentual numa régua só (a rentabilidade virava uma
// linha colada no zero) ou em duas réguas, que é o erro clássico — a posição das
// linhas passa a depender de uma escolha de escala, não do dado. Aqui só entram
// séries da MESMA unidade: os reais ficam nas colunas ao lado, os percentuais
// aqui.
//
// ── ÊNFASE, E NÃO CATEGORIAS ────────────────────────────────────────────────
//
// A primeira série é o assunto (cor do tema); as outras são contexto, em cinza e
// tracejadas — a diferença entre elas se lê sem depender de cor, e a legenda
// sempre presente diz qual é qual.
//
// O ponteiro mira o MÊS em qualquer altura da área, nunca a linha de 2 px.

export interface SerieDeLinha {
  id: string
  nome: string
  valores: Array<number | null>
}

export interface MesDaLinha {
  rotulo: string
  noPeriodo: boolean
}

interface Props {
  meses: MesDaLinha[]
  /** A primeira é a principal; as demais, contexto. */
  series: SerieDeLinha[]
  formatar: (v: number | null) => string
  altura?: number
}

const MARGEM = { topo: 10, direita: 14, base: 22, esquerda: 54 }

function corDaLinha(i: number): string {
  return i === 0 ? COR.serie : COR.apagada
}

export function LinhasNoTempo({ meses, series, formatar, altura = 260 }: Props) {
  const { ref, largura } = useTamanho<HTMLDivElement>()
  const [indice, setIndice] = useState<number | null>(null)
  useAnimarMarcas(ref, largura > 0, series)

  const eixo = useMemo(
    () =>
      eixoComZero(
        series.flatMap((s) => s.valores.filter((v): v is number => v != null)),
        4
      ),
    [series]
  )
  const px = escala(
    0,
    Math.max(meses.length - 1, 1),
    MARGEM.esquerda + 6,
    Math.max(largura - MARGEM.direita, MARGEM.esquerda + 40)
  )
  const py = escala(eixo.inicio, eixo.fim, altura - MARGEM.base, MARGEM.topo)
  const util = Math.max(largura - MARGEM.esquerda - MARGEM.direita, 1)
  const passoX = meses.length > 1 ? util / (meses.length - 1) : util

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
            const mx = e.clientX - caixa.left
            let melhor = 0
            let menor = Infinity
            meses.forEach((_, i) => {
              const d = Math.abs(px(i) - mx)
              if (d < menor) {
                menor = d
                melhor = i
              }
            })
            setIndice(melhor)
          }}
          onPointerLeave={() => setIndice(null)}
        >
          {meses.map((m, i) => {
            if (!m.noPeriodo) return null
            // A faixa do mês vai de meio passo antes a meio passo depois do
            // ponto, PRESA à área do desenho: no último mês ela passava da borda
            // do SVG (em tela cheia, ~40 px), e no primeiro entraria por baixo
            // dos rótulos do eixo (29/09/2026).
            const de = Math.max(px(i) - passoX / 2, MARGEM.esquerda)
            const ate = Math.min(px(i) + passoX / 2, largura)
            return (
              <rect
                key={`p-${m.rotulo}`}
                x={de}
                y={MARGEM.topo}
                width={Math.max(ate - de, 0)}
                height={altura - MARGEM.base - MARGEM.topo}
                className="fill-muted"
                opacity={0.6}
              />
            )
          })}

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
                {formatar(t)}
              </text>
            </g>
          ))}

          {/* O contexto primeiro, a principal por cima. */}
          {[...series].reverse().map((s) => {
            const i = series.indexOf(s)
            const coords = s.valores.map((v, k) => ({ x: px(k), y: v == null ? null : py(v) }))
            const ultimo = [...coords].reverse().find((c) => c.y !== null)
            return (
              <g key={s.id}>
                <path
                  data-marca="linha"
                  d={caminhoDeLinha(coords)}
                  fill="none"
                  stroke={corDaLinha(i)}
                  strokeWidth={2}
                  strokeDasharray={i === 0 ? undefined : '5 4'}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {ultimo && (
                  <circle
                    data-marca="ponto"
                    cx={ultimo.x}
                    cy={ultimo.y as number}
                    r={i === 0 ? 4 : 3}
                    fill={corDaLinha(i)}
                    stroke={COR.superficie}
                    strokeWidth={2}
                  />
                )}
              </g>
            )
          })}

          {indice != null && (
            <g>
              <line
                x1={px(indice)}
                x2={px(indice)}
                y1={MARGEM.topo}
                y2={altura - MARGEM.base}
                stroke={COR.apagada}
                strokeWidth={1}
              />
              {series.map((s, i) => {
                const v = s.valores[indice]
                if (v == null) return null
                return (
                  <circle
                    key={s.id}
                    cx={px(indice)}
                    cy={py(v)}
                    r={i === 0 ? 5 : 4}
                    fill={corDaLinha(i)}
                    stroke={COR.superficie}
                    strokeWidth={2}
                  />
                )
              })}
            </g>
          )}

          {meses.map((m, i) =>
            rotulados.has(i) ? (
              <text
                key={m.rotulo}
                x={px(i)}
                y={altura - 6}
                textAnchor={i === 0 ? 'start' : i === meses.length - 1 ? 'end' : 'middle'}
                className="fill-muted-foreground text-[10px]"
              >
                {m.rotulo}
              </text>
            ) : null
          )}
        </svg>
      )}

      {indice != null && meses[indice] && (
        <DicaGrafico x={px(indice)} y={MARGEM.topo} larguraContainer={largura}>
          <p className="mb-1 font-medium text-foreground">
            {meses[indice].rotulo}
            {meses[indice].noPeriodo && (
              <span className="font-normal text-muted-foreground"> · no período</span>
            )}
          </p>
          {series.map((s, i) => (
            <LinhaDica
              key={s.id}
              cor={corDaLinha(i)}
              rotulo={s.nome}
              valor={formatar(s.valores[indice] ?? null)}
            />
          ))}
        </DicaGrafico>
      )}
    </div>
  )
}
