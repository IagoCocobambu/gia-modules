import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown, Filter } from 'lucide-react'
import { Button, SegmentedControl, Switch, type PeriodoDeMeses } from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'
import { mesesDoPeriodo, periodoAnterior, rotuloDoPeriodo, type ModoDeComparacao } from '../periodo'
import type { StatusPlano } from '../types'

// Os dois recortes finos da barra do topo, num botão só — o mesmo arranjo do
// Dashboard de RH (lá eram status e setor; aqui, status e mesmas lojas).
//
// ── STATUS DO PLANO ─────────────────────────────────────────────────────────
//
// Escolhe QUAIS operações marcadas entram na conta: só as com plano Pendente,
// Entregue ou Auditado. Num período, a operação passa se ALGUM mês tiver o status
// (a regra do RH, decidida pelo João em 14/09/2026).
//
// ── COMPARAR COM ────────────────────────────────────────────────────────────
//
// Contra o que a variação compara (decisão do João, 21/09/2026): a JANELA logo
// antes — a leitura do fechamento mensal — ou o MESMO PERÍODO do ano passado — a
// leitura da sazonalidade, que num restaurante decide (dezembro só se compara
// com dezembro). Num recorte de 12 meses as duas dão o mesmo intervalo, e o
// controle avisa isso em vez de fingir que há escolha.
//
// ── MESMAS LOJAS ────────────────────────────────────────────────────────────
//
// O "same stores" do HTML de especificação: só as operações com plano em TODOS os
// meses do período E do período anterior. Tira do número o efeito de loja que
// abriu, fechou ou ainda não entregou — o crescimento que sobra é o das lojas que
// já existiam.
//
// ── NADA AQUI CONSULTA ──────────────────────────────────────────────────────
//
// O painel escreve no RASCUNHO do recorte; quem busca é o **Consultar**. Vai por
// PORTAL: a barra quebra linha em tela estreita e recortaria um painel `absolute`.

export type FiltroStatus = 'Todos' | StatusPlano

const OPCOES_DE_STATUS: Array<{ value: FiltroStatus; label: string }> = [
  { value: 'Todos', label: 'Todos os status' },
  { value: 'Pendente', label: 'Pendente' },
  { value: 'Entregue', label: 'Entregue' },
  { value: 'Auditado', label: 'Auditado' },
]

interface Props {
  status: FiltroStatus
  onStatusChange: (status: FiltroStatus) => void
  mesmasLojas: boolean
  onMesmasLojasChange: (ligado: boolean) => void
  comparacao: ModoDeComparacao
  onComparacaoChange: (modo: ModoDeComparacao) => void
  /** O período do RASCUNHO — o rodapé mostra contra o que ele vai comparar. */
  periodo: PeriodoDeMeses
}

const LARGURA = 300

