import { useCallback, useDeferredValue, useMemo, useState } from 'react'
import { DataReport, EmptyState, Tooltip, type ColumnDef, type PeriodoDeMeses } from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'
import { FileSpreadsheet, Info } from 'lucide-react'
import { aFavor } from '../comparacao'
import { INDICE_FATURAMENTO, type Catalogo } from '../catalogo'
import { planilhaDaGrade, type Celula, type ColunaPlanilha } from '../planilha'
import { BotaoExportar } from './BotaoExportar'
import { fmtConta, fmtDiferenca, fmtPct, fmtValor, fmtVariacao, plural } from '../formato'
import { direcaoDaLinha, linhasDaGrade, medir, type LinhaGrade, type Medida } from '../grade'
import { agregarPorLoja, consolidar, type MesCarregado } from '../matriz'
import { celulasDaLinha } from '../linha-fixa'
import { rotuloDaVariacao, type ModoDeComparacao } from '../periodo'
import type { RecorteCalculado } from '../recorte'
import { AbrirAte } from './AbrirAte'
import { ContaNaArvore } from './ContaNaArvore'
import { DicaDaGrade } from './DicaDaGrade'
import { Escolha } from './Escolha'

// A aba Plano de contas — o plano CONSOLIDADO das operações na conta, na árvore
// do próprio plano (a tabela principal do HTML que especifica o módulo).
//
// ── A ÁRVORE ABRE POR NÍVEL OU CONTA A CONTA ────────────────────────────────
//
// "Abrir até: Nível 1 / 2 / 3" abre todas as contas até o nível; a seta de cada
// conta abre só ela. As contas abertas são as MESMAS da aba Comparativos: quem
// abre "4 CUSTOS OPERACIONAIS" aqui a encontra aberta lá. A ordenação por coluna
// fica desligada — ela separaria as filhas dos seus grupos.
//
// ── A VARIAÇÃO É DAS MESMAS LOJAS ───────────────────────────────────────────
//
// Três números, os três "GAP" do BI mensal (abas COA - ACUMULADO e - MENSAL):
// "Var. R$" é quanto o valor mudou em reais; "Var. %", quanto isso é sobre o
// valor anterior; "Δ p.p.", quanto mudou o percentual sobre o faturamento — ou a
// própria razão, nas linhas de razão. Contam histórias diferentes: uma loja pode
// gastar mais em reais e melhorar em pontos, se o faturamento cresceu mais
// depressa, e é esse caso que a reunião discute.
//
// Os três comparam só as lojas com plano nos dois períodos, e por isso NÃO há
// coluna com o valor absoluto do período anterior: ao lado do realizado de todas
// as lojas, ele seria de outro conjunto de lojas e não se compararia. A "Var. R$"
// também é das mesmas lojas — não é o realizado menos um anterior de outra conta.
//
// ── NUM PERÍODO, TAMBÉM O MÊS A MÊS ─────────────────────────────────────────
//
// Com mais de um mês, "Mês a mês" põe um grupo de colunas (R$ e %) por mês, e o
// total do período no fim. Cada mês soma as lojas da conta com plano naquele mês.

interface Props {
  cat: Catalogo
  recorte: RecorteCalculado
  /** Os meses do período, para o mês a mês. */
  meses: readonly MesCarregado[]
  periodo: PeriodoDeMeses
  /** Contra o que a variação compara — o "Comparar com" do topo. */
  comparacao: ModoDeComparacao
  abertas: ReadonlySet<string>
  onAbertasChange: (abertas: ReadonlySet<string>) => void
  carregando: boolean
}

interface LinhaDoPlano {
  linha: LinhaGrade
  atual: Medida
  /** Diferença do valor em reais, nas mesmas lojas. `null` nas razões. */
  difValor: number | null
  /** Variação relativa do valor em reais, nas mesmas lojas. */
  varValor: number | null
  /** Mudança do "%" da linha, nas mesmas lojas. */
  varPct: number | null
  /** Um por mês do período, no modo mês a mês. */
  porMes: Medida[]
}

type Modo = 'total' | 'mes'

