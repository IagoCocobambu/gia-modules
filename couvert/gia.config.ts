// Config do dev-shell do Couvert.
//
// O módulo só lê: as lojas, o vínculo com a BI (`locRefs.BIAPI`) e a configuração de
// couvert (`couvert`) vêm do `ctx.empresas()` — aqui, simulados no mesmo formato; as
// mesas vêm da BI do Simphony DE VERDADE (não existe BI de homologação), com a
// credencial do `.env` (GIA_DEV_CRED_SIMPHONY_BI_*).
//
// Campinas: locRef real na BI; itens de programação artística do exemplo do time do
// Portal GIA (19/11/2026) — confira com o cadastro da loja.

export default {
  moduleId: 'couvert',

  users: [
    { id: 'admin', name: 'Admin', permissions: '*' as const },
    { id: 'leitor', name: 'Leitor', permissions: ['couvert.ler'] },
    { id: 'exportador', name: 'Exportador', permissions: ['couvert.ler', 'couvert.exportar'] },
    { id: 'sem-acesso', name: 'Sem acesso', permissions: [] },
  ],

  empresas: [
    {
      id: 14,
      label: '14.CB CAMPINAS',
      locRefs: { BIAPI: '14 CB Ca' },
      couvert: {
        programacao: [500060, 500061, 500062, 500063, 500116, 500161],
        buffet: [],
        rvcs: [{ nome: 'Restaurante', numero: 101 }],
      },
    },
    {
      id: 900,
      label: '900.LOJA SEM CONFIGURAÇÃO (teste)',
      locRefs: { BIAPI: '14 CB Ca' },
      couvert: { programacao: [], buffet: [], rvcs: [] },
    },
    { id: 901, label: '901.ESCRITÓRIO (sem BI)', locRefs: {} },
  ],
  operacoes: [{ id: 141, empresaId: 14, label: '14 cb' }],

  fixtures: {},
  rpcs: {},
}
