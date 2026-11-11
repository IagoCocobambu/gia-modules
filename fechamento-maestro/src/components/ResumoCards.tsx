import { useState, type ComponentType, type ReactNode, type SVGProps } from 'react'
import {
  AlertTriangle,
  ChevronDown,
  CircleHelp,
  CircleX,
  CreditCard,
  Globe,
  HandCoins,
  Handshake,
  ListFilter,
  Store,
} from 'lucide-react'
import { Skeleton } from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'
import { formatBRL } from '../helpers'
import type { FiltroTotal, TotaisPeriodo } from '../types'
import { Dica } from './Dica'

/** Cor do indicador: tinge o quadradinho do ícone e o valor. */
type Tom = 'neutro' | 'success' | 'info' | 'primary' | 'warning' | 'destructive'

const TOM_ICONE: Record<Tom, string> = {
  neutro: 'bg-muted text-muted-foreground',
  success: 'bg-success/10 text-success',
  info: 'bg-info/10 text-info',
  primary: 'bg-primary/10 text-primary',
  warning: 'bg-warning/10 text-warning',
  destructive: 'bg-destructive/10 text-destructive',
}

const TOM_VALOR: Record<Tom, string> = {
  neutro: 'text-foreground',
  success: 'text-success',
  info: 'text-info',
  primary: 'text-primary',
  warning: 'text-warning',
  destructive: 'text-destructive',
}

type CampoValor = Exclude<keyof TotaisPeriodo, 'pagamentos_sem_classificacao' | 'divergentes'>

/**
 * Indicadores de valor — os do Fechamento Diário do legado, na mesma ordem: venda,
 * cancelados, descontos/sem classificação. `tom` recebe o valor: os de alerta só
 * ganham cor quando há algo a olhar.
 */
const INDICADORES: {
  campo: CampoValor
  rotulo: string
  dica: string
  icone: ComponentType<SVGProps<SVGSVGElement>>
  tom: (valor: number) => Tom
}[] = [
  {
    campo: 'online',
    rotulo: 'online',
    dica: 'Formas ONLINE (PRE PAGO), menos o incentivo que foi para Descontos parceiro',
    icone: Globe,
    tom: () => 'info',
  },
  {
    campo: 'adquirentes_online',
    rotulo: 'adquirentes online',
    dica: 'Vales ONLINE VR pagos antes, no app ou no parceiro (PRE PAGO)',
    icone: CreditCard,
    tom: () => 'primary',
  },
  {
    campo: 'adquirentes_offline',
    rotulo: 'adquirentes offline',
    dica: 'Vales ONLINE VR passados na entrega, sem PRE PAGO (ex.: VR Refeição)',
    icone: CreditCard,
    tom: () => 'primary',
  },
  {
    campo: 'offline',
    rotulo: 'offline',
    dica: 'Parte paga na entrega (dinheiro ou maquininha): formas sem PRE PAGO',
    icone: HandCoins,
    tom: () => 'warning',
  },
  {
    campo: 'cancelado_online',
    rotulo: 'cancelado online',
    dica: 'Parte online dos pedidos cancelados (fora do fechamento)',
    icone: CircleX,
    tom: (v) => (v > 0 ? 'destructive' : 'neutro'),
  },
  {
    campo: 'cancelado_adquirentes_online',
    rotulo: 'cancelado adquirentes online',
    dica: 'Parte em adquirentes online dos pedidos cancelados',
    icone: CircleX,
    tom: (v) => (v > 0 ? 'destructive' : 'neutro'),
  },
  {
    campo: 'cancelado_adquirentes_offline',
    rotulo: 'cancelado adquirentes offline',
    dica: 'Parte em adquirentes offline dos pedidos cancelados',
    icone: CircleX,
    tom: (v) => (v > 0 ? 'destructive' : 'neutro'),
  },
  {
    campo: 'cancelado_offline',
    rotulo: 'cancelado offline',
    dica: 'Parte offline dos pedidos cancelados',
    icone: CircleX,
    tom: (v) => (v > 0 ? 'destructive' : 'neutro'),
  },
  {
    campo: 'descontos_loja',
    rotulo: 'descontos loja',
    dica: 'Desconto total dos pedidos despachados ou entregues (DISPATCHED / DELIVERED)',
    icone: Store,
    tom: () => 'neutro',
  },
  {
    campo: 'descontos_parceiro',
    rotulo: 'descontos parceiro',
    dica: 'Incentivo do parceiro em pedidos (fora do 99Food) com ONLINE VR ou OFFLINE; sai do Online',
    icone: Handshake,
    tom: () => 'neutro',
  },
  {
    campo: 'nao_classificado',
    rotulo: 'sem classificação',
    dica: 'Valor em formas de pagamento sem nome (vazia ou DESCONHECIDO) — o normal é zero',
    icone: CircleHelp,
    tom: (v) => (v !== 0 ? 'warning' : 'neutro'),
  },
]

