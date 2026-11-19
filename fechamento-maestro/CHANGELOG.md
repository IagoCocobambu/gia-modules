# Changelog — Fechamento Maestro

## 0.4.5 — 17/11/2026

Pedido da diretoria: os painéis de totais separados por canal num PDF. Sem
mudança de banco nem permissão nova.

- **Botão PDF por canal** na barra da tabela, logo antes do **Exportar** (com a
  permissão de exportação, a mesma do Exportar; botão `ghost`,
  com 44 px de altura no celular). Fica oculto até os pedidos
  carregarem: aparece com o resultado na tela e some durante uma nova pesquisa. Baixa um PDF A4 com o
  cabeçalho **Fechamento Maestro** (loja, período e hora em que foi gerado) e,
  para cada canal da pesquisa (do maior para o menor, como o anel), o painel da
  seção de totais: o anel com a fatia do canal acesa, o total pago, a % e os
  pedidos dele, o aviso "Totais só de iFood · X de Y pedidos" e os 12
  indicadores só daquele canal. Até 4 canais por página; o canal que não cabe
  inteiro (faixa e painel) começa na página seguinte.
- **Visual do padrão 17 do AGENTS.md** (PDF gerado pelo módulo): margem de
  12,7 mm; título em azul de acento com a linha de acento fechando o cabeçalho;
  linha de contexto com loja, período, pedidos e "Gerado em"; uma faixa azul-clara
  com o nome de cada canal; nas páginas seguintes, só a linha de continuação;
  rodapé "GIA · Fechamento Maestro · <loja> · <período>" com "Página X de Y". Cores
  de alerta só onde o dado pede (cancelados, sem classificação).
- **Anel com as cores da tela** (exceção ao padrão 17, pedida em 17/11/2026): cada
  canal na cor dele (iFood rosa, App Coco Bambu azul, 99Food âmbar, os outros
  cinza), o canal da seção aceso e os outros apagados.
- O PDF é sempre da **pesquisa inteira**: o canal escolhido, o filtro dos
  indicadores, o "Só divergências" e os filtros de coluna não mudam o arquivo. O
  **Exportar** continua só com o Excel da tabela, como ela está na tela.
- O SDK (alpha.71) não tem padrão nem biblioteca de PDF: o arquivo é desenhado
  com o **jsPDF** (dependência nova, carregada só no clique, como o exceljs), em
  vetor, e baixado direto — funciona igual no celular. Nome no padrão do portal:
  _GIA - Fechamento Maestro - <loja> - Totais por canal - <período>.pdf_.
- **Anel centralizado na vertical** na seção de totais: quando a coluna dos
  indicadores ficava mais alta que o anel (no Safari, com rótulos em 2 linhas), o
  anel ficava no alto da seção, com espaço sobrando embaixo.
- **Código:** a ordem, os rótulos, as dicas e os tons dos 12 indicadores saem do
  `ResumoCards` para `src/indicadores.ts`, usado pela tela e pelo PDF.
- A descrição da permissão `fechamento-maestro.exportar` passa a citar o PDF.
- FAQ, tour, PRD e INTEGRATION atualizados.

## 0.4.4 — 17/11/2026

Devolutiva da 0.4.3 (sugestão de 13/11/2026): totais mais baixos no celular; e
revisão contra o SDK e os padrões do workspace. Sem mudança de banco nem de
permissões.

- **Totais em 2 colunas no celular:** com 1 coluna, os 12 indicadores ocupavam a
  tela inteira quando a seção abria; em 2, a seção fica com metade da altura. No
  celular o indicador fica mais compacto (ícone e valor um pouco menores; em tela de
  até ~375 px, sem o ícone, para o valor caber inteiro) e o
  rótulo quebra em 2 linhas em vez de ser cortado — no toque não há dica para ler
  o nome inteiro.
