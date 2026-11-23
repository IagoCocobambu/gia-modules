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

const FUSO_SP = 'America/Sao_Paulo'

/** `19/11/2026 16:24` no horário de São Paulo. */
export function dataHoraSp(d: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: FUSO_SP,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(d)
}

/** `2026-11-19` → `19/11/2026`. */
export function formatData(dia: string): string {
  const [a, m, d] = dia.split('-')
  return `${d}/${m}/${a}`
}

/** `2026-11-19` → `19.11.2026` (período no nome do arquivo exportado). */
export function diaArquivo(dia: string): string {
  const [a, m, d] = dia.split('-')
  return `${d}.${m}.${a}`
}
