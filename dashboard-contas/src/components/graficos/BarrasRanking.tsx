import { useMemo, useState } from 'react'
import {
  COR,
  barraArredondada,
  encurtarRotulo,
  escala,
  faixasDaBarra,
  larguraDoTexto,
} from '../../graficos'
import { useTamanho } from '../../hooks/use-tamanho'
import { useAnimarMarcas } from '../../hooks/use-entrada'
import { DicaGrafico, LinhaDica } from './DicaGrafico'
import { PaginacaoGrafico } from './PaginacaoGrafico'
import { useLinhasQueCabem, usePorPagina } from './contexto-grafico'
import { paginar } from './paginar'

// Ranking em barras deitadas — de lojas ou de regiões num indicador.
//
// Porte do `BarrasRanking` do Dashboard de RH, com uma diferença: aqui há valor
// NEGATIVO (lucro de loja no prejuízo, rentabilidade abaixo de zero). A barra
// cresce da LINHA DO ZERO — para a direita se positiva, para a esquerda se
// negativa, em vermelho —, e o eixo inteiro se ajusta para caber os dois lados.
//
// ── UMA COR SÓ, DE PROPÓSITO ────────────────────────────────────────────────
//
// Loja é categoria NOMINAL. Colorir as barras por valor gastaria o canal de
// identidade repetindo o que o comprimento já diz. A cor entra só como ÊNFASE (a
// barra apontada) e como SINAL (abaixo de zero).
//
// ── A RÉGUA DE REFERÊNCIA É O QUE TORNA O RANKING ANALÍTICO ─────────────────
//
// "Recife tem 18%" não diz nada sozinho; "Recife tem 18% e a seleção tem 16,5%"
// diz. A régua vertical marca o valor do consolidado.
//
// ── PAGINADO, SEM ROLAGEM POR DENTRO ────────────────────────────────────────
//
// A Visão geral já rola como página; rolagem dentro dela prendia o dedo no
// cartão (decisão do João no RH, 15/09/2026). A escala vale para a lista
// INTEIRA, para a barra de uma página valer o mesmo que a de outra.
//
// ── O NOME NÃO É CORTADO À TOA ──────────────────────────────────────────────
//
// A coluna do nome tinha 132 px fixos. Em tela cheia, com 1.300 px de cartão,
// "69.CB SÃO JOSÉ DOS CAMPOS" continuava saindo "69.CB SÃO JOSÉ DOS C…", e no
// "Onde está o dinheiro" as contas viravam "4.12 DESPESAS INDIRET…" (visto em
// 29/09/2026). Agora a coluna tem a largura do MAIOR NOME da lista, entre 132 e
// 240 px — e nunca mais que um terço do cartão (`faixasDaBarra`), para a barra
// continuar sendo o desenho.
//
// No cartão ESTREITO (celular, meia tela a 1024 px), quando nem um terço basta
// para o maior nome, o nome SOBE para cima da barra e usa a largura inteira. A
// linha fica mais alta, e o nome, inteiro.

export interface ItemRanking {
  chave: string
  rotulo: string
  valor: number | null
  /** Texto pronto do valor — o gráfico não sabe a unidade do indicador. */
  valorFormatado: string
  /** Segunda linha da dica. */
  detalhe?: string
}

interface Props {
  itens: ItemRanking[]
  /** Valor do consolidado — vira a régua vertical. */
  referencia?: number | null
  referenciaFormatada?: string
  rotuloReferencia?: string
  /** O que cada barra é — vai para o leitor de tela e para a paginação. */
  substantivoPlural?: string
  porPagina?: number
  /**
   * Usa quantas barras couberem no corpo do cartão, no lugar de `porPagina`.
   * Só para cartão com altura definida de fora — ver `useLinhasQueCabem`.
   */
  preencherAltura?: boolean
}

const ALTURA_LINHA = 22
/** A linha com o nome em cima da barra: 14 px de nome, a barra e a folga. */
const ALTURA_LINHA_EMPILHADA = 34
const ALTURA_BARRA = 12
/** Onde a barra começa, dentro da linha empilhada — abaixo do nome. */
const TOPO_DA_BARRA_EMPILHADA = 16
const LARGURA_ROTULO = 132
const TETO_ROTULO = 240
/** Abaixo desta largura de cartão, o nome sobe para cima da barra. */
const LARGURA_EMPILHAR = 440
const MARGEM_DIREITA = 76
/** Faixa no topo para o rótulo da régua — rótulo não se desenha sobre dado. */
const FAIXA_REFERENCIA = 16

/** A barra negativa: base reta no zero (à direita), ponta arredondada à esquerda. */
function barraEspelhada(x: number, y: number, w: number): string {
  const r = Math.max(0, Math.min(4, w))
  if (r === 0 || w <= 0) return `M${x} ${y}h${Math.max(w, 0)}v${ALTURA_BARRA}h${-Math.max(w, 0)}Z`
  return `M${x + w} ${y}h${-(w - r)}a${r} ${r} 0 0 0 ${-r} ${r}v${ALTURA_BARRA - 2 * r}a${r} ${r} 0 0 0 ${r} ${r}h${w - r}Z`
}

