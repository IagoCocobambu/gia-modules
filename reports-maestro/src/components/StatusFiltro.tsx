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

/**
 * Filtro por status do pedido. Os status do dicionário (`status-pedido.ts`)
 * aparecem sempre, na ordem dele e mesmo com 0, pro layout não pular; status
 * fora do dicionário entram depois, em ordem alfabética.
 */
export function StatusFiltro({ contagem, ...props }: StatusFiltroProps) {
  const extras = contagem ? [...contagem.keys()].filter((k) => !(k in STATUS_PEDIDO)).sort() : []
  const opcoes: OpcaoChip[] = [...Object.keys(STATUS_PEDIDO), ...extras].map((chave) => {
    const s = statusPedido(chave)
    return {
      chave,
      label: s.rotuloPlural,
      quantidade: contagem?.get(chave) ?? 0,
      icone: s.icone,
      corIcone: s.corIcone,
    }
  })
  return <FiltroChips rotulo="Filtrar por status" opcoes={opcoes} {...props} />
}
