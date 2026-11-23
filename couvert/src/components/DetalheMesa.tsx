import type { ComponentType, ReactNode } from 'react'
import {
  CircleCheck,
  Clock,
  ConciergeBell,
  Layers,
  Music,
  Printer,
  TriangleAlert,
  User,
  Users,
} from 'lucide-react'
import { Modal, Spinner } from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'
import { useNomes } from '../api/couvert'
import { ROTULO_SITUACAO, situacao, situacaoDoContador } from '../regras'
import type { Mesa, Situacao } from '../types'

/**
 * Detalhe da conta aberta de uma mesa — escolhido pelo usuário em 23/11/2026 (proposta
 * B+A de docs/artefatos/detalhe-mesa-propostas.html): `Modal` do SDK em duas colunas.
 * À esquerda, o resumo fixo (contadores como no card, fatos e valores); à direita, o
 * aviso do que falta e a lista única de itens (couvert e buffet em destaque). No
 * celular o `Modal` ocupa a tela e as colunas viram uma.
 */

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const brl = (v: number) => BRL.format(v)
/** `AAAA-MM-DDTHH:MM:SS` → `HH:MM`. */
const hora = (v: string | null) => (v && v.length >= 16 ? v.slice(11, 16) : '—')

/** "1h30", "45 min" desde a abertura (hora local da loja lida no fuso do aparelho). */
function abertaHa(abertura: string | null, agora: number): string | null {
  if (!abertura) return null
  const min = Math.floor((agora - new Date(abertura).getTime()) / 60_000)
  if (!Number.isFinite(min) || min < 0) return null
  if (min < 60) return `${min} min`
  return `${Math.floor(min / 60)}h${String(min % 60).padStart(2, '0')}`
}

const PILL: Record<Situacao, string> = {
  divergente: 'bg-destructive/15 text-destructive',
  'sem-lancamento': 'bg-warning/15 text-warning',
  'tudo-lancado': 'bg-success/15 text-success',
}
const CONTADOR: Record<Situacao, string> = {
  divergente: 'bg-destructive/15 text-destructive',
  'sem-lancamento': 'bg-warning/15 text-warning',
  'tudo-lancado': 'bg-muted text-muted-foreground',
}

/** Frase do que falta num contador ("Faltam 2 couverts."), ou `null` se confere. */
function falta(pessoas: number, valor: number, nome: string, plural: string): string | null {
  if (pessoas <= 0 || valor === pessoas) return null
  if (valor === 0) return `Nenhum ${nome} lançado.`
  const d = Math.abs(valor - pessoas)
  return valor < pessoas
    ? `Falta${d > 1 ? 'm' : ''} ${d} ${d > 1 ? plural : nome}.`
    : `${d} ${d > 1 ? plural : nome} a mais.`
}

function Contador({
  valor,
  rotulo,
  icone: Icone,
  estilo,
}: {
  valor: number
  rotulo: string
  icone: ComponentType<{ className?: string }>
  estilo: string
}) {
  return (
    <div className={cn('flex flex-col items-center gap-0.5 rounded-lg py-2', estilo)}>
      <span className="text-xl font-semibold leading-tight tabular-nums">{valor}</span>
      <Icone className="h-3.5 w-3.5" />
      <span className="text-[10px] font-medium uppercase tracking-wide">{rotulo}</span>
    </div>
  )
}

function Fato({
  icone: Icone,
  rotulo,
  largo = false,
  children,
}: {
  icone: ComponentType<{ className?: string }>
  rotulo: string
  /** Ocupa a linha toda (nome do garçom, que é longo). */
  largo?: boolean
  children: ReactNode
}) {
  return (
    <div
      className={cn('grid min-w-0 grid-cols-[1rem_minmax(0,1fr)] gap-x-2', largo && 'col-span-2')}
    >
      <Icone className="mt-0.5 h-4 w-4 text-muted-foreground" />
      <div className="min-w-0">
        <dt className="truncate whitespace-nowrap text-xs text-muted-foreground">{rotulo}</dt>
        <dd className="truncate whitespace-nowrap text-sm font-semibold text-foreground">
          {children}
        </dd>
      </div>
    </div>
  )
}

function Valor({
  rotulo,
  valor,
  forte = false,
  separado = false,
  tom,
}: {
  rotulo: string
  valor: number
  forte?: boolean
  /** Linha tracejada acima, na largura toda (antes do Total). */
  separado?: boolean
  tom?: string
}) {
  return (
    <div
      className={cn(
        'flex items-baseline justify-between gap-3',
        separado && 'mt-1 border-t border-dashed border-border pt-2',
        forte ? cn('font-semibold', tom ?? 'text-foreground') : 'text-muted-foreground'
      )}
    >
      <dt>{rotulo}</dt>
      <dd className={cn('text-right', !forte && 'text-foreground')}>{brl(valor)}</dd>
    </div>
  )
}

