// A conta da paginação dos gráficos de lista.
//
// Mora fora de `PaginacaoGrafico.tsx` porque o ESLint do host exige que arquivo
// de componente exporte só componente (`react-refresh`).

/**
 * A página atual de uma lista, voltando à primeira quando a LISTA muda.
 *
 * Estado derivado, sem efeito: o estado guarda a lista a que a página pertence.
 * Trocar o indicador troca a lista, e a página volta a 0 sozinha — sem
 * `useEffect` reescrevendo estado (o ESLint do host reprova).
 */
export function paginar<T>(
  itens: T[],
  estado: { lista: T[]; pagina: number },
  porPaginaPedido: number
) {
  // Em tela cheia vem `Infinity` ("todos"). A conta abaixo não aguenta: a página
  // 0 começa em `0 × Infinity`, que é `NaN`, e a lista sai VAZIA — o cartão
  // expandia com o desenho em branco (visto em 21/09/2026; o Dashboard de RH
  // tinha pago o mesmo defeito).
  const porPagina = Number.isFinite(porPaginaPedido) ? porPaginaPedido : Math.max(itens.length, 1)
  const totalDePaginas = Math.max(1, Math.ceil(itens.length / porPagina))
  const pagina = estado.lista === itens ? Math.min(estado.pagina, totalDePaginas - 1) : 0
  const inicio = pagina * porPagina
  return {
    pagina,
    totalDePaginas,
    visiveis: itens.slice(inicio, inicio + porPagina),
    de: itens.length === 0 ? 0 : inicio + 1,
    ate: Math.min(inicio + porPagina, itens.length),
  }
}
