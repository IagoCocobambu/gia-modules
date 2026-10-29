import { useSupabaseQuery } from '@gia-cb/sdk/supabase'
import { supabase } from '@gia-cb/sdk/supabase'
import type { TesteItem, TesteLoja, TesteSyncInfo } from '../types'

// A tabela do módulo vive num SCHEMA DEDICADO (`mod_<id>`, criado pela sua
// migration) — acesse via `supabase.schema(...).from(...)`. NUNCA use dotted
// `.from('mod_x.tabela')`: o PostgREST procura uma relação com esse nome
// literal no schema default → 404. (Ver api-reference.md §1.4.)
// No dev-shell, as fixtures do gia.config.ts são keyadas pelo nome
// DESQUALIFICADO ('lojas'/'items'/'sync_info') — o schema vai num header que o
// mock ignora.
const db = () => supabase.schema('mod_teste')

/** Lista todas as lojas (carrega uma vez no boot). */
export function useListTesteLojas() {
  return useSupabaseQuery<TesteLoja[]>({
    queryKey: ['teste', 'lojas'],
    queryFn: async () => {
      const { data, error } = await db().from('lojas').select('*').order('loc_ref', {
        ascending: true,
      })
      if (error) throw error
      return (data ?? []) as TesteLoja[]
    },
  })
}

/** Items de uma loja específica. Desabilita até locRef estar setado. */
export function useListTesteItems(locRef: string | null) {
  return useSupabaseQuery<TesteItem[]>({
    queryKey: ['teste', 'items', locRef ?? '_none'],
    enabled: !!locRef,
    queryFn: async () => {
      const { data, error } = await db().from('items').select('*').eq('loc_ref', locRef)
      if (error) throw error
      return (data ?? []) as TesteItem[]
    },
  })
}

/** Info de última sincronização (data + status). */
export function useUltimaSyncTeste() {
  return useSupabaseQuery<TesteSyncInfo | null>({
    queryKey: ['teste', 'sync-info'],
    queryFn: async () => {
      const { data, error } = await db().from('sync_info').select('*').single()
      if (error) throw error
      return (data ?? null) as TesteSyncInfo | null
    },
  })
}
