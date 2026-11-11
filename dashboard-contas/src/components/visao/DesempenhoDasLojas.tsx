import { useCallback, useDeferredValue, useMemo, useState, type ReactNode } from 'react'
import {
  Button,
  DataReport,
  SegmentedControl,
  Select,
  TelaCheia,
  Tooltip,
  type ColumnDef,
  type SortingState,
} from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'
import { Maximize2, Minimize2 } from 'lucide-react'
import type { Catalogo } from '../../catalogo'
import { planilhaDaGrade, type ColunaPlanilha } from '../../planilha'
import { BotaoExportar } from '../BotaoExportar'
import { fmtBRLCompacto, fmtPct, fmtPontos, fmtValor, fmtVariacao, plural } from '../../formato'
import {
  desempenhoPorLoja,
  desempenhoPorRegiao,
  ordenarDesempenho,
  type LinhaDeDesempenho,
  type OperacaoParaDesempenho,
} from '../../lojas'
import { planilhaDeRanking } from '../../planilha'
import type { RecorteCalculado } from '../../recorte'
import { despesasTotais } from '../../visao'
import { valorDe } from '../../matriz'
import { BarrasRanking } from '../graficos/BarrasRanking'
import { MolduraGrafico } from '../graficos/MolduraGrafico'

// O desempenho de cada loja e de cada região: dois rankings em barras e a tabela
// com faturamento, despesas, lucro e rentabilidade contra o período anterior.
//
// ── O RANKING É DA MESMA MÉTRICA NOS DOIS GRÁFICOS ──────────────────────────
//
// O seletor de métrica vale para lojas E regiões: "quem tem a menor matéria-
// prima" e "que região tem a menor matéria-prima" são a mesma pergunta em duas
// escalas. A régua de cada gráfico é o consolidado das operações na conta.
//
// ── A TABELA É O `DataReport` DA SDK ────────────────────────────────────────
//
// Ordenação por coluna e exportação vêm prontas; o cartão do celular é nosso
// (`CartaoDaLinha`), porque o automático não rotula os números. Sem
// `fillHeight`: ela mora dentro da Visão geral, que rola como página, e mostra
// 10 linhas por página — sem rolagem dentro de rolagem.
//
// ── EM TELA CHEIA, TODAS AS LINHAS ──────────────────────────────────────────
//
// Como os rankings: expandida, a tabela mostra as 90 lojas de uma vez e rola,
// sem páginas. A tela cheia do próprio `DataReport` não serve: ela mantinha as
// 10 por página ("Exibindo 1–10 de 90 lojas", página 1 de 9, com a tela vazia
// embaixo — visto em 29/09/2026), e a grade só lê o tamanho da página ao nascer.
// Então a tela cheia é a `TelaCheia` da SDK por fora, e a grade é MONTADA DE
// NOVO com a página do tamanho da lista. A ordem escolhida no cabeçalho mora
// aqui fora (`ordenarDesempenho`) para sobreviver à troca.

interface Props {
  cat: Catalogo
  recorte: RecorteCalculado
  operacoes: readonly OperacaoParaDesempenho[]
  rotuloVariacao: string
  /** A métrica dos rankings e as linhas da tabela vivem na TELA (ver abaixo). */
  metrica: Metrica
  onMetrica: (m: Metrica) => void
  visao: Visao
  onVisao: (v: Visao) => void
}

export type Metrica = 'faturamento' | 'lucro' | 'rentabilidade' | 'cmv' | 'labor' | 'delivery'

const METRICAS: Array<{ id: Metrica; rotulo: string; unidade: 'brl' | 'pct' }> = [
  { id: 'faturamento', rotulo: 'Faturamento', unidade: 'brl' },
  { id: 'lucro', rotulo: 'Lucro líquido', unidade: 'brl' },
  { id: 'rentabilidade', rotulo: 'Rentabilidade', unidade: 'pct' },
  { id: 'cmv', rotulo: 'Matéria-prima (CMV)', unidade: 'pct' },
  { id: 'labor', rotulo: 'Labor', unidade: 'pct' },
  { id: 'delivery', rotulo: 'Delivery', unidade: 'brl' },
]

