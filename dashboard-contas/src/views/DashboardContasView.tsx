import { useCallback, useDeferredValue, useMemo, useRef, useState } from 'react'
import { useCanAccessState } from '@gia-cb/sdk/permissions'
import {
  Badge,
  Button,
  EmptyState,
  SeletorDeCompetencia,
  Spinner,
  Tooltip,
  TourGuide,
  TourReplayButton,
  useTourReplay,
  useTourTabSync,
  WidthFrame,
  type PeriodoDeMeses,
} from '@gia-cb/ui'
import { useTourGuide, useTourReplayTrigger } from '@gia-cb/sdk/modules'
import { cn } from '@gia-cb/ui/cn'
import { AlertTriangle, ChevronDown, Filter, Search, Store } from 'lucide-react'
import { useMatrizes, useSerie } from '../api/contas'
import { useOperacoesComLocal } from '../api/operacoes'
import { AbaAnalises } from '../components/AbaAnalises'
import { AbaComparativos } from '../components/AbaComparativos'
import { AbaPorIndice } from '../components/AbaPorIndice'
import { AbaPlano } from '../components/AbaPlano'
import { AbaVisaoGeral, type EscolhasDaVisao } from '../components/AbaVisaoGeral'
import { CARTOES_INDICADORES } from '../visao'
import { AbasDoPainel, type AbaId } from '../components/AbasDoPainel'
import { PeriodoDoArquivo } from '../components/graficos/contexto-grafico'
import { EsqueletoDaAba } from '../components/EsqueletoDaAba'
import { FiltrosDoPainel, type FiltroStatus } from '../components/FiltrosDoPainel'
import { PendentesDeEntrega, type Pendente } from '../components/PendentesDeEntrega'
import { SeletorDeOperacoes } from '../components/SeletorDeOperacoes'
import { montarCatalogo, type Catalogo } from '../catalogo'
import { abasTour } from '../context-tours'
import { fmtInteiro } from '../formato'
import { useCabeNumaLinha } from '../hooks/use-quebra-de-linha'
import { agregarPorLoja, carregarMes, consolidarMeses, type MesCarregado } from '../matriz'
import {
  limitarPeriodo,
  mesesDoPeriodo,
  periodoAnterior,
  periodoComTamanho,
  periodoDoArquivo,
  periodoPadrao,
  rotuloDaVariacao,
  rotuloDoPeriodo,
  rotuloLongoDoPeriodo,
  type ModoDeComparacao,
} from '../periodo'
import { calcularRecorte } from '../recorte'
import { ehDeTeste, montarUnidades, unidadePorOperacao } from '../unidades'
import type { MatrizDoMes } from '../types'

/**
 * O recorte do painel: o que os controles do topo escolhem e o que as consultas
 * leem. Vive em DUAS cópias — rascunho e aplicado —, e a segunda só alcança a
 * primeira no botão **Consultar** (a decisão do Dashboard de RH, 16/09/2026).
 */
interface Recorte {
  periodo: PeriodoDeMeses
  /** Operações marcadas, por `ref`. O painel abre sem nenhuma. */
  marcadas: Record<string, boolean>
  status: FiltroStatus
  mesmasLojas: boolean
  /** Contra o que comparar: a janela anterior ou o mesmo período do ano passado. */
  comparacao: ModoDeComparacao
  /** Matriz e filiais contam como uma loja só, em todas as abas. */
  consolidar: boolean
}

function recorteInicial(): Recorte {
  return {
    periodo: periodoPadrao(),
    marcadas: {},
    status: 'Todos',
    mesmasLojas: false,
    comparacao: 'anterior',
    consolidar: false,
  }
}

function mesmasMarcadas(a: Record<string, boolean>, b: Record<string, boolean>) {
  const refsA = Object.keys(a).filter((ref) => a[ref])
  const refsB = Object.keys(b).filter((ref) => b[ref])
  return refsA.length === refsB.length && refsA.every((ref) => b[ref])
}

/** O botão Consultar só acende quando isto é falso. */
function mesmoRecorte(a: Recorte, b: Recorte) {
  return (
    a.periodo.de === b.periodo.de &&
    a.periodo.ate === b.periodo.ate &&
    a.status === b.status &&
    a.mesmasLojas === b.mesmasLojas &&
    a.comparacao === b.comparacao &&
    a.consolidar === b.consolidar &&
    mesmasMarcadas(a.marcadas, b.marcadas)
  )
}

// ── O CATÁLOGO E OS MESES SÃO LIDOS UMA VEZ ─────────────────────────────────
//
// O catálogo é o mesmo em todo mês: guardado pela assinatura das contas, o objeto
// fica estável e as funções guardadas por catálogo (`WeakMap`) não recomeçam a
// cada período. Cada matriz do servidor vira `MesCarregado` uma vez só — trocar
// de jan–jun para fev–jul só lê o mês novo.
const CATALOGOS = new Map<string, Catalogo>()
function catalogoDe(m: MatrizDoMes): Catalogo {
  const chave = m.indices.map((i) => `${i.indice}:${i.formatado}`).join('|')
  let cat = CATALOGOS.get(chave)
  if (!cat) {
    cat = montarCatalogo(m.indices)
    CATALOGOS.set(chave, cat)
  }
  return cat
}
const CARREGADOS = new WeakMap<MatrizDoMes, MesCarregado>()
function carregado(m: MatrizDoMes, cat: Catalogo): MesCarregado {
  let c = CARREGADOS.get(m)
  if (!c) {
    c = carregarMes(m, cat)
    CARREGADOS.set(m, c)
  }
  return c
}

