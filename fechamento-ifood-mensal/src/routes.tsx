/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react'
import type { RouteObject } from 'react-router-dom'
import { Spinner } from '@gia-cb/ui'

const FechamentoIfoodMensalView = lazy(() =>
  import('./views/FechamentoIfoodMensalView').then((m) => ({
    default: m.FechamentoIfoodMensalView,
  }))
)

function LazyFechamentoIfoodMensalView() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <FechamentoIfoodMensalView />
    </Suspense>
  )
}

export const fechamentoIfoodMensalRoutes: RouteObject[] = [
  { path: '/fechamento-ifood-mensal', element: <LazyFechamentoIfoodMensalView /> },
]
