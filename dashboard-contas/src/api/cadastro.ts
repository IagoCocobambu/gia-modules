import { useMemo } from 'react'
import { useCanAccess } from '@gia-cb/sdk/permissions'
import { supabase, useSupabaseQuery } from '@gia-cb/sdk/supabase'

// O cadastro de empresas com o que o painel precisa e o hook da SDK não entrega:
// a REGIÃO DA REDE e o VÍNCULO DE MATRIZ.
//
// ── POR QUE UMA CONSULTA DIRETA, E NÃO O `useEmpresas` ──────────────────────
//
// O `useEmpresas` do `@gia-cb/sdk/empresas` pede uma lista FIXA de colunas
// (conferido na alpha.60, `@gia-cb/sdk/dist/empresas/index.js`):
//
//   empresa_id, nome_fantasia, razao_social, cnpj, cidade, estado, regiao,
//   operacao, ativo, tipo_registro
//
// Faltam duas coisas que este painel usa:
//
//   • `regiao_cb` — a regional da rede (NCO, NE, SPC, SPISE, SUL). É a região do
//     HTML que especifica o módulo, e NÃO é a `regiao` do hook, que é a do IBGE
//     (NORDESTE, SUDESTE…): SPC e SPISE são as duas metades de São Paulo e o
//     Sudeste, e o IBGE não as separa;
//   • `is_matriz` / `empresa_matriz_id` — o grupo de matriz e filiais, para
//     "Colunas por: Matriz e filiais" na aba Comparativos.
//
// Ler a tabela direto é o que o Dashboard de RH (`api/cadastro.ts`), o Combos e
// o Vouchers já fazem, com o mesmo cliente da SDK. O estado vem junto, para não
// fazer duas consultas à mesma tabela.
//
// ── O QUE ESTA CONSULTA NÃO FAZ ─────────────────────────────────────────────
//
// Não lista unidade: a lista do painel vem do handler `operacoes`
// (`ctx.operacoes()`), o escopo que o servidor sabe consultar. Aqui só se busca o
// cadastro de cada empresa, indexado por `empresa_id`.
//
// ⚠️ O mock do dev-shell não emula o header de schema: o `gia dev` não prova esta
// consulta. Mudança aqui só se valida sondando o Supabase de homologação
// (conferida em 18/09/2026: 98 empresas, `regiao_cb` preenchida em 95).
//
// ── ☠️ A TABELA SÓ DEVOLVE O ESCOPO ─────────────────────────────────────────
//
// `gia.empresas` tem RLS por escopo — `empresa_id in (select
// empresas_do_usuario())` —, igual à de `gia.operacoes`. Quem não tem escopo
// total lê só as próprias empresas, e as lojas da REDE chegariam sem estado, sem
// região e sem vínculo de matriz: o seletor listaria todas, mas "Por estado",
// "Por região" e "Consolidar matriz e filiais" enxergariam só o escopo — sem a
// tela acusar nada (relatado pelo time da GIA em 23/09/2026, junto com o mesmo
// defeito na lista de operações).
//
// Por isso são DUAS leituras, no mesmo desenho da lista de operações:
//
//   • a TABELA é a base — devolve o escopo e responde para todo mundo, com ou
//     sem chave;
//   • a RPC `public.empresas_da_rede` é o ACRÉSCIMO — devolve a rede inteira, e
//     só para quem tem `dashboard-contas.ler-rede`.
//
// Não é a RPC sozinha porque ela exige a chave: quem tem escopo total e NÃO tem
// a chave (ou um ambiente sem a função) perderia o cadastro que hoje enxerga.
// Juntando as duas, ninguém regride.

export interface EmpresaDoCadastro {
  empresaId: number
  nome: string
  /** Sigla do estado, em maiúsculas. Vazio = não informado. */
  estado: string
  /** Regional da rede (NCO, NE, SPC, SPISE, SUL). Vazio = não informada. */
  regiaoCb: string
  /** `true` na matriz; cadastro sem a flag conta como matriz. */
  matriz: boolean
  /** A matriz da filial; `null` na matriz. */
  matrizId: number | null
}

interface LinhaDoCadastro {
  empresa_id: number
  nome_fantasia: string | null
  estado: string | null
  regiao_cb: string | null
  is_matriz: boolean | null
  empresa_matriz_id: number | null
}

/** A linha do cadastro como o painel a usa — a mesma para a tabela e a RPC. */
function paraEmpresa(l: LinhaDoCadastro): EmpresaDoCadastro {
  return {
    empresaId: l.empresa_id,
    nome: (l.nome_fantasia ?? '').trim(),
    estado: (l.estado ?? '').trim().toUpperCase(),
    regiaoCb: (l.regiao_cb ?? '').trim().toUpperCase(),
    // Cadastro sem a flag conta como matriz: a operação nunca some do painel por
    // falta de dado — ela só deixa de ter grupo.
    matriz: l.is_matriz !== false,
    matrizId: l.empresa_matriz_id ?? null,
  }
}

/** O ESCOPO, pela tabela — a base, e a única que responde sem a chave. */
function useCadastroDoEscopo() {
  return useSupabaseQuery<EmpresaDoCadastro[]>({
    queryKey: ['dashboard-contas', 'cadastro-empresas'],
    // O cadastro muda quando abre loja, não durante a sessão.
    staleTime: 30 * 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        // `empresas` vive no schema `gia`, NÃO em `public`. Sem o `.schema(...)`
        // o PostgREST resolve em `public` e devolve 404 — e no dev-shell passa.
        .schema('gia')
        .from('empresas')
        .select('empresa_id, nome_fantasia, estado, regiao_cb, is_matriz, empresa_matriz_id')
        .eq('tipo_registro', 'empresa')
        .is('deleted_at', null)
      if (error) throw error

      const linhas = (data as unknown as LinhaDoCadastro[] | null) ?? []
      return linhas.map(paraEmpresa)
    },
  })
}

/** A REDE, pela RPC do portal — o acréscimo, para quem pode vê-la. */
function useCadastroDaRede() {
  const lerRede = useCanAccess('dashboard-contas.ler-rede')

  return useSupabaseQuery<EmpresaDoCadastro[]>({
    queryKey: ['dashboard-contas', 'cadastro-empresas', 'rede', lerRede],
    // Sem a chave a função devolve vazio de qualquer forma: nem chama.
    enabled: lerRede,
    staleTime: 30 * 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('empresas_da_rede', {
        p_permissao: 'dashboard-contas.ler-rede',
      })
      if (error) throw error
      const linhas = (data as unknown as LinhaDoCadastro[] | null) ?? []
      return linhas.map(paraEmpresa)
    },
  })
}

/**
 * O cadastro que o painel usa: o escopo, mais a rede para quem pode vê-la.
 *
 * A versão do ESCOPO ganha no empate — ela vem da tabela, que é a fonte, e não
 * de uma função que pode ficar para trás. Se a RPC falhar ou não existir no
 * ambiente, sobra o escopo: o painel se comporta como antes.
 */
export function useCadastroDeEmpresas() {
  const escopo = useCadastroDoEscopo()
  const rede = useCadastroDaRede()

  const data = useMemo<EmpresaDoCadastro[]>(() => {
    const porId = new Map<number, EmpresaDoCadastro>()
    for (const e of rede.data ?? []) porId.set(e.empresaId, e)
    for (const e of escopo.data ?? []) porId.set(e.empresaId, e)
    return [...porId.values()]
  }, [escopo.data, rede.data])

  return { data, isLoading: escopo.isLoading, error: escopo.error }
}
