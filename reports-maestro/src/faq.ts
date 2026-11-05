import type { ModuleFaq } from '@gia-cb/sdk/modules'

export const faq: ModuleFaq = {
  summary:
    'O **Reports Maestro** lista, para uma loja e um período, todos os **pedidos de delivery** que passaram pelo Maestro — App Coco Bambu, iFood, 99Food e pedidos manuais — com número do pedido, cliente, endereço, quem confirmou ou cancelou, status, valores e formas de pagamento. Os dados vêm da API do DW na hora da pesquisa; nada é gravado no portal. CPF, e-mail, telefone e endereço completos do cliente só aparecem para quem tem a permissão de ver dados do cliente; para os demais eles vêm mascarados. Quem tem a permissão de exportação baixa o resultado em Excel. A aba **Operacional** mostra, para a mesma loja e período, quanto tempo o pedido leva dentro da loja (aceite, preparo e expedição — e a rota, quando a loja tem a entrega registrada), os dias e horários em que a operação trava e quem cancela.',
  sections: [
    {
      id: 'primeiros-passos',
      title: 'Primeiros passos',
      content: `
## Consultando os pedidos

1. Escolha a **Loja** no seletor (dá para digitar parte do nome). A primeira loja
   da lista já vem selecionada.
2. Informe a **Data inicial** e a **Data final** — as duas começam em *ontem*.
3. Clique em **Pesquisar**.

A tabela mostra **uma linha por pedido**, na ordem de criação.

## Barra de totais

O botão **Totais**, no cabeçalho da tabela (ao lado de Filtros), abre e fecha,
acima da tabela, uma **barra com 4 totais** — valor pedido, valor entrega, total
pago e desconto total —, a soma, em R$, dos pedidos do período **nos status e nas
origens marcados** nos filtros (todos, se nada estiver marcado). Passe o mouse num
total para ver a conta. O desconto total só fica vermelho quando há desconto. Os
totais começam **abertos** em telas com 700 px de altura ou mais e **fechados** em
telas mais baixas e **no celular** (para sobrar espaço para a tabela); com eles abertos o botão
fica preenchido. O botão só
funciona depois da primeira pesquisa, e a escolha de aberto/fechado vale até
você sair da tela (pesquisar de novo não fecha os cards):

| Card | Soma da coluna |
|---|---|
| **Valor pedido** | *Valor pedido* — subtotal, sem a taxa de entrega |
| **Valor entrega** | *Valor entrega* — taxas de entrega |
| **Total pago** | *Total pago* — pagamentos recebidos |
| **Desconto total** | *Desconto total* — descontos concedidos |

A busca e os filtros de coluna da tabela **não** mudam os totais — só os filtros
de status e de origem mudam. Enquanto a pesquisa carrega, os cards mostram uma
barra cinza piscando no lugar do valor. Para somar outro recorte (por exemplo,
só uma forma de pagamento), filtre a tabela e exporte: a linha **Total** do
Excel soma só o que foi exportado.

## Filtro de status

O botão **Filtros**, no cabeçalho da tabela (ao lado de Totais), abre uma
janela no meio da tela (no celular, em tela cheia) com os filtros de status e de
origem. Marque quantos botões quiser: **nada muda na tabela enquanto você
marca**. O filtro só vale quando você clica em **Ver N pedidos**, no rodapé — o
*N* já mostra quantos pedidos vão sobrar com o que está marcado. **Limpar
filtros** desmarca tudo na janela (clique em *Ver N pedidos* depois para
aplicar). Fechar pelo **X**, com um clique fora ou com **Esc** **descarta** o
que você marcou e deixa a tabela como estava. O botão só funciona depois da
primeira pesquisa.

A janela tem duas listas lado a lado (no celular, uma embaixo da outra). A
primeira é **Status**: um botão arredondado por status, cada um com a
**quantidade de pedidos** à direita. Só aparecem os status que existem nos
pedidos pesquisados — por exemplo, se nenhum pedido do período foi cancelado,
não há botão *Cancelados*:

| Botão | Conta |
|---|---|
| **Todos** | todos os pedidos |
| **Recebidos** | status *Recebido* |
| **Confirmados** | status *Confirmado* |
| **Embalados** | status *Embalado* |
| **Despachados** | status *Despachado* |
| **Em rota** | status *Em rota* |
| **A caminho** | status *A caminho* |
| **Entregues** | status *Entregue* |
| **Concluídos** | status *Concluído* |
| **Não entregues** | status *Não entregue* |
| **Retornando** | status *Retornando* |
| **Retornados** | status *Retornado* |
| **Cancelados** | status *Cancelado* |

Os botões seguem a ordem da vida do pedido, e a cor do ícone mostra a fase
(veja *O que cada coluna mostra → Status do pedido*). Se a API trouxer um
status fora desta lista, ele ganha um botão no fim, com o próprio nome (e *Sem
status* para pedido sem status).

## Filtro de origem

Ao lado fica a lista **Origem**, que funciona igual: um botão
só para cada canal que tem pedido na pesquisa (ex.: *99Food*, *App Coco Bambu*, *iFood*,
*Pedido manual*), em ordem alfabética, cada um com a quantidade de pedidos.
Pedido sem origem aparece em *Sem origem*. Os nomes são os mesmos que o Maestro
usa — a coluna **Origem** da tabela mostra o mesmo nome num badge colorido por
canal: *iFood* em rosa, *99Food* em âmbar, *App Coco Bambu* em azul e *Pedido
manual* em cinza. Um canal novo que o Maestro passe a mandar aparece só com
contorno, sem cor.

## Como os dois filtros funcionam

- **Marque os botões e clique em Ver N pedidos** — o botão marcado fica
  preenchido com a cor de destaque. Dá para marcar **mais de um** na mesma
  barra (ex.: *Entregues* + *Concluídos*, para ver só o que chegou ao cliente).
- Clique de novo num botão marcado para desmarcar, ou em **Todos** para limpar
  aquela barra. Uma nova pesquisa limpa as duas.
- **Depois de aplicar, o filtro fica valendo.** Com algo aplicado, o botão
  **Filtros** mostra quantos estão marcados (ex.: *Filtros 2*) — é o aviso de que
  a tabela, os totais e o Excel estão filtrados. Para tirar, abra de novo,
  clique em **Limpar filtros** e depois em **Ver N pedidos**.
- Os dois filtros **se somam**: marcar *Cancelados* e *iFood* mostra só os
  pedidos cancelados do iFood.
- **As quantidades de uma barra seguem a outra.** Com *iFood* marcado na origem,
  os botões de status contam só os pedidos do iFood (e vice-versa) — e os status
  que o iFood não tem **somem** da lista enquanto *iFood* estiver marcado.
  Marcar um botão **não** muda as quantidades da própria barra.
- Botão já marcado que ficou com **0** pela outra barra continua aparecendo, para
  você poder desmarcar.

Os filtros valem para a **tabela**, para os **cards de totais** e para o **Excel
exportado**. A busca e os filtros de coluna da tabela continuam funcionando por
cima deles.

## Limites do período

- As datas **não podem ser futuras**.
- A data final **não pode ser menor** que a inicial.
- O intervalo é de **no máximo 31 dias**.

Períodos longos demoram: 31 dias de uma loja movimentada levam cerca de 25 a 30
segundos. Enquanto carrega, o botão **Pesquisar** fica girando — não precisa
clicar de novo.

Se você mudar a loja ou as datas depois de pesquisar, a tabela continua mostrando
a pesquisa anterior até você clicar em **Pesquisar** de novo. Se nada mudou, o
botão fica desativado: o resultado na tela já é desta pesquisa.
      `,
    },
    {
      id: 'colunas',
      title: 'O que cada coluna mostra',
      content: `
As primeiras 26 colunas são as mesmas do relatório antigo (UniGUI), na mesma
ordem. Depois delas vêm **10 colunas adicionais**, que começam **ocultas** (veja
*Colunas adicionais*, abaixo).

| Coluna | O que é |
|---|---|
| **Loja** | nome da loja no Maestro |
| **ID** | identificador único do pedido no Maestro |
| **Nº pedido** | número exibido ao cliente e à operação |
| **Data criação** | quando o pedido foi criado (horário de São Paulo) |
| **Data ação** | data e hora da ação registrada no pedido (horário de São Paulo) |
| **Nº parceiro** | identificador do pedido no parceiro (iFood, 99Food); vazio nos pedidos do app e manuais |
| **Nº conta** | número da conta (check) gerada no Simphony para o pedido |
| **CPF / Nome / Email / Tel. cliente** | dados do cliente informados no pedido — CPF, e-mail e telefone podem vir mascarados (veja *Dados pessoais do cliente*) |
| **Qtd pedidos** | quantos pedidos esse cliente já fez na plataforma |
| **Rua / Núm. / Referência** | endereço de entrega (na retirada vem *TAKEOUT* / *RETIRADA*); número e referência podem vir como \`***\` |
| **Retirada** | *SIM* quando o pedido é retirada na loja; *NÃO* quando é delivery |
| **Confirmado por / Cancelado por** | usuário que confirmou ou cancelou o pedido |
| **Origem** | canal: App Coco Bambu, iFood, 99Food ou Pedido manual |
| **Status pedido** | situação atual (ver abaixo) |
| **Valor pedido** | subtotal do pedido, sem a taxa de entrega |
| **Valor entrega** | taxa de entrega aplicada ao pedido |
| **Total pago** | soma dos pagamentos do pedido |
| **Desconto total** | soma dos descontos do pedido |
| **Forma pgto** | formas de pagamento e o valor de cada uma, ex.: *PIX - PRE PAGO (112.92)* |
| **Descontos** | descrição de cada desconto e o valor, ex.: *Desconto Taxa iFood (3.99)* |

## Colunas adicionais

A API do DW traz mais campos do que o relatório antigo mostrava. Eles ficam no
fim da tabela, **ocultos** quando a tela abre — para mostrar, use o botão de
**colunas** da barra da tabela (veja *Buscando, filtrando e escolhendo colunas*):

| Coluna | O que é |
|---|---|
| **Tipo de entrega** | como a entrega foi feita, ex.: *Entrega própria*, *Entrega parceiro DiDiFood/99Food*, *Não identificado* |
| **Entrega pela plataforma** | *Sim* quando a entrega ficou com a plataforma de origem do pedido; *Não* quando ficou com a loja |
| **Entregue por** | quem fez a entrega, ex.: *LOJA* |
| **Parceiro** | parceiro do pedido, ex.: *IFOOD*, *99FOOD* |
| **Taxa de entrega** | taxa de entrega informada pela API (R$) |
| **Taxa extra do parceiro** | taxa extra cobrada pelo parceiro (R$) |
| **Incentivo da loja** | parte do incentivo do pedido bancada pela loja (R$) |
| **Incentivo do parceiro** | parte do incentivo do pedido bancada pelo parceiro (R$) |
| **Nº da loja** | número da loja no Maestro, ex.: *08* |
| **Criação (UTC)** | quando o pedido foi criado, no horário **UTC** (3 horas à frente de Brasília) — é a única data da tabela que não está no horário de São Paulo |

Pedido que não tem o campo (por exemplo, pedido do app, que não tem parceiro)
mostra **—** na tabela e fica com a célula **vazia** no Excel — vazio não é zero.

## Status do pedido

É o **último status conhecido** do pedido no Maestro. A tela mostra o nome em
português; o **Excel** traz o valor original do Maestro (como no relatório
antigo):

| Na tela | No Excel | Fase (cor) |
|---|---|---|
| **Recebido** | *RECEIVED* | antes de sair da loja (azul) |
| **Confirmado** | *CONFIRMED* | antes de sair da loja (azul) — veja quem confirmou em *Confirmado por* |
| **Embalado** | *PACKED* | antes de sair da loja (azul) |
| **Despachado** | *DISPATCHED* | em trânsito (amarelo) |
| **Em rota** | *ON_ROUTE* | em trânsito (amarelo) |
| **A caminho** | *GOING_TO_DESTINATION* | em trânsito (amarelo) |
| **Entregue** | *DELIVERED* | entregue (verde) |
| **Concluído** | *COMPLETED* | entregue (verde) |
| **Não entregue** | *ORDER_NOT_DELIVERED* | não entregue / retorno (rosa) |
| **Retornando** | *RETURN_TO_ORIGIN* | não entregue / retorno (rosa) — voltando para a loja |
| **Retornado** | *RETURNED* | não entregue / retorno (rosa) — já voltou para a loja |
| **Cancelado** | *CANCELLED* | cancelado (vermelho) — veja quem cancelou em *Cancelado por* |

A cor do status na tabela (e do ícone no filtro) indica a fase; o nome e o ícone
diferenciam os status dentro dela. Status que não estiver nesta lista aparece em
cinza, com o nome que veio do Maestro. A busca e o filtro da coluna *Status
pedido* usam o nome em português (digite "cancelado", não "CANCELLED").

Pedidos cancelados **entram** na lista, nos cards de totais e nos totais do
Excel, como no relatório antigo. Para tirá-los da soma, marque no filtro de
status todos os status que têm pedidos, **menos** *Cancelados*: a tabela, os
totais e o Excel passam a ignorar os cancelados.
      `,
    },
    {
      id: 'tabela',
      title: 'Buscando, filtrando e escolhendo colunas',
      content: `
## Busca

No **celular**, o campo de busca no topo da lista procura em **todas as colunas** de
uma vez: digite o número do pedido, parte do nome do cliente, o CPF ou uma forma de
pagamento. No computador não há busca geral: use o **filtro de cada coluna** (veja
*Filtros e ordenação*).

**Com os dados do cliente mascarados**, a busca por CPF, e-mail ou telefone só
encontra o que está **à vista** na tela. Exemplos:

- CPF *\\*\\*\\*.456.789-\\*\\** — busque **456.789** (ou **456**, ou **789**), escrito
  como aparece, com o ponto. O CPF inteiro não encontra nada, porque os 3 primeiros
  e os 2 últimos dígitos não chegam à tela.
- E-mail *jo\\*\\*\\*@gmail.com* — busque **jo** ou **@gmail.com**; o resto do nome do
  e-mail não está na tela.
- Telefone *(11) \\*\\*\\*\\*\\*-4321* — busque **4321** ou **(11)**.

Para achar o pedido de uma reclamação nesse caso, busque pelo **nome do cliente**
(que fica sempre à vista), pelo **nº do pedido** ou pela **rua**.

## Filtros e ordenação

Clique no cabeçalho de uma coluna para **ordenar**. O ícone de funil de cada
coluna abre o **filtro** daquela coluna. A busca e os filtros também valem para o
Excel exportado.

## Colunas visíveis

São 36 colunas: as 26 do relatório antigo aparecem quando a tela abre, e as 10
**colunas adicionais** (tipo de entrega, parceiro, taxas, incentivos etc.) começam
ocultas. Use o botão de **colunas** da barra da tabela para mostrar as ocultas ou
esconder as que você não precisa. A escolha vale até você recarregar a página.

## No celular

No celular cada pedido vira um **cartão** com número, data, status e total pago;
toque em **ver mais** para abrir os outros campos. A **busca** fica no topo da lista,
no lugar dos filtros de coluna. O botão
de colunas só aparece em telas maiores; para ver as colunas adicionais no celular,
exporte o Excel.
      `,
    },
    {
      id: 'exportar',
      title: 'Exportando para Excel',
      content: `
Com a permissão de exportação, o botão **Exportar** da barra da tabela baixa um
arquivo **.xlsx** com:

- **o que está filtrado na tela** — busca e filtros de coluna valem para o arquivo;
- as **36 colunas**, mesmo as que estão ocultas na tela: primeiro as 26 do
  relatório antigo, depois as 10 colunas adicionais (de *Tipo de entrega* a
  *Criação (UTC)*);
- valores em R$ e datas como data do Excel (dá para somar e ordenar); campo sem
  valor fica com a célula **vazia**, não com zero;
- uma linha **Total** no fim, com a soma de cada coluna em R$, que soma só as
  linhas visíveis se você filtrar no próprio Excel;
- os **dados do cliente iguais aos da tela**: sem a permissão de ver dados do
  cliente, CPF, e-mail, telefone, número e referência saem mascarados também no
  arquivo, e o subtítulo da planilha avisa *dados pessoais do cliente mascarados*.

O nome do arquivo segue o padrão do portal:
*GIA - Reports Maestro - &lt;loja&gt; - &lt;período&gt;.xlsx*.

O relatório antigo exportava CSV; o Excel traz as mesmas colunas já formatadas.
      `,
    },
    {
      id: 'origem-dos-dados',
      title: 'De onde vêm os dados',
      content: `
Os pedidos vêm da **API do DW** (\`api-dw.cocobambu.com\`, consulta *Delivery*), que
lê o Maestro. A cada **Pesquisar** o portal busca os dados na hora — não há cópia
guardada no portal.

A loja é identificada pelo **número da loja** no cadastro da Empresa no portal.
Ele vem do **vínculo da Empresa com a BI do Simphony**, que começa sempre pelo
número (ex.: *01 CB Go* → loja **01**). Se a Empresa não tiver esse vínculo, vale o
**número no começo do nome** (ex.: *01.CB GOIANIA* → loja **01**).

O seletor lista **todas as lojas com CNPJ** do seu acesso. Escritórios, centros de
distribuição e outros lugares sem CNPJ próprio não aparecem. Se uma loja do
seletor não tiver número em nenhum dos dois, a pesquisa avisa que falta o número
da loja no cadastro — peça ao time do Portal GIA para completar.

O resultado de uma pesquisa fica guardado por **30 minutos**: pesquisar de novo a
mesma loja e o mesmo período nesse prazo mostra o resultado na hora. Para
buscar dados atualizados antes disso, recarregue a página (F5) e pesquise de novo.

O seletor mostra só as lojas do **seu escopo** de Empresas no portal. O servidor
confere isso de novo a cada pesquisa.
      `,
    },
    {
      id: 'dados-pessoais',
      title: 'Dados pessoais do cliente',
      content: `
CPF, e-mail, telefone e endereço completos do cliente só aparecem para quem tem a
permissão **Ver os dados pessoais completos do cliente**
(\`reports-maestro.ver-dados-cliente\`). Sem ela, esses campos já chegam
**mascarados** do servidor — na tela e no Excel:

| Campo | Completo | Mascarado |
|---|---|---|
| **CPF cliente** | 123.456.789-01 | \\*\\*\\*.456.789-\\*\\* |
| **Email cliente** | joao.silva@gmail.com | jo\\*\\*\\*@gmail.com |
| **Tel. cliente** | (11) 98765-4321 | (11) \\*\\*\\*\\*\\*-4321 |
| **Núm.** e **Referência** | 1466 / Escola Maple Bear | \\*\\*\\* / \\*\\*\\* |

Ficam sempre visíveis o **nome do cliente** e o **nome da rua** — é por eles que
se acha o pedido de uma reclamação. Campo que o cliente não informou continua
aparecendo como **—**, não como \\*\\*\\*.

Telefone sem DDD reconhecível (ex.: *0800*) mostra só os 4 últimos dígitos; CPF
fora do formato de 11 dígitos e e-mail sem *@* aparecem só como \\*\\*\\*.

O mascaramento é feito **no servidor**: sem a permissão, o dado completo não chega
ao seu navegador — não adianta exportar nem inspecionar a página. Por isso a
busca da tabela também só encontra os dígitos que ficam à vista (veja *Buscando,
filtrando e escolhendo colunas → Busca*).
      `,
    },
    {
      id: 'operacional',
      title: 'Dashboard Operacional',
      content: `
## Para que serve

A aba **Operacional** — a primeira, onde a tela abre — mostra **quanto tempo o
pedido leva dentro da loja**, em que dias e horários a operação trava e quem cancela,
no período pesquisado. A lista, pedido a pedido, fica na aba **Pedidos**, ao lado.
(Na primeira visita a tela abre em Pedidos, porque o tour de apresentação mostra a
lista; depois do tour, sempre no Operacional.)

Ela usa **a mesma loja e o mesmo período** do cabeçalho. Escolha os dois, clique em
**Pesquisar**: a mesma busca traz a lista e o dashboard, e trocar de aba **não busca
de novo**. A busca traz o histórico de status de cada pedido: **31 dias de uma loja
movimentada levam até ~45 segundos**.
Enquanto carrega, a tela mostra o esboço do painel. O resultado fica guardado por 30
minutos, como na lista de pedidos.

O dashboard **não mostra dado nenhum do cliente** — só tempos, contagens e valores.
Quem tem a permissão de consultar os pedidos vê o dashboard.

## As etapas do pedido

Cada pedido do Maestro registra a hora de cada mudança de status. O dashboard mede o
tempo entre elas:

| Etapa | De → até | O que representa |
|---|---|---|
| **Aceite** | Recebido → Confirmado | quanto a loja demora para aceitar o pedido |
| **Preparo** | Confirmado → Embalado | cozinha e embalagem |
| **Expedição** | Embalado → Despachado | espera até o pedido sair da loja |
| **Tempo na loja** | Recebido → Despachado | as três etapas somadas |
| **Rota** | Despachado → Entregue | deslocamento até o cliente |

As etapas da loja existem em **toda** loja. A **rota** e o **tempo até a entrega**
dependem do **app de entrega** registrar a entrega no Maestro — e há loja em que ele
não registra. Nesse caso a tela avisa, logo abaixo dos cartões, que o Maestro da loja
para em *Despachado*, e mostra só os tempos dentro da loja.

## Mínimo, média, mediana, máximo e "90% até"

- **Mínimo** e **máximo**: o pedido mais rápido e o mais demorado. O máximo costuma
  ser um pedido esquecido (horas de preparo), e por isso não é a régua da operação.
- **Média**: a soma dos tempos dividida pela quantidade. É o **número principal**
  de todo o Operacional (cartões, tempo por etapa, mapa, linhas e quem cancelou). É
  puxada pelos extremos — um pedido de 13 horas sobe a média do mês inteiro —, e
  por isso o "90% até" e o máximo ficam ao lado.
- **Mediana**: metade das entregas leva menos que isso, metade leva mais. Não é a
  média — um pedido esquecido de 5 horas não puxa a mediana para cima. Aparece como
  detalhe nos cartões do Tempo por etapa.
- **90% até**: 90% das entregas levam até esse tempo; só 1 em cada 10 passa dele. É
  o número que mostra a cauda dos pedidos demorados.

## Que pedidos entram nos tempos

Só as **entregas** com as etapas registradas. Ficam de fora:

- **retiradas** — o fluxo é outro (o pedido é liberado no balcão) e puxaria a média
  para baixo;
- **cancelados**;
- pedidos em que a loja registrou **embalado ou despachado depois** de o app de
  entrega já ter pegado ou entregado o pedido — o preparo deles não mede nada.

A linha ao lado do filtro de canal diz quantas entregas entraram nos tempos. Na rota e
no tempo até a entrega também fica de fora a entrega com **rota acima de 2 horas**: é
entrega marcada depois, no app de entrega, e não tempo real de rota.

## O que a aba mostra

- **Canal**, no alto: todos os canais ou um só. Muda todos os cartões e gráficos.
- **Cartões**: tempo na loja e preparo (média e 90% até); tempo até a entrega,
  quando a loja tem a entrega registrada (senão, o total de pedidos); e cancelados
  (parte e valor). Passe o mouse (ou toque) num cartão para ver a conta — e, nos cartões de tempo, o
  **mínimo**, a **mediana** e o **máximo**.
- **Tempo por etapa**: um cartão por etapa. O número grande é a **média** da etapa;
  embaixo estão a **mediana** (metade dos pedidos leva menos que isso), o **mínimo** e
  o **máximo**, e o caminho da etapa (de qual status a qual). A barra fina do cartão
  mostra os valores em ordem, em pedaços coloridos: **amarelo** do zero ao
  mínimo, **vermelho** até a mediana e **azul** até a média; o pedaço **verde** que sobra é
  o caminho até o máximo. **Cada cartão tem a sua barra**: compare as etapas pelos
  números, não pelo tamanho das barras. Quando o máximo é muito maior que a média (um
  pedido esquecido de horas), a barra não vai até ele — o número continua escrito.
- **Quem cancelou**: uma rosca com o **total de cancelamentos** no meio e uma fatia
  para cada grupo — **Cliente ou plataforma** (pelo app do cliente, iFood,
  99Food…), **Loja**, **Cliente e loja** e, quando não dá para saber,
  **Não identificado**. Ao lado, para cada grupo: quantos cancelamentos, que parte
  do total, o **valor** dos pedidos cancelados e a **média** do tempo entre o
  pedido chegar e ser cancelado. Passe o mouse (ou o foco do teclado) numa fatia ou
  num grupo da lista para destacá-lo.
- **Dia × hora do pedido**: escolha o que medir — **Tempo na loja**, **Preparo** ou
  quantidade de **Pedidos** — e como agrupar os dias:
  - **Por dia da semana**: um gráfico de linhas, com as horas embaixo e a medida na
    lateral. Cada dia da semana é uma linha de **uma cor** (todas as segundas do
    período juntas, todas as terças…; só aparecem os dias que existem no período), e
    a **linha grossa** neutra é a **média dos dias** — o dia típico. Passe o mouse
    num dia da legenda para destacá-lo, ou clique para deixá-lo destacado: a linha
    dele fica por cima, mais grossa, com um brilho da própria cor e os pontos de cada
    hora, e os outros dias ficam apagados. Passe o mouse (ou
    toque) no gráfico para ver o valor de todos os dias naquela hora. Horário com
    menos de 5 entregas medidas fica **sem medida**: a linha desce até a base do
    gráfico (no dia destacado, o ponto dessa hora fica vazado) e a dica mostra "sem
    medida" — a descida não quer dizer tempo baixo.
  - **Por dia**: um mapa de calor com uma linha para cada data do período. Cor mais
    forte é mais tempo (ou mais pedidos), e o número de cada célula está escrito
    dentro dela (minutos, ou pedidos). O **pior horário** ganha um contorno e é
    citado na legenda. Horário com menos de 3 entregas medidas fica **listrado**,
    porque poucos pedidos não dão uma média confiável; célula em branco é horário
    sem pedido. Para ver os números de um horário, passe o mouse na célula — **no
    celular, toque e segure** a célula até a dica aparecer; ela fica aberta ao soltar
    e fecha no próximo toque ou ao rolar a tela.

Quando a loja tem a entrega registrada, uma linha abaixo dos cartões mostra quantas
entregas **saíram da loja sem a entrega registrada** (sem tempo de rota).

## Tela cheia e tabela

Todo cartão de gráfico tem o botão de **expandir** (aparece ao passar o mouse; no
celular, sempre). Em tela cheia, embaixo do gráfico, aparece a **tabela com os
números** do cartão. **Esc** ou o mesmo botão saem da tela cheia.
      `,
    },
  ],
  qa: [
    {
      category: 'Dashboard Operacional',
      items: [
        {
          q: 'Onde fica o dashboard operacional?',
          a: 'Na aba Operacional, ao lado de Pedidos, logo abaixo do cabeçalho com a loja e o período. Escolha a loja e as datas, clique em Pesquisar e abra a aba. Ela usa a mesma pesquisa da lista de pedidos.',
        },
        {
          q: 'Por que o dashboard demora mais que a lista de pedidos?',
          a: 'Porque ele busca, além dos pedidos, o histórico de status de cada um (a hora de cada etapa). 31 dias de uma loja movimentada levam até ~45 segundos. A mesma busca serve às duas abas — a lista de Pedidos e o Operacional —, então trocar de aba não busca de novo; o resultado fica guardado por 30 minutos.',
        },
        {
          q: 'Qual a diferença entre média e mediana?',
          a: 'A mediana é o tempo do pedido do meio: metade das entregas leva menos, metade leva mais. A média é a soma dos tempos dividida pela quantidade, e é puxada pelos pedidos esquecidos (um preparo de 13 horas sobe a média do mês). O Operacional mostra a média como número principal; nos cartões do Tempo por etapa a mediana aparece logo abaixo. Quando a média fica bem acima da mediana, há pedidos muito demorados no período — o máximo mostra o pior deles. Nos cartões, o segundo número, "90% até", mostra até onde chegam 90% das entregas.',
        },
        {
          q: 'Por que não aparece a rota nem o tempo até a entrega da minha loja?',
          a: 'Porque o app de entrega não registrou nenhuma entrega da loja no Maestro no período: os pedidos param em Despachado. Sem esse registro não há como medir a rota nem o tempo até a entrega — a tela avisa abaixo dos cartões e mostra só os tempos dentro da loja (aceite, preparo e expedição).',
        },
        {
          q: 'Por que as retiradas não entram nos tempos?',
          a: 'Porque o fluxo da retirada é outro: o pedido é liberado no balcão, e o preparo registrado costuma ser bem mais curto que o da entrega. Misturar os dois puxaria a média para baixo e esconderia o tempo real das entregas. As retiradas continuam no total de pedidos e nos cancelados.',
        },
        {
          q: 'Como vejo os horários de uma data específica?',
          a: 'No cartão Dia × hora, troque "Por dia da semana" por "Por dia": aparece o mapa de calor com uma linha para cada data do período pesquisado (ex.: Seg 05/10), em vez de juntar todas as segundas numa linha só. Para ver um único dia, pesquise só aquele dia.',
        },
        {
          q: 'Por que algumas células do mapa estão listradas, ou a linha desce até a base?',
          a: 'Porque o horário tem poucas entregas medidas — menos de 5 na visão por dia da semana (a linha desce até a base e a hora aparece como "sem medida"), menos de 3 na visão por dia (a célula fica listrada) —, e a média de poucos pedidos não é confiável. Para ver quantos pedidos o horário teve, passe o mouse ou troque a medida para "Pedidos". Célula em branco é horário sem nenhum pedido.',
        },
        {
          q: 'O que quer dizer "Cliente ou plataforma" em Quem cancelou?',
          a: 'O cancelamento veio do lado do cliente: pelo app do cliente ou pela plataforma (iFood, 99Food…). "Loja" é cancelamento feito pela loja. É o mesmo dado que, na lista de pedidos, deixa a coluna "Cancelado por" vazia (cliente ou plataforma) ou com o usuário da loja.',
        },
        {
          q: 'O filtro de canal muda o quê?',
          a: 'Todos os cartões e gráficos da aba passam a contar só os pedidos daquele canal — inclusive o mapa de calor e os cancelamentos. Volte para "Todos os canais" para ver a loja inteira.',
        },
        {
          q: 'Como vejo os números exatos de um gráfico?',
          a: 'Passe o mouse (ou toque) numa barra ou célula para ver a dica com os números. Para ver todos de uma vez, clique no botão de expandir do cartão: em tela cheia a tabela com os números aparece embaixo do gráfico.',
        },
        {
          q: 'O dashboard mostra dados do cliente?',
          a: 'Não. Ele recebe do servidor só canal, horários, tempos de cada etapa, valor do pedido e quem cancelou — nenhum CPF, nome, telefone ou endereço. Por isso não depende da permissão de ver dados do cliente.',
        },
      ],
    },
    {
      category: 'Operações',
      items: [
        {
          q: 'Por que a consulta demora?',
          a: 'A API do DW monta os pedidos na hora, com pagamentos e descontos. Um dia sai em 2 a 3 segundos; 31 dias de uma loja movimentada levam de 25 a 30 segundos. Se passar de 90 segundos, a tela avisa e pede um período menor.',
        },
        {
          q: 'Por que o período é limitado a 31 dias?',
          a: 'Acima disso a API do DW passa do tempo limite e a consulta falha (no relatório antigo ela simplesmente não voltava). Para meses inteiros, pesquise um mês por vez e exporte cada um.',
        },
        {
          q: 'Pedidos cancelados entram no total?',
          a: 'Entram, como no relatório antigo: sem nenhum status marcado no filtro de status, a lista e os cards de totais trazem todos os pedidos do período. Para somar só os válidos, marque no filtro de status todos os status que aparecem, menos Cancelados, e clique em "Ver N pedidos" — a tabela, os cards de totais e o Excel exportado passam a deixar os cancelados de fora.',
        },
        {
          q: 'Onde estão os filtros de status e de origem?',
          a: 'Clique no botão Filtros, no cabeçalho da tabela, ao lado de Totais. Ele abre uma janela no meio da tela com os dois filtros. Marque os botões e clique em "Ver N pedidos" para aplicar. O botão fica desativado até você fazer a primeira pesquisa.',
        },
        {
          q: 'Marquei um status e a tabela não mudou. Por quê?',
          a: 'O filtro só vale quando você clica em "Ver N pedidos", no rodapé da janela — o N mostra quantos pedidos vão sobrar com o que está marcado. Se você fechar a janela pelo X, com um clique fora ou com Esc, o que marcou é descartado e a tabela fica como estava.',
        },
        {
          q: 'Fechei a janela de filtros e a tabela continua filtrada. Por quê?',
          a: 'Um filtro aplicado em "Ver N pedidos" continua valendo para a tabela, os totais e o Excel depois que a janela fecha. O número ao lado de "Filtros" mostra quantos estão marcados. Para tirar, abra de novo, clique em "Limpar filtros" e depois em "Ver N pedidos" — ou faça uma nova pesquisa.',
        },
        {
          q: 'Onde estão os totais em R$?',
          a: 'Clique no botão Totais, no cabeçalho da tabela, ao lado de Exportar. Ele abre, acima da tabela, a barra com a soma de Valor pedido, Valor entrega, Total pago e Desconto total; clique de novo para fechar. Os totais já começam abertos em telas com 700 px de altura ou mais e fechados no celular e em telas mais baixas (como notebook pequeno), e o botão fica desativado até você fazer a primeira pesquisa.',
        },
        {
          q: 'Filtrei a tabela, mas os cards de totais não mudaram. Por quê?',
          a: 'Os cards de totais só acompanham os filtros de status e de origem. A busca e os filtros de coluna da tabela servem para achar pedidos e não mudam os cards. Para ver a soma só do que está filtrado na tabela, exporte: a linha Total do Excel soma as linhas exportadas.',
        },
        {
          q: 'Marquei um status e as quantidades dos outros botões de status não mudaram. Está certo?',
          a: 'Está: marcar um botão não muda as quantidades da própria barra, para você ver o quadro todo enquanto filtra. O que muda são as quantidades da OUTRA barra (marcar iFood faz os status contarem só os pedidos do iFood) e, depois de "Ver N pedidos", a tabela, os cards de totais e o Excel. Para desmarcar, clique de novo no botão marcado ou em "Todos".',
        },
        {
          q: 'Por que um status (ou uma origem) não aparece no filtro?',
          a: 'O filtro só mostra o que existe nos pedidos pesquisados. Se nenhum pedido do período tem aquele status, não há botão para ele. E a outra barra também conta: com iFood marcado na origem, somem os status que nenhum pedido do iFood tem (e vice-versa). Desmarque a outra barra para ver todos de novo.',
        },
        {
          q: 'Os cards de totais batem com o Excel?',
          a: 'Batem quando você exporta sem busca nem filtro de coluna na tabela: o Excel traz os pedidos dos status e origens marcados nos filtros (todos, se nada estiver marcado), e a linha Total soma as mesmas colunas (Valor pedido, Valor entrega, Total pago e Desconto total), arredondadas em centavos.',
        },
        {
          q: 'Qual a diferença entre "Valor pedido" e "Total pago"?',
          a: 'Valor pedido é o subtotal do pedido, sem a taxa de entrega (que fica em "Valor entrega"). Total pago é a soma dos pagamentos do pedido — os mesmos que aparecem, com o valor de cada um, na coluna "Forma pgto".',
        },
        {
          q: 'Como vejo o tipo de entrega, o parceiro, as taxas e os incentivos?',
          a: 'Essas são as 10 colunas adicionais, que começam ocultas. Clique no botão de colunas da barra da tabela e marque as que quiser ver (Tipo de entrega, Entrega pela plataforma, Entregue por, Parceiro, Taxa de entrega, Taxa extra do parceiro, Incentivo da loja, Incentivo do parceiro, Nº da loja e Criação (UTC)). No Excel elas vão sempre, no fim, depois das colunas do relatório antigo. No celular o botão de colunas não aparece — exporte o Excel.',
        },
        {
          q: 'Por que algumas células das colunas adicionais estão vazias?',
          a: 'Porque o pedido não tem aquele dado — por exemplo, pedido do App Coco Bambu não tem parceiro, então Parceiro, Taxa extra do parceiro e os incentivos ficam em branco. Na tabela aparece "—" e no Excel a célula fica vazia: vazio quer dizer "não informado", não R$ 0,00.',
        },
        {
          q: 'Por que a coluna "Criação (UTC)" tem 3 horas a mais que "Data criação"?',
          a: '"Data criação" está no horário de São Paulo; "Criação (UTC)" é o mesmo momento no horário universal (UTC), que fica 3 horas à frente de Brasília. É a única data da tabela que não está no horário de São Paulo.',
        },
        {
          q: 'Mudei as datas, mas a tabela continua igual. Por quê?',
          a: 'A tabela mostra sempre a última pesquisa. Depois de mudar a loja ou as datas, clique em Pesquisar de novo. Se o botão estiver desativado, é porque os filtros são os mesmos da pesquisa na tela.',
        },
      ],
    },
    {
      category: 'Permissões',
      items: [
        {
          q: 'Por que não vejo o botão Exportar?',
          a: 'A exportação exige a permissão `reports-maestro.exportar`. Com apenas `reports-maestro.ler` você consulta os pedidos na tela, mas não baixa a planilha. Peça a permissão ao gestor do seu grupo.',
        },
        {
          q: 'Por que vejo o CPF, o e-mail e o telefone com asteriscos (***)?',
          a: 'Porque você não tem a permissão "Ver os dados pessoais completos do cliente" (reports-maestro.ver-dados-cliente). Sem ela, CPF, e-mail, telefone, número e referência do endereço chegam mascarados — na tela e no Excel. O nome do cliente e o nome da rua continuam visíveis. Se o seu trabalho exige os dados completos, peça a permissão ao gestor do seu grupo.',
        },
        {
          q: 'Busquei o CPF (ou o telefone) do cliente e não achei o pedido. Por quê?',
          a: 'Sem a permissão de ver dados do cliente, a busca só encontra os dígitos que ficam à vista. No CPF "***.456.789-**", busque "456.789" (com o ponto, como aparece na tela); no telefone "(11) *****-4321", busque "4321"; no e-mail "jo***@gmail.com", busque "jo" ou "@gmail.com". O número completo não encontra nada. O jeito mais seguro de achar o pedido é buscar pelo nome do cliente ou pelo número do pedido.',
        },
        {
          q: 'Dá para ver os dados completos do cliente exportando o Excel?',
          a: 'Não. O mascaramento é feito no servidor, antes de os dados chegarem ao seu navegador: o Excel sai do mesmo dado da tela, mascarado. Nesse caso o subtítulo da planilha avisa "dados pessoais do cliente mascarados".',
        },
        {
          q: 'Por que minha loja não aparece no seletor?',
          a: 'O seletor lista todas as lojas com CNPJ do seu escopo de Empresas no portal. Escritórios, centros de distribuição e outros lugares sem CNPJ próprio ficam de fora. Se a sua loja tem CNPJ e mesmo assim não aparece, ela não está no seu escopo — peça ao gestor para conferir.',
        },
        {
          q: 'Escolhi a loja e a pesquisa diz que ela não tem número de loja. O que fazer?',
          a: 'A API de delivery identifica a loja pelo número (ex.: "01"). Ele vem do vínculo da Empresa com a BI do Simphony ou, na falta, do começo do nome (ex.: "01.CB GOIANIA"). Se a Empresa não tem nenhum dos dois, não há como buscar os pedidos dela — peça ao time do Portal GIA para completar o cadastro.',
        },
      ],
    },
    {
      category: 'Erros comuns',
      items: [
        {
          q: 'A tela mostrou "Não foi possível consultar os dados". O que faço?',
          a: 'Leia a mensagem abaixo do título: ela diz o motivo. "Demorou demais" pede um período menor. "A API de delivery respondeu 5xx" é instabilidade da API do DW; clique em Tentar de novo em alguns minutos. "Não tem número de loja no cadastro" quer dizer que a Empresa perdeu o número depois que você abriu a tela — o administrador do portal ajusta o cadastro. Mensagem de credencial ou integração (403/503) é com o administrador do portal.',
        },
        {
          q: 'A pesquisa voltou sem nenhum pedido. Está certo?',
          a: 'Pode estar: a loja pode não ter tido delivery no período. Se você esperava pedidos, confira as datas e a loja. Se mesmo assim nada aparecer, avise o suporte informando loja e período.',
        },
      ],
    },
  ],
}
