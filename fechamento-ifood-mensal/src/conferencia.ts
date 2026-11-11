import type { TipoLinhaConferencia } from './types'

// Categorias da aba Conferência (DRE mensal) — cópia fiel de
// `constants/conferenciaCategorias.ts` do legado. A ordem é a da tela.
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

const RECEBIDO = 'Recebido Via iFood'
const INCENTIVOS = 'Incentivos Promocionais Loja'
const TAXAS = 'Taxas e Comissões'
const OUTROS = 'Outros Lançamentos'

export const CONFERENCIA_CATEGORIAS: CategoriaConferencia[] = [
  {
    id: 'sub_recebido',
    label: 'Recebido Via iFood',
    grupo: RECEBIDO,
    tipo: 'subtotal',
    // `incentivos_loja` não existe (o legado soma 0 por ele) — mantido igual.
    somaIds: [
      'pedidos_ifood',
      'promo_ifood',
      'incentivos_loja',
      'promo_rede',
      'promo_industria',
      'taxa_servico',
    ],
  },
  sumifs('pedidos_ifood', 'Pedidos com pagamento via iFood', RECEBIDO, 'Entrada Financeira'),
  sumifs('promo_ifood', 'Promoção custeada pelo iFood', RECEBIDO, 'Promoção custeada pelo iFood'),
  {
    id: 'incentivos_loja_recebido',
    label: 'Incentivos Promocionais Loja',
    grupo: RECEBIDO,
    tipo: 'ref',
    refId: 'sub_incentivos_loja',
    negate: true,
  },
  sumifs('promo_rede', 'Promoção custeada pela rede', RECEBIDO, 'Promoção custeada pela rede'),
  sumifs(
    'promo_industria',
    'Promoção custeada pela Indústria',
    RECEBIDO,
    'Promoção custeada pela Indústria'
  ),
  sumifs(
    'taxa_servico',
    'Taxa de serviço iFood cobrada do cliente',
    RECEBIDO,
    'Taxa de serviço iFood cobrada do cliente'
  ),
  {
    id: 'sub_incentivos_loja',
    label: 'Incentivos Promocionais Loja',
    grupo: INCENTIVOS,
    tipo: 'subtotal',
    somaIds: ['promo_loja', 'promo_loja_del'],
  },
  sumifs(
    'promo_loja',
    'Promoção custeada pela loja',
    INCENTIVOS,
    'Promoção custeada pela loja',
    'NÃO'
  ),
  sumifs(
    'promo_loja_del',
    'Promoção custeada pela loja no delivery',
    INCENTIVOS,
    'Promoção custeada pela loja no delivery',
    'NÃO'
  ),
  {
    id: 'sub_taxas',
    label: 'Taxas e Comissões',
    grupo: TAXAS,
    tipo: 'subtotal',
    somaIds: [
      'comissao_ifood_entrega_propria',
      'taxa_transacao',
      'taxa_transacao_beneficios',
      'comissao_ifood',
      'frete_demanda_off',
      'frete_demanda_on',
      'cobranca_parcial_sob_demanda_on_cancelada',
      'taxa_entrega_ifood',
      'comissao_ifood_flex',
      'comissao_ifood_entrega_ifood',
      'pacote_anuncios',
      'mensalidade',
    ],
  },
  sumifs(
    'comissao_ifood_entrega_propria',
    'Comissão iFood (7%)',
    TAXAS,
    'Comissão do iFood (entrega própria da loja)'
  ),
  sumifs('taxa_transacao', 'Taxa de transação (3%)', TAXAS, 'Taxa de transação'),
  sumifs(
    'taxa_transacao_beneficios',
    'Taxa de transação (3%)',
    TAXAS,
    'Taxa de transação iFood beneficios'
  ),
  sumifs('comissao_ifood', 'Comissão o iFood', TAXAS, 'Comissão do iFood'),
  sumifs(
    'frete_demanda_off',
    'Frete de entrega parceira',
    TAXAS,
    'Solicitação de entrega Sob Demanda Off'
  ),
  sumifs(
    'frete_demanda_on',
    'Frete de entrega parceira',
    TAXAS,
    'Solicitação de entrega Sob Demanda On'
  ),
  sumifs(
    'cobranca_parcial_sob_demanda_on_cancelada',
    'Cobrança parcial de entrega Sob Demanda On cancelada',
    TAXAS,
    'Cobrança parcial de entrega Sob Demanda On cancelada'
  ),
  sumifs('taxa_entrega_ifood', 'Taxa entrega iFood', TAXAS, 'Taxa entrega iFood'),
  sumifs(
    'comissao_ifood_flex',
    'Comissão iFood - valor flexível',
    TAXAS,
    'Comissão iFood - valor flexível'
  ),
  sumifs(
    'comissao_ifood_entrega_ifood',
    'Comissão do iFood (entrega iFood)',
    TAXAS,
    'Comissão do iFood (entrega iFood)'
  ),
  sumifs(
    'pacote_anuncios',
    'Pacote de anúncios',
    TAXAS,
    'ocorrência de débito para contratação do pacote de anúncios por parte do parceiro.'
  ),
  sumifs('mensalidade', 'Mensalidade', TAXAS, 'Mensalidade'),
  {
    id: 'sub_outros',
    label: 'Outros Lançamentos',
    grupo: OUTROS,
    tipo: 'subtotal',
    somaIds: [
      'ressarcimento_pedido_cancelado',
      'ressarcimento_item_cancelado',
      'reembolso_taxa_transacao_beneficios',
      'reembolso_taxa_servico',
      'estorno_pedido_loja_vr',
      'cancelamento_pedido_loja_vr',
      'debito_ajuste_taxa_entrega',
      'cobranca_total_sob_demanda_cancelada',
      'desconto_sob_demanda_on',
      'taxa_conveniencia_parcelado',
      'credito_taxa_transacao_online',
      'saldo_devedor_periodos_anteriores',
    ],
  },
  ...(
    [
      ['ressarcimento_pedido_cancelado', 'Ressarcimento de pedido cancelado'],
      ['ressarcimento_item_cancelado', 'Ressarcimento de item cancelado'],
      ['reembolso_taxa_transacao_beneficios', 'Reembolso taxa de transação iFood benefícios'],
      ['reembolso_taxa_servico', 'Reembolso taxa de serviço iFood cobrada do cliente'],
      ['estorno_pedido_loja_vr', 'Estorno de pedido recebido via loja (VR/VA)'],
      ['cancelamento_pedido_loja_vr', 'Cancelamento de pedido recebido via loja (VR/VA)'],
      ['debito_ajuste_taxa_entrega', 'Débito - Ajuste por Cobrança em Taxa de Entrega'],
      [
        'cobranca_total_sob_demanda_cancelada',
        'Cobrança total de entrega Sob Demanda On cancelada',
      ],
      ['desconto_sob_demanda_on', 'Desconto na solicitação de entrega Sob Demanda On'],
      ['taxa_conveniencia_parcelado', 'Taxa de conveniência por pagamento parcelado'],
      ['credito_taxa_transacao_online', 'Crédito - Taxa de transação de pagamento online'],
      ['saldo_devedor_periodos_anteriores', 'Saldo devedor de períodos anteriores'],
    ] as const
  ).map(([id, descricao]) => sumifs(id, descricao, OUTROS, descricao)),
  {
    id: 'valor_depositar',
    label: 'Valor a depositar',
    grupo: 'Total',
    tipo: 'total_depositar',
    somaIds: ['sub_recebido', 'sub_incentivos_loja', 'sub_taxas', 'sub_outros'],
  },
  {
    id: 'check_comissao_ifood',
    label: 'Taxa de Comissão iFood cobrada (7%)',
    grupo: 'Checks',
    tipo: 'avg_percent',
    descricao: 'Comissão do iFood (entrega própria da loja)',
    impacto: 'SIM',
  },
  {
    id: 'check_taxa_transacao',
    label: 'Taxa de transação cobrada (3%)',
    grupo: 'Checks',
    tipo: 'avg_percent',
    descricao: 'Taxa de transação',
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
