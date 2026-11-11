// AUTO-GERADO por `gia pack` — NÃO edite este arquivo.
// Edite os handlers em src/server/<nome>.ts e rode `gia pack` de novo.
// UMA Edge Function por módulo: cada handler é despachado pela rota
//   POST /functions/v1/<moduleId>/<nome>
// (ou pelo campo `__handler` no body, como fallback).
// deno-lint-ignore-file

type GiaUser = { id: string; email?: string }
type EmpresaScope = { all: boolean; empresaIds: number[] }
type GiaOperacao = {
  id: number
  ref: string
  nome: string
  empresaId: number
  tipo?: string
  ativo: boolean
}
type GiaPerfilUsuario = {
  id: string
  email?: string
  nome: string | null
  legacyUserId: string | null
}
type GiaEmpresa = {
  id: number
  nome: string
  razaoSocial: string
  cnpj: string
  icmsVinho: number
  ativo: boolean
  locRefs: Record<string, string>
}
type GiaTextoInput = {
  prompt: string
  instrucoes?: string
  moduleId?: string
}
type GiaTextoSaida = {
  texto: string
  modelo: string
  tokens: { entrada: number; saida: number }
}
type GiaEmailInput = {
  assunto: string
  titulo: string
  subtitulo?: string
  intro?: string
  meta?: { label: string; value: string }[]
  corpoHtml?: string
  nota?: string
}
type PublicServerContext = {
  params: Record<string, string>
  method: string
  url: URL
  ip: string | null
  userAgent: string | null
  body: <B = unknown>() => Promise<B | null>
  html: (corpo: string, init?: { status?: number; headers?: Record<string, string> }) => Response
  json: (dados: unknown, init?: { status?: number }) => Response
  noContent: () => Response
  redirect: (destino: string, status?: 302 | 307 | 308) => Response
}
type PublicServerHandler = (ctx: PublicServerContext) => Response | Promise<Response>
type GiaCredencial = {
  baseUrl: string
  token: string
  expiresAt: string
  escopo: string
}
type ServerContext<B> = {
  body: B
  headers: Headers
  enviarEmail: (input: GiaEmailInput) => Promise<{ enviadoPara: string }>
  credencial: (integracao: string, opts?: { escopo?: string }) => Promise<GiaCredencial>
  gerarTexto: (input: GiaTextoInput) => Promise<GiaTextoSaida>
  user: () => Promise<GiaUser>
  hasPermission: (permission: string) => Promise<boolean>
  requirePermission: (permission: string) => Promise<GiaUser>
  empresaScope: () => Promise<EmpresaScope>
  requireEmpresa: (empresaId: number) => Promise<void>
  empresas: () => Promise<GiaEmpresa[]>
  callModule: <R = unknown>(moduleId: string, handler: string, body?: unknown) => Promise<R>
  perfilUsuario: () => Promise<GiaPerfilUsuario>
  legacyUserId: () => Promise<string | null>
  operacoes: () => Promise<GiaOperacao[]>
  requireOperacao: (ref: string, opcoes?: OpcoesDeOperacao) => Promise<GiaOperacao>
}
/**
 * Modo da checagem de loja.
 *
 * `'escrita'` (o padrão, e o que todo código existente já faz) exige que a loja
 * esteja no escopo do usuário. `'leitura'` aceita qualquer loja ATIVA do portal —
 * mas só para quem tem a permissão `<moduleId>.ler-rede`; sem ela, cai no
 * comportamento estrito, sem erro diferente.
 */