interface IndicadorProps {
  icone: ComponentType<SVGProps<SVGSVGElement>>
  tom: Tom
  valor: string | null
  rotulo: string
}

/** Ícone num quadradinho tingido + valor em negrito, com o rótulo discreto embaixo. */
function Indicador({ icone: Icone, tom, valor, rotulo }: IndicadorProps) {
  return (
    <>
      <span
        className={cn(
          'grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors duration-fast ease-default',
          TOM_ICONE[tom]
        )}
      >
        <Icone aria-hidden className="h-4 w-4" />
      </span>
      <span className="flex min-w-0 flex-col leading-tight">
        {valor === null ? (
          <Skeleton className="my-0.5 h-4 w-20" />
        ) : (
          <span className={cn('truncate text-base font-semibold tabular-nums', TOM_VALOR[tom])}>
            {valor}
          </span>
        )}
        <span className="truncate text-xs text-muted-foreground">{rotulo}</span>
      </span>
    </>
  )
}

interface ResumoCardsProps {
  /** Totais do período; `null` enquanto não há resultado. */
  totais: TotaisPeriodo | null
  carregando: boolean
  /**
   * Aviso de que os totais são de um recorte (ex.: "Totais só de iFood · 230 de
   * 410 pedidos"); `null` = pesquisa inteira, sem aviso.
   */
  recorte?: string | null
  /**
   * Ao lado dos indicadores, na mesma seção (o painel de canais): à esquerda em
   * seção larga, em cima quando estreita (celular).
   */
  lateral?: ReactNode
  /**
   * Prefixo das âncoras do tour: a seção ganha `<prefixo>`, o painel lateral
   * `<prefixo>-canais` e os indicadores `<prefixo>-indicadores`. Passe só com a
   * seção visível — o tour espera o alvo aparecer, e um alvo recolhido (altura 0)
   * seria destacado vazio.
   */
  tourPrefixo?: string
  /** Indicador que está filtrando a tabela (`null` = sem filtro). */
  filtro: FiltroTotal | null
  /** Clique num indicador: filtra a tabela por ele; clicar de novo tira o filtro. */
  onFiltroChange: (filtro: FiltroTotal | null) => void
  /**
   * Indicadores à vista, nessa ordem; os demais abrem pelo botão "Ver todos os
   * totais" (padrão 3 do `../AGENTS.md`). Sem isto, mostra os 12.
   */
  principais?: readonly FiltroTotal[]
  className?: string
}

/** Indicadores que deveriam ser zero: escondidos com valor, marcam o botão "Ver todos". */
const ALERTAS: readonly FiltroTotal[] = ['nao_classificado', 'pagamentos_sem_classificacao']

/**
 * Ao lado do anel de canais: 5 colunas já a partir de @4xl (~900 px). Abaixo
 * disso, 3 (a regra da GRADE): em 5 os valores e rótulos cortavam (~1024 px).
 */
