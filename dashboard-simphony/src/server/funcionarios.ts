import { defineHandler, envOptional, HttpError, type ServerContext } from '@gia-cb/sdk/server'

// Funcionários do dia de UMA loja, da BI do Simphony (regra do legado,
// `CarregaEmployees` + `JsonEmployeeToCds`): soma, por funcionário (`empNum`), as
// contas (`chkCnt`), a venda líquida (`netSlsTtl`) e a taxa de serviço (`svcTtl`)
// de todos os centros de receita do `getEmployeeDailyTotals`. O nome vem do
// cadastro de funcionários da BI (`getEmployeeDimensions`), como
// "número - nome sobrenome".
//
// REGRA: handler auto-contido — só importa de @gia-cb/sdk/server. O bloco "BI do
// Simphony" abaixo se repete em resumo.ts e itens.ts de propósito.

interface Body {
  empresaId: number
  /** `YYYY-MM-DD` — o dia que o `resumo` devolveu. */
  data: string
}

interface Funcionario {
  numero: number
  nome: string
  contas: number
  vendaLiquida: number
  servico: number
}

interface Resposta {
  funcionarios: Funcionario[]
}

// ── BI do Simphony (igual em resumo.ts, itens.ts e funcionarios.ts) ──────────

const MODULO = 'dashboard-simphony'
/** Id da integração no hub de Credenciais (PROVISÓRIO — ver docs/perguntas-gestor.md). */
const INTEGRACAO = 'simphony-bi'
/** Organização da BI quando o hub não traz `parametros.org` (a do legado). */
const ORG_PADRAO = 'GCB'
/** Abaixo do tempo da Edge Function (padrão 14 do AGENTS.md da raiz). */
const TIMEOUT_MS = 30_000

type Json = Record<string, unknown>

/** `locRef` da BI (`locRefs.BIAPI`) da Empresa, depois de checar o escopo. */
async function locRefDaLoja(ctx: ServerContext<unknown>, empresaId: unknown): Promise<string> {
  const id = Number(empresaId)
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(422, 'Informe a loja.')
  await ctx.requireEmpresa(id)
  const empresa = (await ctx.empresas()).find((e) => e.id === id)
  if (!empresa) throw new HttpError(404, 'Loja não encontrada.')
  const locRef = empresa.locRefs?.BIAPI?.trim()
  if (!locRef) {
    throw new HttpError(
      422,
      `A loja "${empresa.nome}" não tem o vínculo com a BI do Simphony no cadastro.`
    )
  }
  return locRef
}

/** Modo demonstração: só no `gia dev`, sem credencial (dados fictícios). */
function demo(): boolean {
  return envOptional('GIA_DEV_DASHBOARD_SIMPHONY_DEMO') === '1'
}

/** Uma chamada à BI (`POST {baseUrl}/{org}/{recurso}`). Erro técnico só no log. */
async function chamarBi(ctx: ServerContext<unknown>, recurso: string, corpo: Json): Promise<Json> {
  const { baseUrl, token, parametros } = await ctx.credencial(INTEGRACAO)
  const org = (parametros?.org?.trim()) || ORG_PADRAO
  const url = `${baseUrl.replace(/\/+$/, '')}/${encodeURIComponent(org)}/${recurso}`
  let r: Response
  try {
    r = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(corpo),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
  } catch (e) {
    if (e instanceof Error && (e.name === 'TimeoutError' || e.name === 'AbortError')) {
      throw new HttpError(
        504,
        'A BI do Simphony demorou demais para responder. Tente pesquisar de novo.'
      )
    }
    console.error(`[${MODULO}] falha de rede ao chamar a BI do Simphony (${recurso}):`, e)
    throw new HttpError(
      502,
      'Não foi possível falar com a BI do Simphony agora. Tente de novo em alguns minutos.'
    )
  }
  if (!r.ok) {
    const detalhe = await r.text().catch(() => '')
    console.error(`[${MODULO}] BI do Simphony respondeu ${r.status} (${recurso}):`, detalhe)
    if (r.status === 401 || r.status === 403) {
      throw new HttpError(
        424,
        'A BI do Simphony recusou a credencial do portal. Avise o time do Portal GIA.'
      )
    }
    throw new HttpError(
      502,
      `A BI do Simphony não conseguiu responder agora (código ${r.status}). Tente de novo em alguns minutos; se continuar, avise o suporte.`
    )
  }
  try {
    const json = (await r.json()) as unknown
    if (json && typeof json === 'object' && !Array.isArray(json)) return json as Json
  } catch (e) {
    console.error(`[${MODULO}] resposta inválida da BI do Simphony (${recurso}):`, e)
  }
  throw new HttpError(502, 'A BI do Simphony devolveu um formato inesperado.')
}

