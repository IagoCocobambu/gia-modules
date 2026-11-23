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
  /** Loja com itens de buffet configurados: a tela mostra o buffet. */
  temBuffet: boolean
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
}

export interface RespostaMesas {
  /** Dia de negócio aberto na loja (`getLatestBusDt`), `AAAA-MM-DD`. */
  dia: string
  /** ISO da consulta. */
  consultadoEm: string
  /** Loja com itens de buffet configurados: a tela mostra o buffet. */
  temBuffet: boolean
  mesas: Mesa[]
}

/** O que foi pesquisado. */
export interface Consulta {
  empresaId: number
  rvc: number
}

/** Situação de um contador ou da mesa (regras R6–R9 do docs/conceito.md). */
export type Situacao = 'divergente' | 'sem-lancamento' | 'tudo-lancado'

/** Filtro dos chips: uma situação ou todas. */
export type FiltroSituacao = Situacao | 'todas'

/** Ordem dos cards. */
export type Ordem = 'mesa' | 'atencao'
