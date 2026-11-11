import { useLayoutEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react'
import { AlertTriangle, ChartPie, ReceiptText, RefreshCw, X } from 'lucide-react'
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
import { useLojasFechamentoIfood } from '../api/fechamento-ifood-diario'
import { BadgeTipoPagamento } from '../components/BadgeTipoPagamento'
import { Dica } from '../components/Dica'
import { FiltrosBar, type FiltrosValor } from '../components/FiltrosBar'
import { ProgressoConsulta } from '../components/ProgressoConsulta'
import { Recolhivel } from '../components/Recolhivel'
import { ResumoCards } from '../components/ResumoCards'
import { useConsultaDiaria } from '../hooks/use-consulta-diaria'
import {
  COLUNAS_PEDIDO,
  dataArquivo,
  formatBRL,
  formatDataHora,
  ontemLocal,
  NOME_DO_TOTAL,
  NOME_MODULO,
  pedidosDoTotal,
  preencherPlanilha,
  preencherResumo,
  resumirTotais,
  rotuloTipos,
  validarData,
} from '../helpers'
import type { Consulta, FechamentoResposta, FiltroTotal, PedidoIfood, TotaisDia } from '../types'

/** Abaixo desta largura (px) a tela usa o layout de celular — o mesmo corte do
 *  `DataReport` (`@3xl` = 48rem), que vira lista de cards nesse ponto. */
const LARGURA_COMPACTA = 768

/** Em telas com esta altura (px) ou mais a barra de totais nasce aberta. */
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

/** Mede a ÁREA do módulo (não a janela), como o `DataReport`. */
function useModoCompacto(el: HTMLElement | null): boolean {
  const [compacto, setCompacto] = useState(false)
  useLayoutEffect(() => {
    if (!el || typeof ResizeObserver === 'undefined') return
    const medir = (largura: number) => setCompacto(largura > 0 && largura < LARGURA_COMPACTA)
    medir(el.getBoundingClientRect().width)
    const ro = new ResizeObserver((entries) => medir(entries[0]?.contentRect.width ?? 0))
    ro.observe(el)
    return () => ro.disconnect()
  }, [el])
  return compacto
}

/** Sem linhas, a tabela vai sem colunas, para o estado vazio ficar centralizado. */
const SEM_COLUNAS: ColumnDef<PedidoIfood, unknown>[] = []

/** Rótulo dos botões da toolbar: some ao lado do título (@lg–@5xl), fica no toque. */
const BOTAO_TOOLBAR = 'px-2.5 @max-lg:px-4 @5xl:px-4 [@media(hover:none)]:px-4'
const ROTULO_TOOLBAR = '@lg:hidden @5xl:inline [@media(hover:none)]:inline'

/** Campos da face do card no celular; o resto fica em "ver mais". */
const CAMPOS_CARD = new Set<string>([
  'n_pedido',
  'data_de_criacao',
  'total_pago',
  'venda_concluida',
  'tipo',
])

/** Colunas obrigatórias do legado (`isMandatory`): sempre visíveis. */
const COLUNAS_OBRIGATORIAS = new Set<string>([
  'total_pago',
  'n_pedido',
  'data_de_criacao',
  'forma_de_pagamentos',
  'origem',
])

/** Colunas fora do `DEFAULT_SELECTED_COLUMNS` do legado: nascem desligadas. */
const COLUNAS_INATIVAS: Record<string, false> = Object.fromEntries(
  [
    'data_cancelamento',
    'origem_cancelamento',
    'motivo_cancelamento',
    'cancelamento_contestavel',
    'motivo_impossibilidade',
    'data_limite_contestacao',
    'confirmado_por',
    'tipo_pedido',
    'agendado',
    'cancelamento_parcial',
  ].map((id) => [id, false as const])
)

type CampoTexto = {
  [K in keyof PedidoIfood]: PedidoIfood[K] extends string ? K : never
}[keyof PedidoIfood]
type CampoNumero = {
  [K in keyof PedidoIfood]: PedidoIfood[K] extends number ? K : never
}[keyof PedidoIfood]

const vazio = <span className="text-muted-foreground">—</span>
const moeda = (v: number) => <span className="whitespace-nowrap tabular-nums">{formatBRL(v)}</span>

/** Barra de rolagem fina (a mesma do Fechamento Maestro). */
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
].join(' ')