const GRADE_AO_LADO = '@4xl:grid-cols-5'

const GRADE = 'grid grid-cols-1 gap-x-1 gap-y-0.5 @sm:grid-cols-2 @2xl:grid-cols-3 @5xl:grid-cols-5'

const ITEM = cn(
  'flex min-h-11 min-w-0 items-center gap-2.5 whitespace-nowrap rounded-lg px-2 py-1.5 text-left',
  'transition-colors duration-fast ease-default',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
)

const DICA_FILTRO = 'Clique para ver na tabela só os pedidos que entram nesta conta.'

/**
 * Totais do fechamento do período numa barra com os 12 indicadores do legado: o
 * que foi pago (Online, Adquirentes online/offline, Offline), o que foi cancelado
 * (com a mesma divisão), os descontos da loja e do parceiro e o que ficou sem
 * classificação.
 *
 * Padrão 3 do `../AGENTS.md`: grade de até 5 colunas (container query; 1 no
 * celular). Com `principais` (a barra acima da tabela), só os 4 grupos de
 * pagamento ficam à vista e o 5º lugar é o botão "Ver todos os totais (+8)", que
 * abre os demais logo abaixo — fechada, a barra ocupa uma linha só.
 *
 * Cada indicador é um FILTRO da tabela: o clique mostra só os pedidos que somaram
 * nele (`pedidosDoTotal`) e o indicador fica marcado; clicar de novo tira o
 * filtro. O tooltip explica a conta ao passar o mouse e fecha no clique. Indicador
 * zerado não tem pedido para mostrar: fica sem ação.
 */
