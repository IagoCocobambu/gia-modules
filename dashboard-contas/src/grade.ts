import {
  COMPOSICAO,
  INDICADORES_DA_GRADE,
  INDICE_FATURAMENTO,
  RAZOES,
  contasDoPlano,
  type Catalogo,
  type Conta,
  type Direcao,
  type Unidade,
} from './catalogo'
import { INDICADORES_CALCULADOS, type IndicadorCalculado } from './indicadores'
import { mediaMensalDe, valorDe, type Agregado } from './matriz'

// As linhas das duas grades — Plano de contas e Comparativos — e a MEDIDA de cada
// linha num agregado. As duas abas leem por aqui, então a mesma conta dá o mesmo
// valor e o mesmo percentual nas duas.
//
// ── A GRADE É UMA ÁRVORE ACHATADA ───────────────────────────────────────────
//
// O plano (níveis 1 a 3) vem primeiro, na ordem do catálogo, com os filhos de
// cada conta aberta logo abaixo dela; depois uma linha de seção; depois os
// indicadores gerenciais (na ordem do HTML de especificação) e os indicadores
// calculados. A ordenação por coluna fica desligada nas grades: ela é global e
// plana, e separaria as filhas dos seus grupos.
//
// ── O "%" DE CADA LINHA ─────────────────────────────────────────────────────
//
//   • conta em reais → participação no faturamento do MESMO recorte;
//   • razão (10000, 20001…) → a própria razão, recalculada sobre as somas;
//   • saldo (10102, 10012) → sobre o faturamento MÉDIO MENSAL: um estoque no fim
//     do período sobre a venda somada de seis meses sairia seis vezes menor, e
//     mudaria com o tamanho do período sem nada ter mudado na loja;
//   • indicador calculado → o próprio indicador.

export type LinhaGrade =
  | {
      tipo: 'conta'
      chave: string
      conta: Conta
    }
  | { tipo: 'secao'; chave: string; titulo: string }
  | { tipo: 'calculado'; chave: string; ind: IndicadorCalculado }

export type Nivel = 1 | 2 | 3

/** As contas com filhos até o nível pedido, para "Abrir até: Nível N". */
export function abertasAteNivel(cat: Catalogo, nivel: Nivel): Set<string> {
  const abertas = new Set<string>()
  for (const c of contasDoPlano(cat)) {
    if (c.temFilhos && c.nivel < nivel) abertas.add(c.formatado)
  }
  return abertas
}

/** A conta está à vista? — todos os antepassados abertos. */
function visivel(c: Conta, abertas: ReadonlySet<string>): boolean {
  let pai = c.pai
  while (pai) {
    if (!abertas.has(pai)) return false
    const i = pai.lastIndexOf('.')
    pai = i < 0 ? null : pai.slice(0, i)
  }
  return true
}

export const TITULO_DA_SECAO = 'Indicadores e validações'

/** As linhas da grade, na ordem de exibição. */
export function linhasDaGrade(cat: Catalogo, abertas: ReadonlySet<string>): LinhaGrade[] {
  const linhas: LinhaGrade[] = []
  for (const c of contasDoPlano(cat)) {
    if (visivel(c, abertas)) linhas.push({ tipo: 'conta', chave: c.formatado, conta: c })
  }
  linhas.push({ tipo: 'secao', chave: 'secao-indicadores', titulo: TITULO_DA_SECAO })
  for (const indice of INDICADORES_DA_GRADE) {
    const pos = cat.pos.get(indice)
    if (pos === undefined) continue
    const c = cat.contas[pos]!
    linhas.push({ tipo: 'conta', chave: c.formatado, conta: c })
  }
  for (const ind of INDICADORES_CALCULADOS) {
    linhas.push({ tipo: 'calculado', chave: `calc-${ind.id}`, ind })
  }
  return linhas
}

/** O que uma linha mostra num agregado. */
export interface Medida {
  /** O valor em reais; `null` nas razões e nos calculados (a coluna R$ mostra "—"). */
  valor: number | null
  /** O "%" da linha (ver o topo do arquivo). `null` = sem dado. */
  pct: number | null
  /** Como o `pct` se lê. */
  unidade: Unidade | 'dias'
}

export function direcaoDaLinha(l: LinhaGrade): Direcao {
  if (l.tipo === 'conta') return l.conta.direcao
  if (l.tipo === 'calculado') return l.ind.direcao
  return 'neutra'
}

function dividir(num: number | null, den: number | null): number | null {
  if (num == null || den == null || Math.abs(den) < 1e-9) return null
  return num / den
}

export function medir(l: LinhaGrade, ag: Agregado, cat: Catalogo): Medida {
  if (l.tipo === 'secao') return { valor: null, pct: null, unidade: 'pct' }
  if (l.tipo === 'calculado') {
    return { valor: null, pct: l.ind.calcular(ag, cat), unidade: l.ind.unidade }
  }
  const c = l.conta
  const v = valorDe(ag, cat, c.indice)
  if (c.natureza === 'razao') return { valor: null, pct: v, unidade: c.unidade }
  if (c.natureza === 'saldo') {
    return { valor: v, pct: dividir(v, mediaMensalDe(ag, cat, INDICE_FATURAMENTO)), unidade: 'pct' }
  }
  return { valor: v, pct: dividir(v, valorDe(ag, cat, INDICE_FATURAMENTO)), unidade: 'pct' }
}

/**
 * A base em reais das Oportunidades em R$ numa linha: o que multiplica a
 * diferença de percentual para virar dinheiro. Nas contas em reais, o
 * faturamento; nas razões, o denominador delas; nos calculados, a base de cada
 * um. `null` quando a linha não tem "e se" (o próprio faturamento, os
 * informativos).
 */
export function baseDaOportunidade(l: LinhaGrade, ag: Agregado, cat: Catalogo): number | null {
  if (l.tipo === 'secao') return null
  if (l.tipo === 'calculado') return l.ind.base(ag, cat)
  const c = l.conta
  if (c.indice === INDICE_FATURAMENTO || c.direcao === 'neutra') return null
  if (c.natureza === 'saldo') return mediaMensalDe(ag, cat, INDICE_FATURAMENTO)
  if (c.natureza === 'razao') {
    // O denominador da razão, pelas mesmas parcelas da fórmula do catálogo.
    const def = RAZOES.get(c.indice)
    if (!def) return null
    return def.den.reduce((s, [indice, sinal]) => s + sinal * (valorDe(ag, cat, indice) ?? 0), 0)
  }
  return valorDe(ag, cat, INDICE_FATURAMENTO)
}

/** O texto da dica de composição de um indicador gerencial. */
export function textoDaComposicao(cat: Catalogo, indice: number): string | undefined {
  const partes = COMPOSICAO.get(indice)
  if (!partes) return undefined
  const linhas = partes.map(([i, sinal]) => {
    const c = cat.contas[cat.pos.get(i) ?? -1]
    return `${sinal < 0 ? '−' : '+'} ${c ? `${c.formatado} ${c.descricao}` : i}`
  })
  return `Composição:\n${linhas.join('\n')}`
}
