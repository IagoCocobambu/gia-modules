import { useLayoutEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { AlertTriangle, ChartColumn, ChartPie, CreditCard, RefreshCw, X } from 'lucide-react'
import {
  Badge,
  Button,
  DataReport,
  EmptyState,
  TourReplayButton,
  WidthFrame,
  nomeArquivoExport,
  toast,
  type ColumnDef,
} from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'
import { useTourReplayTrigger } from '@gia-cb/sdk/modules'
import { useCanAccess } from '@gia-cb/sdk/permissions'
import { useLojasPagamentoEcheck, usePagamentosEcheck } from '../api/pagamento-echeck'
import { Dica } from '../components/Dica'
import { FiltrosBar, type FiltrosValor } from '../components/FiltrosBar'
import { GraficosDialog } from '../components/GraficosDialog'
import { Recolhivel } from '../components/Recolhivel'
import { ResumoCards } from '../components/ResumoCards'
import {
  aprovada,
  COLUNAS,
  formatBRL,
  formatDataHora,
  formatHora,
  HORA_FIM_PADRAO,
  HORA_INICIO_PADRAO,
  hojeLocal,
  NOME_DO_TOTAL,
  NOME_MODULO,
  periodoArquivo,
  preencherPlanilha,
  resumir,
  rotuloModalidade,
  somarDias,
  transacoesDoTotal,
  validarFiltro,
} from '../helpers'
import type { Consulta, FiltroTotal, Transacao } from '../types'

/** Abaixo desta largura (px) a tela usa o layout de celular — o mesmo corte do
 *  `DataReport` (`@3xl` = 48rem), que vira lista de cards nesse ponto. */
const LARGURA_COMPACTA = 768
/** A partir desta largura (px) da área, o título e os 6 controles de filtro cabem
 *  numa linha só; abaixo (e acima do celular), os filtros vão em duas linhas. */
const LARGURA_FILTROS_UMA_LINHA = 1200

/** Em telas com esta altura ou mais a barra de totais abre sozinha (fora do celular);
 *  abaixo, fica fechada para sobrar espaço à tabela — até o usuário usar "Totais". */
const MQ_TELA_ALTA = '(min-height: 700px)'

function assinarTelaAlta(aoMudar: () => void) {
  const mq = window.matchMedia(MQ_TELA_ALTA)
  mq.addEventListener('change', aoMudar)
  return () => mq.removeEventListener('change', aoMudar)
}

function useTelaAlta(): boolean {
  return useSyncExternalStore(
    assinarTelaAlta,
    () => window.matchMedia(MQ_TELA_ALTA).matches,
    () => false
  )
}

/**
 * Sem linhas, a tabela vai sem colunas: o `DataReport` desenha o estado vazio numa
 * `<td colSpan>` DENTRO da tabela, e com as colunas no cabeçalho o aviso pode
 * centralizar fora da área visível.
 */
const SEM_COLUNAS: ColumnDef<Transacao, unknown>[] = []

/**
 * Botões da toolbar do `DataReport`: entre @lg e @5xl ficam só com ícone (o
 * tooltip e o `aria-label` dizem o nome). Em tela de toque o rótulo fica sempre
 * visível — lá não há tooltip (padrão do workspace).
 */
const BOTAO_TOOLBAR = 'px-2.5 @max-lg:px-4 @5xl:px-4 [@media(hover:none)]:px-4'
const ROTULO_TOOLBAR = '@lg:hidden @5xl:inline [@media(hover:none)]:inline'

/** Campos da face do card no celular; o resto fica em "ver mais". */
const CAMPOS_CARD = new Set<string>(['dataHora', 'modalidade', 'status', 'valor'])

/** Colunas que nascem desligadas (as que o legado não mostrava de cara). */
const COLUNAS_INATIVAS: Record<string, false> = Object.fromEntries(
  COLUNAS.filter((c) => !c.visivel).map((c) => [c.id, false as const])
)

/** Barra de rolagem fina para o que rola dentro da tela (a mesma dos outros módulos). */
const SCROLLBAR_ELEGANTE = [
  '[&_*::-webkit-scrollbar]:size-2.5',
  '[&_*::-webkit-scrollbar-track]:rounded-full',
  '[&_*::-webkit-scrollbar-track]:bg-border/50',
  '[&_*::-webkit-scrollbar-corner]:bg-transparent',
  '[&_*::-webkit-scrollbar-thumb]:rounded-full',
  '[&_*::-webkit-scrollbar-thumb]:border-2',
  '[&_*::-webkit-scrollbar-thumb]:border-solid',
  '[&_*::-webkit-scrollbar-thumb]:border-transparent',
  '[&_*::-webkit-scrollbar-thumb]:bg-clip-padding',
  '[&_*::-webkit-scrollbar-thumb]:bg-muted-foreground/50',
  '[&_*::-webkit-scrollbar-thumb:hover]:bg-muted-foreground/70',
  '[@supports_not_selector(::-webkit-scrollbar)]:[&_*]:[scrollbar-width:thin]',
].join(' ')

/**
 * Largura (px) da ÁREA da tela. Mede o elemento — não a janela — pelo mesmo motivo
 * do `DataReport`: o seletor de Viewport do dev-shell e painéis estreitos do portal
 * limitam a largura do módulo sem mudar a janela. `0` antes da primeira medida.
 */
function useLarguraArea(el: HTMLElement | null): number {
  const [largura, setLargura] = useState(0)
  useLayoutEffect(() => {
    if (!el || typeof ResizeObserver === 'undefined') return
    const medir = (w: number) => setLargura(w)
    medir(el.getBoundingClientRect().width)
    const ro = new ResizeObserver((entries) => medir(entries[0]?.contentRect.width ?? 0))
    ro.observe(el)
    return () => ro.disconnect()
  }, [el])
  return largura
}

/** `01/10/2026 08:00 a 05/10/2026 23:59` — a faixa exata que foi consultada. */
function faixaDaConsulta(c: Consulta): string {
  const data = (d: string) => formatDataHora(d)
  return `${data(c.de)} ${formatHora(c.horaInicio)} a ${data(c.ate)} ${formatHora(c.horaFim, true)}`
}

const vazio = <span className="text-muted-foreground">—</span>

async function exportarXlsx(
  linhas: Transacao[],
  consulta: Consulta,
  totalPesquisa: number,
  /** Nome do card de totais que filtra a tabela, se houver. */
  filtroTotal: string | null
) {
  const { Workbook } = await import('exceljs')
  const wb = new Workbook()
  wb.creator = NOME_MODULO
  const plural = (n: number) =>
    `${n.toLocaleString('pt-BR')} ${n === 1 ? 'transação' : 'transações'}`
  const filtro =
    linhas.length < totalPesquisa || filtroTotal
      ? ` · filtrado${filtroTotal ? ` (${filtroTotal})` : ''}: ${linhas.length.toLocaleString('pt-BR')} de ${plural(totalPesquisa)}`
      : ''
  preencherPlanilha(wb.addWorksheet('Transações'), linhas, COLUNAS, {
    lojaNome: consulta.lojaNome,
    faixa: faixaDaConsulta(consulta),
    descricao: `${plural(linhas.length)}${filtro}`,
  })
  const buffer = await wb.xlsx.writeBuffer()
  const url = URL.createObjectURL(
    new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
  )
  const a = document.createElement('a')
  a.href = url
  a.download = nomeArquivoExport({
    modulo: NOME_MODULO,
    detalhe: consulta.lojaNome,
    periodo: periodoArquivo(consulta.de, consulta.ate),
    extensao: 'xlsx',
  })
  a.click()
  URL.revokeObjectURL(url)
}

export function PagamentoEcheckView() {
  const canView = useCanAccess('pagamento-echeck.ler')
  const canExport = useCanAccess('pagamento-echeck.exportar')
  const replayTour = useTourReplayTrigger('pagamento-echeck')

  // Como no legado: ontem → ontem, das 08:00 às 23:59.
  const ontem = somarDias(hojeLocal(), -1)
  const [filtros, setFiltros] = useState<FiltrosValor>({
    empresaId: null,
    de: ontem,
    ate: ontem,
    horaInicio: HORA_INICIO_PADRAO,
    horaFim: HORA_FIM_PADRAO,
  })
  // Snapshot do clique em "Pesquisar": mudar o formulário sem pesquisar de novo não
  // troca a tabela nem o nome do Excel.
  const [consulta, setConsulta] = useState<Consulta | null>(null)
  const [graficosAbertos, setGraficosAbertos] = useState(false)
  // Card da barra de totais que filtra a tabela (clique no card).
  const [filtroTotal, setFiltroTotal] = useState<FiltroTotal | null>(null)

  const [area, setArea] = useState<HTMLDivElement | null>(null)
  const largura = useLarguraArea(area)
  const compacto = largura > 0 && largura < LARGURA_COMPACTA
  const filtrosDuasLinhas = largura >= LARGURA_COMPACTA && largura < LARGURA_FILTROS_UMA_LINHA
  // Barra de totais: aberta em tela alta fora do celular, até o usuário clicar em
  // "Totais"; daí em diante vale a escolha dele.
  const telaAlta = useTelaAlta()
  const [totaisEscolhidos, setTotaisEscolhidos] = useState<boolean | null>(null)
  const totaisAbertos = totaisEscolhidos ?? (telaAlta && !compacto)

  const lojasQuery = useLojasPagamentoEcheck(canView)
  const lojas = useMemo(() => lojasQuery.data ?? [], [lojasQuery.data])
  // Sem escolha do usuário, vale a primeira loja da lista (como no legado).
  const empresaIdSelecionada = filtros.empresaId ?? lojas[0]?.empresaId ?? null

  const pagamentosQuery = usePagamentosEcheck(
    consulta
      ? {
          empresaId: consulta.empresaId,
          de: consulta.de,
          ate: consulta.ate,
          horaInicio: consulta.horaInicio,
          horaFim: consulta.horaFim,
        }
      : null
  )
  const transacoes = useMemo(() => pagamentosQuery.data?.transacoes ?? [], [pagamentosQuery.data])
  const carregando = pagamentosQuery.isFetching
  const erro = pagamentosQuery.error ?? lojasQuery.error
  const painelDisponivel = consulta !== null && !erro
  const resumo = useMemo(
    () => (pagamentosQuery.data ? resumir(transacoes) : null),
    [pagamentosQuery.data, transacoes]
  )
  // A tabela: as transações do card escolhido (se houver). Os totais, os gráficos e
  // os cards seguem da pesquisa inteira.
  const transacoesVisao = useMemo(
    () => (filtroTotal ? transacoesDoTotal(transacoes, filtroTotal) : transacoes),
    [transacoes, filtroTotal]
  )

  const semAlteracao =
    consulta !== null &&
    consulta.empresaId === empresaIdSelecionada &&
    consulta.de === filtros.de &&
    consulta.ate === filtros.ate &&
    consulta.horaInicio === filtros.horaInicio &&
    consulta.horaFim === filtros.horaFim

  /** Dispara a pesquisa. Devolve `false` quando ela foi recusada (filtro inválido). */
  function pesquisar(): boolean {
    if (semAlteracao) return false
    const loja = lojas.find((l) => l.empresaId === empresaIdSelecionada)
    if (!loja) {
      toast.error('Selecione uma loja antes de consultar.')
      return false
    }
    const msg = validarFiltro(filtros.de, filtros.ate, filtros.horaInicio, filtros.horaFim)
    if (msg) {
      toast.error(msg)
      return false
    }
    setFiltroTotal(null)
    setConsulta({
      empresaId: loja.empresaId,
      lojaNome: loja.nome,
      de: filtros.de,
      ate: filtros.ate,
      horaInicio: filtros.horaInicio,
      horaFim: filtros.horaFim,
    })
    return true
  }

  const colunas = useMemo<ColumnDef<Transacao, unknown>[]>(
    () =>
      COLUNAS.map((c): ColumnDef<Transacao, unknown> => {
        const base = {
          id: c.id,
          header: c.header,
          meta: CAMPOS_CARD.has(c.id) ? { mobile: 'primary' as const } : undefined,
        }
        if (c.id === 'dataHora' || c.id === 'aberturaMesa') {
          const id = c.id
          return {
            ...base,
            // Valor da coluna = o texto que se vê, pra busca e filtro usarem o mesmo;
            // a ordenação pelo ISO (`sortingFn`) fica cronológica.
            accessorFn: (t) => (t[id] ? formatDataHora(t[id]) : ''),
            sortingFn: (a, b) => (a.original[id] ?? '').localeCompare(b.original[id] ?? ''),
            cell: ({ row }) =>
              row.original[id] ? (
                <span className="whitespace-nowrap tabular-nums">
                  {formatDataHora(row.original[id])}
                </span>
              ) : (
                vazio
              ),
          }
        }
        if (c.id === 'valor') {
          return {
            ...base,
            accessorKey: 'valor',
            cell: ({ row }) => (
              <span className="whitespace-nowrap tabular-nums">
                {formatBRL(row.original.valor)}
              </span>
            ),
          }
        }
        if (c.id === 'status') {
          return {
            ...base,
            accessorKey: 'status',
            cell: ({ row }) =>
              row.original.status ? (
                <Badge variant={aprovada(row.original) ? 'success' : 'destructive'}>
                  {row.original.status}
                </Badge>
              ) : (
                vazio
              ),
          }
        }
        if (c.id === 'modalidade') {
          return {
            ...base,
            accessorFn: (t) => rotuloModalidade(t.modalidade),
            cell: ({ row }) => (
              <Badge variant="secondary">{rotuloModalidade(row.original.modalidade)}</Badge>
            ),
          }
        }
        const id = c.id
        return {
          ...base,
          accessorFn: (t) => t[id] ?? '',
          cell: ({ row }) => (row.original[id] as string | null) ?? vazio,
        }
      }),
    []
  )

  if (!canView) {
    return (
      <div className="m-6 rounded-lg border border-warning/30 bg-warning/10 p-6 text-sm text-foreground">
        Você não tem permissão para acessar o Pagamento eCheck (<code>pagamento-echeck.ler</code>).
      </div>
    )
  }

  const subtitle = consulta
    ? `${consulta.lojaNome} · ${faixaDaConsulta(consulta)}`
    : 'Transações eCheck da loja no período e na faixa de horário.'

  let emptyState
  if (erro) {
    emptyState = (
      <EmptyState
        icon={AlertTriangle}
        title="Não foi possível consultar os dados"
        description={erro.message}
        action={
          <Button
            onClick={() => {
              if (lojasQuery.isError) void lojasQuery.refetch()
              if (pagamentosQuery.isError) void pagamentosQuery.refetch()
            }}
          >
            <RefreshCw className="h-4 w-4" /> Tentar de novo
          </Button>
        }
      />
    )
  } else if (!consulta) {
    emptyState = (
      <EmptyState
        icon={CreditCard}
        title="Aguardando pesquisa"
        description="Selecione a loja, o período e o horário e clique em Pesquisar."
      />
    )
  } else {
    emptyState = (
      <EmptyState
        icon={CreditCard}
        title="Nenhuma transação"
        description="Nenhum pagamento eCheck encontrado para a loja no período e horário escolhidos."
      />
    )
  }

  const acoes = (
    <>
      {/* Filtro ligado por um card de totais: mostra qual e tira com um toque. */}
      {filtroTotal && (
        <Dica content="Tirar o filtro e voltar a ver todas as transações">
          <Button
            variant="default"
            className="max-w-full"
            aria-label={`Filtro: ${NOME_DO_TOTAL[filtroTotal]}. Tirar o filtro`}
            onClick={() => setFiltroTotal(null)}
          >
            <span className="truncate">{NOME_DO_TOTAL[filtroTotal]}</span>
            <X className="h-4 w-4 shrink-0" />
          </Button>
        </Dica>
      )}
      <Dica content={totaisAbertos ? 'Ocultar os totais' : 'Mostrar os totais'}>
        <Button
          variant={totaisAbertos ? 'default' : 'outline'}
          className={BOTAO_TOOLBAR}
          aria-label="Totais"
          aria-pressed={totaisAbertos}
          disabled={!painelDisponivel}
          onClick={() => setTotaisEscolhidos(!totaisAbertos)}
          data-tour="pagamento-echeck-totais"
        >
          <ChartPie className="h-4 w-4" />
          <span className={ROTULO_TOOLBAR}>Totais</span>
        </Button>
      </Dica>
      <Dica content="Abrir os gráficos por hora e por método de pagamento">
        <Button
          variant="outline"
          className={BOTAO_TOOLBAR}
          aria-label="Gráficos"
          disabled={!painelDisponivel || carregando || transacoes.length === 0}
          onClick={() => setGraficosAbertos(true)}
          data-tour="pagamento-echeck-graficos"
        >
          <ChartColumn className="h-4 w-4" />
          <span className={ROTULO_TOOLBAR}>Gráficos</span>
        </Button>
      </Dica>
    </>
  )

  return (
    // O WidthFrame desenha os botões de expandir/retrair largura FORA da sua borda:
    // nada de overflow nele (cortaria os botões) — o scroll fica na div interna.
    <WidthFrame
      className={cn('h-[calc(100vh-6.5rem)] md:h-[calc(100vh-7.5rem)]', SCROLLBAR_ELEGANTE)}
      data-tour="pagamento-echeck-frame"
    >
      {/* No celular a página tem UMA rolagem só (esta div) e a lista cresce com o
          conteúdo. No desktop só o corpo da tabela rola por dentro (fillHeight). */}
      <div
        ref={setArea}
        className={cn(
          'flex h-full flex-col gap-3',
          compacto ? 'overflow-y-auto' : 'overflow-hidden'
        )}
      >
        <FiltrosBar
          className="shrink-0"
          value={{ ...filtros, empresaId: empresaIdSelecionada }}
          onValueChange={setFiltros}
          lojas={lojas}
          lojasLoading={lojasQuery.isLoading}
          pesquisando={carregando}
          onPesquisar={pesquisar}
          semAlteracao={semAlteracao}
          compacto={compacto}
          duasLinhas={filtrosDuasLinhas}
          tituloExtra={<TourReplayButton onClick={replayTour} />}
        />

        <Recolhivel className="shrink-0" visivel={painelDisponivel && totaisAbertos}>
          <ResumoCards
            resumo={resumo}
            carregando={carregando}
            filtro={filtroTotal}
            onFiltroChange={setFiltroTotal}
          />
        </Recolhivel>

        <DataReport<Transacao>
          className={cn(
            '[&_td]:whitespace-nowrap',
            '@lg:[&_[data-tour=pagamento-echeck-toolbar]]:justify-end',
            compacto ? 'shrink-0' : 'min-h-0 flex-1'
          )}
          fillHeight={!compacto}
          title="Detalhamento das transações"
          subtitle={subtitle}
          actions={acoes}
          loading={carregando}
          // Busca genérica só no celular; no desktop, os filtros de cada coluna.
          globalSearch={compacto}
          columnVisibilityToggle
          initialColumnVisibility={COLUNAS_INATIVAS}
          fullscreenToggle={!compacto}
          emptyState={emptyState}
          toolbarTourId="pagamento-echeck-toolbar"
          data={erro ? [] : transacoesVisao}
          columns={!carregando && (erro || transacoes.length === 0) ? SEM_COLUNAS : colunas}
          getRowId={(t) => t.id}
          searchPlaceholder="Buscar modalidade, bandeira, conta, código…"
          countNoun="transações"
          pageSize={100}
          onExport={
            canExport && consulta && pagamentosQuery.data
              ? (visiveis) =>
                  exportarXlsx(
                    visiveis,
                    consulta,
                    transacoes.length,
                    filtroTotal ? NOME_DO_TOTAL[filtroTotal] : null
                  )
              : undefined
          }
        />
      </div>

      <GraficosDialog
        aberto={graficosAbertos}
        transacoes={transacoes}
        descricao={subtitle}
        onFechar={() => setGraficosAbertos(false)}
      />
    </WidthFrame>
  )
}
