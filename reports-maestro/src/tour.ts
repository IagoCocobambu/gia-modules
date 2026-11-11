import { defineTour } from '@gia-cb/sdk/modules'

// O tour da TELA, montado pelo portal: só o que aparece nas duas abas (loja e
// período, Pesquisar e as abas). O portal não avisa o módulo quando o passo muda,
// então um passo daqui não troca a aba — o que é de cada aba está no tour das
// abas (`tour-das-abas.ts`), que o próprio módulo monta e que vem logo depois.

export const tour = defineTour({
  module_id: 'reports-maestro',
  steps: [
    {
      id: 'filtros',
      screen: '/reports-maestro',
      target: '[data-tour="reports-maestro-filtros"]',
      title: 'Loja e período',
      body: 'Escolha a **loja** e as **datas** (no máximo 31 dias, sem datas futuras). As datas começam em *ontem*.',
      placement: 'bottom',
    },
    {
      id: 'pesquisar',
      screen: '/reports-maestro',
      target: '[data-tour="reports-maestro-pesquisar"]',
      title: 'Pesquisar',
      body: 'Busca os pedidos de delivery da loja no Maestro. Períodos longos levam alguns segundos — até ~45 s para 31 dias. Ao terminar, a tabela mostra os pedidos e os botões **Filtros** e **Totais** do cabeçalho da tabela passam a funcionar.',
      placement: 'bottom',
    },
    {
      id: 'abas',
      screen: '/reports-maestro',
      target: '[data-tour="reports-maestro-abas"]',
      title: 'Operacional e Pedidos',
      body: '**Operacional** é a aba em que a tela abre: o dashboard da loja e do período — quanto tempo o pedido leva dentro da loja (aceite, preparo, expedição), em que dias e horários trava e quem cancela. **Pedidos** é a lista, pedido a pedido. Em seguida, o tour mostra cada parte das duas abas, trocando de aba sozinho — se você ainda não pesquisou, ele continua assim que a primeira pesquisa trouxer pedidos. As duas abas usam a mesma busca: trocar de aba não pesquisa de novo (31 dias levam até ~45 s).',
      placement: 'bottom',
    },
  ],
})
