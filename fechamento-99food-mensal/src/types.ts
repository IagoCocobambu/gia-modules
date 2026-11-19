// Tipos do módulo. O formato das respostas é o dos handlers em `src/server/`
// (que não podem importar daqui — o contrato é mantido igual nos dois lados).

export type StatusPagamento = 'ONLINE' | 'ONLINE VR' | 'OFFLINE'

/** Um restaurante da loja na 99Food (um por operação: cb, cbx, pzcb, vst…). */
export interface Restaurante99 {
  /** `operacao_ref` da operação dona do restaurante ("17 cbx"). */
  operacao: string
  /** UUID do restaurante (merchant) na 99Food. */
  merchant: string
}

/** Uma loja (Empresa) do seletor. O fechamento junta todas as operações dela. */
export interface Loja99 {
  empresaId: number
  nome: string
  /** Número da loja ("02"): chave do fechamento no banco do Maestro e do borderô. */
  locRef: string | null
  /** Restaurantes da 99Food da loja; vazio = loja sem 99Food. */
  restaurantes: Restaurante99[]
  ativo: boolean
}

/** Um lançamento financeiro da 99Food (aba Lançamentos — a "BD Conciliação" do legado). */
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
  /** Operação (restaurante na 99Food) do lançamento — "17 cbx". Preenchido pela tela. */
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
  /** A 99Food negou este restaurante (403): ele ficou de fora. */
  aviso: string | null
  /** Saldo da cota da 99Food na última resposta (uma cota só para toda a credencial). */
  cota: Cota99 | null
  /** Repetições imediatas que a página precisou (vendas vazias ou 429 com saldo). */
  repeticoes: number
  /**
   * A página NÃO veio — pedir de novo mais tarde. `cota`: cota esgotada, pausar todas
   * as chamadas por `esperarMs`; `instavel`/`incompleta`: devolver ao fim da fila.
   */
  adiar: { motivo: 'cota' | 'instavel' | 'incompleta'; esperarMs: number } | null
}

/** `ifood-ratelimit-remaining` e `ifood-ratelimit-reset` (segundos até renovar). */
export interface Cota99 {
  restantes: number
  resetS: number
}

export interface OnlineManualDia {
  previsao?: string
  /** Borderô (`bordero.fields`, campos Online da 99) — só leitura. */
  cbOnline?: number
  /** Borderô (`bordero.fields`, campos de desconto da 99) — só leitura. */
  cbDescontosFood99?: number
  /** Digitado. `null`/ausente = não informado. */
  cbDescontosLoja?: number | null
  comentario?: string
}

export interface AdquirenteManualDia {
  previsao?: string
  /** Borderô (`bordero.fields`, campos de adquirentes da 99) — só leitura. */
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
  idFood99: string
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
  /** Campos da 99 no borderô que NÃO entram na conferência (somados no mês). */
  camposFora: CampoForaDaConferencia[]
}

/** Por que um campo da 99 no borderô ficou fora da conferência (PRD §11). */
export type MotivoCampoFora = 'cancelado' | 'offline' | 'sem_sufixo' | 'nao_reconhecido'

export interface CampoForaDaConferencia {
  /** `din` ou `ent`. */
  grupo: string
  /** Nome do campo como a loja escreveu (em minúsculas). */
  nome: string
  motivo: MotivoCampoFora
  valor: number
  dias: number
}

/** Linha diária da aba Online (grid ONLINE v2026 do legado). */
export interface LinhaOnlineDia {
  dia: string
  previsao: string
  food99Online: number
  descFood99Qtd: number
  descFood99Rs: number
  cancelTotalQtd: number
  cancelTotalRs: number
  cancelParcialQtd: number
  cancelParcialRs: number
  promoRede: number
  sdFood99Online: number
  cbOnline: number
  difOnline: number
  descOffQtd: number
  descOffRs: number
  descVrQtd: number
  descVrRs: number
  sdDescontoFood99: number
  cbDescontosFood99: number
  difDescontoFood99: number
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
  food99Vr: number
  descFood99Qtd: number
  descFood99Rs: number
  cancelTotalQtd: number
  cancelTotalRs: number
  cancelParcialQtd: number
  cancelParcialRs: number
  descLojaVrQtd: number
  descLojaVrRs: number
  promoRede: number
  sdFood99Vr: number
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
  /** Restaurantes da 99Food da loja que entram na consulta. */
  restaurantes: Restaurante99[]
  /**
   * TESTE (`GIA_DEV_99FOOD_MENSAL_POR_OPERACAO=1`): consulta só desta operação;
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
