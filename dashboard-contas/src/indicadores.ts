import type { Catalogo, Direcao } from './catalogo'
import { mediaMensalDe, valorDe, type Agregado } from './matriz'

// Os INDICADORES CALCULADOS — os cinco que o HTML de especificação acrescenta às
// contas do plano, recalculados em qualquer recorte (loja, região, rede, período).
//
// Não existem no data-warehouse: nascem aqui, sempre sobre as SOMAS do agregado,
// pela mesma regra das razões do catálogo. As descrições são as do HTML, e vão
// para a dica da linha e para a FAQ.

export interface IndicadorCalculado {
  id: string
  nome: string
  descricao: string
  direcao: Direcao
  unidade: 'pct' | 'dias'
  calcular: (ag: Agregado, cat: Catalogo) => number | null
  /**
   * A base em reais das Oportunidades em R$: a diferença do indicador × base é o
   * impacto no resultado. Para as razões, o denominador; para o estoque, o
   * faturamento mensal; para o DIO, o consumo diário de matéria-prima.
   */
  base: (ag: Agregado, cat: Catalogo) => number | null
}

function dividir(num: number | null, den: number | null): number | null {
  if (num == null || den == null || Math.abs(den) < 1e-9) return null
  return num / den
}

/** 1 FATURAMENTO − 1.2 DELIVERY − 1.6 ESTACIONAMENTO/VALLET. */
function faturamentoSalao(ag: Agregado, cat: Catalogo): number | null {
  const fat = valorDe(ag, cat, 1000)
  if (fat == null) return null
  return fat - (valorDe(ag, cat, 1200) ?? 0) - (valorDe(ag, cat, 1600) ?? 0)
}

export const INDICADORES_CALCULADOS: readonly IndicadorCalculado[] = [
  {
    id: 'labor-salao',
    nome: 'LABOR / Faturamento salão',
    descricao:
      'LABOR (10200: folha, encargos e benefícios — inclui o grupo 3.2) dividido pelo faturamento do salão: o faturamento total menos 1.2 DELIVERY e 1.6 ESTACIONAMENTO / VALLET. Mede o peso da equipe sobre a venda atendida no salão.',
    direcao: 'menor',
    unidade: 'pct',
    calcular: (ag, cat) => dividir(valorDe(ag, cat, 10200), faturamentoSalao(ag, cat)),
    base: faturamentoSalao,
  },
  {
    id: 'entrega-liquida',
    nome: '(Motoboy − Receita com entrega) / Venda delivery',
    descricao:
      '(4.10.1 Motoboys delivery − 1.2.2 Taxas de entrega) ÷ 1.2 DELIVERY. É o custo líquido da entrega própria, já descontando o que a taxa cobrada do cliente recupera.',
    direcao: 'menor',
    unidade: 'pct',
    calcular: (ag, cat) =>
      dividir(
        (valorDe(ag, cat, 4911) ?? 0) - (valorDe(ag, cat, 1220) ?? 0),
        valorDe(ag, cat, 1200)
      ),
    base: (ag, cat) => valorDe(ag, cat, 1200),
  },
  {
    id: 'receita-entrega',
    nome: 'Receita com entrega / Venda delivery',
    descricao:
      '1.2.2 Taxas de entrega ÷ 1.2 DELIVERY. O percentual da venda de delivery recuperado pela taxa de entrega cobrada do cliente.',
    direcao: 'maior',
    unidade: 'pct',
    calcular: (ag, cat) => dividir(valorDe(ag, cat, 1220), valorDe(ag, cat, 1200)),
    base: (ag, cat) => valorDe(ag, cat, 1200),
  },
  {
    id: 'estoque-faturamento',
    nome: 'Estoque / Faturamento mensal',
    descricao:
      'O estoque no fim do período (10102 do último mês de cada loja) dividido pelo faturamento médio mensal do período. Mede quanto do ritmo mensal de venda está parado em estoque. Menor é uma operação mais enxuta e com menos capital imobilizado; valores muito baixos podem indicar risco de ruptura.',
    direcao: 'menor',
    unidade: 'pct',
    calcular: (ag, cat) => dividir(valorDe(ag, cat, 10102), mediaMensalDe(ag, cat, 1000)),
    base: (ag, cat) => mediaMensalDe(ag, cat, 1000),
  },
  {
    id: 'dio',
    nome: 'DIO — dias de estoque',
    descricao:
      'Days Inventory Outstanding: estoque no fim do período ÷ (matéria-prima média mensal ÷ 30). Estima quantos dias de consumo o estoque cobre, avaliado ao custo: 45 dias é um mês e meio de matéria-prima parada. Menor é giro mais rápido; compare com lojas de perfil semelhante.',
    direcao: 'menor',
    unidade: 'dias',
    calcular: (ag, cat) => {
      const consumoDiario = mediaMensalDe(ag, cat, 2000) / 30
      return dividir(valorDe(ag, cat, 10102), consumoDiario)
    },
    base: (ag, cat) => mediaMensalDe(ag, cat, 2000) / 30,
  },
]
