/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react'
import type { RouteObject } from 'react-router-dom'
import { Spinner } from '@gia-cb/ui'

const Fechamento99foodMensalView = lazy(() =>
  import('./views/Fechamento99foodMensalView').then((m) => ({
    default: m.Fechamento99foodMensalView,
  }))
)

function LazyFechamento99foodMensalView() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <Fechamento99foodMensalView />
    </Suspense>
  )
}

export const fechamento99foodMensalRoutes: RouteObject[] = [
  { path: '/fechamento-99food-mensal', element: <LazyFechamento99foodMensalView /> },
]
