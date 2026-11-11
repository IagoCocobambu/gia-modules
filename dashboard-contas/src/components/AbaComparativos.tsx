import {
  memo,
  useCallback,
  useDeferredValue,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  Button,
  DataReport,
  DatePicker,
  EmptyState,
  TelaCheia,
  Tooltip,
  type ColumnDef,
} from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'
import {
  ArrowLeftRight,
  ChevronDown,
  ChevronRight,
  Info,
  Maximize2,
  Minimize2,
  Pin,
} from 'lucide-react'
import { INDICE_FATURAMENTO, type Catalogo } from '../catalogo'
import {
  OPORTUNIDADE_MINIMA,
  aFavor,
  classeDaDiferenca as classeDoTom,
  oportunidade,
  type Referencia,
} from '../comparacao'
import {
  comparadorDeLinhas,
  itensDaComparacao,
  linhaComparada,
  referenciasDoResumo,
  reguaDaComparacao,
  type ColunasPor,
  type GrupoDaComparacao,
  type ItemDeComparacao,
  type LinhaComparada,
  type OperacaoParaComparar,
} from '../comparativos'
import { planilhaDaGrade, type Celula, type ColunaPlanilha } from '../planilha'
import { BotaoExportar } from './BotaoExportar'
import {
  fmtBRLCompacto,
  fmtCompacto,
  fmtConta,
  fmtDiferenca,
  fmtPct,
  fmtValor,
  fmtVariacao,
  plural,
  TRACO,
} from '../formato'
import { baseDaOportunidade, linhasDaGrade, medir, type Medida } from '../grade'
import { useJanelaDeColunas } from '../hooks/use-janela-de-colunas'
import { useTamanho } from '../hooks/use-tamanho'
import { recortar, somaDeLarguras } from '../janela-de-colunas'
import { consolidar, type Agregado, type MesCarregado } from '../matriz'
import { celulasDaLinha } from '../linha-fixa'
import { mesDoTexto, periodoComTamanho, rotuloDoMes, rotuloDoPeriodo } from '../periodo'
import type { RecorteCalculado } from '../recorte'
import { AbrirAte } from './AbrirAte'
import { ContaNaArvore } from './ContaNaArvore'
import { DicaDaGrade } from './DicaDaGrade'
import { Escolha } from './Escolha'
import { ForaDaComparacao } from './ForaDaComparacao'
import { ResumoDasColunas } from './ResumoDasColunas'

// A aba Comparativos — o plano de contas com uma coluna por operação (ou por
// região, estado, grupo de matriz), cada uma contra a REFERÊNCIA: a média das
// lojas selecionadas, a melhor ou a pior (decisão do João, 18/09/2026).
//
// ── UM LUGAR SÓ ESCOLHE LOJA ────────────────────────────────────────────────
//
// As colunas são as operações NA CONTA — marcadas no seletor do topo e com status
// que passa nos filtros —, sem limite. A aba não tem seletor próprio (a regra do
// Dashboard de RH, 14/09/2026): dois seletores podiam discordar. O HTML de
// especificação montava grupos arrastando loja sobre loja; aqui os grupos são os
// do cadastro (região da rede, estado, matriz e filiais), por "Colunas por".
//
// ── A CÉLULA É MAGRA DE PROPÓSITO ───────────────────────────────────────────
//
// Com a rede inteira e o plano aberto no nível 3 são dezenas de milhares de
// células. No RH, uma `Tooltip` da SDK por célula congelou a tela por 16 s: aqui
// a dica vai em `data-dica`, lida por UMA `DicaDaGrade`, e as células são `memo`
// com props estáveis — a diferença é calculada DENTRO da célula, e não recebida
// pronta (um objeto novo por render mataria a memorização).
//
// ── TROCAS PESADAS NÃO CONGELAM ─────────────────────────────────────────────
//
// Agrupamento, referência, modo e as contas abertas vão para a grade ADIADOS: o
// controle marca a escolha na hora e a grade mostra o esqueleto até a nova estar
// montada.

interface Props {
  cat: Catalogo
  recorte: RecorteCalculado
  operacoes: readonly OperacaoParaComparar[]
  abertas: ReadonlySet<string>
  onAbertasChange: (abertas: ReadonlySet<string>) => void
  /**
   * Abre ou fecha UMA conta. Vem pronta da tela, com identidade estável: uma
   * closure nova a cada abertura mudaria as colunas e faria o `DataReport`
   * refazer a grade inteira.
   */
  onAlternarConta: (formatado: string) => void
  /**
   * Com a consolidação ligada: quem compõe cada grupo — `grupo:<id>` → as
   * operações dele que estão na conta. Só grupo com DUAS ou mais entra.
   *
   * Presente, o cabeçalho do grupo ganha uma SETA que abre as filiais AO LADO
   * do total dele — um nível a mais de cabeçalho, e não a troca do grupo pelas
   * partes (o arranjo do Dashboard de RH, pedido do João em 22/09/2026).
   */
  membrosPorGrupo: ReadonlyMap<string, ReadonlyArray<{ ref: string; nome: string }>> | null
  /** O agregado de cada operação SEM agrupar — de onde saem as colunas da seta. */
  detalheDasFiliais: ReadonlyMap<string, Agregado> | null
  carregando: boolean
  /** `ago/26` — o cabeçalho do período do topo, no modo Período. */
  rotuloPeriodo: string
  /**
   * ── O PERÍODO COMPARADO É DESTA ABA ──────────────────────────────────────
   *
   * O "Comparar com" dos Filtros manda na VARIAÇÃO do painel inteiro. Aqui,
   * em **Comparar com: Período**, escolhe-se contra qual período pôr cada loja
   * — sem mexer nos cartões, no mês a mês nem na coluna Var. do Plano (pedido
   * do João, 22/09/2026, apontando o Dashboard de RH).
   *
   * Escolhe-se o PRIMEIRO mês (`YYYY-MM`); o último sai de `mesesNoPeriodo`,
   * que é o tamanho do período do topo. Comparar seis meses com três mediria o
   * tamanho do recorte, não o resultado.
   */
  inicioComparado: string
  onInicioComparadoChange: (inicio: string) => void
  /** Quantos meses tem o período do topo — o tamanho do comparado. */
  mesesNoPeriodo: number
  /**
   * Os meses do período do topo. Servem à RÉGUA: com uma loja marcada, média,
   * melhor e pior passam a sair dos meses dela (ver `reguaDaComparacao`).
   */
  meses: readonly MesCarregado[]
  /**
   * O recorte com o período comparado ESCOLHIDO. `null` quando ele é o mesmo do
   * topo (não há o que recalcular) ou quando os meses ainda estão chegando.
   */
  recorteComparado: RecorteCalculado | null
  /** Os meses do período escolhido ainda estão a caminho. */
  carregandoComparado: boolean
}

// ── UMA COLUNA POR LOJA ─────────────────────────────────────────────────────
//
// "Mostrar" escolhe O NÚMERO que aparece na coluna de cada loja. Até
// 22/09/2026 a loja ocupava TRÊS colunas — R$, % e a diferença — e o controle
// só trocava a unidade da terceira: com a rede inteira eram 267 colunas de loja
// e ~25 mil células, todas desenhadas, saíssem elas na tela ou não.
//
// Com uma coluna por loja a grade cabe em um terço das células e em menos da
// metade da largura, e nada se perde: a dica de cada célula traz o valor, o %,
// a distância e o ganho juntos, e "Tudo" devolve as três colunas de antes.
type Mostrar = 'pct' | 'reais' | 'diferenca' | 'ganho' | 'tudo'

const ROTULO_DA_REFERENCIA: Record<Referencia, string> = {
  media: 'média',
  melhor: 'melhor',
  pior: 'pior',
  grupo: 'média do grupo',
}

/** O mesmo, quando a régua são os meses de uma loja só. */
const ROTULO_POR_MES: Record<Referencia, string> = {
  media: 'média dos meses',
  melhor: 'melhor mês',
  pior: 'pior mês',
  // O grupo é sempre de lojas, mesmo quando a régua da seleção vira de meses.
  grupo: 'média do grupo',
}

function rotuloDaReferencia(r: Referencia, porMeses: boolean): string {
  return porMeses ? ROTULO_POR_MES[r] : ROTULO_DA_REFERENCIA[r]
}

const ROTULO_DO_QUE_MOSTRA: Record<Mostrar, string> = {
  pct: '% sobre o faturamento',
  reais: 'valor em R$',
  diferenca: 'distância para a referência',
  ganho: 'ganho em R$ até a referência',
  tudo: 'R$, % e a distância',
}

// ── AS LARGURAS SÃO DECLARADAS EM UM LUGAR SÓ ───────────────────────────────
//
// Elas alimentam `meta.width` E as contas da janela de colunas: um número
// diferente nos dois lugares põe a janela fora do lugar (ver
// `janela-de-colunas.ts`). `meta.width` é PISO, não medida fixa — por isso o
// cabeçalho da coluna de loja tem teto de largura, senão um nome comprido
// empurraria a coluna e a conta sairia errada.
const LARGURA_DA_CONTA = 300
/**
 * A coluna de uma loja com um número só. É a MESMA em todos os modos de
 * propósito: trocar o que a grade mostra não pode deslocar as colunas debaixo
 * do ponteiro, nem mover a rolagem de quem já estava no meio da rede.
 */
const LARGURA_UNICA = 128
/** O modo "Tudo": R$ + % + a distância, como era até 22/09/2026. */
const LARGURA_COMPLETA = 116 + 72 + 88
/** Uma filial dentro do grupo aberto, no modo "Tudo": R$ + %. */
const LARGURA_DA_FILIAL = 116 + 72
/** O modo Período: o período, o de comparação e a variação entre eles. */
// Cada período traz DOIS números — o valor e o "%" sobre o faturamento —, e o
// Δ entre eles fecha o bloco: 112 + 80, duas vezes, mais 88.
const LARGURA_DOS_PERIODOS = (112 + 80) * 2 + 88
/** As quatro colunas de referência, e as duas do consolidado no modo Período. */
const LARGURA_DAS_REFERENCIAS = 120 + 84 + 84 + 84
/** O bloco "Grupo" da Média do grupo: as mesmas quatro colunas, sobre a rede. */
const LARGURA_DO_GRUPO = LARGURA_DAS_REFERENCIAS
const LARGURA_DO_CONSOLIDADO = (116 + 80) * 2
/** O recuo do cabeçalho (`px-4` dos dois lados), descontado do teto do nome. */
const RECUO_DO_CABECALHO = 32

/**
 * A largura da coluna de uma loja. Mora aqui porque é lida em DOIS lugares — o
 * `meta.width` da coluna e a conta da janela — e um número diferente nos dois
 * poria a janela fora do lugar.
 */
function larguraDaColuna(doisPeriodos: boolean, unica: boolean, filiaisAbertas: number): number {
  if (doisPeriodos) return LARGURA_DOS_PERIODOS
  return unica
    ? LARGURA_UNICA * (1 + filiaisAbertas)
    : LARGURA_COMPLETA + filiaisAbertas * LARGURA_DA_FILIAL
}

/** O que a célula de uma filial mostra, por modo de "Mostrar". */
const QUAL_DA_FILIAL: Record<Exclude<Mostrar, 'tudo'>, 'valor' | 'pct' | 'diferenca' | 'ganho'> = {
  pct: 'pct',
  reais: 'valor',
  diferenca: 'diferenca',
  ganho: 'ganho',
}

// ── A GRADE SÓ REDESENHA QUANDO AS PROPS DELA MUDAM ─────────────────────────
//
// O `DataReport` não é memorizado: QUALQUER render do pai o redesenha inteiro,
// mesmo com dado e colunas idênticos. Medido em 22/09/2026, com 17 colunas e
// 612 células, um render custa ~165 ms fixos mais ~110 µs por célula — e abrir
// o resumo das colunas, que não toca a grade, pagava os 230 ms mesmo assim.
//
// Cada escolha da barra vale DOIS renders (o `useDeferredValue` faz um com o
// valor antigo e outro com o novo), e o primeiro deles chega aqui com tudo
// igual. Memorizada, a grade pula esse: metade do custo de toda troca.
//
// O preço é disciplina: toda prop precisa de identidade estável, ou o `memo`
// nunca acerta. As de baixo moram fora do componente; o resto é `useMemo` e
// `useCallback` na própria aba.
const Grade = memo(DataReport) as typeof DataReport

