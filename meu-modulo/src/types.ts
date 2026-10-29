// Tipos do domínio do módulo de exemplo (espelhando o shape de Impostos do portal).
// Loja = unidade operacional (cada item pertence a uma loja).

export interface MeuModuloLoja {
  loc_ref: string
  nome: string
  apelido: string
}

export interface MeuModuloItem {
  loc_ref: string
  family_group: string
  item_id: string
  item_name: string
  ncm: string | null
  cest: string | null
  gtin: string | null
}

export interface MeuModuloSyncInfo {
  last_run_at: string | null
  status: 'idle' | 'running' | 'success' | 'error'
}
