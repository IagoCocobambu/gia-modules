import { defineHandler, HttpError } from '@gia-cb/sdk/server'

// Notas fiscais (NFC-e) de UMA loja, lidas da API do DW (/invoices/). O token vem
// do hub de Credenciais do portal (ctx.credencial) — nunca do código.
//
// A loja é identificada pelo `loc_ref` do Simphony — o MESMO `locRefs.BIAPI` que
// o handler `contas` usa no DW. Assim contas e notas vêm garantidamente da mesma
// loja (a API aceita `loc_ref` sem diferenciar maiúsculas/minúsculas).
//
// REGRA: handler auto-contido — só importa de @gia-cb/sdk/server. As funções de
// data abaixo se repetem em contas.ts de propósito.

interface Body {
  empresaId: number
  de: string
  ate: string
}

interface Invoice {
  Loja: string
  Chave_Acesso: string
  Status: string
  Serie: number
  nNf: number
  Hora_Criacao_Nota: string
  Valor_Nota: number
  Check_Number: number
}

interface Resposta {
  notas: Invoice[]
  /** Nome da loja como a API de notas devolve ("01. CB Goiania") — o mesmo do legado. */
  loja: string | null
}

/** Id da integração da api-dw.cocobambu.com no hub de Credenciais. */
const INTEGRACAO = 'api-dw'
const MAX_DIAS_PERIODO = 31
const DATA_RE = /^\d{4}-\d{2}-\d{2}$/

function somarDias(data: string, dias: number): string {
  return new Date(Date.parse(`${data}T00:00:00Z`) + dias * 86_400_000).toISOString().slice(0, 10)
}

function diasEntre(de: string, ate: string): number {
  return Math.round((Date.parse(`${ate}T00:00:00Z`) - Date.parse(`${de}T00:00:00Z`)) / 86_400_000)
}

function validarPeriodo(de: unknown, ate: unknown): { de: string; ate: string } {
  if (
    typeof de !== 'string' ||
    typeof ate !== 'string' ||
    !DATA_RE.test(de) ||
    !DATA_RE.test(ate)
  ) {
    throw new HttpError(422, 'Informe o período no formato AAAA-MM-DD.')
  }
  if (Number.isNaN(Date.parse(de)) || Number.isNaN(Date.parse(ate))) {
    throw new HttpError(422, 'Data inválida.')
  }
  if (de > ate) throw new HttpError(422, 'A data inicial não pode ser maior que a data final.')
  if (diasEntre(de, ate) + 1 > MAX_DIAS_PERIODO) {
    throw new HttpError(
      422,
      `O intervalo de datas não pode ser maior que ${MAX_DIAS_PERIODO} dias.`
    )
  }
  return { de, ate }
}

function normalizar(raw: Record<string, unknown>): Invoice | null {
  const chave = String(raw.Chave_Acesso ?? '').trim()
  const hora = String(raw.Hora_Criacao_Nota ?? '')
  const checkNumber = Number(raw.Check_Number)
  if (!chave || !hora || !Number.isFinite(checkNumber)) return null
  return {
    Loja: String(raw.Loja ?? ''),
    Chave_Acesso: chave,
    Status: String(raw.Status ?? ''),
    Serie: Number(raw.Serie ?? 0),
    nNf: Number(raw.nNf ?? 0),
    Hora_Criacao_Nota: hora,
    Valor_Nota: Number(raw.Valor_Nota ?? 0),
    Check_Number: checkNumber,
  }
}

export default defineHandler<Body, Resposta>(async (ctx) => {
  await ctx.requirePermission('validacao-fiscal.ler')
  const empresaId = Number(ctx.body.empresaId)
  if (!Number.isInteger(empresaId)) throw new HttpError(422, 'Informe a loja.')
  await ctx.requireEmpresa(empresaId)
  const { de, ate } = validarPeriodo(ctx.body.de, ctx.body.ate)

  const empresa = (await ctx.empresas()).find((e) => e.id === empresaId)
  const locRef = empresa?.locRefs.BIAPI?.trim()
  if (!locRef) throw new HttpError(422, 'Esta loja não tem vínculo com a BI do Simphony.')

  // Um dia de folga em cada lado: −1 pega a nota da noite anterior que casa com as
  // primeiras contas (janela antes); +1 pega a nota emitida depois da meia-noite.
  const inicial = somarDias(de, -1)
  const final = somarDias(ate, 1)

  const { baseUrl, token } = await ctx.credencial(INTEGRACAO)
  const base = baseUrl.replace(/\/+$/, '')
  const qs = new URLSearchParams({ loc_ref: locRef, initial_date: inicial, final_date: final })

  const r = await fetch(`${base}/invoices/?${qs}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  if (!r.ok) throw new HttpError(502, `A API de notas respondeu ${r.status}.`)
  const json = (await r.json()) as unknown
  const brutos = Array.isArray(json) ? (json as Record<string, unknown>[]) : []

  // Dedup pela chave de acesso: a mesma nota conta uma vez só.
  const porChave = new Map<string, Invoice>()
  for (const raw of brutos) {
    const inv = normalizar(raw)
    if (inv) porChave.set(inv.Chave_Acesso, inv)
  }
  const notas = [...porChave.values()]
  return { notas, loja: notas.find((n) => n.Loja)?.Loja ?? null }
})

export const config = { integracoes: ['api-dw'], secrets: [] }
