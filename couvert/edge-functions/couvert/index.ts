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
  couvert: GiaCouvert
}
type GiaCouvert = {
  programacao: number[]
  buffet: number[]
  rvcs: { nome: string; numero: number }[]
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
/** Inteiro não negativo escrito só com dígitos (o `miNum` e o número do RVC), ou `null`. */
function __giaInteiro(v: string): number | null {
  const t = v.trim()
  if (!t) return null
  for (const c of t) if (c < '0' || c > '9') return null
  const n = Number(t)
  return Number.isSafeInteger(n) ? n : null
}
/**
 * Configuração de couvert (alpha.72): as colunas do legado, interpretadas como o
 * `FillCdsRvcFromString` do legado — trim em cada parte, item vazio ou não
 * numérico descartado. RVC é `Nome=número`, às vezes com espaço depois da vírgula.
 */
function __giaCouvert(
  progr: string | null | undefined,
  buffet: string | null | undefined,
  rvc: string | null | undefined
): GiaCouvert {
  const numeros = (v: string | null | undefined): number[] => {
    const saida: number[] = []
    for (const parte of (v ?? '').split(',')) {
      const n = __giaInteiro(parte)
      if (n !== null) saida.push(n)
    }
    return saida
  }
  const rvcs: { nome: string; numero: number }[] = []
  for (const parte of (rvc ?? '').split(',')) {
    const i = parte.indexOf('=')
    if (i < 0) continue
    const nome = parte.slice(0, i).trim()
    const numero = __giaInteiro(parte.slice(i + 1))
    if (nome && numero !== null) rvcs.push({ nome, numero })
  }
  return { programacao: numeros(progr), buffet: numeros(buffet), rvcs }
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
      // alpha.72: configuração de couvert (códigos PDV e RVCs).
      `couv_progr,couv_buffet,couv_rvc,` +
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
    couv_progr?: string | null
    couv_buffet?: string | null
    couv_rvc?: string | null
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
      couvert: __giaCouvert(e.couv_progr, e.couv_buffet, e.couv_rvc),
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

const __giaHandlers: Record<string, ServerHandler<unknown, unknown>> = {}
const __giaPublicHandlers: Record<string, PublicServerHandler> = {}
const __giaPublicRotas: { handler: string; segmentos: string[]; methods: string[] }[] = []

// ─── src/server/lojas.ts ────────────────────────────────────────────────
__giaHandlers["lojas"] = (() => {

  // Lojas do seletor: as Empresas do escopo do usuário que são loja, ativas e com
  // vínculo com a BI do Simphony (`locRefs.BIAPI`). Cada loja vem com os RVCs (salões)
  // de couvert, na ordem do cadastro (o 1º é o padrão), de `empresa.couvert`, a configuração de couvert do cadastro de Empresas do portal
  // (SDK alpha.72). No legado isso vinha de `gia.empresas.couv_*`.
  //
  // REGRA: handler auto-contido — só importa de @gia-cb/sdk/server.

  interface Loja {
    empresaId: number
    nome: string
    rvcs: Array<{ numero: number; nome: string }>
  }

  const __giaHandler = defineHandler<Record<string, never>, Loja[]>(async (ctx) => {
    await ctx.requirePermission('couvert.ler')
    // ctx.empresas() já vem recortado pelo escopo; a checagem explícita deixa o
    // "ONDE" visível aqui e no gia validate.
    const escopo = await ctx.empresaScope()
    return (await ctx.empresas())
      .filter(
        (e) =>
          (escopo.all || escopo.empresaIds.includes(e.id)) &&
          e.tipoRegistro === 'empresa' &&
          e.ativo &&
          Boolean(e.locRefs?.BIAPI?.trim())
      )
      .map((e) => ({
        empresaId: e.id,
        nome: e.nome,
        rvcs: (e.couvert?.rvcs ?? []).map((r) => ({ numero: r.numero, nome: r.nome })),
      }))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { numeric: true }))
  })


  return __giaHandler
})() as ServerHandler<unknown, unknown>

