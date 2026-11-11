import type { Worksheet } from 'exceljs'
import { nomeDaPlanilha } from './exportar'
import type { Celula, Formato, Planilha } from './planilha'

// Gera e baixa o `.xlsx` de um cartão de gráfico. Porte do Dashboard de RH, a
// pedido do João (21/09/2026): o botão existe lá e faltava aqui.
//
// ── `exceljs`, E SÓ NO CLIQUE ───────────────────────────────────────────────
//
// O `conventions.md §15` da SDK prescreve `exceljs` para `.xlsx` e VETA o
// `xlsx`/SheetJS do npm. A lib é pesada e só serve a quem clica em baixar, então
// entra por `import()` dinâmico — o mesmo arranjo dos outros módulos do
// repositório.
//
// ── DUAS ABAS: OS DADOS E O DESENHO ─────────────────────────────────────────
//
// **Dados** tem os números em colunas, com número como número (ver
// `planilha.ts`). **Gráfico** tem a IMAGEM do gráfico como estava na tela: o
// `exceljs` não escreve gráfico nativo do Excel, e montar um à mão seria
// escrever o XML de desenho do Office. A imagem é o "gráfico parecido" que o
// pedido aceitava. Cartão que é tabela (sem SVG) leva só os dados.
//
// ── AS CORES DO DESENHO VIAJAM ESCRITAS NO SVG ──────────────────────────────
//
// O gráfico pinta por classe (`fill-muted-foreground`) e por variável de tema.
// Um SVG virado imagem não enxerga o CSS da página: sem copiar o estilo
// computado de cada elemento para o próprio elemento, a imagem sai preta ou
// vazia. O fundo é o do cartão, para o texto manter o contraste da tela.

/** Azul do cabeçalho — o mesmo dos outros módulos do repositório, em ARGB. */
const AZUL_CABECALHO = 'FFDBE9FF'
const CINZA_TEXTO = 'FF6B7280'
export const MIME_XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

const FORMATO_NUMERICO: Record<Formato, string | undefined> = {
  texto: undefined,
  inteiro: '#,##0',
  decimal: '#,##0.00',
  pct: '0.00%',
  pp: '0.00" p.p."',
  brl: 'R$ #,##0.00',
}

/** Primeira linha da tabela na aba Dados; as de cima são o título e o recorte. */
const LINHA_DO_CABECALHO = 4

export interface OpcoesDoArquivo {
  /** O título do cartão — vai na planilha e no nome do arquivo. */
  titulo: string
  /** O nome no arquivo, quando o título do cartão já traz o período. */
  tituloDoArquivo?: string
  periodo: string | null
  /** O desenho do cartão; `null` num cartão que é tabela. */
  grafico: SVGSVGElement | null
}

export async function baixarPlanilha(planilha: Planilha, o: OpcoesDoArquivo): Promise<void> {
  const [{ default: ExcelJS }, imagem] = await Promise.all([
    import('exceljs'),
    // Imagem que falha não derruba a planilha: os dados continuam valendo.
    o.grafico ? svgParaPng(o.grafico).catch(() => null) : Promise.resolve(null),
  ])

  const livro = new ExcelJS.Workbook()
  livro.creator = 'Dashboard de Contas'
  const dados = livro.addWorksheet('Dados', {
    views: [{ state: 'frozen', ySplit: LINHA_DO_CABECALHO }],
  })
  preencherDados(dados, planilha, o)

  if (imagem) {
    const aba = livro.addWorksheet('Gráfico')
    aba.getCell('A1').value = o.titulo
    aba.getCell('A1').font = { bold: true, size: 13 }
    aba.getCell('A2').value =
      'Imagem do gráfico como estava na tela ao baixar. Os números completos estão na aba Dados.'
    aba.getCell('A2').font = { color: { argb: CINZA_TEXTO }, italic: true }
    const id = livro.addImage({ base64: imagem.base64, extension: 'png' })
    const escala = Math.min(1, 960 / imagem.largura)
    aba.addImage(id, {
      tl: { col: 0, row: 3 },
      ext: { width: imagem.largura * escala, height: imagem.altura * escala },
    })
  }

  const buffer = await livro.xlsx.writeBuffer()
  baixarBlob(
    new Blob([buffer], { type: MIME_XLSX }),
    nomeDaPlanilha(o.tituloDoArquivo ?? o.titulo, o.periodo)
  )
}

function paraCelula(valor: Celula, formato: Formato): Celula {
  if (typeof valor !== 'number') return valor
  if (!Number.isFinite(valor)) return null
  // p.p. é a diferença entre dois percentuais guardados em fração: 0,031 são
  // 3,10 p.p. O formato do Excel não multiplica, então multiplica aqui.
  return formato === 'pp' ? valor * 100 : valor
}

