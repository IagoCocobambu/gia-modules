// A JANELA DE COLUNAS: quais colunas de uma grade larga valem ser desenhadas.
//
// ── POR QUE ISTO EXISTE ─────────────────────────────────────────────────────
//
// A aba Comparativos põe uma coluna por loja. Com a rede inteira são 89 colunas
// e 167 linhas de plano — e o `DataReport` desenha a tabela inteira, com todas
// as células no DOM, saiam elas na tela ou não. Medido em 22/09/2026: ~25 mil
// células, ~60 µs cada, 1,5 s para montar a aba e ~500 ms a cada conta aberta.
// O custo é por CÉLULA e cresce com as colunas — com 31 colunas o mesmo render
// custava 147 ms; com 387, 1,4 s.
//
// A grade não virtualiza colunas (a SDK usa `useVirtualizer` só na grade
// editável), então a janela é feita do lado do módulo: a aba passa ao
// `DataReport` apenas as colunas dentro da vista, mais DUAS COLUNAS VAZIAS —
// uma de cada ponta — com a largura exata do que ficou de fora. A barra de
// rolagem continua do mesmo tamanho, a posição de cada coluna não muda, e quem
// rola não percebe a troca.
//
// ── A FRAGILIDADE CONHECIDA ─────────────────────────────────────────────────
//
// As contas aqui usam a largura DECLARADA de cada coluna (`meta.width`), que no
// `DataReport` é um PISO e não uma medida fixa: cabeçalho comprido empurra a
// coluna além dele. Duas defesas: o cabeçalho da coluna de loja tem teto de
// largura, e a rolagem devolve a largura REAL da tabela, que vira uma escala
// sobre as contas (ver `use-janela-de-colunas`). A folga nas pontas absorve o
// resto.

/** O pedaço da lista de colunas que vale desenhar. */
export interface Janela {
  /** O primeiro bloco desenhado. */
  de: number
  /** O primeiro bloco DEPOIS da janela — exclusivo, como em `slice`. */
  ate: number
}

/** Onde a grade está na horizontal, em pixels. */
export interface Rolagem {
  /** O `scrollLeft` do container da grade. */
  esquerda: number
  /** A largura visível. Zero = ainda não medida. */
  vista: number
}

/**
 * Blocos de sobra em cada ponta. Cobrem a rolagem rápida, o erro das larguras
 * declaradas e o tempo entre o evento e o redesenho.
 */
const FOLGA = 3

/**
 * A janela anda de PASSO em PASSO blocos, e não de um em um: cada troca
 * redesenha as colunas da janela inteira, e recalcular a cada coluna que cruza
 * a borda tornaria a rolagem mais cara que a grade inteira.
 */
const PASSO = 6

/** A janela visível, com folga, para a rolagem atual. */
export function janelaDeColunas(
  larguras: readonly number[],
  /** Pixels ocupados ANTES do primeiro bloco — a coluna fixada da conta. */
  inicio: number,
  rolagem: Rolagem,
  folga = FOLGA,
  passo = PASSO
): Janela {
  const n = larguras.length
  const total = larguras.reduce((a, b) => a + b, inicio)
  // Sem medida ainda, ou a grade inteira cabe na tela: não há o que esconder, e
  // esconder o que cabe deixaria buraco à direita.
  if (rolagem.vista <= 0 || total <= rolagem.vista) return { de: 0, ate: n }

  const fim = rolagem.esquerda + rolagem.vista
  let primeiro = n
  let ultimo = -1
  let x = inicio
  for (let i = 0; i < n; i++) {
    const direita = x + larguras[i]!
    if (direita > rolagem.esquerda && x < fim) {
      if (i < primeiro) primeiro = i
      ultimo = i
    }
    x = direita
  }
  // Rolagem parada além do fim da lista — acontece no instante entre trocar as
  // colunas e o navegador encostar a rolagem no novo limite. Mostra a última
  // janela possível, em vez de nenhuma coluna.
  if (ultimo < 0) {
    primeiro = n - 1
    ultimo = n - 1
  }
  return {
    de: Math.max(0, Math.floor((primeiro - folga) / passo) * passo),
    ate: Math.min(n, Math.ceil((ultimo + 1 + folga) / passo) * passo),
  }
}

/**
 * A janela dentro dos limites de uma lista — as colunas podem ter mudado entre
 * a última rolagem e este desenho (um filtro tirou lojas, por exemplo).
 *
 * Com a lista mais curta que a janela, ela encosta no FIM em vez de ficar
 * vazia: janela vazia deixaria a grade só com a coluna da conta por um quadro,
 * e a piscada é visível.
 */
export function recortar(janela: Janela, quantos: number): Janela {
  if (quantos <= 0) return { de: 0, ate: 0 }
  const ate = Math.max(1, Math.min(janela.ate, quantos))
  return { de: Math.max(0, Math.min(janela.de, ate - 1)), ate }
}

/** A largura somada dos blocos de `de` até `ate` — o vazio de uma ponta. */
export function somaDeLarguras(larguras: readonly number[], de: number, ate: number): number {
  let soma = 0
  for (let i = Math.max(0, de); i < Math.min(ate, larguras.length); i++) soma += larguras[i]!
  return soma
}
