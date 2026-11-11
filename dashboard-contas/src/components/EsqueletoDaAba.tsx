import { Skeleton, TableSkeleton } from '@gia-cb/ui'
import type { AbaId } from './AbasDoPainel'

// O esqueleto de carregamento de cada aba — o mesmo recurso do `DataReport`,
// aplicado ao painel inteiro (padrão do Dashboard de RH).
//
// Spinner centralizado some e a tela "pula" para o layout de verdade; o esqueleto
// já desenha onde cada coisa vai ficar. Aparece enquanto as matrizes chegam e
// enquanto uma aba pesada monta depois do clique — a troca acontece NA HORA, com
// o esqueleto, em vez de a tela congelar na aba antiga. "Tela parada é lida como
// tela quebrada."
//
// As consultas de CONTAINER são as mesmas da tela real: com pontos de quebra de
// viewport, o esqueleto teria colunas diferentes da tela no painel estreito, e a
// troca pulava.

export function EsqueletoDaAba({ aba }: { aba: AbaId }) {
  if (aba === 'analises') {
    return (
      <div
        className="@container flex h-full flex-col gap-3 overflow-hidden"
        aria-busy="true"
        aria-label="Carregando as análises adicionais"
      >
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-72 rounded-lg" />
        <Skeleton className="h-5 w-56" />
        <Skeleton className="h-80 rounded-lg" />
      </div>
    )
  }
  if (aba === 'visao') {
    return (
      <div
        className="@container flex h-full flex-col gap-3 overflow-hidden"
        aria-busy="true"
        aria-label="Carregando a visão geral"
      >
        <Skeleton className="h-5 w-40" />
        <div className="grid grid-cols-1 gap-2 @md:grid-cols-2 @4xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-[6.5rem] rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 @2xl:grid-cols-3 @5xl:grid-cols-5">
          {Array.from({ length: 10 }, (_, i) => (
            <Skeleton key={i} className="h-[5.5rem] rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-3 @4xl:grid-cols-2">
          <Skeleton className="h-80 rounded-lg" />
          <Skeleton className="h-80 rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex h-full flex-col gap-4 overflow-hidden rounded-lg border border-border bg-surface p-4"
      aria-busy="true"
      aria-label="Carregando"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-3 w-72" />
        </div>
        <Skeleton className="h-8 w-64" />
      </div>
      <TableSkeleton rows={12} columns={aba === 'comparativos' ? 8 : 5} />
    </div>
  )
}
