import { useMemo, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { ListOrdered, ReceiptText, Undo2 } from 'lucide-react'
import { Button, ConfirmDialog, DataReport, type ColumnDef } from '@gia-cb/ui'
import { BOTAO_ICONE_TOQUE, canceladoVazio, formatBRL, formatData, ROTULO_TOQUE } from '../helpers'
import { useFiltroCards, useInformarVisiveis } from '../hooks/use-filtro-cards'
import { BotaoFiltroAtivo } from './BotaoFiltroAtivo'
import { somar } from '../regras'
import type { LinhaCancelado } from '../types'
import { CanceladoDialog } from './CanceladoDialog'
import { BarraIndicadores } from './BarraIndicadores'
import { BotaoTotais } from './BotaoTotais'
import { Recolhivel } from './Recolhivel'
import { Dica } from './Dica'

type Linha = LinhaCancelado & { indice: number }

interface Props {
  linhas: LinhaCancelado[]
  podeEditar: boolean
  onIncluir: (l: LinhaCancelado) => void
  onAlterar: (indice: number, l: LinhaCancelado) => void
  onRemover: (indice: number) => void
  contexto: string
  /** Linhas visíveis com o filtro do card (`null` = sem filtro), para a barra de abas. */
  onVisiveisChange?: (visiveis: number | null) => void
  /** Barra de totais aberta (estado da tela, igual nas abas). */
  totaisAbertos: boolean
  onTotaisAbertosChange: (abertos: boolean) => void
}

const moeda = (v: number | null) => (
  <span className="whitespace-nowrap tabular-nums">{v === null ? '—' : formatBRL(v)}</span>
)
const data = (v: string) => <span className="tabular-nums">{v ? formatData(v) : '—'}</span>

export function AbaCancelados({
  linhas,
  podeEditar,
  onIncluir,
  onAlterar,
  onRemover,
  contexto,
  onVisiveisChange,
  totaisAbertos,
  onTotaisAbertosChange,
}: Props) {
  const [editando, setEditando] = useState<{ indice: number | null; linha: LinhaCancelado } | null>(
    null
  )
  const [removendo, setRemovendo] = useState<number | null>(null)
  const dados = useMemo<Linha[]>(() => linhas.map((l, indice) => ({ ...l, indice })), [linhas])
  // "reembolsado" é um recorte: o clique mostra só os casos com reembolso.
  const [filtro, setFiltro] = useFiltroCards(contexto)
  const comReembolso = (l: Linha) => (l.valorReembolso ?? 0) > 0
  const visiveis = filtro === 'reembolso' ? dados.filter(comReembolso) : dados
  useInformarVisiveis(filtro === 'reembolso' ? visiveis.length : null, onVisiveisChange)

  const colunas = useMemo<ColumnDef<Linha, unknown>[]>(() => {
    const cols: ColumnDef<Linha, unknown>[] = [
      {
        accessorKey: 'dataPedido',
        header: 'Data do pedido',
        meta: { mobile: 'primary', calculadora: false },
        cell: ({ row }) => data(row.original.dataPedido),
      },
      { accessorKey: 'numeroPedido', header: 'Nº pedido', meta: { mobile: 'primary' } },
      { accessorKey: 'nomeCliente', header: 'Cliente', meta: { mobile: 'primary' } },
      {
        accessorKey: 'valorPedidoTaxa',
        header: 'Valor (pedido + taxa)',
        meta: { mobile: 'primary' },
        cell: ({ row }) => moeda(row.original.valorPedidoTaxa),
      },
      {
        accessorKey: 'valorReembolso',
        header: 'Valor do reembolso',
        cell: ({ row }) => moeda(row.original.valorReembolso),
      },
      { accessorKey: 'estabelecimento', header: 'Estabelecimento' },
      { accessorKey: 'cnpj', header: 'CNPJ' },
      { accessorKey: 'idIfood', header: 'ID iFood' },
      { accessorKey: 'centroVenda', header: 'Centro de venda' },
      { accessorKey: 'origemCancelamento', header: 'Origem do cancelamento' },
      { accessorKey: 'justificativa', header: 'Justificativa' },
      { accessorKey: 'andamento', header: 'Andamento' },
      { accessorKey: 'protocolo', header: 'Protocolo' },
      { accessorKey: 'valeNoCofre', header: 'Vale no cofre?' },
      {
        accessorKey: 'dataAnulacao',
        header: 'Data de anulação',
        meta: { calculadora: false },
        cell: ({ row }) => data(row.original.dataAnulacao),
      },
      {
        accessorKey: 'dataReembolso',
        header: 'Data de reembolso',
        meta: { calculadora: false },
        cell: ({ row }) => data(row.original.dataReembolso),
      },
    ]
    if (podeEditar) {
      cols.push({
        id: 'acoes',
        header: '',
        enableSorting: false,
        meta: { calculadora: false },
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Dica content="Editar">
              <Button
                variant="ghost"
                size="icon"
                className={BOTAO_ICONE_TOQUE}
                aria-label="Editar cancelado"
                onClick={() => setEditando({ indice: row.original.indice, linha: row.original })}
              >
                <Pencil className="h-4 w-4" />
                <span className={ROTULO_TOQUE}>Editar</span>
              </Button>
            </Dica>
            <Dica content="Remover">
              <Button
                variant="ghost"
                size="icon"
                className={BOTAO_ICONE_TOQUE}
                aria-label="Remover cancelado"
                onClick={() => setRemovendo(row.original.indice)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
                <span className={ROTULO_TOQUE}>Remover</span>
              </Button>
            </Dica>
          </div>
        ),
      })
    }
    return cols
  }, [podeEditar])

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <Recolhivel className="shrink-0" visivel={totaisAbertos}>
        <BarraIndicadores
          rotulo="Totais dos cancelados pós-entrega do mês"
          itens={[
            {
              id: 'casos',
              rotulo: 'casos',
              dica: 'Quantidade de cancelados pós-entrega registrados no mês',
              icone: ListOrdered,
              tom: 'neutro',
              valor: linhas.length.toLocaleString('pt-BR'),
            },
            {
              id: 'valor',
              rotulo: 'valor (pedido + taxa)',
              dica: 'Soma do valor do pedido com a taxa de entrega de todos os casos',
              icone: ReceiptText,
              tom: 'warning',
              valor: formatBRL(somar(linhas, (l) => l.valorPedidoTaxa)),
            },
            {
              id: 'reembolso',
              rotulo: 'reembolsado',
              dica: 'Soma do valor do reembolso informado nos casos. Clique para ver só os casos com reembolso',
              icone: Undo2,
              tom: 'success',
              valor: formatBRL(somar(linhas, (l) => l.valorReembolso)),
              filtra: true,
              zerado: !dados.some(comReembolso),
            },
          ]}
          filtro={filtro}
          onFiltroChange={setFiltro}
        />
      </Recolhivel>
      <DataReport
        className="[&_td]:whitespace-nowrap"
        fillHeight
        title="Cancelados pós-entrega"
        subtitle="Pedidos entregues e cancelados depois — contestação, reembolso e o que foi para o cofre."
        columns={colunas}
        data={visiveis}
        getRowId={(l) => String(l.indice)}
        globalSearch
        countNoun="casos"
        calculadora={{ contexto }}
        actions={
          <>
            {filtro === 'reembolso' && (
              <BotaoFiltroAtivo nome="reembolsado" onLimpar={() => setFiltro(null)} />
            )}
            {podeEditar && (
              <Button onClick={() => setEditando({ indice: null, linha: canceladoVazio() })}>
                <Plus className="h-4 w-4" /> Nova linha
              </Button>
            )}
            <BotaoTotais abertos={totaisAbertos} onAbertosChange={onTotaisAbertosChange} />
          </>
        }
        emptyState={
          <p className="py-10 text-center text-sm text-muted-foreground">
            Nenhum cancelado pós-entrega registrado neste mês
            {podeEditar ? ' — use Nova linha para incluir.' : '.'}
          </p>
        }
      />
      {editando && (
        <CanceladoDialog
          inicial={editando.linha}
          novo={editando.indice === null}
          onClose={() => setEditando(null)}
          onConfirmar={(l) =>
            editando.indice === null ? onIncluir(l) : onAlterar(editando.indice, l)
          }
        />
      )}
      <ConfirmDialog
        open={removendo !== null}
        onOpenChange={(o) => !o && setRemovendo(null)}
        title="Remover este cancelado?"
        description="A linha sai da lista agora e do banco quando você clicar em Salvar."
        confirmLabel="Remover"
        tone="danger"
        onConfirm={() => {
          if (removendo !== null) onRemover(removendo)
          setRemovendo(null)
        }}
      />
    </div>
  )
}
