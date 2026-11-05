// Base dos gráficos do dashboard Operacional: cores, escala e o desenho das barras.
//
// Copiado do Dashboard do Plano de Contas (`dashboard-contas/src/graficos.ts`),
// só com o que os gráficos daqui usam.
//
// Os gráficos são SVG escritos à mão, e não de biblioteca: a `@gia-cb/ui` não tem
// componente de gráfico, e as bibliotecas pintam com cor própria e brigam com o
// tema do portal, que troca em tempo de execução por variável CSS. Com os tokens
// do design system, claro e escuro saem certos sem configuração.
//
// Barra de categoria (canal, etapa, quem cancelou) é de UMA cor só: o comprimento
// já é o valor, e colorir por magnitude gastaria o canal de identidade.

/**
 * A paleta categórica dos dashboards, NA ORDEM DE USO (pedido do usuário em
 * 05/11/2026): primeiro as cores PRIMÁRIAS (azul, vermelho, amarelo), depois as
 * SECUNDÁRIAS (verde, laranja, violeta), depois as TERCIÁRIAS (vermelho-alaranjado,
 * amarelo-alaranjado, amarelo-esverdeado, azul-esverdeado, azul-violeta,
 * vermelho-violeta). Um gráfico com N séries usa as N primeiras.
 *
 * Dentro das primárias, o azul vem antes: é a cor principal do portal e a da
 * série de destaque. Sempre via token do tema (com o hex de reserva).
 *
 * A cor nunca vai sozinha: toda série tem legenda com o nome, e o número está
 * escrito ao lado ou na dica. O amarelo tem pouco contraste sobre o fundo claro
 * (é marca, não texto); no tema escuro do portal os três primários se separam bem.
 */
export const PALETA = [
  // Primárias
  'var(--color-blue-500, #2b7fff)', // azul
  'var(--color-red-500, #fb2c36)', // vermelho
  'var(--color-yellow-400, #fdc700)', // amarelo
  // Secundárias
  'var(--color-green-500, #00c950)', // verde
  'var(--color-orange-500, #ff6900)', // laranja
  'var(--color-violet-500, #8e51ff)', // violeta
  // Terciárias
  'var(--color-orange-600, #f54900)', // vermelho-alaranjado
  'var(--color-amber-500, #fe9a00)', // amarelo-alaranjado
  'var(--color-lime-500, #7ccf00)', // amarelo-esverdeado
  'var(--color-teal-500, #00bba7)', // azul-esverdeado
  'var(--color-indigo-500, #615fff)', // azul-violeta
  'var(--color-fuchsia-600, #c800de)', // vermelho-violeta
] as const

/** Cores de dado. Sempre via token, para o tema trocar sozinho. */
export const COR = {
  /** A cor de dado padrão: uma série, magnitude, ranking. */
  serie: 'var(--color-primary)',
  /** Contexto: grade, eixo, série de fundo. Recessivo por definição. */
  recessiva: 'var(--color-border)',
  /** Marca sem destaque, quando outra marca é o assunto. */
  apagada: 'var(--color-muted-foreground)',
  // Os quatro valores do Tempo por etapa, pela ordem da PALETA e pela
  // importância do valor: a média (o número principal) leva a 1ª cor.
  /** Média — o número grande do cartão e o pedaço até ela. */
  media: PALETA[0],
  /** Mediana. */
  mediana: PALETA[1],
  /** Mínimo — o primeiro pedaço da barra. */
  extremos: PALETA[2],
  /** Máximo — o último pedaço da barra. */
  maximo: PALETA[3],
  /** Valor abaixo de zero numa barra de uma cor só. */
  negativa: 'var(--color-destructive)',
} as const

/**
 * Uma cor por grupo do Quem cancelou (a rosca), pela ordem da PALETA. Cada grupo
 * tem cor FIXA — a mesma em toda pesquisa —, na ordem em que os grupos aparecem
 * no Maestro.
 */
export const COR_QUEM_CANCELOU = {
  cliente: PALETA[0],
  loja: PALETA[1],
  ambos: PALETA[2],
  outro: PALETA[3],
} as const

/**
 * Uma cor por dia da semana, no gráfico de linhas do dia × hora, pela ordem da
 * PALETA a partir da segunda-feira. Chave = `getUTCDay()` em texto, a mesma das
 * linhas da grade. Quem identifica o dia é a legenda, que destaca a linha
 * escolhida, e a dica, que escreve o nome.
 */
export const COR_DIA_DA_SEMANA: Record<string, string> = {
  '1': PALETA[0],
  '2': PALETA[1],
  '3': PALETA[2],
  '4': PALETA[3],
  '5': PALETA[4],
  '6': PALETA[5],
  '0': PALETA[6],
}

/** Escala linear de domínio → faixa de pixels. */
export function escala(d0: number, d1: number, r0: number, r1: number) {
  const span = d1 - d0
  return (v: number) => (span === 0 ? r0 : r0 + ((v - d0) / span) * (r1 - r0))
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
