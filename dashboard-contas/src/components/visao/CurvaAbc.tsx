import { useMemo, useState } from 'react'
import { INDICE_FATURAMENTO, type Catalogo } from '../../catalogo'
import { CORTES_ABC, curvaAbc, resumoDaCurva, type ClasseAbc } from '../../curva-abc'
import { COR, escala } from '../../graficos'
import { fmtBRLCompacto, fmtPct, plural } from '../../formato'
import { useAnimarMarcas } from '../../hooks/use-entrada'
import { useTamanho } from '../../hooks/use-tamanho'
import { valorDe } from '../../matriz'
import type { RecorteCalculado } from '../../recorte'
import { DicaGrafico, LinhaDica } from '../graficos/DicaGrafico'
import { MolduraGrafico } from '../graficos/MolduraGrafico'

// A curva ABC do faturamento — a das colunas AG a AN da aba RANKING do BI
// mensal: as lojas em ordem de faturamento, e quanto do total elas somam.
//
// ── UMA SÉRIE, UM EIXO — E NÃO O PARETO DE MANUAL ───────────────────────────
//
// O Pareto de livro põe a fatia de cada loja em barras e o acumulado em linha,
// cada um na sua régua. Duas réguas o painel não faz (a posição de uma marca
// passaria a depender de uma escolha de escala). E na mesma régua, de 0 a 100%,
// barras de 1 a 6% — o tamanho das fatias da rede — não se leem.
//
// O que responde a pergunta da curva é o ACUMULADO: onde ele cruza 70% e 90%.
// Então o desenho é só ele, com as três faixas de lojas ao fundo e os dois
// cortes tracejados; a fatia de cada loja fica na dica e na planilha.
//
// ── A COR DAS FAIXAS É ORDEM, NÃO CATEGORIA ─────────────────────────────────
//
// A, B e C são uma escala (quem mais fatura primeiro), então as três faixas são
// o mesmo tom em três intensidades, do mais forte ao mais fraco — nunca três
// cores. E a letra está escrita em cada faixa: a identidade não depende da cor.

interface OperacaoDaCurva {
  ref: string
  nome: string
}

interface Props {
  cat: Catalogo
  recorte: RecorteCalculado
  operacoes: readonly OperacaoDaCurva[]
  atraso?: number
}

const ALTURA = 240
const MARGEM = { topo: 18, direita: 14, base: 22, esquerda: 44 }
const OPACIDADE: Record<ClasseAbc, number> = { A: 0.16, B: 0.09, C: 0.04 }
const MARCAS = [0, 0.25, 0.5, 0.75, 1]
/** Marca de eixo sem casa decimal: "25%", e não "25,00%". */
const pctRedondo = (v: number) => `${Math.round(v * 100)}%`

interface ItemDaCurva {
  ref: string
  nome: string
  faturamento: number | null
}

