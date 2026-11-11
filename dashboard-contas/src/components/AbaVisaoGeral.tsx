import { useMemo, useRef, type ReactNode } from 'react'
import type { PeriodoDeMeses } from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'
import type { Catalogo } from '../catalogo'
import { plural } from '../formato'
import { useEntradaEmCascata } from '../hooks/use-entrada'
import {
  mesesDoPeriodo,
  rotuloDaVariacao,
  type ModoDeComparacao,
  rotuloDoPeriodo,
  textoDoMes,
} from '../periodo'
import type { RecorteCalculado } from '../recorte'
import type { SerieDeContas } from '../types'
import { PARTES_DAS_DESPESAS, PARTES_DO_FATURAMENTO, composicao, serieDasLojas } from '../visao'
import { ForaDaComparacao } from './ForaDaComparacao'
import { CartoesDoTopo } from './visao/CartoesDoTopo'
import { IndicadoresNoTempo } from './visao/IndicadoresNoTempo'
import { EsqueletoDaAba } from './EsqueletoDaAba'
import { DesempenhoDasLojas, type Metrica, type Visao } from './visao/DesempenhoDasLojas'
import { EvolucaoDoResultado } from './visao/EvolucaoDoResultado'
import { TabelaDeComposicao } from './visao/TabelaDeComposicao'

// A Visão geral: o desenho do designer ("BI — Plano de Contas", página 1) com as
// análises do HTML de especificação, em quatro blocos que se leem de cima para
// baixo — o resultado, a evolução, do que ele é feito e quem o faz.
//
// ── A PÁGINA ROLA, OS GRÁFICOS NÃO ──────────────────────────────────────────
//
// Este contêiner é o único que rola (decisão do João no RH, 15/09/2026: nada de
// rolagem dentro de rolagem). Os rankings paginam; a tabela de lojas mostra 10
// linhas por página.
//
// ── A ENTRADA ───────────────────────────────────────────────────────────────
//
// Cada bloco surge em cascata ao fim do carregamento, e os que estão abaixo da
// dobra surgem quando a rolagem chega neles (`use-entrada`, o mesmo do RH). O
// `ref` é o contêiner que rola.

interface OperacaoDaVisao {
  ref: string
  nome: string
  regiao: string
  /** As operações que a unidade soma — mais de uma num grupo de matriz e filiais. */
  membros?: ReadonlyArray<{ ref: string }>
}

interface Props {
  cat: Catalogo
  recorte: RecorteCalculado
  operacoes: readonly OperacaoDaVisao[]
  periodo: PeriodoDeMeses
  /** Contra o que a variação compara — o "Comparar com" do topo. */
  comparacao: ModoDeComparacao
  serie: SerieDeContas | null
  /** A mesma série, um ano antes — `null` enquanto não chega. */
  serieAnoPassado: SerieDeContas | null
  /** O recorte ainda está sendo recalculado: a aba dá lugar ao esqueleto. */
  carregando: boolean
  carregandoSerie: boolean
  escolhas: EscolhasDaVisao
  onEscolhas: (e: EscolhasDaVisao) => void
}

/**
 * O que o usuário escolheu DENTRO da aba: o indicador do cartão "Indicadores mês
 * a mês", a métrica dos rankings e as linhas da tabela de desempenho.
 *
 * Vive na TELA, e não aqui, porque a aba é DESMONTADA enquanto o esqueleto
 * aparece — a cada Consultar, a escolha voltaria ao padrão.
 */
export interface EscolhasDaVisao {
  indicador: string
  metrica: Metrica
  visao: Visao
}

function Secao({
  titulo,
  extra,
  children,
  tourId,
}: {
  titulo: string
  extra?: ReactNode
  children: ReactNode
  tourId?: string
}) {
  return (
    <section className="flex flex-col gap-2" data-tour={tourId}>
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-sm font-semibold text-foreground">{titulo}</h2>
        {extra}
      </div>
      {children}
    </section>
  )
}

