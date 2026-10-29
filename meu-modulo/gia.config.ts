// Config do dev-shell pro template rich. As fixtures abaixo populam a
// tela imediatamente quando você roda `gia dev` — útil pra ver o módulo
// funcionando antes de implementar backend real.

export default {
  moduleId: 'meu-modulo',

  users: [
    { id: 'admin', name: 'Admin', permissions: '*' as const },
    { id: 'leitor', name: 'Leitor', permissions: ['meu-modulo.ler'] },
    {
      id: 'editor',
      name: 'Editor',
      permissions: ['meu-modulo.ler', 'meu-modulo.sincronizar', 'meu-modulo.exportar'],
    },
  ],

  // Empresas (lojas) e operações que aparecem nos seletores do painel — simulam
  // o ESCOPO do usuário. Você PODE incluir campos próprios do módulo aqui, ex:
  // `loc_ref` na empresa e `operacao_ref` na operação, pra usar nas suas queries.
  empresas: [
    { id: 1, label: 'Loja 01', loc_ref: '01-loja' },
    { id: 2, label: 'Loja 02', loc_ref: '02-loja' },
  ],

  operacoes: [
    { id: 11, empresaId: 1, label: 'Coco Bambu', operacao_ref: 'cb-01' },
    { id: 12, empresaId: 1, label: 'Vasto', operacao_ref: 'vt-01' },
    { id: 21, empresaId: 2, label: 'Coco Bambu', operacao_ref: 'cb-02' },
  ],

  // Fixtures: o dev-shell intercepta GET /rest/v1/<tabela> e devolve estas
  // rows. A chave é o nome DESQUALIFICADO da tabela — o mesmo que vai no
  // `.from('lojas')` (o schema `mod_<id>` da query vai num header que o mock
  // ignora). Aqui populamos lojas + items de exemplo + info de sync.
  fixtures: {
    lojas: [
      { loc_ref: '01-goiania', nome: '01 CB Goiania', apelido: '01 cb go' },
      { loc_ref: '02-analia', nome: '02 CB Analia Franco', apelido: '02 cb an' },
      { loc_ref: '03-jk', nome: '03 CB JK', apelido: '03 cb jk' },
      { loc_ref: '04-saoluis', nome: '04 CB Sao Luis', apelido: '04 cb sa' },
      { loc_ref: '05-lagosul', nome: '05 CB Lago Sul', apelido: '05 cb la' },
      { loc_ref: '06-bsbshop', nome: '06 CB BSB Shopping', apelido: '06 cb bs' },
    ],
    items: [
      {
        loc_ref: '01-goiania',
        family_group: 'BEBIDAS',
        item_id: '1001',
        item_name: 'Água Mineral 500ml',
        gtin: '7891000100100',
        cest: '03.002.00',
        ncm: '22011000',
      },
      {
        loc_ref: '01-goiania',
        family_group: 'BEBIDAS',
        item_id: '1002',
        item_name: 'Suco de Laranja Natural',
        gtin: '7891000100200',
        cest: '03.004.01',
        ncm: '22029900',
      },
      {
        loc_ref: '01-goiania',
        family_group: 'PRATOS',
        item_id: '2001',
        item_name: 'Pirarucu na Telha',
        gtin: null,
        cest: null,
        ncm: '21069090',
      },
      {
        loc_ref: '01-goiania',
        family_group: 'PRATOS',
        item_id: '2002',
        item_name: 'Camarão na Moranga',
        gtin: null,
        cest: null,
        ncm: '21069090',
      },
      {
        loc_ref: '01-goiania',
        family_group: 'SOBREMESAS',
        item_id: '3001',
        item_name: 'Açaí na Tigela',
        gtin: null,
        cest: null,
        ncm: '21069090',
      },
      {
        loc_ref: '02-analia',
        family_group: 'BEBIDAS',
        item_id: '1001',
        item_name: 'Água Mineral 500ml',
        gtin: '7891000100100',
        cest: '03.002.00',
        ncm: '22011000',
      },
      {
        loc_ref: '02-analia',
        family_group: 'PRATOS',
        item_id: '2003',
        item_name: 'Risoto de Camarão',
        gtin: null,
        cest: null,
        ncm: '21069090',
      },
    ],
    sync_info: [
      {
        last_run_at: '2026-06-20T17:55:00Z',
        status: 'success',
      },
    ],
  },

  rpcs: {},
}
