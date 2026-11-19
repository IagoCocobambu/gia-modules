import { defineHandler, HttpError, sql } from '@gia-cb/sdk/server'

// Histórico das gravações do fechamento de uma loja/mês, da mais recente para a
// mais antiga: quem salvou, quando e o antes → depois (`fechamento_99food.historico`,
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
  console.error('[fechamento-99food-mensal] erro ao ler o histórico no banco:', e)
  const code = (e as { code?: string } | null)?.code
  if (code === '42P01' || code === '3F000') {
    throw new HttpError(
      503,
      'O histórico ainda não está disponível: o banco do Maestro ainda não está preparado para o Fechamento 99Food Mensal. Avise o suporte.'
    )
  }
  throw new HttpError(
    503,
    'Não foi possível ler o histórico agora (falha no banco de dados). Tente de novo em alguns minutos.'
  )
}

export default defineHandler<Body, Resposta>(async (ctx) => {
  try {
    await ctx.requirePermission('fechamento-99food-mensal.ler')
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
      FROM fechamento_99food.fechamentos_mensais
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
      FROM fechamento_99food.historico
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

export const config = { secrets: ['GIA_SERVER_DATABASE_URL'] }
