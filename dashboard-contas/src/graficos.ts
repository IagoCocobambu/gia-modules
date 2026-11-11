// Base dos gráficos do painel: paleta, escalas e eixos.
//
// Copiado do `dashboard-rh` (mesma base, mesmas correções de corte de rótulo e de
// marca de eixo) e acrescido do que o resultado financeiro pede: valores
// NEGATIVOS (lucro de loja no prejuízo) e três séries lado a lado.
//
// ── POR QUE OS GRÁFICOS SÃO ESCRITOS AQUI, E NÃO POR BIBLIOTECA ─────────────
//
// A `@gia-cb/ui` não tem componente de gráfico, e as bibliotecas grandes pintam
// com cor própria e brigam com o tema do portal, que troca em tempo de execução
// por variável CSS. Em SVG com os tokens do design system, claro e escuro saem
// certos sem configuração — e o bundle não cresce.
//
// ── A PALETA NÃO FOI ESCOLHIDA NO OLHO ──────────────────────────────────────
//
// As três séries da evolução (faturamento, despesas, lucro) passaram pelo
// validador de paleta da skill de visualização em 18/09/2026, nos dois temas
// (superfície clara #ffffff, escura #0b121a), em TODOS os pares — não só os
// vizinhos, porque as colunas se cruzam com as linhas:
//
//   • azul-500 · laranja-600 · teal-600 — PASSA: pior par sob daltonismo ΔE 14,8
//     (teal × laranja, protanopia), visão normal ΔE 20,7, contraste ≥ 3:1.
//   • azul · laranja · violeta-600 — só no limite (ΔE 6,3 violeta × azul, que
//     exige rótulo em toda marca). Descartada.
//   • azul-600 · laranja-500 · esmeralda-600 — reprova no tema escuro (o laranja
//     sai da faixa de luminosidade). Descartada.
//
// As cores vão por variável do tema com o hexadecimal validado como reserva: se o
// host não emitir a variável, a cor continua a mesma que passou no validador.
//
// Barra de categoria nominal (loja, região) continua de UMA cor só: o comprimento
// já é o valor, e colorir por magnitude gasta o canal de identidade.

/** Cores de dado. Sempre via token, para o tema trocar sozinho. */
export const COR = {
  /** A cor de dado padrão: uma série, magnitude, ranking. */
  serie: 'var(--color-primary)',
  /** Faturamento, nas séries da evolução. */
  faturamento: 'var(--color-blue-500, #2b7fff)',
  /** Despesas totais. */
  despesas: 'var(--color-orange-600, #f54900)',
  /** Lucro líquido. */
  lucro: 'var(--color-teal-600, #009689)',
  /** Contexto: grade, eixo, série de fundo. Recessivo por definição. */
  recessiva: 'var(--color-border)',
  /** Marca sem destaque, quando outra marca é o assunto. */
  apagada: 'var(--color-muted-foreground)',
  /** Valor abaixo de zero numa barra de uma cor só. */
  negativa: 'var(--color-destructive)',
  /** Superfície — usada nos vãos e anéis que separam marcas. */
  superficie: 'var(--color-surface)',
} as const

/** Escala linear de domínio → faixa de pixels. */
export function escala(d0: number, d1: number, r0: number, r1: number) {
  const span = d1 - d0
  return (v: number) => (span === 0 ? r0 : r0 + ((v - d0) / span) * (r1 - r0))
}

/**
 * Marcas de eixo em números redondos (1, 2, 2,5, 5 × potência de 10).
 *
 * Eixo com marca quebrada (`3,7142`) obriga o leitor a decodificar a régua
 * antes de ler o dado. As marcas carregam os valores que não foram rotulados
 * diretamente, então elas precisam ser lidas de relance.
 */
export function marcasDeEixo(max: number, alvo = 4): number[] {
  if (!Number.isFinite(max) || max <= 0) return [0]
  const bruto = max / alvo
  const potencia = 10 ** Math.floor(Math.log10(bruto))
  const norm = bruto / potencia
  const passo = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * potencia
  if (!Number.isFinite(passo) || passo <= 0) return [0, max]

  // O arredondamento tira o lixo de ponto flutuante do acumulador (0,30000000004),
  // mas a casa fixa colapsa grandeza pequena: com passo de 1e-12, `toFixed(10)`
  // devolve zero em TODAS as marcas — eixo com quatro zeros, e chave repetida
  // no React. Arredondar em casas RELATIVAS ao passo resolve os dois.
  const casas = Math.max(0, Math.min(20, -Math.floor(Math.log10(passo)) + 2))
  const marcas: number[] = []
  for (let v = 0; v <= max + passo * 0.001; v += passo) {
    const m = Number(v.toFixed(casas))
    if (marcas.length === 0 || m !== marcas[marcas.length - 1]) marcas.push(m)
  }
  return marcas
}

