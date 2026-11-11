import { useLayoutEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react'
import { AlertTriangle, ChartPie, ListFilter, ReceiptText, RefreshCw, X } from 'lucide-react'
import {
  Button,
  DataReport,
  EmptyState,
  Select,
  TourReplayButton,
  WidthFrame,
  nomeArquivoExport,
  toast,
  type ColumnDef,
} from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'
import { useTourReplayTrigger } from '@gia-cb/sdk/modules'
import { useCanAccess } from '@gia-cb/sdk/permissions'
import { useFechamentoMaestro, useLojasFechamentoMaestro } from '../api/fechamento-maestro'
import { BadgeCheck } from '../components/BadgeCheck'
import { BadgeOrigemPedido } from '../components/BadgeOrigemPedido'
import { BadgeStatusPedido } from '../components/BadgeStatusPedido'
import { BadgeTipoPagamento } from '../components/BadgeTipoPagamento'
import { PainelCanais } from '../components/PainelCanais'
import { DetalhePedidoDialog } from '../components/DetalhePedidoDialog'
import { Dica } from '../components/Dica'
import { FiltrosBar, type FiltrosValor } from '../components/FiltrosBar'
import { Recolhivel } from '../components/Recolhivel'
import { ResumoCards } from '../components/ResumoCards'
import {
  canalDoPedido,
  COLUNAS_DIA,
  COLUNAS_PEDIDO,
  divergente,
  formatBRL,
  formatDataHora,
  hojeLocal,
  NOME_MODULO,
  NOME_DO_TOTAL,
  pedidosDoTotal,
  periodoArquivo,
  preencherPlanilha,
  resumirPorDia,
  resumirTotais,
  TOTAIS_PRINCIPAIS,
  rotuloTiposDoPedido,
  somarDias,
  tiposDoPedido,
  vendasPorCanal,
  validarPeriodo,
} from '../helpers'
import { statusPedido } from '../status-pedido'
import type { Consulta, FiltroTotal, PedidoFechamento } from '../types'

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
/** Valor do seletor de canal para "todos" (o Select do Radix não aceita ''). */
const TODOS_CANAIS = '__todos__'

const SEM_COLUNAS_PEDIDO: ColumnDef<PedidoFechamento, unknown>[] = []

/**
 * Botões da toolbar do `DataReport` (que é `@container`). De @lg a @5xl a toolbar
 * fica AO LADO do título e não cabe com rótulos: os botões viram só ícone (o
 * tooltip e o `aria-label` dizem o nome). Abaixo de @lg e a partir de @5xl: rótulo.
 * Em tela de toque (`hover: none`) o rótulo fica sempre visível — lá o tooltip não
 * abre, e só o ícone não diria o que o botão faz.
 */
const BOTAO_TOOLBAR = 'px-2.5 @max-lg:px-4 @5xl:px-4 [@media(hover:none)]:px-4'
const ROTULO_TOOLBAR = '@lg:hidden @5xl:inline [@media(hover:none)]:inline'

/** Campos que formam a face do card no celular; o resto fica em "ver mais". */
const CAMPOS_CARD_PEDIDO = new Set<string>(['n_pedido', 'data_de_criacao', 'total_pago', 'tipo'])

/**
 * Colunas obrigatórias do legado (`isMandatory`): sempre visíveis, fora do menu de
 * colunas.
 */
const COLUNAS_OBRIGATORIAS = new Set<string>([
  'n_pedido',
  'data_de_criacao',
  'nome_cliente',
  'origem',
  'status_do_pedido',
  'forma_de_pagamentos',
  'tipo',
])

/**
 * Colunas inativas do legado: nascem desligadas e se ligam pelo menu de colunas.
 * As ativas (`DEFAULT_SELECTED_COLUMNS` do legado) são as que não estão aqui.
 */
const COLUNAS_INATIVAS: Record<string, false> = Object.fromEntries(
  [
    'data',
    'total_pago_online',
    'total_pago_adquirentes_online',
    'total_pago_adquirentes_offline',
    'total_pago_offline',
    'total_de_descontos',
    'venda_concluida',
    'check_pagamentos',
    'check_descontos',
    'data_de_acao',
    'cpf_cliente',
    'quantidade_pedidos',
    'email_cliente',
    'telefone_cliente',
    'street_name',
    'street_number',
    'reference',
    'retirada',
    'confirmado_por',
    'cancelado_por',
    'valor_do_pedido',
    'valor_da_entrega',
    'descontos',
    'tipo_entrega',
    'nome_loja',
  ].map((id) => [id, false as const])
)

type CampoTexto = {
  [K in keyof PedidoFechamento]: PedidoFechamento[K] extends string | null ? K : never
}[keyof PedidoFechamento]
type CampoNumero = {
  [K in keyof PedidoFechamento]: PedidoFechamento[K] extends number ? K : never
}[keyof PedidoFechamento]

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
async function exportarXlsx(
  pedidos: PedidoFechamento[],
  consulta: Consulta,
  totalPesquisa: number,
  /** Canal e/ou indicador de totais que filtram a tabela, se houver (ex.: "iFood · Online"). */
  filtroTotal: string | null
) {
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
  // Exporta o que está na tela: com filtro de totais, "Só divergências" ou filtro
  // de coluna, avisa em cada aba que os totais são do recorte, não do fechamento.
  const filtro =
    pedidos.length < totalPesquisa
      ? ` · filtrado${filtroTotal ? ` (${filtroTotal})` : ''}: ${pedidos.length.toLocaleString('pt-BR')} de ${plural(totalPesquisa, 'pedido', 'pedidos')}`
      : ''

  preencherPlanilha(
    wb.addWorksheet('Fechamento diário'),
    dias,
    COLUNAS_DIA,
    cab,
    `Fechamento diário · ${plural(dias.length, 'dia', 'dias')} · cancelados fora dos valores${filtro}`
  )
  preencherPlanilha(
    wb.addWorksheet('Pedidos'),
    validos,
    COLUNAS_PEDIDO,
    cab,
    `Pedidos do fechamento · ${plural(validos.length, 'pedido', 'pedidos')} (sem cancelados)${filtro}`
  )
  preencherPlanilha(
    wb.addWorksheet('Cancelados'),
    cancelados,
    COLUNAS_PEDIDO,
    cab,
    `Pedidos cancelados · ${plural(cancelados.length, 'pedido', 'pedidos')} (fora do fechamento)${filtro}`
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
  // Indicador da barra de totais que filtra a tabela (clique no indicador).
  const [filtroTotal, setFiltroTotal] = useState<FiltroTotal | null>(null)
  // Canal (origem) escolhido no seletor da barra de filtros ou no anel da seção
  // de totais; `null` = todos. Diferente do indicador, o canal recorta TUDO:
  // totais, tabela, divergências e Exportar. Vale na hora, sem Pesquisar, e fica
  // entre pesquisas como a loja e o período — o `canal` efetivo (abaixo) volta a
  // todos quando a pesquisa nova não tem aquele canal.
  const [canalEscolhido, setCanal] = useState<string | null>(null)
  // Seção de totais: segue a altura da tela até o usuário clicar em "Totais";
  // daí em diante vale a escolha dele. No celular começa fechada (padrão 3).
  const telaAlta = useTelaAlta()
  const [totaisEscolhidos, setTotaisEscolhidos] = useState<boolean | null>(null)
  const totaisAbertos = totaisEscolhidos ?? (telaAlta && !compacto)

  // Venda de cada canal da pesquisa inteira (o anel não muda com o canal escolhido).
  const canais = useMemo(() => vendasPorCanal(pedidos), [pedidos])
  const canal =
    canalEscolhido !== null && canais.some((c) => c.canal === canalEscolhido)
      ? canalEscolhido
      : null
  // Os pedidos do canal escolhido (todos, sem canal). É a base dos totais e da tabela.
  const pedidosCanal = useMemo(
    () => (canal ? pedidos.filter((p) => canalDoPedido(p) === canal) : pedidos),
    [pedidos, canal]
  )
  const totais = useMemo(
    () => (fechamentoQuery.data ? resumirTotais(pedidosCanal) : null),
    [fechamentoQuery.data, pedidosCanal]
  )
  // A tabela: os pedidos do canal, do indicador escolhido (se houver) e, com "Só
  // divergências", só os divergentes entre eles. Os totais seguem o canal, mas
  // não o indicador nem "Só divergências" (senão o clique num card zeraria os outros).
  const pedidosVisao = useMemo(() => {
    const doTotal = filtroTotal ? pedidosDoTotal(pedidosCanal, filtroTotal) : pedidosCanal
    return soDivergencias ? doTotal.filter(divergente) : doTotal
  }, [pedidosCanal, filtroTotal, soDivergencias])
  // Aviso na barra de totais quando eles são de um canal só.
  const recorteTotais = canal
    ? `Totais só de ${canal} · ${pedidosCanal.length.toLocaleString('pt-BR')} de ${pedidos.length.toLocaleString('pt-BR')} pedidos`
    : null
  const nomeFiltroExport =
    [canal, filtroTotal ? NOME_DO_TOTAL[filtroTotal] : null].filter(Boolean).join(' · ') || null

  const semAlteracao =
    consulta !== null &&
    consulta.empresaId === empresaIdSelecionada &&
    consulta.de === filtros.de &&
    consulta.ate === filtros.ate

  /** Dispara a pesquisa. Devolve `false` quando ela foi recusada (filtro inválido). */
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
    setSoDivergencias(false)
    setFiltroTotal(null)
    setConsulta({
      empresaId: loja.empresaId,
      lojaNome: loja.nome,
      de: filtros.de,
      ate: filtros.ate,
    })
    return true
  }

  // Ordem do `ALL_COLUMNS` do legado: as calculadas primeiro, depois os campos da
  // API. Ativas, inativas e obrigatórias: `COLUNAS_INATIVAS` e `COLUNAS_OBRIGATORIAS`.
  const colunasPedido = useMemo<ColumnDef<PedidoFechamento, unknown>[]>(() => {
    const base = (id: string) => ({
      id,
      meta: CAMPOS_CARD_PEDIDO.has(id) ? { mobile: 'primary' as const } : undefined,
      enableHiding: !COLUNAS_OBRIGATORIAS.has(id),
    })
    const centro = (conteudo: ReactNode) => (
      <div className={cn('flex', !compacto && 'justify-center')}>{conteudo}</div>
    )
    const texto = (id: CampoTexto, header: string): ColumnDef<PedidoFechamento, unknown> => ({
      ...base(id),
      accessorKey: id,
      header,
      cell: ({ row }) => row.original[id] ?? vazio,
    })
    const valor = (id: CampoNumero, header: string): ColumnDef<PedidoFechamento, unknown> => ({
      ...base(id),
      accessorKey: id,
      header,
      cell: ({ row }) => moeda(row.original[id]),
    })
    const dataHora = (id: 'data' | 'data_de_criacao' | 'data_de_acao', header: string) =>
      ({
        ...base(id),
        accessorKey: id,
        header,
        cell: ({ row }) => (
          <span className="whitespace-nowrap tabular-nums">{formatDataHora(row.original[id])}</span>
        ),
      }) satisfies ColumnDef<PedidoFechamento, unknown>
    const check = (id: 'check_pagamentos' | 'check_descontos', header: string) =>
      ({
        ...base(id),
        header,
        accessorFn: (p) => (p[id] ? 'OK' : 'Divergente'),
        cell: ({ row }) => centro(<BadgeCheck ok={row.original[id]} />),
      }) satisfies ColumnDef<PedidoFechamento, unknown>

    return [
      // Calculadas
      dataHora('data', 'Data'),
      valor('total_pago_online', 'Total pago online'),
      valor('total_pago_adquirentes_online', 'Total pago adquirentes online'),
      valor('total_pago_adquirentes_offline', 'Total pago adquirentes offline'),
      valor('total_pago_offline', 'Total pago offline'),
      valor('total_de_descontos', 'Total de descontos'),
      {
        ...base('venda_concluida'),
        header: 'Venda concluída',
        accessorFn: (p) => (p.venda_concluida ? 'Sim' : 'Não'),
      },
      check('check_pagamentos', 'Check pagamentos'),
      check('check_descontos', 'Check descontos'),
      // Campos da API
      {
        ...base('n_pedido'),
        accessorKey: 'n_pedido',
        header: 'Nº pedido',
        cell: ({ row }) => <span className="font-medium">{row.original.n_pedido || '—'}</span>,
      },
      dataHora('data_de_criacao', 'Data criação'),
      dataHora('data_de_acao', 'Data de ação'),
      texto('n_parceiro', 'Nº parceiro'),
      texto('n_conta', 'Nº conta'),
      texto('cpf_cliente', 'CPF cliente'),
      texto('nome_cliente', 'Nome cliente'),
      {
        ...base('quantidade_pedidos'),
        accessorKey: 'quantidade_pedidos',
        header: 'Qtd pedidos',
        cell: ({ row }) => (
          <span className="tabular-nums">
            {row.original.quantidade_pedidos?.toLocaleString('pt-BR') ?? '—'}
          </span>
        ),
      },
      texto('email_cliente', 'Email cliente'),
      texto('telefone_cliente', 'Telefone cliente'),
      texto('street_name', 'Rua'),
      texto('street_number', 'Número'),
      texto('reference', 'Referência'),
      texto('retirada', 'Retirada'),
      texto('confirmado_por', 'Confirmado por'),
      texto('cancelado_por', 'Cancelado por'),
      {
        ...base('origem'),
        accessorKey: 'origem',
        header: 'Origem',
        cell: ({ row }) =>
          centro(row.original.origem ? <BadgeOrigemPedido origem={row.original.origem} /> : vazio),
      },
      {
        // Valor da coluna = nome traduzido, pra busca e filtro usarem o que se vê.
        ...base('status_do_pedido'),
        header: 'Status do pedido',
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
      valor('valor_do_pedido', 'Valor do pedido'),
      valor('valor_da_entrega', 'Valor da entrega'),
      valor('total_pago', 'Total pago'),
      valor('desconto_total', 'Desconto total'),
      texto('forma_de_pagamentos', 'Forma de pagamento'),
      {
        // Coluna TIPO do legado. Valor = "ONLINE; ONLINE VR", pra busca e filtro.
        ...base('tipo'),
        header: 'Tipo',
        accessorFn: rotuloTiposDoPedido,
        cell: ({ row }) => {
          const tipos = tiposDoPedido(row.original)
          return centro(
            tipos.length === 0 ? (
              vazio
            ) : (
              // Quando os badges quebram de linha, cada linha também fica centralizada.
              <div className={cn('flex flex-wrap gap-1', !compacto && 'justify-center')}>
                {tipos.map((t) => (
                  <BadgeTipoPagamento key={t} tipo={t} />
                ))}
              </div>
            )
          )
        },
      },
      texto('descontos', 'Descontos'),
      texto('tipo_entrega', 'Tipo de entrega'),
      texto('nome_loja', 'Nome loja'),
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
        description={
          filtroTotal
            ? `Nenhum pedido de ${NOME_DO_TOTAL[filtroTotal]}${canal ? ` em ${canal}` : ''} com divergência.`
            : `Nenhum pedido${canal ? ` de ${canal}` : ''} com divergência — os pagamentos e descontos conferem.`
        }
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
      {/* Filtro ligado por um indicador de totais: mostra qual e tira com um toque. */}
      {filtroTotal && (
        <Dica content="Tirar o filtro e voltar a ver todos os pedidos">
          <Button
            variant="default"
            className="max-w-full animate-in fade-in duration-default"
            aria-label={`Filtro: ${NOME_DO_TOTAL[filtroTotal]}. Tirar o filtro`}
            onClick={() => setFiltroTotal(null)}
          >
            <span className="truncate">{NOME_DO_TOTAL[filtroTotal]}</span>
            <X className="h-4 w-4 shrink-0" />
          </Button>
        </Dica>
      )}
      <Dica
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
      </Dica>
      {/* Totais abre e fecha a seção de canais e totais acima da tabela. */}
      <Dica content={totaisAbertos ? 'Ocultar os canais e totais' : 'Mostrar os canais e totais'}>
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
      </Dica>
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
          tituloExtra={<TourReplayButton onClick={replayTour} />}
          seletorCanal={
            // Vale na hora (não precisa de Pesquisar); antes do resultado, ou com
            // um canal só na pesquisa, fica desativado em "Todos os canais".
            <Select
              value={canal ?? TODOS_CANAIS}
              onValueChange={(v) => setCanal(v === TODOS_CANAIS ? null : v)}
              disabled={!painelDisponivel || carregando || canais.length < 2}
            >
              <Select.Trigger
                className={cn('h-10 w-full', canal && 'border-primary text-primary')}
                aria-label="Canal"
              />
              <Select.Content>
                <Select.Item value={TODOS_CANAIS}>Todos os canais</Select.Item>
                {canais.map((c) => (
                  <Select.Item key={c.canal} value={c.canal}>
                    {c.canal}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          }
        />

        <Recolhivel className="shrink-0" visivel={painelDisponivel && totaisAbertos}>
          <ResumoCards
            tourPrefixo={
              painelDisponivel && totaisAbertos && !carregando
                ? 'fechamento-maestro-totais'
                : undefined
            }
            lateral={
              <PainelCanais
                canais={canais}
                canal={canal}
                onCanalChange={setCanal}
                carregando={carregando}
              />
            }
            totais={totais}
            carregando={carregando}
            recorte={recorteTotais}
            filtro={filtroTotal}
            onFiltroChange={setFiltroTotal}
            principais={TOTAIS_PRINCIPAIS}
          />
        </Recolhivel>

        <DataReport<PedidoFechamento>
          className={cn(
            '[&_td]:whitespace-nowrap',
            '@lg:[&_[data-tour=fechamento-maestro-toolbar]]:justify-end',
            compacto ? 'shrink-0' : 'min-h-0 flex-1'
          )}
          fillHeight={!compacto}
          title="Pedidos"
          actions={acoes}
          loading={carregando}
          // Busca genérica só no celular; no desktop, os filtros de cada coluna.
          globalSearch={compacto}
          // Também no celular: é por ele que se ligam as colunas inativas nos cards.
          columnVisibilityToggle
          initialColumnVisibility={COLUNAS_INATIVAS}
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
              ? (visiveis) => exportarXlsx(visiveis, consulta, pedidos.length, nomeFiltroExport)
              : undefined
          }
        />
      </div>

      <DetalhePedidoDialog pedido={pedidoAberto} onFechar={() => setPedidoAberto(null)} />
    </WidthFrame>
  )
}
