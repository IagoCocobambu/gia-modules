import { useMemo } from 'react'
import type { Catalogo } from '../catalogo'
import {
  itensDaComparacao,
  linhasDaComparacao,
  linhasDoDinheiro,
  ondeEstaODinheiro,
  reguaDaComparacao,
  type OperacaoParaComparar,
} from '../comparativos'
import { fmtBRLCompacto, fmtPct, plural } from '../formato'
import type { MesCarregado } from '../matriz'
import { planilhaDeRanking } from '../planilha'
import type { RecorteCalculado } from '../recorte'
import { BarrasRanking, type ItemRanking } from './graficos/BarrasRanking'
import { MolduraGrafico } from './graficos/MolduraGrafico'

// "Onde está o dinheiro" — a coluna IMPACTO R$ da aba "Análise Comparativa" do
// BI mensal, desenhada para UMA loja: as contas de despesa em que ela mais se
// afasta da média das lojas consultadas, em reais. A conta é a do "Ganho R$" da
// aba Comparativos (ver `ondeEstaODinheiro`, em `comparativos.ts`), contra a
// média — a referência do IMPACTO R$ do BI.
//
// Mora na aba Análises adicionais, sob o cartão da loja: o cartão diz que o
// labor está 1,47 ponto acima da média; este gráfico diz quantos reais são e em
// que contas eles estão.

interface Props {
  cat: Catalogo
  recorte: RecorteCalculado
  operacoes: readonly OperacaoParaComparar[]
  /** Os meses do período — a régua precisa deles (ver `reguaDaComparacao`). */
  meses: readonly MesCarregado[]
  /** A unidade escolhida; `null` = a seleção inteira, que é a própria média. */
  unidade: string | null
  nomeDaUnidade: string
  atraso?: number
}

export function OndeEstaODinheiro({
  cat,
  recorte,
  operacoes,
  meses,
  unidade,
  nomeDaUnidade,
  atraso,
}: Props) {
  const itens = useMemo(
    () => itensDaComparacao(recorte, operacoes, 'operacao', cat),
    [recorte, operacoes, cat]
  )
  const regua = useMemo(
    () =>
      reguaDaComparacao(
        itens.map((i) => i.ag).filter((a): a is NonNullable<typeof a> => !!a),
        recorte,
        meses,
        cat
      ),
    [itens, recorte, meses, cat]
  )
  const coluna = unidade ? itens.findIndex((i) => i.chave === unidade) : -1
  // Contra a média DAS LOJAS: com uma loja só a régua vira a dos meses dela, e
  // "onde ela perde para os próprios meses" é outra pergunta.
  const contraAsLojas = regua.eixo === 'unidades'
  // TODAS as contas acima da média, e não só as 10 maiores: no cartão o ranking
  // pagina de 10 em 10, e em tela cheia mostra a lista inteira — o que a tela
  // cheia promete em todo gráfico de lista. Com o corte em 10, as outras
  // contas não apareciam em lugar nenhum (29/09/2026).
  const dinheiro = useMemo(() => {
    if (coluna < 0 || !contraAsLojas) return null
    const comparadas = linhasDaComparacao(linhasDoDinheiro(cat), itens, recorte, cat, regua)
    return ondeEstaODinheiro(comparadas, coluna, 'media', Number.POSITIVE_INFINITY)
  }, [coluna, contraAsLojas, cat, itens, recorte, regua])

  const barras = useMemo<ItemRanking[]>(
    () =>
      (dinheiro?.contas ?? []).map((c) => {
        const conta = c.linha.linha.tipo === 'conta' ? c.linha.linha.conta : null
        return {
          chave: c.linha.linha.chave,
          rotulo: conta ? `${conta.formatado} ${conta.descricao}` : c.linha.linha.chave,
          valor: c.ganho,
          valorFormatado: fmtBRLCompacto(c.ganho),
          detalhe: `${fmtPct(c.pct)} do faturamento, contra ${fmtPct(c.ref)} da média`,
        }
      }),
    [dinheiro]
  )

  const aviso = (texto: string) => (
    <p className="flex min-h-[12rem] items-center justify-center px-4 text-center text-sm text-muted-foreground">
      {texto}
    </p>
  )

  let corpo
  if (unidade == null) {
    corpo = aviso(
      'Escolha uma loja no topo da aba: a seleção inteira é a própria média, e não há de onde tirar dinheiro.'
    )
  } else if (!contraAsLojas) {
    corpo = aviso('Marque duas lojas ou mais para haver uma média contra a qual medir.')
  } else if (!dinheiro || dinheiro.contas.length === 0) {
    corpo = aviso(
      `Nenhuma conta de despesa de ${nomeDaUnidade} fica acima da média por mais de R$ 500.`
    )
  } else {
    corpo = <BarrasRanking itens={barras} substantivoPlural="contas" porPagina={10} />
  }

  return (
    <MolduraGrafico
      tourId="onde-esta-o-dinheiro"
      titulo="Onde está o dinheiro"
      subtitulo={
        dinheiro && dinheiro.contas.length > 0
          ? `${fmtBRLCompacto(dinheiro.total)} em ${plural(dinheiro.acima, 'conta', 'contas')} de despesa em que ${nomeDaUnidade} fica acima da média das lojas: quanto o resultado mudaria se cada uma tivesse o percentual da média.${dinheiro.melhores > 0 ? ` Em ${plural(dinheiro.melhores, 'outra conta', 'outras contas')}, a loja já está melhor.` : ''}`
          : 'As contas de despesa de nível 2 em que a loja mais se afasta da média das lojas, em reais.'
      }
      atraso={atraso}
      tituloDoArquivo={`Onde está o dinheiro - ${nomeDaUnidade}`}
      planilha={() =>
        dinheiro && dinheiro.contas.length > 0
          ? planilhaDeRanking(
              barras.map((b) => ({ rotulo: b.rotulo, valor: b.valor ?? 0, detalhe: b.detalhe })),
              {
                rotuloItem: 'Conta',
                rotuloValor: 'Ganho se igual à média (R$)',
                formato: 'brl',
                notas: [
                  `Loja: ${nomeDaUnidade}.`,
                  `Todas as contas acima da média somam ${fmtBRLCompacto(dinheiro.total)}.`,
                ],
              }
            )
          : null
      }
    >
      {corpo}
    </MolduraGrafico>
  )
}
