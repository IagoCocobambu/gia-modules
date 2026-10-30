import { useLayoutEffect, useMemo, useState } from 'react'
import { AlertTriangle, Bike, ChartPie, RefreshCw, SlidersHorizontal } from 'lucide-react'
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
import { useLojasReportsMaestro, usePedidosReportsMaestro } from '../api/reports-maestro'
import { BadgeOrigemPedido } from '../components/BadgeOrigemPedido'
import { BadgeStatusPedido } from '../components/BadgeStatusPedido'
import { FiltrosBar, type FiltrosValor } from '../components/FiltrosBar'
import { OrigemFiltro } from '../components/OrigemFiltro'
import { PainelDialog } from '../components/PainelDialog'
import { Recolhivel } from '../components/Recolhivel'
import { StatusFiltro } from '../components/StatusFiltro'
import { TotaisCards } from '../components/TotaisCards'
import {
  chaveOrigem,
  chaveStatus,
  COLUNAS_EXPORT,
  contarPor,
  filtrarPedidos,
  formatBRL,
  formatDataHora,
  hojeLocal,
  NOME_MODULO,
  periodoArquivo,
  preencherPlanilha,
  somarDias,
  somarPedidos,
  validarPeriodo,
} from '../helpers'
import { statusPedido } from '../status-pedido'
import type { Consulta, PedidoMaestro } from '../types'

/** Abaixo desta largura (px) a tela usa o layout de celular — o mesmo corte do
 *  `DataReport` (`@3xl` = 48rem), que vira lista de cards nesse ponto. */
const LARGURA_COMPACTA = 768

/** A partir desta altura de tela (px) os cards de totais já começam abertos;
 *  abaixo, começam fechados para sobrar espaço para a tabela. Vale a janela (não
 *  o elemento) porque a altura do frame já é derivada de `100vh`. */
const ALTURA_TOTAIS_ABERTOS = 700

/**
 * Colunas da tabela quando não há linha nenhuma. O `DataReport` desenha o estado
 * vazio numa `<td colSpan>` DENTRO da tabela: com as ~27 colunas no cabeçalho
 * (sem quebra de linha) a tabela fica mais larga que a tela, liga a rolagem
 * horizontal e o "Escolha a loja e o período" centraliza fora da área visível.
 * Sem colunas, a tabela tem a largura do frame e o aviso fica no meio.
 */
const SEM_COLUNAS: ColumnDef<PedidoMaestro, unknown>[] = []

/**
 * Botões Filtros/Totais na toolbar do `DataReport` (que é `@container`). Mesma
 * altura (h-9) dos ícones e do Exportar. De @lg a @5xl a toolbar fica AO LADO do
 * título e não cabe com rótulos (ex.: celular deitado, 1040px): os dois viram só
 * ícone (o tooltip e o `aria-label` dizem o nome) e tudo fica numa linha. Abaixo
 * de @lg a toolbar tem a linha inteira, e a partir de @5xl sobra espaço: rótulo.
 */
const BOTAO_TOOLBAR = 'px-2.5 @max-lg:px-4 @5xl:px-4'
const ROTULO_TOOLBAR = '@lg:hidden @5xl:inline'

/** Colunas que formam a face do card no celular; o resto fica em "ver mais". */
const CAMPOS_CARD = new Set<keyof PedidoMaestro>([
  'n_pedido',
  'data_de_criacao',
  'status_do_pedido',
  'total_pago',
])

