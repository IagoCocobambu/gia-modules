import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createServerClient } from '@gia-cb/sdk/server-client'
import { useCanAccess, useUserEmpresaScope } from '@gia-cb/sdk/permissions'
import { supabase, useSupabaseQuery } from '@gia-cb/sdk/supabase'
import type { OperacaoDoEscopo } from '../types'
import { useCadastroDeEmpresas } from './cadastro'

// As operações do escopo com o ESTADO, a REGIÃO DA REDE e o GRUPO (matriz) de
// cada uma.
//
// Os três são do cadastro da EMPRESA, não da operação: o handler `operacoes`
// devolve o `empresaId`, e o cruzamento acontece aqui. Operação cuja empresa não
// tem o dado fica com texto vazio e cai em "Sem estado" / "Sem região" — ela
// nunca some da lista.
//
// O PLANO É POR OPERAÇÃO. O data-warehouse grava o Plano de Contas por `loc_ref`;
// o grupo aqui é só uma ETIQUETA. Duas operações da mesma empresa (08 cb e 08
// vst) caem no mesmo grupo sem precisar do vínculo de matriz, porque dividem o
// `empresaId`.

const server = createServerClient('dashboard-contas')

export interface OperacaoComLocal {
  ref: string
  nome: string
  empresaId: number
  /** Sigla do estado (`GO`). Vazio = não informado. */
  estado: string
  /** Regional da rede (`SPC`). Vazio = não informada. */
  regiao: string
  /** A empresa que manda no grupo: a matriz, ou a própria empresa. */
  grupoId: number
  /** O nome da matriz, para nomear o grupo. */
  nomeDoGrupo: string
}

// ── O SELETOR MOSTRA A REDE, E NÃO SÓ O ESCOPO ──────────────────────────────
//
// Decisão do João (21/09/2026), a mesma do Dashboard de RH: quem abre o painel
// compara a REDE. `ctx.operacoes()` é sempre o escopo de empresa do usuário e a
// SDK não tem modo amplo para LISTAR, então a lista da rede vem do portal.
//
// O handler continua sendo a BASE, e não foi substituído: ele é a resposta com
// autoridade sobre o escopo e é a única que responde no `gia dev`. A rede é o
// ACRÉSCIMO.
//
// ── ☠️ POR QUE UMA RPC, E NÃO A TABELA ──────────────────────────────────────
//
// Até 23/09/2026 isto era um `select` direto em `gia.operacoes`. Não funcionava
// para quem a chave existe para atender: **a tabela tem RLS por escopo**, desde
// a fundação do portal —
//
//   using (has_empresa_access(empresa_id) or check_permission('operacoes.editar'))
//
// — e um diretor de loja lia UMA linha. O cliente não tinha o que acrescentar, e
// o `universoDeLojas` do servidor, que está correto, nunca recebia nada para
// consolidar. Passou em toda validação porque quem valida tem escopo total ou
// `operacoes.editar`, e atravessa a policy: funcionava para quem testava e
// falhava para quem usava (relatado pelo time da GIA em 23/09/2026, depois de
// um diretor de loja com a chave concedida continuar vendo uma loja).
//
// A RPC `public.operacoes_da_rede` é `security definer` e recebe a chave por
// parâmetro. Ela não é um atalho para escopo total: só aceita chave terminada em
// `.ler-rede`, exige que ela exista no catálogo e que o CHAMADOR a tenha — sem a
// chave, devolve vazio.
//
// ⚠️ ISTO NÃO É UM GATE. Quem decide o que o usuário lê é o servidor, que só
// consolida loja de fora do escopo para quem tem a mesma chave (ver
// `universoDeLojas`, nos handlers). O `enabled` daqui existe para a tela não
// pedir o que não viria.
//
// ⚠️ O CADASTRO AINDA VEM DA TABELA. `gia.empresas` tem a mesma RLS por escopo,
// e é de lá que saem estado, região da rede e o vínculo de matriz (ver
// `cadastro.ts`). Para quem não tem escopo total, as lojas da rede chegam sem
// esses três: o seletor lista todas, mas "Por estado", "Por região" e
// "Consolidar matriz e filiais" só enxergam as do escopo. Está pedido ao time da
// GIA — enquanto não vier, é degradação silenciosa e conhecida.

