import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { AlertTriangle, CalendarRange, History, Lock, RefreshCw } from 'lucide-react'
import {
  Button,
  ConfirmDialog,
  EmptyState,
  GridTabsBar,
  TourReplayButton,
  WidthFrame,
  toast,
} from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'
import { logAudit } from '@gia-cb/sdk/audit'
import { useTourReplayTrigger } from '@gia-cb/sdk/modules'
import { useCanAccess } from '@gia-cb/sdk/permissions'
import { useOperacoesIfood, useSalvarFechamento } from '../api/fechamento-ifood-mensal'
import { AbaAdquirentes } from '../components/AbaAdquirentes'
import { AbaCancelados } from '../components/AbaCancelados'
import { AbaConferencia } from '../components/AbaConferencia'
import { AbaExtrato } from '../components/AbaExtrato'
import { AbaLancamentos } from '../components/AbaLancamentos'
import { AbaOnline } from '../components/AbaOnline'
import { AbaRecebimento } from '../components/AbaRecebimento'
import { FiltrosBar, type FiltrosValor } from '../components/FiltrosBar'
import { HistoricoDialog } from '../components/HistoricoDialog'
import { ProgressoConsulta } from '../components/ProgressoConsulta'
import {
  assinatura,
  contarAlterados,
  formatDataHora,
  formatNum,
  mesAnterior,
  MODULE_ID,
  paraGravar,
  rotuloMes,
} from '../helpers'
import { useConsultaMensal } from '../hooks/use-consulta-mensal'
import { useTelaAlta } from '../hooks/use-tela-alta'
import {
  diasDoMes,
  ledgerPorDia,
  montarAdquirentes,
  montarConferencia,
  montarOnline,
  montarRecebimento,
} from '../regras'
import type { AbaId, AdquirenteManualDia, Consulta, DadosManuais, OnlineManualDia } from '../types'

/** Abaixo desta largura (px) a tela usa o layout de celular (o corte do `DataReport`). */
const LARGURA_COMPACTA = 768

/**
 * Barra de rolagem fina e arredondada para tudo que rola dentro da tela — a mesma
 * do Fechamento iFood Diário e do Fechamento Maestro (com o equivalente do Firefox).
 */
const SCROLLBAR_ELEGANTE = [
  '[&_*::-webkit-scrollbar]:size-2.5',
  '[&_*::-webkit-scrollbar-track]:rounded-full',
  '[&_*::-webkit-scrollbar-track]:bg-border/50',
  '[&_*::-webkit-scrollbar-corner]:bg-transparent',
  '[&_*::-webkit-scrollbar-thumb]:rounded-full',
  '[&_*::-webkit-scrollbar-thumb]:border-2',
  '[&_*::-webkit-scrollbar-thumb]:border-solid',
  '[&_*::-webkit-scrollbar-thumb]:border-transparent',
  '[&_*::-webkit-scrollbar-thumb]:bg-clip-padding',
  '[&_*::-webkit-scrollbar-thumb]:bg-muted-foreground/50',
  '[&_*::-webkit-scrollbar-thumb:hover]:bg-muted-foreground/70',
  '[&_*::-webkit-scrollbar-thumb:active]:bg-muted-foreground/85',
  '[@supports_not_selector(::-webkit-scrollbar)]:[&_*]:[scrollbar-width:thin]',
  '[@supports_not_selector(::-webkit-scrollbar)]:[&_*]:[scrollbar-color:color-mix(in_oklab,var(--color-muted-foreground)_50%,transparent)_color-mix(in_oklab,var(--color-border)_50%,transparent)]',
].join(' ')

/**
 * Barra de abas inferior (`GridTabsBar`) mais baixa: o componente do portal usa
 * `py-3` nas abas e empilha rótulo e valor dos contadores, o que dá ~64 px. Aqui as
 * abas ficam com `py-1.5` e os contadores numa linha só ("TOTAL 31") — ~36 px,
 * sobrando altura para a tabela em monitor pequeno. Só a partir de `md`: no celular
 * as abas ficam do tamanho original (alvo de toque ≥ 44 px). Só classes, nenhum componente
 * próprio: se o `GridTabsBar` mudar a estrutura, a barra volta ao tamanho original.
 */
