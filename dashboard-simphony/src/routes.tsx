/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react'
import type { RouteObject } from 'react-router-dom'
import { Spinner } from '@gia-cb/ui'

const DashboardSimphonyView = lazy(() =>
  import('./views/DashboardSimphonyView').then((m) => ({ default: m.DashboardSimphonyView })),
)

function LazyDashboardSimphonyView() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <DashboardSimphonyView />
    </Suspense>
  )
}

export const dashboardSimphonyRoutes: RouteObject[] = [
  { path: '/dashboard-simphony', element: <LazyDashboardSimphonyView /> },
]
