import { useCallback, useMemo, useState } from 'react'
import { DataReport, Tooltip, type ColumnDef } from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'
import { Info } from 'lucide-react'
import {
  classeDoGap,
  classeDoImpacto,
  textoDaMedida,
  textoDoGap,
  textoDoImpacto,
} from '../analises-formato'
import {
  planoDaUnidade,
  ROTULO_NO_BI,
  type LinhaDoPlanoDaLoja,
  type UnidadeComAgregado,
} from '../analises'
import type { Catalogo } from '../catalogo'
import { fmtDiferenca, fmtValor, TRACO } from '../formato'
import { abertasAteNivel, direcaoDaLinha, type Medida } from '../grade'
import type { Agregado } from '../matriz'
import { planilhaDaGrade, type Celula, type ColunaPlanilha } from '../planilha'
import { AbrirAte } from './AbrirAte'
import { BotaoExportar } from './BotaoExportar'
import { ContaNaArvore } from './ContaNaArvore'
import { DicaDaGrade } from './DicaDaGrade'
import { Escolha } from './Escolha'
import { SeloDoOrcamento } from './SeloDoOrcamento'

// O PLANO DE CONTAS INTEIRO DA LOJA — a aba Análise Comparativa do BI mensal:
// cada conta da unidade escolhida com o realizado, o ano passado, o orçado, a
// média das lojas consultadas, o impacto em reais e a melhor loja. As contas
// estão em `planoDaUnidade` (`src/analises.ts`); aqui só se desenha.
//
// ── A ÁRVORE DA ABA PLANO DE CONTAS ─────────────────────────────────────────
//
// As mesmas linhas, a mesma seta e o mesmo "Abrir até". Abre no nível 1 — as
// sete raízes e os indicadores —, porque a aba já rola como página, e as 190
// linhas do nível 3 seriam uma parede de números no meio dela. A planilha
// baixada leva TODAS as contas, abertas até o nível 3, como a do BI.
//
// ── SEM PAGINAÇÃO ───────────────────────────────────────────────────────────
//
// Uma árvore paginada troca de página sozinha a cada conta aberta (a grade
// volta à primeira página quando os dados mudam). A página cresce com a árvore,
// e a tela cheia da grade mostra tudo.

interface Props {
  cat: Catalogo
  /** O realizado da unidade, ou o consolidado quando é a seleção inteira. */
  alvo: Agregado
  anoPassado: Agregado | null
  orcado: Agregado | null
  unidades: readonly UnidadeComAgregado[]
  consolidado: Agregado
  /** O nome da unidade escolhida, ou "Seleção". */
  titulo: string
  rotuloPeriodo: string
}

/** A página da grade: maior que qualquer plano aberto, é "todas". */
const TODAS_AS_LINHAS = 1_000

const SELO =
  'As colunas Orçado são o orçamento que a loja lançou no Plano de Orçamentos para o mesmo período.'

function textoDoValor(m: Medida | null): string {
  return m?.valor == null ? TRACO : fmtValor(m.valor)
}

/** Diferença entre os valores em reais de duas medidas. */
function dif(a: Medida | null, b: Medida | null): number | null {
  return a?.valor == null || b?.valor == null ? null : a.valor - b.valor
}

/**
 * As duas leituras da grade. A planilha do BI põe R$ e % lado a lado para cada
 * coluna; com os dois, a grade passava do cartão mesmo a 1440 px (1.397 px para
 * 1.259 — medido em 29/09/2026). Cada leitura cabe inteira, e a planilha
 * baixada leva as duas.
 */
type Mostrar = 'percentual' | 'reais'

