import { defineTour } from '@gia-cb/sdk/modules'

export const tour = defineTour({
  module_id: 'fechamento-ifood-mensal',
  steps: [
    {
      id: 'filtros',
      screen: '/fechamento-ifood-mensal',
      target: '[data-tour="fechamento-ifood-mensal-filtros"]',
      title: 'Loja e mês',
      body: 'Escolha a **loja** e o **mês de referência** (o padrão é o mês anterior). O fechamento junta **todas as operações da loja** (Coco Bambu, Express, Pizzaria, Vasto…); embaixo do nome aparecem as operações no iFood, ou **Sem iFood**.',
      placement: 'bottom',
    },
    {
      id: 'consultar',
      screen: '/fechamento-ifood-mensal',
      target: '[data-tour="fechamento-ifood-mensal-consultar"]',
      title: 'Consultar',
      body: 'Busca os lançamentos do mês no iFood (em partes de até 8 dias, ao mesmo tempo) e o borderô da loja. As abas abrem antes do fim e os lançamentos vão entrando; os dias ainda em espera aparecem apagados. Clique em **Consultar** para o tour continuar no resultado.',
      placement: 'bottom',
    },
    {
      id: 'abas',
      screen: '/fechamento-ifood-mensal',
      target: '[data-tour="fechamento-ifood-mensal-abas"]',
      title: 'As abas do fechamento (embaixo)',
      body: 'Depois de consultar, as abas ficam **embaixo da tabela**, com o total de registros da aba e quantos itens estão alterados. **Lançamentos** é o que veio do iFood; **Online** e **Adquirentes** conferem dia a dia com o caixa; **Conferência** é o DRE; depois vêm Extrato, Recebimento e Cancelados pós.',
      placement: 'top',
    },
    {
      id: 'conteudo',
      screen: '/fechamento-ifood-mensal',
      target: '[data-tour="fechamento-ifood-mensal-conteudo"]',
      title: 'Conferindo e preenchendo',
      body: 'Os cards de totais ficam acima da tabela; clicar num card de diferença mostra só os dias a conferir. As colunas com **#** são a diferença iFood × caixa. Nos campos digitáveis, o valor entra ao sair do campo; nada é gravado até clicar em **Salvar**. A FAQ explica cada coluna.',
      placement: 'top',
    },
    {
      id: 'historico',
      screen: '/fechamento-ifood-mensal',
      target: '[data-tour="fechamento-ifood-mensal-historico"]',
      title: 'Histórico',
      body: 'Na barra de filtros, ao lado do Salvar, depois de consultar. Mostra cada gravação do mês: quem salvou, quando e o antes → depois de cada campo e de cada linha do extrato e dos cancelados.',
      placement: 'bottom',
    },
    {
      id: 'salvar',
      screen: '/fechamento-ifood-mensal',
      target: '[data-tour="fechamento-ifood-mensal-salvar"]',
      title: 'Salvar',
      body: 'Grava o que você preencheu no mês (previsões, *CB Desc. LOJA*, comentários, breakdown, extrato e cancelados). Só acende quando há alteração não salva. Aparece para quem tem permissão de edição.',
      placement: 'bottom',
    },
  ],
})
