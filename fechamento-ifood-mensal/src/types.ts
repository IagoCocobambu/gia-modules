// Tipos do módulo. O formato das respostas é o dos handlers em `src/server/`
// (que não podem importar daqui — o contrato é mantido igual nos dois lados).

export type StatusPagamento = 'ONLINE' | 'ONLINE VR' | 'OFFLINE'

/** Um restaurante da loja no iFood (um por operação: cb, cbx, pzcb, vst…). */
export interface RestauranteIfood {
  /** `operacao_ref` da operação dona do restaurante ("17 cbx"). */
  operacao: string
  /** UUID do restaurante (merchant) no iFood. */
  merchant: string
}

/** Uma loja (Empresa) do seletor. O fechamento junta todas as operações dela. */
export interface LojaIfood {
  empresaId: number
  nome: string
  /** Número da loja ("02"): chave do fechamento no banco do Maestro e do borderô. */
  locRef: string | null
  /** Restaurantes do iFood da loja; vazio = loja sem iFood. */
  restaurantes: RestauranteIfood[]
  ativo: boolean
}

/** Um lançamento financeiro do iFood (aba Lançamentos — a "BD Conciliação" do legado). */
export interface LinhaLedger {
  total: number
  status: StatusPagamento
  /** `AAAA-MM-DD` do pedido, ou `Ocorrências` (lançamento sem pedido). */
  data: string
  competencia: string
  competenciaLabel: string
  /** `DD/MM/AAAA` ou vazio. */
  dataRepasse: string
  classificacao: string
  fatoGerador: string
  tipoLancamento: string
  descricao: string
  valor: number
  baseCalculo: number
  percentualTaxa: number
  impactoRepasse: 'SIM' | 'NÃO'
  pedidoId: string
  pedidoCurto: string
  metodoPagamento: string
  bandeira: string
  /** Operação (restaurante no iFood) do lançamento — "17 cbx". Preenchido pela tela. */
  operacao: string
}

export interface RespostaLedger {
  linhas: LinhaLedger[]
  janela: number
  totalJanelas: number
  pagina: number
  totalPaginas: number
  inicio: string
  fim: string
  /** O iFood negou este restaurante (403): ele ficou de fora. */
  aviso: string | null
  /** Saldo da cota do iFood na última resposta (uma cota só para toda a credencial). */
  cota: CotaIfood | null
  /** Repetições imediatas que a página precisou (vendas vazias ou 429 com saldo). */
  repeticoes: number
  /**
   * A página NÃO veio — pedir de novo mais tarde. `cota`: cota esgotada, pausar todas
   * as chamadas por `esperarMs`; `instavel`/`incompleta`: devolver ao fim da fila.
   */
  adiar: { motivo: 'cota' | 'instavel' | 'incompleta'; esperarMs: number } | null
}

/** `ifood-ratelimit-remaining` e `ifood-ratelimit-reset` (segundos até renovar). */
export interface CotaIfood {
  restantes: number
  resetS: number
}

export interface OnlineManualDia {
  previsao?: string
  /** Borderô (din_ifood_online) — só leitura. */
  cbOnline?: number
  /** Borderô (din_desconto_ifood) — só leitura. */
  cbDescontosIfood?: number
  /** Digitado. `null`/ausente = não informado. */
  cbDescontosLoja?: number | null
  comentario?: string
}

export interface AdquirenteManualDia {
  previsao?: string
  /** Borderô (ent_ifood_adquirentes) — só leitura. */
  caixa?: number
  comentario?: string
}

export interface LinhaExtrato {
  loja: string
  banco: string
  tipo: string
  mesAno: string
  classificacao: string
  subClassificacao: string
  /** `AAAA-MM-DD` */
  dataMovimento: string
  historico: string
  documento: string
  malote: number
  /** `AAAA-MM` */
  competencia: string
}

export interface LinhaCancelado {
  dataPedido: string
  estabelecimento: string
  cnpj: string
  nomeCliente: string
  numeroPedido: string
  idIfood: string
  valorPedidoTaxa: number
  valorReembolso: number | null
  centroVenda: string
  origemCancelamento: string
  justificativa: string
  andamento: string
  protocolo: string
  valeNoCofre: string
  dataAnulacao: string
  dataReembolso: string
}

