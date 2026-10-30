import { AnimatePresence, motion } from 'framer-motion'
import { ListChecks } from 'lucide-react'
import { useId, type ComponentType, type SVGProps } from 'react'
import { Skeleton } from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'
import { fadeIn, scaleIn, usePrefersReducedMotion } from '@gia-cb/ui/motion'

export interface OpcaoChip {
  /** Valor que vai no conjunto de selecionados. */
  chave: string
  label: string
  quantidade: number
  icone?: ComponentType<SVGProps<SVGSVGElement>>
  /** Cor do ícone quando o chip NÃO está marcado (marcado, herda o texto). */
  corIcone?: string
}

interface FiltroChipsProps {
  /** Rótulo da barra, ex.: "Status". */
  rotulo: string
  /** Opções na ordem de exibição; `null` enquanto não há resultado. */
  opcoes: OpcaoChip[] | null
  /** Chaves marcadas; vazio = todos. */
  selecionados: ReadonlySet<string>
  onSelecionar: (selecionados: ReadonlySet<string>) => void
  carregando: boolean
  compacto: boolean
  className?: string
}

const NUM = new Intl.NumberFormat('pt-BR')

/**
 * Barra de chips de filtro: um chip por opção com a quantidade de pedidos, mais
 * o chip "Todos" (soma das opções). Clicar numa opção liga/desliga — dá pra
 * marcar várias. "Todos" limpa a escolha; desmarcar a última também volta pra
 * "Todos". Só aparece opção que tem pedido na tabela (quantidade > 0); a
 * exceção é a já marcada, que fica mesmo zerada pra poder desmarcar. Chip que
 * entra/sai faz fade + escala, e os vizinhos deslizam pro lugar.
 *
 * Visual de FILTRO (pílulas), de propósito diferente dos cards de totais: o
 * usuário distingue de relance o que é número e o que é botão. No desktop vira
 * uma lista de largura cheia (quantidade alinhada à direita); no celular, 2 por linha.
 */
export function FiltroChips({
  rotulo,
  opcoes,
  selecionados,
  onSelecionar,
  carregando,
  compacto,
  className,
}: FiltroChipsProps) {
  const idRotulo = useId()
  const reduzido = usePrefersReducedMotion()
  const semDados = carregando || !opcoes
  const total = (opcoes ?? []).reduce((a, o) => a + o.quantidade, 0)

  function alternar(chave: string) {
    const prox = new Set(selecionados)
    if (prox.has(chave)) prox.delete(chave)
    else prox.add(chave)
    onSelecionar(prox)
  }

  const chips: (Omit<OpcaoChip, 'chave'> & { chave: string | null })[] = [
    { chave: null, label: 'Todos', quantidade: total, icone: ListChecks, corIcone: 'text-primary' },
    ...(opcoes ?? []).filter((o) => o.quantidade > 0 || selecionados.has(o.chave)),
  ]

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <span
        id={idRotulo}
        className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
      >
        {rotulo}
      </span>
      <div
        role="group"
        aria-labelledby={idRotulo}
        // `relative`: o chip que sai (popLayout) é posicionado em relação à grade.
        className={cn('relative grid gap-2', compacto ? 'grid-cols-2' : 'grid-cols-1')}
      >
        <AnimatePresence initial={false} mode="popLayout">
          {chips.map(({ chave, label, quantidade, icone: Icone, corIcone }) => {
            const ativo = chave === null ? selecionados.size === 0 : selecionados.has(chave)
            return (
              <motion.button
                key={chave ?? '__todos'}
                layout={reduzido ? false : 'position'}
                variants={reduzido ? fadeIn : scaleIn}
                initial="hidden"
                animate="visible"
                exit="exit"
                type="button"
                aria-pressed={ativo}
                disabled={semDados}
                onClick={() => (chave === null ? onSelecionar(new Set()) : alternar(chave))}
                className={cn(
                  'inline-flex min-h-9 w-full items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium',
                  'transition-colors duration-fast ease-default',
                  // Anel por dentro: o corpo do dialog rola (overflow) e cortaria o de fora.
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
                  'disabled:cursor-not-allowed',
                  ativo
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-surface text-foreground enabled:hover:bg-muted'
                )}
              >
                {Icone && (
                  <Icone
                    aria-hidden
                    className={cn(
                      'h-4 w-4 shrink-0 transition-colors duration-fast',
                      ativo ? 'text-primary-foreground' : corIcone
                    )}
                  />
                )}
                <span className="min-w-0 flex-1 truncate text-left">{label}</span>
                {semDados ? (
                  <Skeleton className="h-5 w-8 rounded-full" />
                ) : (
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs tabular-nums transition-colors duration-fast',
                      ativo
                        ? 'bg-primary-foreground/20 text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {NUM.format(quantidade)}
                  </span>
                )}
              </motion.button>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
