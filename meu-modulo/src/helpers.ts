export function formatDateTime(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Espera N ms — usado pra simular latência das ações no template. */
export function sleep(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms))
}
