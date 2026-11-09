// Config do dev-shell.
//
// As transações vêm do handler `src/server/pagamentos.ts` rodando no Node, que chama
// a api-dw.cocobambu.com/payments/ com a credencial GIA_DEV_CRED_APIDW_* do `.env`.
// Por isso não há fixtures — só personas e as Empresas simuladas.
//
// O `loc_ref` da API de pagamentos é o código da loja na BI do Simphony
// (`locRefs.BIAPI`, ex.: '17. CB R'); na falta dele, o da integração TS2 — a que o
// legado lia. Só aparecem no seletor as Empresas com CNPJ (tipoRegistro 'empresa')
// que têm um dos dois.

export default {
  moduleId: 'pagamento-echeck',

  users: [
    { id: 'admin', name: 'Admin', permissions: '*' as const },
    { id: 'leitor', name: 'Leitor', permissions: ['pagamento-echeck.ler'] },
    {
      id: 'exportador',
      name: 'Exportador',
      permissions: ['pagamento-echeck.ler', 'pagamento-echeck.exportar'],
    },
  ],

  // Códigos conferidos na API de pagamentos (todos devolvem transações).
  empresas: [
    { id: 1, label: '01.CB GOIANIA', locRefs: { BIAPI: '01 CB Go' } },
    { id: 13, label: '13.CB MARKET PLACE', locRefs: { BIAPI: '13CBMa' } },
    { id: 17, label: '17.CB RECIFE', locRefs: { BIAPI: '17. CB R' } },
    { id: 27, label: '27.CB SP MARKET', locRefs: { BIAPI: '27 CB Ma' } },
    { id: 54, label: '54.CB MINAS SHOPPING', locRefs: { BIAPI: '54 cb mi' } },
    // Só com a integração TS2 (a do legado): entra pelo código de reserva.
    { id: 71, label: '71.CB DERBY', locRefs: { TS2: '71 CB De' } },
    // Inativa continua no seletor (histórico de loja fechada), marcada "Inativa".
    { id: 4, label: '04.CB SAO LUIS', ativo: false, locRefs: { BIAPI: '04 CB SL' } },
    // Sem código nenhum: fica fora do seletor, como no legado.
    { id: 9002, label: 'CB LOJA NOVA' },
    // Sem CNPJ (propriedade): fica fora do seletor mesmo com código.
    {
      id: 9001,
      label: '99.CD GOIANIA',
      tipoRegistro: 'propriedade',
      locRefs: { BIAPI: '99 CD Go' },
    },
  ],

  fixtures: {},
  rpcs: {},
}