/** Lista de objetos de um campo da resposta (ausente = vazia). */
function lista(o: unknown, campo: string): Json[] {
  const v = o && typeof o === 'object' ? (o as Json)[campo] : undefined
  return Array.isArray(v) ? v.filter((x): x is Json => !!x && typeof x === 'object') : []
}

/** Número de um campo (ausente ou inválido = 0). */
function num(o: Json, campo: string): number {
  const v = Number(o[campo])
  return Number.isFinite(v) ? v : 0
}

const DATA_RE = /^\d{4}-\d{2}-\d{2}$/

// ── Fim do bloco BI do Simphony ──────────────────────────────────────────────

/** Soma de centavos sem erro de ponto flutuante. */
const somar = (a: number, b: number) => Math.round((a + b) * 100) / 100

/** Texto de um campo, aceitando os nomes que o cadastro da BI usa. */
function texto(o: Json, ...campos: string[]): string {
  for (const c of campos) {
    const v = o[c]
    if (typeof v === 'string' && v.trim()) return v.trim()
  }
  return ''
}

const EQUIPE_DEMO: [number, string, string][] = [
  [101, 'Ana', 'Souza'],
  [102, 'Bruno', 'Lima'],
  [103, 'Carla', 'Mendes'],
  [104, 'Diego', 'Alves'],
  [105, 'Elisa', 'Rocha'],
  [106, 'Fábio', 'Nunes'],
  [107, 'Gabriela', 'Teixeira'],
]

function equipeDemo(data: string): { totais: Json; nomes: Json } {
  const semente = Number(data.replaceAll('-', '')) % 11
  const employees = EQUIPE_DEMO.map(([empNum], i) => {
    const chkCnt = ((i * 5 + semente) % 17) + 3
    const netSlsTtl = Math.round(chkCnt * (180 + i * 23) * 100) / 100
    return { empNum, chkCnt, netSlsTtl, svcTtl: Math.round(netSlsTtl * (0.08 + i * 0.004) * 100) / 100 }
  })
  return {
    totais: {
      revenueCenters: [
        { rvcNum: 1, employees: employees.slice(0, 5) },
        { rvcNum: 2, employees: employees.slice(3) },
      ],
    },
    nomes: {
      employees: EQUIPE_DEMO.map(([num, fName, lName]) => ({ num, fName, lName })),
    },
  }
}

export default defineHandler<Body, Resposta>(async (ctx) => {
  await ctx.requirePermission('dashboard-simphony.ler')
  const locRef = await locRefDaLoja(ctx, ctx.body.empresaId)
  const data = typeof ctx.body.data === 'string' ? ctx.body.data.trim() : ''
  if (!DATA_RE.test(data)) throw new HttpError(422, 'Data inválida (AAAA-MM-DD).')

  const { totais, nomes } = demo()
    ? equipeDemo(data)
    : await Promise.all([
        chamarBi(ctx, 'getEmployeeDailyTotals', { locRef, busDt: data }),
        chamarBi(ctx, 'getEmployeeDimensions', { locRef }),
      ]).then(([totais, nomes]) => ({ totais, nomes }))

  const nomePorNumero = new Map<number, string>()
  for (const e of lista(nomes, 'employees')) {
    const numero = num(e, 'num')
    const nome = [texto(e, 'fName', 'firstName'), texto(e, 'lName', 'lastName')]
      .filter(Boolean)
      .join(' ')
    if (numero) nomePorNumero.set(numero, nome ? `${numero} - ${nome}` : String(numero))
  }

  const porNumero = new Map<number, Funcionario>()
  for (const rvc of lista(totais, 'revenueCenters')) {
    for (const e of lista(rvc, 'employees')) {
      const numero = num(e, 'empNum')
      if (!numero) continue
      const f = porNumero.get(numero) ?? {
        numero,
        // Fora do cadastro: só o número, como no legado.
        nome: nomePorNumero.get(numero) ?? String(numero),
        contas: 0,
        vendaLiquida: 0,
        servico: 0,
      }
      f.contas += Math.trunc(num(e, 'chkCnt'))
      f.vendaLiquida = somar(f.vendaLiquida, num(e, 'netSlsTtl'))
      f.servico = somar(f.servico, num(e, 'svcTtl'))
      porNumero.set(numero, f)
    }
  }

  const funcionarios = [...porNumero.values()].sort(
    (a, b) => b.vendaLiquida - a.vendaLiquida || a.numero - b.numero
  )
  return { funcionarios }
})

export const config = { integracoes: ['simphony-bi'], secrets: [] }
