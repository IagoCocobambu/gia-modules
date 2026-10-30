import { Search } from 'lucide-react'
import { Button, DatePicker, Field, SearchableSelect, Tooltip } from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'
import { hojeLocal } from '../helpers'
import type { FechamentoLoja } from '../types'

export interface FiltrosValor {
  empresaId: number | null
  de: string
  ate: string
}

interface FiltrosBarProps {
  value: FiltrosValor
  onValueChange: (value: FiltrosValor) => void
  lojas: FechamentoLoja[]
  lojasLoading: boolean
  pesquisando: boolean
  onPesquisar: () => void
  /** Os campos são iguais aos da pesquisa na tela: Pesquisar fica desativado. */
  semAlteracao: boolean
  /** Layout de celular: campos empilhados, ocupando a largura toda. */
  compacto: boolean
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
  className,
}: FiltrosBarProps) {
  const hoje = hojeLocal()
  const set = (parcial: Partial<FiltrosValor>) => onValueChange({ ...value, ...parcial })

  const botao = (
    <Button
      className={compacto ? 'h-11 w-full' : undefined}
      onClick={onPesquisar}
      loading={pesquisando}
      disabled={value.empresaId === null || (semAlteracao && !pesquisando)}
      data-tour="fechamento-maestro-pesquisar"
    >
      <Search className="h-4 w-4" /> Pesquisar
    </Button>
  )

  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-surface p-3',
        compacto ? 'flex flex-col gap-3' : 'flex flex-wrap items-end gap-3',
        className
      )}
      data-tour="fechamento-maestro-filtros"
    >
      <Field label="Loja" className={compacto ? 'w-full' : 'w-80'}>
        {(controle) => (
          <SearchableSelect<number>
            triggerProps={controle}
            options={lojas.map((l) => ({
              value: l.empresaId,
              label: l.nome,
              description: l.ativo ? undefined : 'Inativa',
            }))}
            value={value.empresaId}
            onChange={(empresaId) => set({ empresaId })}
            placeholder={lojasLoading ? 'Carregando lojas…' : 'Selecione a loja'}
            searchPlaceholder="Buscar loja…"
            emptyLabel="Nenhuma loja disponível"
            disabled={lojasLoading}
          />
        )}
      </Field>

      <div className={compacto ? 'grid grid-cols-2 gap-3' : 'contents'}>
        <Field label="Data inicial" className={compacto ? 'min-w-0' : 'w-44'}>
          {(controle) => (
            <DatePicker {...controle} value={value.de} max={hoje} onChange={(de) => set({ de })} />
          )}
        </Field>
        <Field label="Data final" className={compacto ? 'min-w-0' : 'w-44'}>
          {(controle) => (
            <DatePicker
              {...controle}
              value={value.ate}
              max={hoje}
              onChange={(ate) => set({ ate })}
            />
          )}
        </Field>
      </div>

      {/* Botão desativado não recebe o mouse: a dica fica num invólucro focável. */}
      <div className={compacto ? 'w-full' : 'ml-auto'}>
        {semAlteracao && !pesquisando ? (
          <Tooltip content="Nenhum filtro mudou desde a última pesquisa — o resultado na tela já é este.">
            <span
              tabIndex={0}
              className="inline-flex w-full rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {botao}
            </span>
          </Tooltip>
        ) : (
          botao
        )}
      </div>
    </div>
  )
}
