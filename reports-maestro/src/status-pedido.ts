import {
  CircleCheck,
  CircleCheckBig,
  CircleDashed,
  CircleX,
  Inbox,
  Navigation,
  Package,
  PackageCheck,
  PackageX,
  Route,
  Store,
  Truck,
  Undo2,
} from 'lucide-react'
import type { ComponentType, SVGProps } from 'react'
import type { BadgeProps } from '@gia-cb/ui'

/**
 * Dicionário dos status de pedido do Maestro: o valor que a API devolve
 * (`status_do_pedido`) → como o portal mostra. É a ÚNICA fonte da tradução —
 * o filtro de status e a coluna "Status pedido" da tabela leem daqui. Status
 * novo da API: acrescente uma entrada (a ordem aqui é a ordem dos chips).
 *
 * A ordem segue a vida do pedido, e a cor agrupa por fase: antes de sair (info),
 * em trânsito (warning), entregue (success), não entregue/retorno (exception) e
 * cancelado (destructive). Dentro da fase, o ícone diferencia.
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

const ANTES_DE_SAIR = {
  variante: 'info',
  corIcone: 'text-info',
  corPonto: 'bg-info',
} as const

const EM_TRANSITO = {
  variante: 'warning',
  corIcone: 'text-warning',
  corPonto: 'bg-warning',
} as const

const ENTREGUE = {
  variante: 'success',
  corIcone: 'text-success',
  corPonto: 'bg-success',
} as const

const NAO_ENTREGUE = {
  variante: 'exception',
  corIcone: 'text-accent-exception-soft-foreground',
  corPonto: 'bg-accent-exception-soft-foreground',
} as const

export const STATUS_PEDIDO: Record<string, DefStatusPedido> = {
  RECEIVED: { rotulo: 'Recebido', rotuloPlural: 'Recebidos', icone: Inbox, ...ANTES_DE_SAIR },
  CONFIRMED: {
    rotulo: 'Confirmado',
    rotuloPlural: 'Confirmados',
    icone: CircleCheck,
    ...ANTES_DE_SAIR,
  },
  PACKED: { rotulo: 'Embalado', rotuloPlural: 'Embalados', icone: Package, ...ANTES_DE_SAIR },
  DISPATCHED: { rotulo: 'Despachado', rotuloPlural: 'Despachados', icone: Truck, ...EM_TRANSITO },
  ON_ROUTE: { rotulo: 'Em rota', rotuloPlural: 'Em rota', icone: Route, ...EM_TRANSITO },
  GOING_TO_DESTINATION: {
    rotulo: 'A caminho',
    rotuloPlural: 'A caminho',
    icone: Navigation,
    ...EM_TRANSITO,
  },
  DELIVERED: { rotulo: 'Entregue', rotuloPlural: 'Entregues', icone: PackageCheck, ...ENTREGUE },
  COMPLETED: {
    rotulo: 'Concluído',
    rotuloPlural: 'Concluídos',
    icone: CircleCheckBig,
    ...ENTREGUE,
  },
  ORDER_NOT_DELIVERED: {
    rotulo: 'Não entregue',
    rotuloPlural: 'Não entregues',
    icone: PackageX,
    ...NAO_ENTREGUE,
  },
  RETURN_TO_ORIGIN: {
    rotulo: 'Retornando',
    rotuloPlural: 'Retornando',
    icone: Undo2,
    ...NAO_ENTREGUE,
  },
  RETURNED: { rotulo: 'Retornado', rotuloPlural: 'Retornados', icone: Store, ...NAO_ENTREGUE },
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
