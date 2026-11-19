import { useRef, type ReactNode } from 'react'
import { History, Save, Search } from 'lucide-react'
import { Button, DatePicker, Field, ListHeader, SearchableSelect } from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'
import { mesAtual, NOME_MODULO } from '../helpers'
import type { LojaIfood } from '../types'
import { Dica } from './Dica'

/**
 * Operações da loja com iFood, para a descrição do seletor (igual ao Fechamento iFood
 * Diário): "3 operações no iFood: cb, cbx, vst". Sem nenhuma: "Sem iFood".
 */
function resumoIfood(l: LojaIfood): string {
  if (l.restaurantes.length === 0) return 'Sem iFood'
  const ops = [
    ...new Set(
      l.restaurantes.map((r) => r.operacao.replace(/^\s*\d+\s*/, '').trim()).filter(Boolean)
    ),
  ]
  if (ops.length === 0) {
    const n = l.restaurantes.length
    return `${n} ${n === 1 ? 'restaurante' : 'restaurantes'} no iFood`
  }
  return `${ops.length} ${ops.length === 1 ? 'operação' : 'operações'} no iFood: ${ops.join(', ')}`
}

export interface FiltrosValor {
  /** Empresa (loja) escolhida — o fechamento junta todas as operações dela. */
  empresaId: number | null
  mes: string
  /** TESTE: só esta operação da loja ("01 cb"); `null` = todas. */
  operacao: string | null
}

interface FiltrosBarProps {
  value: FiltrosValor
  onValueChange: (value: FiltrosValor) => void
  lojas: LojaIfood[]
  /**
   * TESTE (`GIA_DEV_IFOOD_MENSAL_POR_OPERACAO=1` no servidor): mostra o seletor de UMA
   * operação da loja, para comparar com o legado. Sem isso, a consulta junta todas.
   */
  porOperacao?: boolean
  lojasLoading: boolean
  consultando: boolean
  /** Dispara a consulta; `false` = recusada (loja não escolhida, nada mudou), os filtros ficam abertos. */
  onConsultar: () => boolean
  /** Loja e mês iguais aos da tela: Consultar fica desativado. */
  semAlteracao: boolean
  /** Botão Salvar (só com a permissão de edição). */
  podeSalvar: boolean
  salvarHabilitado: boolean
  salvando: boolean
  alteracoesPendentes: boolean
  onSalvar: () => void
  /**
   * Abre o histórico das gravações do mês (só com o fechamento na tela). `undefined`
   * = sem consulta: o botão não aparece.
   */
  onHistorico?: () => void
  /** Histórico visível, mas desativado (consulta em andamento, nada chegou ainda). */
  historicoDesativado?: boolean
  /** Texto da dica do Histórico (ex.: "Última gravação: 10/11/2026, 17:46"). */
  dicaHistorico?: string
  /** Layout de celular: campos empilhados, ocupando a largura toda. */
  compacto: boolean
  /**
   * Depois da primeira consulta, fora do celular: uma linha só, sem o subtítulo e
   * sem os rótulos acima dos campos — sobra altura para a tabela em monitor pequeno.
   */
  enxuto?: boolean
  tituloExtra?: ReactNode
}

