// Tipos do domínio — pedidos de delivery do Maestro, lidos da API do DW
// (`/Delivery/?loc_ref=`). Os nomes dos campos seguem o JSON da API e as colunas
// do legado (Reports Maestro, UniGUI), pra que a tela e o export batam com ele.

/**
 * Loja que o usuário pode consultar: Empresa do escopo com CNPJ
 * (`tipoRegistro === 'empresa'`). Propriedades sem CNPJ ficam de fora.
 */
export interface ReportsMaestroLoja {
  empresaId: number
  nome: string
  /**
   * Número da loja com 2 dígitos ("01"), o `loc_ref` da API de delivery — do
   * vínculo com a BI do Simphony (`locRefs.BIAPI`) ou, na falta, do nome.
   * `null` quando a Empresa não tem número no cadastro.
   */
  locRef: string | null
  ativo: boolean
}

export interface LojasResposta {
  lojas: ReportsMaestroLoja[]
}

/**
 * Pedido de delivery. Datas em hora de São Paulo, sem fuso (`YYYY-MM-DD HH:mm:ss`),
 * exceto `data_de_criacao_utc`.
 *
 * Sem `reports-maestro.ver-dados-cliente`, o servidor já devolve CPF, e-mail,
 * telefone, número e complemento do endereço MASCARADOS (ex.: `***.456.789-**`).
 */
export interface PedidoMaestro {
  id: string
  n_pedido: string
  data_de_criacao: string | null
  data_de_acao: string | null
  n_parceiro: string | null
  n_conta: string | null
  cpf_cliente: string | null
  nome_cliente: string | null
  quantidade_pedidos: number | null
  email_cliente: string | null
  telefone_cliente: string | null
  street_name: string | null
  street_number: string | null
  reference: string | null
  retirada: string | null
  confirmado_por: string | null
  cancelado_por: string | null
  origem: string | null
  status_do_pedido: string | null
  valor_do_pedido: number
  valor_da_entrega: number
  total_pago: number
  desconto_total: number
  forma_de_pagamentos: string | null
  descontos: string | null
  nome_loja: string | null
  // Campos da API que o legado não mostrava — nulos quando o pedido não tem
  // (ex.: pedido sem parceiro). Na tabela nascem ocultos.
  tipo_entrega: string | null
  entrega_pela_origem: boolean | null
  entregue_por: string | null
  parceiro: string | null
  taxa_entrega: number | null
  taxa_extra_parceiro: number | null
  incentivo_loja: number | null
  incentivo_parceiro: number | null
  id_loja: string | null
  /** ISO em UTC (`2026-05-02T14:06:59.459Z`) — a única data que NÃO é de São Paulo. */
  data_de_criacao_utc: string | null
}

/**
 * A resposta da pesquisa — UMA chamada à API serve às duas abas: a lista de
 * pedidos e o resumo do dashboard Operacional.
 */
export interface PedidosResposta {
  pedidos: PedidoMaestro[]
  /** `true` quando os dados pessoais do cliente vieram mascarados. */
  dadosClienteMascarados: boolean
  /** O resumo por pedido do dashboard Operacional (`PedidoOperacional`). */
  operacional: PedidoOperacional[]
}

// ─── Dashboard Operacional (campo `operacional` da resposta de `pedidos`) ─────

/**
 * Como o pedido terminou, pelo HISTÓRICO de status (não pelo status atual):
 * - `entregue`: tem o evento Entregue;
 * - `entregue-cancelado`: foi entregue e cancelado DEPOIS da entrega;
 * - `cancelado`: cancelado antes de ser entregue;
 * - `sem-entrega`: entrega que saiu da loja e nunca teve a entrega confirmada;
 * - `retirada`: retirada na loja sem baixa de entrega;
 * - `antes-de-sair`: ainda não foi despachado (pedido em andamento).
 */
export type DesfechoPedido =
  'entregue' | 'entregue-cancelado' | 'cancelado' | 'sem-entrega' | 'retirada' | 'antes-de-sair'

/** `cliente` = cliente ou plataforma (CONSUMER); `loja` = STORE. */
export type QuemCancelou = 'cliente' | 'loja' | 'ambos' | 'outro'

/** Um pedido resumido para o dashboard — sem dado nenhum do cliente. */
export interface PedidoOperacional {
  origem: string
  retirada: boolean
  /** `YYYY-MM-DD HH:mm:ss`, hora de São Paulo. */
  criadoEm: string
  valor: number
  desfecho: DesfechoPedido
  /** Minutos de cada etapa (do primeiro evento de um status ao do seguinte). */
  aceite: number | null
  preparo: number | null
  expedicao: number | null
  rota: number | null
  total: number | null
  /** A loja registrou embalado/despachado depois de o app de entrega já ter pegado o pedido. */
  baixaForaDeOrdem: boolean
  cancelamento: {
    por: QuemCancelou
    /** Minutos do recebimento ao cancelamento. */
    minutos: number | null
  } | null
}

/** Snapshot do clique em "Pesquisar" — é ele que a tabela e o export mostram. */
export interface Consulta {
  empresaId: number
  lojaNome: string
  de: string
  ate: string
}
