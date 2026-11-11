import { useCallback, useDeferredValue, useMemo, useState, type ReactNode } from 'react'
import {
  Button,
  DataReport,
  EmptyState,
  Modal,
  MultiSelect,
  TelaCheia,
  Tooltip,
  type ColumnDef,
  type MultiSelectOption,
} from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Info,
  ListOrdered,
  Maximize2,
  Minimize2,
  SlidersHorizontal,
} from 'lucide-react'
import type { Catalogo } from '../catalogo'
import { classeDaDiferenca, type Referencias } from '../comparacao'
import {
  itensDaComparacao,
  linhasDaComparacao,
  reguaDaComparacao,
  type ColunasPor,
  type ItemDeComparacao,
  type LinhaComparada,
  type OperacaoParaComparar,
} from '../comparativos'
import type { MesCarregado } from '../matriz'
import { recortar, somaDeLarguras } from '../janela-de-colunas'
import { planilhaDaGrade, type Celula, type ColunaPlanilha } from '../planilha'
import { BotaoExportar } from './BotaoExportar'
import { fmtConta, fmtDiferenca, fmtPct, fmtValor, plural, TRACO } from '../formato'
import {
  chavesDosIndices,
  indicesEscolhiveis,
  linhasPorIndice,
  ordenarPorValor,
  referenciasDasLinhas,
  type IndiceEscolhivel,
  type LinhaDaUnidade,
  type SentidoDaOrdem,
} from '../por-indice'
import { planilhaDeRanking, type Formato } from '../planilha'
import type { RecorteCalculado } from '../recorte'
import { useJanelaDeColunas } from '../hooks/use-janela-de-colunas'
import { useTelaLarga } from '../hooks/use-largura-da-tela'
import type { ModoDeComparacao } from '../periodo'
import { BarrasRanking, type ItemRanking } from './graficos/BarrasRanking'
import { MolduraGrafico } from './graficos/MolduraGrafico'
import { DicaDaGrade } from './DicaDaGrade'
import { Escolha } from './Escolha'

// A aba "Por índice" — o ranking da rede em QUALQUER conta do plano.
//
// ── DE ONDE ELA VEIO ────────────────────────────────────────────────────────
//
// Pedido do Felipe, trazido pelo João em 21/09/2026: "clicar num índice e ver o
// maior e o menor". Na Comparativos isso não cabe — lá as linhas são o plano
// inteiro (uma árvore) e as colunas são as 89 lojas; ordenar quebraria a árvore
// e a ordem seria das COLUNAS, que é o eixo errado. Aqui a matriz é virada: as
// lojas nas linhas, uns poucos índices escolhidos nas colunas, e ordenar é
// clicar no cabeçalho (decisão do João, 22/09/2026).
//
// ── A RÉGUA É A DA TABELA ───────────────────────────────────────────────────
//
// Média, melhor e pior saem das LINHAS EXIBIDAS, e não das lojas da seleção
// como na Comparativos: esta aba é um ranking do que está na tela. Com "Linhas
// por: Região", a melhor loja não seria nenhuma das cinco linhas — o destaque
// nunca apareceria e a régua do gráfico marcaria um ponto fora da lista.

/** Matéria-prima, labor, custos operacionais e lucro líquido. */
const PADRAO_DE_INDICES = [2000, 10200, 4000, 7000]

/** As colunas fixadas à esquerda — a posição e o nome. */
const LARGURA_DA_POSICAO = 44
const LARGURA_DA_UNIDADE = 204

// ── SEM A LETRA ABC E SEM O ATALHO DO BI ────────────────────────────────────
//
// As duas vieram do BI mensal em 28/09/2026 e saíram no dia seguinte, antes de
// qualquer entrega (decisão do João). A letra ABC ao lado de um ranking de labor
// se lia como a classe NO LABOR, e mudava conforme o filtro; ela mora no gráfico
// Curva ABC da aba Análises adicionais, onde a curva e os cortes a explicam. O
// botão "Indicadores do BI" marcava os sete indicadores do cartão — que é o
// Resultado da loja da mesma aba — e "BI" não diz nada a quem usa o portal.
const FIXAS = { left: ['posicao', 'unidade'] }

/** Quanto cada coluna de índice ocupa; em reais o número é mais comprido. */
const larguraDoIndice = (mostrar: Mostrar) => (mostrar === 'reais' ? 132 : 116)

/** A coluna vazia que guarda o lugar das colunas fora da janela. */
function espacador(qual: 'antes' | 'depois', largura: number): ColumnDef<LinhaDaUnidade, unknown> {
  return { id: `espaco-${qual}`, header: '', meta: { width: largura }, cell: () => null }
}

// ── "Δ <COMPARAÇÃO>": A LOJA CONTRA ELA MESMA ────────────────────────────────
//
// "Δ média" mede cada linha contra as OUTRAS; "Δ ano passado" (ou "Δ anterior"
// — segue o "Comparar com" do topo) mede cada linha contra ELA MESMA do outro
// lado: o percentual no período menos o percentual no período comparado. O
// orçado não entra aqui: ele mora na aba Análises adicionais.
//
// Só entram as linhas com plano nas DUAS pontas (a regra de toda variação do
// painel), e a régua é a variação da SELEÇÃO: a linha somada de todas elas no
// período contra a mesma soma do outro lado.
type Mostrar = 'pct' | 'reais' | 'delta' | 'variacao'

/**
 * A ordem da tabela. Guarda a CHAVE do índice, e não a posição da coluna:
 * desmarcar um índice muda as posições, e a tabela continuaria ordenada "pela
 * segunda coluna" — que agora é outra conta.
 */
