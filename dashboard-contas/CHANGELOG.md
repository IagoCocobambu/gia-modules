# Changelog — Dashboard de Contas

Uma entrada por versão entregue, da mais recente para a mais antiga. A versão
declarada aqui é a mesma do `package.json` e do `version` no manifesto: os três
andam juntos.

Migration nova entra em **negrito** na entrada da versão que a exige. Este módulo
é somente leitura e não tem schema próprio — até aqui, nenhuma versão exigiu
migration.

## 0.1.5 — 2026-10-20

**Pedidos do Davi Nascimento na aba Comparativos: a média do grupo e as colunas
de referência fixas.** SDK atualizada para a `0.1.0-alpha.66`. Nenhuma
migration, nenhum secret novo, nenhuma permissão nova e nenhuma leitura nova.

- **Comparar com: Média do grupo.** Nova opção, entre **Média** e **Melhor**: a
  média de **todas as lojas da rede**, marcadas ou não — o mesmo índice médio da
  seleção (a linha somada dividida pelo faturamento somado), sem as unidades de
  teste e com os mesmos filtros de status e de Mesmas lojas. Escolhida, ela abre o
  bloco **Grupo · N lojas** ao lado de **Lojas selecionadas**, com **Média R$**,
  **Média %**, **Melhor %** e **Pior %** da rede, e a distância de cada loja
  (**Δ grupo**) passa a ser contra a média do grupo. A opção só aparece quando há
  loja da rede fora da seleção — com todas marcadas, a média do grupo é a própria
  Média —, e não consulta nada a mais: o plano da rede já vem com a consulta. O
  padrão continua sendo a **Média**. O **Exportar** leva o bloco do grupo.
- **Alfinete para fixar as colunas de referência.** Ao lado do nome de **Lojas
  selecionadas** e do de **Grupo**, um botão com o alfinete fixa aquele bloco à
  esquerda, junto da **Conta**: ele fica à vista enquanto se rola pelas lojas.
  Cada bloco fixa sozinho, e os dois começam soltos. Os dois juntos só ficam
  fixados quando ainda sobra espaço para duas lojas — na tela cheia de um monitor
  largo, por exemplo; onde não sobra, fixar um solta o outro, e a dica do
  alfinete avisa antes. No **Comparar com: Período**, o alfinete fixa o bloco do
  consolidado.
- **SDK na `0.1.0-alpha.66`** (era a `0.1.0-alpha.62`). A alpha.66 liga a
  calculadora em todo relatório que tem número, e nas grades do painel o único
  número que ela enxergava era o **código da conta** (e a posição no ranking, na
  aba Por índice): clicar em "2 MATERIA PRIMA" somava 2, e clicar num valor não
  somava nada. Essas colunas ficaram fora da calculadora, e Plano de contas,
  Comparativos e Por índice seguem sem o botão, como antes. No **Desempenho das
  lojas** (Visão geral) ela soma os valores.

## 0.1.4 — 2026-09-30

**Pedidos do Davi Nascimento sobre a 0.1.3: o gap contra a melhor loja e o
listrado das tabelas.** Nenhuma migration, nenhum secret novo, nenhuma permissão
nova e nenhuma leitura nova.

- **Plano de contas completo: o gap é sempre contra a melhor, em p.p. e em R$.**
  Na leitura **Reais**, o **Gap R$** e o **Gap %** eram realizado contra o
  **orçado**: trocar de Percentual para Reais trocava a referência do gap sem o
  cabeçalho dizer. Agora a leitura Reais mostra **Gap p/ melhor R$** e **Gap p/
  melhor** (em p.p., a coluna GAP P/ MELHOR do BI). O gap em reais é quanto a
  linha mudaria se a loja tivesse o percentual da melhor: os pontos de diferença ×
  o faturamento da própria loja. Os reais da melhor não entram, porque são de
  outra loja, de outro tamanho. A coluna **Orçado** continua, e o realizado contra
  o orçado segue no **Resultado da loja** com **Contra: Orçado**. O cartão do
  celular e o Excel ganharam o gap em reais.
