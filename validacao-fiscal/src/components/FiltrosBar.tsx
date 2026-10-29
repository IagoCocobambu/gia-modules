import { useState } from 'react'
import { Lock, LockOpen, Search } from 'lucide-react'
import {
  Button,
  ConfirmDialog,
  DatePicker,
  Field,
  Input,
  SearchableSelect,
  Tooltip,
} from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'
import { formatDataHora, hojeLocal, limitarJanela, MAX_JANELA_HORAS } from '../helpers'
import type { ValidacaoFiscalLoja } from '../types'
import { Recolhivel } from './Recolhivel'

export interface FiltrosValor {
  empresaId: number | null
  de: string
  ate: string
  janelaAntes: number
  janelaApos: number
}

interface FiltrosBarProps {
  value: FiltrosValor
  onValueChange: (value: FiltrosValor) => void
  lojas: ValidacaoFiscalLoja[]
  lojasLoading: boolean
  pesquisando: boolean
  onPesquisar: () => void
  /** Os campos são iguais aos da pesquisa na tela: Pesquisar fica desativado. */
  semAlteracao: boolean
  /** Layout de celular: filtros num acordeão, janelas num acordeão interno. */
  compacto: boolean
  /** Acordeão dos filtros aberto (só no layout compacto). */
  aberto: boolean
  onAbertoChange: (aberto: boolean) => void
}