/**
 * O domínio de um eixo que COMEÇA NOS DADOS, e não no zero, com folga dos dois
 * lados.
 *
 * Serve à dispersão, que compara POSIÇÃO e não comprimento. Com o eixo no zero,
 * lojas entre R$ 13 mil e R$ 15 mil de faturamento por funcionário ficavam
 * espremidas num canto de um gráfico que ia de zero a R$ 15 mil (relato do João,
 * 15/09/2026). Dado todo positivo não ganha eixo negativo.
 */
export function dominioDosDados(valores: number[], folga = 0.12): [number, number] {
  const v = valores.filter((n) => Number.isFinite(n))
  if (v.length === 0) return [0, 1]
  const min = Math.min(...v)
  const max = Math.max(...v)
  const amplitude = max - min || Math.abs(max) * 0.2 || 1
  const inicio = min - amplitude * folga
  return [min >= 0 && inicio < 0 ? 0 : inicio, max + amplitude * folga]
}

/**
 * Marcas redondas dentro de `[inicio, fim]` — a versão de `marcasDeEixo` para
 * eixo que não começa no zero.
 */
export function marcasNoIntervalo(inicio: number, fim: number, alvo = 4): number[] {
  const marcas = marcasComPasso(inicio, fim, alvo)
  // Intervalo estreito pode caber uma marca só, e eixo com um número não é régua:
  // passo menor até aparecerem ao menos duas.
  return marcas.length >= 2 || alvo >= 16 ? marcas : marcasNoIntervalo(inicio, fim, alvo * 2)
}

function marcasComPasso(inicio: number, fim: number, alvo: number): number[] {
  const amplitude = fim - inicio
  if (!Number.isFinite(amplitude) || amplitude <= 0) return [inicio]
  const bruto = amplitude / alvo
  const potencia = 10 ** Math.floor(Math.log10(bruto))
  const norm = bruto / potencia
  const passo = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * potencia
  const casas = Math.max(0, Math.min(20, -Math.floor(Math.log10(passo)) + 2))
  const marcas: number[] = []
  for (let v = Math.ceil(inicio / passo) * passo; v <= fim + passo * 0.001; v += passo) {
    const m = Number(v.toFixed(casas)) || 0
    if (marcas.length === 0 || m !== marcas[marcas.length - 1]) marcas.push(m)
  }
  return marcas
}

/**
 * Um eixo que SEMPRE contém o zero, com as pontas arredondadas para marcas
 * redondas — para barra e coluna que crescem da linha do zero, com valor
 * negativo (lucro de loja no prejuízo) do outro lado dela.
 *
 * As pontas vão até a marca redonda seguinte: sem isso a maior coluna encostaria
 * no topo do desenho e o rótulo do eixo mais alto ficaria abaixo dela.
 *
 * A EXCEÇÃO é o lado negativo menor que um passo: ele para no quarto de passo
 * seguinte, sem marca. Com a marca cheia, o lucro de −5 mi da rede em jan/26
 * reservava um quarto do gráfico (até −100 mi) para uma coluna de 4 px
 * (18/09/2026).
 */
export function eixoComZero(
  valores: number[],
  alvo = 4
): { inicio: number; fim: number; marcas: number[] } {
  const v = valores.filter((n) => Number.isFinite(n))
  const min = Math.min(0, ...v)
  const max = Math.max(0, ...v)
  if (min === max) return { inicio: 0, fim: 1, marcas: [0, 1] }
  const bruto = (max - min) / alvo
  const potencia = 10 ** Math.floor(Math.log10(bruto))
  const norm = bruto / potencia
  const passo = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * potencia
  const quarto = passo / 4
  const inicio =
    min < 0 && -min < passo ? Math.floor(min / quarto) * quarto : Math.floor(min / passo) * passo
  const fim = Math.ceil(max / passo) * passo
  const casas = Math.max(0, Math.min(20, -Math.floor(Math.log10(passo)) + 2))
  const marcas: number[] = []
  const primeira = Math.ceil(inicio / passo - 1e-9) * passo
  for (let x = primeira; x <= fim + passo * 0.001; x += passo) {
    const m = Number(x.toFixed(casas)) || 0
    if (marcas.length === 0 || m !== marcas[marcas.length - 1]) marcas.push(m)
  }
  return { inicio, fim, marcas }
}

/**
 * A coluna de rótulos e a margem do valor de um gráfico de barras deitadas,
 * conforme a largura disponível.
 *
 * As duas eram fixas (132 px de nome + 76 px de valor). Num cartão de celular,
 * de ~290 px, sobravam 82 px para a barra: todas as lojas viravam risquinhos do
 * mesmo tamanho e o gráfico deixava de responder à pergunta (relato do João,
 * 16/09/2026). Proporcional com teto, o mesmo cartão passa a ter 127 px de
 * barra, e no desktop nada muda — o teto é o valor de antes.
 */
export function faixasDaBarra(largura: number, rotuloCheio = 132, direitaCheia = 76) {
  const rotulo = Math.max(72, Math.min(rotuloCheio, Math.round(largura * 0.34)))
  const direita = Math.max(44, Math.min(direitaCheia, Math.round(largura * 0.22)))
  return { rotulo, direita }
}