/** A chave da conta como id da linha — ver a nota em `getRowId`, abaixo. */
const idDaLinha = (l: LinhaComparada) => l.linha.chave

const FIXA_A_CONTA = { left: ['conta'] }

// ── O ALFINETE: AS REFERÊNCIAS ACOMPANHAM A ROLAGEM, SE QUISER ──────────────
//
// Pedido do Davi Nascimento (20/10/2026): com a rede inteira, quem rola até a
// 60ª loja perde de vista a média, a melhor e a pior, que ficam no começo. O
// alfinete ao lado do nome do bloco o fixa à esquerda, junto da Conta. Cada
// bloco tem o seu — "Lojas selecionadas" e, com a Média do grupo, "Grupo" (João,
// no mesmo dia) —, e os dois começam soltos: fixo, cada um come ~370 px da
// largura das lojas. Fixar só o Grupo o leva para antes de "Lojas selecionadas":
// o que é fixado vai para a esquerda do que rola.
//
// As folhas fixadas levam `size` (o `DataReport` posiciona a coluna fixada por
// ele, e não por `meta.width`), com o MESMO número do `meta.width`.

/** As folhas que o alfinete fixa, além da Conta — na ordem em que aparecem. */
const FOLHAS_DAS_REFERENCIAS = ['ref-media-valor', 'ref-media', 'ref-melhor', 'ref-pior']
const FOLHAS_DO_GRUPO = ['grupo-valor', 'grupo-media', 'grupo-melhor', 'grupo-pior']
const FOLHAS_DO_CONSOLIDADO = [
  'cons-atual-rs',
  'cons-atual-pct',
  'cons-anterior-rs',
  'cons-anterior-pct',
]

/**
 * ☠️ CONTORNO — O CABEÇALHO DE GRUPO DE UMA COLUNA FIXADA.
 *
 * O `DataReport` (alpha.66) fixa cada `<th>` com `column.getStart('left')`, que só
 * conhece colunas-FOLHA. No cabeçalho de GRUPO (o "Lojas selecionadas · 90",
 * que cobre quatro folhas) a conta devolve a soma de todas as folhas fixadas
 * menos a última: o cabeçalho grudava ~290 px à direita do lugar e abria um
 * buraco ao rolar — o mesmo defeito que levou o Dashboard de RH a não fixar
 * grupo. A largura se corrige pela própria coluna (`size` do grupo = a soma das
 * folhas); a POSIÇÃO não tem prop, e é corrigida aqui, no `<th>` que envolve o
 * cabeçalho, depois de cada desenho.
 *
 * O que quebra se a SDK mudar: se o cabeçalho deixar de ser um `<th>`, nada é
 * corrigido e o grupo volta a grudar fora do lugar — as FOLHAS continuam certas.
 * Se a SDK passar a posicionar grupos sozinha, este ajuste escreve o mesmo
 * número que ela e não muda nada. Pedido em
 * `devolutivas/para-sdk/alpha66-datareport-fixar-grupo-de-colunas.md`.
 */
function CabecalhoDeGrupo({
  fixado,
  inicio,
  children,
}: {
  fixado: boolean
  /** Onde o grupo começa, em px a partir da borda esquerda: a soma das folhas antes dele. */
  inicio: number
  children: ReactNode
}) {
  const ref = useRef<HTMLSpanElement>(null)
  // Sem lista de dependências: o `DataReport` reescreve o `style` do `<th>` a
  // cada desenho dele, e o ajuste precisa vir depois de cada um.
  useLayoutEffect(() => {
    if (!fixado) return
    const th = ref.current?.closest('th')
    if (th && th.style.left !== `${inicio}px`) th.style.left = `${inicio}px`
  })
  return (
    <span ref={ref} className="inline-flex max-w-full min-w-0 items-center gap-1.5">
      {children}
    </span>
  )
}

/** O alfinete de um bloco de referência — "Lojas selecionadas" ou "Grupo". */
function BotaoDeFixar({
  fixado,
  onAlternar,
  colunas,
  soltaOOutro = false,
}: {
  fixado: boolean
  onAlternar: () => void
  /** Como as colunas do bloco se leem no nome do botão: "de referência", "do grupo". */
  colunas: string
  /** Fixar este solta o outro bloco — a tela não comporta os dois (ver `cabemOsDois`). */
  soltaOOutro?: boolean
}) {
  return (
    <Tooltip
      content={
        fixado
          ? 'Soltar estas colunas: elas voltam a rolar junto com as lojas'
          : soltaOOutro
            ? 'Fixar estas colunas à esquerda no lugar das do outro bloco: nesta largura de tela, os dois fixados não deixariam espaço para as lojas'
            : 'Fixar estas colunas à esquerda: elas ficam à vista ao rolar pelas lojas'
      }
    >
      <button
        type="button"
        onClick={(e) => {
          // O cabeçalho do DataReport também responde ao clique.
          e.stopPropagation()
          onAlternar()
        }}
        aria-pressed={fixado}
        aria-label={`${fixado ? 'Soltar' : 'Fixar'} as colunas ${colunas}`}
        className={cn(
          'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded transition-colors duration-fast ease-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          fixado
            ? 'bg-primary/15 text-primary hover:bg-primary/25'
            : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
        )}
      >
        <Pin className={cn('h-3.5 w-3.5', fixado && 'fill-current')} aria-hidden />
      </button>
    </Tooltip>
  )
}

/**
 * A menor grade que ainda se lê: o cartão inteiro — cabeçalho, as duas fileiras
 * de cabeçalho das colunas, o rodapé — com umas seis linhas de conta. Com menos
 * que isso sobrando, a grade passa a ter a altura da aba inteira e o topo rola
 * para fora. Medido em 30/09/2026 com o resumo aberto: a 1440 × 900 sobravam
 * 441 px, quatro linhas; a 1920 × 1080, 621 px, oito linhas.
 */
const GRADE_MINIMA = 520
/** O `gap-2` entre o topo da aba e a grade. */
const VAO_DA_ABA = 8

/**
 * O fundo é só o da seção: as demais linhas seguem o listrado da grade. Até
 * 30/09/2026 as contas de nível 1 e os dois lucros tinham fundo azul, que cobria
 * o listrado — e a coluna Conta, fixada, continuava listrada, então a mesma linha
 * tinha dois fundos. O Davi pediu as linhas iguais, "com esse listrado". O
 * destaque dessas contas fica no negrito.
 */
function classeDaLinha(l: LinhaComparada) {
  return l.linha.tipo === 'secao' ? 'bg-muted' : undefined
}

// A explicação da grade. ESTÁTICA, e por isso fora do componente: criada a
// cada render, ela mudaria de identidade e derrubaria a memorização do cabeçalho
// (e com ele a da grade inteira).
const LEGENDA = (
  <Tooltip
    content={
      <div className="flex max-w-[20rem] flex-col gap-1 text-left text-xs">
        <p>
          Cada coluna é uma loja, e <span className="font-semibold">Mostrar</span> escolhe o número
          que aparece nela: o % sobre o faturamento, o valor em R$, a distância para a referência ou
          o ganho em R$ até ela. A dica de cada célula traz todos de uma vez, seja qual for o
          escolhido, e <span className="font-semibold">Tudo</span> devolve as três colunas por loja.
        </p>
        <p>
          A <span className="font-semibold">referência</span> é a média das lojas selecionadas (a
          linha somada dividida pelo faturamento somado), a melhor ou a pior — ou a{' '}
          <span className="font-semibold">média do grupo</span>, com todas as lojas da rede, que
          abre o bloco <span className="font-semibold">Grupo</span> com a média, a melhor e a pior
          delas. <span className="font-semibold">Verde</span> é a favor e{' '}
          <span className="font-semibold">vermelho</span> contra — custo abaixo, receita e lucro
          acima. A cor pinta a célula em qualquer modo, e fica mais forte com a distância: 0,2 / 0,4
          / 0,8 / 1,6 p.p. (no DIO, 2 / 4 / 8 / 16 dias). Abaixo de 0,2 p.p. é ruído, em cinza. O
          contorno marca a melhor e a pior loja da linha.
        </p>
        <p>
          Em <span className="font-semibold">Mostrar: Ganho R$</span>, o número vira o ganho em
          reais se a conta da coluna fosse igual à referência. Só o lado contra é colorido; o que já
          está melhor aparece em cinza, com sinal −.
        </p>
        <p>
          Em <span className="font-semibold">Comparar com: Período</span>, a coluna deixa de ser
          comparada com as outras lojas: cada operação aparece nos dois períodos, com a diferença
          entre eles. Só entram as operações com plano nos dois.
        </p>
        <p>
          O alfinete ao lado de <span className="font-semibold">Lojas selecionadas</span> e o de{' '}
          <span className="font-semibold">Grupo</span> fixam cada bloco à esquerda, um independente
          do outro, para ele ficar à vista ao rolar pelas lojas.
        </p>
        <p>Não some a coluna entre níveis: o grupo já contém os subitens.</p>
      </div>
    }
  >
    <button
      type="button"
      aria-label="Como ler a comparação"
      className="rounded-full text-muted-foreground transition-colors duration-fast ease-default hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Info className="h-4 w-4" aria-hidden />
    </button>
  </Tooltip>
)

/** A coluna vazia que guarda o lugar das colunas fora da janela. */
function espacador(qual: 'antes' | 'depois', largura: number): ColumnDef<LinhaComparada, unknown> {
  return { id: `espaco-${qual}`, header: '', meta: { width: largura }, cell: () => null }
}

// ── UM CONTROLE SÓ: "COMPARAR COM" ──────────────────────────────────────────
//
// A referência (média, melhor, pior) e a comparação entre dois períodos
// respondem à MESMA pergunta — contra o que esta coluna é medida? —, e como dois
// controles enchiam o cabeçalho: cinco grupos de pílulas ocupavam três linhas e
// sobravam TRÊS linhas de grade (medido em 22/09/2026, 1265 px). Juntos,
// "Período" é só mais uma referência.
type Comparar = Referencia | 'periodo'

/** O valor da referência escolhida numa linha. */
function valorDaReferencia(l: LinhaComparada, r: Referencia): number | null {
  return l.ref[r] ?? null
}

/** A cor da diferença nesta grade — a regra mora em `comparacao.ts`. */
function classeDaDiferenca(d: number, l: LinhaComparada, soContra = false) {
  return classeDoTom(d, l.direcao, l.unidade, soContra)
}

function textoDaMedida(m: Medida | null): string {
  if (!m || m.pct == null) return TRACO
  return m.unidade === 'pct' ? fmtPct(m.pct) : fmtConta(m.unidade, m.pct)
}

/** O ganho em reais como texto. Abaixo do mínimo é ruído, e sai como traço. */
function textoDoGanho(ganho: number | null): string {
  return ganho == null || Math.abs(ganho) < OPORTUNIDADE_MINIMA
    ? TRACO
    : `${ganho > 0 ? '+' : '−'}${fmtCompacto(Math.abs(ganho))}`
}

// ── AS CÉLULAS ──────────────────────────────────────────────────────────────