export function FiltrosDoPainel({
  status,
  onStatusChange,
  mesmasLojas,
  onMesmasLojasChange,
  comparacao,
  onComparacaoChange,
  periodo,
}: Props) {
  const [aberto, setAberto] = useState(false)
  const gatilho = useRef<HTMLButtonElement>(null)
  const painel = useRef<HTMLDivElement>(null)
  const [caixa, setCaixa] = useState<{ top: number; left: number } | null>(null)

  useLayoutEffect(() => {
    if (!aberto) return
    const r = gatilho.current?.getBoundingClientRect()
    if (!r) return
    setCaixa({
      top: r.bottom + 8,
      left: Math.max(8, Math.min(r.left, window.innerWidth - LARGURA - 8)),
    })
  }, [aberto])

  useEffect(() => {
    if (!aberto) return
    function foraDaqui(e: MouseEvent) {
      const alvo = e.target as Node
      if (painel.current?.contains(alvo) || gatilho.current?.contains(alvo)) return
      setAberto(false)
    }
    function escape(e: KeyboardEvent) {
      if (e.key === 'Escape') setAberto(false)
    }
    function fechar() {
      setAberto(false)
    }
    document.addEventListener('mousedown', foraDaqui, true)
    document.addEventListener('keydown', escape, true)
    window.addEventListener('resize', fechar)
    return () => {
      document.removeEventListener('mousedown', foraDaqui, true)
      document.removeEventListener('keydown', escape, true)
      window.removeEventListener('resize', fechar)
    }
  }, [aberto])

  const doze = mesesDoPeriodo(periodo).length === 12
  const ativos =
    (status !== 'Todos' ? 1 : 0) + (mesmasLojas ? 1 : 0) + (comparacao === 'ano' ? 1 : 0)
  // Com um filtro só, o botão diz QUAL — "Pendente" lê melhor que "Filtros · 1".
  const rotulo =
    ativos === 0
      ? 'Filtros'
      : ativos > 1
        ? `Filtros · ${ativos}`
        : status !== 'Todos'
          ? status
          : mesmasLojas
            ? 'Mesmas lojas'
            : 'Ano passado'

  return (
    <>
      <Button
        ref={gatilho}
        variant={ativos > 0 ? 'secondary' : 'ghost'}
        size="sm"
        // Os mesmos contornos do seletor de operações: `w-full` em vez de
        // `sm:w-auto` (viewport × container), e `[&>span]:min-w-0` alcançando o
        // span interno do `Button` da SDK para o `truncate` funcionar.
        className="w-full justify-between gap-2 overflow-hidden [&>span]:min-w-0"
        onClick={() => setAberto((a) => !a)}
        aria-expanded={aberto}
        aria-label="Filtrar por status do plano e por mesmas lojas"
        data-tour="filtros-finos"
      >
        <Filter className="h-4 w-4 shrink-0" />
        <span className="min-w-0 truncate">{rotulo}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 transition-transform duration-fast ease-default',
            aberto && 'rotate-180'
          )}
        />
      </Button>

      {aberto &&
        caixa &&
        createPortal(
          <div
            ref={painel}
            style={{ top: caixa.top, left: caixa.left, width: LARGURA }}
            className="fixed z-[70] flex max-h-[70vh] flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-lg"
          >
            <div className="min-h-0 flex-1 overflow-y-auto">
              <p className="px-3 pt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Status do plano
              </p>
              <div className="p-1">
                {OPCOES_DE_STATUS.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => onStatusChange(o.value)}
                    aria-pressed={status === o.value}
                    className={cn(
                      'flex w-full items-center justify-between rounded-md px-2 py-2 text-sm transition-colors duration-fast ease-default hover:bg-muted',
                      status === o.value ? 'font-medium text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {o.label}
                    {status === o.value && <Check className="h-4 w-4 shrink-0 text-primary" />}
                  </button>
                ))}
              </div>

              <div className="mx-3 h-px bg-border" />

              <div className="flex flex-col gap-1.5 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Comparar com
                </p>
                <SegmentedControl<ModoDeComparacao>
                  value={comparacao}
                  onChange={onComparacaoChange}
                  ariaLabel="Comparar com"
                  options={[
                    { value: 'anterior', label: 'Período anterior' },
                    { value: 'ano', label: 'Ano passado' },
                  ]}
                />
                <p className="text-xs leading-snug text-muted-foreground">
                  {doze
                    ? 'Num recorte de 12 meses as duas escolhas caem no mesmo intervalo.'
                    : `A variação vai comparar com ${rotuloDoPeriodo(periodoAnterior(periodo, comparacao))}.`}
                </p>
              </div>

              <div className="mx-3 h-px bg-border" />

              <div className="flex flex-col gap-1.5 p-3">
                <Switch
                  checked={mesmasLojas}
                  onCheckedChange={onMesmasLojasChange}
                  label={<span className="text-sm font-medium">Mesmas lojas</span>}
                  labelSide="right"
                />
                <p className="text-xs leading-snug text-muted-foreground">
                  Só as operações com plano em todos os meses do período e do período anterior. Tira
                  do número o efeito de lojas que abriram, fecharam ou ainda não entregaram.
                </p>
              </div>
            </div>

            <div className="shrink-0 border-t border-border bg-muted/40 p-2 text-center">
              <span className="text-xs text-muted-foreground">
                Use Consultar, no topo, para buscar os números.
              </span>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
