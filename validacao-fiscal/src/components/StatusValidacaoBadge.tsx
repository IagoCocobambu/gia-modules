import { Badge } from '@gia-cb/ui'
import { STATUS_LABEL, VARIANTE_STATUS } from '../helpers'
import type { ValidationStatus } from '../types'

export function StatusValidacaoBadge({ status }: { status: ValidationStatus }) {
  return (
    <Badge variant={VARIANTE_STATUS[status]} className="shrink-0 gap-1.5 whitespace-nowrap px-2.5">
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" aria-hidden />
      {STATUS_LABEL[status]}
    </Badge>
  )
}
