import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertTriangle, ChevronRight, Eye, FileSearch, RefreshCw, Search, X } from 'lucide-react'
import {
  Badge,
  Button,
  DataReport,
  EmptyState,
  Input,
  Select,
  Tooltip,
  TourReplayButton,
  WidthFrame,
  toast,
  type BadgeProps,
  type ColumnDef,
} from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'
import { useTourReplayTrigger } from '@gia-cb/sdk/modules'
import { useCanAccess } from '@gia-cb/sdk/permissions'
import { useUser } from '@gia-cb/sdk/auth'
import {
  useContasValidacaoFiscal,
  useLojasValidacaoFiscal,
  useNotasValidacaoFiscal,
} from '../api/validacao-fiscal'
import { DetalheModal } from '../components/DetalheModal'
import { FiltrosBar, type FiltrosValor } from '../components/FiltrosBar'
import { ResumoCards } from '../components/ResumoCards'
import { StatusValidacaoBadge } from '../components/StatusValidacaoBadge'
import { BARRA_SO_AO_ROLAR, useBarraAoRolar } from '../hooks/useBarraAoRolar'
import { lerMemoriaDaPesquisa, gravarMemoriaDaPesquisa } from '../hooks/memoriaDaPesquisa'
import { useModoCompacto } from '../hooks/useModoCompacto'
import {
  DEFAULT_JANELA_ANTES_HORAS,
  DEFAULT_JANELA_APOS_HORAS,
  formatBRL,
  termosDeBusca,
  textoDeBusca,
  formatDataHora,
  hojeLocal,
  NOME_MODULO,
  nomeArquivoExport,
  preencherPlanilha,
  passaNoFiltro,
  somarDias,
  STATUS_LABEL,
  validarPeriodo,
  VARIANTE_STATUS,
  validateData,
} from '../helpers'
import type { Consulta, FiltroStatus, ValidationResult } from '../types'

// Mesmos rótulos do seletor de status do legado; a cor do badge de quantidade é
// a mesma do badge do status na tabela.
const OPCOES_FILTRO: { value: FiltroStatus; label: string; cor: BadgeProps['variant'] }[] = [
  { value: 'TODOS', label: 'Status: Todos', cor: 'secondary' },
  { value: 'ERROS', label: 'Apenas Erros', cor: 'destructive' },
  { value: 'OK', label: 'Conciliado (OK)', cor: VARIANTE_STATUS.OK },
  {
    value: 'CHECK_SEM_XML',
    label: STATUS_LABEL.CHECK_SEM_XML,
    cor: VARIANTE_STATUS.CHECK_SEM_XML,
  },
  {
    value: 'XML_SEM_CONTA',
    label: STATUS_LABEL.XML_SEM_CONTA,
    cor: VARIANTE_STATUS.XML_SEM_CONTA,
  },
  { value: 'DUPLICIDADE', label: STATUS_LABEL.DUPLICIDADE, cor: VARIANTE_STATUS.DUPLICIDADE },
  {
    value: 'DIVERGENCIA_VALOR',
    label: STATUS_LABEL.DIVERGENCIA_VALOR,
    cor: VARIANTE_STATUS.DIVERGENCIA_VALOR,
  },
]

/** Data do dia operacional (`YYYY-MM-DD`) → `DD/MM/AAAA`, como no legado. */
function formatBusDate(valor: string | null | undefined): string {
  if (!valor) return '-'
  const [ano, mes, dia] = valor.split('-')
  return `${dia}/${mes}/${ano}`
}

