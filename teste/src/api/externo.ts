import { useQuery } from '@tanstack/react-query'
import { createServerClient } from '@gia-cb/sdk/server-client'

// Cliente server-side do módulo. Chama os handlers de `src/server/` com switch
// AUTOMÁTICO: em dev bate no runner local do `gia dev`; em prod, na Edge Function
// `teste-<nome>`. O JWT do usuário viaja junto nos dois. Ver
// api-reference.md §1.12 (Consumindo dados externos).
const server = createServerClient('teste')

export interface ItemExterno {
  id: string
  nome: string
}

/** Busca itens numa fonte EXTERNA via o handler `src/server/exemplo-externo.ts`. */
export function useItensExternos(termo: string) {
  return useQuery({
    queryKey: ['teste', 'externo', termo],
    queryFn: () =>
      server.call<{ fonte: string; itens: ItemExterno[] }>('exemplo-externo', { termo }),
  })
}
