import { useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  Button,
  DataReport,
  EmptyState,
  Select,
  Tooltip,
  toast,
  type ColumnDef,
  type PeriodoDeMeses,
} from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'
import { useCanAccess } from '@gia-cb/sdk/permissions'
import { AlertTriangle, BookOpen, Loader2 } from 'lucide-react'
import {
  atingimentoDoFaturamento,
  cadernoDaReuniao,
  cartaoDaUnidade,
  consolidarQuemTem,
  resultadoContra,
  type CartaoDoCaderno,
  type LinhaDoCartao,
  type LinhaDoResultado,
  type UnidadeComAgregado,
} from '../analises'
import { classeDoGap, classeDoImpacto, textoDoImpacto } from '../analises-formato'
import { baixarCaderno } from '../baixar-caderno'
import { INDICE_FATURAMENTO, type Catalogo, type Direcao } from '../catalogo'
import type { OperacaoParaComparar } from '../comparativos'
import {
  fmtBRLCompacto,
  fmtDiferenca,
  fmtPct,
  fmtPontos,
  fmtValor,
  fmtVariacao,
  plural,
} from '../formato'
import { COR } from '../graficos'
import { useEntradaEmCascata } from '../hooks/use-entrada'
import { consolidar, valorDe, type Agregado, type MesCarregado } from '../matriz'
import { mesesDoPeriodo, rotuloDoMes, rotuloDoPeriodo, textoDoMes } from '../periodo'
import {
  planilhaDaGrade,
  planilhaDeRanking,
  planilhaDeSerieMensal,
  type Celula,
  type ColunaPlanilha,
} from '../planilha'
import type { RecorteCalculado } from '../recorte'
import type { SerieDeContas } from '../types'
import { CARTAO_POR_ID, serieDasLojas, serieDoCartao } from '../visao'
import { BotaoExportar } from './BotaoExportar'
import { Escolha } from './Escolha'
import { EsqueletoDaAba } from './EsqueletoDaAba'
import { OndeEstaODinheiro } from './OndeEstaODinheiro'
import { PlanoDaLoja } from './PlanoDaLoja'
import { SeloDoOrcamento } from './SeloDoOrcamento'
import { PeriodoDoArquivo } from './graficos/contexto-grafico'
import { BarrasRanking, type ItemRanking } from './graficos/BarrasRanking'
import { ColunasAgrupadas, LegendaDeSeries } from './graficos/ColunasAgrupadas'
import { MolduraGrafico } from './graficos/MolduraGrafico'
import { CurvaAbc } from './visao/CurvaAbc'

// A aba ANÁLISES ADICIONAIS — o que o painel ainda não tinha do BI mensal
// ("Print Mensal BI", agosto/2026), numa aba própria (decisão do João,
// 28/09/2026: "o que a gente ainda não tiver implementado vai para essa aba").
// O nome é o da aba irmã do Dashboard de RH, que faz o mesmo com as planilhas do
// RH corporativo.
//
// ── O QUE ESTA ABA TEM QUE AS OUTRAS NÃO TÊM ────────────────────────────────
//
// O ANO PASSADO e o ORÇADO ao mesmo tempo, ao lado do realizado — como nos
// cartões do BI. As outras abas comparam um período com outro, um de cada vez.
// Todo número que vem do Plano de Orçamentos leva o selo de origem.
//
// ── QUATRO BLOCOS, DE CIMA PARA BAIXO ───────────────────────────────────────
//
//   • o RESULTADO DA LOJA, com três leituras no "Contra": Lojas (o cartão das
//     abas GRUPO 1 a 5 do BI), Orçado e Ano passado (as abas REAL VS ORÇADO e
//     COA, que têm o mesmo desenho);
//   • os gráficos da loja — onde está o dinheiro, e o realizado contra o orçado
//     mês a mês;
//   • a REDE — o atingimento do orçado loja a loja e a curva ABC;
//   • o PLANO DE CONTAS COMPLETO da loja — a aba Análise Comparativa do BI.
//
// A loja escolhida no topo da aba manda em todos menos a rede; a média e a melhor
// são das lojas consultadas (decisão do João, 28/09/2026). As contas moram em
// `src/analises.ts`; aqui só se desenha.

interface UnidadeDaAba extends OperacaoParaComparar {
  /** As operações que a unidade soma — mais de uma num grupo de matriz e filiais. */
  membros?: ReadonlyArray<{ ref: string }>
}

interface Props {
  cat: Catalogo
  recorte: RecorteCalculado
  operacoes: readonly UnidadeDaAba[]
  periodo: PeriodoDeMeses
  meses: readonly MesCarregado[]
  /** O agregado de cada unidade nos mesmos meses um ano antes; `null` enquanto chega. */
  anoPassado: ReadonlyMap<string, Agregado> | null
  /** O agregado de cada unidade no orçado do período; `null` enquanto chega. */
  orcado: ReadonlyMap<string, Agregado> | null
  erroDasFontes: boolean
  serie: SerieDeContas | null
  serieDoOrcado: SerieDeContas | null
  carregando: boolean
  /** A unidade escolhida; `null` = a seleção inteira. Vive na tela. */
  unidade: string | null
  onUnidade: (ref: string | null) => void
}

/**
 * As três leituras do Resultado da loja: contra as outras lojas (o cartão das
 * abas GRUPO do BI), contra o orçado (REAL VS ORÇADO) ou contra o ano passado
 * (COA).
 */
