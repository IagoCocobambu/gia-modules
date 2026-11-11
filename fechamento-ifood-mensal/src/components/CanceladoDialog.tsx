import { DatePicker, Field, FormField, FormModal, Input, useGiaForm } from '@gia-cb/ui'
import { canceladoSchema, paraNumero, type CanceladoForm } from '../schemas'
import type { LinhaCancelado } from '../types'

interface Props {
  inicial: LinhaCancelado
  novo: boolean
  onClose: () => void
  onConfirmar: (linha: LinhaCancelado) => void
}

const TEXTOS: Array<{ nome: keyof CanceladoForm; rotulo: string; largo?: boolean }> = [
  { nome: 'estabelecimento', rotulo: 'Estabelecimento' },
  { nome: 'cnpj', rotulo: 'CNPJ' },
  { nome: 'nomeCliente', rotulo: 'Nome do cliente' },
  { nome: 'numeroPedido', rotulo: 'Nº do pedido' },
  { nome: 'idIfood', rotulo: 'ID iFood' },
  { nome: 'centroVenda', rotulo: 'Centro de venda' },
  { nome: 'origemCancelamento', rotulo: 'Origem do cancelamento' },
  { nome: 'andamento', rotulo: 'Andamento' },
  { nome: 'protocolo', rotulo: 'Protocolo' },
  { nome: 'valeNoCofre', rotulo: 'Vale no cofre?' },
  { nome: 'justificativa', rotulo: 'Justificativa', largo: true },
]
const DATAS: Array<{ nome: 'dataAnulacao' | 'dataReembolso'; rotulo: string }> = [
  { nome: 'dataAnulacao', rotulo: 'Data de anulação / conta de despesa' },
  { nome: 'dataReembolso', rotulo: 'Data de reembolso' },
]

const paraTexto = (v: number | null) => (v === null || v === 0 ? '' : String(v).replace('.', ','))

export function CanceladoDialog({ inicial, novo, onClose, onConfirmar }: Props) {
  const form = useGiaForm<CanceladoForm>({
    schema: canceladoSchema,
    defaultValues: {
      ...inicial,
      valorPedidoTaxa: paraTexto(inicial.valorPedidoTaxa),
      valorReembolso: paraTexto(inicial.valorReembolso),
    },
  })

  const enviar = form.handleSubmit((v) => {
    const reembolso = v.valorReembolso.trim() === '' ? null : paraNumero(v.valorReembolso)
    onConfirmar({
      ...v,
      valorPedidoTaxa: Math.round(paraNumero(v.valorPedidoTaxa) * 100) / 100,
      valorReembolso: reembolso === null ? null : Math.round(reembolso * 100) / 100,
    })
    onClose()
  })

  const data = (
    nome: 'dataPedido' | 'dataAnulacao' | 'dataReembolso',
    rotulo: string,
    obrigatoria = false
  ) => (
    <FormField
      key={nome}
      control={form.control}
      name={nome}
      render={({ field, fieldState }) => (
        <Field label={rotulo} required={obrigatoria} error={fieldState.error?.message}>
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
  )
  const valor = (
    nome: 'valorPedidoTaxa' | 'valorReembolso',
    rotulo: string,
    obrigatorio = false
  ) => (
    <FormField
      control={form.control}
      name={nome}
      render={({ field, fieldState }) => (
        <Field label={rotulo} required={obrigatorio} error={fieldState.error?.message}>
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
  )

  return (
    <FormModal
      title={novo ? 'Novo cancelado pós-entrega' : 'Editar cancelado pós-entrega'}
      saveLabel={novo ? 'Incluir' : 'Aplicar'}
      size="2xl"
      onClose={onClose}
      onSubmit={(e) => {
        e.stopPropagation()
        void enviar(e)
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {data('dataPedido', 'Data do pedido', true)}
        {valor('valorPedidoTaxa', 'Valor (pedido + taxa) R$', true)}
        {valor('valorReembolso', 'Valor do reembolso R$')}
        {TEXTOS.map(({ nome, rotulo, largo }) => (
          <div key={nome} className={largo ? 'sm:col-span-2' : undefined}>
            <FormField
              control={form.control}
              name={nome}
              render={({ field, fieldState }) => (
                <Field label={rotulo} error={fieldState.error?.message}>
                  {(c) => <Input {...c} {...field} value={String(field.value ?? '')} />}
                </Field>
              )}
            />
          </div>
        ))}
        {DATAS.map(({ nome, rotulo }) => data(nome, rotulo))}
      </div>
    </FormModal>
  )
}