- **Mensagem de erro padrão:** erro na consulta deixa de mostrar só o texto cru do
  servidor. Agora mostra o tipo do problema (sem conexão, sistema que não
  respondeu, revise a pesquisa, acesso, falha do serviço), de onde veio ("Lista de
  lojas" ou "Pedidos do delivery (Maestro)"), a frase do servidor, **Tentar de
  novo** (quando adianta) e **Ver detalhes técnicos**, com Copiar tudo e Baixar
  diagnóstico (só deste módulo, sem senha, token nem dado pessoal). Sem conexão, a
  pesquisa é refeita sozinha quando a internet volta. Padrão 11 do AGENTS.md; o
  componente é o mesmo do Fechamento iFood Mensal.
- **SDK `@gia-cb` 0.1.0-alpha.71** (antes alpha.70), a mesma dos módulos de iFood
  e do Reports Maestro.
- FAQ e PRD atualizados.

## 0.4.3 — 12/11/2026

Ajuste na seção de totais. Sem mudança de banco nem de permissões.

- **Os 12 totais sempre à vista:** sai o botão **Ver todos os totais (+8)** /
  **Ocultar os demais totais**. Ao lado do anel de canais, as 3 linhas de
  indicadores cabem na altura do anel — esconder 8 deles não deixava a seção
  mais baixa, só escondia os cancelados, os descontos e o sem classificação.
- FAQ, tour e PRD atualizados.

## 0.4.2 — 12/11/2026

Correção na abertura automática da seção de canais e totais e revisão contra o
SDK e os padrões do workspace. Sem mudança de banco nem de permissões.

- **Totais fecham só quando falta espaço de verdade:** antes, a seção fechava
  sozinha quando a janela ficava com menos de 700 px de altura — no Chrome isso
  acontecia com a tabela ainda mostrando várias linhas, e no Safari não
  acontecia do mesmo jeito. Agora a tela mede o espaço: a seção fica aberta
  enquanto, com ela aberta, a tabela ainda mostra **5 linhas** de pedidos, e
  fecha abaixo disso — igual em todos os navegadores. O botão **Totais**
  continua valendo acima da regra, e abrir o "Ver todos os totais" não fecha a
  seção.
- **Sem pisca-pisca:** depois de fechar sozinha, a seção só reabre quando o
  espaço abaixo da barra de filtros cresce de novo uns 24 px — abrir ou fechar a
  seção nunca faz ela trocar de novo.
- **Barra de filtros numa linha só depois da pesquisa** (padrão 8 do AGENTS.md):
  fora do celular, com resultado na tela, some o subtítulo e os nomes acima dos
  campos (que passam a ter `aria-label`); a barra cai de ~140 para ~60 px, que vão
  para a tabela. Em área com menos de 1040 px de largura fica a barra completa.
- **Dicas sem botão dentro de botão:** o `Dica` passa `asChild` à `Tooltip` do
  SDK (padrão 2 do AGENTS.md); antes o Radix envolvia cada botão e cada fatia do
  anel num `<button>` a mais.
- **Código:** `PainelCanais` aceita `className` (conventions §6); os hooks de
  medida da tela foram para `src/hooks/use-medidas-tela.ts` (a view passava de
  800 linhas — conventions §13); `INTEGRATION.md` estava com a versão 0.2.1.
- FAQ, tour, PRD e README atualizados.

## 0.4.1 — 11/11/2026

Correção no Exportar. Sem mudança de banco nem de permissões.

- **Excel com todas as colunas:** as abas Pedidos e Cancelados não levavam o
  **Nº parceiro** (nem outras colunas da tabela). Agora saem todas: Nº
  parceiro, Nº conta, Data de ação, CPF/Email/Telefone cliente (mascarados sem
  a permissão de dados pessoais, como na tela), Qtd pedidos, Rua, Número,
  Referência, Retirada, Confirmado por, Cancelado por, Nome loja, Online
  (bruto) e Total de descontos, além das que já iam.
- Nº parceiro e Nº conta vão como **texto**, para o Excel não arredondar
  números longos.

## 0.4.0 — 11/11/2026

Devolutiva: unificar os totais com o dashboard na mesma seção (opção A validada
no canvas). Sem mudança de banco nem de permissões.

- **Canais à esquerda dos totais:** o anel Vendas por canal (total pago no
  meio), ao lado dos indicadores, sem legenda: a dica de cada fatia (só com
  mouse) diz o canal, o valor, a % e os pedidos. O anel é o seletor: clicar
  numa fatia recorta os 12 totais, a tabela, o Só
  divergências e o Exportar, e o meio do anel mostra os números do canal;
  clicar de novo na fatia, ou no meio do anel ("ver todos"), volta à pesquisa
  inteira. Canal só com cancelados (sem fatia) se escolhe pelo seletor Canal.
- **Sai o Dashboard:** o anel saiu do dialog para a seção; a aba Totais do
  dialog virou a própria seção.
- **O seletor Canal vai para a barra de filtros**, à esquerda do Pesquisar,
  ligado ao anel (escolher num muda o outro) — serve com a seção de totais
  fechada. Vale na hora, sem nova pesquisa, e continua entre pesquisas (volta a
  Todos os canais se a pesquisa nova não tiver aquele canal).
- **Celular:** a seção de canais e totais fica acima da lista e abre pelo botão
  Totais (começa fechada), em vez de abrir o Dashboard; o anel fica em cima dos
  indicadores.
- **Tabela sem subtítulo:** a loja e o período já estão na barra de filtros.
- **Responsivo** (conferido em 1920, 1440, 1280, 1024, 768 e 390 px): campos
  da barra de filtros mais estreitos; Canal e Pesquisar descem juntos quando a
  linha não cabe; no tablet (modo compacto em tela sm+) o formulário ocupa a
  largura toda; ao lado do anel os indicadores ficam em 3 colunas até ~900 px
  (em 5 cortavam valores); o meio do anel mostra o total inteiro.
- **Tour:** passos novos para o anel de canais e para os indicadores (aparecem
  depois da pesquisa, com a seção aberta).
- **Transições:** o aviso "Totais só de …" e o botão do filtro do indicador
  entram com fade.
- **Teste no `gia dev`** (01.CB GOIANIA, 10/11/2026): tour, anel (dica, clique,
  ver todos), seletor Canal, indicadores, Ver todos, Só divergências, Totais,
  detalhe, Exportar, persona Leitor sem Exportar, 320×568 e teclado. Achado do
  SDK, fora do módulo: depois de um elemento com `Tooltip` do `@gia-cb/ui`, o Tab
  seguinte manda o foco para o `<body>` (inclusive nos botões do `DataReport`).
- FAQ (seção "Canais"), tour e PRD atualizados.

## 0.3.0 — 10/11/2026

Devolutiva: os totais estavam "consolidados" — filtrar a coluna Origem (ex.: só
iFood) mudava a tabela, mas não os indicadores. Sem mudança de banco nem de
permissões.

- **Filtro de Canal:** seletor na barra da tabela (Todos os canais, App Coco
  Bambu, iFood, 99Food...). O canal escolhido recorta os 12 totais (barra e aba
  Totais do Dashboard), a tabela, o contador do Só divergências e o Exportar; a
  barra de totais avisa "Totais só de iFood · X de Y pedidos". Nova pesquisa
  volta a todos os canais. O gráfico Vendas por canal segue com todos.
- **Filtros de coluna continuam sem mudar os totais:** o `DataReport` do SDK não
  expõe as linhas filtradas ao módulo. Pedido ao time do SDK (PRD §11).
- **Excel:** com canal ligado, o subtítulo das abas diz "filtrado (iFood): X de Y
  pedidos" (com indicador: "iFood · Online").
- **Barra de totais no padrão do workspace:** à vista os 4 grupos de pagamento
  (Online, Adquirentes online/offline, Offline) e o botão "Ver todos os totais
  (+8)", que abre os cancelados, os descontos e os sem classificação logo
  abaixo. Fechada, a barra ocupa uma linha só. Ponto vermelho no botão quando há
  sem classificação escondido.
- FAQ (seção "Filtrar por canal" e perguntas) e tour atualizados.

## 0.2.1 — 06/11/2026

- **Excel:** o Online líquido (coluna Online (líquido) e o Online do
  Fechamento diário) passa a ser calculado em centavos inteiros. Antes, a
  subtração em reais deixava lixo de ponto flutuante na célula
  (-6.990000000000002 em vez de -6,99). Os totais não mudam.

## 0.2.0 — 06/11/2026

Ajustes da devolutiva da 0.1.0 e novos recursos. Sem mudança de banco nem de
permissões (continua `.ler`, `.exportar` e `.ver-dados-cliente`).

### Devolutiva

- **Loja (bloqueante 2):** o número da loja (`loc_ref`) vem primeiro do vínculo
  da Empresa com a BI do Simphony (`locRefs.BIAPI`) e, na falta, do nome — mesma
  função `numeroDaLoja` do Reports Maestro. Loja com CNPJ sem número aparece no
  seletor e a pesquisa responde 422 com o motivo; Propriedade continua fora.
- **Bloqueante 1 (cadastro ONLINE VR no portal): não aplicado**, por decisão do
  responsável. O módulo é só leitura e continua lendo
  `gia_relatorios.formas_pagamento` do banco do Maestro; sem migrations.
- **Menu:** Plataformas › Maestro, ao lado do Reports (`navGroup: 'maestro'`).
- **FAQ e tour** sem menções ao sistema antigo; "Erros comuns" com 3 perguntas.
- **Excel:** a aba Pedidos usa o Online líquido e a aba Fechamento diário traz
  Descontos loja e Descontos parceiro com a regra dos cards — o Total de cada
  aba bate com os cards. Com filtro ligado, o subtítulo da aba diz
  "filtrado (…): X de Y pedidos".
- **Formas de pagamento:** a vírgula só separa itens depois do parêntese do
  valor (descrição com vírgula não quebra mais).
- **Celular:** botão Totais abre o Dashboard na aba Totais; filtros no
  `ListHeader`, recolhíveis, e que se recolhem sozinhos ao pesquisar; botões da
  barra com rótulo visível em tela de toque; indicadores em uma coluna.
- **Toque:** legenda e anel do Dashboard alternam o destaque no toque; hover e
  tooltip só em aparelho com mouse (no toque, o "mouse" emulado do navegador
  abria tooltip e destaque sozinhos).
- **Sugestões:** data inexistente recusada; "gerado em" e "hoje" no fuso de São
  Paulo; passo "Divergências" do tour aponta para o botão.
- **Online negativo:** mantido — é a regra do legado (o incentivo do parceiro
  sai inteiro do Online). Com a coluna Online (líquido), o pedido em que o
  incentivo passa da parte online aparece negativo na aba Pedidos do Excel
  (ex.: loja 82, pedido 8294 de 24/10/2026: −R$ 6,99).

### Novo

- **Totais como filtro:** clicar num dos 12 indicadores filtra a tabela pelos
  pedidos que entram naquela conta (mesma regra da soma do card). Botão com o
  nome do indicador na barra da tabela tira o filtro. Combina com "Só
  divergências" e vale para o Exportar. Substitui a janela "pagamentos sem
  classificação", que passa a filtrar como os outros.

## 0.1.1 — 05/11/2026

- Seletor só com lojas com CNPJ (`tipoRegistro === 'empresa'`); o servidor
  recusa operação sem CNPJ.
- Descrição do módulo conforme a devolutiva da entrega.

## 0.1.0 — 03/11/2026

- Primeira entrega: fechamento diário do delivery do Maestro por loja e período,
  com conciliação das formas de pagamento, divergências, totais, Dashboard de
  vendas por canal e Excel.