/** Excel: aba Resumo (os cards) e aba Pedidos (todas as colunas da grade). */
async function exportarXlsx(
  pedidos: PedidoIfood[],
  totais: TotaisDia,
  consulta: Consulta,
  totalPesquisa: number,
  filtroTotal: string | null
) {
  const { Workbook } = await import('exceljs')
  const wb = new Workbook()
  wb.creator = NOME_MODULO
  const cab = { lojaNome: consulta.lojaNome, data: consulta.data, geradoEm: new Date() }
  const qtd = (n: number) => `${n.toLocaleString('pt-BR')} ${n === 1 ? 'pedido' : 'pedidos'}`
  const filtro =
    pedidos.length < totalPesquisa
      ? ` · filtrado${filtroTotal ? ` (${filtroTotal})` : ''}: ${pedidos.length.toLocaleString('pt-BR')} de ${qtd(totalPesquisa)}`
      : ''
  preencherResumo(
    wb.addWorksheet('Resumo'),
    totais,
    cab,
    `Cards do fechamento · ${qtd(totalPesquisa)} iFood (dia inteiro)`
  )
  preencherPlanilha(
    wb.addWorksheet('Pedidos'),
    pedidos,
    COLUNAS_PEDIDO,
    cab,
    `Pedidos iFood · ${qtd(pedidos.length)}${filtro}`
  )
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
    periodo: dataArquivo(consulta.data),
    extensao: 'xlsx',
  })
  a.click()
  URL.revokeObjectURL(url)
}

