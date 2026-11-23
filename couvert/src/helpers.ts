export const MODULE_ID = 'couvert'
export const NOME_MODULO = 'Couvert'

/** "agora", "há 1 min", "há 12 min", "há 2 h". */
export function haQuantoTempo(iso: string, agora: number): string {
  const ms = agora - new Date(iso).getTime()
  if (!Number.isFinite(ms) || ms < 60_000) return 'agora'
  const min = Math.floor(ms / 60_000)
  if (min < 60) return `há ${min} min`
  return `há ${Math.floor(min / 60)} h`
}

/** ISO → `HH:MM` no fuso de quem usa. */
export function formatHora(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

/** `2026-11-19` → `19/11/2026`. */
export function formatData(dia: string): string {
  const [a, m, d] = dia.split('-')
  return `${d}/${m}/${a}`
}
