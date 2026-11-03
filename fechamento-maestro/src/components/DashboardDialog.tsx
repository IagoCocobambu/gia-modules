import { useMemo } from 'react'
import { Modal } from '@gia-cb/ui'
import { vendasPorCanal } from '../helpers'
import type { PedidoFechamento } from '../types'
import { VendasPorCanal } from './VendasPorCanal'

interface DashboardDialogProps {
  aberto: boolean
  /** Todos os pedidos da pesquisa (o filtro "Só divergências" não vale aqui). */
  pedidos: PedidoFechamento[]
  carregando: boolean
  /** Loja e período da pesquisa, como no subtítulo da tela. */
  descricao: string
  onFechar: () => void
}

/** Dashboard do período pesquisado, num dialog: por enquanto, as vendas por canal. */
export function DashboardDialog({
  aberto,
  pedidos,
  carregando,
  descricao,
  onFechar,
}: DashboardDialogProps) {
  const canais = useMemo(() => vendasPorCanal(pedidos), [pedidos])

  return (
    <Modal open={aberto} onOpenChange={(v) => !v && onFechar()}>
      <Modal.Content size="lg">
        <Modal.Header>
          <Modal.Title>Dashboard</Modal.Title>
          <Modal.Description>{descricao}</Modal.Description>
        </Modal.Header>
        <Modal.Body>
          <VendasPorCanal canais={canais} carregando={carregando} />
        </Modal.Body>
      </Modal.Content>
    </Modal>
  )
}
