import { defineTour } from '@gia-cb/sdk/modules'

// O tour das ABAS — o que é de cada aba, à parte do tour da tela (`tour.ts`).
//
// O tour da tela é montado pelo portal, que não avisa o módulo quando o passo
// muda; então um passo dele não consegue trocar a aba. Este aqui o próprio
// módulo monta (`TourDasAbas`), com `useTourTabSync`: cada passo declara a
// `tab` em que está o alvo, e o tour troca de aba sozinho — primeiro o
// dashboard Operacional, depois a lista de Pedidos —, devolvendo a aba anterior
// (o Operacional, onde a tela abre) ao terminar.
//
// Começa assim que o tour da tela termina (nunca os dois juntos) E o dashboard
// tem pedidos — os alvos do dashboard só existem com ele montado. Quem termina
// o tour da tela sem ter pesquisado vê este tour continuar sozinho assim que a
// primeira pesquisa trouxer pedidos; quem já tem os pedidos na tela segue
// direto, do começo ao fim. Os números são sempre os da pesquisa (API).

export const TOUR_DAS_ABAS_ID = 'reports-maestro:abas'

export const tourDasAbas = defineTour({
  module_id: TOUR_DAS_ABAS_ID,
  steps: [
    {
      id: 'dashboard',
      screen: '/reports-maestro',
      tab: 'operacional',
      // Sem destaque: o balão fica no meio da tela. O alvo só cumpre o tipo.
      target: '[data-tour="reports-maestro-abas"]',
      noSpotlight: true,
      title: 'Dashboard Operacional',
      body: 'Esta aba mostra quanto tempo o pedido leva dentro da loja, em que dias e horários trava e quem cancela, na loja e no período pesquisados.',
    },
    {
      id: 'canal',
      screen: '/reports-maestro',
      tab: 'operacional',
      target: '[data-tour="reports-maestro-operacional-filtros"]',
      title: 'Canal',
      body: 'Escolha **todos os canais** ou um só (iFood, App Coco Bambu…). Todos os cartões e gráficos da aba passam a contar só os pedidos dele. Uma pesquisa nova volta para todos.',
      placement: 'bottom',
    },
    {
      id: 'resumo',
      screen: '/reports-maestro',
      tab: 'operacional',
      target: '[data-tour="reports-maestro-operacional-resumo"]',
      title: 'Cartões do alto',
      body: 'A **média** do tempo na loja e do preparo, com o tempo em que 90% das entregas ficam e quantas foram medidas; o tempo até a entrega (quando a loja tem a entrega registrada) e a parte cancelada. Com mouse, pare num cartão para ver a conta e o mínimo, a mediana e o máximo; no celular eles já vêm escritos.',
      placement: 'bottom',
    },
    {
      id: 'etapas',
      screen: '/reports-maestro',
      tab: 'operacional',
      target: '[data-tour="reports-maestro-operacional-etapas"]',
      title: 'Tempo por etapa',
      body: 'Um cartão para cada etapa — aceite, preparo, expedição e, quando há o dado, rota. O número grande é a média; embaixo, a mediana, o mínimo e o máximo. A etapa mais lenta é onde o pedido trava.',
      placement: 'top',
    },
    {
      id: 'cancelamentos',
      screen: '/reports-maestro',
      tab: 'operacional',
      target: '[data-tour="reports-maestro-operacional-cancelamentos"]',
      title: 'Quem cancelou',
      body: 'Os cancelamentos por quem cancelou — cliente ou plataforma, loja, os dois, ou não identificado —, com o valor e o tempo médio até o cancelamento.',
      placement: 'top',
    },
    {
      id: 'mapa',
      screen: '/reports-maestro',
      tab: 'operacional',
      target: '[data-tour="reports-maestro-operacional-mapa"]',
      title: 'Dia × hora do pedido',
      body: 'Em que dias e horários o tempo sobe. Escolha a medida (tempo na loja, preparo ou pedidos) e se junta os dias da semana ou mostra **cada dia** do período. O botão de expandir de cada cartão abre a tela cheia, com a tabela dos números embaixo.',
      placement: 'top',
    },
    {
      id: 'filtros-status-origem',
      screen: '/reports-maestro',
      tab: 'pedidos',
      target: '[data-tour="reports-maestro-filtros-toggle"]',
      title: 'Aba Pedidos: filtros de status e origem',
      body: 'Agora a lista, pedido a pedido. Clique em **Filtros** para abrir uma janela com os botões de **status** e de **origem** que existem nos pedidos pesquisados. Marque o que quiser (dá para combinar os dois) e clique em **Ver N pedidos** para filtrar a tabela, os totais e o Excel — antes disso nada muda. Depois de aplicado, o número no botão mostra quantos estão marcados.',
      placement: 'bottom',
    },
    {
      id: 'totais',
      screen: '/reports-maestro',
      tab: 'pedidos',
      target: '[data-tour="reports-maestro-totais-toggle"]',
      title: 'Totais em R$',
      body: 'Clique em **Totais** para abrir, acima da tabela, a barra com a soma de Valor pedido, Valor entrega, Total pago e Desconto total. Clique de novo para fechar. Os totais seguem os filtros de status e de origem; a conta de cada um está na FAQ (e, com mouse, na dica do próprio total).',
      placement: 'bottom',
    },
    {
      id: 'toolbar',
      screen: '/reports-maestro',
      tab: 'pedidos',
      target: '[data-tour="reports-maestro-toolbar"]',
      title: 'Busca, colunas e Excel',
      body: 'Filtre pelo cabeçalho de cada coluna (no celular, busque por pedido, cliente ou forma de pagamento), escolha as **colunas** visíveis e **exporte** em Excel (com a permissão de exportação). Tipo de entrega, parceiro, taxas e incentivos começam **ocultos** — mostre pelo botão de colunas; no Excel eles vão sempre.',
      placement: 'bottom',
    },
    {
      id: 'frame',
      screen: '/reports-maestro',
      tab: 'pedidos',
      target: '[data-tour="reports-maestro-frame"]',
      title: 'Pedidos',
      body: 'Uma linha por pedido, com cliente, status, valores e formas de pagamento. Sem a permissão de ver dados do cliente, CPF, e-mail, telefone e número do endereço aparecem com **\\*\\*\\*** — a busca encontra só a parte à vista; procure pelo nome do cliente. O Excel exportado traz uma linha **Total** que soma só as linhas exportadas.',
      placement: 'top',
    },
  ],
})
