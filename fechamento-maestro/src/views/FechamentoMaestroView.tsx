import { useLayoutEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react'
import {
  AlertTriangle,
  ChartPie,
  LayoutDashboard,
  ListFilter,
  ReceiptText,
  RefreshCw,
} from 'lucide-react'
import {
  Button,
  DataReport,
  EmptyState,
  TourReplayButton,
  WidthFrame,
  nomeArquivoExport,
  toast,
  Tooltip,
  type ColumnDef,
} from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'
import { useTourReplayTrigger } from '@gia-cb/sdk/modules'
import { useCanAccess } from '@gia-cb/sdk/permissions'
import { useFechamentoMaestro, useLojasFechamentoMaestro } from '../api/fechamento-maestro'
import { BadgeCheck } from '../components/BadgeCheck'
import { BadgeOrigemPedido } from '../components/BadgeOrigemPedido'
import { BadgeStatusPedido } from '../components/BadgeStatusPedido'
import { DashboardDialog } from '../components/DashboardDialog'
import { DetalhePedidoDialog } from '../components/DetalhePedidoDialog'
import { FiltrosBar, type FiltrosValor } from '../components/FiltrosBar'
import { Recolhivel } from '../components/Recolhivel'
import { ResumoCards } from '../components/ResumoCards'
import { SemClassificacaoDialog } from '../components/SemClassificacaoDialog'
import {
  COLUNAS_DIA,
  COLUNAS_PEDIDO,
  divergente,
  formatBRL,
  formatDataHora,
  hojeLocal,
  NOME_MODULO,
  pagamentosSemClassificacao,
  periodoArquivo,
  preencherPlanilha,
  resumirPorDia,
  resumirTotais,
  somarDias,
  validarPeriodo,
} from '../helpers'
import { statusPedido } from '../status-pedido'
import type { Consulta, PedidoFechamento } from '../types'

/** Abaixo desta largura (px) a tela usa o layout de celular — o mesmo corte do
 *  `DataReport` (`@3xl` = 48rem), que vira lista de cards nesse ponto. */
const LARGURA_COMPACTA = 768

/** Em telas com esta altura (px) ou mais a barra de totais fica aberta; abaixo,
 *  fechada, para sobrar espaço para a tabela — até o usuário usar o botão Totais. */
const ALTURA_TOTAIS_ABERTOS = 700
const MQ_TELA_ALTA = `(min-height: ${ALTURA_TOTAIS_ABERTOS}px)`

function assinarTelaAlta(aoMudar: () => void) {
  const mq = window.matchMedia(MQ_TELA_ALTA)
  mq.addEventListener('change', aoMudar)
  return () => mq.removeEventListener('change', aoMudar)
}

/** `true` enquanto a janela tem altura ≥ `ALTURA_TOTAIS_ABERTOS` (segue o resize). */
function useTelaAlta(): boolean {
  return useSyncExternalStore(
    assinarTelaAlta,
    () => window.matchMedia(MQ_TELA_ALTA).matches,
    () => false
  )
}

/**
 * Sem linhas, a tabela vai sem colunas: o `DataReport` desenha o estado vazio numa
 * `<td colSpan>` DENTRO da tabela, e com todas as colunas no cabeçalho a tabela
 * fica mais larga que a tela e o aviso centraliza fora da área visível.
 */
const SEM_COLUNAS_PEDIDO: ColumnDef<PedidoFechamento, unknown>[] = []

/**
 * Botões da toolbar do `DataReport` (que é `@container`). De @lg a @5xl a toolbar
 * fica AO LADO do título e não cabe com rótulos: os botões viram só ícone (o
 * tooltip e o `aria-label` dizem o nome). Abaixo de @lg e a partir de @5xl: rótulo.
 */
const BOTAO_TOOLBAR = 'px-2.5 @max-lg:px-4 @5xl:px-4'
const ROTULO_TOOLBAR = '@lg:hidden @5xl:inline'

/** Campos que formam a face do card no celular; o resto fica em "ver mais". */
const CAMPOS_CARD_PEDIDO = new Set<string>([
  'n_pedido',
  'data_de_criacao',
  'total_pago',
  'check_pagamentos',
])

/** Colunas monetárias da tabela de pedidos, na ordem da tela. */
const MOEDAS_PEDIDO: { campo: keyof PedidoFechamento; header: string }[] = [
  { campo: 'total_pago', header: 'Total pago' },
  { campo: 'total_pago_online', header: 'Online' },
  { campo: 'total_pago_adquirentes', header: 'Adquirentes' },
  { campo: 'total_pago_offline', header: 'Offline' },
  { campo: 'total_nao_classificado', header: 'Não classificado' },
  { campo: 'desconto_total', header: 'Desconto total' },
  { campo: 'valor_do_pedido', header: 'Valor pedido' },
  { campo: 'valor_da_entrega', header: 'Valor entrega' },
  { campo: 'incentivo_parceiro', header: 'Incentivo parceiro' },
]

/** Barra de rolagem fina para o que rola dentro da tela (mesma do Reports Maestro). */
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
  '[&_*::-webkit-scrollbar-thumb:active]:bg-muted-foreground/85',
  '[@supports_not_selector(::-webkit-scrollbar)]:[&_*]:[scrollbar-width:thin]',
  '[@supports_not_selector(::-webkit-scrollbar)]:[&_*]:[scrollbar-color:color-mix(in_oklab,var(--color-muted-foreground)_50%,transparent)_color-mix(in_oklab,var(--color-border)_50%,transparent)]',
].join(' ')

