import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@gia-cb/ui/cn'

// UMA dica para a grade inteira, no lugar de uma `Tooltip` por célula.
//
// ── POR QUE NÃO A `Tooltip` DA SDK EM CADA CÉLULA ───────────────────────────
//
// A `Tooltip` é leve parada — só arma o Radix quando o ponteiro chega —, mas
// cada uma ainda custa três hooks, um efeito e um `cloneElement`. A aba Comparar
// em dois períodos com as 88 operações tem ~26 mil células, e uma dica em cada
// diferença, em cada "—" e em cada destaque passava de 17 mil tooltips: medido
// em 2026-09-14, a troca de modo congelava a tela por 16 s, e o navegador chegou
// a recarregar a página no meio.
//
// Aqui a célula só carrega o texto em `data-dica`, e um único ouvinte no
// contêiner descobre, pelo alvo do ponteiro, qual dica mostrar. O custo passa a
// ser um atributo por célula.
//
// ── O QUE CONTINUA COM A `Tooltip` DA SDK ───────────────────────────────────
//
// Dica com conteúdo RICO — a lista de lojas de um valor fora do plausível. São
// poucas células, e ali o texto não cabe num atributo.
//
// ── ESTADO AQUI NÃO REDESENHA A GRADE ───────────────────────────────────────
//
// Mostrar ou esconder a dica muda o estado DESTE componente, e `children` é o
// mesmo elemento que o pai passou: o React não desce para a grade. Mover o
// ponteiro por mil células não remonta nenhuma.
//
// O texto vai para a tela como texto, nunca como HTML: nome de loja vem do
// cadastro, e cadastro é dado, não marcação.

const ATRASO_MS = 200
const MARGEM = 8

interface Dica {
  texto: string
  /** Centro horizontal e bordas da célula, na tela. */
  centro: number
  topo: number
  base: number
}

export function DicaDaGrade({
  children,
  className,
  alvo,
}: {
  children: ReactNode
  className?: string
  /**
   * O mesmo elemento, para quem precisa medi-lo — a janela de colunas da aba
   * Comparativos ouve aqui a rolagem da grade (ver `use-janela-de-colunas`).
   */
  alvo?: RefObject<HTMLDivElement | null>
}) {
  const [dica, setDica] = useState<Dica | null>(null)
  const alvoAtual = useRef<Element | null>(null)
  const timer = useRef<number | null>(null)

  const cancelar = () => {
    if (timer.current != null) {
      window.clearTimeout(timer.current)
      timer.current = null
    }
  }

  const esconder = () => {
    cancelar()
    alvoAtual.current = null
    setDica(null)
  }

  // Os efeitos usam só refs e o setter, que são estáveis: com as funções do
  // render na lista de dependências, eles se refariam a cada render.
  useEffect(
    () => () => {
      if (timer.current != null) window.clearTimeout(timer.current)
    },
    []
  )

  // A grade rola por dentro; a dica é fixa na tela e ficaria para trás.
  useEffect(() => {
    if (!dica) return
    const fechar = () => {
      if (timer.current != null) {
        window.clearTimeout(timer.current)
        timer.current = null
      }
      alvoAtual.current = null
      setDica(null)
    }
    window.addEventListener('scroll', fechar, true)
    window.addEventListener('resize', fechar)
    return () => {
      window.removeEventListener('scroll', fechar, true)
      window.removeEventListener('resize', fechar)
    }
  }, [dica])

  return (
    <div
      ref={alvo}
      className={className}
      onPointerOver={(e) => {
        const sobDica = (e.target as Element).closest?.('[data-dica]') ?? null
        if (sobDica === alvoAtual.current) return
        cancelar()
        alvoAtual.current = sobDica
        if (!sobDica) {
          setDica(null)
          return
        }
        timer.current = window.setTimeout(() => {
          const texto = sobDica.getAttribute('data-dica')
          if (!texto || !sobDica.isConnected) return
          const r = sobDica.getBoundingClientRect()
          setDica({ texto, centro: r.left + r.width / 2, topo: r.top, base: r.bottom })
        }, ATRASO_MS)
      }}
      onPointerLeave={esconder}
    >
      {children}
      {dica &&
        createPortal(
          <div
            role="tooltip"
            className={cn(
              // O mesmo desenho da `Tooltip` da SDK: superfície escura nos dois
              // temas, texto claro.
              // `whitespace-pre-line`: a composição de um indicador vem em várias
              // linhas, uma parcela por linha.
              'pointer-events-none fixed z-[80] max-w-xs whitespace-pre-line rounded-lg border border-white/10 px-3 py-2 shadow-2xl',
              'bg-foreground text-xs font-medium text-background dark:bg-muted dark:text-foreground'
            )}
            style={{
              left: Math.min(Math.max(MARGEM, dica.centro), window.innerWidth - MARGEM),
              // Acima da célula; perto do topo da tela, abaixo dela.
              ...(dica.topo > 64
                ? { top: dica.topo - 6, transform: 'translate(-50%, -100%)' }
                : { top: dica.base + 6, transform: 'translate(-50%, 0)' }),
            }}
          >
            {dica.texto}
          </div>,
          document.body
        )}
    </div>
  )
}
