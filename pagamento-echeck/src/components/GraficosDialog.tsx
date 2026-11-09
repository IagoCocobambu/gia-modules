import { useMemo } from 'react'
import { Modal } from '@gia-cb/ui'
import { volumePorHora, volumePorModalidade } from '../helpers'
import type { Transacao } from '../types'
import { RoscaModalidades } from './RoscaModalidades'
import { VolumePorHora } from './VolumePorHora'

interface GraficosDialogProps {
  aberto: boolean
  /** Todas as transações da pesquisa (os filtros de coluna não valem aqui, como no legado). */
  transacoes: Transacao[]
  /** Loja e período da pesquisa, como no subtítulo da tela. */
  descricao: string
  onFechar: () => void
}

/** Os dois gráficos do legado: volume por hora e métodos de pagamento. */
export function GraficosDialog({ aberto, transacoes, descricao, onFechar }: GraficosDialogProps) {
  const horas = useMemo(() => volumePorHora(transacoes), [transacoes])
  const modalidades = useMemo(() => volumePorModalidade(transacoes), [transacoes])

  return (
    <Modal open={aberto} onOpenChange={(v) => !v && onFechar()}>
      <Modal.Content size="2xl">
        <Modal.Header>
          <Modal.Title>Gráficos</Modal.Title>
          <Modal.Description>{descricao}</Modal.Description>
        </Modal.Header>
        <Modal.Body className="space-y-4">
          {/* Só monta com o dialog aberto: a rosca anima ao aparecer. */}
          {aberto && (
            <>
              <VolumePorHora horas={horas} />
              <RoscaModalidades modalidades={modalidades} />
            </>
          )}
        </Modal.Body>
      </Modal.Content>
    </Modal>
  )
}
