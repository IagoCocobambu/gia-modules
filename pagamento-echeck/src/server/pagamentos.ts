import { defineHandler, HttpError } from '@gia-cb/sdk/server'

// Pagamentos eCheck de UMA loja num período e faixa de horário: lê a API do DW
// (`/payments/`), página a página, e devolve as transações normalizadas.
//
// A loja chega como `empresaId` (validado contra o escopo); o `loc_ref` da API sai
// do cadastro da Empresa no servidor — o body não escolhe loja.
//
// Faixa de horário (regra do legado): o início vale para a DATA INICIAL e o fim
// para a DATA FINAL — "de 01/10 às 08:00 até 05/10 às 23:59:59". Não é um recorte
// de horário dentro de cada dia. Fim 23 vai até 23:59:59; os outros, até HH:00:00.
//
// REGRA: handler auto-contido — só importa de @gia-cb/sdk/server. `codigoDaLoja`
// se repete em lojas.ts de propósito.

interface Body {
  empresaId: number
  de: string
  ate: string
  horaInicio: number
  horaFim: number
}

interface Transacao {
  id: string
  /** Data e hora da transação, ISO com fuso (ex.: `2026-11-04T22:47:14-03:00`). */
  dataHora: string | null
  loja: string | null
  bandeira: string | null
  modalidade: string | null
  valor: number
  codAut: string | null
  codCielo: string | null
  descricao: string | null
  terminal: string | null
  conta: string | null
  mesa: string | null
  grupoMesa: string | null
  aberturaMesa: string | null
  status: string | null
  tipo: string | null
  tipoAdhoc: string | null
  descricaoAdhoc: string | null
}

interface Resposta {
  transacoes: Transacao[]
}

/** Id da integração da api-dw.cocobambu.com no hub de Credenciais. */
const INTEGRACAO = 'apidw'
/**
 * O legado aceitava 6 meses, mas a API responde 500 nesse volume; 31 dias de uma
 * loja movimentada (~7 mil transações) levam ~10 s.
 */
const MAX_DIAS_PERIODO = 31
/** A API recusa `limit` acima de 500 (422). */
const POR_PAGINA = 500
/** Páginas buscadas ao mesmo tempo depois da primeira. */
const PARALELO = 4
/** Teto de segurança: 60 páginas = 30 mil transações. */
const MAX_PAGINAS = 60
const TIMEOUT_MS = 60_000
const DATA_RE = /^\d{4}-\d{2}-\d{2}$/

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
  // Date.parse aceita "2026-02-30" (vira 02/03); a volta para texto tem que bater.
  const existe = (d: string) => {
    const t = Date.parse(`${d}T00:00:00Z`)
    return !Number.isNaN(t) && new Date(t).toISOString().slice(0, 10) === d
  }
  if (!existe(de) || !existe(ate)) throw new HttpError(422, 'Data inválida.')
  if (de > ate) throw new HttpError(422, 'A data final não pode ser menor que a data inicial.')
  if (diasEntre(de, ate) + 1 > MAX_DIAS_PERIODO) {
    throw new HttpError(
      422,
      `O intervalo de datas não pode ser maior que ${MAX_DIAS_PERIODO} dias.`
    )
  }
  return { de, ate }
}

function validarHoras(inicio: unknown, fim: unknown): { inicio: number; fim: number } {
  const ok = (h: unknown): h is number =>
    Number.isInteger(h) && (h as number) >= 0 && (h as number) <= 23
  if (!ok(inicio) || !ok(fim)) throw new HttpError(422, 'Informe as horas entre 00 e 23.')
  if (inicio >= fim) {
    throw new HttpError(422, 'A hora final precisa ser maior que a hora inicial.')
  }
  return { inicio, fim }
}

/** `loc_ref` da API de pagamentos: o vínculo BIAPI, ou o TS2 na falta dele. */
function codigoDaLoja(e: { locRefs: Record<string, string> }): string | null {
  const ref = (e.locRefs?.BIAPI ?? e.locRefs?.TS2 ?? '').trim().toLowerCase()
  return ref === '' ? null : ref
}

function texto(v: unknown): string | null {
  if (v === null || v === undefined) return null
  const s = String(v).trim()
  return s === '' ? null : s
}

