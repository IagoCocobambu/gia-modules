/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react'
import type { RouteObject } from 'react-router-dom'
import { Spinner } from '@gia-cb/ui'

const ValidacaoFiscalView = lazy(() =>
  import('./views/ValidacaoFiscalView').then((m) => ({ default: m.ValidacaoFiscalView }))
)

function LazyValidacaoFiscalView() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <ValidacaoFiscalView />
    </Suspense>
  )
}

export const validacaoFiscalRoutes: RouteObject[] = [
  { path: '/validacao-fiscal', element: <LazyValidacaoFiscalView /> },
]
