/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react'
import type { RouteObject } from 'react-router-dom'
import { Spinner } from '@gia-cb/ui'

const TesteView = lazy(() => import('./views/TesteView').then((m) => ({ default: m.TesteView })))

function LazyTesteView() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <TesteView />
    </Suspense>
  )
}

export const testeRoutes: RouteObject[] = [{ path: '/teste', element: <LazyTesteView /> }]
