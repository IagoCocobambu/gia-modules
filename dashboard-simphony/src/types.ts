// Tipos do domínio — o que os handlers de src/server/ devolvem, já somado por
// loja (todos os centros de receita da BI do Simphony juntos).

export interface DashboardLoja {
  empresaId: number
  nome: string
}

/** Totais do dia (handler `resumo`). */
export interface DashboardTotais {
  vendaLiquida: number
  pessoas: number
  contas: number
  descontos: number
  estornos: number
  correcoes: number
}

export interface DashboardResumo {
  /** Dia de negócio consultado (`YYYY-MM-DD`). */
  data: string
  /** `true` quando o dia veio da BI (último dia de negócio da loja). */
  ultimoDia: boolean
  totais: DashboardTotais
}

/** Linha do Mix de vendas (handler `itens`). */
export interface ItemVendido {
  numero: number
  nome: string
  quantidade: number
  total: number
}

/** Linha de Funcionários (handler `funcionarios`). */
export interface Funcionario {
  numero: number
  nome: string
  contas: number
  vendaLiquida: number
  servico: number
}

/** O que foi pesquisado (foto do clique em Pesquisar). */
export interface Consulta {
  empresaId: number
  lojaNome: string
  /** Vazio = último dia de negócio (a BI decide). */
  data: string
}
