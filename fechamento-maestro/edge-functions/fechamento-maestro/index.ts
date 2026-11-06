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

  // Fechamento dos pedidos de delivery do Maestro de UMA loja num período: lê os
  // pedidos da API do DW (`/Delivery/`) e concilia os pagamentos de cada um.
  // O tipo de cada forma de pagamento segue a regra do legado (`classificar`
  // abaixo), com a lista de formas "ONLINE VR" lida do cadastro
  // `gia_relatorios.formas_pagamento` do banco do Maestro — só leitura.
  //
  // A loja chega como `empresaId` (validado contra o escopo); o `loc_ref` da API é o
  // número da loja tirado do NOME da Empresa no servidor — o body não escolhe loja.
  //
  // REGRA: handler auto-contido — só importa de @gia-cb/sdk/server. As funções de
  // data e `numeroDaLoja` se repetem em outros arquivos de propósito.

  interface Body {
    empresaId: number
    de: string
    ate: string
  }

  type TipoPagamento = 'online' | 'adquirente' | 'offline' | 'nao_classificado'

  interface Pagamento {
    descricao: string
    /** `null` quando o texto da API não traz o valor entre parênteses. */
    valor: number | null
    tipo: TipoPagamento
  }

  interface Desconto {
    descricao: string
    valor: number | null
  }

  interface PedidoFechamento {
    id: string
    n_pedido: string
    /** Dia do fechamento (`YYYY-MM-DD`): data de criação do pedido, hora de São Paulo. */
    data: string
    data_de_criacao: string | null
    data_de_acao: string | null
    n_parceiro: string | null
    n_conta: string | null
    /** CPF, e-mail, telefone, número e referência: mascarados sem `ver-dados-cliente`. */
    cpf_cliente: string | null
    nome_cliente: string | null
    quantidade_pedidos: number | null
    email_cliente: string | null
    telefone_cliente: string | null
    street_name: string | null
    street_number: string | null
    reference: string | null
    retirada: string | null
    confirmado_por: string | null
    cancelado_por: string | null
    origem: string | null
    status_do_pedido: string | null
    tipo_entrega: string | null
    nome_loja: string | null
    valor_do_pedido: number
    valor_da_entrega: number
    total_pago: number
    desconto_total: number
    incentivo_parceiro: number
    forma_de_pagamentos: string | null
    descontos: string | null
    pagamentos: Pagamento[]
    lista_descontos: Desconto[]
    total_pago_online: number
    /** ONLINE VR pago antes (" - PRE PAGO"): vale no app ou no parceiro. */
    total_pago_adquirentes_online: number
    /** ONLINE VR sem " - PRE PAGO": vale passado na entrega (ex.: VR Refeição). */
    total_pago_adquirentes_offline: number
    total_pago_offline: number
    total_nao_classificado: number
    total_de_descontos: number
    /** Incentivo que vai para Descontos parceiro (regra do legado); 0 se não se aplica. */
    desconto_parceiro: number
    /** Quanto do `desconto_parceiro` sai do Online (só se o pedido tem parte ONLINE). */
    abatimento_online: number
    cancelado: boolean
    venda_concluida: boolean
    check_pagamentos: boolean
    check_descontos: boolean
    divergencias: string[]
  }

  /** Id da integração da api-dw.cocobambu.com no hub de Credenciais. */
  const INTEGRACAO = 'apidw'
  /** A API aceita até 6 meses, mas 31 dias de uma loja já levam ~25 s para responder. */
  const MAX_DIAS_PERIODO = 31
  /** Mesmo teto do Reports Maestro (90 s); acima disso a borda da API devolve 524. */
  const TIMEOUT_MS = 90_000
  const DATA_RE = /^\d{4}-\d{2}-\d{2}$/

  /** Forma do cadastro do legado com tipo "ONLINE VR" (o grupo Adquirentes). */
  interface FormaOnlineVr {
    /** Trecho em maiúsculas procurado dentro da forma de pagamento. */
    descricao: string
    /** Chave da origem (`normalizarOrigem`); vazia = vale para todas. */
    origem: string
  }

  /** Sufixo que a API põe nas formas pagas antes, no app ou no parceiro. */
  const PRE_PAGO = /\s*-\s*PRE\s+PAGO\s*$/i
  /** Cartão mascarado no começo da forma (`**** 1234 - Amex` → `Amex`). */
  const CARTAO_MASCARADO = /\*\*\*\*\s\d{4}\s-\s/

  /**
   * Status que contam como venda concluída: despachado ou entregue. COMPLETED é o
   * prato pronto na cozinha, ainda não saiu. Só esses pedidos entram em Descontos loja.
   */
  const STATUS_CONCLUIDOS = new Set(['DISPATCHED', 'DELIVERED'])
  /** No 99Food o incentivo do parceiro não vira Descontos parceiro (regra do legado). */
  const ORIGEM_SEM_DESCONTO_PARCEIRO = '99food'
  const STATUS_CANCELADO = 'CANCELLED'

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
    if (!existe(de) || !existe(ate)) {
      throw new HttpError(422, 'Data inválida.')
    }
    if (de > ate) throw new HttpError(422, 'A data final não pode ser menor que a data inicial.')
    if (diasEntre(de, ate) + 1 > MAX_DIAS_PERIODO) {
      throw new HttpError(
        422,
        `O intervalo de datas não pode ser maior que ${MAX_DIAS_PERIODO} dias.`
      )
    }
    return { de, ate }
  }

  /**
   * Número da loja com 2 dígitos — o `loc_ref` da API. Sai primeiro do vínculo com a
   * BI do Simphony (`locRefs.BIAPI` começa sempre pelo número: "01 CB Go", "17. CB R",
   * "13CBMa", "65"); o nome da Empresa ("01.CB GOIANIA") fica de reserva.
   */
  function numeroDaLoja(e: { nome: string; locRefs: Record<string, string> }): string | null {
    const m = /^\s*(\d{1,4})/.exec(e.locRefs?.BIAPI ?? '') ?? /^\s*(\d{1,4})\s*\./.exec(e.nome)
    return m ? String(Number(m[1])).padStart(2, '0') : null
  }

  function texto(v: unknown): string | null {
    if (v === null || v === undefined) return null
    const s = String(v).trim()
    return s === '' ? null : s
  }

  function numero(v: unknown): number {
    const n = typeof v === 'number' ? v : Number(v)
    return Number.isFinite(n) ? n : 0
  }

  /** Valor em centavos inteiros — toda soma e comparação do fechamento é em centavos. */
  function centavos(v: number): number {
    return Math.round(v * 100)
  }

  function reais(c: number): number {
    return c / 100
  }

  function brl(c: number): string {
    const s = (Math.abs(c) / 100).toFixed(2).replace('.', ',')
    return `${c < 0 ? '-' : ''}R$ ${s.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
  }

  /**
   * `"PIX ONLINE PIX - PRE PAGO (144.9), BENEFICIO IFOOD ENTREGA - PRE PAGO (4.31)"`
   * → `[{ descricao, valor }]`. A vírgula só separa itens logo depois do parêntese do
   * valor — descrição com vírgula ("VALE, REFEICAO (10)") não quebra.
   */
  function separarItens(bruto: string | null): { descricao: string; valor: number | null }[] {
    if (!bruto) return []
    return bruto
      .split(/(?<=\))\s*,\s*/)
      .map((parte) => parte.trim())
      .filter(Boolean)
      .map((parte) => {
        const m = /^(.*?)\s*\(\s*(-?\d+(?:\.\d+)?)\s*\)\s*$/.exec(parte)
        return m ? { descricao: m[1].trim(), valor: Number(m[2]) } : { descricao: parte, valor: null }
      })
  }

  /**
   * Chave da origem para casar o pedido com o cadastro — a `normalizeOrigemKey` do
   * legado: minúsculas, espaços viram `_`, `APP CB` = `App Coco Bambu`, `99 Food` = `99Food`.
   */
  function normalizarOrigem(origem: string | null | undefined): string {
    if (!origem) return ''
    const s = origem.trim().toLowerCase().replace(/\s+/g, ' ')
    const apelidos: Record<string, string> = { 'app cb': 'app coco bambu', '99 food': '99food' }
    return (apelidos[s] ?? s).replace(/\s+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')
  }

  /**
   * Tipo de uma forma de pagamento — a `classifyPaymentSegment` do legado, nesta ordem:
   * 1. vazia ou `DESCONHECIDO` → não classificado;
   * 2. contém (sem o " - PRE PAGO") uma forma "ONLINE VR" do cadastro, da mesma origem
   *    do pedido ou sem origem → adquirente (ONLINE VR);
   * 3. termina em " - PRE PAGO" → online;
   * 4. qualquer outra → offline.
   * `formasVr` vem ordenada da descrição mais longa para a mais curta.
   */
  function classificar(
    descricao: string,
    origemPedido: string,
    formasVr: FormaOnlineVr[]
  ): TipoPagamento {
    const semCartao = descricao.trim().replace(CARTAO_MASCARADO, '').trim().toUpperCase()
    if (semCartao === '' || semCartao === 'DESCONHECIDO') return 'nao_classificado'

    const semPrePago = semCartao.replace(PRE_PAGO, '').trim()
    const vr = formasVr.some(
      (f) => (f.origem === '' || f.origem === origemPedido) && semPrePago.includes(f.descricao)
    )
    if (vr) return 'adquirente'
    return PRE_PAGO.test(descricao.trim()) ? 'online' : 'offline'
  }

  /** Formas "ONLINE VR" do cadastro do legado (só as ativas), da mais longa para a mais curta. */
  async function carregarFormasOnlineVr(): Promise<FormaOnlineVr[]> {
    let linhas: { descricao: string | null; origem: string | null }[]
    try {
      linhas = await sql<{ descricao: string | null; origem: string | null }[]>`
        select descricao, origem
        from gia_relatorios.formas_pagamento
        where coalesce(is_deleted, false) = false and tipo = 'ONLINE VR'
      `
    } catch (e) {
      console.error('[fechamento] cadastro de formas de pagamento:', e)
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

  function conciliar(
    raw: Record<string, unknown>,
    formasVr: FormaOnlineVr[]
  ): PedidoFechamento | null {
    const id = texto(raw.id)
    if (!id) return null

    const formaPgto = texto(raw.forma_de_pagamentos)
    const descontosTxt = texto(raw.descontos)
    const totalPago = numero(raw.total_pago)
    const descontoTotal = numero(raw.desconto_total)
    const status = texto(raw.status_do_pedido)
    const criacao = texto(raw.data_de_criacao_horario_sp)
    const acao = texto(raw.data_de_acao_horario_sp)
    const origem = texto(raw.origem)
    const origemChave = normalizarOrigem(origem)

    const pagamentos: Pagamento[] = separarItens(formaPgto).map((i) => ({
      ...i,
      tipo: classificar(i.descricao, origemChave, formasVr),
    }))
    const listaDescontos: Desconto[] = separarItens(descontosTxt)

    const porTipo: Record<TipoPagamento, number> = {
      online: 0,
      adquirente: 0,
      offline: 0,
      nao_classificado: 0,
    }
    let adquirentesOnline = 0
    const divergencias: string[] = []
    for (const p of pagamentos) {
      if (p.valor === null) {
        divergencias.push(`Forma de pagamento sem valor: "${p.descricao}".`)
        continue
      }
      porTipo[p.tipo] += centavos(p.valor)
      if (p.tipo === 'adquirente' && PRE_PAGO.test(p.descricao))
        adquirentesOnline += centavos(p.valor)
      if (p.tipo === 'nao_classificado') {
        divergencias.push(`Forma de pagamento sem classificação: "${p.descricao}".`)
      }
    }
    const somaPagamentos =
      porTipo.online + porTipo.adquirente + porTipo.offline + porTipo.nao_classificado
    if (somaPagamentos !== centavos(totalPago)) {
      divergencias.push(
        `Soma das formas de pagamento (${brl(somaPagamentos)}) diferente do total pago (${brl(centavos(totalPago))}).`
      )
    }
    const checkPagamentos = divergencias.length === 0

    let somaDescontos = 0
    for (const d of listaDescontos) {
      if (d.valor === null) divergencias.push(`Desconto sem valor: "${d.descricao}".`)
      else somaDescontos += centavos(d.valor)
    }
    const descontosSemValor = listaDescontos.some((d) => d.valor === null)
    if (somaDescontos !== centavos(descontoTotal)) {
      divergencias.push(
        `Soma dos descontos (${brl(somaDescontos)}) diferente do desconto total (${brl(centavos(descontoTotal))}).`
      )
    }
    const checkDescontos = !descontosSemValor && somaDescontos === centavos(descontoTotal)

    // Descontos parceiro (regra do legado): o incentivo do parceiro só conta em pedido
    // que não é 99Food e tem forma ONLINE VR ou OFFLINE; nesse caso ele sai do Online
    // do pedido, se houver parte ONLINE.
    const incentivo = numero(raw.incentivo_parceiro)
    const tipos = new Set(pagamentos.map((p) => p.tipo))
    const descontoParceiro =
      origemChave !== ORIGEM_SEM_DESCONTO_PARCEIRO &&
      incentivo > 0 &&
      (tipos.has('adquirente') || tipos.has('offline'))
        ? incentivo
        : 0
    const abatimentoOnline = tipos.has('online') ? descontoParceiro : 0

    return {
      id,
      // n_pedido às vezes vem como número — o legado já tratava (GetJsonStr).
      n_pedido: texto(raw.n_pedido) ?? '',
      data: (criacao ?? acao ?? '').slice(0, 10),
      data_de_criacao: criacao,
      data_de_acao: acao,
      n_parceiro: texto(raw.n_parceiro),
      n_conta: texto(raw.n_conta),
      cpf_cliente: texto(raw.cpf_cliente),
      nome_cliente: texto(raw.nome_cliente),
      quantidade_pedidos:
        texto(raw.quantidade_pedidos) === null ? null : numero(raw.quantidade_pedidos),
      email_cliente: texto(raw.email_cliente),
      telefone_cliente: texto(raw.telefone_cliente),
      street_name: texto(raw.street_name),
      street_number: texto(raw.street_number),
      reference: texto(raw.reference),
      retirada: texto(raw.retirada),
      confirmado_por: texto(raw.confirmado_por),
      cancelado_por: texto(raw.cancelado_por),
      origem,
      status_do_pedido: status,
      tipo_entrega: texto(raw.tipo_entrega),
      nome_loja: texto(raw.nome_loja),
      valor_do_pedido: numero(raw.valor_do_pedido),
      valor_da_entrega: numero(raw.valor_da_entrega),
      total_pago: totalPago,
      desconto_total: descontoTotal,
      incentivo_parceiro: incentivo,
      forma_de_pagamentos: formaPgto,
      descontos: descontosTxt,
      pagamentos,
      lista_descontos: listaDescontos,
      total_pago_online: reais(porTipo.online),
      total_pago_adquirentes_online: reais(adquirentesOnline),
      total_pago_adquirentes_offline: reais(porTipo.adquirente - adquirentesOnline),
      total_pago_offline: reais(porTipo.offline),
      total_nao_classificado: reais(porTipo.nao_classificado),
      total_de_descontos: reais(somaDescontos),
      desconto_parceiro: descontoParceiro,
      abatimento_online: abatimentoOnline,
      cancelado: status === STATUS_CANCELADO,
      venda_concluida: status !== null && STATUS_CONCLUIDOS.has(status),
      check_pagamentos: checkPagamentos,
      check_descontos: checkDescontos,
      divergencias,
    }
  }

  // ─── Mascaramento (sem `fechamento-maestro.ver-dados-cliente`) ───────────────
  // Mesma regra do Reports Maestro.

  const OCULTO = '***'

  /** "12345678901" → "***.456.789-**". Fora do formato de CPF, oculta tudo. */
  function mascararCpf(v: string): string {
    const d = v.replace(/\D/g, '')
    return d.length === 11 ? `***.${d.slice(3, 6)}.${d.slice(6, 9)}-**` : OCULTO
  }

  /** "joao.silva@gmail.com" → "jo***@gmail.com" (usuário curto: só a 1ª letra). */
  function mascararEmail(v: string): string {
    const arroba = v.lastIndexOf('@')
    if (arroba < 1) return OCULTO
    return `${v.slice(0, arroba > 2 ? 2 : 1)}***${v.slice(arroba)}`
  }

  /** "11987654321" → "(11) *****-4321"; sem DDD reconhecível, só os 4 últimos dígitos. */
  function mascararTelefone(v: string): string {
    let d = v.replace(/\D/g, '')
    if (d.length < 8) return OCULTO
    if (d.startsWith('55') && d.length >= 12) d = d.slice(2)
    const fim = d.slice(-4)
    return (d.length === 10 || d.length === 11) && !d.startsWith('0')
      ? `(${d.slice(0, 2)}) *****-${fim}`
      : `*****-${fim}`
  }

  /** Nome do cliente e nome da rua ficam: é por eles que se acha o pedido de uma reclamação. */
  function mascarar(p: PedidoFechamento): PedidoFechamento {
    return {
      ...p,
      cpf_cliente: p.cpf_cliente && mascararCpf(p.cpf_cliente),
      email_cliente: p.email_cliente && mascararEmail(p.email_cliente),
      telefone_cliente: p.telefone_cliente && mascararTelefone(p.telefone_cliente),
      street_number: p.street_number && OCULTO,
      reference: p.reference && OCULTO,
    }
  }

  /** Mensagem que a API devolve no corpo de um erro (`{ "detail": "..." }`), se houver. */
  async function detalheDoErro(r: Response): Promise<string> {
    try {
      const corpo = (await r.json()) as { detail?: unknown }
      return typeof corpo.detail === 'string' ? ` ${corpo.detail}` : ''
    } catch {
      return ''
    }
  }

  interface Resposta {
    pedidos: PedidoFechamento[]
    /** `true` quando CPF, e-mail, telefone e endereço vieram mascarados. */
    dadosClienteMascarados: boolean
  }

  const __giaHandler = defineHandler<Body, Resposta>(async (ctx) => {
    await ctx.requirePermission('fechamento-maestro.ler')
    const empresaId = Number(ctx.body.empresaId)
    if (!Number.isInteger(empresaId)) throw new HttpError(422, 'Informe a loja.')
    await ctx.requireEmpresa(empresaId)
    const { de, ate } = validarPeriodo(ctx.body.de, ctx.body.ate)
    const verDados = await ctx.hasPermission('fechamento-maestro.ver-dados-cliente')

    const empresa = (await ctx.empresas()).find((e) => e.id === empresaId)
    // Só a loja com CNPJ (`tipoRegistro === 'empresa'`) — mesma regra de lojas.ts.
    if (!empresa || empresa.tipoRegistro !== 'empresa')
      throw new HttpError(404, 'Loja não encontrada.')
    const locRef = numeroDaLoja(empresa)
    if (!locRef) {
      throw new HttpError(
        422,
        `A loja "${empresa.nome}" não tem número de loja no cadastro (vínculo com a BI do Simphony).`
      )
    }

    // O cadastro carrega enquanto a API (bem mais lenta) responde.
    const formasVrPromise = carregarFormasOnlineVr()
    // Sem isto, um erro do banco antes da API terminar viraria "unhandled rejection".
    formasVrPromise.catch(() => {})

    const { baseUrl, token } = await ctx.credencial(INTEGRACAO)
    const base = baseUrl.replace(/\/+$/, '')
    const qs = new URLSearchParams({ loc_ref: locRef, start_date: de, end_date: ate })

    let r: Response
    try {
      r = await fetch(`${base}/Delivery/?${qs}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })
    } catch (e) {
      if (e instanceof Error && (e.name === 'TimeoutError' || e.name === 'AbortError')) {
        throw new HttpError(
          504,
          'A API de delivery demorou demais para responder. Tente um período menor.'
        )
      }
      throw e
    }
    if (!r.ok) {
      throw new HttpError(502, `A API de delivery respondeu ${r.status}.${await detalheDoErro(r)}`)
    }

    const json = (await r.json()) as { data?: unknown }
    // 200 sem a lista `data` é falha, não "zero pedidos".
    if (!json || !Array.isArray(json.data)) {
      throw new HttpError(502, 'A API de delivery devolveu um formato inesperado.')
    }

    const formasVr = await formasVrPromise
    const pedidos: PedidoFechamento[] = []
    for (const raw of json.data as Record<string, unknown>[]) {
      const p = raw && typeof raw === 'object' ? conciliar(raw, formasVr) : null
      if (p) pedidos.push(verDados ? p : mascarar(p))
    }
    pedidos.sort((a, b) => (a.data_de_criacao ?? '').localeCompare(b.data_de_criacao ?? ''))
    return { pedidos, dadosClienteMascarados: !verDados }
  })


  return __giaHandler
})() as ServerHandler<unknown, unknown>