- **Linhas listradas em todas as tabelas.** As contas de nível 1 e os dois lucros
  (e, no Resultado da loja, o faturamento e o lucro contábil) tinham fundo azul,
  que cobria o listrado da grade — e a coluna Conta, fixada, continuava listrada,
  então a mesma linha tinha dois fundos. Agora toda linha segue o listrado, e o
  destaque dessas contas fica no negrito. Vale para Comparativos, Plano de contas,
  Plano de contas completo e Resultado da loja.

## 0.1.3 — 2026-09-30

**Ajuste de tela na aba Comparativos.** Nenhuma migration, nenhum secret novo,
nenhuma permissão nova e nenhuma leitura nova.

- **Em tela baixa, a grade não fica mais espremida.** A aba tinha altura fixa: a
  barra de controles e o **Resumo das colunas** ficavam presos em cima, e a grade
  ficava com o que sobrava — a 1100 × 700, com o resumo aberto, nenhuma linha de
  conta à vista. Agora, quando sobra menos que umas seis linhas, a grade passa a
  ter a altura da aba inteira: rolar a aba para baixo leva a barra e o resumo para
  fora da vista, e rolar para cima os traz de volta. Com espaço, nada muda.
  Medido com o resumo aberto, em linhas de conta à vista: a 1100 × 700, de
  nenhuma para 4, rolando a aba; a 1440 × 900, de 4 para 6 sem rolar e 9
  rolando; a 1920 × 1080, 8, como antes.
- **O botão Resumo das N colunas divide a linha com os controles.** Quando a
  barra não cabia, os controles desciam juntos e o botão ficava sozinho numa
  linha.
- **O Abrir até foi para o cabeçalho da grade**, antes do filtro — o mesmo lugar
  do Plano de contas e do Plano de contas completo. Com isso, a barra de cima cabe
  numa linha a partir de ~1040 px. No celular, ele vira um seletor compacto no
  cabeçalho da grade.

## 0.1.2 — 2026-09-29

**Uma aba nova, Análises adicionais, com o que o painel ainda não tinha do BI
mensal da controladoria ("Print Mensal BI"); detalhes nas abas de sempre; e uma
revisão de telas.** Nenhuma migration, nenhum secret novo e nenhuma permissão
nova. A única leitura nova é `plano_orcamento.resumo`, com o `SELECT` que o
Dashboard de RH já usa — ver o `INTEGRATION.md`.

**A aba Análises adicionais.** Decisão do João em 28/09: o que o painel ainda
não tinha do BI vai para uma aba própria, e os detalhes ficam nas abas de sempre.

- **Seletor de loja** no topo da aba: uma loja consultada ou a **Seleção**
  inteira. Média e melhor são sempre das lojas consultadas no filtro do topo.
- **Resultado da loja**, uma tabela com três leituras no **Contra**, ao lado do
  título:
  - **Lojas** — as abas GRUPO 1 a 5 do BI: os sete indicadores com Realizado,
    Ano passado, Orçado, Média, Gap p/ média, **Impacto R$**, Melhor e Gap p/
    melhor.
  - **Orçado** e **Ano passado** — as abas REAL VS ORÇADO e COA do BI: doze
    linhas, do faturamento ao lucro, com o gap em reais, em % e em p.p.
- **Onde está o dinheiro** — as contas de despesa em que a loja mais se afasta
  da média das lojas consultadas, em reais: 10 por página, e todas em tela
  cheia.
- **Realizado contra orçado** mês a mês, **Atingimento do orçado** loja a loja e
  a **Curva ABC do faturamento**.
- **Plano de contas completo** — a aba Análise Comparativa do BI: todas as
  contas da loja, na árvore da aba Plano de contas, em duas leituras. Em
  **Percentual**, contra a média e a melhor loja **no indicador** da conta (a
  coluna MELHOR 2026 do BI: nas contas de matéria-prima, a loja de melhor CMV).
  Em **Reais**, contra o ano passado e o orçado, conta a conta. A que indicador
  cada conta pertence sai da composição do catálogo, e bate com a coluna
  LEGENDA da planilha. O Exportar leva as 169 contas.
- **Caderno da reunião** — as abas GRUPO 1 a 5 e PRINT RESUMO do BI: o botão
  **Caderno** baixa o cartão de todas as lojas consultadas num Excel, um
  embaixo do outro, três por página em A4 deitado, com uma aba em tabela para
  filtrar.