/**
 * `true` quando a ÁREA da tela é estreita. Mede o elemento — não a janela — pelo
 * mesmo motivo do `DataReport`: o seletor de Viewport do dev-shell e painéis
 * estreitos do portal limitam a largura do módulo sem mudar a janela.
 */
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

const moeda = (v: number) => <span className="whitespace-nowrap tabular-nums">{formatBRL(v)}</span>
const vazio = <span className="text-muted-foreground">—</span>

/**
 * Excel do fechamento, 3 abas: o fechamento diário (com a linha Total), os pedidos
 * que entram nele e os cancelados à parte — assim o Total de cada aba bate com os
 * cards de totais e por dia (que deixam os cancelados de fora).
 */
async function exportarXlsx(pedidos: PedidoFechamento[], consulta: Consulta) {
  const { Workbook } = await import('exceljs')
  const wb = new Workbook()
  wb.creator = NOME_MODULO
  const cab = {
    lojaNome: consulta.lojaNome,
    de: consulta.de,
    ate: consulta.ate,
    geradoEm: new Date(),
  }
  const validos = pedidos.filter((p) => !p.cancelado)
  const cancelados = pedidos.filter((p) => p.cancelado)
  const plural = (n: number, um: string, varios: string) =>
    `${n.toLocaleString('pt-BR')} ${n === 1 ? um : varios}`
  const dias = resumirPorDia(pedidos)

  preencherPlanilha(
    wb.addWorksheet('Fechamento diário'),
    dias,
    COLUNAS_DIA,
    cab,
    `Fechamento diário · ${plural(dias.length, 'dia', 'dias')} · cancelados fora dos valores`
  )
  preencherPlanilha(
    wb.addWorksheet('Pedidos'),
    validos,
    COLUNAS_PEDIDO,
    cab,
    `Pedidos do fechamento · ${plural(validos.length, 'pedido', 'pedidos')} (sem cancelados)`
  )
  preencherPlanilha(
    wb.addWorksheet('Cancelados'),
    cancelados,
    COLUNAS_PEDIDO,
    cab,
    `Pedidos cancelados · ${plural(cancelados.length, 'pedido', 'pedidos')} (fora do fechamento)`
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
    periodo: periodoArquivo(consulta.de, consulta.ate),
    extensao: 'xlsx',
  })
  a.click()
  URL.revokeObjectURL(url)
}

