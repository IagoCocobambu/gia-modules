// PDF "Totais por canal" (0.4.5, pedido da diretoria em 17/11/2026): para cada
// canal da pesquisa, o painel da seção de totais como na tela — o anel com a fatia
// do canal e os 12 indicadores só dos pedidos dele.
//
// Visual do padrão 17 do ../AGENTS.md (PDF gerado pelo módulo): A4 retrato, margem
// 12,7 mm, cabeçalho com título no acento e linha de acento, uma faixa de seção
// por canal, rodapé "GIA · <módulo> · <loja> · <período>" com "Página X de Y".
// O SDK não tem PDF (alpha.71): jsPDF em vetor, por `import()` dinâmico (fora do
// bundle inicial, como o exceljs), baixado direto (funciona igual no celular,
// conventions §11). O nome segue o `nomeArquivoExport` do SDK.

import { nomeArquivoExport } from '@gia-cb/ui'
import type { jsPDF } from 'jspdf'
import {
  canalDoPedido,
  dataHoraSp,
  formatBRL,
  formatDataHora,
  NOME_MODULO,
  periodoArquivo,
  resumirTotais,
  vendasPorCanal,
} from './helpers'
import { INDICADORES, type Tom } from './indicadores'
import type { Consulta, PedidoFechamento, VendaCanal } from './types'

// ─── Cores do padrão 17 (só estas) ─────────────────────────────────────────────
// O PDF é sempre claro (vai para impressão), mesmo com o portal no escuro.

type Rgb = [number, number, number]

function hex(h: string): Rgb {
  return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) as Rgb
}

const COR = {
  /** Título, linha do cabeçalho, título de seção, destaques. */
  acento: hex('#3783ff'),
  /** Faixa da seção. */
  faixa: hex('#dbe8ff'),
  /** Texto principal e valores. */
  texto: hex('#1f2937'),
  /** Texto secundário: contexto, rodapé, legendas. */
  secundario: hex('#6b7280'),
  /** Bordas de caixas e divisórias. */
  linha: hex('#d1d6db'),
  /** Fundo claro (o anel sem venda). */
  zebra: hex('#f5f7fa'),
  branco: hex('#ffffff'),
}

/**
 * Tom do indicador no papel. Cor de sentido (positivo, alerta, erro) com os tons do
 * tema claro do @gia-cb/ui; os de pagamento (info/primary na tela) ficam no acento;
 * o neutro, no texto principal.
 */
const COR_TOM: Record<Tom, Rgb> = {
  neutro: COR.secundario,
  success: hex('#3aa85b'),
  info: COR.acento,
  primary: COR.acento,
  warning: hex('#dc8900'),
  destructive: hex('#e62b34'),
}

/** Valor do indicador: neutro fica na cor do texto, como na tela. */
const COR_VALOR: Record<Tom, Rgb> = { ...COR_TOM, neutro: COR.texto }

/**
 * Cor de cada canal no anel: a mesma da tela (`PainelCanais` e `BadgeOrigemPedido`),
 * tema claro do @gia-cb/ui. Exceção às cores do padrão 17 pedida pelo usuário em
 * 17/11/2026: a rosca do PDF segue a da tela.
 */
const COR_CANAL: Record<string, Rgb> = {
  'app coco bambu': hex('#1c67e9'), // accent-group
  ifood: hex('#ef4a6e'), // accent-exception
  '99food': hex('#dc8900'), // accent-role
}
const COR_OUTROS_CANAIS = hex('#656e79') // muted-foreground

function corDoCanal(canal: string): Rgb {
  return COR_CANAL[canal.trim().toLowerCase()] ?? COR_OUTROS_CANAIS
}

/** `cor` com `fracao` de opacidade sobre o branco (o PDF não precisa de transparência). */
function sobreBranco(cor: Rgb, fracao: number): Rgb {
  return cor.map((c) => Math.round(255 - (255 - c) * fracao)) as Rgb
}

/** pt → mm (espessura de linha). */
const PT = 25.4 / 72

// ─── Medidas (mm) ─────────────────────────────────────────────────────────────

const MARGEM = 12.7
/** Linha de base do rodapé, a partir da borda de baixo. */
const RODAPE = 6
/** Respiro antes da faixa da seção, a faixa e o espaço até o card. */
const RESPIRO_SECAO = 5
const FAIXA_ALTURA = 7
const FAIXA_CARD = 2
const CARD_ALTURA = 45
const ANEL_LARGURA = 46
const ANEL_RAIO = 18
/** Mesma proporção do anel da tela (raio 50, traço 16: 42 → 58). */
const ANEL_RAIO_INTERNO = ANEL_RAIO * (42 / 58)
/** Respiro entre fatias e fatia mínima visível, em % do anel (como na tela). */
const RESPIRO = 0.8
const MINIMO = 0.6
const COLUNAS = 4

