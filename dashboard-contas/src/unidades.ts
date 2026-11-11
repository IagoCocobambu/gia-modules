// A UNIDADE de análise do painel: a operação, ou o grupo de matriz e filiais.
//
// ── POR QUE O PAINEL PRECISA DISSO ──────────────────────────────────────────
//
// Uma loja pode ter mais de uma operação no cadastro (a matriz e as filiais dela
// — "08.CB TERESINA" e "08.VST TERESINA"). Cada uma entrega o seu Plano de
// Contas, e comparar a matriz sozinha com uma loja que não tem filial compara
// coisas de tamanhos diferentes: o faturamento está partido em duas linhas, e o
// percentual de cada parte é sobre o faturamento DELA.
//
// Com a consolidação ligada, o grupo vira UMA unidade: os planos somam antes de
// qualquer conta, e as razões são recalculadas sobre a soma (a mesma regra da
// rede, em `matriz.ts`). Desligada, cada operação continua por si.
//
// ── O GRUPO É INDIVISÍVEL NA SELEÇÃO ────────────────────────────────────────
//
// Marcar só a filial de um grupo consolidado seria pedir meia loja: o número
// sairia sem a matriz e ninguém saberia. Por isso o seletor marca o grupo
// inteiro, e quem quer olhar uma operação sozinha desliga a consolidação.
//
// ── A ORDEM É PELO NÚMERO DA LOJA ───────────────────────────────────────────
//
// "01.CB GOIANIA", "08.CB TERESINA", "10.CB MEIRELES": o número na frente do
// nome é como a rede se refere às lojas. Ordenar por texto puro põe "10" antes
// de "8" — defeito visto no Dashboard de RH, onde as filiais dentro da matriz
// saíam fora de ordem. O `Intl.Collator` com `numeric: true` lê o número como
// número, e é ele que ordena TANTO os grupos QUANTO as filiais dentro de cada um.

// ── AS LOJAS DE TESTE ───────────────────────────────────────────────────────
//
// A base carrega o cadastro inteiro da rede, e dentro dele existem as unidades
// de TESTE da tecnologia — "999.CB TECH HOMOLOG" e "999.VST TECH HOMOLOG". Elas
// entregam Plano de Contas como qualquer outra, mas com número inventado: uma
// venda de teste entra na média da rede, no ranking e na régua de comparação
// como se fosse faturamento.
//
// Decisão do João em 23/09/2026: marcar EM LOTE ("Selecionar todas", a caixa de
// um estado ou de uma região) nunca as inclui. Marcar uma a uma continua
// incluindo — quem procura a loja de teste pelo nome está procurando por ela —,
// e desmarcar continua desmarcando tudo, de lote ou não.
//
// ── COMO ELAS SÃO RECONHECIDAS ──────────────────────────────────────────────
//
// Pelo CÓDIGO COMERCIAL, que vive na frente do nome da operação, antes do ponto
// ("01.CB GOIANIA" é o código 01). O 999 é o código reservado à tecnologia, e
// são três dígitos: "99.CB PRAIA GRANDE" é o código 99, loja de verdade, e não
// pode ser confundida com ele.
//
// ⚠️ O `empresa_id` NÃO serve aqui. Ele é a chave da tabela de empresas e nunca
// bate com o número que a rede chama de "a loja" — a empresa 93 é a
// "999.CB TECH HOMOLOG", a empresa 23 é a "01.CB GOIANIA". Uma lista de ids
// também mudaria de ambiente para ambiente; o código comercial, não.
const CODIGOS_DE_TESTE: ReadonlySet<string> = new Set(['999'])

/** O código comercial no começo do nome da operação ("01.CB GOIANIA" → "01"). */
export function codigoDaOperacao(nome: string): string {
  const ponto = nome.indexOf('.')
  return (ponto < 0 ? nome : nome.slice(0, ponto)).trim()
}

/** A operação é uma unidade de teste da tecnologia? */
export function ehDeTeste(o: { nome: string }): boolean {
  return CODIGOS_DE_TESTE.has(codigoDaOperacao(o.nome))
}

const ORDEM = new Intl.Collator('pt-BR', { numeric: true, sensitivity: 'base' })

/** Ordena pelo número da loja no começo do nome ("08.CB" antes de "10.CB"). */
export function ordenarPorNome<T extends { nome: string }>(itens: T[]): T[] {
  return [...itens].sort((a, b) => ORDEM.compare(a.nome, b.nome))
}

export interface OperacaoParaUnidade {
  ref: string
  nome: string
  estado: string
  regiao: string
  /** A empresa que manda no grupo: a matriz, ou a própria empresa. */
  grupoId: number
  /** O nome da matriz, para nomear o grupo. */
  nomeDoGrupo: string
}

export interface Unidade {
  /** A chave da unidade: o `ref` da operação, ou `grupo:<empresa da matriz>`. */
  ref: string
  nome: string
  estado: string
  regiao: string
  grupoId: number
  nomeDoGrupo: string
  /** As operações que a unidade soma — uma só, quando não é grupo. */
  membros: OperacaoParaUnidade[]
}

/** A chave de um grupo de matriz e filiais. */
export function chaveDoGrupo(grupoId: number): string {
  return `grupo:${grupoId}`
}

/**
 * As unidades do painel: uma por operação, ou uma por grupo de matriz e filiais
 * quando `consolidar` está ligado.
 *
 * Grupo de uma operação só não vira grupo: ele seria um "grupo" com o nome da
 * própria loja, com seta para abrir e nada dentro.
 */
export function montarUnidades(
  operacoes: readonly OperacaoParaUnidade[],
  consolidar: boolean
): Unidade[] {
  if (!consolidar) {
    return ordenarPorNome([...operacoes]).map((o) => ({ ...o, membros: [o] }))
  }
  const porGrupo = new Map<number, OperacaoParaUnidade[]>()
  for (const o of operacoes) {
    const lista = porGrupo.get(o.grupoId)
    if (lista) lista.push(o)
    else porGrupo.set(o.grupoId, [o])
  }
  const unidades = [...porGrupo.entries()].map(([grupoId, membros]) => {
    const ordenados = ordenarPorNome(membros)
    const sozinha = ordenados.length === 1
    const cabeca = ordenados[0]!
    return {
      ref: sozinha ? cabeca.ref : chaveDoGrupo(grupoId),
      // O nome do grupo é o da MATRIZ pelo cadastro; sem ele, o da primeira
      // operação em ordem — que é a de menor número, a matriz na prática.
      nome: sozinha ? cabeca.nome : cabeca.nomeDoGrupo || cabeca.nome,
      estado: cabeca.estado,
      regiao: cabeca.regiao,
      grupoId,
      nomeDoGrupo: cabeca.nomeDoGrupo,
      membros: ordenados,
    }
  })
  return ordenarPorNome(unidades)
}

/** De cada operação para a unidade dela — o que o recorte usa para agregar. */
export function unidadePorOperacao(unidades: readonly Unidade[]): Map<string, string> {
  const mapa = new Map<string, string>()
  for (const u of unidades) for (const m of u.membros) mapa.set(m.ref, u.ref)
  return mapa
}
