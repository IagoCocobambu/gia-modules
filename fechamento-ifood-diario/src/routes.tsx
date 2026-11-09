/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react'
import type { RouteObject } from 'react-router-dom'
import { Spinner } from '@gia-cb/ui'

const FechamentoIfoodDiarioView = lazy(() =>
  import('./views/FechamentoIfoodDiarioView').then((m) => ({
    default: m.FechamentoIfoodDiarioView,
  }))
)

function LazyFechamentoIfoodDiarioView() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <FechamentoIfoodDiarioView />
    </Suspense>
  )
}

export const fechamentoIfoodDiarioRoutes: RouteObject[] = [
  { path: '/fechamento-ifood-diario', element: <LazyFechamentoIfoodDiarioView /> },
]
