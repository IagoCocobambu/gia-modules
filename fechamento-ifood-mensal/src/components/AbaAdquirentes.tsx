import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  Ban,
  CreditCard,
  Pencil,
  Percent,
  Receipt,
  Scale,
  Store,
  Tag,
  Wallet,
} from 'lucide-react'
import { Button, DataReport, type ColumnDef } from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'
import {
  BOTAO_ICONE_TOQUE,
  classeDivergencia,
  formatBRL,
  formatData,
  qtdEValor,
  ROTULO_TOQUE,
} from '../helpers'
import { temDiferenca, useFiltroCards, useInformarVisiveis } from '../hooks/use-filtro-cards'
import { somar } from '../regras'
import type { AdquirenteManualDia, LinhaAdquirenteDia } from '../types'
import { CampoData, CampoTexto } from './CamposCelula'
import { BotaoTotais } from './BotaoTotais'
import { Recolhivel } from './Recolhivel'
import { BarraIndicadores, type Indicador, type TomIndicador } from './BarraIndicadores'
import { BotaoFiltroAtivo } from './BotaoFiltroAtivo'
import { Aguardando } from './Aguardando'
import { Dica } from './Dica'
import { EditarDiaDialog } from './EditarDiaDialog'

const tomDif = (v: number): TomIndicador => (Math.abs(v) < 0.005 ? 'success' : 'warning')

interface Props {
  linhas: LinhaAdquirenteDia[]
  podeEditar: boolean
  onEditar: (dia: string, parcial: Partial<AdquirenteManualDia>) => void
  contexto: string
  /** Dias cujos lançamentos ainda estão chegando (aparecem apagados). */
  diasPendentes?: ReadonlySet<string>
  /** Barra de totais aberta (estado da tela, igual nas abas). */
  totaisAbertos: boolean
  onTotaisAbertosChange: (abertos: boolean) => void
  /** Consulta terminou: cards com o número final e filtro liberado. */
  completo?: boolean
  /** Linhas visíveis com o filtro do card (`null` = sem filtro), para a barra de abas. */
  onVisiveisChange?: (visiveis: number | null) => void
}

const moeda = (v: number) => <span className="whitespace-nowrap tabular-nums">{formatBRL(v)}</span>
const dif = (v: number) => (
  <span className={cn('whitespace-nowrap tabular-nums', classeDivergencia(v))}>{formatBRL(v)}</span>
)
const qtd = (v: number) => <span className="tabular-nums text-muted-foreground">{v}</span>

type Num = {
  [K in keyof LinhaAdquirenteDia]: LinhaAdquirenteDia[K] extends number ? K : never
}[keyof LinhaAdquirenteDia]

/**
 * Um card por coluna com total (os mesmos totais que a tabela tinha no rodapé), na
 * ordem das colunas, mais a divergência em soma absoluta. Valores do mês inteiro.
 */
function cardsAdquirentes(linhas: LinhaAdquirenteDia[]): Indicador[] {
  const s = (k: Num) => somar(linhas, (l) => l[k])
  const v = (
    id: string,
    rotulo: string,
    dica: string,
    k: Num,
    icone: Indicador['icone'],
    tom: TomIndicador = 'neutro'
  ) => ({ id, rotulo, dica, icone, tom, valor: formatBRL(s(k)) })
  const abs = somar(linhas, (l) => Math.abs(l.difTotal))
  const semDiferenca = !linhas.some((l) => temDiferenca(l.difTotal))
  return [
    v(
      'vr',
      'iFood online VR',
      'Soma do TOTAL dos lançamentos ONLINE VR do mês',
      'ifoodVr',
      CreditCard,
      'primary'
    ),
    v(
      'desc-ifood',
      'descontos iFood',
      'Promoções custeadas pelo iFood em pedidos ONLINE VR (R$)',
      'descIfoodRs',
      Percent
    ),
    v(
      'cancel-total',
      'cancelamento total',
      'Cancelamentos totais em ONLINE VR (R$)',
      'cancelTotalRs',
      Ban
    ),
    v(
      'cancel-parcial',
      'cancelamento parcial',
      'Cancelamentos parciais em ONLINE VR (R$)',
      'cancelParcialRs',
      Ban
    ),
    v(
      'desc-loja-vr',
      'desc. loja VR',
      'Coluna Desc. LOJA VR (mesmo filtro dos descontos iFood em ONLINE VR)',
      'descLojaVrRs',
      Store
    ),
    v(
      'promo-rede',
      'promoção rede',
      'Promoções custeadas pela rede em ONLINE VR',
      'promoRede',
      Tag
    ),
    v('sd', 'SD online VR', 'iFood online VR − descontos iFood', 'sdIfoodVr', Receipt, 'info'),
    v(
      'caixa',
      'caixa adquirentes (borderô)',
      'Caixa de adquirentes do iFood lançado pela loja (borderô)',
      'caixa',
      Wallet
    ),
    {
      ...v(
        'dif',
        '# total',
        'SD online VR − caixa. O normal é zero. Clique para ver só os dias com diferença',
        'difTotal',
        Scale
      ),
      tom: tomDif(s('difTotal')),
      filtra: true,
      zerado: semDiferenca,
    },
    {
      id: 'abs',
      rotulo: 'divergência (soma absoluta)',
      dica: 'Soma das diferenças dos dias sem o sinal — mostra divergência que se compensa entre dias. Clique para ver só os dias com diferença',
      icone: AlertTriangle,
      tom: tomDif(abs),
      valor: formatBRL(abs),
      filtra: true,
      zerado: semDiferenca,
    },
  ]
}

