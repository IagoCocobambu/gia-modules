import { defineHandler, HttpError, sql } from '@gia-cb/sdk/server'

// Contas fechadas do Simphony de UMA loja num período, lidas do DW (schema
// simphony_api_bi). O DW não tem homologação: hom e prod leem o mesmo armazém —
// este handler só LÊ.
//
// REGRA: handler auto-contido — só importa de @gia-cb/sdk/server. As funções de
// data abaixo se repetem em notas.ts de propósito.

interface Body {
  empresaId: number
  de: string
  ate: string
}

interface Check {
  Loja: string
  Check_id: number
  Check_Number: number
  Hora_Fechamento_Conta: string
  Bus_Date: string
  Revenue_Center: string | null
  Order_Type_Number: number | null
  Order_Type_Name: string | null
  Total_Pagamento: number
  Service_Charge: number
  Total_Void: number
}

interface Resposta {
  contas: Check[]
  periodoFechado: boolean | null
  temMovimento: boolean
}

const MAX_DIAS_PERIODO = 31
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
  if (Number.isNaN(Date.parse(de)) || Number.isNaN(Date.parse(ate))) {
    throw new HttpError(422, 'Data inválida.')
  }
  if (de > ate) throw new HttpError(422, 'A data inicial não pode ser maior que a data final.')
  if (diasEntre(de, ate) + 1 > MAX_DIAS_PERIODO) {
    throw new HttpError(
      422,
      `O intervalo de datas não pode ser maior que ${MAX_DIAS_PERIODO} dias.`
    )
  }
  return { de, ate }
}

export default defineHandler<Body, Resposta>(async (ctx) => {
  await ctx.requirePermission('validacao-fiscal.ler')
  const empresaId = Number(ctx.body.empresaId)
  if (!Number.isInteger(empresaId)) throw new HttpError(422, 'Informe a loja.')
  await ctx.requireEmpresa(empresaId)
  const { de, ate } = validarPeriodo(ctx.body.de, ctx.body.ate)

  const empresa = (await ctx.empresas()).find((e) => e.id === empresaId)
  const locRefBi = empresa?.locRefs.BIAPI
  if (!locRefBi) throw new HttpError(422, 'Esta loja não tem vínculo com a BI do Simphony.')

  // Etapa 1 — a grafia exata do loc_ref no armazém (caixa/espaços variam). Resolve na
  // tabela pequena e usa por igualdade na grande: lower() na guest_check desliga o índice.
  const dias = await sql<{ loc_ref: string; eod_closed: boolean | null }[]>`
    select loc_ref, bool_and(eod_closed) as eod_closed
      from simphony_api_bi.operations_daily_totals
     where lower(loc_ref) = ${locRefBi.toLowerCase()}
       and bus_date between ${de}::date and ${ate}::date
     group by loc_ref`
  const locRef = dias[0]?.loc_ref
  if (!locRef) return { contas: [], periodoFechado: null, temMovimento: false }

  // Etapa 2 — as contas, já no formato da regra. closed_local sai como TEXTO: é
  // timestamp sem fuso (hora da loja), igual a Hora_Criacao_Nota da nota. Devolvido
  // cru, o driver aplicaria o fuso do servidor e a janela de horas erraria em 3 h.
  const contas = await sql<Check[]>`
    select g.loc_ref                                          as "Loja",
           g.guest_check_id                                   as "Check_id",
           g.check_number                                     as "Check_Number",
           to_char(g.closed_local, 'YYYY-MM-DD"T"HH24:MI:SS') as "Hora_Fechamento_Conta",
           g.closed_bus_date::text                            as "Bus_Date",
           rc.name                                            as "Revenue_Center",
           g.order_type_number                                as "Order_Type_Number",
           ot.name                                            as "Order_Type_Name",
           coalesce(g.payment_total, 0)::float8               as "Total_Pagamento",
           coalesce(g.service_charge_total, 0)::float8        as "Service_Charge",
           coalesce(g.void_total, 0)::float8                  as "Total_Void"
      from simphony_api_bi.guest_check g
      left join simphony_api_bi.revenue_centers rc
             on rc.loc_ref = g.loc_ref and rc.rvc_number = g.rvc_number
      left join simphony_api_bi.order_types ot
             on ot.loc_ref = g.loc_ref and ot.rvc_number = g.rvc_number
            and ot.ot_num = g.order_type_number
     where g.loc_ref = ${locRef}
       and g.closed_bus_date between ${de}::date and ${ate}::date
       and coalesce(g.cancel_flag, false) = false
     order by g.closed_local`

  return {
    contas: contas.map((c) => ({ ...c, Check_id: Number(c.Check_id) })),
    periodoFechado: dias.every((d) => d.eod_closed === true),
    temMovimento: true,
  }
})

export const config = { secrets: ['GIA_SERVER_DATABASE_URL'] }