type Ordem = { chave: string; sentido: SentidoDaOrdem } | 'alfabetica'

interface Props {
  cat: Catalogo
  recorte: RecorteCalculado
  operacoes: readonly OperacaoParaComparar[]
  /** A escolha vive na tela, e não aqui: trocar de aba não pode perdê-la. */
  indices: string[] | null
  onIndicesChange: (chaves: string[]) => void
  carregando: boolean
  rotuloPeriodo: string
  /**
   * Os meses do período. Servem à RÉGUA: com UMA linha exibida, média, melhor e
   * pior passam a sair dos meses da seleção (ver `reguaDaComparacao`).
   */
  meses: readonly MesCarregado[]
  /** "vs. ano passado", "vs. mês anterior"… — o que o "Δ" da comparação mede. */
  rotuloVariacao: string
  /** O "Comparar com" do topo: dá o nome da opção. */
  comparacao: ModoDeComparacao
}

/** O nome curto da opção de variação, pelo "Comparar com" do topo. */
const ROTULO_DA_VARIACAO: Record<ModoDeComparacao, string> = {
  ano: 'Δ ano passado',
  anterior: 'Δ anterior',
}

const ROTULO_DAS_LINHAS: Record<ColunasPor, [string, string]> = {
  operacao: ['Operação', 'operações'],
  regiao: ['Região', 'regiões'],
  estado: ['Estado', 'estados'],
}

/** O número que a coluna mostra — e que a ordenação e o gráfico usam. */
function valorDaCelula(
  linha: LinhaDaUnidade,
  coluna: number,
  mostrar: Mostrar,
  ref: Referencias | undefined
): number | null {
  const c = linha.celulas[coluna]
  const m = c?.medida
  if (!m) return null
  if (mostrar === 'reais') return m.valor
  if (mostrar === 'pct') return m.pct
  if (mostrar === 'variacao') {
    const antes = c.medidaAnterior?.pct
    return m.pct == null || antes == null ? null : m.pct - antes
  }
  return m.pct == null || ref?.media == null ? null : m.pct - ref.media
}

