import { CircleCheck, CircleDashed, CircleX, Navigation, Truck } from 'lucide-react'
import type { ComponentType, SVGProps } from 'react'
import type { BadgeProps } from '@gia-cb/ui'

/**
 * Dicionário dos status de pedido do Maestro: o valor que a API devolve
 * (`status_do_pedido`) → como o portal mostra. É a ÚNICA fonte da tradução —
 * o filtro de status e a coluna "Status pedido" da tabela leem daqui. Status
 * novo da API: acrescente uma entrada (a ordem aqui é a ordem dos chips).
 *
 * O Excel exportado mantém o valor original da API, como no relatório antigo.
 */
export interface DefStatusPedido {
  /** Nome no singular — badge da tabela, busca e filtro de coluna. */
  rotulo: string
  /** Nome no plural — chip do filtro de status. */
  rotuloPlural: string
  /** Cor do badge na tabela. */
  variante: BadgeProps['variant']
  /** Ícone do chip no filtro de status. */
  icone: ComponentType<SVGProps<SVGSVGElement>>
  /** Cor do ícone do chip quando NÃO está marcado (token semântico). */
  corIcone: string
  /** Cor do ponto pulsante do badge da tabela (token semântico de fundo). */
  corPonto: string
}

export const STATUS_PEDIDO: Record<string, DefStatusPedido> = {
  CONFIRMED: {
    rotulo: 'Confirmado',
    rotuloPlural: 'Confirmados',
    variante: 'info',
    icone: CircleCheck,
    corIcone: 'text-info',
    corPonto: 'bg-info',
  },
  DISPATCHED: {
    rotulo: 'Despachado',
    rotuloPlural: 'Despachados',
    variante: 'success',
    icone: Truck,
    corIcone: 'text-success',
    corPonto: 'bg-success',
  },
  GOING_TO_DESTINATION: {
    rotulo: 'A caminho',
    rotuloPlural: 'A caminho',
    variante: 'warning',
    icone: Navigation,
    corIcone: 'text-warning',
    corPonto: 'bg-warning',
  },
  CANCELLED: {
    rotulo: 'Cancelado',
    rotuloPlural: 'Cancelados',
    variante: 'destructive',
    icone: CircleX,
    corIcone: 'text-destructive',
    corPonto: 'bg-destructive',
  },
}

/**
 * Definição de um status. Valor fora do dicionário aparece como veio da API, em
 * cinza; pedido sem status (`null`/`''`) vira "Sem status".
 */
export function statusPedido(valor: string | null | undefined): DefStatusPedido {
  const conhecido = valor ? STATUS_PEDIDO[valor] : undefined
  if (conhecido) return conhecido
  const nome = valor || 'Sem status'
  return {
    rotulo: nome,
    rotuloPlural: nome,
    variante: 'secondary',
    icone: CircleDashed,
    corIcone: 'text-muted-foreground',
    corPonto: 'bg-muted-foreground',
  }
}