// ─── Texto ────────────────────────────────────────────────────────────────────

/** O Helvetica do PDF não tem espaço fino; o Intl põe NBSP no "R$ 1,00". */
function limpo(texto: string): string {
  return texto.replace(/[\u00a0\u202f]/g, ' ')
}

/** Corta com "…" até caber em `largura`. */
function caber(doc: jsPDF, texto: string, largura: number): string {
  let t = limpo(texto)
  if (doc.getTextWidth(t) <= largura) return t
  while (t.length > 1 && doc.getTextWidth(`${t}…`) > largura) t = t.slice(0, -1)
  return `${t.trimEnd()}…`
}

/** Diminui a fonte (até `minimo`) para o texto caber em `largura`. */
function ajustarFonte(doc: jsPDF, texto: string, largura: number, tamanho: number, minimo: number) {
  let t = tamanho
  doc.setFontSize(t)
  while (t > minimo && doc.getTextWidth(texto) > largura) {
    t -= 0.5
    doc.setFontSize(t)
  }
}

function formatPct(fracao: number): string {
  const pct = fracao * 100
  if (pct > 0 && pct < 1) return '<1%'
  return `${Math.round(pct)}%`
}

function plural(n: number, um: string, varios: string): string {
  return `${n.toLocaleString('pt-BR')} ${n === 1 ? um : varios}`
}

// ─── Desenho ──────────────────────────────────────────────────────────────────

/** Fatia do anel de `inicio` a `fim` (% do anel, 0 no topo, sentido horário). */
function fatia(doc: jsPDF, cx: number, cy: number, inicio: number, fim: number, cor: Rgb) {
  const passos = Math.max(2, Math.ceil((fim - inicio) / 0.5))
  const ponto = (pct: number, r: number): [number, number] => {
    const ang = (pct / 100) * 2 * Math.PI - Math.PI / 2
    return [cx + r * Math.cos(ang), cy + r * Math.sin(ang)]
  }
  doc.setFillColor(...cor)
  const [x0, y0] = ponto(inicio, ANEL_RAIO)
  doc.moveTo(x0, y0)
  for (let i = 1; i <= passos; i++)
    doc.lineTo(...ponto(inicio + ((fim - inicio) * i) / passos, ANEL_RAIO))
  for (let i = passos; i >= 0; i--)
    doc.lineTo(...ponto(inicio + ((fim - inicio) * i) / passos, ANEL_RAIO_INTERNO))
  doc.close()
  doc.fill()
}

/** O anel de todos os canais com `destaque` aceso e os outros apagados. */
function anel(
  doc: jsPDF,
  cx: number,
  cy: number,
  canais: VendaCanal[],
  total: number,
  destaque: string
) {
  fatia(doc, cx, cy, 0, 100, hex('#f1f4f7')) // muted, como o fundo do anel na tela
  const respiro = canais.filter((c) => c.valor > 0).length > 1 ? RESPIRO : 0
  let inicio = 0
  for (const c of canais) {
    const fracao = total > 0 ? Math.max(c.valor, 0) / total : 0
    if (c.valor > 0) {
      const tamanho = Math.max(fracao * 100 - respiro, MINIMO)
      // Canal da seção aceso; os outros apagados (30%), como na tela.
      const cor = c.canal === destaque ? corDoCanal(c.canal) : sobreBranco(corDoCanal(c.canal), 0.3)
      fatia(doc, cx, cy, inicio, inicio + tamanho, cor)
    }
    inicio += fracao * 100
  }
}

/** Um indicador: quadradinho tingido, valor na cor do tom e o rótulo embaixo. */
function indicador(
  doc: jsPDF,
  x: number,
  y: number,
  largura: number,
  rotulo: string,
  valor: string,
  tom: Tom
) {
  const lado = 6
  doc.setFillColor(...sobreBranco(COR_TOM[tom], 0.12))
  doc.roundedRect(x, y + 0.5, lado, lado, 1.2, 1.2, 'F')
  doc.setFillColor(...COR_TOM[tom])
  doc.circle(x + lado / 2, y + 0.5 + lado / 2, 1, 'F')

  const tx = x + lado + 2
  const tl = largura - lado - 3
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...COR_VALOR[tom])
  ajustarFonte(doc, limpo(valor), tl, 10, 7)
  doc.text(limpo(valor), tx, y + 3.4)

  // Rótulo em até 2 linhas, como no celular: no papel não há dica para ler o resto.
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...COR.secundario)
  const linhas = (doc.splitTextToSize(rotulo, tl) as string[]).slice(0, 2)
  doc.text(linhas, tx, y + 6.6, { lineHeightFactor: 1.15 })
}