const CelulaValor = memo(function CelulaValor({ linha, i }: { linha: LinhaComparada; i: number }) {
  if (linha.linha.tipo === 'secao') return null
  const c = linha.celulas[i]!
  if (!c.medida) {
    return (
      <span className="text-muted-foreground" data-dica="Sem plano no período.">
        {TRACO}
      </span>
    )
  }
  const v = c.medida.valor
  if (v == null) return <span className="text-muted-foreground">{TRACO}</span>
  // A dica diz o "e se" nas três referências — o que o HTML mostrava ao passar
  // o ponteiro sobre o valor.
  const linhas: string[] = []
  if (linha.direcao !== 'neutra' && c.medida.pct != null) {
    for (const [r, nome] of [
      ['media', 'à média das lojas'],
      ['melhor', 'à melhor loja'],
      ['pior', 'à pior loja'],
      ['grupo', 'à média do grupo'],
    ] as const) {
      const ref = linha.ref[r] ?? null
      const imp = oportunidade(c.medida.pct, ref, c.base, linha.direcao)
      if (ref == null || imp == null) continue
      linhas.push(
        Math.abs(imp) < OPORTUNIDADE_MINIMA
          ? `Igual ${nome} (${textoDaMedida({ ...c.medida, pct: ref })}).`
          : `Se fosse igual ${nome} (${textoDaMedida({ ...c.medida, pct: ref })}): ${imp > 0 ? 'ganho' : 'perda'} de ${fmtBRLCompacto(Math.abs(imp))}.`
      )
    }
  }
  return (
    <span
      className={cn('tabular-nums', v < 0 && 'text-destructive', linhas.length && 'cursor-help')}
      data-dica={linhas.length ? `${fmtValor(v)}\n${linhas.join('\n')}` : undefined}
    >
      {fmtValor(v)}
    </span>
  )
})

const CelulaPct = memo(function CelulaPct({ linha, i }: { linha: LinhaComparada; i: number }) {
  if (linha.linha.tipo === 'secao') return null
  const m = linha.celulas[i]!.medida
  if (!m || m.pct == null) return <span className="text-muted-foreground">{TRACO}</span>
  // A melhor e a pior LOJA da seleção ganham marca na coluna delas — empate marca
  // todas as empatadas.
  const igual = (x: number | null) => x != null && Math.abs(x - m.pct!) < 1e-9
  // Todas iguais (o faturamento é 100% em toda loja): não há melhor nem pior.
  // E na régua dos MESES não há marca nenhuma: a coluna é uma loja, e dizer que
  // ela é "a melhor" quando ela empata com o melhor mês dela seria mentira.
  const disputa =
    linha.eixo === 'unidades' &&
    linha.direcao !== 'neutra' &&
    linha.ref.lojas > 1 &&
    linha.ref.melhor != null &&
    linha.ref.pior != null &&
    Math.abs(linha.ref.melhor - linha.ref.pior) > 1e-9
  const melhor = disputa && igual(linha.ref.melhor)
  const pior = disputa && igual(linha.ref.pior)
  return (
    <span
      className={cn(
        'tabular-nums',
        melhor && 'font-semibold text-success',
        pior && 'font-semibold text-destructive'
      )}
      data-dica={
        melhor ? 'A melhor loja da seleção.' : pior ? 'A pior loja da seleção.' : undefined
      }
    >
      {textoDaMedida(m)}
    </span>
  )
})

/**
 * A DISTÂNCIA para a referência, em pontos — a terceira coluna do modo "Tudo" e
 * a do cartão no celular. O ganho em reais tem modo próprio, em `CelulaUnica`.
 */
const CelulaDiferenca = memo(function CelulaDiferenca({
  linha,
  i,
  referencia,
}: {
  linha: LinhaComparada
  i: number
  referencia: Referencia
}) {
  if (linha.linha.tipo === 'secao') return null
  const c = linha.celulas[i]!
  const ref = valorDaReferencia(linha, referencia)
  const p = c.medida?.pct
  if (p == null || ref == null) return <span className="text-muted-foreground">{TRACO}</span>
  const d = p - ref
  const { classe, favor } = classeDaDiferenca(d, linha)
  return (
    <span
      className={cn('inline-flex rounded px-1.5 tabular-nums whitespace-nowrap', classe)}
      data-dica={
        favor === null ? undefined : favor ? 'A favor da referência.' : 'Contra a referência.'
      }
    >
      {fmtDiferenca(linha.unidade, d)}
    </span>
  )
})

/**
 * A dica de uma célula de loja: os quatro números de uma vez — o valor, o % da
 * loja, a distância para a referência e o ganho até ela.
 *
 * Ela é a MESMA em todos os modos de "Mostrar": a coluna traz um número e a
 * dica traz o resto, de forma que escolher o que aparece não esconde nada.
 */
function dicaDaCelula(
  linha: LinhaComparada,
  m: Medida,
  referencia: Referencia,
  d: number | null,
  ganho: number | null,
  marca: string | null
): string {
  const linhas: string[] = []
  const cabeca = [
    m.valor == null ? null : fmtValor(m.valor),
    m.pct == null ? null : textoDaMedida(m),
  ]
    .filter((x): x is string => x != null)
    .join(' · ')
  if (cabeca) linhas.push(cabeca)
  const ref = valorDaReferencia(linha, referencia)
  if (d != null && ref != null) {
    linhas.push(
      `${fmtDiferenca(linha.unidade, d)} ante a ${rotuloDaReferencia(referencia, linha.eixo === 'meses')} (${textoDaMedida({ ...m, pct: ref })}).`
    )
  }
  if (ganho != null && Math.abs(ganho) >= OPORTUNIDADE_MINIMA) {
    linhas.push(
      ganho > 0
        ? `Ganho disponível: ${fmtBRLCompacto(ganho)} até a referência.`
        : `Já está melhor que a referência: ${fmtBRLCompacto(-ganho)} a favor.`
    )
  }
  if (marca) linhas.push(marca)
  return linhas.join('\n')
}

/**
 * A célula de uma loja quando a coluna mostra UM número — todos os modos de
 * "Mostrar" menos "Tudo".
 *
 * A COR é sempre a da distância para a referência, seja qual for o número
 * escolhido: é ela que faz uma coluna dizer o que três diziam. A melhor e a
 * pior loja continuam marcadas, agora por contorno — o fundo já pertence à
 * distância.
 */
const CelulaUnica = memo(function CelulaUnica({
  linha,
  i,
  referencia,
  mostra,
}: {
  linha: LinhaComparada
  i: number
  referencia: Referencia
  mostra: Exclude<Mostrar, 'tudo'>
}) {
  if (linha.linha.tipo === 'secao') return null
  const c = linha.celulas[i]!
  const m = c.medida
  if (!m) {
    return (
      <span className="text-muted-foreground" data-dica="Sem plano no período.">
        {TRACO}
      </span>
    )
  }
  const ref = valorDaReferencia(linha, referencia)
  const d = m.pct != null && ref != null ? m.pct - ref : null
  const ganho = oportunidade(m.pct, ref, c.base, linha.direcao)
  // Todas iguais (o faturamento é 100% em toda loja): não há melhor nem pior.
  // Na régua dos MESES ninguém é marcado — ver a nota em `CelulaPct`.
  const disputa =
    linha.eixo === 'unidades' &&
    linha.direcao !== 'neutra' &&
    linha.ref.lojas > 1 &&
    linha.ref.melhor != null &&
    linha.ref.pior != null &&
    Math.abs(linha.ref.melhor - linha.ref.pior) > 1e-9
  const igual = (x: number | null) => m.pct != null && x != null && Math.abs(x - m.pct) < 1e-9
  const melhor = disputa && igual(linha.ref.melhor)
  const pior = disputa && igual(linha.ref.pior)
  const texto =
    mostra === 'pct'
      ? textoDaMedida(m)
      : mostra === 'reais'
        ? m.valor == null
          ? TRACO
          : fmtValor(m.valor)
        : mostra === 'diferenca'
          ? d == null
            ? TRACO
            : fmtDiferenca(linha.unidade, d)
          : textoDoGanho(ganho)
  const { classe, favor } = classeDaDiferenca(d ?? 0, linha, mostra === 'ganho')
  const dica = dicaDaCelula(
    linha,
    m,
    referencia,
    d,
    ganho,
    melhor ? 'A melhor loja da seleção.' : pior ? 'A pior loja da seleção.' : null
  )
  return (
    <span
      className={cn(
        'inline-flex rounded px-1.5 tabular-nums whitespace-nowrap',
        classe,
        // Sem tom (linha informativa, ou sem referência) o valor negativo volta
        // a ser vermelho por si: ali a cor não está falando de distância.
        favor === null && mostra === 'reais' && (m.valor ?? 0) < 0 && 'text-destructive',
        melhor && 'ring-1 ring-inset ring-success',
        pior && 'ring-1 ring-inset ring-destructive',
        dica && 'cursor-help'
      )}
      data-dica={dica || undefined}
    >
      {texto}
    </span>
  )
})

/**
 * A célula de uma FILIAL, dentro de um grupo aberto.
 *
 * O valor é medido na hora, a partir do agregado da operação sem agrupar: pôr
 * as filiais dentro da linha faria a identidade dela mudar a cada grupo aberto,
 * e a grade inteira redesenharia (ver `linhaComparada`). Medir uma conta num
 * agregado é uma soma de posições no vetor — mais barato que o desenho.
 */
const CelulaDaFilial = memo(function CelulaDaFilial({
  linha,
  ag,
  cat,
  qual,
  referencia,
}: {
  linha: LinhaComparada
  ag: Agregado
  cat: Catalogo
  /** No modo "Tudo" a filial ocupa duas colunas; nos demais, uma só. */
  qual: 'valor' | 'pct' | 'diferenca' | 'ganho'
  referencia: Referencia
}) {
  if (linha.linha.tipo === 'secao') return null
  const m = medir(linha.linha, ag, cat)
  // A filial sai em cinza, SEM o tom da diferença: quem está na disputa de
  // melhor e pior é o grupo, e pintar as partes junto tiraria o total do lugar
  // de destaque.
  const ref = valorDaReferencia(linha, referencia)
  const texto =
    qual === 'valor'
      ? m.valor == null
        ? TRACO
        : fmtValor(m.valor)
      : qual === 'pct'
        ? textoDaMedida(m)
        : qual === 'diferenca'
          ? m.pct == null || ref == null
            ? TRACO
            : fmtDiferenca(linha.unidade, m.pct - ref)
          : textoDoGanho(
              oportunidade(m.pct, ref, baseDaOportunidade(linha.linha, ag, cat), linha.direcao)
            )
  return <span className="tabular-nums text-muted-foreground">{texto}</span>
})

const CelulaReferencia = memo(function CelulaReferencia({
  linha,
  qual,
  doGrupo = false,
}: {
  linha: LinhaComparada
  qual: 'mediaValor' | Exclude<Referencia, 'grupo'>
  /** A coluna é do bloco "Grupo" — a mesma conta, sobre a rede inteira. */
  doGrupo?: boolean
}) {
  if (linha.linha.tipo === 'secao') return null
  if (qual === 'mediaValor') {
    const valor = doGrupo ? linha.grupoValor : linha.mediaValor
    return (
      <span className="tabular-nums text-muted-foreground">
        {valor == null ? TRACO : fmtValor(valor)}
      </span>
    )
  }
  const v = doGrupo ? (linha.grupo?.[qual] ?? null) : linha.ref[qual]
  return (
    <span className="tabular-nums text-muted-foreground">
      {v == null ? TRACO : linha.unidade === 'pct' ? fmtPct(v) : fmtConta(linha.unidade, v)}
    </span>
  )
})

/** O consolidado das lojas nas duas pontas, num dos dois períodos. */
const CelulaConsolidada = memo(function CelulaConsolidada({
  linha,
  qual,
}: {
  linha: LinhaComparada
  qual: 'atual' | 'anterior'
}) {
  if (linha.linha.tipo === 'secao') return null
  const m = qual === 'atual' ? linha.consolidado : linha.consolidadoAnterior
  if (!m || m.valor == null) return <span className="text-muted-foreground">{TRACO}</span>
  return (
    <span className={cn('tabular-nums text-primary', m.valor < 0 && 'text-destructive')}>
      {fmtValor(m.valor)}
    </span>
  )
})

/** O "%" do consolidado num dos dois períodos — ver `CelulaPctNoPeriodo`. */
const CelulaConsolidadaPct = memo(function CelulaConsolidadaPct({
  linha,
  qual,
}: {
  linha: LinhaComparada
  qual: 'atual' | 'anterior'
}) {
  if (linha.linha.tipo === 'secao') return null
  const m = qual === 'atual' ? linha.consolidado : linha.consolidadoAnterior
  if (!m || m.valor == null || m.pct == null) {
    return <span className="text-muted-foreground">{TRACO}</span>
  }
  return <span className="tabular-nums text-primary">{fmtPct(m.pct)}</span>
})

