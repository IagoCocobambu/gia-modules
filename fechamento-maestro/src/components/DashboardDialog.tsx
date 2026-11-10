import { useMemo } from 'react'
import { ChartPie, Receipt } from 'lucide-react'
import { Modal, Tabs } from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'
import { vendasPorCanal } from '../helpers'
import type { FiltroTotal, PedidoFechamento, TotaisPeriodo } from '../types'
import { ResumoCards } from './ResumoCards'
import { VendasPorCanal } from './VendasPorCanal'

export type AbaDashboard = 'canais' | 'totais'

const ABAS = [
  { id: 'canais', label: 'Vendas por canal', icone: ChartPie },
  { id: 'totais', label: 'Totais', icone: Receipt },
] as const satisfies ReadonlyArray<{ id: AbaDashboard; label: string; icone: unknown }>

interface DashboardDialogProps {
  aberto: boolean
  /** Aba visível — controlada pela tela: o botão Totais do celular abre direto nela. */
  aba: AbaDashboard
  onAbaChange: (aba: AbaDashboard) => void
  /** Todos os pedidos da pesquisa: o gráfico de canais ignora o canal escolhido e "Só divergências". */
  pedidos: PedidoFechamento[]
  /** Os 12 indicadores do período — os mesmos da barra de totais (do canal escolhido). */
  totais: TotaisPeriodo | null
  /** Aviso de recorte da barra de totais (canal escolhido); `null` = pesquisa inteira. */
  recorte?: string | null
  carregando: boolean
  /** Loja e período da pesquisa, como no subtítulo da tela. */
  descricao: string
  /** Indicador que filtra a tabela; clicar num da aba Totais filtra e fecha o dialog. */
  filtro: FiltroTotal | null
  onFiltroChange: (filtro: FiltroTotal | null) => void
  onFechar: () => void
}

/**
 * Dashboard do período pesquisado, num dialog, em duas abas: as vendas por canal e
 * os totais. A aba Totais é a barra de totais da tela — no celular, onde a barra
 * não cabe, é por aqui que se veem os 12 indicadores.
 *
 * As duas abas ficam empilhadas na mesma célula da grade e trocam por crossfade
 * (`duration-fast`), sem salto de altura.
 */
export function DashboardDialog({
  aberto,
  aba,
  onAbaChange,
  pedidos,
  totais,
  recorte = null,
  carregando,
  descricao,
  filtro,
  onFiltroChange,
  onFechar,
}: DashboardDialogProps) {
  const canais = useMemo(() => vendasPorCanal(pedidos), [pedidos])

  const painel = (id: AbaDashboard) => {
    const ativo = aba === id
    return cn(
      '[grid-area:1/1] min-w-0 transition-opacity duration-fast ease-default',
      ativo ? 'opacity-100' : 'pointer-events-none opacity-0'
    )
  }

  return (
    <Modal open={aberto} onOpenChange={(v) => !v && onFechar()}>
      <Modal.Content size="lg">
        <Modal.Header>
          <Modal.Title>Dashboard</Modal.Title>
          <Modal.Description>{descricao}</Modal.Description>
        </Modal.Header>
        <Modal.Body className="space-y-4">
          <Tabs value={aba} onValueChange={(id) => onAbaChange(id as AbaDashboard)}>
            <Tabs.List>
              {ABAS.map(({ id, label, icone: Icone }) => (
                <Tabs.Trigger key={id} value={id} className="min-h-11 px-3">
                  <Icone className="h-4 w-4" />
                  {label}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
          </Tabs>

          <div className="grid">
            <div
              className={painel('canais')}
              aria-hidden={aba !== 'canais'}
              inert={aba !== 'canais'}
            >
              <VendasPorCanal canais={canais} carregando={carregando} />
            </div>
            <div
              className={painel('totais')}
              aria-hidden={aba !== 'totais'}
              inert={aba !== 'totais'}
            >
              <ResumoCards
                totais={totais}
                carregando={carregando}
                recorte={recorte}
                filtro={filtro}
                onFiltroChange={onFiltroChange}
              />
            </div>
          </div>
        </Modal.Body>
      </Modal.Content>
    </Modal>
  )
}
