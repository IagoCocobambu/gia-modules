import { Gauge, Table2 } from 'lucide-react'
import { Tabs } from '@gia-cb/ui'
import type { AbaReports } from '../operacional'

// A navegação entre a lista de pedidos e o dashboard Operacional — o trilho de
// `Tabs` do Dashboard do Plano de Contas. As duas abas usam a MESMA loja e o
// MESMO período do cabeçalho, e leem o MESMO resultado da pesquisa (uma chamada
// só à API) — trocar de aba não busca de novo.
//
// São só duas abas de nome curto: cabem no trilho até num celular de 320 px, sem
// o seletor que o Plano de Contas usa no estreito.

// O Operacional vem primeiro: é a aba em que a tela abre (ver ReportsMaestroView).
const ABAS = [
  { id: 'operacional', label: 'Operacional', icone: Gauge },
  { id: 'pedidos', label: 'Pedidos', icone: Table2 },
] as const satisfies ReadonlyArray<{ id: AbaReports; label: string; icone: unknown }>

interface Props {
  ativa: AbaReports
  onChange: (id: AbaReports) => void
}

export function AbasDoReports({ ativa, onChange }: Props) {
  return (
    <div className="min-w-0 shrink-0" data-tour="reports-maestro-abas">
      <Tabs value={ativa} onValueChange={(id) => onChange(id as AbaReports)}>
        <Tabs.List>
          {ABAS.map(({ id, label, icone: Icone }) => (
            <Tabs.Trigger key={id} value={id} className="px-3">
              <Icone className="h-4 w-4" />
              {label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </Tabs>
    </div>
  )
}
