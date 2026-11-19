import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { AlertTriangle, CalendarRange, Lock } from 'lucide-react'
import {
  ConfirmDialog,
  EmptyState,
  Spinner,
  GridTabsBar,
  Modal,
  TourReplayButton,
  WidthFrame,
  toast,
} from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'
import { logAudit } from '@gia-cb/sdk/audit'
import { useTourReplayTrigger } from '@gia-cb/sdk/modules'
import { useCanAccess, useCanAccessState } from '@gia-cb/sdk/permissions'
import { useLojasIfood, useSalvarFechamento } from '../api/fechamento-ifood-mensal'
import { AbaAdquirentes } from '../components/AbaAdquirentes'
import { AbaCancelados } from '../components/AbaCancelados'
import { AbaConferencia } from '../components/AbaConferencia'
import { AbaExtrato } from '../components/AbaExtrato'
import { AbaLancamentos } from '../components/AbaLancamentos'
import { AbaOnline } from '../components/AbaOnline'
import { AbaRecebimento } from '../components/AbaRecebimento'
import { FiltrosBar, type FiltrosValor } from '../components/FiltrosBar'
import { HistoricoDialog } from '../components/HistoricoDialog'
import { MensagemErro } from '../components/MensagemErro'
import { ProgressoConsulta } from '../components/ProgressoConsulta'
import { Recolhivel } from '../components/Recolhivel'
import {
  assinatura,
  contarAlterados,
  ehRecusaDeAmbienteDeTeste,
  formatDataHora,
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

/** De onde veio o erro, em palavras (a mensagem padrão mostra embaixo do título). */
const ORIGEM_HANDLER: Record<string, string> = {
  lojas: 'Lista de lojas',
  ledger: 'Lançamentos do iFood',
  manual: 'Borderô e fechamento gravado',
  salvar: 'Salvar o fechamento',
  historico: 'Histórico',
}

export function FechamentoIfoodMensalView() {
  // Com o estado de carregamento: sem ele, a tela piscaria "Sem acesso" até as
  // permissões chegarem (api-reference §1.2, `useCanAccessState`).
  const { allowed: canView, loading: carregandoAcesso } = useCanAccessState(
    'fechamento-ifood-mensal.ler'
  )
  const canEdit = useCanAccess('fechamento-ifood-mensal.editar')
  const replayTour = useTourReplayTrigger(MODULE_ID)

  const [area, setArea] = useState<HTMLDivElement | null>(null)
  const compacto = useModoCompacto(area)
  // Barra de totais: abre sozinha em tela alta fora do celular, até o usuário usar o
  // botão Totais; daí vale a escolha dele (em todas as abas).
  const telaAlta = useTelaAlta()
  const [totaisEscolhidos, setTotaisEscolhidos] = useState<boolean | null>(null)
  const totaisAbertos = totaisEscolhidos ?? (telaAlta && !compacto)

  const [filtros, setFiltros] = useState<FiltrosValor>({
    empresaId: null,
    mes: mesAnterior(),
    operacao: null,
  })
  const lojasQuery = useLojasIfood(canView)
  const lojas = useMemo(() => lojasQuery.data?.lojas ?? [], [lojasQuery.data])
  // TESTE: `GIA_DEV_IFOOD_MENSAL_POR_OPERACAO=1` no servidor liga a consulta de uma
  // operação só (o seletor "Operação (teste)"). Sem ela, junta todas as operações.
  const porOperacao = lojasQuery.data?.testePorOperacao ?? false
  // Sem escolha do usuário, vale a primeira loja com iFood.
  const empresaSelecionada =
    filtros.empresaId ?? lojas.find((l) => l.restaurantes.length > 0)?.empresaId ?? null

  const { fase, progresso, resultado, erro, consultar, cancelar } = useConsultaMensal()
  const consulta = resultado?.consulta ?? null

  // O que está na tela (editável) e a assinatura do último estado gravado/lido.
  const [dados, setDados] = useState<DadosManuais>(VAZIO)
  const [base, setBase] = useState(() => assinatura(VAZIO))
  const [baseDados, setBaseDados] = useState<DadosManuais>(VAZIO)
  const [gravadoEm, setGravadoEm] = useState<string | null>(null)
  const [historicoAberto, setHistoricoAberto] = useState(false)
  const [erroSalvar, setErroSalvar] = useState<unknown>(null)
  const recusaDeTeste = ehRecusaDeAmbienteDeTeste(erroSalvar)
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
    consulta.empresaId === empresaSelecionada &&
    consulta.operacao === (porOperacao ? filtros.operacao : null) &&
    consulta.mes === filtros.mes

  /**
   * A consulta da loja escolhida: todas as operações dela — ou, com o TESTE por
   * operação ligado e uma operação escolhida, só ela.
   */
  function montarConsulta(loja: (typeof lojas)[number]): Consulta {
    const operacao =
      porOperacao &&
      filtros.operacao &&
      loja.restaurantes.some((r) => r.operacao === filtros.operacao)
        ? filtros.operacao
        : null
    return {
      empresaId: loja.empresaId,
      lojaNome: loja.nome,
      mes: filtros.mes,
      restaurantes: operacao
        ? loja.restaurantes.filter((r) => r.operacao === operacao)
        : loja.restaurantes,
      operacao,
    }
  }

  function iniciar(c: Consulta) {
    void consultar(c)
  }

  /** Dispara a consulta. `false` = recusada (os filtros ficam abertos no celular). */
  function onConsultar(): boolean {
    if (semAlteracao || fase === 'consultando') return false
    const loja = lojas.find((l) => l.empresaId === empresaSelecionada)
    if (!loja) {
      toast.error('Selecione a loja.')
      return false
    }
    if (loja.restaurantes.length === 0) {
      toast.error(`A loja ${loja.nome} não tem restaurante no iFood.`)
      return false
    }
    if (!loja.locRef) {
      toast.error(`A loja ${loja.nome} não tem o número da loja no nome nem no vínculo BIAPI.`)
      return false
    }
    if (!/^\d{4}-\d{2}$/.test(filtros.mes)) {
      toast.error('Informe o mês de referência.')
      return false
    }
    const nova = montarConsulta(loja)
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
  const contexto = consulta
    ? `${consulta.empresaId}|${consulta.mes}|${consulta.operacao ?? ''}`
    : ''

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
    // TESTE: consulta de uma operação só não grava (o fechamento é da loja inteira).
    if (!consulta || !pendente || consulta.operacao) return
    const corpo = paraGravar(dados)
    try {
      const r = await salvar.mutateAsync({
        empresaId: consulta.empresaId,
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
        targetId: `${consulta.empresaId}:${consulta.mes}`,
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
      // Mensagem padrão de erro (tipo, frase do servidor, detalhes técnicos) num modal.
      setErroSalvar(e)
    }
  }

  const informarVisiveis = useCallback(
    (n: number | null) => setVisiveisFiltrados({ aba, n }),
    [aba]
  )

  if (carregandoAcesso) {
    return (
      <WidthFrame className="flex h-[calc(100vh-6.5rem)] items-start justify-center py-12 md:h-[calc(100vh-7.5rem)]">
        <Spinner />
      </WidthFrame>
    )
  }
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
    const loja = lojas.find((l) => l.empresaId === empresaSelecionada)
    if (loja) iniciar(montarConsulta(loja))
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
    // carregamento dela (padrão 9) — sem painel no lugar da tabela. Os totais aparecem
    // carregando (sem zeros).
    //
    // Mesma estrutura do ramo com dados (faixa → avisos → contêiner da aba com a mesma
    // `key`): quando o caixa da loja chega, o React só atualiza o que já está na tela —
    // sem remontar a tabela, sem o fade-in do contêiner e sem a tabela pular com a
    // chegada da barra de totais (que já aparece aqui, carregando).
    conteudo = (
      <>
        <Recolhivel visivel>
          <ProgressoConsulta comDados={false} progresso={progresso} onCancelar={cancelar} />
        </Recolhivel>
        {false}
        <div
          key={aba}
          className="flex min-h-0 flex-1 flex-col animate-in fade-in duration-fast"
          data-tour="fechamento-ifood-mensal-conteudo"
        >
          <AbaLancamentos
            carregando
            completo={false}
            totaisAbertos={totaisAbertos}
            onTotaisAbertosChange={setTotaisEscolhidos}
            linhas={[]}
            fimDoMes={dias[dias.length - 1]}
            dataMax=""
            contexto=""
          />
        </div>
      </>
    )
  } else if (fase === 'erro' || lojasQuery.error) {
    // Mensagem padrão de erro (a mesma do Fechamento iFood Diário): o tipo do problema,
    // a frase do servidor e "Ver detalhes técnicos" (Copiar tudo, Baixar diagnóstico).
    const erroDaVez = lojasQuery.error ?? erro
    const handler = (erroDaVez as { requisicao?: { handler?: string } } | null)?.requisicao?.handler
    conteudo = (
      // Mesma posição do estado "Escolha a loja e o mês" (EmptyState): no topo da área,
      // centrada na horizontal, com o mesmo py-12.
      <div className="flex min-h-0 flex-1 justify-center overflow-y-auto px-4 py-12">
        <MensagemErro
          erro={erroDaVez}
          origem={handler ? ORIGEM_HANDLER[handler] : undefined}
          onTentarDeNovo={() => {
            if (lojasQuery.error) void lojasQuery.refetch()
            else onConsultarDeNovo()
          }}
        />
      </div>
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
        {/* No fim a faixa recolhe (altura + fade) em vez de sumir de uma vez. */}
        <Recolhivel visivel={carregandoLancamentos}>
          <ProgressoConsulta comDados progresso={progresso} onCancelar={cancelar} />
        </Recolhivel>
        {resultado.avisos.length > 0 && (
          <div
            role="alert"
            className="flex shrink-0 items-start gap-2 rounded-md border border-warning-soft-border bg-warning-soft px-3 py-2 text-sm text-warning-soft-foreground"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <div className="min-w-0">
              <p className="font-medium">
                {resultado.avisos.length === 1
                  ? 'Um restaurante ficou de fora do fechamento:'
                  : `${resultado.avisos.length} restaurantes ficaram de fora do fechamento:`}
              </p>
              <ul className="mt-0.5 list-disc pl-4">
                {resultado.avisos.map((a) => (
                  <li key={a.operacao}>
                    <span className="font-medium">{a.operacao}</span> — {a.aviso}
                  </li>
                ))}
              </ul>
            </div>
          </div>
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
              // Caixa da loja chegou e nenhuma página do iFood ainda: a tabela continua
              // carregando (e não "o iFood não devolveu lançamentos").
              carregando={carregandoLancamentos && ledger.length === 0}
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
            e, em monitor estreito, as abas rolam com setas em vez de quebrar linha. O
            GridTabsBar fica como o SDK entrega — nenhuma classe sobrescreve o formato. */}
        <div className="shrink-0" data-tour="fechamento-ifood-mensal-abas">
          <GridTabsBar
            tabs={ABAS.map((a) => ({ id: a.id, label: a.label }))}
            activeId={aba}
            onChange={(id) => setAba(id as AbaId)}
            totalRegistros={registrosDaAba}
            itensAlterados={alterados}
          />
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
        value={{ empresaId: empresaSelecionada, mes: filtros.mes, operacao: filtros.operacao }}
        porOperacao={porOperacao}
        onValueChange={setFiltros}
        lojas={lojas}
        lojasLoading={lojasQuery.isLoading}
        consultando={fase === 'consultando'}
        onConsultar={onConsultar}
        semAlteracao={semAlteracao}
        podeSalvar={canEdit}
        // TESTE: com uma operação só, o fechamento da loja não pode ser gravado pela metade.
        salvarHabilitado={pendente && fase !== 'consultando' && !consulta?.operacao}
        salvando={salvar.isPending}
        alteracoesPendentes={pendente}
        onSalvar={() => void onSalvar()}
        // Desde o clique (desativado até o caixa da loja chegar): a barra enxuta já nasce
        // com a largura final e não quebra de linha no meio da consulta.
        onHistorico={
          (consulta && resultado) || fase === 'consultando'
            ? () => setHistoricoAberto(true)
            : undefined
        }
        historicoDesativado={!(consulta && resultado)}
        dicaHistorico={
          pendente
            ? 'Há alterações não salvas. O histórico mostra o que já foi gravado.'
            : gravadoEm
              ? `Última gravação: ${formatDataHora(gravadoEm)}`
              : 'Este mês ainda não foi gravado para a loja.'
        }
        compacto={compacto}
        // Enxuta desde o clique em Consultar: a barra muda junto com o resto da tela, e
        // não no meio da consulta (quando o caixa da loja chega), o que fazia tudo pular.
        enxuto={resultado !== null || fase === 'consultando'}
        tituloExtra={<TourReplayButton onClick={replayTour} />}
      />
      <div ref={setArea} className="flex min-h-0 flex-1 flex-col gap-3">
        {conteudo}
      </div>
      {consulta && (
        <HistoricoDialog
          aberto={historicoAberto}
          onOpenChange={setHistoricoAberto}
          empresaId={consulta.empresaId}
          mes={consulta.mes}
          lojaNome={consulta.lojaNome}
          rotuloMes={rotuloMes(consulta.mes)}
        />
      )}
      <Modal open={erroSalvar !== null} onOpenChange={(o) => !o && setErroSalvar(null)}>
        <Modal.Content size="md">
          <Modal.Header>
            <Modal.Title>O fechamento não foi salvo</Modal.Title>
            <Modal.Description>
              O que você preencheu continua na tela. Veja o motivo abaixo.
            </Modal.Description>
          </Modal.Header>
          <Modal.Body>
            <MensagemErro
              erro={erroSalvar}
              origem={ORIGEM_HANDLER.salvar}
              {...(recusaDeTeste ? { titulo: 'Ambiente de teste', descricao: recusaDeTeste } : {})}
              onTentarDeNovo={() => {
                setErroSalvar(null)
                void onSalvar()
              }}
            />
          </Modal.Body>
        </Modal.Content>
      </Modal>
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
