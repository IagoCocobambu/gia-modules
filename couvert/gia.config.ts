// Config do dev-shell pro template rich-api.
//
// Diferente do template `rich`, aqui a lista NÃO vem de fixtures: ela vem da
// API pública REAL, através do handler `src/server/paises.ts` que o `gia dev`
// roda no Node (o dev-shell só mocka o Supabase — a chamada externa sai de
// verdade). Por isso não há `fixtures` aqui — só as personas do painel.

export default {
  moduleId: 'couvert',

  users: [
    { id: 'admin', name: 'Admin', permissions: '*' as const },
    { id: 'leitor', name: 'Leitor', permissions: ['couvert.ler'] },
    { id: 'exportador', name: 'Exportador', permissions: ['couvert.ler', 'couvert.exportar'] },
  ],

  // O módulo é read-only sobre fonte externa (requiresContext: false) — empresa/
  // operação não são usadas, mas o painel do dev-shell aceita a lista simulada.
  empresas: [{ id: 1, label: 'Matriz' }],
  operacoes: [{ id: 11, empresaId: 1, label: 'Matriz' }],

  // Sem fixtures nem rpcs: o dado da tela vem do handler server-side (API real).
  fixtures: {},
  rpcs: {},
}
