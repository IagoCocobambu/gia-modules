import { useRef } from 'react'
import { COR } from '../../graficos'
import { useAnimarMarcas } from '../../hooks/use-entrada'
import { NumeroAnimado } from './NumeroAnimado'
import type { EstatisticasDaEtapa } from '../../operacional'

// O tempo de cada etapa do pedido, um cartão por etapa.
//
// Substitui as barras numa régua única (escolha do usuário em 04/11/2026, entre
// cinco propostas em docs/artefatos/tempo-por-etapa-propostas.html). Na régua
// única o aceite (0,3 min) e o preparo (15 min) dividiam o mesmo eixo, e as
// etapas curtas viravam um risco. No cartão cada etapa tem a SUA régua, e o
// número que importa — a média — vem grande, como nos cartões de indicador
// (pedido do usuário em 04/11/2026).
//
// ── A BARRA: SEGMENTOS NUM TRILHO ───────────────────────────────────────────
//
// No formato da barra de uso de contexto do Claude Desktop (pedido do usuário):
// uma barra fina de pedaços coloridos, separados por uma fresta igual.
// Cada valor fecha um segmento, na cor dele, em ordem crescente:
//
//   [0 → mínimo]  [mínimo → mediana]  [mediana → média]  [média → máximo]
//
// Se a mediana passa da média (raro), a ordem dos dois segmentos se inverte —
// o segmento é sempre do valor anterior até o seguinte. Todo segmento tem uma
// largura mínima, para nenhum valor sumir quando dois são quase iguais. O
// último pedaço é o caminho até o máximo. As cores seguem a PALETA de
// `graficos.ts` (primárias primeiro).
//
// ── O TRILHO NÃO VAI ATÉ O MÁXIMO ───────────────────────────────────────────
//
// O máximo é quase sempre um pedido esquecido — na loja 01 em outubro, um preparo
// de 13 h contra uma mediana de 19 min. Com o trilho até ele, os segmentos viravam
// um ponto. O trilho vai até 3× a maior entre média e mediana da etapa; o máximo
// que passa disso fica no fim do trilho, e o número dele está escrito no cartão.

interface Props {
  etapas: EstatisticasDaEtapa[]
  formatar: (v: number | null) => string
}

/** O trilho de cada cartão vai até este múltiplo da maior entre média e mediana. */
const FOLGA_DA_REGUA = 3

export function CartoesEtapas({ etapas, formatar }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  useAnimarMarcas(ref, true, etapas)

  return (
    <div ref={ref} className="flex flex-col gap-3">
      <ul className="grid grid-cols-[repeat(auto-fit,minmax(11rem,1fr))] gap-3">
        {etapas.map((e) => (
          <CartaoEtapa key={e.chave} etapa={e} formatar={formatar} />
        ))}
      </ul>
      <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <li className="flex items-center gap-1.5">
          <Quadrado cor={COR.extremos} />
          Mínimo
        </li>
        <li className="flex items-center gap-1.5">
          <Quadrado cor={COR.mediana} />
          Mediana (metade dos pedidos leva menos)
        </li>
        <li className="flex items-center gap-1.5">
          <Quadrado cor={COR.media} />
          Média
        </li>
        <li className="flex items-center gap-1.5">
          <Quadrado cor={COR.maximo} />
          Até o máximo
        </li>
      </ul>
    </div>
  )
}

function Quadrado({ cor }: { cor: string }) {
  return (
    <span aria-hidden className="size-2.5 shrink-0 rounded-[3px]" style={{ background: cor }} />
  )
}

function CartaoEtapa({
  etapa: e,
  formatar,
}: {
  etapa: EstatisticasDaEtapa
  formatar: (v: number | null) => string
}) {
  const centro = Math.max(e.media ?? 0, e.mediana ?? 0)
  const teto = Math.max(Math.min(e.maximo ?? 0, centro * FOLGA_DA_REGUA), Number.EPSILON)
  /** Fração do trilho, presa entre 0 e 1. */
  const fracao = (v: number) => Math.min(Math.max(v / teto, 0), 1)

  const pontos = [
    { chave: 'minimo', valor: e.minimo, cor: COR.extremos },
    { chave: 'mediana', valor: e.mediana, cor: COR.mediana },
    { chave: 'media', valor: e.media, cor: COR.media },
  ]
    .filter((p): p is typeof p & { valor: number } => p.valor != null)
    .sort((a, b) => a.valor - b.valor)
  const segmentos = pontos.map((p, i) => ({
    chave: p.chave,
    cor: p.cor,
    de: i === 0 ? 0 : fracao(pontos[i - 1].valor),
    ate: fracao(p.valor),
  }))
  /** O trilho que sobra depois do último segmento: o caminho até o máximo. */
  const resto = 1 - (segmentos.at(-1)?.ate ?? 0)

  return (
    <li
      aria-label={`${e.rotulo}: média ${formatar(e.media)}, mediana ${formatar(e.mediana)}, mínimo ${formatar(e.minimo)}, máximo ${formatar(e.maximo)}, em ${e.pedidos.toLocaleString('pt-BR')} pedidos`}
      className="flex min-w-0 flex-col gap-2.5 rounded-lg border border-border bg-surface p-3"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">{e.rotulo}</p>
        <p className="truncate text-xs text-muted-foreground">{e.descricao}</p>
      </div>

      <div className="min-w-0">
        <p className="truncate text-2xl font-semibold leading-tight text-foreground">
          <NumeroAnimado valor={e.media} formatar={formatar} />
        </p>
        <p className="text-xs leading-snug text-muted-foreground">média</p>
      </div>

      {/* Os pedaços lado a lado, numa linha flex: a
          fresta (gap) é a mesma entre todos os pedaços, e o conjunto ocupa
          exatamente a largura do cartão, alinhado com o texto. Cada pedaço cresce
          na proporção do trecho que representa e tem largura mínima, para nenhum
          valor sumir.

          A barra inteira é um bloco só (`revelar`): a cada mudança dos dados
          (canal, período, loja) ela se enche da esquerda para a direita. */}
      <div
        aria-hidden
        data-marca="revelar"
        className="flex h-1.5 w-full gap-0.5 overflow-hidden rounded-full"
      >
        {segmentos.map((s) => (
          <span
            key={s.chave}
            className="h-full min-w-[3px] rounded-[1px]"
            style={{ flex: `${s.ate - s.de} 1 0`, background: s.cor }}
          />
        ))}
        {resto > 0 && (
          <span
            className="h-full min-w-[3px] rounded-[1px]"
            style={{ flex: `${resto} 1 0`, background: COR.maximo }}
          />
        )}
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-xs">
        <dt className="text-muted-foreground">Mediana</dt>
        <dd className="text-right tabular-nums text-foreground">
          <NumeroAnimado valor={e.mediana} formatar={formatar} />
        </dd>
        <dt className="text-muted-foreground">Mínimo</dt>
        <dd className="text-right tabular-nums text-foreground">
          <NumeroAnimado valor={e.minimo} formatar={formatar} />
        </dd>
        <dt className="text-muted-foreground">Máximo</dt>
        <dd className="text-right tabular-nums text-foreground">
          <NumeroAnimado valor={e.maximo} formatar={formatar} />
        </dd>
      </dl>
    </li>
  )
}
