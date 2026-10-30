/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react'
import type { RouteObject } from 'react-router-dom'
import { Spinner } from '@gia-cb/ui'

const FechamentoMaestroView = lazy(() =>
  import('./views/FechamentoMaestroView').then((m) => ({ default: m.FechamentoMaestroView }))
)

function LazyFechamentoMaestroView() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <FechamentoMaestroView />
    </Suspense>
  )
}

export const fechamentoMaestroRoutes: RouteObject[] = [
  { path: '/fechamento-maestro', element: <LazyFechamentoMaestroView /> },
]
