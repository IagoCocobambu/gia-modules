import type { ReactNode } from 'react'
import { Gauge, Table2 } from 'lucide-react'
import { Tabs } from '@gia-cb/ui'
import type { AbaReports } from '../operacional'

// A navegação entre a lista de pedidos e o dashboard Operacional — o trilho de
// `Tabs` do Dashboard do Plano de Contas. As duas abas usam a MESMA loja e o
// MESMO período do cabeçalho, e leem o MESMO resultado da pesquisa (uma chamada
// só à API) — trocar de aba não busca de novo.
//
// À direita do trilho fica a `acao` da aba aberta (o filtro de canal do
// Operacional): controle da aba vai na linha das abas, não numa linha própria.
// No celular estreito (abaixo de 400 px) as abas escondem o ícone para sobrar
// espaço à `acao`; se ainda assim não couber, ela desce para baixo das abas.

// O Operacional vem primeiro: é a aba em que a tela abre (ver ReportsMaestroView).
const ABAS = [
  { id: 'operacional', label: 'Operacional', icone: Gauge },
  { id: 'pedidos', label: 'Pedidos', icone: Table2 },
] as const satisfies ReadonlyArray<{ id: AbaReports; label: string; icone: unknown }>

interface Props {
  ativa: AbaReports
  onChange: (id: AbaReports) => void
  /** Controle da aba aberta, à direita das abas. */
  acao?: ReactNode
}

export function AbasDoReports({ ativa, onChange, acao }: Props) {
  return (
    <div className="flex min-w-0 shrink-0 flex-wrap items-center gap-x-2 gap-y-2">
      <div className="shrink-0" data-tour="reports-maestro-abas">
        <Tabs value={ativa} onValueChange={(id) => onChange(id as AbaReports)}>
          <Tabs.List>
            {ABAS.map(({ id, label, icone: Icone }) => (
              <Tabs.Trigger key={id} value={id} className="px-3">
                <Icone className="h-4 w-4 max-[400px]:hidden" />
                {label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        </Tabs>
      </div>
      {acao && <div className="ml-auto min-w-[7rem] flex-1 sm:flex-none">{acao}</div>}
    </div>
  )
}
