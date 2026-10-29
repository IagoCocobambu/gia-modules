import { useMemo, useState } from 'react'
import { History, RefreshCw, Store } from 'lucide-react'
import {
  Button,
  DataReport,
  EmptyState,
  SearchableSelect,
  Spinner,
  toast,
  TourReplayButton,
  WidthFrame,
  type ColumnDef,
  type SearchableOption,
} from '@gia-cb/ui'
import { useTourReplayTrigger } from '@gia-cb/sdk/modules'
import { useCanAccess } from '@gia-cb/sdk/permissions'
import {
  useListMeuModuloItems,
  useListMeuModuloLojas,
  useUltimaSyncMeuModulo,
} from '../api/items'
import { formatDateTime, sleep } from '../helpers'
import { HistoryModal } from '../components/HistoryModal'
import type { MeuModuloItem } from '../types'

export function MeuModuloView() {
  const canView = useCanAccess('meu-modulo.ler')
  const canSync = useCanAccess('meu-modulo.sincronizar')

  const { data: lojas = [], isLoading: lojasLoading } = useListMeuModuloLojas()
  const { data: ultimoSync } = useUltimaSyncMeuModulo()

  const [locRef, setLocRef] = useState<string | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [syncing, setSyncing] = useState(false)

  const replayTour = useTourReplayTrigger('meu-modulo')

  const itemsQuery = useListMeuModuloItems(locRef)
  const items = itemsQuery.data ?? []
  const itemsLoading = itemsQuery.isFetching

  const lojaOptions = useMemo<SearchableOption[]>(
    () =>
      lojas.map((l) => ({
        value: l.loc_ref,
        label: l.nome,
        description: l.apelido,
        leading: <Store className="h-4 w-4 text-muted-foreground" />,
      })),
    [lojas],
  )

  const columns = useMemo<ColumnDef<MeuModuloItem, unknown>[]>(
    () => [
      {
        accessorKey: 'family_group',
        header: 'FamilyGroup',
        cell: ({ row }) => row.original.family_group,
      },
      {
        accessorKey: 'item_id',
        header: 'ItemID',
        cell: ({ row }) => (
          <span className="font-mono text-foreground">{row.original.item_id}</span>
        ),
      },
      {
        accessorKey: 'item_name',
        header: 'ItemName',
        cell: ({ row }) => (
          <span className="font-medium text-foreground">{row.original.item_name}</span>
        ),
      },
      {
        accessorKey: 'gtin',
        header: 'GTIN',
        cell: ({ row }) => <span className="font-mono">{row.original.gtin ?? '—'}</span>,
      },
      {
        accessorKey: 'cest',
        header: 'CEST',
        cell: ({ row }) => <span className="font-mono">{row.original.cest ?? '—'}</span>,
      },
      {
        accessorKey: 'ncm',
        header: 'NCM',
        cell: ({ row }) => <span className="font-mono">{row.original.ncm ?? '—'}</span>,
      },
    ],
    [],
  )

  // --- Ações SIMULADAS (template sem backend real) ---
  // No portal real, estas chamariam o BFF/Supabase pra disparar jobs.
  // Aqui usamos sleep() + toast pra demonstrar feedback visual.

  const handleSync = async () => {
    setSyncing(true)
    const loja = lojas.find((l) => l.loc_ref === locRef)
    toast.info(`Iniciando sincronização${loja ? ' de ' + loja.nome : ''}…`)
    try {
      await sleep(1800)
      toast.success('Sincronização concluída (simulado)')
      // No portal real: queryClient.invalidateQueries({queryKey: ['meu-modulo']}) aqui
      void itemsQuery.refetch()
    } finally {
      setSyncing(false)
    }
  }

  if (!canView) {
    return (
      <div className="m-6 rounded-lg border border-warning/30 bg-warning/10 p-6 text-sm text-foreground">
        Você não tem permissão pra visualizar Meu Modulo (<code>meu-modulo.ler</code>).
      </div>
    )
  }

  const selectedLoja = lojas.find((l) => l.loc_ref === locRef)

  const subtitle = syncing ? (
    <span className="inline-flex items-center gap-2 text-primary">
      <Spinner size="sm" /> Sincronizando…
    </span>
  ) : ultimoSync?.last_run_at ? (
    `Última sincronização ${formatDateTime(ultimoSync.last_run_at)}`
  ) : (
    'Base de Meu Modulo por loja — selecione uma loja pra começar'
  )

  const lojaSelector = (
    <div className="w-full sm:w-56" data-tour="meu-modulo-loja">
      <SearchableSelect
        options={lojaOptions}
        value={locRef}
        onChange={(v) => setLocRef(v)}
        placeholder={lojasLoading ? 'Carregando lojas…' : 'Selecione a loja…'}
        searchPlaceholder="Buscar loja…"
        emptyLabel="Nenhuma loja"
        disabled={lojasLoading}
      />
    </div>
  )

  // Sem wrapper <div> — cada botão fica como item independente no flex-wrap
  // do header do DataReport, podendo encaixar lado a lado com o seletor de
  // loja em vez de virar "um único grupo grande" que quebra a linha.
  // O botão "Exportar" foi REMOVIDO — usamos o exportar built-in do DataReport
  // via `exportFileName` (baixa CSV de verdade em vez de simular com toast).
  const actions = (
    <span className="contents" data-tour="meu-modulo-actions">
      {canSync && (
        <Button onClick={handleSync} disabled={syncing} variant="default">
          <RefreshCw className={'h-4 w-4 ' + (syncing ? 'animate-spin' : '')} />
          {syncing ? 'Sincronizando…' : 'Sincronizar'}
        </Button>
      )}
      <Button variant="ghost" onClick={() => setHistoryOpen(true)} title="Histórico">
        <History className="h-4 w-4" />
      </Button>
    </span>
  )

  return (
    <>
      {/* WidthFrame — igual ao portal real: centraliza a lista com um limite de
       * largura e, quando a janela é mais larga que ~1280px, mostra os botões
       * `<` `>` nas laterais pra EXPANDIR/recolher a largura. A altura fixa dá
       * contexto pro DataReport `fillHeight`.
       *
       * ⚠️ O WidthFrame é a RAIZ da view — NÃO envolva num `<div className="p-4">`.
       * O host já aplica a margem de página; o padding SOMA à altura do frame e a
       * página inteira ganha scroll. Ver conventions.md §"Altura e largura". */}
      <WidthFrame
        className="h-[calc(100vh-6.5rem)] md:h-[calc(100vh-7.5rem)]"
        data-tour="meu-modulo-frame"
      >
        <DataReport
          title="Meu Modulo"
          titleExtra={<TourReplayButton onClick={replayTour} />}
          subtitle={subtitle}
          filters={lojaSelector}
          actions={actions}
          data={items}
          columns={columns}
          loading={itemsLoading}
          fillHeight
          emptyState={
            <EmptyState
              title={selectedLoja ? `Sem itens em ${selectedLoja.nome}` : 'Selecione uma loja'}
              description={
                selectedLoja
                  ? 'Esta loja ainda não tem itens sincronizados. Clique em Sincronizar pra disparar a coleta.'
                  : 'A base de Meu Modulo é por loja — a tela carrega os dados após você escolher uma loja no seletor acima.'
              }
              icon={Store}
            />
          }
          countNoun="itens"
          exportFileName={selectedLoja ? `meu-modulo-${selectedLoja.loc_ref}` : undefined}
          exportRow={(r) => ({
            FamilyGroup: r.family_group,
            ItemID: r.item_id,
            ItemName: r.item_name,
            GTIN: r.gtin ?? '',
            CEST: r.cest ?? '',
            NCM: r.ncm ?? '',
          })}
          toolbarTourId="meu-modulo-toolbar"
        />
      </WidthFrame>

      <HistoryModal open={historyOpen} onOpenChange={setHistoryOpen} />
    </>
  )
}
