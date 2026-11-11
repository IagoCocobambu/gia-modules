import { useEffect } from 'react'
import { TourGuide, useTourTabSync } from '@gia-cb/ui'
import { useTourGuide } from '@gia-cb/sdk/modules'
import type { AbaReports } from '../../operacional'
import { tourDasAbas } from '../../tour-das-abas'

interface Props {
  aba: AbaReports
  onAba: (aba: AbaReports) => void
  /** Avisa quando o tour abre e fecha — a view o mantém montado enquanto aberto. */
  onAberto: (aberto: boolean) => void
}

/**
 * Monta o tour das abas (`tour-das-abas.ts`). A view só monta este componente
 * quando o tour da tela já terminou: assim os dois nunca aparecem juntos. O
 * `useTourTabSync` troca para a aba de cada passo (Operacional, depois Pedidos)
 * e devolve a aba anterior ao concluir ou pular.
 */
export function TourDasAbas({ aba, onAba, onAberto }: Props) {
  const sincronia = useTourTabSync<AbaReports>(aba, onAba)
  const controller = useTourGuide(tourDasAbas, {
    onStepChange: sincronia.onStepChange,
    onComplete: sincronia.onComplete,
  })
  const aberto = controller.step != null

  useEffect(() => {
    onAberto(aberto)
  }, [aberto, onAberto])
  // Saiu da tela (ou a view desmontou o tour): o tour deixa de estar aberto.
  useEffect(() => () => onAberto(false), [onAberto])

  return <TourGuide controller={controller} />
}
