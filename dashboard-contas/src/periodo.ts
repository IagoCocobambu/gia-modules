import type { PeriodoDeMeses } from '@gia-cb/ui'

// O período do painel: de um mês até outro, no máximo 12, sempre comparado com o
// PERÍODO ANTERIOR do mesmo tamanho.
//
// ── UMA CONSULTA POR MÊS, E NÃO UMA VARREDURA ───────────────────────────────
//
// Cada mês chega pelo mesmo handler `contas`, com cache próprio. Um período de 12
// meses são 12 consultas do tamanho de um mês, mais as 12 do período anterior —
// nenhuma varre o ano inteiro de uma vez. E trocar de jan–jun para fev–jul só
// busca julho (e o mês novo do período anterior).

export const TETO_DE_MESES = 12

const MESES_NOME = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

export interface MesAno {
  ano: number
  mes: number
}

export function mesDoTexto(texto: string): MesAno {
  const [ano, mes] = texto.split('-').map(Number)
  return { ano: ano!, mes: mes! }
}

export function textoDoMes({ ano, mes }: MesAno): string {
  return `${ano}-${String(mes).padStart(2, '0')}`
}

export function emNumero({ ano, mes }: MesAno): number {
  return ano * 12 + (mes - 1)
}

export function doNumero(n: number): MesAno {
  return { ano: Math.floor(n / 12), mes: (n % 12) + 1 }
}

export function deslocarMes(m: MesAno, meses: number): MesAno {
  return doNumero(emNumero(m) + meses)
}

/** Os meses do período, do primeiro ao último. */
export function mesesDoPeriodo(periodo: PeriodoDeMeses): MesAno[] {
  const a = emNumero(mesDoTexto(periodo.de))
  const b = emNumero(mesDoTexto(periodo.ate))
  const meses: MesAno[] = []
  for (let n = Math.min(a, b); n <= Math.max(a, b); n += 1) meses.push(doNumero(n))
  return meses
}

/**
 * Contra o que o painel compara — escolha do usuário em **Comparar com**
 * (decisão do João, 21/09/2026).
 *
 * - `anterior`: a janela logo antes, do mesmo tamanho. É a leitura do
 *   fechamento mensal ("como foi ago contra jul").
 * - `ano`: o mesmo período um ano antes. É a leitura da sazonalidade — num
 *   restaurante, dezembro só se compara com dezembro.
 *
 * Num recorte de 12 meses as duas dão o mesmo período, e a escolha não muda nada.
 *
 * O ORÇADO não é uma opção daqui: ele mora na aba Análises adicionais (decisão
 * do João, 28/09/2026 — o que o painel ainda não tinha vai para aba própria).
 */
export type ModoDeComparacao = 'anterior' | 'ano'

/** Um período que começa em `inicio` (`YYYY-MM`) e tem `quantos` meses. */
export function periodoComTamanho(inicio: string, quantos: number): PeriodoDeMeses {
  const de = mesDoTexto(inicio)
  return { de: textoDoMes(de), ate: textoDoMes(deslocarMes(de, Math.max(1, quantos) - 1)) }
}

/**
 * O período de comparação: o mesmo número de meses, terminando no mês antes do
 * início (`anterior`) ou o mesmo intervalo um ano atrás (`ano`).
 *
 * jun/26 → mai/26 ou jun/25; jan–jun/26 → jul–dez/25 ou jan–jun/25.
 *
 * A aba Comparativos escolhe OUTRO período no modo "Período" — ali o começo é
 * do usuário e o tamanho vem de `periodoComTamanho`.
 */
export function periodoAnterior(
  periodo: PeriodoDeMeses,
  modo: ModoDeComparacao = 'anterior'
): PeriodoDeMeses {
  const meses = mesesDoPeriodo(periodo)
  if (modo === 'ano') {
    return {
      de: textoDoMes(deslocarMes(meses[0]!, -12)),
      ate: textoDoMes(deslocarMes(meses[meses.length - 1]!, -12)),
    }
  }
  const fim = deslocarMes(meses[0]!, -1)
  return { de: textoDoMes(deslocarMes(fim, -(meses.length - 1))), ate: textoDoMes(fim) }
}

/**
 * Aplica o teto de 12 meses a um período recém-escolhido. O `SeletorDeCompetencia`
 * não tem limite. Quem mexeu no INÍCIO tem o fim puxado para 12 meses depois
 * dele; quem mexeu no fim, o início — a ponta que o usuário acabou de escolher é
 * a que fica.
 */
export function limitarPeriodo(
  novo: PeriodoDeMeses,
  anterior: PeriodoDeMeses
): { periodo: PeriodoDeMeses; cortado: boolean } {
  if (mesesDoPeriodo(novo).length <= TETO_DE_MESES) return { periodo: novo, cortado: false }
  if (novo.de !== anterior.de) {
    const fim = deslocarMes(mesDoTexto(novo.de), TETO_DE_MESES - 1)
    return { periodo: { de: novo.de, ate: textoDoMes(fim) }, cortado: true }
  }
  const inicio = deslocarMes(mesDoTexto(novo.ate), -(TETO_DE_MESES - 1))
  return { periodo: { de: textoDoMes(inicio), ate: novo.ate }, cortado: true }
}

/** `jun/26` */
export function rotuloDoMes({ ano, mes }: MesAno): string {
  return `${MESES_NOME[mes - 1]!.slice(0, 3).toLowerCase()}/${String(ano).slice(2)}`
}

/** `jun/26`, ou `jan/26 a jun/26`. */
export function rotuloDoPeriodo(periodo: PeriodoDeMeses): string {
  const meses = mesesDoPeriodo(periodo)
  if (meses.length === 1) return rotuloDoMes(meses[0]!)
  return `${rotuloDoMes(meses[0]!)} a ${rotuloDoMes(meses[meses.length - 1]!)}`
}

/** `junho de 2026`, ou `jan/26 a jun/26`. */
export function rotuloLongoDoPeriodo(periodo: PeriodoDeMeses): string {
  const meses = mesesDoPeriodo(periodo)
  if (meses.length > 1) return rotuloDoPeriodo(periodo)
  return `${MESES_NOME[meses[0]!.mes - 1]!.toLowerCase()} de ${meses[0]!.ano}`
}

/** O que a variação compara: "vs. mês anterior" ou "vs. período anterior". */
export function rotuloDaVariacao(
  periodo: PeriodoDeMeses,
  modo: ModoDeComparacao = 'anterior'
): string {
  const umMes = mesesDoPeriodo(periodo).length === 1
  if (modo === 'ano')
    return umMes ? 'vs. mesmo mês do ano passado' : 'vs. mesmo período do ano passado'
  return umMes ? 'vs. mês anterior' : 'vs. período anterior'
}

/** O período como o padrão de arquivo do portal o escreve: `2026-08` ou `2026-01 a 2026-06`. */
export function periodoDoArquivo(periodo: PeriodoDeMeses): string {
  const meses = mesesDoPeriodo(periodo)
  if (meses.length === 1) return textoDoMes(meses[0]!)
  return `${textoDoMes(meses[0]!)} a ${textoDoMes(meses[meses.length - 1]!)}`
}

/** O que abre por padrão: um mês só, o anterior ao corrente — o último fechado. */
export function periodoPadrao(hoje = new Date()): PeriodoDeMeses {
  const d = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1)
  const mes = textoDoMes({ ano: d.getFullYear(), mes: d.getMonth() + 1 })
  return { de: mes, ate: mes }
}
