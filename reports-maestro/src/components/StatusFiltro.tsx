import { STATUS_PEDIDO, statusPedido } from '../status-pedido'
import { FiltroChips, type OpcaoChip } from './FiltroChips'

interface StatusFiltroProps {
  /** Quantidade por status (chave de `chaveStatus`); `null` sem resultado. */
  contagem: Map<string, number> | null
  /** Status escolhidos (chaves de `chaveStatus`); vazio = todos. */
  selecionados: ReadonlySet<string>
  onSelecionar: (status: ReadonlySet<string>) => void
  carregando: boolean
  compacto: boolean
  className?: string
}

const ORDEM = Object.keys(STATUS_PEDIDO)

/** Status do dicionário na ordem dele; os de fora depois, em ordem alfabética. */
function compararStatus(a: string, b: string): number {
  const ia = ORDEM.indexOf(a)
  const ib = ORDEM.indexOf(b)
  if (ia !== -1 || ib !== -1)
    return (ia === -1 ? ORDEM.length : ia) - (ib === -1 ? ORDEM.length : ib)
  return a.localeCompare(b, 'pt-BR')
}

/**
 * Filtro por status do pedido: um chip por status presente na pesquisa (o
 * `FiltroChips` ainda esconde os que a outra barra zerou), traduzido pelo
 * dicionário (`status-pedido.ts`).
 */
export function StatusFiltro({ contagem, ...props }: StatusFiltroProps) {
  const opcoes: OpcaoChip[] | null = contagem
    ? [...contagem.entries()]
        .sort(([a], [b]) => compararStatus(a, b))
        .map(([chave, quantidade]) => {
          const s = statusPedido(chave)
          return { chave, label: s.rotuloPlural, quantidade, icone: s.icone, corIcone: s.corIcone }
        })
    : null
  return <FiltroChips rotulo="Status" opcoes={opcoes} {...props} />
}