export function BarrasRanking({
  itens,
  referencia,
  referenciaFormatada,
  rotuloReferencia = 'Seleção',
  substantivoPlural = 'lojas',
  porPagina = 10,
  preencherAltura = false,
}: Props) {
  const { ref, largura } = useTamanho<HTMLDivElement>()
  // `itens`, e não a página: paginar não reanima, trocar de indicador sim.
  useAnimarMarcas(ref, largura > 0, itens)
  const [dica, setDica] = useState<{ x: number; y: number; item: ItemRanking } | null>(null)
  const [destaque, setDestaque] = useState<string | null>(null)
  const [estadoPagina, setEstadoPagina] = useState({ lista: itens, pagina: 0 })

  // A coluna do nome: a do maior nome da lista, com piso e teto (ver acima).
  // Medida da lista INTEIRA, e não da página, para a coluna não mudar de
  // largura a cada página.
  const maiorNome = useMemo(
    () => Math.max(0, ...itens.map((i) => larguraDoTexto(i.rotulo))),
    [itens]
  )
  const rotuloCheio = Math.min(TETO_ROTULO, Math.max(LARGURA_ROTULO, Math.ceil(maiorNome) + 8))
  // Nome e valor encolhem com o cartão (ver `faixasDaBarra`): fixos, sobravam
  // 82 px de barra no celular.
  const { rotulo: rotuloAoLado, direita: direitaBase } = faixasDaBarra(
    largura,
    rotuloCheio,
    MARGEM_DIREITA
  )
  // Empilha só quando o nome NÃO CABE ao lado: "SPISE" e "NCO" cabem em
  // qualquer cartão, e empilhá-los só gastaria altura.
  const empilhado = largura > 0 && largura < LARGURA_EMPILHAR && maiorNome > rotuloAoLado - 6
  const alturaLinha = empilhado ? ALTURA_LINHA_EMPILHADA : ALTURA_LINHA
  const temReferencia = referencia != null && Number.isFinite(referencia)
  const topo = temReferencia ? FAIXA_REFERENCIA : 0
  // Quantas barras o corpo do cartão comporta, com a régua e a paginação já
  // descontadas. Zero antes da primeira medida: aí vale o padrão de quem chama.
  const cabem = useLinhasQueCabem(alturaLinha, topo)
  const alvo = preencherAltura && cabem > 0 ? Math.max(4, cabem) : porPagina
  // Em tela cheia, todos de uma vez: o cartão rola (ver `usePorPagina`).
  const porPaginaNaTela = usePorPagina(alvo)
  const { pagina, totalDePaginas, visiveis, de, ate } = paginar(
    itens,
    estadoPagina,
    porPaginaNaTela
  )
  // A altura é a de UMA PÁGINA CHEIA, mesmo na última página mais curta: o
  // cartão não encolhe e os botões não pulam de lugar ao paginar.
  const linhas = totalDePaginas > 1 ? alvo : Math.max(visiveis.length, 1)
  const altura = linhas * alturaLinha + topo

  const x0 = empilhado ? 0 : rotuloAoLado
  const larguraDoValor = Math.max(...itens.map((i) => i.valorFormatado.length), 1) * 6 + 10
  const direita = Math.max(direitaBase, Math.min(larguraDoValor, Math.round(largura * 0.32)))
  const x1 = Math.max(largura - direita, x0 + 40)

  const valoresOk = itens.map((i) => i.valor ?? 0)
  const minimo = Math.min(0, ...valoresOk, temReferencia ? referencia : 0)
  const maximo = Math.max(0, ...valoresOk, temReferencia ? referencia : 0, Number.EPSILON)
  const px = escala(minimo, maximo, x0, x1)
  const zero = px(0)

  const textoDaRegua = `${rotuloReferencia} ${referenciaFormatada ?? ''}`.trim()
  const reguaX = temReferencia ? px(referencia) : 0
  // A régua fica à direita da risca; sem espaço, o texto vai para o outro lado.
  const reguaCabe = !temReferencia || reguaX + 4 + textoDaRegua.length * 5.6 <= largura

  // O topo da barra dentro da linha, e os trechos em que as linhas verticais (o
  // zero e a régua) são desenhadas. Empilhado, elas passam só pela faixa das
  // barras: atravessando a linha inteira, cortariam o nome de cada loja.
  const topoDaBarra = empilhado ? TOPO_DA_BARRA_EMPILHADA : (ALTURA_LINHA - ALTURA_BARRA) / 2
  const trechosVerticais: Array<[number, number]> = empilhado
    ? visiveis.map((_, i) => {
        const y = topo + i * alturaLinha + topoDaBarra
        return [y - 2, y + ALTURA_BARRA + 2]
      })
    : [[topo, altura]]

  return (
    <div className="flex flex-col gap-2">
      <div ref={ref} className="relative">
        {largura > 0 && (
          <svg
            width={largura}
            height={altura}
            role="img"
            aria-label={`Ranking de ${itens.length} ${substantivoPlural}, ${de} a ${ate}`}
            className="block"
          >
            {minimo < 0 &&
              trechosVerticais.map(([y1, y2]) => (
                <line
                  key={`zero-${y1}`}
                  x1={zero}
                  x2={zero}
                  y1={y1}
                  y2={y2}
                  stroke={COR.recessiva}
                  strokeWidth={1}
                />
              ))}
            {temReferencia && (
              <g data-marca="aparecer">
                {trechosVerticais.map(([y1, y2]) => (
                  <line
                    key={`regua-${y1}`}
                    x1={reguaX}
                    x2={reguaX}
                    y1={y1}
                    y2={y2}
                    stroke={COR.apagada}
                    strokeWidth={1}
                    strokeDasharray="3 3"
                  />
                ))}
                <text
                  x={reguaCabe ? reguaX + 4 : reguaX - 4}
                  y={11}
                  textAnchor={reguaCabe ? 'start' : 'end'}
                  className="fill-muted-foreground text-[10px]"
                >
                  {textoDaRegua}
                </text>
              </g>
            )}

            {visiveis.map((item, i) => {
              const y = topo + i * alturaLinha
              const yBarra = y + topoDaBarra
              const emFoco = destaque === item.chave
              const v = item.valor ?? 0
              const fim = px(v)
              const inicioBarra = Math.min(zero, fim)
              const larguraBarra = Math.max(Math.abs(fim - zero), item.valor ? 2 : 0)
              const negativo = v < 0
              return (
                <g
                  key={item.chave}
                  tabIndex={0}
                  role="listitem"
                  aria-label={`${item.rotulo}: ${item.valorFormatado}`}
                  className="cursor-default outline-none focus-visible:[&>rect:first-child]:fill-muted"
                  onPointerMove={(e) => {
                    const caixa = ref.current?.getBoundingClientRect()
                    if (!caixa) return
                    setDica({ x: e.clientX - caixa.left, y: e.clientY - caixa.top, item })
                    setDestaque(item.chave)
                  }}
                  onPointerLeave={() => {
                    setDica(null)
                    setDestaque(null)
                  }}
                  onFocus={() => setDestaque(item.chave)}
                  onBlur={() => setDestaque(null)}
                >
                  {/* Alvo de ponteiro da linha inteira: a barra de 12 px é mira
                      difícil. O retângulo transparente cobre a faixa toda. */}
                  <rect
                    x={0}
                    y={y}
                    width={largura}
                    height={alturaLinha - 2}
                    className={emFoco ? 'fill-muted' : 'fill-transparent'}
                    rx={4}
                  />
                  <text
                    x={0}
                    y={empilhado ? y + 7 : y + ALTURA_LINHA / 2}
                    dominantBaseline="middle"
                    className="fill-foreground text-[11px]"
                  >
                    {encurtarRotulo(item.rotulo, empilhado ? largura : x0 - 6)}
                  </text>
                  <path
                    d={
                      negativo
                        ? // Negativa: a ponta arredondada é a da ESQUERDA. O
                          // desenho é o da positiva espelhado em torno do zero.
                          barraEspelhada(inicioBarra, yBarra, larguraBarra)
                        : barraArredondada(inicioBarra, yBarra, larguraBarra, ALTURA_BARRA, 4, true)
                    }
                    data-marca="barra"
                    data-origem={negativo ? 'right' : 'left'}
                    fill={negativo ? COR.negativa : COR.serie}
                    opacity={destaque && !emFoco ? 0.45 : 1}
                  />
                  <text
                    x={Math.max(zero, fim) + 6}
                    y={yBarra + ALTURA_BARRA / 2}
                    dominantBaseline="middle"
                    data-marca="aparecer"
                    className="fill-muted-foreground text-[11px] tabular-nums"
                  >
                    {item.valorFormatado}
                  </text>
                </g>
              )
            })}
          </svg>
        )}

        {dica && (
          <DicaGrafico x={dica.x} y={dica.y} larguraContainer={largura}>
            <p className="mb-1 font-medium text-foreground">{dica.item.rotulo}</p>
            <LinhaDica
              cor={(dica.item.valor ?? 0) < 0 ? COR.negativa : COR.serie}
              rotulo="Valor"
              valor={dica.item.valorFormatado}
            />
            {temReferencia && (
              <LinhaDica rotulo={rotuloReferencia} valor={referenciaFormatada ?? ''} />
            )}
            {dica.item.detalhe && <p className="mt-1 text-muted-foreground">{dica.item.detalhe}</p>}
          </DicaGrafico>
        )}
      </div>

      <PaginacaoGrafico
        pagina={pagina}
        totalDePaginas={totalDePaginas}
        de={de}
        ate={ate}
        total={itens.length}
        substantivoPlural={substantivoPlural}
        onPagina={(p) => {
          setDica(null)
          setEstadoPagina({ lista: itens, pagina: p })
        }}
      />
    </div>
  )
}