// ─── src/server/mesas.ts ────────────────────────────────────────────────
__giaHandlers["mesas"] = (() => {

  // Mesas abertas de UM salão (RVC) de UMA loja, agora, com o couvert artístico e o
  // buffet lançados em cada uma. Uma loja por chamada (padrão 14 e orientação do time
  // do Portal GIA, 19/11/2026): `getLatestBusDt` e depois `getGuestChecks`.
  //
  // Regras do legado (`TDmSimDash.SimphonyGetChecks`, tela Couvert):
  // - contas abertas do RVC (`where equals(guestChecks.clsdFlag,false) AND
  //   equals(guestChecks.rvcNum,<RVC>)`); ficam de fora `guestCheckId <= 0`,
  //   `clsdFlag` e `cancelFlag` (nas contas abertas a BI nem manda os dois flags);
  // - mesa = `tblName`, grupo = `tblNum`, pessoas = `gstCnt`;
  // - couvert = soma de `dspQty` das linhas cujo `menuItem.miNum` está na programação
  //   artística da loja; buffet = o mesmo com os itens de buffet.
  // Diferença para o legado: o dia de negócio vem do `getLatestBusDt` (o legado usava a
  // data de hoje e perdia as mesas do turno que passa da meia-noite) — decidido com o
  // usuário e o time do Portal GIA em 19/11/2026.
  //
  // Configuração da loja: `empresa.couvert` (SDK alpha.72), do cadastro de Empresas do
  // portal. Token: hub de Credenciais (`simphony-bi`); o `baseUrl` já vem com a
  // organização. A situação de cada mesa é da tela (`src/regras.ts`).
  //
  // REGRA: handler auto-contido — só importa de @gia-cb/sdk/server.

  const INTEGRACAO = 'simphony-bi'
  /**
   * Tempo limite de cada chamada à BI. O time do Portal GIA orientou 60 s, mas em
   * 19/11/2026 (17h, Campinas, um RVC) o `getGuestChecks` levou 89 s, 77 s e 8,5 s em
   * três tentativas seguidas — com 60 s a maioria das pesquisas caía no 504. 120 s fica
   * abaixo do limite da Edge Function (150 s), e o dia de negócio tem limite próprio para as
   * duas chamadas somadas não passarem dele; combinar com o time do Portal GIA o
   * `timeout_seconds` da função `couvert` (INTEGRATION §5). O legado esperava 180 s.
   * Estourou: 504, e a tela não repete sozinha.
   */
  const TIMEOUT_MS = 120_000
  /** `getLatestBusDt` é leve (0,6 s medidos): 20 s + 120 s cabem nos 150 s da função. */
  const TIMEOUT_DIA_MS = 20_000

  interface Body {
    empresaId: number
    /** Número do RVC (salão) — um dos da loja (conferido aqui). */
    rvc: number
  }

  interface ItemConta {
    /** Código do item no PDV (`menuItem.miNum`); o nome vem do handler `nomes`. */
    miNum: number
    qtd: number
    valor: number
    /** Assento (`seatNum`); `null` sem assento. */
    assento: number | null
    /** Rodada de pedido (`svcRndNum`). */
    rodada: number | null
    /** Hora local do lançamento (`detailLcl`), `AAAA-MM-DDTHH:MM:SS`. */
    hora: string | null
    tipo: 'couvert' | 'buffet' | null
  }

  /** Conta aberta da mesa — o detalhe que abre ao tocar no card. */
  interface Conta {
    numero: number | null
    /** Hora local da abertura (`opnLcl`) e do último lançamento (`lastTransLcl`). */
    abertura: string | null
    ultimoLancamento: string | null
    /** Garçom da conta (`empNum`); o nome vem do handler `nomes`. */
    garcom: number | null
    rodadas: number | null
    /** Pré-conta impressa (`numChkPrntd > 0`). */
    impressa: boolean
    subtotal: number
    desconto: number
    taxaServico: number
    total: number
    pago: number
    saldo: number
    itens: ItemConta[]
  }

  interface Mesa {
    /** `guestCheckId` da conta. */
    id: string
    /** Nome da mesa (`tblName`). */
    mesa: string
    /** Número do grupo da mesa (`tblNum`). */
    grupo: number | null
    pessoas: number
    couvert: number
    buffet: number
    conta: Conta
  }

  interface Resposta {
    /** Dia de negócio aberto na loja (`getLatestBusDt`), `AAAA-MM-DD`. */
    dia: string
    /** ISO da consulta (para o "atualizado há N min"). */
    consultadoEm: string
    /** Loja com itens de buffet configurados: o buffet conta para a situação. */
    temBuffet: boolean
    mesas: Mesa[]
  }

  type Json = Record<string, unknown>

  const num = (v: unknown): number =>
    typeof v === 'number' && Number.isFinite(v) ? v : Number(v) || 0

  const opcional = (v: unknown): number | null =>
    v === null || v === undefined || v === '' ? null : num(v)
  const texto = (v: unknown): string | null => (typeof v === 'string' && v ? v : null)

  /** Contas da BI → mesas (regras do legado, ver o topo). */
  function montarMesas(contas: unknown[], programacao: Set<number>, buffet: Set<number>): Mesa[] {
    const mesas: Mesa[] = []
    for (const bruto of contas) {
      const c = (bruto ?? {}) as Json
      if (num(c.guestCheckId) <= 0 || c.clsdFlag === true || c.cancelFlag === true) continue
      let couvert = 0
      let somaBuffet = 0
      const itens: ItemConta[] = []
      for (const linha of Array.isArray(c.detailLines) ? (c.detailLines as Json[]) : []) {
        const item = linha?.menuItem as Json | undefined
        if (!item) continue // taxa de serviço, desconto, pagamento…
        const mi = num(item.miNum)
        const tipo = programacao.has(mi) ? 'couvert' : buffet.has(mi) ? 'buffet' : null
        if (tipo === 'couvert') couvert += num(linha.dspQty)
        if (tipo === 'buffet') somaBuffet += num(linha.dspQty)
        itens.push({
          miNum: mi,
          qtd: num(linha.dspQty),
          valor: num(linha.dspTtl),
          assento: opcional(linha.seatNum),
          rodada: opcional(linha.svcRndNum),
          hora: texto(linha.detailLcl),
          tipo,
        })
      }
      const tblNum = c.tblNum === null || c.tblNum === undefined ? null : num(c.tblNum)
      mesas.push({
        id: String(c.guestCheckId),
        mesa: String(c.tblName ?? tblNum ?? '').trim() || '?',
        grupo: tblNum,
        pessoas: num(c.gstCnt),
        couvert,
        buffet: somaBuffet,
        conta: {
          numero: opcional(c.chkNum),
          abertura: texto(c.opnLcl),
          ultimoLancamento: texto(c.lastTransLcl),
          garcom: opcional(c.empNum),
          rodadas: opcional(c.numSrvcRd),
          impressa: num(c.numChkPrntd) > 0,
          subtotal: num(c.subTtl),
          desconto: num(c.dscTtl),
          // `svcChgTtl` já inclui a taxa automática (`autoSvcTtl`): somar os dois
          // dobrava a taxa (visto numa conta real em 23/11/2026: total − subtotal = svcChgTtl).
          taxaServico:
            c.svcChgTtl !== null && c.svcChgTtl !== undefined ? num(c.svcChgTtl) : num(c.autoSvcTtl),
          total: num(c.chkTtl),
          pago: num(c.payTtl),
          saldo: num(c.balDueTtl),
          itens,
        },
      })
    }
    return mesas
  }

  // ── Loja de demonstração (só `gia dev`) ─────────────────────────────────────
  // Com GIA_DEV_COUVERT_DEMO=1 no `.env`, a Empresa cujo vínculo BIAPI é `DEMO` (as
  // "999.LOJA DEMONSTRAÇÃO…" do gia.config.ts) não chama a BI: devolve contas fictícias
  // no formato do `getGuestChecks`, cobrindo todos os casos que a tela trata. Em produção
  // a variável não existe e nenhum cadastro real tem `DEMO`.
  //
  // RVCs da demonstração (configurados no gia.config.ts):
  // - 101 Restaurante: uma mesa para cada situação e cada detalhe da conta (abaixo);
  // - 102 Varanda: nenhuma conta aberta (estado vazio);
  // - 901/902/903: simulam a BI lenta (504), a credencial recusada (424) e a BI com erro (502).
  const LOCREF_DEMO = 'DEMO'

  /** [miNum, qtd, preço unitário, assento|null, rodada|null, hora] */
  type LinhaDemo = [number, number, number, number | null, number | null, string]
  interface MesaDemo {
    caso: string
    mesa: string
    grupo?: number
    pessoas: number
    garcom?: number | null
    rodadas?: number
    impressa?: boolean
    desconto?: number
    pago?: number
    abertura: string
    linhas: LinhaDemo[]
  }

  // Itens: 500063/500060 couvert artístico; 23001 buffet; 3001 refrigerante; 3010 suco;
  // 4020 caipirinha; 9743 pudim; 777777 item sem nome na BI. Garçom 9999 faz o handler
  // `nomes` falhar (a tela mostra os códigos).
  const MESAS_DEMO: MesaDemo[] = [
    {
      caso: 'tudo lançado',
      mesa: '12',
      pessoas: 2,
      garcom: 1021,
      rodadas: 1,
      abertura: '20:05',
      linhas: [
        [500063, 2, 19.9, 1, 1, '20:07'],
        [23001, 2, 89.9, 1, 1, '20:07'],
        [3001, 2, 8.9, 2, 1, '20:08'],
      ],
    },
    {
      caso: 'couvert sem lançamento',
      mesa: '18',
      pessoas: 3,
      garcom: 1043,
      rodadas: 1,
      abertura: '20:20',
      linhas: [
        [23001, 3, 89.9, 1, 1, '20:22'],
        [3010, 3, 12.9, 2, 1, '20:23'],
      ],
    },
    {
      caso: 'faltam 2 couverts',
      mesa: '22',
      pessoas: 4,
      garcom: 1043,
      rodadas: 3,
      abertura: '19:42',
      linhas: [
        [500063, 1, 19.9, 1, 1, '19:44'],
        [500063, 1, 19.9, 2, 1, '19:44'],
        [23001, 1, 89.9, 1, 1, '19:45'],
        [23001, 1, 89.9, 2, 1, '19:45'],
        [23001, 1, 89.9, 3, 1, '19:45'],
        [23001, 1, 89.9, 4, 1, '19:45'],
        [3001, 1, 8.9, 1, 1, '19:46'],
        [3001, 1, 8.9, 3, 1, '19:46'],
        [3010, 1, 12.9, 4, 1, '19:46'],
        [4020, 2, 24.9, 1, 2, '20:15'],
        [9743, 1, 18.9, 3, 3, '21:05'],
        [9743, 1, 18.9, 4, 3, '21:05'],
      ],
    },
    {
      caso: '1 couvert a mais, grupo 2',
      mesa: '45',
      grupo: 2,
      pessoas: 3,
      garcom: 1055,
      rodadas: 2,
      abertura: '19:10',
      linhas: [
        [500063, 4, 19.9, 1, 1, '19:12'],
        [23001, 3, 89.9, 1, 1, '19:12'],
        [3010, 3, 12.9, 2, 2, '19:40'],
      ],
    },
    {
      caso: 'sem pessoas, nada lançado',
      mesa: '81',
      pessoas: 0,
      garcom: 1055,
      rodadas: 1,
      abertura: '21:00',
      linhas: [[3010, 1, 12.9, 1, 1, '21:02']],
    },
    {
      caso: 'sem pessoas, com couvert',
      mesa: '82',
      pessoas: 0,
      garcom: 1021,
      rodadas: 1,
      abertura: '20:58',
      linhas: [[500063, 2, 19.9, 1, 1, '21:00']],
    },
    {
      caso: 'sem pessoas, com buffet',
      mesa: '83',
      pessoas: 0,
      garcom: 1043,
      rodadas: 1,
      abertura: '20:55',
      linhas: [[23001, 1, 89.9, 1, 1, '20:56']],
    },
    {
      caso: 'buffet sem lançamento',
      mesa: '31',
      pessoas: 2,
      garcom: 1021,
      rodadas: 2,
      abertura: '20:30',
      linhas: [
        [500063, 2, 19.9, 1, 1, '20:31'],
        [4020, 2, 24.9, 2, 2, '20:50'],
      ],
    },
    {
      caso: 'falta 1 buffet',
      mesa: '60',
      pessoas: 6,
      garcom: 1043,
      rodadas: 2,
      abertura: '20:12',
      linhas: [
        [500060, 6, 19.9, 1, 1, '20:14'],
        [23001, 5, 89.9, 1, 1, '20:14'],
        [3001, 6, 8.9, 3, 2, '20:40'],
      ],
    },
    {
      caso: 'couvert e buffet faltando',
      mesa: '61',
      pessoas: 2,
      garcom: 1055,
      rodadas: 1,
      abertura: '20:40',
      linhas: [
        [500063, 1, 19.9, 1, 1, '20:41'],
        [3001, 2, 8.9, 1, 1, '20:41'],
      ],
    },
    {
      caso: 'mesa grande, faltam 3',
      mesa: '120',
      pessoas: 10,
      garcom: 1021,
      rodadas: 3,
      abertura: '19:30',
      linhas: [
        [500063, 7, 19.9, 1, 1, '19:32'],
        [23001, 10, 89.9, 1, 1, '19:33'],
        [4020, 6, 24.9, 2, 2, '20:05'],
        [9743, 4, 18.9, 5, 3, '21:00'],
      ],
    },
    {
      caso: 'pré-conta impressa, desconto e pagamento parcial',
      mesa: '303',
      pessoas: 2,
      garcom: 1043,
      rodadas: 2,
      impressa: true,
      desconto: 20,
      pago: 150,
      abertura: '19:05',
      linhas: [
        [500063, 2, 19.9, 1, 1, '19:06'],
        [23001, 2, 89.9, 1, 1, '19:06'],
        [9743, 2, 18.9, 2, 2, '20:30'],
      ],
    },
    {
      caso: 'estorno de couvert (linha negativa)',
      mesa: '310',
      pessoas: 1,
      garcom: 1055,
      rodadas: 1,
      abertura: '20:10',
      linhas: [
        [500063, 2, 19.9, 1, 1, '20:11'],
        [500063, -1, 19.9, 1, 1, '20:12'],
        [23001, 1, 89.9, 1, 1, '20:11'],
      ],
    },
    {
      caso: 'conta acabou de abrir, sem itens',
      mesa: '404',
      pessoas: 2,
      garcom: 1021,
      rodadas: 0,
      abertura: '21:10',
      linhas: [],
    },
    {
      caso: 'itens sem assento e item sem nome na BI',
      mesa: '505',
      pessoas: 2,
      garcom: 1043,
      rodadas: 1,
      abertura: '20:50',
      linhas: [
        [500063, 2, 19.9, null, null, '20:51'],
        [23001, 2, 89.9, null, 1, '20:51'],
        [777777, 1, 35, null, 1, '20:52'],
      ],
    },
    {
      caso: 'nomes não chegam (falha no handler nomes)',
      mesa: '700',
      pessoas: 2,
      garcom: 9999,
      rodadas: 1,
      abertura: '20:25',
      linhas: [
        [500063, 2, 19.9, 1, 1, '20:26'],
        [23001, 2, 89.9, 1, 1, '20:26'],
      ],
    },
    {
      caso: 'conta sem garçom',
      mesa: '701',
      pessoas: 2,
      garcom: null,
      rodadas: 1,
      abertura: '20:35',
      linhas: [
        [500063, 2, 19.9, 1, 1, '20:36'],
        [23001, 2, 89.9, 2, 1, '20:36'],
      ],
    },
    {
      caso: 'nome de mesa longo',
      mesa: 'VIP Lounge 12',
      pessoas: 4,
      garcom: 1055,
      rodadas: 1,
      abertura: '20:00',
      linhas: [
        [500063, 4, 19.9, 1, 1, '20:02'],
        [23001, 4, 89.9, 1, 1, '20:02'],
      ],
    },
  ]

  const r2 = (v: number) => Math.round(v * 100) / 100

  const ITEM_BUFFET_DEMO = 23001

  function contasDemo(rvc: number, temBuffet: boolean): Json[] {
    if (rvc === 901) {
      throw new HttpError(
        504,
        'A BI do Simphony demorou demais para responder. Tente atualizar de novo.'
      )
    }
    if (rvc === 902) {
      throw new HttpError(
        424,
        'A BI do Simphony recusou a credencial do portal (código 401). Avise o time do Portal GIA.'
      )
    }
    if (rvc === 903)
      throw new HttpError(502, 'A BI do Simphony não conseguiu responder agora (código 500).')
    if (rvc !== 101) return [] // 102 Varanda: nenhuma conta aberta
    // As horas das contas são de um turno fictício que está em 21:15; andam junto com o
    // relógio (21:15 = agora em São Paulo) para o "aberta há" fazer sentido a qualquer hora.
    const sp = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'America/Sao_Paulo',
      dateStyle: 'short',
      timeStyle: 'medium',
    }).format(new Date())
    const agora = Date.parse(`${sp.replace(' ', 'T')}Z`)
    const h = (hm: string) => {
      const [hh, mm] = hm.split(':').map(Number)
      const atras = (21 * 60 + 15 - (hh * 60 + mm)) * 60_000
      return new Date(agora - atras).toISOString().slice(0, 19)
    }
    // Loja sem buffet não vende buffet: as contas dela vêm sem esses itens.
    const daLoja = MESAS_DEMO.map((m) =>
      temBuffet ? m : { ...m, linhas: m.linhas.filter(([miNum]) => miNum !== ITEM_BUFFET_DEMO) }
    )
    return daLoja.map((m, i) => {
      const sub = r2(m.linhas.reduce((s, l) => s + l[1] * l[2], 0))
      const desconto = m.desconto ?? 0
      const taxa = r2((sub - desconto) * 0.1)
      const total = r2(sub - desconto + taxa)
      const pago = m.pago ?? 0
      const ultima = m.linhas.length ? m.linhas[m.linhas.length - 1][5] : m.abertura
      return {
        guestCheckId: 900000 + i,
        chkNum: 2930 + i,
        tblName: m.mesa,
        tblNum: m.grupo ?? 1,
        gstCnt: m.pessoas,
        empNum: m.garcom === undefined ? 1021 : m.garcom,
        numSrvcRd: m.rodadas ?? 1,
        numChkPrntd: m.impressa ? 1 : 0,
        opnLcl: h(m.abertura),
        lastTransLcl: h(ultima),
        subTtl: sub,
        dscTtl: desconto,
        svcChgTtl: taxa,
        autoSvcTtl: taxa, // a BI repete a taxa aqui; o handler não pode somar os dois
        chkTtl: total,
        payTtl: pago,
        balDueTtl: r2(total - pago),
        detailLines: [
          ...m.linhas.map(([miNum, qtd, unit, assento, rodada, hora]) => ({
            menuItem: { miNum },
            dspQty: qtd,
            dspTtl: r2(qtd * unit),
            seatNum: assento,
            svcRndNum: rodada,
            detailLcl: h(hora),
          })),
          { serviceCharge: {}, dspQty: 0, dspTtl: taxa }, // linha sem item: fica de fora
        ],
      }
    })
  }

  /** POST numa rota da BI. Erros com status e frase curta; o detalhe fica no log. */
  async function bi(
    ctx: ServerContext<Body>,
    rota: string,
    corpo: Json,
    limite = TIMEOUT_MS
  ): Promise<Json> {
    const { baseUrl, token } = await ctx.credencial(INTEGRACAO)
    let r: Response
    try {
      r = await fetch(`${baseUrl.replace(/\/+$/, '')}/${rota}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(corpo),
        signal: AbortSignal.timeout(limite),
      })
    } catch (e) {
      if (e instanceof Error && (e.name === 'TimeoutError' || e.name === 'AbortError')) {
        throw new HttpError(
          504,
          'A BI do Simphony demorou demais para responder. Tente atualizar de novo.'
        )
      }
      console.error(`[couvert] falha de rede ao chamar a BI do Simphony (${rota}):`, e)
      throw new HttpError(502, 'A BI do Simphony não respondeu agora. Tente atualizar de novo.')
    }
    if (r.status === 401 || r.status === 403) {
      console.error(`[couvert] BI do Simphony recusou a credencial (${rota}):`, r.status)
      throw new HttpError(
        424,
        `A BI do Simphony recusou a credencial do portal (código ${r.status}). Avise o time do Portal GIA.`
      )
    }
    if (!r.ok) {
      console.error(
        `[couvert] BI do Simphony respondeu com erro (${rota}):`,
        r.status,
        await r.text().catch(() => '')
      )
      throw new HttpError(502, `A BI do Simphony não conseguiu responder agora (código ${r.status}).`)
    }
    try {
      return (await r.json()) as Json
    } catch (e) {
      console.error(`[couvert] resposta da BI do Simphony não é JSON (${rota}):`, e)
      throw new HttpError(502, 'A BI do Simphony devolveu uma resposta que não deu para ler.')
    }
  }

  const __giaHandler = defineHandler<Body, Resposta>(async (ctx) => {
    await ctx.requirePermission('couvert.ler')
    const empresaId = Number(ctx.body?.empresaId)
    const rvc = Number(ctx.body?.rvc)
    if (!Number.isInteger(empresaId) || empresaId <= 0) throw new HttpError(422, 'Escolha a loja.')
    if (!Number.isInteger(rvc) || rvc <= 0) throw new HttpError(422, 'Escolha o RVC (salão).')
    await ctx.requireEmpresa(empresaId)

    const empresa = (await ctx.empresas()).find((e) => e.id === empresaId)
    const locRef = empresa?.locRefs?.BIAPI?.trim()
    if (!empresa || !locRef) {
      throw new HttpError(
        422,
        'Esta loja não tem vínculo com a BI do Simphony no cadastro do portal. Avise o time do Portal GIA.'
      )
    }
    const config = empresa.couvert ?? { programacao: [], buffet: [], rvcs: [] }
    // O body é palpite: o RVC tem de ser um dos configurados para a loja.
    if (!config.rvcs.some((r) => r.numero === rvc)) {
      throw new HttpError(422, 'Este RVC não está configurado para a loja. Escolha outro salão.')
    }
    if (config.programacao.length === 0) {
      throw new HttpError(
        422,
        'A loja não tem itens de couvert artístico configurados no cadastro. Avise o time do Portal GIA.'
      )
    }

    if (locRef === LOCREF_DEMO && envOptional('GIA_DEV_COUVERT_DEMO') !== '1') {
      throw new HttpError(
        422,
        'A loja de demonstração só funciona no gia dev com GIA_DEV_COUVERT_DEMO=1 no .env. Defina a variável e reinicie o gia dev.'
      )
    }
    if (locRef === LOCREF_DEMO) {
      const dia = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(
        new Date()
      )
      return {
        dia,
        consultadoEm: new Date().toISOString(),
        temBuffet: config.buffet.length > 0,
        mesas: montarMesas(
          contasDemo(rvc, config.buffet.length > 0),
          new Set(config.programacao),
          new Set(config.buffet)
        ),
      }
    }

    const ultimo = await bi(ctx, 'getLatestBusDt', { locRef }, TIMEOUT_DIA_MS)
    const dia = String(ultimo.latestBusDt ?? '').slice(0, 10)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dia)) {
      console.error('[couvert] getLatestBusDt sem latestBusDt:', ultimo)
      throw new HttpError(502, 'A BI do Simphony não informou o dia de negócio da loja.')
    }
    const resposta = await bi(ctx, 'getGuestChecks', {
      locRef,
      busDt: dia,
      searchCriteria: `where equals(guestChecks.clsdFlag,false) AND equals(guestChecks.rvcNum,${rvc})`,
    })
    const contas = Array.isArray(resposta.guestChecks) ? resposta.guestChecks : []

    return {
      dia,
      consultadoEm: new Date().toISOString(),
      temBuffet: config.buffet.length > 0,
      mesas: montarMesas(contas, new Set(config.programacao), new Set(config.buffet)),
    }
  })


  return __giaHandler
})() as ServerHandler<unknown, unknown>

// ─── src/server/nomes.ts ────────────────────────────────────────────────
__giaHandlers["nomes"] = (() => {

  // Nomes para o detalhe da mesa: a conta da BI traz só o código do item (`miNum`) e o
  // número do garçom (`empNum`). Chamado pela tela só ao abrir o detalhe de uma mesa
  // (não pesa a pesquisa), uma vez por loja enquanto a tela está aberta.
  //
  // - itens: `getMenuItemDimensions` { locRef } → `menuItems[]` { num, name }
  //   (medido em 19/11/2026: ~9 mil itens, ~10 s);
  // - garçons: `getEmployeeDimensions` { locRef } → `employees[]` { num, fName, lName }.
  // Devolve só os códigos pedidos. O garçom vai como "Nome S." (primeiro nome e a inicial
  // do sobrenome), o bastante para o salão reconhecer.
  //
  // REGRA: handler auto-contido — só importa de @gia-cb/sdk/server.

  const INTEGRACAO = 'simphony-bi'
  const TIMEOUT_MS = 120_000
  const MAX_CODIGOS = 500
  const LOCREF_DEMO = 'DEMO'

  interface Body {
    empresaId: number
    itens: number[]
    garcons: number[]
  }

  interface Resposta {
    itens: Record<string, string>
    garcons: Record<string, string>
  }

  type Json = Record<string, unknown>

  const codigos = (v: unknown): number[] =>
    Array.isArray(v)
      ? [...new Set(v.map(Number).filter((n) => Number.isInteger(n) && n > 0))].slice(0, MAX_CODIGOS)
      : []

  async function bi(ctx: ServerContext<Body>, rota: string, corpo: Json): Promise<Json> {
    const { baseUrl, token } = await ctx.credencial(INTEGRACAO)
    let r: Response
    try {
      r = await fetch(`${baseUrl.replace(/\/+$/, '')}/${rota}`, {
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
        throw new HttpError(504, 'A BI do Simphony demorou demais para mandar os nomes dos itens.')
      }
      console.error(`[couvert] falha de rede ao chamar a BI do Simphony (${rota}):`, e)
      throw new HttpError(502, 'A BI do Simphony não respondeu agora. Tente de novo.')
    }
    if (r.status === 401 || r.status === 403) {
      console.error(`[couvert] BI do Simphony recusou a credencial (${rota}):`, r.status)
      throw new HttpError(
        424,
        `A BI do Simphony recusou a credencial do portal (código ${r.status}). Avise o time do Portal GIA.`
      )
    }
    if (!r.ok) {
      console.error(
        `[couvert] BI do Simphony respondeu com erro (${rota}):`,
        r.status,
        await r.text().catch(() => '')
      )
      throw new HttpError(502, `A BI do Simphony não conseguiu responder agora (código ${r.status}).`)
    }
    try {
      return (await r.json()) as Json
    } catch (e) {
      console.error(`[couvert] resposta da BI do Simphony não é JSON (${rota}):`, e)
      throw new HttpError(502, 'A BI do Simphony devolveu uma resposta que não deu para ler.')
    }
  }

  /** "RAFAEL SOUZA" → "Rafael S." */
  function nomeCurto(primeiro: unknown, sobrenome: unknown): string {
    const cap = (t: string) =>
      t.toLocaleLowerCase('pt-BR').replace(/(^|\s)\S/g, (c) => c.toUpperCase())
    const p = cap(
      String(primeiro ?? '')
        .trim()
        .split(/\s+/)[0] ?? ''
    )
    const s = String(sobrenome ?? '').trim()
    return [p, s ? `${s[0].toUpperCase()}.` : ''].filter(Boolean).join(' ')
  }

  const DEMO_ITENS: Record<number, string> = {
    500060: 'Prog Art 2',
    500063: 'Program Artistic',
    23001: 'Buffet',
    3001: 'Refrigerante Lata',
    3010: 'Suco de Laranja',
    4020: 'Caipirinha Limão',
    9743: 'Pudim Buffet',
  }
  const DEMO_GARCONS: Record<number, string> = { 1021: 'Ana P.', 1043: 'Rafael S.', 1055: 'Bruno T.' }

  const __giaHandler = defineHandler<Body, Resposta>(async (ctx) => {
    await ctx.requirePermission('couvert.ler')
    const empresaId = Number(ctx.body?.empresaId)
    if (!Number.isInteger(empresaId) || empresaId <= 0) throw new HttpError(422, 'Escolha a loja.')
    await ctx.requireEmpresa(empresaId)
    const empresa = (await ctx.empresas()).find((e) => e.id === empresaId)
    const locRef = empresa?.locRefs?.BIAPI?.trim()
    if (!locRef) {
      throw new HttpError(
        422,
        'Esta loja não tem vínculo com a BI do Simphony no cadastro do portal.'
      )
    }
    const pedidosItens = codigos(ctx.body?.itens)
    const pedidosGarcons = codigos(ctx.body?.garcons)
    const resposta: Resposta = { itens: {}, garcons: {} }

    if (locRef === LOCREF_DEMO && envOptional('GIA_DEV_COUVERT_DEMO') !== '1') {
      throw new HttpError(
        422,
        'A loja de demonstração só funciona no gia dev com GIA_DEV_COUVERT_DEMO=1 no .env. Defina a variável e reinicie o gia dev.'
      )
    }
    if (locRef === LOCREF_DEMO) {
      // Garçom 9999 (mesa 700 da demonstração): simula a falha da BI ao buscar os nomes.
      if (pedidosGarcons.includes(9999)) {
        throw new HttpError(502, 'A BI do Simphony não conseguiu responder agora (código 500).')
      }
      for (const n of pedidosItens) if (DEMO_ITENS[n]) resposta.itens[n] = DEMO_ITENS[n]
      for (const n of pedidosGarcons) if (DEMO_GARCONS[n]) resposta.garcons[n] = DEMO_GARCONS[n]
      return resposta
    }

    const [menu, equipe] = await Promise.all([
      pedidosItens.length ? bi(ctx, 'getMenuItemDimensions', { locRef }) : null,
      pedidosGarcons.length ? bi(ctx, 'getEmployeeDimensions', { locRef }) : null,
    ])
    const querItens = new Set(pedidosItens)
    for (const i of Array.isArray(menu?.menuItems) ? (menu.menuItems as Json[]) : []) {
      const n = Number(i.num)
      if (querItens.has(n) && typeof i.name === 'string') resposta.itens[n] = i.name.trim()
    }
    const querGarcons = new Set(pedidosGarcons)
    for (const g of Array.isArray(equipe?.employees) ? (equipe.employees as Json[]) : []) {
      const n = Number(g.num)
      if (querGarcons.has(n)) resposta.garcons[n] = nomeCurto(g.fName, g.lName)
    }
    return resposta
  })


  return __giaHandler
})() as ServerHandler<unknown, unknown>

const __MODULE_ID = "couvert"
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
