import type { ReactNode } from 'react'
import { FileText, Receipt } from 'lucide-react'
import { Modal } from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'
import { BARRA_SO_AO_ROLAR } from '../hooks/useBarraAoRolar'
import { formatBRL, formatDataHora } from '../helpers'
import type { Invoice, ValidationResult } from '../types'
import { StatusValidacaoBadge } from './StatusValidacaoBadge'

// "Detalhes do Registro" — rótulos e blocos iguais aos do modal do legado.
//
// Layout (desktop): cada bloco é um CARD — "Dados da Conta (Simphony)" numa coluna,
// "XML Conciliado" na outra; as notas duplicadas seguem a mesma grade de 2 colunas
// e, se um card ficar sozinho na linha, ocupa a linha inteira. Dentro do card, um
// campo por linha (rótulo à esquerda, valor à direita). No celular os cards empilham.
// Container query: o modal é renderizado fora da área do módulo (portal).

interface DetalheModalProps {
  item: ValidationResult | null
  onOpenChange: (open: boolean) => void
}

interface LinhaCampo {
  label: string
  valor: ReactNode
  /** Valor principal do card (Total Pagamento / Valor Nota), em destaque. */
  destaque?: boolean
  /** Valor longo (chave de acesso): vai abaixo do rótulo, em fonte monoespaçada. */
  longo?: boolean
}

function CardDetalhe({
  titulo,
  icone: Icone,
  campos,
  vazio,
}: {
  titulo: string
  icone: typeof FileText
  campos?: LinhaCampo[] | null
  /** Texto quando não há dado (conta sem nota / nota sem conta). */
  vazio?: string
}) {
  return (
    <section className="flex h-full min-w-0 flex-col rounded-lg border border-border bg-surface">
      <h3 className="flex items-center gap-2 border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Icone className="h-4 w-4 shrink-0" aria-hidden />
        {titulo}
      </h3>
      {campos ? (
        <dl className="divide-y divide-border/60 px-4">
          {campos.map((c) =>
            c.longo ? (
              <div key={c.label} className="space-y-1 py-2.5">
                <dt className="text-xs text-muted-foreground">{c.label}</dt>
                <dd className="break-all font-mono text-xs leading-relaxed text-foreground">
                  {c.valor ?? '—'}
                </dd>
              </div>
            ) : (
              <div
                key={c.label}
                className={cn(
                  'flex items-baseline justify-between gap-4 py-2.5',
                  c.destaque && '-mx-4 bg-muted/40 px-4'
                )}
              >
                <dt className="shrink-0 text-xs text-muted-foreground">{c.label}</dt>
                <dd
                  className={cn(
                    'min-w-0 break-words text-right text-sm tabular-nums text-foreground',
                    c.destaque ? 'font-semibold' : 'font-medium'
                  )}
                >
                  {c.valor ?? '—'}
                </dd>
              </div>
            )
          )}
        </dl>
      ) : (
        <p className="flex flex-1 items-center justify-center px-4 py-8 text-center text-sm text-muted-foreground">
          {vazio}
        </p>
      )}
    </section>
  )
}

function camposDaNota(nota: Invoice): LinhaCampo[] {
  return [
    { label: 'Loja', valor: nota.Loja },
    { label: 'Check Number Ref.', valor: nota.Check_Number },
    { label: 'Status Sefaz', valor: nota.Status },
    { label: 'Data Emissão', valor: formatDataHora(nota.Hora_Criacao_Nota) },
    { label: 'Série', valor: nota.Serie },
    { label: 'Número NF (nNf)', valor: nota.nNf },
    { label: 'Valor Nota', valor: formatBRL(nota.Valor_Nota), destaque: true },
    { label: 'Chave de Acesso', valor: nota.Chave_Acesso, longo: true },
  ]
}

export function DetalheModal({ item, onOpenChange }: DetalheModalProps) {
  // Os cards, na ordem da grade: conta | XML, depois as duplicadas.
  const cards: { key: string; card: ReactNode }[] = item
    ? [
        {
          key: 'conta',
          card: (
            <CardDetalhe
              titulo="Dados da Conta (Simphony)"
              icone={Receipt}
              vazio="Nenhuma conta do Simphony casou com esta nota na janela de tempo."
              campos={
                item.check && [
                  { label: 'Loja', valor: item.check.Loja },
                  { label: 'Check ID', valor: item.check.Check_id },
                  { label: 'Check Number', valor: item.check.Check_Number },
                  { label: 'Bus Date', valor: formatDataHora(item.check.Bus_Date) },
                  { label: 'Fechamento', valor: formatDataHora(item.check.Hora_Fechamento_Conta) },
                  { label: 'Revenue Center', valor: item.check.Revenue_Center },
                  { label: 'Order Type ID', valor: item.check.Order_Type_Number },
                  { label: 'Order Type Name', valor: item.check.Order_Type_Name },
                  { label: 'Service Charge', valor: formatBRL(item.check.Service_Charge) },
                  { label: 'Total Void', valor: formatBRL(item.check.Total_Void) },
                  {
                    label: 'Total Pagamento',
                    valor: formatBRL(item.check.Total_Pagamento),
                    destaque: true,
                  },
                ]
              }
            />
          ),
        },
        {
          key: 'xml',
          card: (
            <CardDetalhe
              titulo="XML Conciliado"
              icone={FileText}
              vazio="Nenhuma nota fiscal encontrada para esta conta na janela de tempo."
              campos={item.mainInvoice && camposDaNota(item.mainInvoice)}
            />
          ),
        },
        ...item.duplicateInvoices.map((dup, i) => ({
          key: dup.Chave_Acesso,
          card: (
            <CardDetalhe
              titulo={`Outros XMLs vinculados a este Check (${i + 1})`}
              icone={FileText}
              campos={camposDaNota(dup)}
            />
          ),
        })),
      ]
    : []
  const sobraUm = cards.length % 2 === 1

  return (
    <Modal open={item !== null} onOpenChange={onOpenChange}>
      <Modal.Content size="2xl" className={BARRA_SO_AO_ROLAR}>
        {item && (
          <>
            <Modal.Header>
              <Modal.Title>Detalhes do Registro</Modal.Title>
              <Modal.Description className="flex flex-wrap items-center gap-2">
                <StatusValidacaoBadge status={item.status} />
                <span>Check Number: {item.checkNumber}</span>
                <span>· Diferença: {formatBRL(item.saldo)}</span>
              </Modal.Description>
            </Modal.Header>
            <Modal.Body className="@container">
              {/* Grade de cards: 2 colunas no desktop; um card sozinho na última
                  linha ocupa a linha inteira; no celular, 1 coluna. */}
              <div className="grid grid-cols-1 gap-4 @xl:grid-cols-2">
                {cards.map(({ key, card }, i) => (
                  <div
                    key={key}
                    className={cn('min-w-0', i === cards.length - 1 && sobraUm && '@xl:col-span-2')}
                  >
                    {card}
                  </div>
                ))}
              </div>
            </Modal.Body>
          </>
        )}
      </Modal.Content>
    </Modal>
  )
}