// ─── src/server/lojas.ts ────────────────────────────────────────────────
__giaHandlers["lojas"] = (() => {

  // Lojas que o usuário pode consultar: todas as Empresas do escopo dele com
  // `tipoRegistro === 'empresa'` (a loja, com CNPJ). Propriedades (escritório,
  // centro de distribuição — sem CNPJ próprio) ficam de fora.
  //
  // O número da loja (`loc_ref` da API de delivery) vem primeiro do vínculo com a
  // BI do Simphony (`locRefs.BIAPI`) e, na falta, do nome da Empresa
  // ("01.CB GOIANIA"). Loja sem número aparece mesmo assim, com `locRef: null` —
  // a pesquisa dela devolve um aviso claro (ver fechamento.ts).
  //
  // REGRA: handler auto-contido — só importa de @gia-cb/sdk/server. `numeroDaLoja`
  // se repete em fechamento.ts de propósito.

  interface Loja {
    empresaId: number
    nome: string
    locRef: string | null
    ativo: boolean
  }

  /**
   * Número da loja com 2 dígitos — o `loc_ref` da API. Sai primeiro do vínculo com a
   * BI do Simphony (`locRefs.BIAPI` começa sempre pelo número: "01 CB Go", "17. CB R",
   * "13CBMa", "65"); o nome da Empresa ("01.CB GOIANIA") fica de reserva.
   */
  function numeroDaLoja(e: { nome: string; locRefs: Record<string, string> }): string | null {
    const m = /^\s*(\d{1,4})/.exec(e.locRefs?.BIAPI ?? '') ?? /^\s*(\d{1,4})\s*\./.exec(e.nome)
    return m ? String(Number(m[1])).padStart(2, '0') : null
  }

  const __giaHandler = defineHandler<Record<string, never>, Loja[]>(async (ctx) => {
    await ctx.requirePermission('fechamento-maestro.ler')
    // ctx.empresas() já vem recortado pelo escopo; a checagem explícita deixa o
    // "ONDE" visível aqui e no gia validate.
    const escopo = await ctx.empresaScope()
    const lojas: Loja[] = []
    for (const e of await ctx.empresas()) {
      if (!escopo.all && !escopo.empresaIds.includes(e.id)) continue
      if (e.tipoRegistro !== 'empresa') continue
      lojas.push({ empresaId: e.id, nome: e.nome, locRef: numeroDaLoja(e), ativo: e.ativo })
    }
    return lojas.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { numeric: true }))
  })


  return __giaHandler
})() as ServerHandler<unknown, unknown>

const __MODULE_ID = "fechamento-maestro"
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
