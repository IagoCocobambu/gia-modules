# Changelog — Fechamento iFood Diário

## 0.2.5 — 12/11/2026

Restaurantes do iFood vindos do cadastro do portal — sai a tabela fixa do código
(bloqueante da devolutiva da 0.2.4).

- SDK **alpha.71** (`@gia-cb/*`): `GiaOperacao.integracoes` traz os vínculos de cada
  operação. Os restaurantes da loja agora são os vínculos **IFOOD** ativos das operações
  da Empresa (`ctx.operacoes()` → `integracoes`), lidos a cada chamada em `lojas` e
  `vendas`. Loja nova ou conta movida de operação vale na próxima pesquisa, sem versão
  nova do módulo (a 99 Praia Grande, que faltava na tabela, entra assim).
- Sai a tabela `RESTAURANTES_IFOOD` (236 restaurantes, em `lojas.ts` e `vendas.ts`) e o
  `locRefs.IFOOD` da Empresa como reserva: o vínculo do iFood é sempre da operação.
  `vendas.ts` de 694 para 432 linhas; `lojas.ts` de 338 para 86.
- `vendas` confere o restaurante do body nos vínculos das operações da loja (422 se não
  for dela, como antes).
- **404 do iFood vira aviso** do restaurante (identificador errado no cadastro), sem nova
  tentativa: era erro 502, e a tela repetia a chamada antes de avisar. Caso real: o 2º
  vínculo da `43 cbx`, com o UUID incompleto, que o time GIA vai corrigir.
- `gia.config.ts`: 241 operações com `integracoes` IFOOD (237 vínculos) da planilha de
  cadastro de 09/11/2026, com os ids de produção, no lugar da tabela. Conferido no
  `gia dev`: os mesmos 236 restaurantes da tabela + o vínculo incompleto da `43 cbx`.
- FAQ (aviso 404), PRD, INTEGRATION, README e o doc de cálculo e chaves atualizados.

## 0.2.4 — 11/11/2026

A loja passa a ser a **Empresa**, com **todas as operações** dela juntas.

- Seletor por **Empresa** (padrão do workspace; era por operação). A pesquisa traz os
  pedidos dos canais **iFood** e **iFood Vasto** do DW da loja e as vendas de **todos
  os restaurantes da loja no iFood** (cb, cbx, pzcb, dani, adgcb, burger, vst, vstss…).
  Handlers recebem `empresaId` e chamam `requireEmpresa`.
- Restaurantes do iFood de cada loja numa tabela do módulo (`RESTAURANTES_IFOOD`, 236
  restaurantes em 92 lojas), gerada da planilha "GIA - Empresas - Cadastro -
  2026-11-09" (integrações IFOOD das operações) — provisória até o SDK expor
  `locRefs` em `GiaOperacao`. Sai a tabela `OPERACOES_IFOOD_PROPRIO` (Vasto).
  Descartado o 2º vínculo de `43 cbx`, com UUID de um caractere a menos.
- **Mudança de regra**: os pedidos de Express, Pizzaria, Dani, Vasto… agora cruzam
  e entram nos cards (até a 0.2.3, só o restaurante da operação, como no legado —
  os outros ficavam Cancelado). Os cards deixam de bater com a tela antiga nas lojas
  com mais de um restaurante.
- Cruzamento pelo código (n_parceiro = shortId) **e pela hora de criação**: o código
  se repete entre restaurantes (e no mesmo restaurante em horas diferentes); a hora,
  idêntica nos pares certos, desempata. Conferido em 08/11/2026 com dados reais: 03,
  08, 17 e 25 com 100 % dos pedidos iFood do DW cruzados.
- `vendas` pede uma página de **um restaurante** (o servidor confere que ele é da loja)
  e devolve o nome dele na página 1. A tela põe numa fila a página 1 de cada
  restaurante e as demais conforme chegam (até 4 juntas). Falha num restaurante vira
  aviso com o nome dele e não para os outros.
- Nova coluna **Operação** (tabela e Excel), ao lado de Restaurante no iFood, que
  agora mostra o restaurante de cada pedido. Faixa de andamento diz quantos
  restaurantes.
- Seletor: nome sempre com o número da loja e, embaixo, as operações no iFood
  ("3 operações no iFood: cb, pzcb, vst"; "Sem iFood" quando não há). O número da
  loja sai do nome da Empresa e, na falta, do BIAPI (na 999 o BIAPI é "995 CB L").
- `gia.config.ts`: Empresas do dev geradas da mesma planilha (ids, nomes e BIAPI de
  produção; 4 inativas); sai a operação de teste sem número.
- FAQ, tour, PRD e INTEGRATION atualizados.
- Erro da pesquisa na nova mensagem padrão (`MensagemErro`): tipo do problema, a
  frase do servidor e **Ver detalhes técnicos** (Copiar tudo, Baixar diagnóstico).
- Dado sensível: o texto de erro devolvido pelo DW e pelo iFood e a mensagem do hub de
  Credenciais ficam só no log do servidor (a tela recebe o status). Os detalhes técnicos
  ocultam campos de senha, token e dado pessoal, token `Bearer`/JWT e `usuário:senha@`
  de URL; o diagnóstico baixado traz só as falhas deste módulo (o `baixarFalhas()` do
  SDK leva as de todas as telas da sessão).
- Revisão SDK: `vendas.ts` passava de 800 linhas (anti-pattern §13.10) por causa da
  tabela de restaurantes, repetida em `lojas.ts` porque o handler só importa do SDK. A
  tabela virou um texto de uma linha por restaurante (mesmo conteúdo, conferido): 694
  linhas. FAQ trocou a pergunta da tela de erro antiga pela nova e explica os detalhes
  técnicos.

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