/** Largura em pixels de um texto em `text-[11px]`, medida uma vez por nome. */
const LARGURA_MEDIDA = new Map<string, number>()
/** `undefined` = ainda não tentou; `null` = não há canvas (teste, servidor). */
let pincel: CanvasRenderingContext2D | null | undefined

export function larguraDoTexto(texto: string): number {
  if (pincel === undefined) {
    const canvas = typeof document === 'undefined' ? null : document.createElement('canvas')
    pincel = canvas?.getContext('2d') ?? null
    if (pincel) {
      // A mesma fonte da página: medir com outra família erra o suficiente para
      // o corte voltar a estourar.
      const familia = getComputedStyle(document.body).fontFamily || 'sans-serif'
      pincel.font = `11px ${familia}`
    }
  }
  if (!pincel) return texto.length * 6.6
  const guardada = LARGURA_MEDIDA.get(texto)
  if (guardada != null) return guardada
  const medida = pincel.measureText(texto).width
  LARGURA_MEDIDA.set(texto, medida)
  return medida
}

/**
 * Corta o nome no que CABE em `larguraMax` pixels, com reticências.
 *
 * ☠️ Isto já foi por CONTAGEM DE LETRAS, com "~6 px por letra". Seis é média
 * otimista: em `text-[11px]`, nome cheio de glifo largo passa de 6,8 px. Numa
 * coluna de 124 px o corte dava 20 letras ≈ 136 px, e o nome invadia a faixa das
 * barras — "CTO CAMPINAS SHOPPI…" ficava por cima da própria barra (relato do
 * João, 16/09/2026). Estimativa não garante; medida garante, e o cache faz cada
 * nome ser medido uma vez só.
 */
export function encurtarRotulo(nome: string, larguraMax: number): string {
  if (larguraMax <= 0) return ''
  if (larguraDoTexto(nome) <= larguraMax) return nome
  let corte = nome.length
  while (corte > 1 && larguraDoTexto(`${nome.slice(0, corte - 1)}…`) > larguraMax) corte -= 1
  return `${nome.slice(0, Math.max(corte - 1, 1))}…`
}

/** Caminho SVG de uma polilinha, pulando pontos sem valor. */
export function caminhoDeLinha(pontos: Array<{ x: number; y: number | null }>): string {
  let d = ''
  let abriu = false
  for (const p of pontos) {
    if (p.y === null || !Number.isFinite(p.y)) {
      abriu = false
      continue
    }
    d += `${abriu ? 'L' : 'M'}${p.x.toFixed(2)} ${p.y.toFixed(2)} `
    abriu = true
  }
  return d.trim()
}

/**
 * Retângulo com as duas pontas do "fim do dado" arredondadas e a base reta.
 *
 * A barra cresce de uma linha-base; arredondar os quatro cantos descolaria a
 * marca dessa base e faria barra curta parecer pastilha solta. `horizontal`
 * arredonda a direita; senão, o topo.
 */
export function barraArredondada(
  x: number,
  y: number,
  largura: number,
  altura: number,
  raio = 4,
  horizontal = true
): string {
  const r = Math.max(0, Math.min(raio, horizontal ? largura : altura))
  if (r === 0 || largura <= 0 || altura <= 0) {
    return `M${x} ${y}h${Math.max(largura, 0)}v${Math.max(altura, 0)}h${-Math.max(largura, 0)}Z`
  }
  if (horizontal) {
    return `M${x} ${y}h${largura - r}a${r} ${r} 0 0 1 ${r} ${r}v${altura - 2 * r}a${r} ${r} 0 0 1 ${-r} ${r}h${-(largura - r)}Z`
  }
  return `M${x} ${y + r}a${r} ${r} 0 0 1 ${r} ${-r}h${largura - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${altura - r}h${-largura}Z`
}

/** Mediana de uma amostra; `null` para amostra vazia. */
export function mediana(valores: number[]): number | null {
  const v = valores.filter((n) => Number.isFinite(n)).sort((a, b) => a - b)
  if (v.length === 0) return null
  const meio = Math.floor(v.length / 2)
  return v.length % 2 ? v[meio] : (v[meio - 1] + v[meio]) / 2
}

/**
 * Quais meses de um eixo ganham rótulo, na largura disponível.
 *
 * Cabendo todos, todos. Não cabendo, de N em N A PARTIR DO ÚLTIMO — o último mês
 * é o fim do período escolhido, o que o leitor mais procura. Distribuir "por
 * igual" entre as pontas (a regra do RH) arredondava o passo e sumia com UM mês
 * no meio (fev/26 faltando numa fila de onze), o que parece defeito.
 */
export function mesesRotulados(n: number, largura: number, porRotulo = 44): Set<number> {
  if (n <= 0) return new Set()
  const cabem = Math.max(1, Math.floor(largura / porRotulo))
  if (cabem >= n) return new Set(Array.from({ length: n }, (_, i) => i))
  const passo = Math.ceil(n / cabem)
  const saida = new Set<number>()
  for (let i = n - 1; i >= 0; i -= passo) saida.add(i)
  return saida
}
