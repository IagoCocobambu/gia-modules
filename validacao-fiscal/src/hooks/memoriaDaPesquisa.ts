import type { FiltrosValor } from '../components/FiltrosBar'
import type { Consulta, FiltroStatus } from '../types'

/**
 * Última pesquisa da tela, para ela voltar como estava quando o usuário sai (pelo
 * menu) e retorna. Fica SÓ EM MEMÓRIA, enquanto o portal está aberto: F5 limpa —
 * localStorage/sessionStorage são proibidos para estado de negócio (conventions §4).
 *
 * Guardada com o id do usuário: se outra pessoa entrar no mesmo navegador sem
 * recarregar a página, ela começa com a tela limpa.
 */
export interface MemoriaDaPesquisa {
  filtros: FiltrosValor
  consulta: Consulta | null
  filtroStatus: FiltroStatus
  /** Busca em todos os campos (celular). */
  busca: string
}

let memoria: { usuarioId: string; estado: MemoriaDaPesquisa } | null = null

export function lerMemoriaDaPesquisa(
  usuarioId: string | null | undefined
): MemoriaDaPesquisa | null {
  if (!usuarioId || !memoria || memoria.usuarioId !== usuarioId) return null
  return memoria.estado
}

export function gravarMemoriaDaPesquisa(
  usuarioId: string | null | undefined,
  estado: MemoriaDaPesquisa
): void {
  if (!usuarioId) return
  memoria = { usuarioId, estado }
}
