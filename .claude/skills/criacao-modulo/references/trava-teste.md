# Trava de teste — código de referência

Troque `MEU_MODULO` pelo id do módulo em maiúsculas (`conciliacao-pix` →
`CONCILIACAO_PIX`) e `[meu-modulo/salvar]` pelo id e pelo handler.

## Handler (`src/server/<handler que grava>.ts`)

A função vai **dentro de cada** handler que cria, atualiza ou exclui (handler é
auto-contido: só importa de `@gia-cb/sdk/server`).

```ts
import { defineHandler, envOptional, getDbClient, HttpError } from '@gia-cb/sdk/server'

/**
 * Trava de teste da gravação. Homologação e produção gravam no MESMO banco: sem
 * trava, um teste em homologação altera o dado real.
 *
 * `MEU_MODULO_EMPRESA_TESTE` (opcional, id da Empresa no portal):
 * - ausente ou vazia (produção): nada muda;
 * - definida (homologação, com a Empresa 999): recusa qualquer outra Empresa com
 *   403, antes de qualquer acesso ao banco;
 * - definida com valor que não é um id: recusa TODA gravação (503) — erro de
 *   configuração não pode abrir a trava.
 *
 * Fica fora do `config.secrets` de propósito: lá ela vira `secrets_required` e a
 * instalação em produção passaria a exigi-la.
 */
function travaDeTeste(empresaId: number): void {
  const valor = envOptional('MEU_MODULO_EMPRESA_TESTE')?.trim()
  if (!valor) return
  const permitida = /^\d+$/.test(valor) ? Number(valor) : NaN
  if (!Number.isSafeInteger(permitida) || permitida <= 0) {
    console.error(
      '[meu-modulo/salvar] MEU_MODULO_EMPRESA_TESTE inválida (esperado o id numérico da Empresa); gravação recusada.'
    )
    throw new HttpError(
      503,
      'Gravação desativada neste ambiente: a loja de teste está mal configurada. Avise o time do Portal GIA.'
    )
  }
  if (empresaId !== permitida) {
    throw new HttpError(
      403,
      'Este ambiente é de teste: só a loja de teste pode ser alterada aqui. As outras lojas podem ser consultadas, mas não alteradas.'
    )
  }
}

export default defineHandler<Body, Resposta>(async (ctx) => {
  await ctx.requirePermission('meu-modulo.editar')
  const empresaId = Number(ctx.body.empresaId)
  if (!Number.isInteger(empresaId) || empresaId <= 0) throw new HttpError(422, 'Informe a loja.')
  await ctx.requireEmpresa(empresaId)
  // Antes de qualquer acesso ao banco.
  travaDeTeste(empresaId)

  const db = await getDbClient()
  // ... transação
})

export const config = { secrets: ['GIA_SERVER_DATABASE_URL'] }
```

Chave pela operação:

```ts
const op = await ctx.requireOperacao(ctx.body.locRef)
travaDeTeste(op.empresaId)
```

## Tela

`src/helpers.ts`:

```ts
/**
 * A gravação foi recusada porque o ambiente é de teste (trava
 * `MEU_MODULO_EMPRESA_TESTE`, só em homologação). É um 403, que a `MensagemErro`
 * mostraria como falta de acesso — e o gestor não tem o que liberar.
 */
export function ehRecusaDeAmbienteDeTeste(erro: unknown): string | null {
  const m =
    erro instanceof Error ? erro.message : (erro as { message?: unknown } | null)?.message
  return typeof m === 'string' && m.includes('Este ambiente é de teste') ? m : null
}
```

No erro de gravação (o server-client do SDK repassa a mensagem do servidor como
`message`):

```tsx
const recusaDeTeste = ehRecusaDeAmbienteDeTeste(erroSalvar)

<MensagemErro
  erro={erroSalvar}
  origem="Salvar"
  {...(recusaDeTeste ? { titulo: 'Ambiente de teste', descricao: recusaDeTeste } : {})}
  onTentarDeNovo={...}
/>
```

## `.env.example`

```bash
# Trava de teste da gravação (opcional): id da Empresa em que o módulo pode gravar.
# Homologação e produção gravam no MESMO banco — em homologação defina com a Empresa de
# teste (999.CB TECH HOMOLOG = <id do gia.config.ts>); as outras são recusadas com 403.
# Em produção NÃO defina. No dev, deixe definida sempre que o banco for de verdade.
MEU_MODULO_EMPRESA_TESTE=<id da 999>
```

## FAQ (`qa`, categoria da gravação)

```ts
{
  q: 'Ao salvar apareceu "Este ambiente é de teste". O que é?',
  a: 'Você está no ambiente de teste do portal, e nele só a loja de teste pode ser alterada — os dados das outras lojas são os reais e não podem ser mudados por um teste. Consultar qualquer loja funciona normalmente. Para alterar de verdade, use o portal oficial.',
},
```
