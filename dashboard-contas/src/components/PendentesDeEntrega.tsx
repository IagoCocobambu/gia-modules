import { useState } from 'react'
import { Badge, Button, Input, Modal, Tooltip } from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'
import type { StatusNoMes } from '../types'
import { fmtInteiro, plural } from '../formato'

/** Uma operação na conta sem plano entregue em algum mês. */
export interface Pendente {
  ref: string
  nome: string
  status: StatusNoMes
}

// O selo âmbar da barra do topo — e QUAIS operações ele conta.
//
// ── O NÚMERO SOZINHO NÃO SERVE PARA NADA ────────────────────────────────────
//
// "3 sem entregar" gera a pergunta seguinte na hora: quais? Sem a resposta o
// usuário sai caçando loja por loja. A resposta mora aqui:
//
//   • até `LISTA_NA_DICA` operações, a própria dica lista os nomes — cabe no
//     balão e dispensa clique;
//   • acima disso, a dica diz para clicar, e o clique abre a lista num modal,
//     com busca. Oitenta nomes num balão de dica são ilegíveis.
//
// O clique abre o modal SEMPRE, e não só acima de cinco: no celular não há
// ponteiro para abrir a dica, e o toque é a única forma de chegar à lista.
//
// ── PENDENTE × SEM PLANO ────────────────────────────────────────────────────
//
// São duas situações diferentes, e o que se cobra da loja muda: "Pendente" tem
// plano criado no mês e ainda não entregou; "Sem plano" nem criou. As duas
// entram na conta com o que tiverem gravado — a segunda, com nada.

/** Até quantas operações a dica lista pelo nome. */
const LISTA_NA_DICA = 5

/** Acima de quantas o modal ganha busca. */
const BUSCA_A_PARTIR_DE = 10

const ORDEM = new Intl.Collator('pt-BR', { numeric: true })

interface Props {
  /** As operações na conta com status Pendente ou Sem plano. */
  pendentes: Pendente[]
  /** `junho de 2026` — entra no título do modal. */
  rotuloDoMes: string
  /**
   * Período de vários meses: os meses em que cada operação está pendente ou sem
   * plano. Basta um mês para ela entrar no selo, e a lista diz quais.
   */
  mesesPorRef?: Map<string, string[]>
}

function SeloDeStatus({ status }: { status: StatusNoMes }) {
  return (
    <Badge variant={status === 'Pendente' ? 'warning' : 'secondary'} className="shrink-0">
      {status}
    </Badge>
  )
}

export function PendentesDeEntrega({ pendentes, rotuloDoMes, mesesPorRef }: Props) {
  const [aberto, setAberto] = useState(false)
  const [busca, setBusca] = useState('')

  if (pendentes.length === 0) return null

  const ordenadas = [...pendentes].sort((a, b) => ORDEM.compare(a.nome, b.nome))
  const titulo = plural(
    pendentes.length,
    'operação na conta sem entregar',
    'operações na conta sem entregar'
  )
  const cabeNaDica = pendentes.length <= LISTA_NA_DICA

  const termo = busca.trim().toLocaleLowerCase('pt-BR')
  const visiveis = termo
    ? ordenadas.filter(
        (l) =>
          l.nome.toLocaleLowerCase('pt-BR').includes(termo) ||
          l.ref.toLocaleLowerCase('pt-BR').includes(termo)
      )
    : ordenadas
  const semPlano = pendentes.filter((l) => l.status === 'Sem plano').length
  const comPlano = pendentes.length - semPlano

  const dica = (
    <div className="flex max-w-[18rem] flex-col gap-1.5 text-left text-xs">
      <p className="font-semibold">{titulo}</p>
      {cabeNaDica ? (
        <ul className="flex flex-col gap-0.5">
          {ordenadas.map((l) => (
            <li key={l.ref} className="flex items-baseline justify-between gap-3">
              <span className="min-w-0 truncate">
                {l.nome} <span className="font-mono opacity-70">{l.ref}</span>
              </span>
              <span className="shrink-0 opacity-80">
                {mesesPorRef?.get(l.ref)?.join(', ') ?? l.status}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p>Clique no selo para ver quais são.</p>
      )}
      <p className="opacity-80">
        Entram na conta com o que tiverem gravado — os números podem mudar quando entregarem.
      </p>
    </div>
  )

  return (
    <>
      <Tooltip content={dica} className="max-w-xs">
        <button
          type="button"
          onClick={() => {
            setBusca('')
            setAberto(true)
          }}
          aria-label={`${titulo} — ver a lista`}
          className="rounded-full transition-opacity duration-fast ease-default hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Badge variant="warning" className="tabular-nums">
            {fmtInteiro(pendentes.length)}
          </Badge>
        </button>
      </Tooltip>

      <Modal open={aberto} onOpenChange={setAberto}>
        <Modal.Content size="md">
          <Modal.Header>
            <Modal.Title>Sem entregar em {rotuloDoMes}</Modal.Title>
            <Modal.Description>
              {titulo}
              {comPlano > 0 && semPlano > 0
                ? `: ${plural(comPlano, 'pendente', 'pendentes')} e ${plural(semPlano, 'sem plano', 'sem plano')}.`
                : '.'}{' '}
              <strong>Pendente</strong> tem o plano do mês criado e ainda não entregou;{' '}
              <strong>Sem plano</strong> não criou o plano do mês. Todas entram na conta com o que
              tiverem gravado.
              {mesesPorRef &&
                ' Num período, basta um mês pendente ou sem plano para a operação estar aqui; os meses aparecem ao lado do nome.'}
            </Modal.Description>
          </Modal.Header>

          <Modal.Body className="flex flex-col gap-3">
            {pendentes.length >= BUSCA_A_PARTIR_DE && (
              <Input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar operação…"
                aria-label="Buscar operação"
              />
            )}
            <ul className="flex max-h-[55vh] flex-col overflow-y-auto rounded-md border border-border">
              {visiveis.length === 0 && (
                <li className="px-3 py-4 text-sm text-muted-foreground">
                  Nenhuma operação encontrada.
                </li>
              )}
              {visiveis.map((l, i) => (
                <li
                  key={l.ref}
                  className={cn(
                    'flex items-center justify-between gap-3 px-3 py-2 text-sm',
                    i > 0 && 'border-t border-border'
                  )}
                >
                  <span className="flex min-w-0 items-baseline gap-2">
                    <span className="min-w-0 truncate text-foreground">{l.nome}</span>
                    <span className="shrink-0 font-mono text-xs text-muted-foreground">
                      {l.ref}
                    </span>
                    {mesesPorRef?.get(l.ref) && (
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {mesesPorRef.get(l.ref)!.join(', ')}
                      </span>
                    )}
                  </span>
                  <SeloDeStatus status={l.status} />
                </li>
              ))}
            </ul>
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