function JanelaInput({
  label,
  valor,
  bloqueada,
  onValor,
}: {
  label: string
  valor: number
  bloqueada: boolean
  onValor: (v: number) => void
}) {
  return (
    <Field label={label} className="min-w-0 flex-1">
      {(controle) => (
        <Input
          {...controle}
          type="number"
          inputMode="numeric"
          min={0}
          max={MAX_JANELA_HORAS}
          value={valor}
          disabled={bloqueada}
          onChange={(e) => onValor(limitarJanela(Number(e.target.value)))}
          className="tabular-nums"
        />
      )}
    </Field>
  )
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
  aberto,
  onAbertoChange,
}: FiltrosBarProps) {
  const [bloqueada, setBloqueada] = useState(true)
  const [confirmando, setConfirmando] = useState(false)
  const [janelasAbertas, setJanelasAbertas] = useState(false)
  const hoje = hojeLocal()
  const set = (parcial: Partial<FiltrosValor>) => onValueChange({ ...value, ...parcial })

  const campoLoja = (
    <Field label="Loja" className={compacto ? 'w-full' : 'w-72'}>
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
          emptyLabel="Nenhuma loja com vínculo à BI do Simphony"
          disabled={lojasLoading}
        />
      )}
    </Field>
  )

  const campoDe = (
    <Field label="Data inicial" className={compacto ? 'min-w-0' : 'w-44'}>
      {(controle) => (
        <DatePicker {...controle} value={value.de} max={hoje} onChange={(de) => set({ de })} />
      )}
    </Field>
  )

  const campoAte = (
    <Field label="Data final" className={compacto ? 'min-w-0' : 'w-44'}>
      {(controle) => (
        <DatePicker {...controle} value={value.ate} max={hoje} onChange={(ate) => set({ ate })} />
      )}
    </Field>
  )

  const camposJanela = (
    <div className={cn('flex items-end gap-2', compacto ? 'w-full' : 'w-72')}>
      <JanelaInput
        label="Janela Antes (h)"
        valor={value.janelaAntes}
        bloqueada={bloqueada}
        onValor={(janelaAntes) => set({ janelaAntes })}
      />
      <JanelaInput
        label="Janela Após (h)"
        valor={value.janelaApos}
        bloqueada={bloqueada}
        onValor={(janelaApos) => set({ janelaApos })}
      />
      <Tooltip
        content={
          bloqueada
            ? `Nota emitida até X h antes ou depois do fechamento da conta (máx. ${MAX_JANELA_HORAS} h). Clique para desbloquear.`
            : `Janelas desbloqueadas — de 0 a ${MAX_JANELA_HORAS} h. Clique para bloquear.`
        }
      >
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={cn('shrink-0', compacto && 'h-11 w-11')}
          aria-label={bloqueada ? 'Desbloquear janelas de tempo' : 'Bloquear janelas de tempo'}
          aria-pressed={!bloqueada}
          // Desbloquear pede confirmação; bloquear de novo é direto (mantém os valores).
          onClick={() => (bloqueada ? setConfirmando(true) : setBloqueada(true))}
        >
          {bloqueada ? <Lock className="h-4 w-4" /> : <LockOpen className="h-4 w-4" />}
        </Button>
      </Tooltip>
    </div>
  )

  const botao = (
    <Button
      className={compacto ? 'h-11 w-full' : undefined}
      onClick={onPesquisar}
      loading={pesquisando}
      disabled={value.empresaId === null || (semAlteracao && !pesquisando)}
      data-tour="validacao-fiscal-pesquisar"
    >
      <Search className="h-4 w-4" /> Pesquisar
    </Button>
  )
  // Botão desativado não recebe o mouse: a dica fica num invólucro focável.
  const botaoPesquisar = (
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
  )

  const confirmacao = (
    <ConfirmDialog
      open={confirmando}
      onOpenChange={setConfirmando}
      tone="warning"
      title="Alterar as janelas de tempo?"
      description="As janelas definem quanto antes e quanto depois do fechamento da conta uma nota ainda é considerada dela. O padrão (12 h / 12 h) cobre a operação normal. Cada janela aceita de 0 a 24 h: ampliar pode casar notas de outras contas com o mesmo número, e reduzir pode gerar falsos 'Conta sem XML'."
      confirmLabel="Desbloquear"
      onConfirm={() => {
        setBloqueada(false)
        setConfirmando(false)
      }}
    />
  )

  if (!compacto) {
    return (
      <div
        className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-surface p-3"
        data-tour="validacao-fiscal-filtros"
      >
        {campoLoja}
        {campoDe}
        {campoAte}
        <div data-tour="validacao-fiscal-janelas">{camposJanela}</div>
        {botaoPesquisar}
        {confirmacao}
      </div>
    )
  }

  // Celular: tudo num acordeão; o cabeçalho mostra o que está escolhido.
  const lojaNome = lojas.find((l) => l.empresaId === value.empresaId)?.nome
  const periodo =
    value.de === value.ate
      ? formatDataHora(value.de)
      : `${formatDataHora(value.de)} a ${formatDataHora(value.ate)}`
  const textoJanelas = `−${value.janelaAntes} h / +${value.janelaApos} h${bloqueada ? '' : ' · desbloqueadas'}`

  return (
    <Recolhivel
      titulo="Filtros"
      resumo={`${lojaNome ?? 'Selecione a loja'} · ${periodo}`}
      aberto={aberto}
      onAbertoChange={onAbertoChange}
      data-tour="validacao-fiscal-filtros"
    >
      <div className="flex flex-col gap-3 border-t border-border p-3">
        {campoLoja}
        <div className="grid grid-cols-2 gap-3">
          {campoDe}
          {campoAte}
        </div>
        <Recolhivel
          titulo="Janelas de tempo"
          resumo={textoJanelas}
          variante="embutido"
          aberto={janelasAbertas}
          onAbertoChange={setJanelasAbertas}
          data-tour="validacao-fiscal-janelas"
        >
          <div className="space-y-2 px-1 pb-1 pt-1">
            {camposJanela}
            <p className="text-xs text-muted-foreground">
              Nota emitida até X h antes ou depois do fechamento da conta (máx. {MAX_JANELA_HORAS}{' '}
              h). Toque no cadeado para {bloqueada ? 'desbloquear' : 'bloquear'}.
            </p>
          </div>
        </Recolhivel>
        {botaoPesquisar}
      </div>
      {confirmacao}
    </Recolhivel>
  )
}
