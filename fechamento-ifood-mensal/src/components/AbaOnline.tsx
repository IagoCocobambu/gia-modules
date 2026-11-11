import { useMemo, useState } from 'react'
import { Ban, Percent, Pencil, Scale, ShoppingBag, Sigma, Store, Tag, Wallet } from 'lucide-react'
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
import type { LinhaOnlineDia, OnlineManualDia } from '../types'
import { CampoData, CampoTexto, CampoValor } from './CamposCelula'
import { BotaoTotais } from './BotaoTotais'
import { Recolhivel } from './Recolhivel'
import { BarraIndicadores, type Indicador, type TomIndicador } from './BarraIndicadores'
import { BotaoFiltroAtivo } from './BotaoFiltroAtivo'
import { Aguardando } from './Aguardando'
import { Dica } from './Dica'
import { EditarDiaDialog } from './EditarDiaDialog'

const tomDif = (v: number): TomIndicador => (Math.abs(v) < 0.005 ? 'success' : 'warning')

type CampoOnline = 'previsao' | 'cbDescontosLoja' | 'comentario'

interface Props {
  linhas: LinhaOnlineDia[]
  podeEditar: boolean
  onEditar: (dia: string, parcial: Partial<OnlineManualDia>) => void
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
  [K in keyof LinhaOnlineDia]: LinhaOnlineDia[K] extends number ? K : never
}[keyof LinhaOnlineDia]

/**
 * Um card por coluna com total (os mesmos totais que a tabela tinha no rodapé), na
 * ordem das colunas. Valores do mês inteiro.
 */
/** Cards de diferença (#): o clique mostra só os dias com diferença naquela coluna. */
const DIF_DO_CARD: Record<string, Num> = {
  'dif-online': 'difOnline',
  'dif-desc-ifood': 'difDescontoIfood',
  'dif-desc-loja': 'difDescontoLoja',
  'dif-total': 'difTotal',
}

function cardsOnline(linhas: LinhaOnlineDia[]): Indicador[] {
  const s = (k: Num) => somar(linhas, (l) => l[k])
  const r = (v: number) => formatBRL(v)
  const d = (id: string, rotulo: string, dica: string, k: Num, icone: Indicador['icone']) => ({
    id,
    rotulo,
    dica: `${dica}. Clique para ver só os dias com diferença`,
    icone,
    tom: tomDif(s(k)),
    valor: r(s(k)),
    filtra: true,
    zerado: !linhas.some((l) => temDiferenca(l[k])),
  })
  const v = (
    id: string,
    rotulo: string,
    dica: string,
    k: Num,
    icone: Indicador['icone'],
    tom: TomIndicador = 'neutro'
  ) => ({ id, rotulo, dica, icone, tom, valor: r(s(k)) })
  return [
    v(
      'ifood-online',
      'iFood online',
      'Soma do TOTAL dos lançamentos ONLINE do mês',
      'ifoodOnline',
      ShoppingBag,
      'info'
    ),
    v(
      'desc-ifood',
      'descontos iFood',
      'Promoções custeadas pelo iFood em pedidos ONLINE (R$)',
      'descIfoodRs',
      Percent
    ),
    v(
      'cancel-total',
      'cancelamento total',
      'Lançamentos de cancelamento total (R$)',
      'cancelTotalRs',
      Ban
    ),
    v(
      'cancel-parcial',
      'cancelamento parcial',
      'Lançamentos de cancelamento parcial (R$)',
      'cancelParcialRs',
      Ban
    ),
    v(
      'promo-rede',
      'promoção rede',
      'Promoções custeadas pela rede em pedidos ONLINE',
      'promoRede',
      Tag
    ),
    v(
      'sd-online',
      'SD online',
      'O que o iFood registrou como online (igual ao iFood online)',
      'sdIfoodOnline',
      ShoppingBag,
      'info'
    ),
    v(
      'cb-online',
      'CB online (borderô)',
      'iFood online lançado no caixa da loja (borderô)',
      'cbOnline',
      Wallet
    ),
    d('dif-online', '# online', 'SD online − CB online. O normal é zero', 'difOnline', Scale),
    v(
      'desc-off',
      'desc. offline',
      'Promoções do iFood em pedidos OFFLINE (R$)',
      'descOffRs',
      Percent
    ),
    v('desc-vr', 'desc. VR', 'Promoções do iFood em pedidos ONLINE VR (R$)', 'descVrRs', Percent),
    v(
      'sd-desc-ifood',
      'SD desc. iFood',
      'Desc. offline + desc. VR',
      'sdDescontoIfood',
      Percent,
      'info'
    ),
    v(
      'cb-desc-ifood',
      'CB desc. iFood (borderô)',
      'Desconto iFood lançado no caixa da loja (borderô)',
      'cbDescontosIfood',
      Wallet
    ),
    d(
      'dif-desc-ifood',
      '# desc. iFood',
      'SD desc. iFood − CB desc. iFood. O normal é zero',
      'difDescontoIfood',
      Scale
    ),
    v(
      'desc-loja-on',
      'desc. loja online',
      'Promoções custeadas pela loja em pedidos ONLINE (R$)',
      'descLojaOnlineRs',
      Store
    ),
    v(
      'desc-loja-off',
      'desc. loja offline',
      'Promoções custeadas pela loja em pedidos OFFLINE (R$)',
      'descLojaOffRs',
      Store
    ),
    v(
      'sd-desc-loja',
      'SD desc. loja',
      'Desc. loja online + desc. loja offline',
      'sdDescontoLoja',
      Store,
      'info'
    ),
    {
      id: 'cb-desc-loja',
      rotulo: 'CB desc. loja (digitado)',
      dica: 'Soma do CB Descontos LOJA digitado nos dias',
      icone: Wallet,
      tom: 'neutro',
      valor: r(somar(linhas, (l) => l.cbDescontosLoja)),
    },
    d(
      'dif-desc-loja',
      '# desc. loja',
      'SD desc. loja − CB desc. loja. O normal é zero',
      'difDescontoLoja',
      Scale
    ),
    d(
      'dif-total',
      '# total',
      '# online + # desc. iFood (o # desc. loja não entra)',
      'difTotal',
      Sigma
    ),
  ]
}

