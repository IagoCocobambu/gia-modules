import { useMemo } from 'react'
import { Globe, RefreshCw } from 'lucide-react'
import {
  Button,
  DataReport,
  EmptyState,
  TourReplayButton,
  WidthFrame,
  type ColumnDef,
} from '@gia-cb/ui'
import { useTourReplayTrigger } from '@gia-cb/sdk/modules'
import { useCanAccess } from '@gia-cb/sdk/permissions'
import { useListDashboardSimphonyPaises } from '../api/paises'
import type { DashboardSimphonyPais } from '../types'

export function DashboardSimphonyView() {
  const canView = useCanAccess('dashboard-simphony.ler')
  const canExport = useCanAccess('dashboard-simphony.exportar')
  const replayTour = useTourReplayTrigger('dashboard-simphony')

  const query = useListDashboardSimphonyPaises()
  const paises = query.data ?? []

  const columns = useMemo<ColumnDef<DashboardSimphonyPais, unknown>[]>(
    () => [
      {
        accessorKey: 'bandeira',
        header: '',
        cell: ({ row }) => <span className="text-xl">{row.original.bandeira}</span>,
        enableSorting: false,
      },
      {
        accessorKey: 'nome',
        header: 'País',
        cell: ({ row }) => (
          <span className="font-medium text-foreground">{row.original.nome}</span>
        ),
      },
      { accessorKey: 'regiao', header: 'Região', cell: ({ row }) => row.original.regiao },
      { accessorKey: 'capital', header: 'Capital', cell: ({ row }) => row.original.capital },
      { accessorKey: 'renda', header: 'Renda', cell: ({ row }) => row.original.renda },
    ],
    []
  )

  if (!canView) {
    return (
      <div className="m-6 rounded-lg border border-warning/30 bg-warning/10 p-6 text-sm text-foreground">
        Você não tem permissão pra visualizar Dashboard Simphony (<code>dashboard-simphony.ler</code>).
      </div>
    )
  }

  const subtitle = query.isError
    ? 'Não foi possível carregar a lista agora — tente de novo.'
    : `${paises.length} país(es) — dados da API pública do Banco Mundial`

  return (
    // WidthFrame + DataReport fillHeight = mesmo layout dos módulos de lista do
    // portal (altura fixa, rodapé sempre visível, botões de expandir largura).
    //
    // ⚠️ O WidthFrame é a RAIZ que a view retorna — sem wrapper com padding. O
    // host já aplica a margem de página; um `p-4` aqui SOMA à altura do frame e
    // a página inteira passa a rolar. Ver conventions.md §"Altura e largura".
    <WidthFrame
      className="h-[calc(100vh-6.5rem)] md:h-[calc(100vh-7.5rem)]"
      data-tour="dashboard-simphony-frame"
    >
      <DataReport
        title="Dashboard Simphony"
        titleExtra={<TourReplayButton onClick={replayTour} />}
        subtitle={subtitle}
        data={query.isError ? [] : paises}
        columns={columns}
        loading={query.isFetching && paises.length === 0}
        fillHeight
        globalSearch
        searchPlaceholder="Buscar país, região ou capital…"
        countNoun="países"
        emptyState={
          <EmptyState
            icon={Globe}
            title={query.isError ? 'Erro ao carregar' : 'Nenhum país'}
            description={
              query.isError
                ? 'A API externa (Banco Mundial) não respondeu. Tente de novo em instantes.'
                : 'A lista veio vazia da API.'
            }
            action={
              query.isError ? (
                <Button onClick={() => void query.refetch()} variant="default">
                  <RefreshCw className="h-4 w-4" /> Tentar de novo
                </Button>
              ) : undefined
            }
          />
        }
        // Export CSV built-in do DataReport — só quando o usuário tem a permissão.
        exportFileName={canExport ? 'dashboard-simphony-paises' : undefined}
        exportRow={(p) => ({
          Pais: p.nome,
          Regiao: p.regiao,
          Capital: p.capital,
          Renda: p.renda,
        })}
        toolbarTourId="dashboard-simphony-toolbar"
      />
    </WidthFrame>
  )
}
