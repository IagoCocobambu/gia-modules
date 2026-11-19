// Os 12 indicadores da barra de totais (padrão 3 do ../AGENTS.md): ordem, rótulo,
// dica e tom. Um lugar só para a tela (`ResumoCards`) e o PDF por canal
// (`pdf-canais.ts`) — os dois mostram os mesmos números com as mesmas cores.

import type { FiltroTotal, TotaisPeriodo } from './types'

/** Cor do indicador: tinge o quadradinho do ícone e o valor. */
export type Tom = 'neutro' | 'success' | 'info' | 'primary' | 'warning' | 'destructive'

export interface DefIndicador {
  campo: FiltroTotal
  rotulo: string
  /** A explicação da conta (dica no mouse; também na FAQ). */
  dica: (totais: TotaisPeriodo) => string
  /** Os de alerta só ganham cor quando há algo a olhar. */
  tom: (totais: TotaisPeriodo) => Tom
  /** Valor como aparece na barra. */
  valor: (totais: TotaisPeriodo, formatBRL: (v: number) => string) => string
  /** Indicador sem valor: não tem pedido para mostrar (não filtra). */
  zerado: (totais: TotaisPeriodo) => boolean
}

type CampoValor = Exclude<FiltroTotal, 'pagamentos_sem_classificacao'>

/** Indicador de valor em R$. */
function emReais(
  campo: CampoValor,
  rotulo: string,
  dica: string,
  tom: (valor: number) => Tom
): DefIndicador {
  return {
    campo,
    rotulo,
    dica: () => dica,
    tom: (t) => tom(t[campo]),
    valor: (t, brl) => brl(t[campo]),
    zerado: (t) => t[campo] === 0,
  }
}

const vermelhoSeHouver = (v: number): Tom => (v > 0 ? 'destructive' : 'neutro')

/**
 * Os do Fechamento Diário do legado, na mesma ordem: venda, cancelados,
 * descontos/sem classificação e, por último, a contagem das formas de pagamento
 * sem classificação.
 */
export const INDICADORES: DefIndicador[] = [
  emReais(
    'online',
    'online',
    'Formas ONLINE (PRE PAGO), menos o incentivo que foi para Descontos parceiro',
    () => 'info'
  ),
  emReais(
    'adquirentes_online',
    'adquirentes online',
    'Vales ONLINE VR pagos antes, no app ou no parceiro (PRE PAGO)',
    () => 'primary'
  ),
  emReais(
    'adquirentes_offline',
    'adquirentes offline',
    'Vales ONLINE VR passados na entrega, sem PRE PAGO (ex.: VR Refeição)',
    () => 'primary'
  ),
  emReais(
    'offline',
    'offline',
    'Parte paga na entrega (dinheiro ou maquininha): formas sem PRE PAGO',
    () => 'warning'
  ),
  emReais(
    'cancelado_online',
    'cancelado online',
    'Parte online dos pedidos cancelados (fora do fechamento)',
    vermelhoSeHouver
  ),
  emReais(
    'cancelado_adquirentes_online',
    'cancelado adquirentes online',
    'Parte em adquirentes online dos pedidos cancelados',
    vermelhoSeHouver
  ),
  emReais(
    'cancelado_adquirentes_offline',
    'cancelado adquirentes offline',
    'Parte em adquirentes offline dos pedidos cancelados',
    vermelhoSeHouver
  ),
  emReais(
    'cancelado_offline',
    'cancelado offline',
    'Parte offline dos pedidos cancelados',
    vermelhoSeHouver
  ),
  emReais(
    'descontos_loja',
    'descontos loja',
    'Desconto total dos pedidos despachados ou entregues (DISPATCHED / DELIVERED)',
    () => 'neutro'
  ),
  emReais(
    'descontos_parceiro',
    'descontos parceiro',
    'Incentivo do parceiro em pedidos (fora do 99Food) com ONLINE VR ou OFFLINE; sai do Online',
    () => 'neutro'
  ),
  emReais(
    'nao_classificado',
    'sem classificação',
    'Valor em formas de pagamento sem nome (vazia ou DESCONHECIDO) — o normal é zero',
    (v) => (v !== 0 ? 'warning' : 'neutro')
  ),
  {
    campo: 'pagamentos_sem_classificacao',
    rotulo: 'pagamentos sem classificação',
    dica: (t) =>
      t.pagamentos_sem_classificacao > 0
        ? 'Formas de pagamento que a regra não reconheceu (vazia ou DESCONHECIDO)'
        : 'Todas as formas de pagamento foram classificadas',
    tom: (t) => (t.pagamentos_sem_classificacao > 0 ? 'destructive' : 'success'),
    valor: (t) => t.pagamentos_sem_classificacao.toLocaleString('pt-BR'),
    zerado: (t) => t.pagamentos_sem_classificacao === 0,
  },
]