- ⚠️ **O painel passa a ler `plano_orcamento.resumo`** para o orçado (só a
  última versão de cada plano, `is_last`). Todo número que vem dele leva o selo
  de origem. O ano passado e o orçado só são buscados com a aba aberta. Ver o
  `INTEGRATION.md`.

**Nas abas de sempre, só detalhes.**

- **Plano de contas:** a coluna **Var. R$** ao lado da variação em %.
- **Por índice:** o modo **Δ ano passado / Δ anterior** no Mostrar.
- **Visão geral:** a linha tracejada do **ano passado** no Indicadores mês a mês.
- **Correção:** com **Consolidar matriz e filiais** ligado, os gráficos de 12
  meses perdiam os grupos inteiros, sem aviso — a série vem por operação e o
  grupo não casava com nenhuma. Agora ela soma as operações de cada grupo.

**Revisão de telas: tela cheia e tamanhos de tela.** Onde há paginação, a tela
cheia mostra tudo, como no Dashboard de RH; e nada pode quebrar em nenhum
tamanho. Conferido em 1920, 1440, 1280, 1024, 768 e 375 px, e com cada cartão
em tela cheia.

- **A tabela Desempenho das lojas, em tela cheia, mostra as 90 lojas.** A tela
  cheia da grade mantinha 10 por página ("página 1 de 9") com a tela vazia
  embaixo. Agora ela é a mesma tela cheia dos gráficos, sem páginas, e mantém a
  ordem escolhida no cabeçalho. A coluna **Loja** fica fixa ao rolar de lado, com
  largura para o maior nome da rede.
- **Indicadores mês a mês em tela cheia:** a tabela era desenhada por cima do
  gráfico. Corrigido na moldura de todos os cartões.
- **A tabela da tela cheia não transborda mais:** os títulos longos das colunas
  quebram linha (a 1440 px, a última coluna da série mensal ficava cortada), e
  no celular a tabela larga rola de lado sozinha, sem arrastar o gráfico junto.
- **Os nomes nos rankings saem inteiros.** A coluna do nome tem a largura do
  maior nome da lista (132 a 240 px), e no cartão estreito, quando nem assim
  cabe, o nome sobe para cima da barra. Antes: "69.CB SÃO JOSÉ DOS C…", "4.12
  DESPESAS INDIRET…". O título do ranking de lojas deixou de repetir a métrica,
  que já está no seletor ao lado (cortava em "Ranking de lojas · Fatura…").
