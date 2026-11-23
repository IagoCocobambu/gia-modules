import type { ComponentType } from 'react'
import { CircleCheck, CircleDashed, TriangleAlert, UserX } from 'lucide-react'
import { Button, Select } from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'
import type { Contagem } from '../regras'
import type { FiltroSituacao } from '../types'

interface Chip {
  id: FiltroSituacao
  rotulo: string
  icone?: ComponentType<{ className?: string }>
  cor?: string
}

const CHIPS: Chip[] = [
  { id: 'todas', rotulo: 'Todas' },
  { id: 'divergente', rotulo: 'Divergentes', icone: TriangleAlert, cor: 'text-destructive' },
  { id: 'sem-lancamento', rotulo: 'Sem lançamento', icone: CircleDashed, cor: 'text-warning' },
  { id: 'sem-pessoas', rotulo: 'Sem pessoas', icone: UserX, cor: 'text-muted-foreground' },
  { id: 'tudo-lancado', rotulo: 'Tudo lançado', icone: CircleCheck, cor: 'text-success' },
]

/** Ícone, situação e quantas mesas — no campo e nas opções da lista do celular. */
function Opcao({ chip: { icone: Icone, rotulo, cor }, n }: { chip: Chip; n: number }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      {Icone && <Icone className={cn('h-4 w-4 shrink-0', cor)} />}
      <span className="truncate">{rotulo}</span>
      <span className="font-semibold tabular-nums">{n}</span>
    </span>
  )
}

interface Props {
  contagem: Contagem
  filtro: FiltroSituacao
  onFiltro: (f: FiltroSituacao) => void
  /** Layout de celular: lista suspensa no lugar dos chips. */
  compacto: boolean
}

/**
 * Chips com quantas mesas há em cada situação (desenho do usuário — no lugar da barra
 * de indicadores do padrão 3). As contagens são da pesquisa inteira e não mudam com o
 * filtro; o clique mostra só aquelas mesas; Todas tira o filtro. Chip zerado não filtra.
 * No celular (`compacto`) os chips não cabem numa linha: viram um `Select` do SDK com as
 * mesmas situações e contagens (pedido do usuário, 23/11/2026).
 */
export function ChipsSituacao({ contagem, filtro, onFiltro, compacto }: Props) {
  if (compacto) {
    const atual = CHIPS.find((c) => c.id === filtro) ?? CHIPS[0]
    return (
      <div data-tour="couvert-chips">
        <Select value={filtro} onValueChange={(v) => onFiltro(v as FiltroSituacao)}>
          <Select.Trigger className="h-11 w-full" aria-label="Filtrar mesas pela situação">
            <Opcao chip={atual} n={contagem[atual.id]} />
          </Select.Trigger>
          <Select.Content>
            {CHIPS.map((c) => (
              <Select.Item
                key={c.id}
                value={c.id}
                textValue={c.rotulo}
                disabled={contagem[c.id] === 0 && c.id !== 'todas' && c.id !== filtro}
                className="min-h-11"
              >
                <Opcao chip={c} n={contagem[c.id]} />
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      </div>
    )
  }
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
