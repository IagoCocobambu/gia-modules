import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { cn } from '@gia-cb/ui/cn'
import { larguraDoTexto } from '../../graficos'
import { useAnimarMarcas } from '../../hooks/use-entrada'
import { useTamanho } from '../../hooks/use-tamanho'
import { DicaGrafico, LinhaDica } from './DicaGrafico'

// Mapa de calor: dia (linhas — da semana ou cada data do período) × hora do
// pedido (colunas).
//
// ── UMA COR SÓ, DO CLARO AO ESCURO ──────────────────────────────────────────
//
// Magnitude é escala SEQUENCIAL: um matiz, cinco faixas de intensidade. Cada
// faixa é a cor do tema misturada com a SUPERFÍCIE (`color-mix`), então no tema
// escuro a escala inverte sozinha — a célula fraca some no fundo escuro e a
// forte acende — sem uma segunda paleta para manter.
//
// Célula com poucos pedidos não pinta tempo: uma média de dois pedidos pinta
// "pior hora da semana" por acaso. Ela fica neutra, e a legenda diz por quê.
//
// ── O NÚMERO NA CÉLULA, DISCRETO ────────────────────────────────────────────
//
// Pedido do usuário em 05/11/2026 (proposta A em
// docs/artefatos/mapa-de-calor-propostas.html): o valor escrito dentro da célula,
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
}

/** Quanto tempo o dedo fica parado na célula para abrir a dica (celular). */
const TEMPO_TOQUE_LONGO = 450
/** Quanto o dedo pode mexer, em px, sem desistir do toque longo. */
const TOLERANCIA_TOQUE = 10

const FAIXAS = [16, 34, 52, 72, 92] as const
/** Da faixa 3 em diante o fundo é forte: o número vai claro. */
const FAIXA_FORTE = 3
/** Abaixo desta largura a célula não cabe número. */
const LARGURA_MIN_NUMERO = 24
/** As listras da célula sem medida, para a legenda (a mesma do padrão SVG). */
const LISTRAS =
  'repeating-linear-gradient(135deg, var(--color-muted) 0 3px, var(--color-border) 3px 6px)'
const ALTURA_EIXO = 18

function corDaFaixa(i: number): string {
  return `color-mix(in oklab, var(--color-primary) ${FAIXAS[i]}%, var(--color-surface))`
}

export function MapaDeCalor({
  linhas,
  horas,
  celula,
  metrica,
  formatar,
  rotuloPoucos,
  formatarNaCelula,
  destacarMaior,
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
  let pior: { linha: string; hora: number; valor: number } | null = null
  for (const l of linhas)
    for (const h of horas) {
      const v = celula(l.chave, h)?.valor
      if (v == null) continue
      valores.push(v)
      if (!pior || v > pior.valor) pior = { linha: l.chave, hora: h, valor: v }
    }
  const min = valores.length ? Math.min(...valores) : 0
  const max = valores.length ? Math.max(...valores) : 0
  const faixaDe = (v: number) =>
    max === min
      ? FAIXAS.length - 1
      : Math.min(FAIXAS.length - 1, Math.floor(((v - min) / (max - min)) * FAIXAS.length))

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
                            'text-[10px] tabular-nums',
                            faixa != null && faixa >= FAIXA_FORTE
                              ? 'fill-primary-foreground opacity-70'
                              : 'fill-foreground opacity-50'
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
      {/* Legenda da escala: as cinco faixas, do menor ao maior valor. */}
      {valores.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="tabular-nums">{formatar(min)}</span>
            <span className="flex" aria-hidden>
              {FAIXAS.map((_, i) => (
                <span
                  key={i}
                  className="h-2.5 w-5 first:rounded-l-sm last:rounded-r-sm"
                  style={{ background: corDaFaixa(i) }}
                />
              ))}
            </span>
            <span className="tabular-nums">{formatar(max)}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="h-2.5 w-2.5 rounded-sm" style={{ background: LISTRAS }} />
            {rotuloPoucos}
          </span>
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
