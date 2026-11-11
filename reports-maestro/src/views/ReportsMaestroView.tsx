import { useLayoutEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Bike, ChartPie, RefreshCw, SlidersHorizontal } from 'lucide-react'
import {
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
import { Dica } from '../components/Dica'
import { fadeIn } from '@gia-cb/ui/motion'
import { useTourProgress, useTourReplayTrigger } from '@gia-cb/sdk/modules'
import { useCanAccess } from '@gia-cb/sdk/permissions'
import { useLojasReportsMaestro, usePedidosReportsMaestro } from '../api/reports-maestro'
import { AbasDoReports } from '../components/AbasDoReports'
import { tour } from '../tour'
import { AbaOperacional } from '../components/operacional/AbaOperacional'
import { TourDasAbas } from '../components/operacional/TourDasAbas'
import { TOUR_DAS_ABAS_ID } from '../tour-das-abas'
import { SeletorDeCanal } from '../components/operacional/SeletorDeCanal'
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
  COLUNAS_OCULTAS,
  contarPor,
  filtrarPedidos,
  formatBRL,
  formatDataHora,
  hojeLocal,
  NOME_MODULO,
  periodoArquivo,
  simNao,
  preencherPlanilha,
  somarDias,
  somarPedidos,
  validarPeriodo,
} from '../helpers'
import { canaisDosPedidos, type AbaReports } from '../operacional'
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
const ROTULO_TOOLBAR = '@lg:hidden @5xl:inline [@media(hover:none)]:!inline'

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

