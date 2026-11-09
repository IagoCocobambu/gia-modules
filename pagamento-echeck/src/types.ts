/** Loja do seletor (handler `lojas`). */
export interface PagamentoLoja {
  empresaId: number
  nome: string
  ativo: boolean
}

/** Uma transação eCheck (handler `pagamentos`). */
export interface Transacao {
  id: string
  /** Data e hora da transação, ISO com fuso (ex.: `2026-11-04T22:47:14-03:00`). */
  dataHora: string | null
  loja: string | null
  bandeira: string | null
  /** Como veio da API (ex.: `CREDITO_AVISTA`); na tela, `_` vira espaço. */
  modalidade: string | null
  valor: number
  codAut: string | null
  codCielo: string | null
  descricao: string | null
  terminal: string | null
  conta: string | null
  mesa: string | null
  grupoMesa: string | null
  aberturaMesa: string | null
  /** `PAGO` = aprovada. */
  status: string | null
  /** Tipo da transação como vem da API (ex.: `lio`, `todo_cartoes`, `cb_app`). */
  tipo: string | null
  tipoAdhoc: string | null
  descricaoAdhoc: string | null
}

export interface PagamentosResposta {
  transacoes: Transacao[]
}

/** Snapshot do clique em "Pesquisar". */
export interface Consulta {
  empresaId: number
  lojaNome: string
  de: string
  ate: string
  horaInicio: number
  horaFim: number
}

/** Card dos totais que filtra a tabela (as transações que somam nele). */
export type FiltroTotal = 'aprovadas' | 'nao_aprovadas'

export interface Resumo {
  /** Os 3 indicadores do legado. */
  valorTotal: number
  transacoes: number
  ticketMedio: number
  /** Quantidade com status PAGO (o "N aprovadas" do legado). */
  aprovadas: number
  /** Valor das transações de cada card de filtro. */
  valores: Record<FiltroTotal, number>
  /** Quantidade de transações de cada card de filtro. */
  quantidades: Record<FiltroTotal, number>
}

/** Uma barra do gráfico por hora. */
export interface VolumeHora {
  hora: number
  valor: number
  transacoes: number
}

/** Uma fatia do gráfico por modalidade. */
export interface VolumeModalidade {
  modalidade: string
  valor: number
  transacoes: number
}