/** O valor da coluna num dos dois períodos — o modo Dois períodos. */
const CelulaNoPeriodo = memo(function CelulaNoPeriodo({
  linha,
  i,
  qual,
}: {
  linha: LinhaComparada
  i: number
  qual: 'atual' | 'anterior'
}) {
  if (linha.linha.tipo === 'secao') return null
  const c = linha.celulas[i]!
  const m = qual === 'atual' ? c.medida : c.medidaAnterior
  // Conta de fluxo e de saldo mostram REAIS; razão e indicador calculado só têm
  // a própria razão (ver `medir`), e é ela que aparece.
  const v = m ? (m.valor ?? m.pct) : null
  if (v == null) {
    return (
      <span
        className="text-muted-foreground"
        data-dica={
          qual === 'anterior' ? 'Sem plano no período de comparação.' : 'Sem plano no período.'
        }
      >
        {TRACO}
      </span>
    )
  }
  return (
    <span className={cn('tabular-nums', v < 0 && 'text-destructive')}>
      {m!.valor != null ? fmtValor(v) : fmtConta(m!.unidade, v)}
    </span>
  )
})

/**
 * O "%" da linha num dos dois períodos: o valor sobre o FATURAMENTO do mesmo
 * recorte, com o `1 FATURAMENTO` em 100%. É o mesmo número da grade do Plano de
 * contas, e o que a tabela do legado põe ao lado de cada valor (pedido do Davi
 * Nascimento em 24/09/2026 — até então o modo Período mostrava só reais, porque
 * o controle **Mostrar** fica escondido nele).
 *
 * ☠️ RAZÃO e indicador calculado ficam com "—", de propósito. Eles não têm valor
 * em reais: o número deles JÁ É um percentual (rentabilidade) ou um múltiplo
 * (vinhos, couvert), e é ele que a coluna de R$ ao lado mostra. Repetir o mesmo
 * número aqui faria uma conta só parecer duas.
 */
const CelulaPctNoPeriodo = memo(function CelulaPctNoPeriodo({
  linha,
  i,
  qual,
}: {
  linha: LinhaComparada
  i: number
  qual: 'atual' | 'anterior'
}) {
  if (linha.linha.tipo === 'secao') return null
  const c = linha.celulas[i]!
  const m = qual === 'atual' ? c.medida : c.medidaAnterior
  if (!m || m.valor == null || m.pct == null) {
    return (
      <span
        className="text-muted-foreground"
        data-dica={
          m && m.valor == null
            ? 'Esta linha já é um percentual: o número está na coluna ao lado.'
            : undefined
        }
      >
        {TRACO}
      </span>
    )
  }
  return <span className="tabular-nums">{fmtPct(m.pct)}</span>
})

/**
 * A mudança de um período para o outro: relativa nos valores em reais, em pontos
 * nos percentuais e nos múltiplos — a mesma régua da grade do Plano de contas.
 * Verde é a favor da direção do bom da linha.
 */
const CelulaEntrePeriodos = memo(function CelulaEntrePeriodos({
  linha,
  i,
}: {
  linha: LinhaComparada
  i: number
}) {
  if (linha.linha.tipo === 'secao') return null
  const c = linha.celulas[i]!
  const atual = c.medida
  const anterior = c.medidaAnterior
  if (!atual || !anterior) return <span className="text-muted-foreground">{TRACO}</span>
  // ☠️ A régua é o que a linha TEM, não a unidade da coluna: numa conta de
  // fluxo, `pct` é a parte no faturamento — e ela é 100% nos dois períodos na
  // linha do próprio faturamento, o que fazia a diferença sair "0,00" (visto em
  // 21/09/2026). Onde há valor em reais, a mudança é a dele.
  const emReais = atual.valor != null && anterior.valor != null
  const a = emReais ? atual.valor : atual.pct
  const b = emReais ? anterior.valor : anterior.pct
  if (a == null || b == null) return <span className="text-muted-foreground">{TRACO}</span>
  const d = emReais ? (Math.abs(b) < 1e-9 ? null : (a - b) / Math.abs(b)) : a - b
  if (d == null) return <span className="text-muted-foreground">{TRACO}</span>
  const favor = aFavor(d, linha.direcao)
  return (
    <span
      className={cn(
        'tabular-nums',
        favor === null && 'text-muted-foreground',
        favor === true && 'text-success',
        favor === false && 'text-destructive'
      )}
      data-dica={
        emReais
          ? `${fmtValor(b)} → ${fmtValor(a)}`
          : `${fmtConta(linha.unidade, b)} → ${fmtConta(linha.unidade, a)}`
      }
    >
      {emReais ? fmtVariacao(d) : fmtDiferenca(linha.unidade, d)}
    </span>
  )
})

