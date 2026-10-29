/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react'
import type { RouteObject } from 'react-router-dom'
import { Spinner } from '@gia-cb/ui'

const ReportsMaestroView = lazy(() =>
  import('./views/ReportsMaestroView').then((m) => ({ default: m.ReportsMaestroView }))
)

function LazyReportsMaestroView() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <ReportsMaestroView />
    </Suspense>
  )
}

export const reportsMaestroRoutes: RouteObject[] = [
  { path: '/reports-maestro', element: <LazyReportsMaestroView /> },
]