interface SecaoCanal {
  venda: VendaCanal
  pedidos: PedidoFechamento[]
}

/** Altura de uma seção de canal: respiro, faixa, espaço e card. */
const ALTURA_SECAO = RESPIRO_SECAO + FAIXA_ALTURA + FAIXA_CARD + CARD_ALTURA

function secaoDoCanal(
  doc: jsPDF,
  y: number,
  secao: SecaoCanal,
  canais: VendaCanal[],
  total: number,
  totalPedidos: number
) {
  const largura = doc.internal.pageSize.getWidth() - 2 * MARGEM
  const { venda, pedidos } = secao

  // Faixa da seção: o nome do canal, 9 pt negrito, acento, maiúsculas.
  const yFaixa = y + RESPIRO_SECAO
  doc.setFillColor(...COR.faixa)
  doc.rect(MARGEM, yFaixa, largura, FAIXA_ALTURA, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...COR.acento)
  doc.text(
    caber(doc, venda.canal.toLocaleUpperCase('pt-BR'), largura - 4),
    MARGEM + 2,
    yFaixa + FAIXA_ALTURA / 2,
    { baseline: 'middle' }
  )

  const yCard = yFaixa + FAIXA_ALTURA + FAIXA_CARD
  doc.setDrawColor(...COR.linha)
  doc.setLineWidth(0.5 * PT)
  doc.setFillColor(...COR.branco)
  doc.roundedRect(MARGEM, yCard, largura, CARD_ALTURA, 1.5, 1.5, 'FD')

  // Anel + miolo (nome, valor, % e pedidos do canal).
  const cx = MARGEM + ANEL_LARGURA / 2
  const cy = yCard + CARD_ALTURA / 2
  anel(doc, cx, cy, canais, total, venda.canal)
  const miolo = ANEL_RAIO_INTERNO * 2 - 3
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  doc.setTextColor(...COR.secundario)
  doc.text(caber(doc, venda.canal, miolo), cx, cy - 3, { align: 'center' })
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...COR.texto)
  const valorCanal = limpo(formatBRL(venda.valor))
  ajustarFonte(doc, valorCanal, miolo, 8.5, 6)
  doc.text(valorCanal, cx, cy + 0.6, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6)
  doc.setTextColor(...COR.secundario)
  const fracao = total > 0 ? Math.max(venda.valor, 0) / total : 0
  doc.text(
    caber(doc, `${formatPct(fracao)} · ${plural(venda.pedidos, 'pedido', 'pedidos')}`, miolo),
    cx,
    cy + 3.8,
    { align: 'center' }
  )

  // Divisória entre o anel e os indicadores.
  const xGrade = MARGEM + ANEL_LARGURA
  doc.setDrawColor(...COR.linha)
  doc.line(xGrade, yCard + 3, xGrade, yCard + CARD_ALTURA - 3)

  // Aviso do recorte, como na tela: "Totais só de iFood · 65 de 91 pedidos".
  const x0 = xGrade + 4
  const larguraGrade = MARGEM + largura - 3 - x0
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...COR.secundario)
  doc.text(
    caber(
      doc,
      `Totais só de ${venda.canal} · ${pedidos.length.toLocaleString('pt-BR')} de ${plural(totalPedidos, 'pedido', 'pedidos')}`,
      larguraGrade
    ),
    x0,
    yCard + 6
  )

  // Os 12 indicadores do canal, 4 por linha.
  const totais = resumirTotais(pedidos)
  const coluna = larguraGrade / COLUNAS
  const yGrade = yCard + 9.5
  const linha = (CARD_ALTURA - 9.5 - 2.5) / Math.ceil(INDICADORES.length / COLUNAS)
  INDICADORES.forEach((i, n) => {
    indicador(
      doc,
      x0 + (n % COLUNAS) * coluna,
      yGrade + Math.floor(n / COLUNAS) * linha,
      coluna,
      i.rotulo,
      i.valor(totais, formatBRL),
      i.tom(totais)
    )
  })
}

function periodoTexto(consulta: Consulta): string {
  return consulta.de === consulta.ate
    ? formatDataHora(consulta.de)
    : `${formatDataHora(consulta.de)} a ${formatDataHora(consulta.ate)}`
}