export function CurvaAbc({ cat, recorte, operacoes, atraso }: Props) {
  const { ref, largura } = useTamanho<HTMLDivElement>()
  const [indice, setIndice] = useState<number | null>(null)

  const curva = useMemo(() => {
    const nomePorRef = new Map(operacoes.map((o) => [o.ref, o.nome]))
    const itens: ItemDaCurva[] = [...recorte.naConta].map((r) => {
      const ag = recorte.porLoja.get(r)
      return {
        ref: r,
        nome: nomePorRef.get(r) ?? r,
        faturamento: ag ? valorDe(ag, cat, INDICE_FATURAMENTO) : null,
      }
    })
    return curvaAbc(itens, (i) => i.faturamento)
  }, [recorte, operacoes, cat])
  const resumo = useMemo(() => resumoDaCurva(curva), [curva])
  useAnimarMarcas(ref, largura > 0, curva)

  const n = curva.length
  const util = Math.max(largura - MARGEM.esquerda - MARGEM.direita, 1)
  const passo = n > 0 ? util / n : util
  // A loja i ocupa a fatia que TERMINA em px(i): a curva sobe da origem até ela.
  const px = (i: number) => MARGEM.esquerda + (i + 1) * passo
  const py = escala(0, 1, ALTURA - MARGEM.base, MARGEM.topo)

  // Onde cada faixa começa e termina, em lojas.
  const faixas = useMemo(() => {
    const saida: Array<{ classe: ClasseAbc; de: number; ate: number }> = []
    for (const [i, p] of curva.entries()) {
      const ultima = saida[saida.length - 1]
      if (ultima && ultima.classe === p.classe) ultima.ate = i
      else saida.push({ classe: p.classe, de: i, ate: i })
    }
    return saida
  }, [curva])

  // Sem memorizar: são no máximo uma centena de pontos, e `px` muda com a largura.
  const caminho =
    n === 0
      ? ''
      : [
          `M${MARGEM.esquerda} ${py(0)}`,
          ...curva.map((p, i) => `L${px(i)} ${py(p.acumulado)}`),
        ].join(' ')

  const ponto = indice != null ? curva[indice] : undefined

  const corpo =
    n < 2 ? (
      <p className="flex h-[240px] items-center justify-center px-4 text-center text-sm text-muted-foreground">
        A curva precisa de duas lojas ou mais com faturamento no período.
      </p>
    ) : (
      <div className="flex flex-col gap-2">
        <div ref={ref} className="relative w-full" style={{ height: ALTURA }}>
          {largura > 0 && (
            <svg
              width={largura}
              height={ALTURA}
              role="img"
              aria-label={`Curva ABC de ${plural(n, 'loja', 'lojas')}: ${resumo.A.unidades} na classe A, ${resumo.B.unidades} na B e ${resumo.C.unidades} na C`}
              onPointerMove={(e) => {
                const caixa = ref.current?.getBoundingClientRect()
                if (!caixa) return
                const mx = e.clientX - caixa.left - MARGEM.esquerda
                setIndice(Math.min(Math.max(Math.ceil(mx / passo) - 1, 0), n - 1))
              }}
              onPointerLeave={() => setIndice(null)}
            >
              {faixas.map((f) => {
                const x0 = f.de === 0 ? MARGEM.esquerda : px(f.de - 1)
                const x1 = px(f.ate)
                return (
                  <g key={f.classe}>
                    <rect
                      x={x0}
                      y={MARGEM.topo}
                      width={Math.max(x1 - x0, 0)}
                      height={ALTURA - MARGEM.base - MARGEM.topo}
                      fill={COR.serie}
                      opacity={OPACIDADE[f.classe]}
                    />
                    {x1 - x0 >= 18 && (
                      <text
                        x={(x0 + x1) / 2}
                        y={MARGEM.topo - 5}
                        textAnchor="middle"
                        className="fill-muted-foreground text-[10px] font-semibold"
                      >
                        {f.classe}
                      </text>
                    )}
                  </g>
                )
              })}

              {MARCAS.map((t) => (
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
                    {pctRedondo(t)}
                  </text>
                </g>
              ))}

              {/* Os dois cortes. O rótulo fica à direita, fora da curva. */}
              {[CORTES_ABC.A, CORTES_ABC.B].map((c) => (
                <g key={c}>
                  <line
                    x1={MARGEM.esquerda}
                    x2={largura - MARGEM.direita}
                    y1={py(c)}
                    y2={py(c)}
                    stroke={COR.apagada}
                    strokeWidth={1}
                    strokeDasharray="4 4"
                  />
                  <text
                    x={largura - MARGEM.direita}
                    y={py(c) + 11}
                    textAnchor="end"
                    className="fill-muted-foreground text-[10px] tabular-nums"
                  >
                    {pctRedondo(c)}
                  </text>
                </g>
              ))}

              <path
                data-marca="linha"
                d={caminho}
                fill="none"
                stroke={COR.serie}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {ponto && indice != null && (
                <g>
                  <line
                    x1={px(indice)}
                    x2={px(indice)}
                    y1={MARGEM.topo}
                    y2={ALTURA - MARGEM.base}
                    stroke={COR.apagada}
                    strokeWidth={1}
                  />
                  <circle
                    cx={px(indice)}
                    cy={py(ponto.acumulado)}
                    r={5}
                    fill={COR.serie}
                    stroke={COR.superficie}
                    strokeWidth={2}
                  />
                </g>
              )}

              <text
                x={MARGEM.esquerda}
                y={ALTURA - 6}
                className="fill-muted-foreground text-[10px]"
              >
                maior faturamento
              </text>
              <text
                x={largura - MARGEM.direita}
                y={ALTURA - 6}
                textAnchor="end"
                className="fill-muted-foreground text-[10px]"
              >
                menor
              </text>
            </svg>
          )}

          {ponto && indice != null && (
            <DicaGrafico x={px(indice)} y={py(ponto.acumulado)}>
              <p className="mb-1 font-medium text-foreground">
                {ponto.posicao}º · {ponto.item.nome}
              </p>
              <LinhaDica rotulo="Faturamento" valor={fmtBRLCompacto(ponto.faturamento)} />
              <LinhaDica rotulo="Fatia do total" valor={fmtPct(ponto.participacao)} />
              <LinhaDica rotulo="Acumulado até aqui" valor={fmtPct(ponto.acumulado)} />
              <LinhaDica rotulo="Classe" valor={ponto.classe} />
            </DicaGrafico>
          )}
        </div>

        {/* O rótulo direto das faixas: quantas lojas e quanto do faturamento. */}
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {(['A', 'B', 'C'] as const).map((c) => (
            <li key={c} className="flex items-center gap-1.5">
              <span
                aria-hidden
                className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ background: COR.serie, opacity: OPACIDADE[c] * 4 }}
              />
              <span className="font-semibold text-foreground">{c}</span>
              {plural(resumo[c].unidades, 'loja', 'lojas')} · {fmtPct(resumo[c].participacao)} do
              faturamento
            </li>
          ))}
        </ul>
      </div>
    )

  return (
    <MolduraGrafico
      tourId="curva-abc"
      titulo="Curva ABC do faturamento"
      subtitulo="As lojas na conta, do maior para o menor faturamento no período, e quanto do total elas somam. A até 70% do faturamento, B até 90%, C o resto — os cortes do BI mensal."
      atraso={atraso}
      planilha={() =>
        n === 0
          ? null
          : {
              colunas: [
                { titulo: 'Posição', formato: 'inteiro' },
                { titulo: 'Loja', formato: 'texto' },
                { titulo: 'Faturamento (R$)', formato: 'brl' },
                { titulo: 'Fatia do total', formato: 'pct' },
                { titulo: 'Acumulado', formato: 'pct' },
                { titulo: 'Classe', formato: 'texto' },
              ],
              linhas: curva.map((p) => [
                p.posicao,
                p.item.nome,
                p.faturamento,
                p.participacao,
                p.acumulado,
                p.classe,
              ]),
              notas: [
                'Classe A até 70% do faturamento acumulado, B até 90%, C o resto. A maior loja é sempre A.',
                'O total é o das lojas na conta, não o da rede: com a rede inteira marcada, a curva é a do BI mensal.',
              ],
            }
      }
    >
      {corpo}
    </MolduraGrafico>
  )
}
