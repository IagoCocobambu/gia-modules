import { type ComponentType, type ReactNode, type SVGProps } from 'react'
import {
  AlertTriangle,
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
import { INDICADORES, type Tom } from '../indicadores'
import type { FiltroTotal, TotaisPeriodo } from '../types'
import { Dica } from './Dica'

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

/**
 * Ícone de cada indicador. A ordem, o rótulo, a dica e o tom ficam em
 * `../indicadores` — os mesmos do PDF por canal.
 */
const ICONE: Record<FiltroTotal, ComponentType<SVGProps<SVGSVGElement>>> = {
  online: Globe,
  adquirentes_online: CreditCard,
  adquirentes_offline: CreditCard,
  offline: HandCoins,
  cancelado_online: CircleX,
  cancelado_adquirentes_online: CircleX,
  cancelado_adquirentes_offline: CircleX,
  cancelado_offline: CircleX,
  descontos_loja: Store,
  descontos_parceiro: Handshake,
  nao_classificado: CircleHelp,
  pagamentos_sem_classificacao: AlertTriangle,
}

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
          // Grade estreita (celular até ~375 px): sem o quadradinho, o valor
          // cabe inteiro; o tom continua na cor do valor.
          'hidden h-7 w-7 shrink-0 place-items-center rounded-lg transition-colors duration-fast ease-default @xs:grid @sm:h-8 @sm:w-8',
          TOM_ICONE[tom]
        )}
      >
        <Icone aria-hidden className="h-3.5 w-3.5 @sm:h-4 @sm:w-4" />
      </span>
      <span className="flex min-w-0 flex-col leading-tight">
        {valor === null ? (
          <Skeleton className="my-0.5 h-4 w-20" />
        ) : (
          <span
            className={cn(
              'truncate text-sm font-semibold tabular-nums @sm:text-base',
              TOM_VALOR[tom]
            )}
          >
            {valor}
          </span>
        )}
        {/* Estreito (celular, 2 colunas): o rótulo quebra em vez de cortar — no
            toque não há dica para ler o nome inteiro. */}
        <span className="whitespace-normal break-words text-xs text-muted-foreground @sm:truncate">
          {rotulo}
        </span>
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
  className?: string
}

/**
 * Ao lado do anel de canais: 5 colunas já a partir de @4xl (~900 px). Abaixo
 * disso, 3 (a regra da GRADE): em 5 os valores e rótulos cortavam (~1024 px).
 */
const GRADE_AO_LADO = '@4xl:grid-cols-5'

/**
 * 2 colunas já no celular (0.4.4): em 1 coluna os 12 indicadores ocupavam a tela
 * inteira quando a seção abria; em 2, metade da altura.
 */
const GRADE = 'grid grid-cols-2 gap-x-1 gap-y-0.5 @2xl:grid-cols-3 @5xl:grid-cols-5'

const ITEM = cn(
  'flex min-h-11 min-w-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-1.5 py-1.5 text-left @sm:gap-2.5 @sm:px-2',
  'transition-colors duration-fast ease-default',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
)

/** Base das dicas enquanto os totais carregam (o texto não depende do valor). */
const TOTAIS_ZERADOS: TotaisPeriodo = {
  online: 0,
  adquirentes_online: 0,
  adquirentes_offline: 0,
  offline: 0,
  cancelado_online: 0,
  cancelado_adquirentes_online: 0,
  cancelado_adquirentes_offline: 0,
  cancelado_offline: 0,
  descontos_loja: 0,
  descontos_parceiro: 0,
  nao_classificado: 0,
  pagamentos_sem_classificacao: 0,
  divergentes: 0,
}

const DICA_FILTRO = 'Clique para ver na tabela só os pedidos que entram nesta conta.'

/**
 * Totais do fechamento do período numa barra com os 12 indicadores do legado: o
 * que foi pago (Online, Adquirentes online/offline, Offline), o que foi cancelado
 * (com a mesma divisão), os descontos da loja e do parceiro e o que ficou sem
 * classificação.
 *
 * Padrão 3 do `../AGENTS.md`: grade de até 5 colunas (container query; 2 no
 * celular, desde a 0.4.4). Os 12 ficam sempre à vista, sem o "Ver todos os totais": ao lado do
 * anel de canais, as 3 linhas de 5 cabem na altura do anel — esconder parte dos
 * indicadores não deixaria a seção mais baixa (0.4.3).
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
  className,
}: ResumoCardsProps) {
  const pronto = !carregando && totais !== null

  const itens = INDICADORES.map((i) => ({
    campo: i.campo,
    rotulo: i.rotulo,
    dica: pronto ? i.dica(totais) : i.dica(TOTAIS_ZERADOS),
    icone: ICONE[i.campo],
    tom: pronto ? i.tom(totais) : ('neutro' as Tom),
    valor: pronto ? i.valor(totais, formatBRL) : null,
    zerado: pronto ? i.zerado(totais) : true,
  }))

  const item = (i: (typeof itens)[number]) => {
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
          // Estica até a altura dos indicadores (a borda vai de cima a baixo) e
          // centraliza o anel na vertical: sem o flex, ele ficava no alto quando a
          // coluna dos indicadores era mais alta (no Safari, rótulos em 2 linhas).
          <div
            className="flex items-center justify-center border-b border-border pb-1.5 @4xl:shrink-0 @4xl:border-b-0 @4xl:border-r @4xl:pb-0 @4xl:pr-1.5"
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
            {itens.map(item)}
          </div>
        </div>
      </div>
    </div>
  )
}
