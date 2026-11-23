import type { ComponentType } from 'react'
import { CircleCheck, CircleDashed, TriangleAlert } from 'lucide-react'
import { Button } from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'
import type { Contagem } from '../regras'
import type { FiltroSituacao } from '../types'

/**
 * Chips com quantas mesas há em cada situação (desenho do usuário — no lugar da barra
 * de indicadores do padrão 3). As contagens são da pesquisa inteira e não mudam com o
 * filtro; o clique mostra só aquelas mesas; Todas tira o filtro. Chip zerado não filtra.
 */
const CHIPS: Array<{
  id: FiltroSituacao
  rotulo: string
  icone?: ComponentType<{ className?: string }>
  cor?: string
}> = [
  { id: 'todas', rotulo: 'Todas' },
  { id: 'divergente', rotulo: 'Divergentes', icone: TriangleAlert, cor: 'text-destructive' },
  { id: 'sem-lancamento', rotulo: 'Sem lançamento', icone: CircleDashed, cor: 'text-warning' },
  { id: 'tudo-lancado', rotulo: 'Tudo lançado', icone: CircleCheck, cor: 'text-success' },
]

interface Props {
  contagem: Contagem
  filtro: FiltroSituacao
  onFiltro: (f: FiltroSituacao) => void
}

export function ChipsSituacao({ contagem, filtro, onFiltro }: Props) {
  return (
    <div
      role="group"
      aria-label="Filtrar mesas pela situação"
      className="-mx-1 flex min-w-0 items-center gap-2 overflow-x-auto px-1 py-0.5"
      data-tour="couvert-chips"
    >
      {CHIPS.map(({ id, rotulo, icone: Icone, cor }) => {
        const n = contagem[id]
        const ativo = filtro === id
        const zerado = n === 0 && id !== 'todas' && !ativo
        return (
          <Button
            key={id}
            variant="outline"
            size="sm"
            aria-pressed={ativo}
            aria-disabled={zerado || undefined}
            onClick={() => {
              if (zerado) return
              onFiltro(ativo && id !== 'todas' ? 'todas' : id)
            }}
            className={cn(
              'shrink-0 gap-1.5 rounded-full transition-colors duration-fast',
              ativo && 'bg-primary/10 ring-1 ring-inset ring-primary/40',
              zerado && 'cursor-default opacity-50'
            )}
          >
            {Icone && <Icone className={cn('h-4 w-4', cor)} />}
            {rotulo}
            <span className="font-semibold tabular-nums">{n}</span>
          </Button>
        )
      })}
    </div>
  )
}
