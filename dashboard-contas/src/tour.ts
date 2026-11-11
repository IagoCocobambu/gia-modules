import { defineTour } from '@gia-cb/sdk/modules'

// Tour do primeiro uso.
//
// ── CADA PASSO FICA NA BARRA DO TOPO OU NA "VISÃO GERAL" ───────────────────
//
// Quem monta ESTE tour é o HOST (o portal, e o dev-shell em desenvolvimento),
// com `useTourGuide(tour)` e sem `onStepChange`: ele não troca de aba. Como a
// Visão geral é a aba padrão, os alvos daqui existem no primeiro uso. A travessia
// das cinco abas é o outro tour, `abasTour` em `context-tours.ts`, que o módulo
// monta e por isso troca de aba sozinho (a mesma divisão do Dashboard de RH).
//
// ── A PARTE DOS GRÁFICOS ESPERA A SELEÇÃO ───────────────────────────────────
//
// O painel abre sem operação marcada. Passo cujo `target` ainda não existe fica
// PAUSADO pela SDK até o elemento aparecer: os quatro primeiros (barra, consultar,
// contagem, seletor) existem na tela vazia; do `cartoes` em diante o tour espera o
// usuário consultar e retoma sozinho quando a Visão geral monta. O esqueleto de
// carregamento não tem `data-tour`, de propósito — senão o balão abriria sobre
// blocos cinzas. O passo `operacoes` é o último antes da espera e diz isso ao
// usuário: sem ele, o balão sumiria sem motivo.
//
// ── COMO ESTE TEXTO É ESCRITO ───────────────────────────────────────────────
//
// Cada passo diz o que a marca do desenho é, para que lado se lê e o que fazer
// com isso — sem jargão ("régua tracejada", e não "linha de referência"). Os
// nomes em negrito são os da tela: quem lê procura exatamente essas palavras.
// O `body` aceita markdown INLINE (negrito, itálico); texto longo pertence à FAQ.
//
// Os alvos de gráfico são a MOLDURA inteira (`tourId` da `MolduraGrafico`), não o
// SVG: o destaque precisa envolver título e desenho juntos.
//
// ⚠️ CADA PASSO DE GRÁFICO DIZ O QUE MUDA NUM PERÍODO, numa frase no fim. O
// painel abre num mês, mas o topo troca para um período de até 12 meses e
// metade dos desenhos muda de leitura — a faixa cinza, o número dos cartões, a
// régua do ranking. Sem essa frase o tour descreve um desenho que o leitor não
// está vendo (a lição é do Dashboard de RH, 15/09/2026).