export function AbaVisaoGeral({
  cat,
  recorte,
  operacoes,
  periodo,
  comparacao,
  serie,
  serieAnoPassado,
  carregando,
  carregandoSerie,
  escolhas,
  onEscolhas,
}: Props) {
  const raiz = useRef<HTMLDivElement>(null)
  useEntradaEmCascata(raiz, !carregando)

  const rotuloVariacao = rotuloDaVariacao(periodo, comparacao)
  const mesesDoPeriodoSet = useMemo(
    () => new Set(mesesDoPeriodo(periodo).map(textoDoMes)),
    [periodo]
  )
  // ── A SÉRIE É POR OPERAÇÃO; O RECORTE, POR UNIDADE ───────────────────────
  //
  // O handler da série devolve cada OPERAÇÃO. Com "Consolidar matriz e filiais"
  // ligado, a unidade de um grupo é `grupo:<id>` e não casa com nenhuma delas:
  // filtrar a série pelas unidades tirava os grupos da evolução inteira — os
  // gráficos de tempo e os risquinhos dos cartões —, sem aviso (visto em
  // 28/09/2026). A série soma as operações que compõem as unidades na conta, que
  // é o mesmo total. A contagem de lojas de cada mês passa a ser de operações.
  const refsDaSerie = useMemo(() => {
    const membros = new Map(operacoes.map((o) => [o.ref, o.membros?.map((m) => m.ref) ?? [o.ref]]))
    return new Set([...recorte.naConta].flatMap((ref) => membros.get(ref) ?? [ref]))
  }, [operacoes, recorte.naConta])
  const evolucao = useMemo(
    () => (serie ? serieDasLojas(serie, refsDaSerie) : null),
    [serie, refsDaSerie]
  )
  const evolucaoAnoPassado = useMemo(
    () => (serieAnoPassado ? serieDasLojas(serieAnoPassado, refsDaSerie) : null),
    [serieAnoPassado, refsDaSerie]
  )
  const faturamento = useMemo(
    () =>
      composicao(
        PARTES_DO_FATURAMENTO,
        recorte.consolidado,
        recorte.nasDuasPontas.size ? recorte.mesmasAtual : null,
        recorte.nasDuasPontas.size ? recorte.mesmasAnterior : null,
        cat
      ),
    [recorte, cat]
  )
  const despesas = useMemo(
    () =>
      composicao(
        PARTES_DAS_DESPESAS,
        recorte.consolidado,
        recorte.nasDuasPontas.size ? recorte.mesmasAtual : null,
        recorte.nasDuasPontas.size ? recorte.mesmasAnterior : null,
        cat
      ),
    [recorte, cat]
  )
  const nomePorRef = useMemo(() => new Map(operacoes.map((o) => [o.ref, o.nome])), [operacoes])
  const comPlano = [...recorte.naConta].filter((r) => recorte.porLoja.has(r)).length

  if (recorte.naConta.size === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-border bg-surface p-6 text-center text-sm text-muted-foreground">
        Nenhuma operação marcada passa nos filtros. Confira o status do plano e a opção Mesmas lojas
        em Filtros.
      </div>
    )
  }

  // ── ENQUANTO RECALCULA, O ESQUELETO ──────────────────────────────────────
  //
  // A aba inteira dá lugar ao esqueleto dela — é o padrão de espera do portal, o
  // mesmo do Dashboard de RH. Antes ela só esmaecia (opacidade 60%), e com um
  // período de 12 meses a tela ficava segundos apagada, com números velhos à
  // vista: "meio que uma congelada" (João, 22/09/2026).
  //
  // Desmontar é seguro porque o que o usuário escolheu DENTRO da aba mora na
  // tela (ver `EscolhasDaVisao`).
  if (carregando) return <EsqueletoDaAba aba="visao" />

  return (
    <div
      ref={raiz}
      className={cn(
        // ☠️ `relative` NÃO é decoração. Sem um ancestral posicionado AQUI
        // dentro, os elementos `absolute` da aba — o `sr-only` das tabelas e as
        // alças de redimensionar coluna do `DataReport` — tomam a moldura da
        // página como referência e vazam para o `<main>` do portal: medido em
        // 18/09/2026, a página ganhava 286 px de rolagem vazia.
        //
        // E `contain: layout` NÃO pode entrar junto: ele vira bloco de contenção
        // para `position: fixed`, e a tela cheia dos cartões (e a do
        // `DataReport`) é um `fixed inset-0` da SDK, sem portal — contida, ela
        // abria fora da vista (21/09/2026).
        '@container relative h-full overflow-y-auto pr-1 transition-opacity duration-fast ease-default'
      )}
    >
      <div className="flex flex-col gap-5 pb-4">
        <Secao
          titulo="Desempenho geral"
          tourId="secao-desempenho"
          extra={
            <>
              <span className="text-xs text-muted-foreground">
                {plural(comPlano, 'loja com plano', 'lojas com plano')} em{' '}
                {rotuloDoPeriodo(periodo)}
                {' · '}variação {rotuloVariacao}, nas mesmas lojas
              </span>
              <ForaDaComparacao
                itens={recorte.foraDaVariacao.map((f) => ({
                  ref: f.ref,
                  nome: nomePorRef.get(f.ref) ?? f.ref,
                  motivo: f.motivo,
                }))}
                substantivo={['loja', 'lojas']}
                explicacao="A variação compara só as lojas com plano nos dois períodos. As que têm plano em só um deles ficam de fora da variação — continuam no número do período."
              />
            </>
          }
        >
          <CartoesDoTopo
            cat={cat}
            recorte={recorte}
            serie={evolucao}
            carregandoSerie={carregandoSerie}
            rotuloVariacao={rotuloVariacao}
          />
        </Secao>

        <Secao titulo="Evolução do resultado">
          <div className="flex flex-col gap-3">
            <EvolucaoDoResultado
              serie={evolucao}
              mesesDoPeriodo={mesesDoPeriodoSet}
              carregando={carregandoSerie && !evolucao}
            />
            {/* Largura inteira: são dez escolhas em cima do desenho, e em meia
                tela elas viram cinco linhas de dois. */}
            <IndicadoresNoTempo
              escolhido={escolhas.indicador}
              onEscolhido={(indicador) => onEscolhas({ ...escolhas, indicador })}
              cat={cat}
              recorte={recorte}
              serie={evolucao}
              serieAnoPassado={evolucaoAnoPassado}
              rotuloVariacao={rotuloVariacao}
              mesesDoPeriodo={mesesDoPeriodoSet}
              carregando={carregandoSerie && !evolucao}
              atraso={520}
            />
          </div>
        </Secao>

        <Secao titulo="Composição do faturamento e das despesas" tourId="composicao">
          <div className="grid grid-cols-1 gap-3 @4xl:grid-cols-2">
            <TabelaDeComposicao
              tourId="composicao-faturamento"
              titulo="Faturamento por área"
              subtitulo="As contas do grupo 1 FATURAMENTO, do maior para o menor, e a parte de cada uma no total."
              linhas={faturamento.linhas}
              total={faturamento.total}
              variacaoTotal={faturamento.variacaoTotal}
              melhorQuando="maior"
              rotuloVariacao={rotuloVariacao}
              atraso={560}
            />
            <TabelaDeComposicao
              tourId="composicao-despesas"
              titulo="Despesas por natureza"
              subtitulo="Os indicadores gerenciais (10100 a 10700), que somam exatamente as despesas totais: matéria-prima, impostos e custos operacionais."
              linhas={despesas.linhas}
              total={despesas.total}
              variacaoTotal={despesas.variacaoTotal}
              melhorQuando="menor"
              rotuloVariacao={rotuloVariacao}
              atraso={600}
            />
          </div>
        </Secao>

        <Secao titulo="Desempenho das lojas">
          <DesempenhoDasLojas
            metrica={escolhas.metrica}
            onMetrica={(metrica) => onEscolhas({ ...escolhas, metrica })}
            visao={escolhas.visao}
            onVisao={(visao) => onEscolhas({ ...escolhas, visao })}
            cat={cat}
            recorte={recorte}
            operacoes={operacoes}
            rotuloVariacao={rotuloVariacao}
          />
        </Secao>
      </div>
    </div>
  )
}
