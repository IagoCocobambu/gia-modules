import { useState, type ReactNode } from 'react'
import { Button, DatePicker, Field, Input, Modal } from '@gia-cb/ui'
import { formatData } from '../helpers'
import { paraNumero } from '../schemas'

export interface ValoresDia {
  previsao: string
  comentario: string
  /** `undefined` = o campo não existe nesta aba (Adquirentes). */
  cbDescontosLoja?: number | null
}

interface Props {
  /** `AAAA-MM-DD` do dia aberto; `null` = fechado. */
  dia: string | null
  aba: string
  valores: ValoresDia
  detalhes: Array<[string, ReactNode]>
  podeEditar: boolean
  onOpenChange: (open: boolean) => void
  onConfirmar: (v: ValoresDia) => void
}

/**
 * O dia inteiro de uma grade diária, num diálogo — é como o celular vê e edita a
 * linha (a grade de 29 colunas não cabe na tela). No desktop a edição é na própria
 * grade; este diálogo também abre por lá, pelo botão da linha.
 */
export function EditarDiaDialog(props: Props) {
  return (
    <Modal open={props.dia !== null} onOpenChange={props.onOpenChange}>
      <Modal.Content
        size="lg"
        // Sem foco automático: no celular o calendário da previsão abria sozinho.
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {props.dia && <Conteudo key={props.dia} {...props} dia={props.dia} />}
      </Modal.Content>
    </Modal>
  )
}

function Conteudo({
  dia,
  aba,
  valores,
  detalhes,
  podeEditar,
  onOpenChange,
  onConfirmar,
}: Props & { dia: string }) {
  const [previsao, setPrevisao] = useState(valores.previsao)
  const [comentario, setComentario] = useState(valores.comentario)
  const temLoja = valores.cbDescontosLoja !== undefined
  const [loja, setLoja] = useState(
    valores.cbDescontosLoja === null || valores.cbDescontosLoja === undefined
      ? ''
      : valores.cbDescontosLoja.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
  )
  const lojaNumero = loja.trim() === '' ? null : paraNumero(loja)
  const lojaInvalida = lojaNumero !== null && !Number.isFinite(lojaNumero)

  return (
    <>
      <Modal.Header>
        <Modal.Title>
          {aba} — {formatData(dia)}
        </Modal.Title>
        <Modal.Description>
          {podeEditar
            ? 'Os campos digitáveis entram no fechamento quando você clicar em Salvar.'
            : 'Consulta do dia (sem permissão de edição).'}
        </Modal.Description>
      </Modal.Header>
      <Modal.Body className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Previsão de pagamento">
            {(c) =>
              podeEditar ? (
                <DatePicker {...c} value={previsao} onChange={setPrevisao} />
              ) : (
                <span className="text-sm">{previsao ? formatData(previsao) : '—'}</span>
              )
            }
          </Field>
          {temLoja && (
            <Field
              label="CB Descontos LOJA (R$)"
              error={lojaInvalida ? 'Valor inválido.' : undefined}
            >
              {(c) =>
                podeEditar ? (
                  <Input
                    {...c}
                    inputMode="decimal"
                    className="text-right tabular-nums"
                    value={loja}
                    onChange={(e) => setLoja(e.target.value)}
                  />
                ) : (
                  <span className="text-sm tabular-nums">{loja || '—'}</span>
                )
              }
            </Field>
          )}
        </div>
        <Field label="Comentário">
          {(c) =>
            podeEditar ? (
              <Input {...c} value={comentario} onChange={(e) => setComentario(e.target.value)} />
            ) : (
              <span className="text-sm">{comentario || '—'}</span>
            )
          }
        </Field>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-1.5 rounded-md border border-border p-3 text-sm sm:grid-cols-2">
          {detalhes.map(([rotulo, valor]) => (
            <div key={rotulo} className="flex items-baseline justify-between gap-3">
              <dt className="text-muted-foreground">{rotulo}</dt>
              <dd className="text-right tabular-nums">{valor}</dd>
            </div>
          ))}
        </dl>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="ghost" className="h-11" onClick={() => onOpenChange(false)}>
          {podeEditar ? 'Cancelar' : 'Fechar'}
        </Button>
        {podeEditar && (
          <Button
            className="h-11"
            disabled={lojaInvalida}
            onClick={() => {
              onConfirmar({
                previsao,
                comentario,
                ...(temLoja
                  ? {
                      cbDescontosLoja:
                        lojaNumero === null ? null : Math.round(lojaNumero * 100) / 100,
                    }
                  : {}),
              })
              onOpenChange(false)
            }}
          >
            Aplicar
          </Button>
        )}
      </Modal.Footer>
    </>
  )
}
