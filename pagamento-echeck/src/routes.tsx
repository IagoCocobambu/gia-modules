/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react'
import type { RouteObject } from 'react-router-dom'
import { Spinner } from '@gia-cb/ui'

const PagamentoEcheckView = lazy(() =>
  import('./views/PagamentoEcheckView').then((m) => ({ default: m.PagamentoEcheckView }))
)

function LazyPagamentoEcheckView() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <PagamentoEcheckView />
    </Suspense>
  )
}

export const pagamentoEcheckRoutes: RouteObject[] = [
  { path: '/pagamento-echeck', element: <LazyPagamentoEcheckView /> },
]