export function FiltrosBar({
  value,
  onValueChange,
  lojas,
  porOperacao = false,
  lojasLoading,
  consultando,
  onConsultar,
  semAlteracao,
  podeSalvar,
  salvarHabilitado,
  salvando,
  alteracoesPendentes,
  onSalvar,
  onHistorico,
  historicoDesativado = false,
  dicaHistorico,
  compacto,
  enxuto = false,
  tituloExtra,
}: FiltrosBarProps) {
  const set = (parcial: Partial<FiltrosValor>) => onValueChange({ ...value, ...parcial })
  // TESTE: operações da loja escolhida, para consultar uma só.
  const operacoesDaLoja = [
    ...new Set(
      (lojas.find((l) => l.empresaId === value.empresaId)?.restaurantes ?? []).map(
        (r) => r.operacao
      )
    ),
  ].filter(Boolean)
  const seletorOperacao = (controle: Record<string, unknown>) => (
    <SearchableSelect<string>
      triggerProps={controle}
      options={[
        { value: '', label: 'Todas as operações' },
        ...operacoesDaLoja.map((o) => ({ value: o, label: o })),
      ]}
      value={value.operacao ?? ''}
      onChange={(o) => set({ operacao: o || null })}
      placeholder="Todas as operações"
      searchPlaceholder="Buscar operação…"
      emptyLabel="Nenhuma operação"
      disabled={lojasLoading || operacoesDaLoja.length === 0}
    />
  )

  // No celular, a consulta que começou recolhe os filtros (padrão dos módulos —
  // AGENTS.md da raiz): a tela fica para o resultado; a seta do cabeçalho reabre.
  // O ListHeader não expõe o estado, então aciona o próprio botão de recolher —
  // só se ele estiver visível (no `sm+` os filtros não recolhem).
  const raiz = useRef<HTMLDivElement>(null)
  const consultarERecolher = () => {
    if (!onConsultar()) return
    const recolher = raiz.current?.querySelector<HTMLButtonElement>(
      'button[aria-expanded="true"][aria-label="Recolher filtros"]'
    )
    if (recolher && recolher.offsetParent !== null) recolher.click()
  }

  // Mesma lista do Fechamento iFood Diário: as Empresas (lojas) do escopo, com as
  // operações no iFood embaixo do nome. Loja sem iFood é recusada ao Consultar.
  const opcoes = lojas.map((l) => ({
    value: l.empresaId,
    label: l.nome,
    description: [l.ativo ? null : 'Inativa', resumoIfood(l)].filter(Boolean).join(' · '),
  }))

  const botaoConsultar = (
    <Button
      className={compacto ? 'h-11 w-full' : undefined}
      onClick={consultarERecolher}
      loading={consultando}
      disabled={value.empresaId === null || (semAlteracao && !consultando)}
      data-tour="fechamento-ifood-mensal-consultar"
    >
      <Search className="h-4 w-4" /> Consultar
    </Button>
  )

  const seletorLoja = (controle: Record<string, unknown>) => (
    <SearchableSelect<number>
      triggerProps={controle}
      options={opcoes}
      value={value.empresaId}
      onChange={(empresaId) => set({ empresaId, operacao: null })}
      placeholder={lojasLoading ? 'Carregando lojas…' : 'Selecione a loja'}
      searchPlaceholder="Buscar loja…"
      emptyLabel="Nenhuma loja disponível"
      disabled={lojasLoading}
    />
  )
  const seletorMes = (controle: Record<string, unknown>) => (
    <DatePicker
      {...controle}
      mode="month"
      size="md"
      value={value.mes}
      max={mesAtual()}
      onChange={(mes) => set({ mes })}
    />
  )
  const consultar =
    semAlteracao && !consultando ? (
      <Dica content="Loja e mês não mudaram — o fechamento na tela já é este.">
        <span
          tabIndex={0}
          className={cn(
            'inline-flex rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            compacto && 'w-full'
          )}
        >
          {botaoConsultar}
        </span>
      </Dica>
    ) : (
      botaoConsultar
    )
  const salvar = podeSalvar && (
    <Button
      variant="secondary"
      className={cn('relative', compacto && 'h-11 w-full')}
      onClick={onSalvar}
      loading={salvando}
      disabled={!salvarHabilitado}
      data-tour="fechamento-ifood-mensal-salvar"
    >
      <Save className="h-4 w-4" /> Salvar
      {alteracoesPendentes && (
        <span
          aria-label="Há alterações não salvas"
          className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-warning ring-2 ring-surface"
        />
      )}
    </Button>
  )

  // Histórico das gravações do mês: ao lado do Salvar, só com o fechamento na tela.
  const historico = onHistorico && (
    <Dica content={dicaHistorico ?? 'Quem salvou o fechamento do mês, quando e o que mudou'}>
      <Button
        variant="ghost"
        className={cn(compacto && 'h-11 w-full')}
        onClick={onHistorico}
        disabled={historicoDesativado}
        data-tour="fechamento-ifood-mensal-historico"
      >
        <History className="h-4 w-4" /> Histórico
      </Button>
    </Dica>
  )

  // Forma enxuta (depois da consulta, fora do celular): título e campos numa linha.
  if (enxuto && !compacto) {
    return (
      <div
        className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-border bg-surface px-3 py-2"
        data-tour="fechamento-ifood-mensal-filtros"
      >
        <div className="flex min-w-0 items-center gap-1">
          <h1 className="truncate text-sm font-semibold text-foreground">{NOME_MODULO}</h1>
          {tituloExtra}
        </div>
        <div className="ml-auto flex min-w-0 items-center gap-2">
          <div className="w-56 min-w-0 shrink">{seletorLoja({ 'aria-label': 'Loja' })}</div>
          {porOperacao && (
            <div className="w-40 shrink-0">
              {seletorOperacao({ 'aria-label': 'Operação (teste)' })}
            </div>
          )}
          <div className="w-44 shrink-0">{seletorMes({ 'aria-label': 'Mês de referência' })}</div>
          {consultar}
          {salvar}
          {historico}
        </div>
      </div>
    )
  }

  return (
    <div ref={raiz} className="contents">
      <ListHeader
        title={NOME_MODULO}
        titleExtra={tituloExtra}
        subtitle="Conciliação mensal do iFood por loja: repasses, descontos, adquirentes e extrato."
        controlsTourId="fechamento-ifood-mensal-filtros"
        className={cn(
          'rounded-lg border border-border bg-surface',
          compacto && 'sm:flex-col sm:items-stretch'
        )}
      >
        <div className={compacto ? 'flex flex-col gap-3' : 'flex flex-wrap items-end gap-3'}>
          <Field label="Loja" className={compacto ? 'w-full' : 'w-80'}>
            {(controle) => seletorLoja(controle)}
          </Field>

          {porOperacao && (
            <Field label="Operação (teste)" className={compacto ? 'w-full' : 'w-48'}>
              {(controle) => seletorOperacao(controle)}
            </Field>
          )}

          <Field label="Mês de referência" className={compacto ? 'w-full' : 'w-48'}>
            {(controle) => seletorMes(controle)}
          </Field>

          <div className={compacto ? 'grid grid-cols-1 gap-2' : 'flex items-end gap-2'}>
            {consultar}
            {salvar}
            {historico}
          </div>
        </div>
      </ListHeader>
    </div>
  )
}
