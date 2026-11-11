# Changelog — Fechamento iFood Diário

## 0.2.3 — 11/11/2026

Reempacotado. Sem mudança de código nem de regra em relação à 0.2.2.

## 0.2.2 — 11/11/2026

- Menu: `navGroup` volta a ser **`cardapio`** (Plataformas). O `navGroup` é o grupo
  raiz; com `'ifood'` o módulo, antes de entrar na NAV_TREE, apareceria num grupo
  solto “Ifood” fora de Plataformas. O subgrupo **iFood** já existe em Plataformas na
  NAV_TREE; o `INTEGRATION.md` §3 pede ao time GIA para pôr a tela nele. Caminho final:
  **Plataformas › iFood › Fechamento iFood Diário**.

## 0.2.1 — 11/11/2026

Reempacotado depois de uma nova revisão contra o SDK (alpha.70): `gia validate` 58/58,
sem avisos; teste no `gia dev` em desktop e celular sem achados no módulo. Sem mudança
de código nem de regra.

## 0.2.0 — 11/11/2026

Desempenho e padrões de tela do workspace. Regras de cálculo sem mudança (conferido
com o legado: 0 diferenças em 01, 54, 08 cb e 08 vst).

- Consulta em partes com **progresso por etapa** (Vendas no iFood, Pedidos do
  delivery) numa faixa acima da tabela, com **Cancelar**, como no Fechamento iFood
  Mensal (padrão 9 do `AGENTS.md`): páginas do iFood 4 ao mesmo tempo, com nova
  tentativa. Handler `fechamento` dividido em `pedidos` e `vendas`; regras em
  `src/regras.ts`, sem mudança.
- A tabela **vai populando**: aparece assim que os pedidos do delivery chegam e é
  cruzada a cada página do iFood; o pedido ainda não achado fica **Aguardando iFood**.
  Os cards, o filtro pelos cards e o Excel só no fim. Página do iFood que trava desiste
  em 20 s (era 60 s).
- Página "leve" do iFood (vendas sem pagamentos, intermitente) pedida de novo: Total do
  parceiro e Data limite de contestação não saem mais vazios por isso.
- Barra de totais no padrão 3: os 4 principais à vista (iFood online, iFood
  adquirentes, desconto copart, pagamentos sem classificação) e os outros 5 em
  **Ver todos os totais**; card escondido que filtra abre a parte de baixo sozinho.
- Barra de filtros enxuta (uma linha) depois da pesquisa, fora do celular (padrão 8).
- Menu: **Plataformas › iFood › Fechamento iFood Diário** (`navGroup: 'ifood'`; era
  `cardapio`).
- Tour atualizado (faixa de andamento, Aguardando iFood, Ver todos os totais);
  descrição do módulo sem menção ao sistema antigo.
- A consulta é abandonada ao sair da tela, e o andamento é limpo depois de um erro.

## 0.1.0 — 09/11/2026

Primeira versão. Porte da tela **Fechamento iFood Diário** do GIA legado.

- Loja e dia; pedidos do DW cruzados com a API financeira do iFood pelo Nº
  parceiro; só os pedidos do canal iFood.
- Colunas da grade do legado (Total do pedido, Desconto copart, iFood
  reembolsa?, Cancelamento, Status...), com as mesmas regras.
- Os 9 cards do legado; cada card filtra a tabela.
- Avisos quando a parte do iFood falha ou não cruza.
- Excel com as abas Resumo e Pedidos.
- Permissões `fechamento-ifood-diario.ler` e `fechamento-ifood-diario.exportar`.
- FAQ e tour sem menção ao sistema antigo (padrão 4 do `AGENTS.md` do workspace).
- Revisão SDK: `Dica` com `asChild` no `Tooltip` (sem botão dentro de botão); resposta
  do handler sem campos que a tela não usa; PRD §5.4 com os tempos medidos.
- Seletor de loja por **operação** (todas as operações do escopo), exceção aos
  demais módulos. Cada operação traz só os seus pedidos: CB pelo canal "iFood",
  Vasto na loja do CB pelo canal "iFood Vasto" e o restaurante do Vasto.
- Coluna Restaurante no iFood. Como no legado, só o restaurante da operação entra
  no cruzamento: pedidos de Express/Pizzaria/Dani da loja ficam como Cancelado.
- API do iFood: 204 (dia sem vendas) e 429 (limite de requisições, com nova
  tentativa) tratados; páginas de vendas buscadas 3 por vez.
