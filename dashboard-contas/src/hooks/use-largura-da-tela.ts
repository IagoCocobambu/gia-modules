import { useSyncExternalStore } from 'react'

// A LARGURA DA JANELA, e não a do contêiner.
//
// O módulo mede contêiner em quase tudo (`useTamanho`, `@container`), que é o
// certo para um componente que não sabe onde vai ser posto. Aqui não serve: o
// que decide se a tabela e o gráfico cabem LADO A LADO é a tela, e declarar um
// `@container` na aba o tornaria bloco de contenção, prendendo o
// `position: fixed` da tela cheia do cartão dentro dela — o mesmo motivo que já
// está escrito na aba Por índice.
//
// `useSyncExternalStore` em vez de `useState` + `useEffect`: o valor é externo
// ao React (a `matchMedia`), e assinar assim evita o primeiro quadro com o
// valor errado e o efeito correndo atrás.
//
// Mesmo desenho do Dashboard de RH, que resolveu isto primeiro.

/**
 * `true` enquanto a consulta de mídia casar. Antes da hidratação devolve
 * `false`: o arranjo estreito é o que cabe em qualquer tela.
 */
export function useMediaQuery(consulta: string): boolean {
  return useSyncExternalStore(
    (avisar) => {
      const mq = window.matchMedia(consulta)
      mq.addEventListener('change', avisar)
      return () => mq.removeEventListener('change', avisar)
    },
    () => window.matchMedia(consulta).matches,
    () => false
  )
}

/** O ponto em que tabela e gráfico cabem lado a lado — o `xl` do Tailwind. */
export function useTelaLarga(): boolean {
  return useMediaQuery('(min-width: 1280px)')
}
