import { useRef, type ReactNode } from 'react'
import { Search } from 'lucide-react'
import { Button, DatePicker, Field, ListHeader, SearchableSelect } from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'
import { hojeLocal, NOME_MODULO } from '../helpers'
import type { FechamentoLoja } from '../types'
import { Dica } from './Dica'

export interface FiltrosValor {
  /** `operacao_ref` da operação escolhida. */
  operacaoRef: string | null
  data: string
}

interface FiltrosBarProps {
  value: FiltrosValor
  onValueChange: (value: FiltrosValor) => void
  lojas: FechamentoLoja[]
  lojasLoading: boolean
  pesquisando: boolean
  /** Dispara a pesquisa; `false` = recusada (filtro inválido), os filtros ficam abertos. */
  onPesquisar: () => boolean
  /** Os campos são iguais aos da pesquisa na tela: Pesquisar fica desativado. */
  semAlteracao: boolean
  /** Layout de celular: campos empilhados, ocupando a largura toda. */
  compacto: boolean
  /** Ao lado do título do módulo (o botão de rever o tour). */
  tituloExtra?: ReactNode
  className?: string
}

export function FiltrosBar({
  value,
  onValueChange,
  lojas,
  lojasLoading,
  pesquisando,
  onPesquisar,
  semAlteracao,
  compacto,
  tituloExtra,
  className,
}: FiltrosBarProps) {
  const set = (parcial: Partial<FiltrosValor>) => onValueChange({ ...value, ...parcial })

  // No celular, a pesquisa que começou recolhe os filtros (padrão dos módulos —
  // AGENTS.md da raiz): a tela fica para o resultado; a seta do cabeçalho reabre.
  // O ListHeader não expõe o estado, então aciona o próprio botão de recolher —
  // só se ele estiver visível (no `sm+` os filtros não recolhem).
  const raiz = useRef<HTMLDivElement>(null)
  const pesquisarERecolher = () => {
    if (!onPesquisar()) return
    const recolher = raiz.current?.querySelector<HTMLButtonElement>(
      'button[aria-expanded="true"][aria-label="Recolher filtros"]'
    )
    if (recolher && recolher.offsetParent !== null) recolher.click()
  }

  const botao = (
    <Button
      className={compacto ? 'h-11 w-full' : undefined}
      onClick={pesquisarERecolher}
      loading={pesquisando}
      disabled={value.operacaoRef === null || (semAlteracao && !pesquisando)}
      data-tour="fechamento-ifood-diario-pesquisar"
    >
      <Search className="h-4 w-4" /> Pesquisar
    </Button>
  )

  return (
    <div ref={raiz} className="contents">
      <ListHeader
        title={NOME_MODULO}
        titleExtra={tituloExtra}
        subtitle="Fechamento dos pedidos iFood de uma loja num dia."
        controlsTourId="fechamento-ifood-diario-filtros"
        className={cn(
          'rounded-lg border border-border bg-surface',
          // Área estreita em tela larga (painel lateral): empilha como no celular.
          compacto && 'sm:flex-col sm:items-stretch',
          className
        )}
      >
        <div className={compacto ? 'flex flex-col gap-3' : 'flex flex-wrap items-end gap-3'}>
          <Field label="Loja" className={compacto ? 'w-full' : 'w-80'}>
            {(controle) => (
              <SearchableSelect<string>
                triggerProps={controle}
                options={lojas.map((l) => ({
                  value: l.ref,
                  label: l.nome,
                  description:
                    [l.ativo ? null : 'Inativa', l.temIfood ? null : 'Sem iFood']
                      .filter(Boolean)
                      .join(' · ') || undefined,
                }))}
                value={value.operacaoRef}
                onChange={(operacaoRef) => set({ operacaoRef })}
                placeholder={lojasLoading ? 'Carregando lojas…' : 'Selecione a loja'}
                searchPlaceholder="Buscar loja…"
                emptyLabel="Nenhuma loja disponível"
                disabled={lojasLoading}
              />
            )}
          </Field>

          <Field label="Dia" className={compacto ? 'w-full' : 'w-44'}>
            {(controle) => (
              <DatePicker
                {...controle}
                value={value.data}
                max={hojeLocal()}
                onChange={(data) => set({ data })}
              />
            )}
          </Field>

          {/* Botão desativado não recebe o mouse: a dica fica num invólucro focável. */}
          <div className={compacto ? 'w-full' : undefined}>
            {semAlteracao && !pesquisando ? (
              <Dica content="Nenhum filtro mudou desde a última pesquisa — o resultado na tela já é este.">
                <span
                  tabIndex={0}
                  className="inline-flex w-full rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {botao}
                </span>
              </Dica>
            ) : (
              botao
            )}
          </div>
        </div>
      </ListHeader>
    </div>
  )
}
