import { useRef, type ReactNode } from 'react'
import { Search } from 'lucide-react'
import { Button, DatePicker, Field, ListHeader, SearchableSelect } from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'
import { hojeLocal, NOME_MODULO } from '../helpers'
import type { FechamentoLoja } from '../types'
import { Dica } from './Dica'

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
  /**
   * Seletor de canal, à esquerda do Pesquisar. Diferente da loja e do período, ele
   * recorta o resultado na hora, sem nova pesquisa (quem filtra é a tela).
   */
  seletorCanal?: ReactNode
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
  seletorCanal,
  className,
}: FiltrosBarProps) {
  const hoje = hojeLocal()
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
      disabled={value.empresaId === null || (semAlteracao && !pesquisando)}
      data-tour="fechamento-maestro-pesquisar"
    >
      <Search className="h-4 w-4" /> Pesquisar
    </Button>
  )

  const seletorLoja = (controle: Record<string, unknown>) => (
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
  )
  const seletorDe = (controle: Record<string, unknown>) => (
    <DatePicker {...controle} value={value.de} max={hoje} onChange={(de) => set({ de })} />
  )
  const seletorAte = (controle: Record<string, unknown>) => (
    <DatePicker {...controle} value={value.ate} max={hoje} onChange={(ate) => set({ ate })} />
  )
  // Botão desativado não recebe o mouse: a dica fica num invólucro focável. Na
  // linha enxuta o invólucro não leva `w-full` (empurraria o botão para baixo).
  const pesquisar =
    semAlteracao && !pesquisando ? (
      <Dica content="Nenhum filtro mudou desde a última pesquisa — o resultado na tela já é este.">
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
        data-tour="fechamento-maestro-filtros"
      >
        {/* Sem quebra de linha: em tela estreita o título encurta (…), não desce. */}
        <div className="flex min-w-0 shrink items-center gap-1">
          <h1 className="truncate text-sm font-semibold text-foreground">{NOME_MODULO}</h1>
          {tituloExtra}
        </div>
        <div className="ml-auto flex min-w-0 items-center gap-2">
          <div className="w-56 min-w-36 shrink">{seletorLoja({ 'aria-label': 'Loja' })}</div>
          <div className="w-40 shrink-0">{seletorDe({ 'aria-label': 'Data inicial' })}</div>
          <div className="w-40 shrink-0">{seletorAte({ 'aria-label': 'Data final' })}</div>
          {seletorCanal && (
            <div className="w-40 shrink-0" data-tour="fechamento-maestro-canal">
              {seletorCanal}
            </div>
          )}
          <div className="shrink-0">{pesquisar}</div>
        </div>
      </div>
    )
  }

  // Cabeçalho padrão do portal (o mesmo do Reports Maestro): título à esquerda,
  // formulário à direita. No celular o formulário desce para baixo do título e
  // recolhe pelo chevron do ListHeader, liberando a tela para os pedidos.
  return (
    <div ref={raiz} className="contents">
      <ListHeader
        title={NOME_MODULO}
        titleExtra={tituloExtra}
        subtitle="Fechamento diário do delivery do Maestro por loja e período."
        controlsTourId="fechamento-maestro-filtros"
        className={cn(
          'rounded-lg border border-border bg-surface',
          // Área estreita em tela larga (painel lateral): empilha como no celular.
          compacto && 'sm:flex-col sm:items-stretch',
          className
        )}
      >
        {/* No modo compacto em tela sm+ (tablet, painel estreito) o ListHeader alinha os
            controles à direita: w-full faz o formulário ocupar a largura toda. */}
        <div className={compacto ? 'flex w-full flex-col gap-3' : 'flex flex-wrap items-end gap-3'}>
          <Field label="Loja" className={compacto ? 'w-full' : 'w-52'}>
            {(controle) => seletorLoja(controle)}
          </Field>

          <div className={compacto ? 'grid grid-cols-2 gap-3' : 'contents'}>
            <Field label="Data inicial" className={compacto ? 'min-w-0' : 'w-40'}>
              {(controle) => seletorDe(controle)}
            </Field>
            <Field label="Data final" className={compacto ? 'min-w-0' : 'w-40'}>
              {(controle) => seletorAte(controle)}
            </Field>
          </div>

          {/* Canal e Pesquisar andam juntos: quando a linha não cabe, descem os dois. */}
          <div className={compacto ? 'contents' : 'flex items-end gap-3'}>
            {seletorCanal && (
              <Field label="Canal" className={compacto ? 'w-full' : 'w-40'}>
                {() => <div data-tour="fechamento-maestro-canal">{seletorCanal}</div>}
              </Field>
            )}

            <div className={compacto ? 'w-full' : undefined}>{pesquisar}</div>
          </div>
        </div>
      </ListHeader>
    </div>
  )
}