export function FechamentoMaestroView() {
  const canView = useCanAccess('fechamento-maestro.ler')
  const canExport = useCanAccess('fechamento-maestro.exportar')
  const replayTour = useTourReplayTrigger('fechamento-maestro')

  // Como no legado, o período começa em ontem → ontem.
  const ontem = somarDias(hojeLocal(), -1)
  const [filtros, setFiltros] = useState<FiltrosValor>({ empresaId: null, de: ontem, ate: ontem })
  // Snapshot do clique em "Pesquisar": mudar o formulário sem pesquisar de novo não
  // troca as tabelas nem o nome do Excel.
  const [consulta, setConsulta] = useState<Consulta | null>(null)

  const [area, setArea] = useState<HTMLDivElement | null>(null)
  const compacto = useModoCompacto(area)

  const lojasQuery = useLojasFechamentoMaestro(canView)
  const lojas = useMemo(() => lojasQuery.data ?? [], [lojasQuery.data])
  // Sem escolha do usuário, vale a primeira loja da lista (como no legado).
  const empresaIdSelecionada = filtros.empresaId ?? lojas[0]?.empresaId ?? null

  const fechamentoQuery = useFechamentoMaestro(
    consulta ? { empresaId: consulta.empresaId, de: consulta.de, ate: consulta.ate } : null
  )
  const pedidos = useMemo(() => fechamentoQuery.data?.pedidos ?? [], [fechamentoQuery.data])
  const carregando = fechamentoQuery.isFetching
  const erro = fechamentoQuery.error ?? lojasQuery.error
  const painelDisponivel = consulta !== null && !erro

  // "Só divergências" mostra só os pedidos com algum check reprovado.
  const [soDivergencias, setSoDivergencias] = useState(false)
  const [pedidoAberto, setPedidoAberto] = useState<PedidoFechamento | null>(null)
  const [semClassificacaoAberto, setSemClassificacaoAberto] = useState(false)
  const [dashboardAberto, setDashboardAberto] = useState(false)
  // Barra de totais: segue a altura da tela até o usuário clicar em "Totais";
  // daí em diante vale a escolha dele.
  const telaAlta = useTelaAlta()
  const [totaisEscolhidos, setTotaisEscolhidos] = useState<boolean | null>(null)
  const totaisAbertos = totaisEscolhidos ?? telaAlta

  const totais = useMemo(
    () => (fechamentoQuery.data ? resumirTotais(pedidos) : null),
    [fechamentoQuery.data, pedidos]
  )
  const semClassificacao = useMemo(() => pagamentosSemClassificacao(pedidos), [pedidos])
  const pedidosVisao = useMemo(
    () => (soDivergencias ? pedidos.filter(divergente) : pedidos),
    [pedidos, soDivergencias]
  )

  const semAlteracao =
    consulta !== null &&
    consulta.empresaId === empresaIdSelecionada &&
    consulta.de === filtros.de &&
    consulta.ate === filtros.ate

  function pesquisar() {
    if (semAlteracao) return
    const msg = validarPeriodo(filtros.de, filtros.ate)
    if (msg) {
      toast.error(msg)
      return
    }
    const loja = lojas.find((l) => l.empresaId === empresaIdSelecionada)
    if (!loja) {
      toast.error('Informe uma loja.')
      return
    }
    setSoDivergencias(false)
    setConsulta({
      empresaId: loja.empresaId,
      lojaNome: loja.nome,
      de: filtros.de,
      ate: filtros.ate,
    })
  }

  const colunasPedido = useMemo<ColumnDef<PedidoFechamento, unknown>[]>(() => {
    const meta = (campo: string) =>
      CAMPOS_CARD_PEDIDO.has(campo) ? { mobile: 'primary' as const } : undefined
    const centro = (conteudo: ReactNode) => (
      <div className={cn('flex', !compacto && 'justify-center')}>{conteudo}</div>
    )
    return [
      {
        id: 'n_pedido',
        accessorKey: 'n_pedido',
        header: 'Nº pedido',
        meta: meta('n_pedido'),
        cell: ({ row }) => <span className="font-medium">{row.original.n_pedido || '—'}</span>,
      },
      {
        id: 'data_de_criacao',
        accessorKey: 'data_de_criacao',
        header: 'Data criação',
        meta: meta('data_de_criacao'),
        cell: ({ row }) => (
          <span className="whitespace-nowrap tabular-nums">
            {formatDataHora(row.original.data_de_criacao)}
          </span>
        ),
      },
      {
        id: 'origem',
        accessorKey: 'origem',
        header: 'Origem',
        cell: ({ row }) =>
          centro(row.original.origem ? <BadgeOrigemPedido origem={row.original.origem} /> : vazio),
      },
      {
        // Valor da coluna = nome traduzido, pra busca e filtro usarem o que se vê.
        id: 'status_do_pedido',
        header: 'Status pedido',
        accessorFn: (p) => (p.status_do_pedido ? statusPedido(p.status_do_pedido).rotulo : ''),
        cell: ({ row }) =>
          centro(
            row.original.status_do_pedido ? (
              <BadgeStatusPedido status={row.original.status_do_pedido} />
            ) : (
              vazio
            )
          ),
      },
      {
        id: 'check_pagamentos',
        header: 'Check pagamentos',
        meta: meta('check_pagamentos'),
        accessorFn: (p) => (p.check_pagamentos ? 'OK' : 'Divergente'),
        cell: ({ row }) => centro(<BadgeCheck ok={row.original.check_pagamentos} />),
      },
      {
        id: 'check_descontos',
        header: 'Check descontos',
        accessorFn: (p) => (p.check_descontos ? 'OK' : 'Divergente'),
        cell: ({ row }) => centro(<BadgeCheck ok={row.original.check_descontos} />),
      },
      ...MOEDAS_PEDIDO.map(({ campo, header }): ColumnDef<PedidoFechamento, unknown> => ({
        id: campo,
        accessorKey: campo,
        header,
        meta: meta(campo),
        cell: ({ row }) => moeda(row.original[campo] as number),
      })),
      {
        id: 'venda_concluida',
        header: 'Venda concluída',
        accessorFn: (p) => (p.venda_concluida ? 'Sim' : 'Não'),
      },
      {
        id: 'forma_de_pagamentos',
        accessorKey: 'forma_de_pagamentos',
        header: 'Forma pgto',
        cell: ({ row }) => row.original.forma_de_pagamentos ?? vazio,
      },
      {
        id: 'descontos',
        accessorKey: 'descontos',
        header: 'Descontos',
        cell: ({ row }) => row.original.descontos ?? vazio,
      },
      {
        id: 'nome_cliente',
        accessorKey: 'nome_cliente',
        header: 'Cliente',
        cell: ({ row }) => row.original.nome_cliente ?? vazio,
      },
      {
        id: 'tipo_entrega',
        accessorKey: 'tipo_entrega',
        header: 'Tipo entrega',
        cell: ({ row }) => row.original.tipo_entrega ?? vazio,
      },
    ]
  }, [compacto])

  if (!canView) {
    return (
      <div className="m-6 rounded-lg border border-warning/30 bg-warning/10 p-6 text-sm text-foreground">
        Você não tem permissão para acessar o Fechamento Maestro (
        <code>fechamento-maestro.ler</code>
        ).
      </div>
    )
  }

  const subtitle = consulta
    ? `${consulta.lojaNome} · ${formatDataHora(consulta.de)}${
        consulta.de !== consulta.ate ? ` a ${formatDataHora(consulta.ate)}` : ''
      }`
    : 'Conciliação dos pagamentos dos pedidos de delivery do Maestro por loja e período.'

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
              if (fechamentoQuery.isError) void fechamentoQuery.refetch()
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
        title="Escolha a loja e o período"
        description="Selecione a loja, as datas e clique em Pesquisar para montar o fechamento."
      />
    )
  } else if (pedidos.length > 0) {
    emptyState = (
      <EmptyState
        icon={ReceiptText}
        title="Nenhum pedido neste filtro"
        description="Nenhum pedido com divergência — os pagamentos e descontos conferem."
      />
    )
  } else {
    emptyState = (
      <EmptyState
        icon={ReceiptText}
        title="Nenhum pedido"
        description="Nenhum pedido de delivery encontrado para a loja no período."
      />
    )
  }

  const qtdDivergentes = totais?.divergentes ?? 0

  const acoes = (
    <>
      <Tooltip
        content={
          soDivergencias
            ? 'Mostrar todos os pedidos'
            : 'Mostrar só os pedidos com pagamento ou desconto divergente'
        }
      >
        <Button
          variant={soDivergencias ? 'default' : 'outline'}
          className={BOTAO_TOOLBAR}
          aria-label={`Só divergências (${qtdDivergentes})`}
          aria-pressed={soDivergencias}
          disabled={!painelDisponivel}
          onClick={() => setSoDivergencias((v) => !v)}
          data-tour="fechamento-maestro-divergencias"
        >
          <ListFilter className="h-4 w-4" />
          <span className={ROTULO_TOOLBAR}>Só divergências</span>
          <span
            className={cn(
              'rounded-full px-1.5 text-xs tabular-nums',
              soDivergencias
                ? 'bg-primary-foreground text-primary'
                : qtdDivergentes > 0
                  ? 'bg-destructive text-destructive-foreground'
                  : 'bg-muted text-muted-foreground'
            )}
          >
            {qtdDivergentes.toLocaleString('pt-BR')}
          </span>
        </Button>
      </Tooltip>
      <Tooltip
        content={totaisAbertos ? 'Ocultar os totais do período' : 'Mostrar os totais do período'}
      >
        <Button
          variant={totaisAbertos ? 'default' : 'outline'}
          className={BOTAO_TOOLBAR}
          aria-label="Totais"
          aria-pressed={totaisAbertos}
          disabled={!painelDisponivel}
          onClick={() => setTotaisEscolhidos(!totaisAbertos)}
          data-tour="fechamento-maestro-totais-toggle"
        >
          <ChartPie className="h-4 w-4" />
          <span className={ROTULO_TOOLBAR}>Totais</span>
        </Button>
      </Tooltip>
      <Tooltip content="Abrir o dashboard do período (vendas por canal)">
        <Button
          variant="outline"
          className={BOTAO_TOOLBAR}
          aria-label="Dashboard"
          disabled={!painelDisponivel}
          onClick={() => setDashboardAberto(true)}
          data-tour="fechamento-maestro-dashboard"
        >
          <LayoutDashboard className="h-4 w-4" />
          <span className={ROTULO_TOOLBAR}>Dashboard</span>
        </Button>
      </Tooltip>
    </>
  )

  return (
    // O WidthFrame desenha os botões de expandir/retrair largura FORA da sua borda:
    // nada de overflow nele (cortaria os botões) — o scroll fica na div interna.
    <WidthFrame
      className={cn('h-[calc(100vh-6.5rem)] md:h-[calc(100vh-7.5rem)]', SCROLLBAR_ELEGANTE)}
      data-tour="fechamento-maestro-frame"
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
        />

        <Recolhivel className="shrink-0" visivel={painelDisponivel && totaisAbertos}>
          <ResumoCards
            totais={totais}
            carregando={carregando}
            onVerSemClassificacao={() => setSemClassificacaoAberto(true)}
          />
        </Recolhivel>

        <DataReport<PedidoFechamento>
          className={cn(
            '[&_td]:whitespace-nowrap',
            '@lg:[&_[data-tour=fechamento-maestro-toolbar]]:justify-end',
            compacto ? 'shrink-0' : 'min-h-0 flex-1'
          )}
          fillHeight={!compacto}
          title={NOME_MODULO}
          titleExtra={<TourReplayButton onClick={replayTour} />}
          subtitle={subtitle}
          actions={acoes}
          loading={carregando}
          globalSearch
          columnVisibilityToggle={!compacto}
          fullscreenToggle={!compacto}
          emptyState={emptyState}
          toolbarTourId="fechamento-maestro-toolbar"
          data={erro ? [] : pedidosVisao}
          columns={
            !carregando && (erro || pedidosVisao.length === 0) ? SEM_COLUNAS_PEDIDO : colunasPedido
          }
          getRowId={(p) => p.id}
          searchPlaceholder="Buscar pedido, cliente, forma de pagamento…"
          countNoun="pedidos"
          pageSize={100}
          onRowClick={setPedidoAberto}
          rowClassName={(p) => (divergente(p) ? 'bg-destructive/5' : undefined)}
          onExport={
            canExport && consulta && fechamentoQuery.data
              ? (visiveis) => exportarXlsx(visiveis, consulta)
              : undefined
          }
        />
      </div>

      <SemClassificacaoDialog
        aberto={semClassificacaoAberto}
        itens={semClassificacao}
        onFechar={() => setSemClassificacaoAberto(false)}
        onAbrirPedido={(p) => {
          setSemClassificacaoAberto(false)
          setPedidoAberto(p)
        }}
      />
      <DashboardDialog
        aberto={dashboardAberto}
        pedidos={pedidos}
        carregando={carregando}
        descricao={subtitle}
        onFechar={() => setDashboardAberto(false)}
      />
      <DetalhePedidoDialog pedido={pedidoAberto} onFechar={() => setPedidoAberto(null)} />
    </WidthFrame>
  )
}
