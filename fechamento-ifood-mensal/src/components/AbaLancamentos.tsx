import { useMemo } from 'react'
import {
  AlertTriangle,
  Banknote,
  CircleDollarSign,
  CreditCard,
  Landmark,
  Receipt,
  ShoppingBag,
  Tag,
  Wallet,
} from 'lucide-react'
import { Badge, DataReport, type ColumnDef } from '@gia-cb/ui'
import { formatBRL, formatData, formatPct } from '../helpers'
import { somar } from '../regras'
import { useFiltroCards, useInformarVisiveis } from '../hooks/use-filtro-cards'
import type { LinhaLedger } from '../types'
import { BarraIndicadores, type Indicador } from './BarraIndicadores'
import { BotaoFiltroAtivo } from './BotaoFiltroAtivo'
import { BotaoTotais } from './BotaoTotais'
import { Recolhivel } from './Recolhivel'

const moeda = (v: number) => <span className="whitespace-nowrap tabular-nums">{formatBRL(v)}</span>

const VARIANTE_STATUS: Record<LinhaLedger['status'], 'success' | 'info' | 'secondary'> = {
  ONLINE: 'success',
  'ONLINE VR': 'info',
  OFFLINE: 'secondary',
}

/** Colunas que nascem desligadas (padrão do legado: só 10 visíveis). */
const INICIAIS_OCULTAS = {
  competenciaLabel: false,
  dataRepasse: false,
  competencia: false,
  tipoLancamento: false,
  bandeira: false,
  baseCalculo: false,
  percentualTaxa: false,
  pedidoId: false,
}

/**
 * Os cards da aba. Os que têm `filtro` são recortes das linhas: o clique mostra na
 * tabela só os lançamentos que somam neles. `soma` diz o que o card soma.
 */
const CARDS: Array<{
  id: string
  rotulo: string
  dica: string
  icone: Indicador['icone']
  tom: Indicador['tom']
  soma: (l: LinhaLedger) => number
  filtro?: (l: LinhaLedger) => boolean
}> = [
  {
    id: 'repasse',
    rotulo: 'repasse previsto',
    dica: 'Soma do valor dos lançamentos com impacto no repasse — o que o iFood vai depositar',
    icone: Landmark,
    tom: 'info',
    soma: (l) => l.valor,
    filtro: (l) => l.impactoRepasse === 'SIM',
  },
  {
    id: 'online',
    rotulo: 'vendas online',
    dica: 'Soma do TOTAL dos lançamentos ONLINE (pagos no iFood)',
    icone: ShoppingBag,
    tom: 'info',
    soma: (l) => l.total,
    filtro: (l) => l.status === 'ONLINE',
  },
  {
    id: 'vr',
    rotulo: 'vendas online VR',
    dica: 'Soma do TOTAL dos lançamentos ONLINE VR (vale-refeição pago no iFood)',
    icone: CreditCard,
    tom: 'primary',
    soma: (l) => l.total,
    filtro: (l) => l.status === 'ONLINE VR',
  },
  {
    id: 'offline',
    rotulo: 'offline',
    dica: 'Soma do valor dos lançamentos OFFLINE (pagos na entrega ou na loja)',
    icone: Wallet,
    tom: 'neutro',
    soma: (l) => l.valor,
    filtro: (l) => l.status === 'OFFLINE',
  },
  {
    id: 'taxas',
    rotulo: 'taxas e comissões',
    dica: 'Soma do valor dos lançamentos do tipo Cobrança e Retenção (comissão, taxa de transação, taxa de serviço)',
    icone: Receipt,
    tom: 'neutro',
    soma: (l) => l.valor,
    filtro: (l) => l.tipoLancamento === 'Cobrança' || l.tipoLancamento === 'Retenção',
  },
  {
    id: 'promocoes',
    rotulo: 'promoções',
    dica: 'Soma do valor dos lançamentos do tipo Subsídio (promoções custeadas pelo iFood, pela rede, pela indústria ou pela loja)',
    icone: Tag,
    tom: 'neutro',
    soma: (l) => l.valor,
    filtro: (l) => l.tipoLancamento === 'Subsídio',
  },
  {
    id: 'ocorrencias',
    rotulo: 'ocorrências',
    dica: 'Soma do valor dos lançamentos sem pedido (mensalidade, ajustes, saldo de períodos anteriores…)',
    icone: CircleDollarSign,
    tom: 'neutro',
    soma: (l) => l.valor,
    filtro: (l) => l.data === 'Ocorrências',
  },
  {
    id: 'total',
    rotulo: 'total (vendas)',
    dica: 'Soma da coluna TOTAL: o valor de venda dos pedidos (pagamento, promoções do iFood, da rede e da indústria, taxa de serviço)',
    icone: ShoppingBag,
    tom: 'neutro',
    soma: (l) => l.total,
  },
  {
    id: 'liquido',
    rotulo: 'valor líquido',
    dica: 'Soma do valor de todos os lançamentos do mês',
    icone: Banknote,
    tom: 'neutro',
    soma: (l) => l.valor,
  },
]

