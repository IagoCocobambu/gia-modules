import { useLayoutEffect, useState } from 'react'

// Medidas da área do módulo que decidem o layout da tela do Reports Maestro
// (mesma conta do Fechamento Maestro 0.4.2 — padrão 10 do workspace).

/** Abaixo desta largura (px) a tela usa o layout de celular — o mesmo corte do
 *  `DataReport` (`@3xl` = 48rem), que vira lista de cards nesse ponto. */
const LARGURA_COMPACTA = 768

/** A seção de totais só abre sozinha se, com ela aberta, a tabela ainda mostrar
 *  pelo menos estas linhas; com menos, fica fechada até o usuário usar o botão Totais. */
const LINHAS_MINIMAS_COM_TOTAIS = 5
/** `gap-3` da coluna da aba Pedidos (entre os totais e a tabela). */
const GAP_AREA = 12
/** Altura de uma linha da tabela enquanto não há linha de dado para medir (px). */
const ALTURA_LINHA_PADRAO = 47
/** Depois de fechar sozinha, a seção só reabre sozinha quando o espaço abaixo da
 *  barra de filtros cresce pelo menos isto (px) além do que tinha ao fechar. */
const FOLGA_REABRIR = 24

/**
 * `true` quando, com a seção de totais ABERTA, o corpo da tabela ainda mostra o
 * cabeçalho e `LINHAS_MINIMAS_COM_TOTAIS` linhas. Mede a tela (não a janela por
 * `min-height`, que cada navegador conta de um jeito).
 *
 * A conta parte do corpo da tabela como está AGORA e troca o espaço que a seção
 * ocupa agora pelo que ela ocuparia aberta:
 *   corpo se aberta = corpo atual + (altura atual da seção + gap + margem atual)
 *                     − (altura da seção aberta + gap)
 * Dá o mesmo resultado com a seção aberta, fechada ou no meio da animação (a
 * margem `-mb-3` do `Recolhivel` fechado também anima), então abrir ou fechar não
 * faz a decisão oscilar. Não usa a altura dos filtros nem do card da tabela: os
 * dois ficam em invólucros `display: contents`, sem altura própria.
 *
 * Trava contra o pisca-pisca: ao fechar sozinha, guarda o espaço ABAIXO da barra
 * de filtros (do topo da seção ao fim da área). Ele só muda quando a janela muda
 * ou a barra de filtros muda de altura (ex.: vira a linha enxuta depois da
 * pesquisa) — nunca porque a seção abriu ou fechou, já que o topo dela fica
 * parado. Reabrir sozinha exige esse espaço `FOLGA_REABRIR` px maior. Mesmo que algum navegador meça a tabela
 * diferente com a seção aberta e fechada, abrir/fechar não dispara outra troca.
 */
export function useCabemTotais(area: HTMLElement | null, painel: HTMLElement | null): boolean {
  const [cabem, setCabem] = useState(true)
  useLayoutEffect(() => {
    if (!area || !painel || typeof ResizeObserver === 'undefined') return
    // painel → div de overflow do Recolhivel → Recolhivel (o item da coluna).
    const secao = painel.parentElement?.parentElement ?? null
    // A tabela do DataReport fica no último item da coluna (a aba Pedidos); o pai
    // dela é o corpo que rola. Na aba Operacional não há tabela: não mede.
    const rolagem = area.lastElementChild?.querySelector('table')?.parentElement ?? null
    if (!secao || !rolagem) return
    let atual = true
    let espacoAoFechar: number | null = null
    const medir = () => {
      // Sem altura: corpo escondido (cards do celular) ou tela fora do ar.
      if (rolagem.offsetParent === null) return
      const margem = parseFloat(getComputedStyle(secao).marginBottom) || 0
      const corpoSeAberta =
        rolagem.clientHeight +
        (secao.offsetHeight + GAP_AREA + margem) -
        (painel.offsetHeight + GAP_AREA)
      const cabecalho = rolagem.querySelector('thead')?.offsetHeight ?? 0
      const linha = rolagem.querySelector<HTMLElement>('tbody tr')?.offsetHeight ?? 0
      // A linha do estado vazio/erro é alta: só vale a medida de uma linha de dado.
      const alturaLinha = linha > 0 && linha <= 80 ? linha : ALTURA_LINHA_PADRAO
      const precisa = cabecalho + LINHAS_MINIMAS_COM_TOTAIS * alturaLinha
      const cabe = corpoSeAberta >= precisa
      const espaco = area.getBoundingClientRect().bottom - secao.getBoundingClientRect().top
      if (atual && !cabe) {
        atual = false
        espacoAoFechar = espaco
        setCabem(false)
      } else if (
        !atual &&
        cabe &&
        (espacoAoFechar === null || espaco >= espacoAoFechar + FOLGA_REABRIR)
      ) {
        atual = true
        espacoAoFechar = null
        setCabem(true)
      }
    }
    medir()
    const ro = new ResizeObserver(medir)
    for (const el of [area, rolagem, secao, painel]) ro.observe(el)
    return () => ro.disconnect()
  }, [area, painel])
  return cabem
}

/** A partir desta largura (px) da área cabe a barra de filtros enxuta (padrão 8):
 *  título, loja, as duas datas e Pesquisar numa linha só. */
const LARGURA_FILTROS_ENXUTOS = 900

/**
 * Larguras da ÁREA da tela. Mede o elemento — não a janela — pelo mesmo motivo
 * do `DataReport`: o seletor de Viewport do dev-shell e painéis estreitos do
 * portal limitam a largura do módulo sem mudar a janela.
 * - `compacto`: área estreita, layout de celular (o `DataReport` vira cards).
 * - `cabeLinhaFiltros`: cabe a barra de filtros enxuta numa linha só.
 */
export function useLarguraArea(el: HTMLElement | null): {
  compacto: boolean
  cabeLinhaFiltros: boolean
} {
  const [largura, setLargura] = useState(0)
  useLayoutEffect(() => {
    if (!el || typeof ResizeObserver === 'undefined') return
    const medir = (largura: number) => setLargura(largura)
    medir(el.getBoundingClientRect().width)
    const ro = new ResizeObserver((entries) => medir(entries[0]?.contentRect.width ?? 0))
    ro.observe(el)
    return () => ro.disconnect()
  }, [el])
  return {
    compacto: largura > 0 && largura < LARGURA_COMPACTA,
    cabeLinhaFiltros: largura >= LARGURA_FILTROS_ENXUTOS,
  }
}