export function AbaPorIndice({
  cat,
  recorte,
  operacoes,
  indices,
  onIndicesChange,
  carregando,
  rotuloPeriodo,
  meses,
  rotuloVariacao,
  comparacao,
}: Props) {
  const [cheia, setCheia] = useState(false)
  const [mostrar, setMostrar] = useState<Mostrar>('pct')
  const [linhasPor, setLinhasPor] = useState<ColunasPor>('operacao')
  const [comGrafico, setComGrafico] = useState(true)
  // ── QUANDO NÃO CABE LADO A LADO, ALTERNA — NÃO EMPILHA ────────────────────
  //
  // Empilhados, os dois ficavam com altura FIXA (22rem a tabela, 16rem o
  // gráfico) e a aba inteira rolava: sobravam três linhas de tabela e TRÊS
  // barras de 89, com duas rolagens uma dentro da outra (relato do João,
  // 22/09/2026). Abaixo de 1280 px a aba passa a mostrar UM dos dois, com a
  // altura inteira — o mesmo arranjo do Dashboard de RH.
  //
  // O estado é separado do `comGrafico` de propósito: quem escolheu "Só a
  // tabela" na tela larga não deve reabrir no gráfico ao estreitar a janela, e
  // vice-versa.
  const [vistaEstreita, setVistaEstreita] = useState<'tabela' | 'grafico'>('tabela')
  // Os controles da aba somavam TRÊS linhas no celular — 116 px, com o conteúdo
  // só começando em 450 px de 812 (medido em 22/09/2026, 375×812). Recolhidos
  // num botão, a barra volta a UMA linha; o botão diz quantos índices estão
  // escolhidos, para a escolha não ficar escondida.
  const [ajustesAbertos, setAjustesAbertos] = useState(false)
  const telaLarga = useTelaLarga()
  // `null` = ninguém clicou ainda; a aba abre ordenada pelo primeiro índice.
  const [ordemEscolhida, setOrdemEscolhida] = useState<Ordem | null>(null)
  // Quantas barras cabem NÃO se conta aqui: o cartão do gráfico tem duas
  // alturas muito diferentes — ao lado da tabela na tela larga, embaixo dela na
  // estreita —, e este elemento é o de FORA do cartão, com o cabeçalho e o
  // recuo dentro da medida. Descontar um chute deles era o que punha a faixa de
  // páginas 17 px abaixo da borda (relato do Davi, 23/09/2026). Quem conta
  // agora é o próprio gráfico, pelo CORPO do cartão — `preencherAltura`.

  const escolhiveis = useMemo(() => indicesEscolhiveis(cat), [cat])
  // A escolha só existe depois do primeiro clique; até lá, o padrão da aba.
  const escolhidos = useMemo(() => {
    const ordemNoPlano = new Map(escolhiveis.map((e, i) => [e.chave, i]))
    const pedidas = indices ?? chavesDosIndices(cat, PADRAO_DE_INDICES)
    // Sempre na ordem do PLANO: coluna que muda de lugar conforme a ordem em que
    // foi marcada não se acha duas vezes seguidas.
    return pedidas
      .filter((c) => ordemNoPlano.has(c))
      .sort((a, b) => ordemNoPlano.get(a)! - ordemNoPlano.get(b)!)
  }, [indices, cat, escolhiveis])

  // ── SEM TETO DE ESCOLHA ───────────────────────────────────────────────────
  //
  // Até 23/09/2026 a escolha parava em OITO índices, porque a tabela desenha
  // toda célula no DOM e cada coluna a mais custa uma linha inteira de células.
  // O Davi bateu no teto no mesmo dia ("não queria limitar a 8 não"), e o teto
  // não era da pergunta, era da grade: o que a aba compara é escolha de quem
  // analisa. As colunas passaram a ser JANELADAS (ver abaixo), então o DOM
  // depende do que cabe na tela e não de quantos índices foram marcados.
  const opcoes = useMemo<MultiSelectOption[]>(
    () =>
      escolhiveis.map((e) => ({
        value: e.chave,
        label: e.rotulo,
        description: e.codigo,
        group: e.grupo === 'plano' ? 'Plano de contas' : 'Indicadores',
      })),
    [escolhiveis]
  )

  const escolhidosDoIndice = useMemo(
    () => escolhidos.map((c) => escolhiveis.find((e) => e.chave === c)!),
    [escolhidos, escolhiveis]
  )

  // ── A JANELA DE COLUNAS ───────────────────────────────────────────────────
  //
  // A mesma da aba Comparativos, pelo mesmo motivo: o `DataReport` não
  // virtualiza colunas, e sem janela o custo cresceria com a escolha — 89 lojas
  // × 190 índices seriam ~17 mil células no DOM. Com ela, o que é desenhado é o
  // que está na vista, mais uma folga; o resto vira UMA coluna vazia de cada
  // ponta, com a largura exata do que ficou de fora.
  const larguras = useMemo(
    () => escolhidosDoIndice.map(() => larguraDoIndice(mostrar)),
    [escolhidosDoIndice, mostrar]
  )
  const { alvo: alvoDaGrade, janela } = useJanelaDeColunas(
    larguras,
    LARGURA_DA_POSICAO + LARGURA_DA_UNIDADE
  )
  // Adiada: rolar não espera o desenho das colunas novas, e o vazio das pontas
  // segura a rolagem no lugar enquanto elas não chegam.
  const janelaExibida = useDeferredValue(janela)

  // Na variação, só as lojas com plano nas duas pontas — a regra de toda
  // variação do painel. Nos outros modos, todas as da seleção com plano.
  const porVariacao = mostrar === 'variacao'
  const itens = useMemo(
    () => itensDaComparacao(recorte, operacoes, linhasPor, cat, porVariacao),
    [recorte, operacoes, linhasPor, cat, porVariacao]
  )
  // ── A RÉGUA DESTA ABA SÃO AS LINHAS EXIBIDAS ──────────────────────────────
  //
  // E não as lojas da seleção: com "Linhas por: Região", três lojas de uma
  // região só dão UMA linha, e média, melhor e pior não teriam o que comparar
  // — a régua degenera igual a uma loja marcada. Quando isso acontece e o
  // período tem vários meses, a régua passa a ser os MESES da seleção; com um
  // mês só, não há régua e a tela mostra "—" (ver `reguaDaComparacao`).
  const regua = useMemo(
    () =>
      reguaDaComparacao(
        itens.map((it) => it.ag).filter((a): a is NonNullable<typeof a> => !!a),
        recorte,
        meses,
        cat
      ),
    [itens, recorte, meses, cat]
  )
  const porMeses = regua.eixo === 'meses'

  const comparadas = useMemo<LinhaComparada[]>(
    () =>
      linhasDaComparacao(
        escolhidosDoIndice.map((e) => e.linha),
        itens,
        recorte,
        cat,
        regua
      ),
    [escolhidosDoIndice, itens, recorte, cat, regua]
  )
  const semOrdem = useMemo(() => linhasPorIndice(itens, comparadas), [itens, comparadas])

  // ── DE ONDE SAEM MÉDIA, MELHOR E PIOR ─────────────────────────────────────
  //
  // Na régua das unidades, das próprias linhas da tabela. Na dos meses, de uma
  // SEGUNDA medida: os mesmos índices escolhidos, medidos em cada mês. São 12
  // colunas de conta, não 89 — custa o mesmo que uma linha da grade.
  const linhasDosMeses = useMemo(() => {
    if (!porMeses) return []
    const itensDosMeses: ItemDeComparacao[] = regua.pontos.map((ag, i) => ({
      chave: `mes-${i}`,
      nome: meses[i]?.rotulo ?? `Mês ${i + 1}`,
      refs: [],
      nomes: [],
      ag,
      agAnterior: null,
      faturamento: null,
    }))
    const dosMeses = linhasDaComparacao(
      escolhidosDoIndice.map((e) => e.linha),
      itensDosMeses,
      recorte,
      cat,
      regua
    )
    return linhasPorIndice(itensDosMeses, dosMeses)
  }, [porMeses, regua, meses, escolhidosDoIndice, recorte, cat])

  /** As linhas que formam a régua — vazio quando não há régua nenhuma. */
  const linhasDaRegua = useMemo(
    () => (porMeses ? linhasDosMeses : regua.eixo === 'nenhum' ? [] : semOrdem),
    [porMeses, linhasDosMeses, regua.eixo, semOrdem]
  )

  const refs = useMemo(
    () => referenciasDasLinhas(linhasDaRegua, comparadas, regua, cat),
    [linhasDaRegua, comparadas, regua, cat]
  )
  // A média em REAIS não sai de `referencias` (que é do percentual): em "R$" a
  // régua do gráfico precisa estar na mesma escala das barras, senão ela cai no
  // zero e marca um ponto que não quer dizer nada.
  const mediasEmReais = useMemo(
    () =>
      comparadas.map((_, j) => {
        const vs = linhasDaRegua
          .map((l) => l.celulas[j]?.medida?.valor)
          .filter((v): v is number => v != null)
        return vs.length ? vs.reduce((a, b) => a + b, 0) / vs.length : null
      }),
    [linhasDaRegua, comparadas]
  )
  const mediaDaColuna = (j: number): number | null => {
    if (mostrar === 'delta') return 0
    if (mostrar === 'reais') return mediasEmReais[j] ?? null
    if (mostrar === 'variacao') {
      // A variação da SELEÇÃO: as linhas somadas nas duas pontas.
      const l = comparadas[j]
      const agora = l?.consolidado?.pct
      const antes = l?.consolidadoAnterior?.pct
      return agora == null || antes == null ? null : agora - antes
    }
    return refs[j]?.media ?? null
  }

  // Em `useMemo`, e não uma expressão solta: o objeto nasceria novo a cada
  // render e a memorização das colunas e das linhas não guardaria nada.
  const ordem = useMemo<Ordem>(
    () =>
      ordemEscolhida ?? (escolhidos[0] ? { chave: escolhidos[0], sentido: 'desc' } : 'alfabetica'),
    [ordemEscolhida, escolhidos]
  )
  // −1 quando a ordem é alfabética, ou quando o índice que ordenava saiu da
  // escolha: a tabela volta à ordem de entrada em vez de ordenar por outra conta.
  const colunaOrdenada = ordem === 'alfabetica' ? -1 : escolhidos.indexOf(ordem.chave)

  const linhas = useMemo(() => {
    const base =
      colunaOrdenada < 0 || ordem === 'alfabetica'
        ? semOrdem
        : ordenarPorValor(
            semOrdem,
            (l) => valorDaCelula(l, colunaOrdenada, mostrar, refs[colunaOrdenada]),
            ordem.sentido
          )
    return base.map((l, i) => ({ ...l, posicao: i + 1 }))
  }, [semOrdem, ordem, colunaOrdenada, mostrar, refs])

  const [singular, plural_] = ROTULO_DAS_LINHAS[linhasPor]
  // Média de QUÊ — a linha de resumo, o subtítulo e a régua do gráfico dizem o
  // mesmo, porque são o mesmo número.
  const rotuloDaRegua =
    regua.eixo === 'nenhum' ? 'Sem referência' : porMeses ? 'Média dos meses' : 'Média das linhas'
  // Com UMA linha na tabela, média, melhor e pior não teriam o que comparar. O
  // subtítulo diz o que entrou no lugar, em vez de deixar a coluna Δ explicar
  // sozinha (ela mostraria zeros, que se leem como resultado).
  const textoDaRegua =
    regua.eixo === 'nenhum'
      ? ' · sem referência: uma linha e um mês só'
      : porMeses
        ? ` · referência: os ${regua.pontos.length} meses desta seleção`
        : ''
  // O gráfico segue a coluna que ordena; sem ordenação, o primeiro índice.
  const foco = colunaOrdenada < 0 ? 0 : colunaOrdenada
  const indiceDoFoco = escolhidosDoIndice[foco]
  const comparadaDoFoco = comparadas[foco]
  const refDoFoco = refs[foco]

  const alternarOrdem = useCallback(
    (chave: string) => {
      setOrdemEscolhida((atual) => {
        const vigente =
          atual ??
          (escolhidos[0] ? { chave: escolhidos[0], sentido: 'desc' as const } : 'alfabetica')
        if (vigente === 'alfabetica' || vigente.chave !== chave) return { chave, sentido: 'desc' }
        return vigente.sentido === 'desc' ? { chave, sentido: 'asc' } : 'alfabetica'
      })
    },
    [escolhidos]
  )

  const colunas = useMemo<ColumnDef<LinhaDaUnidade, unknown>[]>(() => {
    const posicao: ColumnDef<LinhaDaUnidade, unknown> = {
      id: 'posicao',
      header: '#',
      accessorFn: (l) => l.posicao,
      size: 44,
      // A posição no ranking não é valor. Era a única coluna com `accessorFn`
      // numérico, e acendia a calculadora da alpha.66 só para somar posições.
      meta: { width: 44, mobile: 'hidden', calculadora: false },
      cell: ({ row }) => (
        <span className="tabular-nums text-xs text-muted-foreground">{row.original.posicao}</span>
      ),
    }
    const unidade: ColumnDef<LinhaDaUnidade, unknown> = {
      id: 'unidade',
      header: singular,
      accessorFn: (l) => l.item.nome,
      size: 204,
      meta: { width: 204, mobile: 'primary' },
      cell: ({ row }) => {
        const it = row.original.item
        return (
          <span
            className="block min-w-0 truncate font-medium"
            data-dica={it.refs.length > 1 ? it.nomes.join(', ') : undefined}
          >
            {it.nome}
            {it.refs.length > 1 && (
              <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                · {it.refs.length}
              </span>
            )}
          </span>
        )
      },
    }
    const dosIndices = escolhidosDoIndice.map((e, j) => {
      const comparada = comparadas[j]
      const ref = refs[j]
      const ativa = colunaOrdenada === j
      const col: ColumnDef<LinhaDaUnidade, unknown> = {
        id: `indice-${e.chave}`,
        meta: { width: larguraDoIndice(mostrar) },
        header: () => (
          // ☠️ `max-w` no rótulo não é estética: `meta.width` é PISO, e a coluna
          // cresce até caber o cabeçalho inteiro — "LUCRO LÍQUIDO (sem
          // investimentos)" sozinho empurrava a quarta coluna para fora da vista.
          // Com teto, o nome corta e a dica mostra o nome inteiro.
          <Tooltip content={`${e.codigo} ${e.rotulo}`}>
            <button
              type="button"
              onClick={() => alternarOrdem(e.chave)}
              aria-label={`Ordenar por ${e.rotulo}`}
              className={cn(
                'group/ordem flex w-full items-center justify-end gap-1 text-right transition-colors duration-fast ease-default hover:text-foreground',
                ativa && 'text-foreground'
              )}
            >
              <span className="min-w-0 max-w-[6.5rem] truncate">{e.rotulo}</span>
              {ativa ? (
                ordem !== 'alfabetica' && ordem.sentido === 'desc' ? (
                  <ArrowDown className="h-3.5 w-3.5 shrink-0" aria-hidden />
                ) : (
                  <ArrowUp className="h-3.5 w-3.5 shrink-0" aria-hidden />
                )
              ) : (
                <ArrowUpDown
                  className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity duration-fast ease-default group-hover/ordem:opacity-60"
                  aria-hidden
                />
              )}
            </button>
          </Tooltip>
        ),
        cell: ({ row }) => (
          <Celula
            linha={row.original}
            coluna={j}
            comparada={comparada}
            ref_={ref}
            mostrar={mostrar}
          />
        ),
      }
      return col
    })
    // Só as colunas da vista vão para a grade; o que ficou de fora vira o vazio
    // de cada ponta, e a barra de rolagem continua do mesmo tamanho.
    const { de, ate } = recortar(janelaExibida, dosIndices.length)
    const antes = somaDeLarguras(larguras, 0, de)
    const depois = somaDeLarguras(larguras, ate, dosIndices.length)
    return [
      posicao,
      unidade,
      ...(antes > 0 ? [espacador('antes', antes)] : []),
      ...dosIndices.slice(de, ate),
      ...(depois > 0 ? [espacador('depois', depois)] : []),
    ]
  }, [
    escolhidosDoIndice,
    comparadas,
    refs,
    ordem,
    colunaOrdenada,
    alternarOrdem,
    mostrar,
    singular,
    larguras,
    janelaExibida,
  ])

  const itensDoGrafico = useMemo<ItemRanking[]>(() => {
    if (!indiceDoFoco || !comparadaDoFoco) return []
    return linhas.flatMap((l) => {
      const v = valorDaCelula(l, foco, mostrar, refDoFoco)
      if (v == null) return []
      return [
        {
          chave: l.item.chave,
          rotulo: l.item.nome,
          valor: v,
          valorFormatado: textoDoValor(v, comparadaDoFoco, mostrar),
        },
      ]
    })
  }, [linhas, foco, mostrar, refDoFoco, indiceDoFoco, comparadaDoFoco])

  const reguaDoGrafico = mediaDaColuna(foco)

  const legenda = (
    <Tooltip
      content={
        <div className="flex max-w-[21rem] flex-col gap-1 text-left text-xs">
          <p>
            Uma linha por {singular.toLowerCase()} e uma coluna por índice escolhido. Clique no nome
            de um índice para ordenar do maior para o menor; de novo, do menor para o maior; e uma
            terceira vez para voltar à ordem alfabética.
          </p>
          <p>
            <span className="font-semibold">Verde</span> marca quem está melhor e{' '}
            <span className="font-semibold">vermelho</span> quem está pior NAQUELE índice, seguindo
            o que é bom em cada conta (custo menor, receita e lucro maiores).
          </p>
          <p>
            A linha do topo é a <span className="font-semibold">{rotuloDaRegua.toLowerCase()}</span>
            {porMeses
              ? ' — com uma linha só na tabela, média, melhor e pior passam a sair dos meses do período, e não das linhas.'
              : regua.eixo === 'nenhum'
                ? ' — com uma linha e um mês só não há o que comparar, e as colunas de referência mostram “—”.'
                : ' — o índice da seleção: a linha somada dividida pelo faturamento somado, e não a média dos percentuais de cada linha.'}{' '}
            É ela que vira a régua tracejada do gráfico.
          </p>
          <p>
            <span className="font-semibold">{ROTULO_DA_VARIACAO[comparacao]}</span> é a mudança do
            percentual de cada linha {rotuloVariacao}, em pontos: a loja contra ela mesma, e não
            contra as outras. Só entram as linhas com plano nas duas pontas.
          </p>
          <p>
            Em <span className="font-semibold">R$</span>, as contas de razão (rentabilidade,
            motoboy/delivery…) mostram “{TRACO}”: elas não têm valor em reais, só percentual.
          </p>
        </div>
      }
    >
      <button
        type="button"
        aria-label="Como ler o ranking"
        className="rounded-full text-muted-foreground transition-colors duration-fast ease-default hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Info className="h-4 w-4" aria-hidden />
      </button>
    </Tooltip>
  )

  const acaoTelaCheia = (
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
  )

  const controles = (
    <div
      className="grid w-full grid-cols-2 gap-2 @3xl:ml-auto @3xl:flex @3xl:w-auto @3xl:flex-wrap @3xl:items-center"
      data-tour="por-indice-controles"
    >
      <div className="col-span-2 @3xl:w-[15rem]">
        <MultiSelect
          options={opcoes}
          value={escolhidos}
          // A ordem das colunas é a do PLANO, e não a dos cliques: uma coluna que
          // muda de lugar conforme a ordem em que foi marcada não se acha.
          onChange={(v) =>
            onIndicesChange(escolhiveis.filter((e) => v.includes(e.chave)).map((e) => e.chave))
          }
          label="Índices"
          placeholder="Escolher índices"
          searchable
          searchPlaceholder="Buscar conta ou indicador…"
          aria-label="Índices comparados"
          className="w-full"
          contentClassName="w-80"
          icon={<ListOrdered className="h-4 w-4" aria-hidden />}
        />
      </div>
      <Escolha<Mostrar>
        value={mostrar}
        onChange={setMostrar}
        ariaLabel="O que cada coluna mostra"
        rotulo="Mostrar"
        options={[
          { value: 'pct', label: '%', tooltip: 'O percentual da conta em cada linha' },
          { value: 'reais', label: 'R$', tooltip: 'O valor em reais; as razões ficam com "—"' },
          {
            value: 'delta',
            label: 'Δ média',
            tooltip: 'A distância até a média das linhas exibidas, em pontos percentuais',
          },
          {
            value: 'variacao',
            label: ROTULO_DA_VARIACAO[comparacao],
            tooltip: `A mudança do percentual de cada linha ${rotuloVariacao}, em pontos percentuais, nas lojas com plano nas duas pontas`,
          },
        ]}
      />
      <Escolha<ColunasPor>
        value={linhasPor}
        onChange={setLinhasPor}
        ariaLabel="Linhas por"
        rotulo="Linhas"
        forma="select"
        options={[
          { value: 'operacao', label: 'Operação' },
          { value: 'regiao', label: 'Região' },
          { value: 'estado', label: 'Estado' },
        ]}
      />
    </div>
  )

  // ── O QUE FICA NA BARRA, SEMPRE ───────────────────────────────────────────
  //
  // Na tela larga o controle liga e desliga o gráfico AO LADO da tabela; na
  // estreita ele troca qual dos dois está à vista. São perguntas diferentes, e
  // um rótulo só para as duas mentiria em uma delas.
  const escolhaDaVista = (
    <div className="flex flex-wrap items-center gap-2">
      {!telaLarga && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setAjustesAbertos(true)}
          aria-label="Abrir os ajustes da tabela"
        >
          <SlidersHorizontal className="mr-1.5 h-4 w-4" aria-hidden />
          Ajustes
          <span className="ml-1.5 text-xs text-muted-foreground">
            {plural(escolhidos.length, 'índice', 'índices')}
          </span>
        </Button>
      )}
      {telaLarga ? (
        <Escolha<'sim' | 'nao'>
          value={comGrafico ? 'sim' : 'nao'}
          onChange={(v) => setComGrafico(v === 'sim')}
          ariaLabel="Mostrar o gráfico do índice"
          rotulo="Gráfico"
          options={[
            { value: 'sim', label: 'Com gráfico' },
            { value: 'nao', label: 'Só a tabela', tooltip: 'Dá toda a altura para a tabela' },
          ]}
        />
      ) : (
        <Escolha<'tabela' | 'grafico'>
          value={vistaEstreita}
          onChange={setVistaEstreita}
          ariaLabel="Ver a tabela ou o gráfico"
          rotulo="Ver"
          rotuloVisivel
          options={[
            { value: 'tabela', label: 'Tabela' },
            { value: 'grafico', label: 'Gráfico', tooltip: 'O ranking do índice que ordena' },
          ]}
        />
      )}
    </div>
  )

  const ajustes = (
    <Modal open={ajustesAbertos} onOpenChange={setAjustesAbertos}>
      <Modal.Content size="sm">
        <Modal.Header>
          <Modal.Title>Ajustes da tabela</Modal.Title>
          <Modal.Description>
            Quais índices entram nas colunas, o que cada célula mostra e o que cada linha é.
          </Modal.Description>
        </Modal.Header>
        <Modal.Body className="flex flex-col gap-3">{controles}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setAjustesAbertos(false)}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  )

  // Sem índice escolhido não há ranking: a tabela fica, com o estado vazio dela,
  // em vez de a tela estreita cair num gráfico que não existe.
  const temGrafico = !!(indiceDoFoco && comparadaDoFoco)
  const mostrarTabela = telaLarga || !temGrafico || vistaEstreita === 'tabela'
  const mostrarGrafico = temGrafico && (telaLarga ? comGrafico : vistaEstreita === 'grafico')

  // ── A GRADE EM EXCEL ──────────────────────────────────────────────────────
  //
  // Colunas e células saem do MESMO `escolhidosDoIndice`, na mesma ordem da
  // tela: o arquivo é a tabela como ela está, com R$ e % de cada índice.
  const colunasDaPlanilha = useMemo<ColunaPlanilha[]>(
    () => [
      { titulo: 'Posição', formato: 'inteiro' },
      { titulo: singular, formato: 'texto' },
      ...escolhidosDoIndice.flatMap((e, j): ColunaPlanilha[] => [
        { titulo: `${e.codigo} ${e.rotulo} · R$`, formato: 'brl' },
        { titulo: `${e.codigo} ${e.rotulo} · %`, formato: 'pct' },
        // No modo de variação, o que a tela mostra vai junto — sem ele o arquivo
        // teria o percentual e não a mudança.
        ...(porVariacao
          ? [
              {
                titulo: `${e.codigo} ${e.rotulo} · Δ ${rotuloVariacao}`,
                formato: (comparadas[j]?.unidade === 'pct' ? 'pp' : 'decimal') as Formato,
              },
            ]
          : []),
      ]),
    ],
    [escolhidosDoIndice, singular, porVariacao, rotuloVariacao, comparadas]
  )
  const planilhaDaTabela = useCallback(
    () =>
      planilhaDaGrade(colunasDaPlanilha, linhas, (l) => [
        l.posicao,
        l.item.nome,
        ...escolhidosDoIndice.flatMap((_, j): Celula[] => {
          const m = l.celulas[j]?.medida
          return [
            m?.valor ?? null,
            m?.pct ?? null,
            ...(porVariacao ? [valorDaCelula(l, j, 'variacao', undefined)] : []),
          ]
        }),
      ]),
    [colunasDaPlanilha, linhas, escolhidosDoIndice, porVariacao]
  )

  const vazio =
    escolhidos.length === 0 ? (
      <EmptyState
        icon={ListOrdered}
        title="Nenhum índice escolhido"
        description="Escolha ao menos um índice no seletor Índices, acima da tabela."
      />
    ) : (
      <EmptyState
        icon={ListOrdered}
        title="Nada para ordenar neste período"
        description="Nenhuma das operações marcadas tem plano gravado no período. Troque o período no topo."
      />
    )

  return (
    <TelaCheia ativa={cheia} onSair={() => setCheia(false)} className="gap-2 p-2 md:p-4">
      <div className={cn('flex flex-col gap-2', cheia ? 'min-h-0 flex-1' : 'h-full')}>
        {/* O `@container` fica NESTA linha, e não na raiz da aba — ver a mesma
            nota na aba Comparativos: ele prende `position: fixed`. */}
        <div className="@container flex flex-wrap items-center gap-x-3 gap-y-2">
          {telaLarga && controles}
          {escolhaDaVista}
        </div>
        {!telaLarga && ajustes}

        {/* ── LADO A LADO NA TELA LARGA ──────────────────────────────────
            Empilhado, o gráfico custa altura justamente na aba que existe para
            mostrar muitas linhas. A partir de 1280 px os dois dividem a LARGURA
            e nenhum perde altura. É ponto de quebra de VIEWPORT, e não de
            container, de propósito: um `@container` aqui viraria bloco de
            contenção e prenderia a tela cheia do cartão do gráfico. */}
        {/* Na tela larga os dois dividem a LARGURA e nenhum perde altura; na
            estreita, um de cada vez, com a altura inteira e sem a aba rolar. */}
        <div className="flex min-h-0 flex-1 flex-col gap-2 xl:flex-row">
          <DicaDaGrade
            alvo={alvoDaGrade}
            className={cn(
              'relative min-h-0',
              !mostrarTabela && 'hidden',
              // `flex-[2]` contra `flex-1` do gráfico, e não uma divisão mais
              // igual: abaixo de 768 px de LARGURA PRÓPRIA o `DataReport` troca
              // a tabela por cartões, e com 60% de 1265 px ela virava cartão numa
              // tela de desktop (medido em 22/09/2026).
              mostrarGrafico && telaLarga ? 'xl:flex-[2]' : 'flex-1'
            )}
          >
            <DataReport
              title="Lojas por índice"
              titleExtra={legenda}
              subtitle={`${plural(linhas.length, singular.toLowerCase(), plural_)} · ${plural(escolhidos.length, 'índice', 'índices')} · ${rotuloPeriodo}${textoDaRegua}${colunaOrdenada >= 0 && indiceDoFoco ? ` · ordenado por ${indiceDoFoco.rotulo}` : ''}`}
              data={carregando ? [] : linhas}
              columns={colunas}
              loading={carregando}
              fillHeight
              enableSorting={false}
              pageSize={200}
              countNoun={plural_}
              fullscreenToggle={false}
              actions={
                <>
                  <BotaoExportar
                    planilha={planilhaDaTabela}
                    titulo="Lojas por índice"
                    tituloDoArquivo="Por índice"
                  />
                  {acaoTelaCheia}
                </>
              }
              columnPinning={FIXAS}
              summaryRow={() =>
                resumoDaMedia(
                  escolhidosDoIndice,
                  comparadas,
                  mediaDaColuna,
                  mostrar,
                  porVariacao ? 'Seleção' : rotuloDaRegua
                )
              }
              renderCard={(l) => (
                <CartaoDaLinha
                  linha={l}
                  indices={escolhidosDoIndice}
                  comparadas={comparadas}
                  refs={refs}
                  mostrar={mostrar}
                />
              )}
              emptyState={vazio}
            />
          </DicaDaGrade>

          {temGrafico && (
            <div className={cn('min-h-0 flex-1', !mostrarGrafico && 'hidden')}>
              <MolduraGrafico
                tourId="por-indice-grafico"
                titulo={`${indiceDoFoco.codigo} ${indiceDoFoco.rotulo}`}
                subtitulo={`${plural(itensDoGrafico.length, singular.toLowerCase(), plural_)} na ordem da tabela. A régua tracejada é ${porVariacao ? `a variação da seleção ${rotuloVariacao}` : mostrar === 'delta' ? 'a média, no zero' : 'a média das linhas exibidas'}.`}
                className="h-full"
                tituloDoArquivo={`Ranking ${indiceDoFoco.rotulo}`}
                planilha={() =>
                  planilhaDeRanking(paraPlanilha(itensDoGrafico), {
                    rotuloItem: singular,
                    rotuloValor: `${indiceDoFoco.codigo} ${indiceDoFoco.rotulo}`,
                    formato: formatoDaColuna(comparadaDoFoco, mostrar),
                    notas: [
                      `Período: ${rotuloPeriodo}.`,
                      reguaDoGrafico == null
                        ? 'Sem média para a régua.'
                        : porVariacao
                          ? `Variação da seleção ${rotuloVariacao}: ${textoDoValor(reguaDoGrafico, comparadaDoFoco, mostrar)}.`
                          : `Média das linhas exibidas: ${textoDoValor(reguaDoGrafico, comparadaDoFoco, mostrar)}.`,
                    ],
                  })
                }
              >
                <BarrasRanking
                  itens={itensDoGrafico}
                  preencherAltura
                  referencia={reguaDoGrafico}
                  referenciaFormatada={
                    reguaDoGrafico == null
                      ? undefined
                      : textoDoValor(reguaDoGrafico, comparadaDoFoco, mostrar)
                  }
                  rotuloReferencia={porVariacao ? 'Seleção' : 'Média'}
                  substantivoPlural={plural_}
                />
              </MolduraGrafico>
            </div>
          )}
        </div>
      </div>
    </TelaCheia>
  )
}

