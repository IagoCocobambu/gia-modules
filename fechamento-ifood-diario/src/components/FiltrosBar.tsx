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
  /**
   * Depois da pesquisa, fora do celular: uma linha só, sem o subtítulo e sem os
   * rótulos acima dos campos (padrão 8 do AGENTS.md da raiz) — sobra altura para a
   * tabela em monitor pequeno.
   */
  enxuto?: boolean
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
  enxuto = false,
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

  const seletorLoja = (controle: Record<string, unknown>) => (
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
  )
  const seletorDia = (controle: Record<string, unknown>) => (
    <DatePicker
      {...controle}
      value={value.data}
      max={hojeLocal()}
      onChange={(data) => set({ data })}
    />
  )
  // Botão desativado não recebe o mouse: a dica fica num invólucro focável. Largura
  // total só no celular — na linha enxuta ele empurraria o botão para baixo.
  const pesquisar =
    semAlteracao && !pesquisando ? (
      <Dica content="Nenhum filtro mudou desde a última pesquisa — o resultado na tela já é este.">
        <span
          tabIndex={0}
          className={cn(
            'inline-flex rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            compacto && 'w-full'
          )}
        >
          {botao}
        </span>
      </Dica>
    ) : (
      botao
    )

  // Forma enxuta (depois da pesquisa, fora do celular): título e campos numa linha.
  if (enxuto && !compacto) {
    return (
      <div
        className={cn(
          'flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-border bg-surface px-3 py-2 transition-all duration-default ease-default',
          className
        )}
        data-tour="fechamento-ifood-diario-filtros"
      >
        <div className="flex min-w-0 items-center gap-1">
          <h1 className="truncate text-sm font-semibold text-foreground">{NOME_MODULO}</h1>
          {tituloExtra}
        </div>
        <div className="ml-auto flex min-w-0 items-center gap-2">
          <div className="w-64 min-w-0 shrink">{seletorLoja({ 'aria-label': 'Loja' })}</div>
          <div className="w-44 shrink-0">{seletorDia({ 'aria-label': 'Dia' })}</div>
          {pesquisar}
        </div>
      </div>
    )
  }

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
            {(controle) => seletorLoja(controle)}
          </Field>

          <Field label="Dia" className={compacto ? 'w-full' : 'w-44'}>
            {(controle) => seletorDia(controle)}
          </Field>

          <div className={compacto ? 'w-full' : undefined}>{pesquisar}</div>
        </div>
      </ListHeader>
    </div>
  )
}