/** A barra de participação no faturamento: comprimento = o %, cor = o grupo. */
function BarraDoPercentual({ linha, pct }: { linha: LinhaGrade; pct: number }) {
  const lucro = linha.tipo === 'conta' && (linha.conta.raiz === '6' || linha.conta.raiz === '7')
  return (
    <span className="hidden h-1.5 w-12 shrink-0 overflow-hidden rounded-full bg-muted @md:block">
      <span
        className={cn(
          'block h-full rounded-full',
          lucro ? (pct >= 0 ? 'bg-success' : 'bg-destructive') : 'bg-primary/70'
        )}
        style={{ width: `${Math.min(Math.abs(pct), 1) * 100}%` }}
      />
    </span>
  )
}

function textoDoPct(m: Medida): string {
  return m.unidade === 'pct' ? fmtPct(m.pct) : fmtConta(m.unidade, m.pct)
}

function CelulaVariacao({
  v,
  linha,
  relativa,
  unidade,
}: {
  v: number | null
  linha: LinhaGrade
  relativa: boolean
  unidade: Medida['unidade']
}) {
  if (v == null) return <span className="text-muted-foreground">—</span>
  const favor = aFavor(v, direcaoDaLinha(linha))
  // Abaixo da casa exibida a mudança é "parada": nem verde nem vermelha.
  const parado = relativa ? Math.abs(v) < 0.0005 : Math.abs(v) < 0.00005
  return (
    <span
      className={cn(
        'whitespace-nowrap tabular-nums',
        (parado || favor === null) && 'text-muted-foreground',
        !parado && favor === true && 'text-success',
        !parado && favor === false && 'text-destructive'
      )}
    >
      {relativa ? fmtVariacao(v) : fmtDiferenca(unidade, v)}
    </span>
  )
}

const vazio = (
  <EmptyState
    icon={FileSpreadsheet}
    title="Nenhuma operação na conta"
    description="Marque ao menos uma operação no seletor Operações do topo e confira os filtros."
  />
)