/** A página da grade em tela cheia: maior que qualquer lista, é "todas". */
const TODAS_AS_LINHAS = 10_000

/** Percentuais em que MENOR é melhor: o ranking os ordena do menor para o maior. */
const MENOR_E_MELHOR = new Set<Metrica>(['cmv', 'labor'])

export type Visao = 'loja' | 'regiao'

function porFaturamento(a: LinhaDeDesempenho, b: LinhaDeDesempenho): number {
  return (b.faturamento ?? -Infinity) - (a.faturamento ?? -Infinity)
}

function formatarMetrica(metrica: Metrica, v: number | null): string {
  const def = METRICAS.find((m) => m.id === metrica)!
  return def.unidade === 'pct' ? fmtPct(v) : fmtBRLCompacto(v)
}

/**
 * As barras de um ranking: sem os sem-dado, na ordem em que o bom fica em cima.
 * A dica da REGIÃO diz quantas lojas ela soma — mesmo uma só: com o nome da
 * região ali, a de uma loja repetia "Sem região" debaixo de "Sem região".
 */
function itensDoRanking(linhas: LinhaDeDesempenho[], metrica: Metrica, regioes = false) {
  return linhas
    .map((l) => ({
      chave: l.chave,
      rotulo: l.nome,
      valor: l[metrica],
      valorFormatado: formatarMetrica(metrica, l[metrica]),
      detalhe: regioes || l.lojas > 1 ? plural(l.lojas, 'loja', 'lojas') : l.regiao || undefined,
    }))
    .filter((i): i is typeof i & { valor: number } => i.valor != null)
    .sort((a, b) => (MENOR_E_MELHOR.has(metrica) ? a.valor - b.valor : b.valor - a.valor))
}

function Var({
  v,
  pontos,
  menorEMelhor,
}: {
  v: number | null
  pontos?: boolean
  menorEMelhor?: boolean
}) {
  if (v == null) return <span className="text-muted-foreground">—</span>
  const limite = pontos ? 0.00005 : 0.0005
  const bom = v > limite ? !menorEMelhor : v < -limite ? !!menorEMelhor : null
  return (
    <span
      className={cn(
        'whitespace-nowrap tabular-nums',
        bom === null && 'text-muted-foreground',
        bom === true && 'text-success',
        bom === false && 'text-destructive'
      )}
    >
      {pontos ? fmtPontos(v) : fmtVariacao(v)}
    </span>
  )
}

/**
 * O cartão da linha no celular. O automático do `DataReport` punha os campos
 * primários lado a lado SEM rótulo — "4.679.631,11 · 37,00%" — e ninguém sabia
 * qual número era qual (18/09/2026). Aqui cada valor leva o nome e a variação.
 */
