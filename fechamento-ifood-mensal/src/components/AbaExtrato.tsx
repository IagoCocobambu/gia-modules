import { useMemo, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Banknote, ListOrdered } from 'lucide-react'
import { Button, ConfirmDialog, DataReport, type ColumnDef } from '@gia-cb/ui'
import { BOTAO_ICONE_TOQUE, extratoVazio, formatBRL, formatData, ROTULO_TOQUE } from '../helpers'
import { somar } from '../regras'
import type { LinhaExtrato } from '../types'
import { BarraIndicadores } from './BarraIndicadores'
import { BotaoTotais } from './BotaoTotais'
import { Recolhivel } from './Recolhivel'
import { Dica } from './Dica'
import { ExtratoDialog } from './ExtratoDialog'

type Linha = LinhaExtrato & { indice: number }

interface Props {
  linhas: LinhaExtrato[]
  mes: string
  podeEditar: boolean
  onIncluir: (l: LinhaExtrato) => void
  onAlterar: (indice: number, l: LinhaExtrato) => void
  onRemover: (indice: number) => void
  contexto: string
  /** Barra de totais aberta (estado da tela, igual nas abas). */
  totaisAbertos: boolean
  onTotaisAbertosChange: (abertos: boolean) => void
}

export function AbaExtrato({
  linhas,
  mes,
  podeEditar,
  onIncluir,
  onAlterar,
  onRemover,
  contexto,
  totaisAbertos,
  onTotaisAbertosChange,
}: Props) {
  const [editando, setEditando] = useState<{ indice: number | null; linha: LinhaExtrato } | null>(
    null
  )
  const [removendo, setRemovendo] = useState<number | null>(null)
  const dados = useMemo<Linha[]>(() => linhas.map((l, indice) => ({ ...l, indice })), [linhas])

  const colunas = useMemo<ColumnDef<Linha, unknown>[]>(() => {
    const cols: ColumnDef<Linha, unknown>[] = [
      {
        accessorKey: 'dataMovimento',
        header: 'Data do movimento',
        meta: { mobile: 'primary', calculadora: false },
        cell: ({ row }) => (
          <span className="tabular-nums">{formatData(row.original.dataMovimento)}</span>
        ),
      },
      {
        accessorKey: 'malote',
        header: 'Malote',
        meta: { mobile: 'primary' },
        cell: ({ row }) => (
          <span className="whitespace-nowrap tabular-nums">{formatBRL(row.original.malote)}</span>
        ),
      },
      { accessorKey: 'historico', header: 'Histórico', meta: { mobile: 'primary' } },
      { accessorKey: 'loja', header: 'Loja' },
      { accessorKey: 'banco', header: 'Banco' },
      { accessorKey: 'tipo', header: 'Tipo' },
      { accessorKey: 'mesAno', header: 'Mês / Ano' },
      { accessorKey: 'classificacao', header: 'Classificação' },
      { accessorKey: 'subClassificacao', header: 'Sub classificação' },
      { accessorKey: 'documento', header: 'Documento' },
      { accessorKey: 'competencia', header: 'Competência' },
    ]
    if (podeEditar) {
      cols.push({
        id: 'acoes',
        header: '',
        enableSorting: false,
        meta: { calculadora: false },
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Dica content="Editar linha">
              <Button
                variant="ghost"
                size="icon"
                className={BOTAO_ICONE_TOQUE}
                aria-label="Editar linha do extrato"
                onClick={() => setEditando({ indice: row.original.indice, linha: row.original })}
              >
                <Pencil className="h-4 w-4" />
                <span className={ROTULO_TOQUE}>Editar</span>
              </Button>
            </Dica>
            <Dica content="Remover linha">
              <Button
                variant="ghost"
                size="icon"
                className={BOTAO_ICONE_TOQUE}
                aria-label="Remover linha do extrato"
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
          rotulo="Totais do extrato do mês"
          itens={[
            {
              id: 'linhas',
              rotulo: 'linhas no extrato',
              dica: 'Quantidade de linhas do extrato bancário digitadas no mês',
              icone: ListOrdered,
              tom: 'neutro',
              valor: linhas.length.toLocaleString('pt-BR'),
            },
            {
              id: 'malote',
              rotulo: 'malote',
              dica: 'Soma do malote de todas as linhas do extrato do mês',
              icone: Banknote,
              tom: 'info',
              valor: formatBRL(somar(linhas, (l) => l.malote)),
            },
          ]}
        />
      </Recolhivel>
      <DataReport
        className="[&_td]:whitespace-nowrap"
        fillHeight
        title="Extrato bancário"
        subtitle="Lançamentos do extrato do banco (malote), digitados no mês — base da coluna Extrato da aba Recebimento."
        columns={colunas}
        data={dados}
        getRowId={(l) => String(l.indice)}
        globalSearch
        countNoun="linhas"
        calculadora={{ contexto }}
        actions={
          <>
            {podeEditar && (
              <Button
                onClick={() => setEditando({ indice: null, linha: extratoVazio(mes) })}
                data-tour="fechamento-ifood-mensal-extrato-nova"
              >
                <Plus className="h-4 w-4" /> Nova linha
              </Button>
            )}
            <BotaoTotais abertos={totaisAbertos} onAbertosChange={onTotaisAbertosChange} />
          </>
        }
        emptyState={
          <p className="py-10 text-center text-sm text-muted-foreground">
            Nenhuma linha no extrato deste mês
            {podeEditar ? ' — use Nova linha para incluir.' : '.'}
          </p>
        }
      />
      {editando && (
        <ExtratoDialog
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
        title="Remover linha do extrato?"
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
