import { useEffect, useRef, type ReactNode } from 'react'
import { ArrowLeftRight, BarChart3, Calculator, ListOrdered, Table2 } from 'lucide-react'
import { Select, Tabs } from '@gia-cb/ui'

// A navegação entre as cinco leituras do painel — o arranjo do Dashboard de RH.
// A quinta, Análises adicionais, é o que veio do BI mensal e o painel ainda não
// tinha (28/09/2026); o nome e o ícone são os da aba irmã do Dashboard de RH.
//
// ── `Tabs`, E NÃO BOTÕES SOLTOS ─────────────────────────────────────────────
//
// Botões lado a lado leem como controles independentes; o `Tabs` agrupa num
// trilho único, que é o que a alternância exclusiva quer dizer (a mesma conclusão
// de Trâmites, Combos e do RH).
//
// ── NO ESTREITO, UM SELETOR — E NÃO UM TRILHO ROLANDO ───────────────────────
//
// Abaixo de `@2xl` de CONTAINER a navegação vira um seletor com a lista inteira.
// Trilho com scroll horizontal escondia abas no celular, e as setas de rolagem
// cobriam a aba da ponta (medido no RH em 16/09/2026). A troca é por container,
// não por viewport: é a largura que sobra para a barra que decide.

export type AbaId = 'visao' | 'plano' | 'comparativos' | 'por-indice' | 'analises'

const ABAS = [
  { id: 'visao', label: 'Visão geral', icone: BarChart3 },
  { id: 'plano', label: 'Plano de contas', icone: Table2 },
  { id: 'comparativos', label: 'Comparativos', icone: ArrowLeftRight },
  { id: 'por-indice', label: 'Por índice', icone: ListOrdered },
  { id: 'analises', label: 'Análises adicionais', icone: Calculator },
] as const satisfies ReadonlyArray<{ id: AbaId; label: string; icone: unknown }>

interface Props {
  ativa: AbaId
  onChange: (id: AbaId) => void
  /** Logo depois da navegação — o botão "Conhecer as abas". */
  extra?: ReactNode
}

export function AbasDoPainel({ ativa, onChange, extra }: Props) {
  const trilho = useRef<HTMLDivElement>(null)
  const atual = ABAS.find((a) => a.id === ativa) ?? ABAS[0]
  const IconeAtual = atual.icone

  // O tour troca de aba sozinho: a aba ativa não pode ficar fora de vista.
  useEffect(() => {
    const alvo = trilho.current?.querySelector<HTMLElement>('[data-state="active"]')
    alvo?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' })
  }, [ativa])

  return (
    // `@container` não é decoração: a troca trilho ↔ seletor é container query.
    <div ref={trilho} className="@container min-w-0 shrink-0" data-tour="abas">
      {/* O `extra` fica DENTRO do container, numa linha `w-max`. Fora dele, numa
          linha flex, o container encolhia a zero e as abas sumiam (RH). */}
      <div className="flex w-max max-w-full items-center gap-2">
        <div className="@2xl:hidden">
          <Select value={ativa} onValueChange={(id) => onChange(id as AbaId)}>
            <Select.Trigger className="h-9 w-56" aria-label="Escolher a aba">
              <span className="flex min-w-0 items-center gap-2">
                <IconeAtual className="h-4 w-4 shrink-0" aria-hidden />
                <span className="truncate">{atual.label}</span>
              </span>
            </Select.Trigger>
            <Select.Content>
              {ABAS.map(({ id, label, icone: Icone }) => (
                <Select.Item key={id} value={id}>
                  <span className="flex items-center gap-2">
                    <Icone className="h-4 w-4 shrink-0" aria-hidden />
                    {label}
                  </span>
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>

        <div className="hidden @2xl:block">
          <Tabs value={ativa} onValueChange={(id) => onChange(id as AbaId)}>
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

        {extra}
      </div>
    </div>
  )
}