/** O ESCOPO, pelo handler — a base da lista, e a única que responde no dev-shell. */
function useOperacoesDoEscopo() {
  return useQuery({
    queryKey: ['dashboard-contas', 'operacoes', 'escopo'],
    queryFn: () => server.call<OperacaoDoEscopo[]>('operacoes', {}),
    // O escopo muda quando o administrador mexe no acesso — não durante a sessão.
    staleTime: 30 * 60_000,
  })
}

interface LinhaDeOperacao {
  operacao_ref: string
  nome_operacao: string | null
  empresa_id: number
}

/** A REDE, pela RPC do portal — o acréscimo, para quem pode vê-la. */
function useOperacoesDaRede() {
  const { all, empresaIds } = useUserEmpresaScope()
  // O hook é chamado SEMPRE, fora do `||`: dentro dele o curto-circuito pularia
  // a chamada quando o escopo já é total, e a ordem dos hooks mudaria entre
  // renders.
  const lerRede = useCanAccess('dashboard-contas.ler-rede')
  const amplo = all || lerRede

  return useSupabaseQuery<OperacaoDoEscopo[]>({
    // `all` e `empresaIds` na chave mesmo quando `amplo` dispensa o filtro: o
    // escopo pode mudar (impersonação, troca de papel) e a lista tem de virar
    // junto.
    queryKey: ['dashboard-contas', 'operacoes', 'rede', amplo, all, empresaIds],
    // Sem a chave nem escopo total não há nada a acrescentar: a consulta nem sai.
    enabled: amplo,
    staleTime: 30 * 60_000,
    queryFn: async () => {
      // A chave vai no parâmetro, e a função a confere contra quem chama: passar
      // a de outro módulo, ou uma que não termine em `.ler-rede`, devolve vazio.
      const { data, error } = await supabase.rpc('operacoes_da_rede', {
        p_permissao: 'dashboard-contas.ler-rede',
      })
      if (error) throw error
      const linhas = (data as unknown as LinhaDeOperacao[] | null) ?? []
      return linhas.map((o) => ({
        ref: o.operacao_ref,
        nome: o.nome_operacao ?? o.operacao_ref,
        empresaId: o.empresa_id,
      }))
    },
  })
}

/**
 * A lista do seletor: o escopo do usuário, mais a rede para quem pode vê-la.
 *
 * A soma é por `ref` normalizado, e a versão do ESCOPO ganha — ela é a que o
 * servidor confirma. Se a leitura do cadastro falhar ou voltar vazia, sobra o
 * escopo: o painel se comporta como antes, em vez de ficar sem lista.
 */
export function useOperacoes() {
  const escopo = useOperacoesDoEscopo()
  const rede = useOperacoesDaRede()

  const data = useMemo<OperacaoDoEscopo[]>(() => {
    const porRef = new Map<string, OperacaoDoEscopo>()
    for (const o of rede.data ?? []) porRef.set(o.ref.trim().toUpperCase(), o)
    for (const o of escopo.data ?? []) porRef.set(o.ref.trim().toUpperCase(), o)
    return [...porRef.values()].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  }, [escopo.data, rede.data])

  return { data, isLoading: escopo.isLoading, error: escopo.error }
}

/** As lojas que o cliente enxerga, como o servidor as recebe. */
export interface LojaDoPedido {
  ref: string
  nome: string
}

export function useOperacoesComLocal() {
  const operacoes = useOperacoes()
  const cadastro = useCadastroDeEmpresas()

  const data = useMemo<OperacaoComLocal[]>(() => {
    const porId = new Map((cadastro.data ?? []).map((e) => [e.empresaId, e]))
    return (operacoes.data ?? []).map((o) => {
      const empresa = porId.get(o.empresaId)
      const grupoId = empresa?.matrizId ?? o.empresaId
      return {
        ...o,
        estado: empresa?.estado ?? '',
        regiao: empresa?.regiaoCb ?? '',
        grupoId,
        nomeDoGrupo: porId.get(grupoId)?.nome || o.nome,
      }
    })
  }, [operacoes.data, cadastro.data])

  return { data, isLoading: operacoes.isLoading, erro: operacoes.error }
}