async function exportarXlsx(linhas: ValidationResult[], consulta: Consulta, filtroLabel: string) {
  const { Workbook } = await import('exceljs')
  const wb = new Workbook()
  wb.creator = NOME_MODULO
  preencherPlanilha(wb.addWorksheet(NOME_MODULO), linhas, {
    lojaNome: consulta.lojaNome,
    de: consulta.de,
    ate: consulta.ate,
    filtroLabel,
    janelaAntes: consulta.janelaAntes,
    janelaApos: consulta.janelaApos,
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
  a.download = `${nomeArquivoExport(consulta.lojaNome, consulta.de, consulta.ate)}.xlsx`
  a.click()
  URL.revokeObjectURL(url)
}

export function ValidacaoFiscalView() {
  const canView = useCanAccess('validacao-fiscal.ler')
  const canExport = useCanAccess('validacao-fiscal.exportar')
  const replayTour = useTourReplayTrigger('validacao-fiscal')

  // Ao voltar para a tela (pelo menu), ela retoma a última pesquisa deste usuário —
  // só em memória, enquanto o portal está aberto (ver memoriaDaPesquisa).
  const { user } = useUser()
  const usuarioId = user?.id ?? null
  const [memoria] = useState(() => lerMemoriaDaPesquisa(usuarioId))

  const ontem = somarDias(hojeLocal(), -1)
  const [filtros, setFiltros] = useState<FiltrosValor>(
    () =>
      memoria?.filtros ?? {
        empresaId: null,
        de: ontem,
        ate: ontem,
        janelaAntes: DEFAULT_JANELA_ANTES_HORAS,
        janelaApos: DEFAULT_JANELA_APOS_HORAS,
      }
  )
  // Snapshot do clique em "Pesquisar": mudar o formulário sem pesquisar de novo
  // não recalcula (nem renomeia o Excel de) uma consulta antiga.
  const [consulta, setConsulta] = useState<Consulta | null>(memoria?.consulta ?? null)
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>(memoria?.filtroStatus ?? 'TODOS')
  const [detalhe, setDetalhe] = useState<ValidationResult | null>(null)

  // Layout de celular decidido pela largura da ÁREA da tela (ver useModoCompacto).
  const [area, setArea] = useState<HTMLDivElement | null>(null)
  const compacto = useModoCompacto(area)
  // Barras de rolagem só aparecem enquanto o usuário rola — em todo o módulo.
  useBarraAoRolar()
  // Com uma pesquisa retomada, o painel de filtros do celular já volta recolhido.
  const [filtrosAbertos, setFiltrosAbertos] = useState(!memoria?.consulta)
  // Celular: busca única em todos os campos dos registros (no desktop, os filtros
  // ficam no cabeçalho de cada coluna da tabela).
  const [busca, setBusca] = useState(memoria?.busca ?? '')

  const lojasQuery = useLojasValidacaoFiscal(canView)
  const lojas = useMemo(() => lojasQuery.data ?? [], [lojasQuery.data])

  // Sem escolha do usuário, vale a primeira loja da lista.
  const empresaIdSelecionada = filtros.empresaId ?? lojas[0]?.empresaId ?? null

  useEffect(() => {
    gravarMemoriaDaPesquisa(usuarioId, {
      filtros: { ...filtros, empresaId: empresaIdSelecionada },
      consulta,
      filtroStatus,
      busca,
    })
  }, [usuarioId, filtros, empresaIdSelecionada, consulta, filtroStatus, busca])

  const periodo = consulta
    ? { empresaId: consulta.empresaId, de: consulta.de, ate: consulta.ate }
    : null
  const contasQuery = useContasValidacaoFiscal(periodo)
  const notasQuery = useNotasValidacaoFiscal(periodo)

  const carregando = contasQuery.isFetching || notasQuery.isFetching
  const erro = contasQuery.error ?? notasQuery.error

  const resultado = useMemo(() => {
    if (!consulta || !contasQuery.data || !notasQuery.data) return null
    // A conta do DW traz o loc_ref da BI ("01 CB Go"); o legado mostrava o nome da
    // loja que vem nas notas ("01. CB Goiania"). Os dois lados são da mesma loja
    // (mesmo loc_ref), então o nome das notas vale para as contas.
    const nomeLoja = notasQuery.data.loja ?? consulta.lojaNome
    return validateData(
      contasQuery.data.contas.map((c) => ({ ...c, Loja: nomeLoja })),
      notasQuery.data.notas,
      consulta.janelaApos,
      consulta.janelaAntes,
      consulta.de,
      consulta.ate
    )
  }, [consulta, contasQuery.data, notasQuery.data])

  const linhas = useMemo(
    () => (resultado?.results ?? []).filter((r) => passaNoFiltro(r, filtroStatus)),
    [resultado, filtroStatus]
  )

  const totaisPorFiltro = useMemo(() => {
    const mapa = new Map<FiltroStatus, { n: number; saldo: number }>()
    for (const op of OPCOES_FILTRO) {
      const itens = (resultado?.results ?? []).filter((r) => passaNoFiltro(r, op.value))
      mapa.set(op.value, { n: itens.length, saldo: itens.reduce((s, r) => s + r.saldo, 0) })
    }
    return mapa
  }, [resultado])
  const opcaoAtual = OPCOES_FILTRO.find((o) => o.value === filtroStatus) ?? OPCOES_FILTRO[0]
  const totalAtual = totaisPorFiltro.get(opcaoAtual.value)

  // Os campos do formulário são os mesmos da pesquisa que está na tela? Então
  // "Pesquisar" não tem o que fazer — e o botão fica desativado.
  const semAlteracao =
    consulta !== null &&
    consulta.empresaId === empresaIdSelecionada &&
    consulta.de === filtros.de &&
    consulta.ate === filtros.ate &&
    consulta.janelaAntes === filtros.janelaAntes &&
    consulta.janelaApos === filtros.janelaApos

  /**
   * Só busca quando a LOJA ou o PERÍODO mudam (são a chave das consultas): mudar só
   * as janelas recalcula a conciliação com os dados já carregados, sem requisição;
   * loja + período já pesquisados há menos de 30 min voltam do cache. Nada mudou →
   * nada acontece. Para rebuscar após uma falha, ver `tentarDeNovo`.
   */
  function pesquisar() {
    if (semAlteracao) return
    const msg = validarPeriodo(filtros.de, filtros.ate)
    if (msg) {
      toast.error(msg)
      return
    }
    const loja = lojas.find((l) => l.empresaId === empresaIdSelecionada)
    if (!loja) {
      toast.error('Selecione a loja.')
      return
    }
    setConsulta({
      empresaId: loja.empresaId,
      lojaNome: loja.nome,
      de: filtros.de,
      ate: filtros.ate,
      janelaAntes: filtros.janelaAntes,
      janelaApos: filtros.janelaApos,
    })
    setFiltroStatus('TODOS')
    // No celular os filtros recolhem para o resultado aparecer logo abaixo.
    if (compacto) setFiltrosAbertos(false)
  }

  /** Depois de uma falha: refaz só a(s) consulta(s) que falharam. */
  function tentarDeNovo() {
    if (contasQuery.isError) void contasQuery.refetch()
    if (notasQuery.isError) void notasQuery.refetch()
  }

  // Card do celular: as MESMAS informações das colunas do desktop, em blocos —
  // status e Dif. no topo; Loja / Check e Bus Date; Conta | Nota lado a lado
  // (V. Conta e Data Ref. | V. Nota, Data Nota e NF); a chave de acesso; e Ações
  // (duplicidades + detalhe). Rótulos discretos, números com largura fixa.
  const renderCard = useCallback((r: ValidationResult) => {
    const temDif = Math.abs(r.valueDifference) > 0.01
    const nDup = r.duplicateInvoices.length
    const nota = r.mainInvoice
    const rotulo = 'text-[10px] font-medium uppercase tracking-wider text-muted-foreground'
    const valor = 'text-sm font-semibold tabular-nums text-foreground'
    const sub = 'text-xs tabular-nums text-muted-foreground'
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <StatusValidacaoBadge status={r.status} />
          <span className="flex items-baseline gap-1.5 whitespace-nowrap">
            <span className={rotulo}>Dif.</span>
            <span
              className={cn(
                'text-sm font-semibold tabular-nums',
                temDif ? 'text-destructive' : 'text-muted-foreground'
              )}
            >
              {temDif ? formatBRL(r.valueDifference) : '—'}
            </span>
          </span>
        </div>

        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-foreground">{r.loja}</div>
          <div className={sub}>
            Check #: {r.checkNumber}
            {r.check && ` · Bus Date ${formatBusDate(r.check.Bus_Date)}`}
          </div>
        </div>

        <div className="grid grid-cols-2 divide-x divide-border">
          <div className="min-w-0 space-y-0.5 pr-3">
            <div className={rotulo}>V. Conta</div>
            {r.check ? (
              <>
                <div className={valor}>{formatBRL(r.check.Total_Pagamento)}</div>
                {/* Data Ref. = fechamento da conta (na nota sem conta, é a emissão,
                    já mostrada do lado da nota). */}
                <div className={sub}>{formatDataHora(r.date)}</div>
              </>
            ) : (
              <div className="text-sm italic text-muted-foreground">Sem conta</div>
            )}
          </div>
          <div className="min-w-0 space-y-0.5 pl-3 text-right">
            <div className={rotulo}>V. Nota</div>
            {nota ? (
              <>
                <div className={valor}>{formatBRL(nota.Valor_Nota)}</div>
                <div className={sub}>{formatDataHora(nota.Hora_Criacao_Nota)}</div>
                <div className={sub}>NF {nota.nNf}</div>
              </>
            ) : (
              <div className="text-sm italic text-muted-foreground">Não encontrada</div>
            )}
          </div>
        </div>

        {nota && (
          <div className="space-y-0.5">
            <div className={rotulo}>Chave de acesso</div>
            <div className="break-all font-mono text-[11px] leading-snug text-muted-foreground">
              {nota.Chave_Acesso}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 border-t border-border pt-1">
          {nDup > 0 ? (
            <Badge variant="info" className="whitespace-nowrap">
              +{nDup} {nDup === 1 ? 'duplicidade' : 'duplicidades'}
            </Badge>
          ) : (
            <span />
          )}
          <Button
            type="button"
            variant="ghost"
            className="-mr-2 h-11 gap-1 px-2 text-sm text-muted-foreground"
            aria-label={`Ver detalhes do check ${r.checkNumber}`}
            onClick={(e) => {
              e.stopPropagation()
              setDetalhe(r)
            }}
          >
            Ver detalhes <ChevronRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </div>
    )
  }, [])

  // Colunas com os mesmos nomes e conteúdos da tabela do legado.
  const columns = useMemo<ColumnDef<ValidationResult, unknown>[]>(
    () => [
      {
        id: 'status',
        accessorFn: (r) => STATUS_LABEL[r.status],
        header: 'Status',
        cell: ({ row }) => <StatusValidacaoBadge status={row.original.status} />,
        // Piso de largura: o maior rótulo ("Divergência R$") cabe numa linha só.
        meta: { mobile: 'primary', width: 150 },
      },
      {
        id: 'lojaCheck',
        accessorFn: (r) => `${r.loja} ${r.checkNumber}`,
        sortingFn: (a, b) => a.original.checkNumber - b.original.checkNumber,
        header: 'Loja / Check',
        cell: ({ row }) => (
          <div className="min-w-0">
            <div className="break-words text-sm font-medium text-foreground">
              {row.original.loja}
            </div>
            <div className="whitespace-nowrap text-xs text-muted-foreground">
              Check #: {row.original.checkNumber}
            </div>
          </div>
        ),
        meta: { mobile: 'primary' },
      },
      {
        id: 'busDate',
        accessorFn: (r) => r.check?.Bus_Date ?? '',
        header: 'Bus Date',
        cell: ({ row }) => (
          <span className="font-mono">{formatBusDate(row.original.check?.Bus_Date)}</span>
        ),
      },
      {
        id: 'dataRef',
        accessorKey: 'date',
        header: 'Data Ref.',
        cell: ({ row }) => formatDataHora(row.original.date),
      },
      {
        id: 'valorConta',
        accessorFn: (r) => r.check?.Total_Pagamento ?? r.mainInvoice?.Valor_Nota ?? 0,
        header: 'V. Conta',
        cell: ({ row }) =>
          row.original.check ? formatBRL(row.original.check.Total_Pagamento) : '-',
      },
      {
        id: 'notaFiscal',
        accessorFn: (r) =>
          r.mainInvoice ? `${r.mainInvoice.nNf} ${r.mainInvoice.Chave_Acesso}` : '',
        sortingFn: (a, b) =>
          (a.original.mainInvoice?.nNf ?? 0) - (b.original.mainInvoice?.nNf ?? 0),
        header: 'Nota Fiscal (XML)',
        cell: ({ row }) => {
          const nota = row.original.mainInvoice
          if (!nota) return <span className="italic text-muted-foreground">Não encontrada</span>
          return (
            <div className="break-all text-xs">
              <div>NF: {nota.nNf}</div>
              <div className="font-mono text-[10px] leading-tight text-muted-foreground">
                {nota.Chave_Acesso}
              </div>
            </div>
          )
        },
      },
      {
        id: 'dataNota',
        accessorFn: (r) => r.mainInvoice?.Hora_Criacao_Nota ?? '',
        header: 'Data Nota',
        cell: ({ row }) =>
          row.original.mainInvoice
            ? formatDataHora(row.original.mainInvoice.Hora_Criacao_Nota)
            : '-',
      },
      {
        id: 'valorNota',
        accessorFn: (r) => r.mainInvoice?.Valor_Nota ?? 0,
        header: 'V. Nota',
        cell: ({ row }) =>
          row.original.mainInvoice ? formatBRL(row.original.mainInvoice.Valor_Nota) : '-',
      },
      {
        id: 'dif',
        // Como no legado: Valor da Conta − Valor da Nota principal.
        accessorFn: (r) => Math.abs(r.valueDifference),
        header: 'Dif.',
        cell: ({ row }) =>
          Math.abs(row.original.valueDifference) > 0.01 ? (
            <span className="font-semibold text-destructive">
              {formatBRL(row.original.valueDifference)}
            </span>
          ) : (
            <span className="text-muted-foreground">-</span>
          ),
        meta: { mobile: 'primary' },
      },
      {
        id: 'acoes',
        header: 'Ações',
        enableSorting: false,
        enableGlobalFilter: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Tooltip content="Ver Detalhes Completos">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Ver Detalhes Completos"
                onClick={(e) => {
                  e.stopPropagation()
                  setDetalhe(row.original)
                }}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </Tooltip>
            {row.original.duplicateInvoices.length > 0 && (
              <Tooltip content="Ver duplicidades">
                <button
                  type="button"
                  aria-label="Ver duplicidades"
                  className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={(e) => {
                    e.stopPropagation()
                    setDetalhe(row.original)
                  }}
                >
                  <Badge variant="info" className="whitespace-nowrap">
                    +{row.original.duplicateInvoices.length}
                  </Badge>
                </button>
              </Tooltip>
            )}
          </div>
        ),
        meta: { mobile: 'primary' },
      },
    ],
    []
  )

  // Celular: índice de busca (um texto por registro, com todos os campos) e o filtro
  // pelos termos digitados — todos precisam aparecer no registro.
  const indiceBusca = useMemo(
    () => new Map((resultado?.results ?? []).map((r) => [r.id, textoDeBusca(r)])),
    [resultado]
  )
  const linhasVisiveis = useMemo(() => {
    const termos = compacto ? termosDeBusca(busca) : []
    if (termos.length === 0) return linhas
    return linhas.filter((r) => {
      const texto = indiceBusca.get(r.id) ?? ''
      return termos.every((t) => texto.includes(t))
    })
  }, [linhas, indiceBusca, busca, compacto])
  const buscando = compacto && termosDeBusca(busca).length > 0

  if (!canView) {
    return (
      <div className="m-6 rounded-lg border border-warning/30 bg-warning/10 p-6 text-sm text-foreground">
        Você não tem permissão para acessar a Validação Fiscal (<code>validacao-fiscal.ler</code>).
      </div>
    )
  }

  const avisos: string[] = []
  if (contasQuery.data && !contasQuery.data.temMovimento) {
    avisos.push(
      'A BI do Simphony não tem movimento desta loja no período — confira o período ou o vínculo BIAPI da loja.'
    )
  }
  if (contasQuery.data?.periodoFechado === false) {
    avisos.push(
      'O período inclui dia operacional ainda não fechado na loja: os dados de contas podem mudar.'
    )
  }

  const subtitle = consulta
    ? `${consulta.lojaNome} · ${formatDataHora(consulta.de)}${
        consulta.de !== consulta.ate ? ` a ${formatDataHora(consulta.ate)}` : ''
      } · janela −${consulta.janelaAntes} h / +${consulta.janelaApos} h`
    : 'Cruza as contas do PDV (Simphony) com as notas fiscais emitidas.'

  let emptyState
  if (!consulta) {
    emptyState = (
      <EmptyState
        icon={FileSearch}
        title="Escolha a loja e o período"
        description="Selecione a loja, as datas e clique em Pesquisar para conciliar contas e notas."
      />
    )
  } else if (erro) {
    emptyState = (
      <EmptyState
        icon={AlertTriangle}
        title="Falha ao carregar os dados"
        description={erro.message}
        action={
          <Button onClick={tentarDeNovo}>
            <RefreshCw className="h-4 w-4" /> Tentar de novo
          </Button>
        }
      />
    )
  } else {
    emptyState = (
      <EmptyState
        icon={FileSearch}
        title="Nenhum registro"
        description={
          buscando
            ? `Nenhum registro encontrado para “${busca.trim()}”.`
            : filtroStatus === 'TODOS'
              ? 'Nenhuma conta ou nota encontrada para a loja no período.'
              : 'Nenhum registro com este status.'
        }
      />
    )
  }

  // Seletor de status da barra da lista (desktop e celular).
  const seletorStatus = (
    <Select value={filtroStatus} onValueChange={(v) => setFiltroStatus(v as FiltroStatus)}>
      <Select.Trigger aria-label="Filtrar por status" className={compacto ? 'h-11 w-full' : 'w-80'}>
        {/* Versão compacta da opção escolhida (a lista usa a grade fixa abaixo). */}
        <Select.Value>
          <span className="flex min-w-0 items-center gap-2">
            <span className="truncate">{opcaoAtual.label}</span>
            <Badge
              variant={opcaoAtual.cor}
              className="w-14 shrink-0 justify-center whitespace-nowrap tabular-nums"
            >
              {totalAtual?.n ?? 0}
            </Badge>
            <span className="shrink-0 whitespace-nowrap text-xs tabular-nums text-muted-foreground">
              {formatBRL(totalAtual?.saldo ?? 0)}
            </span>
          </span>
        </Select.Value>
      </Select.Trigger>
      <Select.Content className={BARRA_SO_AO_ROLAR}>
        {OPCOES_FILTRO.map((op) => {
          const t = totaisPorFiltro.get(op.value)
          return (
            <Select.Item key={op.value} value={op.value}>
              {/* Grade de colunas FIXAS: rótulo (esquerda) | quantidade (centro) | R$ (direita) — alinhadas em
                          todas as linhas, independente do tamanho do rótulo ou do número. */}
              <span className="grid grid-cols-[8.5rem_4rem_7rem] items-center gap-x-2">
                <span className="truncate">{op.label}</span>
                <span className="flex justify-center">
                  <Badge
                    variant={op.cor}
                    className="w-14 justify-center whitespace-nowrap tabular-nums"
                    aria-label={`${t?.n ?? 0} registros`}
                  >
                    {t?.n ?? 0}
                  </Badge>
                </span>
                <span className="whitespace-nowrap text-right text-xs tabular-nums text-muted-foreground">
                  {formatBRL(t?.saldo ?? 0)}
                </span>
              </span>
            </Select.Item>
          )
        })}
      </Select.Content>
    </Select>
  )

  // Celular: busca única em todos os campos dos registros.
  const campoBusca = (
    <div className="relative w-full" role="search">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        type="search"
        inputMode="search"
        enterKeyHint="search"
        autoComplete="off"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar em todos os campos…"
        aria-label="Buscar em todos os campos dos registros"
        className="h-11 pl-9 pr-11 [&::-webkit-search-cancel-button]:hidden"
      />
      {busca && (
        <button
          type="button"
          aria-label="Limpar busca"
          onClick={() => setBusca('')}
          className={cn(
            'absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-muted-foreground',
            'transition-colors duration-fast ease-default hover:text-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'animate-in fade-in duration-fast'
          )}
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      )}
    </div>
  )

  return (
    // O WidthFrame desenha os botões de expandir/retrair largura FORA da sua borda:
    // nada de overflow nele (cortaria os botões) — o scroll fica na div interna.
    <WidthFrame
      className="h-[calc(100vh-6.5rem)] md:h-[calc(100vh-7.5rem)]"
      data-tour="validacao-fiscal-frame"
    >
      {/* Área medida (useModoCompacto) e container das classes @container (@5xl:…). No
          celular a página tem UMA rolagem só: esta div; a lista cresce com o conteúdo.
          No desktop esta div NÃO rola: só o corpo da tabela rola por dentro (fillHeight). */}
      <div
        ref={setArea}
        className={cn(
          '@container flex h-full flex-col gap-3',
          compacto ? 'overflow-y-auto' : 'overflow-hidden',
          BARRA_SO_AO_ROLAR
        )}
      >
        <FiltrosBar
          value={{ ...filtros, empresaId: empresaIdSelecionada }}
          onValueChange={setFiltros}
          lojas={lojas}
          lojasLoading={lojasQuery.isLoading}
          pesquisando={carregando}
          onPesquisar={pesquisar}
          semAlteracao={semAlteracao}
          compacto={compacto}
          aberto={filtrosAbertos}
          onAbertoChange={setFiltrosAbertos}
        />

        {avisos.map((a) => (
          <div
            key={a}
            role="status"
            className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm text-foreground animate-in fade-in duration-default"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden /> {a}
          </div>
        ))}

        {consulta && !erro && (
          <ResumoCards
            stats={resultado?.stats ?? null}
            loading={carregando || !resultado}
            filtro={filtroStatus}
            onFiltroChange={setFiltroStatus}
            compacto={compacto}
          />
        )}

        <DataReport
          className={compacto ? 'shrink-0' : 'min-h-0 flex-1'}
          fillHeight={!compacto}
          title="Validação Fiscal"
          titleExtra={<TourReplayButton onClick={replayTour} />}
          subtitle={compacto ? undefined : subtitle}
          data={erro ? [] : linhasVisiveis}
          columns={columns}
          loading={carregando}
          getRowId={(r) => r.id}
          renderCard={renderCard}
          onRowClick={setDetalhe}
          countNoun="registros"
          pageSize={100}
          // No celular o card tem desenho fixo e já ocupa a tela: sem menu de colunas
          // nem tela cheia, para a barra ficar só com o filtro de status e o Exportar.
          columnVisibilityToggle={!compacto}
          fullscreenToggle={!compacto}
          filters={
            compacto ? (
              // py-1: folga para o anel de foco. No celular a barra do DataReport
              // envolve os filtros num `overflow-hidden` sem folga vertical, que
              // cortava o anel do campo de busca em cima.
              <div className="flex w-full flex-col gap-2 py-1">
                {campoBusca}
                {seletorStatus}
              </div>
            ) : (
              seletorStatus
            )
          }
          onExport={
            canExport && consulta && resultado
              ? (visiveis) => exportarXlsx(visiveis, consulta, opcaoAtual.label)
              : undefined
          }
          emptyState={emptyState}
          toolbarTourId="validacao-fiscal-toolbar"
        />
      </div>

      <DetalheModal item={detalhe} onOpenChange={(open) => !open && setDetalhe(null)} />
    </WidthFrame>
  )
}
