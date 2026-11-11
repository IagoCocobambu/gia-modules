import type { Cell, Worksheet } from 'exceljs'
import type { CartaoDoCaderno, LinhaDoCartao } from './analises'
import { baixarBlob, MIME_XLSX } from './baixar-planilha'
import { aFavor } from './comparacao'
import { nomeDaPlanilha } from './exportar'

// O CADERNO DA REUNIÃO em Excel — as abas GRUPO 1 a GRUPO 5 e PRINT RESUMO COA
// - ACUMULADO do BI mensal: o cartão de cada unidade, um embaixo do outro,
// pronto para imprimir.
//
// ── DUAS ABAS ───────────────────────────────────────────────────────────────
//
// **Caderno** é a folha de imprimir: um bloco por unidade (nome, cabeçalho e as
// sete linhas), A4 deitado, três blocos por página — a quebra vai entre os
// blocos, e nenhum cartão sai partido ao meio. **Tabela** tem os mesmos números
// numa tabela só, com a unidade em coluna, para filtrar e ordenar no Excel.
//
// Os números vão como NÚMERO, com o formato aplicado (percentual, p.p., R$), e
// a cor dos gaps é a da tela: verde a favor, vermelho contra.
//
// `exceljs` entra por `import()` só no clique, como em `baixar-planilha.ts`.

const AZUL_CABECALHO = 'FFDBE9FF'
const CINZA_CABECALHO = 'FFF3F4F6'
const CINZA_TEXTO = 'FF6B7280'
const CINZA_LINHA = 'FFE5E7EB'
const VERDE = 'FF15803D'
const VERMELHO = 'FFB91C1C'

const PCT = '0.00%'
/** Os gaps em pontos, com sinal: "+0,58 p.p.", "−1,20 p.p.". */
const PP = '+0.00" p.p.";"−"0.00" p.p.";0.00" p.p."'
/** O impacto em reais, com sinal e sem centavos. */
const IMPACTO = '+"R$ "#,##0;"−R$ "#,##0;"R$ "0'

/** Abaixo disto o impacto é ruído de centavos — o mesmo "—" da tela. */
const IMPACTO_MINIMO = 500
/** Blocos por página impressa. */
const POR_PAGINA = 3

const COLUNAS: ReadonlyArray<{ titulo: string; largura: number }> = [
  { titulo: 'Indicador', largura: 24 },
  { titulo: 'Realizado', largura: 12 },
  { titulo: 'Ano passado', largura: 12 },
  { titulo: 'Orçado', largura: 12 },
  { titulo: 'Média', largura: 12 },
  { titulo: 'Gap p/ média', largura: 14 },
  { titulo: 'Impacto R$', largura: 14 },
  { titulo: 'Melhor', largura: 12 },
  { titulo: 'Gap p/ melhor', largura: 14 },
  { titulo: 'Melhor loja', largura: 34 },
]

export interface OpcoesDoCaderno {
  periodo: string | null
  /** A linha de baixo do título: período e régua. */
  subtitulo: string
}

export async function baixarCaderno(
  cartoes: readonly CartaoDoCaderno[],
  o: OpcoesDoCaderno
): Promise<void> {
  const { default: ExcelJS } = await import('exceljs')
  const livro = new ExcelJS.Workbook()
  livro.creator = 'Dashboard de Contas'

  const caderno = livro.addWorksheet('Caderno', {
    pageSetup: {
      paperSize: 9,
      orientation: 'landscape',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: { left: 0.4, right: 0.4, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 },
    },
    views: [{ showGridLines: false }],
  })
  preencherCaderno(caderno, cartoes, o)

  const tabela = livro.addWorksheet('Tabela', { views: [{ state: 'frozen', ySplit: 1 }] })
  preencherTabela(tabela, cartoes)

  const buffer = await livro.xlsx.writeBuffer()
  baixarBlob(
    new Blob([buffer], { type: MIME_XLSX }),
    nomeDaPlanilha('Caderno da reunião', o.periodo)
  )
}

/** Os dez valores de uma linha do cartão, na ordem das colunas. */
function valores(l: LinhaDoCartao): Array<string | number | null> {
  return [
    l.rotulo,
    l.realizado,
    l.anoPassado,
    l.orcado,
    l.media,
    l.gapMedia == null ? null : l.gapMedia * 100,
    l.impacto != null && Math.abs(l.impacto) >= IMPACTO_MINIMO ? l.impacto : null,
    l.melhor,
    l.gapMelhor == null ? null : l.gapMelhor * 100,
    l.melhorUnidade,
  ]
}

