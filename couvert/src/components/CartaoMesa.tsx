import type { ComponentType, Ref } from 'react'
import { motion } from 'framer-motion'
import { ConciergeBell, Music, Users } from 'lucide-react'
import { cn } from '@gia-cb/ui/cn'
import { defaultTransition, fastTransition, usePrefersReducedMotion } from '@gia-cb/ui/motion'
import { ROTULO_SITUACAO, selo, situacao, situacaoDoContador } from '../regras'
import type { Mesa, Movimento, Situacao } from '../types'

/**
 * Card de uma mesa aberta, no desenho aprovado pelo usuário em 19/11/2026
 * (docs/artefatos/mesas-referencia-usuario.png): à esquerda, o quadrinho do couvert
 * artístico (nota musical); no meio, a mesa em destaque com o grupo (`45/2`) e as
 * pessoas; à direita, sempre (como no legado), o quadrinho do buffet. Cada quadrinho tem a
 * cor da situação dele e, quando diverge, o selo da diferença (−2, +1); a borda do
 * card é a da pior situação. Mesa com 0 pessoas leva o selo "sem pessoas": neutra sem lançamento, vermelha com couvert ou buffet lançado. Tocar no
 * card abre o detalhe da conta.
 */
const BORDA: Record<Situacao, string> = {
  'tudo-lancado': 'border-border',
  'sem-lancamento': 'border-warning/60',
  'sem-pessoas': 'border-border',
  divergente: 'border-destructive/50',
}

const QUADRO: Record<Situacao, string> = {
  'tudo-lancado': 'bg-muted text-muted-foreground',
  'sem-pessoas': 'bg-muted text-muted-foreground',
  'sem-lancamento': 'border border-warning/50 bg-warning/15 text-warning',
  divergente: 'border border-destructive/50 bg-destructive/15 text-destructive',
}

/** Nome curto (o normal, um número) em destaque; nome longo encolhe e quebra em 2 linhas. */
function tamanhoDoNome(nome: string): string {
  if (nome.length <= 3) return 'text-xl sm:text-2xl'
  if (nome.length <= 5) return 'text-base sm:text-xl'
  return 'line-clamp-2 break-words text-center text-xs sm:text-sm'
}

function Selo({ texto, className }: { texto: string; className?: string }) {
  return (
    <span
      className={cn(
        'absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-destructive px-1.5 text-[11px] font-bold leading-4 text-destructive-foreground shadow-sm',
        className
      )}
    >
      {texto}
    </span>
  )
}

function Quadro({
  pessoas,
  valor,
  icone: Icone,
}: {
  pessoas: number
  valor: number
  icone: ComponentType<{ className?: string }>
}) {
  const marca = selo(pessoas, valor)
  return (
    <div
      className={cn(
        'relative flex w-9 shrink-0 sm:w-11 flex-col items-center justify-center gap-1 rounded-lg py-2',
        QUADRO[situacaoDoContador(pessoas, valor)]
      )}
    >
      {marca && <Selo texto={marca} />}
      <span className="text-lg font-semibold leading-none tabular-nums">{valor}</span>
      <Icone className="h-3.5 w-3.5" />
    </div>
  )
}

/** De onde vem o card que mudou para longe: um passo curto (px), na direção certa. */
const PASSO = 28
/** Deslize até o lugar novo: o `duration-slow` do tema (320 ms), sem quicar. */
const DESLIZE = { ...defaultTransition, duration: 0.32 }
/** Passo curto do card que mudou para longe: 200 ms, freando no fim. */
const CHEGADA = { ...defaultTransition, ease: [0.2, 0, 0, 1] as [number, number, number, number] }

interface Props {
  mesa: Mesa
  temBuffet: boolean
  /** Como o card chegou à posição atual (ver `movimentos` na view). */
  movimento: Movimento | undefined
  /** Ordem das mesas na tela: o card só desliza quando ela muda. */
  ordemNaTela: string
  ref?: Ref<HTMLLIElement>
  /** Toque no card: abre o detalhe da conta (`DetalheMesa`). */
  onAbrir: () => void
}

export function CartaoMesa({ mesa, temBuffet, movimento, ordemNaTela, ref, onAbrir }: Props) {
  const semMovimento = usePrefersReducedMotion()
  const vindo = semMovimento || !movimento ? { x: 0, y: 0 } : movimento
  const s = situacao(mesa, temBuffet)
  const pessoas = `${mesa.pessoas} ${mesa.pessoas === 1 ? 'pessoa' : 'pessoas'}`
  const rotulo = [
    `Mesa ${mesa.mesa}${mesa.grupo !== null ? `, grupo ${mesa.grupo}` : ''}`,
    pessoas,
    `${mesa.couvert} couvert`,
    `${mesa.buffet} buffet`,
    ROTULO_SITUACAO[s].toLowerCase(),
  ]
    .filter(Boolean)
    .join(', ')
  return (
    <motion.li
      ref={ref}
      className="min-w-0"
      layout={semMovimento ? false : 'position'}
      layoutDependency={ordemNaTela}
      initial={{ opacity: 0, x: -vindo.x * PASSO, y: -vindo.y * PASSO }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, transition: fastTransition }}
      transition={{ layout: DESLIZE, x: CHEGADA, y: CHEGADA, opacity: CHEGADA }}
    >
      <button
        type="button"
        onClick={onAbrir}
        aria-label={`${rotulo}. Ver a conta.`}
        aria-haspopup="dialog"
        className={cn(
          'flex w-full min-w-0 items-stretch gap-1 rounded-xl sm:gap-2 border bg-surface p-1.5 text-left shadow-sm',
          'transition-[box-shadow,transform] duration-fast hover:shadow-md active:scale-[0.99]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          BORDA[s]
        )}
      >
        <Quadro pessoas={mesa.pessoas} valor={mesa.couvert} icone={Music} />
        <div className="relative flex min-w-0 flex-1 flex-col items-center justify-center py-1">
          {mesa.pessoas <= 0 && (
            <Selo
              texto="sem pessoas"
              className={cn(
                '-top-3.5',
                s === 'sem-pessoas' && 'border border-border bg-muted text-muted-foreground'
              )}
            />
          )}
          <p className="flex min-w-0 max-w-full items-baseline">
            <span
              className={cn(
                'font-bold leading-tight text-foreground tabular-nums',
                tamanhoDoNome(mesa.mesa)
              )}
            >
              {mesa.mesa}
            </span>
            {mesa.grupo !== null && (
              <span className="shrink-0 text-sm font-medium text-muted-foreground tabular-nums">
                /{mesa.grupo}
              </span>
            )}
          </p>
          <p className="flex items-center gap-1 text-sm text-muted-foreground tabular-nums">
            <Users className="h-3.5 w-3.5" />
            {mesa.pessoas}
          </p>
        </div>
        <Quadro pessoas={mesa.pessoas} valor={mesa.buffet} icone={ConciergeBell} />
      </button>
    </motion.li>
  )
}
