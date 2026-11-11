import { useMemo } from 'react'
import { Skeleton, Tooltip } from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'
import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react'
import type { Catalogo } from '../../catalogo'
import { COR } from '../../graficos'
import { fmtBRL, fmtMult, fmtPct, fmtPontos, fmtVariacao } from '../../formato'
import { rotuloDoMes } from '../../periodo'
import { formatoDaUnidade, planilhaDeSerieMensal } from '../../planilha'
import type { RecorteCalculado } from '../../recorte'
import {
  CARTOES_INDICADORES,
  formatarCartao,
  medirCartao,
  serieDoCartao,
  type Cartao,
  type SerieCalculada,
} from '../../visao'
import { LegendaDeSeries } from '../graficos/ColunasAgrupadas'
import { LinhasNoTempo } from '../graficos/LinhasNoTempo'
import { MolduraGrafico } from '../graficos/MolduraGrafico'

// Os dez indicadores do plano — os cartões de escolha E o gráfico do escolhido,
// no MESMO cartão.
//
// ── POR QUE OS DOIS JUNTOS ──────────────────────────────────────────────────
//
// A primeira versão tinha uma faixa de indicadores no topo da página que trocava
// o gráfico lá embaixo: clicar aqui mudava algo ali, fora do campo de visão
// (problema levantado pelo João, 21/09/2026). Aqui a escolha e o desenho que ela
// muda dividem a mesma moldura — nada muda fora do que se está olhando.
//
// Em cartão solto, os dez ocupavam DUAS FILEIRAS acima da dobra (216 px) numa
// página cuja pergunta ("está melhorando?") só o gráfico responde. Como escolha
// dentro do gráfico, eles continuam legíveis — valor, nome e variação — e o
// espaço que ocupam passa a ter uma função.
//
// ── O ANO PASSADO É A SEGUNDA LINHA ─────────────────────────────────────────
//
// A coluna "2025" dos cartões do BI mensal, desenhada: os mesmos 12 meses um ano
// antes, em cinza e tracejada — contexto, não assunto (a regra de
// `LinhasNoTempo`). Doze pontos dizem mais que um número: dá para ver em que mês
// a curva descolou. Só entra quando a série do ano anterior chegou e tem ao menos
// um mês com plano. O ORÇADO mês a mês mora na aba Análises adicionais.
//
// ── NO CELULAR VIRA LISTA ───────────────────────────────────────────────────
//
// Dez chips lado a lado num telefone viram nove linhas de meia largura, com alvo
// de toque pequeno. Abaixo de `@2xl` de CARTÃO cada indicador ocupa a linha
// inteira, com o número à esquerda e a variação à direita — dá para ler a
// coluna de valores de cima a baixo e tocar sem mira.

interface Props {
  cat: Catalogo
  recorte: RecorteCalculado
  serie: SerieCalculada | null
  /** Os mesmos 12 meses, um ano antes. `null` = a linha não é desenhada. */
  serieAnoPassado: SerieCalculada | null
  rotuloVariacao: string
  /** `2026-06` de cada mês do período escolhido. */
  mesesDoPeriodo: ReadonlySet<string>
  carregando: boolean
  atraso?: number
  /**
   * O cartão escolhido vive na TELA, e não aqui: a aba é desmontada enquanto o
   * esqueleto aparece, e a escolha voltaria ao primeiro indicador a cada
   * consulta.
   */
  escolhido: string
  onEscolhido: (id: string) => void
}

function formatarDaUnidade(unidade: Cartao['unidade']) {
  if (unidade === 'pct') return fmtPct
  if (unidade === 'mult') return fmtMult
  return fmtBRL
}

function Variacao({
  variacao,
  tipo,
  melhorQuando,
}: {
  variacao: number | null
  tipo: 'relativa' | 'pontos'
  melhorQuando: 'maior' | 'menor'
}) {
  if (variacao == null || !Number.isFinite(variacao)) {
    return <span className="text-[11px] text-muted-foreground">—</span>
  }
  // O limite do "parado" é o da casa exibida: 0,05% na relativa, 0,005 p.p. nos
  // pontos. Abaixo disso a seta seria verde ou vermelha para um "+0,0%".
  const limite = tipo === 'pontos' ? 0.00005 : 0.0005
  const subiu = variacao > limite
  const desceu = variacao < -limite
  const bom = subiu ? melhorQuando === 'maior' : desceu ? melhorQuando === 'menor' : null
  const Icone = subiu ? ArrowUpRight : desceu ? ArrowDownRight : ArrowRight
  return (
    <span
      className={cn(
        'flex items-center gap-0.5 whitespace-nowrap text-[11px] font-medium tabular-nums',
        bom === null && 'text-muted-foreground',
        bom === true && 'text-success',
        bom === false && 'text-destructive'
      )}
    >
      <Icone className="h-3 w-3" aria-hidden />
      {tipo === 'pontos' ? fmtPontos(variacao) : fmtVariacao(variacao)}
    </span>
  )
}