export const tour = defineTour({
  module_id: 'dashboard-contas',
  steps: [
    {
      id: 'boas-vindas',
      screen: '/dashboard-contas',
      target: '[data-tour="filtros"]',
      title: 'A barra do topo vale para as cinco abas',
      body: 'Escolha as **operações** que entram na conta — o painel abre sem nenhuma marcada — e o **mês**. O **botão de calendário** troca para um período de até 12 meses. Em **Filtros**, recorte pelo status do plano, ligue **Mesmas lojas** e escolha em **Comparar com** contra o que a variação compara: o **período anterior** ou o **mesmo período do ano passado**. Escolhido o recorte, clique em **Consultar**.',
      placement: 'bottom',
    },
    {
      id: 'consultar',
      screen: '/dashboard-contas',
      target: '[data-tour="consultar"]',
      title: 'Nada é buscado antes deste clique',
      body: 'Operações, mês, período e filtros só montam o recorte — a tela continua com a última consulta. **Consultar** busca tudo de uma vez. Ele acende quando há mudança por aplicar e fica apagado quando a tela já mostra o recorte escolhido.',
      placement: 'bottom',
    },
    {
      id: 'contagem',
      screen: '/dashboard-contas',
      target: '[data-tour="contagem"]',
      title: 'Quantas operações estão na conta',
      body: 'Sem operação marcada, o selo mostra **0/104**, em amarelo. Depois, **86/104** quer dizer: 86 operações na conta, de 104 que você pode ver. Se alguma ainda não entregou o plano do período, aparece ao lado um **número em âmbar**: os números podem mudar quando entregarem. **Clique nele para ver quais são.**',
      placement: 'bottom',
    },
    {
      id: 'operacoes',
      screen: '/dashboard-contas',
      target: '[data-tour="filtro-operacoes"]',
      title: 'Comece escolhendo as operações',
      body: 'Clique em **Próximo**, abra este seletor e marque as operações — uma a uma, em **Selecionar todas**, ou **Por estado** e **Por região** — e clique em **Consultar**. Ali dentro fica também **Consolidar matriz e filiais**: ligado, o grupo conta como uma loja só em todas as abas, com os planos somados antes de qualquer conta. **O tour continua sozinho** quando os números aparecerem.',
      placement: 'bottom',
    },
    {
      id: 'cartoes',
      screen: '/dashboard-contas',
      target: '[data-tour="cartoes"]',
      title: 'O resultado, contra o período anterior',
      body: '**Faturamento total**, **Despesas totais** (contas 2 + 3 + 4), **Lucro líquido** e **Rentabilidade** das operações na conta. A seta mostra a mudança **vs. mês anterior** — verde a favor, vermelho contra: despesa caindo é verde; nos percentuais ela vem em **p.p.** O risquinho são os últimos 12 meses, com o último ponto marcado. A mudança conta só as lojas com plano nos dois períodos, e o selo **N lojas de fora**, acima, diz quais ficaram fora e por quê. Num período, o número é o **total do período** e a mudança é contra o período anterior do mesmo tamanho.',
      placement: 'bottom',
    },
    {
      id: 'resultado',
      screen: '/dashboard-contas',
      target: '[data-tour="grafico-resultado"]',
      title: 'O resultado mês a mês',
      body: 'Três colunas por mês: **faturamento** em azul, **despesas** em laranja e **lucro** em verde-azulado, nos 12 meses que terminam no mês do topo. Lucro abaixo da linha do zero é prejuízo — quase sempre em mês de imposto trimestral (janeiro, abril, julho, outubro). Cada mês traz as lojas que tinham plano NELE, e a dica diz quantas foram: degrau isolado costuma ser loja que entrou ou deixou de entregar, e não mudança de verdade. A **faixa cinza** marca os meses do período escolhido no topo.',
      placement: 'top',
    },
    {
      id: 'rentabilidade',
      screen: '/dashboard-contas',
      target: '[data-tour="grafico-rentabilidade"]',
      title: 'A rentabilidade, com e sem o estoque',
      body: 'A linha cheia é o **lucro líquido sem investimentos ÷ faturamento** de cada mês. A tracejada, **Com variação de estoque**, é a mesma conta somando o quanto o estoque variou (o indicador 10001): quando as duas se afastam, o mês foi ajudado — ou prejudicado — por compra que ficou parada no estoque. Num período, os 12 meses continuam os mesmos; o que muda é a faixa cinza.',
      placement: 'top',
    },
    {
      id: 'indicadores',
      screen: '/dashboard-contas',
      target: '[data-tour="indicadores"]',
      title: 'Os dez indicadores, e o mês a mês de cada um',
      body: 'Em cima, os dez indicadores do plano: **CMV**, **Labor**, **Impostos**, **Custos op.**, os lucros e os operacionais, cada um com o valor do período e a mudança em **p.p.** (**Vinhos** e **Couvert** são múltiplos: 1,90 é a venda cobrindo 1,90 vez o custo). **Clique num deles** e a linha embaixo passa a ser a dele, nos 12 meses — é como se vê se o indicador vem melhorando ou se o mês foi ponto fora da curva. O painel abre no **CMV**; passe o ponteiro num indicador para ver de quais contas ele sai.',
      placement: 'top',
    },
    {
      id: 'composicao',
      screen: '/dashboard-contas',
      target: '[data-tour="composicao"]',
      title: 'Do que o resultado é feito',
      body: '**Faturamento por área** são as contas do grupo 1 (Restaurante, Delivery, Gorjeta, Eventos…), que somam exatamente o faturamento. **Despesas por natureza** são os indicadores 10100 a 10700 (Labor, Matéria-prima, Ocupação, Impostos…), que somam exatamente as despesas totais — é o mesmo dinheiro das contas 2, 3 e 4, reagrupado por natureza em vez de por grupo do plano. Os dois vão do maior para o menor, com a parte no total e a variação; na receita subir é verde, na despesa é vermelho.',
      placement: 'top',
    },
    {
      id: 'ranking',
      screen: '/dashboard-contas',
      target: '[data-tour="grafico-ranking"]',
      title: 'As lojas em ordem',
      body: 'Uma barra por loja, 10 por vez — os botões **‹ ›** embaixo mostram as outras, e a escala é a mesma em todas as páginas. O seletor ao lado do título troca a métrica; em **Matéria-prima (CMV)** e **Labor**, menor é melhor e a lista vira do menor para o maior. A **régua tracejada** é a média por loja da seleção (nos percentuais, a seleção inteira): barra que passa dela está acima do conjunto, e barra vermelha para a esquerda é valor negativo. No canto do cartão, um botão abre o ranking inteiro **em tela cheia**, sem páginas, e o outro **baixa os dados em Excel** — vale para todos os gráficos.',
      placement: 'top',
    },
    {
      id: 'regioes',
      screen: '/dashboard-contas',
      target: '[data-tour="grafico-regioes"]',
      title: 'E as regiões da rede',
      body: 'O mesmo ranking com as operações **somadas por região** (NCO, NE, SPC, SPISE, SUL); a métrica é a escolhida no ranking de lojas. Aqui a soma é de verdade: o percentual da região sai sobre o faturamento dela, e não da média das lojas. Operação sem região no cadastro cai em **Sem região**, em vez de sumir da conta.',
      placement: 'top',
    },
    {
      id: 'tabela',
      screen: '/dashboard-contas',
      target: '[data-tour="tabela-lojas"]',
      title: 'Todas as lojas numa tabela',
      body: 'Faturamento, despesas, lucro e rentabilidade de cada loja, com a variação de cada um ao lado (a da rentabilidade em **p.p.**). **Por região** soma as lojas por região da rede, e **Exportar** leva a tabela como está. Clique no cabeçalho para reordenar; loja sem plano no período anterior mostra **—** na variação. Para o plano inteiro, a comparação com a média e o ranking em qualquer conta, use as abas **Plano de contas**, **Comparativos** e **Por índice**.',
      placement: 'top',
    },
  ],
})
