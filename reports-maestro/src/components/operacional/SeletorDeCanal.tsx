import { Select } from '@gia-cb/ui'

// O filtro de canal do dashboard Operacional. Fica na linha das abas, à direita
// (pedido da devolutiva da 0.3.0: controle novo vai na linha das abas, não numa
// linha própria que empurra o primeiro gráfico para baixo no celular).
//
// No estreito ele ocupa o espaço que sobra ao lado das abas e corta o nome do
// canal com "…"; o rótulo "Canal" só aparece a partir do `sm`.

const TODOS = '__todos'

interface Props {
  canal: string | null
  canais: string[]
  onChange: (canal: string | null) => void
}

export function SeletorDeCanal({ canal, canais, onChange }: Props) {
  return (
    <div
      className="flex min-w-0 items-center justify-end gap-1.5"
      data-tour="reports-maestro-operacional-filtros"
    >
      <span className="hidden whitespace-nowrap text-xs text-muted-foreground sm:inline">
        Canal
      </span>
      <Select value={canal ?? TODOS} onValueChange={(v) => onChange(v === TODOS ? null : v)}>
        <Select.Trigger
          className="h-9 w-full min-w-0 text-xs sm:w-52 [@media(hover:none)]:min-h-11"
          aria-label="Canal"
        >
          {/* No estreito, "Todos" — "Todos os canais" seria cortado. */}
          <span className="truncate">
            {canal ?? (
              <>
                <span className="sm:hidden">Todos</span>
                <span className="hidden sm:inline">Todos os canais</span>
              </>
            )}
          </span>
        </Select.Trigger>
        <Select.Content>
          <Select.Item value={TODOS}>Todos os canais</Select.Item>
          {canais.map((c) => (
            <Select.Item key={c} value={c}>
              {c}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    </div>
  )
}