const BARRA_ABAS_COMPACTA = [
  'md:[&_[role=tab]]:py-1.5',
  'md:[&_footer>div:last-child]:py-1',
  'md:[&_footer>div:last-child_.flex-col]:flex-row',
  'md:[&_footer>div:last-child_.flex-col]:items-baseline',
  'md:[&_footer>div:last-child_.flex-col]:gap-1.5',
].join(' ')

const ABAS: Array<{ id: AbaId; label: string }> = [
  { id: 'lancamentos', label: 'Lançamentos' },
  { id: 'online', label: 'Online' },
  { id: 'adquirentes', label: 'Adquirentes' },
  { id: 'conferencia', label: 'Conferência' },
  { id: 'extrato', label: 'Extrato' },
  { id: 'recebimento', label: 'Recebimento' },
  { id: 'cancelados', label: 'Cancelados pós' },
]

const VAZIO: DadosManuais = {
  online: {},
  adquirente: {},
  conferencia: {},
  extrato: [],
  cancelados: [],
  anulacaoVerificar: 0,
}

/** `true` quando a ÁREA do módulo é estreita (mede o elemento, não a janela). */
function useModoCompacto(el: HTMLElement | null): boolean {
  const [compacto, setCompacto] = useState(false)
  useLayoutEffect(() => {
    if (!el || typeof ResizeObserver === 'undefined') return
    const medir = (largura: number) => setCompacto(largura > 0 && largura < LARGURA_COMPACTA)
    medir(el.getBoundingClientRect().width)
    const ro = new ResizeObserver((entries) => medir(entries[0]?.contentRect.width ?? 0))
    ro.observe(el)
    return () => ro.disconnect()
  }, [el])
  return compacto
}

