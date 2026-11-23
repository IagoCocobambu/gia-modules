// Tipos do domínio. O shape é o que os handlers de `src/server/` devolvem.

/** RVC (centro de receita) = salão da loja. */
export interface Rvc {
  numero: number
  nome: string
}

/** Loja com vínculo com a BI do Simphony (`src/server/lojas.ts`). */
export interface LojaCouvert {
  empresaId: number
  nome: string
  /** Na ordem do cadastro; o 1º é o padrão. Vazio = loja sem RVC configurado. */
  rvcs: Rvc[]
}

/** Item da conta (só linhas de item do cardápio). */
export interface ItemConta {
  /** Código do item no PDV; o nome vem do handler `nomes`. */
  miNum: number
  qtd: number
  valor: number
  assento: number | null
  rodada: number | null
  /** Hora local do lançamento, `AAAA-MM-DDTHH:MM:SS`. */
  hora: string | null
  tipo: 'couvert' | 'buffet' | null
}

/** Conta aberta da mesa (detalhe ao tocar no card). */
export interface Conta {
  numero: number | null
  abertura: string | null
  ultimoLancamento: string | null
  /** Número do garçom; o nome vem do handler `nomes`. */
  garcom: number | null
  rodadas: number | null
  impressa: boolean
  subtotal: number
  desconto: number
  taxaServico: number
  total: number
  pago: number
  saldo: number
  itens: ItemConta[]
}

/** Nomes de itens e garçons (`src/server/nomes.ts`), por código. */
export interface Nomes {
  itens: Record<string, string>
  garcons: Record<string, string>
}

/** Mesa aberta (`src/server/mesas.ts`). */
export interface Mesa {
  /** `guestCheckId` da conta. */
  id: string
  /** Nome da mesa (`tblName`). */
  mesa: string
  /** Número do grupo da mesa (`tblNum`). */
  grupo: number | null
  pessoas: number
  /** Couvert artístico lançado (soma das quantidades dos itens de programação artística). */
  couvert: number
  /** Buffet lançado (soma das quantidades dos itens de buffet); 0 na loja sem buffet. */
  buffet: number
  conta: Conta
}

export interface RespostaMesas {
  /** Dia de negócio aberto na loja (`getLatestBusDt`), `AAAA-MM-DD`. */
  dia: string
  /** ISO da consulta. */
  consultadoEm: string
  /** Loja com itens de buffet configurados: o buffet conta para a situação. */
  temBuffet: boolean
  mesas: Mesa[]
}

/** O que foi pesquisado. */
export interface Consulta {
  empresaId: number
  rvc: number
}

/** Situação de um contador ou da mesa (regras R6–R9 do docs/conceito.md). */
export type Situacao = 'divergente' | 'sem-lancamento' | 'sem-pessoas' | 'tudo-lancado'

/** Filtro dos chips: uma situação ou todas. */
export type FiltroSituacao = Situacao | 'todas'

/** Como um card chegou à posição dele depois de um filtro, busca ou ordem. */
export interface Movimento {
  /** Sobe quando o card muda para longe: ele some no lugar antigo e surge no novo. */
  versao: number
  /** Direção do passo curto de chegada (vetor de tamanho 1; 0 e 0 = sem passo). */
  x: number
  y: number
}

/** Ordem dos cards. */
export type Ordem = 'mesa' | 'atencao'
