import { useState } from 'react'
import { DatePicker, Input } from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'
import { formatBRL, formatData } from '../helpers'
import { paraNumero } from '../schemas'

// Campos digitáveis dentro das grades (Online, Adquirentes, Conferência). Enquanto
// o campo está em edição, o texto digitado fica num rascunho local; o valor só vai
// para a tela ao sair do campo (ou Enter). Assim a grade não recalcula o mês a
// cada tecla e o foco não se perde. Fora da edição, o campo mostra o valor atual.
//
// Altura: o `DataReport` tem `py-3` fixo na célula; o campo baixo (h-8) com `-my-1`
// deixa a linha editável quase da altura de uma linha de texto, para caber mais dias.

interface CampoValorProps {
  value: number | null
  onCommit: (v: number | null) => void
  disabled?: boolean
  'aria-label': string
  className?: string
}

const paraTexto = (v: number | null) =>
  v === null
    ? ''
    : v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** Valor em R$ ("1.234,56"). Vazio = não informado (`null`). */
export function CampoValor({ value, onCommit, disabled, className, ...aria }: CampoValorProps) {
  // `null` = fora de edição (mostra o valor atual).
  const [rascunho, setRascunho] = useState<string | null>(null)

  if (disabled) {
    return (
      <span className={cn('block whitespace-nowrap text-right tabular-nums', className)}>
        {value === null ? '—' : formatBRL(value)}
      </span>
    )
  }

  const confirmar = () => {
    if (rascunho === null) return
    const n = paraNumero(rascunho)
    const novo =
      rascunho.trim() === '' ? null : Number.isFinite(n) ? Math.round(n * 100) / 100 : value
    setRascunho(null)
    if (novo !== value) onCommit(novo)
  }

  return (
    <Input
      inputMode="decimal"
      aria-label={aria['aria-label']}
      className={cn('-my-1 h-8 text-right tabular-nums', className)}
      value={rascunho ?? paraTexto(value)}
      onFocus={() => setRascunho(paraTexto(value))}
      onChange={(e) => setRascunho(e.target.value)}
      onBlur={confirmar}
      onKeyDown={(e) => {
        if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
        if (e.key === 'Escape') setRascunho(paraTexto(value))
      }}
    />
  )
}

interface CampoTextoProps {
  value: string
  onCommit: (v: string) => void
  disabled?: boolean
  'aria-label': string
  placeholder?: string
  className?: string
}

export function CampoTexto({
  value,
  onCommit,
  disabled,
  className,
  placeholder,
  ...aria
}: CampoTextoProps) {
  const [rascunho, setRascunho] = useState<string | null>(null)

  if (disabled) {
    return <span className={cn('block truncate', className)}>{value || '—'}</span>
  }
  return (
    <Input
      aria-label={aria['aria-label']}
      placeholder={placeholder}
      className={cn('-my-1 h-8', className)}
      value={rascunho ?? value}
      onFocus={() => setRascunho(value)}
      onChange={(e) => setRascunho(e.target.value)}
      onBlur={() => {
        if (rascunho !== null && rascunho !== value) onCommit(rascunho)
        setRascunho(null)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
        if (e.key === 'Escape') setRascunho(value)
      }}
    />
  )
}

interface CampoDataProps {
  value: string
  onCommit: (v: string) => void
  disabled?: boolean
  'aria-label': string
}

export function CampoData({ value, onCommit, disabled, ...aria }: CampoDataProps) {
  if (disabled) {
    return <span className="tabular-nums">{value ? formatData(value) : '—'}</span>
  }
  return (
    <DatePicker
      aria-label={aria['aria-label']}
      size="sm"
      className="-my-1"
      value={value}
      onChange={(v) => {
        if (v !== value) onCommit(v)
      }}
    />
  )
}
