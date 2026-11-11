import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react'
import { Skeleton, Tooltip } from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'
import { entrada } from '../../hooks/use-entrada'
import { fmtPontos, fmtVariacao } from '../../formato'
import { Sparkline } from './Sparkline'

// Cartão de indicador: rótulo, código da conta, número, variação e a série que
// levou até ele. Adaptado do Dashboard de RH.
//
// ── TRÊS LINHAS, E NÃO QUATRO ───────────────────────────────────────────────
//
// O código da conta subiu para a linha do rótulo e a variação foi para o lado do
// número: o cartão passou de ~104 px para ~74 px, e a Visão geral abre mostrando
// o primeiro gráfico (pedido do João, 21/09/2026). Os dez indicadores que
// ocupavam duas fileiras destes cartões viraram a `FaixaDeIndicadores`.
//
// ── A COR DA VARIAÇÃO DEPENDE DO INDICADOR ──────────────────────────────────
//
// Faturamento subindo é bom; despesa subindo é ruim. O cartão recebe a direção
// do bom e pinta a partir dela. A cor NUNCA vai sozinha: vem com seta e com o
// texto do que se compara, porque cor de estado sem rótulo é inacessível para
// quem não a distingue.
//
// ── PERCENTUAL VARIA EM PONTOS ──────────────────────────────────────────────
//
// Rentabilidade de 22,9% para 24,2% é "+1,30 p.p.", não "+5,7%". Os cartões em
// reais variam em percentual; os de percentual, em pontos — `variacao` diz qual.
//
// ── FIGURAS PROPORCIONAIS NO NÚMERO GRANDE ──────────────────────────────────
//
// `tabular-nums` dá a todo dígito a largura do zero, o que serve a coluna de
// tabela e atrapalha número grande. Aqui as figuras são as proporcionais.

interface Props {
  rotulo: string
  valor: string
  /** "Conta 10101" — a origem, no rodapé. */
  codigo?: string
  /** A variação: fração (relativa) ou diferença de fração (pontos). */
  variacao?: number | null
  tipoVariacao?: 'relativa' | 'pontos'
  melhorQuando?: 'maior' | 'menor'
  /** "vs. mês anterior" / "vs. período anterior". */
  rotuloVariacao: string
  /** Por que não há variação, quando não há — vai na dica do traço. */
  semVariacao?: string
  /** Série para o sparkline. */
  serie?: Array<number | null>
  carregandoSerie?: boolean
  /** A conta do cartão, em uma ou duas frases. */
  ajuda?: string
  /** Posição na cascata de entrada da Visão geral, em ms. */
  atraso?: number
  className?: string
}

function Variacao({
  variacao,
  tipo,
  melhorQuando,
  rotulo,
}: {
  variacao: number
  tipo: 'relativa' | 'pontos'
  melhorQuando: 'maior' | 'menor'
  rotulo: string
}) {
  // O limite do "parado" é o da casa exibida: 0,05% na relativa, 0,005 p.p. nos
  // pontos. Abaixo disso a seta seria verde ou vermelha para um "+0,0%".
  const limite = tipo === 'pontos' ? 0.00005 : 0.0005
  const subiu = variacao > limite
  const desceu = variacao < -limite
  const bom = subiu ? melhorQuando === 'maior' : desceu ? melhorQuando === 'menor' : null
  const Icone = subiu ? ArrowUpRight : desceu ? ArrowDownRight : ArrowRight
  return (
    <span
      className={cn(
        'flex min-w-0 flex-wrap items-center gap-x-1 text-xs font-medium',
        bom === null && 'text-muted-foreground',
        bom === true && 'text-success',
        bom === false && 'text-destructive'
      )}
    >
      <span className="flex items-center gap-0.5 whitespace-nowrap">
        <Icone className="h-3.5 w-3.5" aria-hidden />
        {tipo === 'pontos' ? fmtPontos(variacao) : fmtVariacao(variacao)}
      </span>
      <span className="font-normal text-muted-foreground">{rotulo}</span>
    </span>
  )
}

export function CartaoKpi({
  rotulo,
  valor,
  codigo,
  variacao,
  tipoVariacao = 'relativa',
  melhorQuando = 'maior',
  rotuloVariacao,
  semVariacao,
  serie,
  carregandoSerie = false,
  ajuda,
  atraso,
  className,
}: Props) {
  const conteudo = (
    <div
      {...(atraso != null ? entrada(atraso) : {})}
      className={cn(
        // `@container` para o sparkline reagir à largura DO CARTÃO; `min-w-0`
        // para o cartão poder encolher abaixo do próprio conteúdo em vez de
        // empurrá-lo para fora da coluna da grade.
        '@container flex h-full min-w-0 flex-col gap-1 rounded-lg border border-border bg-surface p-2.5 text-left',
        ajuda && 'cursor-help',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-baseline gap-1.5">
          <span className="min-w-0 truncate text-xs leading-tight text-muted-foreground">
            {rotulo}
          </span>
          {/* O código da conta é o que CEDE num cartão estreito, e não o nome:
              a 1024 px os quatro cartões têm ~235 px, e o código de largura fixa
              deixava "Faturamento to…" e "Despes…" (29/09/2026). Abaixo de 17rem
              de cartão ele sai; a dica do cartão continua dizendo a conta. */}
          {codigo && (
            <span className="hidden shrink-0 text-[10px] uppercase tracking-wide text-muted-foreground/80 @[17rem]:inline">
              {codigo}
            </span>
          )}
        </span>
        {/* O risquinho tem 64px que não encolhem. Num cartão estreito ele vazava
            por cima do vizinho (defeito visto no RH em 16/09/2026): abaixo de
            9rem de CARTÃO ele sai; o número e a variação ficam. */}
        {carregandoSerie ? (
          <Skeleton className="hidden h-6 w-16 shrink-0 rounded @[9rem]:block" />
        ) : (
          serie &&
          serie.filter((v) => v != null).length > 1 && (
            <div className="hidden h-6 w-16 shrink-0 @[9rem]:block">
              <Sparkline valores={serie} />
            </div>
          )
        )}
      </div>
      {/* O número e a variação na MESMA linha, quebrando quando não couberem: é
          a linha que o cartão economizou. `items-baseline` alinha o texto da
          variação pela base do número, e não pelo meio da caixa dele. */}
      <div className="flex min-w-0 flex-wrap items-baseline gap-x-2">
        <span className="truncate text-2xl font-semibold leading-tight text-foreground">
          {valor}
        </span>
        {variacao != null && Number.isFinite(variacao) ? (
          <Variacao
            variacao={variacao}
            tipo={tipoVariacao}
            melhorQuando={melhorQuando}
            rotulo={rotuloVariacao}
          />
        ) : (
          <span className="text-xs text-muted-foreground">
            — {semVariacao ? semVariacao : rotuloVariacao}
          </span>
        )}
      </div>
    </div>
  )

  return ajuda ? (
    <Tooltip content={<span className="block max-w-[18rem] text-left">{ajuda}</span>}>
      {conteudo}
    </Tooltip>
  ) : (
    conteudo
  )
}