/** Cabeçalho da 1ª página. Devolve onde o conteúdo começa. */
function cabecalho(doc: jsPDF, consulta: Consulta, geradoEm: Date, totalPedidos: number): number {
  const largura = doc.internal.pageSize.getWidth() - 2 * MARGEM
  let y = MARGEM + 5
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.setTextColor(...COR.acento)
  doc.text(NOME_MODULO, MARGEM, y)

  y += 5.5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...COR.secundario)
  doc.text('Totais por canal · valores de venda sem os cancelados', MARGEM, y)

  // Contexto: loja · período · pedidos · gerado em (horário de São Paulo).
  y += 5.5
  doc.setFontSize(9)
  const contexto = [
    limpo(consulta.lojaNome),
    periodoTexto(consulta),
    `${plural(totalPedidos, 'pedido', 'pedidos')} na pesquisa`,
    `Gerado em ${dataHoraSp(geradoEm)}`,
  ].join(' · ')
  const linhas = doc.splitTextToSize(contexto, largura) as string[]
  doc.text(linhas, MARGEM, y, { lineHeightFactor: 1.3 })
  y += (linhas.length - 1) * 9 * 1.3 * PT + 3

  doc.setDrawColor(...COR.acento)
  doc.setLineWidth(1.2 * PT)
  doc.line(MARGEM, y, MARGEM + largura, y)
  return y
}

/** Topo das páginas seguintes: só a linha de continuação. */
function continuacao(doc: jsPDF, consulta: Consulta): number {
  const largura = doc.internal.pageSize.getWidth() - 2 * MARGEM
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...COR.secundario)
  doc.text(
    caber(doc, `${NOME_MODULO} - ${consulta.lojaNome} - Totais por canal (continuação)`, largura),
    MARGEM,
    MARGEM + 2
  )
  return MARGEM + 2
}

/** Rodapé em todas as páginas, desenhado no fim para ter o total. */
function rodapes(doc: jsPDF, consulta: Consulta) {
  const paginas = doc.getNumberOfPages()
  const largura = doc.internal.pageSize.getWidth()
  const y = doc.internal.pageSize.getHeight() - RODAPE
  for (let p = 1; p <= paginas; p++) {
    doc.setPage(p)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...COR.secundario)
    const pagina = `Página ${p} de ${paginas}`
    doc.text(pagina, largura - MARGEM, y, { align: 'right' })
    doc.text(
      caber(
        doc,
        `GIA · ${NOME_MODULO} · ${consulta.lojaNome} · ${periodoTexto(consulta)}`,
        largura - 2 * MARGEM - doc.getTextWidth(pagina) - 5
      ),
      MARGEM,
      y
    )
  }
}

/**
 * Gera e baixa o PDF com um painel por canal (do maior para o menor, como o
 * anel). Usa os pedidos da pesquisa inteira — o canal escolhido, o filtro dos
 * indicadores e o "Só divergências" da tela não mudam o PDF.
 */
export async function exportarPdfCanais(pedidos: PedidoFechamento[], consulta: Consulta) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const geradoEm = new Date()
  doc.setProperties({
    title: `${NOME_MODULO} · Totais por canal · ${consulta.lojaNome}`,
    creator: NOME_MODULO,
  })

  const canais = vendasPorCanal(pedidos)
  const total = canais.reduce((acc, c) => acc + Math.round(Math.max(c.valor, 0) * 100), 0) / 100
  const porCanal = new Map<string, PedidoFechamento[]>()
  for (const p of pedidos) {
    const c = canalDoPedido(p)
    const lista = porCanal.get(c)
    if (lista) lista.push(p)
    else porCanal.set(c, [p])
  }

  // A faixa e o card do canal andam juntos: se não cabem, a seção começa na
  // página seguinte (título nunca fica sozinho no pé da página).
  const fim = doc.internal.pageSize.getHeight() - MARGEM
  let y = cabecalho(doc, consulta, geradoEm, pedidos.length)
  for (const venda of canais) {
    if (y + ALTURA_SECAO > fim) {
      doc.addPage()
      y = continuacao(doc, consulta)
    }
    secaoDoCanal(
      doc,
      y,
      { venda, pedidos: porCanal.get(venda.canal) ?? [] },
      canais,
      total,
      pedidos.length
    )
    y += ALTURA_SECAO
  }
  rodapes(doc, consulta)

  doc.save(
    nomeArquivoExport({
      modulo: NOME_MODULO,
      detalhe: `${consulta.lojaNome} - Totais por canal`,
      periodo: periodoArquivo(consulta.de, consulta.ate),
      extensao: 'pdf',
    })
  )
}
