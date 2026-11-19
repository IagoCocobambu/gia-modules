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
  sigla: string | null
  dataAbertura: string | null
  dataFechamento: string | null
  integracoes: GiaIntegracaoOperacao[]
  locRefs: Record<string, string>
  planos: string[]
}
type GiaIntegracaoOperacao = { tipo: string; locRef: string; descricao: string | null }
type GiaEndereco = {
  logradouro: string | null
  numero: string | null
  complemento: string | null
  bairro: string | null
  cep: string | null
  cidade: string | null
  uf: string | null
  tipoLocalizacao: string | null
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
  endereco: GiaEndereco
  coordenadas: { latitude: number; longitude: number } | null
  regiao: string | null
  regiaoCb: string | null
  ehMatriz: boolean
  empresaMatrizId: number | null
  tabelasPreco: { cb: string | null; vasto: string | null; pizza: string | null }
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
      `sigla_operacao,data_abertura,data_fechamento,` +
      `operacoes_rankings(rankings_areas(chave,ativo),rankings_opcoes(nome)),` +
      // Vínculos e planos no MESMO embed (alpha.71). Ordenados por `id` pelo
      // mesmo motivo das integrações da Empresa: o primeiro de cada tipo é o
      // `locRefs`, e a escolha não pode depender da ordem do PostgREST.
      `operacoes_integracoes(id,tipo,p_loc_ref,p_descricao,ativo,deleted_at),` +
      `operacoes_planos(tipo,ativo,deleted_at)` +
      `&operacoes_integracoes.order=id&operacoes_planos.order=tipo${filtro}`,
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
    sigla_operacao: string | null
    data_abertura: string | null
    data_fechamento: string | null
    operacoes_rankings?: Array<{
      rankings_areas: { chave: string; ativo: boolean } | null
      rankings_opcoes: { nome: string } | null
    }> | null
    operacoes_integracoes?: Array<{
      id: number
      tipo: string
      p_loc_ref: string | null
      p_descricao: string | null
      ativo: boolean
      deleted_at: string | null
    }> | null
    operacoes_planos?: Array<{ tipo: string; ativo: boolean; deleted_at: string | null }> | null
  }>
  return rows.map((o) => {
    const rankings: Record<string, string | null> = {}
    for (const r of o.operacoes_rankings ?? []) {
      // Área desativada sai do cadastro — não deixar o valor antigo vazar.
      if (!r.rankings_areas?.ativo) continue
      rankings[r.rankings_areas.chave] = r.rankings_opcoes?.nome ?? null
    }
    // Vínculo desativado, excluído ou sem identificador não é identidade válida
    // (mesma regra do `locRefs` da Empresa).
    const integracoes: GiaIntegracaoOperacao[] = []
    const locRefs: Record<string, string> = {}
    for (const i of o.operacoes_integracoes ?? []) {
      const locRef = (i.p_loc_ref ?? '').trim()
      if (!i.ativo || i.deleted_at || !locRef) continue
      integracoes.push({ tipo: i.tipo, locRef, descricao: __giaTexto(i.p_descricao) })
      if (locRefs[i.tipo] === undefined) locRefs[i.tipo] = locRef
    }
    const planos = [
      ...new Set(
        (o.operacoes_planos ?? []).filter((x) => x.ativo && !x.deleted_at).map((x) => x.tipo)
      ),
    ]
    return {
      id: o.operacao_id,
      ref: o.operacao_ref,
      nome: o.nome_operacao ?? o.operacao_ref,
      tipo: o.tipo_operacao ?? undefined,
      empresaId: o.empresa_id,
      ativo: o.ativo,
      rankings,
      sigla: __giaTexto(o.sigla_operacao),
      dataAbertura: o.data_abertura ? o.data_abertura.slice(0, 10) : null,
      dataFechamento: o.data_fechamento ? o.data_fechamento.slice(0, 10) : null,
      integracoes,
      locRefs,
      planos,
    }
  })
}
/** Texto do cadastro: vazio ou só espaços vira `null`. */
function __giaTexto(v: string | null | undefined): string | null {
  const t = (v ?? '').trim()
  return t ? t : null
}
/** `numeric` chega como texto pelo PostgREST; só vale com as duas, finitas e fora de 0,0. */
function __giaCoordenadas(
  lat: number | string | null,
  lng: number | string | null
): { latitude: number; longitude: number } | null {
  if (lat === null || lng === null || lat === '' || lng === '') return null
  const latitude = Number(lat)
  const longitude = Number(lng)
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null
  if (latitude === 0 && longitude === 0) return null
  return { latitude, longitude }
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
      // alpha.71: endereço, coordenadas, regiões, matriz e Tabela Oficial.
      `logradouro,numero,complemento,bairro,cep,cidade,estado,tipo_localizacao,` +
      `latitude,longitude,regiao,regiao_cb,is_matriz,empresa_matriz_id,tabela,tab_vasto,tab_pizza,` +
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
    logradouro: string | null
    numero: string | null
    complemento: string | null
    bairro: string | null
    cep: string | null
    cidade: string | null
    estado: string | null
    tipo_localizacao: string | null
    latitude: number | string | null
    longitude: number | string | null
    regiao: string | null
    regiao_cb: string | null
    is_matriz: boolean | null
    empresa_matriz_id: number | null
    tabela: string | null
    tab_vasto: string | null
    tab_pizza: string | null
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
      endereco: {
        logradouro: __giaTexto(e.logradouro),
        numero: __giaTexto(e.numero),
        complemento: __giaTexto(e.complemento),
        bairro: __giaTexto(e.bairro),
        cep: __giaTexto(e.cep),
        cidade: __giaTexto(e.cidade),
        uf: __giaTexto(e.estado),
        tipoLocalizacao: __giaTexto(e.tipo_localizacao),
      },
      coordenadas: __giaCoordenadas(e.latitude, e.longitude),
      regiao: __giaTexto(e.regiao),
      regiaoCb: __giaTexto(e.regiao_cb),
      ehMatriz: e.is_matriz === true,
      empresaMatrizId: e.empresa_matriz_id ?? null,
      tabelasPreco: {
        cb: __giaTexto(e.tabela),
        vasto: __giaTexto(e.tab_vasto),
        pizza: __giaTexto(e.tab_pizza),
      },
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

// ─── src/server/historico.ts ────────────────────────────────────────────
__giaHandlers["historico"] = (() => {

  // Histórico das gravações do fechamento de uma loja/mês, da mais recente para a
  // mais antiga: quem salvou, quando e o antes → depois (`ifood_fechamento.historico`,
  // gravado pelo handler `salvar` na mesma transação). Quem consulta o fechamento
  // (`.ler`) vê o histórico.
  //
  // REGRA: handler auto-contido — só importa de @gia-cb/sdk/server.

  interface Body {
    /** Empresa (loja) escolhida — o fechamento é da loja inteira (todas as operações). */
    empresaId: number
    mes: string
  }

  type Valor = string | number | null
  type Alteracao =
    | {
        secao: string
        item: string
        campo: string
        de: Valor
        para: Valor
        tipo: 'texto' | 'data' | 'moeda'
      }
    | { secao: string; item: string; acao: 'incluida' | 'removida' }

  interface Gravacao {
    id: string
    gravadoEm: string
    autorNome: string | null
    alteracoes: Alteracao[]
  }

  interface Resposta {
    gravacoes: Gravacao[]
    /** Há gravações mais antigas que as devolvidas. */
    maisAntigas: boolean
    /**
     * Quando o fechamento foi criado (primeira gravação, inclusive as feitas antes do
     * histórico existir). `null` = o mês ainda não foi gravado.
     */
    criadoEm: string | null
  }

  const LIMITE = 100

  /**
   * Número da loja com 2 dígitos — o `loc_ref` do fechamento no banco e do DW.
   * Sai primeiro do nome da Empresa ("01.CB GOIANIA" → "01"; todas as lojas do cadastro
   * têm o número no nome) e, na falta, do vínculo com a BI do Simphony (`locRefs.BIAPI`
   * começa pelo número: "01 CB Go", "17. CB R"). O nome vem antes porque o BIAPI pode
   * divergir: na 999.CB TECH HOMOLOG ele é "995 CB L".
   */
  function numeroDaLoja(e: { nome: string; locRefs: Record<string, string> }): string | null {
    const m = /^\s*(\d{1,4})\s*\./.exec(e.nome) ?? /^\s*(\d{1,4})/.exec(e.locRefs?.BIAPI ?? '')
    return m ? String(Number(m[1])).padStart(2, '0') : null
  }

  /**
   * Falha do banco/conexão (o postgres.js põe um `code`: SQLSTATE como "42P01" ou de
   * rede como "ECONNREFUSED"). Outro erro é bug do código e segue como 500.
   */
  function ehFalhaDoBanco(e: unknown): boolean {
    return typeof (e as { code?: unknown } | null)?.code === 'string'
  }

  /** Erro do banco não vai cru para a tela (detalhe no log do servidor). */
  function erroDeBanco(e: unknown): never {
    if (e instanceof HttpError || !ehFalhaDoBanco(e)) throw e
    console.error('[fechamento-ifood-mensal] erro ao ler o histórico no banco:', e)
    if ((e as { code?: string } | null)?.code === '42P01') {
      throw new HttpError(
        503,
        'O histórico ainda não está disponível: o banco do fechamento não tem a tabela de histórico. Avise o suporte.'
      )
    }
    throw new HttpError(
      503,
      'Não foi possível ler o histórico agora (falha no banco de dados). Tente de novo em alguns minutos.'
    )
  }

  const __giaHandler = defineHandler<Body, Resposta>(async (ctx) => {
    try {
      await ctx.requirePermission('fechamento-ifood-mensal.ler')
      // A loja é a Empresa: o fechamento junta todas as operações dela. O número da loja
      // (do nome da Empresa, ou do BIAPI) é a chave no banco do Maestro — o `loc_ref` do
      // fechamento (como no legado) e o `property_number` do borderô.
      const empresaId = Number(ctx.body.empresaId)
      if (!Number.isInteger(empresaId) || empresaId <= 0) throw new HttpError(422, 'Informe a loja.')
      // 403 se a Empresa está fora do escopo do usuário.
      await ctx.requireEmpresa(empresaId)
      const empresa = (await ctx.empresas()).find((e) => e.id === empresaId)
      if (!empresa) throw new HttpError(404, 'Loja não encontrada.')
      // Só Empresa (loja) tem fechamento — como no seletor (`lojas.ts`). Uma propriedade
      // com número no nome apontaria para a loja de mesmo número, talvez fora do escopo.
      if (empresa.tipoRegistro !== 'empresa')
        throw new HttpError(422, `"${empresa.nome}" não é uma loja (Empresa).`)
      const locRef = numeroDaLoja(empresa)
      if (!locRef) {
        throw new HttpError(
          422,
          `A loja "${empresa.nome}" não tem o número da loja no nome nem no vínculo BIAPI.`
        )
      }
      const mm = /^(\d{4})-(\d{2})$/.exec(String(ctx.body.mes ?? ''))
      const ano = mm ? Number(mm[1]) : 0
      const mes = mm ? Number(mm[2]) : 0
      if (ano < 2000 || mes < 1 || mes > 12) throw new HttpError(422, 'Mês inválido (AAAA-MM).')

      const [cab] = await sql<Array<{ id: string; criado_em: string }>>`
        SELECT id::text,
          to_char(criado_em AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS criado_em
        FROM ifood_fechamento.fechamentos_mensais
        WHERE loc_ref = ${locRef} AND ano = ${ano} AND mes = ${mes} AND deletado_em IS NULL
      `
      if (!cab) return { gravacoes: [], maisAntigas: false, criadoEm: null }

      const linhas = await sql<
        Array<{
          id: string
          gravado_em: string
          autor_nome: string | null
          alteracoes: unknown
        }>
      >`
        SELECT id::text,
          to_char(gravado_em AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS gravado_em,
          autor_nome, alteracoes
        FROM ifood_fechamento.historico
        WHERE fechamento_id = ${cab.id}::bigint
        ORDER BY gravado_em DESC, id DESC
        LIMIT ${LIMITE + 1}
      `
      const lista = (v: unknown): Alteracao[] => {
        const bruto = typeof v === 'string' ? (JSON.parse(v) as unknown) : v
        return Array.isArray(bruto) ? (bruto as Alteracao[]) : []
      }
      return {
        gravacoes: linhas.slice(0, LIMITE).map((l) => ({
          id: l.id,
          gravadoEm: l.gravado_em,
          autorNome: l.autor_nome,
          alteracoes: lista(l.alteracoes),
        })),
        maisAntigas: linhas.length > LIMITE,
        criadoEm: cab.criado_em,
      }
    } catch (e) {
      erroDeBanco(e)
    }
  })


  return __giaHandler
})() as ServerHandler<unknown, unknown>

// ─── src/server/ledger.ts ───────────────────────────────────────────────
__giaHandlers["ledger"] = (() => {

  // Lançamentos financeiros do iFood (API Financial v3, "sales") de UMA página de
  // UMA janela do mês — a aba Lançamentos e a base de todas as outras abas.
  //
  // Por que janela + página: a API não devolve o mês inteiro de uma vez. O legado
  // (TDmFechamentoDiarioIfood.BuscarLedgerJanelaUnica) quebra o mês em janelas de
  // no máximo 8 dias e pagina cada janela. Aqui o navegador chama este handler uma
  // vez por página (até 3 ao mesmo tempo, menos quando o iFood oscila) — cada chamada é curta (~4 s; cabe no tempo
  // da Edge Function) e a tela mostra o progresso real.
  //
  // O mapeamento de cada lançamento (descrição, tipo, classificação, fato gerador,
  // TOTAL e STATUS) é o do legado, linha a linha (AppendLedgerLineMensal e as
  // funções Map*/Calc*Ledger do Model Delphi).
  //
  // REGRA: handler auto-contido — só importa de @gia-cb/sdk/server.

  const INTEGRACAO = 'ifood'
  const MAX_DIAS_JANELA = 8
  /**
   * Uma página leva ~4 s. Passou de 30 s, desiste (504) e a tela NÃO repete: chamada
   * lenta repetida só prende o usuário (padrão 9 do workspace). O legado esperava 90 s.
   */
  const TIMEOUT_MS = 30_000
  /**
   * Repetições IMEDIATAS (sem espera) da mesma página quando o iFood devolve vendas
   * vazias ou um 429 com saldo de cota sobrando. Medido em 16/11/2026 (20 cb, mai/26,
   * 540 chamadas): a repetição passa em ~metade das vezes com 0 ms, 250 ms ou 1 s de
   * espera — esperar não ajuda, só atrasa. Esgotadas, a página volta para a fila da tela.
   */
  const REPETICOES_IMEDIATAS = 3
  /**
   * Cota esgotada de verdade: a tela pausa até o `ifood-ratelimit-reset` + esta folga
   * (o reset vem em segundos inteiros, arredondado). Teto de 60 s = a janela da cota.
   */
  const FOLGA_COTA_MS = 1000
  const ESPERA_COTA_MAX_S = 60

  interface Body {
    /** Empresa (loja) escolhida — o fechamento junta todas as operações dela. */
    empresaId: number
    /** UUID do restaurante no iFood — um dos da loja (conferido aqui). */
    merchant: string
    /** Competência `AAAA-MM`. */
    mes: string
    /** 1..totalJanelas */
    janela: number
    /** 1..totalPaginas */
    pagina: number
  }

  interface LinhaLedger {
    total: number
    status: 'ONLINE' | 'ONLINE VR' | 'OFFLINE'
    /** `AAAA-MM-DD` do pedido (antes das 6h conta no dia anterior) ou `Ocorrências`. */
    data: string
    competencia: string
    competenciaLabel: string
    /** `DD/MM/AAAA` (formato do legado) ou vazio. */
    dataRepasse: string
    classificacao: string
    fatoGerador: string
    tipoLancamento: string
    descricao: string
    valor: number
    baseCalculo: number
    percentualTaxa: number
    impactoRepasse: 'SIM' | 'NÃO'
    pedidoId: string
    pedidoCurto: string
    metodoPagamento: string
    bandeira: string
  }

  interface Resposta {
    linhas: LinhaLedger[]
    janela: number
    totalJanelas: number
    pagina: number
    /** Páginas da janela (o navegador usa o valor da página 1). */
    totalPaginas: number
    inicio: string
    fim: string
    /**
     * O iFood negou este restaurante (403: não autorizou o aplicativo). Ele fica de fora
     * e a tela avisa; os outros restaurantes da loja seguem.
     */
    aviso: string | null
    /**
     * Saldo da cota do iFood na última resposta (`ifood-ratelimit-remaining` e `-reset`).
     * A cota é uma só para a credencial inteira (1.000 chamadas por janela de 60 s).
     */
    cota: Cota | null
    /** Repetições imediatas que esta página precisou (vendas vazias ou 429 com saldo). */
    repeticoes: number
    /**
     * A página NÃO veio: a tela deve pedi-la de novo mais tarde. `cota` = cota esgotada
     * (pausar TODAS as chamadas por `esperarMs`); `instavel` (429 com saldo) e
     * `incompleta` (vendas sem o evento financeiro) = repetições imediatas esgotadas
     * (a página volta para o fim da fila, sem pausa).
     */
    adiar: Adiar | null
  }

  interface Cota {
    restantes: number
    /** Segundos até a cota voltar a 1.000. */
    resetS: number
  }

  interface Adiar {
    motivo: 'cota' | 'instavel' | 'incompleta'
    esperarMs: number
  }

  type Json = Record<string, unknown>

  // ── Leitura tolerante do JSON (GetJsonStr/Num/Bool do legado) ──────────────
  function str(o: Json | undefined, k: string, padrao = ''): string {
    const v = o?.[k]
    if (typeof v === 'string') return v
    if (typeof v === 'number' || typeof v === 'boolean') return String(v)
    return padrao
  }
  function num(o: Json | undefined, k: string, padrao = 0): number {
    const v = o?.[k]
    if (typeof v === 'number' && Number.isFinite(v)) return v
    if (typeof v === 'string' && v.trim() !== '') {
      const n = Number(v)
      return Number.isFinite(n) ? n : padrao
    }
    return padrao
  }
  function bool(o: Json | undefined, k: string): boolean {
    const v = o?.[k]
    return v === true || (typeof v === 'string' && v.toLowerCase() === 'true')
  }
  function obj(v: unknown): Json | undefined {
    return v && typeof v === 'object' && !Array.isArray(v) ? (v as Json) : undefined
  }
  const igual = (a: string, b: string) => a.toLowerCase() === b.toLowerCase()

  // ── Datas ───────────────────────────────────────────────────────────────────
  const pad = (n: number) => String(n).padStart(2, '0')
  const iso = (d: Date) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`
  const MESES_PT = [
    'jan',
    'fev',
    'mar',
    'abr',
    'mai',
    'jun',
    'jul',
    'ago',
    'set',
    'out',
    'nov',
    'dez',
  ]

  /**
   * Data do pedido a partir do `createdAt` (ParseCreatedAtLocalDate): usa a data e a
   * hora como vêm escritas (sem converter fuso) e, antes das 6h, conta no dia anterior
   * — o pedido da madrugada pertence ao movimento do dia que começou na véspera.
   */
  function dataDoPedido(createdAt: string): string {
    const m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2})/.exec(createdAt)
    if (!m) return ''
    const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]))
    if (+m[4] < 6) d.setUTCDate(d.getUTCDate() - 1)
    return iso(d)
  }

  /** `expectedPaymentDate` (ISO ou DD/MM/AAAA) → `DD/MM/AAAA`. */
  function dataBR(s: string): string {
    const p = s.slice(0, 10)
    let m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(p)
    if (m) return `${m[3]}/${m[2]}/${m[1]}`
    m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(p)
    return m ? p : ''
  }

  // ── Mapeamentos do legado ───────────────────────────────────────────────────
  function metodoPagamento(m: string): string {
    const mapa: Record<string, string> = {
      DIGITAL_WALLET: 'Carteira digital',
      PIX: 'Pix',
      MEAL_VOUCHER: 'Vale refeição',
      CREDIT: 'Crédito',
      DEBIT: 'Débito',
      CASH: 'Dinheiro',
      BANK_PAY: 'Banco',
    }
    return mapa[m.toUpperCase()] ?? m
  }

  function responsavel(l: string): string {
    if (igual(l, 'IFOOD')) return 'IFOOD'
    if (igual(l, 'MERCHANT')) return 'LOJA'
    return l
  }

  function descricaoDoLancamento(entrada: string, descricao: string): string {
    if (igual(entrada, 'ORDER_PAYMENT')) return 'Entrada Financeira'
    if (igual(entrada, 'SERVICE_FEE')) return 'Taxa de serviço iFood cobrada do cliente'
    if (igual(entrada, 'PAYMENT_TRANSACTION_FEE')) return 'Taxa de transação'
    if (igual(entrada, 'ORDER_COMMISSION')) return 'Comissão do iFood (entrega própria da loja)'
    if (igual(entrada, 'IFOOD_SUBSIDY')) {
      if (igual(descricao, 'NETWORK_PROMOTION') || igual(descricao, 'PROMOTION_NETWORK'))
        return 'Promoção custeada pela rede'
      if (igual(descricao, 'INDUSTRY_PROMOTION') || igual(descricao, 'PROMOTION_INDUSTRY'))
        return 'Promoção custeada pela Indústria'
      return 'Promoção custeada pelo iFood'
    }
    if (igual(entrada, 'STORE_SUBSIDY')) {
      if (igual(descricao, 'BENEFIT_PARTNER')) return 'Promoção custeada pela loja'
      return 'Promoção custeada pela loja no delivery'
    }
    return descricao
  }

  function tipoDoLancamento(entrada: string): string {
    if (igual(entrada, 'ORDER_PAYMENT')) return 'Entrada Financeira'
    if (igual(entrada, 'SERVICE_FEE')) return 'Retenção'
    if (igual(entrada, 'PAYMENT_TRANSACTION_FEE') || igual(entrada, 'ORDER_COMMISSION'))
      return 'Cobrança'
    if (igual(entrada, 'IFOOD_SUBSIDY') || igual(entrada, 'STORE_SUBSIDY')) return 'Subsídio'
    return 'Ocorrência'
  }

  function classificacao(descricao: string): string {
    const mapa: Record<string, string> = {
      'entrada financeira': 'Pedidos com pagamento via iFood',
      'promoção custeada pelo ifood': 'Promoção custeada pelo iFood',
      'taxa de serviço ifood cobrada do cliente': 'Taxa de serviço iFood cobrada do cliente',
      'taxa de transação': 'Taxa de transação (3%)',
      'taxa de transação ifood beneficios': 'Taxa de transação (3%)',
      'comissão do ifood (entrega própria da loja)': 'Comissão iFood (7%)',
      'promoção custeada pela rede': 'Promoção custeada pela rede',
      'promoção custeada pela indústria': 'Promoção custeada pela Indústria',
      'promoção custeada pela loja': 'Promoção custeada pela loja',
      'promoção custeada pela loja no delivery': 'Promoção custeada pela loja',
    }
    return mapa[descricao.toLowerCase()] ?? descricao
  }

  /** TOTAL (CalcTotalLedger): só Venda/Cancelamento Total e só estas descrições. */
  const DESCRICOES_DO_TOTAL = [
    'entrada financeira',
    'promoção custeada pelo ifood',
    'promoção custeada pela rede',
    'promoção custeada pela indústria',
    'taxa de serviço ifood cobrada do cliente',
    'taxa de conveniência por pagamento parcelado',
  ]
  function totalDoLancamento(fato: string, descricao: string, valor: number): number {
    if (!(igual(fato, 'Venda') || igual(fato, 'Cancelamento Total'))) return 0
    return DESCRICOES_DO_TOTAL.includes(descricao.toLowerCase()) ? valor : 0
  }

  /** STATUS (CalcStatusLedger). */
  function statusDoLancamento(
    resp: string,
    tipo: string,
    impacto: string,
    metodo: string,
    bandeira: string
  ): LinhaLedger['status'] {
    if (igual(resp, 'IFOOD')) {
      return igual(metodo, 'Vale refeição') && !igual(bandeira, 'IFOOD_MEAL_VOUCHER')
        ? 'ONLINE VR'
        : 'ONLINE'
    }
    return igual(tipo, 'Entrada Financeira') && igual(resp, 'LOJA') && igual(impacto, 'SIM')
      ? 'ONLINE'
      : 'OFFLINE'
  }

  function linhasDaVenda(venda: Json, competencia: string, rotulo: string): LinhaLedger[] {
    const eventos = venda.orderEvents
    if (!Array.isArray(eventos)) return []
    const pedidoId = str(venda, 'id')
    const pedidoCurto = str(venda, 'shortId')
    const tipoVenda = str(venda, 'type', 'ORDER')
    const fato = pedidoId && igual(tipoVenda, 'ORDER') ? 'Venda' : 'Ocorrência Avulsa'
    const data = pedidoId ? dataDoPedido(str(venda, 'createdAt')) : 'Ocorrências'

    let metodo = ''
    let bandeira = ''
    let resp = 'IFOOD'
    const metodos = obj(venda.payments)?.methods
    const primeiro = Array.isArray(metodos) ? obj(metodos[0]) : undefined
    if (primeiro) {
      metodo = metodoPagamento(str(primeiro, 'method'))
      bandeira = str(obj(primeiro.card), 'brand')
      resp = responsavel(str(primeiro, 'liability', 'IFOOD'))
    }

    const linhas: LinhaLedger[] = []
    for (const ev of eventos) {
      const evento = obj(ev)
      if (!evento || str(evento, 'fullCode') !== 'FINANCIAL_BILLED_ORDER_ENTRY') continue
      const entradas = obj(evento.metadata)?.entries
      if (!Array.isArray(entradas)) continue
      for (const e of entradas) {
        const entrada = obj(e)
        if (!entrada) continue
        const nomeEntrada = str(entrada, 'financialEntryName')
        const valor = num(entrada, 'amount')
        const descricao = descricaoDoLancamento(nomeEntrada, str(entrada, 'description'))
        const tipo = tipoDoLancamento(nomeEntrada)
        const impacto = bool(entrada, 'hasTransferImpact') ? 'SIM' : 'NÃO'
        linhas.push({
          total: totalDoLancamento(fato, descricao, valor),
          status: statusDoLancamento(resp, tipo, impacto, metodo, bandeira),
          data,
          competencia,
          competenciaLabel: rotulo,
          dataRepasse: dataBR(str(entrada, 'expectedPaymentDate')),
          classificacao: classificacao(descricao),
          fatoGerador: fato,
          tipoLancamento: tipo,
          descricao,
          valor,
          baseCalculo: num(
            entrada,
            'feeBaseValue',
            num(entrada, 'baseValue', num(entrada, 'calculationBase'))
          ),
          percentualTaxa: num(
            entrada,
            'feePercentage',
            num(entrada, 'percentage', num(entrada, 'rate'))
          ),
          impactoRepasse: impacto,
          pedidoId,
          pedidoCurto,
          metodoPagamento: metodo,
          bandeira,
        })
      }
    }
    return linhas
  }

  /**
   * Mensagem para a recusa do iFood. 401 = token vencido ou inválido (quem renova é o
   * hub de Credenciais do portal; no `gia dev`, o script `npm run token:ifood`). 403 =
   * a loja não autorizou o aplicativo de vocês no Portal do Parceiro do iFood. 404 = o
   * restaurante não existe no iFood (identificador errado no cadastro da operação).
   */
  function recusaIfood(status: number): string | null {
    const dev = envOptional('GIA_DEV_CRED_IFOOD_TOKEN') !== undefined
    if (status === 401) {
      return dev
        ? 'O token do iFood venceu ou é inválido (401). Rode `npm run token:ifood` e reinicie o gia dev.'
        : 'O iFood recusou a credencial (401: token vencido ou inválido). Avise o administrador do portal (hub de Credenciais, integração ifood).'
    }
    if (status === 403) {
      return 'O iFood negou o acesso a este restaurante (403): ele não autorizou o aplicativo da Coco Bambu no Portal do Parceiro do iFood. Os lançamentos dele ficaram de fora.'
    }
    if (status === 404) {
      return 'O iFood não encontrou este restaurante (404): o identificador dele no cadastro da operação pode estar errado. Os lançamentos dele ficaram de fora; avise o time do Portal GIA.'
    }
    return null
  }

  // ── Modo demonstração (só `gia dev`, sem credencial do iFood) ───────────────
  /** Vendas fictícias no formato da API, para ver a tela funcionando no dev. */
  function vendasDemo(inicio: Date, fim: Date, pagina: number): { sales: Json[]; pageCount: number } {
    const sales: Json[] = []
    let semente = inicio.getUTCDate() * 7919 + pagina * 104729
    const rnd = () => (semente = (semente * 48271) % 2147483647) / 2147483647
    for (let d = new Date(inicio); d <= fim; d.setUTCDate(d.getUTCDate() + 1)) {
      const qtd = 4 + Math.floor(rnd() * 5)
      for (let i = 0; i < qtd; i++) {
        const valor = Math.round((40 + rnd() * 160) * 100) / 100
        const vr = rnd() < 0.15
        const promo = rnd() < 0.3
        const hora = pad(11 + Math.floor(rnd() * 12))
        const repasse = new Date(d)
        repasse.setUTCDate(repasse.getUTCDate() + 30)
        const entry = (financialEntryName: string, amount: number, extra: Json = {}) => ({
          financialEntryName,
          amount,
          hasTransferImpact: true,
          expectedPaymentDate: iso(repasse),
          ...extra,
        })
        const entries: Json[] = [
          entry('ORDER_PAYMENT', valor),
          entry('ORDER_COMMISSION', -Math.round(valor * 7) / 100, {
            feeBaseValue: valor,
            feePercentage: 7,
          }),
          entry('PAYMENT_TRANSACTION_FEE', -Math.round(valor * 3) / 100, {
            feeBaseValue: valor,
            feePercentage: 3,
          }),
        ]
        if (promo) entries.push(entry('IFOOD_SUBSIDY', 10))
        if (rnd() < 0.2)
          entries.push(entry('STORE_SUBSIDY', -8, { hasTransferImpact: false, description: 'X' }))
        sales.push({
          id: `demo-${iso(d)}-${pagina}-${i}`,
          shortId: String(1000 + Math.floor(rnd() * 9000)),
          type: 'ORDER',
          createdAt: `${iso(d)}T${hora}:15:00`,
          payments: {
            methods: [
              vr
                ? { method: 'MEAL_VOUCHER', liability: 'IFOOD', card: { brand: 'ALELO' } }
                : { method: rnd() < 0.5 ? 'PIX' : 'CREDIT', liability: 'IFOOD' },
            ],
          },
          orderEvents: [{ fullCode: 'FINANCIAL_BILLED_ORDER_ENTRY', metadata: { entries } }],
        })
      }
    }
    return { sales, pageCount: 2 }
  }

  /**
   * Corpo da resposta de erro do iFood — vai só para o log do servidor (pode trazer
   * detalhe interno da API); o usuário recebe a mensagem curta.
   */
  async function detalheDoErro(r: Response): Promise<string> {
    try {
      return (await r.text()).trim().slice(0, 300)
    } catch {
      return ''
    }
  }

  interface Restaurante {
    /** `operacao_ref` da operação dona do restaurante (ex.: "17 cbx"). */
    operacao: string
    /** UUID do restaurante (merchant) no iFood. */
    merchant: string
  }

  /**
   * Restaurantes do iFood da loja: os vínculos IFOOD ativos de todas as operações da
   * Empresa (cb, cbx, pzcb, dani, vst, adgcb…), do cadastro do portal
   * (`ctx.operacoes()` → `integracoes`, SDK alpha.71). Uma operação pode ter mais de um
   * vínculo IFOOD. `locRef` = UUID do restaurante (merchant) no iFood. Nenhum merchant
   * fica no código. A MESMA função está em `lojas.ts` e `ledger.ts` (handler
   * auto-contido) e no Fechamento iFood Diário: mude todas juntas.
   */
  function restaurantesDaLoja(
    operacoes: { ref: string; empresaId: number; integracoes: { tipo: string; locRef: string }[] }[],
    empresaId: number
  ): Restaurante[] {
    const vistos = new Set<string>()
    return operacoes
      .filter((o) => o.empresaId === empresaId)
      .flatMap((o) =>
        (o.integracoes ?? [])
          .filter((i) => i.tipo === 'IFOOD' && i.locRef?.trim())
          .map((i) => ({ operacao: o.ref, merchant: i.locRef.trim().toLowerCase() }))
      )
      .filter((r) => !vistos.has(r.merchant) && Boolean(vistos.add(r.merchant)))
  }

  /** O iFood negou ESTE restaurante (403): vira aviso, não erro da consulta. */
  class RecusaDoRestaurante extends Error {}

  /** Saldo da cota nos cabeçalhos do iFood (vem em toda resposta, inclusive no 429). */
  function lerCota(r: Response): Cota | null {
    const restantes = r.headers.get('ifood-ratelimit-remaining')
    if (restantes === null || restantes.trim() === '' || !Number.isFinite(Number(restantes)))
      return null
    const reset = Number(r.headers.get('ifood-ratelimit-reset'))
    return { restantes: Number(restantes), resetS: Number.isFinite(reset) && reset >= 0 ? reset : 60 }
  }

  /** `Retry-After` em segundos (número ou data HTTP); `null` quando não veio. */
  function segundosRetryAfter(r: Response): number | null {
    const v = r.headers.get('retry-after')
    if (!v) return null
    const n = Number(v)
    if (Number.isFinite(n) && n >= 0) return n
    const data = Date.parse(v)
    return Number.isNaN(data) ? null : Math.max(0, Math.ceil((data - Date.now()) / 1000))
  }

  /** Vendas da página sem nenhum evento financeiro (a resposta "leve" do iFood). */
  function vendasLeves(corpo: { sales?: unknown }): number {
    if (!Array.isArray(corpo.sales)) return 0
    return corpo.sales.filter((s) => {
      const eventos = obj(s)?.orderEvents
      return !(
        Array.isArray(eventos) &&
        eventos.some((e) => obj(e)?.fullCode === 'FINANCIAL_BILLED_ORDER_ENTRY')
      )
    }).length
  }

  const __giaHandler = defineHandler<Body, Resposta>(async (ctx) => {
    await ctx.requirePermission('fechamento-ifood-mensal.ler')
    const empresaId = Number(ctx.body.empresaId)
    if (!Number.isInteger(empresaId) || empresaId <= 0) throw new HttpError(422, 'Informe a loja.')
    // 403 se a Empresa está fora do escopo do usuário.
    await ctx.requireEmpresa(empresaId)

    const mm = /^(\d{4})-(\d{2})$/.exec(String(ctx.body.mes ?? ''))
    const ano = mm ? Number(mm[1]) : 0
    const mesNum = mm ? Number(mm[2]) : 0
    if (ano < 2000 || mesNum < 1 || mesNum > 12) throw new HttpError(422, 'Mês inválido (AAAA-MM).')

    // O restaurante do body só vale se for um dos vínculos IFOOD das operações da loja.
    const merchantId =
      typeof ctx.body.merchant === 'string' ? ctx.body.merchant.trim().toLowerCase() : ''
    const daLoja = restaurantesDaLoja(await ctx.operacoes(), empresaId).map((r) => r.merchant)
    if (!merchantId || !daLoja.includes(merchantId)) {
      throw new HttpError(422, 'Este restaurante do iFood não é desta loja.')
    }
    const demo = envOptional('GIA_DEV_IFOOD_MENSAL_DEMO') === '1'

    const primeiroDia = new Date(Date.UTC(ano, mesNum - 1, 1))
    const ultimoDia = new Date(Date.UTC(ano, mesNum, 0))
    const dias = ultimoDia.getUTCDate()
    const totalJanelas = Math.ceil(dias / MAX_DIAS_JANELA)
    const janela = Number(ctx.body.janela)
    const pagina = Number(ctx.body.pagina)
    if (!Number.isInteger(janela) || janela < 1 || janela > totalJanelas)
      throw new HttpError(422, `Janela inválida (1 a ${totalJanelas}).`)
    if (!Number.isInteger(pagina) || pagina < 1) throw new HttpError(422, 'Página inválida.')

    const inicio = new Date(primeiroDia)
    inicio.setUTCDate(1 + (janela - 1) * MAX_DIAS_JANELA)
    const fim = new Date(inicio)
    fim.setUTCDate(fim.getUTCDate() + MAX_DIAS_JANELA - 1)
    if (fim > ultimoDia) fim.setTime(ultimoDia.getTime())

    const competencia = `${ano}-${pad(mesNum)}`
    const rotulo = `${MESES_PT[mesNum - 1]}/${String(ano).slice(2)}`
    const base = {
      janela,
      totalJanelas,
      pagina,
      inicio: iso(inicio),
      fim: iso(fim),
      aviso: null as string | null,
    }
    // `as`: o valor muda dentro de `pedir()` (closure), e o TS não acompanha.
    let cota = null as Cota | null
    let repeticoes = 0
    const responder = (
      r: { linhas: LinhaLedger[]; totalPaginas: number } & Partial<Resposta>
    ): Resposta => ({ ...base, cota, repeticoes, adiar: null, ...r })
    /** A página não veio: a tela pede de novo mais tarde (ver `Resposta.adiar`). */
    const adiar = (motivo: Adiar['motivo'], esperarMs = 0) =>
      responder({ linhas: [], totalPaginas: 0, adiar: { motivo, esperarMs } })

    let corpo: { sales?: unknown; total?: unknown; pageCount?: unknown }
    if (demo) {
      // Só no dev: atraso por página para simular a demora da API e testar a consulta em paralelo.
      const atraso = Number(envOptional('GIA_DEV_IFOOD_MENSAL_DEMO_ATRASO_MS') ?? 0)
      if (atraso > 0) await new Promise((r) => setTimeout(r, atraso))
      // Só no dev: % das páginas com o comportamento instável do iFood, para testar a tela.
      // `sempre` = toda página volta vazia; `cota` = cota sempre esgotada (testam o erro).
      const modoLimite = envOptional('GIA_DEV_IFOOD_MENSAL_DEMO_LIMITE') ?? ''
      if (modoLimite === 'sempre') {
        repeticoes = REPETICOES_IMEDIATAS
        return adiar('incompleta')
      }
      if (modoLimite === 'cota') {
        cota = { restantes: 0, resetS: 2 }
        return adiar('cota', cota.resetS * 1000 + FOLGA_COTA_MS)
      }
      const instavel = Number(modoLimite) || 0
      if (instavel > 0) {
        const sorte = Math.random() * 100
        cota = {
          restantes: 850 + Math.floor(Math.random() * 150),
          resetS: 1 + Math.floor(Math.random() * 59),
        }
        if (sorte < instavel / 4) {
          cota = { restantes: 0, resetS: 5 + Math.floor(Math.random() * 10) }
          return adiar('cota', cota.resetS * 1000 + FOLGA_COTA_MS)
        }
        if (sorte < instavel / 2) {
          repeticoes = REPETICOES_IMEDIATAS
          const motivo = Math.random() < 0.5 ? 'incompleta' : 'instavel'
          return adiar(motivo)
        }
        if (sorte < instavel) repeticoes = 1 + Math.floor(Math.random() * 2)
        if (sorte > 100 - instavel / 8) cota = { restantes: 12, resetS: 6 }
      }
      corpo = vendasDemo(inicio, fim, pagina)
    } else {
      const { baseUrl, token } = await ctx.credencial(INTEGRACAO)
      const qs = new URLSearchParams({
        beginSalesDate: iso(inicio),
        endSalesDate: iso(fim),
        page: String(pagina),
      })
      const url = `${baseUrl.replace(/\/+$/, '')}/financial/v3.0/merchants/${encodeURIComponent(merchantId!)}/sales?${qs}`
      /** Uma chamada à API (sem repetir). Guarda o saldo da cota que veio nos cabeçalhos. */
      const pedir = async (): Promise<Response> => {
        let r: Response
        try {
          r = await fetch(url, {
            headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
            signal: AbortSignal.timeout(TIMEOUT_MS),
          })
        } catch (e) {
          if (e instanceof Error && (e.name === 'TimeoutError' || e.name === 'AbortError')) {
            throw new HttpError(
              504,
              'O iFood demorou demais para responder. Tente consultar de novo.'
            )
          }
          console.error('[fechamento-ifood-mensal] falha de rede ao chamar o iFood:', e)
          throw new HttpError(
            502,
            'Não foi possível falar com o iFood agora. Tente consultar de novo em alguns minutos.'
          )
        }
        cota = lerCota(r) ?? cota
        return r
      }
      /** Lê a resposta; erro do iFood vira `HttpError` (recusa 424, resto 502). */
      const ler = async (r: Response): Promise<typeof corpo | null> => {
        // 204 = janela sem vendas (legado: encerra a janela).
        if (r.status === 204) return null
        if (!r.ok) {
          const recusa = recusaIfood(r.status)
          // 403 (não autorizou o aplicativo) e 404 (identificador errado no cadastro): só
          // este restaurante fica de fora, com aviso — os outros da loja seguem.
          if (recusa && (r.status === 403 || r.status === 404)) throw new RecusaDoRestaurante(recusa)
          // 401: a credencial vale para todos — tentar de novo não resolve (424).
          if (recusa) throw new HttpError(424, recusa)
          console.error(
            `[fechamento-ifood-mensal] iFood respondeu ${r.status} (janela ${janela}, página ${pagina}):`,
            await detalheDoErro(r)
          )
          throw new HttpError(
            502,
            `O iFood não conseguiu responder agora (código ${r.status}). Tente consultar de novo em alguns minutos; se continuar, avise o suporte.`
          )
        }
        const c = (await r.json()) as typeof corpo
        if (!c || typeof c !== 'object') {
          throw new HttpError(502, 'A API Financial do iFood devolveu um formato inesperado.')
        }
        return c
      }

      // Duas instabilidades do iFood, medidas em 13 e 16/11/2026 (docs/teste-ifood-*):
      // - 429 "Too many requests" com saldo de cota sobrando (até 996 de 1.000), mesmo com
      //   uma chamada por vez — não é a cota; repetir na hora passa em ~metade das vezes;
      // - página "vazia": vendas sem nenhum evento (sem o FINANCIAL_BILLED_ORDER_ENTRY) e
      //   com saldo zero; aceitar faria o mês sair com lançamentos faltando. Pedindo de
      //   novo, vem completa. Nenhuma venda com eventos veio sem o evento financeiro.
      // As duas: repete na hora (até REPETICOES_IMEDIATAS); depois, a página volta para a
      // fila da tela. Cota esgotada de verdade (saldo 0): a tela pausa até o reset.
      for (;;) {
        const r = await pedir()
        if (r.status === 429) {
          const retryAfter = segundosRetryAfter(r)
          await r.body?.cancel()
          if (cota?.restantes === 0 || retryAfter !== null) {
            const s = Math.min(ESPERA_COTA_MAX_S, retryAfter ?? cota?.resetS ?? ESPERA_COTA_MAX_S)
            return adiar('cota', s * 1000 + FOLGA_COTA_MS)
          }
          if (repeticoes >= REPETICOES_IMEDIATAS) return adiar('instavel')
          repeticoes += 1
          continue
        }
        let lido: typeof corpo | null
        try {
          lido = await ler(r)
        } catch (e) {
          if (e instanceof RecusaDoRestaurante)
            return responder({ linhas: [], totalPaginas: 1, aviso: e.message })
          throw e
        }
        if (!lido) return responder({ linhas: [], totalPaginas: pagina })
        if (vendasLeves(lido) > 0) {
          if (repeticoes >= REPETICOES_IMEDIATAS) {
            console.warn(
              `[fechamento-ifood-mensal] página com vendas vazias (janela ${janela}, página ${pagina}) após ${repeticoes + 1} pedidos — volta para a fila`
            )
            return adiar('incompleta')
          }
          repeticoes += 1
          continue
        }
        corpo = lido
        break
      }
    }

    // Página 1 com total 0: janela sem vendas.
    if (pagina === 1 && corpo.total === 0) return responder({ linhas: [], totalPaginas: 1 })
    const totalPaginas = Math.max(1, Math.floor(Number(corpo.pageCount) || 1))
    const linhas: LinhaLedger[] = []
    if (Array.isArray(corpo.sales)) {
      for (const s of corpo.sales) {
        const venda = obj(s)
        if (venda) linhas.push(...linhasDaVenda(venda, competencia, rotulo))
      }
    }
    return responder({ linhas, totalPaginas })
  })


  return __giaHandler
})() as ServerHandler<unknown, unknown>

// ─── src/server/lojas.ts ────────────────────────────────────────────────
__giaHandlers["lojas"] = (() => {

  // Lojas do seletor: as Empresas do escopo do usuário com `tipoRegistro === 'empresa'`
  // (a loja, com CNPJ), como nos outros módulos. O fechamento do mês junta TODAS as
  // operações da Empresa: os lançamentos de todos os restaurantes do iFood da loja
  // (vínculos IFOOD das operações, no cadastro do portal) e o borderô e o fechamento
  // gravado do número da loja.
  //
  // O número da loja (`loc_ref` do fechamento no banco do Maestro e `property_number`
  // do borderô) vem do nome da Empresa ("01.CB GOIANIA") e, na falta, do vínculo BIAPI
  // (`locRefs.BIAPI`). Loja sem número aparece mesmo assim, com `locRef: null` — a
  // consulta dela é recusada com um aviso claro.
  //
  // Nenhum restaurante fica escrito no código: loja nova ou restaurante movido de
  // operação vale na próxima consulta, direto do cadastro (igual ao Fechamento iFood
  // Diário 0.2.5).
  //
  // REGRA: handler auto-contido — só importa de @gia-cb/sdk/server. `numeroDaLoja` e
  // `restaurantesDaLoja` se repetem nos outros handlers de propósito.

  interface Restaurante {
    /** `operacao_ref` da operação dona do restaurante (ex.: "17 cbx"). */
    operacao: string
    /** UUID do restaurante (merchant) no iFood. */
    merchant: string
  }

  interface Resposta {
    lojas: Loja[]
    /**
     * TESTE: `GIA_DEV_IFOOD_MENSAL_POR_OPERACAO=1` no `.env` liga, na tela, o seletor de
     * UMA operação da loja (para comparar com o legado, que lia um restaurante só).
     * `0` ou ausente = a consulta junta todas as operações (o normal; em produção a
     * variável não existe). Prefixo `GIA_DEV_`: só do `gia dev`.
     */
    testePorOperacao: boolean
  }

  interface Loja {
    empresaId: number
    nome: string
    locRef: string | null
    /** Restaurantes do iFood da loja; vazio = loja sem integração com o iFood. */
    restaurantes: Restaurante[]
    ativo: boolean
  }

  /**
   * Número da loja com 2 dígitos — o `loc_ref` do fechamento e o `property_number` do borderô.
   * Sai primeiro do nome da Empresa ("01.CB GOIANIA" → "01"; todas as lojas do cadastro
   * têm o número no nome) e, na falta, do vínculo com a BI do Simphony (`locRefs.BIAPI`
   * começa pelo número: "01 CB Go", "17. CB R"). O nome vem antes porque o BIAPI pode
   * divergir: na 999.CB TECH HOMOLOG ele é "995 CB L".
   */
  function numeroDaLoja(e: { nome: string; locRefs: Record<string, string> }): string | null {
    const m = /^\s*(\d{1,4})\s*\./.exec(e.nome) ?? /^\s*(\d{1,4})/.exec(e.locRefs?.BIAPI ?? '')
    return m ? String(Number(m[1])).padStart(2, '0') : null
  }

  /**
   * Restaurantes do iFood da loja: os vínculos IFOOD ativos de todas as operações da
   * Empresa (cb, cbx, pzcb, dani, vst, adgcb…), do cadastro do portal. Uma operação pode
   * ter mais de um vínculo IFOOD. `locRef` = UUID do restaurante (merchant) no iFood.
   * A MESMA função está em `ledger.ts` (handler auto-contido) e no Fechamento iFood
   * Diário: mude todas juntas.
   */
  function restaurantesDaLoja(
    operacoes: { ref: string; empresaId: number; integracoes: { tipo: string; locRef: string }[] }[],
    empresaId: number
  ): Restaurante[] {
    const vistos = new Set<string>()
    return operacoes
      .filter((o) => o.empresaId === empresaId)
      .flatMap((o) =>
        (o.integracoes ?? [])
          .filter((i) => i.tipo === 'IFOOD' && i.locRef?.trim())
          .map((i) => ({ operacao: o.ref, merchant: i.locRef.trim().toLowerCase() }))
      )
      .filter((r) => !vistos.has(r.merchant) && Boolean(vistos.add(r.merchant)))
  }

  const __giaHandler = defineHandler<Record<string, never>, Resposta>(async (ctx) => {
    await ctx.requirePermission('fechamento-ifood-mensal.ler')
    // ctx.empresas() já vem recortado pelo escopo; a checagem explícita deixa o
    // "ONDE" visível aqui e no gia validate.
    const escopo = await ctx.empresaScope()
    const operacoes = await ctx.operacoes()
    const lojas: Loja[] = []
    for (const e of await ctx.empresas()) {
      if (!escopo.all && !escopo.empresaIds.includes(e.id)) continue
      if (e.tipoRegistro !== 'empresa') continue
      const locRef = numeroDaLoja(e)
      lojas.push({
        empresaId: e.id,
        nome: e.nome,
        locRef,
        restaurantes: restaurantesDaLoja(operacoes, e.id),
        ativo: e.ativo,
      })
    }
    return {
      lojas: lojas.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { numeric: true })),
      testePorOperacao: envOptional('GIA_DEV_IFOOD_MENSAL_POR_OPERACAO') === '1',
    }
  })


  return __giaHandler
})() as ServerHandler<unknown, unknown>

// ─── src/server/manual.ts ───────────────────────────────────────────────
__giaHandlers["manual"] = (() => {

  // A parte do fechamento que NÃO vem do iFood, lida do banco do Maestro:
  //
  // 1. Borderô (`bordero.borderos`, só leitura): o que a loja lançou no caixa por dia —
  //    CB Online (`din_ifood_online`), CB Descontos iFood (`din_desconto_ifood`) e
  //    Adquirentes caixa (`ent_ifood_adquirentes`). Vale a versão vigente de cada
  //    borderô (a última alteração, ou o original quando não há alteração) — a mesma
  //    consulta do legado (GetBorderoIfoodBatch).
  // 2. O que o usuário digitou e gravou (`ifood_fechamento.*`): previsão de pagamento,
  //    CB Descontos LOJA e comentário por dia, breakdown da Conferência, extrato
  //    bancário e cancelados pós-entrega (LoadManualMensalJson).
  //
  // O dia junta os dois: borderô primeiro, o gravado por cima (MergeManualMensalJson).
  //
  // REGRA: handler auto-contido — só importa de @gia-cb/sdk/server.

  interface Body {
    /** Empresa (loja) escolhida — o fechamento é da loja inteira (todas as operações). */
    empresaId: number
    mes: string
  }

  interface OnlineDia {
    previsao?: string
    cbOnline?: number
    cbDescontosIfood?: number
    cbDescontosLoja?: number | null
    comentario?: string
  }
  interface AdquirenteDia {
    previsao?: string
    caixa?: number
    comentario?: string
  }
  interface LinhaExtrato {
    loja: string
    banco: string
    tipo: string
    mesAno: string
    classificacao: string
    subClassificacao: string
    dataMovimento: string
    historico: string
    documento: string
    malote: number
    competencia: string
  }
  interface LinhaCancelado {
    dataPedido: string
    estabelecimento: string
    cnpj: string
    nomeCliente: string
    numeroPedido: string
    idIfood: string
    valorPedidoTaxa: number
    valorReembolso: number | null
    centroVenda: string
    origemCancelamento: string
    justificativa: string
    andamento: string
    protocolo: string
    valeNoCofre: string
    dataAnulacao: string
    dataReembolso: string
  }
  interface Resposta {
    locRef: string
    online: Record<string, OnlineDia>
    adquirente: Record<string, AdquirenteDia>
    conferencia: Record<string, number>
    extrato: LinhaExtrato[]
    cancelados: LinhaCancelado[]
    anulacaoVerificar: number
    /** Última gravação do fechamento deste mês (ISO), ou `null` se nunca foi gravado. */
    gravadoEm: string | null
    /** Dias do mês com borderô lançado. */
    diasComBordero: number
  }

  const pad = (n: number) => String(n).padStart(2, '0')

  /** Borderô fictício para o `gia dev` sem banco (GIA_DEV_IFOOD_MENSAL_DEMO=1). */
  function borderoDemo(ano: number, mes: number) {
    const dias = new Date(Date.UTC(ano, mes, 0)).getUTCDate()
    const linhas = []
    for (let d = 1; d <= dias; d++) {
      linhas.push({
        dia: `${ano}-${pad(mes)}-${pad(d)}`,
        cb_online: 700 + ((d * 37) % 300),
        cb_descontos_ifood: (d * 13) % 40,
        adquirentes_caixa: 80 + ((d * 17) % 90),
      })
    }
    return linhas
  }

  /**
   * Número da loja com 2 dígitos — o `loc_ref` do fechamento no banco e do DW.
   * Sai primeiro do nome da Empresa ("01.CB GOIANIA" → "01"; todas as lojas do cadastro
   * têm o número no nome) e, na falta, do vínculo com a BI do Simphony (`locRefs.BIAPI`
   * começa pelo número: "01 CB Go", "17. CB R"). O nome vem antes porque o BIAPI pode
   * divergir: na 999.CB TECH HOMOLOG ele é "995 CB L".
   */
  function numeroDaLoja(e: { nome: string; locRefs: Record<string, string> }): string | null {
    const m = /^\s*(\d{1,4})\s*\./.exec(e.nome) ?? /^\s*(\d{1,4})/.exec(e.locRefs?.BIAPI ?? '')
    return m ? String(Number(m[1])).padStart(2, '0') : null
  }

  /**
   * Falha do banco/conexão (o postgres.js põe um `code`: SQLSTATE como "42P01" ou de
   * rede como "ECONNREFUSED"). Outro erro é bug do código e segue como 500.
   */
  function ehFalhaDoBanco(e: unknown): boolean {
    return typeof (e as { code?: unknown } | null)?.code === 'string'
  }

  /**
   * Erro inesperado do banco (conexão, constraint, coluna…) não vai cru para a tela:
   * o detalhe fica no log do servidor e o usuário recebe uma mensagem curta. Os
   * `HttpError` (validação) passam como estão.
   */
  function erroDeBanco(e: unknown): never {
    if (e instanceof HttpError || !ehFalhaDoBanco(e)) throw e
    console.error('[fechamento-ifood-mensal] erro ao ler o fechamento no banco:', e)
    throw new HttpError(
      503,
      'Não foi possível ler o fechamento agora (falha no banco de dados). Tente de novo em alguns minutos; se continuar, avise o suporte.'
    )
  }

  const __giaHandler = defineHandler<Body, Resposta>(async (ctx) => {
    try {
      await ctx.requirePermission('fechamento-ifood-mensal.ler')
      // A loja é a Empresa: o fechamento junta todas as operações dela. O número da loja
      // (do nome da Empresa, ou do BIAPI) é a chave no banco do Maestro — o `loc_ref` do
      // fechamento (como no legado) e o `property_number` do borderô.
      const empresaId = Number(ctx.body.empresaId)
      if (!Number.isInteger(empresaId) || empresaId <= 0) throw new HttpError(422, 'Informe a loja.')
      // 403 se a Empresa está fora do escopo do usuário.
      await ctx.requireEmpresa(empresaId)
      const empresa = (await ctx.empresas()).find((e) => e.id === empresaId)
      if (!empresa) throw new HttpError(404, 'Loja não encontrada.')
      // Só Empresa (loja) tem fechamento — como no seletor (`lojas.ts`). Uma propriedade
      // com número no nome apontaria para a loja de mesmo número, talvez fora do escopo.
      if (empresa.tipoRegistro !== 'empresa')
        throw new HttpError(422, `"${empresa.nome}" não é uma loja (Empresa).`)
      const locRef = numeroDaLoja(empresa)
      if (!locRef) {
        throw new HttpError(
          422,
          `A loja "${empresa.nome}" não tem o número da loja no nome nem no vínculo BIAPI.`
        )
      }

      const mm = /^(\d{4})-(\d{2})$/.exec(String(ctx.body.mes ?? ''))
      const ano = mm ? Number(mm[1]) : 0
      const mes = mm ? Number(mm[2]) : 0
      if (ano < 2000 || mes < 1 || mes > 12) throw new HttpError(422, 'Mês inválido (AAAA-MM).')

      const inicio = `${ano}-${pad(mes)}-01`
      const fim = `${ano}-${pad(mes)}-${pad(new Date(Date.UTC(ano, mes, 0)).getUTCDate())}`
      const resposta: Resposta = {
        locRef,
        online: {},
        adquirente: {},
        conferencia: {},
        extrato: [],
        cancelados: [],
        anulacaoVerificar: 0,
        gravadoEm: null,
        diasComBordero: 0,
      }

      const demo =
        envOptional('GIA_DEV_IFOOD_MENSAL_DEMO') === '1' && !envOptional('GIA_SERVER_DATABASE_URL')

      // 1. Borderô vigente por dia.
      type Bordero = {
        dia: string
        cb_online: number
        cb_descontos_ifood: number
        adquirentes_caixa: number
      }
      // O borderô é por número de loja (`property_number`).
      const propriedade = Number(locRef)
      const bordero: Bordero[] = demo
        ? borderoDemo(ano, mes)
        : propriedade <= 0
          ? []
          : await sql<Bordero[]>`
          WITH original AS (
            SELECT b.id, b.bus_dt::date AS bus_dt,
              COALESCE(b.din_ifood_online, 0) AS din_ifood_online,
              COALESCE(b.din_desconto_ifood, 0) AS din_desconto_ifood,
              COALESCE(b.ent_ifood_adquirentes, 0) AS ent_ifood_adquirentes,
              NOT EXISTS (SELECT 1 FROM bordero.borderos bc WHERE bc.parent_id = b.id) AS is_last
            FROM bordero.borderos b
            WHERE b.property_number = ${propriedade}
              AND b.bus_dt::date BETWEEN ${inicio}::date AND ${fim}::date
              AND b.parent_id IS NULL
              AND b."isTemp" = FALSE
          ), alteracoes AS (
            SELECT b.bus_dt::date AS bus_dt,
              COALESCE(b.din_ifood_online, 0) AS din_ifood_online,
              COALESCE(b.din_desconto_ifood, 0) AS din_desconto_ifood,
              COALESCE(b.ent_ifood_adquirentes, 0) AS ent_ifood_adquirentes,
              b.id = (SELECT MAX(bc.id) FROM bordero.borderos bc WHERE bc.parent_id = b.parent_id) AS is_last
            FROM bordero.borderos b
            WHERE b.parent_id IN (SELECT id FROM original)
          ), vigentes AS (
            SELECT bus_dt, din_ifood_online, din_desconto_ifood, ent_ifood_adquirentes
              FROM original WHERE is_last
            UNION ALL
            SELECT bus_dt, din_ifood_online, din_desconto_ifood, ent_ifood_adquirentes
              FROM alteracoes WHERE is_last
          )
          SELECT to_char(bus_dt, 'YYYY-MM-DD') AS dia,
            SUM(din_ifood_online)::float8 AS cb_online,
            SUM(din_desconto_ifood)::float8 AS cb_descontos_ifood,
            SUM(ent_ifood_adquirentes)::float8 AS adquirentes_caixa
          FROM vigentes GROUP BY bus_dt ORDER BY bus_dt
        `
      for (const b of bordero) {
        resposta.online[b.dia] = { cbOnline: b.cb_online, cbDescontosIfood: b.cb_descontos_ifood }
        resposta.adquirente[b.dia] = { caixa: b.adquirentes_caixa }
      }
      resposta.diasComBordero = bordero.length
      if (demo) return resposta

      // 2. O que foi gravado no fechamento do mês.
      const [cab] = await sql<
        Array<{ id: string; anulacao_verificar: number; gravado_em: string | null }>
      >`
      SELECT id::text, anulacao_verificar::float8 AS anulacao_verificar,
        to_char(COALESCE(atualizado_em, criado_em) AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS gravado_em
      FROM ifood_fechamento.fechamentos_mensais
      WHERE loc_ref = ${locRef} AND ano = ${ano} AND mes = ${mes} AND deletado_em IS NULL
    `
      if (!cab) return resposta
      resposta.anulacaoVerificar = cab.anulacao_verificar
      resposta.gravadoEm = cab.gravado_em
      const fid = cab.id

      // Em sequência: são consultas pequenas, e assim usam uma conexão só.
      const online = await sql<
        Array<{
          dia: string
          previsao: string | null
          cb_loja: number | null
          comentario: string | null
        }>
      >`
      SELECT to_char(data_pedido, 'YYYY-MM-DD') AS dia,
        to_char(previsao_pagamento, 'YYYY-MM-DD') AS previsao,
        cb_descontos_loja::float8 AS cb_loja, comentario
      FROM ifood_fechamento.online_dia WHERE fechamento_id = ${fid}::bigint ORDER BY data_pedido
    `
      const adq = await sql<
        Array<{ dia: string; previsao: string | null; comentario: string | null }>
      >`
      SELECT to_char(data_pedido, 'YYYY-MM-DD') AS dia,
        to_char(previsao_pagamento, 'YYYY-MM-DD') AS previsao, comentario
      FROM ifood_fechamento.adquirente_dia WHERE fechamento_id = ${fid}::bigint ORDER BY data_pedido
    `
      const conf = await sql<Array<{ centro_custo: string; valor: number }>>`
      SELECT centro_custo, valor::float8 AS valor
      FROM ifood_fechamento.conferencia_breakdown WHERE fechamento_id = ${fid}::bigint
    `
      const extrato = await sql<Array<Record<string, string | number | null>>>`
      SELECT COALESCE(loja, '') AS loja, COALESCE(banco, '') AS banco, COALESCE(tipo, '') AS tipo,
        COALESCE(mes_ano, '') AS mes_ano, COALESCE(classificacao, '') AS classificacao,
        COALESCE(sub_classificacao, '') AS sub_classificacao,
        to_char(data_movimento, 'YYYY-MM-DD') AS data_movimento,
        COALESCE(historico, '') AS historico, COALESCE(documento, '') AS documento,
        malote::float8 AS malote, COALESCE(competencia, '') AS competencia
      FROM ifood_fechamento.extrato_bancario
      WHERE fechamento_id = ${fid}::bigint AND deletado_em IS NULL ORDER BY data_movimento, id
    `
      const cancelados = await sql<Array<Record<string, string | number | null>>>`
      SELECT to_char(data_pedido, 'YYYY-MM-DD') AS data_pedido,
        COALESCE(estabelecimento, '') AS estabelecimento, COALESCE(cnpj, '') AS cnpj,
        COALESCE(nome_cliente, '') AS nome_cliente, COALESCE(numero_pedido, '') AS numero_pedido,
        COALESCE(id_ifood, '') AS id_ifood, COALESCE(valor_pedido_taxa, 0)::float8 AS valor_pedido_taxa,
        valor_reembolso::float8 AS valor_reembolso, COALESCE(centro_venda, '') AS centro_venda,
        COALESCE(origem_cancelamento, '') AS origem_cancelamento,
        COALESCE(justificativa, '') AS justificativa, COALESCE(andamento, '') AS andamento,
        COALESCE(protocolo, '') AS protocolo, COALESCE(vale_no_cofre, '') AS vale_no_cofre,
        COALESCE(to_char(data_anulacao, 'YYYY-MM-DD'), '') AS data_anulacao,
        COALESCE(to_char(data_reembolso, 'YYYY-MM-DD'), '') AS data_reembolso
      FROM ifood_fechamento.cancelados_pos
      WHERE fechamento_id = ${fid}::bigint AND deletado_em IS NULL ORDER BY data_pedido, id
    `

      for (const o of online) {
        const dia: OnlineDia = { ...resposta.online[o.dia] }
        if (o.previsao) dia.previsao = o.previsao
        if (o.cb_loja !== null) dia.cbDescontosLoja = o.cb_loja
        if (o.comentario) dia.comentario = o.comentario
        resposta.online[o.dia] = dia
      }
      for (const a of adq) {
        const dia: AdquirenteDia = { ...resposta.adquirente[a.dia] }
        if (a.previsao) dia.previsao = a.previsao
        if (a.comentario) dia.comentario = a.comentario
        resposta.adquirente[a.dia] = dia
      }
      for (const c of conf) resposta.conferencia[c.centro_custo] = c.valor
      const s = (v: string | number | null | undefined) =>
        v === null || v === undefined ? '' : String(v)
      resposta.extrato = extrato.map((e) => ({
        loja: s(e.loja),
        banco: s(e.banco),
        tipo: s(e.tipo),
        mesAno: s(e.mes_ano),
        classificacao: s(e.classificacao),
        subClassificacao: s(e.sub_classificacao),
        dataMovimento: s(e.data_movimento),
        historico: s(e.historico),
        documento: s(e.documento),
        malote: Number(e.malote) || 0,
        competencia: s(e.competencia),
      }))
      resposta.cancelados = cancelados.map((c) => ({
        dataPedido: s(c.data_pedido),
        estabelecimento: s(c.estabelecimento),
        cnpj: s(c.cnpj),
        nomeCliente: s(c.nome_cliente),
        numeroPedido: s(c.numero_pedido),
        idIfood: s(c.id_ifood),
        valorPedidoTaxa: Number(c.valor_pedido_taxa) || 0,
        valorReembolso: c.valor_reembolso === null ? null : Number(c.valor_reembolso),
        centroVenda: s(c.centro_venda),
        origemCancelamento: s(c.origem_cancelamento),
        justificativa: s(c.justificativa),
        andamento: s(c.andamento),
        protocolo: s(c.protocolo),
        valeNoCofre: s(c.vale_no_cofre),
        dataAnulacao: s(c.data_anulacao),
        dataReembolso: s(c.data_reembolso),
      }))
      return resposta
    } catch (e) {
      erroDeBanco(e)
    }
  })


  return __giaHandler
})() as ServerHandler<unknown, unknown>

// ─── src/server/salvar.ts ───────────────────────────────────────────────
__giaHandlers["salvar"] = (() => {

  // Grava o que o usuário digitou no fechamento do mês, nas mesmas tabelas do legado
  // (`ifood_fechamento.*` no banco do Maestro), numa transação só
  // (TDmFechamentoDiarioIfood.SaveManualMensal):
  //
  // - cabeçalho `fechamentos_mensais` (1 por loja/mês), criado na primeira gravação;
  // - `online_dia` / `adquirente_dia`: previsão, CB Descontos LOJA e comentário por dia;
  // - `conferencia_breakdown`: os 4 valores do breakdown da Conferência;
  // - `extrato_bancario` e `cancelados_pos`: a lista inteira é regravada — as linhas
  //   ativas viram excluídas (`deletado_em`) e a lista da tela é inserida de novo.
  //
  // Autor: `criado_por`/`atualizado_por`/`deletado_por` recebem o id do usuário no
  // GIA antigo (`legacyUserId`), para o histórico continuar coerente com o que o
  // legado gravou; sem vínculo, o id do usuário no portal.
  //
  // Duas correções em relação ao legado (perda de dado, não regra de cálculo):
  // - dia que ficou VAZIO (comentário apagado, previsão limpa) é limpo no banco — o
  //   legado ignorava o dia e o valor antigo voltava na próxima consulta;
  // - "Vale no cofre?" dos cancelados é um campo só (o legado lia "Veio" e gravava
  //   "Vale", e a edição de uma linha já gravada se perdia).
  //
  // Histórico: cada gravação que muda alguma coisa vira UMA linha em
  // `ifood_fechamento.historico` (mesma transação), com quem, quando e o antes →
  // depois de cada campo e de cada linha incluída/removida — o handler `historico`
  // lê e a tela mostra. Gravação sem mudança não gera linha.
  //
  // REGRA: handler auto-contido — só importa de @gia-cb/sdk/server.

  interface OnlineDia {
    previsao?: string
    cbDescontosLoja?: number | null
    comentario?: string
  }
  interface AdquirenteDia {
    previsao?: string
    comentario?: string
  }
  interface LinhaExtrato {
    loja: string
    banco: string
    tipo: string
    mesAno: string
    classificacao: string
    subClassificacao: string
    dataMovimento: string
    historico: string
    documento: string
    malote: number
    competencia: string
  }
  interface LinhaCancelado {
    dataPedido: string
    estabelecimento: string
    cnpj: string
    nomeCliente: string
    numeroPedido: string
    idIfood: string
    valorPedidoTaxa: number
    valorReembolso: number | null
    centroVenda: string
    origemCancelamento: string
    justificativa: string
    andamento: string
    protocolo: string
    valeNoCofre: string
    dataAnulacao: string
    dataReembolso: string
  }
  interface Body {
    /** Empresa (loja) escolhida — o fechamento é da loja inteira (todas as operações). */
    empresaId: number
    mes: string
    online: Record<string, OnlineDia>
    adquirente: Record<string, AdquirenteDia>
    conferencia: Record<string, number>
    extrato: LinhaExtrato[]
    cancelados: LinhaCancelado[]
    anulacaoVerificar: number
  }
  interface Resposta {
    gravadoEm: string
    /** Quantas mudanças foram para o histórico (0 = nada mudou). */
    alteracoes: number
  }

  /** O `getDbClient()` é o `postgres.js` cru; tipamos só o que a gravação usa. */
  type Tx = <T = unknown[]>(strings: TemplateStringsArray, ...params: unknown[]) => Promise<T>
  type ComTransacao = { begin: <R>(fn: (tx: Tx) => Promise<R>) => Promise<R> }

  const CENTROS = ['valor_site_cc1', 'valor_site_cc2', 'valor_site_cc3', 'valor_site_cc4']
  const MAX_LINHAS = 5000

  const pad = (n: number) => String(n).padStart(2, '0')

  function dataValida(v: unknown): v is string {
    if (typeof v !== 'string') return false
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v)
    if (!m) return false
    const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]))
    return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3]
  }

  /** Data opcional: vazio vira `null`; preenchida e inválida é 422. */
  function dataOuNull(v: unknown, campo: string): string | null {
    if (v === undefined || v === null || v === '') return null
    if (!dataValida(v)) throw new HttpError(422, `${campo}: data inválida.`)
    return v
  }

  function numeroOuNull(v: unknown, campo: string): number | null {
    if (v === undefined || v === null || v === '') return null
    const n = Number(v)
    if (!Number.isFinite(n) || Math.abs(n) >= 1e12)
      throw new HttpError(422, `${campo}: valor inválido.`)
    return Math.round(n * 100) / 100
  }

  /** Texto com o limite da coluna (varchar do schema do legado). */
  function texto(v: unknown, max: number | null, campo: string): string {
    const t = typeof v === 'string' ? v.trim() : v === undefined || v === null ? '' : String(v)
    if (max !== null && t.length > max) {
      throw new HttpError(422, `${campo}: no máximo ${max} caracteres (veio ${t.length}).`)
    }
    return t
  }

  /**
   * Número da loja com 2 dígitos — o `loc_ref` do fechamento no banco e do DW.
   * Sai primeiro do nome da Empresa ("01.CB GOIANIA" → "01"; todas as lojas do cadastro
   * têm o número no nome) e, na falta, do vínculo com a BI do Simphony (`locRefs.BIAPI`
   * começa pelo número: "01 CB Go", "17. CB R"). O nome vem antes porque o BIAPI pode
   * divergir: na 999.CB TECH HOMOLOG ele é "995 CB L".
   */
  function numeroDaLoja(e: { nome: string; locRefs: Record<string, string> }): string | null {
    const m = /^\s*(\d{1,4})\s*\./.exec(e.nome) ?? /^\s*(\d{1,4})/.exec(e.locRefs?.BIAPI ?? '')
    return m ? String(Number(m[1])).padStart(2, '0') : null
  }

  // ── Histórico (antes → depois) ──────────────────────────────────────────────

  type Valor = string | number | null
  type Alteracao =
    | {
        secao: string
        item: string
        campo: string
        de: Valor
        para: Valor
        tipo: 'texto' | 'data' | 'moeda'
      }
    | { secao: string; item: string; acao: 'incluida' | 'removida' }

  const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
  const dataBR = (iso: string | null) =>
    iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}` : ''

  const ROTULO_CENTRO: Record<string, string> = {
    valor_site_cc1: 'Breakdown — centro de custo 1',
    valor_site_cc2: 'Breakdown — centro de custo 2',
    valor_site_cc3: 'Breakdown — centro de custo 3',
    valor_site_cc4: 'Breakdown — centro de custo 4',
  }

  interface Gravado {
    online: Map<string, { previsao: string | null; cbLoja: number | null; comentario: string }>
    adquirente: Map<string, { previsao: string | null; comentario: string }>
    conferencia: Map<string, number>
    anulacao: number
    extrato: Array<Record<string, Valor>>
    cancelados: Array<Record<string, Valor>>
  }

  /** O que está gravado agora no fechamento (dentro da transação, antes de gravar). */
  async function lerGravado(tx: Tx, fid: string): Promise<Gravado> {
    const [cab] = await tx<Array<{ anulacao: number }>>`
      SELECT anulacao_verificar::float8 AS anulacao FROM ifood_fechamento.fechamentos_mensais
      WHERE id = ${fid}::bigint
    `
    const online = await tx<
      Array<{ dia: string; previsao: string | null; cb_loja: number | null; comentario: string }>
    >`
      SELECT to_char(data_pedido, 'YYYY-MM-DD') AS dia,
        to_char(previsao_pagamento, 'YYYY-MM-DD') AS previsao,
        cb_descontos_loja::float8 AS cb_loja, COALESCE(comentario, '') AS comentario
      FROM ifood_fechamento.online_dia WHERE fechamento_id = ${fid}::bigint
    `
    const adq = await tx<Array<{ dia: string; previsao: string | null; comentario: string }>>`
      SELECT to_char(data_pedido, 'YYYY-MM-DD') AS dia,
        to_char(previsao_pagamento, 'YYYY-MM-DD') AS previsao, COALESCE(comentario, '') AS comentario
      FROM ifood_fechamento.adquirente_dia WHERE fechamento_id = ${fid}::bigint
    `
    const conf = await tx<Array<{ centro: string; valor: number }>>`
      SELECT centro_custo AS centro, COALESCE(valor, 0)::float8 AS valor
      FROM ifood_fechamento.conferencia_breakdown WHERE fechamento_id = ${fid}::bigint
    `
    const extrato = await tx<Array<Record<string, Valor>>>`
      SELECT COALESCE(loja, '') AS loja, COALESCE(banco, '') AS banco, COALESCE(tipo, '') AS tipo,
        COALESCE(mes_ano, '') AS "mesAno", COALESCE(classificacao, '') AS classificacao,
        COALESCE(sub_classificacao, '') AS "subClassificacao",
        to_char(data_movimento, 'YYYY-MM-DD') AS "dataMovimento",
        COALESCE(historico, '') AS historico, COALESCE(documento, '') AS documento,
        COALESCE(malote, 0)::float8 AS malote, COALESCE(competencia, '') AS competencia
      FROM ifood_fechamento.extrato_bancario
      WHERE fechamento_id = ${fid}::bigint AND deletado_em IS NULL ORDER BY id
    `
    const cancelados = await tx<Array<Record<string, Valor>>>`
      SELECT to_char(data_pedido, 'YYYY-MM-DD') AS "dataPedido",
        COALESCE(estabelecimento, '') AS estabelecimento, COALESCE(cnpj, '') AS cnpj,
        COALESCE(nome_cliente, '') AS "nomeCliente", COALESCE(numero_pedido, '') AS "numeroPedido",
        COALESCE(id_ifood, '') AS "idIfood", COALESCE(valor_pedido_taxa, 0)::float8 AS "valorPedidoTaxa",
        valor_reembolso::float8 AS "valorReembolso", COALESCE(centro_venda, '') AS "centroVenda",
        COALESCE(origem_cancelamento, '') AS "origemCancelamento",
        COALESCE(justificativa, '') AS justificativa, COALESCE(andamento, '') AS andamento,
        COALESCE(protocolo, '') AS protocolo, COALESCE(vale_no_cofre, '') AS "valeNoCofre",
        to_char(data_anulacao, 'YYYY-MM-DD') AS "dataAnulacao",
        to_char(data_reembolso, 'YYYY-MM-DD') AS "dataReembolso"
      FROM ifood_fechamento.cancelados_pos
      WHERE fechamento_id = ${fid}::bigint AND deletado_em IS NULL ORDER BY id
    `
    return {
      online: new Map(
        online.map((o) => [
          o.dia,
          { previsao: o.previsao, cbLoja: o.cb_loja, comentario: o.comentario },
        ])
      ),
      adquirente: new Map(
        adq.map((a) => [a.dia, { previsao: a.previsao, comentario: a.comentario }])
      ),
      conferencia: new Map(conf.map((c) => [c.centro, c.valor])),
      anulacao: cab?.anulacao ?? 0,
      extrato,
      cancelados,
    }
  }

  type Tipo = 'texto' | 'data' | 'moeda'
  /** Campos da linha do extrato: rótulo e tipo, para o histórico. */
  const CAMPOS_EXTRATO: Record<string, [string, Tipo]> = {
    dataMovimento: ['Data do movimento', 'data'],
    malote: ['Malote', 'moeda'],
    historico: ['Histórico', 'texto'],
    loja: ['Loja', 'texto'],
    banco: ['Banco', 'texto'],
    tipo: ['Tipo', 'texto'],
    mesAno: ['Mês / Ano', 'texto'],
    classificacao: ['Classificação', 'texto'],
    subClassificacao: ['Sub classificação', 'texto'],
    documento: ['Documento', 'texto'],
    competencia: ['Competência', 'texto'],
  }
  /** Campos do cancelado pós-entrega: rótulo e tipo, para o histórico. */
  const CAMPOS_CANCELADO: Record<string, [string, Tipo]> = {
    dataPedido: ['Data do pedido', 'data'],
    numeroPedido: ['Nº do pedido', 'texto'],
    idIfood: ['ID iFood', 'texto'],
    valorPedidoTaxa: ['Valor (pedido + taxa)', 'moeda'],
    valorReembolso: ['Valor do reembolso', 'moeda'],
    estabelecimento: ['Estabelecimento', 'texto'],
    cnpj: ['CNPJ', 'texto'],
    nomeCliente: ['Cliente', 'texto'],
    centroVenda: ['Centro de venda', 'texto'],
    origemCancelamento: ['Origem do cancelamento', 'texto'],
    justificativa: ['Justificativa', 'texto'],
    andamento: ['Andamento', 'texto'],
    protocolo: ['Protocolo', 'texto'],
    valeNoCofre: ['Vale no cofre?', 'texto'],
    dataAnulacao: ['Data de anulação', 'data'],
    dataReembolso: ['Data de reembolso', 'data'],
  }

  /** Valor normalizado para comparar: vazio e `null` iguais, texto sem espaço nas pontas. */
  const normal = (v: unknown): string | number =>
    v === null || v === undefined ? '' : typeof v === 'string' ? v.trim() : (v as number)

  /** Chave da linha para comparar listas: todos os campos, vazio e `null` iguais. */
  const chaveLinha = (l: Record<string, unknown>, campos: string[]) =>
    JSON.stringify(campos.map((c) => normal(l[c])))

  /** Linhas que estão numa lista e não na outra (contando repetidas). */
  function sobras<T extends Record<string, unknown>>(de: T[], menos: T[], campos: string[]): T[] {
    const conta = new Map<string, number>()
    for (const l of menos) {
      const k = chaveLinha(l, campos)
      conta.set(k, (conta.get(k) ?? 0) + 1)
    }
    return de.filter((l) => {
      const k = chaveLinha(l, campos)
      const n = conta.get(k) ?? 0
      if (n > 0) {
        conta.set(k, n - 1)
        return false
      }
      return true
    })
  }

  /**
   * Diferenças de uma lista (extrato/cancelados) entre o gravado e a tela. A linha
   * editada vira "campo antes → depois" (casada com a removida mais parecida: até
   * metade dos campos diferentes); o resto é linha incluída ou removida.
   */
  function diferencasDaLista(
    secao: string,
    antes: Array<Record<string, unknown>>,
    depois: Array<Record<string, unknown>>,
    campos: Record<string, [string, Tipo]>,
    resumo: (l: Record<string, unknown>) => string
  ): Alteracao[] {
    const nomes = Object.keys(campos)
    const removidas = sobras(antes, depois, nomes)
    const incluidas = sobras(depois, antes, nomes)
    const diferentes = (a: Record<string, unknown>, b: Record<string, unknown>) =>
      nomes.filter((c) => normal(a[c]) !== normal(b[c]))
    const out: Alteracao[] = []
    // Casamento pelo par MAIS parecido de todos (não o primeiro que serve): numa
    // exclusão + edição de linhas parecidas, a edição fica com a linha certa. Lista
    // enorme (troca de milhares de linhas) não tenta casar — vira incluída/removida.
    const limite = Math.floor(nomes.length / 2)
    const pares: Array<[number, number, number]> = []
    if (removidas.length * incluidas.length <= 250_000) {
      removidas.forEach((r, ri) =>
        incluidas.forEach((n, ii) => {
          const d = diferentes(r, n).length
          if (d <= limite) pares.push([d, ri, ii])
        })
      )
      pares.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2])
    }
    const usadas = new Set<number>()
    const casadas = new Map<number, number>()
    for (const [, ri, ii] of pares) {
      if (casadas.has(ri) || usadas.has(ii)) continue
      casadas.set(ri, ii)
      usadas.add(ii)
    }
    removidas.forEach((r, ri) => {
      const ii = casadas.get(ri)
      if (ii === undefined) {
        out.push({ secao, item: resumo(r), acao: 'removida' })
        return
      }
      const n = incluidas[ii]
      for (const c of diferentes(r, n)) {
        const [campo, tipo] = campos[c]
        const v = (x: unknown): Valor => (x === undefined ? null : (x as Valor))
        out.push({ secao, item: resumo(r), campo, de: v(r[c]), para: v(n[c]), tipo })
      }
    })
    incluidas.forEach((n, i) => {
      if (!usadas.has(i)) out.push({ secao, item: resumo(n), acao: 'incluida' })
    })
    return out
  }

  const resumoExtrato = (e: Record<string, unknown>) =>
    [dataBR(e.dataMovimento as string), BRL.format(Number(e.malote) || 0), e.historico]
      .filter(Boolean)
      .join(' · ')
  const resumoCancelado = (c: Record<string, unknown>) =>
    [
      dataBR(c.dataPedido as string),
      c.numeroPedido ? `pedido ${c.numeroPedido}` : c.idIfood ? `iFood ${c.idIfood}` : '',
      BRL.format(Number(c.valorPedidoTaxa) || 0),
      c.nomeCliente,
    ]
      .filter(Boolean)
      .join(' · ')

  /**
   * Falha do banco/conexão (o postgres.js põe um `code`: SQLSTATE como "42P01" ou de
   * rede como "ECONNREFUSED"). Outro erro é bug do código e segue como 500.
   */
  function ehFalhaDoBanco(e: unknown): boolean {
    return typeof (e as { code?: unknown } | null)?.code === 'string'
  }

  /**
   * Erro inesperado do banco (conexão, constraint, coluna…) não vai cru para a tela:
   * o detalhe fica no log do servidor e o usuário recebe uma mensagem curta. Os
   * `HttpError` (validação) passam como estão.
   */
  function erroDeBanco(e: unknown): never {
    if (e instanceof HttpError || !ehFalhaDoBanco(e)) throw e
    console.error('[fechamento-ifood-mensal] erro ao gravar o fechamento no banco:', e)
    // Tabela de histórico ainda não criada no Maestro (INTEGRATION.md §2.1).
    const err = e as { code?: string; message?: string }
    if (err.code === '42P01' && String(err.message ?? '').includes('historico')) {
      throw new HttpError(
        503,
        'Não foi possível gravar: o banco do fechamento ainda não está preparado para o histórico. Avise o suporte.'
      )
    }
    throw new HttpError(
      503,
      'Não foi possível gravar o fechamento agora (falha no banco de dados). Tente de novo em alguns minutos; se continuar, avise o suporte.'
    )
  }

  /**
   * Trava de teste da gravação. Homologação e produção gravam no MESMO banco (o DW,
   * `GIA_SERVER_DATABASE_URL`): sem trava, um Salvar de teste em homologação altera o
   * fechamento real da loja.
   *
   * `FECHAMENTO_IFOOD_MENSAL_EMPRESA_TESTE` (opcional, id da Empresa no portal):
   * - ausente ou vazia (produção): nada muda;
   * - definida (homologação, com a Empresa 999): o `salvar` recusa qualquer outra
   *   Empresa com 403, antes de abrir a transação;
   * - definida com valor que não é um id (ex.: o nome da loja): recusa TODA gravação
   *   (503) — erro de configuração não pode abrir a trava.
   *
   * Fica fora do `config.secrets` de propósito: lá ela vira `secrets_required` e a
   * instalação em produção passaria a exigi-la.
   */
  function travaDeTeste(empresaId: number): void {
    const valor = envOptional('FECHAMENTO_IFOOD_MENSAL_EMPRESA_TESTE')?.trim()
    if (!valor) return
    const permitida = /^\d+$/.test(valor) ? Number(valor) : NaN
    if (!Number.isSafeInteger(permitida) || permitida <= 0) {
      console.error(
        '[fechamento-ifood-mensal/salvar] FECHAMENTO_IFOOD_MENSAL_EMPRESA_TESTE inválida (esperado o id numérico da Empresa); gravação recusada.'
      )
      throw new HttpError(
        503,
        'Gravação desativada neste ambiente: a loja de teste está mal configurada. Avise o time do Portal GIA.'
      )
    }
    if (empresaId !== permitida) {
      throw new HttpError(
        403,
        'Este ambiente é de teste: o Salvar só grava na loja de teste. Escolha a loja de teste para gravar; as outras lojas podem ser consultadas, mas não salvas aqui.'
      )
    }
  }

  const __giaHandler = defineHandler<Body, Resposta>(async (ctx) => {
    try {
      await ctx.requirePermission('fechamento-ifood-mensal.editar')
      // A loja é a Empresa: o fechamento junta todas as operações dela. O número da loja
      // (do nome da Empresa, ou do BIAPI) é a chave no banco do Maestro — o `loc_ref` do
      // fechamento (como no legado) e o `property_number` do borderô.
      const empresaId = Number(ctx.body.empresaId)
      if (!Number.isInteger(empresaId) || empresaId <= 0) throw new HttpError(422, 'Informe a loja.')
      // 403 se a Empresa está fora do escopo do usuário.
      await ctx.requireEmpresa(empresaId)
      // Trava de teste: antes de qualquer acesso ao banco (o cabeçalho do mês é criado
      // na transação, mesmo num Salvar sem alteração).
      travaDeTeste(empresaId)
      const empresa = (await ctx.empresas()).find((e) => e.id === empresaId)
      if (!empresa) throw new HttpError(404, 'Loja não encontrada.')
      // Só Empresa (loja) tem fechamento — como no seletor (`lojas.ts`). Uma propriedade
      // com número no nome apontaria para a loja de mesmo número, talvez fora do escopo.
      if (empresa.tipoRegistro !== 'empresa')
        throw new HttpError(422, `"${empresa.nome}" não é uma loja (Empresa).`)
      const locRef = numeroDaLoja(empresa)
      if (!locRef) {
        throw new HttpError(
          422,
          `A loja "${empresa.nome}" não tem o número da loja no nome nem no vínculo BIAPI.`
        )
      }

      const mm = /^(\d{4})-(\d{2})$/.exec(String(ctx.body.mes ?? ''))
      const ano = mm ? Number(mm[1]) : 0
      const mes = mm ? Number(mm[2]) : 0
      if (ano < 2000 || mes < 1 || mes > 12) throw new HttpError(422, 'Mês inválido (AAAA-MM).')

      // ── Validação do corpo (o navegador não é confiável) ──────────────────────
      const prefixo = `${ano}-${pad(mes)}-`
      const diaDoMes = (d: string) => {
        if (!dataValida(d) || !d.startsWith(prefixo))
          throw new HttpError(422, `Dia ${d} fora do mês ${ano}-${pad(mes)}.`)
        return d
      }
      const objeto = (v: unknown) =>
        v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {}

      const online = Object.entries(objeto(ctx.body.online)).map(([dia, raw]) => {
        const o = objeto(raw)
        return {
          dia: diaDoMes(dia),
          previsao: dataOuNull(o.previsao, `Online ${dia} — previsão`),
          cbLoja: numeroOuNull(o.cbDescontosLoja, `Online ${dia} — CB Descontos LOJA`),
          comentario: texto(o.comentario, null, `Online ${dia} — comentário`),
        }
      })
      const adquirente = Object.entries(objeto(ctx.body.adquirente)).map(([dia, raw]) => {
        const a = objeto(raw)
        return {
          dia: diaDoMes(dia),
          previsao: dataOuNull(a.previsao, `Adquirentes ${dia} — previsão`),
          comentario: texto(a.comentario, null, `Adquirentes ${dia} — comentário`),
        }
      })
      const conf = objeto(ctx.body.conferencia)
      const conferencia = CENTROS.map((c) => ({
        centro: c,
        valor: numeroOuNull(conf[c], `Conferência ${c}`) ?? 0,
      }))
      const anulacao = numeroOuNull(ctx.body.anulacaoVerificar, 'Anulação (verificar)') ?? 0

      const listaExtrato = Array.isArray(ctx.body.extrato) ? ctx.body.extrato : []
      const listaCancelados = Array.isArray(ctx.body.cancelados) ? ctx.body.cancelados : []
      if (listaExtrato.length > MAX_LINHAS || listaCancelados.length > MAX_LINHAS) {
        throw new HttpError(422, `No máximo ${MAX_LINHAS} linhas por lista.`)
      }
      const extrato = listaExtrato.map((raw, i) => {
        const e = objeto(raw)
        const n = `Extrato, linha ${i + 1}`
        const data = dataOuNull(e.dataMovimento, `${n} — data do movimento`)
        if (!data) throw new HttpError(422, `${n}: informe a data do movimento.`)
        return {
          loja: texto(e.loja, 20, `${n} — loja`),
          banco: texto(e.banco, 100, `${n} — banco`),
          tipo: texto(e.tipo, 100, `${n} — tipo`),
          mesAno: texto(e.mesAno, 20, `${n} — mês/ano`),
          classificacao: texto(e.classificacao, 150, `${n} — classificação`),
          subClassificacao: texto(e.subClassificacao, 150, `${n} — sub classificação`),
          dataMovimento: data,
          historico: texto(e.historico, null, `${n} — histórico`),
          documento: texto(e.documento, 100, `${n} — documento`),
          malote: numeroOuNull(e.malote, `${n} — malote`) ?? 0,
          competencia: texto(e.competencia, 7, `${n} — competência`),
        }
      })
      const cancelados = listaCancelados.map((raw, i) => {
        const c = objeto(raw)
        const n = `Cancelados pós, linha ${i + 1}`
        const data = dataOuNull(c.dataPedido, `${n} — data do pedido`)
        if (!data) throw new HttpError(422, `${n}: informe a data do pedido.`)
        return {
          dataPedido: data,
          estabelecimento: texto(c.estabelecimento, 150, `${n} — estabelecimento`),
          cnpj: texto(c.cnpj, 20, `${n} — CNPJ`),
          nomeCliente: texto(c.nomeCliente, 200, `${n} — nome do cliente`),
          numeroPedido: texto(c.numeroPedido, 50, `${n} — nº do pedido`),
          idIfood: texto(c.idIfood, 50, `${n} — ID iFood`),
          valorPedidoTaxa: numeroOuNull(c.valorPedidoTaxa, `${n} — valor`) ?? 0,
          valorReembolso: numeroOuNull(c.valorReembolso, `${n} — valor do reembolso`),
          centroVenda: texto(c.centroVenda, 100, `${n} — centro de venda`),
          origemCancelamento: texto(c.origemCancelamento, 100, `${n} — origem`),
          justificativa: texto(c.justificativa, null, `${n} — justificativa`),
          andamento: texto(c.andamento, 150, `${n} — andamento`),
          protocolo: texto(c.protocolo, 100, `${n} — protocolo`),
          valeNoCofre: texto(c.valeNoCofre, 20, `${n} — vale no cofre`),
          dataAnulacao: dataOuNull(c.dataAnulacao, `${n} — data de anulação`),
          dataReembolso: dataOuNull(c.dataReembolso, `${n} — data de reembolso`),
        }
      })

      const perfil = await ctx.perfilUsuario()
      const autor = perfil.legacyUserId ?? perfil.id
      const autorNome = (perfil.nome ?? perfil.email ?? '').slice(0, 200) || null

      const db = (await getDbClient()) as unknown as ComTransacao
      const gravado = await db.begin(async (tx) => {
        // Cabeçalho do mês: cria na primeira gravação.
        let [cab] = await tx<Array<{ id: string }>>`
        SELECT id::text FROM ifood_fechamento.fechamentos_mensais
        WHERE loc_ref = ${locRef} AND ano = ${ano} AND mes = ${mes} AND deletado_em IS NULL
        FOR UPDATE
      `
        if (!cab) {
          ;[cab] = await tx<Array<{ id: string }>>`
          INSERT INTO ifood_fechamento.fechamentos_mensais (loc_ref, ano, mes, criado_por)
          VALUES (${locRef}, ${ano}, ${mes}, ${autor}::uuid) RETURNING id::text
        `
        }
        const fid = cab.id

        // Antes de gravar: o que está no banco agora, para o histórico.
        const antes = await lerGravado(tx, fid)
        const alteracoes: Alteracao[] = []
        const mudou = (
          secao: string,
          item: string,
          campo: string,
          de: Valor,
          para: Valor,
          tipo: Tipo
        ) => {
          if (normal(de) !== normal(para)) alteracoes.push({ secao, item, campo, de, para, tipo })
        }
        for (const o of [...online].sort((a, b) => a.dia.localeCompare(b.dia))) {
          const a = antes.online.get(o.dia)
          const item = dataBR(o.dia)
          mudou('Online', item, 'Previsão', a?.previsao ?? null, o.previsao, 'data')
          mudou('Online', item, 'CB Descontos LOJA', a?.cbLoja ?? null, o.cbLoja, 'moeda')
          mudou('Online', item, 'Comentário', a?.comentario ?? '', o.comentario, 'texto')
        }
        for (const n of [...adquirente].sort((a, b) => a.dia.localeCompare(b.dia))) {
          const a = antes.adquirente.get(n.dia)
          const item = dataBR(n.dia)
          mudou('Adquirentes', item, 'Previsão', a?.previsao ?? null, n.previsao, 'data')
          mudou('Adquirentes', item, 'Comentário', a?.comentario ?? '', n.comentario, 'texto')
        }
        for (const c of conferencia) {
          mudou(
            'Conferência',
            ROTULO_CENTRO[c.centro] ?? c.centro,
            'Valor site',
            antes.conferencia.get(c.centro) ?? 0,
            c.valor,
            'moeda'
          )
        }
        mudou('Fechamento', 'Mês', 'Anulação (verificar)', antes.anulacao, anulacao, 'moeda')
        alteracoes.push(
          ...diferencasDaLista('Extrato', antes.extrato, extrato, CAMPOS_EXTRATO, resumoExtrato),
          ...diferencasDaLista(
            'Cancelados pós',
            antes.cancelados,
            cancelados,
            CAMPOS_CANCELADO,
            resumoCancelado
          )
        )

        const [{ agora }] = await tx<Array<{ agora: string }>>`
        UPDATE ifood_fechamento.fechamentos_mensais
        SET anulacao_verificar = ${anulacao}, atualizado_em = now(), atualizado_por = ${autor}::uuid
        WHERE id = ${fid}::bigint
        RETURNING to_char(atualizado_em AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS agora
      `

        // Online por dia: grava o dia com algum valor; limpa o dia que ficou vazio.
        for (const o of online) {
          const temValor = o.previsao !== null || o.cbLoja !== null || o.comentario !== ''
          if (temValor) {
            await tx`
            INSERT INTO ifood_fechamento.online_dia
              (fechamento_id, data_pedido, previsao_pagamento, cb_descontos_loja, comentario, criado_por)
            VALUES (${fid}::bigint, ${o.dia}::date, ${o.previsao}::date, ${o.cbLoja}, ${o.comentario}, ${autor}::uuid)
            ON CONFLICT (fechamento_id, data_pedido) DO UPDATE SET
              previsao_pagamento = EXCLUDED.previsao_pagamento,
              cb_descontos_loja = EXCLUDED.cb_descontos_loja,
              comentario = EXCLUDED.comentario,
              atualizado_em = now(), atualizado_por = EXCLUDED.criado_por
          `
          } else {
            await tx`
            UPDATE ifood_fechamento.online_dia
            SET previsao_pagamento = NULL, cb_descontos_loja = NULL, comentario = '',
              atualizado_em = now(), atualizado_por = ${autor}::uuid
            WHERE fechamento_id = ${fid}::bigint AND data_pedido = ${o.dia}::date
              AND (previsao_pagamento IS NOT NULL OR cb_descontos_loja IS NOT NULL
                   OR COALESCE(comentario, '') <> '')
          `
          }
        }

        for (const a of adquirente) {
          if (a.previsao !== null || a.comentario !== '') {
            await tx`
            INSERT INTO ifood_fechamento.adquirente_dia
              (fechamento_id, data_pedido, previsao_pagamento, comentario, criado_por)
            VALUES (${fid}::bigint, ${a.dia}::date, ${a.previsao}::date, ${a.comentario}, ${autor}::uuid)
            ON CONFLICT (fechamento_id, data_pedido) DO UPDATE SET
              previsao_pagamento = EXCLUDED.previsao_pagamento, comentario = EXCLUDED.comentario,
              atualizado_em = now(), atualizado_por = EXCLUDED.criado_por
          `
          } else {
            await tx`
            UPDATE ifood_fechamento.adquirente_dia
            SET previsao_pagamento = NULL, comentario = '',
              atualizado_em = now(), atualizado_por = ${autor}::uuid
            WHERE fechamento_id = ${fid}::bigint AND data_pedido = ${a.dia}::date
              AND (previsao_pagamento IS NOT NULL OR COALESCE(comentario, '') <> '')
          `
          }
        }

        for (const c of conferencia) {
          await tx`
          INSERT INTO ifood_fechamento.conferencia_breakdown (fechamento_id, centro_custo, valor, criado_por)
          VALUES (${fid}::bigint, ${c.centro}, ${c.valor}, ${autor}::uuid)
          ON CONFLICT (fechamento_id, centro_custo) DO UPDATE SET valor = EXCLUDED.valor,
            atualizado_em = now(), atualizado_por = EXCLUDED.criado_por
          WHERE ifood_fechamento.conferencia_breakdown.valor IS DISTINCT FROM EXCLUDED.valor
        `
        }

        await tx`
        UPDATE ifood_fechamento.extrato_bancario SET deletado_em = now(), deletado_por = ${autor}::uuid
        WHERE fechamento_id = ${fid}::bigint AND deletado_em IS NULL
      `
        for (const e of extrato) {
          await tx`
          INSERT INTO ifood_fechamento.extrato_bancario
            (fechamento_id, loja, banco, tipo, mes_ano, classificacao, sub_classificacao,
             data_movimento, historico, documento, malote, competencia, criado_por)
          VALUES (${fid}::bigint, ${e.loja}, ${e.banco}, ${e.tipo}, ${e.mesAno}, ${e.classificacao},
            ${e.subClassificacao}, ${e.dataMovimento}::date, ${e.historico}, ${e.documento},
            ${e.malote}, ${e.competencia}, ${autor}::uuid)
        `
        }

        await tx`
        UPDATE ifood_fechamento.cancelados_pos SET deletado_em = now(), deletado_por = ${autor}::uuid
        WHERE fechamento_id = ${fid}::bigint AND deletado_em IS NULL
      `
        for (const c of cancelados) {
          await tx`
          INSERT INTO ifood_fechamento.cancelados_pos
            (fechamento_id, data_pedido, estabelecimento, cnpj, nome_cliente, numero_pedido,
             id_ifood, valor_pedido_taxa, valor_reembolso, centro_venda, origem_cancelamento,
             justificativa, andamento, protocolo, vale_no_cofre, data_anulacao, data_reembolso, criado_por)
          VALUES (${fid}::bigint, ${c.dataPedido}::date, ${c.estabelecimento}, ${c.cnpj}, ${c.nomeCliente},
            ${c.numeroPedido}, ${c.idIfood}, ${c.valorPedidoTaxa}, ${c.valorReembolso},
            ${c.centroVenda}, ${c.origemCancelamento}, ${c.justificativa}, ${c.andamento},
            ${c.protocolo}, ${c.valeNoCofre}, ${c.dataAnulacao}::date, ${c.dataReembolso}::date,
            ${autor}::uuid)
        `
        }
        // `::text::jsonb`: com `::jsonb` direto o postgres.js serializa a string de novo
        // e o banco guarda um texto JSON, não o array.
        if (alteracoes.length > 0) {
          await tx`
          INSERT INTO ifood_fechamento.historico (fechamento_id, autor, autor_nome, alteracoes)
          VALUES (${fid}::bigint, ${autor}::uuid, ${autorNome}, ${JSON.stringify(alteracoes)}::text::jsonb)
        `
        }
        return { agora, alteracoes: alteracoes.length }
      })

      return { gravadoEm: gravado.agora, alteracoes: gravado.alteracoes }
    } catch (e) {
      erroDeBanco(e)
    }
  })


  return __giaHandler
})() as ServerHandler<unknown, unknown>

const __MODULE_ID = "fechamento-ifood-mensal"
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
