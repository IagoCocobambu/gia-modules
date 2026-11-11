import { memo } from 'react'
import { ChevronRight, Info } from 'lucide-react'
import { cn } from '@gia-cb/ui/cn'
import type { Catalogo } from '../catalogo'
import { larguraDoTexto } from '../graficos'
import { textoDaComposicao, type LinhaGrade } from '../grade'

// A primeira coluna das duas grades: a conta, com a seta que abre e fecha os
// filhos, o código e o nome, recuados pelo nível.
//
// ── A DICA VAI POR ATRIBUTO ─────────────────────────────────────────────────
//
// As grades podem ter milhares de células, e uma `Tooltip` da SDK por célula
// custa três hooks, um efeito e um `cloneElement` cada — no RH isso congelou a
// Comparar por 16 s. A composição dos indicadores e a explicação dos calculados
// vão em `data-dica`, lidos por UMA `DicaDaGrade` em volta da grade.

interface Props {
  linha: LinhaGrade
  cat: Catalogo
  aberta: boolean
  onAlternar?: (formatado: string) => void
  /**
   * O nome inteiro na dica quando ele não cabe na coluna de 300 px. A grade do
   * plano da loja cortava 27 nomes no nível 3 ("Lenha, carvão, briquete, óleo de
   * ger…", 29/09/2026). A largura sai da MESMA régua do ranking (`larguraDoTexto`,
   * medida uma vez por nome e guardada), e não de um elemento por célula.
   */
  dicaDoNome?: boolean
}

/**
 * O espaço do nome numa coluna de 300 px: menos o recuo da célula (32), a seta
 * (20 + 4), o código (40, ou 48 nos indicadores) e o recuo de cada nível.
 */
function espacoDoNome(nivel: number): number {
  if (nivel === 0) return 300 - 32 - 24 - 48 - 4
  return 300 - 32 - 24 - 40 - 4 - (nivel - 1) * 14
}

/** A régua é estimativa: na beira, a dica sobra em vez de faltar. */
const FOLGA = 8

/**
 * A largura do nome no tamanho da grade: a régua mede em 11 px, a célula escreve
 * em 14, e o nível 1 e o 2 vão em negrito.
 */
function larguraDoNome(descricao: string, nivel: number): number {
  return larguraDoTexto(descricao) * (14 / 11) * (nivel === 1 || nivel === 2 ? 1.06 : 1)
}

function ContaNaArvoreSemMemo({ linha, cat, aberta, onAlternar, dicaDoNome }: Props) {
  if (linha.tipo === 'secao') {
    return (
      <span className="block truncate text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {linha.titulo}
      </span>
    )
  }
  if (linha.tipo === 'calculado') {
    return (
      <span
        className="flex min-w-0 cursor-help items-center gap-1.5"
        data-dica={`${linha.ind.nome}\n${linha.ind.descricao}`}
      >
        <span className="w-12 shrink-0 font-mono text-[10px] text-info">calc.</span>
        <span className="min-w-0 truncate">{linha.ind.nome}</span>
        <Info className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" aria-hidden />
      </span>
    )
  }
  const c = linha.conta
  const composicao = c.nivel === 0 ? textoDaComposicao(cat, c.indice) : undefined
  const recuo = c.nivel > 1 ? (c.nivel - 1) * 0.875 : 0
  const nomeLongo =
    dicaDoNome && !composicao && larguraDoNome(c.descricao, c.nivel) > espacoDoNome(c.nivel) - FOLGA
  return (
    <span
      className={cn('flex min-w-0 items-center gap-1', composicao && 'cursor-help')}
      style={{ paddingLeft: `${recuo}rem` }}
      data-dica={composicao ?? (nomeLongo ? `${c.formatado} ${c.descricao}` : undefined)}
    >
      {c.temFilhos && onAlternar ? (
        <button
          type="button"
          onClick={(e) => {
            // O cabeçalho do DataReport ordena ao clique; aqui é célula, mas o
            // clique não pode vazar para a linha.
            e.stopPropagation()
            onAlternar(c.formatado)
          }}
          aria-expanded={aberta}
          aria-label={`${aberta ? 'Fechar' : 'Abrir'} ${c.formatado} ${c.descricao}`}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors duration-fast ease-default hover:bg-muted hover:text-foreground"
        >
          <ChevronRight
            className={cn(
              'h-3.5 w-3.5 transition-transform duration-fast ease-default',
              aberta && 'rotate-90'
            )}
          />
        </button>
      ) : (
        <span className="w-5 shrink-0" aria-hidden />
      )}
      <span
        className={cn(
          'shrink-0 font-mono text-[11px] text-muted-foreground',
          c.nivel === 0 ? 'w-12' : 'w-10'
        )}
      >
        {c.formatado}
      </span>
      <span
        className={cn(
          'min-w-0 truncate',
          c.nivel === 1 && 'font-semibold text-foreground',
          c.nivel === 2 && 'font-medium'
        )}
      >
        {c.descricao}
      </span>
      {composicao && <Info className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" aria-hidden />}
    </span>
  )
}

/**
 * Memorizada: o `DataReport` redesenha a grade inteira a cada estado interno dele
 * (tela cheia, página), e as props daqui são estáveis entre renders.
 */
export const ContaNaArvore = memo(ContaNaArvoreSemMemo)
