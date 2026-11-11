import { SegmentedControl, Select, type SegmentedControlOption } from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'

// Um controle da barra de uma grade: pílulas no cartão largo, `Select` no
// estreito.
//
// ── POR QUE DOIS DESENHOS ───────────────────────────────────────────────────
//
// Em pílulas, num celular, quatro controles empilhavam em quatro linhas e a
// grade ficava com uma linha e meia de altura (medido em 18/09/2026, 375 px).
// Como seletores, dois a dois, ocupam duas linhas. O `@3xl` é o do `DataReport`,
// o mesmo ponto em que ele troca a tabela pelos cartões.
//
// ── E POR QUE O RÓTULO APARECE ──────────────────────────────────────────────
//
// Com `rotuloVisivel`, o nome do controle sai UMA vez à esquerda e as pílulas
// ficam só com o valor: "Abrir até 1 | 2 | 3" no lugar de "Nível 1 | Nível 2 |
// Nível 3". São ~90 px a menos num cabeçalho que enchia três linhas e deixava a
// grade com três linhas visíveis (medido em 22/09/2026, 1265 px).
//
// `forma="select"` mantém o seletor em TODA largura — para o controle de quatro
// opções que muda pouco, onde as pílulas custariam 280 px de barra.

interface Props<T extends string | number> {
  value: T
  onChange: (v: T) => void
  ariaLabel: string
  /** O nome curto do controle — "Colunas", "Comparar", "Abrir até". */
  rotulo: string
  /** Mostra o rótulo ao lado das pílulas; dentro delas fica só o valor. */
  rotuloVisivel?: boolean
  forma?: 'pilulas' | 'select'
  options: SegmentedControlOption<T>[]
}

export function Escolha<T extends string | number>({
  value,
  onChange,
  ariaLabel,
  rotulo,
  rotuloVisivel = false,
  forma = 'pilulas',
  options,
}: Props<T>) {
  const atual = options.find((o) => o.value === value)
  const seletor = (
    <Select
      value={String(value)}
      onValueChange={(v) => {
        const o = options.find((x) => String(x.value) === v)
        if (o) onChange(o.value)
      }}
    >
      <Select.Trigger
        className={cn('h-8 w-full text-xs', forma === 'select' && '@3xl:w-[10rem]')}
        aria-label={ariaLabel}
      >
        <span className="min-w-0 truncate">
          <span className="text-muted-foreground">{rotulo}: </span>
          {atual?.label ?? 'personalizado'}
        </span>
      </Select.Trigger>
      <Select.Content>
        {options.map((o) => (
          <Select.Item key={String(o.value)} value={String(o.value)}>
            {o.label}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  )

  if (forma === 'select') return <div className="min-w-0">{seletor}</div>

  return (
    <>
      <div className="hidden items-center gap-1.5 @3xl:flex">
        {rotuloVisivel && (
          <span className="whitespace-nowrap text-xs text-muted-foreground">{rotulo}</span>
        )}
        <SegmentedControl<T>
          value={value}
          onChange={onChange}
          ariaLabel={ariaLabel}
          options={options}
        />
      </div>
      <div className="min-w-0 @3xl:hidden">{seletor}</div>
    </>
  )
}