/**
 * Barra de rolagem fina e discreta para tudo que rola dentro da tela (corpo da
 * tabela, lista de cards, rolagem única do celular). As divs que rolam ficam
 * dentro do `DataReport`, que não aceita classe pra elas — então o estilo desce
 * por seletor de descendente a partir do frame.
 *
 * Chrome/Edge/Safari: `::-webkit-scrollbar` — trilho suave arredondado e
 * polegar em pílula de 6px por dentro dele (borda transparente +
 * `bg-clip-padding` dá o respiro), sem setas.
 * Firefox não tem esses pseudo-elementos e cai no `scrollbar-width/color`
 * padrão. Os dois não podem valer juntos: no Chrome 121+ o padrão desliga o
 * webkit — por isso o fallback fica atrás do `@supports not selector(...)`.
 */
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

  // Filtros de chips (vazio = todos). Os APLICADOS (`statusFiltro`/`origemFiltro`)
  // filtram a tabela, os totais em R$ e o export. No dialog o usuário mexe num
  // RASCUNHO, que só vira filtro aplicado no "Ver N pedidos"; fechar de outro
  // jeito (X, clique fora, Esc) descarta o rascunho. A contagem de cada barra
  // respeita a OUTRA (status conta só as origens marcadas e vice-versa), mas não
  // a própria — senão marcar um chip zeraria os vizinhos. Chip com 0 some do
  // dialog; o `base` (período inteiro) mantém o marcado que a outra barra zerou.
  const [statusFiltro, setStatusFiltro] = useState<ReadonlySet<string>>(() => new Set())
  const [origemFiltro, setOrigemFiltro] = useState<ReadonlySet<string>>(() => new Set())
  const [statusRascunho, setStatusRascunho] = useState<ReadonlySet<string>>(() => new Set())
  const [origemRascunho, setOrigemRascunho] = useState<ReadonlySet<string>>(() => new Set())
  // Botões do cabeçalho da tabela: "Totais" abre/fecha os cards de totais em R$
  // acima da tabela (começam abertos em tela com altura >= ALTURA_TOTAIS_ABERTOS e
  // fechados abaixo disso; a escolha vale até sair da tela);
  // "Filtros" abre o dialog de status/origem (fecha com X, rodapé, clique fora ou
  // Esc). Fechar o de filtros NÃO limpa o marcado — o número no botão avisa que a
  // tabela continua filtrada.
  const [totaisAbertos, setTotaisAbertos] = useState(
    () => typeof window !== 'undefined' && window.innerHeight >= ALTURA_TOTAIS_ABERTOS
  )
  const [filtrosAbertos, setFiltrosAbertos] = useState(false)
  const qtdFiltrosAtivos = statusFiltro.size + origemFiltro.size
  const qtdRascunho = statusRascunho.size + origemRascunho.size
  const painelDisponivel = consulta !== null && !erro
  const vazio = useMemo<ReadonlySet<string>>(() => new Set(), [])
  const contagemStatus = useMemo(() => {
    if (!pedidosQuery.data) return null
    const base = new Set(pedidos.map(chaveStatus))
    return contarPor(filtrarPedidos(pedidos, vazio, origemRascunho), chaveStatus, base)
  }, [pedidosQuery.data, pedidos, origemRascunho, vazio])
  const contagemOrigem = useMemo(() => {
    if (!pedidosQuery.data) return null
    const base = new Set(pedidos.map(chaveOrigem))
    return contarPor(filtrarPedidos(pedidos, statusRascunho, vazio), chaveOrigem, base)
  }, [pedidosQuery.data, pedidos, statusRascunho, vazio])
  const pedidosFiltrados = useMemo(
    () => filtrarPedidos(pedidos, statusFiltro, origemFiltro),
    [pedidos, statusFiltro, origemFiltro]
  )
  // Quantos pedidos o "Ver N pedidos" vai mostrar se o rascunho for aplicado.
  const qtdPrevia = useMemo(
    () => filtrarPedidos(pedidos, statusRascunho, origemRascunho).length,
    [pedidos, statusRascunho, origemRascunho]
  )

  // Abrir o dialog começa o rascunho a partir do que está aplicado.
  function abrirFecharFiltros(aberto: boolean) {
    if (aberto) {
      setStatusRascunho(statusFiltro)
      setOrigemRascunho(origemFiltro)
    }
    setFiltrosAbertos(aberto)
  }

  function aplicarFiltros() {
    setStatusFiltro(statusRascunho)
    setOrigemFiltro(origemRascunho)
    setFiltrosAbertos(false)
  }
  const totais = useMemo(
    () => (pedidosQuery.data ? somarPedidos(pedidosFiltrados) : null),
    [pedidosQuery.data, pedidosFiltrados]
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
    setStatusFiltro(new Set())
    setOrigemFiltro(new Set())
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
          // Valor da coluna = nome traduzido, pra busca, filtro de coluna e ordenação
          // usarem o que o usuário vê ("Cancelado", não "CANCELLED").
          return {
            id: col.campo,
            header: col.header,
            meta,
            accessorFn: (p) => (p.status_do_pedido ? statusPedido(p.status_do_pedido).rotulo : ''),
            // Centralizado na coluna da tabela; no card do celular fica alinhado
            // com os outros campos.
            cell: ({ row }) => {
              const s = row.original.status_do_pedido
              return (
                <div className={cn('flex', !compacto && 'justify-center')}>
                  {s ? (
                    <BadgeStatusPedido status={s} />
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
              )
            },
          }
        }
        if (col.campo === 'origem') {
          // Badge colorido por canal (a origem já vem em português da API),
          // centralizado como o status.
          return {
            ...base,
            cell: ({ row }) => {
              const o = row.original.origem
              return (
                <div className={cn('flex', !compacto && 'justify-center')}>
                  {o ? (
                    <BadgeOrigemPedido origem={o} />
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
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
    [compacto]
  )

  if (!canView) {
    return (
      <div className="m-6 rounded-lg border border-warning/30 bg-warning/10 p-6 text-sm text-foreground">
        Você não tem permissão para acessar o Reports Maestro (<code>reports-maestro.ler</code>).
      </div>
    )
  }

  const subtitle = consulta
    ? `${consulta.lojaNome} · ${formatDataHora(consulta.de)}${
        consulta.de !== consulta.ate ? ` a ${formatDataHora(consulta.ate)}` : ''
      }`
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
      className={cn('h-[calc(100vh-6.5rem)] md:h-[calc(100vh-7.5rem)]', SCROLLBAR_ELEGANTE)}
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

        {/* Cards de totais acima da tabela, abertos/fechados pelo botão "Totais" do
            cabeçalho. Recolhido, o `Recolhivel` cancela o próprio gap do container. */}
        <Recolhivel className="shrink-0" visivel={painelDisponivel && totaisAbertos}>
          <TotaisCards totais={totais} carregando={carregando} compacto={compacto} />
        </Recolhivel>

        {/* Célula da tabela nunca quebra linha (a coluna alarga e a tabela rola na
            horizontal). Vai por seletor porque o DataReport não aceita classe por
            célula; o card do celular não usa <td>, então segue quebrando normal. */}
        <DataReport
          className={cn(
            '[&_td]:whitespace-nowrap',
            // Toolbar ao lado do título (@lg+): se ainda assim quebrar em 2 linhas, a
            // de baixo encosta à direita, alinhada com a de cima.
            '@lg:[&_[data-tour=reports-maestro-toolbar]]:justify-end',
            compacto ? 'shrink-0' : 'min-h-0 flex-1'
          )}
          fillHeight={!compacto}
          title={NOME_MODULO}
          titleExtra={<TourReplayButton onClick={replayTour} />}
          subtitle={subtitle}
          actions={
            <>
              <PainelDialog
                aberto={painelDisponivel && filtrosAbertos}
                onAbertoChange={abrirFecharFiltros}
                titulo="Filtros de status e origem"
                descricao="Marque os botões e clique em Ver pedidos para filtrar a tabela, os totais e o Excel. Dá para marcar mais de um em cada lista."
                tooltip={
                  qtdFiltrosAtivos > 0
                    ? `Abrir os filtros de status e origem (${qtdFiltrosAtivos} marcado${qtdFiltrosAtivos === 1 ? '' : 's'})`
                    : 'Abrir os filtros de status e origem'
                }
                gatilho={
                  <Button
                    variant="outline"
                    className={BOTAO_TOOLBAR}
                    aria-label={
                      qtdFiltrosAtivos > 0 ? `Filtros (${qtdFiltrosAtivos} marcados)` : 'Filtros'
                    }
                    disabled={!painelDisponivel}
                    data-tour="reports-maestro-filtros-toggle"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    <span className={ROTULO_TOOLBAR}>Filtros</span>
                    {/* Com o dialog fechado, o número avisa que a tabela está filtrada. */}
                    {qtdFiltrosAtivos > 0 && (
                      <span className="rounded-full bg-primary px-1.5 text-xs tabular-nums text-primary-foreground">
                        {qtdFiltrosAtivos}
                      </span>
                    )}
                  </Button>
                }
                rodape={
                  <>
                    <Button
                      variant="outline"
                      disabled={qtdRascunho === 0}
                      onClick={() => {
                        setStatusRascunho(new Set())
                        setOrigemRascunho(new Set())
                      }}
                    >
                      Limpar filtros
                    </Button>
                    <Button onClick={aplicarFiltros}>
                      Ver {qtdPrevia.toLocaleString('pt-BR')}{' '}
                      {qtdPrevia === 1 ? 'pedido' : 'pedidos'}
                    </Button>
                  </>
                }
              >
                {/* Status e Origem lado a lado no desktop (cada um uma lista de largura
                    cheia); no celular o dialog é tela cheia e eles empilham. */}
                <div className="grid gap-6 md:grid-cols-2">
                  <StatusFiltro
                    contagem={contagemStatus}
                    selecionados={statusRascunho}
                    onSelecionar={setStatusRascunho}
                    carregando={carregando}
                    compacto={compacto}
                  />
                  <OrigemFiltro
                    contagem={contagemOrigem}
                    selecionados={origemRascunho}
                    onSelecionar={setOrigemRascunho}
                    carregando={carregando}
                    compacto={compacto}
                  />
                </div>
              </PainelDialog>
              <Tooltip
                content={totaisAbertos ? 'Ocultar os totais em R$' : 'Mostrar os totais em R$'}
              >
                <Button
                  variant={totaisAbertos ? 'default' : 'outline'}
                  className={BOTAO_TOOLBAR}
                  aria-label="Totais"
                  aria-pressed={totaisAbertos}
                  disabled={!painelDisponivel}
                  onClick={() => setTotaisAbertos((v) => !v)}
                  data-tour="reports-maestro-totais-toggle"
                >
                  <ChartPie className="h-4 w-4" />
                  <span className={ROTULO_TOOLBAR}>Totais</span>
                </Button>
              </Tooltip>
            </>
          }
          data={erro ? [] : pedidosFiltrados}
          // Só tira as colunas com a lista VAZIA (sem pesquisa, erro, nenhum pedido):
          // com linhas, a busca precisa delas mesmo se não sobrar nenhuma. Carregando,
          // o esqueleto também precisa das colunas.
          columns={!carregando && (erro || pedidosFiltrados.length === 0) ? SEM_COLUNAS : columns}
          loading={carregando}
          getRowId={(p) => p.id}
          globalSearch
          searchPlaceholder="Buscar pedido, cliente, forma de pagamento…"
          countNoun="pedidos"
          pageSize={100}
          columnVisibilityToggle={!compacto}
          fullscreenToggle={!compacto}
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