const FORMATOS: ReadonlyArray<string | undefined> = [
  undefined,
  PCT,
  PCT,
  PCT,
  PCT,
  PP,
  IMPACTO,
  PCT,
  PP,
  undefined,
]

/** Verde a favor, vermelho contra — pela direção da linha, como na tela. */
function corDoGap(celula: Cell, v: number | null, l: LinhaDoCartao): void {
  if (v == null || Math.abs(v) < 0.005) return
  const favor = aFavor(v, l.direcao)
  if (favor != null) celula.font = { color: { argb: favor ? VERDE : VERMELHO } }
}

function escreverLinha(row: ReturnType<Worksheet['getRow']>, l: LinhaDoCartao): void {
  valores(l).forEach((v, j) => {
    const celula = row.getCell(j + 1)
    celula.value = v
    const fmt = FORMATOS[j]
    if (fmt) celula.numFmt = fmt
  })
  // O impacto positivo é o que a loja gasta a mais que a média: contra.
  const impacto = row.getCell(7)
  if (typeof impacto.value === 'number') {
    impacto.font = { color: { argb: impacto.value > 0 ? VERMELHO : VERDE } }
  }
  corDoGap(row.getCell(6), l.gapMedia == null ? null : l.gapMedia * 100, l)
  corDoGap(row.getCell(9), l.gapMelhor == null ? null : l.gapMelhor * 100, l)
}

function preencherCaderno(
  aba: Worksheet,
  cartoes: readonly CartaoDoCaderno[],
  o: OpcoesDoCaderno
): void {
  COLUNAS.forEach((c, j) => (aba.getColumn(j + 1).width = c.largura))

  aba.getCell(1, 1).value = 'Caderno da reunião — o cartão de cada loja'
  aba.getCell(1, 1).font = { bold: true, size: 14 }
  aba.getCell(2, 1).value = o.subtitulo
  aba.getCell(2, 1).font = { color: { argb: CINZA_TEXTO } }
  aba.getCell(3, 1).value =
    'Orçado: o Plano de Orçamentos de cada loja. Impacto R$: quanto o resultado mudaria se a linha tivesse o percentual da média — positivo é o que a loja gasta a mais.'
  aba.getCell(3, 1).font = { color: { argb: CINZA_TEXTO }, italic: true, size: 9 }

  let r = 5
  cartoes.forEach((cartao, k) => {
    // O nome da unidade, numa faixa da largura do cartão.
    aba.mergeCells(r, 1, r, COLUNAS.length)
    const titulo = aba.getCell(r, 1)
    titulo.value = cartao.titulo
    titulo.font = { bold: true, size: 12 }
    titulo.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AZUL_CABECALHO } }
    titulo.alignment = { vertical: 'middle' }
    aba.getRow(r).height = 20
    r += 1

    const cabecalho = aba.getRow(r)
    COLUNAS.forEach((c, j) => {
      const celula = cabecalho.getCell(j + 1)
      celula.value = c.titulo
      celula.font = { bold: true, size: 9, color: { argb: CINZA_TEXTO } }
      celula.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: CINZA_CABECALHO } }
      celula.alignment = { horizontal: j === 0 || j === 9 ? 'left' : 'right' }
    })
    r += 1

    for (const l of cartao.linhas) {
      const row = aba.getRow(r)
      escreverLinha(row, l)
      row.eachCell({ includeEmpty: true }, (celula) => {
        celula.border = { bottom: { style: 'thin', color: { argb: CINZA_LINHA } } }
      })
      r += 1
    }

    // Um cartão nunca é partido entre duas folhas: a quebra vai entre blocos.
    if ((k + 1) % POR_PAGINA === 0 && k < cartoes.length - 1) aba.getRow(r).addPageBreak()
    r += 1
  })
}

function preencherTabela(aba: Worksheet, cartoes: readonly CartaoDoCaderno[]): void {
  const titulos = ['Loja', ...COLUNAS.map((c) => c.titulo)]
  const cabecalho = aba.getRow(1)
  titulos.forEach((t, j) => {
    const celula = cabecalho.getCell(j + 1)
    celula.value = t
    celula.font = { bold: true }
    celula.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AZUL_CABECALHO } }
  })
  let r = 2
  for (const cartao of cartoes) {
    for (const l of cartao.linhas) {
      const row = aba.getRow(r)
      row.getCell(1).value = cartao.titulo
      valores(l).forEach((v, j) => {
        const celula = row.getCell(j + 2)
        celula.value = v
        const fmt = FORMATOS[j]
        if (fmt) celula.numFmt = fmt
      })
      r += 1
    }
  }
  aba.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: titulos.length } }
  aba.getColumn(1).width = 34
  COLUNAS.forEach((c, j) => (aba.getColumn(j + 2).width = c.largura))
}
