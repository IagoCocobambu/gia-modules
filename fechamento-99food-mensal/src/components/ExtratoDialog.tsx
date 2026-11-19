import { DatePicker, Field, FormField, FormModal, Input, useGiaForm } from '@gia-cb/ui'
import { competenciaDaData } from '../helpers'
import { extratoSchema, paraNumero, type ExtratoForm } from '../schemas'
import type { LinhaExtrato } from '../types'

interface Props {
  /** Linha a editar, ou a linha vazia para incluir. */
  inicial: LinhaExtrato
  novo: boolean
  onClose: () => void
  onConfirmar: (linha: LinhaExtrato) => void
}

const TEXTOS: Array<{ nome: keyof ExtratoForm; rotulo: string }> = [
  { nome: 'loja', rotulo: 'Loja' },
  { nome: 'banco', rotulo: 'Banco' },
  { nome: 'tipo', rotulo: 'Tipo' },
  { nome: 'mesAno', rotulo: 'Mês / Ano' },
  { nome: 'classificacao', rotulo: 'Classificação' },
  { nome: 'subClassificacao', rotulo: 'Sub classificação' },
  { nome: 'documento', rotulo: 'Documento' },
]

export function ExtratoDialog({ inicial, novo, onClose, onConfirmar }: Props) {
  const form = useGiaForm<ExtratoForm>({
    schema: extratoSchema,
    defaultValues: {
      dataMovimento: inicial.dataMovimento,
      malote: inicial.malote ? String(inicial.malote).replace('.', ',') : '',
      loja: inicial.loja,
      banco: inicial.banco,
      tipo: inicial.tipo,
      mesAno: inicial.mesAno,
      classificacao: inicial.classificacao,
      subClassificacao: inicial.subClassificacao,
      historico: inicial.historico,
      documento: inicial.documento,
    },
  })

  const enviar = form.handleSubmit((v) => {
    onConfirmar({
      ...v,
      malote: Math.round(paraNumero(v.malote) * 100) / 100,
      // A competência acompanha a data do movimento (como no legado).
      competencia: competenciaDaData(v.dataMovimento) || inicial.competencia,
    })
    onClose()
  })

  return (
    <FormModal
      title={novo ? 'Nova linha do extrato' : 'Editar linha do extrato'}
      saveLabel={novo ? 'Incluir' : 'Aplicar'}
      onClose={onClose}
      onSubmit={(e) => {
        e.stopPropagation()
        void enviar(e)
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="dataMovimento"
          render={({ field, fieldState }) => (
            <Field label="Data do movimento" required error={fieldState.error?.message}>
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
        <FormField
          control={form.control}
          name="malote"
          render={({ field, fieldState }) => (
            <Field label="Malote (R$)" required error={fieldState.error?.message}>
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
        {TEXTOS.map(({ nome, rotulo }) => (
          <FormField
            key={nome}
            control={form.control}
            name={nome}
            render={({ field, fieldState }) => (
              <Field label={rotulo} error={fieldState.error?.message}>
                {(c) => <Input {...c} {...field} value={String(field.value ?? '')} />}
              </Field>
            )}
          />
        ))}
        <div className="sm:col-span-2">
          <FormField
            control={form.control}
            name="historico"
            render={({ field, fieldState }) => (
              <Field label="Histórico" error={fieldState.error?.message}>
                {(c) => <Input {...c} {...field} value={String(field.value ?? '')} />}
              </Field>
            )}
          />
        </div>
      </div>
    </FormModal>
  )
}
