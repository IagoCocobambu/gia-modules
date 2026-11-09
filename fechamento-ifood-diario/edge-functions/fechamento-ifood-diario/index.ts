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
  rankings: Record<string, string | null>
}
type GiaEc = { ec: string; tipo: 'maquineta' | 'link' | 'ecommerce' | null; ativo: boolean }
type GiaEcAlterado = GiaEc & { empresaId: number; alterado: boolean }
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
  tipoRegistro: 'empresa' | 'propriedade'
  icmsVinho: number
  ativo: boolean
  locRefs: Record<string, string>
  ecs: GiaEc[]
}
type GiaArmazem = {
  id: number
  nome: string
  codigo: string
  localEstoque: { id: number; nome: string }
  empresaOdoo: { id: number; nome: string }
  empresaId: number
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
  expiresAt: string | null
  escopo: string
  parametros: Record<string, string>
}
type ServerContext<B = unknown> = {
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
  definirTipoEc: (ec: string, tipo: GiaEc['tipo']) => Promise<GiaEcAlterado>
  armazens: () => Promise<GiaArmazem[]>
  requireArmazem: (armazemId: number) => Promise<GiaArmazem>
  requireDestino: (localEstoqueId: number) => Promise<GiaArmazem>
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
// O ranking por área (gia.operacoes_rankings) vem no MESMO embed: sem linha =
// não classificada (a chave fica de fora), `opcao_id` nulo = não se aplica.
async function __giaOperacoes(scope: EmpresaScope): Promise<GiaOperacao[]> {
  if (!scope.all && scope.empresaIds.length === 0) return []
  const key = env('SUPABASE_SERVICE_ROLE_KEY')
  const filtro = scope.all ? '' : `&empresa_id=in.(${scope.empresaIds.join(',')})`
  const res = await fetch(
    `${env('SUPABASE_URL')}/rest/v1/operacoes?deleted_at=is.null` +
      `&select=operacao_id,operacao_ref,nome_operacao,tipo_operacao,empresa_id,ativo,` +
      `operacoes_rankings(rankings_areas(chave,ativo),rankings_opcoes(nome))${filtro}`,
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
    operacoes_rankings?: Array<{
      rankings_areas: { chave: string; ativo: boolean } | null
      rankings_opcoes: { nome: string } | null
    }> | null
  }>
  return rows.map((o) => {
    const rankings: Record<string, string | null> = {}
    for (const r of o.operacoes_rankings ?? []) {
      // Área desativada sai do cadastro — não deixar o valor antigo vazar.
      if (!r.rankings_areas?.ativo) continue
      rankings[r.rankings_areas.chave] = r.rankings_opcoes?.nome ?? null
    }
    return {
      id: o.operacao_id,
      ref: o.operacao_ref,
      nome: o.nome_operacao ?? o.operacao_ref,
      tipo: o.tipo_operacao ?? undefined,
      empresaId: o.empresa_id,
      ativo: o.ativo,
      rankings,
    }
  })
}
// ── Empresas no escopo (gia.empresas + gia.empresas_integracoes + gia.empresas_ecs)
// O embed `empresas_integracoes(...)` resolve o de-para de plataforma na MESMA
// ida ao PostgREST — o FK empresa_id já existe, então não é join manual.
async function __giaEmpresas(scope: EmpresaScope): Promise<GiaEmpresa[]> {
  if (!scope.all && scope.empresaIds.length === 0) return []
  const key = env('SUPABASE_SERVICE_ROLE_KEY')
  const filtro = scope.all ? '' : `&empresa_id=in.(${scope.empresaIds.join(',')})`
  const res = await fetch(
    `${env('SUPABASE_URL')}/rest/v1/empresas?deleted_at=is.null` +
      `&select=empresa_id,cnpj,tipo_registro,razao_social,nome_fantasia,icms_vinho,ativo,` +
      `empresas_integracoes(id,tipo,locref,ativo,deleted_at),` +
      // `dados_cielo` fica de fora de propósito: é o cadastro da adquirente, não
      // a identidade do EC.
      `empresas_ecs(ec,tipo,ativo,deleted_at)` +
      // Empresa com DUAS integrações do MESMO tipo existe (a 93, de laboratório,
      // tem dois TS2). Sem ordenar, qual delas sobrava no `locRefs` dependia da
      // ordem que o PostgREST devolvesse — e o BFF podia escolher a outra pra
      // mesma empresa. Ordenado por `id`, as duas pontas concordam. Quem precisa
      // da outra passa `locRef` explícito no handler.
      `&empresas_integracoes.order=id&empresas_ecs.order=id${filtro}`,
    { headers: { apikey: key, Authorization: `Bearer ${key}`, 'Accept-Profile': 'gia' } }
  )
  if (!res.ok) throw new HttpError(500, 'falha ao consultar as empresas do usuário')
  const rows = (await res.json()) as Array<{
    empresa_id: number
    cnpj: string
    tipo_registro: string | null
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
    empresas_ecs?: Array<{
      ec: string
      tipo: GiaEc['tipo']
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
      // A coluna é NOT NULL com padrão 'empresa' (0334); o padrão aqui só
      // cobre banco anterior a ela, onde tudo era empresa.
      tipoRegistro: e.tipo_registro === 'propriedade' ? 'propriedade' : 'empresa',
      icmsVinho: e.icms_vinho ?? 0,
      ativo: e.ativo,
      locRefs,
      ecs: (e.empresas_ecs ?? [])
        .filter((x) => !x.deleted_at)
        .map((x) => ({ ec: x.ec, tipo: x.tipo, ativo: x.ativo })),
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

  const d = (payload ?? {}) as {
    base_url?: string
    token?: string
    expires_at?: string | null
    escopo?: string
    parametros?: Record<string, unknown> | null
  }
  if (!d.base_url || !d.token) {
    throw new HttpError(502, 'hub de credenciais devolveu resposta incompleta')
  }
  // `parametros`: o que a chamada precisa além do token, nas credenciais de chave
  // de API (no Odoo, `db` e `usuario` = uid do usuário de serviço). Tudo vira texto.
  const parametros: Record<string, string> = {}
  for (const [k, v] of Object.entries(d.parametros ?? {})) {
    if (v !== null && v !== undefined) parametros[k] = String(v)
  }
  const valor: GiaCredencial = {
    baseUrl: d.base_url.replace(/\/+$/, ''),
    token: d.token,
    expiresAt: d.expires_at ?? null,
    escopo: d.escopo ?? escopo,
    parametros,
  }
  // Chave de API não vence (`expires_at` nulo): guarda por 5 minutos, para que
  // uma chave trocada no hub chegue aos módulos sem reiniciar a função.
  const expiraEm = d.expires_at ? Date.parse(d.expires_at) : Date.now() + 5 * 60_000
  __giaCredCache.set(chave, { valor, expiraEm })
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
// ── Tipo do EC (gia.ec_definir_tipo) ───────────────────────────────────────
// Escrita no cadastro de ECs SEM `empresas.editar`. Quem decide é o banco: a
// função exige que ESTE módulo esteja na lista do portal
// (gia.empresas_ecs_modulos_autorizados), que o usuário tenha
// `<moduleId>.ecs-tipo` e que o EC seja de uma loja do escopo dele.
//
// Vai com o JWT do usuário, e não com a service role, por dois motivos: a
// permissão e o escopo conferidos são os dele, e a auditoria registra quem
// alterou. O `p_modulo` é o `__MODULE_ID` deste arquivo — o handler não escolhe.
async function __giaDefinirTipoEc(
  ec: string,
  tipo: GiaEc['tipo'],
  req: Request
): Promise<GiaEcAlterado> {
  const auth = req.headers.get('authorization') ?? req.headers.get('Authorization')
  if (!auth) throw new HttpError(401, 'requisição sem Authorization')

  let res: Response
  try {
    res = await fetch(`${env('SUPABASE_URL')}/rest/v1/rpc/ec_definir_tipo`, {
      method: 'POST',
      headers: {
        Authorization: auth,
        apikey: env('SUPABASE_ANON_KEY'),
        'Content-Type': 'application/json',
        'Content-Profile': 'gia',
      },
      body: JSON.stringify({ p_modulo: __MODULE_ID, p_ec: String(ec ?? ''), p_tipo: tipo ?? null }),
    })
  } catch (e) {
    throw new HttpError(502, `cadastro de ECs indisponível (${String(e)})`)
  }

  const texto = await res.text()
  let payload: unknown = null
  try {
    payload = texto ? JSON.parse(texto) : null
  } catch {
    payload = null
  }
  if (!res.ok) {
    const p = (payload ?? {}) as { code?: string; message?: string }
    // O código do Postgres diz o que houve; o status HTTP do PostgREST não
    // distingue "sem permissão" de "EC inexistente" com a precisão necessária.
    const status =
      p.code === '42501' ? 403 : p.code === 'P0002' ? 404 : p.code === '22023' ? 400 : res.status
    throw new HttpError(status, p.message ?? `falha ao alterar o tipo do EC: HTTP ${res.status}`)
  }
  const d = (payload ?? {}) as {
    ec?: string
    tipo?: GiaEc['tipo']
    ativo?: boolean
    empresaId?: number
    alterado?: boolean
  }
  return {
    ec: d.ec ?? String(ec),
    tipo: d.tipo ?? null,
    ativo: d.ativo ?? true,
    empresaId: Number(d.empresaId ?? 0),
    alterado: !!d.alterado,
  }
}
// ── Armazéns do Odoo (odoo.armazens_do_usuario) ────────────────────────────
// O escopo EFETIVO: concedido ao usuário ∩ permitido pelo escopo de lojas atual
// ∩ ativo no Odoo. Quem calcula é o banco; aqui só se lê. Service role com o id
// verificado do usuário — o mesmo caminho do cache de permissões. `Content-Profile`
// seleciona o schema no POST de RPC do PostgREST.
async function __giaArmazens(userId: string): Promise<GiaArmazem[]> {
  const key = env('SUPABASE_SERVICE_ROLE_KEY')
  let res: Response
  try {
    res = await fetch(`${env('SUPABASE_URL')}/rest/v1/rpc/armazens_do_usuario`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Content-Profile': 'odoo',
      },
      body: JSON.stringify({ p_usuario: userId }),
    })
  } catch (e) {
    throw new HttpError(502, `escopo de armazéns indisponível (${String(e)})`)
  }
  if (!res.ok) throw new HttpError(500, 'falha ao consultar os armazéns do usuário')
  const rows = (await res.json()) as Array<{
    armazem_id: number
    nome: string | null
    codigo: string | null
    local_estoque_id: number | null
    local_estoque_nome: string | null
    empresa_odoo_id: number | null
    empresa_odoo_nome: string | null
    empresa_id: number
  }>
  return rows.map((r) => ({
    id: Number(r.armazem_id),
    nome: r.nome ?? '',
    codigo: r.codigo ?? '',
    localEstoque: { id: Number(r.local_estoque_id ?? 0), nome: r.local_estoque_nome ?? '' },
    empresaOdoo: { id: Number(r.empresa_odoo_id ?? 0), nome: r.empresa_odoo_nome ?? '' },
    empresaId: Number(r.empresa_id),
  }))
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
  const definirTipoEc = async (ec: string, tipo: GiaEc['tipo']) => {
    const r = await __giaDefinirTipoEc(ec, tipo, req)
    // A lista memoizada ficou velha: a próxima leitura busca de novo.
    emps = null
    return r
  }
  let arms: Promise<GiaArmazem[]> | null = null
  const armazens = () => (arms ??= __giaArmazens(user.id))
  // 403 nos dois casos, com a mesma mensagem para inexistente e fora do escopo:
  // quem sonda não descobre quais ids existem no Odoo.
  const requireArmazem = async (armazemId: number) => {
    const id = Number(armazemId)
    const achado = Number.isFinite(id) ? (await armazens()).find((a) => a.id === id) : undefined
    if (!achado) throw new HttpError(403, `armazém "${armazemId}" fora do seu escopo de acesso`)
    return achado
  }
  const requireDestino = async (localEstoqueId: number) => {
    const id = Number(localEstoqueId)
    const achado = Number.isFinite(id)
      ? (await armazens()).find((a) => a.localEstoque.id === id)
      : undefined
    if (!achado) throw new HttpError(403, `destino "${localEstoqueId}" fora do seu escopo de acesso`)
    return achado
  }
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
    definirTipoEc,
    armazens,
    requireArmazem,
    requireDestino,
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

// ─── src/server/fechamento.ts ───────────────────────────────────────────
__giaHandlers["fechamento"] = (() => {

  // Fechamento iFood de UMA loja num dia — a `BuscarFechamento` do legado
  // (`model.ifood.fechamentoDiario.pas`) mais as contas do `App.tsx` do front antigo:
  //
  // 1. pedidos de delivery da loja no dia, da API do DW (`/Delivery/`);
  // 2. vendas do dia na API financeira do iFood (`financial/v3.0/merchants/{id}/sales`),
  //    paginadas; o merchant vem da Empresa dona da operação (`locRefs.IFOOD`);
  // 3. cruza as duas pelo `n_parceiro` do DW = `shortId` do iFood (`MergeIfoodData`);
  // 4. classifica cada forma de pagamento (ONLINE / ONLINE VR / OFFLINE) com o cadastro
  //    `gia_relatorios.formas_pagamento` do Maestro — só leitura;
  // 5. calcula as colunas do legado (Total, Desconto copart, iFood reembolsa?, Cancelamento)
  //    e devolve só os pedidos do canal iFood (a tela do legado só mostra esses).
  //
  // A loja chega como `operacaoRef` (exceção deste módulo: a busca é por OPERAÇÃO, não
  // por Empresa), validado com `requireOperacao`. O `loc_ref` do DW é o número do
  // `operacao_ref` e o merchant vem da Empresa da operação — o body não escolhe nenhum.
  //
  // REGRA: handler auto-contido — só importa de @gia-cb/sdk/server. `numeroDaOperacao` e
  // `normalizarOrigem` se repetem em outros arquivos de propósito.

  interface Body {
    operacaoRef: string
    data: string
  }

  type TipoPagamento = 'ONLINE' | 'ONLINE VR' | 'OFFLINE' | 'SEM_CLASSIFICACAO'

  interface Pagamento {
    /** Texto antes do `(valor)`, como veio da API. */
    descricao: string
    /** `null` quando o trecho não traz o valor entre parênteses. */
    valor: number | null
    tipo: TipoPagamento
  }

  interface PedidoIfood {
    id: string
    n_pedido: string
    n_parceiro: string
    /** Dia pesquisado (`YYYY-MM-DD`) — a coluna DATA do legado. */
    data_calc: string
    data_de_criacao: string
    /** Canal de venda: o `salesChannel` do iFood quando o pedido foi achado lá. */
    origem: string
    valor_do_pedido: number
    valor_da_entrega: number
    /** TOTAL DO PEDIDO do legado: entrega + itens − incentivo da loja. */
    total_pago: number
    /** Total pago que veio do DW (o legado troca pelo calculado). */
    total_pago_dw: number
    desconto_total: number
    forma_de_pagamentos: string
    nome_loja: string
    id_loja: string
    agendado: string
    incentivo_parceiro: number
    incentivo_loja: number
    taxa_extra_parceiro: number
    // Do iFood (vazios quando o pedido não foi achado na API do iFood)
    confirmado_por: string
    total_parceiro: number
    tipo_pedido: string
    data_cancelamento: string
    origem_cancelamento: string
    motivo_cancelamento: string
    cancelamento_contestavel: string
    motivo_impossibilidade: string
    data_limite_contestacao: string
    cancelamento_parcial: string
    // Calculados (regra do legado)
    ifood_reembolsa: 'N/A' | 'SIM' | 'NÃO' | 'VERIFICAR'
    /** Incentivo do iFood − taxa de serviço. */
    desconto_copart: number
    /** CANCELAMENTO do legado: OK = sem origem de cancelamento e confirmado (CONCLUDED). */
    venda_concluida: 'OK' | 'Cancelado'
    /** Tipos das formas de pagamento, sem repetir, na ordem em que aparecem. */
    tipos: TipoPagamento[]
    pagamentos: Pagamento[]
    total_pago_online: number
    total_pago_adquirentes: number
    total_pago_offline: number
    /** Trechos de pagamento sem classificação (vazios ou DESCONHECIDO). */
    qtd_sem_classificacao: number
    valor_sem_classificacao: number
    formas_sem_classificacao: string[]
    /** O pedido do DW foi achado na API financeira do iFood. */
    encontrado_no_ifood: boolean
    /** Restaurante do iFood (merchant) em que o pedido foi achado. */
    merchant_ifood: string
  }

  interface Resposta {
    pedidos: PedidoIfood[]
    /** Pedidos que o DW devolveu para o nº da loja no dia, de todos os canais e operações. */
    pedidosDw: number
    /** Vendas da API do iFood que não acharam pedido no DW (o legado só registrava em log). */
    vendasIfoodSemPedidoDw: number
    /** Pedidos do DW que não foram achados na API do iFood. */
    pedidosSemIfood: number
    /** Avisos sobre a parte do iFood (cadastro, credencial, resposta da API). */
    avisos: string[]
  }

  /** Id da integração da api-dw.cocobambu.com no hub de Credenciais. */
  const INTEGRACAO_DW = 'apidw'
  /** Id da integração da Merchant API do iFood no hub de Credenciais. */
  const INTEGRACAO_IFOOD = 'ifood'
  /** Mesmo teto do Fechamento Maestro (90 s); acima disso a borda da API do DW devolve 524. */
  const TIMEOUT_DW_MS = 90_000
  const TIMEOUT_IFOOD_MS = 60_000
  /** Proteção contra laço: um dia de uma loja nunca chega perto disto. */
  const MAX_PAGINAS_IFOOD = 200
  const DATA_RE = /^\d{4}-\d{2}-\d{2}$/

  /** Sufixo que a API põe nas formas pagas antes, no app ou no parceiro. */
  const PRE_PAGO = /\s*-\s*PRE\s+PAGO\s*$/i
  /** Cartão mascarado (`**** 1234 - Amex` → `Amex`) — a `trimPaymentDescription` do legado. */
  const CARTAO_MASCARADO = /\*\*\*\*\s\d{4}\s-\s/

  /** Hoje em São Paulo, `AAAA-MM-DD`. */
  function hojeSp(): string {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date())
  }

  function validarData(data: unknown): string {
    if (typeof data !== 'string' || !DATA_RE.test(data)) {
      throw new HttpError(422, 'Informe a data no formato AAAA-MM-DD.')
    }
    // Date.parse aceita "2026-02-30" (vira 02/03); a volta para texto tem que bater.
    const t = Date.parse(`${data}T00:00:00Z`)
    if (Number.isNaN(t) || new Date(t).toISOString().slice(0, 10) !== data) {
      throw new HttpError(422, 'Data inválida.')
    }
    if (data > hojeSp()) throw new HttpError(422, 'A data não pode ser futura.')
    return data
  }

  /**
   * Operações que dividem o número de loja com outra e têm canal e merchant próprios no
   * iFood. O DW devolve as duas juntas no mesmo `loc_ref` e as separa pela `origem` do
   * pedido: "iFood" é a operação principal, "iFood Vasto" a do Vasto. O SDK não tem
   * vínculo iFood por operação (só por Empresa, um por Empresa), então o merchant destas
   * fica aqui — PROVISÓRIO até o SDK expor `locRefs` em `GiaOperacao`. Operação nova
   * nessa situação precisa entrar nesta tabela (e na de lojas.ts).
   * Merchants: lista `GET /merchant/v1.0/merchants` da conta iFood da Coco Bambu.
   */
  const OPERACOES_IFOOD_PROPRIO: Record<string, { canal: string; merchant: string }> = {
    '08 vst': { canal: 'iFood Vasto', merchant: '60a90e35-3568-4ecd-a4b5-8261e5a19c08' }, // Vasto Teresina
    '17 vst': { canal: 'iFood Vasto', merchant: 'aa5dcb37-dfaf-4442-b5dc-ef69637f73ad' }, // Vasto Recife
    '25 vst': { canal: 'iFood Vasto', merchant: '591659a8-f40b-4b65-bca7-0999638782ee' }, // Vasto Restaurante - Bh Anchieta
    '69 vst': { canal: 'iFood Vasto', merchant: '6293b97f-48d6-4325-8d47-d43e970760b0' }, // Vasto São José dos Campos
    '86 vst': { canal: 'iFood Vasto', merchant: 'c5671839-c503-4032-80cb-e5c4ebb58ac9' }, // Vasto - Barra da Tijuca
  }

  /** `operacao_ref` normalizado para a tabela ("08  VST" → "08 vst"). */
  function chaveOperacao(ref: string): string {
    return ref.trim().toLowerCase().replace(/\s+/g, ' ')
  }

  /** Número da loja com 2 dígitos — o `loc_ref` da API do DW ("54 cb" → "54"). */
  function numeroDaOperacao(ref: string): string | null {
    const m = /^\s*(\d{1,4})/.exec(ref)
    return m ? String(Number(m[1])).padStart(2, '0') : null
  }

  type Json = Record<string, unknown>

  function obj(v: unknown): Json | null {
    return v && typeof v === 'object' && !Array.isArray(v) ? (v as Json) : null
  }

  function lista(v: unknown): unknown[] {
    return Array.isArray(v) ? v : []
  }

  /**
   * Texto de um campo — a `GetJsonStr` do legado: número vira inteiro em texto
   * (`n_pedido`/`shortId` vêm como número), `null`/ausente/outro tipo = `null`.
   */
  function texto(v: unknown): string | null {
    if (typeof v === 'string') return v
    if (typeof v === 'number' && Number.isFinite(v)) return String(Math.trunc(v))
    return null
  }

  /** Número de um campo — a `GetJsonNum` do legado: `null`/ausente/inválido = `null`. */
  function numero(v: unknown): number | null {
    if (typeof v === 'number') return Number.isFinite(v) ? v : null
    if (typeof v === 'string' && v.trim() !== '') {
      const n = Number(v)
      return Number.isFinite(n) ? n : null
    }
    return null
  }

  /** A `GetJsonBool` do legado: `true`, ou texto SIM/TRUE/1/S/YES. */
  function booleano(v: unknown): boolean {
    if (typeof v === 'boolean') return v
    if (typeof v === 'string')
      return ['SIM', 'TRUE', '1', 'S', 'YES'].includes(v.trim().toUpperCase())
    return false
  }

  /** Soma em centavos e devolve em reais — sem acumular erro de ponto flutuante. */
  function somar(valores: number[]): number {
    return valores.reduce((acc, v) => acc + Math.round(v * 100), 0) / 100
  }

  /**
   * Chave da origem — a `normalizeOrigemKey` do legado: minúsculas, espaços viram `_`,
   * `APP CB` = `App Coco Bambu`, `99 Food` = `99Food`.
   */
  function normalizarOrigem(origem: string | null | undefined): string {
    if (!origem) return ''
    const s = origem.trim().toLowerCase().replace(/\s+/g, ' ')
    const apelidos: Record<string, string> = { 'app cb': 'app coco bambu', '99 food': '99food' }
    return (apelidos[s] ?? s).replace(/\s+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')
  }

  /** Forma do cadastro com tipo "ONLINE VR". */
  interface FormaOnlineVr {
    /** Trecho em maiúsculas procurado dentro da forma de pagamento. */
    descricao: string
    /** Chave da origem (`normalizarOrigem`); vazia = vale para todas. */
    origem: string
  }

  /**
   * Tipo de um trecho de pagamento — a `classifyPaymentSegment` do legado, nesta ordem:
   * 1. vazio ou `DESCONHECIDO` → SEM_CLASSIFICACAO;
   * 2. contém (sem o " - PRE PAGO") uma forma "ONLINE VR" do cadastro, da mesma origem
   *    do pedido ou sem origem → ONLINE VR;
   * 3. termina em " - PRE PAGO" → ONLINE;
   * 4. qualquer outro → OFFLINE.
   */
  function classificar(
    descricao: string,
    origemPedido: string,
    formasVr: FormaOnlineVr[]
  ): TipoPagamento {
    const bruto = descricao.trim()
    const semCartao = bruto.replace(CARTAO_MASCARADO, '').trim().toUpperCase()
    if (semCartao === '' || semCartao === 'DESCONHECIDO') return 'SEM_CLASSIFICACAO'
    const semPrePago = semCartao.replace(PRE_PAGO, '').trim()
    const vr = formasVr.some(
      (f) => (f.origem === '' || f.origem === origemPedido) && semPrePago.includes(f.descricao)
    )
    if (vr) return 'ONLINE VR'
    return PRE_PAGO.test(bruto) ? 'ONLINE' : 'OFFLINE'
  }

  /** Formas "ONLINE VR" ativas do cadastro, da descrição mais longa para a mais curta. */
  async function carregarFormasOnlineVr(): Promise<FormaOnlineVr[]> {
    let linhas: { descricao: string | null; origem: string | null }[]
    try {
      linhas = await sql<{ descricao: string | null; origem: string | null }[]>`
        select descricao, origem
        from gia_relatorios.formas_pagamento
        where coalesce(is_deleted, false) = false and tipo = 'ONLINE VR'
      `
    } catch (e) {
      console.error('[fechamento-ifood-diario] cadastro de formas de pagamento:', e)
      throw new HttpError(
        502,
        'Não foi possível ler o cadastro de formas de pagamento do Maestro. Tente de novo.'
      )
    }
    return (
      linhas
        .map((l) => ({
          descricao: (l.descricao ?? '').trim().toUpperCase(),
          origem: normalizarOrigem(l.origem),
        }))
        // Descrição vazia casaria com qualquer forma de pagamento.
        .filter((f) => f.descricao !== '')
        .sort((a, b) => b.descricao.length - a.descricao.length)
    )
  }

  /** Pedido do DW no formato do legado (`MapApiItemToTransaction`), antes do cruzamento. */
  function doDw(raw: Json, nomeLojaPadrao: string, data: string) {
    const totalPagoDw = numero(raw.total_pago) ?? numero(raw.total) ?? numero(raw.amount) ?? 0
    const retirada = booleano(raw.retirada)
    return {
      id: texto(raw.id) || texto(raw.order_id) || '',
      n_pedido: texto(raw.n_pedido) ?? texto(raw.order_id) ?? '',
      n_parceiro: texto(raw.n_parceiro) ?? '',
      data_calc: data,
      data_de_criacao: texto(raw.data_de_criacao_horario_sp) ?? texto(raw.data_de_criacao_utc) ?? '',
      origem: texto(raw.origem) ?? texto(raw.channel) ?? 'iFood',
      valor_do_pedido: numero(raw.valor_do_pedido) ?? numero(raw.order_value) ?? totalPagoDw,
      valor_da_entrega: numero(raw.valor_da_entrega) ?? numero(raw.delivery_fee) ?? 0,
      total_pago_dw: totalPagoDw,
      desconto_total: numero(raw.desconto_total) ?? numero(raw.discount) ?? 0,
      forma_de_pagamentos: texto(raw.forma_de_pagamentos) ?? texto(raw.payment_method) ?? '',
      nome_loja: texto(raw.nome_loja) ?? nomeLojaPadrao,
      id_loja: texto(raw.id_loja) ?? '',
      // AGENDADO do legado sai do campo `retirada` do DW.
      agendado: retirada ? 'SIM' : 'NÃO',
      incentivo_parceiro: numero(raw.incentivo_parceiro) ?? 0,
      incentivo_loja: numero(raw.incentivo_loja) ?? 0,
      taxa_extra_parceiro: numero(raw.taxa_extra_parceiro) ?? 0,
      confirmado_por: '',
      total_parceiro: 0,
      tipo_pedido: '',
      data_cancelamento: '',
      origem_cancelamento: '',
      motivo_cancelamento: '',
      cancelamento_contestavel: '',
      motivo_impossibilidade: '',
      data_limite_contestacao: '',
      cancelamento_parcial: '',
      encontrado_no_ifood: false,
      merchant_ifood: '',
    }
  }

  type PedidoDw = ReturnType<typeof doDw>

  /** `true`/`false` do iFood como SIM/NÃO; texto como veio. */
  function simNao(v: unknown): string {
    if (typeof v === 'boolean') return v ? 'SIM' : 'NÃO'
    return texto(v) ?? ''
  }

  /** Campos que a venda do iFood traz para o pedido — a `MergeIfoodData` do legado. */
  function cruzar(p: PedidoDw, venda: Json): void {
    p.encontrado_no_ifood = true

    const merchant = obj(venda.merchant)
    if (merchant) p.id_loja = String(Math.trunc(numero(merchant.shortId) ?? 0))

    const metodos = lista(obj(venda.payments)?.methods)
    p.total_parceiro = somar(metodos.map((m) => numero(obj(m)?.value) ?? 0))

    const status = texto(venda.currentStatus) ?? ''
    p.confirmado_por = status === 'CONCLUDED' ? 'SIM' : 'NÃO'
    p.tipo_pedido = texto(venda.type) ?? ''
    p.origem = texto(venda.salesChannel) ?? ''

    let parcial = false
    for (const item of lista(venda.orderStatusHistory)) {
      const h = obj(item)
      if (!h) continue
      const valor = texto(h.value)
      if (valor === 'PARTIAL_CANCELLATION_ORDER') parcial = true
      if (status === 'CANCELLED' && valor === 'CANCELLED') {
        p.data_cancelamento = texto(h.createdAt) ?? ''
        const meta = obj(h.metadata)
        if (meta) {
          p.origem_cancelamento = texto(meta.cancelOrigin) ?? ''
          p.motivo_cancelamento = texto(meta.cancelCodeDescription) ?? ''
          const disputa = obj(meta.cancellationDispute)
          if (disputa) {
            p.cancelamento_contestavel = simNao(disputa.isContestable)
            if (Array.isArray(disputa.reasons)) {
              p.motivo_impossibilidade = disputa.reasons
                .map((r) => (typeof r === 'string' ? r : JSON.stringify(r)))
                .join(', ')
            }
          }
        }
      }
    }
    p.cancelamento_parcial = parcial ? 'SIM' : 'NÃO'

    // Data limite de contestação: 1º lançamento do evento financeiro FBOE.
    for (const item of lista(venda.orderEvents)) {
      const ev = obj(item)
      if (texto(ev?.fullCode) !== 'FINANCIAL_BILLED_ORDER_ENTRY') continue
      const entrada = obj(lista(obj(ev?.metadata)?.entries)[0])
      p.data_limite_contestacao = texto(obj(entrada?.period)?.endDate) ?? ''
      break
    }
  }

  /** `forma_de_pagamentos` → trechos, como o legado: separa em toda vírgula ou ponto e vírgula. */
  function separarPagamentos(bruto: string): { descricao: string; valor: number | null }[] {
    return bruto
      .split(/[,;]/)
      .map((parte) => parte.trim())
      .filter(Boolean)
      .map((parte) => {
        const m = /^(.*?)\s*\(([\d.,]+)\)$/.exec(parte)
        return m
          ? { descricao: m[1].trim(), valor: parseFloat(m[2].replace(',', '.')) }
          : { descricao: parte, valor: null }
      })
  }

  /** As contas do `App.tsx` do legado (`enrichedTransactions` + parte do `calculateSummary`). */
  function calcular(p: PedidoDw, formasVr: FormaOnlineVr[]): PedidoIfood {
    const origemChave = normalizarOrigem(p.origem)
    const trechosBrutos = p.forma_de_pagamentos ? p.forma_de_pagamentos.split(/[,;]/).length : 0
    const pagamentos: Pagamento[] = separarPagamentos(p.forma_de_pagamentos).map((t) => ({
      ...t,
      tipo: classificar(t.descricao, origemChave, formasVr),
    }))

    const total = somar([p.valor_da_entrega, p.valor_do_pedido, -p.incentivo_loja])
    // Trecho sem "(valor)": vale o total do pedido se for o único, senão zero (legado).
    // As colunas por grupo usavam o total do DW; o card "sem classificação", o calculado.
    const valorDe = (pg: Pagamento, totalSemValor: number) =>
      pg.valor ?? (trechosBrutos === 1 ? totalSemValor : 0)
    const doTipo = (tipo: TipoPagamento) =>
      somar(pagamentos.filter((pg) => pg.tipo === tipo).map((pg) => valorDe(pg, p.total_pago_dw)))
    const semClassificacao = pagamentos.filter((pg) => pg.tipo === 'SEM_CLASSIFICACAO')

    const incLoja = p.incentivo_loja
    const reembolsa =
      incLoja === 0 ? 'N/A' : incLoja === 12 ? 'SIM' : incLoja <= 10 ? 'NÃO' : 'VERIFICAR'
    const ok = p.origem_cancelamento.trim() === '' && p.confirmado_por.trim().toUpperCase() === 'SIM'

    return {
      ...p,
      total_pago: total,
      ifood_reembolsa: reembolsa,
      desconto_copart: somar([p.incentivo_parceiro, -p.taxa_extra_parceiro]),
      venda_concluida: ok ? 'OK' : 'Cancelado',
      tipos: [...new Set(pagamentos.map((pg) => pg.tipo))],
      pagamentos,
      total_pago_online: doTipo('ONLINE'),
      total_pago_adquirentes: doTipo('ONLINE VR'),
      total_pago_offline: doTipo('OFFLINE'),
      qtd_sem_classificacao: semClassificacao.length,
      valor_sem_classificacao: somar(semClassificacao.map((pg) => valorDe(pg, total))),
      formas_sem_classificacao: [
        ...new Set(
          semClassificacao
            .map((pg) => pg.descricao.replace(CARTAO_MASCARADO, '').trim() || pg.descricao.trim())
            .filter(Boolean)
        ),
      ],
    }
  }

  /** Mensagem que a API devolve no corpo de um erro, se houver. */
  async function detalheDoErro(r: Response): Promise<string> {
    try {
      const corpo = (await r.json()) as { detail?: unknown; message?: unknown }
      const msg = corpo.detail ?? corpo.message
      return typeof msg === 'string' ? ` ${msg}` : ''
    } catch {
      return ''
    }
  }

  /**
   * Mensagem para a recusa do iFood. 401 = token vencido ou inválido (quem renova é o
   * hub de Credenciais do portal; no `gia dev`, o script `npm run token:ifood`). 403 =
   * a loja não autorizou o aplicativo de vocês no Portal do Parceiro do iFood.
   */
  function recusaIfood(status: number): string | null {
    const dev = envOptional('GIA_DEV_CRED_IFOOD_TOKEN') !== undefined
    if (status === 401) {
      return dev
        ? 'O token do iFood venceu ou é inválido (401). Rode `npm run token:ifood` e reinicie o gia dev.'
        : 'O iFood recusou a credencial (401: token vencido ou inválido). Avise o administrador do portal (hub de Credenciais, integração ifood).'
    }
    if (status === 403) {
      return 'O iFood negou o acesso a esta loja (403): ela não autorizou o aplicativo da Coco Bambu no Portal do Parceiro do iFood.'
    }
    return null
  }

  function ehTimeout(e: unknown): boolean {
    return e instanceof Error && (e.name === 'TimeoutError' || e.name === 'AbortError')
  }

  /** Restaurante do iFood (merchant) consultado. */
  interface Merchant {
    id: string
    nome: string
  }

  /** Venda do iFood com o restaurante de onde veio. */
  interface VendaIfood {
    venda: Json
    merchant: Merchant
  }

  /** Espera `ms` milissegundos. */
  function esperar(ms: number): Promise<void> {
    return new Promise((ok) => setTimeout(ok, ms))
  }

  /**
   * GET na API do iFood. No 429 (limite de requisições) espera o `Retry-After` — ou
   * 1,5 s, 3 s, 6 s — e tenta de novo, até 3 vezes.
   */
  async function getIfood(url: string, token: string): Promise<Response> {
    for (let tentativa = 0; ; tentativa++) {
      const r = await fetch(url, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        signal: AbortSignal.timeout(TIMEOUT_IFOOD_MS),
      })
      if (r.status !== 429 || tentativa >= 3) return r
      const retry = Number(r.headers.get('retry-after'))
      await esperar(Number.isFinite(retry) && retry > 0 ? retry * 1000 : 1500 * 2 ** tentativa)
    }
  }

  /**
   * Uma página de vendas do dia de UM restaurante na API financeira do iFood (20 por
   * página, fixo). `null` = falhou (aviso registrado); 204 = dia sem vendas.
   */
  async function paginaDeVendas(
    base: string,
    token: string,
    merchant: Merchant,
    data: string,
    pagina: number,
    avisos: string[]
  ): Promise<{ vendas: VendaIfood[]; totalPaginas: number } | null> {
    const qs = new URLSearchParams({ beginSalesDate: data, endSalesDate: data, page: String(pagina) })
    const onde = `${merchant.nome}, página ${pagina}`
    let r: Response
    try {
      r = await getIfood(
        `${base}/financial/v3.0/merchants/${encodeURIComponent(merchant.id)}/sales?${qs}`,
        token
      )
    } catch (e) {
      console.error('[fechamento-ifood-diario] API do iFood:', e)
      avisos.push(
        ehTimeout(e)
          ? `A API do iFood demorou demais para responder (${onde}).`
          : `Não foi possível falar com a API do iFood (${onde}).`
      )
      return null
    }
    if (r.status === 204) return { vendas: [], totalPaginas: 0 }
    if (!r.ok) {
      avisos.push(
        recusaIfood(r.status) ??
          `A API do iFood respondeu ${r.status} (${onde}).${await detalheDoErro(r)}`
      )
      return null
    }
    const bruto = await r.text()
    if (!bruto.trim()) return { vendas: [], totalPaginas: 0 }
    let corpo: Json | null
    try {
      corpo = obj(JSON.parse(bruto))
    } catch {
      corpo = null
    }
    if (!corpo) {
      avisos.push(`A API do iFood devolveu um formato inesperado (${onde}).`)
      return null
    }
    const vendas: VendaIfood[] = []
    for (const item of lista(corpo.sales)) {
      const venda = obj(item)
      if (venda && texto(venda.shortId)) vendas.push({ venda, merchant })
    }
    return { vendas, totalPaginas: Math.max(1, Math.trunc(numero(corpo.pageCount) ?? 1)) }
  }

  /**
   * Todas as vendas do dia de UM restaurante — a `BuscarVendasIfood` do legado. Falha
   * não derruba o fechamento (como no legado): volta o que já veio e um aviso.
   */
  async function vendasIfood(
    base: string,
    token: string,
    merchant: Merchant,
    data: string,
    avisos: string[]
  ): Promise<VendaIfood[]> {
    const primeira = await paginaDeVendas(base, token, merchant, data, 1, avisos)
    if (!primeira) return []
    const vendas = [...primeira.vendas]
    // As demais páginas, 3 por vez (a página tem 20 vendas fixas; o limite de
    // requisições do iFood não aguenta todas de uma vez).
    const total = Math.min(primeira.totalPaginas, MAX_PAGINAS_IFOOD)
    for (let pagina = 2; pagina <= total; pagina += 3) {
      const lote = [pagina, pagina + 1, pagina + 2].filter((n) => n <= total)
      const pgs = await Promise.all(
        lote.map((n) => paginaDeVendas(base, token, merchant, data, n, avisos))
      )
      for (const pg of pgs) if (pg) vendas.push(...pg.vendas)
      if (pgs.some((pg) => !pg)) break
    }
    return vendas
  }

  interface MerchantDaConta {
    id: string
    name: string
    corporateName: string
  }

  /** Restaurantes da conta do iFood — mudam pouco: guardados 30 min por instância. */
  let cacheMerchants: { em: number; lista: MerchantDaConta[] } | null = null
  const CACHE_MERCHANTS_MS = 30 * 60_000

  async function merchantsDaConta(base: string, token: string): Promise<MerchantDaConta[]> {
    if (cacheMerchants && Date.now() - cacheMerchants.em < CACHE_MERCHANTS_MS) {
      return cacheMerchants.lista
    }
    const todos: MerchantDaConta[] = []
    for (let pagina = 1; pagina <= 20; pagina++) {
      const r = await getIfood(`${base}/merchant/v1.0/merchants?page=${pagina}&size=100`, token)
      if (r.status === 204) break
      if (!r.ok) throw new Error(recusaIfood(r.status) ?? `HTTP ${r.status}`)
      const itens = lista(await r.json())
      for (const i of itens) {
        const m = obj(i)
        const id = m && texto(m.id)
        if (m && id) {
          todos.push({ id, name: texto(m.name) ?? id, corporateName: texto(m.corporateName) ?? '' })
        }
      }
      if (itens.length < 100) break
    }
    cacheMerchants = { em: Date.now(), lista: todos }
    return todos
  }

  /**
   * Nome do restaurante no iFood, para a coluna "Restaurante no iFood". Só informativo:
   * se a lista da conta falhar, vai um nome genérico, sem aviso.
   */
  async function nomeDoRestaurante(base: string, token: string, id: string): Promise<string> {
    try {
      return (await merchantsDaConta(base, token)).find((m) => m.id === id)?.name ?? 'iFood'
    } catch (e) {
      console.error('[fechamento-ifood-diario] lista de restaurantes do iFood:', e)
      return 'iFood'
    }
  }

  const __giaHandler = defineHandler<Body, Resposta>(async (ctx) => {
    await ctx.requirePermission('fechamento-ifood-diario.ler')
    const ref = typeof ctx.body.operacaoRef === 'string' ? ctx.body.operacaoRef.trim() : ''
    if (!ref) throw new HttpError(422, 'Informe a loja.')
    // 403 se a operação está fora do escopo do usuário.
    const operacao = await ctx.requireOperacao(ref)
    const data = validarData(ctx.body.data)

    const locRef = numeroDaOperacao(operacao.ref)
    if (!locRef) {
      throw new HttpError(
        422,
        `A operação "${operacao.nome}" não tem número de loja no código (${operacao.ref}).`
      )
    }
    // Operação com canal próprio (Vasto na loja do CB): merchant e canal da tabela. As
    // demais: canal "iFood" e o merchant da Empresa dona da operação (regra do legado).
    const propria = OPERACOES_IFOOD_PROPRIO[chaveOperacao(operacao.ref)]
    const canal = normalizarOrigem(propria?.canal ?? 'iFood')
    const empresa = (await ctx.empresas()).find((e) => e.id === operacao.empresaId)
    const merchantId = propria?.merchant ?? (empresa?.locRefs?.IFOOD?.trim() || null)
    const avisos: string[] = []

    // O cadastro e o iFood carregam enquanto a API do DW (bem mais lenta) responde.
    const formasVrPromise = carregarFormasOnlineVr()
    // Só o restaurante da operação, como no legado (decisão de 2026-11-09): pedidos de
    // outras marcas da loja no iFood (Express, Pizzaria, Dani…) não são achados nele e
    // ficam como Cancelado — os números batem com a tela antiga.
    const ifoodPromise: Promise<VendaIfood[]> = (async () => {
      if (!merchantId) {
        avisos.push(
          'A Empresa desta operação não tem a integração com o iFood no cadastro: os pedidos não foram cruzados com o iFood e contam como Cancelado.'
        )
        return []
      }
      let cred: { baseUrl: string; token: string }
      try {
        cred = await ctx.credencial(INTEGRACAO_IFOOD)
      } catch (e) {
        console.error('[fechamento-ifood-diario] credencial do iFood:', e)
        avisos.push(
          `Não foi possível obter a credencial da API do iFood${e instanceof Error ? `: ${e.message}` : '.'}`
        )
        return []
      }
      const base = cred.baseUrl.replace(/\/+$/, '')
      const [nome, vendas] = await Promise.all([
        nomeDoRestaurante(base, cred.token, merchantId),
        vendasIfood(base, cred.token, { id: merchantId, nome: 'iFood' }, data, avisos),
      ])
      for (const v of vendas) v.merchant = { id: merchantId, nome }
      return vendas
    })()
    // Sem isto, um erro antes da API do DW terminar viraria "unhandled rejection".
    formasVrPromise.catch(() => {})
    ifoodPromise.catch(() => {})

    const { baseUrl, token } = await ctx.credencial(INTEGRACAO_DW)
    const qs = new URLSearchParams({ loc_ref: locRef, start_date: data, end_date: data })
    let r: Response
    try {
      r = await fetch(`${baseUrl.replace(/\/+$/, '')}/Delivery/?${qs}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        signal: AbortSignal.timeout(TIMEOUT_DW_MS),
      })
    } catch (e) {
      if (ehTimeout(e)) {
        throw new HttpError(504, 'A API de delivery do DW demorou demais para responder.')
      }
      throw e
    }
    if (!r.ok) {
      throw new HttpError(
        502,
        `A API de delivery do DW respondeu ${r.status}.${await detalheDoErro(r)}`
      )
    }
    const json = (await r.json()) as unknown
    // Como no legado: lista na raiz, ou em `results`, `data` ou `orders`.
    const raiz = obj(json)
    const linhas = Array.isArray(json)
      ? json
      : (raiz && [raiz.results, raiz.data, raiz.orders].find(Array.isArray)) || null
    // 200 sem a lista é falha, não "zero pedidos".
    if (!linhas) throw new HttpError(502, 'A API de delivery do DW devolveu um formato inesperado.')

    const doDia = (linhas as unknown[]).map(obj).filter((l): l is Json => l !== null)
    // Só os pedidos do canal da operação, ANTES de cruzar: o DW junta CB e Vasto no mesmo
    // nº de loja, e o shortId do iFood (4 dígitos) de um merchant pode coincidir com o
    // n_parceiro de um pedido do outro.
    const pedidosDw = doDia
      .filter((l) => normalizarOrigem(texto(l.origem) ?? texto(l.channel) ?? 'iFood') === canal)
      .map((l) => doDw(l, `Loja ${locRef}`, data))

    const [formasVr, vendasDoDia] = await Promise.all([formasVrPromise, ifoodPromise])
    // n_parceiro do DW = shortId do iFood (`MergeIfoodData`). O legado tirava a venda do
    // dicionário ao cruzar: dois pedidos com o mesmo n_parceiro, só o primeiro leva.
    const vendas = new Map<string, VendaIfood>()
    for (const v of vendasDoDia) {
      const k = texto(v.venda.shortId)
      if (k) vendas.set(k, v)
    }
    for (const p of pedidosDw) {
      const v = p.n_parceiro ? vendas.get(p.n_parceiro) : undefined
      if (!v) continue
      vendas.delete(p.n_parceiro)
      cruzar(p, v.venda)
      p.merchant_ifood = v.merchant.nome
    }

    // Operação principal, como no legado: o canal (do iFood, quando cruzado; senão o do
    // DW) tem que ser iFood — sai, por exemplo, o IFOOD_SHOP. Na operação com canal
    // próprio, o filtro de canal do DW acima já basta (o iFood devolve "IFOOD" nelas).
    const entra = (p: PedidoDw) =>
      propria !== undefined || normalizarOrigem(p.origem || 'Outros') === 'ifood'
    const pedidos = pedidosDw
      .filter(entra)
      .map((p) => calcular(p, formasVr))
      .sort((a, b) => a.data_de_criacao.localeCompare(b.data_de_criacao))

    return {
      pedidos,
      pedidosDw: doDia.length,
      vendasIfoodSemPedidoDw: vendas.size,
      pedidosSemIfood: merchantId
        ? pedidosDw.filter((p) => !p.encontrado_no_ifood && entra(p)).length
        : 0,
      avisos,
    }
  })


  return __giaHandler
})() as ServerHandler<unknown, unknown>

// ─── src/server/lojas.ts ────────────────────────────────────────────────
__giaHandlers["lojas"] = (() => {

  // Lojas do seletor: TODAS as operações do escopo do usuário (`ctx.operacoes()`).
  // Exceção combinada para este módulo — os demais buscam por Empresa. Uma Empresa
  // pode ter mais de uma operação (ex.: `08 cb` e `08 vst` em Teresina).
  //
  // O número da loja (`loc_ref` da API de delivery do DW) sai do começo do
  // `operacao_ref` ("54 cb" → "54"). O merchant do iFood vem da Empresa dona da
  // operação (`locRefs.IFOOD`), menos nas operações com canal próprio (Vasto na loja do
  // CB), que têm o merchant em `OPERACOES_IFOOD_PROPRIO`. `temIfood` diz se ele existe.
  //
  // REGRA: handler auto-contido — só importa de @gia-cb/sdk/server. `numeroDaOperacao`,
  // `chaveOperacao` e `OPERACOES_IFOOD_PROPRIO` se repetem em fechamento.ts de propósito.

  interface Loja {
    /** `operacao_ref` — a chave que a pesquisa manda ao servidor. */
    ref: string
    nome: string
    empresaId: number
    locRef: string | null
    temIfood: boolean
    ativo: boolean
  }

  /**
   * Operações que dividem o número de loja com outra e têm canal e merchant próprios no
   * iFood. O DW devolve as duas juntas no mesmo `loc_ref` e as separa pela `origem` do
   * pedido: "iFood" é a operação principal, "iFood Vasto" a do Vasto. O SDK não tem
   * vínculo iFood por operação (só por Empresa, um por Empresa), então o merchant destas
   * fica aqui — PROVISÓRIO até o SDK expor `locRefs` em `GiaOperacao`. Operação nova
   * nessa situação precisa entrar nesta tabela (e na de fechamento.ts).
   * Merchants: lista `GET /merchant/v1.0/merchants` da conta iFood da Coco Bambu.
   */
  const OPERACOES_IFOOD_PROPRIO: Record<string, { canal: string; merchant: string }> = {
    '08 vst': { canal: 'iFood Vasto', merchant: '60a90e35-3568-4ecd-a4b5-8261e5a19c08' }, // Vasto Teresina
    '17 vst': { canal: 'iFood Vasto', merchant: 'aa5dcb37-dfaf-4442-b5dc-ef69637f73ad' }, // Vasto Recife
    '25 vst': { canal: 'iFood Vasto', merchant: '591659a8-f40b-4b65-bca7-0999638782ee' }, // Vasto Restaurante - Bh Anchieta
    '69 vst': { canal: 'iFood Vasto', merchant: '6293b97f-48d6-4325-8d47-d43e970760b0' }, // Vasto São José dos Campos
    '86 vst': { canal: 'iFood Vasto', merchant: 'c5671839-c503-4032-80cb-e5c4ebb58ac9' }, // Vasto - Barra da Tijuca
  }

  /** `operacao_ref` normalizado para a tabela ("08  VST" → "08 vst"). */
  function chaveOperacao(ref: string): string {
    return ref.trim().toLowerCase().replace(/\s+/g, ' ')
  }

  /** Número da loja com 2 dígitos — o `loc_ref` da API do DW ("54 cb" → "54"). */
  function numeroDaOperacao(ref: string): string | null {
    const m = /^\s*(\d{1,4})/.exec(ref)
    return m ? String(Number(m[1])).padStart(2, '0') : null
  }

  const __giaHandler = defineHandler<Record<string, never>, Loja[]>(async (ctx) => {
    await ctx.requirePermission('fechamento-ifood-diario.ler')
    // ctx.operacoes() já vem recortado pelo escopo do usuário.
    const [operacoes, empresas] = await Promise.all([ctx.operacoes(), ctx.empresas()])
    const merchant = new Map(empresas.map((e) => [e.id, e.locRefs?.IFOOD?.trim() || null]))
    return operacoes
      .map((o) => ({
        ref: o.ref,
        nome: o.nome,
        empresaId: o.empresaId,
        locRef: numeroDaOperacao(o.ref),
        temIfood: Boolean(
          OPERACOES_IFOOD_PROPRIO[chaveOperacao(o.ref)]?.merchant ?? merchant.get(o.empresaId)
        ),
        ativo: o.ativo,
      }))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { numeric: true }))
  })


  return __giaHandler
})() as ServerHandler<unknown, unknown>

const __MODULE_ID = "fechamento-ifood-diario"
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

// IP do visitante, para limitar abuso. Atrás da Cloudflare, o 1º do `x-forwarded-for` que chega
// aqui é o da BORDA dela (o Traefik não confia nos IPs da Cloudflare e refaz o cabeçalho): em
// 27/10/2026, as 2.000 últimas batidas do ponto em prod tinham 71 IPs, todos da Cloudflare. Ela
// manda o do visitante em `cf-connecting-ip`. Fora da Cloudflare (direto na origem) os dois são
// forjáveis — por isso o IP NÃO é identidade, só contagem.
function __giaIpDoVisitante(h: Headers): string | null {
  return (
    h.get('cf-connecting-ip')?.trim() ||
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    h.get('x-real-ip')?.trim() ||
    null
  )
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
    ip: __giaIpDoVisitante(req.headers),
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