interface Props {
  linhas: LinhaLedger[]
  /** Barra de totais aberta (estado da tela, igual nas abas). */
  totaisAbertos: boolean
  onTotaisAbertosChange: (abertos: boolean) => void
  /** Último dia do mês (`AAAA-MM-DD`) e o último dia que veio do iFood. */
  fimDoMes: string
  dataMax: string
  contexto: string
  /** Consulta começou e nada chegou ainda: a tabela fica no carregamento dela. */
  carregando?: boolean
  /** Consulta terminou: cards com o número final e filtro liberado. */
  completo?: boolean
  /** Linhas visíveis com o filtro do card (`null` = sem filtro), para a barra de abas. */
  onVisiveisChange?: (visiveis: number | null) => void
}

export function AbaLancamentos({
  linhas,
  carregando = false,
  fimDoMes,
  dataMax,
  contexto,
  totaisAbertos,
  onTotaisAbertosChange,
  completo = true,
  onVisiveisChange,
}: Props) {
  // Card que filtra a tabela. Consulta nova (outra loja/mês) tira o filtro; durante
  // a consulta não há filtro.
  const [filtro, setFiltro] = useFiltroCards(contexto, completo)

  const ordenadas = useMemo(
    () =>
      [...linhas].sort((a, b) => {
        const da = a.data === 'Ocorrências' ? '' : a.data
        const db = b.data === 'Ocorrências' ? '' : b.data
        return da !== db ? da.localeCompare(db) : a.pedidoCurto.localeCompare(b.pedidoCurto)
      }),
    [linhas]
  )

  const colunas = useMemo<ColumnDef<LinhaLedger, unknown>[]>(
    () => [
      {
        accessorKey: 'data',
        header: 'Data',
        meta: { mobile: 'primary', width: 104 },
        cell: ({ row }) => (
          <span className="whitespace-nowrap tabular-nums">
            {row.original.data === 'Ocorrências' ? 'Ocorrências' : formatData(row.original.data)}
          </span>
        ),
      },
      {
        accessorKey: 'descricao',
        header: 'Descrição do lançamento',
        meta: { mobile: 'primary' },
      },
      {
        accessorKey: 'valor',
        header: 'Valor',
        meta: { mobile: 'primary' },
        cell: ({ row }) => moeda(row.original.valor),
      },
      {
        accessorKey: 'total',
        header: 'TOTAL',
        cell: ({ row }) => moeda(row.original.total),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        meta: { mobile: 'primary' },
        cell: ({ row }) => (
          <Badge variant={VARIANTE_STATUS[row.original.status]} className="whitespace-nowrap">
            {row.original.status}
          </Badge>
        ),
      },
      { accessorKey: 'classificacao', header: 'Classificação' },
      { accessorKey: 'fatoGerador', header: 'Fato gerador' },
      { accessorKey: 'pedidoCurto', header: 'Pedido' },
      { accessorKey: 'impactoRepasse', header: 'Impacto no repasse' },
      { accessorKey: 'metodoPagamento', header: 'Método de pagamento' },
      { accessorKey: 'competenciaLabel', header: 'Competência' },
      { accessorKey: 'dataRepasse', header: 'Data de repasse' },
      { accessorKey: 'competencia', header: 'Competência (AAAA-MM)' },
      { accessorKey: 'tipoLancamento', header: 'Tipo de lançamento' },
      { accessorKey: 'bandeira', header: 'Bandeira' },
      {
        accessorKey: 'baseCalculo',
        header: 'Base de cálculo',
        cell: ({ row }) => moeda(row.original.baseCalculo),
      },
      {
        accessorKey: 'percentualTaxa',
        header: '% taxa',
        meta: { calculadora: 'percentual-de-100' },
        cell: ({ row }) => (
          <span className="tabular-nums">{formatPct(row.original.percentualTaxa)}</span>
        ),
      },
      { accessorKey: 'pedidoId', header: 'ID do pedido (iFood)' },
    ],
    []
  )

  const incompleto = dataMax !== '' && dataMax < fimDoMes

  const cards = CARDS.map((c) => {
    const doCard = c.filtro ? linhas.filter(c.filtro) : linhas
    return {
      id: c.id,
      rotulo: c.rotulo,
      dica: c.dica,
      icone: c.icone,
      tom: c.tom,
      valor: formatBRL(somar(doCard, c.soma)),
      filtra: Boolean(c.filtro),
      zerado: doCard.length === 0,
    }
  })
  const cardDoFiltro = CARDS.find((c) => c.id === filtro)
  const visiveis = cardDoFiltro?.filtro ? ordenadas.filter(cardDoFiltro.filtro) : ordenadas
  useInformarVisiveis(cardDoFiltro ? visiveis.length : null, onVisiveisChange)

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      {incompleto && (
        <div className="flex items-start gap-2 rounded-md border border-warning-soft-border bg-warning-soft px-3 py-2 text-sm text-warning-soft-foreground">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>
            Os lançamentos do iFood vão só até {formatData(dataMax)} — o mês vai até{' '}
            {formatData(fimDoMes)}. Se o mês ainda não fechou, é o esperado; senão, consulte de
            novo.
          </span>
        </div>
      )}
      <Recolhivel className="shrink-0" visivel={totaisAbertos}>
        <BarraIndicadores
          rotulo="Totais do mês — lançamentos do iFood (clique num card para filtrar)"
          itens={cards}
          filtro={filtro}
          onFiltroChange={setFiltro}
          principais={['repasse', 'total', 'taxas', 'liquido']}
          carregando={!completo}
        />
      </Recolhivel>
      <DataReport
        loading={carregando}
        className="[&_td]:whitespace-nowrap"
        fillHeight
        title="Lançamentos do iFood"
        subtitle="Cada linha é um lançamento financeiro da API do iFood — a base das outras abas."
        columns={colunas}
        data={visiveis}
        actions={
          <>
            {cardDoFiltro && (
              <BotaoFiltroAtivo nome={cardDoFiltro.rotulo} onLimpar={() => setFiltro(null)} />
            )}
            <BotaoTotais abertos={totaisAbertos} onAbertosChange={onTotaisAbertosChange} />
          </>
        }
        initialColumnVisibility={INICIAIS_OCULTAS}
        columnVisibilityToggle
        globalSearch
        searchPlaceholder="Buscar lançamento, pedido, descrição…"
        countNoun="lançamentos"
        pageSize={50}
        calculadora={{ contexto }}
        emptyState={
          <p className="py-10 text-center text-sm text-muted-foreground">
            O iFood não devolveu lançamentos para esta loja no mês.
          </p>
        }
      />
    </div>
  )
}
