import type { ReactElement, ReactNode } from 'react'
import { Modal, Tooltip, type ModalContentProps } from '@gia-cb/ui'

interface PainelDialogProps {
  aberto: boolean
  onAbertoChange: (aberto: boolean) => void
  /** Botão que abre (vira o `Modal.Trigger` via `asChild`). */
  gatilho: ReactElement
  tooltip: ReactNode
  titulo: string
  descricao: string
  children: ReactNode
  /** Botões do rodapé; o X do canto fecha sempre. */
  rodape?: ReactNode
  size?: ModalContentProps['size']
}

/**
 * Dialog aberto por um botão do cabeçalho da tabela (Totais, Filtros), no `Modal`
 * do portal: overlay, superfície glass, animação de entrada/saída e tela cheia
 * no celular já vêm dele. Fecha com o X, o rodapé, clique fora ou Esc.
 */
export function PainelDialog({
  aberto,
  onAbertoChange,
  gatilho,
  tooltip,
  titulo,
  descricao,
  children,
  rodape,
  size = 'xl',
}: PainelDialogProps) {
  return (
    <Modal open={aberto} onOpenChange={onAbertoChange}>
      <Tooltip content={tooltip}>
        <Modal.Trigger asChild>{gatilho}</Modal.Trigger>
      </Tooltip>
      <Modal.Content size={size}>
        <Modal.Header>
          <Modal.Title>{titulo}</Modal.Title>
          <Modal.Description>{descricao}</Modal.Description>
        </Modal.Header>
        <Modal.Body>{children}</Modal.Body>
        {rodape && <Modal.Footer>{rodape}</Modal.Footer>}
      </Modal.Content>
    </Modal>
  )
}
