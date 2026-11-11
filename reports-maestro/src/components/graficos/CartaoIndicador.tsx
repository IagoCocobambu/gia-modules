import type { ReactNode } from 'react'
import { Dica } from '../Dica'
import { cn } from '@gia-cb/ui/cn'
import { entrada } from '../../hooks/use-entrada'

// Cartão de indicador: rótulo, o número e uma linha de contexto.
//
// Adaptado do `CartaoKpi` do Dashboard do Plano de Contas (mesma superfície,
// mesmo tamanho de número, mesma dica). Lá a segunda linha é a variação contra
// o período anterior; aqui não há período de comparação, e a linha diz de onde
// o número sai ("90% até 77 min", "531 de 2.003 entregas").
//
// A conta do cartão (`ajuda`) e os `valores` extras vão na dica, que só existe
// com mouse (ver `Dica`). Em tela de toque os `valores` aparecem escritos no
// próprio cartão, embaixo do detalhe — nenhum número fica preso ao hover; a
// conta de cada cartão está também na FAQ.
//
// O número grande usa figuras PROPORCIONAIS (sem `tabular-nums`): equalizar a
// largura dos dígitos serve a coluna de tabela e atrapalha número de destaque.

interface Props {
  rotulo: string
  /** O número — texto, ou um `NumeroAnimado` para contar do zero. */
  valor: ReactNode
  /** A linha de contexto, embaixo do número. */
  detalhe?: ReactNode
  /** A conta do cartão, em uma ou duas frases — vai na dica (só com mouse). */
  ajuda?: string
  /**
   * Valores extras (ex.: mínimo, mediana, máximo): na dica, embaixo da conta,
   * com mouse; escritos no cartão, embaixo do detalhe, em tela de toque.
   */
  valores?: Array<{ rotulo: string; valor: string }>
  /** Posição na cascata de entrada, em ms. */
  atraso?: number
  className?: string
  tourId?: string
}

export function CartaoIndicador({
  rotulo,
  valor,
  detalhe,
  ajuda,
  valores,
  atraso,
  className,
  tourId,
}: Props) {
  // A dica fica num ALVO por cima do cartão, e não em volta do conteúdo: o
  // `Tooltip` do portal só se monta de verdade no primeiro hover e, nessa troca,
  // remonta o que embrulha — o número voltava a contar do zero a cada primeiro
  // hover. Com o alvo à parte, só ele remonta; o número conta uma vez, ao
  // aparecer (relato do usuário em 05/11/2026).
  const lista = valores ?? []
  const temValores = lista.length > 0
  return (
    <div
      {...(atraso != null ? entrada(atraso) : {})}
      data-tour={tourId}
      className={cn(
        'relative flex h-full min-w-0 flex-col gap-1 rounded-lg border border-border bg-surface p-2.5 text-left',
        ajuda && '[@media(hover:hover)]:cursor-help',
        className
      )}
    >
      <span className="min-w-0 truncate text-xs leading-tight text-muted-foreground">{rotulo}</span>
      <span className="truncate text-2xl font-semibold leading-tight text-foreground">{valor}</span>
      {detalhe && (
        <span className="min-w-0 text-xs leading-snug text-muted-foreground">{detalhe}</span>
      )}
      {temValores && (
        // Só em tela de toque, onde não há dica. O leitor de tela já ouve estes
        // valores no rótulo do alvo da dica, logo abaixo.
        <span
          aria-hidden
          className="hidden grid-cols-[auto_1fr] gap-x-3 border-t border-border pt-1 text-xs leading-snug [@media(hover:none)]:grid"
        >
          {lista.map((v) => (
            <span key={v.rotulo} className="contents">
              <span className="text-muted-foreground">{v.rotulo}</span>
              <span className="text-right tabular-nums text-foreground">{v.valor}</span>
            </span>
          ))}
        </span>
      )}
      {ajuda && (
        <Dica
          content={
            <span className="flex max-w-[18rem] flex-col gap-1.5 text-left">
              <span>{ajuda}</span>
              {temValores && (
                <span className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5 border-t border-border pt-1.5">
                  {lista.map((v) => (
                    <span key={v.rotulo} className="contents">
                      <span className="text-muted-foreground">{v.rotulo}</span>
                      <span className="text-right font-semibold tabular-nums">{v.valor}</span>
                    </span>
                  ))}
                </span>
              )}
            </span>
          }
        >
          <span
            tabIndex={0}
            aria-label={`${rotulo}: ${ajuda}${lista.map((v) => ` ${v.rotulo} ${v.valor}.`).join('')}`}
            className="absolute inset-0 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          />
        </Dica>
      )}
    </div>
  )
}