export function FechamentoIfoodMensalView() {
  const canView = useCanAccess('fechamento-ifood-mensal.ler')
  const canEdit = useCanAccess('fechamento-ifood-mensal.editar')
  const replayTour = useTourReplayTrigger(MODULE_ID)

  const [area, setArea] = useState<HTMLDivElement | null>(null)
  const compacto = useModoCompacto(area)
  // Barra de totais: abre sozinha em tela alta fora do celular, até o usuário usar o
  // botão Totais; daí vale a escolha dele (em todas as abas).
  const telaAlta = useTelaAlta()
  const [totaisEscolhidos, setTotaisEscolhidos] = useState<boolean | null>(null)
  const totaisAbertos = totaisEscolhidos ?? (telaAlta && !compacto)

  const [filtros, setFiltros] = useState<FiltrosValor>({ operacaoRef: null, mes: mesAnterior() })
  const lojasQuery = useOperacoesIfood(canView)
  const lojas = useMemo(() => lojasQuery.data ?? [], [lojasQuery.data])
  // Sem escolha do usuário, vale a primeira loja com iFood (como no legado).
  const refSelecionada = filtros.operacaoRef ?? lojas.find((l) => l.temIfood)?.ref ?? null

  const { fase, progresso, resultado, erro, consultar, cancelar } = useConsultaMensal()
  const consulta = resultado?.consulta ?? null

  // O que está na tela (editável) e a assinatura do último estado gravado/lido.
  const [dados, setDados] = useState<DadosManuais>(VAZIO)
  const [base, setBase] = useState(() => assinatura(VAZIO))
  const [baseDados, setBaseDados] = useState<DadosManuais>(VAZIO)
  const [gravadoEm, setGravadoEm] = useState<string | null>(null)
  const [historicoAberto, setHistoricoAberto] = useState(false)
  // Linhas visíveis da aba aberta quando um card filtra a tabela (a aba avisa).
  const [visiveisFiltrados, setVisiveisFiltrados] = useState<{ aba: AbaId; n: number | null }>({
    aba: 'lancamentos',
    n: null,
  })
  // Consulta nova chegou: a tela passa a mostrar o que veio do banco (ajuste de
  // estado durante o render — o padrão do React para "resetar quando a prop muda").
  // A referência é a parte MANUAL, que chega uma vez por consulta: os lançamentos
  // continuam chegando depois, e o que o usuário já digitou não pode ser apagado.
  const manualAtual = resultado?.manual ?? null
  const [manualNaTela, setManualNaTela] = useState(manualAtual)
  if (manualAtual !== manualNaTela) {
    setManualNaTela(manualAtual)
    if (manualAtual) {
      const m = manualAtual
      const novos: DadosManuais = {
        online: m.online,
        adquirente: m.adquirente,
        conferencia: m.conferencia,
        extrato: m.extrato,
        cancelados: m.cancelados,
        anulacaoVerificar: m.anulacaoVerificar,
      }
      setDados(novos)
      setBase(assinatura(novos))
      setBaseDados(novos)
      setGravadoEm(m.gravadoEm)
    }
  }
  const pendente = resultado !== null && assinatura(dados) !== base

  // Fechar/recarregar a aba com alteração não salva pede confirmação do navegador.
  useEffect(() => {
    if (!pendente) return
    const aviso = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', aviso)
    return () => window.removeEventListener('beforeunload', aviso)
  }, [pendente])

  const [aba, setAba] = useState<AbaId>('lancamentos')
  const [confirmarDescarte, setConfirmarDescarte] = useState<Consulta | null>(null)
  const salvar = useSalvarFechamento()

  const semAlteracao =
    consulta !== null &&
    fase !== 'erro' &&
    consulta.operacaoRef === refSelecionada &&
    consulta.mes === filtros.mes

  function iniciar(c: Consulta) {
    void consultar(c)
  }

  /** Dispara a consulta. `false` = recusada (os filtros ficam abertos no celular). */
  function onConsultar(): boolean {
    if (semAlteracao || fase === 'consultando') return false
    const loja = lojas.find((l) => l.ref === refSelecionada)
    if (!loja) {
      toast.error('Selecione a loja.')
      return false
    }
    if (!loja.temIfood) {
      toast.error(`A loja ${loja.nome} não tem integração iFood.`)
      return false
    }
    if (!loja.locRef) {
      toast.error(`A operação ${loja.nome} (${loja.ref}) não começa pelo número da loja.`)
      return false
    }
    if (!/^\d{4}-\d{2}$/.test(filtros.mes)) {
      toast.error('Informe o mês de referência.')
      return false
    }
    const nova: Consulta = { operacaoRef: loja.ref, lojaNome: loja.nome, mes: filtros.mes }
    if (pendente) {
      setConfirmarDescarte(nova)
      return false
    }
    iniciar(nova)
    return true
  }

  const ledger = useMemo(() => resultado?.ledger ?? [], [resultado])
  const mes = consulta?.mes ?? filtros.mes
  const porDia = useMemo(() => ledgerPorDia(ledger), [ledger])
  const online = useMemo(() => montarOnline(porDia, mes, dados.online), [porDia, mes, dados.online])
  const adquirentes = useMemo(
    () => montarAdquirentes(porDia, mes, dados.adquirente),
    [porDia, mes, dados.adquirente]
  )
  const conferencia = useMemo(
    () => montarConferencia(ledger, mes, dados.conferencia, consulta?.lojaNome ?? ''),
    [ledger, mes, dados.conferencia, consulta]
  )
  const recebimento = useMemo(
    () => montarRecebimento(ledger, dados.extrato),
    [ledger, dados.extrato]
  )
  const competenciaLabel = ledger.find((r) => r.competencia === mes)?.competenciaLabel ?? ''
  const dataMax = useMemo(
    () => ledger.reduce((m, r) => (r.data !== 'Ocorrências' && r.data > m ? r.data : m), ''),
    [ledger]
  )
  const dias = diasDoMes(mes)
  const contexto = consulta ? `${consulta.operacaoRef}|${consulta.mes}` : ''

  const editarOnline = useCallback((dia: string, parcial: Partial<OnlineManualDia>) => {
    setDados((d) => ({ ...d, online: { ...d.online, [dia]: { ...d.online[dia], ...parcial } } }))
  }, [])
  const editarAdquirente = useCallback((dia: string, parcial: Partial<AdquirenteManualDia>) => {
    setDados((d) => ({
      ...d,
      adquirente: { ...d.adquirente, [dia]: { ...d.adquirente[dia], ...parcial } },
    }))
  }, [])
  const editarConferencia = useCallback((id: string, valor: number) => {
    setDados((d) => ({ ...d, conferencia: { ...d.conferencia, [id]: valor } }))
  }, [])
  const lista = <K extends 'extrato' | 'cancelados'>(chave: K) => ({
    onIncluir: (l: DadosManuais[K][number]) =>
      setDados((d) => ({ ...d, [chave]: [...d[chave], l] })),
    onAlterar: (i: number, l: DadosManuais[K][number]) =>
      setDados((d) => ({ ...d, [chave]: d[chave].map((x, j) => (j === i ? l : x)) })),
    onRemover: (i: number) =>
      setDados((d) => ({ ...d, [chave]: d[chave].filter((_, j) => j !== i) })),
  })

  async function onSalvar() {
    if (!consulta || !pendente) return
    const corpo = paraGravar(dados)
    try {
      const r = await salvar.mutateAsync({
        operacaoRef: consulta.operacaoRef,
        mes: consulta.mes,
        ...corpo,
      })
      setBase(assinatura(dados))
      setBaseDados(dados)
      setGravadoEm(r.gravadoEm)
      toast.success('Fechamento salvo.')
      void logAudit({
        evento: 'fechamento-ifood-mensal.fechamento.salvo',
        targetType: 'fechamento-ifood-mensal',
        targetId: `${consulta.operacaoRef}:${consulta.mes}`,
        metadata: {
          loja: consulta.lojaNome,
          mes: consulta.mes,
          alteracoes: r.alteracoes,
          extrato: corpo.extrato.length,
          cancelados: corpo.cancelados.length,
          diasOnline: Object.values(corpo.online).filter((o) => Object.keys(o).length > 0).length,
          diasAdquirentes: Object.values(corpo.adquirente).filter((o) => Object.keys(o).length > 0)
            .length,
        },
      })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Falha ao salvar o fechamento.', {
        duration: 10_000,
      })
    }
  }

  const informarVisiveis = useCallback(
    (n: number | null) => setVisiveisFiltrados({ aba, n }),
    [aba]
  )

  if (!canView) {
    return (
      <WidthFrame className="h-[calc(100vh-6.5rem)] md:h-[calc(100vh-7.5rem)]">
        <EmptyState
          icon={Lock}
          title="Sem acesso"
          description="Você não tem a permissão para consultar o Fechamento iFood Mensal."
        />
      </WidthFrame>
    )
  }

  function onConsultarDeNovo() {
    const loja = lojas.find((l) => l.ref === refSelecionada)
    if (loja) iniciar({ operacaoRef: loja.ref, lojaNome: loja.nome, mes: filtros.mes })
  }

  const alterados = resultado ? contarAlterados(dados, baseDados) : 0
  // Total da barra de abas: com um card filtrando, as linhas que a tabela mostra.
  const totalDaAba = {
    lancamentos: ledger.length,
    online: online.length,
    adquirentes: adquirentes.length,
    conferencia: conferencia.length,
    extrato: dados.extrato.length,
    recebimento: recebimento.length,
    cancelados: dados.cancelados.length,
  }[aba]
  const registrosDaAba =
    visiveisFiltrados.aba === aba && visiveisFiltrados.n !== null ? visiveisFiltrados.n : totalDaAba

  let conteudo
  const carregandoLancamentos = fase === 'consultando' && resultado !== null
  if (fase === 'consultando' && !resultado) {
    // Nada chegou ainda: a faixa de progresso acima e a tabela de lançamentos no
    // carregamento dela (padrão 9) — sem painel no lugar da tabela. Totais fechados,
    // para não mostrar zeros.
    conteudo = (
      <>
        <ProgressoConsulta comDados={false} progresso={progresso} onCancelar={cancelar} />
        <div className="flex min-h-0 flex-1 flex-col">
          <AbaLancamentos
            carregando
            totaisAbertos={false}
            onTotaisAbertosChange={() => {}}
            linhas={[]}
            fimDoMes={dias[dias.length - 1]}
            dataMax=""
            contexto=""
          />
        </div>
      </>
    )
  } else if (fase === 'erro' || lojasQuery.error) {
    conteudo = (
      <EmptyState
        icon={AlertTriangle}
        title="Não foi possível consultar o fechamento"
        description={erro ?? lojasQuery.error?.message ?? 'Erro desconhecido.'}
        action={
          <Button
            onClick={() => {
              if (lojasQuery.error) void lojasQuery.refetch()
              else onConsultarDeNovo()
            }}
          >
            <RefreshCw className="h-4 w-4" /> Tentar de novo
          </Button>
        }
      />
    )
  } else if (!resultado || !consulta) {
    conteudo = (
      <EmptyState
        icon={CalendarRange}
        title={
          !lojasQuery.isLoading && lojas.length === 0
            ? 'Nenhuma loja no seu escopo'
            : 'Escolha a loja e o mês'
        }
        description={
          !lojasQuery.isLoading && lojas.length === 0
            ? 'Seu usuário não tem nenhuma loja liberada. Peça acesso ao administrador.'
            : 'Selecione a loja e o mês de referência e clique em Consultar. A consulta ao iFood pode levar alguns minutos em meses de muito movimento.'
        }
      />
    )
  } else {
    conteudo = (
      <>
        {carregandoLancamentos && (
          <ProgressoConsulta comDados progresso={progresso} onCancelar={cancelar} />
        )}
        <div
          key={aba}
          className="flex min-h-0 flex-1 flex-col animate-in fade-in duration-fast"
          data-tour="fechamento-ifood-mensal-conteudo"
        >
          {aba === 'lancamentos' && (
            <AbaLancamentos
              totaisAbertos={totaisAbertos}
              completo={resultado.completo}
              onVisiveisChange={informarVisiveis}
              onTotaisAbertosChange={setTotaisEscolhidos}
              linhas={ledger}
              fimDoMes={dias[dias.length - 1]}
              dataMax={resultado.completo ? dataMax : ''}
              contexto={contexto}
            />
          )}
          {aba === 'online' && (
            <AbaOnline
              totaisAbertos={totaisAbertos}
              completo={resultado.completo}
              onVisiveisChange={informarVisiveis}
              onTotaisAbertosChange={setTotaisEscolhidos}
              linhas={online}
              podeEditar={canEdit}
              onEditar={editarOnline}
              contexto={contexto}
              diasPendentes={resultado.diasPendentes}
            />
          )}
          {aba === 'adquirentes' && (
            <AbaAdquirentes
              totaisAbertos={totaisAbertos}
              completo={resultado.completo}
              onVisiveisChange={informarVisiveis}
              onTotaisAbertosChange={setTotaisEscolhidos}
              linhas={adquirentes}
              podeEditar={canEdit}
              onEditar={editarAdquirente}
              contexto={contexto}
              diasPendentes={resultado.diasPendentes}
            />
          )}
          {aba === 'conferencia' && (
            <AbaConferencia
              totaisAbertos={totaisAbertos}
              completo={resultado.completo}
              onTotaisAbertosChange={setTotaisEscolhidos}
              linhas={conferencia}
              competenciaLabel={competenciaLabel}
              podeEditar={canEdit}
              onEditar={editarConferencia}
            />
          )}
          {aba === 'extrato' && (
            <AbaExtrato
              totaisAbertos={totaisAbertos}
              onTotaisAbertosChange={setTotaisEscolhidos}
              linhas={dados.extrato}
              mes={consulta.mes}
              podeEditar={canEdit}
              contexto={contexto}
              {...lista('extrato')}
            />
          )}
          {aba === 'recebimento' && (
            <AbaRecebimento
              totaisAbertos={totaisAbertos}
              completo={resultado.completo}
              onVisiveisChange={informarVisiveis}
              onTotaisAbertosChange={setTotaisEscolhidos}
              linhas={recebimento}
              contexto={contexto}
            />
          )}
          {aba === 'cancelados' && (
            <AbaCancelados
              totaisAbertos={totaisAbertos}
              onVisiveisChange={informarVisiveis}
              onTotaisAbertosChange={setTotaisEscolhidos}
              linhas={dados.cancelados}
              podeEditar={canEdit}
              contexto={contexto}
              {...lista('cancelados')}
            />
          )}
        </div>
        {/* Abas EMBAIXO da tabela (barra inferior do portal): sobra altura para as linhas
            e, em monitor estreito, as abas rolam com setas em vez de quebrar linha. */}
        <div
          className={cn('shrink-0', BARRA_ABAS_COMPACTA)}
          data-tour="fechamento-ifood-mensal-abas"
        >
          <GridTabsBar
            tabs={ABAS.map((a) => ({ id: a.id, label: a.label }))}
            activeId={aba}
            onChange={(id) => setAba(id as AbaId)}
            totalRegistros={registrosDaAba}
            itensAlterados={alterados}
          />
        </div>
        {/* Rodapé: loja/mês, última gravação e o Histórico — embaixo da barra de abas, para
            a tabela começar logo abaixo dos filtros. */}
        <div className="-mt-1 flex min-w-0 shrink-0 flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          <p className="min-w-0 max-w-full truncate">
            <span className="font-medium text-foreground">{consulta.lojaNome}</span> ·{' '}
            {rotuloMes(consulta.mes)} · {formatNum(ledger.length)} lançamentos do iFood ·{' '}
            {resultado.manual.diasComBordero} dias com borderô
          </p>
          <div className="flex shrink-0 items-baseline gap-3">
            <p>
              {pendente ? (
                <span className="font-medium text-warning">Alterações não salvas</span>
              ) : gravadoEm ? (
                `Última gravação: ${formatDataHora(gravadoEm)}`
              ) : (
                'Ainda não gravado'
              )}
            </p>
            <button
              type="button"
              className="inline-flex items-center gap-1 self-center rounded-md font-medium text-primary transition-colors duration-fast ease-default hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [@media(hover:none)]:min-h-11"
              onClick={() => setHistoricoAberto(true)}
              data-tour="fechamento-ifood-mensal-historico"
            >
              <History className="h-3.5 w-3.5" aria-hidden />
              Histórico
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <WidthFrame
      className={cn(
        'flex h-[calc(100vh-6.5rem)] flex-col gap-3 md:h-[calc(100vh-7.5rem)]',
        SCROLLBAR_ELEGANTE
      )}
    >
      <FiltrosBar
        value={{ operacaoRef: refSelecionada, mes: filtros.mes }}
        onValueChange={setFiltros}
        lojas={lojas}
        lojasLoading={lojasQuery.isLoading}
        consultando={fase === 'consultando'}
        onConsultar={onConsultar}
        semAlteracao={semAlteracao}
        podeSalvar={canEdit}
        salvarHabilitado={pendente && fase !== 'consultando'}
        salvando={salvar.isPending}
        alteracoesPendentes={pendente}
        onSalvar={() => void onSalvar()}
        compacto={compacto}
        enxuto={resultado !== null}
        tituloExtra={<TourReplayButton onClick={replayTour} />}
      />
      <div ref={setArea} className="flex min-h-0 flex-1 flex-col gap-3">
        {conteudo}
      </div>
      {consulta && (
        <HistoricoDialog
          aberto={historicoAberto}
          onOpenChange={setHistoricoAberto}
          operacaoRef={consulta.operacaoRef}
          mes={consulta.mes}
          lojaNome={consulta.lojaNome}
          rotuloMes={rotuloMes(consulta.mes)}
        />
      )}
      <ConfirmDialog
        open={confirmarDescarte !== null}
        onOpenChange={(o) => !o && setConfirmarDescarte(null)}
        title="Descartar as alterações não salvas?"
        description="Há alterações neste fechamento que ainda não foram salvas. Consultar outra loja ou mês descarta essas alterações."
        confirmLabel="Descartar e consultar"
        tone="warning"
        onConfirm={() => {
          if (confirmarDescarte) iniciar(confirmarDescarte)
          setConfirmarDescarte(null)
        }}
      />
    </WidthFrame>
  )
}
