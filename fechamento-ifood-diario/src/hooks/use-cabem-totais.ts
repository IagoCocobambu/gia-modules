import { useLayoutEffect, useRef, useState } from 'react'

// Seção dos cards (Totais) aberta só enquanto a tabela ainda mostra umas 5 linhas —
// padrão 10 do AGENTS.md do workspace. Mesma conta do `useCabemTotais` do Fechamento
// Maestro 0.4.2 (`fechamento-maestro/src/hooks/use-medidas-tela.ts`), com duas
// diferenças do Diário: a tabela só existe depois da primeira pesquisa (a conta é
// refeita quando ela aparece, pela `chave`), e a parte aberta por "Ver todos os
// totais" fica fora da conta (o elemento com `data-fora-da-conta`).

/** A seção de totais só abre sozinha se, com ela aberta, a tabela ainda mostrar
 *  pelo menos estas linhas; com menos, fica fechada até o usuário usar o botão Totais. */
const LINHAS_MINIMAS_COM_TOTAIS = 5
/** `gap-3` da coluna da tela (entre filtros, avisos, totais e tabela). */
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
 * ocupa agora pelo que ela ocuparia aberta (sem a parte de "Ver todos os totais"):
 *   corpo se aberta = corpo atual + (altura atual da seção + gap + margem atual)
 *                     − (altura da seção aberta + gap)
 * Dá o mesmo resultado com a seção aberta, fechada ou no meio da animação (a margem
 * `-mb-3` do `Recolhivel` fechado também anima). Não usa a altura dos filtros nem do
 * card da tabela: os dois ficam em invólucros `display: contents`, sem altura própria.
 *
 * Trava contra o pisca-pisca: ao fechar sozinha, guarda o espaço ABAIXO da barra de
 * filtros (do topo da seção ao fim da área). Ele só muda quando a janela ou a barra de
 * filtros mudam (ex.: a barra enxuta depois da pesquisa) — nunca porque a seção abriu
 * ou fechou. Reabrir sozinha exige esse espaço `FOLGA_REABRIR` px maior.
 *
 * `chave` muda quando a tabela pode ter aparecido ou trocado (pesquisa, carregamento,
 * erro): a conta é refeita com os elementos novos, sem perder a decisão anterior.
 */
export function useCabemTotais(
  area: HTMLElement | null,
  painel: HTMLElement | null,
  chave: string
): boolean {
  const [cabem, setCabem] = useState(true)
  // A decisão e a trava sobrevivem à troca da tabela (o efeito roda de novo).
  const estado = useRef<{ atual: boolean; espacoAoFechar: number | null }>({
    atual: true,
    espacoAoFechar: null,
  })
  useLayoutEffect(() => {
    if (!area || !painel || typeof ResizeObserver === 'undefined') return
    // painel → div de overflow do Recolhivel → Recolhivel (o item da coluna).
    const secao = painel.parentElement?.parentElement ?? null
    // A tabela do DataReport é o último item da coluna; o pai dela é o corpo que rola.
    const rolagem = area.lastElementChild?.querySelector('table')?.parentElement ?? null
    if (!secao || !rolagem) return
    const fora = painel.querySelector<HTMLElement>('[data-fora-da-conta]')
    const e = estado.current
    const medir = () => {
      // Sem altura: corpo escondido (cards do celular) ou tela fora do ar.
      if (rolagem.offsetParent === null) return
      const margem = parseFloat(getComputedStyle(secao).marginBottom) || 0
      const painelAberto = painel.offsetHeight - (fora?.offsetHeight ?? 0)
      const corpoSeAberta =
        rolagem.clientHeight + (secao.offsetHeight + GAP_AREA + margem) - (painelAberto + GAP_AREA)
      const cabecalho = rolagem.querySelector('thead')?.offsetHeight ?? 0
      const linha = rolagem.querySelector<HTMLElement>('tbody tr')?.offsetHeight ?? 0
      // A linha do estado vazio/erro é alta: só vale a medida de uma linha de dado.
      const alturaLinha = linha > 0 && linha <= 80 ? linha : ALTURA_LINHA_PADRAO
      const precisa = cabecalho + LINHAS_MINIMAS_COM_TOTAIS * alturaLinha
      const cabe = corpoSeAberta >= precisa
      const espaco = area.getBoundingClientRect().bottom - secao.getBoundingClientRect().top
      if (e.atual && !cabe) {
        e.atual = false
        e.espacoAoFechar = espaco
        setCabem(false)
      } else if (
        !e.atual &&
        cabe &&
        (e.espacoAoFechar === null || espaco >= e.espacoAoFechar + FOLGA_REABRIR)
      ) {
        e.atual = true
        e.espacoAoFechar = null
        setCabem(true)
      }
    }
    medir()
    const ro = new ResizeObserver(medir)
    for (const el of [area, rolagem, secao, painel]) ro.observe(el)
    return () => ro.disconnect()
  }, [area, painel, chave])
  return cabem
}
