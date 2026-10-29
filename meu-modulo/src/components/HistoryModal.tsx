import { Modal } from '@gia-cb/ui'
import { History } from 'lucide-react'

interface HistoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Histórico de sincronizações — versão SIMULADA. No portal real, este modal
 * lista as execuções de `useSyncHistoryButton`. No template, mostra apenas
 * uma mensagem indicando que histórico viria daqui.
 */
export function HistoryModal({ open, onOpenChange }: HistoryModalProps) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <Modal.Content>
        <Modal.Header>
          <Modal.Title>Histórico — Sincronização de Meu Modulo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="flex flex-col items-center gap-3 py-8 text-center text-muted-foreground">
            <div className="rounded-full bg-muted/40 p-3">
              <History className="h-6 w-6" />
            </div>
            <p className="text-sm">
              <strong className="text-foreground">Histórico vazio (simulado)</strong>
            </p>
            <p className="max-w-md text-xs">
              No portal real, este modal lista cada execução de sincronização
              (job_id, início, fim, duração, status, contadores). No template,
              cabe ao parceiro implementar a query contra a tabela de jobs do
              seu domínio.
            </p>
          </div>
        </Modal.Body>
      </Modal.Content>
    </Modal>
  )
}
