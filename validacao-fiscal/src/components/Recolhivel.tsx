import { useId, type ComponentType, type ReactNode, type SVGProps } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@gia-cb/ui/cn'

// Seção recolhível (acordeão) para o layout de celular. O @gia-cb/ui não tem
// acordeão; este segue o padrão de "expandir/recolher" das convenções: altura +
// fade em `duration-default` e seta girando em `duration-fast`, sem animação
// quando o usuário pede movimento reduzido.

interface RecolhivelProps {
  titulo: string
  /** Linha curta sob o título — o que está escolhido/dentro, visível mesmo fechado. */
  resumo?: ReactNode
  icone?: ComponentType<SVGProps<SVGSVGElement>>
  aberto: boolean
  onAbertoChange: (aberto: boolean) => void
  /** `cartao`: seção com borda e fundo próprios. `embutido`: linha simples dentro de outro cartão. */
  variante?: 'cartao' | 'embutido'
  className?: string
  'data-tour'?: string
  children: ReactNode
}

export function Recolhivel({
  titulo,
  resumo,
  icone: Icone,
  aberto,
  onAbertoChange,
  variante = 'cartao',
  className,
  'data-tour': dataTour,
  children,
}: RecolhivelProps) {
  const id = useId()
  return (
    <section
      className={cn(
        variante === 'cartao' && 'rounded-lg border border-border bg-surface',
        className
      )}
      data-tour={dataTour}
    >
      <button
        type="button"
        aria-expanded={aberto}
        aria-controls={id}
        onClick={() => onAbertoChange(!aberto)}
        className={cn(
          'flex min-h-11 w-full items-center gap-2 py-2 text-left',
          variante === 'cartao' ? 'px-3' : 'px-1',
          'rounded-[inherit] transition-colors duration-fast ease-default hover:bg-muted/50',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
        )}
      >
        {Icone && <Icone className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />}
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-foreground">{titulo}</span>
          {resumo && <span className="block truncate text-xs text-muted-foreground">{resumo}</span>}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-fast ease-default',
            'motion-reduce:transition-none',
            aberto && 'rotate-180'
          )}
          aria-hidden
        />
      </button>
      <div
        id={id}
        role="region"
        aria-label={titulo}
        inert={!aberto}
        className={cn(
          'grid transition-[grid-template-rows,opacity] duration-default ease-default',
          'motion-reduce:transition-none',
          aberto ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="min-h-0 overflow-hidden">{children}</div>
      </div>
    </section>
  )
}