export function ResumoCards({
  totais,
  carregando,
  recorte = null,
  lateral,
  tourPrefixo,
  filtro,
  onFiltroChange,
  principais,
  className,
}: ResumoCardsProps) {
  const [expandida, setExpandida] = useState(false)
  const pronto = !carregando && totais !== null
  const semClassificacao = pronto ? totais.pagamentos_sem_classificacao : 0

  const itens: {
    campo: FiltroTotal
    rotulo: string
    dica: string
    icone: ComponentType<SVGProps<SVGSVGElement>>
    tom: Tom
    valor: string | null
    zerado: boolean
  }[] = [
    ...INDICADORES.map((i) => {
      const v = pronto ? totais[i.campo] : 0
      return {
        campo: i.campo,
        rotulo: i.rotulo,
        dica: i.dica,
        icone: i.icone,
        tom: pronto ? i.tom(v) : ('neutro' as Tom),
        valor: pronto ? formatBRL(v) : null,
        zerado: v === 0,
      }
    }),
    {
      campo: 'pagamentos_sem_classificacao',
      rotulo: 'pagamentos sem classificação',
      dica:
        semClassificacao > 0
          ? 'Formas de pagamento que a regra não reconheceu (vazia ou DESCONHECIDO)'
          : 'Todas as formas de pagamento foram classificadas',
      icone: AlertTriangle,
      tom: !pronto ? 'neutro' : semClassificacao > 0 ? 'destructive' : 'success',
      valor: pronto ? semClassificacao.toLocaleString('pt-BR') : null,
      zerado: semClassificacao === 0,
    },
  ]

  type Item = (typeof itens)[number]
  const item = (i: Item) => {
    const ativo = filtro === i.campo
    const semAcao = !pronto || (i.zerado && !ativo)
    return (
      <Dica key={i.campo} content={semAcao ? i.dica : `${i.dica}. ${DICA_FILTRO}`}>
        <button
          type="button"
          aria-pressed={ativo}
          aria-disabled={semAcao}
          aria-label={`${i.rotulo}: ${i.valor ?? 'carregando'}`}
          onClick={() => !semAcao && onFiltroChange(ativo ? null : i.campo)}
          className={cn(
            ITEM,
            semAcao ? 'cursor-default' : 'hover:bg-muted/60',
            ativo && 'bg-primary/10 ring-1 ring-inset ring-primary/40 hover:bg-primary/15',
            i.campo === 'pagamentos_sem_classificacao' &&
              pronto &&
              !i.zerado &&
              !ativo &&
              'bg-destructive/5 hover:bg-destructive/10'
          )}
        >
          <Indicador icone={i.icone} tom={i.tom} valor={i.valor} rotulo={i.rotulo} />
        </button>
      </Dica>
    )
  }

  const destaque = principais
    ? principais.map((c) => itens.find((i) => i.campo === c)).filter((i): i is Item => !!i)
    : itens
  const demais = principais ? itens.filter((i) => !principais.includes(i.campo)) : []
  // O card que filtra a tabela nunca fica escondido: se for um dos demais, a parte
  // de baixo abre sozinha (e o botão trava até o filtro sair).
  const filtroEscondido = filtro !== null && demais.some((i) => i.campo === filtro)
  const aberta = expandida || filtroEscondido
  // Algo que deveria ser zero está entre os escondidos: o botão ganha um ponto vermelho.
  const alertaEscondido = pronto && demais.some((i) => ALERTAS.includes(i.campo) && !i.zerado)

  return (
    <div
      className={cn(
        '@container rounded-xl border border-border bg-surface p-1.5 shadow-sm',
        className
      )}
      data-tour={tourPrefixo}
    >
      <div className="flex flex-col gap-1.5 @4xl:flex-row">
        {lateral != null && (
          <div
            className="border-b border-border pb-1.5 @4xl:shrink-0 @4xl:border-b-0 @4xl:border-r @4xl:pb-0 @4xl:pr-1.5"
            data-tour={tourPrefixo && `${tourPrefixo}-canais`}
          >
            {lateral}
          </div>
        )}
        {/* Container próprio: a grade dos indicadores segue a largura que sobra
            ao lado do painel de canais, não a da seção inteira. */}
        <div
          className="@container flex min-w-0 flex-1 flex-col justify-center"
          data-tour={tourPrefixo && `${tourPrefixo}-indicadores`}
        >
          {recorte && (
            <p className="flex items-center gap-1.5 px-2 pb-0.5 pt-2 text-xs text-primary animate-in fade-in duration-default">
              <ListFilter aria-hidden className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{recorte}</span>
            </p>
          )}
          <div
            role="group"
            aria-label="Totais do período — clique num indicador para filtrar a tabela"
            className={cn(GRADE, lateral != null && GRADE_AO_LADO)}
          >
            {destaque.map(item)}
            {demais.length > 0 && (
              <button
                type="button"
                aria-expanded={aberta}
                disabled={filtroEscondido}
                onClick={() => setExpandida(!aberta)}
                className="flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors duration-fast ease-default hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              >
                {aberta ? 'Ocultar os demais totais' : `Ver todos os totais (+${demais.length})`}
                {alertaEscondido && !aberta && (
                  <span className="h-2 w-2 shrink-0 rounded-full bg-destructive">
                    <span className="sr-only">— há pagamento sem classificação</span>
                  </span>
                )}
                <ChevronDown
                  aria-hidden
                  className={cn(
                    'h-4 w-4 transition-transform duration-fast ease-default',
                    aberta && 'rotate-180'
                  )}
                />
              </button>
            )}
          </div>
          {demais.length > 0 && (
            <div
              inert={!aberta}
              aria-hidden={!aberta}
              className={cn(
                'grid transition-all duration-default ease-default',
                aberta ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              )}
            >
              <div className="min-h-0 overflow-hidden">
                <div
                  role="group"
                  aria-label="Demais totais do período"
                  className={cn(
                    GRADE,
                    lateral != null && GRADE_AO_LADO,
                    'mt-1 border-t border-border pt-1'
                  )}
                >
                  {demais.map(item)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
