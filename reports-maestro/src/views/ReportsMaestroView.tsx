import { useLayoutEffect, useMemo, useState } from 'react'
import { AlertTriangle, Bike, RefreshCw } from 'lucide-react'
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
import { useLojasReportsMaestro, usePedidosReportsMaestro } from '../api/reports-maestro'
import { FiltrosBar, type FiltrosValor } from '../components/FiltrosBar'
import {
  COLUNAS_EXPORT,
  formatBRL,
  formatDataHora,
  hojeLocal,
  NOME_MODULO,
  periodoArquivo,
  preencherPlanilha,
  somarDias,
  somarPedidos,
  validarPeriodo,
  VARIANTE_STATUS_PEDIDO,
} from '../helpers'
import type { Consulta, PedidoMaestro } from '../types'

/** Abaixo desta largura (px) a tela usa o layout de celular — o mesmo corte do
 *  `DataReport` (`@3xl` = 48rem), que vira lista de cards nesse ponto. */
const LARGURA_COMPACTA = 768

/** Colunas que formam a face do card no celular; o resto fica em "ver mais". */
const CAMPOS_CARD = new Set<keyof PedidoMaestro>([
  'n_pedido',
  'data_de_criacao',
  'status_do_pedido',
  'total_pago',
])

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

async function exportarXlsx(pedidos: PedidoMaestro[], consulta: Consulta) {
  const { Workbook } = await import('exceljs')
  const wb = new Workbook()
  wb.creator = NOME_MODULO
  preencherPlanilha(wb.addWorksheet('Pedidos'), pedidos, {
    lojaNome: consulta.lojaNome,
    de: consulta.de,
    ate: consulta.ate,
    geradoEm: new Date(),
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

export function ReportsMaestroView() {
  const canView = useCanAccess('reports-maestro.ler')
  const canExport = useCanAccess('reports-maestro.exportar')
  const replayTour = useTourReplayTrigger('reports-maestro')

  // Como no legado, o período começa em ontem → ontem.
  const ontem = somarDias(hojeLocal(), -1)
  const [filtros, setFiltros] = useState<FiltrosValor>({ empresaId: null, de: ontem, ate: ontem })
  // Snapshot do clique em "Pesquisar": mudar o formulário sem pesquisar de novo não
  // troca a tabela nem o nome do Excel.
  const [consulta, setConsulta] = useState<Consulta | null>(null)

  const [area, setArea] = useState<HTMLDivElement | null>(null)
  const compacto = useModoCompacto(area)

  const lojasQuery = useLojasReportsMaestro(canView)
  const lojas = useMemo(() => lojasQuery.data ?? [], [lojasQuery.data])
  // Sem escolha do usuário, vale a primeira loja da lista (como no legado).
  const empresaIdSelecionada = filtros.empresaId ?? lojas[0]?.empresaId ?? null

  const pedidosQuery = usePedidosReportsMaestro(
    consulta ? { empresaId: consulta.empresaId, de: consulta.de, ate: consulta.ate } : null
  )
  const pedidos = useMemo(() => pedidosQuery.data?.pedidos ?? [], [pedidosQuery.data])
  const carregando = pedidosQuery.isFetching
  const erro = pedidosQuery.error ?? lojasQuery.error

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
    setConsulta({
      empresaId: loja.empresaId,
      lojaNome: loja.nome,
      de: filtros.de,
      ate: filtros.ate,
    })
  }

  // Colunas = as da planilha (mesmos nomes e ordem do legado), com a célula pelo tipo.
  const columns = useMemo<ColumnDef<PedidoMaestro, unknown>[]>(
    () =>
      COLUNAS_EXPORT.map((col): ColumnDef<PedidoMaestro, unknown> => {
        const meta = CAMPOS_CARD.has(col.campo) ? { mobile: 'primary' as const } : undefined
        const base = { id: col.campo, accessorKey: col.campo, header: col.header, meta }
        if (col.campo === 'status_do_pedido') {
          return {
            ...base,
            cell: ({ row }) => {
              const s = row.original.status_do_pedido
              if (!s) return <span className="text-muted-foreground">—</span>
              return (
                <Badge
                  variant={VARIANTE_STATUS_PEDIDO[s] ?? 'secondary'}
                  className="whitespace-nowrap"
                >
                  {s}
                </Badge>
              )
            },
          }
        }
        if (col.tipo === 'moeda') {
          return {
            ...base,
            cell: ({ row }) => (
              <span className="whitespace-nowrap tabular-nums">
                {formatBRL(row.original[col.campo] as number)}
              </span>
            ),
          }
        }
        if (col.tipo === 'dataHora') {
          return {
            ...base,
            cell: ({ row }) => (
              <span className="whitespace-nowrap tabular-nums">
                {formatDataHora(row.original[col.campo] as string | null)}
              </span>
            ),
          }
        }
        return {
          ...base,
          cell: ({ row }) => {
            const v = row.original[col.campo]
            return v === null || v === '' ? (
              <span className="text-muted-foreground">—</span>
            ) : (
              String(v)
            )
          },
        }
      }),
    []
  )

  if (!canView) {
    return (
      <div className="m-6 rounded-lg border border-warning/30 bg-warning/10 p-6 text-sm text-foreground">
        Você não tem permissão para acessar o Reports Maestro (<code>reports-maestro.ler</code>).
      </div>
    )
  }

  const totais = somarPedidos(pedidos)
  const subtitle = consulta
    ? `${consulta.lojaNome} · ${formatDataHora(consulta.de)}${
        consulta.de !== consulta.ate ? ` a ${formatDataHora(consulta.ate)}` : ''
      }${pedidosQuery.data ? ` · total pago ${formatBRL(totais.total_pago)}` : ''}`
    : 'Pedidos de delivery do Maestro por loja e período.'

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
              if (pedidosQuery.isError) void pedidosQuery.refetch()
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
        icon={Bike}
        title="Escolha a loja e o período"
        description="Selecione a loja, as datas e clique em Pesquisar para listar os pedidos de delivery."
      />
    )
  } else {
    emptyState = (
      <EmptyState
        icon={Bike}
        title="Nenhum pedido"
        description="Nenhum pedido de delivery encontrado para a loja no período."
      />
    )
  }

  return (
    // O WidthFrame desenha os botões de expandir/retrair largura FORA da sua borda:
    // nada de overflow nele (cortaria os botões) — o scroll fica na div interna.
    <WidthFrame
      className="h-[calc(100vh-6.5rem)] md:h-[calc(100vh-7.5rem)]"
      data-tour="reports-maestro-frame"
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

        <DataReport
          className={compacto ? 'shrink-0' : 'min-h-0 flex-1'}
          fillHeight={!compacto}
          title={NOME_MODULO}
          titleExtra={<TourReplayButton onClick={replayTour} />}
          subtitle={subtitle}
          data={erro ? [] : pedidos}
          columns={columns}
          loading={carregando}
          getRowId={(p) => p.id}
          globalSearch
          searchPlaceholder="Buscar pedido, cliente, forma de pagamento…"
          countNoun="pedidos"
          pageSize={100}
          columnVisibilityToggle={!compacto}
          fullscreenToggle={!compacto}
          summaryRow={(linhas) => {
            const t = somarPedidos(linhas)
            const total = (v: number) => (
              <span className="whitespace-nowrap font-semibold tabular-nums">{formatBRL(v)}</span>
            )
            return {
              nome_loja: <span className="font-semibold">Total</span>,
              valor_do_pedido: total(t.valor_do_pedido),
              valor_da_entrega: total(t.valor_da_entrega),
              total_pago: total(t.total_pago),
              desconto_total: total(t.desconto_total),
            }
          }}
          onExport={
            canExport && consulta && pedidosQuery.data
              ? (visiveis) => exportarXlsx(visiveis, consulta)
              : undefined
          }
          emptyState={emptyState}
          toolbarTourId="reports-maestro-toolbar"
        />
      </div>
    </WidthFrame>
  )
}