export function AbaPlano({
  cat,
  recorte,
  meses,
  periodo,
  comparacao,
  abertas,
  onAbertasChange,
  carregando,
}: Props) {
  const [modo, setModo] = useState<Modo>('total')
  const noPeriodo = meses.length > 1
  const modoExibido = useDeferredValue(noPeriodo ? modo : 'total')
  // A árvore tem no máximo ~170 linhas: abrir uma conta redesenha na hora, com a
  // animação de linhas da SDK. Adiar com esqueleto faria a grade piscar a cada
  // clique — o adiamento fica para a troca de modo, que monta dezenas de colunas.
  const abertasExibidas = abertas
  const esperando = carregando || modoExibido !== (noPeriodo ? modo : 'total')

  // O consolidado de cada mês, para o mês a mês — só quando o modo pede.
  const porMes = useMemo(
    () =>
      modoExibido === 'mes'
        ? meses.map((m) => consolidar(agregarPorLoja([m], cat), recorte.naConta, cat))
        : [],
    [modoExibido, meses, cat, recorte.naConta]
  )

  const linhas = useMemo<LinhaDoPlano[]>(() => {
    const temPontas = recorte.nasDuasPontas.size > 0
    return linhasDaGrade(cat, abertasExibidas).map((linha) => {
      const atual = medir(linha, recorte.consolidado, cat)
      let difValor: number | null = null
      let varValor: number | null = null
      let varPct: number | null = null
      if (temPontas && linha.tipo !== 'secao') {
        const a = medir(linha, recorte.mesmasAtual, cat)
        const b = medir(linha, recorte.mesmasAnterior, cat)
        if (a.valor != null && b.valor != null) difValor = a.valor - b.valor
        if (a.valor != null && b.valor != null && Math.abs(b.valor) > 1e-9) {
          varValor = (a.valor - b.valor) / Math.abs(b.valor)
        }
        if (a.pct != null && b.pct != null) varPct = a.pct - b.pct
      }
      return {
        linha,
        atual,
        difValor,
        varValor,
        varPct,
        porMes: porMes.map((ag) => medir(linha, ag, cat)),
      }
    })
  }, [cat, abertasExibidas, recorte, porMes])

  const alternar = useCallback(
    (formatado: string) => {
      const proximo = new Set(abertas)
      if (proximo.has(formatado)) proximo.delete(formatado)
      else proximo.add(formatado)
      onAbertasChange(proximo)
    },
    [abertas, onAbertasChange]
  )

  const rotuloVariacao = rotuloDaVariacao(periodo, comparacao)

  // ── A GRADE EM EXCEL ──────────────────────────────────────────────────────
  //
  // O arquivo acompanha o MODO: no mês a mês são duas colunas por mês mais o
  // total do período; consolidado, o realizado com a variação ao lado.
  const colunasDaPlanilha = useMemo<ColunaPlanilha[]>(
    () => [
      { titulo: 'Código', formato: 'texto' },
      { titulo: 'Conta', formato: 'texto' },
      ...(modoExibido === 'mes'
        ? [
            ...meses.flatMap((m): ColunaPlanilha[] => [
              { titulo: `${m.rotulo} · R$`, formato: 'brl' },
              { titulo: `${m.rotulo} · %`, formato: 'pct' },
            ]),
            { titulo: 'Período · R$', formato: 'brl' as const },
            { titulo: 'Período · %', formato: 'pct' as const },
          ]
        : [
            { titulo: 'Realizado (R$)', formato: 'brl' as const },
            { titulo: '% Fat.', formato: 'pct' as const },
            // O "contra o quê" vai no título: sem ele, o arquivo não diz se a
            // variação é do período anterior ou do ano passado.
            { titulo: `Var. R$ ${rotuloVariacao} (mesmas lojas)`, formato: 'brl' as const },
            { titulo: `Var. % ${rotuloVariacao} (mesmas lojas)`, formato: 'pct' as const },
            { titulo: `Δ p.p. ${rotuloVariacao} (mesmas lojas)`, formato: 'pp' as const },
          ]),
    ],
    [modoExibido, meses, rotuloVariacao]
  )
  const planilhaDaTabela = useCallback(
    () =>
      planilhaDaGrade(colunasDaPlanilha, linhas, (l) => [
        l.linha.tipo === 'conta'
          ? l.linha.conta.formatado
          : l.linha.tipo === 'calculado'
            ? 'calc.'
            : '',
        l.linha.tipo === 'conta'
          ? l.linha.conta.descricao
          : l.linha.tipo === 'calculado'
            ? l.linha.ind.nome
            : l.linha.titulo,
        ...(modoExibido === 'mes'
          ? [
              ...meses.flatMap((_, i): Celula[] => [
                l.porMes[i]?.valor ?? null,
                l.porMes[i]?.pct ?? null,
              ]),
              l.atual.valor,
              l.atual.pct,
            ]
          : [l.atual.valor, l.atual.pct, l.difValor, l.varValor, l.varPct]),
      ]),
    [colunasDaPlanilha, linhas, modoExibido, meses]
  )

  const colunas = useMemo<ColumnDef<LinhaDoPlano, unknown>[]>(() => {
    const colunaConta: ColumnDef<LinhaDoPlano, unknown> = {
      id: 'conta',
      header: 'Conta',
      accessorFn: (l) => l.linha.chave,
      // `size` é o que a pinagem usa para o deslocamento sticky.
      size: 320,
      // ☠️ O código da conta não é valor — e é a única coluna com `accessorFn` que
      // devolve número (os valores são desenhados pelo `cell`). Foi ela que acendeu
      // a calculadora da alpha.66, que só somava o "2" de "2 MATERIA PRIMA". Com o
      // código fora, a grade fica sem o botão, como antes da alpha.66.
      meta: { width: 320, mobile: 'primary', calculadora: false },
      cell: ({ row }) => (
        <ContaNaArvore
          linha={row.original.linha}
          cat={cat}
          aberta={
            row.original.linha.tipo === 'conta' &&
            abertasExibidas.has(row.original.linha.conta.formatado)
          }
          onAlternar={alternar}
        />
      ),
    }
    const valorCel = (m: Medida | undefined, l: LinhaGrade) =>
      l.tipo === 'secao' || !m ? (
        ''
      ) : m.valor == null ? (
        <span className="text-muted-foreground">—</span>
      ) : (
        <span className={cn('tabular-nums', m.valor < 0 && 'text-destructive')}>
          {fmtValor(m.valor)}
        </span>
      )
    const pctCel = (m: Medida | undefined, l: LinhaGrade, barra: boolean) =>
      l.tipo === 'secao' || !m ? (
        ''
      ) : (
        <span className="flex items-center justify-end gap-2">
          {barra && m.unidade === 'pct' && m.valor != null && m.pct != null && (
            <BarraDoPercentual linha={l} pct={m.pct} />
          )}
          <span className="tabular-nums">{textoDoPct(m)}</span>
        </span>
      )

    if (modoExibido === 'mes') {
      return [
        colunaConta,
        ...meses.map<ColumnDef<LinhaDoPlano, unknown>>((m, i) => ({
          id: `mes-${i}`,
          header: () => <span className="block whitespace-nowrap">{m.rotulo}</span>,
          columns: [
            {
              id: `${i}-valor`,
              header: 'R$',
              meta: { width: 120 },
              cell: ({ row }) => valorCel(row.original.porMes[i], row.original.linha),
            },
            {
              id: `${i}-pct`,
              header: '%',
              meta: { width: 76 },
              cell: ({ row }) => pctCel(row.original.porMes[i], row.original.linha, false),
            },
          ],
        })),
        {
          id: 'total',
          header: () => <span className="block whitespace-nowrap text-primary">Período</span>,
          columns: [
            {
              id: 'total-valor',
              header: 'R$',
              meta: { width: 130 },
              cell: ({ row }) => valorCel(row.original.atual, row.original.linha),
            },
            {
              id: 'total-pct',
              header: '%',
              meta: { width: 80 },
              cell: ({ row }) => pctCel(row.original.atual, row.original.linha, false),
            },
          ],
        },
      ]
    }

    return [
      colunaConta,
      {
        id: 'valor',
        header: 'Realizado (R$)',
        meta: { width: 150, mobile: 'primary' },
        cell: ({ row }) => valorCel(row.original.atual, row.original.linha),
      },
      {
        id: 'pct',
        header: '% Fat.',
        meta: { width: 140, mobile: 'primary' },
        cell: ({ row }) => pctCel(row.original.atual, row.original.linha, true),
      },
      {
        id: 'var-reais',
        header: () => (
          <Tooltip
            content={`Quanto o valor mudou em reais ${rotuloVariacao}, nas mesmas lojas — o GAP em reais do BI mensal`}
          >
            <span className="cursor-help">Var. R$</span>
          </Tooltip>
        ),
        meta: { width: 130 },
        cell: ({ row }) =>
          row.original.linha.tipo === 'secao' ? (
            ''
          ) : (
            <CelulaVariacao
              v={row.original.difValor}
              linha={row.original.linha}
              relativa={false}
              unidade="brl"
            />
          ),
      },
      {
        id: 'var',
        header: () => (
          <Tooltip
            content={`Variação do valor em reais ${rotuloVariacao}, em percentual do valor anterior, nas mesmas lojas`}
          >
            <span className="cursor-help">Var. %</span>
          </Tooltip>
        ),
        meta: { width: 90 },
        cell: ({ row }) =>
          row.original.linha.tipo === 'secao' ? (
            ''
          ) : (
            <CelulaVariacao
              v={row.original.varValor}
              linha={row.original.linha}
              relativa
              unidade="brl"
            />
          ),
      },
      {
        id: 'delta',
        header: () => (
          <Tooltip
            content={`Mudança do % sobre o faturamento ${rotuloVariacao}, em pontos percentuais — ou da própria razão, nas linhas de razão. Nas mesmas lojas.`}
          >
            <span className="cursor-help">Δ p.p.</span>
          </Tooltip>
        ),
        meta: { width: 96 },
        cell: ({ row }) =>
          row.original.linha.tipo === 'secao' ? (
            ''
          ) : (
            <CelulaVariacao
              v={row.original.varPct}
              linha={row.original.linha}
              relativa={false}
              unidade={row.original.atual.unidade}
            />
          ),
      },
    ]
  }, [cat, modoExibido, meses, abertasExibidas, rotuloVariacao, alternar])

  // ── A LINHA DO FATURAMENTO FICA TRAVADA NO TOPO ───────────────────────────
  //
  // O "%" de toda linha é sobre ela, e descendo a grade o denominador saía da
  // tela. O porquê e o como estão em `linha-fixa.ts`.
  const faturamento = useMemo(
    () =>
      linhas.find((l) => l.linha.tipo === 'conta' && l.linha.conta.indice === INDICE_FATURAMENTO) ??
      null,
    [linhas]
  )
  const linhaFixa = useCallback(
    () =>
      faturamento
        ? {
            ...celulasDaLinha(colunas, faturamento),
            // A coluna da conta vira RÓTULO: a célula de verdade traz a seta que
            // abre a árvore, e uma seta numa linha fixa abriria o 1 sem que a
            // linha se mexesse.
            conta: <span className="truncate font-semibold text-foreground">1 FATURAMENTO</span>,
          }
        : {},
    [colunas, faturamento]
  )

  function renderCard(l: LinhaDoPlano) {
    const linha = l.linha
    if (linha.tipo === 'secao') {
      return (
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {linha.titulo}
        </p>
      )
    }
    const conta = linha.tipo === 'conta' ? linha.conta : null
    const aberta = !!conta && abertasExibidas.has(conta.formatado)
    return (
      <div className="flex flex-col gap-2">
        <div className="flex min-w-0 items-center justify-between gap-2">
          <span className="flex min-w-0 items-baseline gap-2">
            <span className="shrink-0 font-mono text-xs text-muted-foreground">
              {conta ? conta.formatado : 'calc.'}
            </span>
            <span
              className={cn(
                'min-w-0 truncate text-foreground',
                conta?.nivel === 1 && 'font-semibold'
              )}
            >
              {conta ? conta.descricao : linha.tipo === 'calculado' ? linha.ind.nome : ''}
            </span>
          </span>
          {conta?.temFilhos && (
            // Alvo de toque de 44 px no celular (conventions §10).
            <button
              type="button"
              onClick={() => alternar(conta.formatado)}
              aria-expanded={aberta}
              className="h-11 shrink-0 rounded-md px-3 text-xs font-medium text-primary transition-colors duration-fast ease-default hover:bg-muted"
            >
              {aberta ? 'Fechar' : 'Abrir'}
            </button>
          )}
        </div>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <dt className="text-xs text-muted-foreground">Realizado</dt>
          <dd className="text-right tabular-nums">
            {l.atual.valor == null ? '—' : fmtValor(l.atual.valor)}
          </dd>
          <dt className="text-xs text-muted-foreground">% Fat.</dt>
          <dd className="text-right tabular-nums">{textoDoPct(l.atual)}</dd>
          <dt className="text-xs text-muted-foreground">Var. R$</dt>
          <dd className="text-right">
            <CelulaVariacao v={l.difValor} linha={linha} relativa={false} unidade="brl" />
          </dd>
          <dt className="text-xs text-muted-foreground">Var. % / Δ p.p.</dt>
          <dd className="flex justify-end gap-2">
            <CelulaVariacao v={l.varValor} linha={linha} relativa unidade="brl" />
            <CelulaVariacao v={l.varPct} linha={linha} relativa={false} unidade={l.atual.unidade} />
          </dd>
        </dl>
      </div>
    )
  }

  const legenda = (
    <Tooltip
      content={
        <div className="flex max-w-[19rem] flex-col gap-1 text-left text-xs">
          <p>
            <span className="font-semibold">% Fat.</span> é a parte da conta no faturamento das
            mesmas operações; nas razões (rentabilidade, motoboy/delivery…), é a própria razão.
          </p>
          <p>
            <span className="font-semibold">Var. R$</span>,{' '}
            <span className="font-semibold">Var. %</span> e{' '}
            <span className="font-semibold">Δ p.p.</span> comparam {rotuloVariacao}, só nas lojas
            com plano nos dois períodos: quanto mudou em reais, quanto isso é sobre o valor anterior
            e quanto mudou o % sobre o faturamento. Verde é a favor (receita e lucro subindo, custo
            caindo), vermelho é contra.
          </p>
          <p>
            Passe o ponteiro sobre um indicador com <Info className="inline h-3 w-3" /> para ver de
            quais contas ele é feito.
          </p>
        </div>
      }
    >
      <button
        type="button"
        aria-label="Como ler a grade"
        className="rounded-full text-muted-foreground transition-colors duration-fast ease-default hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Info className="h-4 w-4" aria-hidden />
      </button>
    </Tooltip>
  )

  const controles = (
    <div
      className="grid w-full grid-cols-2 gap-2 @3xl:flex @3xl:w-auto @3xl:flex-wrap @3xl:items-center"
      data-tour="plano-controles"
    >
      <AbrirAte cat={cat} abertas={abertas} onAbertasChange={onAbertasChange} />
      {noPeriodo && (
        <Escolha<Modo>
          value={modo}
          onChange={setModo}
          ariaLabel="Total do período ou mês a mês"
          rotulo="Colunas"
          options={[
            { value: 'total', label: 'Período', tooltip: 'O total do período, com a variação' },
            { value: 'mes', label: 'Mês a mês', tooltip: 'Um grupo de colunas por mês' },
          ]}
        />
      )}
    </div>
  )

  const comPlano = [...recorte.naConta].filter((r) => recorte.porLoja.has(r)).length

  return (
    // ☠️ `relative` SEM `contain-layout`. O `relative` é o que segura os
    // elementos `absolute` da grade (o `sr-only` das tabelas e as alças de
    // redimensionar coluna do `DataReport`), que sem um ancestral posicionado
    // tomam a moldura da página e vazam para o `<main>` do portal — a "rolagem
    // fantasma" de 286 px medida em 18/09/2026.
    //
    // `contain: layout` também a segurava, mas NÃO PODE ficar aqui: ele vira
    // bloco de contenção para `position: fixed`, e a tela cheia da SDK é um
    // `fixed inset-0` (não um portal). Com a contenção, "Expandir em tela
    // cheia" abria a grade dentro da aba, fora da vista (medido em
    // 21/09/2026).
    <DicaDaGrade className="relative h-full">
      <DataReport
        title="Plano de contas consolidado"
        titleExtra={legenda}
        actions={
          <BotaoExportar
            planilha={planilhaDaTabela}
            titulo={
              modoExibido === 'mes' ? 'Plano de contas mês a mês' : 'Plano de contas consolidado'
            }
          />
        }
        subtitle={
          recorte.naConta.size === 0
            ? 'Nenhuma operação na conta.'
            : `${plural(comPlano, 'operação com plano', 'operações com plano')} · ${
                modoExibido === 'mes' ? 'mês a mês' : `variação ${rotuloVariacao}, nas mesmas lojas`
              }`
        }
        data={esperando ? [] : recorte.naConta.size === 0 ? [] : linhas}
        columns={colunas}
        loading={esperando}
        fillHeight
        enableSorting={false}
        animateRows
        getRowId={(l) => l.linha.chave}
        pageSize={200}
        countNoun="linhas"
        filters={controles}
        columnPinning={{ left: ['conta'] }}
        summaryRow={linhaFixa}
        // O fundo é só o da seção: as demais linhas seguem o listrado da grade. Até
        // 30/09/2026 as contas de nível 1 e os dois lucros tinham fundo azul, que cobria
        // o listrado — e a coluna Conta, fixada, continuava listrada, então a mesma linha
        // tinha dois fundos. O Davi pediu as linhas iguais, "com esse listrado". O
        // destaque dessas contas fica no negrito.
        rowClassName={(l) => (l.linha.tipo === 'secao' ? 'bg-muted' : undefined)}
        renderCard={renderCard}
        emptyState={vazio}
      />
    </DicaDaGrade>
  )
}
