import { z } from 'zod'

// Formulários de linha das abas Extrato e Cancelados pós. Os valores ficam como
// texto no formulário (é o que o input devolve) e viram número no envio. Os
// limites de tamanho são os das colunas do banco do Maestro (schema
// ifood_fechamento) — o handler `salvar` confere de novo.

const dataObrigatoria = (rotulo: string) =>
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { error: `Informe ${rotulo}.` })
const dataOpcional = z.union([z.literal(''), z.string().regex(/^\d{4}-\d{2}-\d{2}$/)])
const texto = (max: number) => z.string().max(max, { error: `No máximo ${max} caracteres.` })
const valor = (obrigatorio: boolean) =>
  z
    .string()
    .trim()
    .refine((v) => (obrigatorio ? v !== '' : true), { error: 'Informe o valor.' })
    .refine((v) => v === '' || Number.isFinite(paraNumero(v)), { error: 'Valor inválido.' })

/** "1.234,56" / "1234,56" / "1234.56" → 1234.56 (NaN se não for número). */
export function paraNumero(v: string): number {
  const t = v.trim()
  if (t === '') return NaN
  const normal = t.includes(',') ? t.replace(/\./g, '').replace(',', '.') : t
  return Number(normal)
}

export const extratoSchema = z.object({
  dataMovimento: dataObrigatoria('a data do movimento'),
  malote: valor(true),
  loja: texto(20),
  banco: texto(100),
  tipo: texto(100),
  mesAno: texto(20),
  classificacao: texto(150),
  subClassificacao: texto(150),
  historico: z.string(),
  documento: texto(100),
})
export type ExtratoForm = z.infer<typeof extratoSchema>

export const canceladoSchema = z.object({
  dataPedido: dataObrigatoria('a data do pedido'),
  estabelecimento: texto(150),
  cnpj: texto(20),
  nomeCliente: texto(200),
  numeroPedido: texto(50),
  idIfood: texto(50),
  valorPedidoTaxa: valor(true),
  valorReembolso: valor(false),
  centroVenda: texto(100),
  origemCancelamento: texto(100),
  justificativa: z.string(),
  andamento: texto(150),
  protocolo: texto(100),
  valeNoCofre: texto(20),
  dataAnulacao: dataOpcional,
  dataReembolso: dataOpcional,
})
export type CanceladoForm = z.infer<typeof canceladoSchema>
