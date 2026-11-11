/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react'
import type { RouteObject } from 'react-router-dom'
import { Spinner } from '@gia-cb/ui'

const DashboardContasView = lazy(() =>
  import('./views/DashboardContasView').then((m) => ({ default: m.DashboardContasView }))
)

function LazyDashboardContasView() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <DashboardContasView />
    </Suspense>
  )
}

export const dashboardContasRoutes: RouteObject[] = [
  { path: '/dashboard-contas', element: <LazyDashboardContasView /> },
]
