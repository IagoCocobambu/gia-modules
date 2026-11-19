import type { ReactNode } from 'react'
import { Button, DatePicker, Field, FormField, Input, Modal, useGiaForm } from '@gia-cb/ui'
import { formatData } from '../helpers'
import { diaSchema, paraNumero, type DiaForm } from '../schemas'

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
  const temLoja = valores.cbDescontosLoja !== undefined
  const lojaInicial =
    valores.cbDescontosLoja === null || valores.cbDescontosLoja === undefined
      ? ''
      : valores.cbDescontosLoja.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
  // Formulário padrão do portal (conventions §9): valores como texto, número no envio.
  const form = useGiaForm<DiaForm>({
    schema: diaSchema,
    defaultValues: {
      previsao: valores.previsao,
      comentario: valores.comentario,
      cbDescontosLoja: lojaInicial,
    },
  })
  const aplicar = form.handleSubmit((v) => {
    const loja = v.cbDescontosLoja.trim()
    onConfirmar({
      previsao: v.previsao,
      comentario: v.comentario,
      ...(temLoja
        ? { cbDescontosLoja: loja === '' ? null : Math.round(paraNumero(loja) * 100) / 100 }
        : {}),
    })
    onOpenChange(false)
  })

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
          {podeEditar ? (
            <FormField
              control={form.control}
              name="previsao"
              render={({ field, fieldState }) => (
                <Field label="Previsão de pagamento" error={fieldState.error?.message}>
                  {(c) => (
                    <DatePicker
                      {...c}
                      value={String(field.value ?? '')}
                      onChange={(v) => field.onChange(v)}
                    />
                  )}
                </Field>
              )}
            />
          ) : (
            <Field label="Previsão de pagamento">
              {() => (
                <span className="text-sm">
                  {valores.previsao ? formatData(valores.previsao) : '—'}
                </span>
              )}
            </Field>
          )}
          {temLoja &&
            (podeEditar ? (
              <FormField
                control={form.control}
                name="cbDescontosLoja"
                render={({ field, fieldState }) => (
                  <Field label="CB Descontos LOJA (R$)" error={fieldState.error?.message}>
                    {(c) => (
                      <Input
                        {...c}
                        {...field}
                        value={String(field.value ?? '')}
                        inputMode="decimal"
                        className="text-right tabular-nums"
                      />
                    )}
                  </Field>
                )}
              />
            ) : (
              <Field label="CB Descontos LOJA (R$)">
                {() => <span className="text-sm tabular-nums">{lojaInicial || '—'}</span>}
              </Field>
            ))}
        </div>
        {podeEditar ? (
          <FormField
            control={form.control}
            name="comentario"
            render={({ field, fieldState }) => (
              <Field label="Comentário" error={fieldState.error?.message}>
                {(c) => <Input {...c} {...field} value={String(field.value ?? '')} />}
              </Field>
            )}
          />
        ) : (
          <Field label="Comentário">
            {() => <span className="text-sm">{valores.comentario || '—'}</span>}
          </Field>
        )}
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
          <Button className="h-11" onClick={() => void aplicar()}>
            Aplicar
          </Button>
        )}
      </Modal.Footer>
    </>
  )
}