function CartaoDaLinha({ l }: { l: LinhaDeDesempenho }) {
  const campos: Array<{ rotulo: string; valor: string; negativo?: boolean; variacao: ReactNode }> =
    [
      {
        rotulo: 'Faturamento',
        valor: fmtBRLCompacto(l.faturamento),
        variacao: <Var v={l.varFaturamento} />,
      },
      {
        rotulo: 'Despesas',
        valor: fmtBRLCompacto(l.despesas),
        variacao: <Var v={l.varDespesas} menorEMelhor />,
      },
      {
        rotulo: 'Lucro líquido',
        valor: fmtBRLCompacto(l.lucro),
        negativo: (l.lucro ?? 0) < 0,
        variacao: <Var v={l.varLucro} />,
      },
      {
        rotulo: 'Rentabilidade',
        valor: fmtPct(l.rentabilidade),
        negativo: (l.rentabilidade ?? 0) < 0,
        variacao: <Var v={l.varRentabilidade} pontos />,
      },
    ]
  return (
    <div className="flex flex-col gap-2">
      <div className="flex min-w-0 items-baseline justify-between gap-2">
        <span className="min-w-0 truncate font-semibold text-foreground">{l.nome}</span>
        <span className="shrink-0 text-xs text-muted-foreground">
          {l.lojas > 1 ? plural(l.lojas, 'loja', 'lojas') : l.regiao}
        </span>
      </div>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-2">
        {campos.map((c) => (
          <div key={c.rotulo} className="flex min-w-0 flex-col">
            <dt className="text-[11px] text-muted-foreground">{c.rotulo}</dt>
            <dd className="flex flex-wrap items-baseline gap-x-1.5 text-sm">
              <span
                className={cn('tabular-nums text-foreground', c.negativo && 'text-destructive')}
              >
                {c.valor}
              </span>
              <span className="text-xs">{c.variacao}</span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export function DesempenhoDasLojas({
  cat,
  recorte,
  operacoes,
  rotuloVariacao,
  metrica,
  onMetrica: setMetrica,
  visao,
  onVisao: setVisao,
}: Props) {
  const visaoExibida = useDeferredValue(visao)
  const [cheia, setCheia] = useState(false)
  const [ordem, setOrdem] = useState<SortingState>([])

  // A tabela abre do maior para o menor faturamento, como o ranking do desenho;
  // o cabeçalho de cada coluna reordena.
  const porLoja = useMemo(
    () => desempenhoPorLoja(recorte, operacoes, cat).sort(porFaturamento),
    [recorte, operacoes, cat]
  )
  const porRegiao = useMemo(
    () => desempenhoPorRegiao(recorte, operacoes, cat).sort(porFaturamento),
    [recorte, operacoes, cat]
  )

  // A tabela em Excel — as mesmas colunas da tela, com o formato de cada uma.
  const colunasDaPlanilha = useMemo<ColunaPlanilha[]>(
    () => [
      { titulo: visaoExibida === 'loja' ? 'Loja' : 'Região', formato: 'texto' },
      visaoExibida === 'loja'
        ? { titulo: 'Região', formato: 'texto' }
        : { titulo: 'Lojas', formato: 'inteiro' },
      { titulo: 'Faturamento (R$)', formato: 'brl' },
      { titulo: 'Variação do faturamento', formato: 'pct' },
      { titulo: 'Despesas (R$)', formato: 'brl' },
      { titulo: 'Variação das despesas', formato: 'pct' },
      { titulo: 'Lucro líquido (R$)', formato: 'brl' },
      { titulo: 'Variação do lucro', formato: 'pct' },
      { titulo: 'Rentabilidade', formato: 'pct' },
      { titulo: 'Variação da rentabilidade', formato: 'pp' },
    ],
    [visaoExibida]
  )
  // O que a grade mostra, na ordem do cabeçalho — e a planilha leva a mesma.
  const linhasDaTabela = useMemo(
    () => ordenarDesempenho(visaoExibida === 'loja' ? porLoja : porRegiao, ordem),
    [visaoExibida, porLoja, porRegiao, ordem]
  )
  const planilhaDaTabela = useCallback(
    () =>
      planilhaDaGrade(colunasDaPlanilha, linhasDaTabela, (l) => [
        l.nome,
        visaoExibida === 'loja' ? l.regiao || null : l.lojas,
        l.faturamento,
        l.varFaturamento,
        l.despesas,
        l.varDespesas,
        l.lucro,
        l.varLucro,
        l.rentabilidade,
        l.varRentabilidade,
      ]),
    [colunasDaPlanilha, visaoExibida, linhasDaTabela]
  )

  const def = METRICAS.find((m) => m.id === metrica)!
  const formatar = (v: number | null) => formatarMetrica(metrica, v)
  const referencia = useMemo(() => {
    const c = recorte.consolidado
    const fat = valorDe(c, cat, 1000)
    const sobre = (i: number) => {
      const v = valorDe(c, cat, i)
      return v == null || fat == null || Math.abs(fat) < 1e-9 ? null : v / fat
    }
    if (metrica === 'faturamento') return fat
    if (metrica === 'lucro') return valorDe(c, cat, 7000)
    if (metrica === 'rentabilidade') return valorDe(c, cat, 10000)
    if (metrica === 'cmv') return sobre(2000)
    if (metrica === 'labor') return sobre(10200)
    return valorDe(c, cat, 1200)
  }, [recorte, cat, metrica])
  // Nos totais em reais a régua é a MÉDIA POR LOJA, e não a soma da seleção: a
  // soma da rede ao lado de uma loja achataria todas as barras (a regra do
  // indicador "absoluto" do RH).
  const ehTotal = def.unidade === 'brl'
  const regua = (n: number) =>
    ehTotal && referencia != null && n > 0 ? referencia / n : referencia

  const itensLojas = useMemo(() => itensDoRanking(porLoja, metrica), [porLoja, metrica])
  const itensRegioes = useMemo(() => itensDoRanking(porRegiao, metrica, true), [porRegiao, metrica])

  const totalDaSelecao = {
    faturamento: valorDe(recorte.consolidado, cat, 1000),
    despesas: despesasTotais(recorte.consolidado, cat),
    lucro: valorDe(recorte.consolidado, cat, 7000),
    rentabilidade: valorDe(recorte.consolidado, cat, 10000),
  }

  const colunas = useMemo<ColumnDef<LinhaDeDesempenho, unknown>[]>(
    () => [
      {
        id: 'nome',
        header: visaoExibida === 'loja' ? 'Loja' : 'Região',
        accessorKey: 'nome',
        // Coluna FIXA (ver `columnPinning`), e a grade dá à fixa o `size`, não o
        // `meta.width`: sem ele ela ficava nos 150 px padrão, e 12 lojas saíam
        // cortadas ("69.CB SÃO JOSÉ DOS C…"). 232 = o maior nome da rede, "46.CB
        // SÃO JOSE DO RIO PRETO" (200 px), mais o recuo da célula (29/09/2026).
        size: 232,
        meta: { width: 232, mobile: 'primary' },
        cell: ({ row }) => (
          <span className="block truncate font-medium text-foreground">{row.original.nome}</span>
        ),
      },
      ...(visaoExibida === 'loja'
        ? [
            {
              id: 'regiao',
              header: 'Região',
              accessorKey: 'regiao',
              meta: { width: 80 },
              cell: ({ row }: { row: { original: LinhaDeDesempenho } }) =>
                row.original.regiao || <span className="text-muted-foreground">—</span>,
            } satisfies ColumnDef<LinhaDeDesempenho, unknown>,
          ]
        : [
            {
              id: 'lojas',
              header: 'Lojas',
              accessorKey: 'lojas',
              meta: { width: 64 },
            } satisfies ColumnDef<LinhaDeDesempenho, unknown>,
          ]),
      {
        id: 'faturamento',
        header: 'Faturamento (R$)',
        accessorKey: 'faturamento',
        meta: { width: 130, mobile: 'primary' },
        cell: ({ row }) => (
          <span className="tabular-nums">{fmtValor(row.original.faturamento)}</span>
        ),
      },
      {
        id: 'varFaturamento',
        header: 'Var.',
        accessorKey: 'varFaturamento',
        meta: { width: 76 },
        cell: ({ row }) => <Var v={row.original.varFaturamento} />,
      },
      {
        id: 'despesas',
        header: 'Despesas (R$)',
        accessorKey: 'despesas',
        meta: { width: 130 },
        cell: ({ row }) => <span className="tabular-nums">{fmtValor(row.original.despesas)}</span>,
      },
      {
        id: 'varDespesas',
        header: 'Var.',
        accessorKey: 'varDespesas',
        meta: { width: 76 },
        cell: ({ row }) => <Var v={row.original.varDespesas} menorEMelhor />,
      },
      {
        id: 'lucro',
        header: 'Lucro líquido (R$)',
        accessorKey: 'lucro',
        meta: { width: 130 },
        cell: ({ row }) => (
          <span className={cn('tabular-nums', (row.original.lucro ?? 0) < 0 && 'text-destructive')}>
            {fmtValor(row.original.lucro)}
          </span>
        ),
      },
      {
        id: 'varLucro',
        header: 'Var.',
        accessorKey: 'varLucro',
        meta: { width: 76 },
        cell: ({ row }) => <Var v={row.original.varLucro} />,
      },
      {
        id: 'rentabilidade',
        header: 'Rentabilidade',
        accessorKey: 'rentabilidade',
        meta: { width: 100, mobile: 'primary' },
        cell: ({ row }) => (
          <span
            className={cn(
              'tabular-nums',
              (row.original.rentabilidade ?? 0) < 0 && 'text-destructive'
            )}
          >
            {fmtPct(row.original.rentabilidade)}
          </span>
        ),
      },
      {
        id: 'varRentabilidade',
        header: 'Var. (p.p.)',
        accessorKey: 'varRentabilidade',
        meta: { width: 96 },
        cell: ({ row }) => <Var v={row.original.varRentabilidade} pontos />,
      },
    ],
    [visaoExibida]
  )

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 @4xl:grid-cols-2">
        <MolduraGrafico
          tourId="grafico-ranking"
          // A métrica já está no seletor ao lado do título. Repetida nele, o
          // título cortava em meia tela ("Ranking de lojas · Fatura…", a
          // 1024 px — 29/09/2026). O arquivo baixado continua com ela no nome.
          titulo="Ranking de lojas"
          tituloDoArquivo={`Ranking de lojas · ${def.rotulo}`}
          subtitulo={
            MENOR_E_MELHOR.has(metrica)
              ? 'Do menor para o maior percentual — menor é melhor. A régua tracejada é a seleção.'
              : ehTotal
                ? 'Do maior para o menor. A régua tracejada é a média por loja da seleção.'
                : 'Do maior para o menor. A régua tracejada é a seleção.'
          }
          acao={
            <Select value={metrica} onValueChange={(v) => setMetrica(v as Metrica)}>
              <Select.Trigger className="h-8 w-48" aria-label="Métrica dos rankings">
                <span className="truncate">{def.rotulo}</span>
              </Select.Trigger>
              <Select.Content>
                {METRICAS.map((m) => (
                  <Select.Item key={m.id} value={m.id}>
                    {m.rotulo}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          }
          atraso={640}
          planilha={() =>
            planilhaDeRanking(itensLojas, {
              rotuloItem: 'Loja',
              rotuloValor: def.rotulo,
              formato: def.unidade === 'pct' ? 'pct' : 'brl',
              notas: [
                `${ehTotal ? 'Média por loja' : 'Seleção'}: ${formatar(regua(porLoja.length))}.`,
                MENOR_E_MELHOR.has(metrica)
                  ? 'Menor é melhor: a lista vai do menor para o maior.'
                  : 'Do maior para o menor.',
              ],
            })
          }
        >
          <BarrasRanking
            itens={itensLojas}
            referencia={regua(porLoja.length)}
            referenciaFormatada={formatar(regua(porLoja.length))}
            rotuloReferencia={ehTotal ? 'Média' : 'Seleção'}
          />
        </MolduraGrafico>
        <MolduraGrafico
          tourId="grafico-regioes"
          titulo={`Regiões · ${def.rotulo}`}
          subtitulo="As operações na conta somadas por região da rede (NCO, NE, SPC, SPISE, SUL). O seletor de métrica fica no ranking de lojas."
          atraso={680}
          planilha={() =>
            planilhaDeRanking(itensRegioes, {
              rotuloItem: 'Região',
              rotuloValor: def.rotulo,
              formato: def.unidade === 'pct' ? 'pct' : 'brl',
              notas: [
                `${ehTotal ? 'Média por região' : 'Seleção'}: ${formatar(regua(porRegiao.length))}.`,
                'As operações na conta somadas por região da rede.',
              ],
            })
          }
        >
          <BarrasRanking
            itens={itensRegioes}
            referencia={regua(porRegiao.length)}
            referenciaFormatada={formatar(regua(porRegiao.length))}
            rotuloReferencia={ehTotal ? 'Média' : 'Seleção'}
            substantivoPlural="regiões"
          />
        </MolduraGrafico>
      </div>

      <TelaCheia ativa={cheia} onSair={() => setCheia(false)} className="p-3 md:p-6">
        <div data-tour="tabela-lojas" className={cn('flex flex-col', cheia && 'min-h-0 flex-1')}>
          <DataReport
            // Montada de novo ao entrar e ao sair da tela cheia: é o único jeito
            // de a grade trocar o tamanho da página (ver o topo do arquivo).
            key={cheia ? 'tela-cheia' : 'paginada'}
            title="Desempenho das lojas"
            subtitle={`Seleção: ${fmtBRLCompacto(totalDaSelecao.faturamento)} de faturamento, ${fmtBRLCompacto(totalDaSelecao.despesas)} de despesas, ${fmtBRLCompacto(totalDaSelecao.lucro)} de lucro (${fmtPct(totalDaSelecao.rentabilidade)}). Variação ${rotuloVariacao}, nas mesmas lojas.`}
            filters={
              <SegmentedControl<Visao>
                value={visao}
                onChange={setVisao}
                ariaLabel="Linhas da tabela"
                options={[
                  { value: 'loja', label: 'Por loja' },
                  {
                    value: 'regiao',
                    label: 'Por região',
                    tooltip: 'Soma as operações na conta de cada região da rede',
                  },
                ]}
              />
            }
            data={linhasDaTabela}
            columns={colunas}
            loading={visao !== visaoExibida}
            sorting={ordem}
            onSortingChange={setOrdem}
            pageSize={cheia ? TODAS_AS_LINHAS : 10}
            // Na página, sem teto de altura: a página de 10 é o limite. O padrão
            // (60vh) cabia as 10 linhas no desktop, mas no celular os 10 cartões
            // somam ~1.400 px e viravam rolagem dentro da rolagem da aba
            // (18/09/2026). Em tela cheia a grade ocupa a tela e rola por dentro.
            fillHeight={cheia}
            maxBodyHeight={cheia ? undefined : 'none'}
            fullscreenToggle={false}
            countNoun={visaoExibida === 'loja' ? 'lojas' : 'regiões'}
            getRowId={(l) => l.chave}
            // A loja FICA à esquerda ao rolar de lado. Os títulos das colunas
            // (com o ícone de ordenar) somam ~1.280 px, e a grade rola já a
            // 1280 px — num portal com o menu aberto, antes. Sem a coluna
            // fixa, os números das últimas colunas ficavam sem dono (29/09/2026).
            columnPinning={{ left: ['nome'] }}
            renderCard={(l) => <CartaoDaLinha l={l} />}
            actions={
              <>
                <Tooltip content={cheia ? 'Sair da tela cheia (Esc)' : 'Tela cheia'}>
                  <Button
                    variant={cheia ? 'secondary' : 'ghost'}
                    size="icon"
                    onClick={() => setCheia(!cheia)}
                    aria-label={cheia ? 'Sair da tela cheia' : 'Tela cheia'}
                    aria-pressed={cheia}
                  >
                    {cheia ? (
                      <Minimize2 className="h-4 w-4" aria-hidden />
                    ) : (
                      <Maximize2 className="h-4 w-4" aria-hidden />
                    )}
                  </Button>
                </Tooltip>
                <BotaoExportar
                  planilha={planilhaDaTabela}
                  titulo={visaoExibida === 'loja' ? 'Desempenho por loja' : 'Desempenho por região'}
                />
              </>
            }

            titleExtra={
              <Tooltip
                content={
                  <span className="block max-w-[18rem] text-left">
                    Despesas = matéria-prima + impostos + custos operacionais. Lucro líquido sem
                    investimentos. A variação compara cada linha com ela mesma no período anterior;
                    loja sem plano no período anterior mostra "—".
                  </span>
                }
              >
                <span className="cursor-help text-xs text-muted-foreground underline decoration-dotted">
                  como ler
                </span>
              </Tooltip>
            }
          />
        </div>
      </TelaCheia>
    </div>
  )
}
