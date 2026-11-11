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
  // `chaveOperacao` e `OPERACOES_IFOOD_PROPRIO` se repetem em pedidos.ts e vendas.ts de propósito.

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
   * nessa situação precisa entrar nesta tabela (e nas de pedidos.ts e vendas.ts).
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

// ─── src/server/pedidos.ts ──────────────────────────────────────────────
__giaHandlers["pedidos"] = (() => {

  // Pedidos de delivery de UMA operação num dia, da API do DW (`/Delivery/`) — a 1ª
  // metade da `BuscarFechamento` do legado (`MapApiItemToTransaction`) — e a lista de
  // formas "ONLINE VR" do cadastro `gia_relatorios.formas_pagamento` do Maestro (só
  // leitura). O cruzamento com o iFood e as contas são feitos na tela, que busca as
  // vendas do iFood em paralelo (handler `vendas`) e mostra o progresso.
  //
  // O DW junta as operações do mesmo número (ex.: `08 cb` e `08 vst`); aqui ficam só os
  // pedidos do canal da operação — "iFood" na principal, "iFood Vasto" no Vasto — ANTES
  // do cruzamento, porque o shortId do iFood (4 dígitos) de um restaurante pode coincidir
  // com o n_parceiro de um pedido do outro.
  //
  // A loja chega como `operacaoRef` (exceção deste módulo: busca por OPERAÇÃO), validada
  // com `requireOperacao`. O `loc_ref` do DW é o número do `operacao_ref`.
  //
  // REGRA: handler auto-contido — só importa de @gia-cb/sdk/server. Validação de data,
  // tabela das operações Vasto e `normalizarOrigem` se repetem em `vendas.ts` e em
  // `src/regras.ts` de propósito.

  interface Body {
    operacaoRef: string
    data: string
  }

  /** Mesmo teto do Fechamento Maestro (90 s); acima disso a borda da API do DW devolve 524. */
  const TIMEOUT_DW_MS = 90_000
  const DATA_RE = /^\d{4}-\d{2}-\d{2}$/

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

  /** Restaurante do iFood (merchant) da operação, como nas vendas. */
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
      const r = await fetch(`${base}/merchant/v1.0/merchants?page=${pagina}&size=100`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        signal: AbortSignal.timeout(30_000),
      })
      if (r.status === 204) break
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
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
   * se a lista da conta falhar, vai um nome genérico, sem aviso. Fica aqui (e não nas
   * vendas) porque a chamada ao DW é mais lenta: o nome sai sem atrasar o progresso.
   */
  async function nomeDoRestaurante(base: string, token: string, id: string): Promise<string> {
    try {
      return (await merchantsDaConta(base, token)).find((m) => m.id === id)?.name ?? 'iFood'
    } catch (e) {
      console.error('[fechamento-ifood-diario] lista de restaurantes do iFood:', e)
      return 'iFood'
    }
  }

  interface Resposta {
    /** Pedidos do canal da operação, no formato do legado, antes do cruzamento. */
    pedidos: PedidoDw[]
    /** Formas "ONLINE VR" do cadastro, da descrição mais longa para a mais curta. */
    formasVr: FormaOnlineVr[]
    /** Operação com canal próprio (Vasto na loja do CB): não filtra o canal do iFood. */
    canalProprio: boolean
    /** Nome do restaurante da operação no iFood; `null` sem integração ou sem a lista. */
    restaurante: string | null
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

  function ehTimeout(e: unknown): boolean {
    return e instanceof Error && (e.name === 'TimeoutError' || e.name === 'AbortError')
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
    const propria = OPERACOES_IFOOD_PROPRIO[chaveOperacao(operacao.ref)]
    const canal = normalizarOrigem(propria?.canal ?? 'iFood')

    // O cadastro e o nome do restaurante carregam enquanto a API do DW (bem mais lenta)
    // responde. O restaurante é o da tabela (Vasto na loja do CB) ou o da Empresa.
    const formasVrPromise = carregarFormasOnlineVr()
    const restaurantePromise = (async (): Promise<string | null> => {
      const empresa = propria
        ? undefined
        : (await ctx.empresas()).find((e) => e.id === operacao.empresaId)
      const merchantId = propria?.merchant ?? (empresa?.locRefs?.IFOOD?.trim() || null)
      if (!merchantId) return null
      try {
        const cred = await ctx.credencial('ifood')
        return await nomeDoRestaurante(cred.baseUrl.replace(/\/+$/, ''), cred.token, merchantId)
      } catch {
        return null
      }
    })()
    // Sem isto, um erro do banco antes da API terminar viraria "unhandled rejection".
    formasVrPromise.catch(() => {})

    const { baseUrl, token } = await ctx.credencial('apidw')
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

    const pedidos = (linhas as unknown[])
      .map(obj)
      .filter((l): l is Json => l !== null)
      .filter((l) => normalizarOrigem(texto(l.origem) ?? texto(l.channel) ?? 'iFood') === canal)
      .map((l) => doDw(l, `Loja ${locRef}`, data))

    const [formasVr, restaurante] = await Promise.all([formasVrPromise, restaurantePromise])
    return { pedidos, formasVr, canalProprio: propria !== undefined, restaurante }
  })


  return __giaHandler
})() as ServerHandler<unknown, unknown>