type Contra = 'lojas' | 'orcado' | 'ano'
type MetricaNoTempo = 'faturamento' | 'despesas' | 'lucro'

/** O valor do seletor que quer dizer "a seleção inteira". */
const SELECAO = '__selecao__'

const ORDEM = new Intl.Collator('pt-BR', { numeric: true, sensitivity: 'base' })

/** `R$ 1,5 mi` — o rótulo do eixo, curto. */
function reaisCurtos(v: number): string {
  const abs = Math.abs(v)
  const sinal = v < 0 ? '−' : ''
  const fmt = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: abs >= 1_000_000 ? 1 : 0 })
  if (abs >= 1_000_000) return `${sinal}R$ ${fmt.format(abs / 1_000_000)} mi`
  if (abs >= 1_000) return `${sinal}R$ ${fmt.format(abs / 1_000)} mil`
  return `${sinal}R$ ${fmt.format(abs)}`
}

/**
 * O CADERNO DA REUNIÃO: o cartão de todas as lojas consultadas num Excel só, um
 * embaixo do outro, pronto para imprimir — as abas GRUPO 1 a 5 e PRINT RESUMO
 * do BI mensal. O caderno é montado no clique (`montar`), e o `exceljs` só é
 * carregado ali. Exige a permissão de exportar, como o Exportar das grades.
 */
function BotaoCaderno({
  montar,
  subtitulo,
  desabilitado,
}: {
  montar: () => CartaoDoCaderno[]
  subtitulo: string
  desabilitado: boolean
}) {
  const [baixando, setBaixando] = useState(false)
  const podeExportar = useCanAccess('dashboard-contas.exportar')
  const periodo = useContext(PeriodoDoArquivo)
  if (!podeExportar) return null

  async function baixar() {
    setBaixando(true)
    try {
      await baixarCaderno(montar(), { periodo, subtitulo })
    } catch {
      toast.error('Falha ao gerar o caderno. Tente novamente.')
    } finally {
      setBaixando(false)
    }
  }

  return (
    <Tooltip content="Baixar em Excel o cartão de todas as lojas consultadas, um embaixo do outro e pronto para imprimir — as abas GRUPO 1 a 5 do BI">
      <Button
        variant="ghost"
        size="sm"
        onClick={baixar}
        disabled={baixando || desabilitado}
        className="gap-1.5"
      >
        {baixando ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <BookOpen className="h-4 w-4" aria-hidden />
        )}
        Caderno
      </Button>
    </Tooltip>
  )
}

function Secao({
  titulo,
  extra,
  children,
  tourId,
}: {
  titulo: string
  extra?: ReactNode
  children: ReactNode
  tourId?: string
}) {
  return (
    <section className="flex flex-col gap-2" data-tour={tourId}>
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-sm font-semibold text-foreground">{titulo}</h2>
        {extra}
      </div>
      {children}
    </section>
  )
}

const SELO_DO_CARTAO =
  'A coluna Orçado é o orçamento que a loja lançou no Plano de Orçamentos para o mesmo período.'