export function IndicadoresNoTempo({
  cat,
  recorte,
  serie,
  serieAnoPassado,
  rotuloVariacao,
  mesesDoPeriodo,
  carregando,
  atraso,
  escolhido,
  onEscolhido,
}: Props) {
  const cartao = CARTOES_INDICADORES.find((c) => c.id === escolhido) ?? CARTOES_INDICADORES[0]!

  const meses = useMemo(
    () =>
      (serie?.pontos ?? []).map((p) => ({
        rotulo: rotuloDoMes(p),
        noPeriodo: mesesDoPeriodo.has(`${p.ano}-${String(p.mes).padStart(2, '0')}`),
        lojas: p.lojas,
      })),
    [serie, mesesDoPeriodo]
  )
  const anoPassado = useMemo(
    () => (serieAnoPassado ? serieDoCartao(cartao, serieAnoPassado) : null),
    [serieAnoPassado, cartao]
  )
  // Sem nenhum mês com plano um ano antes (loja nova), a linha seria vazia e a
  // legenda prometeria algo que não está no desenho.
  const temAnoPassado = !!anoPassado && anoPassado.some((v) => v != null)
  const linhas = useMemo(() => {
    if (!serie) return []
    const atual = { id: cartao.id, nome: cartao.rotulo, valores: serieDoCartao(cartao, serie) }
    return temAnoPassado
      ? [atual, { id: `${cartao.id}-ano-passado`, nome: 'Ano passado', valores: anoPassado! }]
      : [atual]
  }, [serie, cartao, temAnoPassado, anoPassado])
  const vazio = !carregando && (serie?.pontos ?? []).every((p) => p.lojas === 0)

  return (
    <MolduraGrafico
      tourId="indicadores"
      titulo="Indicadores mês a mês"
      subtitulo={`Escolha um indicador para ver os 12 meses dele. O número é o do período, e a variação compara ${rotuloVariacao}, nas mesmas lojas.${temAnoPassado ? ' A linha tracejada é o mesmo mês um ano antes.' : ''}`}
      acao={
        temAnoPassado ? (
          <LegendaDeSeries
            series={[
              { id: 'atual', nome: cartao.curto ?? cartao.rotulo, cor: COR.serie },
              { id: 'ano-passado', nome: 'Ano passado', cor: COR.apagada, tracejada: true },
            ]}
          />
        ) : undefined
      }
      atraso={atraso}
      // A planilha é a do indicador ESCOLHIDO — é o que o desenho mostra. Os
      // outros nove vão nas notas, com o número do período, para o arquivo
      // sozinho dizer de onde a linha saiu.
      tituloDoArquivo={`Indicadores mês a mês - ${cartao.rotulo}`}
      planilha={() =>
        planilhaDeSerieMensal(
          meses,
          [
            {
              nome: cartao.rotulo,
              valores: serie ? serieDoCartao(cartao, serie) : [],
              formato: formatoDaUnidade(cartao.unidade),
              // Percentual varia em pontos; múltiplo e reais, em percentual.
              variacao: cartao.unidade === 'pct' ? ('pontos' as const) : ('relativa' as const),
            },
            ...(temAnoPassado
              ? [
                  {
                    nome: `${cartao.rotulo} · ano passado`,
                    valores: anoPassado!,
                    formato: formatoDaUnidade(cartao.unidade),
                  },
                ]
              : []),
          ],
          [
            'No período, os dez indicadores do plano:',
            ...CARTOES_INDICADORES.map(
              (c) => `${c.rotulo}: ${formatarCartao(c, medirCartao(c, recorte, cat).valor)}`
            ),
          ]
        )
      }
    >
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <div
          role="group"
          aria-label="Indicador do gráfico"
          // Duas colunas já no celular: numa só, os dez indicadores eram dez
          // linhas (~380 px) e o gráfico ficava abaixo da dobra — era preciso
          // rolar a lista inteira para ver o desenho que ela escolhe
          // (29/09/2026). São dez: duas ou cinco colunas fecham as linhas certas,
          // e cinco cabem a partir de ~576 px de cartão (o tablet). No cartão
          // largo cada botão é valor e nome numa linha e a variação embaixo;
          // abaixo disso o nome SOBE para uma linha dele: ao lado do valor, em
          // ~130 px, saíam "MP restaura…" e "Motoboy/deliv…", e no toque não há
          // dica para ver o nome inteiro.
          className="grid grid-cols-2 gap-1 @xl:grid-cols-5"
        >
          {CARTOES_INDICADORES.map((c) => {
            const { valor, variacao } = medirCartao(c, recorte, cat)
            const ativo = c.id === cartao.id
            return (
              <Tooltip key={c.id} content={`${c.rotulo}. ${c.ajuda}`}>
                <button
                  type="button"
                  aria-pressed={ativo}
                  onClick={() => onEscolhido(c.id)}
                  className={cn(
                    'flex min-w-0 flex-col items-start gap-0.5 rounded-md border border-transparent px-2 py-1.5 text-left transition-colors duration-fast ease-default hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    ativo && 'border-primary/30 bg-primary/10 hover:bg-primary/15'
                  )}
                >
                  <span className="w-full truncate text-[11px] text-muted-foreground @4xl:hidden">
                    {c.curto ?? c.rotulo}
                  </span>
                  <span className="flex w-full min-w-0 items-baseline gap-1.5">
                    <span
                      className={cn(
                        'shrink-0 text-sm font-semibold tabular-nums',
                        ativo ? 'text-primary' : 'text-foreground'
                      )}
                    >
                      {formatarCartao(c, valor)}
                    </span>
                    <span className="hidden min-w-0 truncate text-[11px] text-muted-foreground @4xl:inline">
                      {c.curto ?? c.rotulo}
                    </span>
                  </span>
                  <Variacao
                    variacao={variacao}
                    tipo={c.variacao}
                    melhorQuando={c.direcao === 'menor' ? 'menor' : 'maior'}
                  />
                </button>
              </Tooltip>
            )
          })}
        </div>

        <div className="min-h-0 flex-1">
          {carregando ? (
            <Skeleton className="h-[220px] w-full rounded-md" />
          ) : vazio ? (
            <p className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
              Nenhuma loja da conta tem plano nos 12 meses.
            </p>
          ) : (
            <LinhasNoTempo
              meses={meses}
              series={linhas}
              formatar={formatarDaUnidade(cartao.unidade)}
              altura={220}
            />
          )}
        </div>
      </div>
    </MolduraGrafico>
  )
}