async function exportarXlsx(
  pedidos: PedidoMaestro[],
  consulta: Consulta,
  dadosClienteMascarados: boolean
) {
  const { Workbook } = await import('exceljs')
  const wb = new Workbook()
  wb.creator = NOME_MODULO
  preencherPlanilha(wb.addWorksheet('Pedidos'), pedidos, {
    lojaNome: consulta.lojaNome,
    de: consulta.de,
    ate: consulta.ate,
    geradoEm: new Date(),
    dadosClienteMascarados,
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
  // Só decide a CHAVE da consulta (refaz se a permissão mudar); quem mascara é o servidor.
  const canVerDadosCliente = useCanAccess('reports-maestro.ver-dados-cliente')
  const replayTour = useTourReplayTrigger('reports-maestro')

  // Como no legado, o período começa em ontem → ontem.
  const ontem = somarDias(hojeLocal(), -1)
  const [filtros, setFiltros] = useState<FiltrosValor>({ empresaId: null, de: ontem, ate: ontem })
  // Snapshot do clique em "Pesquisar": mudar o formulário sem pesquisar de novo não
  // troca a tabela nem o nome do Excel.
  const [consulta, setConsulta] = useState<Consulta | null>(null)

  // A aba aberta. As duas leem o MESMO resultado da pesquisa (uma chamada só à
  // API); trocar de aba não busca de novo — ver api/reports-maestro.ts.
  //
  // A tela abre SEMPRE no Operacional (pedido do usuário em 05/11/2026 e de novo
  // em 09/11/2026), inclusive na primeira visita: o tour da tela só aponta para o
  // que aparece nas duas abas, e o tour das abas troca de aba sozinho.
  const [aba, setAba] = useState<AbaReports>('operacional')

  // ── Tour das abas ──────────────────────────────────────────────────────────
  //
  // O tour da tela (`tour.ts`) é montado pelo portal, que não avisa o módulo
  // quando o passo muda — um passo dele não troca a aba. O que é de cada aba
  // está no tour das abas (`tour-das-abas.ts`), montado aqui com `useTourTabSync`.
  //
  // Ele só é montado depois que TODOS os passos do tour da tela foram vistos (os
  // dois nunca juntos) e não começa para quem PULOU o tour da tela — "Rever
  // tour" passa pelos dois.
  //
  // No "Rever tour" o progresso do tour da tela é zerado, mas a tela pode nunca
  // ver o zerado: se o usuário clica em "Próximo" antes de a busca do progresso
  // voltar, o SDK cancela essa busca e grava o passo por cima do progresso
  // ANTIGO. Por isso o clique tira uma foto das marcas (data de conclusão ou de
  // pulo) de cada passo, e um passo só conta como visto quando a marca dele muda
  // depois da foto — sem depender de tempo de rede.
  const progressoDoTour = useTourProgress('reports-maestro')
  const replayTourDasAbas = useTourReplayTrigger(TOUR_DAS_ABAS_ID)
  const [marcasAntesDoRever, setMarcasAntesDoRever] = useState<ReadonlySet<string> | null>(null)
  const marcasDaTela = useMemo(() => {
    const m = new Map<string, { marca: string; pulou: boolean }>()
    for (const p of progressoDoTour.data ?? []) {
      const marca = p.completed_at ?? p.skipped_at
      // Só os passos ATUAIS: linha de passo que já saiu do `tour.ts` não conta.
      if (marca && tour.steps.some((s) => s.id === p.step_id)) {
        m.set(p.step_id, { marca, pulou: p.skipped_at != null })
      }
    }
    return m
  }, [progressoDoTour.data])
  const vistos = tour.steps
    .map((s) => marcasDaTela.get(s.id))
    .filter(
      (v): v is { marca: string; pulou: boolean } =>
        v != null && (marcasAntesDoRever == null || !marcasAntesDoRever.has(v.marca))
    )
  const tourDaTelaVisto = progressoDoTour.data != null && vistos.length === tour.steps.length
  const pulouTourDaTela = vistos.some((v) => v.pulou)
  const podeMontarTourDasAbas = tourDaTelaVisto && !pulouTourDaTela
  const [tourDasAbasAberto, setTourDasAbasAberto] = useState(false)

  const [area, setArea] = useState<HTMLDivElement | null>(null)
  const compacto = useModoCompacto(area)

  const lojasQuery = useLojasReportsMaestro(canView)
  const lojas = useMemo(() => lojasQuery.data?.lojas ?? [], [lojasQuery.data])
  // Sem escolha do usuário, vale a primeira loja da lista (como no legado).
  const empresaIdSelecionada = filtros.empresaId ?? lojas[0]?.empresaId ?? null

  const periodoConsultado = useMemo(
    () => (consulta ? { empresaId: consulta.empresaId, de: consulta.de, ate: consulta.ate } : null),
    [consulta]
  )
  const pedidosQuery = usePedidosReportsMaestro(periodoConsultado, canVerDadosCliente)
  const pedidos = useMemo(() => pedidosQuery.data?.pedidos ?? [], [pedidosQuery.data])
  const carregando = pedidosQuery.isFetching
  const erro = pedidosQuery.error ?? lojasQuery.error
  const pesquisando = carregando

  // Canal do dashboard Operacional (`null` = todos). Mora aqui, e não na aba,
  // porque o seletor fica na linha das abas (ver AbasDoReports). Volta para
  // "todos" a cada pesquisa; um canal que não existe no resultado vale "todos".
  const operacional = pedidosQuery.data?.operacional ?? null
  const temDashboardReal = !carregando && !erro && operacional != null && operacional.length > 0
  const canais = useMemo(() => canaisDosPedidos(operacional ?? []), [operacional])
  const [canalEscolhido, setCanal] = useState<string | null>(null)
  const canal = canalEscolhido != null && canais.includes(canalEscolhido) ? canalEscolhido : null
  // O seletor só aparece com a aba Operacional aberta e o dashboard montado.
  const mostrarCanal = aba === 'operacional' && temDashboardReal
  // O tour das abas só começa com o dashboard montado (os alvos dele só existem
  // com pedidos): quem terminou o tour da tela sem pesquisar vê o tour continuar
  // sozinho quando a pesquisa trouxer pedidos — do passo em que parou, porque o
  // progresso de cada passo fica gravado. Já aberto, segue montado mesmo que uma
  // pesquisa nova esvazie a tela no meio dele.
  const montarTourDasAbas = podeMontarTourDasAbas && (temDashboardReal || tourDasAbasAberto)

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
  // fechados abaixo disso e no celular; a escolha vale até sair da tela). O celular
  // vai pela largura da janela: o `compacto` só é medido depois do 1º render;
  // "Filtros" abre o dialog de status/origem (fecha com X, rodapé, clique fora ou
  // Esc). Fechar o de filtros NÃO limpa o marcado — o número no botão avisa que a
  // tabela continua filtrada.
  const [totaisAbertos, setTotaisAbertos] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.innerWidth >= LARGURA_COMPACTA &&
      window.innerHeight >= ALTURA_TOTAIS_ABERTOS
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

  /** Dispara a pesquisa; `false` quando recusou (a barra de filtros fica aberta). */
  function pesquisar(): boolean {
    if (semAlteracao) return false
    const msg = validarPeriodo(filtros.de, filtros.ate)
    if (msg) {
      toast.error(msg)
      return false
    }
    const loja = lojas.find((l) => l.empresaId === empresaIdSelecionada)
    if (!loja) {
      toast.error('Informe uma loja.')
      return false
    }
    setStatusFiltro(new Set())
    setOrigemFiltro(new Set())
    setCanal(null)
    setConsulta({
      empresaId: loja.empresaId,
      lojaNome: loja.nome,
      de: filtros.de,
      ate: filtros.ate,
    })
    return true
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
                {formatBRL(row.original[col.campo] as number | null)}
              </span>
            ),
          }
        }
        if (col.tipo === 'booleano') {
          // Valor da coluna = "Sim"/"Não", pra busca, filtro e ordenação; sem valor, vazio.
          return {
            id: col.campo,
            header: col.header,
            meta,
            accessorFn: (p) => simNao(p[col.campo] as boolean | null) ?? '',
            cell: ({ getValue }) => {
              const v = getValue() as string
              return v ? v : <span className="text-muted-foreground">—</span>
            },
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

  // O título do módulo fica no cabeçalho dos filtros; aqui, só o que a tabela mostra.
  const subtitle = consulta
    ? `${consulta.lojaNome} · ${formatDataHora(consulta.de)}${
        consulta.de !== consulta.ate ? ` a ${formatDataHora(consulta.ate)}` : ''
      }`
    : undefined

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
          pesquisando={pesquisando}
          onPesquisar={pesquisar}
          semAlteracao={semAlteracao}
          compacto={compacto}
          tituloExtra={
            <TourReplayButton
              onClick={() => {
                // Zera os dois tours: o da tela roda primeiro, e o das abas só
                // volta depois que cada passo dele for visto de novo (ver
                // `marcasAntesDoRever`).
                setMarcasAntesDoRever(new Set([...marcasDaTela.values()].map((v) => v.marca)))
                void replayTourDasAbas()
                replayTour()
              }}
            />
          }
        />

        <AbasDoReports
          ativa={aba}
          onChange={setAba}
          acao={
            mostrarCanal && (
              <motion.div variants={fadeIn} initial="hidden" animate="visible">
                <SeletorDeCanal canal={canal} canais={canais} onChange={setCanal} />
              </motion.div>
            )
          }
        />

        {aba === 'operacional' ? (
          <motion.div
            key="operacional"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            className={cn('flex flex-col', compacto ? 'shrink-0' : 'min-h-0 flex-1')}
          >
            <AbaOperacional
              consulta={consulta}
              pedidos={operacional}
              carregando={carregando}
              erro={pedidosQuery.error ?? lojasQuery.error}
              onTentarDeNovo={() => {
                if (lojasQuery.isError) void lojasQuery.refetch()
                if (pedidosQuery.isError) void pedidosQuery.refetch()
              }}
              canal={canal}
              compacto={compacto}
              className={compacto ? undefined : 'min-h-0 flex-1'}
            />
          </motion.div>
        ) : (
          <motion.div
            key="pedidos"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            className={cn('flex flex-col gap-3', compacto ? 'shrink-0' : 'min-h-0 flex-1')}
          >
            {/* Cards de totais acima da tabela, abertos/fechados pelo botão "Totais" do
            cabeçalho. Recolhido, o `Recolhivel` cancela o próprio gap do container. */}
            <Recolhivel className="shrink-0" visivel={painelDisponivel && totaisAbertos}>
              <TotaisCards totais={totais} carregando={carregando} />
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
                          qtdFiltrosAtivos > 0
                            ? `Filtros (${qtdFiltrosAtivos} marcados)`
                            : 'Filtros'
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
                  <Dica
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
                  </Dica>
                </>
              }
              data={erro ? [] : pedidosFiltrados}
              // Só tira as colunas com a lista VAZIA (sem pesquisa, erro, nenhum pedido):
              // com linhas, a busca precisa delas mesmo se não sobrar nenhuma. Carregando,
              // o esqueleto também precisa das colunas.
              columns={
                !carregando && (erro || pedidosFiltrados.length === 0) ? SEM_COLUNAS : columns
              }
              loading={carregando}
              getRowId={(p) => p.id}
              // Busca geral só no celular (cards); no desktop a tabela tem filtro por coluna.
              globalSearch={compacto}
              searchPlaceholder="Buscar pedido, cliente, forma de pagamento…"
              countNoun="pedidos"
              pageSize={100}
              columnVisibilityToggle={!compacto}
              initialColumnVisibility={COLUNAS_OCULTAS}
              fullscreenToggle={!compacto}
              onExport={
                canExport && consulta && pedidosQuery.data
                  ? (visiveis) =>
                      exportarXlsx(visiveis, consulta, pedidosQuery.data!.dadosClienteMascarados)
                  : undefined
              }
              emptyState={emptyState}
              toolbarTourId="reports-maestro-toolbar"
            />
          </motion.div>
        )}
      </div>
      {montarTourDasAbas && (
        <TourDasAbas aba={aba} onAba={setAba} onAberto={setTourDasAbasAberto} />
      )}
    </WidthFrame>
  )
}
