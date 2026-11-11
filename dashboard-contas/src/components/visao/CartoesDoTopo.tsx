import type { Catalogo } from '../../catalogo'
import type { RecorteCalculado } from '../../recorte'
import {
  CARTOES_PRINCIPAIS,
  formatarCartao,
  medirCartao,
  serieDoCartao,
  type SerieCalculada,
} from '../../visao'
import { CartaoKpi } from '../graficos/CartaoKpi'

// Os quatro cartões do topo da Visão geral: faturamento, despesas, lucro e
// rentabilidade. Os dez indicadores ficam na faixa logo abaixo
// (`FaixaDeIndicadores`).
//
// O NÚMERO é o do consolidado das operações na conta. A VARIAÇÃO compara só as
// lojas com plano nos dois períodos (`recorte.mesmasAtual` × `mesmasAnterior`) —
// é por isso que ela pode não bater com a conta "número de hoje ÷ número do
// período anterior" quando alguma loja entrou ou saiu. As que ficaram de fora
// são nomeadas no selo ao lado do título da seção.

interface Props {
  cat: Catalogo
  recorte: RecorteCalculado
  /** A evolução de 12 meses, para os risquinhos. */
  serie: SerieCalculada | null
  carregandoSerie: boolean
  rotuloVariacao: string
}

export function CartoesDoTopo({ cat, recorte, serie, carregandoSerie, rotuloVariacao }: Props) {
  const semVariacao =
    recorte.nasDuasPontas.size === 0
      ? 'nenhuma loja com plano nos dois períodos'
      : 'sem base no período anterior'

  return (
    <div className="grid grid-cols-1 gap-2 @md:grid-cols-2 @4xl:grid-cols-4" data-tour="cartoes">
      {CARTOES_PRINCIPAIS.map((c, i) => {
        const { valor, variacao } = medirCartao(c, recorte, cat)
        return (
          <CartaoKpi
            key={c.id}
            rotulo={c.rotulo}
            valor={formatarCartao(c, valor)}
            codigo={c.codigo}
            ajuda={c.ajuda}
            variacao={variacao}
            tipoVariacao={c.variacao}
            melhorQuando={c.direcao === 'menor' ? 'menor' : 'maior'}
            rotuloVariacao={rotuloVariacao}
            semVariacao={semVariacao}
            serie={serie ? serieDoCartao(c, serie) : undefined}
            carregandoSerie={carregandoSerie}
            atraso={40 + i * 40}
          />
        )
      })}
    </div>
  )
}
