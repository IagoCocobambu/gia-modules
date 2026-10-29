// Tipos do domínio — contas do Simphony (DW, schema simphony_api_bi) cruzadas com
// as notas fiscais (NFC-e) da API do DW. Os nomes dos campos seguem o legado
// (Validação Fiscal v2) pra que a regra de conciliação seja portada sem tradução.

export interface ValidacaoFiscalLoja {
  empresaId: number
  nome: string
  ativo: boolean
}

/** Conta fechada no PDV (Simphony). Horários em hora local da loja, sem fuso. */
export interface Check {
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

/** Nota fiscal (XML) emitida. `Hora_Criacao_Nota` em hora local, sem fuso. */
export interface Invoice {
  Loja: string
  Chave_Acesso: string
  Status: string
  Serie: number
  nNf: number
  Hora_Criacao_Nota: string
  Valor_Nota: number
  Check_Number: number
}

export interface ContasResposta {
  contas: Check[]
  /** `false` quando algum dia do período ainda não teve o fim do dia rodado. */
  periodoFechado: boolean | null
  /** `false` quando a loja não tem movimento na BI no período (ou o vínculo BIAPI está errado). */
  temMovimento: boolean
}

export interface NotasResposta {
  notas: Invoice[]
  /** Nome da loja como vem nas notas ("01. CB Goiania") — o mesmo exibido no legado. */
  loja: string | null
}

export type ValidationStatus =
  'OK' | 'CHECK_SEM_XML' | 'XML_SEM_CONTA' | 'DUPLICIDADE' | 'DIVERGENCIA_VALOR'

export interface ValidationResult {
  /** `C-<Check_id>` ou `I-<Chave_Acesso>`. */
  id: string
  check?: Check
  mainInvoice?: Invoice
  duplicateInvoices: Invoice[]
  status: ValidationStatus
  /** `Total_Pagamento − Valor_Nota` da principal (ou −Valor_Nota na nota sem conta). */
  valueDifference: number
  /** Diferença em R$ da linha considerando também as duplicadas — soma = card Diferença. */
  saldo: number
  /** Nome da loja (coluna "Loja / Check"). */
  loja: string
  checkNumber: number
  date: string
}

export interface SummaryStats {
  totalSystem: number
  countSystem: number
  totalFiscal: number
  countFiscal: number
  difference: number
  countOk: number
  countErrors: number
  countWarnings: number
}

/** Parâmetros congelados no clique em "Pesquisar". */
export interface Consulta {
  empresaId: number
  lojaNome: string
  de: string
  ate: string
  janelaAntes: number
  janelaApos: number
}

export type FiltroStatus = 'TODOS' | 'ERROS' | ValidationStatus
