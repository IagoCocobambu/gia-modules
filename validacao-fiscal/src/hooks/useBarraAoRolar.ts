import { useEffect } from 'react'

/** Quanto tempo (ms) a barra continua visível depois que a rolagem para. */
const SOME_APOS_MS = 900

/**
 * Barra de rolagem só quando o usuário rola — em TODO o módulo.
 *
 * - Marca com `data-rolando` o elemento que está rolando e desmarca pouco depois que
 *   para. O ouvinte é no documento (captura: `scroll` não borbulha), porque parte do
 *   módulo é desenhada fora da área da tela: modais e listas suspensas vão para um
 *   portal no `<body>`. Marcar não muda nada sozinho; quem pinta é o CSS abaixo.
 * - Enquanto a tela está aberta, põe no `<body>` as classes `BARRA_NAS_CAMADAS`, que
 *   aplicam a regra às camadas suspensas do Radix (ex.: a lista de lojas do
 *   SearchableSelect, que não aceita classe). Saem quando a tela fecha.
 */
export function useBarraAoRolar(): void {
  useEffect(() => {
    const timers = new Map<HTMLElement, number>()

    const onScroll = (e: Event) => {
      const alvo = e.target
      if (!(alvo instanceof HTMLElement)) return
      alvo.dataset.rolando = ''
      const anterior = timers.get(alvo)
      if (anterior) window.clearTimeout(anterior)
      timers.set(
        alvo,
        window.setTimeout(() => {
          delete alvo.dataset.rolando
          timers.delete(alvo)
        }, SOME_APOS_MS)
      )
    }

    const classesBody = BARRA_NAS_CAMADAS.split(' ')
    document.body.classList.add(...classesBody)
    document.addEventListener('scroll', onScroll, { capture: true, passive: true })
    return () => {
      document.removeEventListener('scroll', onScroll, { capture: true })
      document.body.classList.remove(...classesBody)
      for (const [alvo, t] of timers) {
        window.clearTimeout(t)
        delete alvo.dataset.rolando
      }
    }
  }, [])
}

/**
 * Classes para os containers do módulo (área da tela, modais, lista de status):
 * barras finas e INVISÍVEIS no próprio container e em tudo dentro dele — sem mudar a
 * largura reservada, então nada pula — e visíveis só no elemento com `data-rolando`.
 * `scrollbar-color` para Chrome/Edge/Firefox; `::-webkit-scrollbar` para o Safari.
 */
export const BARRA_SO_AO_ROLAR = [
  // o próprio container (a área rola sozinha no celular)
  '[scrollbar-width:thin]',
  '[scrollbar-color:transparent_transparent]',
  'data-[rolando]:[scrollbar-color:var(--color-muted-foreground)_transparent]',
  '[&::-webkit-scrollbar]:h-2',
  '[&::-webkit-scrollbar]:w-2',
  '[&::-webkit-scrollbar-track]:bg-transparent',
  '[&::-webkit-scrollbar-thumb]:rounded-full',
  '[&::-webkit-scrollbar-thumb]:bg-transparent',
  'data-[rolando]:[&::-webkit-scrollbar-thumb]:bg-muted-foreground',
  // tudo dentro dele (corpo da tabela, corpo do modal, lista do select…)
  '[&_*]:[scrollbar-width:thin]',
  '[&_*]:[scrollbar-color:transparent_transparent]',
  '[&_[data-rolando]]:[scrollbar-color:var(--color-muted-foreground)_transparent]',
  '[&_*::-webkit-scrollbar]:h-2',
  '[&_*::-webkit-scrollbar]:w-2',
  '[&_*::-webkit-scrollbar-track]:bg-transparent',
  '[&_*::-webkit-scrollbar-thumb]:rounded-full',
  '[&_*::-webkit-scrollbar-thumb]:bg-transparent',
  '[&_[data-rolando]::-webkit-scrollbar-thumb]:bg-muted-foreground',
].join(' ')

/** Classes do `<body>` (só enquanto a tela está aberta): a mesma regra, restrita às
 *  camadas suspensas do Radix, onde o módulo não consegue pôr classe. */
export const BARRA_NAS_CAMADAS = [
  '[&_[data-radix-popper-content-wrapper]_*]:[scrollbar-width:thin]',
  '[&_[data-radix-popper-content-wrapper]_*]:[scrollbar-color:transparent_transparent]',
  '[&_[data-radix-popper-content-wrapper]_[data-rolando]]:[scrollbar-color:var(--color-muted-foreground)_transparent]',
  '[&_[data-radix-popper-content-wrapper]_*::-webkit-scrollbar]:w-2',
  '[&_[data-radix-popper-content-wrapper]_*::-webkit-scrollbar-thumb]:rounded-full',
  '[&_[data-radix-popper-content-wrapper]_*::-webkit-scrollbar-thumb]:bg-transparent',
  '[&_[data-radix-popper-content-wrapper]_[data-rolando]::-webkit-scrollbar-thumb]:bg-muted-foreground',
].join(' ')
