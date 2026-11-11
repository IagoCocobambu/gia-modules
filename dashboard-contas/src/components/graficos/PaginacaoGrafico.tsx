import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@gia-cb/ui'

// Os botões de página dos gráficos de lista (ranking, desvio, setores).
//
// ── POR QUE PAGINAR, E NÃO ROLAR ────────────────────────────────────────────
//
// A Visão geral já rola como página. Um gráfico que rolava por dentro dela era
// rolagem dentro de rolagem: a roda do mouse ora movia a lista, ora a página, e
// no celular o dedo prendia dentro do cartão. A pedido do João (15/09/2026), a
// página é a única que rola; a lista longa anda por botões.
//
// A escala das barras NÃO muda de página para página — quem pagina é o gráfico,
// que calcula o máximo sobre a lista inteira. Senão a barra "cheia" da página 3
// pareceria tão grande quanto a da página 1.

interface Props {
  pagina: number
  totalDePaginas: number
  /** Primeiro e último item exibidos (1-based) e o total, para o texto. */
  de: number
  ate: number
  total: number
  substantivoPlural: string
  onPagina: (pagina: number) => void
}

export function PaginacaoGrafico({
  pagina,
  totalDePaginas,
  de,
  ate,
  total,
  substantivoPlural,
  onPagina,
}: Props) {
  if (totalDePaginas <= 1) return null
  return (
    <div className="flex items-center justify-between gap-2 border-t border-border pt-2">
      <span className="text-xs tabular-nums text-muted-foreground">
        {de}–{ate} de {total} {substantivoPlural}
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onPagina(pagina - 1)}
          disabled={pagina === 0}
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="min-w-[3.5rem] text-center text-xs tabular-nums text-muted-foreground">
          {pagina + 1} / {totalDePaginas}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onPagina(pagina + 1)}
          disabled={pagina >= totalDePaginas - 1}
          aria-label="Próxima página"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