function preencherDados(aba: Worksheet, p: Planilha, o: OpcoesDoArquivo): void {
  aba.getCell(1, 1).value = o.titulo
  aba.getCell(1, 1).font = { bold: true, size: 13 }
  aba.getCell(2, 1).value = o.periodo ? `Dashboard de Contas · ${o.periodo}` : 'Dashboard de Contas'
  aba.getCell(2, 1).font = { color: { argb: CINZA_TEXTO } }

  const cabecalho = aba.getRow(LINHA_DO_CABECALHO)
  p.colunas.forEach((c, j) => {
    const celula = cabecalho.getCell(j + 1)
    celula.value = c.titulo
    celula.font = { bold: true }
    celula.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AZUL_CABECALHO } }
    celula.alignment = { vertical: 'middle', wrapText: true }
  })

  p.linhas.forEach((linha, i) => {
    const row = aba.getRow(LINHA_DO_CABECALHO + 1 + i)
    linha.forEach((valor, j) => {
      const formato = p.colunas[j]?.formato ?? 'texto'
      const celula = row.getCell(j + 1)
      celula.value = paraCelula(valor, formato)
      const fmt = FORMATO_NUMERICO[formato]
      if (fmt) celula.numFmt = fmt
    })
  })

  if (p.linhas.length > 0) {
    aba.autoFilter = {
      from: { row: LINHA_DO_CABECALHO, column: 1 },
      to: { row: LINHA_DO_CABECALHO, column: p.colunas.length },
    }
  }

  const primeiraNota = LINHA_DO_CABECALHO + p.linhas.length + 2
  ;(p.notas ?? []).forEach((nota, k) => {
    const celula = aba.getCell(primeiraNota + k, 1)
    celula.value = nota
    celula.font = { color: { argb: CINZA_TEXTO }, italic: true }
  })

  // Largura pelo texto mais longo da coluna, com piso e teto: número em fração
  // ("0.144") é curto no texto e longo na tela ("14,40%"), daí o piso.
  p.colunas.forEach((c, j) => {
    const maior = Math.max(
      c.titulo.length,
      ...p.linhas.map((l) => (typeof l[j] === 'string' ? (l[j] as string).length : 12))
    )
    aba.getColumn(j + 1).width = Math.min(Math.max(maior + 2, 12), 60)
  })
}

/** Entrega o arquivo ao navegador, com o nome dado. */
export function baixarBlob(blob: Blob, nome: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nome
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// ─── O desenho do cartão ─────────────────────────────────────────────────────

/**
 * O SVG do gráfico dentro do corpo do cartão — o MAIOR deles. Ícones (16 px) e
 * os risquinhos de uma tabela (60 × 14 px) também são SVG; só o desenho passa do
 * piso. Cartão que é tabela não tem nenhum, e fica sem a aba Gráfico.
 */
export function graficoDoCartao(corpo: HTMLElement | null): SVGSVGElement | null {
  if (!corpo) return null
  let maior: SVGSVGElement | null = null
  let area = 0
  corpo.querySelectorAll('svg').forEach((svg) => {
    const r = svg.getBoundingClientRect()
    if (r.width * r.height > area) {
      area = r.width * r.height
      maior = svg
    }
  })
  return area >= 150 * 80 ? maior : null
}

/** As propriedades de desenho que a classe e o tema decidem, e a imagem precisa ver. */
const ESTILOS_DO_DESENHO = [
  'fill',
  'fill-opacity',
  'stroke',
  'stroke-width',
  'stroke-opacity',
  'stroke-linecap',
  'stroke-linejoin',
  'stroke-dasharray',
  'opacity',
  'font-family',
  'font-size',
  'font-weight',
  'visibility',
]

async function svgParaPng(
  svg: SVGSVGElement
): Promise<{ base64: string; largura: number; altura: number } | null> {
  const caixa = svg.getBoundingClientRect()
  const largura = Math.round(caixa.width)
  const altura = Math.round(caixa.height)
  if (largura < 40 || altura < 40) return null

  const copia = svg.cloneNode(true) as SVGSVGElement
  const origem = [svg, ...Array.from(svg.querySelectorAll('*'))]
  const destino = [copia, ...Array.from(copia.querySelectorAll('*'))]
  origem.forEach((el, i) => {
    const alvo = destino[i] as SVGElement | undefined
    if (!alvo?.style) return
    const estilo = getComputedStyle(el)
    for (const prop of ESTILOS_DO_DESENHO)
      alvo.style.setProperty(prop, estilo.getPropertyValue(prop))
  })
  copia.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  copia.setAttribute('width', String(largura))
  copia.setAttribute('height', String(altura))

  const xml = new XMLSerializer().serializeToString(copia)
  const imagem = new Image()
  await new Promise<void>((ok, falha) => {
    imagem.onload = () => ok()
    imagem.onerror = () => falha(new Error('imagem do gráfico'))
    imagem.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml)}`
  })

  // O dobro da resolução: no Excel a imagem é ampliada, e em 1× o texto borra.
  const escala = 2
  const canvas = document.createElement('canvas')
  canvas.width = largura * escala
  canvas.height = altura * escala
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.scale(escala, escala)
  const fundo = getComputedStyle(svg.closest('section') ?? document.body).backgroundColor
  ctx.fillStyle = !fundo || fundo === 'rgba(0, 0, 0, 0)' ? '#ffffff' : fundo
  ctx.fillRect(0, 0, largura, altura)
  ctx.drawImage(imagem, 0, 0, largura, altura)
  return { base64: canvas.toDataURL('image/png'), largura, altura }
}