- **Cartões do topo:** num cartão estreito, o código da conta ("CONTAS 2 + 3 +
  4") sai e o nome fica inteiro; a 1024 px eles liam "Faturamento to…" e
  "Despes…".
- **Números:** o "mil" começa em R$ 1 mil, e não em 10 mil — a mesma lista
  misturava "R$ 11,7 mil" com "R$ 9.641,52". E todo número negativo usa o sinal
  de menos, não o hífen.
- **Composição:** variação acima de 999% aparece como "> +999%", com o valor
  exato na dica ("+222.319,9%" encostava na borda do cartão); em cartão largo, a
  barra de participação cresce com ele.
- **Indicadores mês a mês:** duas colunas no celular e cinco a partir do
  tablet, com o nome de cada indicador numa linha própria quando não cabe ao lado
  do valor. Numa coluna só, os dez eram dez linhas e o gráfico ficava abaixo da
  dobra.

## 0.1.1 — 2026-09-23

**Correções sobre a 0.1.0, que já está em produção.** Nenhuma tela nova.

**A lista de lojas da rede passa a vir de RPC — é o defeito visto em produção.**
Quem tem `dashboard-contas.ler-rede` via UMA loja em vez da rede inteira: o
painel caía no escopo do usuário, sem erro e sem aviso. A causa é RLS, que estava
em `gia.operacoes` desde a fundação do portal — quem valida tem escopo total ou
`operacoes.editar` e atravessa a policy, então o defeito só aparecia para quem
usava. Passou a ser a `public.operacoes_da_rede(p_permissao)`, `security definer`,
que confere a chave contra quem chama e só aceita chave terminada em `.ler-rede`.
O gate do servidor (`universoDeLojas`) não mudou.

O **cadastro** das lojas — estado, região e o vínculo de matriz — vinha pelo mesmo
caminho e tinha o mesmo problema: `gia.empresas` tem a mesma RLS, e sem ela a rede
inteira cairia em "Sem região" e a consolidação de matriz e filiais não agruparia
nada. Ele passou a vir da RPC irmã `public.empresas_da_rede`. Nos dois casos a
**tabela continua sendo lida como base do escopo**: a RPC exige a chave, e quem
tem escopo total sem ela não pode regredir.

⚠️ **As duas funções precisam existir no ambiente.** Sem elas o painel não
quebra, mas volta a mostrar só o escopo — que é justamente o defeito. Ver o
`INTEGRATION.md`.

**Devolutiva do Davi Nascimento (23/09).**

- **As unidades de teste da tecnologia (código 999) ficam fora da marcação em
  lote** do seletor de operações. **Selecionar todas** e a caixa de um estado ou
  de uma região marcam só as operações de verdade; marcar a caixa da unidade na
  lista continua incluindo-a, e desmarcar continua tirando. Sem isto, uma venda
  de teste entrava na média da rede, no ranking e na régua de comparação.
- **Sem teto de índices na aba Por índice.** Eram oito; agora são quantos forem
  marcados, porque as colunas fora da vista deixaram de ser desenhadas — a mesma
  janela de colunas que a Comparativos já usava.
- **Os indicadores que as grades escondem passaram a ser escolhíveis** na Por
  índice, a **10000 RENTABILIDADE** à frente, mais a 10001 e a 10101. Eles ficam
  fora das grades porque os cartões da Visão geral já os mostram, e quem
  procurava "rentabilidade" na busca não achava nada. Só a linha de validação
  **9999** continua de fora: ela mede se o plano fecha, não como a loja foi.

**Dois defeitos de desenho.**

- **A faixa de páginas do gráfico voltou para dentro do cartão.** A conta de
  quantas barras cabem media o elemento de FORA do cartão e descontava 132 px de
  chute para cabeçalho, recuo e paginação — que somam 154. Com a rede inteira, a
  faixa saía 17 px abaixo da borda. Agora quem conta é o próprio gráfico, pelo
  corpo do cartão.
- **A barra do topo piscava sozinha** em certas larguras de janela, alternando
  entre os dois arranjos dezenas de vezes por segundo. O risquinho separador
  entre o título e os controles só existe quando a barra cabe numa linha, e a
  largura dele entrava na conta que decide isso: cada arranjo produzia a medida
  que pedia o outro. Ele passou a ocupar o lugar nos dois arranjos, e a conta
  ganhou uma folga assimétrica que impede o laço de voltar por outra peça.

E uma chave duplicada no cartão do celular da Por índice: as linhas eram
identificadas pelo NOME do índice, e nome de conta se repete no plano ("Bebidas"
é a 1.1.2 e a 2.2). Só aparecia com muitos índices marcados, o que o teto de oito
escondia.

## 0.1.0 — 2026-09-18

**Primeira entrega.** Painel comparativo do Plano de Contas das lojas, no menu em
**Dashboards > Planos > Dashboard de Contas**, somente leitura, sobre as operações do escopo do
usuário.

- **Três abas sobre o mesmo recorte:**
  - **Visão geral** — faturamento, despesas, lucro e rentabilidade contra o
    período anterior; a evolução em 12 meses; o cartão **Indicadores mês a mês**,
    com os dez indicadores do plano e o gráfico do escolhido; a composição do
    faturamento por área e das despesas por natureza; o ranking de lojas e de
    regiões e a tabela de desempenho por loja ou por região.
  - **Plano de contas** — a árvore inteira somada, aberta por nível, com a
    variação em reais e em p.p.; num período, também mês a mês. No fim, os
    indicadores gerenciais e cinco calculados pelo painel (labor sobre o salão,
    custo líquido do motoboy, receita de entrega, estoque sobre faturamento e
    DIO).
  - **Comparativos** — uma coluna por operação, região, estado ou matriz, contra
    a média simples, a melhor ou a pior loja da seleção, em p.p. ou em
    oportunidade em reais; com o resumo das colunas e a sugestão de lojas
    semelhantes (faturamento ±10%).
- **Um mês ou um período de até 12 meses**, sempre contra o período anterior do
  mesmo tamanho. A variação compara só as lojas com plano nos dois períodos; o
  filtro **Mesmas lojas** restringe o número inteiro às lojas com plano em todos
  os meses dos dois.
- **As razões são recalculadas sobre as somas** — nunca somadas nem lidas do que
  o plano gravou, que está arredondado em parte dos planos. O mesmo para 11003 e
  11004, gravadas com sinais diferentes entre planos.
- **O botão Consultar busca o recorte inteiro**; nenhum controle consulta
  sozinho.
- **Todo cartão de gráfico expande em tela cheia** (Esc sai), e os que paginam —
  os rankings — mostram a lista inteira com rolagem no lugar dos botões de
  página. Vale também para as grades das três abas.
- **Em tela cheia, o gráfico vem com a tabela dos valores embaixo** — os mesmos
  números da dica, escritos —, e o título cortado pela largura mostra o nome
  inteiro ao passar o ponteiro.
- **Todo cartão de gráfico baixa os dados em Excel**, com a aba Dados (número
  como número, no formato da conta) e a aba Gráfico (a imagem do desenho). Exige
  `dashboard-contas.exportar`. Usa `exceljs`, carregado só no clique.
- **O painel compara a REDE INTEIRA**, e não só o escopo de empresa do usuário:
  permissão nova `dashboard-contas.ler-rede`, lista somada com `gia.operacoes` no
  cliente e universo "escopo ∪ lista do cliente" nos handlers.
- **Consolidar matriz e filiais**, no seletor de operações: o grupo vira uma loja
  só em todas as abas, com os planos somados antes de qualquer conta e as razões
  recalculadas sobre a soma. As filiais aparecem em ordem de número de loja.
- **Comparar com**, nos Filtros: a variação compara com a janela anterior ou com
  o mesmo período do ano passado.
- **Comparar com: Período**, na aba Comparativos: cada operação no período do
  topo, no de comparação e a diferença, só nas lojas com plano nos dois. Entrou
  como mais uma referência do próprio **Comparar com** — a pergunta é a mesma
  ("contra o que esta coluna é medida?"), e dois controles custavam uma linha
  inteira do cabeçalho.
- **Aba Por índice** — a quarta leitura do painel, e a resposta ao pedido do
  Felipe ("clicar num índice e ver o maior e o menor"): uma linha por operação
  (ou região, estado, matriz) e uma coluna por **índice escolhido**, sem teto, de
  qualquer conta do plano ou indicador — inclusive os que as grades escondem
  porque os cartões da Visão geral já os mostram (**10000 RENTABILIDADE**,
  **10001**, **10101**); só a linha de validação **9999** fica de fora. As
  colunas fora da vista não são desenhadas, como na Comparativos. Clicar no nome do índice ordena do maior
  para o menor, de novo inverte e a terceira vez volta à ordem alfabética; o
  gráfico de barras ao lado acompanha o índice que ordena, com a régua da média.
  **Mostrar** troca entre **%**, **R$** e **Δ média**. Nada é recalculado: as
  células saem da mesma função da Comparativos, transposta.
- **O cabeçalho da aba Comparativos foi enxugado**: os controles saíram de dentro
  do cartão e passaram para a barra acima da grade, que o **Resumo das colunas**
  já ocupava — o cabeçalho caiu de 190 px para 77 px e a grade passou de três
  para cinco linhas visíveis numa janela de 700 px. **Abrir até** mostra só o
  número (**1 / 2 / 3**), com a explicação do nível na dica; **Colunas** virou
  seletor. O selo **N operações de fora**,
  ao lado do título, substituiu a nota no fim do subtítulo e nomeia as operações
  e o motivo de cada uma.
- **A tela cheia da aba Comparativos leva a barra de controles junto**: expandido,
  ainda dá para trocar de referência, de nível e de agrupamento.
- **O seletor de operações encurta o rótulo quando a faixa aperta** ("Todas" no
  lugar de "Todas as operações"), com a seleção inteira na dica do botão.
- **A tabela do gráfico em tela cheia traz a variação contra o mês anterior**, e
  o mesmo vale para a planilha baixada.
- **A seta de matriz e filiais na Comparativos (22/09)** — o arranjo do
  Dashboard de RH, pedido pelo João: com **Consolidar matriz e filiais** ligado,
  cada coluna de grupo com duas ou mais operações ganha uma **seta** no
  cabeçalho, e abrindo ela mostra as operações **ao lado do total do grupo**
  (R$ e %), num nível a mais de cabeçalho — e não a troca do grupo pelas partes.
  As filiais não disputam melhor e pior, e saem no Exportar como estão na tela.
  Com isso, **"Colunas por: Matriz e filiais" saiu** das abas Comparativos e Por
  índice: eram dois controles para a mesma ideia, e o do seletor vale para as
  quatro abas.
- **Esqueleto em toda espera e a grade destravada (22/09)**:
  - a **Visão geral** passou a mostrar o esqueleto enquanto recalcula, como as
    outras abas e como o Dashboard de RH. Antes ela só esmaecia, e com um período
    de 12 meses a tela ficava segundos apagada com números velhos à vista. O que
    o usuário escolhe dentro da aba (indicador do cartão, métrica dos rankings,
    linhas da tabela) subiu para a tela, para a aba poder ser desmontada sem
    perder a escolha.
  - **abrir uma conta na Comparativos travava a tela por 1,4 s** com a rede
    inteira (e 5,1 s com a árvore já aberta): a grade inteira era esvaziada e
    redesenhada. Agora a linha pronta é reaproveitada por chave, a abertura viaja
    dentro da linha (as colunas deixaram de ser recriadas), o `getRowId` é a
    chave da conta e o esqueleto só entra quando as COLUNAS mudam. Medido:
    **364–675 ms**, com 534 células redesenhadas no lugar de 25 mil.
  - o teto que sobra é do componente de grade da SDK, que desenha todas as
    colunas mesmo fora da vista — pedido registrado em
    `devolutivas/para-sdk/alpha60-datareport-sem-virtualizacao-de-colunas.md`.
- **FAQ e tour no padrão do Dashboard de RH (22/09)**: a FAQ ganhou um bloco por
  gráfico — **onde fica**, **o que mostra**, **como ler**, **como o valor é
  calculado**, **quem fica de fora**, **o que muda num período** e **o que a dica
  traz** —, uma seção própria para os **cartões de gráfico** (tela cheia e
  planilha) e outra com **os indicadores do plano, um a um**, com a fórmula de
  cada um. O tour do primeiro uso foi de 10 para **12 passos**, com a
  rentabilidade com e sem estoque e o ranking de regiões, e todo passo de gráfico
  passou a dizer o que muda num período; o tour das abas ganhou os nomes dos
  controles de cada uma.
- **Conferência dos números contra o data-warehouse (22/09)**: grades, cartões,
  gráficos, composição, rankings e comparações foram recalculados em SQL, fora do
  código do painel, e conferem — um mês, um período de três meses, a consolidação
  de matriz e filiais e os dois períodos lado a lado. Dois acertos saíram dela:
  - a coluna de variação da tabela dos gráficos de evolução passou a se chamar
    **vs. mês anterior (lojas de cada mês)**, com nota, porque ela compara os
    pontos do desenho — cada mês com as lojas dele — e não "as mesmas lojas" dos
    cartões do topo (ago/26: +7,6% contra +9,7%);
  - o **DIO** passou a sair com uma casa (**34,5 dias** no lugar de 35), para
    fechar com a diferença, que sempre teve uma casa.
- **A grade da Comparativos passou a caber na tela (22/09)** — três mudanças
  juntas, depois de a SDK indicar que a virtualização de colunas ficaria do lado
  do módulo:
  - **"Mostrar" escolhe o número da coluna da loja**: **%**, **R$**, **Δ p.p.**,
    **Ganho R$** ou **Tudo** (as três colunas de antes, como a grade abre). Com
    um número só, a loja ocupa uma coluna em vez de três. A célula é pintada
    pela distância para a referência em qualquer modo, a melhor e a pior loja
    ficam com contorno, e a dica traz os quatro números juntos — escolher um não
    esconde nada.
  - **Janela de colunas**: a grade recebe só as colunas da vista mais uma folga,
    e o que ficou de fora vira uma coluna vazia em cada ponta, com a largura
    exata — a barra de rolagem não muda de tamanho e nenhuma coluna sai do
    lugar. A exportação e a tela cheia continuam vendo todas as lojas; a busca do
    navegador só acha o que está desenhado (está na FAQ).
  - **A grade só redesenha quando as props dela mudam**: o componente da SDK não
    é memorizado, e qualquer render da aba o refazia inteiro (~165 ms fixos mais
    ~110 µs por célula, mesmo com dado e colunas idênticos). Com `memo` e as
    treze props estáveis, o primeiro dos dois renders de cada escolha deixou de
    custar.

  Medido com a rede inteira, no nível 3: **27.200 células no DOM e 888 ms** de
  tarefa mais longa antes; **1.700 células e 278 ms** depois. O segundo achado
  virou seção nova do pedido em
  `devolutivas/para-sdk/alpha60-datareport-sem-virtualizacao-de-colunas.md`.
- **O período comparado é escolhido na aba Comparativos (22/09)** — o arranjo do
  Dashboard de RH, pedido pelo João: em **Comparar com: Período**, um seletor de
  mês escolhe o PRIMEIRO mês do período comparado e o último vem do tamanho do
  período do topo (*a ago/25 · 6 meses*). Vale **só para esta aba**: os cartões,
  o mês a mês e a coluna **Var.** do Plano continuam com o **Comparar com** dos
  Filtros. Os meses escolhidos são buscados no mesmo cache por mês do período do
  topo.
- **Seletor de operações mais enxuto (22/09)**: com a consolidação ligada, a loja
  sem filial ganhou o recuo da seta e a lista voltou a ter uma coluna de caixas
  só; o interruptor **Consolidar matriz e filiais** perdeu o parágrafo embaixo e
  virou uma linha (de ~13 para ~25 lojas visíveis sem rolar). A explicação está
  na FAQ.
- **Gráfico que nascia escondido ficava com 4 barras (22/09)**: o observador de
  tamanho era ligado na montagem, então elemento que aparece depois — o ranking
  da aba Por índice ao voltar de **Só a tabela** para **Com gráfico** — nunca era
  medido, e o cartão caía no piso de barras dentro de uma área de 900 px. Valia
  para os cinco gráficos do painel.
- **Tudo em Excel (22/09)** — decisão do João: nenhuma tela exporta CSV. As
  quatro grades (Visão geral, Plano de contas, Comparativos e Por índice)
  deixaram de usar o Exportar do componente de grade, que gera CSV, e passaram a
  baixar `.xlsx` pelo mesmo caminho dos cartões de gráfico: cada coluna no
  formato dela (real, percentual, pontos), o cabeçalho congelado e o recorte
  escrito em cima da tabela. Com o CSV saiu o contorno da extensão dobrada
  (`… - 2026-08.csv.csv`), e as abas deixaram de receber `podeExportar` e
  `periodoArquivo` — quem checa a permissão e lê o período agora é o botão.
- **A aba Por índice cabe na tela estreita (22/09)** — o arranjo do Dashboard de
  RH, apontado pelo João:
  - **abaixo de 1280 px, um de cada vez**: o controle deixa de ser "Com gráfico /
    Só a tabela" e vira **Ver: Tabela | Gráfico**, cada um com a altura inteira.
    Empilhados, a tabela ficava com 22rem, o gráfico com 16rem e a aba rolava por
    fora — sobravam três linhas e TRÊS barras de 89. Medido a 1100 px: o ranking
    passou a mostrar **17 barras**.
  - **no celular, os controles viram um botão**: **Ajustes · 4 índices** abre um
    modal com Índices, Mostrar e Linhas. A barra da aba caiu de três linhas
    (116 px) para uma (36 px), numa tela de 812 px.
- **SDK na `0.1.0-alpha.62`**, com TypeScript `~5.8`.