export function AbaAdquirentes({
  linhas,
  podeEditar,
  onEditar,
  contexto,
  diasPendentes,
  totaisAbertos,
  onTotaisAbertosChange,
  completo = true,
  onVisiveisChange,
}: Props) {
  const [diaAberto, setDiaAberto] = useState<string | null>(null)
  const [filtro, setFiltro] = useFiltroCards(contexto, completo)
  const cards = cardsAdquirentes(linhas)
  // Os dois cards que filtram ("# total" e a soma absoluta) mostram os mesmos dias.
  const visiveis = filtro ? linhas.filter((l) => temDiferenca(l.difTotal)) : linhas
  const nomeDoFiltro = cards.find((c) => c.id === filtro)?.rotulo
  useInformarVisiveis(filtro ? visiveis.length : null, onVisiveisChange)
  const aberta = linhas.find((l) => l.dia === diaAberto) ?? null

  const colunas = useMemo<ColumnDef<LinhaAdquirenteDia, unknown>[]>(() => {
    const valor = (id: Num, header: string, tipo: 'moeda' | 'dif' | 'qtd' = 'moeda') => ({
      id,
      accessorKey: id,
      header,
      cell: ({ row }: { row: { original: LinhaAdquirenteDia } }) =>
        tipo === 'dif' ? (
          // Diferença de dia ainda em espera só vale no fim: selo no lugar.
          diasPendentes?.has(row.original.dia) ? (
            <Aguardando />
          ) : (
            dif(row.original[id])
          )
        ) : tipo === 'qtd' ? (
          qtd(row.original[id])
        ) : (
          moeda(row.original[id])
        ),
    })
    // Par Qtd + R$ numa coluna só (sem a linha de grupos no cabeçalho): a quantidade
    // num selo "3×" antes do valor (some quando é zero). O selo vem por CSS
    // (`::before`), fora do texto da célula — a calculadora do portal lê só o R$.
    const comQtd = (rs: Num, q: Num, header: string) => ({
      id: rs,
      accessorKey: rs,
      header,
      meta: { calculadora: 'moeda' as const },
      cell: ({ row }: { row: { original: LinhaAdquirenteDia } }) => (
        <span
          className={cn(
            'whitespace-nowrap tabular-nums',
            row.original[q] > 0 &&
              'before:mr-2 before:inline-block before:min-w-[1.625rem] before:rounded-full before:bg-muted before:px-1.5 before:text-center before:text-[11px] before:font-semibold before:text-muted-foreground before:content-[attr(data-qtd)]'
          )}
          data-qtd={row.original[q] > 0 ? `${row.original[q]}×` : undefined}
        >
          {formatBRL(row.original[rs])}
        </span>
      ),
    })
    return [
      {
        accessorKey: 'dia',
        header: 'Data',
        meta: { mobile: 'primary', width: 96 },
        cell: ({ row }) => (
          <span className="whitespace-nowrap font-medium tabular-nums">
            {formatData(row.original.dia)}
          </span>
        ),
      },
      valor('ifoodVr', 'iFood ONLINE VR'),
      comQtd('descIfoodRs', 'descIfoodQtd', 'Descontos iFood'),
      comQtd('cancelTotalRs', 'cancelTotalQtd', 'Cancel. total'),
      comQtd('cancelParcialRs', 'cancelParcialQtd', 'Cancel. parcial'),
      comQtd('descLojaVrRs', 'descLojaVrQtd', 'Desc. LOJA VR'),
      valor('promoRede', 'Promo rede'),
      { ...valor('sdIfoodVr', 'SD ONLINE VR'), meta: { mobile: 'primary' } },
      { ...valor('caixa', 'Caixa (borderô)'), meta: { mobile: 'primary' } },
      { ...valor('difTotal', '# Total', 'dif'), meta: { mobile: 'primary' } },
      {
        accessorKey: 'previsao',
        header: 'Previsão',
        meta: { width: 168, calculadora: false },
        cell: ({ row }) => (
          <CampoData
            aria-label={`Previsão de pagamento de ${formatData(row.original.dia)}`}
            value={row.original.previsao}
            disabled={!podeEditar}
            onCommit={(v) => onEditar(row.original.dia, { previsao: v })}
          />
        ),
      },
      {
        accessorKey: 'comentario',
        header: 'Comentário',
        meta: { width: 200, calculadora: false },
        cell: ({ row }) => (
          <CampoTexto
            aria-label={`Comentário de ${formatData(row.original.dia)}`}
            value={row.original.comentario}
            disabled={!podeEditar}
            onCommit={(v) => onEditar(row.original.dia, { comentario: v })}
          />
        ),
      },
      {
        id: 'acoes',
        header: '',
        enableSorting: false,
        meta: { mobile: 'hidden', calculadora: false },
        cell: ({ row }) => (
          <Dica content="Ver o dia completo">
            <Button
              variant="ghost"
              size="icon"
              className={BOTAO_ICONE_TOQUE}
              aria-label={`Ver o dia ${formatData(row.original.dia)}`}
              onClick={() => setDiaAberto(row.original.dia)}
            >
              <Pencil className="h-4 w-4" />
              <span className={ROTULO_TOQUE}>Ver o dia</span>
            </Button>
          </Dica>
        ),
      },
    ]
  }, [podeEditar, onEditar, diasPendentes])

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <Recolhivel className="shrink-0" visivel={totaisAbertos}>
        <BarraIndicadores
          rotulo="Totais do mês — Adquirentes"
          itens={cards}
          filtro={filtro}
          onFiltroChange={setFiltro}
          carregando={!completo}
          principais={['dif', 'abs', 'sd', 'caixa']}
        />
      </Recolhivel>
      <DataReport
        className="[&_td]:whitespace-nowrap"
        fillHeight
        title="Adquirentes"
        columns={colunas}
        data={visiveis}
        getRowId={(l) => l.dia}
        actions={
          <>
            {nomeDoFiltro && (
              <BotaoFiltroAtivo
                nome={`${nomeDoFiltro}: dias com diferença`}
                onLimpar={() => setFiltro(null)}
              />
            )}
            <BotaoTotais abertos={totaisAbertos} onAbertosChange={onTotaisAbertosChange} />
          </>
        }
        rowClassName={(l) =>
          diasPendentes?.has(l.dia) ? 'opacity-60 transition-opacity duration-default' : undefined
        }
        pageSize={31}
        enableSorting={false}
        countNoun="dias"
        calculadora={{ contexto }}
        columnPinning={{ left: ['dia'] }}
        renderCard={(l) => (
          <button
            type="button"
            className={cn(
              'flex w-full items-center justify-between gap-3 rounded-md p-3 text-left transition-colors duration-fast hover:bg-muted/40',
              diasPendentes?.has(l.dia) && 'opacity-60'
            )}
            onClick={() => setDiaAberto(l.dia)}
          >
            <div>
              <p className="font-medium tabular-nums">{formatData(l.dia)}</p>
              <p className="text-xs text-muted-foreground">
                SD {formatBRL(l.sdIfoodVr)} · Caixa {formatBRL(l.caixa)}
              </p>
              {l.comentario && (
                <p className="mt-1 text-xs text-muted-foreground">“{l.comentario}”</p>
              )}
            </div>
            <div className="text-right text-sm">
              <span className="text-muted-foreground"># Total </span>
              {diasPendentes?.has(l.dia) ? <Aguardando /> : dif(l.difTotal)}
            </div>
          </button>
        )}
      />
      <EditarDiaDialog
        dia={aberta ? aberta.dia : null}
        aba="Adquirentes"
        podeEditar={podeEditar}
        onOpenChange={(o) => !o && setDiaAberto(null)}
        valores={{ previsao: aberta?.previsao ?? '', comentario: aberta?.comentario ?? '' }}
        onConfirmar={(v) =>
          aberta && onEditar(aberta.dia, { previsao: v.previsao, comentario: v.comentario })
        }
        detalhes={
          aberta
            ? [
                ['iFood ONLINE VR', moeda(aberta.ifoodVr)],
                ['Descontos iFood', qtdEValor(aberta.descIfoodQtd, aberta.descIfoodRs)],
                ['Cancel. total', qtdEValor(aberta.cancelTotalQtd, aberta.cancelTotalRs)],
                ['Cancel. parcial', qtdEValor(aberta.cancelParcialQtd, aberta.cancelParcialRs)],
                ['Desc. LOJA VR', qtdEValor(aberta.descLojaVrQtd, aberta.descLojaVrRs)],
                ['Promo rede', moeda(aberta.promoRede)],
                ['SD ONLINE VR', moeda(aberta.sdIfoodVr)],
                ['Caixa (borderô)', moeda(aberta.caixa)],
                ['# Total', dif(aberta.difTotal)],
              ]
            : []
        }
      />
    </div>
  )
}
