/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react'
import type { RouteObject } from 'react-router-dom'
import { Spinner } from '@gia-cb/ui'

const MeuModuloView = lazy(() =>
  import('./views/MeuModuloView').then((m) => ({ default: m.MeuModuloView })),
)

function LazyMeuModuloView() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <MeuModuloView />
    </Suspense>
  )
}

export const meuModuloRoutes: RouteObject[] = [
  { path: '/meu-modulo', element: <LazyMeuModuloView /> },
]
