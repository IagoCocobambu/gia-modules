import { FiltroChips, type OpcaoChip } from './FiltroChips'

interface OrigemFiltroProps {
  /** Quantidade por origem (chave de `chaveOrigem`); `null` sem resultado. */
  contagem: Map<string, number> | null
  /** Origens escolhidas (chaves de `chaveOrigem`); vazio = todas. */
  selecionados: ReadonlySet<string>
  onSelecionar: (origens: ReadonlySet<string>) => void
  carregando: boolean
  compacto: boolean
  className?: string
}

/**
 * Filtro por origem (canal) do pedido. A API já devolve a origem em português
 * ("iFood", "App Coco Bambu", ...), então não há dicionário: aparece um chip por
 * origem presente no período, em ordem alfabética, e "Sem origem" por último.
 */
export function OrigemFiltro({ contagem, ...props }: OrigemFiltroProps) {
  const opcoes: OpcaoChip[] | null = contagem
    ? [...contagem.entries()]
        .sort(([a], [b]) => (a === '' ? 1 : b === '' ? -1 : a.localeCompare(b, 'pt-BR')))
        .map(([chave, quantidade]) => ({ chave, label: chave || 'Sem origem', quantidade }))
    : null
  return <FiltroChips rotulo="Filtrar por origem" opcoes={opcoes} {...props} />
}