interface Props {
  mesa: Mesa | null
  empresaId: number | null
  temBuffet: boolean
  agora: number
  onFechar: () => void
}

export function DetalheMesa({ mesa, empresaId, temBuffet, agora, onFechar }: Props) {
  const conta = mesa?.conta
  const nomes = useNomes(
    mesa ? empresaId : null,
    conta ? conta.itens.map((i) => i.miNum) : [],
    conta?.garcom ? [conta.garcom] : []
  )

  return (
    <Modal open={mesa !== null} onOpenChange={(o) => !o && onFechar()}>
      <Modal.Content size="2xl">
        {mesa && conta && (
          <>
            <Modal.Header>
              <Modal.Title className="flex flex-wrap items-center gap-2">
                <span>
                  Mesa {mesa.mesa}
                  {mesa.grupo !== null && (
                    <span className="text-sm font-medium text-muted-foreground">/{mesa.grupo}</span>
                  )}
                </span>
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
                    PILL[situacao(mesa, temBuffet)]
                  )}
                >
                  {ROTULO_SITUACAO[situacao(mesa, temBuffet)]}
                </span>
              </Modal.Title>
              <Modal.Description>
                {[
                  conta.numero !== null ? `Conta ${conta.numero}` : null,
                  abertaHa(conta.abertura, agora)
                    ? `aberta há ${abertaHa(conta.abertura, agora)} (desde ${hora(conta.abertura)})`
                    : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </Modal.Description>
            </Modal.Header>
            <Modal.Body>
              <div className="grid gap-4 md:grid-cols-[17rem_minmax(0,1fr)]">
                <aside className="flex min-w-0 flex-col gap-4">
                  <div className="grid grid-cols-3 gap-1.5">
                    <Contador
                      valor={mesa.couvert}
                      rotulo="couvert"
                      icone={Music}
                      estilo={CONTADOR[situacaoDoContador(mesa.pessoas, mesa.couvert)]}
                    />
                    <Contador
                      valor={mesa.pessoas}
                      rotulo="pessoas"
                      icone={Users}
                      estilo={mesa.pessoas > 0 ? 'bg-muted text-foreground' : CONTADOR.divergente}
                    />
                    <Contador
                      valor={mesa.buffet}
                      rotulo="buffet"
                      icone={ConciergeBell}
                      estilo={CONTADOR[situacaoDoContador(mesa.pessoas, mesa.buffet)]}
                    />
                  </div>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <Fato icone={User} rotulo="Garçom" largo>
                      {conta.garcom === null ? (
                        '—'
                      ) : nomes.isLoading ? (
                        <span className="inline-flex items-center gap-1">
                          nº {conta.garcom} <Spinner className="h-3 w-3" />
                        </span>
                      ) : (
                        (nomes.data?.garcons[conta.garcom] ?? `nº ${conta.garcom}`) +
                        (nomes.data?.garcons[conta.garcom] ? ` (${conta.garcom})` : '')
                      )}
                    </Fato>
                    <Fato icone={Layers} rotulo="Rodadas">
                      {conta.rodadas ?? '—'}
                    </Fato>
                    <Fato icone={Clock} rotulo="Último lançamento">
                      {hora(conta.ultimoLancamento)}
                    </Fato>
                    <Fato icone={Printer} rotulo="Pré-conta">
                      {conta.impressa ? 'impressa' : 'não impressa'}
                    </Fato>
                  </dl>
                  <dl className="flex flex-col gap-1 border-t border-border pt-3 text-sm tabular-nums">
                    <Valor rotulo="Subtotal" valor={conta.subtotal} />
                    <Valor rotulo="Desconto" valor={conta.desconto} />
                    <Valor rotulo="Taxa de serviço" valor={conta.taxaServico} />
                    <Valor rotulo="Total" valor={conta.total} forte separado />
                    <Valor rotulo="Pago" valor={conta.pago} />
                    <Valor rotulo="Saldo a pagar" valor={conta.saldo} forte tom="text-warning" />
                  </dl>
                </aside>

                <section className="flex min-w-0 flex-col gap-3">
                  <Aviso mesa={mesa} temBuffet={temBuffet} />
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Itens ({conta.itens.length})
                  </h3>
                  <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="w-full whitespace-nowrap text-sm">
                      <thead>
                        <tr className="border-b border-border text-xs text-muted-foreground">
                          <th className="w-px px-3 py-2 text-right font-semibold">Qtd</th>
                          <th className="px-3 py-2 text-left font-semibold">Item</th>
                          <th className="w-px px-3 py-2 text-center font-semibold">Assento</th>
                          <th className="hidden w-px px-3 py-2 text-center font-semibold sm:table-cell">
                            Rodada
                          </th>
                          <th className="w-px px-3 py-2 text-center font-semibold">Hora</th>
                          <th className="w-px px-3 py-2 text-right font-semibold">Valor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {conta.itens.map((i, idx) => (
                          <tr
                            key={`${i.miNum}-${idx}`}
                            className={cn(
                              'border-b border-border last:border-0',
                              i.tipo === 'couvert' && 'bg-destructive/[0.06]',
                              i.tipo === 'buffet' && 'bg-primary/[0.06]'
                            )}
                          >
                            <td className="px-3 py-2 text-right tabular-nums">{i.qtd}×</td>
                            <td
                              className={cn(
                                'px-3 py-2',
                                i.tipo && 'font-semibold',
                                i.tipo === 'couvert' && 'text-destructive'
                              )}
                            >
                              <span className="inline-flex items-center gap-1.5">
                                {i.tipo === 'couvert' && <Music className="h-3.5 w-3.5" />}
                                {i.tipo === 'buffet' && <ConciergeBell className="h-3.5 w-3.5" />}
                                {nomes.data?.itens[i.miNum] ?? (
                                  <span className="text-muted-foreground">
                                    item {i.miNum}
                                    {nomes.isLoading ? '…' : ''}
                                  </span>
                                )}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-center text-muted-foreground tabular-nums">
                              {i.assento ?? '—'}
                            </td>
                            <td className="hidden px-3 py-2 text-center text-muted-foreground tabular-nums sm:table-cell">
                              {i.rodada !== null ? `${i.rodada}ª` : '—'}
                            </td>
                            <td className="px-3 py-2 text-center text-muted-foreground tabular-nums">
                              {hora(i.hora)}
                            </td>
                            <td className="px-3 py-2 text-right tabular-nums">{brl(i.valor)}</td>
                          </tr>
                        ))}
                        {conta.itens.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-3 py-4 text-center text-muted-foreground">
                              Nenhum item lançado ainda.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  {nomes.error && (
                    <p className="text-xs text-muted-foreground">
                      Não deu para buscar os nomes dos itens agora; aparecem os códigos.
                    </p>
                  )}
                </section>
              </div>
            </Modal.Body>
          </>
        )}
      </Modal.Content>
    </Modal>
  )
}

/** O que falta na mesa, em uma frase, com a cor da situação. */
function Aviso({ mesa, temBuffet }: { mesa: Mesa; temBuffet: boolean }) {
  const s = situacao(mesa, temBuffet)
  if (mesa.pessoas <= 0) {
    return (
      <p className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/[0.08] px-3 py-2 text-sm">
        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
        <span>
          <b>Mesa sem pessoas.</b> Lance o número de pessoas no PDV para conferir o couvert.
        </span>
      </p>
    )
  }
  if (s === 'tudo-lancado') {
    return (
      <p className="flex items-start gap-2 rounded-lg border border-success/40 bg-success/[0.08] px-3 py-2 text-sm">
        <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
        <span>
          <b>Tudo lançado.</b> {mesa.pessoas} {mesa.pessoas === 1 ? 'pessoa' : 'pessoas'},{' '}
          {mesa.couvert} couvert{mesa.couvert === 1 ? '' : 's'}
          {temBuffet ? ` e ${mesa.buffet} buffet${mesa.buffet === 1 ? '' : 's'}` : ''}.
        </span>
      </p>
    )
  }
  const frases = [
    falta(mesa.pessoas, mesa.couvert, 'couvert', 'couverts'),
    temBuffet ? falta(mesa.pessoas, mesa.buffet, 'buffet', 'buffets') : null,
  ].filter(Boolean)
  const tom = s === 'divergente' ? 'destructive' : 'warning'
  return (
    <p
      className={cn(
        'flex items-start gap-2 rounded-lg border px-3 py-2 text-sm',
        tom === 'destructive'
          ? 'border-destructive/40 bg-destructive/[0.08]'
          : 'border-warning/40 bg-warning/[0.08]'
      )}
    >
      <TriangleAlert
        className={cn(
          'mt-0.5 h-4 w-4 shrink-0',
          tom === 'destructive' ? 'text-destructive' : 'text-warning'
        )}
      />
      <span>
        <b>{frases.join(' ')}</b> {mesa.pessoas} {mesa.pessoas === 1 ? 'pessoa' : 'pessoas'} na
        conta.
      </span>
    </p>
  )
}
