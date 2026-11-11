import { useMemo, type ReactNode } from 'react'
import { Skeleton } from '@gia-cb/ui'
import { COR } from '../../graficos'
import { fmtBRL, fmtPct } from '../../formato'
import { rotuloDoMes } from '../../periodo'
import { planilhaDeSerieMensal } from '../../planilha'
import { CARTAO_POR_ID, serieDoCartao, type SerieCalculada } from '../../visao'
import { ColunasAgrupadas, LegendaDeSeries } from '../graficos/ColunasAgrupadas'
import { LinhasNoTempo } from '../graficos/LinhasNoTempo'
import { MolduraGrafico } from '../graficos/MolduraGrafico'

// A evolução de 12 meses: o resultado em reais (colunas) e um percentual em
// linhas, lado a lado.
//
// ── DOIS GRÁFICOS, E NÃO UM COM DUAS RÉGUAS ─────────────────────────────────
//
// O desenho do designer punha faturamento, despesas, lucro e rentabilidade no
// mesmo gráfico. Reais e percentual não dividem régua: numa só, a rentabilidade
// vira uma linha colada no zero; em duas, a posição das linhas passa a depender
// de uma escolha de escala. Os reais vão para as colunas, os percentuais para as
// linhas.
//
// Os dez indicadores do plano têm cartão próprio logo abaixo
// (`IndicadoresNoTempo`), com a escolha dentro do mesmo desenho.
//
// Os 12 meses terminam no último mês do período escolhido, e a faixa cinza marca
// os meses que estão no período. Cada mês soma as lojas da conta COM PLANO nele —
// a dica diz quantas.

interface Props {
  serie: SerieCalculada | null
  /** `2026-06` de cada mês do período escolhido. */
  mesesDoPeriodo: ReadonlySet<string>
  carregando: boolean
}

const FMT_UMA = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 })
const FMT_ZERO = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })

/** `R$ 1,5 mi` — o rótulo do eixo, curto. */
function reaisCurtos(v: number): string {
  const abs = Math.abs(v)
  const sinal = v < 0 ? '−' : ''
  if (abs >= 1_000_000) return `${sinal}R$ ${FMT_UMA.format(abs / 1_000_000)} mi`
  if (abs >= 1_000) return `${sinal}R$ ${FMT_ZERO.format(abs / 1_000)} mil`
  return `${sinal}R$ ${FMT_ZERO.format(abs)}`
}

const SERIES_DE_REAIS = [
  { id: 'faturamento', nome: 'Faturamento', cor: COR.faturamento },
  { id: 'despesas', nome: 'Despesas totais', cor: COR.despesas },
  { id: 'lucro', nome: 'Lucro líquido', cor: COR.lucro },
] as const

export function EvolucaoDoResultado({ serie, mesesDoPeriodo, carregando }: Props) {
  const meses = useMemo(
    () =>
      (serie?.pontos ?? []).map((p) => ({
        rotulo: rotuloDoMes(p),
        noPeriodo: mesesDoPeriodo.has(`${p.ano}-${String(p.mes).padStart(2, '0')}`),
        lojas: p.lojas,
      })),
    [serie, mesesDoPeriodo]
  )
  const colunas = useMemo(
    () =>
      SERIES_DE_REAIS.map((s) => ({
        ...s,
        valores: serie ? serieDoCartao(CARTAO_POR_ID.get(s.id)!, serie) : [],
      })),
    [serie]
  )
  const linhas = useMemo(() => {
    if (!serie) return []
    return [CARTAO_POR_ID.get('rentabilidade')!, CARTAO_POR_ID.get('rentabilidade-estoque')!].map(
      (c) => ({ id: c.id, nome: c.rotulo, valores: serieDoCartao(c, serie) })
    )
  }, [serie])
  const vazio = !carregando && (serie?.pontos ?? []).every((p) => p.lojas === 0)

  const corpo = (conteudo: ReactNode) =>
    carregando ? (
      <Skeleton className="h-[260px] w-full rounded-md" />
    ) : vazio ? (
      <p className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
        Nenhuma loja da conta tem plano nos 12 meses.
      </p>
    ) : (
      conteudo
    )

  return (
    <div className="grid grid-cols-1 gap-3 @4xl:grid-cols-2">
      <MolduraGrafico
        tourId="grafico-resultado"
        titulo="Resultado mês a mês"
        subtitulo="Faturamento, despesas totais (2 + 3 + 4) e lucro líquido sem investimentos das lojas na conta. A faixa cinza marca o período escolhido."
        acao={<LegendaDeSeries series={[...SERIES_DE_REAIS]} />}
        atraso={420}
        planilha={() =>
          planilhaDeSerieMensal(
            meses,
            colunas.map((c) => ({
              nome: c.nome,
              valores: c.valores,
              formato: 'brl' as const,
              variacao: 'relativa' as const,
            })),
            ['Despesas totais = matéria-prima (2) + impostos (3) + custos operacionais (4).']
          )
        }
      >
        {corpo(
          <ColunasAgrupadas
            meses={meses}
            series={colunas}
            formatarEixo={reaisCurtos}
            formatarValor={fmtBRL}
          />
        )}
      </MolduraGrafico>
      <MolduraGrafico
        tourId="grafico-rentabilidade"
        titulo="Rentabilidade mês a mês"
        subtitulo="Lucro líquido sem investimentos ÷ faturamento, e a mesma conta corrigida pela variação de estoque (10001)."
        acao={
          <LegendaDeSeries
            series={[
              { id: 'r', nome: 'Rentabilidade', cor: COR.serie },
              { id: 'e', nome: 'Com variação de estoque', cor: COR.apagada, tracejada: true },
            ]}
          />
        }
        atraso={480}
        planilha={() =>
          planilhaDeSerieMensal(
            meses,
            linhas.map((l) => ({
              nome: l.nome,
              valores: l.valores,
              formato: 'pct' as const,
              variacao: 'pontos' as const,
            }))
          )
        }
      >
        {corpo(<LinhasNoTempo meses={meses} series={linhas} formatar={fmtPct} />)}
      </MolduraGrafico>
    </div>
  )
}
