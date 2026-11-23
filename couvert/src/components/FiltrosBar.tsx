import { useRef, type ReactNode } from 'react'
import { Maximize2, Minimize2, RefreshCw, Search } from 'lucide-react'
import { Button, Field, ListHeader, SearchableSelect } from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'
import { NOME_MODULO } from '../helpers'
import type { LojaCouvert } from '../types'
import { Dica } from './Dica'

export interface FiltrosValor {
  empresaId: number | null
  rvc: number | null
}

interface FiltrosBarProps {
  value: FiltrosValor
  /** Troca de loja ou RVC. Não pesquisa: espera o clique, como nas outras telas. */
  onValueChange: (value: FiltrosValor) => void
  lojas: LojaCouvert[]
  lojasLoading: boolean
  consultando: boolean
  /** Dispara a pesquisa; `false` = recusada (falta loja ou RVC), os filtros ficam abertos. */
  onPesquisar: () => boolean
  /**
   * Loja e RVC iguais aos das mesas na tela: o botão vira **Atualizar** (busca de novo
   * na BI) em vez de Pesquisar.
   */
  mesmaPesquisa: boolean
  /** Dica do botão (dia de negócio e hora das mesas na tela). */
  dicaPesquisar?: string
  /** Layout de celular: campos empilhados, a barra recolhe ao pesquisar (padrão 1). */
  compacto: boolean
  /**
   * Com mesas na tela, fora do celular: uma linha só (padrão 8) — título e tour à
   * esquerda; loja, RVC, Pesquisar e tela cheia juntos à direita.
   */
  enxuto: boolean
  telaCheia: boolean
  onTelaCheia: () => void
  tituloExtra?: ReactNode
}

export function FiltrosBar({
  value,
  onValueChange,
  lojas,
  lojasLoading,
  consultando,
  onPesquisar,
  mesmaPesquisa,
  dicaPesquisar,
  compacto,
  enxuto,
  telaCheia,
  onTelaCheia,
  tituloExtra,
}: FiltrosBarProps) {
  const loja = lojas.find((l) => l.empresaId === value.empresaId)
  const rvcs = loja?.rvcs ?? []

  // No celular, a pesquisa que começou recolhe os filtros (padrão 1 do AGENTS.md da
  // raiz). O ListHeader não expõe o estado: aciona o próprio botão de recolher, só se
  // ele estiver visível (no `sm+` os filtros não recolhem).
  const raiz = useRef<HTMLDivElement>(null)
  const pesquisarERecolher = () => {
    if (!onPesquisar()) return
    const recolher = raiz.current?.querySelector<HTMLButtonElement>(
      'button[aria-expanded="true"][aria-label="Recolher filtros"]'
    )
    if (recolher && recolher.offsetParent !== null) recolher.click()
  }

  const seletorLoja = (controle: Record<string, unknown>) => (
    <SearchableSelect<number>
      triggerProps={controle}
      options={lojas.map((l) => ({
        value: l.empresaId,
        label: l.nome,
        description: l.rvcs.length === 0 ? 'Sem RVC configurado' : undefined,
      }))}
      value={value.empresaId}
      onChange={(empresaId) => {
        const nova = lojas.find((l) => l.empresaId === empresaId)
        onValueChange({ empresaId, rvc: nova?.rvcs[0]?.numero ?? null })
      }}
      placeholder={lojasLoading ? 'Carregando lojas…' : 'Selecione a loja'}
      searchPlaceholder="Buscar loja…"
      emptyLabel="Nenhuma loja com a BI do Simphony"
      disabled={lojasLoading}
    />
  )
  const seletorRvc = (controle: Record<string, unknown>) => (
    <SearchableSelect<number>
      triggerProps={controle}
      options={rvcs.map((r) => ({ value: r.numero, label: r.nome }))}
      value={value.rvc}
      onChange={(rvc) => onValueChange({ ...value, rvc })}
      placeholder={
        value.empresaId === null ? 'Escolha a loja' : rvcs.length === 0 ? 'Sem RVC' : 'Selecione'
      }
      searchPlaceholder="Buscar RVC…"
      emptyLabel="Nenhum RVC configurado"
      disabled={lojasLoading || rvcs.length === 0}
    />
  )

  const botao = (
    <Button
      className={compacto ? 'h-11 w-full' : undefined}
      onClick={pesquisarERecolher}
      loading={consultando}
      disabled={value.empresaId === null || value.rvc === null}
      data-tour="couvert-pesquisar"
    >
      {mesmaPesquisa ? (
        <>
          <RefreshCw className="h-4 w-4" /> Atualizar
        </>
      ) : (
        <>
          <Search className="h-4 w-4" /> Pesquisar
        </>
      )}
    </Button>
  )
  const pesquisar =
    dicaPesquisar && mesmaPesquisa ? <Dica content={dicaPesquisar}>{botao}</Dica> : botao

  if (enxuto && !compacto) {
    return (
      <div
        className="flex shrink-0 items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2"
        data-tour="couvert-filtros"
      >
        <div className="flex min-w-0 shrink items-center gap-1">
          <h1 className="truncate text-sm font-semibold text-foreground">{NOME_MODULO}</h1>
          {tituloExtra}
        </div>
        <div className="ml-auto flex min-w-0 items-center gap-2">
          <div className="w-64 min-w-36 shrink">{seletorLoja({ 'aria-label': 'Loja' })}</div>
          <div className="w-44 shrink-0">{seletorRvc({ 'aria-label': 'RVC (salão)' })}</div>
          <div className="shrink-0">{pesquisar}</div>
          <Dica content={telaCheia ? 'Sair da tela cheia (Esc)' : 'Tela cheia'}>
            <Button
              variant="ghost"
              size="icon"
              aria-label={telaCheia ? 'Sair da tela cheia' : 'Tela cheia'}
              aria-pressed={telaCheia}
              onClick={onTelaCheia}
              data-tour="couvert-tela-cheia"
            >
              {telaCheia ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </Dica>
        </div>
      </div>
    )
  }

  return (
    <div ref={raiz} className="contents">
      <ListHeader
        title={NOME_MODULO}
        titleExtra={tituloExtra}
        subtitle="Mesas abertas do salão e o couvert artístico lançado em cada uma."
        controlsTourId="couvert-filtros"
        className={cn(
          'shrink-0 rounded-lg border border-border bg-surface',
          compacto && 'sm:flex-col sm:items-stretch'
        )}
      >
        <div className={compacto ? 'flex flex-col gap-3' : 'flex flex-wrap items-end gap-3'}>
          <Field label="Loja" className={compacto ? 'w-full' : 'w-64'}>
            {(controle) => seletorLoja(controle)}
          </Field>
          <Field label="RVC (salão)" className={compacto ? 'w-full' : 'w-44'}>
            {(controle) => seletorRvc(controle)}
          </Field>
          <div className={compacto ? 'w-full' : undefined}>{pesquisar}</div>
        </div>
      </ListHeader>
    </div>
  )
}
