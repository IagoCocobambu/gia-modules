import { ClipboardList } from 'lucide-react'
import { Tooltip } from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'

// O selo que diz que um número vem do PLANO DE ORÇAMENTOS, e não do Plano de
// Contas.
//
// ── POR QUE ELE EXISTE ──────────────────────────────────────────────────────
//
// O painel nasceu lendo só o Plano de Contas, e quem o usa sabe disso. Na aba
// Análises adicionais, parte dos números é o orçamento que a loja lançou em
// OUTRO módulo — e quem vê "+2,1 p.p." precisa saber que o outro lado da conta
// não é o mês passado. Pedido do João em
// 28/09/2026, apontando o Dashboard de RH, que marca assim desde 15/09 os números
// do Plano de Contas e do Plano de Orçamentos na aba Análises adicionais. O ícone
// é o mesmo de lá, para quem transita entre os dois painéis.
//
// Número só do Plano de Contas não leva selo: é o padrão da tela inteira, e
// marcar o padrão tiraria o destaque de quem é exceção.

interface Props {
  /** O que, exatamente, veio do orçamento — vai na segunda linha da dica. */
  detalhe: string
  className?: string
}

export function SeloDoOrcamento({ detalhe, className }: Props) {
  return (
    <Tooltip
      content={
        <div className="flex max-w-[19rem] flex-col gap-1 text-left text-xs">
          <p className="font-semibold">Origem: Plano de Orçamentos</p>
          <p>{detalhe}</p>
        </div>
      }
    >
      <span
        tabIndex={0}
        role="img"
        aria-label="Origem: Plano de Orçamentos"
        className={cn(
          'inline-flex h-4 w-4 shrink-0 items-center justify-center rounded text-muted-foreground outline-none transition-colors duration-fast ease-default hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring',
          className
        )}
      >
        <ClipboardList className="h-3.5 w-3.5" aria-hidden />
      </span>
    </Tooltip>
  )
}