export function AbaComparativos({
  cat,
  recorte: recorteDoTopo,
  operacoes,
  abertas,
  onAbertasChange,
  onAlternarConta,
  membrosPorGrupo,
  detalheDasFiliais,
  carregando,
  rotuloPeriodo,
  inicioComparado,
  onInicioComparadoChange,
  mesesNoPeriodo,
  meses,
  recorteComparado,
  carregandoComparado,
}: Props) {
  const [cheia, setCheia] = useState(false)
  // Os grupos com as filiais à mostra. Adiado como o resto: o clique marca na
  // hora e a grade monta as colunas novas em segundo plano.
  const [gruposAbertos, setGruposAbertos] = useState<ReadonlySet<string>>(new Set())
  const [comparar, setComparar] = useState<Comparar>('media')
  const [colunasPor, setColunasPor] = useState<ColunasPor>('operacao')
  // Abre em "Tudo" — as três colunas por loja (decisão do João, 22/09/2026):
  // quem chega na aba quer ver o valor, o % e a distância de uma vez. Reduzir a
  // um número é o atalho de quem vai NAVEGAR a rede inteira, e aí a grade fica
  // três vezes menor.
  const [mostra, setMostra] = useState<Mostrar>('tudo')
  // O resumo abre sozinho só com poucas colunas: com a rede inteira ele empurraria
  // a grade para baixo e ninguém leria 86 cartões numa faixa. O clique decide
  // depois; `null` = ainda não decidiu.
  const [resumoEscolhido, setResumoEscolhido] = useState<boolean | null>(null)
  // Os alfinetes de "Lojas selecionadas" e de "Grupo" (ver `BotaoDeFixar`), um
  // independente do outro. Soltos ao abrir.
  const [fixado, setFixado] = useState(false)
  const [grupoFixado, setGrupoFixado] = useState(false)
  // A largura da grade, para os dois alfinetes saberem se cabem juntos (ver
  // `cabemOsDois`). `0` até a primeira medida — e, até lá, um por vez.
  const [vistaDaGrade, setVistaDaGrade] = useState(0)

  // ── A MÉDIA DO GRUPO SÓ APARECE QUANDO DIZ ALGO ───────────────────────────
  //
  // Com todas as lojas do grupo já na seleção, a média do grupo É a média — a
  // opção some (pedido do Davi, 20/10/2026). Escolhida e depois tornada inútil
  // (o usuário marcou o resto), a comparação volta à Média sozinha.
  //
  // A disponibilidade sai do recorte do TOPO: o modo Período troca o período
  // comparado, não o grupo.
  const grupoDisponivel = useMemo(
    () =>
      [...recorteDoTopo.grupo].some(
        (r) => recorteDoTopo.porLoja.has(r) && !recorteDoTopo.naConta.has(r)
      ),
    [recorteDoTopo]
  )
  const compararAtivo: Comparar = comparar === 'grupo' && !grupoDisponivel ? 'media' : comparar

  // ── EM TELA BAIXA, O TOPO DA ABA ROLA PARA FORA ──────────────────────────
  //
  // A aba tinha altura fixa: controles e resumo presos em cima, e a grade com o
  // que sobrasse. A 1100 × 700, com o resumo aberto, sobravam 121 px — nenhuma
  // linha de conta à vista (João, 30/09/2026: "está fixo na tela, sendo que não
  // deveria"). Agora a aba rola: quando o que sobra para a grade fica abaixo de
  // `GRADE_MINIMA`, a grade passa a ter a altura da aba INTEIRA, e rolar a aba
  // leva controles e resumo para fora da vista. Com espaço, nada muda: a grade
  // fica com o resto e a aba não rola.
  //
  // A altura sai de medida, e não de CSS: `min-height` em porcentagem dentro de
  // uma coluna que rola não tem a que se referir, e `container-type: size` daria
  // contenção de layout — que prende o `position: fixed` (o defeito de 21/09).
  const { ref: refDaAba, altura: alturaDaAba } = useTamanho<HTMLDivElement>()
  const { ref: refDoTopo, altura: alturaDoTopo } = useTamanho<HTMLDivElement>()
  const sobraParaAGrade = alturaDaAba - alturaDoTopo - VAO_DA_ABA
  const gradeNaAbaInteira = alturaDaAba > 0 && sobraParaAGrade < GRADE_MINIMA

  // O controle marca a escolha na hora; a grade usa a adiada.
  const gruposExibidos = useDeferredValue(gruposAbertos)
  const compararExibido = useDeferredValue(compararAtivo)
  const colunasExibidas = useDeferredValue(colunasPor)
  const mostraExibida = useDeferredValue(mostra)
  const abertasExibidas = useDeferredValue(abertas)
  // ── O ESQUELETO É SÓ PARA A GRADE QUE MUDA DE FORMA ───────────────────────
  //
  // `data={[]} loading` ESVAZIA a grade: o `DataReport` tira as ~25 mil células
  // do DOM e as recria depois. Isso faz sentido quando as COLUNAS mudam (outro
  // agrupamento, entrar ou sair do modo Período) — ali a grade é outra.
  //
  // Não faz sentido ao abrir uma conta ou trocar p.p. por R$: são as mesmas
  // colunas, e esvaziar joga fora o trabalho que o `memo` das células existe
  // para poupar. Era o que fazia abrir uma conta travar 1,5 s (22/09/2026).
  const mudaDeForma =
    colunasPor !== colunasExibidas ||
    (compararAtivo === 'periodo') !== (compararExibido === 'periodo') ||
    // Entrar ou sair da Média do grupo põe ou tira o bloco "Grupo".
    (compararAtivo === 'grupo') !== (compararExibido === 'grupo') ||
    // Entrar ou sair do "Tudo" muda QUANTAS colunas a loja tem; trocar entre os
    // modos de um número só troca o conteúdo das mesmas colunas.
    (mostra === 'tudo') !== (mostraExibida === 'tudo') ||
    gruposAbertos !== gruposExibidos
  const esperando =
    carregando || mudaDeForma || (compararAtivo === 'periodo' && carregandoComparado)

  const doisPeriodos = compararExibido === 'periodo'
  // ── QUAL RECORTE A GRADE USA ──────────────────────────────────────────────
  //
  // O do topo, exceto no modo Período com OUTRO período escolhido: ali o lado
  // comparado é outro, e com ele mudam as lojas que têm plano nas duas pontas.
  // O lado ATUAL é o mesmo nos dois — os meses do topo não mudaram.
  const recorte = doisPeriodos && recorteComparado ? recorteComparado : recorteDoTopo
  const periodoComparado = useMemo(
    () => periodoComTamanho(inicioComparado, mesesNoPeriodo),
    [inicioComparado, mesesNoPeriodo]
  )
  const rotuloAnterior = rotuloDoPeriodo(periodoComparado)
  // Com "Período" escolhido não há referência ENTRE LOJAS: o resumo das colunas
  // e a nota do cabeçalho voltam à média, que é a leitura neutra.
  const referencia: Referencia = compararAtivo === 'periodo' ? 'media' : compararAtivo
  const referenciaExibida: Referencia = doisPeriodos ? 'media' : compararExibido
  const itens = useMemo(
    () => itensDaComparacao(recorte, operacoes, colunasExibidas, cat, doisPeriodos),
    [recorte, operacoes, colunasExibidas, cat, doisPeriodos]
  )
  // ── ABRIR UMA CONTA NÃO PODE REDESENHAR A GRADE INTEIRA ───────────────────
  //
  // A conta em si é barata: medir as 167 linhas nas 89 colunas leva ~6 ms. O
  // caro é o DESENHO — 25 mil células no `DataReport` —, e ele acontecia a cada
  // abertura porque `linhasDaComparacao` devolvia objetos NOVOS para todas as
  // linhas, inclusive as que não mudaram. As células são `memo`, mas memo com
  // prop nova não segura nada: 1,5 s de tela travada ao abrir uma conta
  // (medido em 22/09/2026, com a rede inteira).
  //
  // Agora a linha pronta fica GUARDADA por chave. Abrir ou fechar uma conta só
  // acrescenta ou tira linhas da lista; as demais voltam com a MESMA identidade
  // e o `memo` das células as pula. O cache morre junto com o comparador — ou
  // seja, a cada recorte, coluna ou catálogo novo.
  // ── SOBRE O QUE MÉDIA, MELHOR E PIOR SÃO CALCULADOS ───────────────────────
  //
  // Lojas quando há duas ou mais; os meses da única loja quando o período tem
  // vários; nenhuma quando não sobra eixo. A regra e o porquê estão em
  // `reguaDaComparacao`. Aqui a consequência é de TEXTO: cada rótulo que diz
  // "loja" tem de dizer "mês" quando a régua virar, senão o mesmo rótulo passa
  // a medir outra coisa sem ninguém perceber.
  // O eixo principal DESTA aba são as lojas com plano — nunca as colunas, que
  // podem estar agrupadas por região ou estado (`comparativos.ts`: "a referência
  // não muda com o agrupamento").
  const lojasDaRegua = useMemo(
    () => [...recorte.naConta].map((r) => recorte.porLoja.get(r)).filter((a): a is Agregado => !!a),
    [recorte]
  )
  const regua = useMemo(
    () => reguaDaComparacao(lojasDaRegua, recorte, meses, cat),
    [lojasDaRegua, recorte, meses, cat]
  )
  const porMeses = regua.eixo === 'meses'
  // ── O GRUPO SÓ É SOMADO QUANDO PEDIDO ─────────────────────────────────────
  //
  // O plano de todas as lojas do grupo já está na memória: a matriz de cada mês
  // traz a rede inteira, e a seleção só filtra (ver `recorte.ts`). Escolher a
  // Média do grupo não consulta nada — soma o que já veio, e só então.
  const grupo = useMemo<GrupoDaComparacao | null>(() => {
    if (referenciaExibida !== 'grupo' || doisPeriodos) return null
    const refs = [...recorte.grupo].filter((r) => recorte.porLoja.has(r))
    return refs.length
      ? {
          pontos: refs.map((r) => recorte.porLoja.get(r)!),
          consolidado: consolidar(recorte.porLoja, refs, cat),
        }
      : null
  }, [referenciaExibida, doisPeriodos, recorte, cat])
  const medirLinha = useMemo(
    () => comparadorDeLinhas(itens, recorte, cat, regua, grupo),
    [itens, recorte, cat, regua, grupo]
  )
  // A linha volta IDÊNTICA quando nada dela mudou; só a conta que abriu ou
  // fechou ganha objeto novo, e só as células dela redesenham (o porquê e o
  // cache estão em `linhaComparada`).
  const linhas = useMemo(
    () =>
      linhasDaGrade(cat, abertasExibidas).map((l) =>
        linhaComparada(medirLinha, l, l.tipo === 'conta' && abertasExibidas.has(l.conta.formatado))
      ),
    [cat, abertasExibidas, medirLinha]
  )
  const refsDoResumo = useMemo(() => referenciasDoResumo(regua, cat, grupo), [regua, cat, grupo])
  const lojasNaReferencia = [...recorte.naConta].filter((r) => recorte.porLoja.has(r)).length
  // O subtítulo DIZ sobre o que a referência foi calculada. Sem isto, "referência:
  // média" com uma loja marcada parecia média de lojas.
  const textoDaRegua = grupo
    ? `referência: média do grupo, ${plural(grupo.pontos.length, 'loja', 'lojas')}`
    : regua.eixo === 'nenhum'
      ? 'sem referência: uma loja e um mês só'
      : porMeses
        ? `referência: ${rotuloDaReferencia(referenciaExibida, true)} — os ${regua.pontos.length} meses desta loja`
        : `referência: ${rotuloDaReferencia(referenciaExibida, false)} de ${plural(lojasNaReferencia, 'loja', 'lojas')}`
  const resumoAberto = resumoEscolhido ?? itens.length <= 8

  // Quem está marcado mas não entra na comparação, com o motivo. Era uma nota no
  // fim do subtítulo ("15 operações sem plano ficam de fora"), que só dizia
  // QUANTAS e ocupava a terceira linha do cabeçalho; como selo, diz QUAIS.
  const fora = useMemo(() => {
    const nome = new Map(operacoes.map((o) => [o.ref, o.nome]))
    const semPlanoNoPeriodo = `Sem plano em ${rotuloPeriodo}`
    return [...recorte.naConta]
      .filter((ref) => nome.has(ref))
      .filter((ref) => (doisPeriodos ? !recorte.nasDuasPontas.has(ref) : !recorte.porLoja.has(ref)))
      .map((ref) => ({
        ref,
        nome: nome.get(ref) ?? ref,
        motivo: !recorte.porLoja.has(ref)
          ? doisPeriodos && !recorte.porLojaAnterior.has(ref)
            ? 'Sem plano nos dois períodos'
            : semPlanoNoPeriodo
          : `Sem plano em ${rotuloAnterior}`,
      }))
  }, [recorte, operacoes, doisPeriodos, rotuloPeriodo, rotuloAnterior])

  // ── QUANTO CADA BLOCO DE COLUNA OCUPA ─────────────────────────────────────
  //
  // A janela precisa da largura de cada bloco ANTES de montar as colunas, para
  // saber quais estão na vista. A lista tem a MESMA ordem das colunas montadas
  // abaixo: o bloco 0 é a parte SOLTA das referências (o consolidado, no modo
  // Período) e os demais são os itens, um por loja ou grupo. O que o alfinete
  // fixou fica fora da janela, sempre desenhado, e as lojas começam depois dele.
  const comGrupo = grupo !== null
  // ── OS DOIS ALFINETES, SÓ SE SOBRAREM DUAS LOJAS À VISTA ──────────────────
  //
  // Fixados juntos, "Lojas selecionadas" e "Grupo" ocupam 1.044 px com a Conta.
  // Medido em 20/10/2026 com a tela de 1440 px: sobravam 234 px para as lojas,
  // menos de duas colunas, e a 1366 px quase nada. Onde não cabem os dois e mais
  // duas lojas, fixar um solta o outro, e a dica do alfinete avisa antes.
  const cabemOsDois =
    vistaDaGrade - LARGURA_DA_CONTA - LARGURA_DAS_REFERENCIAS - LARGURA_DO_GRUPO >=
    2 * larguraDaColuna(false, mostraExibida !== 'tudo', 0)
  // O alfinete do Grupo vale com o bloco à vista — e cede ao outro quando a tela
  // estreita depois de os dois estarem fixados.
  const grupoPreso = comGrupo && grupoFixado && (!fixado || cabemOsDois)
  const larguras = useMemo(() => {
    const unica = mostraExibida !== 'tudo'
    const daLoja = (it: ItemDeComparacao) => {
      const filiais = (!doisPeriodos && membrosPorGrupo?.get(it.chave)?.length) || 0
      const abertas = filiais > 1 && gruposExibidos.has(it.chave) ? filiais : 0
      return larguraDaColuna(doisPeriodos, unica, abertas)
    }
    const solto = doisPeriodos
      ? fixado
        ? 0
        : LARGURA_DO_CONSOLIDADO
      : (fixado ? 0 : LARGURA_DAS_REFERENCIAS) + (comGrupo && !grupoPreso ? LARGURA_DO_GRUPO : 0)
    const lojas = itens.map(daLoja)
    return solto > 0 ? [solto, ...lojas] : lojas
  }, [
    itens,
    doisPeriodos,
    mostraExibida,
    membrosPorGrupo,
    gruposExibidos,
    comGrupo,
    fixado,
    grupoPreso,
  ])
  const larguraFixada =
    (fixado ? (doisPeriodos ? LARGURA_DO_CONSOLIDADO : LARGURA_DAS_REFERENCIAS) : 0) +
    (grupoPreso ? LARGURA_DO_GRUPO : 0)
  const { alvo: alvoDaGrade, janela } = useJanelaDeColunas(
    larguras,
    LARGURA_DA_CONTA + larguraFixada,
    setVistaDaGrade
  )
  // A janela entra ADIADA como o resto: rolar não pode esperar o desenho das
  // colunas novas, e o vazio das pontas segura a rolagem no lugar enquanto elas
  // não chegam.
  const janelaExibida = useDeferredValue(janela)

  const colunas = useMemo<ColumnDef<LinhaComparada, unknown>[]>(() => {
    // A coluna fixada fica SEM pai: o DataReport fixa a célula com
    // `column.getStart('left')`, que só conhece colunas-folha, e um pai saía com
    // posição e largura erradas, abrindo um buraco no cabeçalho ao rolar (RH).
    const conta: ColumnDef<LinhaComparada, unknown> = {
      id: 'conta',
      header: 'Conta',
      accessorFn: (l) => l.linha.chave,
      size: 300,
      // ☠️ O código da conta não é valor — e é a única coluna com `accessorFn` que
      // devolve número (os valores são desenhados pelo `cell`). Foi ela que acendeu
      // a calculadora da alpha.66, que só somava o "2" de "2 MATERIA PRIMA". Com o
      // código fora, a grade fica sem o botão, como antes da alpha.66.
      meta: { width: 300, mobile: 'primary', calculadora: false },
      cell: ({ row }) => (
        <ContaNaArvore
          linha={row.original.linha}
          cat={cat}
          aberta={row.original.aberta}
          onAlternar={onAlternarConta}
        />
      ),
    }
    // Onde os dois não cabem, fixar um solta o outro (ver `cabemOsDois`).
    const alternarFixado = () => {
      setFixado(!fixado)
      if (!fixado && comGrupo && !cabemOsDois) setGrupoFixado(false)
    }
    const alternarGrupoFixado = () => {
      setGrupoFixado(!grupoPreso)
      if (!grupoPreso && !cabemOsDois) setFixado(false)
    }
    // O botão de um bloco avisa quando fixá-lo vai soltar o do outro.
    const soltaOGrupo = !fixado && grupoPreso && !cabemOsDois
    const soltaASelecao = !grupoPreso && fixado && !cabemOsDois
    const consolidado: ColumnDef<LinhaComparada, unknown> = {
      id: 'consolidado',
      size: LARGURA_DO_CONSOLIDADO,
      header: () => (
        <CabecalhoDeGrupo fixado={fixado} inicio={LARGURA_DA_CONTA}>
          <span className="min-w-0 truncate text-primary">Lojas selecionadas · {itens.length}</span>
          <BotaoDeFixar
            fixado={fixado}
            onAlternar={alternarFixado}
            colunas="de referência"
            soltaOOutro={soltaOGrupo}
          />
        </CabecalhoDeGrupo>
      ),
      columns: [
        {
          id: 'cons-atual',
          size: 116 + 80,
          header: () => (
            <CabecalhoDeGrupo fixado={fixado} inicio={LARGURA_DA_CONTA}>
              {rotuloPeriodo}
            </CabecalhoDeGrupo>
          ),
          columns: [
            {
              id: 'cons-atual-rs',
              header: 'R$',
              size: 116,
              meta: { width: 116 },
              cell: ({ row }) => <CelulaConsolidada linha={row.original} qual="atual" />,
            },
            {
              id: 'cons-atual-pct',
              header: '%',
              size: 80,
              meta: { width: 80 },
              cell: ({ row }) => <CelulaConsolidadaPct linha={row.original} qual="atual" />,
            },
          ],
        },
        {
          id: 'cons-anterior',
          size: 116 + 80,
          header: () => (
            <CabecalhoDeGrupo fixado={fixado} inicio={LARGURA_DA_CONTA + 116 + 80}>
              {rotuloAnterior}
            </CabecalhoDeGrupo>
          ),
          columns: [
            {
              id: 'cons-anterior-rs',
              header: 'R$',
              size: 116,
              meta: { width: 116 },
              cell: ({ row }) => <CelulaConsolidada linha={row.original} qual="anterior" />,
            },
            {
              id: 'cons-anterior-pct',
              header: '%',
              size: 80,
              meta: { width: 80 },
              cell: ({ row }) => <CelulaConsolidadaPct linha={row.original} qual="anterior" />,
            },
          ],
        },
      ],
    }
    const referencias: ColumnDef<LinhaComparada, unknown> = {
      id: 'referencias',
      size: LARGURA_DAS_REFERENCIAS,
      header: () => (
        <CabecalhoDeGrupo fixado={fixado} inicio={LARGURA_DA_CONTA}>
          <span className="min-w-0 truncate text-primary">
            {porMeses
              ? `Meses desta loja · ${regua.pontos.length}`
              : `Lojas selecionadas · ${lojasNaReferencia}`}
          </span>
          <BotaoDeFixar
            fixado={fixado}
            onAlternar={alternarFixado}
            colunas="de referência"
            soltaOOutro={soltaOGrupo}
          />
        </CabecalhoDeGrupo>
      ),
      columns: [
        {
          id: 'ref-media-valor',
          size: 120,
          // Na régua dos meses o número é o de UM mês médio, e não o do período
          // inteiro: sem o "/mês" ele fica ao lado da coluna da loja parecendo
          // doze vezes menor do que devia.
          header: porMeses ? 'Média R$/mês' : 'Média R$',
          meta: { width: 120 },
          cell: ({ row }) => <CelulaReferencia linha={row.original} qual="mediaValor" />,
        },
        {
          id: 'ref-media',
          size: 84,
          header: porMeses ? 'Média dos meses' : 'Média %',
          meta: { width: 84 },
          cell: ({ row }) => <CelulaReferencia linha={row.original} qual="media" />,
        },
        {
          id: 'ref-melhor',
          size: 84,
          header: porMeses ? 'Melhor mês' : 'Melhor %',
          meta: { width: 84 },
          cell: ({ row }) => <CelulaReferencia linha={row.original} qual="melhor" />,
        },
        {
          id: 'ref-pior',
          size: 84,
          header: porMeses ? 'Pior mês' : 'Pior %',
          meta: { width: 84 },
          cell: ({ row }) => <CelulaReferencia linha={row.original} qual="pior" />,
        },
      ],
    }
    // O bloco do GRUPO, ao lado: as mesmas quatro colunas, sobre todas as lojas
    // da rede — média, melhor e pior (João, 20/10/2026). Fixado, ele fica depois
    // de "Lojas selecionadas" se ela também estiver fixa, e logo após a Conta se
    // não estiver.
    const doGrupo: ColumnDef<LinhaComparada, unknown> | null = grupo && {
      id: 'grupo',
      size: LARGURA_DO_GRUPO,
      header: () => (
        <CabecalhoDeGrupo
          fixado={grupoPreso}
          inicio={LARGURA_DA_CONTA + (fixado ? LARGURA_DAS_REFERENCIAS : 0)}
        >
          <Tooltip content="Todas as lojas da rede, marcadas ou não, com os mesmos filtros de status e de Mesmas lojas. As unidades de teste ficam de fora.">
            <span className="min-w-0 cursor-help truncate text-primary">
              Grupo · {plural(grupo.pontos.length, 'loja', 'lojas')}
            </span>
          </Tooltip>
          <BotaoDeFixar
            fixado={grupoPreso}
            onAlternar={alternarGrupoFixado}
            colunas="do grupo"
            soltaOOutro={soltaASelecao}
          />
        </CabecalhoDeGrupo>
      ),
      columns: [
        {
          id: 'grupo-valor',
          size: 120,
          header: 'Média R$',
          meta: { width: 120 },
          cell: ({ row }) => <CelulaReferencia linha={row.original} qual="mediaValor" doGrupo />,
        },
        {
          id: 'grupo-media',
          size: 84,
          header: 'Média %',
          meta: { width: 84 },
          cell: ({ row }) => <CelulaReferencia linha={row.original} qual="media" doGrupo />,
        },
        {
          id: 'grupo-melhor',
          size: 84,
          header: 'Melhor %',
          meta: { width: 84 },
          cell: ({ row }) => <CelulaReferencia linha={row.original} qual="melhor" doGrupo />,
        },
        {
          id: 'grupo-pior',
          size: 84,
          header: 'Pior %',
          meta: { width: 84 },
          cell: ({ row }) => <CelulaReferencia linha={row.original} qual="pior" doGrupo />,
        },
      ],
    }
    // ── A SETA DE MATRIZ E FILIAIS ────────────────────────────────────────
    //
    // Com a consolidação ligada, a coluna do grupo é o TOTAL dele. A seta abre
    // as operações ao lado desse total — um nível a mais de cabeçalho, e não a
    // troca do grupo pelas partes. Só em "Lojas lado a lado": no modo Período o
    // detalhe teria de existir nos dois períodos, e ele é do atual.
    const abrirFiliais = (chave: string) =>
      setGruposAbertos((atual) => {
        const proximo = new Set(atual)
        if (proximo.has(chave)) proximo.delete(chave)
        else proximo.add(chave)
        return proximo
      })

    const unica = mostraExibida !== 'tudo'
    // O modo escolhido sem o "Tudo" — o que as células de um número recebem.
    const umNumero: Exclude<Mostrar, 'tudo'> = mostraExibida === 'tudo' ? 'pct' : mostraExibida

    const porItem = itens.map<ColumnDef<LinhaComparada, unknown>>((it, i) => {
      const filiais = (!doisPeriodos && membrosPorGrupo?.get(it.chave)) || []
      const aberto = filiais.length > 1 && gruposExibidos.has(it.chave)
      // ☠️ O TETO DO NOME no cabeçalho não é enfeite: `meta.width` é PISO, e um
      // nome comprido empurra a coluna além dele — a janela de colunas erraria
      // a conta de onde cada uma começa (ver `janela-de-colunas.ts`).
      const tetoDoNome = {
        maxWidth:
          larguraDaColuna(doisPeriodos, unica, aberto ? filiais.length : 0) - RECUO_DO_CABECALHO,
      }
      const daFilial = (m: { ref: string; nome: string }): ColumnDef<LinhaComparada, unknown> => {
        const ag = detalheDasFiliais?.get(m.ref)
        const nome = (
          <span
            className="block truncate font-normal"
            style={{ maxWidth: LARGURA_UNICA - RECUO_DO_CABECALHO }}
          >
            {m.nome}
          </span>
        )
        // Uma coluna por filial, como a do grupo: a filial mostra o MESMO
        // número que "Mostrar" escolheu, para a linha inteira se ler igual.
        if (unica) {
          return {
            id: `${it.chave}-filial-${m.ref}`,
            header: () => nome,
            meta: { width: LARGURA_UNICA },
            cell: ({ row }) =>
              ag ? (
                <CelulaDaFilial
                  linha={row.original}
                  ag={ag}
                  cat={cat}
                  qual={QUAL_DA_FILIAL[umNumero]}
                  referencia={referenciaExibida}
                />
              ) : null,
          }
        }
        return {
          id: `${it.chave}-filial-${m.ref}`,
          header: () => nome,
          columns: [
            {
              id: `${it.chave}-filial-${m.ref}-valor`,
              header: 'R$',
              meta: { width: 116 },
              cell: ({ row }) =>
                ag ? (
                  <CelulaDaFilial
                    linha={row.original}
                    ag={ag}
                    cat={cat}
                    qual="valor"
                    referencia={referenciaExibida}
                  />
                ) : null,
            },
            {
              id: `${it.chave}-filial-${m.ref}-pct`,
              header: '%',
              meta: { width: 72 },
              cell: ({ row }) =>
                ag ? (
                  <CelulaDaFilial
                    linha={row.original}
                    ag={ag}
                    cat={cat}
                    qual="pct"
                    referencia={referenciaExibida}
                  />
                ) : null,
            },
          ],
        }
      }
      const proprias: ColumnDef<LinhaComparada, unknown>[] = doisPeriodos
        ? [
            {
              id: `${it.chave}-atual`,
              header: rotuloPeriodo,
              columns: [
                {
                  id: `${it.chave}-atual-rs`,
                  header: 'R$',
                  meta: { width: 112 },
                  cell: ({ row }) => <CelulaNoPeriodo linha={row.original} i={i} qual="atual" />,
                },
                {
                  id: `${it.chave}-atual-pct`,
                  header: '%',
                  meta: { width: 80 },
                  cell: ({ row }) => <CelulaPctNoPeriodo linha={row.original} i={i} qual="atual" />,
                },
              ],
            },
            {
              id: `${it.chave}-anterior`,
              header: rotuloAnterior,
              columns: [
                {
                  id: `${it.chave}-anterior-rs`,
                  header: 'R$',
                  meta: { width: 112 },
                  cell: ({ row }) => <CelulaNoPeriodo linha={row.original} i={i} qual="anterior" />,
                },
                {
                  id: `${it.chave}-anterior-pct`,
                  header: '%',
                  meta: { width: 80 },
                  cell: ({ row }) => (
                    <CelulaPctNoPeriodo linha={row.original} i={i} qual="anterior" />
                  ),
                },
              ],
            },
            {
              id: `${it.chave}-entre`,
              // A dica separa as duas contas que agora dividem o bloco: o Δ é a
              // mudança de um período para o outro, e não o percentual sobre o
              // faturamento que passou a aparecer ao lado.
              header: () => (
                <Tooltip content="A mudança de um período para o outro — não é o percentual sobre o faturamento, que fica na coluna % de cada período">
                  <span className="cursor-help">Δ</span>
                </Tooltip>
              ),
              meta: { width: 88 },
              cell: ({ row }) => <CelulaEntrePeriodos linha={row.original} i={i} />,
            },
          ]
        : unica
          ? [
              {
                id: `${it.chave}-valor`,
                // O cabeçalho fica com o NOME da loja, logo abaixo: com uma
                // coluna só, repetir "%" oitenta e nove vezes não diz nada.
                header: '',
                meta: { width: LARGURA_UNICA },
                cell: ({ row }) => (
                  <CelulaUnica
                    linha={row.original}
                    i={i}
                    referencia={referenciaExibida}
                    mostra={umNumero}
                  />
                ),
              },
            ]
          : [
              {
                id: `${it.chave}-valor`,
                header: 'R$',
                meta: { width: 116 },
                cell: ({ row }) => <CelulaValor linha={row.original} i={i} />,
              },
              {
                id: `${it.chave}-pct`,
                header: '%',
                meta: { width: 72 },
                cell: ({ row }) => <CelulaPct linha={row.original} i={i} />,
              },
              {
                id: `${it.chave}-dif`,
                // "Δ média do grupo" não cabe nos 88 px: o grupo vai curto.
                header:
                  referenciaExibida === 'grupo'
                    ? 'Δ grupo'
                    : `Δ ${rotuloDaReferencia(referenciaExibida, porMeses)}`,
                meta: { width: 88 },
                cell: ({ row }) => (
                  <CelulaDiferenca linha={row.original} i={i} referencia={referenciaExibida} />
                ),
              },
            ]
      const cabecalho = () =>
        filiais.length > 1 ? (
          // A dica diz o que o clique FAZ e quantas operações existem ali: a
          // seta sozinha não conta que há matriz e filial dentro do grupo.
          <Tooltip
            content={
              aberto
                ? `Fecha as operações de ${it.nome} e deixa só o total do grupo`
                : `Mostra as ${filiais.length} operações de ${it.nome} ao lado do total do grupo`
            }
          >
            <button
              type="button"
              onClick={(e) => {
                // O cabeçalho do DataReport também responde ao clique: sem
                // isto, abrir o grupo mexeria na ordenação junto.
                e.stopPropagation()
                abrirFiliais(it.chave)
              }}
              aria-expanded={aberto}
              aria-label={`${aberto ? 'Fechar' : 'Abrir'} as operações de ${it.nome}`}
              // O teto vai no BOTÃO, e não no nome: a seta e o vão entre os dois
              // também ocupam largura, e com o teto só no texto a coluna saía
              // 17 px mais larga que o declarado (medido em 22/09/2026).
              style={tetoDoNome}
              className="flex w-full min-w-0 items-center gap-1 text-left transition-colors duration-fast ease-default hover:text-primary"
            >
              <ChevronRight
                className={cn(
                  'h-3 w-3 shrink-0 transition-transform duration-fast ease-default',
                  aberto && 'rotate-90'
                )}
                aria-hidden
              />
              <span className="min-w-0 truncate">{it.nome}</span>
            </button>
          </Tooltip>
        ) : colunasExibidas !== 'operacao' ? (
          // Coluna de GRUPO leva a contagem e a lista mesmo com uma loja só:
          // "Sem região", sozinho, não diz qual loja está ali.
          <Tooltip
            content={<span className="block max-w-[16rem] text-left">{it.nomes.join(', ')}</span>}
          >
            <span className="block cursor-help truncate" style={tetoDoNome}>
              {it.nome} · {it.refs.length}
            </span>
          </Tooltip>
        ) : (
          // O nome inteiro na dica: com uma coluna por loja ele quase sempre
          // sai cortado, e o cabeçalho é o único lugar que diz de quem é a
          // coluna.
          <Tooltip content={it.nome}>
            <span className="block cursor-help truncate" style={tetoDoNome}>
              {it.nome}
            </span>
          </Tooltip>
        )
      // Uma coluna só, e o grupo fechado: a loja vira coluna-FOLHA, com o nome
      // dela no lugar do cabeçalho de grupo — um nível a menos de cabeçalho.
      if (proprias.length === 1 && !aberto) {
        return { ...proprias[0]!, id: `item-${it.chave}`, header: cabecalho }
      }
      return {
        id: `item-${it.chave}`,
        header: cabecalho,
        columns: aberto
          ? [
              unica
                ? { ...proprias[0]!, id: `${it.chave}-total`, header: 'Total' }
                : { id: `${it.chave}-total`, header: 'Total do grupo', columns: proprias },
              ...filiais.map(daFilial),
            ]
          : proprias,
      }
    })
    // ── SÓ AS COLUNAS DA VISTA VÃO PARA A GRADE ───────────────────────────
    //
    // O que ficou de fora vira UMA coluna vazia de cada lado, com a largura
    // exata do que não foi desenhado: a barra de rolagem continua do mesmo
    // tamanho, cada coluna fica na mesma posição, e quem rola não percebe a
    // troca. A lista de `larguras` é a mesma, na mesma ordem.
    //
    // O bloco 0 (referências e grupo, ou o consolidado no modo Período) entra na
    // janela como mais um bloco; o que o alfinete fixou fica FORA dela, sempre
    // desenhado. Fixar um só dos dois deixa o outro rolando com as lojas.
    const fixos = doisPeriodos
      ? fixado
        ? [consolidado]
        : []
      : [...(fixado ? [referencias] : []), ...(doGrupo && grupoPreso ? [doGrupo] : [])]
    const soltos = doisPeriodos
      ? fixado
        ? []
        : [consolidado]
      : [...(fixado ? [] : [referencias]), ...(doGrupo && !grupoPreso ? [doGrupo] : [])]
    const blocos = [...(soltos.length ? [soltos] : []), ...porItem.map((c) => [c])]
    const { de, ate } = recortar(janelaExibida, blocos.length)
    const antes = somaDeLarguras(larguras, 0, de)
    const depois = somaDeLarguras(larguras, ate, blocos.length)
    return [
      conta,
      ...fixos,
      ...(antes > 0 ? [espacador('antes', antes)] : []),
      ...blocos.slice(de, ate).flat(),
      ...(depois > 0 ? [espacador('depois', depois)] : []),
    ]
  }, [
    cat,
    itens,
    colunasExibidas,
    onAlternarConta,
    membrosPorGrupo,
    detalheDasFiliais,
    gruposExibidos,
    referenciaExibida,
    mostraExibida,
    lojasNaReferencia,
    porMeses,
    regua.pontos.length,
    doisPeriodos,
    rotuloPeriodo,
    rotuloAnterior,
    larguras,
    janelaExibida,
    fixado,
    grupoPreso,
    grupo,
    comGrupo,
    cabemOsDois,
  ])

  // As folhas fixadas: a Conta sempre; com cada alfinete, o bloco dele — as
  // referências antes do grupo, a ordem em que os dois aparecem soltos.
  const fixacao = useMemo(() => {
    const folhas = [
      ...(fixado ? (doisPeriodos ? FOLHAS_DO_CONSOLIDADO : FOLHAS_DAS_REFERENCIAS) : []),
      ...(grupoPreso ? FOLHAS_DO_GRUPO : []),
    ]
    return folhas.length ? { left: ['conta', ...folhas] } : FIXA_A_CONTA
  }, [fixado, grupoPreso, doisPeriodos])

  // ── A LINHA DO FATURAMENTO FICA TRAVADA NO TOPO ───────────────────────────
  //
  // Mesma razão da aba Plano de contas: o "%" de cada coluna é sobre o
  // faturamento dela, e rolando a grade o denominador some. Ver `linha-fixa.ts`.
  const faturamento = useMemo(
    () =>
      linhas.find((l) => l.linha.tipo === 'conta' && l.linha.conta.indice === INDICE_FATURAMENTO) ??
      null,
    [linhas]
  )
  const linhaFixa = useCallback(
    () =>
      faturamento
        ? {
            ...celulasDaLinha(colunas, faturamento),
            // Rótulo no lugar da célula: a de verdade abre e fecha a árvore.
            conta: <span className="truncate font-semibold text-foreground">1 FATURAMENTO</span>,
          }
        : {},
    [colunas, faturamento]
  )

  const renderCard = useCallback(
    function renderCard(l: LinhaComparada) {
      if (l.linha.tipo === 'secao') {
        return (
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {l.linha.titulo}
          </p>
        )
      }
      const conta = l.linha.tipo === 'conta' ? l.linha.conta : null
      const aberta = !!conta && abertasExibidas.has(conta.formatado)
      const ref = valorDaReferencia(l, referenciaExibida)
      return (
        <div className="flex flex-col gap-2">
          <div className="flex min-w-0 items-center justify-between gap-2">
            <span className="flex min-w-0 items-baseline gap-2">
              <span className="shrink-0 font-mono text-xs text-muted-foreground">
                {conta ? conta.formatado : 'calc.'}
              </span>
              <span className={cn('min-w-0 truncate', conta?.nivel === 1 && 'font-semibold')}>
                {conta ? conta.descricao : l.linha.tipo === 'calculado' ? l.linha.ind.nome : ''}
              </span>
            </span>
            {conta?.temFilhos && (
              <button
                type="button"
                // `onAlternarConta`, e nao um `Set` novo a partir de `abertas`:
                // aquele muda de identidade ja no render URGENTE da abertura e
                // levaria o cartao junto — a grade memorizada redesenharia duas
                // vezes por clique em vez de uma.
                onClick={() => onAlternarConta(conta.formatado)}
                aria-expanded={aberta}
                className="h-11 shrink-0 rounded-md px-3 text-xs font-medium text-primary transition-colors duration-fast ease-default hover:bg-muted"
              >
                {aberta ? 'Fechar' : 'Abrir'}
              </button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Referência ({rotuloDaReferencia(referenciaExibida, l.eixo === 'meses')}
            {referenciaExibida === 'grupo' ? '' : l.eixo === 'meses' ? ' desta loja' : ' das lojas'}
            ):{' '}
            <span className="tabular-nums text-foreground">
              {ref == null ? TRACO : l.unidade === 'pct' ? fmtPct(ref) : fmtConta(l.unidade, ref)}
            </span>
          </p>
          <dl className="flex flex-col gap-1 text-sm">
            {itens.map((it, i) => (
              <div key={it.chave} className="flex min-w-0 items-center justify-between gap-3">
                <dt className="min-w-0 truncate text-xs text-muted-foreground">{it.nome}</dt>
                <dd className="flex shrink-0 items-center gap-2">
                  <CelulaPct linha={l} i={i} />
                  <CelulaDiferenca linha={l} i={i} referencia={referenciaExibida} />
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )
    },
    [abertasExibidas, onAlternarConta, referenciaExibida, itens]
  )

  const acaoTelaCheia = useMemo(
    () => (
      <Tooltip content={cheia ? 'Sair da tela cheia' : 'Ver a aba em tela cheia'}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCheia(!cheia)}
          aria-label={cheia ? 'Sair da tela cheia' : 'Ver a aba em tela cheia'}
        >
          {cheia ? (
            <Minimize2 className="h-4 w-4" aria-hidden />
          ) : (
            <Maximize2 className="h-4 w-4" aria-hidden />
          )}
        </Button>
      </Tooltip>
    ),
    [cheia]
  )

  const vazio = useMemo(
    () =>
      recorte.naConta.size === 0 ? (
        <EmptyState
          icon={ArrowLeftRight}
          title="Nenhuma operação na conta"
          description="Marque ao menos uma operação no seletor Operações do topo e confira os filtros."
        />
      ) : (
        <EmptyState
          icon={ArrowLeftRight}
          title="Nada para comparar neste período"
          description="Nenhuma das operações marcadas tem plano gravado no período. Troque o período no topo."
        />
      ),
    [recorte.naConta.size]
  )

  // ── O ARQUIVO SAI COMPLETO ────────────────────────────────────────────────
  //
  // A janela de colunas é só do desenho: a exportação percorre `itens`, que tem
  // todas as lojas, e não as colunas montadas. Quem exporta com a grade rolada
  // no meio da rede leva a rede inteira.
  //
  // Grupo ABERTO leva as filiais junto: o arquivo tem de sair como a tela está,
  // senão quem abriu para ver as partes exporta só o total.
  const filiaisNoArquivo = useCallback(
    (it: ItemDeComparacao) =>
      gruposExibidos.has(it.chave) ? (membrosPorGrupo?.get(it.chave) ?? []) : [],
    [gruposExibidos, membrosPorGrupo]
  )
  const colunasDaPlanilha = useMemo<ColunaPlanilha[]>(
    () => [
      { titulo: 'Código', formato: 'texto' },
      { titulo: 'Conta', formato: 'texto' },
      { titulo: 'Média das lojas · R$', formato: 'brl' },
      { titulo: 'Média das lojas · %', formato: 'pct' },
      { titulo: 'Melhor loja · %', formato: 'pct' },
      { titulo: 'Pior loja · %', formato: 'pct' },
      // Com a Média do grupo escolhida, a régua do grupo vai junto.
      ...(grupo
        ? ([
            { titulo: 'Média do grupo · R$', formato: 'brl' },
            { titulo: 'Média do grupo · %', formato: 'pct' },
            { titulo: 'Melhor loja do grupo · %', formato: 'pct' },
            { titulo: 'Pior loja do grupo · %', formato: 'pct' },
          ] as ColunaPlanilha[])
        : []),
      ...itens.flatMap((it): ColunaPlanilha[] => [
        { titulo: `${it.nome} · R$`, formato: 'brl' },
        { titulo: `${it.nome} · %`, formato: 'pct' },
        ...filiaisNoArquivo(it).flatMap((f): ColunaPlanilha[] => [
          { titulo: `${f.nome} · R$`, formato: 'brl' },
          { titulo: `${f.nome} · %`, formato: 'pct' },
        ]),
      ]),
    ],
    [itens, filiaisNoArquivo, grupo]
  )
  const planilhaDaTabela = useCallback(
    () =>
      planilhaDaGrade(colunasDaPlanilha, linhas, (l) => [
        l.linha.tipo === 'conta'
          ? l.linha.conta.formatado
          : l.linha.tipo === 'calculado'
            ? 'calc.'
            : '',
        l.linha.tipo === 'conta'
          ? l.linha.conta.descricao
          : l.linha.tipo === 'calculado'
            ? l.linha.ind.nome
            : l.linha.titulo,
        l.mediaValor,
        l.ref.media,
        l.ref.melhor,
        l.ref.pior,
        ...(grupo
          ? [l.grupoValor, l.grupo?.media ?? null, l.grupo?.melhor ?? null, l.grupo?.pior ?? null]
          : []),
        ...itens.flatMap((it, i): Celula[] => {
          const m = l.celulas[i]?.medida
          return [
            m?.valor ?? null,
            m?.pct ?? null,
            ...filiaisNoArquivo(it).flatMap((f): Celula[] => {
              const ag = detalheDasFiliais?.get(f.ref)
              const md = ag && l.linha.tipo !== 'secao' ? medir(l.linha, ag, cat) : null
              return [md?.valor ?? null, md?.pct ?? null]
            }),
          ]
        }),
      ]),
    [colunasDaPlanilha, linhas, itens, filiaisNoArquivo, detalheDasFiliais, cat, grupo]
  )

  const emPeriodo = compararAtivo === 'periodo'
  const botaoDoResumo = itens.length > 0 && (
    <Button
      variant="ghost"
      size="sm"
      className="col-span-2 w-fit shrink-0 gap-1.5 px-2 text-xs @3xl:mr-auto"
      onClick={() => setResumoEscolhido(!resumoAberto)}
      aria-expanded={resumoAberto}
    >
      <ChevronDown
        className={cn(
          'h-3.5 w-3.5 transition-transform duration-fast ease-default',
          !resumoAberto && '-rotate-90'
        )}
        aria-hidden
      />
      {itens.length === 1 ? 'Resumo da coluna' : `Resumo das ${itens.length} colunas`}
    </Button>
  )
  // ── UMA FILEIRA SÓ, QUE QUEBRA PEÇA POR PEÇA ─────────────────────────────
  //
  // O botão do resumo e os controles eram dois blocos: quando os dois não cabiam
  // lado a lado, o bloco dos controles descia INTEIRO e o botão ficava sozinho
  // numa linha (João, 30/09/2026). Agora são peças da mesma fileira: o botão à
  // esquerda (`mr-auto`), os controles à direita (`justify-end`), e o que não
  // couber desce sozinho, alinhado à direita.
  const controles = (
    <div
      className="grid w-full grid-cols-2 gap-2 @3xl:flex @3xl:flex-wrap @3xl:items-center @3xl:justify-end"
      data-tour="comparativos-controles"
    >
      {botaoDoResumo}
      <Escolha<Comparar>
        value={compararAtivo}
        onChange={setComparar}
        ariaLabel="Comparar com"
        rotulo="Comparar com"
        rotuloVisivel
        // Os rótulos MUDAM com o eixo. Manter "Média" com a régua dos meses seria
        // o mesmo texto medindo outra coisa conforme a seleção — a armadilha
        // descrita em `reguaDaComparacao`.
        options={[
          {
            value: 'media',
            label: porMeses ? 'Média dos meses' : 'Média',
            tooltip: porMeses
              ? 'A média simples dos meses desta loja no período'
              : 'O índice da seleção: a linha somada dividida pelo faturamento somado das lojas',
          },
          // Só quando há loja do grupo fora da seleção (ver `grupoDisponivel`).
          ...(grupoDisponivel
            ? [
                {
                  value: 'grupo' as const,
                  label: 'Média do grupo',
                  tooltip:
                    'O índice de todas as lojas da rede, marcadas ou não: a linha somada dividida pelo faturamento somado. Abre o bloco Grupo, com a média, a melhor e a pior loja da rede. Sem as unidades de teste, e com os mesmos filtros de status',
                },
              ]
            : []),
          {
            value: 'melhor',
            label: porMeses ? 'Melhor mês' : 'Melhor',
            tooltip: porMeses
              ? 'O melhor mês desta loja em cada conta'
              : 'A melhor loja da seleção em cada conta',
          },
          {
            value: 'pior',
            label: porMeses ? 'Pior mês' : 'Pior',
            tooltip: porMeses
              ? 'O pior mês desta loja em cada conta'
              : 'A pior loja da seleção em cada conta',
          },
          {
            value: 'periodo',
            label: 'Período',
            tooltip: `Cada operação em ${rotuloPeriodo} e em ${rotuloAnterior}, lado a lado`,
          },
        ]}
      />
      {!emPeriodo && (
        <Escolha<Mostrar>
          value={mostra}
          onChange={setMostra}
          ariaLabel="O que cada coluna de loja mostra"
          rotulo="Mostrar"
          forma="select"
          options={[
            { value: 'pct', label: '%', tooltip: 'O % da conta sobre o faturamento da loja' },
            { value: 'reais', label: 'R$', tooltip: 'O valor da conta em reais' },
            {
              value: 'diferenca',
              label: 'Δ p.p.',
              tooltip: 'A distância para a referência, em pontos',
            },
            {
              value: 'ganho',
              label: 'Ganho R$',
              tooltip: 'O ganho em reais se a conta fosse igual à referência',
            },
            { value: 'tudo', label: 'Tudo', tooltip: 'R$, % e a distância, em três colunas' },
          ]}
        />
      )}
      {/* ── CONTRA QUAL PERÍODO ───────────────────────────────────────────
          Só no modo Período, e ao lado dele: é a segunda metade da mesma
          pergunta. Escolhe-se o primeiro mês; o último acompanha o tamanho do
          período do topo, e o texto ao lado diz qual ficou. */}
      {emPeriodo && (
        <div className="col-span-2 flex flex-wrap items-center gap-2 @3xl:col-span-1">
          <span className="whitespace-nowrap text-xs text-muted-foreground">contra</span>
          <DatePicker
            mode="month"
            size="sm"
            value={inicioComparado}
            onChange={onInicioComparadoChange}
            aria-label={mesesNoPeriodo > 1 ? 'Primeiro mês do período comparado' : 'Mês comparado'}
          />
          {mesesNoPeriodo > 1 && (
            <span className="whitespace-nowrap text-xs text-muted-foreground">
              a {rotuloDoMes(mesDoTexto(periodoComparado.ate))} · {mesesNoPeriodo} meses
            </span>
          )}
        </div>
      )}
      <Escolha<ColunasPor>
        value={colunasPor}
        onChange={setColunasPor}
        ariaLabel="Colunas por"
        rotulo="Colunas"
        forma="select"
        options={[
          { value: 'operacao', label: 'Operação' },
          { value: 'regiao', label: 'Região' },
          { value: 'estado', label: 'Estado' },
        ]}
      />
    </div>
  )
  // O "Abrir até" mora no cabeçalho da grade, antes do filtro — o mesmo lugar
  // das abas Plano de contas e Análises adicionais. Na barra de cima ele era a
  // peça que descia sozinha para uma segunda linha (João, 30/09/2026). Memorizado
  // porque a grade é `memo`: um elemento novo a cada render a redesenharia.
  const abrirAte = useMemo(
    () => <AbrirAte cat={cat} abertas={abertas} onAbertasChange={onAbertasChange} />,
    [cat, abertas, onAbertasChange]
  )

  // O botão da tela cheia entra nas AÇÕES do cartão — o lugar onde o do próprio
  // `DataReport` ficava, para quem já procura por ele ali.
  const tituloExtra: ReactNode = useMemo(
    () => (
      <span className="inline-flex min-w-0 items-center gap-2">
        {LEGENDA}
        <ForaDaComparacao
          itens={fora}
          substantivo={['operação', 'operações']}
          explicacao={
            doisPeriodos
              ? `A comparação entre períodos conta só as operações com plano em ${rotuloPeriodo} e em ${rotuloAnterior}. As demais ficam de fora das duas colunas.`
              : `A comparação conta só as operações com plano em ${rotuloPeriodo}. As demais continuam marcadas no seletor, sem coluna aqui.`
          }
        />
        {regua.eixo === 'nenhum' && recorte.naConta.size > 0 && (
          <span className="text-xs text-warning">
            Marque duas lojas ou mais — ou escolha um período de vários meses — para haver média,
            melhor e pior.
          </span>
        )}
      </span>
    ),
    [fora, doisPeriodos, rotuloPeriodo, rotuloAnterior, regua.eixo, recorte.naConta.size]
  )

  return (
    // ── A TELA CHEIA É DA ABA INTEIRA ─────────────────────────────────────
    //
    // A do `DataReport` cobre só o cartão, e com a barra de controles FORA dele
    // ela esconderia justamente o que ajusta a grade. Esta é a mesma `TelaCheia`
    // da SDK que os gráficos usam: inativa é `display: contents` e não muda o
    // layout; ativa, leva barra, resumo e grade juntos.
    <TelaCheia ativa={cheia} onSair={() => setCheia(false)} className="gap-2 p-2 md:p-4">
      <div
        ref={refDaAba}
        className={cn('flex flex-col gap-2 overflow-y-auto', cheia ? 'min-h-0 flex-1' : 'h-full')}
      >
        {/* ── A BARRA DA ABA FICA ACIMA DO CARTÃO ────────────────────────────
          Dentro do cabeçalho do `DataReport`, os controles disputavam a largura
          com o título e com as ações (filtrar, tela cheia, Exportar): enchiam
          três linhas e sobravam TRÊS linhas de grade (22/09/2026, 1265 px).
          Aqui eles dividem a linha que o "Resumo das N colunas" já ocupava, que
          estava vazia à direita — o cabeçalho do cartão volta a ser título,
          subtítulo e ações, e a grade ganha ~90 px de altura. */}
        <div ref={refDoTopo} className="flex shrink-0 flex-col gap-1.5">
          {/* ☠️ O `@container` fica NESTA linha, e não na raiz da aba: ele implica
            `contain: layout`, que vira bloco de contenção para `position: fixed`
            — e a tela cheia do `DataReport` (um `fixed inset-0` sem portal)
            abriria fora da vista, o mesmo defeito de 21/09/2026. Aqui dentro não
            há nada fixo: as dicas e os menus dos seletores saem por portal. */}
          <div className="@container">{controles}</div>
          {itens.length > 0 && resumoAberto && (
            <ResumoDasColunas
              cat={cat}
              itens={itens}
              referencia={referencia}
              referencias={refsDoResumo}
              porMeses={porMeses}
            />
          )}
        </div>
        {/* `relative` sem `contain-layout` — a mesma razão da aba Plano de contas:
          a contenção prenderia a tela cheia da SDK dentro da aba. A altura mínima
          é a da aba inteira quando a sobra não dá uma grade legível (ver
          `GRADE_MINIMA`). */}
        <div
          className="flex min-h-0 flex-1 flex-col"
          style={gradeNaAbaInteira ? { minHeight: alturaDaAba } : undefined}
        >
          <DicaDaGrade className="relative min-h-0 flex-1" alvo={alvoDaGrade}>
            <Grade
              title="Comparativo"
              titleExtra={tituloExtra}
              subtitle={
                doisPeriodos
                  ? `${plural(itens.length, 'coluna', 'colunas')} · ${rotuloPeriodo} contra ${rotuloAnterior}`
                  : `${plural(itens.length, 'coluna', 'colunas')} · ${ROTULO_DO_QUE_MOSTRA[mostraExibida]} · ${textoDaRegua}`
              }
              data={esperando || itens.length === 0 ? [] : linhas}
              columns={colunas}
              loading={esperando}
              fillHeight
              enableSorting={false}
              filters={abrirAte}
              // A tela cheia do cartão daria a MESMA tecla (Esc) e cobriria a barra
              // da aba: quem expande aqui usa o botão da barra, acima.
              fullscreenToggle={false}
              actions={
                <>
                  <BotaoExportar
                    planilha={planilhaDaTabela}
                    titulo="Comparativo"
                    tituloDoArquivo="Comparativo"
                  />
                  {acaoTelaCheia}
                </>
              }
              pageSize={100}
              countNoun="linhas"
              // A CHAVE DA CONTA como id da linha: sem ela o `DataReport` usa o
              // índice, e abrir uma conta no meio da árvore desloca todas as de
              // baixo — o React reescreve linha por linha em vez de só inserir as
              // novas.
              getRowId={idDaLinha}
              columnPinning={fixacao}
              summaryRow={linhaFixa}
              rowClassName={classeDaLinha}
              renderCard={renderCard}
              emptyState={vazio}
            />
          </DicaDaGrade>
        </div>
      </div>
    </TelaCheia>
  )
}
