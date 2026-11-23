import type { ComponentType } from 'react'
import { Music, Soup, Users } from 'lucide-react'
import { cn } from '@gia-cb/ui/cn'
import { ROTULO_SITUACAO, selo, situacao, situacaoDoContador } from '../regras'
import type { Mesa, Situacao } from '../types'

/**
 * Card de uma mesa aberta, no desenho aprovado pelo usuário em 19/11/2026
 * (docs/artefatos/mesas-referencia-usuario.png): à esquerda, o quadrinho do couvert
 * artístico (nota musical); no meio, a mesa em destaque com o grupo (`45/2`) e as
 * pessoas; à direita, sempre (como no legado), o quadrinho do buffet. Cada quadrinho tem a
 * cor da situação dele e, quando diverge, o selo da diferença (−2, +1); a borda do
 * card é a da pior situação. Mesa com 0 pessoas leva o selo "sem pessoas".
 */
const BORDA: Record<Situacao, string> = {
  'tudo-lancado': 'border-border',
  'sem-lancamento': 'border-warning/60',
  divergente: 'border-destructive/50',
}

const QUADRO: Record<Situacao, string> = {
  'tudo-lancado': 'bg-muted text-muted-foreground',
  'sem-lancamento': 'border border-warning/50 bg-warning/15 text-warning',
  divergente: 'border border-destructive/50 bg-destructive/15 text-destructive',
}

function Selo({ texto }: { texto: string }) {
  return (
    <span className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-destructive px-1.5 text-[11px] font-bold leading-4 text-destructive-foreground shadow-sm">
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
        'relative flex w-11 shrink-0 flex-col items-center justify-center gap-1 rounded-lg py-2',
        QUADRO[situacaoDoContador(pessoas, valor)]
      )}
    >
      {marca && <Selo texto={marca} />}
      <span className="text-lg font-semibold leading-none tabular-nums">{valor}</span>
      <Icone className="h-3.5 w-3.5" />
    </div>
  )
}

export function CartaoMesa({ mesa, temBuffet }: { mesa: Mesa; temBuffet: boolean }) {
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
    <li
      className={cn(
        'flex min-w-0 items-stretch gap-2 rounded-xl border bg-surface p-1.5 shadow-sm',
        'animate-in fade-in duration-fast',
        BORDA[s]
      )}
      aria-label={rotulo}
    >
      <div className="contents" aria-hidden>
        <Quadro pessoas={mesa.pessoas} valor={mesa.couvert} icone={Music} />
        <div className="relative flex min-w-0 flex-1 flex-col items-center justify-center py-1">
          {mesa.pessoas <= 0 && <Selo texto="sem pessoas" />}
          <p className="flex min-w-0 max-w-full items-baseline">
            <span className="truncate text-2xl font-bold leading-tight text-foreground tabular-nums">
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
        <Quadro pessoas={mesa.pessoas} valor={mesa.buffet} icone={Soup} />
      </div>
    </li>
  )
}
