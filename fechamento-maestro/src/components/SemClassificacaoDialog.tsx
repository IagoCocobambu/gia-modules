import { useMemo } from 'react'
import { Modal } from '@gia-cb/ui'
import { formatBRL, formatDataHora } from '../helpers'
import type { PagamentoSemClassificacao, PedidoFechamento } from '../types'

interface SemClassificacaoDialogProps {
  aberto: boolean
  itens: PagamentoSemClassificacao[]
  onFechar: () => void
  /** Abre o detalhe do pedido (fecha esta lista antes). */
  onAbrirPedido: (pedido: PedidoFechamento) => void
}

interface Grupo {
  descricao: string
  valor: number
  itens: PagamentoSemClassificacao[]
}

/**
 * As formas de pagamento sem classificação (vieram do Maestro sem nome ou como
 * DESCONHECIDO), agrupadas pelo texto que veio. Cada pedido da lista abre o
 * detalhe da conciliação.
 */
export function SemClassificacaoDialog({
  aberto,
  itens,
  onFechar,
  onAbrirPedido,
}: SemClassificacaoDialogProps) {
  const grupos = useMemo(() => {
    const porNome = new Map<string, Grupo>()
    for (const item of itens) {
      const nome = item.pagamento.descricao
      const grupo = porNome.get(nome) ?? { descricao: nome, valor: 0, itens: [] }
      grupo.valor += Math.round((item.pagamento.valor ?? 0) * 100)
      grupo.itens.push(item)
      porNome.set(nome, grupo)
    }
    return [...porNome.values()]
      .map((g) => ({ ...g, valor: g.valor / 100 }))
      .sort((a, b) => b.valor - a.valor)
  }, [itens])

  return (
    <Modal open={aberto} onOpenChange={(v) => !v && onFechar()}>
      <Modal.Content size="lg">
        <Modal.Header>
          <Modal.Title>Pagamentos sem classificação</Modal.Title>
          <Modal.Description>
            Formas de pagamento que vieram do Maestro sem nome (vazias ou DESCONHECIDO), então não
            dá para saber se são Online, Adquirentes ou Offline. Confira o pedido no Maestro.
          </Modal.Description>
        </Modal.Header>
        <Modal.Body className="space-y-4">
          {grupos.map((g) => (
            <section key={g.descricao} className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <h3 className="min-w-0 break-words text-sm font-semibold text-foreground">
                  {g.descricao}
                </h3>
                <span className="shrink-0 text-sm font-medium tabular-nums text-foreground">
                  {formatBRL(g.valor)}
                </span>
              </div>
              <ul className="divide-y divide-border rounded-lg border border-border">
                {g.itens.map(({ pedido, pagamento }, i) => (
                  <li key={`${pedido.id}-${i}`}>
                    <button
                      type="button"
                      onClick={() => onAbrirPedido(pedido)}
                      className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition-colors duration-fast ease-default hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                    >
                      <span className="min-w-0">
                        <span className="font-medium">Pedido {pedido.n_pedido || pedido.id}</span>
                        <span className="ml-2 text-muted-foreground tabular-nums">
                          {formatDataHora(pedido.data_de_criacao)}
                        </span>
                      </span>
                      <span className="shrink-0 tabular-nums">{formatBRL(pagamento.valor)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </Modal.Body>
      </Modal.Content>
    </Modal>
  )
}