export function AbaOnline({
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
  const cards = cardsOnline(linhas)
  const colunaDoFiltro = filtro ? DIF_DO_CARD[filtro] : undefined
  const visiveis = colunaDoFiltro ? linhas.filter((l) => temDiferenca(l[colunaDoFiltro])) : linhas
  const nomeDoFiltro = cards.find((c) => c.id === filtro)?.rotulo
  useInformarVisiveis(colunaDoFiltro ? visiveis.length : null, onVisiveisChange)
  const linhaAberta = linhas.find((l) => l.dia === diaAberto) ?? null

  const colunas = useMemo<ColumnDef<LinhaOnlineDia, unknown>[]>(() => {
    const valor = (id: Num, header: string, tipo: 'moeda' | 'dif' | 'qtd' = 'moeda') => ({
      id,
      accessorKey: id,
      header,
      cell: ({ row }: { row: { original: LinhaOnlineDia } }) =>
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
      cell: ({ row }: { row: { original: LinhaOnlineDia } }) => (
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
    const editar = (dia: string, campo: CampoOnline, v: string | number | null) =>
      onEditar(dia, { [campo]: v })
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
      valor('ifoodOnline', 'iFood Online'),
      comQtd('descIfoodRs', 'descIfoodQtd', 'Descontos iFood'),
      comQtd('cancelTotalRs', 'cancelTotalQtd', 'Cancel. total'),
      comQtd('cancelParcialRs', 'cancelParcialQtd', 'Cancel. parcial'),
      valor('promoRede', 'Promo rede'),
      valor('sdIfoodOnline', 'SD Online'),
      valor('cbOnline', 'CB Online'),
      { ...valor('difOnline', '# Online', 'dif'), meta: { mobile: 'primary' } },
      comQtd('descOffRs', 'descOffQtd', 'Desc. OFF'),
      comQtd('descVrRs', 'descVrQtd', 'Desc. VR'),
      valor('sdDescontoIfood', 'SD Desc. iFood'),
      valor('cbDescontosIfood', 'CB Desc. iFood'),
      { ...valor('difDescontoIfood', '# Desc. iFood', 'dif'), meta: { mobile: 'primary' } },
      comQtd('descLojaOnlineRs', 'descLojaOnlineQtd', 'Desc. LOJA On'),
      comQtd('descLojaOffRs', 'descLojaOffQtd', 'Desc. LOJA Off'),
      valor('sdDescontoLoja', 'SD Desc. LOJA'),
      {
        accessorKey: 'cbDescontosLoja',
        header: 'CB Desc. LOJA',
        meta: { width: 130 },
        cell: ({ row }) => (
          <CampoValor
            aria-label={`CB Descontos LOJA de ${formatData(row.original.dia)}`}
            value={row.original.cbDescontosLoja}
            disabled={!podeEditar}
            onCommit={(v) => editar(row.original.dia, 'cbDescontosLoja', v)}
          />
        ),
      },
      valor('difDescontoLoja', '# Desc. LOJA', 'dif'),
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
            onCommit={(v) => editar(row.original.dia, 'previsao', v)}
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
            onCommit={(v) => editar(row.original.dia, 'comentario', v)}
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
          rotulo="Totais do mês — Online"
          itens={cards}
          filtro={filtro}
          onFiltroChange={setFiltro}
          carregando={!completo}
          principais={['dif-online', 'dif-desc-ifood', 'dif-desc-loja', 'dif-total']}
        />
      </Recolhivel>
      <DataReport
        className="[&_td]:whitespace-nowrap"
        fillHeight
        title="Online"
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
                SD {formatBRL(l.sdIfoodOnline)} · CB {formatBRL(l.cbOnline)}
              </p>
              {l.comentario && (
                <p className="mt-1 text-xs text-muted-foreground">“{l.comentario}”</p>
              )}
            </div>
            <div className="text-right text-sm">
              <p>
                <span className="text-muted-foreground"># Online </span>
                {diasPendentes?.has(l.dia) ? <Aguardando /> : dif(l.difOnline)}
              </p>
              <p>
                <span className="text-muted-foreground"># Total </span>
                {diasPendentes?.has(l.dia) ? <Aguardando /> : dif(l.difTotal)}
              </p>
            </div>
          </button>
        )}
      />
      <EditarDiaDialog
        dia={linhaAberta ? linhaAberta.dia : null}
        aba="Online"
        podeEditar={podeEditar}
        onOpenChange={(o) => !o && setDiaAberto(null)}
        valores={{
          previsao: linhaAberta?.previsao ?? '',
          comentario: linhaAberta?.comentario ?? '',
          cbDescontosLoja: linhaAberta?.cbDescontosLoja ?? null,
        }}
        onConfirmar={(v) => linhaAberta && onEditar(linhaAberta.dia, v)}
        detalhes={
          linhaAberta
            ? [
                ['iFood Online', moeda(linhaAberta.ifoodOnline)],
                ['Descontos iFood', qtdEValor(linhaAberta.descIfoodQtd, linhaAberta.descIfoodRs)],
                ['Cancel. total', qtdEValor(linhaAberta.cancelTotalQtd, linhaAberta.cancelTotalRs)],
                [
                  'Cancel. parcial',
                  qtdEValor(linhaAberta.cancelParcialQtd, linhaAberta.cancelParcialRs),
                ],
                ['Promo rede', moeda(linhaAberta.promoRede)],
                ['SD Online', moeda(linhaAberta.sdIfoodOnline)],
                ['CB Online (borderô)', moeda(linhaAberta.cbOnline)],
                ['# Online', dif(linhaAberta.difOnline)],
                ['Desc. OFF', qtdEValor(linhaAberta.descOffQtd, linhaAberta.descOffRs)],
                ['Desc. VR', qtdEValor(linhaAberta.descVrQtd, linhaAberta.descVrRs)],
                ['SD Desc. iFood', moeda(linhaAberta.sdDescontoIfood)],
                ['CB Desc. iFood (borderô)', moeda(linhaAberta.cbDescontosIfood)],
                ['# Desc. iFood', dif(linhaAberta.difDescontoIfood)],
                [
                  'Desc. LOJA On',
                  qtdEValor(linhaAberta.descLojaOnlineQtd, linhaAberta.descLojaOnlineRs),
                ],
                [
                  'Desc. LOJA Off',
                  qtdEValor(linhaAberta.descLojaOffQtd, linhaAberta.descLojaOffRs),
                ],
                ['SD Desc. LOJA', moeda(linhaAberta.sdDescontoLoja)],
                ['# Desc. LOJA', dif(linhaAberta.difDescontoLoja)],
                ['# Total', dif(linhaAberta.difTotal)],
              ]
            : []
        }
      />
    </div>
  )
}
