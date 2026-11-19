import type { TipoLinhaConferencia } from './types'

// Categorias da aba Conferência (DRE mensal) — a mesma estrutura do Fechamento iFood
// Mensal (Recebido, Incentivos da loja, Taxas e comissões, Outros, Valor a depositar,
// Checks e Breakdown), com as descrições dos lançamentos que o handler `bill` monta a
// partir da Financial API da 99. PROVISÓRIO, a validar pelo financeiro (PRD §11).
//
// - `sumifs_desc`: soma do `valor` dos lançamentos da competência com aquela
//   descrição E aquele "impacto no repasse";
// - `avg_percent`: média do `percentual_taxa` desses lançamentos;
// - `subtotal` / `total_depositar`: soma de outras linhas;
// - `ref`: o valor de outra linha (com sinal trocado quando `negate`);
// - `manual`: digitado (breakdown por centro de custo);
// - `difference`: Valor a depositar − soma do breakdown.

export interface CategoriaConferencia {
  id: string
  label: string
  grupo: string
  tipo: TipoLinhaConferencia
  descricao?: string
  impacto?: 'SIM' | 'NÃO'
  somaIds?: string[]
  refId?: string
  negate?: boolean
}

export const CONFERENCIA_BREAKDOWN_IDS = [
  'valor_site_cc1',
  'valor_site_cc2',
  'valor_site_cc3',
  'valor_site_cc4',
] as const

const sumifs = (
  id: string,
  label: string,
  grupo: string,
  descricao: string,
  impacto: 'SIM' | 'NÃO' = 'SIM'
): CategoriaConferencia => ({ id, label, grupo, tipo: 'sumifs_desc', descricao, impacto })

const RECEBIDO = 'Recebido via 99Food'
const INCENTIVOS = 'Incentivos Promocionais Loja'
const TAXAS = 'Taxas e Comissões'
const OUTROS = 'Outros Lançamentos'

export const CONFERENCIA_CATEGORIAS: CategoriaConferencia[] = [
  {
    id: 'sub_recebido',
    label: 'Recebido via 99Food',
    grupo: RECEBIDO,
    tipo: 'subtotal',
    somaIds: ['pedidos_99', 'promo_99'],
  },
  sumifs('pedidos_99', 'Pedidos com pagamento via 99Food', RECEBIDO, 'Entrada Financeira'),
  sumifs('promo_99', 'Promoção custeada pela 99', RECEBIDO, 'Promoção custeada pela 99'),
  {
    id: 'incentivos_loja_recebido',
    label: 'Incentivos Promocionais Loja',
    grupo: RECEBIDO,
    tipo: 'ref',
    refId: 'sub_incentivos_loja',
    negate: true,
  },
  {
    // Informativo: o desconto da loja já está dentro da Entrada Financeira (o que o
    // cliente pagou). Sem impacto no repasse, como no iFood; fora do Valor a depositar.
    id: 'sub_incentivos_loja',
    label: 'Incentivos Promocionais Loja',
    grupo: INCENTIVOS,
    tipo: 'subtotal',
    somaIds: ['promo_loja'],
  },
  sumifs(
    'promo_loja',
    'Promoção custeada pela loja',
    INCENTIVOS,
    'Promoção custeada pela loja',
    'NÃO'
  ),
  {
    id: 'sub_taxas',
    label: 'Taxas e Comissões',
    grupo: TAXAS,
    tipo: 'subtotal',
    somaIds: ['comissao_99', 'subsidio_comissao_99', 'taxa_pagamento', 'entrega_99'],
  },
  sumifs('comissao_99', 'Comissão da 99', TAXAS, 'Comissão da 99'),
  sumifs('subsidio_comissao_99', 'Subsídio de comissão da 99', TAXAS, 'Subsídio de comissão da 99'),
  sumifs('taxa_pagamento', 'Taxa de pagamento', TAXAS, 'Taxa de pagamento'),
  sumifs('entrega_99', 'Entrega da 99', TAXAS, 'Entrega da 99'),
  {
    id: 'sub_outros',
    label: 'Outros Lançamentos',
    grupo: OUTROS,
    tipo: 'subtotal',
    somaIds: ['gorjeta', 'pedido_minimo', 'ajustes_repasse', 'avulso'],
  },
  sumifs('gorjeta', 'Gorjeta antecipada', OUTROS, 'Gorjeta antecipada'),
  sumifs('pedido_minimo', 'Complemento de pedido mínimo', OUTROS, 'Complemento de pedido mínimo'),
  sumifs('ajustes_repasse', 'Ajustes do repasse', OUTROS, 'Ajustes do repasse'),
  sumifs('avulso', 'Lançamento avulso', OUTROS, 'Lançamento avulso'),
  {
    // Como no iFood: as quatro seções (a de incentivos da loja entra com o próprio sinal
    // em Incentivos e volta com o sinal trocado em Recebido, somando zero).
    id: 'valor_depositar',
    label: 'Valor a depositar',
    grupo: 'Total',
    tipo: 'total_depositar',
    somaIds: [
      'sub_recebido',
      'incentivos_loja_recebido',
      'sub_incentivos_loja',
      'sub_taxas',
      'sub_outros',
    ],
  },
  {
    id: 'check_comissao_99',
    label: 'Comissão da 99 cobrada (média)',
    grupo: 'Checks',
    tipo: 'avg_percent',
    descricao: 'Comissão da 99',
    impacto: 'SIM',
  },
  { id: 'valor_site_cc1', label: 'Valor Site (Loja)', grupo: 'Breakdown loja', tipo: 'manual' },
  {
    id: 'valor_site_cc2',
    label: 'Valor Site (Centro de custo 2)',
    grupo: 'Breakdown loja',
    tipo: 'manual',
  },
  {
    id: 'valor_site_cc3',
    label: 'Valor Site (Centro de custo 3)',
    grupo: 'Breakdown loja',
    tipo: 'manual',
  },
  {
    id: 'valor_site_cc4',
    label: 'Valor Site (Centro de custo 4)',
    grupo: 'Breakdown loja',
    tipo: 'manual',
  },
  {
    id: 'diferenca',
    label: 'Diferença',
    grupo: 'Total',
    tipo: 'difference',
    somaIds: ['valor_depositar'],
  },
]
