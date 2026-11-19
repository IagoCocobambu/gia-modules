import { useSyncExternalStore } from 'react'

/** Altura a partir da qual a barra de totais abre sozinha (padrão 3 do workspace). */
const MQ_TELA_ALTA = '(min-height: 700px)'

function assinar(aoMudar: () => void) {
  const mq = window.matchMedia(MQ_TELA_ALTA)
  mq.addEventListener('change', aoMudar)
  return () => mq.removeEventListener('change', aoMudar)
}

/** `true` enquanto a janela tem 700 px de altura ou mais (segue o resize). */
export function useTelaAlta(): boolean {
  return useSyncExternalStore(
    assinar,
    () => window.matchMedia(MQ_TELA_ALTA).matches,
    () => false
  )
}
