import { defineHandler, HttpError, sql } from '@gia-cb/sdk/server'

// Histórico das gravações do fechamento de uma loja/mês, da mais recente para a
// mais antiga: quem salvou, quando e o antes → depois (`ifood_fechamento.historico`,
// gravado pelo handler `salvar` na mesma transação). Quem consulta o fechamento
// (`.ler`) vê o histórico.
//
// REGRA: handler auto-contido — só importa de @gia-cb/sdk/server.

interface Body {
  /** `operacao_ref` da loja escolhida. */
  operacaoRef: string
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
  /** Operação em que a gravação foi feita (`02 cb` e `02 vst` dividem o fechamento). */
  operacaoRef: string | null
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

/** Número da loja com 2 dígitos a partir do `operacao_ref` ("02 cb" → "02"). */
function numeroDaOperacao(ref: string): string | null {
  const m = /^\s*(\d{1,4})/.exec(ref)
  return m ? String(Number(m[1])).padStart(2, '0') : null
}

/** Erro do banco não vai cru para a tela (detalhe no log do servidor). */
/**
 * Falha do banco/conexão (o postgres.js põe um `code`: SQLSTATE como "42P01" ou de
 * rede como "ECONNREFUSED"). Outro erro é bug do código e segue como 500.
 */
function ehFalhaDoBanco(e: unknown): boolean {
  return typeof (e as { code?: unknown } | null)?.code === 'string'
}

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

export default defineHandler<Body, Resposta>(async (ctx) => {
  try {
    await ctx.requirePermission('fechamento-ifood-mensal.ler')
    const operacao = await ctx.requireOperacao(String(ctx.body.operacaoRef ?? '').trim())
    const locRef = numeroDaOperacao(operacao.ref)
    if (!locRef) {
      throw new HttpError(
        422,
        `A operação "${operacao.nome}" (${operacao.ref}) não começa pelo número da loja.`
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
        operacao_ref: string | null
        alteracoes: unknown
      }>
    >`
      SELECT id::text,
        to_char(gravado_em AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS gravado_em,
        autor_nome, operacao_ref, alteracoes
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
        operacaoRef: l.operacao_ref,
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