/** Valor da API: número, ou texto "R$ 1.234,56" / "1234.56". */
function valorEmReais(v: unknown): number {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0
  const s = texto(v)
  if (!s) return 0
  const limpo = s.replace(/R\$/i, '').trim()
  const n = limpo.includes(',') ? Number(limpo.replace(/\./g, '').replace(',', '.')) : Number(limpo)
  return Number.isFinite(n) ? n : 0
}

/** Primeiro campo presente entre as grafias que a API já usou (como no legado). */
function campo(raw: Record<string, unknown>, nomes: string[]): unknown {
  for (const n of nomes) {
    if (raw[n] !== undefined && raw[n] !== null) return raw[n]
  }
  return null
}

function normalizar(raw: Record<string, unknown>, indice: number): Transacao {
  const t = (nomes: string[]) => texto(campo(raw, nomes))
  return {
    id: t(['id']) ?? `linha-${indice}`,
    dataHora: t(['Data', 'DATA']),
    loja: t(['Loja', 'LOJA']),
    bandeira: t(['BANDEIRA', 'Bandeira']),
    modalidade: t(['MODALIDADE', 'Modalidade']),
    valor: valorEmReais(campo(raw, ['Valor', 'VALOR'])),
    codAut: t(['Cod_Aut', 'Cod. Aut.', 'Cod Aut']),
    codCielo: t(['Cod_Ciel', 'Cod. Ciel.', 'Cod Ciel']),
    descricao: t(['DESCRICAO', 'DESCRIÇÃO']),
    terminal: t(['Terminal', 'Terminal (maquineta)']),
    conta: t(['Conta', 'CONTA']),
    mesa: t(['Mesa', 'MESA']),
    grupoMesa: t(['Grupo_Mesa', 'GRUPO MESA']),
    aberturaMesa: t(['Abertura_Mesa', 'ABERTURA MESA']),
    status: t(['Status', 'STATUS']),
    tipo: t(['Tipo', 'TIPO', 'tipo']),
    tipoAdhoc: t(['Tipo_ADHOC', 'Tipo ADHOC', 'TIPO_ADHOC']),
    descricaoAdhoc: t(['Descricao_ADHOC', 'Descricao ADHOC', 'DESCRICAO_ADHOC']),
  }
}

async function detalheDoErro(r: Response): Promise<string> {
  try {
    const corpo = (await r.json()) as { detail?: unknown }
    const d = corpo?.detail
    if (typeof d === 'string') return ` ${d}`
    if (Array.isArray(d)) {
      return ` ${d
        .map((x) =>
          x && typeof x === 'object' ? String((x as { message?: unknown }).message ?? '') : ''
        )
        .filter(Boolean)
        .join('; ')}`
    }
    return ''
  } catch {
    return ''
  }
}

interface Pagina {
  data: Record<string, unknown>[]
  total: number | null
  temMais: boolean
}

