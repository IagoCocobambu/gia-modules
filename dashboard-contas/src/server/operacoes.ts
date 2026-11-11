import { defineHandler } from '@gia-cb/sdk/server'

// Handler BFF — a lista de operações do escopo do usuário, e só ela.
//
// O painel abre SEM operação marcada: o usuário escolhe o que quer ver antes de
// o módulo buscar qualquer número (o mesmo arranjo do Dashboard de RH). Mas o
// seletor precisa da lista para existir, e buscá-la de carona na matriz do mês
// seria pagar ~150 KB só para montar o seletor.
//
// Aqui não há consulta ao data-warehouse: a lista é o `ctx.operacoes()`, o mesmo
// escopo que o `contas` usa para recortar. As duas nunca divergem — a operação
// que aparece no seletor é exatamente a que o painel sabe consultar.
//
// O `empresaId` desce junto porque é por ele que o cliente descobre o estado, a
// região da rede e o vínculo de matriz — os três são do cadastro da EMPRESA.

interface OperacaoOut {
  ref: string
  nome: string
  empresaId: number
}

export default defineHandler<Record<string, never>, OperacaoOut[]>(async (ctx) => {
  await ctx.requirePermission('dashboard-contas.ler')
  const operacoes = await ctx.operacoes()
  return operacoes.map((o) => ({ ref: o.ref, nome: o.nome, empresaId: o.empresaId }))
})
