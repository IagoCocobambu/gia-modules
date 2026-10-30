import type { ReactNode } from 'react'
import { AlertTriangle, CircleCheck } from 'lucide-react'
import { Button, Modal } from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'
import { formatBRL, formatDataHora } from '../helpers'
import type { PedidoFechamento } from '../types'
import { BadgeCheck } from './BadgeCheck'
import { BadgeOrigemPedido } from './BadgeOrigemPedido'
import { BadgeStatusPedido } from './BadgeStatusPedido'
import { BadgeTipoPagamento } from './BadgeTipoPagamento'

interface DetalhePedidoDialogProps {
  /** Pedido aberto; `null` fecha o dialog. */
  pedido: PedidoFechamento | null
  onFechar: () => void
  className?: string
}

function Linha({ rotulo, valor }: { rotulo: string; valor: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 text-sm">
      <span className="text-muted-foreground">{rotulo}</span>
      <span className="text-right font-medium tabular-nums text-foreground">{valor}</span>
    </div>
  )
}

/**
 * Conciliação de UM pedido: cada forma de pagamento com o grupo em que caiu
 * (Online/Adquirente/Offline), cada desconto, os dois checks e — quando houver —
 * a explicação de cada divergência. Abre ao clicar numa linha (ou card) da visão
 * de pedidos.
 */
export function DetalhePedidoDialog({ pedido, onFechar, className }: DetalhePedidoDialogProps) {
  return (
    <Modal open={pedido !== null} onOpenChange={(aberto) => !aberto && onFechar()}>
      <Modal.Content size="lg" className={className}>
        {pedido && (
          <>
            <Modal.Header>
              <Modal.Title>Pedido {pedido.n_pedido || pedido.id}</Modal.Title>
              <Modal.Description>
                {formatDataHora(pedido.data_de_criacao)}
                {pedido.nome_cliente ? ` · ${pedido.nome_cliente}` : ''}
              </Modal.Description>
            </Modal.Header>
            <Modal.Body className="space-y-5">
              <div className="flex flex-wrap gap-2">
                {pedido.origem && <BadgeOrigemPedido origem={pedido.origem} />}
                {pedido.status_do_pedido && <BadgeStatusPedido status={pedido.status_do_pedido} />}
              </div>

              {pedido.divergencias.length > 0 ? (
                <div className="space-y-1 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-foreground">
                  <p className="flex items-center gap-2 font-medium">
                    <AlertTriangle aria-hidden className="h-4 w-4 text-destructive" />
                    Divergências
                  </p>
                  <ul className="list-disc space-y-0.5 pl-6">
                    {pedido.divergencias.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 p-3 text-sm text-foreground">
                  <CircleCheck aria-hidden className="h-4 w-4 text-success" />
                  Pagamentos e descontos conferem com os totais do pedido.
                </p>
              )}

              <section className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-foreground">Formas de pagamento</h3>
                  <BadgeCheck ok={pedido.check_pagamentos} />
                </div>
                {pedido.pagamentos.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma forma de pagamento.</p>
                ) : (
                  <ul className="divide-y divide-border rounded-lg border border-border">
                    {pedido.pagamentos.map((p, i) => (
                      <li
                        key={`${p.descricao}-${i}`}
                        className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm"
                      >
                        <span className="min-w-0 break-words text-foreground">{p.descricao}</span>
                        <span className="flex items-center gap-2">
                          <BadgeTipoPagamento tipo={p.tipo} />
                          <span className="font-medium tabular-nums text-foreground">
                            {formatBRL(p.valor)}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="divide-y divide-border">
                  <Linha rotulo="Online" valor={formatBRL(pedido.total_pago_online)} />
                  <Linha rotulo="Adquirentes" valor={formatBRL(pedido.total_pago_adquirentes)} />
                  <Linha rotulo="Offline" valor={formatBRL(pedido.total_pago_offline)} />
                  {pedido.total_nao_classificado !== 0 && (
                    <Linha
                      rotulo="Não classificado"
                      valor={formatBRL(pedido.total_nao_classificado)}
                    />
                  )}
                  <Linha rotulo="Total pago (pedido)" valor={formatBRL(pedido.total_pago)} />
                </div>
              </section>

              <section className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-foreground">Descontos</h3>
                  <BadgeCheck ok={pedido.check_descontos} />
                </div>
                {pedido.lista_descontos.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum desconto.</p>
                ) : (
                  <ul className="divide-y divide-border rounded-lg border border-border">
                    {pedido.lista_descontos.map((d, i) => (
                      <li
                        key={`${d.descricao}-${i}`}
                        className="flex items-center justify-between gap-2 px-3 py-2 text-sm"
                      >
                        <span className="min-w-0 break-words text-foreground">{d.descricao}</span>
                        <span className="font-medium tabular-nums text-foreground">
                          {formatBRL(d.valor)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="divide-y divide-border">
                  <Linha rotulo="Soma dos descontos" valor={formatBRL(pedido.total_de_descontos)} />
                  <Linha
                    rotulo="Desconto total (pedido)"
                    valor={formatBRL(pedido.desconto_total)}
                  />
                </div>
              </section>

              <section className="divide-y divide-border">
                <Linha rotulo="Valor do pedido" valor={formatBRL(pedido.valor_do_pedido)} />
                <Linha rotulo="Valor da entrega" valor={formatBRL(pedido.valor_da_entrega)} />
                <Linha rotulo="Incentivo parceiro" valor={formatBRL(pedido.incentivo_parceiro)} />
                <Linha rotulo="Tipo de entrega" valor={pedido.tipo_entrega ?? '—'} />
                <Linha
                  rotulo="Venda concluída"
                  valor={
                    <span
                      className={cn(pedido.venda_concluida ? 'text-success' : 'text-foreground')}
                    >
                      {pedido.venda_concluida ? 'Sim' : 'Não'}
                    </span>
                  }
                />
              </section>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="outline" onClick={onFechar}>
                Fechar
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal.Content>
    </Modal>
  )
}