export function DashboardContasView() {
  const { allowed, loading: carregandoPermissao } = useCanAccessState('dashboard-contas.ler')
  // Reabre o tour PRINCIPAL, o que o host monta a partir de `src/tour.ts`.
  const reverTour = useTourReplayTrigger('dashboard-contas')

  const [rascunho, setRascunho] = useState<Recorte>(recorteInicial)
  const [aplicado, setAplicado] = useState<Recorte>(rascunho)
  const pendente = !mesmoRecorte(rascunho, aplicado)
  const rascunhoSemOperacao = !Object.values(rascunho.marcadas).some(Boolean)
  function editarRascunho(mudanca: Partial<Recorte>) {
    setRascunho((atual) => ({ ...atual, ...mudanca }))
  }
  const [periodoCortado, setPeriodoCortado] = useState(false)
  const temporizadorDoAviso = useRef<number | null>(null)

  const [aba, setAba] = useState<AbaId>('visao')
  const [filtrosAbertos, setFiltrosAbertos] = useState(true)
  const linhaDaBarra = useRef<HTMLDivElement>(null)
  const barraCabe = useCabeNumaLinha(linhaDaBarra, filtrosAbertos)
  // As contas abertas na árvore — as MESMAS nas duas grades, para quem abre
  // "4 CUSTOS OPERACIONAIS" no Plano de contas encontrá-la aberta em Comparativos.
  const [abertas, setAbertas] = useState<ReadonlySet<string>>(new Set())
  // Abrir ou fechar UMA conta, com identidade estável (`useCallback` sem
  // dependência): as colunas da grade de Comparativos entram nela, e uma
  // closure nova a cada clique fazia o `DataReport` refazer a grade inteira —
  // 1,5 s de tela travada com a rede inteira (22/09/2026).
  const alternarConta = useCallback((formatado: string) => {
    setAbertas((atual) => {
      const proximo = new Set(atual)
      if (proximo.has(formatado)) proximo.delete(formatado)
      else proximo.add(formatado)
      return proximo
    })
  }, [])
  // Os índices comparados na aba Por índice. Vivem aqui, e não na aba: trocar de
  // aba desmonta a grade, e a escolha voltaria ao padrão. `null` = ainda no
  // padrão da aba.
  const [indicesDoRanking, setIndicesDoRanking] = useState<string[] | null>(null)
  // As escolhas DENTRO da Visão geral (indicador do cartão, métrica dos rankings
  // e linhas da tabela). Ficam aqui pelo mesmo motivo das contas abertas: a aba
  // é desmontada enquanto o esqueleto aparece, e a escolha voltaria ao padrão a
  // cada Consultar.
  const [escolhasDaVisao, setEscolhasDaVisao] = useState<EscolhasDaVisao>({
    indicador: CARTOES_INDICADORES[0]!.id,
    metrica: 'faturamento',
    visao: 'loja',
  })

  // O tour das abas só monta no PRIMEIRO pedido — e, montado, fica. Montado
  // desde o início, abriria junto com o principal; remontado a cada clique, não
  // reabriria (a SDK compara o `replayNonce` com o da montagem). Lição do RH.
  const [tourDeAbasMontado, setTourDeAbasMontado] = useState(false)
  const reverTourDasAbas = useTourReplayTrigger(abasTour.module_id)

  // ── NADA CARREGA ANTES DE ESCOLHER ──────────────────────────────────────────
  //
  // O painel abre sem operação marcada e só com a LISTA de operações. As
  // matrizes do período e do período anterior e a série da evolução são pedidas
  // quando há ao menos uma marcada.
  const { data: operacoes, isLoading: carregandoOperacoes } = useOperacoesComLocal()
  // A UNIDADE do painel: a operação, ou o grupo de matriz e filiais quando a
  // consolidação está ligada. O seletor marca unidades do RASCUNHO; o recorte
  // soma pelas unidades APLICADAS (ver `unidades.ts`).
  const unidadesDoRascunho = useMemo(
    () => montarUnidades(operacoes, rascunho.consolidar),
    [operacoes, rascunho.consolidar]
  )
  const unidades = useMemo(
    () => montarUnidades(operacoes, aplicado.consolidar),
    [operacoes, aplicado.consolidar]
  )
  const unidadePorRef = useMemo(() => unidadePorOperacao(unidades), [unidades])
  const refsMarcadas = useMemo(
    () => unidades.filter((u) => aplicado.marcadas[u.ref]).map((u) => u.ref),
    [unidades, aplicado.marcadas]
  )
  // O GRUPO da "Média do grupo" (aba Comparativos): toda unidade que o usuário
  // enxerga, marcada ou não, menos as de teste — a mesma regra do "Selecionar
  // todas". O plano delas já vem na consulta das marcadas (ver `recorte.ts`).
  const refsDoGrupo = useMemo(
    () => unidades.filter((u) => !u.membros.every((m) => ehDeTeste(m))).map((u) => u.ref),
    [unidades]
  )
  const temSelecao = refsMarcadas.length > 0

  const periodo = aplicado.periodo
  const anterior = useMemo(
    () => periodoAnterior(periodo, aplicado.comparacao),
    [periodo, aplicado.comparacao]
  )
  const meses = useMemo(() => mesesDoPeriodo(periodo), [periodo])
  const mesesAnteriores = useMemo(() => mesesDoPeriodo(anterior), [anterior])
  const ultimo = meses[meses.length - 1]!

  const consultaAtual = useMatrizes(meses, temSelecao)
  const consultaAnterior = useMatrizes(mesesAnteriores, temSelecao)
  const serie = useSerie(ultimo.ano, ultimo.mes, 12, temSelecao)
  // Os mesmos 12 meses, um ano antes — a linha "Ano passado" do gráfico de
  // indicadores. Consulta à parte, do mesmo tamanho, no cache de série: voltar a
  // um período já visto não busca nada.
  const serieAnoPassado = useSerie(ultimo.ano - 1, ultimo.mes, 12, temSelecao)

  // ── A ABA ANÁLISES ADICIONAIS LÊ MAIS DUAS FONTES ─────────────────────────
  //
  // O cartão da loja e o resultado contra o ano passado e contra o orçado
  // precisam do MESMO período em outras duas fontes: o ano passado (os mesmos
  // meses, um ano antes) e o orçado (os mesmos meses, no Plano de Orçamentos de
  // cada loja). Só são pedidos com a aba aberta — quem não a abre não paga por
  // elas. O ano passado divide o cache com o "Comparar com: Ano passado" do
  // topo: quem já compara com ele não busca de novo.
  const naAbaAnalises = temSelecao && aba === 'analises'
  const mesesDoAnoPassado = useMemo(
    () => mesesDoPeriodo(periodoAnterior(periodo, 'ano')),
    [periodo]
  )
  const consultaAnoPassado = useMatrizes(mesesDoAnoPassado, naAbaAnalises)
  const consultaOrcado = useMatrizes(meses, naAbaAnalises, 'orcado')
  const serieDoOrcado = useSerie(ultimo.ano, ultimo.mes, 12, naAbaAnalises, 'orcado')

  // ── TROCAR DE PERÍODO NÃO DESMONTA AS ABAS ─────────────────────────────────
  //
  // Enquanto os meses novos chegam, a tela segura os ANTERIORES e as abas mostram
  // o esqueleto sem desmontar. É o `keepPreviousData` estendido a vários meses
  // (o `useQueries` não o faz sozinho), guardado em estado durante o render — o
  // "valor da renderização anterior" da documentação do React.
  //
  // ☠️ O par guardado é a ÚNICA fonte das abas, e não um objeto montado a cada
  // render: um `{ atual, anterior }` novo por render mudaria a identidade de tudo
  // que vem depois — o recorte seria recalculado sempre e o `useDeferredValue`
  // nunca alcançaria o atual, deixando o esqueleto aceso para sempre.
  const matrizesAtuais = consultaAtual.matrizes
  const matrizesAnteriores = consultaAnterior.matrizes
  const [dados, setDados] = useState<{
    atual: MatrizDoMes[]
    anterior: MatrizDoMes[]
  } | null>(null)
  const prontos = !!matrizesAtuais && !!matrizesAnteriores
  if (
    matrizesAtuais &&
    matrizesAnteriores &&
    (matrizesAtuais !== dados?.atual || matrizesAnteriores !== dados?.anterior)
  ) {
    setDados({ atual: matrizesAtuais, anterior: matrizesAnteriores })
  }
  const isLoading = temSelecao && !dados
  const trocandoPeriodo = temSelecao && !prontos && !!dados
  const erro = consultaAtual.erro ?? consultaAnterior.erro

  const cat = useMemo(
    () => (dados ? catalogoDe(dados.atual[dados.atual.length - 1]!) : null),
    [dados]
  )
  const carregados = useMemo(() => {
    if (!dados || !cat) return null
    const ler = (ms: MatrizDoMes[]) => ms.map((m) => carregado(m, cat))
    // Consolidar SOMA os planos do grupo antes de qualquer conta — depois disso
    // o grupo é uma loja para todo o painel.
    const pronto = (meses: MesCarregado[]) =>
      aplicado.consolidar ? consolidarMeses(meses, unidadePorRef, cat) : meses
    const atualSemAgrupar = ler(dados.atual)
    return {
      atual: pronto(atualSemAgrupar),
      anterior: pronto(ler(dados.anterior)),
      // Os meses SEM agrupar ficam guardados para a seta da Comparativos abrir
      // as filiais ao lado do total do grupo. Só com a consolidação ligada: sem
      // ela, a coluna de cada operação já É a operação.
      detalhado: aplicado.consolidar ? atualSemAgrupar : null,
    }
  }, [dados, cat, aplicado.consolidar, unidadePorRef])

  // ── AS FILIAIS DE CADA GRUPO, PRONTAS PARA A SETA ─────────────────────────
  //
  // O agregado por OPERAÇÃO, sem agrupar, e quem compõe cada grupo. A conta sai
  // da mesma função que o recorte usa, sobre meses que já estão na memória:
  // abrir um grupo não custa consulta nenhuma.
  const detalheDasFiliais = useMemo(
    () => (carregados?.detalhado && cat ? agregarPorLoja(carregados.detalhado, cat) : null),
    [carregados, cat]
  )
  const membrosPorGrupo = useMemo(() => {
    if (!detalheDasFiliais) return null
    const mapa = new Map<string, Array<{ ref: string; nome: string }>>()
    for (const u of unidades) {
      // Só grupo com DUAS ou mais operações na conta ganha seta: abrir uma loja
      // sem filial mostraria a própria coluna de novo.
      const membros = u.membros.filter((m) => detalheDasFiliais.has(m.ref))
      if (membros.length > 1)
        mapa.set(
          u.ref,
          membros.map((m) => ({ ref: m.ref, nome: m.nome }))
        )
    }
    return mapa
  }, [detalheDasFiliais, unidades])

  // ── O PERÍODO COMPARADO DA ABA COMPARATIVOS ───────────────────────────────
  //
  // Só dela (pedido do João, 22/09/2026, apontando o Dashboard de RH): o
  // "Comparar com" dos Filtros continua mandando na VARIAÇÃO do painel inteiro
  // — os cartões, o mês a mês, a coluna Var. do Plano —, e o modo "Período" da
  // Comparativos escolhe contra QUAL período pôr cada loja, sem mexer no resto
  // da tela.
  //
  // Escolhe-se o PRIMEIRO mês; o último sai do tamanho do período do topo.
  // Comparar seis meses com três mediria o tamanho do recorte, não o resultado.
  //
  // Mora aqui, e não na aba, porque tudo de que ele precisa já está aqui: o
  // catálogo, os meses do topo, as marcadas, o filtro de status e a
  // consolidação. A aba manda o mês e recebe o recorte pronto.
  const [inicioComparado, setInicioComparado] = useState<string | null>(null)
  const periodoComparado = useMemo(
    () => (inicioComparado ? periodoComTamanho(inicioComparado, meses.length) : anterior),
    [inicioComparado, meses.length, anterior]
  )
  // Igual ao período de comparação do topo: não há o que buscar nem o que
  // recalcular — a aba usa o recorte que a tela já tem.
  const outroPeriodo = periodoComparado.de !== anterior.de
  const mesesComparados = useMemo(() => mesesDoPeriodo(periodoComparado), [periodoComparado])
  const consultaComparada = useMatrizes(
    mesesComparados,
    temSelecao && outroPeriodo && aba === 'comparativos'
  )
  const recorteComparado = useMemo(() => {
    if (!outroPeriodo || !cat || !carregados || !consultaComparada.matrizes) return null
    const lidos = consultaComparada.matrizes.map((m) => carregado(m, cat))
    return calcularRecorte({
      cat,
      meses: carregados.atual,
      mesesAnteriores: aplicado.consolidar ? consolidarMeses(lidos, unidadePorRef, cat) : lidos,
      marcadas: refsMarcadas,
      status: aplicado.status,
      mesmasLojas: aplicado.mesmasLojas,
      rotuloAnterior: rotuloDoPeriodo(periodoComparado),
      universo: refsDoGrupo,
    })
  }, [
    outroPeriodo,
    cat,
    carregados,
    consultaComparada.matrizes,
    aplicado.consolidar,
    aplicado.status,
    aplicado.mesmasLojas,
    unidadePorRef,
    refsMarcadas,
    periodoComparado,
    refsDoGrupo,
  ])

  const rotuloAnterior = rotuloDoPeriodo(anterior)
  const recorte = useMemo(
    () =>
      carregados && cat
        ? calcularRecorte({
            cat,
            meses: carregados.atual,
            mesesAnteriores: carregados.anterior,
            marcadas: refsMarcadas,
            status: aplicado.status,
            mesmasLojas: aplicado.mesmasLojas,
            rotuloAnterior,
            universo: refsDoGrupo,
          })
        : null,
    [
      carregados,
      cat,
      refsMarcadas,
      aplicado.status,
      aplicado.mesmasLojas,
      rotuloAnterior,
      refsDoGrupo,
    ]
  )

  // O agregado de cada unidade no ano passado e no orçado, para a aba Análises
  // adicionais. A consolidação de matriz e filiais vale aqui como em todo o
  // painel: o grupo soma os planos antes de qualquer conta.
  const fontesDasAnalises = useMemo(() => {
    if (!cat || !consultaAnoPassado.matrizes || !consultaOrcado.matrizes) return null
    const agregar = (ms: MatrizDoMes[]) => {
      const lidos = ms.map((m) => carregado(m, cat))
      return agregarPorLoja(
        aplicado.consolidar ? consolidarMeses(lidos, unidadePorRef, cat) : lidos,
        cat
      )
    }
    return {
      anoPassado: agregar(consultaAnoPassado.matrizes),
      orcado: agregar(consultaOrcado.matrizes),
    }
  }, [
    cat,
    consultaAnoPassado.matrizes,
    consultaOrcado.matrizes,
    aplicado.consolidar,
    unidadePorRef,
  ])
  // A unidade escolhida na aba — vive aqui pelo mesmo motivo das escolhas da
  // Visão geral: a aba é desmontada enquanto o esqueleto aparece. `null` = a
  // seleção inteira.
  const [unidadeDasAnalises, setUnidadeDasAnalises] = useState<string | null>(null)

  // ── A TROCA DE ABA E O RECÁLCULO NÃO CONGELAM A TELA ───────────────────────
  //
  // A barra marca a aba nova no mesmo quadro, e o conteúdo monta em segundo plano
  // com o esqueleto no lugar. O mesmo para um recorte novo: as abas recebem o
  // recorte ADIADO e mostram o esqueleto delas enquanto ele não alcança o atual,
  // sem desmontar — o que o usuário escolheu dentro da aba sobrevive.
  const abaExibida = useDeferredValue(aba)
  const montandoAba = aba !== abaExibida
  const recorteExibido = useDeferredValue(recorte)
  const recalculando = trocandoPeriodo || recorte !== recorteExibido

  if (carregandoPermissao) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!allowed) {
    return (
      <WidthFrame className="h-[calc(100vh-6.5rem)] md:h-[calc(100vh-7.5rem)]">
        <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
          <AlertTriangle className="h-8 w-8 text-warning" />
          <p className="text-sm text-muted-foreground">
            O painel exige a permissão <code>dashboard-contas.ler</code>. Peça ao administrador do
            portal.
          </p>
        </div>
      </WidthFrame>
    )
  }

  // A contagem e os nomes são das UNIDADES: com a consolidação ligada, o painel
  // conta grupos, e é o nome do grupo que aparece nos selos e nas listas.
  const totalLojas = unidades.length
  const naConta = recorte?.naConta.size ?? 0
  const nomePorRef = new Map(unidades.map((u) => [u.ref, u.nome]))
  // Pendentes: as operações NA CONTA com algum mês pendente ou sem plano — é delas
  // que o número depende. Desmarcada sem entregar não muda nada na tela.
  const pendentes: Pendente[] = recorte
    ? [...recorte.naConta].flatMap((ref) => {
        const lista = recorte.statusPorLoja.get(ref) ?? []
        const falta = lista.filter((s) => s === 'Pendente' || s === 'Sem plano')
        if (falta.length === 0) return []
        return [
          {
            ref,
            nome: nomePorRef.get(ref) ?? ref,
            status: falta.includes('Pendente') ? 'Pendente' : 'Sem plano',
          },
        ]
      })
    : []
  const rotulosDosMeses = carregados?.atual.map((m) => m.rotulo) ?? []
  const mesesPendentesPorRef =
    meses.length > 1 && recorte && !trocandoPeriodo
      ? new Map(
          pendentes.map((p) => [
            p.ref,
            (recorte.statusPorLoja.get(p.ref) ?? []).flatMap((s, i) =>
              s === 'Pendente' || s === 'Sem plano' ? [rotulosDosMeses[i] ?? ''] : []
            ),
          ])
        )
      : undefined
  // A seleção de operações NÃO conta como filtro (lição do RH): o aviso de filtro
  // escondido é para status e mesmas lojas, que somem com a barra recolhida.
  const recorteAtivo = aplicado.status !== 'Todos' || aplicado.mesmasLojas
  const textoDoErro = erro ? 'Falha ao consultar o data-warehouse. Tente novamente.' : null
  const periodoArquivo = periodoDoArquivo(periodo)

  const barraDeFiltros = (
    <div
      className="@container rounded-lg border border-border bg-surface px-3 py-2"
      data-tour="filtros"
    >
      <div ref={linhaDaBarra} className="flex flex-wrap items-center gap-2">
        {/* Abaixo de @3xl o nome ENTRA NA LINHA com base zero e cresce: "Plano de
            Contas" é mais longo que o "RH" do outro painel, e a 375 px empurrava
            os selos para uma linha só deles (18/09/2026). Num telefone o nome
            desce para `text-sm` e QUEBRA em duas linhas em vez de cortar: com
            `truncate` ele virava "Dashboard de C…" por 8 px de falta. A medida da barra lê a largura natural dos netos,
            então a base zero não a engana. */}
        <div className="order-1 flex min-w-0 items-center gap-1 @max-3xl:flex-1 @max-3xl:basis-0">
          <h1 className="min-w-0 truncate whitespace-nowrap text-base font-semibold text-foreground @max-sm:overflow-visible @max-sm:whitespace-normal @max-sm:text-sm">
            Dashboard de Contas
          </h1>
          <TourReplayButton onClick={reverTour} label="Rever o tour" />
          {/* O aviso do teto mora AO LADO DO NOME: embaixo do seletor ele
              empurrava o seletor para cima e desalinhava a linha (RH). */}
          {periodoCortado && (
            <span role="status" className="ml-1.5 min-w-0 truncate text-[11px] text-warning">
              O período vai até 12 meses; o intervalo foi ajustado.
            </span>
          )}
        </div>

        <div
          className={cn('order-2 ml-auto flex items-center gap-1.5', barraCabe && '@3xl:order-4')}
        >
          <div className="flex items-center gap-1.5" data-tour="contagem">
            <Tooltip
              content={
                <div className="flex max-w-[17rem] flex-col gap-1 text-left text-xs">
                  <p className="font-semibold">
                    {fmtInteiro(naConta)} de {fmtInteiro(totalLojas)}{' '}
                    {totalLojas === 1 ? 'operação entra' : 'operações entram'} na conta
                  </p>
                  <p>
                    O primeiro número são as operações marcadas no seletor Operações que passam nos
                    filtros. O segundo, todas as operações do seu acesso.
                  </p>
                </div>
              }
            >
              <Badge
                variant={naConta ? 'secondary' : 'warning'}
                className="tabular-nums"
                aria-label={`${fmtInteiro(naConta)} de ${fmtInteiro(totalLojas)} operações na conta`}
              >
                {fmtInteiro(naConta)}/{fmtInteiro(totalLojas)}
              </Badge>
            </Tooltip>
            <PendentesDeEntrega
              pendentes={pendentes}
              rotuloDoMes={rotuloLongoDoPeriodo(periodo)}
              mesesPorRef={mesesPendentesPorRef}
            />
          </div>
          <Tooltip content={filtrosAbertos ? 'Ocultar filtros' : 'Mostrar filtros'}>
            <Button
              variant="ghost"
              size="icon"
              data-fora-da-medida=""
              className={cn('shrink-0', barraCabe && '@3xl:hidden')}
              onClick={() => setFiltrosAbertos((a) => !a)}
              aria-expanded={filtrosAbertos}
              aria-label={filtrosAbertos ? 'Ocultar filtros' : 'Mostrar filtros'}
            >
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform duration-fast ease-default',
                  !filtrosAbertos && '-rotate-90'
                )}
              />
            </Button>
          </Tooltip>
        </div>

        {!filtrosAbertos && recorteAtivo && (
          <button
            type="button"
            onClick={() => setFiltrosAbertos(true)}
            className={cn(
              'order-3 inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary',
              barraCabe && '@3xl:hidden'
            )}
          >
            <Filter className="h-3 w-3" aria-hidden />
            filtro ativo · mostrar filtros
          </button>
        )}

        {/* Operações ANTES do período: é o recorte que mais muda o painel. As
            medidas de largura e de vão são as que o RH mediu em 768 px com o
            período aberto — ver `DashboardRhView` para a conta inteira. */}
        <div
          className={cn(
            'order-3 basis-full flex-wrap items-center gap-2 @md:gap-1.5',
            // `basis-auto` a partir de `@2xl`: os controles sobem para a linha do
            // título quando cabem e descem quando não cabem.
            '@2xl:order-2 @2xl:basis-auto',
            filtrosAbertos ? 'flex' : cn('hidden', barraCabe && '@3xl:flex')
          )}
        >
          <span
            // ☠️ OCUPA O LUGAR MESMO INVISÍVEL, E ISSO NÃO É ESTÉTICA.
            //
            // O risquinho só APARECE quando a barra cabe, mas a largura dele
            // (1 px mais os 6 do vão) entrava na medida que decide se ela
            // cabe. Com ele escondido a conta dava 953 contra 955 de largura —
            // "cabe" —, e no arranjo em que ele aparece dava 960 contra 955 —
            // "não cabe". Os dois arranjos se chamavam sem parar, e a barra
            // piscava para cima e para baixo sozinha (relato do João,
            // 23/09/2026, com a janela em 1045 px).
            //
            // `invisible` no lugar de `hidden`: some a tinta, fica o espaço, e
            // a medida passa a ser a MESMA nos dois arranjos. A regra geral
            // está em `use-quebra-de-linha`.
            className={cn('hidden h-6 w-px bg-border @3xl:block', !barraCabe && 'invisible')}
            aria-hidden
          />
          {/* 12rem: o rótulo mais longo ("Selecionar operações") pede 119 px de
              texto mais 72 de cromo. No celular o `flex-1` preenche a linha; do
              tablet para cima o teto é o próprio mínimo (RH, 16/09/2026). */}
          <div className="min-w-[12rem] flex-1 basis-[12rem] @md:max-w-[12rem] @md:flex-none">
            <SeletorDeOperacoes
              operacoes={unidadesDoRascunho.map((u) => ({
                ref: u.ref,
                nome: u.nome,
                estado: u.estado,
                regiao: u.regiao,
                membros: u.membros.map((m) => m.nome),
              }))}
              marcadas={rascunho.marcadas}
              onChange={(m) => editarRascunho({ marcadas: m })}
              consolidar={rascunho.consolidar}
              onConsolidarChange={trocarConsolidacao}
            />
          </div>
          {/* A mínima de 12rem vale só no INTERVALO: em mês único ela deixava um
              buraco de ~72 px dentro da caixa no celular (RH). */}
          <div
            className={cn(
              'flex flex-col',
              rascunho.periodo.de !== rascunho.periodo.ate && 'min-w-[12rem]'
            )}
            data-tour="filtro-periodo"
          >
            <SeletorDeCompetencia
              valor={rascunho.periodo}
              onChange={(novo) => {
                const { periodo: ajustado, cortado } = limitarPeriodo(novo, rascunho.periodo)
                editarRascunho({ periodo: ajustado })
                setPeriodoCortado(cortado)
                // O aviso some sozinho: explica um ajuste, não é um estado da tela.
                if (temporizadorDoAviso.current != null) {
                  window.clearTimeout(temporizadorDoAviso.current)
                }
                if (cortado) {
                  temporizadorDoAviso.current = window.setTimeout(
                    () => setPeriodoCortado(false),
                    6000
                  )
                }
              }}
            />
          </div>
          {/* Largura de CONTEÚDO, com teto: o rótulo varia ("Filtros", "Pendente",
              "Mesmas lojas"), e largura fixa espalhava a sobra no meio (RH). */}
          <div className="flex-none basis-auto @md:max-w-[11rem]">
            <FiltrosDoPainel
              status={rascunho.status}
              onStatusChange={(s) => editarRascunho({ status: s })}
              mesmasLojas={rascunho.mesmasLojas}
              onMesmasLojasChange={(m) => editarRascunho({ mesmasLojas: m })}
              comparacao={rascunho.comparacao}
              onComparacaoChange={(c) => editarRascunho({ comparacao: c })}
              periodo={rascunho.periodo}
            />
          </div>
          {/* CONSULTAR É O ÚLTIMO DOS CONTROLES: montado o recorte da esquerda para
              a direita, buscar é o passo final. */}
          <Tooltip
            content={
              !pendente
                ? 'Nenhuma mudança pendente nos filtros'
                : rascunhoSemOperacao
                  ? 'Marque ao menos uma operação no seletor Operações'
                  : 'Busca os números do recorte escolhido'
            }
          >
            <span className="shrink-0">
              <Button
                size="sm"
                className="gap-1.5"
                onClick={() => setAplicado(rascunho)}
                disabled={!pendente || rascunhoSemOperacao}
                data-tour="consultar"
              >
                <Search className="h-4 w-4" aria-hidden />
                Consultar
              </Button>
            </span>
          </Tooltip>
        </div>
      </div>
    </div>
  )

  /**
   * Liga e desliga a consolidação TRADUZINDO a seleção: as chaves marcadas mudam
   * (a operação vira `grupo:<id>` e volta), e sem traduzir o interruptor
   * esvaziaria a seleção sem avisar.
   */
  function trocarConsolidacao(ligado: boolean) {
    const de = montarUnidades(operacoes, rascunho.consolidar)
    const para = montarUnidades(operacoes, ligado)
    const marcadasAgora = new Set(
      de.filter((u) => rascunho.marcadas[u.ref]).flatMap((u) => u.membros.map((m) => m.ref))
    )
    const marcadas: Record<string, boolean> = {}
    for (const u of para) {
      // Grupo entra inteiro quando QUALQUER membro estava marcado: é o preço de
      // ele ser indivisível, e some é melhor que sumir com a loja da seleção.
      if (u.membros.some((m) => marcadasAgora.has(m.ref))) marcadas[u.ref] = true
    }
    editarRascunho({ consolidar: ligado, marcadas })
  }

  return (
    // O período do recorte desce por contexto até a moldura dos gráficos: é ela
    // que nomeia a planilha de cada cartão, e passá-lo de mão em mão até o
    // sétimo cartão só encheria as assinaturas.
    <PeriodoDoArquivo.Provider value={periodoArquivo}>
      <WidthFrame className="flex h-[calc(100vh-6.5rem)] flex-col gap-3 md:h-[calc(100vh-7.5rem)]">
        {barraDeFiltros}

        <AbasDoPainel
          ativa={aba}
          onChange={setAba}
          extra={
            <TourReplayButton
              onClick={() => {
                // Na primeira vez o tour ainda vai montar: o disparo espera o
                // ouvinte do `useTourReplay` existir, senão o evento se perde.
                const primeiraVez = !tourDeAbasMontado
                setTourDeAbasMontado(true)
                window.setTimeout(() => void reverTourDasAbas(), primeiraVez ? 150 : 0)
              }}
              label="Conhecer as abas"
            />
          }
        />

        {/* `min-h-0`: sem isso o filho `flex-1` não encolhe abaixo do conteúdo, e a
          grade empurra a página inteira em vez de rolar por dentro. */}
        <div className="min-h-0 flex-1">
          {!temSelecao ? (
            <div className="flex h-full items-center justify-center rounded-lg border border-border bg-surface p-6">
              <EmptyState
                icon={Store}
                title="Nenhuma operação selecionada"
                description={
                  carregandoOperacoes
                    ? 'Carregando a lista de operações…'
                    : 'Selecione as operações no seletor Operações, no topo da página, e clique em Consultar.'
                }
              />
            </div>
          ) : textoDoErro && !recorteExibido ? (
            <div className="flex h-full items-center justify-center rounded-lg border border-border bg-surface p-6">
              <EmptyState
                icon={AlertTriangle}
                title="Os números não puderam ser carregados"
                description="A consulta ao data-warehouse falhou. Troque o período ou recarregue a página."
              />
            </div>
          ) : montandoAba || isLoading || !recorteExibido || !cat || !carregados ? (
            <EsqueletoDaAba aba={aba} />
          ) : (
            <>
              {abaExibida === 'visao' && (
                <AbaVisaoGeral
                  cat={cat}
                  recorte={recorteExibido}
                  operacoes={unidades}
                  periodo={periodo}
                  comparacao={aplicado.comparacao}
                  serie={serie.data ?? null}
                  // Enquanto a série nova não chega, o `keepPreviousData` segura a
                  // velha — que seria o ano passado de OUTRO intervalo, desenhado
                  // sob os meses novos. Melhor não desenhar a linha até chegar.
                  serieAnoPassado={
                    serieAnoPassado.isPlaceholderData ? null : (serieAnoPassado.data ?? null)
                  }
                  carregando={recalculando}
                  carregandoSerie={serie.isLoading || serie.isPlaceholderData}
                  escolhas={escolhasDaVisao}
                  onEscolhas={setEscolhasDaVisao}
                />
              )}
              {abaExibida === 'plano' && (
                <div className="h-full" data-tour="grade-plano">
                  <AbaPlano
                    cat={cat}
                    recorte={recorteExibido}
                    meses={carregados.atual}
                    periodo={periodo}
                    comparacao={aplicado.comparacao}
                    abertas={abertas}
                    onAbertasChange={setAbertas}
                    carregando={recalculando}
                  />
                </div>
              )}
              {abaExibida === 'por-indice' && (
                <div className="h-full" data-tour="grade-por-indice">
                  <AbaPorIndice
                    cat={cat}
                    recorte={recorteExibido}
                    operacoes={unidades}
                    indices={indicesDoRanking}
                    onIndicesChange={setIndicesDoRanking}
                    carregando={recalculando}
                    rotuloPeriodo={rotuloDoPeriodo(periodo)}
                    meses={carregados.atual}
                    rotuloVariacao={rotuloDaVariacao(periodo, aplicado.comparacao)}
                    comparacao={aplicado.comparacao}
                  />
                </div>
              )}
              {abaExibida === 'comparativos' && (
                <div className="h-full" data-tour="grade-comparativos">
                  <AbaComparativos
                    cat={cat}
                    recorte={recorteExibido}
                    operacoes={unidades}
                    abertas={abertas}
                    onAbertasChange={setAbertas}
                    onAlternarConta={alternarConta}
                    membrosPorGrupo={membrosPorGrupo}
                    detalheDasFiliais={detalheDasFiliais}
                    carregando={recalculando}
                    rotuloPeriodo={rotuloDoPeriodo(periodo)}
                    inicioComparado={inicioComparado ?? anterior.de}
                    onInicioComparadoChange={setInicioComparado}
                    mesesNoPeriodo={meses.length}
                    meses={carregados.atual}
                    recorteComparado={recorteComparado}
                    carregandoComparado={outroPeriodo && !consultaComparada.matrizes}
                  />
                </div>
              )}
              {abaExibida === 'analises' && (
                <AbaAnalises
                  cat={cat}
                  recorte={recorteExibido}
                  operacoes={unidades}
                  periodo={periodo}
                  meses={carregados.atual}
                  anoPassado={fontesDasAnalises?.anoPassado ?? null}
                  orcado={fontesDasAnalises?.orcado ?? null}
                  erroDasFontes={!!(consultaAnoPassado.erro ?? consultaOrcado.erro)}
                  serie={serie.data ?? null}
                  serieDoOrcado={
                    serieDoOrcado.isPlaceholderData ? null : (serieDoOrcado.data ?? null)
                  }
                  carregando={recalculando}
                  unidade={unidadeDasAnalises}
                  onUnidade={setUnidadeDasAnalises}
                />
              )}
            </>
          )}
        </div>

        {/* O tour das abas. O principal quem monta é o host. */}
        {tourDeAbasMontado && <TourDasAbas aba={aba} onAbaChange={setAba} />}

        {textoDoErro && recorteExibido && <p className="text-sm text-destructive">{textoDoErro}</p>}
      </WidthFrame>
    </PeriodoDoArquivo.Provider>
  )
}

/**
 * O tour que atravessa as abas. Vive em componente próprio porque
 * `useTourGuide` começa a rodar assim que monta; `useTourTabSync` transforma o
 * `tab` de cada passo em troca real de aba e devolve o usuário à aba de antes
 * quando o tour acaba.
 */
function TourDasAbas({ aba, onAbaChange }: { aba: AbaId; onAbaChange: (a: AbaId) => void }) {
  const { replayNonce } = useTourReplay(abasTour.module_id)
  const sincronia = useTourTabSync<AbaId>(aba, onAbaChange)
  const controlador = useTourGuide(abasTour, {
    replayNonce,
    onStepChange: sincronia.onStepChange,
    onComplete: sincronia.onComplete,
  })
  return <TourGuide controller={controlador} />
}