/** O gráfico aceita valor nulo; a planilha, não — e nulo não vira linha. */
function paraPlanilha(itens: readonly ItemRanking[]) {
  return itens.flatMap((i) => (i.valor == null ? [] : [{ rotulo: i.rotulo, valor: i.valor }]))
}

// ── AS CÉLULAS ──────────────────────────────────────────────────────────────

function textoDoValor(v: number, comparada: LinhaComparada, mostrar: Mostrar): string {
  if (mostrar === 'reais') return fmtValor(v)
  if (mostrar === 'delta' || mostrar === 'variacao') return fmtDiferenca(comparada.unidade, v)
  return comparada.unidade === 'pct' ? fmtPct(v) : fmtConta(comparada.unidade, v)
}

function formatoDaColuna(comparada: LinhaComparada, mostrar: Mostrar): Formato {
  if (mostrar === 'reais') return 'brl'
  if (mostrar === 'delta' || mostrar === 'variacao')
    return comparada.unidade === 'pct' ? 'pp' : 'decimal'
  return comparada.unidade === 'pct' ? 'pct' : 'decimal'
}

function Celula({
  linha,
  coluna,
  comparada,
  ref_,
  mostrar,
}: {
  linha: LinhaDaUnidade
  coluna: number
  comparada: LinhaComparada | undefined
  ref_: Referencias | undefined
  mostrar: Mostrar
}) {
  if (!comparada) return null
  const v = valorDaCelula(linha, coluna, mostrar, ref_)
  if (v == null) return <span className="text-muted-foreground">{TRACO}</span>

  if (mostrar === 'delta' || mostrar === 'variacao') {
    const { classe } = classeDaDiferenca(v, comparada.direcao, comparada.unidade)
    return (
      <span className={cn('rounded px-1.5 py-0.5 tabular-nums', classe)}>
        {textoDoValor(v, comparada, mostrar)}
      </span>
    )
  }

  // Empate marca todos os empatados; sem disputa (todos iguais) ninguém é
  // melhor nem pior — o faturamento é 100% em toda loja.
  //
  // Na régua dos MESES ninguém é marcado: a linha é uma loja e a régua é de
  // meses, então dizer que ela é "a melhor" seria dizer que ela é a melhor de
  // si mesma.
  const pct = linha.celulas[coluna]?.medida?.pct ?? null
  const disputa =
    mostrar === 'pct' &&
    comparada.eixo === 'unidades' &&
    comparada.direcao !== 'neutra' &&
    ref_ != null &&
    ref_.melhor != null &&
    ref_.pior != null &&
    Math.abs(ref_.melhor - ref_.pior) > 1e-9
  const igual = (x: number | null) => x != null && pct != null && Math.abs(x - pct) < 1e-9
  const melhor = disputa && igual(ref_?.melhor ?? null)
  const pior = disputa && igual(ref_?.pior ?? null)
  return (
    <span
      className={cn(
        'tabular-nums',
        melhor && 'font-semibold text-success',
        pior && 'font-semibold text-destructive'
      )}
      data-dica={melhor ? 'O melhor deste índice.' : pior ? 'O pior deste índice.' : undefined}
    >
      {textoDoValor(v, comparada, mostrar)}
    </span>
  )
}

