import { ChartPie } from 'lucide-react'
import { Button } from '@gia-cb/ui'
import { Dica } from './Dica'

interface Props {
  abertos: boolean
  onAbertosChange: (abertos: boolean) => void
}

/**
 * Abre e fecha a barra de totais (padrão 3 do workspace). Na barra estreita do
 * `DataReport` vira só ícone; no toque o rótulo fica sempre visível.
 */
export function BotaoTotais({ abertos, onAbertosChange }: Props) {
  return (
    <Dica content={abertos ? 'Ocultar os totais do mês' : 'Mostrar os totais do mês'}>
      <Button
        variant={abertos ? 'default' : 'outline'}
        className="px-2.5 @max-lg:px-4 @5xl:px-4 [@media(hover:none)]:px-4"
        aria-label="Totais"
        aria-pressed={abertos}
        onClick={() => onAbertosChange(!abertos)}
        data-tour="fechamento-ifood-mensal-totais"
      >
        <ChartPie className="h-4 w-4" />
        <span className="@lg:hidden @5xl:inline [@media(hover:none)]:inline">Totais</span>
      </Button>
    </Dica>
  )
}
