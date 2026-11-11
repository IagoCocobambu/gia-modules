import { useMemo } from 'react'
import { CalendarClock, Landmark, Scale, Wallet } from 'lucide-react'
import { DataReport, type ColumnDef } from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'
import { classeDivergencia, formatBRL } from '../helpers'
import { somar } from '../regras'
import { temDiferenca, useFiltroCards, useInformarVisiveis } from '../hooks/use-filtro-cards'
import { BotaoFiltroAtivo } from './BotaoFiltroAtivo'
import { BarraIndicadores } from './BarraIndicadores'
import { BotaoTotais } from './BotaoTotais'
import { Recolhivel } from './Recolhivel'
import type { LinhaRecebimento } from '../types'

const moeda = (v: number) => <span className="whitespace-nowrap tabular-nums">{formatBRL(v)}</span>
const dif = (v: number) => (
  <span className={cn('whitespace-nowrap tabular-nums', classeDivergencia(v))}>{formatBRL(v)}</span>
)

interface Props {
  linhas: LinhaRecebimento[]
  contexto: string
  /** Barra de totais aberta (estado da tela, igual nas abas). */
  totaisAbertos: boolean
  onTotaisAbertosChange: (abertos: boolean) => void
  /**
   * Consulta terminou. Cada data de pagamento depende de todas as páginas do iFood:
   * antes do fim a tabela fica no carregamento e os cards também.
   */
  completo?: boolean
  /** Linhas visíveis com o filtro do card (`null` = sem filtro), para a barra de abas. */
  onVisiveisChange?: (visiveis: number | null) => void
}

export function AbaRecebimento({
  linhas,
  contexto,
  totaisAbertos,
  onTotaisAbertosChange,
  completo = true,
  onVisiveisChange,
}: Props) {
  const totalDif = somar(linhas, (r) => r.diferenca)
  const comDiferenca = linhas.filter((r) => temDiferenca(r.diferenca)).length
  // "datas com diferença" é um recorte: o clique mostra só essas datas.
  const [filtro, setFiltro] = useFiltroCards(contexto, completo)
  const visiveis = filtro === 'datas' ? linhas.filter((r) => temDiferenca(r.diferenca)) : linhas
  useInformarVisiveis(filtro === 'datas' ? visiveis.length : null, onVisiveisChange)
  const colunas = useMemo<ColumnDef<LinhaRecebimento, unknown>[]>(
    () => [
      { accessorKey: 'competencia', header: 'Competência', meta: { calculadora: false } },
      {
        accessorKey: 'dataPagamento',
        header: 'Data de pagamento',
        meta: { mobile: 'primary', calculadora: false },
      },
      {
        accessorKey: 'siteRestaurante',
        header: 'Site restaurante',
        meta: { mobile: 'primary' },
        cell: ({ row }) => moeda(row.original.siteRestaurante),
      },
      {
        accessorKey: 'extrato',
        header: 'Extrato',
        cell: ({ row }) => moeda(row.original.extrato),
      },
      {
        accessorKey: 'diferenca',
        header: 'Diferença',
        meta: { mobile: 'primary' },
        cell: ({ row }) => dif(row.original.diferenca),
      },
    ],
    []
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <Recolhivel className="shrink-0" visivel={totaisAbertos}>
        <BarraIndicadores
          rotulo="Totais do recebimento do mês"
          carregando={!completo}
          itens={[
            {
              id: 'site',
              rotulo: 'site restaurante',
              dica: 'Soma do repasse previsto pelo iFood (lançamentos com impacto no repasse) no mês',
              icone: Landmark,
              tom: 'info',
              valor: formatBRL(somar(linhas, (r) => r.siteRestaurante)),
            },
            {
              id: 'extrato',
              rotulo: 'extrato',
              dica: 'Soma do malote do extrato bancário casado com as datas de pagamento',
              icone: Wallet,
              tom: 'neutro',
              valor: formatBRL(somar(linhas, (r) => r.extrato)),
            },
            {
              id: 'diferenca',
              rotulo: 'diferença',
              dica: 'Site restaurante − extrato, somado no mês. O normal é zero',
              icone: Scale,
              tom: Math.abs(totalDif) < 0.005 ? 'success' : 'warning',
              valor: formatBRL(totalDif),
            },
            {
              id: 'datas',
              rotulo: 'datas com diferença',
              dica: 'Datas de pagamento em que o site e o extrato não batem. Clique para ver só essas datas',
              icone: CalendarClock,
              tom: comDiferenca > 0 ? 'warning' : 'success',
              valor: comDiferenca.toLocaleString('pt-BR'),
              filtra: true,
              zerado: comDiferenca === 0,
            },
          ]}
          filtro={filtro}
          onFiltroChange={setFiltro}
        />
      </Recolhivel>
      <DataReport
        className="[&_td]:whitespace-nowrap"
        fillHeight
        title="Recebimento"
        subtitle="Repasse previsto pelo iFood (lançamentos com impacto no repasse), por data de pagamento, × malote do extrato bancário."
        columns={colunas}
        data={completo ? visiveis : []}
        loading={!completo}
        enableSorting={false}
        countNoun="datas"
        actions={
          <>
            {filtro === 'datas' && (
              <BotaoFiltroAtivo nome="datas com diferença" onLimpar={() => setFiltro(null)} />
            )}
            <BotaoTotais abertos={totaisAbertos} onAbertosChange={onTotaisAbertosChange} />
          </>
        }
        calculadora={{ contexto }}
        emptyState={
          <p className="py-10 text-center text-sm text-muted-foreground">
            Nenhum lançamento com impacto no repasse e data de pagamento neste mês.
          </p>
        }
      />
    </div>
  )
}
