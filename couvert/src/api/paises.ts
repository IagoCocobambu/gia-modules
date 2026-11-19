import { useQuery } from '@tanstack/react-query'
import { createServerClient } from '@gia-cb/sdk/server-client'
import type { CouvertPais } from '../types'

// Cliente server-side do módulo. `call('paises')` chaveia o transporte sozinho:
// em dev bate no runner do `gia dev` (que roda src/server/paises.ts no Node);
// em prod, na Edge Function gerada. Ver dados-externos.md.
const server = createServerClient('couvert')

/**
 * Lista de países da API pública (via o handler `src/server/paises.ts`).
 * A lista inteira (~250) vem de uma vez — a busca e o export são client-side.
 */
export function useListCouvertPaises() {
  return useQuery({
    queryKey: ['couvert', 'paises'],
    queryFn: () => server.call<{ paises: CouvertPais[] }>('paises'),
    staleTime: 5 * 60_000,
    select: (r) => r.paises,
  })
}