/** Avisos da parte do iFood: cadastro sem integração, credencial e falhas da API. */
function Avisos({ resposta }: { resposta: FechamentoResposta }) {
  const linhas = [...resposta.avisos]
  // Como no legado, sem aviso de cruzamento: pedido do DW não achado no iFood fica só
  // como Cancelado (é o caso normal das outras marcas da loja — Express, Pizzaria…), e
  // venda do iFood sem pedido no DW o legado só registrava em log de debug.
  if (linhas.length === 0) return null
  return (
    <div
      role="status"
      className="flex shrink-0 gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-foreground"
    >
      <AlertTriangle aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
      <ul className="space-y-0.5">
        {linhas.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>
    </div>
  )
}

export function FechamentoIfoodDiarioView() {
  const canView = useCanAccess('fechamento-ifood-diario.ler')
  const canExport = useCanAccess('fechamento-ifood-diario.exportar')
  const replayTour = useTourReplayTrigger('fechamento-ifood-diario')

  // O dia começa em ontem: o fechamento é do dia que já terminou.
  const [filtros, setFiltros] = useState<FiltrosValor>({ operacaoRef: null, data: ontemLocal() })
  // Foto do clique em "Pesquisar".
  const [consulta, setConsulta] = useState<Consulta | null>(null)
  const [filtroTotal, setFiltroTotal] = useState<FiltroTotal | null>(null)

  const [area, setArea] = useState<HTMLDivElement | null>(null)
  const compacto = useModoCompacto(area)
  const telaAlta = useTelaAlta()
  const [totaisEscolhidos, setTotaisEscolhidos] = useState<boolean | null>(null)
  const totaisAbertos = totaisEscolhidos ?? (telaAlta && !compacto)

  const lojasQuery = useLojasFechamentoIfood(canView)
  const lojas = useMemo(() => lojasQuery.data ?? [], [lojasQuery.data])
  // Sem escolha do usuário, vale a primeira loja da lista (como no legado).
  const refSelecionada = filtros.operacaoRef ?? lojas[0]?.ref ?? null

  // A consulta em partes (pedidos do DW + páginas do iFood em paralelo), com progresso.
  const {
    fase,
    progresso,
    resultado,
    erro: erroConsulta,
    consultar,
    cancelar,
  } = useConsultaDiaria()
  const pedidos = useMemo(() => resultado?.pedidos ?? [], [resultado])
  const carregando = fase === 'consultando'
  const erro = lojasQuery.error?.message ?? erroConsulta
  const painelDisponivel = resultado !== null && !erro
  // Resultado parcial: os pedidos já estão na tabela, o iFood ainda está chegando.
  const parcial = resultado !== null && !resultado.completo

  // Os valores do dia só com o resultado completo: parcial não vira número na tela.
  const totais = useMemo(
    () => (resultado?.completo ? resumirTotais(pedidos) : null),
    [resultado, pedidos]
  )
  const pedidosVisao = useMemo(
    () => (filtroTotal ? pedidosDoTotal(pedidos, filtroTotal) : pedidos),
    [pedidos, filtroTotal]
  )

  // Depois de um erro ou de cancelar, a mesma pesquisa pode ser repetida.
  const semAlteracao =
    consulta !== null &&
    (fase === 'consultando' || fase === 'pronto') &&
    consulta.operacaoRef === refSelecionada &&
    consulta.data === filtros.data

  /** Dispara a pesquisa. Devolve `false` quando ela foi recusada. */
  function pesquisar(): boolean {
    if (semAlteracao) return false
    const loja = lojas.find((l) => l.ref === refSelecionada)
    if (!loja) {
      toast.error('Não é possível consultar sem ter selecionado uma loja.')
      return false
    }
    const msg = validarData(filtros.data)
    if (msg) {
      toast.error(msg)
      return false
    }
    setFiltroTotal(null)
    const nova = { operacaoRef: loja.ref, lojaNome: loja.nome, data: filtros.data }
    setConsulta(nova)
    void consultar(nova)
    return true
  }

  // Ordem do `ALL_COLUMNS` do legado, sem as colunas repetidas.
  const colunas = useMemo<ColumnDef<PedidoIfood, unknown>[]>(() => {
    const base = (id: string) => ({
      id,
      meta: CAMPOS_CARD.has(id) ? { mobile: 'primary' as const } : undefined,
      enableHiding: !COLUNAS_OBRIGATORIAS.has(id),
    })
    const centro = (conteudo: ReactNode) => (
      <div className={cn('flex', !compacto && 'justify-center')}>{conteudo}</div>
    )
    const texto = (id: CampoTexto, header: string): ColumnDef<PedidoIfood, unknown> => ({
      ...base(id),
      accessorKey: id,
      header,
      cell: ({ row }) => row.original[id] || vazio,
    })
    const valor = (id: CampoNumero, header: string): ColumnDef<PedidoIfood, unknown> => ({
      ...base(id),
      accessorKey: id,
      header,
      cell: ({ row }) => moeda(row.original[id] as number),
    })
    const dataHora = (id: CampoTexto, header: string): ColumnDef<PedidoIfood, unknown> => ({
      ...base(id),
      // Valor da coluna = o que se vê, para a busca e o filtro.
      accessorFn: (p) => (p[id] ? formatDataHora(p[id] as string) : ''),
      header,
      cell: ({ row }) =>
        row.original[id] ? (
          <span className="whitespace-nowrap tabular-nums">
            {formatDataHora(row.original[id] as string)}
          </span>
        ) : (
          vazio
        ),
    })

    return [
      {
        ...base('ifood_reembolsa'),
        accessorKey: 'ifood_reembolsa',
        header: 'iFood reembolsa?',
        cell: ({ row }) => {
          const v = row.original.ifood_reembolsa
          return centro(
            <Badge
              variant={
                v === 'SIM'
                  ? 'success'
                  : v === 'NÃO'
                    ? 'secondary'
                    : v === 'VERIFICAR'
                      ? 'warning'
                      : 'outline'
              }
            >
              {v}
            </Badge>
          )
        },
      },
      valor('total_pago', 'Total do pedido'),
      valor('desconto_copart', 'Desconto copart'),
      {
        ...base('venda_concluida'),
        accessorKey: 'venda_concluida',
        header: 'Cancelamento',
        cell: ({ row }) =>
          centro(
            row.original.venda_concluida === 'Aguardando' ? (
              <Badge variant="secondary" className="whitespace-nowrap">
                Aguardando iFood
              </Badge>
            ) : (
              <Badge variant={row.original.venda_concluida === 'OK' ? 'success' : 'destructive'}>
                {row.original.venda_concluida}
              </Badge>
            )
          ),
      },
      {
        // Coluna STATUS do legado: o tipo de cada forma de pagamento.
        ...base('tipo'),
        header: 'Status',
        accessorFn: rotuloTipos,
        cell: ({ row }) =>
          row.original.tipos.length === 0
            ? vazio
            : centro(
                <div className={cn('flex flex-wrap gap-1', !compacto && 'justify-center')}>
                  {row.original.tipos.map((t) => (
                    <BadgeTipoPagamento key={t} tipo={t} />
                  ))}
                </div>
              ),
      },
      dataHora('data_calc', 'Data'),
      texto('id', 'ID do pedido'),
      {
        ...base('n_pedido'),
        accessorKey: 'n_pedido',
        header: 'Nº pedido',
        cell: ({ row }) => <span className="font-medium">{row.original.n_pedido || '—'}</span>,
      },
      dataHora('data_de_criacao', 'Data hora pedido'),
      texto('nome_loja', 'Restaurante'),
      texto('merchant_ifood', 'Restaurante no iFood'),
      texto('id_loja', 'ID do restaurante'),
      valor('valor_da_entrega', 'Taxa de entrega'),
      valor('valor_do_pedido', 'Valor dos itens'),
      valor('incentivo_parceiro', 'Incentivo promocional do iFood'),
      valor('incentivo_loja', 'Incentivo promocional da loja'),
      valor('taxa_extra_parceiro', 'Taxa de serviço'),
      valor('total_parceiro', 'Total do parceiro'),
      valor('desconto_total', 'Total descontos (DW)'),
      texto('forma_de_pagamentos', 'Formas de pagamento'),
      dataHora('data_cancelamento', 'Data do cancelamento'),
      texto('origem_cancelamento', 'Origem do cancelamento'),
      texto('motivo_cancelamento', 'Motivo do cancelamento'),
      texto('cancelamento_contestavel', 'Cancelamento é contestável'),
      texto('motivo_impossibilidade', 'Motivo da impossibilidade de contestar'),
      dataHora('data_limite_contestacao', 'Data limite de contestação'),
      texto('confirmado_por', 'Confirmado'),
      texto('tipo_pedido', 'Tipo de pedido'),
      texto('agendado', 'Agendado'),
      texto('origem', 'Canal de venda'),
      texto('cancelamento_parcial', 'Tem cancelamento parcial?'),
    ]
  }, [compacto])

  if (!canView) {
    return (
      <div className="m-6 rounded-lg border border-warning/30 bg-warning/10 p-6 text-sm text-foreground">
        Você não tem permissão para acessar o Fechamento iFood Diário (
        <code>fechamento-ifood-diario.ler</code>
        ).
      </div>
    )
  }

  const subtitle = consulta
    ? `${consulta.lojaNome} · ${formatDataHora(consulta.data)}`
    : 'Pedidos iFood da loja no dia, cruzados com a API financeira do iFood.'

  let emptyState
  if (erro) {
    emptyState = (
      <EmptyState
        // A tabela não quebra linha nas células (e o estado vazio fica numa célula): a
        // mensagem de erro, que pode ser longa, precisa quebrar.
        className="whitespace-normal break-words"
        icon={AlertTriangle}
        title="Não foi possível consultar os dados"
        description={erro}
        action={
          <Button
            onClick={() => {
              if (lojasQuery.isError) void lojasQuery.refetch()
              if (erroConsulta && consulta) void consultar(consulta)
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
        icon={ReceiptText}
        title="Aguardando consulta"
        description="Selecione a loja e o dia e clique em Pesquisar para ver o fechamento iFood."
      />
    )
  } else if (pedidos.length > 0) {
    emptyState = (
      <EmptyState
        icon={ReceiptText}
        title="Nenhum pedido neste filtro"
        description="Tire o filtro do card para ver todos os pedidos do dia."
      />
    )
  } else {
    emptyState = (
      <EmptyState
        icon={ReceiptText}
        title="Nenhum pedido iFood"
        description="O DW não tem pedidos do iFood para a loja neste dia."
      />
    )
  }

  const acoes = (
    <>
      {filtroTotal && (
        <Dica content="Tirar o filtro e voltar a ver todos os pedidos">
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
      <Dica content={totaisAbertos ? 'Ocultar os cards do dia' : 'Mostrar os cards do dia'}>
        <Button
          variant={totaisAbertos ? 'default' : 'outline'}
          className={BOTAO_TOOLBAR}
          aria-label="Totais"
          aria-pressed={totaisAbertos}
          disabled={!painelDisponivel}
          onClick={() => setTotaisEscolhidos(!totaisAbertos)}
          data-tour="fechamento-ifood-diario-totais"
        >
          <ChartPie className="h-4 w-4" />
          <span className={ROTULO_TOOLBAR}>Totais</span>
        </Button>
      </Dica>
    </>
  )

  return (
    <WidthFrame
      className={cn('h-[calc(100vh-6.5rem)] md:h-[calc(100vh-7.5rem)]', SCROLLBAR_ELEGANTE)}
      data-tour="fechamento-ifood-diario-frame"
    >
      {/* No celular a página tem UMA rolagem só; no desktop só o corpo da tabela rola. */}
      <div
        ref={setArea}
        className={cn(
          'flex h-full flex-col gap-3',
          compacto ? 'overflow-y-auto' : 'overflow-hidden'
        )}
      >
        <FiltrosBar
          className="shrink-0"
          value={{ ...filtros, operacaoRef: refSelecionada }}
          onValueChange={setFiltros}
          lojas={lojas}
          lojasLoading={lojasQuery.isLoading}
          pesquisando={carregando}
          onPesquisar={pesquisar}
          semAlteracao={semAlteracao}
          compacto={compacto}
          enxuto={consulta !== null && !erro}
          tituloExtra={<TourReplayButton onClick={replayTour} />}
        />

        {resultado && !erro && <Avisos resposta={resultado} />}

        <Recolhivel className="shrink-0" visivel={painelDisponivel && totaisAbertos}>
          <ResumoCards
            totais={totais}
            carregando={carregando || parcial}
            filtro={filtroTotal}
            onFiltroChange={setFiltroTotal}
          />
        </Recolhivel>

        {/* A faixa de progresso fica acima da tabela durante toda a busca (como no
            Fechamento iFood Mensal); a tabela carrega até os pedidos chegarem. */}
        {carregando && consulta && (
          <ProgressoConsulta
            progresso={progresso}
            comPedidos={resultado !== null}
            onCancelar={() => {
              cancelar()
              setConsulta(null)
            }}
          />
        )}

        <DataReport<PedidoIfood>
          loading={carregando && !resultado}
          className={cn('[&_td]:whitespace-nowrap', compacto ? 'shrink-0' : 'min-h-0 flex-1')}
          fillHeight={!compacto}
          title="Pedidos iFood"
          subtitle={subtitle}
          actions={acoes}
          globalSearch={compacto}
          columnVisibilityToggle
          initialColumnVisibility={COLUNAS_INATIVAS}
          fullscreenToggle={!compacto}
          emptyState={emptyState}
          toolbarTourId="fechamento-ifood-diario-toolbar"
          data={erro ? [] : pedidosVisao}
          columns={!carregando && (erro || pedidosVisao.length === 0) ? SEM_COLUNAS : colunas}
          getRowId={(p) => p.id || `${p.n_pedido}-${p.data_de_criacao}`}
          searchPlaceholder="Buscar pedido, forma de pagamento…"
          countNoun="pedidos"
          pageSize={50}
          rowClassName={(p) =>
            p.venda_concluida === 'Cancelado'
              ? 'bg-destructive/5'
              : p.venda_concluida === 'Aguardando'
                ? 'opacity-60 transition-opacity duration-default'
                : undefined
          }
          onExport={
            canExport && consulta && resultado?.completo && totais
              ? (visiveis) =>
                  exportarXlsx(
                    visiveis,
                    totais,
                    consulta,
                    pedidos.length,
                    filtroTotal ? NOME_DO_TOTAL[filtroTotal] : null
                  )
              : undefined
          }
        />
      </div>
    </WidthFrame>
  )
}
