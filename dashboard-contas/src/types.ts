// O CONTRATO DE FIO entre os handlers de `src/server/` e o cliente.
//
// Os handlers não importam este arquivo (o codegen da Edge Function só carrega
// `@gia-cb/sdk/server`), então cada um redeclara a forma que devolve. Campo novo
// aqui exige mudar o handler junto — e o contrário também.

/**
 * De qual plano o handler lê: o Plano de Contas (o realizado) ou o Plano de
 * Orçamentos da loja no mesmo mês. Os dois têm os mesmos 169 índices, então a
 * matriz e a série têm a mesma forma nas duas fontes. No orçado, o `status` de
 * toda loja é "Entregue" e não significa nada — o painel não o lê.
 */
export type FonteDoPlano = 'realizado' | 'orcado'

/** Status do plano de uma loja num mês. A ausência de plano é `Sem plano`. */
export type StatusPlano = 'Pendente' | 'Entregue' | 'Auditado'
export type StatusNoMes = StatusPlano | 'Sem plano'

/** Uma conta do catálogo `plano_conta.indices`. */
export interface IndiceCatalogo {
  indice: number
  /** O código de exibição hierárquico: "1", "1.1", "4.10.1", "10200". */
  formatado: string
  descricao: string
  isInput: boolean
  isGroup: boolean
}

/** Uma loja com plano vigente no mês. */
export interface LojaDoMes {
  ref: string
  status: StatusPlano
  /**
   * Os valores das contas, NA ORDEM DE `indices` do mesmo mês. `null` = a linha
   * não existe no resumo (plano incompleto). Razões e as contas recalculadas
   * chegam como estão gravadas — quem as refaz é o domínio (`matriz.ts`).
   */
  valores: Array<number | null>
}

/** A matriz de um mês: todas as lojas do escopo que têm plano, 169 contas cada. */
export interface MatrizDoMes {
  ano: number
  mes: number
  indices: IndiceCatalogo[]
  lojas: LojaDoMes[]
}

/** A série curta da evolução: poucas contas, por loja, mês a mês. */
export interface SerieDeContas {
  /** Os meses da janela, do mais antigo ao mais recente. */
  meses: Array<{ ano: number; mes: number }>
  /** As contas de cada vetor, na ordem dele. */
  contas: number[]
  lojas: Array<{
    ref: string
    /** Um item por mês da janela; `null` = sem plano no mês. */
    porMes: Array<Array<number | null> | null>
  }>
}

/** Uma operação do escopo do usuário, como o handler `operacoes` devolve. */
export interface OperacaoDoEscopo {
  ref: string
  nome: string
  empresaId: number
}