/** A linha de médias no topo da grade — a régua de cada coluna. */
function resumoDaMedia(
  indices: ReadonlyArray<{ chave: string }>,
  comparadas: readonly LinhaComparada[],
  media: (j: number) => number | null,
  mostrar: Mostrar,
  rotulo: string
): Partial<Record<string, ReactNode>> {
  const saida: Partial<Record<string, ReactNode>> = {
    unidade: <span className="text-xs font-semibold">{rotulo}</span>,
  }
  indices.forEach((e, j) => {
    const comparada = comparadas[j]
    if (!comparada) return
    const v = media(j)
    saida[`indice-${e.chave}`] =
      v == null ? (
        <span className="text-muted-foreground">{TRACO}</span>
      ) : (
        <span className="tabular-nums">{textoDoValor(v, comparada, mostrar)}</span>
      )
  })
  return saida
}

/** O cartão do celular: identidade em cima, um índice por linha. */
function CartaoDaLinha({
  linha,
  indices,
  comparadas,
  refs,
  mostrar,
}: {
  linha: LinhaDaUnidade
  /**
   * Os índices INTEIROS, e não só o rótulo: a chave da lista é a do índice.
   * Nome de conta se repete no plano — "Bebidas" é a 1.1.2 e a 2.2 —, e com o
   * rótulo por `key` o React reclamava de chave duplicada e podia trocar uma
   * linha do cartão por outra. Só aparecia com muitos índices marcados, o que o
   * teto de oito escondia (23/09/2026).
   */
  indices: readonly IndiceEscolhivel[]
  comparadas: readonly LinhaComparada[]
  refs: readonly Referencias[]
  mostrar: Mostrar
}) {
  return (
    <div className="flex flex-col gap-2 p-3">
      <div className="flex min-w-0 items-baseline gap-2">
        <span className="shrink-0 tabular-nums text-xs text-muted-foreground">{linha.posicao}</span>
        <span className="min-w-0 truncate text-sm font-semibold">{linha.item.nome}</span>
      </div>
      <dl className="flex flex-col gap-1 text-sm">
        {indices.map((e, j) => (
          <div key={e.chave} className="flex min-w-0 items-center justify-between gap-3">
            <dt className="min-w-0 truncate text-xs text-muted-foreground">{e.rotulo}</dt>
            <dd className="shrink-0">
              <Celula
                linha={linha}
                coluna={j}
                comparada={comparadas[j]}
                ref_={refs[j]}
                mostrar={mostrar}
              />
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
