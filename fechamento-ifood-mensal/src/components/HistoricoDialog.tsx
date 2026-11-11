import { History } from 'lucide-react'
import { AuditDiff, Button, Modal, Skeleton } from '@gia-cb/ui'
import { useHistorico } from '../api/fechamento-ifood-mensal'
import { formatBRL, formatData, formatDataHora } from '../helpers'
import type { AlteracaoHistorico, GravacaoHistorico, ValorHistorico } from '../types'

interface Props {
  aberto: boolean
  onOpenChange: (aberto: boolean) => void
  operacaoRef: string
  mes: string
  lojaNome: string
  rotuloMes: string
}

/** Ordem das seções dentro de uma gravação (a mesma das abas). */
const ORDEM_SECOES = [
  'Fechamento',
  'Online',
  'Adquirentes',
  'Conferência',
  'Extrato',
  'Cancelados pós',
]

function formatarValor(v: ValorHistorico, tipo: 'texto' | 'data' | 'moeda'): string | null {
  if (v === null || v === '') return null
  if (tipo === 'moeda') return formatBRL(Number(v))
  if (tipo === 'data') return formatData(String(v))
  return String(v)
}

/** As mudanças de uma gravação agrupadas por seção, no formato do `AuditDiff`. */
function porSecao(alteracoes: AlteracaoHistorico[]) {
  const grupos = new Map<
    string,
    {
      campos: Array<{ campo: string; de: string | null; para: string | null }>
      adicionados: Array<{ nome: string }>
      removidos: Array<{ nome: string }>
    }
  >()
  for (const a of alteracoes) {
    const g = grupos.get(a.secao) ?? { campos: [], adicionados: [], removidos: [] }
    if ('acao' in a) {
      ;(a.acao === 'incluida' ? g.adicionados : g.removidos).push({ nome: a.item })
    } else {
      g.campos.push({
        campo: `${a.item} · ${a.campo}`,
        de: formatarValor(a.de, a.tipo),
        para: formatarValor(a.para, a.tipo),
      })
    }
    grupos.set(a.secao, g)
  }
  const ordem = (s: string) => {
    const i = ORDEM_SECOES.indexOf(s)
    return i === -1 ? ORDEM_SECOES.length : i
  }
  return [...grupos.entries()].sort(([a], [b]) => ordem(a) - ordem(b))
}

function Gravacao({ g }: { g: GravacaoHistorico }) {
  const n = g.alteracoes.length
  return (
    <li className="rounded-lg border border-border bg-surface p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
        <p className="text-sm font-medium text-foreground">
          {formatDataHora(g.gravadoEm)}
          <span className="font-normal text-muted-foreground">
            {' '}
            · {g.autorNome ?? 'Usuário sem nome no cadastro'}
            {g.operacaoRef ? ` · ${g.operacaoRef}` : ''}
          </span>
        </p>
        <p className="text-xs text-muted-foreground">
          {n === 1 ? '1 alteração' : `${n.toLocaleString('pt-BR')} alterações`}
        </p>
      </div>
      <div className="mt-2 space-y-3">
        {porSecao(g.alteracoes).map(([secao, d]) => (
          <section key={secao} aria-label={secao}>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {secao}
            </h3>
            <AuditDiff
              campos={d.campos}
              adicionados={d.adicionados}
              removidos={d.removidos}
              colecaoLabel={
                d.adicionados.length + d.removidos.length > 0
                  ? 'Linhas incluídas (+) e removidas (−)'
                  : undefined
              }
            />
          </section>
        ))}
      </div>
    </li>
  )
}

/** Quem salvou o fechamento do mês, quando e o que mudou (antes → depois). */
export function HistoricoDialog({
  aberto,
  onOpenChange,
  operacaoRef,
  mes,
  lojaNome,
  rotuloMes,
}: Props) {
  const q = useHistorico(operacaoRef, mes, aberto)
  const gravacoes = q.data?.gravacoes ?? []

  let corpo
  if (q.isLoading) {
    corpo = (
      <div className="space-y-3" role="status" aria-label="Carregando o histórico">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-2 rounded-lg border border-border p-3">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/4" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        ))}
      </div>
    )
  } else if (q.isError) {
    corpo = (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <p className="text-sm text-destructive">
          {q.error instanceof Error ? q.error.message : 'Não foi possível carregar o histórico.'}
        </p>
        <Button variant="outline" onClick={() => void q.refetch()}>
          Tentar de novo
        </Button>
      </div>
    )
  } else if (gravacoes.length === 0) {
    corpo = (
      <p className="py-8 text-center text-sm text-muted-foreground">
        {q.data?.criadoEm
          ? `Nenhuma alteração registrada no histórico. O fechamento foi criado em ${formatDataHora(q.data.criadoEm)}; gravações feitas antes do histórico existir não têm detalhe.`
          : 'Este mês ainda não foi gravado para a loja.'}
      </p>
    )
  } else {
    corpo = (
      <>
        <ol className="space-y-3">
          {gravacoes.map((g) => (
            <Gravacao key={g.id} g={g} />
          ))}
        </ol>
        {q.data?.maisAntigas && (
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Mostrando as {gravacoes.length} gravações mais recentes.
          </p>
        )}
      </>
    )
  }

  return (
    <Modal open={aberto} onOpenChange={onOpenChange}>
      <Modal.Content size="lg">
        <Modal.Header>
          <Modal.Title className="flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" aria-hidden />
            Histórico do fechamento
          </Modal.Title>
          <Modal.Description>
            {lojaNome} · {rotuloMes}. Cada Salvar que mudou alguma coisa: quem, quando e o antes →
            depois.
          </Modal.Description>
        </Modal.Header>
        <Modal.Body className="md:max-h-[70vh] md:overflow-y-auto">
          <div className="animate-in fade-in duration-default">{corpo}</div>
        </Modal.Body>
      </Modal.Content>
    </Modal>
  )
}