type OpcoesDeOperacao = { modo?: 'leitura' | 'escrita' }
type ServerHandler<B, R> = (ctx: ServerContext<B>) => R | Promise<R>
function defineHandler<B = unknown, R = unknown>(fn: ServerHandler<B, R>): ServerHandler<B, R> {
  return fn
}
// Par público do `defineHandler`. Precisa existir aqui porque o import do SDK é
// removido na consolidação: sem esta linha, um handler público vira
// `ReferenceError: definePublicHandler is not defined` no boot do worker — e nem
// esbuild nem tsc pegam, porque o erro é de runtime em código gerado.
function definePublicHandler(fn: PublicServerHandler): PublicServerHandler {
  return fn
}
class HttpError extends Error {
  readonly status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'HttpError'
    this.status = status
  }
}
function env(key: string): string {
  const v = Deno.env.get(key)
  if (v === undefined || v === '') {
    throw new Error(`[gia/server] env "${key}" não definida (secret da Edge Function).`)
  }
  return v
}
function envOptional(key: string): string | undefined {
  const v = Deno.env.get(key)
  return v === undefined || v === '' ? undefined : v
}
// ── Auth: verificação REAL do JWT no GoTrue (mesmo padrão das funções do
// portal). O wrapper rejeita request sem JWT válido ANTES do handler rodar —
// nunca decode manual de token.
async function __giaVerifyUser(req: Request): Promise<GiaUser> {
  const auth = req.headers.get('Authorization') ?? ''
  if (!/^Bearer\s+\S+/i.test(auth)) throw new HttpError(401, 'JWT ausente')
  const res = await fetch(`${env('SUPABASE_URL')}/auth/v1/user`, {
    headers: { Authorization: auth, apikey: env('SUPABASE_ANON_KEY') },
  })
  if (!res.ok) throw new HttpError(401, 'JWT inválido ou expirado')
  const u = (await res.json()) as { id?: string; email?: string }
  if (!u.id) throw new HttpError(401, 'JWT inválido')
  return { id: u.id, email: u.email }
}
// ── Permissões + escopo: cache materializado do portal (user_permissions_cache),
// lido com service role — o mesmo dado que alimenta a UI, agora imposto no
// server. Uma leitura só serve permissão E escopo de Empresa.
type __GiaCacheRow = {
  effective_permissions?: string[]
  empresa_ids?: number[]
  escopo_todas?: boolean
}
async function __giaCacheRow(userId: string): Promise<__GiaCacheRow> {
  const key = env('SUPABASE_SERVICE_ROLE_KEY')
  const res = await fetch(
    `${env('SUPABASE_URL')}/rest/v1/user_permissions_cache?usuario_id=eq.${userId}` +
      `&select=effective_permissions,empresa_ids,escopo_todas`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` } }
  )
  if (!res.ok) throw new HttpError(500, 'falha ao consultar permissões do usuário')
  const rows = (await res.json()) as __GiaCacheRow[]
  return rows[0] ?? {}
}
// ── Operações no escopo (gia.operacoes). `Accept-Profile` seleciona o schema
// no PostgREST — sem ele a busca cai em `public` e devolve 404.
async function __giaOperacoes(scope: EmpresaScope): Promise<GiaOperacao[]> {
  if (!scope.all && scope.empresaIds.length === 0) return []
  const key = env('SUPABASE_SERVICE_ROLE_KEY')
  const filtro = scope.all ? '' : `&empresa_id=in.(${scope.empresaIds.join(',')})`
  const res = await fetch(
    `${env('SUPABASE_URL')}/rest/v1/operacoes?deleted_at=is.null` +
      `&select=operacao_id,operacao_ref,nome_operacao,tipo_operacao,empresa_id,ativo${filtro}`,
    { headers: { apikey: key, Authorization: `Bearer ${key}`, 'Accept-Profile': 'gia' } }
  )
  if (!res.ok) throw new HttpError(500, 'falha ao consultar as operações do usuário')
  const rows = (await res.json()) as Array<{
    operacao_id: number
    operacao_ref: string
    nome_operacao: string | null
    tipo_operacao: string | null
    empresa_id: number
    ativo: boolean
  }>
  return rows.map((o) => ({
    id: o.operacao_id,
    ref: o.operacao_ref,
    nome: o.nome_operacao ?? o.operacao_ref,
    tipo: o.tipo_operacao ?? undefined,
    empresaId: o.empresa_id,
    ativo: o.ativo,
  }))
}
// ── Empresas no escopo (gia.empresas + gia.empresas_integracoes) ────────────
// O embed `empresas_integracoes(...)` resolve o de-para de plataforma na MESMA
// ida ao PostgREST — o FK empresa_id já existe, então não é join manual.
async function __giaEmpresas(scope: EmpresaScope): Promise<GiaEmpresa[]> {
  if (!scope.all && scope.empresaIds.length === 0) return []
  const key = env('SUPABASE_SERVICE_ROLE_KEY')
  const filtro = scope.all ? '' : `&empresa_id=in.(${scope.empresaIds.join(',')})`
  const res = await fetch(
    `${env('SUPABASE_URL')}/rest/v1/empresas?deleted_at=is.null` +
      `&select=empresa_id,cnpj,razao_social,nome_fantasia,icms_vinho,ativo,` +
      `empresas_integracoes(id,tipo,locref,ativo,deleted_at)` +
      // Empresa com DUAS integrações do MESMO tipo existe (a 93, de laboratório,
      // tem dois TS2). Sem ordenar, qual delas sobrava no `locRefs` dependia da
      // ordem que o PostgREST devolvesse — e o BFF podia escolher a outra pra
      // mesma empresa. Ordenado por `id`, as duas pontas concordam. Quem precisa
      // da outra passa `locRef` explícito no handler.
      `&empresas_integracoes.order=id${filtro}`,
    { headers: { apikey: key, Authorization: `Bearer ${key}`, 'Accept-Profile': 'gia' } }
  )
  if (!res.ok) throw new HttpError(500, 'falha ao consultar as empresas do usuário')
  const rows = (await res.json()) as Array<{
    empresa_id: number
    cnpj: string
    razao_social: string
    nome_fantasia: string | null
    icms_vinho: number | null
    ativo: boolean
    empresas_integracoes?: Array<{
      id: number
      tipo: string
      locref: string
      ativo: boolean
      deleted_at: string | null
    }> | null
  }>
  return rows.map((e) => {
    const locRefs: Record<string, string> = {}
    for (const i of e.empresas_integracoes ?? []) {
      // Integração desativada ou excluída não é identidade válida — deixar
      // vazar aqui faria o módulo escrever numa loja que saiu da plataforma.
      if (!i.ativo || i.deleted_at) continue
      // PRIMEIRO vence (a lista vem ordenada por id). Tem que ser o primeiro, e
      // não o último, pra bater com o `order by i.id limit 1` do BFF — se as
      // duas pontas escolhessem lados opostos, a mesma empresa responderia
      // lojas diferentes conforme quem perguntasse.
      if (locRefs[i.tipo] === undefined) locRefs[i.tipo] = i.locref
    }
    return {
      id: e.empresa_id,
      nome: e.nome_fantasia || e.razao_social,
      razaoSocial: e.razao_social,
      cnpj: e.cnpj,
      icmsVinho: e.icms_vinho ?? 0,
      ativo: e.ativo,
      locRefs,
    }
  })
}
// ── Chamada a handler de OUTRO módulo ───────────────────────────────────────
// Existe porque o `createServerClient` NÃO roda aqui: ele é browser-safe e
// importa o singleton do Supabase, que lê `import.meta.env.VITE_*` na avaliação
// do módulo — o import estoura antes da primeira linha do handler, e nem
// try/catch em volta da chamada pega. Daqui o caminho é este.
//
// Leva o JWT do USUÁRIO: quem o outro módulo autoriza é ele, não este módulo.
async function __giaCallModule(
  moduleId: string,
  handler: string,
  body: unknown,
  req: Request
): Promise<unknown> {
  const auth = req.headers.get('authorization') ?? req.headers.get('Authorization')
  if (!auth) throw new HttpError(401, 'requisição sem Authorization')

  let res: Response
  try {
    res = await fetch(`${env('SUPABASE_URL')}/functions/v1/${moduleId}/${handler}`, {
      method: 'POST',
      headers: {
        Authorization: auth,
        apikey: env('SUPABASE_ANON_KEY'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body ?? {}),
    })
  } catch (e) {
    // Outro módulo fora do ar não é erro DESTE handler — 502, não 500.
    throw new HttpError(502, `módulo "${moduleId}" indisponível (${String(e)})`)
  }

  const texto = await res.text()
  let payload: unknown = null
  try {
    payload = texto ? JSON.parse(texto) : null
  } catch {
    payload = null
  }

  if (!res.ok) {
    const msg = (payload as { error?: string } | null)?.error
    // Preserva o status do outro módulo: 403 de escopo tem que continuar 403
    // pro chamador, senão vira 500 e some a causa.
    throw new HttpError(res.status, msg ?? `${moduleId}/${handler}: HTTP ${res.status}`)
  }
  return payload
}
// ── Email (BFF) ─────────────────────────────────────────────────────────────
// Quem fala SMTP é o BFF, não esta função — de propósito. A credencial de SMTP
// fica de um lado só, e o template do portal (moldura, logo, rodapé) mora junto
// com o dos relatórios, então o email de um módulo não diverge do dos outros.
//
// O JWT do usuário vai junto porque É ele que define o destinatário: o BFF lê o
// claim `email` do token e entrega ali. Não há campo de destinatário na chamada.
//
// `BFF_URL` é lido AQUI, não no topo: um módulo que nunca manda email não pode
// quebrar por causa de uma env que não usa.
// ── IA (manage-ai) ──────────────────────────────────────────────────────────
// Quem fala com o provedor é o PORTAL, não esta função — de propósito. A chave
// fica no vault de um lado só, e o gasto entra na mesma medição e nos mesmos
// tetos do resto do portal. Trocar Gemini por Anthropic lá não muda uma linha
// do módulo: a `manage-ai` normaliza os quatro providers no mesmo formato.
//
// Leva o JWT do usuário porque é dele o teto diário que se aplica.
async function __giaGerarTexto(input: GiaTextoInput, req: Request): Promise<GiaTextoSaida> {
  const auth = req.headers.get('authorization') ?? req.headers.get('Authorization')
  if (!auth) throw new HttpError(401, 'requisição sem Authorization')

  let res: Response
  try {
    res = await fetch(`${env('SUPABASE_URL')}/functions/v1/manage-ai`, {
      method: 'POST',
      headers: {
        Authorization: auth,
        apikey: env('SUPABASE_ANON_KEY'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'gerar-texto',
        prompt: input?.prompt ?? '',
        instrucoes: input?.instrucoes ?? '',
        module_id: input?.moduleId ?? null,
      }),
    })
  } catch (e) {
    throw new HttpError(502, `serviço de IA indisponível (${String(e)})`)
  }

  const texto = await res.text()
  let payload: unknown = null
  try {
    payload = texto ? JSON.parse(texto) : null
  } catch {
    payload = null
  }
  if (!res.ok) {
    const msg = (payload as { error?: string } | null)?.error
    // Preserva o status: 429 (teto), 503 (sem provider) e 400 (prompt grande
    // demais) são acionáveis pelo módulo, e viram ruído se colapsarem em 500.
    throw new HttpError(res.status, msg ?? `falha ao gerar texto: HTTP ${res.status}`)
  }
  return (payload ?? {}) as GiaTextoSaida
}
// Credencial de integração, vinda do hub de Credenciais do portal.
//
// O módulo NÃO decifra segredo nem guarda env: pede o token e recebe um válido.
// Quem renova é o BFF, que é onde a CREDENTIALS_KEY vive — por isso "token
// vencido" não chega até aqui.
//
// O `modulo` mandado ao BFF é o `__MODULE_ID` deste arquivo, e não algo que o
// handler escolha: é o que impede um módulo de pedir a credencial de outro. O
// BFF ainda checa se a integração autoriza esse módulo.
const __giaCredCache = new Map<string, { valor: GiaCredencial; expiraEm: number }>()
async function __giaCredencial(
  integracao: string,
  opts: { escopo?: string } | undefined,
  req: Request
): Promise<GiaCredencial> {
  const escopo = (opts?.escopo ?? '').trim()
  const chave = `${integracao}|${escopo}`
  // Margem de 60s: o token não pode vencer no meio da chamada que ele autoriza.
  const cacheado = __giaCredCache.get(chave)
  if (cacheado && cacheado.expiraEm > Date.now() + 60_000) return cacheado.valor

  const base = envOptional('BFF_URL')
  if (!base) {
    throw new HttpError(503, 'credencial de integração indisponível (BFF_URL não configurada)')
  }
  const auth = req.headers.get('authorization') ?? req.headers.get('Authorization')
  if (!auth) throw new HttpError(401, 'requisição sem Authorization')

  let res: Response
  try {
    res = await fetch(
      `${base.replace(/\/+$/, '')}/integrations/${encodeURIComponent(integracao)}/token`,
      {
        method: 'POST',
        headers: { Authorization: auth, 'Content-Type': 'application/json' },
        body: JSON.stringify({ modulo: __MODULE_ID, escopo }),
      }
    )
  } catch (e) {
    throw new HttpError(502, `hub de credenciais indisponível (${String(e)})`)
  }

  const texto = await res.text()
  let payload: unknown = null
  try {
    payload = texto ? JSON.parse(texto) : null
  } catch {
    payload = null
  }
  if (!res.ok) {
    const msg = (payload as { error?: string } | null)?.error
    // Preserva o status: 403 (módulo não autorizado), 503 (integração ausente ou
    // inativa) e 502 (provedor fora) levam a ações diferentes de quem
    // administra, e viram ruído se colapsarem em 500.
    throw new HttpError(res.status, msg ?? `falha ao obter credencial: HTTP ${res.status}`)
  }

  const d = (payload ?? {}) as { base_url?: string; token?: string; expires_at?: string; escopo?: string }
  if (!d.base_url || !d.token || !d.expires_at) {
    throw new HttpError(502, 'hub de credenciais devolveu resposta incompleta')
  }
  const valor: GiaCredencial = {
    baseUrl: d.base_url.replace(/\/+$/, ''),
    token: d.token,
    expiresAt: d.expires_at,
    escopo: d.escopo ?? escopo,
  }
  __giaCredCache.set(chave, { valor, expiraEm: Date.parse(d.expires_at) })
  return valor
}
async function __giaEnviarEmail(
  input: GiaEmailInput,
  req: Request
): Promise<{ enviadoPara: string }> {
  const base = envOptional('BFF_URL')
  if (!base) {
    throw new HttpError(503, 'envio de email indisponível (BFF_URL não configurada)')
  }
  const auth = req.headers.get('authorization') ?? req.headers.get('Authorization')
  if (!auth) throw new HttpError(401, 'requisição sem Authorization')

  let res: Response
  try {
    res = await fetch(`${base.replace(/\/+$/, '')}/email/enviar`, {
      method: 'POST',
      headers: { Authorization: auth, 'Content-Type': 'application/json' },
      body: JSON.stringify(input ?? {}),
    })
  } catch (e) {
    throw new HttpError(502, `serviço de email indisponível (${String(e)})`)
  }

  const texto = await res.text()
  let payload: unknown = null
  try {
    payload = texto ? JSON.parse(texto) : null
  } catch {
    payload = null
  }
  if (!res.ok) {
    const msg = (payload as { error?: string } | null)?.error
    // Preserva o status: 429 (teto) e 400 (corpo grande demais) são acionáveis
    // pelo módulo, e viram ruído se colapsarem em 500.
    throw new HttpError(res.status, msg ?? `falha ao enviar email: HTTP ${res.status}`)
  }
  return (payload ?? {}) as { enviadoPara: string }
}
// ── Cadastro do usuário (public.usuarios) ───────────────────────────────────
// O `user()` sai do JWT e não tem nome nem o id legado. Uma ida ao PostgREST,
// memoizada por request pelo __giaBuildContext.
async function __giaPerfilUsuario(user: GiaUser): Promise<GiaPerfilUsuario> {
  const vazio = { id: user.id, email: user.email, nome: null, legacyUserId: null }
  const key = env('SUPABASE_SERVICE_ROLE_KEY')
  let res: Response
  try {
    res = await fetch(
      `${env('SUPABASE_URL')}/rest/v1/usuarios?id=eq.${user.id}&select=nome,sobrenome,atributos`,
      { headers: { apikey: key, Authorization: `Bearer ${key}`, 'Accept-Profile': 'public' } }
    )
  } catch {
    // Cadastro é COMPLEMENTO — o usuário já está autenticado. Falha de rede aqui
    // não pode derrubar o handler; devolve o que o JWT garante.
    return vazio
  }
  if (!res.ok) return vazio
  const rows = (await res.json().catch(() => [])) as Array<{
    nome: string | null
    sobrenome: string | null
    atributos: Record<string, unknown> | null
  }>
  const r = rows[0]
  if (!r) return vazio
  const legado = r.atributos?.['legacy_user_id']
  return {
    id: user.id,
    email: user.email,
    nome: r.nome ? [r.nome, r.sobrenome].filter(Boolean).join(' ') : null,
    legacyUserId: typeof legado === 'string' && legado ? legado : null,
  }
}
function __giaNormRef(ref: unknown): string {
  return String(ref ?? '').trim().toLowerCase()
}
function __giaBuildContext(body: unknown, req: Request, user: GiaUser): ServerContext<unknown> {
  let row: Promise<__GiaCacheRow> | null = null
  const cache = () => (row ??= __giaCacheRow(user.id))
  const hasPermission = (permission: string) =>
    cache().then((r) => (r.effective_permissions ?? []).includes(permission))
  const empresaScope = () =>
    cache().then((r) => ({ all: !!r.escopo_todas, empresaIds: r.empresa_ids ?? [] }))
  let ops: Promise<GiaOperacao[]> | null = null
  const operacoes = () => (ops ??= empresaScope().then(__giaOperacoes))
  let emps: Promise<GiaEmpresa[]> | null = null
  const empresas = () => (emps ??= empresaScope().then(__giaEmpresas))
  let perfil: Promise<GiaPerfilUsuario> | null = null
  const perfilUsuario = () => (perfil ??= __giaPerfilUsuario(user))
  const legacyUserId = () => perfilUsuario().then((p) => p.legacyUserId)
  return {
    body,
    headers: req.headers,
    enviarEmail: (input: GiaEmailInput) => __giaEnviarEmail(input, req),
    credencial: (integracao: string, opts?: { escopo?: string }) =>
      __giaCredencial(integracao, opts, req),
    gerarTexto: (input: GiaTextoInput) => __giaGerarTexto(input, req),
    empresas,
    callModule: <R>(moduleId: string, handler: string, b?: unknown) =>
      __giaCallModule(moduleId, handler, b, req) as Promise<R>,
    perfilUsuario,
    legacyUserId,
    user: () => Promise.resolve(user),
    hasPermission,
    requirePermission: async (permission: string) => {
      if (!(await hasPermission(permission))) {
        throw new HttpError(403, `permissão "${permission}" necessária`)
      }
      return user
    },
    empresaScope,
    requireEmpresa: async (empresaId: number) => {
      const s = await empresaScope()
      if (!s.all && !s.empresaIds.includes(empresaId)) {
        throw new HttpError(403, 'empresa fora do seu escopo de acesso')
      }
    },
    operacoes,
    requireOperacao: async (ref: string, opcoes?: OpcoesDeOperacao) => {
      const alvo = __giaNormRef(ref)
      if (!alvo) throw new HttpError(400, 'loja não informada')

      // Modo de LEITURA: alcança qualquer loja ativa do portal, e não só o
      // escopo do usuário. Não é o módulo que decide — é a permissão
      // `<moduleId>.ler-rede`, concedida por administrador do portal a quem
      // deve enxergar a rede inteira.
      //
      // Sem a permissão, cai no caminho estrito de propósito: quem não a tem
      // recebe exatamente o que receberia se o modo não existisse, com a mesma
      // mensagem. Um erro próprio ("você não tem ler-rede") contaria a quem
      // sonda que existe um modo mais amplo e quem o tem.
      if (opcoes?.modo === 'leitura' && (await hasPermission(`${__MODULE_ID}.ler-rede`))) {
        const todas = await __giaOperacoes({ all: true, empresaIds: [] })
        const achada = todas.find((o) => __giaNormRef(o.ref) === alvo)
        if (achada) return achada
        // Loja inexistente no portal responde igual a loja fora do escopo: quem
        // pode ler a rede não precisa saber quais refs existem e quais não.
        throw new HttpError(403, `loja "${ref}" fora do seu escopo de acesso`)
      }

      const found = (await operacoes()).find((o) => __giaNormRef(o.ref) === alvo)
      if (!found) throw new HttpError(403, `loja "${ref}" fora do seu escopo de acesso`)
      return found
    },
  }
}

import postgres from 'https://esm.sh/postgres@3.4.5'
let __sqlClient: ReturnType<typeof postgres> | null = null
function __getClient() {
  if (!__sqlClient) __sqlClient = postgres(env('GIA_SERVER_DATABASE_URL'))
  return __sqlClient
}
function sql<T = unknown[]>(strings: TemplateStringsArray, ...params: unknown[]): Promise<T> {
  return Promise.resolve(__getClient()(strings, ...params) as unknown as Promise<T>)
}
function getDbClient() { return Promise.resolve(__getClient()) }

const __giaHandlers: Record<string, ServerHandler<unknown, unknown>> = {}
const __giaPublicHandlers: Record<string, PublicServerHandler> = {}
const __giaPublicRotas: { handler: string; segmentos: string[]; methods: string[] }[] = []

// ─── src/server/contas.ts ───────────────────────────────────────────────
__giaHandlers["contas"] = (() => {

  // Handler BFF — a matriz do Plano de Contas de UM mês: as 169 contas de cada loja
  // do escopo que tem plano vigente, sem consolidar.
  //
  // ── POR QUE O MÊS INTEIRO, E NÃO SÓ O QUE A TELA MOSTRA ─────────────────────
  //
  // As grades leem o plano inteiro: a árvore do Plano de contas desce até o
  // nível 3, os Comparativos também, e os indicadores gerenciais dependem de contas
  // de todos os grupos. Medido no DW de produção em 18/09/2026: jun/26 são 16.055
  // linhas (95 lojas × 169 contas), ~0,7 s. É consulta síncrona comum; um período
  // de 12 meses são 12 chamadas deste tamanho, cada uma no cache do mês.
  //
  // A consolidação NÃO acontece aqui: é função pura no cliente, e o usuário troca
  // seleção, agrupamento e referência o tempo todo. Buscar uma vez por mês e
  // recalcular no cliente troca uma ida à rede por clique por nenhuma.
  //
  // ── O ESCOPO É O DO USUÁRIO, E O CORPO NÃO CARREGA LOJA ─────────────────────
  //
  // As lojas saem de `ctx.operacoes()`. Handler que recebesse loja no corpo
  // precisaria de `ctx.requireOperacao` — não recebendo, o problema não existe.
  // O `loc_ref` é comparado sem caixa e sem espaço nas pontas, porque foi digitado
  // por gente ao longo de anos.
  //
  // ── ARMADILHAS ──────────────────────────────────────────────────────────────
  //
  //   • `plano_conta.planos.id` é bigint, e o postgres.js o entrega como string.
  //   • O resumo casa pelo `plano_id` dos planos VIGENTES, resolvidos antes: a
  //     `resumo_uk` começa por `indice`, e o join por (ano, mês, loc_ref) faz uma
  //     busca por linha (medido pelo `plano-contas`: ~510 ms contra ~150 ms).
  //   • numeric chega como string — normalizado por `num()`.
  //   • Razões e as contas 11003/11004 descem como estão gravadas. O dado gravado
  //     não é homogêneo (dois sinais no 11003, razões arredondadas a 2 casas), e
  //     quem as refaz é o domínio do cliente, num lugar só e testado.

  interface IndiceDb {
    indice: number
    descricao: string | null
    indice_formatado: string | null
    is_input: boolean | null
    is_group: boolean | null
  }

  interface PlanoDb {
    id: string | number
    loc_ref: string
    entregue: boolean | null
    auditado: boolean | null
  }

  interface ValorDb {
    plano_id: string | number
    indice: number
    valor: string | number | null
  }

  interface OrcadoDb {
    loc_ref: string
    indice: number
    valor: string | number | null
  }

  type StatusPlano = 'Pendente' | 'Entregue' | 'Auditado'

  interface IndiceOut {
    indice: number
    formatado: string
    descricao: string
    isInput: boolean
    isGroup: boolean
  }

  interface LojaOut {
    ref: string
    status: StatusPlano
    valores: Array<number | null>
  }

  interface MatrizOut {
    ano: number
    mes: number
    indices: IndiceOut[]
    lojas: LojaOut[]
  }

  function num(v: unknown): number | null {
    if (v === null || v === undefined) return null
    const n = typeof v === 'number' ? v : Number(v)
    return Number.isFinite(n) ? n : null
  }

  function mesValido(ano: unknown, mes: unknown): { ano: number; mes: number } {
    const a = Number(ano)
    const m = Number(mes)
    if (!Number.isInteger(a) || !Number.isInteger(m) || a < 2000 || a > 2100 || m < 1 || m > 12) {
      throw new HttpError(400, 'Mês inválido.')
    }
    return { ano: a, mes: m }
  }

  // ── QUAIS LOJAS ENTRAM NA CONTA ─────────────────────────────────────────────
  //
  // `ctx.operacoes()` é sempre o ESCOPO DE EMPRESA do usuário, e a SDK não tem
  // modo amplo para LISTAR. Quem conhece a rede inteira é o cliente, que lê o
  // cadastro do portal e manda a lista em `lojas`.
  //
  // Por isso o universo é "escopo ∪ lista do cliente", e a união só acontece para
  // quem tem `dashboard-contas.ler-rede`. Sem a chave, a lista do corpo é ignorada
  // por inteiro e o painel responde pelo escopo.
  //
  // Ampliar aqui não amplia escrita: este módulo não grava em lugar nenhum. Loja
  // inventada no corpo não vira acesso a nada — ela é só chave de busca no
  // data-warehouse, que devolve zero linha para quem não tem plano. E a loja do
  // ESCOPO nunca é sobrescrita pelo que o cliente mandou.
  //
  // ⚠️ DUPLICADO nos dois handlers de propósito: cada um é empacotado sozinho pelo
  // `gia pack`, e handler que importa arquivo local não é o padrão do repositório.
  // Mudança aqui é mudança nos dois.
  interface LojaDoPedido {
    ref: string
    nome: string
  }
  interface ContextoDeLojas {
    body: { lojas?: LojaDoPedido[] }
    operacoes: () => Promise<Array<{ ref: string; nome: string }>>
    hasPermission: (permission: string) => Promise<boolean>
  }

  /**
   * Exportada para os testes. O handler não é testável — depende de `ctx` e do
   * banco —, mas esta é a regra que decide QUAIS LOJAS entram na conta, e errar
   * nela é mostrar loja demais ou de menos sem nada acusar.
   */
  async function universoDeLojas(ctx: ContextoDeLojas): Promise<Map<string, LojaDoPedido>> {
    const universo = new Map<string, LojaDoPedido>()
    for (const o of await ctx.operacoes()) {
      const norm = o.ref.trim().toUpperCase()
      if (norm) universo.set(norm, { ref: o.ref, nome: o.nome })
    }
    if (await ctx.hasPermission('dashboard-contas.ler-rede')) {
      for (const l of ctx.body.lojas ?? []) {
        const norm = String(l?.ref ?? '')
          .trim()
          .toUpperCase()
        if (norm && !universo.has(norm)) universo.set(norm, { ref: l.ref, nome: l.nome || l.ref })
      }
    }
    return universo
  }

  // ── O ORÇADO, PELA MESMA PORTA ──────────────────────────────────────────────
  //
  // `fonte: 'orcado'` troca o Plano de Contas pelo Plano de Orçamentos da loja —
  // o Contra: Orçado da aba Análises adicionais, a aba REAL VS ORÇADO do BI. Os 169
  // índices de `plano_orcamento.indices` são os MESMOS de `plano_conta.indices`
  // (conferidos um a um em produção, 25/09/2026), então o que desce aqui se lê
  // pelas mesmas funções do realizado.
  //
  // A fonte é um de dois valores fixos, e qualquer outro cai no realizado: o
  // cliente escolhe QUAL dos dois planos, nunca uma tabela.
  //
  // O orçamento não tem tabela de planos: o `is_last` mora na linha do resumo, e
  // não há `deletado_em` — o mesmo que o Dashboard de RH encontrou ao ler a mesma
  // tabela. Nenhuma linha vigente duplicada em 2026 (conferido em 28/09/2026).
  //
  // Medido em produção em 28/09/2026: ago/26 do orçado são 15.886 linhas (94
  // lojas × 169 contas), de 0,2 a 0,8 s — o custo da matriz do realizado.
  //
  // O STATUS do orçado não existe para o painel: toda loja sai "Entregue", e nada
  // o lê — o filtro de status e as pendências olham só o realizado.
  type Fonte = 'realizado' | 'orcado'

  const __giaHandler = defineHandler<
    { ano: number; mes: number; lojas?: LojaDoPedido[]; fonte?: Fonte },
    MatrizOut
  >(async (ctx) => {
    await ctx.requirePermission('dashboard-contas.ler')
    const { ano, mes } = mesValido(ctx.body?.ano, ctx.body?.mes)

    const indicesDb = await sql<IndiceDb[]>`
      SELECT i.indice, i.descricao, i.indice_formatado, i.is_input, i.is_group
      FROM "plano_conta"."indices" i
      ORDER BY i.indice
    `
    const indices: IndiceOut[] = indicesDb.map((i) => ({
      indice: i.indice,
      formatado: (i.indice_formatado ?? String(i.indice)).trim(),
      descricao: (i.descricao ?? '').trim(),
      isInput: !!i.is_input,
      isGroup: !!i.is_group,
    }))

    // A comparação com o data-warehouse é sem caixa e sem espaço nas pontas: o
    // `loc_ref` de lá foi digitado por gente ao longo de anos.
    const universo = await universoDeLojas(ctx)
    if (universo.size === 0) return { ano, mes, indices, lojas: [] }
    const refPorNorm = new Map([...universo].map(([norm, l]) => [norm, l.ref]))
    const refsNorm = [...refPorNorm.keys()]

    if (ctx.body?.fonte === 'orcado') {
      const linhas = await sql<OrcadoDb[]>`
        SELECT TRIM(UPPER(r.loc_ref)) AS loc_ref, r.indice, r.valor
        FROM "plano_orcamento"."resumo" r
        WHERE r.ano = ${ano}
          AND r.mes = ${mes}
          AND COALESCE(r.is_last, TRUE) = TRUE
          AND TRIM(UPPER(r.loc_ref)) = ANY(${refsNorm})
      `
      const posicaoDoOrcado = new Map(indices.map((i, k) => [i.indice, k]))
      const porRef = new Map<string, LojaOut>()
      for (const l of linhas) {
        const ref = refPorNorm.get(l.loc_ref)
        const k = posicaoDoOrcado.get(l.indice)
        if (!ref || k === undefined) continue
        let loja = porRef.get(ref)
        if (!loja) {
          loja = { ref, status: 'Entregue', valores: indices.map(() => null) }
          porRef.set(ref, loja)
        }
        loja.valores[k] = num(l.valor)
      }
      return { ano, mes, indices, lojas: [...porRef.values()] }
    }

    const planos = await sql<PlanoDb[]>`
      SELECT p.id, TRIM(UPPER(p.loc_ref)) AS loc_ref, p.entregue, p.auditado
      FROM "plano_conta"."planos" p
      WHERE p.ano = ${ano}
        AND p.mes = ${mes}
        AND p.deletado_em IS NULL
        AND COALESCE(p.is_last, TRUE) = TRUE
        AND TRIM(UPPER(p.loc_ref)) = ANY(${refsNorm})
    `
    if (planos.length === 0) return { ano, mes, indices, lojas: [] }

    // Um plano por loja. O vigente é único pela regra de `is_last`, mas lixo antigo
    // com dois vigentes no mesmo mês faria a loja aparecer duas vezes e dobrar a
    // conta da rede: fica o de id maior, o mais novo.
    const vigentePorRef = new Map<string, PlanoDb>()
    for (const p of planos) {
      const atual = vigentePorRef.get(p.loc_ref)
      if (!atual || BigInt(String(p.id)) > BigInt(String(atual.id))) vigentePorRef.set(p.loc_ref, p)
    }
    const vigentes = [...vigentePorRef.values()]
    const ids = vigentes.map((p) => String(p.id))
    const valores = await sql<ValorDb[]>`
      SELECT r.plano_id, r.indice, r.valor
      FROM "plano_conta"."resumo" r
      WHERE r.plano_id = ANY(${ids}::bigint[])
    `

    const posicao = new Map(indices.map((i, k) => [i.indice, k]))
    const porPlano = new Map<string, LojaOut>()
    for (const p of vigentes) {
      const ref = refPorNorm.get(p.loc_ref)
      if (!ref) continue
      // A situação é a regra do próprio `plano-contas`: não há coluna de status.
      const status: StatusPlano = p.entregue ? (p.auditado ? 'Auditado' : 'Entregue') : 'Pendente'
      porPlano.set(String(p.id), { ref, status, valores: indices.map(() => null) })
    }
    for (const v of valores) {
      const loja = porPlano.get(String(v.plano_id))
      const k = posicao.get(v.indice)
      if (!loja || k === undefined) continue
      loja.valores[k] = num(v.valor)
    }

    return { ano, mes, indices, lojas: [...porPlano.values()] }
  })


  return __giaHandler
})() as ServerHandler<unknown, unknown>

// ─── src/server/operacoes.ts ────────────────────────────────────────────
__giaHandlers["operacoes"] = (() => {

  // Handler BFF — a lista de operações do escopo do usuário, e só ela.
  //
  // O painel abre SEM operação marcada: o usuário escolhe o que quer ver antes de
  // o módulo buscar qualquer número (o mesmo arranjo do Dashboard de RH). Mas o
  // seletor precisa da lista para existir, e buscá-la de carona na matriz do mês
  // seria pagar ~150 KB só para montar o seletor.
  //
  // Aqui não há consulta ao data-warehouse: a lista é o `ctx.operacoes()`, o mesmo
  // escopo que o `contas` usa para recortar. As duas nunca divergem — a operação
  // que aparece no seletor é exatamente a que o painel sabe consultar.
  //
  // O `empresaId` desce junto porque é por ele que o cliente descobre o estado, a
  // região da rede e o vínculo de matriz — os três são do cadastro da EMPRESA.

  interface OperacaoOut {
    ref: string
    nome: string
    empresaId: number
  }

  const __giaHandler = defineHandler<Record<string, never>, OperacaoOut[]>(async (ctx) => {
    await ctx.requirePermission('dashboard-contas.ler')
    const operacoes = await ctx.operacoes()
    return operacoes.map((o) => ({ ref: o.ref, nome: o.nome, empresaId: o.empresaId }))
  })

  return __giaHandler
})() as ServerHandler<unknown, unknown>

// ─── src/server/serie.ts ────────────────────────────────────────────────
__giaHandlers["serie"] = (() => {

  // Handler BFF — a série da EVOLUÇÃO: poucas contas, por loja, nos meses que
  // terminam no mês pedido (12 por padrão).
  //
  // ── POR QUE UMA CONSULTA À PARTE ────────────────────────────────────────────
  //
  // Os gráficos de evolução da Visão geral precisam de 12 meses, e esticar a
  // matriz inteira (`contas`, 169 contas) por 12 meses seriam ~190 mil linhas para
  // desenhar oito números por mês. Aqui descem só as contas que os gráficos usam
  // (~9 mil linhas num ano de 95 lojas). O mesmo arranjo do `historico` do
  // Dashboard de RH.
  //
  // As contas são FIXAS e não vêm do corpo: o cliente não escolhe o que o servidor
  // lê. A consolidação (somar as lojas selecionadas, recalcular a rentabilidade)
  // continua no cliente, pelas mesmas funções da matriz.
  //
  // O escopo é o de `ctx.operacoes()`; o corpo não carrega loja.

  /**
   * As contas que descem, na ordem em que entram no vetor de cada mês (a posição é
   * contrato com `src/visao.ts`, que monta o catálogo da série a partir de
   * `contas`).
   *
   * Os oito primeiros desenham o gráfico de resultado: 1 faturamento ·
   * 2 matéria-prima · 3 impostos · 4 custos operacionais · 5 investimentos ·
   * 6 lucro s/ invest. · 7 lucro c/ invest. · 10103 variação de estoque.
   *
   * ⚠️ Os demais são as PARCELAS das razões que a faixa de indicadores desenha no
   * tempo, e a lista tem de conter TODAS elas: razão a que falte uma parcela é
   * calculada com a parcela valendo zero, e sai um número errado sem aviso.
   *
   * - 10200 LABOR (sobre o faturamento);
   * - 10101 = 2 ÷ (1 − 1.1.4 − 1.2.2 − 1.5 − 1.6 − 1.7 − 1.8);
   * - 20001 = 4.10.1 ÷ 1.2 · 20002 = 1.1.3 ÷ 2.2.2 · 20003 = 1.1.4 ÷ 4.10.2.
   *
   * São 20 contas: num ano de 95 lojas, ~22 mil linhas — a matriz inteira (169
   * contas) daria ~190 mil para desenhar uma linha por mês.
   */
  const CONTAS = [
    1000, 2000, 3000, 4000, 6000, 7000, 8000, 10103, 10200, 1130, 1140, 1200, 1220, 1500, 1600, 1700,
    1800, 2220, 4911, 4912,
  ]

  const TETO_DE_MESES = 24

  interface PlanoDb {
    id: string | number
    ano: number
    mes: number
    loc_ref: string
  }

  interface ValorDb {
    plano_id: string | number
    indice: number
    valor: string | number | null
  }

  interface OrcadoDb {
    loc_ref: string
    ano: number
    mes: number
    indice: number
    valor: string | number | null
  }

  interface SerieOut {
    meses: Array<{ ano: number; mes: number }>
    contas: number[]
    lojas: Array<{ ref: string; porMes: Array<Array<number | null> | null> }>
  }

  function num(v: unknown): number | null {
    if (v === null || v === undefined) return null
    const n = typeof v === 'number' ? v : Number(v)
    return Number.isFinite(n) ? n : null
  }

  // ── QUAIS LOJAS ENTRAM NA CONTA ─────────────────────────────────────────────
  //
  // `ctx.operacoes()` é sempre o ESCOPO DE EMPRESA do usuário, e a SDK não tem
  // modo amplo para LISTAR. Quem conhece a rede inteira é o cliente, que lê o
  // cadastro do portal e manda a lista em `lojas`.
  //
  // Por isso o universo é "escopo ∪ lista do cliente", e a união só acontece para
  // quem tem `dashboard-contas.ler-rede`. Sem a chave, a lista do corpo é ignorada
  // por inteiro e o painel responde pelo escopo.
  //
  // Ampliar aqui não amplia escrita: este módulo não grava em lugar nenhum. Loja
  // inventada no corpo não vira acesso a nada — ela é só chave de busca no
  // data-warehouse, que devolve zero linha para quem não tem plano. E a loja do
  // ESCOPO nunca é sobrescrita pelo que o cliente mandou.
  //
  // ⚠️ DUPLICADO nos dois handlers de propósito: cada um é empacotado sozinho pelo
  // `gia pack`, e handler que importa arquivo local não é o padrão do repositório.
  // Mudança aqui é mudança nos dois.
  interface LojaDoPedido {
    ref: string
    nome: string
  }
  interface ContextoDeLojas {
    body: { lojas?: LojaDoPedido[] }
    operacoes: () => Promise<Array<{ ref: string; nome: string }>>
    hasPermission: (permission: string) => Promise<boolean>
  }

  /**
   * Exportada para os testes. O handler não é testável — depende de `ctx` e do
   * banco —, mas esta é a regra que decide QUAIS LOJAS entram na conta, e errar
   * nela é mostrar loja demais ou de menos sem nada acusar.
   */
  async function universoDeLojas(ctx: ContextoDeLojas): Promise<Map<string, LojaDoPedido>> {
    const universo = new Map<string, LojaDoPedido>()
    for (const o of await ctx.operacoes()) {
      const norm = o.ref.trim().toUpperCase()
      if (norm) universo.set(norm, { ref: o.ref, nome: o.nome })
    }
    if (await ctx.hasPermission('dashboard-contas.ler-rede')) {
      for (const l of ctx.body.lojas ?? []) {
        const norm = String(l?.ref ?? '')
          .trim()
          .toUpperCase()
        if (norm && !universo.has(norm)) universo.set(norm, { ref: l.ref, nome: l.nome || l.ref })
      }
    }
    return universo
  }

  // ── O ORÇADO, PELA MESMA PORTA ──────────────────────────────────────────────
  //
  // `fonte: 'orcado'` troca o Plano de Contas pelo Plano de Orçamentos da loja —
  // o Contra: Orçado da aba Análises adicionais, a aba REAL VS ORÇADO do BI. Os 169
  // índices de `plano_orcamento.indices` são os MESMOS de `plano_conta.indices`
  // (conferidos um a um em produção, 25/09/2026), então o que desce aqui se lê
  // pelas mesmas funções do realizado.
  //
  // A fonte é um de dois valores fixos, e qualquer outro cai no realizado: o
  // cliente escolhe QUAL dos dois planos, nunca uma tabela.
  //
  // O orçamento não tem tabela de planos: o `is_last` mora na linha do resumo, e
  // não há `deletado_em` — o mesmo que o Dashboard de RH encontrou ao ler a mesma
  // tabela. Nenhuma linha vigente duplicada em 2026 (conferido em 28/09/2026).
  //
  // Medido em produção em 28/09/2026: os 12 meses de 2026 em 9 contas são ~10 mil
  // linhas, 0,3 s.
  type Fonte = 'realizado' | 'orcado'

  const __giaHandler = defineHandler<
    { ano: number; mes: number; meses?: number; lojas?: LojaDoPedido[]; fonte?: Fonte },
    SerieOut
  >(async (ctx) => {
    await ctx.requirePermission('dashboard-contas.ler')
    const ano = Number(ctx.body?.ano)
    const mes = Number(ctx.body?.mes)
    const quantos = ctx.body?.meses == null ? 12 : Number(ctx.body.meses)
    if (
      !Number.isInteger(ano) ||
      !Number.isInteger(mes) ||
      !Number.isInteger(quantos) ||
      ano < 2000 ||
      ano > 2100 ||
      mes < 1 ||
      mes > 12 ||
      quantos < 1 ||
      quantos > TETO_DE_MESES
    ) {
      throw new HttpError(400, 'Período inválido.')
    }

    // A janela em "número de mês" (ano × 12 + mês − 1): comparar um inteiro só
    // dispensa a aritmética de virada de ano no SQL.
    const fim = ano * 12 + (mes - 1)
    const inicio = fim - (quantos - 1)
    const meses = Array.from({ length: quantos }, (_, i) => ({
      ano: Math.floor((inicio + i) / 12),
      mes: ((inicio + i) % 12) + 1,
    }))

    const universo = await universoDeLojas(ctx)
    if (universo.size === 0) return { meses, contas: CONTAS, lojas: [] }
    const refPorNorm = new Map([...universo].map(([norm, l]) => [norm, l.ref]))
    const refsNorm = [...refPorNorm.keys()]
    const posicaoConta = new Map(CONTAS.map((c, k) => [c, k]))

    if (ctx.body?.fonte === 'orcado') {
      const linhas = await sql<OrcadoDb[]>`
        SELECT TRIM(UPPER(r.loc_ref)) AS loc_ref, r.ano, r.mes, r.indice, r.valor
        FROM "plano_orcamento"."resumo" r
        WHERE (r.ano * 12 + r.mes - 1) BETWEEN ${inicio} AND ${fim}
          AND COALESCE(r.is_last, TRUE) = TRUE
          AND r.indice = ANY(${CONTAS}::int[])
          AND TRIM(UPPER(r.loc_ref)) = ANY(${refsNorm})
      `
      const doOrcado = new Map<string, { ref: string; porMes: Array<Array<number | null> | null> }>()
      for (const l of linhas) {
        const ref = refPorNorm.get(l.loc_ref)
        const k = posicaoConta.get(l.indice)
        if (!ref || k === undefined) continue
        let loja = doOrcado.get(ref)
        if (!loja) {
          loja = { ref, porMes: meses.map(() => null) }
          doOrcado.set(ref, loja)
        }
        const i = l.ano * 12 + l.mes - 1 - inicio
        let vetor = loja.porMes[i]
        if (!vetor) {
          vetor = CONTAS.map(() => null)
          loja.porMes[i] = vetor
        }
        vetor[k] = num(l.valor)
      }
      return { meses, contas: CONTAS, lojas: [...doOrcado.values()] }
    }

    const planos = await sql<PlanoDb[]>`
        SELECT p.id, p.ano, p.mes, TRIM(UPPER(p.loc_ref)) AS loc_ref
        FROM "plano_conta"."planos" p
        WHERE (p.ano * 12 + p.mes - 1) BETWEEN ${inicio} AND ${fim}
          AND p.deletado_em IS NULL
          AND COALESCE(p.is_last, TRUE) = TRUE
          AND TRIM(UPPER(p.loc_ref)) = ANY(${refsNorm})
      `
    if (planos.length === 0) return { meses, contas: CONTAS, lojas: [] }

    // Um plano por loja e mês — o de id maior, se houver lixo com dois vigentes.
    const vigente = new Map<string, PlanoDb>()
    for (const p of planos) {
      const chave = `${p.loc_ref}|${p.ano * 12 + p.mes - 1}`
      const atual = vigente.get(chave)
      if (!atual || BigInt(String(p.id)) > BigInt(String(atual.id))) vigente.set(chave, p)
    }
    const ids = [...vigente.values()].map((p) => String(p.id))

    const valores = await sql<ValorDb[]>`
        SELECT r.plano_id, r.indice, r.valor
        FROM "plano_conta"."resumo" r
        WHERE r.plano_id = ANY(${ids}::bigint[])
          AND r.indice = ANY(${CONTAS}::int[])
      `

    const lojas = new Map<string, { ref: string; porMes: Array<Array<number | null> | null> }>()
    const vetorPorPlano = new Map<string, Array<number | null>>()
    for (const p of vigente.values()) {
      const ref = refPorNorm.get(p.loc_ref)
      if (!ref) continue
      let loja = lojas.get(ref)
      if (!loja) {
        loja = { ref, porMes: meses.map(() => null) }
        lojas.set(ref, loja)
      }
      const vetor: Array<number | null> = CONTAS.map(() => null)
      loja.porMes[p.ano * 12 + p.mes - 1 - inicio] = vetor
      vetorPorPlano.set(String(p.id), vetor)
    }
    for (const v of valores) {
      const vetor = vetorPorPlano.get(String(v.plano_id))
      const k = posicaoConta.get(v.indice)
      if (!vetor || k === undefined) continue
      vetor[k] = num(v.valor)
    }

    return { meses, contas: CONTAS, lojas: [...lojas.values()] }
  })


  return __giaHandler
})() as ServerHandler<unknown, unknown>

const __MODULE_ID = "dashboard-contas"
const __CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// ─── Rota pública ─────────────────────────────────────────────────────────
//
// Chega por `/p/<moduleId>/<resto...>`, que o proxy do portal reescreve para
// `/<moduleId>/__public/<resto...>` antes de bater aqui. O segmento reservado é
// o que separa os dois mundos: sem ele, nada nesta seção é alcançável, e o
// dispatcher autenticado segue sendo o único caminho.
const __PUBLIC_PREFIX = '__public'

/** Casa `:nome` do path declarado contra os segmentos da URL. */
function __giaCasaRota(
  segmentos: string[],
  alvo: string[]
): Record<string, string> | null {
  if (segmentos.length !== alvo.length) return null
  const params: Record<string, string> = {}
  for (let i = 0; i < segmentos.length; i++) {
    const s = segmentos[i]!
    if (s.startsWith(':')) {
      if (!alvo[i]) return null
      params[s.slice(1)] = decodeURIComponent(alvo[i]!)
    } else if (s !== alvo[i]) {
      return null
    }
  }
  return params
}

function __giaPublicCtx(req: Request, params: Record<string, string>): PublicServerContext {
  const url = new URL(req.url)
  const resposta = (corpo: BodyInit | null, status: number, headers: Record<string, string>) =>
    new Response(corpo, { status, headers })
  return {
    params,
    method: req.method,
    url,
    // Cabeçalhos postos pelo proxy. NÃO são identidade: dá para forjar. Servem
    // para limitar abuso, e é só isso que se deve pendurar neles.
    ip:
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      req.headers.get('x-real-ip') ??
      null,
    userAgent: req.headers.get('user-agent'),
    body: async <B = unknown>() => {
      try {
        return (await req.json()) as B
      } catch {
        return null
      }
    },
    html: (corpo, init) =>
      resposta(corpo, init?.status ?? 200, {
        'Content-Type': 'text/html; charset=utf-8',
        // Página pública de passagem não deve ser cacheada por proxy: o destino
        // muda quando o cadastro muda, e cache velho manda o cliente ao lugar errado.
        'Cache-Control': 'no-store',
        ...(init?.headers ?? {}),
      }),
    json: (dados, init) =>
      resposta(JSON.stringify(dados ?? null), init?.status ?? 200, {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      }),
    noContent: () => new Response(null, { status: 204 }),
    redirect: (destino, status) => new Response(null, { status: status ?? 302, headers: { Location: destino } }),
  }
}

/** Despacha a requisição pública, ou devolve null se não for uma. */
async function __giaDespachaPublico(req: Request): Promise<Response | null> {
  const segs = new URL(req.url).pathname.split('/').filter(Boolean)
  const i = segs.indexOf(__PUBLIC_PREFIX)
  if (i < 0) return null
  const resto = segs.slice(i + 1)

  for (const rota of __giaPublicRotas) {
    const params = __giaCasaRota(rota.segmentos, resto)
    if (!params) continue
    if (!rota.methods.includes(req.method)) {
      return new Response(null, { status: 405, headers: { Allow: rota.methods.join(', ') } })
    }
    try {
      return await __giaPublicHandlers[rota.handler]!(__giaPublicCtx(req, params))
    } catch (err) {
      // Rota pública não conta o que deu errado: a mensagem iria para um
      // desconhecido, e detalhe de erro é o que a varredura procura. O motivo
      // fica no log.
      console.error(
        `[${__MODULE_ID}] rota pública ${rota.handler}: ${err instanceof Error ? err.message : String(err)}`
      )
      return new Response(null, { status: 500 })
    }
  }
  // Caminho público que não casa com rota nenhuma: 404 seco, sem dizer quais
  // existem.
  return new Response(null, { status: 404 })
}

/** Resolve o handler pela rota (/functions/v1/<moduleId>/<nome>) ou pelo body. */
function __giaResolveName(req: Request, body: unknown): string | null {
  const segs = new URL(req.url).pathname.split('/').filter(Boolean)
  const last = segs[segs.length - 1]
  if (last && last !== __MODULE_ID && last in __giaHandlers) return last
  const fromBody = (body as { __handler?: unknown } | null)?.__handler
  return typeof fromBody === 'string' && fromBody in __giaHandlers ? fromBody : null
}

Deno.serve(async (req: Request) => {
  // Público ANTES do OPTIONS e do JWT: quem chega aqui não tem sessão, e a
  // resposta não leva CORS aberto porque a página é servida do mesmo host.
  const publico = await __giaDespachaPublico(req)
  if (publico) return publico

  if (req.method === 'OPTIONS') return new Response('ok', { headers: __CORS })
  /**
   * O id que o CLIENTE gerou para esta chamada ("x-gia-call-id").
   *
   * Vai para o log de toda falha e volta no header da resposta. É por ele que se acha a
   * chamada no log sem depender de casar horário com o relato — inclusive quando a
   * resposta não chega ao navegador, que é quando a "ref" do handler não existe.
   */
  const callId = req.headers.get('x-gia-call-id') ?? 'sem-id'
  const comId = { ...__CORS, 'Content-Type': 'application/json', 'x-gia-call-id': callId }
  try {
    const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {}
    const name = __giaResolveName(req, body)
    if (!name) {
      throw new HttpError(
        404,
        `handler não encontrado nesta função. Disponíveis: ${Object.keys(__giaHandlers).join(', ')}`
      )
    }
    // JWT verificado SEMPRE, antes do handler — este endpoint só atende
    // usuário autenticado do portal (princípio nº 1 do CLAUDE.md).
    const user = await __giaVerifyUser(req)
    const result = await __giaHandlers[name]!(__giaBuildContext(body, req, user))
    return new Response(JSON.stringify(result ?? null), { headers: comId })
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500
    const message = err instanceof Error ? err.message : String(err)
    // Uma linha por falha, com o id do cliente na frente — é o que torna o log
    // pesquisável por quem recebeu o erro na tela.
    console.error(`[${__MODULE_ID}] call=${callId} status=${status} — ${message}`)
    // ⚠️ 502 e 504 NÃO chegam ao navegador: a Cloudflare na frente do portal troca o corpo
    // da origem por "error code: 502" SEM os headers de CORS, e o navegador bloqueia a
    // resposta — a tela via "Failed to send a request to the Edge Function" no lugar da
    // mensagem do handler (ADM APP, 19/10/2026; 500, 503 e 424 passam intactos, medido).
    // Sai 503, que é o mesmo "dependência fora", e o status original vai no header e no corpo.
    const naBorda = status === 502 || status === 504 ? 503 : status
    return new Response(
      JSON.stringify(naBorda === status ? { error: message, callId } : { error: message, callId, status }),
      {
        status: naBorda,
        headers: naBorda === status ? comId : { ...comId, 'x-gia-status-original': String(status) },
      }
    )
  }
})
