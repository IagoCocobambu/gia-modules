import { defineTour } from '@gia-cb/sdk/modules'

// Tour secundário: a travessia das cinco abas.
//
// ── POR QUE ELE EXISTE SEPARADO DO TOUR PRINCIPAL ───────────────────────────
//
// O tour principal (`src/tour.ts`) é montado pelo HOST, sem `onStepChange`, e
// por isso não troca de aba. Este o MÓDULO monta, em `DashboardContasView`, com
// `useTourTabSync`: quando o passo entra em cena a aba troca sozinha, e ao
// concluir ou pular o tour a aba em que o usuário estava volta.
//
// ── CADA PASSO APONTA PARA A BARRA DE ABAS ──────────────────────────────────
//
// A grade de cada aba ocupa a altura toda e não deixa espaço para o balão, e nem
// sempre existe quando o passo começa (a Comparativos com a rede inteira leva uns
// segundos, com esqueleto no lugar). A barra de abas está sempre na tela, com a
// aba do passo já marcada — o alvo que não falha (a lição do Dashboard de RH).
//
// ⚠️ O `module_id` PRECISA ser diferente do principal: é por ele que o
// `useTourReplay` filtra o evento de replay. Com o mesmo id, "Conhecer as abas"
// dispararia os dois tours ao mesmo tempo.
//
// ⚠️ A chave em `tab` é a do estado da view (`AbaId`), não um rótulo.

const ALVO = '[data-tour="abas"]'

export const abasTour = defineTour({
  module_id: 'dashboard-contas:abas',
  steps: [
    {
      id: 'visao',
      tab: 'visao',
      target: ALVO,
      title: 'Visão geral — o resultado',
      body: 'O resultado das operações na conta contra o período anterior, a evolução em 12 meses, do que o faturamento e as despesas são feitos, e o desempenho de cada loja e região. É a única aba que rola como página: os gráficos paginam em vez de rolar por dentro. Todo cartão aqui **expande em tela cheia** e **baixa os dados em Excel**, nos dois botões do canto do título.',
      placement: 'bottom',
    },
    {
      id: 'plano',
      tab: 'plano',
      target: ALVO,
      title: 'Plano de contas — a árvore inteira',
      body: 'O plano **somado** das operações na conta, no mesmo formato que a loja preenche: **Realizado (R$)**, **% Fat.**, **Var.** e **Δ p.p.** **Abrir até 1 | 2 | 3** abre a árvore inteira por nível, e a seta de cada conta abre só ela. Num período, **Mês a mês** põe um grupo de colunas por mês. No fim, depois de **INDICADORES E VALIDAÇÕES**, os indicadores gerenciais e cinco calculados pelo painel — passe o ponteiro no ⓘ para ver de que contas cada um é feito.',
      placement: 'bottom',
    },
    {
      id: 'comparativos',
      tab: 'comparativos',
      target: ALVO,
      title: 'Comparativos — cada loja contra a seleção',
      body: 'Uma coluna por operação — ou por **Região** e **Estado** —, cada uma contra o que **Comparar com** escolher: a **Média**, a **Melhor** ou a **Pior** loja da seleção, ou o **Período**, que põe a operação em dois períodos lado a lado — e ali um seletor de mês escolhe **contra qual período**, só nesta aba. Cada loja traz **R$**, **%** e a distância; **Mostrar** reduz a coluna a um número só — e a dica da célula traz os quatro juntos, seja qual for o escolhido. Verde é a favor e vermelho contra, mais forte quanto maior a distância. Com **Consolidar matriz e filiais** ligado, a **seta** no nome do grupo abre as operações dele ao lado do total.',
      placement: 'bottom',
    },
    {
      id: 'por-indice',
      tab: 'por-indice',
      target: ALVO,
      title: 'Por índice — quem é o maior e o menor',
      body: 'A mesma conta, virada de lado: uma linha por operação e uma coluna por **índice** escolhido — quantos forem, de qualquer conta do plano ou indicador, com busca por nome ou código. **Clique no nome de um índice** para ordenar do maior para o menor; de novo inverte, e a terceira vez volta à ordem alfabética. O gráfico ao lado acompanha o índice que ordena, com a régua da **Média das linhas**. É a aba de "quem é o maior e o menor nesta conta".',
      placement: 'bottom',
    },
    {
      id: 'analises',
      tab: 'analises',
      target: ALVO,
      title: 'Análises adicionais — o que vinha do BI mensal',
      body: 'O que o BI mensal da controladoria tinha e o painel não: o **resultado da loja**, com três leituras no **Contra**: contra as outras lojas (o realizado, o ano passado e o orçado lado a lado, a média, a melhor e o **impacto em reais**), contra o orçado e contra o ano passado; **Onde está o dinheiro**; o realizado contra o orçado mês a mês; o **atingimento do orçado** loja a loja; a **curva ABC**; e, no fim, o **plano de contas completo** da loja, conta a conta. O botão **Caderno** baixa o cartão de todas as lojas num Excel pronto para imprimir. Escolha a loja no seletor do topo da aba. O orçado vem do Plano de Orçamentos de cada loja, e o ícone de prancheta marca todo número que sai dele.',
      placement: 'bottom',
    },
  ],
})