// ─── src/server/vendas.ts ───────────────────────────────────────────────
__giaHandlers["vendas"] = (() => {

  // UMA página (20 vendas, fixo) das vendas do dia do restaurante da operação na API
  // financeira do iFood (`financial/v3.0/merchants/{id}/sales`) — a `BuscarVendasIfood`
  // do legado, quebrada em páginas para a tela buscar várias ao mesmo tempo (até 4, como
  // o Fechamento iFood Mensal) e mostrar o progresso. Cada venda volta só com os campos
  // que o cruzamento usa (a `MergeIfoodData` do legado), já extraídos.
  //
  // O restaurante é o da Empresa dona da operação (`locRefs.IFOOD`), menos nas operações
  // com canal próprio (Vasto na loja do CB), que estão na tabela abaixo. Falha do iFood
  // não derruba o fechamento (como no legado): o que é definitivo (sem integração,
  // credencial, 401/403) volta como `aviso`; o que é passageiro (5xx, demora) volta como
  // erro, e a tela tenta de novo.
  //
  // REGRA: handler auto-contido — só importa de @gia-cb/sdk/server.

  interface Body {
    operacaoRef: string
    data: string
    pagina: number
  }

  /**
   * Uma página leva 0,4–4 s; acima de 20 s é conexão travada (visto em dev: ETIMEDOUT ao
   * conectar no iFood, ~47 s até desistir). Melhor desistir cedo: a tela tenta de novo.
   */
  const TIMEOUT_IFOOD_MS = 20_000
  /** Proteção contra laço: um dia de uma loja nunca chega perto disto. */
  const MAX_PAGINAS_IFOOD = 200
  const DATA_RE = /^\d{4}-\d{2}-\d{2}$/

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

  /** Soma em centavos e devolve em reais — sem acumular erro de ponto flutuante. */
  function somar(valores: number[]): number {
    return valores.reduce((acc, v) => acc + Math.round(v * 100), 0) / 100
  }

  /** `true`/`false` do iFood como SIM/NÃO; texto como veio. */
  function simNao(v: unknown): string {
    if (typeof v === 'boolean') return v ? 'SIM' : 'NÃO'
    return texto(v) ?? ''
  }

  /** O que a venda do iFood traz para o pedido do DW — a `MergeIfoodData` do legado. */
  interface VendaIfood {
    shortId: string
    /** `merchant.shortId` (vira o ID DO RESTAURANTE); `null` sem merchant na venda. */
    idLoja: string | null
    totalParceiro: number
    confirmado: 'SIM' | 'NÃO'
    tipoPedido: string
    canal: string
    dataCancelamento: string
    origemCancelamento: string
    motivoCancelamento: string
    cancelamentoContestavel: string
    motivoImpossibilidade: string
    dataLimiteContestacao: string
    cancelamentoParcial: 'SIM' | 'NÃO'
  }

  /** Extrai da venda os campos do cruzamento, com as mesmas regras da `MergeIfoodData`. */
  function extrair(venda: Json): VendaIfood | null {
    const shortId = texto(venda.shortId)
    if (!shortId) return null
    const merchant = obj(venda.merchant)
    const status = texto(venda.currentStatus) ?? ''
    const v: VendaIfood = {
      shortId,
      idLoja: merchant ? String(Math.trunc(numero(merchant.shortId) ?? 0)) : null,
      totalParceiro: somar(
        lista(obj(venda.payments)?.methods).map((m) => numero(obj(m)?.value) ?? 0)
      ),
      confirmado: status === 'CONCLUDED' ? 'SIM' : 'NÃO',
      tipoPedido: texto(venda.type) ?? '',
      canal: texto(venda.salesChannel) ?? '',
      dataCancelamento: '',
      origemCancelamento: '',
      motivoCancelamento: '',
      cancelamentoContestavel: '',
      motivoImpossibilidade: '',
      dataLimiteContestacao: '',
      cancelamentoParcial: 'NÃO',
    }
    for (const item of lista(venda.orderStatusHistory)) {
      const h = obj(item)
      if (!h) continue
      const valor = texto(h.value)
      if (valor === 'PARTIAL_CANCELLATION_ORDER') v.cancelamentoParcial = 'SIM'
      if (status === 'CANCELLED' && valor === 'CANCELLED') {
        v.dataCancelamento = texto(h.createdAt) ?? ''
        const meta = obj(h.metadata)
        if (meta) {
          v.origemCancelamento = texto(meta.cancelOrigin) ?? ''
          v.motivoCancelamento = texto(meta.cancelCodeDescription) ?? ''
          const disputa = obj(meta.cancellationDispute)
          if (disputa) {
            v.cancelamentoContestavel = simNao(disputa.isContestable)
            if (Array.isArray(disputa.reasons)) {
              v.motivoImpossibilidade = disputa.reasons
                .map((r) => (typeof r === 'string' ? r : JSON.stringify(r)))
                .join(', ')
            }
          }
        }
      }
    }
    // Data limite de contestação: 1º lançamento do evento financeiro FBOE.
    for (const item of lista(venda.orderEvents)) {
      const ev = obj(item)
      if (texto(ev?.fullCode) !== 'FINANCIAL_BILLED_ORDER_ENTRY') continue
      const entrada = obj(lista(obj(ev?.metadata)?.entries)[0])
      v.dataLimiteContestacao = texto(obj(entrada?.period)?.endDate) ?? ''
      break
    }
    return v
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

  interface Resposta {
    vendas: VendaIfood[]
    /** Páginas do dia (a página 1 é que diz); 0 = sem vendas ou sem consulta. */
    totalPaginas: number
    /** Problema definitivo da parte do iFood (sem integração, credencial, 401/403). */
    aviso: string | null
  }

  function lerCorpo(bruto: string): Json | null {
    try {
      return obj(JSON.parse(bruto))
    } catch {
      return null
    }
  }

  /** Vendas da página que vieram sem os pagamentos (a resposta "leve" do iFood). */
  function vendasLeves(corpo: Json): number {
    return lista(corpo.sales)
      .map(obj)
      .filter((v) => lista(obj(v?.payments)?.methods).length === 0).length
  }

  const vazio = (aviso: string | null): Resposta => ({
    vendas: [],
    totalPaginas: 0,
    aviso,
  })

  const __giaHandler = defineHandler<Body, Resposta>(async (ctx) => {
    await ctx.requirePermission('fechamento-ifood-diario.ler')
    const ref = typeof ctx.body.operacaoRef === 'string' ? ctx.body.operacaoRef.trim() : ''
    if (!ref) throw new HttpError(422, 'Informe a loja.')
    // 403 se a operação está fora do escopo do usuário.
    const operacao = await ctx.requireOperacao(ref)
    const data = validarData(ctx.body.data)
    const pagina = Number(ctx.body.pagina)
    if (!Number.isInteger(pagina) || pagina < 1 || pagina > MAX_PAGINAS_IFOOD) {
      throw new HttpError(422, 'Página inválida.')
    }

    // Operação com canal próprio: o restaurante da tabela; as demais, o da Empresa.
    const propria = OPERACOES_IFOOD_PROPRIO[chaveOperacao(operacao.ref)]
    const empresa = propria
      ? undefined
      : (await ctx.empresas()).find((e) => e.id === operacao.empresaId)
    const merchantId = propria?.merchant ?? (empresa?.locRefs?.IFOOD?.trim() || null)
    if (!merchantId) {
      return vazio(
        'A Empresa desta operação não tem a integração com o iFood no cadastro: os pedidos não foram cruzados com o iFood e contam como Cancelado.'
      )
    }

    let cred: { baseUrl: string; token: string }
    try {
      cred = await ctx.credencial('ifood')
    } catch (e) {
      console.error('[fechamento-ifood-diario] credencial do iFood:', e)
      return vazio(
        `Não foi possível obter a credencial da API do iFood${e instanceof Error ? `: ${e.message}` : '.'}`
      )
    }
    const base = cred.baseUrl.replace(/\/+$/, '')
    const qs = new URLSearchParams({
      beginSalesDate: data,
      endSalesDate: data,
      page: String(pagina),
    })
    const url = `${base}/financial/v3.0/merchants/${encodeURIComponent(merchantId)}/sales?${qs}`
    const pedir = () =>
      getIfood(url, cred.token).catch((e: unknown) => {
        console.error('[fechamento-ifood-diario] API do iFood:', e)
        throw new HttpError(
          ehTimeout(e) ? 504 : 502,
          ehTimeout(e)
            ? `A API do iFood demorou demais para responder (página ${pagina}).`
            : `Não foi possível falar com a API do iFood (página ${pagina}).`
        )
      })
    const r = await pedir()
    // 204 = restaurante sem vendas no dia.
    if (r.status === 204) return vazio(null)
    if (!r.ok) {
      const recusa = recusaIfood(r.status)
      if (recusa) return vazio(recusa)
      throw new HttpError(
        502,
        `A API do iFood respondeu ${r.status} (página ${pagina}).${await detalheDoErro(r)}`
      )
    }
    const bruto = await r.text()
    if (!bruto.trim()) return vazio(null)
    let corpo = lerCorpo(bruto)
    // O iFood às vezes devolve a página "leve": vendas sem pagamentos nem eventos
    // financeiros, todas ou parte delas (medido em 10/11/2026: 2 de 6 pedidos seguidos da
    // mesma página). O status vem igual — os valores do fechamento não mudam —, mas Total
    // do parceiro e Data limite de contestação sairiam vazios. Pede de novo, até 2 vezes,
    // e fica com a resposta mais completa.
    for (let tentativa = 0; tentativa < 2 && corpo && vendasLeves(corpo) > 0; tentativa++) {
      try {
        const r2 = await pedir()
        if (!r2.ok) break
        const outro = lerCorpo(await r2.text())
        if (outro && vendasLeves(outro) < vendasLeves(corpo)) corpo = outro
      } catch {
        break
      }
    }
    if (!corpo) {
      throw new HttpError(502, `A API do iFood devolveu um formato inesperado (página ${pagina}).`)
    }
    const vendas = lista(corpo.sales)
      .map(obj)
      .filter((v): v is Json => v !== null)
      .map(extrair)
      .filter((v): v is VendaIfood => v !== null)
    return {
      vendas,
      totalPaginas: Math.max(1, Math.trunc(numero(corpo.pageCount) ?? 1)),
      aviso: null,
    }
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
