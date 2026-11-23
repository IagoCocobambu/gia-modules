/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react'
import type { RouteObject } from 'react-router-dom'
import { Spinner } from '@gia-cb/ui'

const CouvertView = lazy(() =>
  import('./views/CouvertView').then((m) => ({ default: m.CouvertView }))
)

function LazyCouvertView() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <CouvertView />
    </Suspense>
  )
}

export const couvertRoutes: RouteObject[] = [{ path: '/couvert', element: <LazyCouvertView /> }]
