import { useRef, type ReactNode } from 'react'
import { Search } from 'lucide-react'
import { Button, DatePicker, Field, ListHeader, SearchableSelect } from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'
import { hojeLocal, NOME_MODULO } from '../helpers'
import type { DashboardLoja } from '../types'
import { Dica } from './Dica'

export interface FiltrosValor {
  empresaId: number | null
  /** `YYYY-MM-DD`; vazio = último dia de negócio da loja. */
  data: string
}

interface FiltrosBarProps {
  value: FiltrosValor
  onValueChange: (value: FiltrosValor) => void
  lojas: DashboardLoja[]
  lojasLoading: boolean
  pesquisando: boolean
  /** Dispara a pesquisa; `false` = recusada (filtro inválido), os filtros ficam abertos. */
  onPesquisar: () => boolean
  /** Os campos são iguais aos da pesquisa na tela: Pesquisar fica desativado. */
  semAlteracao: boolean
  /** Layout de celular: campos empilhados, ocupando a largura toda. */
  compacto: boolean
  /**
   * Há resultado na tela: fora do celular a barra vira uma linha só (título, campos
   * e Pesquisar), sem subtítulo nem rótulos — padrão 8 do AGENTS.md da raiz.
   */
  enxuto?: boolean
  /** Ao lado do título do módulo (o botão de rever o tour). */
  tituloExtra?: ReactNode
  className?: string
}

const PLACEHOLDER_DATA = 'Último dia'

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
  const hoje = hojeLocal()
  const set = (parcial: Partial<FiltrosValor>) => onValueChange({ ...value, ...parcial })

  // No celular, a pesquisa que começou recolhe os filtros (padrão 1 do AGENTS.md da
  // raiz): a tela fica para o resultado; a seta do cabeçalho reabre. O ListHeader
  // não expõe o estado, então aciona o próprio botão de recolher — só se ele estiver
  // visível (no `sm+` os filtros não recolhem).
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
      disabled={value.empresaId === null || (semAlteracao && !pesquisando)}
      data-tour="dashboard-simphony-pesquisar"
    >
      <Search className="h-4 w-4" /> Pesquisar
    </Button>
  )

  const seletorLoja = (controle: Record<string, unknown>) => (
    <SearchableSelect<number>
      triggerProps={controle}
      options={lojas.map((l) => ({ value: l.empresaId, label: l.nome }))}
      value={value.empresaId}
      onChange={(empresaId) => set({ empresaId })}
      placeholder={lojasLoading ? 'Carregando lojas…' : 'Selecione a loja'}
      searchPlaceholder="Buscar loja…"
      emptyLabel="Nenhuma loja disponível"
      disabled={lojasLoading}
    />
  )
  // Vazio = último dia de negócio da loja (a BI decide); o "Limpar" do calendário
  // volta para ele.
  const seletorData = (controle: Record<string, unknown>) => (
    <DatePicker
      {...controle}
      value={value.data}
      max={hoje}
      placeholder={PLACEHOLDER_DATA}
      onChange={(data) => set({ data })}
    />
  )
  // Botão desativado não recebe o mouse: a dica fica num invólucro focável. Na
  // linha enxuta o invólucro não leva `w-full` (empurraria o botão para baixo).
  const pesquisar =
    semAlteracao && !pesquisando ? (
      <Dica content="Nenhum filtro mudou desde a última pesquisa — use Atualizar, na tabela, para buscar de novo.">
        <span
          tabIndex={0}
          className={cn(
            'inline-flex rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            !enxuto && 'w-full'
          )}
        >
          {botao}
        </span>
      </Dica>
    ) : (
      botao
    )

  // Depois da pesquisa, fora do celular: uma linha só (padrão 8), para sobrar
  // altura para a tabela. No celular vale o recolher do ListHeader (padrão 1).
  if (enxuto && !compacto) {
    return (
      <div
        className={cn(
          'flex shrink-0 items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2 transition-all duration-default ease-default',
          className
        )}
        data-tour="dashboard-simphony-filtros"
      >
        <div className="flex min-w-0 shrink items-center gap-1">
          <h1 className="truncate text-sm font-semibold text-foreground">{NOME_MODULO}</h1>
          {tituloExtra}
        </div>
        <div className="ml-auto flex min-w-0 items-center gap-2">
          <div className="w-56 min-w-36 shrink">{seletorLoja({ 'aria-label': 'Loja' })}</div>
          <div className="w-44 shrink-0">{seletorData({ 'aria-label': 'Dia de negócio' })}</div>
          <div className="shrink-0">{pesquisar}</div>
        </div>
      </div>
    )
  }

  return (
    <div ref={raiz} className="contents">
      <ListHeader
        title={NOME_MODULO}
        titleExtra={tituloExtra}
        subtitle="Vendas do dia da loja na BI do Simphony: totais, itens mais vendidos e funcionários."
        controlsTourId="dashboard-simphony-filtros"
        className={cn(
          'rounded-lg border border-border bg-surface',
          // Área estreita em tela larga (painel lateral): empilha como no celular.
          compacto && 'sm:flex-col sm:items-stretch',
          className
        )}
      >
        <div className={compacto ? 'flex w-full flex-col gap-3' : 'flex flex-wrap items-end gap-3'}>
          <Field label="Loja" className={compacto ? 'w-full' : 'w-56'}>
            {(controle) => seletorLoja(controle)}
          </Field>
          <Field label="Dia de negócio" className={compacto ? 'w-full' : 'w-44'}>
            {(controle) => seletorData(controle)}
          </Field>
          <div className={compacto ? 'w-full' : undefined}>{pesquisar}</div>
        </div>
      </ListHeader>
    </div>
  )
}
