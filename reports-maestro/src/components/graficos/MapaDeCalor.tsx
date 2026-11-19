import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { cn } from '@gia-cb/ui/cn'
import { larguraDoTexto } from '../../graficos'
import { useAnimarMarcas } from '../../hooks/use-entrada'
import { useTamanho } from '../../hooks/use-tamanho'
import { DicaGrafico, LinhaDica } from './DicaGrafico'

// Mapa de calor: dia (linhas — da semana ou cada data do período) × hora do
// pedido (colunas).
//
// ── VERDE, AMARELO E VERMELHO ───────────────────────────────────────────────
//
// Devolutiva da 0.3.1 (16/11/2026): o mapa usa as cores de semáforo — verde,
// amarelo e vermelho — no lugar do azul do claro ao escuro. A régua é RELATIVA
// à pesquisa: o intervalo entre o menor e o maior valor do mapa é dividido em
// três partes iguais; o terço de baixo fica verde (menos tempo, menos pedidos),
// o do meio amarelo e o de cima vermelho. Em Pedidos a régua INVERTE
// (`maiorEhMelhor`, pedido do usuário em 16/11/2026): mais pedidos é bom para a
// loja, então o pico fica verde e o horário fraco, vermelho. As cores são os tokens `success`,
// `warning` e `destructive` do tema, misturados com a superfície para a célula
// não gritar; a legenda mostra o intervalo de cada cor. Mapa com um valor só
// (menor = maior) fica todo amarelo: não há o que comparar.
//
// Célula com poucos pedidos não pinta tempo: uma média de dois pedidos pinta
// "pior hora da semana" por acaso. Ela fica neutra, e a legenda diz por quê.
//
// ── O NÚMERO NA CÉLULA, DISCRETO ────────────────────────────────────────────
//
// Pedido do usuário em 05/11/2026 (proposta A, entre cinco de desenho): o valor escrito dentro da célula,
// para ler sem passar o mouse — no toque não há hover. E DISCRETO: fonte pequena,
// sem negrito, com transparência; a cor continua sendo a leitura principal e o
// número é o detalhe para quem chega perto. Sobre as faixas fortes ele é claro,
// sobre as fracas é a cor do texto — nos dois temas. Célula estreita demais (o
// celular com muitas horas) fica sem número; a dica e a tabela continuam.
//
// ── A PIOR HORA E A CÉLULA SEM MEDIDA ───────────────────────────────────────
//
// Com `destacarMaior`, a célula de maior valor ganha um contorno: é a hora a
// investigar. E a célula com poucos pedidos é LISTRADA, não lisa: cinza liso se
// confundia com "tempo baixo" na faixa mais fraca.

export interface CelulaDoMapaDeCalor {
  /** O que pinta a célula; `null` = poucos pedidos para medir. */
  valor: number | null
  pedidos: number
  /** Linhas extras da dica. */
  detalhes?: Array<{ rotulo: string; valor: string }>
}

interface Props {
  linhas: ReadonlyArray<{ chave: string; rotulo: string }>
  horas: number[]
  celula: (linha: string, hora: number) => CelulaDoMapaDeCalor | null
  /** Nome do que a cor mede, para a dica e a legenda ("Tempo na loja (média)"). */
  metrica: string
  formatar: (v: number | null) => string
  /** Texto da célula neutra na legenda e na dica. */
  rotuloPoucos: string
  /** O número escrito dentro da célula; sem ele, a célula fica só com a cor. */
  formatarNaCelula?: (v: number) => string
  /** Contorna a célula de maior valor (a pior hora, quando a métrica é tempo). */
  destacarMaior?: boolean
  /** Inverte o semáforo: o maior valor fica verde e o menor, vermelho (Pedidos). */
  maiorEhMelhor?: boolean
}

/** Quanto tempo o dedo fica parado na célula para abrir a dica (celular). */
const TEMPO_TOQUE_LONGO = 450
/** Quanto o dedo pode mexer, em px, sem desistir do toque longo. */
const TOLERANCIA_TOQUE = 10