export default defineHandler<Body, Resposta>(async (ctx) => {
  await ctx.requirePermission('pagamento-echeck.ler')
  const empresaId = Number(ctx.body.empresaId)
  if (!Number.isInteger(empresaId)) throw new HttpError(422, 'Informe a loja.')
  await ctx.requireEmpresa(empresaId)
  const { de, ate } = validarPeriodo(ctx.body.de, ctx.body.ate)
  const horas = validarHoras(ctx.body.horaInicio, ctx.body.horaFim)

  const empresa = (await ctx.empresas()).find((e) => e.id === empresaId)
  // Só a loja com CNPJ (`tipoRegistro === 'empresa'`) — mesma regra de lojas.ts.
  if (!empresa || empresa.tipoRegistro !== 'empresa') {
    throw new HttpError(404, 'Loja não encontrada.')
  }
  const locRef = codigoDaLoja(empresa)
  if (!locRef) {
    throw new HttpError(
      422,
      `A loja "${empresa.nome}" não tem o código da loja no cadastro (vínculo BIAPI ou TS2).`
    )
  }

  const hh = (h: number) => String(h).padStart(2, '0')
  const inicio = `${de} ${hh(horas.inicio)}:00:00`
  const fim = horas.fim === 23 ? `${ate} 23:59:59` : `${ate} ${hh(horas.fim)}:00:00`

  const { baseUrl, token } = await ctx.credencial(INTEGRACAO)
  const base = baseUrl.replace(/\/+$/, '')

  async function buscar(offset: number): Promise<Response> {
    const qs = new URLSearchParams({
      loc_ref: locRef!,
      start_date: inicio,
      end_date: fim,
      limit: String(POR_PAGINA),
      offset: String(offset),
    })
    try {
      return await fetch(`${base}/payments/?${qs}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })
    } catch (e) {
      if (e instanceof Error && (e.name === 'TimeoutError' || e.name === 'AbortError')) {
        throw new HttpError(
          504,
          'A API de pagamentos demorou demais para responder. Tente um período menor.'
        )
      }
      throw e
    }
  }

  async function pagina(offset: number): Promise<Pagina> {
    let r = await buscar(offset)
    // Como no legado: uma nova tentativa quando a API falha do lado dela.
    if (r.status >= 500) {
      await new Promise((ok) => setTimeout(ok, 600))
      r = await buscar(offset)
    }
    if (!r.ok) {
      throw new HttpError(
        502,
        `A API de pagamentos respondeu ${r.status}.${await detalheDoErro(r)}`
      )
    }
    const json = (await r.json()) as {
      data?: unknown
      total_records?: unknown
      pagination?: { returned?: unknown; has_next?: unknown }
    }
    // 200 sem a lista `data` é falha, não "zero transações".
    if (!json || !Array.isArray(json.data)) {
      throw new HttpError(502, 'A API de pagamentos devolveu um formato inesperado.')
    }
    const data = json.data.filter(
      (x): x is Record<string, unknown> => x !== null && typeof x === 'object'
    )
    const total = Number.isInteger(json.total_records) ? (json.total_records as number) : null
    const temMais =
      typeof json.pagination?.has_next === 'boolean'
        ? json.pagination.has_next
        : json.data.length >= POR_PAGINA
    return { data, total, temMais }
  }

  const primeira = await pagina(0)
  const linhas: Record<string, unknown>[][] = [primeira.data]

  if (primeira.temMais) {
    if (primeira.total !== null) {
      // Total conhecido: as páginas restantes saem em paralelo, na ordem certa.
      const paginas = Math.ceil(primeira.total / POR_PAGINA)
      if (paginas > MAX_PAGINAS) {
        throw new HttpError(
          422,
          `O período tem ${primeira.total.toLocaleString('pt-BR')} transações — mais do que a tela comporta. Escolha um período ou uma faixa de horário menor.`
        )
      }
      const offsets = Array.from({ length: paginas - 1 }, (_, i) => (i + 1) * POR_PAGINA)
      let proximo = 0
      await Promise.all(
        Array.from({ length: Math.min(PARALELO, offsets.length) }, async () => {
          while (proximo < offsets.length) {
            const i = proximo++
            linhas[i + 1] = (await pagina(offsets[i])).data
          }
        })
      )
    } else {
      // Sem o total: segue página a página até a API dizer que acabou.
      let offset = POR_PAGINA
      let atual = primeira
      while (atual.temMais) {
        if (linhas.length >= MAX_PAGINAS) {
          throw new HttpError(
            422,
            'O período tem transações demais para a tela. Escolha um período ou uma faixa de horário menor.'
          )
        }
        atual = await pagina(offset)
        linhas.push(atual.data)
        offset += POR_PAGINA
      }
    }
  }

  // A mesma transação pode aparecer em duas páginas se a base mudar no meio da leitura.
  const vistos = new Set<string>()
  const transacoes: Transacao[] = []
  let indice = 0
  for (const raw of linhas.flat()) {
    const t = normalizar(raw, indice++)
    if (vistos.has(t.id)) continue
    vistos.add(t.id)
    transacoes.push(t)
  }
  // Mais recentes primeiro, como o legado abria a tabela.
  transacoes.sort((a, b) => (b.dataHora ?? '').localeCompare(a.dataHora ?? ''))
  return { transacoes }
})

export const config = { integracoes: ['apidw'], secrets: [] }
