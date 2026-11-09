import { useRef, type ReactNode } from 'react'
import { Search } from 'lucide-react'
import { Button, DatePicker, Field, ListHeader, SearchableSelect, Select } from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'
import { formatHora, hojeLocal, NOME_MODULO } from '../helpers'
import type { PagamentoLoja } from '../types'
import { Dica } from './Dica'

export interface FiltrosValor {
  empresaId: number | null
  de: string
  ate: string
  horaInicio: number
  horaFim: number
}

interface FiltrosBarProps {
  value: FiltrosValor
  onValueChange: (value: FiltrosValor) => void
  lojas: PagamentoLoja[]
  lojasLoading: boolean
  pesquisando: boolean
  /** Dispara a pesquisa; `false` = recusada (filtro inválido), os filtros ficam abertos. */
  onPesquisar: () => boolean
  /** Os campos são iguais aos da pesquisa na tela: Pesquisar fica desativado. */
  semAlteracao: boolean
  /** Layout de celular: campos empilhados, ocupando a largura toda. */
  compacto: boolean
  /**
   * Área média (tablet, notebook pequeno, painel lateral): os 6 controles não cabem
   * numa linha ao lado do título — vão em duas linhas alinhadas (Loja e datas;
   * horas e Pesquisar) em vez de quebrar soltos.
   */
  duasLinhas?: boolean
  /** Ao lado do título do módulo (o botão de rever o tour). */
  tituloExtra?: ReactNode
  className?: string
}

const HORAS = Array.from({ length: 24 }, (_, h) => h)

interface SeletorHoraProps {
  controle: { id: string }
  value: number
  onValueChange: (hora: number) => void
  /** Fim da faixa: 23 vale até 23:59. */
  fim?: boolean
  /** Celular: alvo de toque de 44px. */
  compacto?: boolean
  /** Horas que não podem ser escolhidas (a faixa precisa ter início < fim). */
  bloqueada: (hora: number) => boolean
}

function SeletorHora({
  controle,
  value,
  onValueChange,
  fim = false,
  compacto = false,
  bloqueada,
}: SeletorHoraProps) {
  return (
    <Select value={String(value)} onValueChange={(v) => onValueChange(Number(v))}>
      <Select.Trigger
        id={controle.id}
        // Mesmo fundo e altura dos campos de data ao lado; no celular, 44px de toque.
        className={cn('w-full bg-surface tabular-nums', compacto ? 'h-11' : 'h-[42px]')}
      />
      <Select.Content>
        {HORAS.map((h) => (
          <Select.Item key={h} value={String(h)} disabled={bloqueada(h)} className="tabular-nums">
            {formatHora(h, fim)}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
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
  duasLinhas = false,
  tituloExtra,
  className,
}: FiltrosBarProps) {
  // Classes de cada campo nos 3 layouts: celular (empilhado), duas linhas (grade de
  // 4 colunas) e uma linha (a Loja é o campo flexível; o resto tem a largura do
  // conteúdo, para os 6 controles caberem ao lado do título a partir de ~1280px).
  const modo = compacto ? 'celular' : duasLinhas ? 'duasLinhas' : 'linha'
  const cls = {
    raiz: {
      celular: 'flex w-full flex-col gap-3',
      duasLinhas: 'grid grid-cols-[6.5rem_6.5rem_9rem_9rem] items-end gap-3',
      linha: 'flex w-full items-end gap-3',
    },
    loja: {
      celular: 'w-full',
      duasLinhas: 'col-span-2',
      linha: 'min-w-52 max-w-80 flex-1 basis-52',
    },
    grupo: { celular: 'grid grid-cols-2 gap-3', duasLinhas: 'contents', linha: 'contents' },
    // As horas são um bloco de verdade (não `contents`): o passo "Faixa de horário"
    // do tour se ancora nele, e elemento `display: contents` não tem caixa na tela.
    grupoHora: {
      celular: 'grid grid-cols-2 gap-3',
      duasLinhas: 'col-span-2 grid grid-cols-2 items-end gap-3',
      linha: 'flex shrink-0 items-end gap-3',
    },
    // `px-3` no campo de data (o padrão é `px-4`): em 9rem o "08/11/2026" cortava.
    data: {
      // Celular: o campo de digitar a data com 44px de toque.
      celular: 'min-w-0 [&_input]:h-11',
      duasLinhas: 'min-w-0 [&_input]:px-3',
      linha: 'w-36 shrink-0 [&_input]:px-3',
    },
    hora: { celular: 'min-w-0', duasLinhas: 'min-w-0', linha: 'w-[5.5rem] shrink-0' },
    botao: { celular: 'w-full', duasLinhas: 'col-span-2', linha: 'shrink-0' },
  } as const

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
      // Mesma altura dos campos (42px); no celular, alvo de toque maior.
      className={compacto ? 'h-11 w-full' : 'h-[42px] w-full'}
      onClick={pesquisarERecolher}
      loading={pesquisando}
      disabled={value.empresaId === null || (semAlteracao && !pesquisando)}
      data-tour="pagamento-echeck-pesquisar"
    >
      <Search className="h-4 w-4" /> Pesquisar
    </Button>
  )

  return (
    <div ref={raiz} className="contents">
      <ListHeader
        title={NOME_MODULO}
        titleExtra={tituloExtra}
        subtitle="Pagamentos eCheck por loja, período e horário."
        controlsTourId="pagamento-echeck-filtros"
        className={cn(
          'rounded-lg border border-border bg-surface',
          // Área estreita em tela larga (painel lateral): empilha como no celular.
          compacto && 'sm:flex-col sm:items-stretch',
          className
        )}
      >
        <div className={cls.raiz[modo]}>
          <Field label="Loja" className={cls.loja[modo]}>
            {(controle) => (
              <SearchableSelect<number>
                triggerProps={controle}
                className={compacto ? 'h-11' : 'h-[42px]'}
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

          <div className={cls.grupo[modo]}>
            <Field label="Data inicial" className={cls.data[modo]}>
              {(controle) => (
                <DatePicker
                  {...controle}
                  value={value.de}
                  max={hoje}
                  onChange={(de) => set({ de })}
                />
              )}
            </Field>
            <Field label="Data final" className={cls.data[modo]}>
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

          {/* Faixa de horário do legado: começa na data inicial e termina na final. */}
          <div className={cls.grupoHora[modo]} data-tour="pagamento-echeck-horario">
            <Field label="Hora inicial" className={cls.hora[modo]}>
              {(controle) => (
                <SeletorHora
                  controle={controle}
                  value={value.horaInicio}
                  onValueChange={(horaInicio) => set({ horaInicio })}
                  compacto={compacto}
                  bloqueada={(h) => h >= value.horaFim}
                />
              )}
            </Field>
            <Field label="Hora final" className={cls.hora[modo]}>
              {(controle) => (
                <SeletorHora
                  controle={controle}
                  value={value.horaFim}
                  onValueChange={(horaFim) => set({ horaFim })}
                  compacto={compacto}
                  fim
                  bloqueada={(h) => h <= value.horaInicio}
                />
              )}
            </Field>
          </div>

          {/* Botão desativado não recebe o mouse: a dica fica num invólucro focável. */}
          <div className={cls.botao[modo]}>
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