/** Do menor para o maior valor: verde, amarelo, vermelho (tokens do tema). */
const FAIXAS = [
  { nome: 'Verde', token: 'success' },
  { nome: 'Amarelo', token: 'warning' },
  { nome: 'Vermelho', token: 'destructive' },
] as const
/** Quanto da cor do tema entra na célula (o resto é a superfície). */
const INTENSIDADE = 90
/** Abaixo desta largura a célula não cabe número. */
const LARGURA_MIN_NUMERO = 24
/** As listras da célula sem medida, para a legenda (a mesma do padrão SVG). */
const LISTRAS =
  'repeating-linear-gradient(135deg, var(--color-muted) 0 3px, var(--color-border) 3px 6px)'
const ALTURA_EIXO = 18

function corDaFaixa(i: number): string {
  return `color-mix(in oklab, var(--color-${FAIXAS[i].token}) ${INTENSIDADE}%, var(--color-surface))`
}

/** O número escrito na célula, na cor de texto própria de cada fundo. */
const TEXTO_DA_FAIXA = [
  'fill-success-foreground',
  'fill-warning-foreground',
  'fill-destructive-foreground',
] as const

export function MapaDeCalor({
  linhas,
  horas,
  celula,
  metrica,
  formatar,
  rotuloPoucos,
  formatarNaCelula,
  destacarMaior,
  maiorEhMelhor,
}: Props) {
  const { ref, largura } = useTamanho<HTMLDivElement>()
  // As células CRESCEM do centro, em onda da esquerda para a direita (uma coluna
  // de hora por vez), ao aparecer e a cada troca de leitura, métrica ou pesquisa.
  // A chave junta o que muda o mapa; `celula` é recriada a cada render e não serve.
  const chaveDaAnimacao = useMemo(() => [linhas, horas, metrica], [linhas, horas, metrica])
  useAnimarMarcas(ref, largura > 0, chaveDaAnimacao)
  const idListras = `listras-${useId().replace(/:/g, '')}`
  const [dica, setDica] = useState<{
    linha: string
    hora: number
    x: number
    y: number
    /** Aberta por toque longo: só fecha no próximo toque ou na rolagem. */
    porToque?: boolean
  } | null>(null)

  // ── NO CELULAR: TOCAR E SEGURAR ──────────────────────────────────────────
  //
  // No toque não há hover, e um toque simples num mapa que ocupa a tela inteira
  // é quase sempre o começo de uma rolagem. Por isso a dica abre com o dedo
  // PARADO sobre a célula por `TEMPO_TOQUE_LONGO` (pedido do usuário em
  // 05/11/2026). Mexer o dedo mais que `TOLERANCIA_TOQUE` — ou o navegador
  // assumir a rolagem (`pointercancel`) — desiste. A dica fica aberta depois de
  // soltar, para o dedo não cobrir o número, e fecha no próximo toque ou rolagem.
  // O menu do toque longo do navegador (copiar, salvar imagem) fica desligado.
  const toque = useRef<{ timer: number; x: number; y: number } | null>(null)
  const cancelarToque = () => {
    if (toque.current) window.clearTimeout(toque.current.timer)
    toque.current = null
  }
  useEffect(() => cancelarToque, [])
  useEffect(() => {
    if (!dica?.porToque) return
    const fechar = () => setDica(null)
    // Fecha no PRÓXIMO toque: o que abriu a dica já terminou.
    window.addEventListener('pointerdown', fechar, { capture: true })
    window.addEventListener('scroll', fechar, { capture: true, passive: true })
    return () => {
      window.removeEventListener('pointerdown', fechar, { capture: true })
      window.removeEventListener('scroll', fechar, { capture: true })
    }
  }, [dica?.porToque])
  // A coluna dos rótulos tem a largura do maior ("Seg" ou "Seg 06/10").
  const larguraRotulo = Math.ceil(Math.max(0, ...linhas.map((l) => larguraDoTexto(l.rotulo)))) + 10

  const valores: number[] = []
  let temSemMedida = false
  let pior: { linha: string; hora: number; valor: number } | null = null
  for (const l of linhas)
    for (const h of horas) {
      const c = celula(l.chave, h)
      const v = c?.valor
      if (v == null) {
        if (c) temSemMedida = true
        continue
      }
      valores.push(v)
      if (!pior || v > pior.valor) pior = { linha: l.chave, hora: h, valor: v }
    }
  const min = valores.length ? Math.min(...valores) : 0
  const max = valores.length ? Math.max(...valores) : 0
  /** Terço do valor (0 = de baixo, 2 = de cima) → índice da cor em `FAIXAS`. */
  const corDoTerco = (t: number) => (maiorEhMelhor ? FAIXAS.length - 1 - t : t)
  const faixaDe = (v: number) =>
    max === min
      ? 1
      : corDoTerco(
          Math.min(FAIXAS.length - 1, Math.floor(((v - min) / (max - min)) * FAIXAS.length))
        )
  // Onde cada cor começa e termina, para a legenda.
  const corte1 = min + (max - min) / 3
  const corte2 = min + ((max - min) * 2) / 3
  const intervalos =
    max === min
      ? [null, `${formatar(min)}`, null]
      : [
          `${formatar(min)} a ${formatar(corte1)}`,
          `${formatar(corte1)} a ${formatar(corte2)}`,
          `${formatar(corte2)} a ${formatar(max)}`,
        ]

  const larguraCelula = horas.length ? Math.max((largura - larguraRotulo) / horas.length, 1) : 0
  const alturaCelula = largura < 480 ? 24 : 28
  const altura = linhas.length * alturaCelula + ALTURA_EIXO
  // Rótulo de hora de N em N, para não se atropelarem no celular.
  const passo = Math.max(1, Math.ceil(26 / Math.max(larguraCelula, 1)))

  const apontada = dica ? celula(dica.linha, dica.hora) : null
  const rotuloDaLinha = (chave: string) => linhas.find((l) => l.chave === chave)?.rotulo ?? ''

  return (
    <div className="flex flex-col gap-2">
      <div ref={ref} className="relative">
        {largura > 0 && horas.length > 0 && (
          <svg
            width={largura}
            height={altura}
            role="img"
            aria-label={`${metrica} por dia e hora do pedido, das ${horas[0]}h às ${horas[horas.length - 1]}h`}
            className="block select-none [-webkit-touch-callout:none]"
            onPointerLeave={(ev) => {
              if (ev.pointerType === 'mouse') setDica(null)
            }}
            onPointerMove={(ev) => {
              const t = toque.current
              if (t && Math.hypot(ev.clientX - t.x, ev.clientY - t.y) > TOLERANCIA_TOQUE) {
                cancelarToque()
              }
            }}
            onPointerUp={cancelarToque}
            onPointerCancel={cancelarToque}
            onContextMenu={(ev) => ev.preventDefault()}
          >
            <defs>
              <pattern
                id={idListras}
                width={6}
                height={6}
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(45)"
              >
                <rect width={6} height={6} fill="var(--color-muted)" />
                <rect width={3} height={6} fill="var(--color-border)" />
              </pattern>
            </defs>
            {linhas.map((l, i) => (
              <g key={l.chave}>
                <text
                  x={0}
                  y={i * alturaCelula + alturaCelula / 2}
                  dominantBaseline="middle"
                  className="fill-muted-foreground text-[11px]"
                >
                  {l.rotulo}
                </text>
                {horas.map((h, j) => {
                  const c = celula(l.chave, h)
                  const x = larguraRotulo + j * larguraCelula
                  const y = i * alturaCelula
                  const emFoco = dica?.linha === l.chave && dica.hora === h
                  const faixa = c?.valor != null ? faixaDe(c.valor) : null
                  const fill = !c
                    ? 'transparent'
                    : faixa == null
                      ? `url(#${idListras})`
                      : corDaFaixa(faixa)
                  const ehPior = destacarMaior && pior?.linha === l.chave && pior.hora === h
                  const comNumero =
                    formatarNaCelula != null &&
                    c?.valor != null &&
                    larguraCelula >= LARGURA_MIN_NUMERO
                  return (
                    <g key={h}>
                      <rect
                        data-marca="ponto"
                        data-ordem={j}
                        // 2 px de vão entre as células: a superfície separa, sem borda.
                        x={x + 1}
                        y={y + 1}
                        width={Math.max(larguraCelula - 2, 1)}
                        height={alturaCelula - 2}
                        rx={3}
                        fill={fill}
                        stroke={emFoco || ehPior ? 'var(--color-foreground)' : 'none'}
                        strokeWidth={ehPior ? 2 : 1.5}
                        onPointerMove={(ev) => {
                          if (ev.pointerType === 'touch') return
                          const caixa = ref.current?.getBoundingClientRect()
                          if (!caixa) return
                          setDica({
                            linha: l.chave,
                            hora: h,
                            x: ev.clientX - caixa.left,
                            y: ev.clientY - caixa.top,
                          })
                        }}
                        onPointerDown={(ev) => {
                          if (ev.pointerType !== 'touch') return
                          cancelarToque()
                          const { clientX, clientY } = ev
                          toque.current = {
                            x: clientX,
                            y: clientY,
                            timer: window.setTimeout(() => {
                              toque.current = null
                              const caixa = ref.current?.getBoundingClientRect()
                              if (!caixa) return
                              navigator.vibrate?.(10)
                              setDica({
                                linha: l.chave,
                                hora: h,
                                x: clientX - caixa.left,
                                y: clientY - caixa.top,
                                porToque: true,
                              })
                            }, TEMPO_TOQUE_LONGO),
                          }
                        }}
                      />
                      {comNumero && (
                        <text
                          x={x + larguraCelula / 2}
                          y={y + alturaCelula / 2}
                          textAnchor="middle"
                          dominantBaseline="central"
                          pointerEvents="none"
                          data-marca="aparecer"
                          className={cn(
                            'text-[10px] tabular-nums opacity-80',
                            faixa != null ? TEXTO_DA_FAIXA[faixa] : 'fill-foreground'
                          )}
                        >
                          {formatarNaCelula(c.valor as number)}
                        </text>
                      )}
                    </g>
                  )
                })}
              </g>
            ))}
            {horas.map((h, j) =>
              j % passo === 0 ? (
                <text
                  key={h}
                  x={larguraRotulo + j * larguraCelula + larguraCelula / 2}
                  y={altura - 4}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[10px] tabular-nums"
                >
                  {h}h
                </text>
              ) : null
            )}
          </svg>
        )}
        {dica && (
          <DicaGrafico x={dica.x} y={dica.y} larguraContainer={largura}>
            <p className="mb-1 font-medium text-foreground">
              {rotuloDaLinha(dica.linha)}, {dica.hora}h
            </p>
            {!apontada ? (
              <p className="text-muted-foreground">Nenhum pedido neste horário.</p>
            ) : (
              <>
                <LinhaDica
                  rotulo={metrica}
                  valor={apontada.valor == null ? rotuloPoucos : formatar(apontada.valor)}
                />
                <LinhaDica rotulo="Pedidos" valor={apontada.pedidos.toLocaleString('pt-BR')} />
                {apontada.detalhes?.map((d) => (
                  <LinhaDica key={d.rotulo} rotulo={d.rotulo} valor={d.valor} />
                ))}
              </>
            )}
          </DicaGrafico>
        )}
      </div>
      {/* Legenda: cada cor com o intervalo de valores que ela pinta. */}
      {valores.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {/* Do menor para o maior valor; a cor de cada terço segue `maiorEhMelhor`. */}
          {intervalos.map((intervalo, t) => {
            if (intervalo == null) return null
            const i = max === min ? 1 : corDoTerco(t)
            return (
              <span key={t} className="flex items-center gap-1.5">
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 rounded-sm"
                  style={{ background: corDaFaixa(i) }}
                />
                <span className="tabular-nums">
                  <span className="sr-only">{FAIXAS[i].nome}: </span>
                  {intervalo}
                </span>
              </span>
            )
          })}
          {/* Só quando há célula listrada (em Pedidos, nunca há). */}
          {temSemMedida && (
            <span className="flex items-center gap-1.5">
              <span
                aria-hidden
                className="h-2.5 w-2.5 rounded-sm"
                style={{ background: LISTRAS }}
              />
              {rotuloPoucos}
            </span>
          )}
          {destacarMaior && pior && (
            <span className="flex items-center gap-1.5">
              <span aria-hidden className="h-2.5 w-2.5 rounded-sm border-2 border-foreground" />
              Pior horário: {linhas.find((l) => l.chave === pior.linha)?.rotulo}, {pior.hora}h (
              {formatar(pior.valor)})
            </span>
          )}
        </div>
      )}
    </div>
  )
}