/** O que é digitado/gravado no mês (e o borderô, que vem junto na leitura). */
export interface DadosManuais {
  online: Record<string, OnlineManualDia>
  adquirente: Record<string, AdquirenteManualDia>
  conferencia: Record<string, number>
  extrato: LinhaExtrato[]
  cancelados: LinhaCancelado[]
  anulacaoVerificar: number
}

export interface RespostaManual extends DadosManuais {
  locRef: string
  gravadoEm: string | null
  diasComBordero: number
}

/** Linha diária da aba Online (grid ONLINE v2026 do legado). */
export interface LinhaOnlineDia {
  dia: string
  previsao: string
  ifoodOnline: number
  descIfoodQtd: number
  descIfoodRs: number
  cancelTotalQtd: number
  cancelTotalRs: number
  cancelParcialQtd: number
  cancelParcialRs: number
  promoRede: number
  sdIfoodOnline: number
  cbOnline: number
  difOnline: number
  descOffQtd: number
  descOffRs: number
  descVrQtd: number
  descVrRs: number
  sdDescontoIfood: number
  cbDescontosIfood: number
  difDescontoIfood: number
  descLojaOnlineQtd: number
  descLojaOnlineRs: number
  descLojaOffQtd: number
  descLojaOffRs: number
  sdDescontoLoja: number
  cbDescontosLoja: number | null
  difDescontoLoja: number
  difTotal: number
  comentario: string
}

/** Linha diária da aba Adquirentes (grid ADQUIRENTES v2026). */
export interface LinhaAdquirenteDia {
  dia: string
  previsao: string
  ifoodVr: number
  descIfoodQtd: number
  descIfoodRs: number
  cancelTotalQtd: number
  cancelTotalRs: number
  cancelParcialQtd: number
  cancelParcialRs: number
  descLojaVrQtd: number
  descLojaVrRs: number
  promoRede: number
  sdIfoodVr: number
  caixa: number
  difTotal: number
  comentario: string
}

export type TipoLinhaConferencia =
  'sumifs_desc' | 'subtotal' | 'ref' | 'avg_percent' | 'manual' | 'difference' | 'total_depositar'

export interface LinhaConferencia {
  id: string
  label: string
  grupo: string
  tipo: TipoLinhaConferencia
  /** Descrição do lançamento somada (só nas linhas `sumifs_desc`/`avg_percent`). */
  descricao?: string
  valor: number
}

export interface LinhaRecebimento {
  competencia: string
  /** `DD/MM/AAAA` */
  dataPagamento: string
  siteRestaurante: number
  extrato: number
  diferenca: number
}

/** O que foi pesquisado (snapshot do clique em Consultar). */
export interface Consulta {
  /** Empresa (loja) — o fechamento junta todas as operações dela. */
  empresaId: number
  lojaNome: string
  mes: string
  /** Restaurantes do iFood da loja que entram na consulta. */
  restaurantes: RestauranteIfood[]
  /**
   * TESTE (`GIA_DEV_IFOOD_MENSAL_POR_OPERACAO=1`): consulta só desta operação;
   * `null` = todas (o normal). Com operação, o fechamento não é salvo.
   */
  operacao: string | null
}

export type AbaId =
  | 'lancamentos'
  | 'online'
  | 'adquirentes'
  | 'conferencia'
  | 'extrato'
  | 'recebimento'
  | 'cancelados'

/** Valor de um campo no histórico (data `AAAA-MM-DD`, número ou texto). */
export type ValorHistorico = string | number | null

/** Uma mudança de uma gravação: campo alterado ou linha incluída/removida. */
export type AlteracaoHistorico =
  | {
      secao: string
      item: string
      campo: string
      de: ValorHistorico
      para: ValorHistorico
      tipo: 'texto' | 'data' | 'moeda'
    }
  | { secao: string; item: string; acao: 'incluida' | 'removida' }

/** Uma gravação (Salvar) do fechamento. */
export interface GravacaoHistorico {
  id: string
  gravadoEm: string
  autorNome: string | null
  alteracoes: AlteracaoHistorico[]
}

export interface RespostaHistorico {
  gravacoes: GravacaoHistorico[]
  maisAntigas: boolean
  criadoEm: string | null
}
