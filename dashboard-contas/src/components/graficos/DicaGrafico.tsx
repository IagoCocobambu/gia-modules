import { useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@gia-cb/ui/cn'

// A dica que segue o ponteiro sobre uma marca do gráfico.
//
// ── ELA ACRESCENTA, NUNCA TRANCA ────────────────────────────────────────────
//
// Todo valor que a dica mostra também é alcançável sem ela — pelo rótulo direto
// na marca extrema, pelas marcas de eixo e pela aba de tabela, que continua
// listando tudo. Painel em que o número só existe no hover é inutilizável no
// toque e para quem navega por teclado.
//
// ── O VALOR VEM PRIMEIRO ────────────────────────────────────────────────────
//
// Na legenda a hierarquia é a identidade; aqui é invertida. Quem chegou com o
// ponteiro na marca já sabe de quem ela é: quer o número.
//
// O texto entra por `children` como nó React, nunca por HTML em string — nome
// de loja vem do cadastro, e cadastro é dado, não marcação.
//
// ── POR PORTAL, E NÃO DENTRO DO GRÁFICO ─────────────────────────────────────
//
// A dica era `absolute` dentro da moldura do gráfico, e a moldura (e as listas
// que rolam dentro dela) recorta o que passa da borda: perto do fim do ranking
// ou da lista de setores, metade da dica sumia — justamente o número. Agora ela
// vai para o `body`, em posição fixa, e fica por cima de tudo.
//
// Os gráficos continuam passando `x`/`y` RELATIVOS ao próprio container, como
// antes: uma âncora invisível é posta nesse ponto, e a posição na tela sai
// dela. Assim nenhum gráfico precisou saber da mudança.

interface Props {
  x: number
  y: number
  /**
   * Largura do container. Mantida por compatibilidade: a decisão de virar de
   * lado agora olha a largura da TELA, que é onde a dica pode sair.
   */
  larguraContainer?: number
  children: React.ReactNode
}

const LARGURA_ESTIMADA = 240
const ALTURA_ESTIMADA = 110
const MARGEM = 8

interface Posicao {
  left: number
  top: number
}

/**
 * Onde a dica começa, sem sair da tela: o lugar preferido, preso entre a margem
 * e o fim da tela menos o tamanho dela.
 *
 * ☠️ Num celular NÃO EXISTE "o outro lado": a dica tem 240 px e a tela, 375. A
 * versão anterior virava para a esquerda quando não cabia à direita e mandava a
 * caixa para fora pela borda esquerda — vista em 21/09/2026 com o ponteiro na
 * metade do gráfico, com metade do número cortado.
 */
function presoNaTela(preferido: number, tamanho: number, total: number): number {
  return Math.max(MARGEM, Math.min(preferido, total - tamanho - MARGEM))
}

export function DicaGrafico({ x, y, children }: Props) {
  const ancora = useRef<HTMLSpanElement>(null)
  const [posicao, setPosicao] = useState<Posicao | null>(null)

  useLayoutEffect(() => {
    const r = ancora.current?.getBoundingClientRect()
    if (!r) return
    const cabeDireita = r.left + 12 + LARGURA_ESTIMADA + MARGEM < window.innerWidth
    const cabeEmbaixo = r.top - 12 + ALTURA_ESTIMADA + MARGEM < window.innerHeight
    setPosicao({
      left: presoNaTela(
        cabeDireita ? r.left + 12 : r.left - 12 - LARGURA_ESTIMADA,
        LARGURA_ESTIMADA,
        window.innerWidth
      ),
      top: presoNaTela(
        cabeEmbaixo ? r.top - 12 : r.top - 12 - ALTURA_ESTIMADA,
        ALTURA_ESTIMADA,
        window.innerHeight
      ),
    })
  }, [x, y])

  return (
    <>
      <span
        ref={ancora}
        aria-hidden
        className="pointer-events-none absolute h-0 w-0"
        style={{ left: x, top: y }}
      />
      {posicao &&
        createPortal(
          <div
            role="tooltip"
            className={cn(
              'pointer-events-none fixed z-[80] max-w-[15rem] rounded-md border border-border',
              'bg-surface px-2.5 py-1.5 text-xs shadow-lg'
            )}
            style={posicao}
          >
            {children}
          </div>,
          document.body
        )}
    </>
  )
}

/** Uma linha da dica: chave de série, rótulo e — em destaque — o valor. */
export function LinhaDica({ cor, rotulo, valor }: { cor?: string; rotulo: string; valor: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
        {cor && (
          <span
            aria-hidden
            className="h-0.5 w-3 shrink-0 rounded-full"
            style={{ background: cor }}
          />
        )}
        <span className="truncate">{rotulo}</span>
      </span>
      <span className="shrink-0 font-semibold tabular-nums text-foreground">{valor}</span>
    </div>
  )
}
