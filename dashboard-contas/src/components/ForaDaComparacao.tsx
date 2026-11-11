import { useState } from 'react'
import { Badge, Button, Modal, Tooltip } from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'
import { plural } from '../formato'

// As lojas que uma comparação entre dois meses deixou de fora, e por quê.
//
// ── COMPARAR DOIS MESES SÓ COM AS MESMAS LOJAS ──────────────────────────────
//
// A regra do Dashboard de RH, decidida pelo João em 15/09/2026 e repetida aqui:
// a comparação de um período com o anterior conta só as lojas com plano nos
// dois. Um mês entregue em parte distorceria a variação — a rede "perderia" o
// faturamento de quem ainda não entregou. E quem sai da conta precisa ser dito:
// este selo nomeia as lojas, agrupadas pelo motivo. Componente copiado do
// `dashboard-rh`; mudança de comportamento aqui vale revisar lá.
//
// A dica resume por motivo, com alguns nomes; o clique abre a lista inteira. O
// clique abre SEMPRE, como no selo de pendências: no celular não há ponteiro.

export interface ItemDeFora {
  ref: string
  nome: string
  /** "Sem plano em jul/26" — as lojas se agrupam por ele. */
  motivo: string
}

/** Quantos nomes a dica mostra por motivo. */
const NOMES_NA_DICA = 6

const ORDEM = new Intl.Collator('pt-BR', { numeric: true })

interface Props {
  itens: ItemDeFora[]
  /** A regra, em uma ou duas frases — vai na dica e no modal. */
  explicacao: string
  /** Singular e plural: `['loja', 'lojas']`, ou `['operação', 'operações']` na Comparar. */
  substantivo?: [string, string]
}

export function ForaDaComparacao({ itens, explicacao, substantivo = ['loja', 'lojas'] }: Props) {
  const [aberto, setAberto] = useState(false)
  if (itens.length === 0) return null

  const [um, varios] = substantivo
  const titulo = plural(itens.length, `${um} de fora`, `${varios} de fora`)
  const grupos = new Map<string, ItemDeFora[]>()
  for (const item of [...itens].sort((a, b) => ORDEM.compare(a.nome, b.nome))) {
    const lista = grupos.get(item.motivo)
    if (lista) lista.push(item)
    else grupos.set(item.motivo, [item])
  }

  const dica = (
    <div className="flex max-w-[20rem] flex-col gap-1.5 text-left text-xs">
      <p>{explicacao}</p>
      {[...grupos].map(([motivo, lista]) => (
        <div key={motivo}>
          <p className="font-semibold">
            {motivo}: {plural(lista.length, um, varios)}
          </p>
          <p className="opacity-80">
            {lista
              .slice(0, NOMES_NA_DICA)
              .map((l) => l.nome)
              .join(', ')}
            {lista.length > NOMES_NA_DICA && ` e mais ${lista.length - NOMES_NA_DICA}`}
          </p>
        </div>
      ))}
      <p className="opacity-80">Clique no selo para ver a lista inteira.</p>
    </div>
  )

  return (
    <>
      <Tooltip content={dica} className="max-w-sm">
        <button
          type="button"
          onClick={() => setAberto(true)}
          aria-label={`${titulo} — ver quais e por quê`}
          className="rounded-full transition-opacity duration-fast ease-default hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Badge variant="warning" className="whitespace-nowrap">
            {titulo}
          </Badge>
        </button>
      </Tooltip>

      <Modal open={aberto} onOpenChange={setAberto}>
        <Modal.Content size="md">
          <Modal.Header>
            <Modal.Title>Fora da comparação</Modal.Title>
            <Modal.Description>{explicacao}</Modal.Description>
          </Modal.Header>

          <Modal.Body className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto">
            {[...grupos].map(([motivo, lista]) => (
              <section key={motivo} className="flex flex-col gap-1.5">
                <h4 className="text-sm font-semibold text-foreground">
                  {motivo}{' '}
                  <span className="font-normal text-muted-foreground">
                    · {plural(lista.length, um, varios)}
                  </span>
                </h4>
                <ul className="flex flex-col rounded-md border border-border">
                  {lista.map((l, i) => (
                    <li
                      key={l.ref}
                      className={cn(
                        'flex items-baseline gap-2 px-3 py-1.5 text-sm',
                        i > 0 && 'border-t border-border'
                      )}
                    >
                      <span className="min-w-0 truncate text-foreground">{l.nome}</span>
                      <span className="shrink-0 font-mono text-xs text-muted-foreground">
                        {l.ref}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => setAberto(false)}>
              Fechar
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </>
  )
}