export function AbaAnalises({
  cat,
  recorte,
  operacoes,
  periodo,
  meses,
  anoPassado,
  orcado,
  erroDasFontes,
  serie,
  serieDoOrcado,
  carregando,
  unidade,
  onUnidade,
}: Props) {
  const raiz = useRef<HTMLDivElement>(null)
  const pronto = !carregando && !!anoPassado && !!orcado
  useEntradaEmCascata(raiz, pronto)
  const [contra, setContra] = useState<Contra>('lojas')
  const [metrica, setMetrica] = useState<MetricaNoTempo>('faturamento')

  const rotuloPeriodo = rotuloDoPeriodo(periodo)
  const nomePorRef = useMemo(() => new Map(operacoes.map((o) => [o.ref, o.nome])), [operacoes])

  // As unidades consultadas com plano no período — a régua de média e melhor e a
  // lista do seletor.
  const unidades = useMemo<UnidadeComAgregado[]>(
    () =>
      [...recorte.naConta]
        .flatMap((ref) => {
          const ag = recorte.porLoja.get(ref)
          return ag ? [{ ref, nome: nomePorRef.get(ref) ?? ref, ag }] : []
        })
        .sort((a, b) => ORDEM.compare(a.nome, b.nome)),
    [recorte, nomePorRef]
  )
  const refs = useMemo(() => unidades.map((u) => u.ref), [unidades])
  // Unidade que saiu da seleção volta para a seleção inteira, em vez de mostrar
  // o cartão de uma loja que não está mais na conta.
  const escolhida = unidade && unidades.some((u) => u.ref === unidade) ? unidade : null
  const nomeDaEscolhida = escolhida ? (nomePorRef.get(escolhida) ?? escolhida) : 'a seleção'
  const tituloDaEscolhida = escolhida ? (nomePorRef.get(escolhida) ?? escolhida) : 'Seleção'

  // ── AS TRÊS FONTES DA UNIDADE ESCOLHIDA ───────────────────────────────────
  //
  // O realizado, o ano passado e o orçado dela — ou da seleção inteira, somando
  // só as unidades que têm cada lado. O cartão e o plano de contas leem daqui.
  const fontes = useMemo(() => {
    if (!anoPassado || !orcado) return null
    return {
      alvo: escolhida ? recorte.porLoja.get(escolhida)! : recorte.consolidado,
      anoPassado: escolhida
        ? (anoPassado.get(escolhida) ?? null)
        : consolidarQuemTem(anoPassado, refs, cat),
      orcado: escolhida ? (orcado.get(escolhida) ?? null) : consolidarQuemTem(orcado, refs, cat),
    }
  }, [anoPassado, orcado, escolhida, recorte, refs, cat])

  // ── 1. O CARTÃO ───────────────────────────────────────────────────────────
  const cartao = useMemo<LinhaDoCartao[]>(() => {
    if (!fontes || unidades.length === 0) return []
    return cartaoDaUnidade({ cat, ...fontes, unidades, consolidado: recorte.consolidado })
  }, [fontes, unidades, recorte, cat])

  // O caderno: a seleção e cada unidade, na ordem do seletor da aba.
  const montarCaderno = () =>
    anoPassado && orcado
      ? cadernoDaReuniao({
          cat,
          unidades,
          consolidado: recorte.consolidado,
          anoPassado,
          orcado,
          tituloDaSelecao: `Seleção · ${plural(unidades.length, 'loja', 'lojas')}`,
        })
      : []

  // ── 2. O RESULTADO CONTRA O ANO PASSADO OU O ORÇADO ───────────────────────
  //
  // Na seleção, só as unidades com os DOIS lados — a regra de toda variação do
  // painel: comparar conjuntos diferentes de lojas mediria a troca de lojas, e
  // não o resultado.
  const resultado = useMemo(() => {
    const fonte = contra === 'orcado' ? orcado : contra === 'ano' ? anoPassado : null
    if (!fonte || unidades.length === 0) return { linhas: [] as LinhaDoResultado[], lojas: 0 }
    const candidatas = escolhida ? [escolhida] : refs
    const nasDuas = candidatas.filter((r) => fonte.has(r) && recorte.porLoja.has(r))
    if (nasDuas.length === 0) {
      const atual = escolhida ? recorte.porLoja.get(escolhida)! : recorte.consolidado
      return { linhas: resultadoContra(cat, atual, null), lojas: 0 }
    }
    return {
      linhas: resultadoContra(
        cat,
        consolidar(recorte.porLoja, nasDuas, cat),
        consolidar(fonte, nasDuas, cat)
      ),
      lojas: nasDuas.length,
    }
  }, [contra, orcado, anoPassado, unidades, escolhida, refs, recorte, cat])
  const nomeDoContra = contra === 'orcado' ? 'Orçado' : 'Ano passado'

  const escolhaDoContra = (
    <Escolha<Contra>
      value={contra}
      onChange={setContra}
      ariaLabel="Contra o quê"
      rotulo="Contra"
      rotuloVisivel
      options={[
        {
          value: 'lojas',
          label: 'Lojas',
          tooltip:
            'Os sete indicadores contra as outras lojas consultadas: média, melhor e impacto R$ — o cartão das abas GRUPO e PRINT RESUMO do BI',
        },
        {
          value: 'orcado',
          label: 'Orçado',
          tooltip:
            'Do faturamento ao lucro, em reais e em percentual, contra o orçado do mesmo período — a aba REAL VS ORÇADO do BI',
        },
        {
          value: 'ano',
          label: 'Ano passado',
          tooltip:
            'Do faturamento ao lucro, contra os mesmos meses do ano passado — a aba COA do BI',
        },
      ]}
    />
  )

  // ── 3. O REALIZADO CONTRA O ORÇADO, MÊS A MÊS ─────────────────────────────
  //
  // A série é por OPERAÇÃO; a unidade escolhida pode ser um grupo de matriz e
  // filiais. Soma as operações que compõem a unidade (o mesmo que a Visão geral
  // faz com a seleção).
  const refsDaSerie = useMemo(() => {
    const membros = new Map(operacoes.map((o) => [o.ref, o.membros?.map((m) => m.ref) ?? [o.ref]]))
    const alvo = escolhida ? [escolhida] : refs
    return new Set(alvo.flatMap((r) => membros.get(r) ?? [r]))
  }, [operacoes, escolhida, refs])
  const mesesDoPeriodoSet = useMemo(
    () => new Set(mesesDoPeriodo(periodo).map(textoDoMes)),
    [periodo]
  )
  const tempo = useMemo(() => {
    if (!serie) return null
    const real = serieDasLojas(serie, refsDaSerie)
    const orc = serieDoOrcado ? serieDasLojas(serieDoOrcado, refsDaSerie) : null
    const c = CARTAO_POR_ID.get(metrica)!
    return {
      meses: real.pontos.map((pt) => ({
        rotulo: rotuloDoMes(pt),
        noPeriodo: mesesDoPeriodoSet.has(`${pt.ano}-${String(pt.mes).padStart(2, '0')}`),
        lojas: pt.lojas,
      })),
      real: serieDoCartao(c, real),
      orcado: orc ? serieDoCartao(c, orc) : null,
      nome: c.rotulo,
    }
  }, [serie, serieDoOrcado, refsDaSerie, metrica, mesesDoPeriodoSet])

  // ── 4. O ATINGIMENTO DO ORÇADO, LOJA A LOJA ───────────────────────────────
  const atingimento = useMemo(
    () => (orcado ? atingimentoDoFaturamento(unidades, orcado, cat) : []),
    [orcado, unidades, cat]
  )
  const atingimentoDaSelecao = useMemo(() => {
    if (!orcado || atingimento.length === 0) return null
    const rs = atingimento.map((a) => a.ref)
    const r = valorDe(consolidar(recorte.porLoja, rs, cat), cat, INDICE_FATURAMENTO)
    const o = valorDe(consolidar(orcado, rs, cat), cat, INDICE_FATURAMENTO)
    return r != null && o ? r / o - 1 : null
  }, [orcado, atingimento, recorte, cat])
  const barrasDoAtingimento = useMemo<ItemRanking[]>(
    () =>
      atingimento.map((a) => ({
        chave: a.ref,
        rotulo: a.nome,
        valor: a.atingimento,
        valorFormatado: fmtVariacao(a.atingimento),
        detalhe: `${fmtBRLCompacto(a.realizado)} faturados de ${fmtBRLCompacto(a.orcado)} orçados`,
      })),
    [atingimento]
  )

  // ── AS GRADES ─────────────────────────────────────────────────────────────
  const pct = (v: number | null) => <span className="tabular-nums">{fmtPct(v)}</span>
  const gap = (v: number | null, direcao: Direcao) => (
    <span className={cn('whitespace-nowrap tabular-nums', classeDoGap(v, direcao))}>
      {fmtPontos(v)}
    </span>
  )

  const colunasDoCartao = useMemo<ColumnDef<LinhaDoCartao, unknown>[]>(
    () => [
      {
        id: 'indicador',
        header: 'Indicador',
        size: 176,
        meta: { width: 176, mobile: 'primary' },
        cell: ({ row }) => (
          <span className="whitespace-nowrap font-medium">{row.original.rotulo}</span>
        ),
      },
      {
        id: 'realizado',
        header: () => (
          <Tooltip content={`O percentual sobre o faturamento em ${rotuloPeriodo}`}>
            <span className="cursor-help">Realizado</span>
          </Tooltip>
        ),
        meta: { width: 96 },
        cell: ({ row }) => (
          <span className="font-semibold tabular-nums">{fmtPct(row.original.realizado)}</span>
        ),
      },
      {
        id: 'ano-passado',
        header: () => (
          <Tooltip content="Os mesmos meses, um ano antes — a coluna 2025 do BI">
            <span className="cursor-help">Ano passado</span>
          </Tooltip>
        ),
        meta: { width: 104 },
        cell: ({ row }) => pct(row.original.anoPassado),
      },
      {
        id: 'orcado',
        header: () => (
          <span className="inline-flex items-center gap-1">
            Orçado
            <SeloDoOrcamento detalhe={SELO_DO_CARTAO} />
          </span>
        ),
        meta: { width: 96 },
        cell: ({ row }) => pct(row.original.orcado),
      },
      {
        id: 'media',
        header: () => (
          <Tooltip content="O índice das lojas consultadas: a linha somada dividida pelo faturamento somado">
            <span className="cursor-help">Média</span>
          </Tooltip>
        ),
        meta: { width: 88 },
        cell: ({ row }) => pct(row.original.media),
      },
      {
        id: 'gap-media',
        header: 'Gap p/ média',
        meta: { width: 108 },
        cell: ({ row }) => gap(row.original.gapMedia, row.original.direcao),
      },
      // ── O IMPACTO AO LADO DO GAP P/ MÉDIA ─────────────────────────────────
      // No BI ele mora em outra aba; aqui ele fecha a leitura contra a média:
      // o gap em pontos e, logo depois, quanto ele vale em reais. No fim da
      // grade ele era a primeira coluna a sumir quando o cartão estreita — a
      // 1024 px só aparecia rolando de lado (29/09/2026).
      {
        id: 'impacto',
        header: () => (
          <Tooltip content="Quanto o resultado mudaria em reais se a linha tivesse o percentual da média — o IMPACTO R$ do BI. Positivo: o que a loja gasta a mais que a média; negativo: o que ela já economiza.">
            <span className="cursor-help">Impacto R$</span>
          </Tooltip>
        ),
        meta: { width: 120 },
        cell: ({ row }) => (
          <span
            className={cn('whitespace-nowrap tabular-nums', classeDoImpacto(row.original.impacto))}
          >
            {textoDoImpacto(row.original.impacto)}
          </span>
        ),
      },
      // ── A MELHOR LOJA MORA NA COLUNA MELHOR ──────────────────────────────
      // Embaixo do percentual, menor. Numa coluna própria (a MELHOR LOJA do BI)
      // ela precisava de 189 px para "70.CB BARRACA DO COCO": com eles a grade
      // passava do cartão a 1280 px, e sem eles o nome cortava (29/09/2026).
      // A planilha continua com as duas colunas separadas, como no BI.
      {
        id: 'melhor',
        header: () => (
          <Tooltip content="O melhor percentual entre as lojas consultadas, e de qual loja ele é">
            <span className="cursor-help">Melhor</span>
          </Tooltip>
        ),
        meta: { width: 176 },
        cell: ({ row }) => (
          <span className="flex min-w-0 flex-col leading-tight">
            {pct(row.original.melhor)}
            {/* ☠️ `max-w` não é estética: `meta.width` é PISO, e a coluna crescia
                até caber "64.CB NORTH SHOPPING FORTALEZA" inteiro, alargando a
                grade além do cartão. Com teto o nome corta, e a dica mostra o
                inteiro. */}
            {row.original.melhorUnidade && (
              <Tooltip content={row.original.melhorUnidade}>
                <span className="block max-w-[9.5rem] truncate text-[11px] text-muted-foreground">
                  {row.original.melhorUnidade}
                </span>
              </Tooltip>
            )}
          </span>
        ),
      },
      {
        id: 'gap-melhor',
        header: 'Gap p/ melhor',
        meta: { width: 112 },
        cell: ({ row }) => gap(row.original.gapMelhor, row.original.direcao),
      },
    ],
    [rotuloPeriodo]
  )

  const colunasDoResultado = useMemo<ColumnDef<LinhaDoResultado, unknown>[]>(() => {
    const destaque = (l: LinhaDoResultado) =>
      l.indice === INDICE_FATURAMENTO || l.indice === 11003 ? 'font-semibold' : ''
    // As larguras são as do conteúdo mais largo de cada coluna, e não número
    // redondo: com 200/132/132/128, a grade somava 990 px e o Gap p.p. saía do
    // cartão a 1024 px — num portal com o menu aberto, já a 1280 (29/09/2026).
    // Assim ela cabe inteira (939 px de 939), com "# Despesas financeiras" sem
    // corte. Medido com Contra: Orçado; o "Ano passado (R$)" é mais largo.
    return [
      {
        id: 'linha',
        header: 'Linha',
        size: 192,
        meta: { width: 192, mobile: 'primary' },
        cell: ({ row }) => (
          <span
            className={cn(
              'block min-w-0 truncate',
              row.original.parcela ? 'pl-4 text-muted-foreground' : destaque(row.original)
            )}
          >
            {row.original.rotulo}
          </span>
        ),
      },
      {
        id: 'real-valor',
        header: 'Realizado (R$)',
        meta: { width: 120 },
        cell: ({ row }) => (
          <span className={cn('tabular-nums', destaque(row.original))}>
            {fmtValor(row.original.atual.valor)}
          </span>
        ),
      },
      {
        id: 'real-pct',
        header: 'Realizado %',
        meta: { width: 100 },
        cell: ({ row }) => pct(row.original.atual.pct),
      },
      {
        id: 'comp-valor',
        header: `${nomeDoContra} (R$)`,
        meta: { width: 116 },
        cell: ({ row }) => (
          <span className="tabular-nums">{fmtValor(row.original.comparado?.valor ?? null)}</span>
        ),
      },
      {
        id: 'comp-pct',
        header: `${nomeDoContra} %`,
        meta: { width: 96 },
        cell: ({ row }) => pct(row.original.comparado?.pct ?? null),
      },
      {
        id: 'gap-valor',
        header: () => (
          <Tooltip content="Quanto o valor mudou em reais">
            <span className="cursor-help">Gap R$</span>
          </Tooltip>
        ),
        meta: { width: 112 },
        cell: ({ row }) => (
          <span
            className={cn(
              'tabular-nums',
              classeDoGap(row.original.gapValor, row.original.direcao, 0.005)
            )}
          >
            {fmtDiferenca('brl', row.original.gapValor)}
          </span>
        ),
      },
      {
        id: 'gap-relativo',
        header: () => (
          <Tooltip content="A mesma mudança, em percentual do valor comparado">
            <span className="cursor-help">Gap %</span>
          </Tooltip>
        ),
        meta: { width: 84 },
        cell: ({ row }) => (
          <span
            className={cn(
              'tabular-nums',
              classeDoGap(row.original.gapRelativo, row.original.direcao, 0.0005)
            )}
          >
            {fmtVariacao(row.original.gapRelativo)}
          </span>
        ),
      },
      {
        id: 'gap-pontos',
        header: () => (
          <Tooltip content="Quanto mudou o percentual sobre o faturamento, em pontos">
            <span className="cursor-help">Gap p.p.</span>
          </Tooltip>
        ),
        meta: { width: 88 },
        cell: ({ row }) => gap(row.original.gapPontos, row.original.direcao),
      },
    ]
  }, [nomeDoContra])

  // ── AS PLANILHAS ──────────────────────────────────────────────────────────
  const planilhaDoCartao = () => {
    const colunas: ColunaPlanilha[] = [
      { titulo: 'Indicador', formato: 'texto' },
      { titulo: `Realizado (${rotuloPeriodo})`, formato: 'pct' },
      { titulo: 'Ano passado', formato: 'pct' },
      { titulo: 'Orçado', formato: 'pct' },
      { titulo: 'Média das lojas consultadas', formato: 'pct' },
      { titulo: 'Gap p/ média', formato: 'pp' },
      { titulo: 'Impacto R$ (vs. média)', formato: 'brl' },
      { titulo: 'Melhor', formato: 'pct' },
      { titulo: 'Gap p/ melhor', formato: 'pp' },
      { titulo: 'Melhor loja', formato: 'texto' },
    ]
    return planilhaDaGrade(
      colunas,
      cartao,
      (l): Celula[] => [
        l.rotulo,
        l.realizado,
        l.anoPassado,
        l.orcado,
        l.media,
        l.gapMedia,
        l.impacto,
        l.melhor,
        l.gapMelhor,
        l.melhorUnidade,
      ],
      [
        `Loja: ${tituloDaEscolhida}. Período: ${rotuloPeriodo}.`,
        'Orçado: o Plano de Orçamentos de cada loja. Média e melhor: as lojas consultadas.',
      ]
    )
  }
  const planilhaDoResultado = () => {
    const colunas: ColunaPlanilha[] = [
      { titulo: 'Linha', formato: 'texto' },
      { titulo: 'Realizado (R$)', formato: 'brl' },
      { titulo: 'Realizado %', formato: 'pct' },
      { titulo: `${nomeDoContra} (R$)`, formato: 'brl' },
      { titulo: `${nomeDoContra} %`, formato: 'pct' },
      { titulo: 'Gap R$', formato: 'brl' },
      { titulo: 'Gap %', formato: 'pct' },
      { titulo: 'Gap p.p.', formato: 'pp' },
    ]
    return planilhaDaGrade(
      colunas,
      resultado.linhas,
      (l): Celula[] => [
        l.rotulo,
        l.atual.valor,
        l.atual.pct,
        l.comparado?.valor ?? null,
        l.comparado?.pct ?? null,
        l.gapValor,
        l.gapRelativo,
        l.gapPontos,
      ],
      [
        `Loja: ${tituloDaEscolhida}. Período: ${rotuloPeriodo}. Contra: ${nomeDoContra.toLowerCase()}.`,
      ]
    )
  }

  // ── OS ESTADOS DA ABA ─────────────────────────────────────────────────────
  if (recorte.naConta.size === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-border bg-surface p-6 text-center text-sm text-muted-foreground">
        Nenhuma operação marcada passa nos filtros. Confira o status do plano e a opção Mesmas lojas
        em Filtros.
      </div>
    )
  }
  if (erroDasFontes && !pronto) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-border bg-surface p-6">
        <EmptyState
          icon={AlertTriangle}
          title="O ano passado e o orçado não puderam ser carregados"
          description="A consulta ao data-warehouse falhou. Troque de aba e volte, ou recarregue a página."
        />
      </div>
    )
  }
  if (!pronto) return <EsqueletoDaAba aba="analises" />

  const semOrcado = cartao.length > 0 && cartao.every((l) => l.orcado == null)

  return (
    <div
      ref={raiz}
      // `relative` segura o `absolute` das grades dentro da aba — a "rolagem
      // fantasma" de 18/09/2026 (ver a Visão geral). Sem `contain: layout`: ele
      // prenderia a tela cheia da SDK, que é um `fixed` sem portal.
      className="@container relative h-full overflow-y-auto pr-1"
    >
      <div className="flex flex-col gap-5 pb-4">
        <div className="flex flex-wrap items-center gap-2" data-tour="analises-loja">
          <Select
            value={escolhida ?? SELECAO}
            onValueChange={(v) => onUnidade(v === SELECAO ? null : v)}
          >
            <Select.Trigger className="h-8 w-full @md:w-72" aria-label="Loja das análises" />
            <Select.Content>
              <Select.Item value={SELECAO}>
                Seleção · {plural(unidades.length, 'loja', 'lojas')}
              </Select.Item>
              {unidades.map((u) => (
                <Select.Item key={u.ref} value={u.ref}>
                  {u.nome}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
          <span className="text-xs text-muted-foreground">
            O resultado, os gráficos e o plano de contas são de {nomeDaEscolhida}, em{' '}
            {rotuloPeriodo}. Média e melhor são das{' '}
            {plural(unidades.length, 'loja consultada', 'lojas consultadas')}.
          </span>
        </div>

        {/* ── CARTÃO E RESULTADO SÃO UMA TABELA SÓ ────────────────────────────
            Eram duas, e repetiam o realizado e o orçado dos mesmos sete
            indicadores. A planilha tem os dois separados porque é relatório
            impresso, uma aba por formato; aqui é uma tabela com três leituras
            no "Contra" (decisão do João, 29/09/2026). A leitura Lojas é o
            cartão do BI, e o Caderno continua saindo nesse formato. */}
        {/* O "Contra" mora FORA da tabela, ao lado do título da seção. Dentro
            do cabeçalho dela, ele dividia a direita com os botões — e a leitura
            Lojas tem o Caderno, as outras não: o seletor andava 103 px a cada
            troca (29/09/2026). Aqui ele não depende de nada que muda. */}
        <Secao titulo="Resultado da loja" tourId="analises-resultado" extra={escolhaDoContra}>
          {contra === 'lojas' ? (
            <DataReport
              key="lojas"
              title={`Resultado · ${tituloDaEscolhida}`}
              subtitle={
                semOrcado
                  ? `Os sete indicadores do BI mensal, em ${rotuloPeriodo}. Sem orçamento lançado para o período.`
                  : `Os sete indicadores do BI mensal, em ${rotuloPeriodo}, contra o ano passado, o orçado e as lojas consultadas.`
              }
              data={cartao}
              columns={colunasDoCartao}
              pageSize={10}
              maxBodyHeight="none"
              enableSorting={false}
              columnPinning={{ left: ['indicador'] }}
              countNoun="indicadores"
              getRowId={(l) => String(l.indice)}
              actions={
                <>
                  <BotaoCaderno
                    montar={montarCaderno}
                    subtitulo={`Dashboard de Contas · ${rotuloPeriodo} · média e melhor das ${plural(unidades.length, 'loja consultada', 'lojas consultadas')}`}
                    desabilitado={unidades.length === 0}
                  />
                  <BotaoExportar
                    planilha={planilhaDoCartao}
                    titulo={`Cartão - ${tituloDaEscolhida}`}
                    tituloDoArquivo={`Cartão da loja - ${tituloDaEscolhida}`}
                  />
                </>
              }
              renderCard={(l) => (
                <div className="flex flex-col gap-1.5 p-3">
                  <p className="text-sm font-semibold">{l.rotulo}</p>
                  {/* O rótulo com a largura DELE, e o valor com o resto. Em duas
                      colunas iguais, o valor tinha ~140 px no celular e o gap
                      quebrava no meio ("−3,33" numa linha, "p.p." na outra —
                      29/09/2026). */}
                  <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 text-sm">
                    <dt className="text-xs text-muted-foreground">Realizado</dt>
                    <dd className="text-right font-semibold tabular-nums">{fmtPct(l.realizado)}</dd>
                    <dt className="text-xs text-muted-foreground">Ano passado</dt>
                    <dd className="text-right tabular-nums">{fmtPct(l.anoPassado)}</dd>
                    <dt className="text-xs text-muted-foreground">Orçado</dt>
                    <dd className="text-right tabular-nums">{fmtPct(l.orcado)}</dd>
                    <dt className="text-xs text-muted-foreground">Média · gap</dt>
                    <dd className="flex flex-wrap justify-end gap-x-2 whitespace-nowrap tabular-nums">
                      {fmtPct(l.media)}
                      <span className={classeDoGap(l.gapMedia, l.direcao)}>
                        {fmtPontos(l.gapMedia)}
                      </span>
                    </dd>
                    <dt className="text-xs text-muted-foreground">Impacto R$</dt>
                    <dd className={cn('text-right tabular-nums', classeDoImpacto(l.impacto))}>
                      {textoDoImpacto(l.impacto)}
                    </dd>
                    <dt className="text-xs text-muted-foreground">Melhor · gap</dt>
                    <dd className="flex flex-wrap justify-end gap-x-2 whitespace-nowrap tabular-nums">
                      {fmtPct(l.melhor)}
                      <span className={classeDoGap(l.gapMelhor, l.direcao)}>
                        {fmtPontos(l.gapMelhor)}
                      </span>
                    </dd>
                    {/* A melhor loja numa linha só dela, e QUEBRANDO: ao lado do
                        percentual, num cartão de 375 px, o nome saía "24.CB ALP…"
                        (29/09/2026). */}
                    {l.melhorUnidade && (
                      <>
                        <dt className="text-xs text-muted-foreground">Melhor loja</dt>
                        <dd className="break-words text-right text-muted-foreground">
                          {l.melhorUnidade}
                        </dd>
                      </>
                    )}
                  </dl>
                </div>
              )}
            />
          ) : (
            <DataReport
              key="contas"
              title={`Resultado · ${tituloDaEscolhida}`}
              titleExtra={
                contra === 'orcado' ? (
                  <SeloDoOrcamento detalhe="As colunas Orçado são o orçamento que as lojas lançaram no Plano de Orçamentos para o mesmo período." />
                ) : undefined
              }
              subtitle={
                resultado.lojas === 0
                  ? contra === 'orcado'
                    ? `Sem orçamento lançado para ${rotuloPeriodo}.`
                    : `Sem plano nos mesmos meses do ano passado.`
                  : escolhida
                    ? `${rotuloPeriodo} contra ${contra === 'orcado' ? 'o orçado do mesmo período' : 'os mesmos meses do ano passado'}.`
                    : `${rotuloPeriodo} contra ${contra === 'orcado' ? 'o orçado do mesmo período' : 'os mesmos meses do ano passado'}, nas ${plural(resultado.lojas, 'loja com os dois lados', 'lojas com os dois lados')}.`
              }
              data={resultado.linhas}
              columns={colunasDoResultado}
              pageSize={20}
              maxBodyHeight="none"
              enableSorting={false}
              columnPinning={{ left: ['linha'] }}
              countNoun="linhas"
              getRowId={(l) => String(l.indice)}
              // Sem fundo próprio: as linhas seguem o listrado da grade, como nas
              // outras tabelas (pedido do Davi, 30/09/2026). Faturamento e lucro
              // contábil se destacam pelo negrito.
              actions={
                <BotaoExportar
                  planilha={planilhaDoResultado}
                  titulo={`Resultado contra ${nomeDoContra.toLowerCase()} - ${tituloDaEscolhida}`}
                  tituloDoArquivo={`Resultado contra ${nomeDoContra.toLowerCase()} - ${tituloDaEscolhida}`}
                />
              }
              renderCard={(l) => (
                <div className={cn('flex flex-col gap-1.5 p-3', l.parcela && 'pl-6')}>
                  <p className="text-sm font-semibold">{l.rotulo}</p>
                  <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 text-sm">
                    <dt className="text-xs text-muted-foreground">Realizado</dt>
                    <dd className="text-right tabular-nums">
                      {fmtValor(l.atual.valor)} · {fmtPct(l.atual.pct)}
                    </dd>
                    <dt className="text-xs text-muted-foreground">{nomeDoContra}</dt>
                    <dd className="text-right tabular-nums">
                      {fmtValor(l.comparado?.valor ?? null)} · {fmtPct(l.comparado?.pct ?? null)}
                    </dd>
                    <dt className="text-xs text-muted-foreground">Gap</dt>
                    <dd className="flex flex-wrap justify-end gap-x-2 whitespace-nowrap tabular-nums">
                      <span className={classeDoGap(l.gapValor, l.direcao, 0.005)}>
                        {fmtDiferenca('brl', l.gapValor)}
                      </span>
                      {l.gapPontos != null && (
                        <span className={classeDoGap(l.gapPontos, l.direcao)}>
                          {fmtPontos(l.gapPontos)}
                        </span>
                      )}
                    </dd>
                  </dl>
                </div>
              )}
            />
          )}
        </Secao>

        <Secao titulo={`Gráficos · ${tituloDaEscolhida}`} tourId="analises-graficos">
          <div className="grid grid-cols-1 gap-3 @4xl:grid-cols-2">
            <OndeEstaODinheiro
              cat={cat}
              recorte={recorte}
              operacoes={operacoes}
              meses={meses}
              unidade={escolhida}
              nomeDaUnidade={nomeDaEscolhida}
              atraso={160}
            />
            <MolduraGrafico
              tourId="realizado-orcado"
              titulo="Realizado contra orçado"
              subtitulo={`${tempo?.nome ?? 'Faturamento'} de ${nomeDaEscolhida} mês a mês, nos 12 meses até o fim do período: o realizado ao lado do orçado. A faixa cinza marca o período escolhido.`}
              origem={
                <SeloDoOrcamento detalhe="As colunas cinzas são o orçamento que a loja lançou no Plano de Orçamentos para cada mês." />
              }
              acao={
                <div className="flex flex-wrap items-center gap-2">
                  <Escolha<MetricaNoTempo>
                    value={metrica}
                    onChange={setMetrica}
                    ariaLabel="O que o gráfico mostra"
                    rotulo="Mostrar"
                    forma="select"
                    options={[
                      { value: 'faturamento', label: 'Faturamento' },
                      { value: 'despesas', label: 'Despesas totais' },
                      { value: 'lucro', label: 'Lucro líquido' },
                    ]}
                  />
                  <LegendaDeSeries
                    series={[
                      { id: 'real', nome: 'Realizado', cor: COR.serie },
                      { id: 'orcado', nome: 'Orçado', cor: COR.apagada },
                    ]}
                  />
                </div>
              }
              atraso={220}
              tituloDoArquivo={`Realizado contra orçado - ${tituloDaEscolhida}`}
              planilha={() =>
                tempo
                  ? planilhaDeSerieMensal(tempo.meses, [
                      { nome: `${tempo.nome} realizado`, valores: tempo.real, formato: 'brl' },
                      {
                        nome: `${tempo.nome} orçado`,
                        valores: tempo.orcado ?? tempo.meses.map(() => null),
                        formato: 'brl',
                      },
                    ])
                  : null
              }
            >
              {tempo ? (
                <ColunasAgrupadas
                  meses={tempo.meses}
                  series={[
                    { id: 'real', nome: 'Realizado', cor: COR.serie, valores: tempo.real },
                    {
                      id: 'orcado',
                      nome: 'Orçado',
                      cor: COR.apagada,
                      valores: tempo.orcado ?? tempo.meses.map(() => null),
                    },
                  ]}
                  formatarEixo={reaisCurtos}
                  formatarValor={fmtBRLCompacto}
                />
              ) : (
                <p className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
                  A série dos 12 meses ainda está a caminho.
                </p>
              )}
            </MolduraGrafico>
          </div>
        </Secao>

        <Secao titulo="A rede" tourId="analises-rede">
          <div className="grid grid-cols-1 gap-3 @4xl:grid-cols-2">
            <MolduraGrafico
              tourId="atingimento"
              titulo="Atingimento do orçado"
              subtitulo="O faturamento de cada loja sobre o orçado dela no período, menos 1: acima de zero, faturou além do orçado. A régua tracejada é a seleção."
              origem={
                <SeloDoOrcamento detalhe="O orçado de cada loja é o faturamento que ela lançou no Plano de Orçamentos para o mesmo período." />
              }
              atraso={280}
              tituloDoArquivo="Atingimento do orçado"
              planilha={() =>
                planilhaDeRanking(
                  atingimento.map((a) => ({
                    rotulo: a.nome,
                    valor: a.atingimento,
                    detalhe: `${fmtBRLCompacto(a.realizado)} de ${fmtBRLCompacto(a.orcado)}`,
                  })),
                  {
                    rotuloItem: 'Loja',
                    rotuloValor: 'Atingimento (realizado ÷ orçado − 1)',
                    formato: 'pct',
                    notas: [
                      `Período: ${rotuloPeriodo}.`,
                      atingimentoDaSelecao == null
                        ? 'Sem atingimento da seleção.'
                        : `Seleção: ${fmtVariacao(atingimentoDaSelecao)}.`,
                    ],
                  }
                )
              }
            >
              {barrasDoAtingimento.length === 0 ? (
                <p className="flex min-h-[12rem] items-center justify-center px-4 text-center text-sm text-muted-foreground">
                  Nenhuma loja consultada tem orçamento de faturamento lançado para {rotuloPeriodo}.
                </p>
              ) : (
                <BarrasRanking
                  itens={barrasDoAtingimento}
                  referencia={atingimentoDaSelecao}
                  referenciaFormatada={
                    atingimentoDaSelecao == null ? undefined : fmtVariacao(atingimentoDaSelecao)
                  }
                  rotuloReferencia="Seleção"
                  substantivoPlural="lojas"
                />
              )}
            </MolduraGrafico>
            <CurvaAbc cat={cat} recorte={recorte} operacoes={operacoes} atraso={340} />
          </div>
        </Secao>

        {/* O detalhe por último: é a grade mais longa da aba, e quem chega nela
            já leu o cartão, o resultado e os gráficos da mesma loja. */}
        {fontes && (
          <Secao titulo="Plano de contas completo" tourId="analises-plano">
            <PlanoDaLoja
              cat={cat}
              alvo={fontes.alvo}
              anoPassado={fontes.anoPassado}
              orcado={fontes.orcado}
              unidades={unidades}
              consolidado={recorte.consolidado}
              titulo={tituloDaEscolhida}
              rotuloPeriodo={rotuloPeriodo}
            />
          </Secao>
        )}
      </div>
    </div>
  )
}