export function PlanoDaLoja({
  cat,
  alvo,
  anoPassado,
  orcado,
  unidades,
  consolidado,
  titulo,
  rotuloPeriodo,
}: Props) {
  const [abertas, setAbertas] = useState<ReadonlySet<string>>(() => abertasAteNivel(cat, 1))
  const [mostrar, setMostrar] = useState<Mostrar>('percentual')

  const linhas = useMemo(
    () => planoDaUnidade({ cat, abertas, alvo, anoPassado, orcado, unidades, consolidado }),
    [cat, abertas, alvo, anoPassado, orcado, unidades, consolidado]
  )

  const alternar = useCallback((formatado: string) => {
    setAbertas((atual) => {
      const proximo = new Set(atual)
      if (proximo.has(formatado)) proximo.delete(formatado)
      else proximo.add(formatado)
      return proximo
    })
  }, [])

  const colunas = useMemo<ColumnDef<LinhaDoPlanoDaLoja, unknown>[]>(() => {
    const secao = (l: LinhaDoPlanoDaLoja) => l.linha.tipo === 'secao'
    const valor = (m: Medida | null, l: LinhaDoPlanoDaLoja, forte = false) =>
      secao(l) ? (
        ''
      ) : m?.valor == null ? (
        <span className="text-muted-foreground">{TRACO}</span>
      ) : (
        <span
          className={cn('tabular-nums', forte && 'font-medium', m.valor < 0 && 'text-destructive')}
        >
          {fmtValor(m.valor)}
        </span>
      )
    const pct = (m: Medida | null, l: LinhaDoPlanoDaLoja, forte = false) =>
      secao(l) ? (
        ''
      ) : (
        <span className={cn('tabular-nums', forte && 'font-medium')}>
          {m ? textoDaMedida(m.pct, m.unidade) : TRACO}
        </span>
      )
    const gap = (v: number | null, l: LinhaDoPlanoDaLoja) =>
      secao(l) ? (
        ''
      ) : (
        <span
          className={cn('whitespace-nowrap tabular-nums', classeDoGap(v, direcaoDaLinha(l.linha)))}
        >
          {textoDoGap(v, l.realizado.unidade)}
        </span>
      )
    /** Diferença em reais, colorida pela direção da linha. */
    const diferenca = (v: number | null, l: LinhaDoPlanoDaLoja) =>
      secao(l) ? (
        ''
      ) : (
        <span
          className={cn(
            'whitespace-nowrap tabular-nums',
            classeDoGap(v, direcaoDaLinha(l.linha), 0.005)
          )}
        >
          {fmtDiferenca('brl', v)}
        </span>
      )
    const cabecalho = (texto: string, dica: string) => () => (
      <Tooltip content={dica}>
        <span className="cursor-help">{texto}</span>
      </Tooltip>
    )

    const conta: ColumnDef<LinhaDoPlanoDaLoja, unknown> = {
      id: 'conta',
      header: 'Conta',
      size: 300,
      // O código da conta não é valor: a calculadora da SDK não o soma.
      meta: { width: 300, mobile: 'primary', calculadora: false },
      cell: ({ row }) => (
        <ContaNaArvore
          linha={row.original.linha}
          cat={cat}
          aberta={
            row.original.linha.tipo === 'conta' && abertas.has(row.original.linha.conta.formatado)
          }
          onAlternar={alternar}
          dicaDoNome
        />
      ),
    }
    const orcadoTitulo = (texto: string) => () => (
      <span className="inline-flex items-center gap-1">
        {texto}
        <SeloDoOrcamento detalhe={SELO} />
      </span>
    )

    if (mostrar === 'reais') {
      return [
        conta,
        {
          id: 'realizado-valor',
          header: cabecalho('Realizado', `A loja em ${rotuloPeriodo}, em reais`),
          meta: { width: 124 },
          cell: ({ row }) => valor(row.original.realizado, row.original, true),
        },
        {
          id: 'ano-valor',
          header: cabecalho('Ano passado', 'Os mesmos meses, um ano antes, em reais'),
          meta: { width: 124 },
          cell: ({ row }) => valor(row.original.anoPassado, row.original),
        },
        {
          id: 'var-ano',
          header: cabecalho(
            'Var. R$',
            'Realizado menos ano passado, em reais. Verde a favor, vermelho contra.'
          ),
          meta: { width: 116 },
          cell: ({ row }) =>
            diferenca(dif(row.original.realizado, row.original.anoPassado), row.original),
        },
        {
          id: 'orcado-valor',
          header: orcadoTitulo('Orçado'),
          meta: { width: 124 },
          cell: ({ row }) => valor(row.original.orcado, row.original),
        },
        // ── O GAP É SEMPRE CONTRA A MELHOR ────────────────────────────────────
        //
        // Até 30/09/2026 estas duas colunas eram contra o ORÇADO, e trocar de
        // Percentual para Reais trocava a referência do gap sem o cabeçalho
        // dizer. O Davi: "tem que ser sempre o gap para o melhor, tanto em % como
        // em valor". O orçado continua como valor, na coluna ao lado, e contra
        // ele o Resultado da loja tem a leitura Contra: Orçado.
        {
          id: 'gap-melhor-reais',
          header: cabecalho(
            'Gap p/ melhor R$',
            'Quanto a linha mudaria em reais se a loja tivesse o percentual da melhor no indicador: os pontos de diferença × o faturamento da loja. Os reais da melhor não entram, porque são de outra loja, de outro tamanho.'
          ),
          meta: { width: 132 },
          cell: ({ row }) => diferenca(row.original.gapMelhorReais, row.original),
        },
        {
          id: 'gap-melhor-pp',
          header: cabecalho(
            'Gap p/ melhor',
            'O percentual da loja menos o da melhor no indicador, em pontos — a coluna GAP P/ MELHOR do BI, a mesma da leitura Percentual'
          ),
          meta: { width: 116 },
          cell: ({ row }) => gap(row.original.gapMelhor, row.original),
        },
      ]
    }

    return [
      conta,
      {
        id: 'realizado-pct',
        header: cabecalho(
          'Realizado',
          `A loja em ${rotuloPeriodo}, em percentual do faturamento — a coluna 2026 do BI`
        ),
        meta: { width: 96 },
        cell: ({ row }) => pct(row.original.realizado, row.original, true),
      },
      {
        id: 'ano-pct',
        header: cabecalho('Ano passado', 'Os mesmos meses, um ano antes — a coluna 2025 do BI'),
        meta: { width: 110 },
        cell: ({ row }) => pct(row.original.anoPassado, row.original),
      },
      {
        id: 'orcado-pct',
        header: orcadoTitulo('Orçado'),
        meta: { width: 96 },
        cell: ({ row }) => pct(row.original.orcado, row.original),
      },
      {
        id: 'media',
        header: cabecalho(
          'Média',
          'O índice das lojas consultadas: a linha somada dividida pelo faturamento somado'
        ),
        meta: { width: 88 },
        cell: ({ row }) => pct(row.original.media, row.original),
      },
      {
        id: 'gap-media',
        header: 'Gap p/ média',
        meta: { width: 110 },
        cell: ({ row }) => gap(row.original.gapMedia, row.original),
      },
      {
        id: 'impacto',
        header: cabecalho(
          'Impacto R$',
          'Quanto o resultado mudaria em reais se a linha tivesse o percentual da média — o IMPACTO R$ do BI. Positivo: o que a loja gasta a mais que a média; negativo: o que ela já economiza.'
        ),
        meta: { width: 108 },
        cell: ({ row }) =>
          secao(row.original) ? (
            ''
          ) : (
            <span
              className={cn(
                'whitespace-nowrap tabular-nums',
                classeDoImpacto(row.original.impacto)
              )}
            >
              {textoDoImpacto(row.original.impacto)}
            </span>
          ),
      },
      {
        id: 'melhor',
        header: cabecalho(
          'Melhor no indicador',
          'A loja com o melhor percentual NO INDICADOR a que a conta pertence (nas contas de matéria-prima, a de melhor CMV corrigido), e o número dela nesta conta — a coluna MELHOR 2026 do BI. Conta que não pertence a nenhum dos sete indicadores fica sem.'
        ),
        meta: { width: 160 },
        cell: ({ row }) => {
          const l = row.original
          if (secao(l)) return ''
          if (!l.melhor) return <span className="text-muted-foreground">{TRACO}</span>
          return (
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="tabular-nums">
                {textoDaMedida(l.melhor.medida.pct, l.melhor.medida.unidade)}
              </span>
              {/* ☠️ `max-w` não é estética: `meta.width` é PISO, e sem teto o
                  nome mais longo da rede alargaria a coluna além do cartão. */}
              <Tooltip content={l.melhor.nome}>
                <span className="block max-w-[8.5rem] truncate text-[11px] text-muted-foreground">
                  {l.melhor.nome}
                </span>
              </Tooltip>
            </span>
          )
        },
      },
      {
        id: 'gap-melhor',
        header: 'Gap p/ melhor',
        meta: { width: 116 },
        cell: ({ row }) => gap(row.original.gapMelhor, row.original),
      },
    ]
  }, [cat, abertas, alternar, rotuloPeriodo, mostrar])

  // ── A PLANILHA LEVA O PLANO INTEIRO ───────────────────────────────────────
  //
  // Todas as contas até o nível 3, com o R$ e o % de cada lado, como a Análise
  // Comparativa do BI — e não só as linhas abertas na tela.
  const planilha = useCallback(() => {
    const todas = planoDaUnidade({
      cat,
      abertas: abertasAteNivel(cat, 3),
      alvo,
      anoPassado,
      orcado,
      unidades,
      consolidado,
    })
    const colunasDaPlanilha: ColunaPlanilha[] = [
      { titulo: 'Código', formato: 'texto' },
      { titulo: 'Conta', formato: 'texto' },
      { titulo: 'Indicador (legenda)', formato: 'texto' },
      { titulo: `Realizado ${rotuloPeriodo} (R$)`, formato: 'brl' },
      { titulo: 'Realizado %', formato: 'pct' },
      { titulo: 'Ano passado (R$)', formato: 'brl' },
      { titulo: 'Ano passado %', formato: 'pct' },
      { titulo: 'Orçado (R$)', formato: 'brl' },
      { titulo: 'Orçado %', formato: 'pct' },
      { titulo: 'Média das lojas consultadas %', formato: 'pct' },
      { titulo: 'Gap p/ média', formato: 'pp' },
      { titulo: 'Impacto R$ (vs. média)', formato: 'brl' },
      { titulo: 'Melhor no indicador', formato: 'texto' },
      { titulo: 'Melhor %', formato: 'pct' },
      { titulo: 'Gap p/ melhor', formato: 'pp' },
      { titulo: 'Gap p/ melhor R$', formato: 'brl' },
    ]
    return planilhaDaGrade(
      colunasDaPlanilha,
      todas.filter((l) => l.linha.tipo !== 'secao'),
      (l): Celula[] => {
        const conta = l.linha.tipo === 'conta' ? l.linha.conta : null
        // Percentual e p.p. só nas linhas em percentual: o formato da coluna
        // multiplicaria um múltiplo ou um número de dias por cem.
        const emPct = l.realizado.unidade === 'pct'
        const p = (m: Medida | null) => (emPct ? (m?.pct ?? null) : null)
        return [
          conta ? conta.formatado : 'calc.',
          conta ? conta.descricao : l.linha.tipo === 'calculado' ? l.linha.ind.nome : '',
          l.indicador != null ? (ROTULO_NO_BI.get(l.indicador) ?? null) : null,
          l.realizado.valor,
          p(l.realizado),
          l.anoPassado?.valor ?? null,
          p(l.anoPassado),
          l.orcado?.valor ?? null,
          p(l.orcado),
          p(l.media),
          emPct ? l.gapMedia : null,
          l.impacto,
          l.melhor?.nome ?? null,
          p(l.melhor?.medida ?? null),
          emPct ? l.gapMelhor : null,
          l.gapMelhorReais,
        ]
      },
      [
        `Loja: ${titulo}. Período: ${rotuloPeriodo}.`,
        'Orçado: o Plano de Orçamentos da loja. Média: as lojas consultadas, soma sobre soma.',
        'Melhor no indicador: a loja com o melhor percentual no indicador da linha (a legenda), e o número dela na linha — a coluna MELHOR 2026 do BI.',
        'Linhas de razão, múltiplo e dias trazem o valor em reais quando houver; o percentual fica em branco.',
      ]
    )
  }, [cat, alvo, anoPassado, orcado, unidades, consolidado, titulo, rotuloPeriodo])

  function renderCard(l: LinhaDoPlanoDaLoja) {
    const linha = l.linha
    if (linha.tipo === 'secao') {
      return (
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {linha.titulo}
        </p>
      )
    }
    const conta = linha.tipo === 'conta' ? linha.conta : null
    const aberta = !!conta && abertas.has(conta.formatado)
    const direcao = direcaoDaLinha(linha)
    const u = l.realizado.unidade
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
        {/* O rótulo com a largura DELE, e o valor com o resto — ver o cartão da
            loja. */}
        <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 text-sm">
          <dt className="text-xs text-muted-foreground">Realizado</dt>
          <dd className="text-right font-medium tabular-nums">
            {textoDoValor(l.realizado)} · {textoDaMedida(l.realizado.pct, u)}
          </dd>
          <dt className="text-xs text-muted-foreground">Ano passado</dt>
          <dd className="text-right tabular-nums">
            {l.anoPassado ? textoDaMedida(l.anoPassado.pct, u) : TRACO}
          </dd>
          <dt className="text-xs text-muted-foreground">Orçado</dt>
          <dd className="text-right tabular-nums">
            {textoDoValor(l.orcado)} · {l.orcado ? textoDaMedida(l.orcado.pct, u) : TRACO}
          </dd>
          <dt className="text-xs text-muted-foreground">Média · gap</dt>
          <dd className="flex flex-wrap justify-end gap-x-2 whitespace-nowrap tabular-nums">
            {l.media ? textoDaMedida(l.media.pct, u) : TRACO}
            <span className={classeDoGap(l.gapMedia, direcao)}>{textoDoGap(l.gapMedia, u)}</span>
          </dd>
          <dt className="text-xs text-muted-foreground">Impacto R$</dt>
          <dd className={cn('text-right tabular-nums', classeDoImpacto(l.impacto))}>
            {textoDoImpacto(l.impacto)}
          </dd>
          {l.melhor && (
            <>
              <dt className="text-xs text-muted-foreground">Melhor · gap</dt>
              <dd className="flex flex-wrap justify-end gap-x-2 whitespace-nowrap tabular-nums">
                {textoDaMedida(l.melhor.medida.pct, l.melhor.medida.unidade)}
                <span className={classeDoGap(l.gapMelhor, direcao)}>
                  {textoDoGap(l.gapMelhor, u)}
                </span>
              </dd>
              {l.gapMelhorReais != null && (
                <>
                  <dt className="text-xs text-muted-foreground">Gap p/ melhor R$</dt>
                  <dd
                    className={cn(
                      'text-right tabular-nums',
                      classeDoGap(l.gapMelhorReais, direcao, 0.005)
                    )}
                  >
                    {fmtDiferenca('brl', l.gapMelhorReais)}
                  </dd>
                </>
              )}
              <dt className="text-xs text-muted-foreground">Melhor loja</dt>
              <dd className="break-words text-right text-muted-foreground">{l.melhor.nome}</dd>
            </>
          )}
        </dl>
      </div>
    )
  }

  const legenda = (
    <Tooltip
      content={
        <div className="flex max-w-[20rem] flex-col gap-1 text-left text-xs">
          <p>
            Cada conta da loja com o <span className="font-semibold">realizado</span>, o{' '}
            <span className="font-semibold">ano passado</span> e o{' '}
            <span className="font-semibold">orçado</span>, contra a{' '}
            <span className="font-semibold">média</span> das lojas consultadas — a aba Análise
            Comparativa do BI mensal.
          </p>
          <p>
            <span className="font-semibold">Melhor no indicador</span> é a loja com o melhor
            percentual no indicador a que a conta pertence, e o número dela nesta conta: nas contas
            de matéria-prima, a de melhor CMV corrigido. Mostra de onde vem a vantagem da melhor
            loja, conta a conta.
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

  return (
    // `relative` sem `contain-layout` — a mesma razão da aba Plano de contas:
    // a contenção prenderia a tela cheia da grade dentro da aba.
    <DicaDaGrade className="relative">
      <DataReport
        title={`Plano de contas · ${titulo}`}
        titleExtra={legenda}
        subtitle={`Todas as contas em ${rotuloPeriodo}, contra o ano passado, o orçado e as lojas consultadas. A planilha leva as contas até o nível 3.`}
        filters={
          <div className="flex flex-wrap items-center gap-2">
            <AbrirAte cat={cat} abertas={abertas} onAbertasChange={setAbertas} />
            <Escolha<Mostrar>
              value={mostrar}
              onChange={setMostrar}
              ariaLabel="O que a grade mostra"
              rotulo="Mostrar"
              rotuloVisivel
              options={[
                {
                  value: 'percentual',
                  label: 'Percentual',
                  tooltip:
                    'Cada conta em percentual do faturamento, contra a média e a melhor loja — a Análise Comparativa do BI',
                },
                {
                  value: 'reais',
                  label: 'Reais',
                  tooltip:
                    'Cada conta em reais: a variação contra o ano passado, o orçado e o gap para a melhor loja',
                },
              ]}
            />
          </div>
        }
        actions={
          <BotaoExportar
            planilha={planilha}
            titulo={`Plano de contas - ${titulo}`}
            tituloDoArquivo={`Plano de contas da loja - ${titulo}`}
          />
        }
        data={linhas}
        columns={colunas}
        enableSorting={false}
        animateRows
        getRowId={(l) => l.linha.chave}
        pageSize={TODAS_AS_LINHAS}
        maxBodyHeight="none"
        countNoun="linhas"
        columnPinning={{ left: ['conta'] }}
        // O fundo é só o da seção: as demais linhas seguem o listrado da grade. Até
        // 30/09/2026 as contas de nível 1 e os dois lucros tinham fundo azul, que cobria
        // o listrado — e a coluna Conta, fixada, continuava listrada, então a mesma linha
        // tinha dois fundos. O Davi pediu as linhas iguais, "com esse listrado". O
        // destaque dessas contas fica no negrito.
        rowClassName={(l) => (l.linha.tipo === 'secao' ? 'bg-muted' : undefined)}
        renderCard={renderCard}
      />
    </DicaDaGrade>
  )
}
