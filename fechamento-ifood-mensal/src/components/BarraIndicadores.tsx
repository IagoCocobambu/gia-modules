import { useState, type ComponentType, type SVGProps } from 'react'
import { ChevronDown } from 'lucide-react'
import { Skeleton } from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'
import { Dica } from './Dica'

/** Cor do indicador: tinge o quadradinho do ícone e o valor (só tokens). */
export type TomIndicador = 'neutro' | 'success' | 'info' | 'primary' | 'warning' | 'destructive'

const TOM_ICONE: Record<TomIndicador, string> = {
  neutro: 'bg-muted text-muted-foreground',
  success: 'bg-success/10 text-success',
  info: 'bg-info/10 text-info',
  primary: 'bg-primary/10 text-primary',
  warning: 'bg-warning/10 text-warning',
  destructive: 'bg-destructive/10 text-destructive',
}

const TOM_VALOR: Record<TomIndicador, string> = {
  neutro: 'text-foreground',
  success: 'text-success',
  info: 'text-info',
  primary: 'text-primary',
  warning: 'text-warning',
  destructive: 'text-destructive',
}

export interface Indicador {
  id: string
  /** Rótulo curto, em minúsculas. */
  rotulo: string
  /** Explicação da conta — aparece só com mouse (a FAQ explica o mesmo). */
  dica: string
  icone: ComponentType<SVGProps<SVGSVGElement>>
  tom: TomIndicador
  valor: string
  /**
   * O indicador é um recorte das linhas da tabela: o clique filtra por ele.
   * `false`/ausente = só informa (ex.: o total geral).
   */
  filtra?: boolean
  /** Sem linhas para mostrar (o clique não faz nada). */
  zerado?: boolean
}

interface Props {
  itens: Indicador[]
  /** Nome do grupo para leitor de tela. */
  rotulo: string
  /** Indicador que está filtrando a tabela. */
  filtro?: string | null
  /** Clique num indicador que filtra; clicar de novo tira o filtro (`null`). */
  onFiltroChange?: (id: string | null) => void
  /**
   * Ids dos indicadores mais relevantes, nessa ordem: só eles ficam à vista, com
   * um botão "Ver todos os totais" que abre o restante logo abaixo. Sem isto, a
   * barra mostra todos.
   */
  principais?: string[]
  /**
   * Consulta ainda em andamento: os valores ficam em carregamento e nenhum card
   * filtra — total parcial seria confundido com o do mês (padrão 9 do workspace).
   */
  carregando?: boolean
  className?: string
}

const ITEM =
  'flex min-h-11 min-w-0 items-center gap-2.5 whitespace-nowrap rounded-lg px-2 py-1.5 text-left transition-colors duration-fast ease-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

const DICA_FILTRO = 'Clique para ver na tabela só as linhas que entram nesta conta.'

function Conteudo({ i, carregando }: { i: Indicador; carregando?: boolean }) {
  const Icone = i.icone
  return (
    <>
      <span
        className={cn(
          'grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors duration-fast ease-default',
          TOM_ICONE[carregando ? 'neutro' : i.tom]
        )}
      >
        <Icone aria-hidden className="h-4 w-4" />
      </span>
      <span className="flex min-w-0 flex-col leading-tight">
        {carregando ? (
          <Skeleton className="my-0.5 h-5 w-24" />
        ) : (
          <span className={cn('truncate text-base font-semibold tabular-nums', TOM_VALOR[i.tom])}>
            {i.valor}
          </span>
        )}
        <span className="truncate text-xs text-muted-foreground">{i.rotulo}</span>
      </span>
    </>
  )
}

/**
 * Barra de indicadores (padrão 3 do AGENTS.md do workspace — o mesmo visual dos
 * totais do Fechamento iFood Diário): um contêiner só, cada indicador numa linha
 * compacta com o ícone num quadradinho, o valor e o rótulo. Os valores são da
 * consulta inteira e não mudam com o filtro.
 *
 * Indicador com `filtra` vira botão: o clique mostra na tabela só as linhas que
 * somam nele; clicar de novo tira. Indicador zerado não filtra.
 * Com `principais`, só os mais relevantes ficam à vista e o resto abre pelo botão
 * "Ver todos os totais" (economiza altura em tela pequena).
 * Quem abre e fecha a barra inteira é o botão Totais da aba (`BotaoTotais` + `Recolhivel`).
 */
export function BarraIndicadores({
  itens,
  rotulo,
  filtro,
  onFiltroChange,
  principais,
  carregando = false,
  className,
}: Props) {
  const [expandida, setExpandida] = useState(false)

  const item = (i: Indicador) => {
    if (carregando) {
      return (
        <Dica key={i.id} content={`${i.dica}. O valor aparece quando a consulta terminar`}>
          <div
            tabIndex={0}
            aria-label={`${i.rotulo}: aguardando o fim da consulta`}
            className={ITEM}
          >
            <Conteudo i={i} carregando />
          </div>
        </Dica>
      )
    }
    if (!i.filtra || !onFiltroChange) {
      return (
        <Dica key={i.id} content={i.dica}>
          <div tabIndex={0} aria-label={`${i.rotulo}: ${i.valor}`} className={ITEM}>
            <Conteudo i={i} />
          </div>
        </Dica>
      )
    }
    const ativo = filtro === i.id
    const semAcao = Boolean(i.zerado) && !ativo
    return (
      <Dica key={i.id} content={semAcao ? i.dica : `${i.dica}. ${DICA_FILTRO}`}>
        <button
          type="button"
          aria-pressed={ativo}
          aria-disabled={semAcao}
          aria-label={`${i.rotulo}: ${i.valor}`}
          onClick={() => !semAcao && onFiltroChange(ativo ? null : i.id)}
          className={cn(
            ITEM,
            semAcao ? 'cursor-default' : 'hover:bg-muted/60',
            ativo && 'bg-primary/10 ring-1 ring-inset ring-primary/40 hover:bg-primary/15'
          )}
        >
          <Conteudo i={i} />
        </button>
      </Dica>
    )
  }

  const GRADE =
    'grid grid-cols-1 gap-x-1 gap-y-0.5 @sm:grid-cols-2 @2xl:grid-cols-3 @5xl:grid-cols-5'
  const destaque = principais
    ? principais
        .map((id) => itens.find((i) => i.id === id))
        .filter((i): i is Indicador => Boolean(i))
    : itens
  const demais = principais ? itens.filter((i) => !principais.includes(i.id)) : []
  // O card que está filtrando a tabela nunca fica escondido: se for um dos demais,
  // a parte de baixo abre sozinha.
  const filtroEscondido = filtro != null && demais.some((i) => i.id === filtro)
  const aberta = expandida || filtroEscondido

  return (
    <div
      className={cn(
        '@container shrink-0 rounded-xl border border-border bg-surface p-1.5 shadow-sm',
        className
      )}
    >
      <div role="group" aria-label={rotulo} className={GRADE}>
        {destaque.map(item)}
        {demais.length > 0 && (
          <button
            type="button"
            aria-expanded={aberta}
            // Com um dos demais filtrando a tabela, a parte de baixo fica aberta até o
            // filtro sair (o card marcado não pode sumir).
            disabled={filtroEscondido}
            onClick={() => setExpandida(!aberta)}
            className="flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors duration-fast ease-default hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            {aberta ? 'Ocultar os demais totais' : `Ver todos os totais (+${demais.length})`}
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
              aria-label={`${rotulo} — demais`}
              className={cn(GRADE, 'mt-1 border-t border-border pt-1')}
            >
              {demais.map(item)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
