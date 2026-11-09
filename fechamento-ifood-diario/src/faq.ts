import type { ModuleFaq } from '@gia-cb/sdk/modules'

export const faq: ModuleFaq = {
  summary:
    'O **Fechamento iFood Diário** monta o fechamento dos **pedidos iFood** de uma loja num dia. Ele junta duas fontes: os pedidos de delivery do **DW** (valores, incentivos, formas de pagamento) e as vendas da **API financeira do iFood** (se o pedido foi concluído ou cancelado, quem cancelou, total do parceiro, prazo de contestação). Cada forma de pagamento é classificada em **ONLINE**, **ONLINE VR** (vale-refeição e benefícios) ou **OFFLINE**, e os **cards** somam o que o financeiro precisa para fechar o dia: iFood online, iFood adquirentes, descontos da loja e do iFood e o desconto copart. Nada é gravado: a tela só consulta.',
  sections: [
    {
      id: 'primeiros-passos',
      title: 'Primeiros passos',
      content: `
## Montando o fechamento do dia

1. Escolha a **Loja** no seletor (dá para digitar parte do nome). O seletor lista
   **todas as operações** do seu escopo — uma loja com duas bandeiras aparece duas
   vezes (ex.: *08.CB TERESINA* e *08.VST TERESINA*). A primeira da lista já vem
   selecionada. Loja marcada **Sem iFood** não tem a integração com o iFood no
   cadastro (veja *Erros comuns*).
2. Escolha o **Dia**. Ele já vem com *ontem* selecionado e não aceita datas futuras.
3. Clique em **Pesquisar**.

Depois de pesquisar, a tela mostra, de cima para baixo:

- **avisos** sobre a parte do iFood, quando há algum (em amarelo);
- os **cards** do dia (botão **Totais**, que mostra e esconde os cards);
- a **tabela de pedidos iFood**: uma linha por pedido. Pedidos com **Cancelamento = Cancelado** ficam com o fundo levemente
  vermelho.

Se você mudar a loja ou o dia depois de pesquisar, a tela continua mostrando a
pesquisa anterior até você clicar em **Pesquisar** de novo. Se nada mudou, o
botão fica desativado.

## No celular

- Ao tocar em **Pesquisar**, a barra com a loja e o dia **se recolhe** para a
  tela ficar para o resultado. Toque na **seta** do cabeçalho para abrir de novo
  e fazer outra pesquisa. Se a pesquisa for recusada (sem loja, dia inválido ou
  nada mudou), a barra continua aberta para você corrigir.
- A tabela vira uma **lista de cards**: na frente ficam o número do pedido, a
  hora, o total, o Cancelamento e o Status; o resto fica em **ver mais**. Há
  um campo de **busca** que procura em todas as colunas.
- No celular não há dicas ao passar o dedo: os botões mostram o nome por extenso
  e a explicação de cada card está nesta FAQ (seção *Os cards do dia*).
`,
    },
    {
      id: 'cards',
      title: 'Os cards do dia',
      content: `
## O que cada card soma

Os cards seguem a planilha do financeiro. Duas regras valem para
quase todos:

- só entram pedidos com **Cancelamento = OK**;
- só entram pedidos com **um tipo de pagamento só**. Um pedido pago parte em
  ONLINE e parte em OFFLINE (Status "ONLINE; OFFLINE") **não entra** em nenhum
  card de tipo; ele entra só no **Desconto copart**.

| Card | Conta |
|---|---|
| **iFood online** | pedidos só ONLINE: Total do pedido − Desconto copart |
| **Descontos offline e VR** | pedidos só OFFLINE ou só ONLINE VR: incentivo promocional do iFood |
| **iFood adquirentes** | pedidos só ONLINE VR: Total do pedido − incentivo promocional do iFood − Desconto copart |
| **Descontos loja — online** | pedidos só ONLINE: incentivo promocional da loja |
| **Descontos loja — offline** | pedidos só OFFLINE: incentivo promocional da loja |
| **Descontos loja — VR** | pedidos só ONLINE VR: incentivo promocional da loja |
| **Desconto copart** | todos os pedidos OK: Desconto copart |
| **Valor sem classificação** | valor das formas de pagamento sem nome, de **todos** os pedidos (OK ou não) |
| **Pagamentos sem classificação** | quantas formas de pagamento ficaram sem classificação |

No computador, passe o mouse sobre um card para ver a conta.

## Cada card é um filtro

Clique (ou toque) num card e a tabela passa a mostrar **só os pedidos que entram
naquela conta**. O card fica marcado e aparece, na barra da tabela, um botão com
o nome dele: clique nele (ou no card de novo) para voltar a ver todos. Pesquisar
de novo também tira o filtro. Os valores dos cards **não mudam** com o filtro —
são sempre do dia inteiro. Card zerado não tem pedido para mostrar e não filtra.
O filtro vale para o **Exportar**.

O card **Pagamentos sem classificação** fica **vermelho** quando há alguma forma
sem classificação; embaixo dos cards aparece a lista das **formas não
mapeadas**. Sem nenhuma, ele mostra **0** em verde.

## Mostrar e esconder os cards

O botão **Totais**, na barra da tabela, mostra e esconde os cards. Eles nascem
abertos no computador com tela de 700 px de altura ou mais e fechados nas telas
mais baixas e no celular, para sobrar espaço para a tabela.
`,
    },
    {
      id: 'regras',
      title: 'Como cada coluna é calculada',
      content: `
## Colunas calculadas

| Coluna | Regra |
|---|---|
| **Total do pedido** | Taxa de entrega + Valor dos itens − Incentivo promocional da loja |
| **Desconto copart** | Incentivo promocional do iFood − Taxa de serviço |
| **iFood reembolsa?** | incentivo da loja **0** → N/A; **12** → SIM; até **10** → NÃO; outro valor → VERIFICAR |
| **Cancelamento** | **OK** quando o iFood diz que o pedido foi **concluído** (CONCLUDED) e não há origem de cancelamento; senão **Cancelado** |
| **Status** | o tipo de cada forma de pagamento do pedido (ONLINE, ONLINE VR, OFFLINE), separados por "; " |
| **Data** | o dia pesquisado |

O **Total do pedido** é calculado: ele não é o total pago que vem do DW.

## Tipo de cada forma de pagamento

A coluna *Formas de pagamento* traz o texto do DW, por exemplo
\`CREDIT ONLINE VISA - PRE PAGO (127.7), BENEFICIO IFOOD - PRE PAGO (10.0)\`.
Cada trecho é classificado nesta ordem:

1. trecho **sem nome** ou **DESCONHECIDO** → **sem classificação**;
2. trecho que contém uma forma **ONLINE VR** do cadastro de formas de pagamento
   do Maestro (por exemplo *ALELO*, *TICKET*, *PLUXEE*, *VR*), da mesma origem
   do pedido ou sem origem → **ONLINE VR**;
3. trecho que termina em **- PRE PAGO** → **ONLINE** (pago antes, no iFood);
4. qualquer outro → **OFFLINE** (pago na entrega).

O número do cartão mascarado (\`**** 1234 - \`) é ignorado na comparação.

## Pedido cruzado com o iFood

O pedido do DW é ligado à venda do iFood pelo **Nº parceiro** do DW, que é o
código curto do pedido no iFood, procurado no restaurante da loja no iFood. A
coluna **Restaurante no iFood** mostra esse restaurante. Do iFood vêm: Confirmado (SIM quando concluído),
Total do parceiro (soma dos pagamentos no iFood), Tipo de pedido, Canal de venda,
ID do restaurante, os campos de cancelamento, a data limite de contestação e se
houve cancelamento parcial.

Pedido do DW que **não foi achado** no iFood fica com esses campos vazios e,
como não está confirmado, com **Cancelamento = Cancelado**. Para ver esses pedidos, filtre a coluna **Restaurante no iFood** pelos vazios
ou a coluna **Cancelamento** por *Cancelado*.

Os pedidos de **outras marcas da loja no iFood** (Coco Bambu Express, Pizzaria,
Dani...) estão no DW junto com os da loja, mas são de outro restaurante no iFood:
eles não são achados e aparecem como **Cancelado**, fora dos cards.

## Só pedidos do iFood — e só da operação escolhida

A tela mostra só os pedidos cujo **canal de venda** é o iFood: o canal que o
iFood informou, quando o pedido foi cruzado, ou o do DW, quando não foi. Pedidos
do App Coco Bambu, 99Food e outros canais ficam de fora.

Quando a loja tem duas operações (por exemplo *08.CB TERESINA* e *08.VST
TERESINA*), cada uma mostra só os seus pedidos: a do CB, os do canal **iFood**; a
do Vasto, os do canal **iFood Vasto**, cruzados com o restaurante do Vasto no iFood.
`,
    },
    {
      id: 'tabela',
      title: 'Tabela, colunas e Excel',
      content: `
## Colunas

Algumas colunas são **obrigatórias** e
ficam sempre visíveis: Total do pedido, Nº pedido, Data hora pedido, Formas de
pagamento e Canal de venda. As colunas de **cancelamento**, *Confirmado*, *Tipo
de pedido*, *Agendado* e *Tem cancelamento parcial?* começam **desligadas**:
ligue no botão de **colunas** da barra da tabela.

No computador, filtre pelo **funil** de cada coluna e ordene clicando no título.
No celular, use o campo de **busca**.

## Exportar para Excel

Com a permissão de exportação, o botão **Exportar** gera um Excel com duas abas:

- **Resumo** — os cards do dia (sempre do dia inteiro) e a lista das formas sem
  classificação;
- **Pedidos** — os pedidos que estão na tela, com todas as colunas da grade e uma
  linha **Total** no fim (que acompanha o filtro do Excel).

Se a tabela estava filtrada (por um card, pelo funil ou pela busca), o Excel sai
com os pedidos filtrados e o subtítulo da aba avisa.
`,
    },
    {
      id: 'origem-dos-dados',
      title: 'De onde vêm os dados',
      content: `
- **Pedidos**: API de delivery do DW (\`api-dw.cocobambu.com\`), pela loja e
  pelo dia. A loja é identificada pelo número dela (o "01" de "01.CB GOIANIA").
- **Vendas do iFood**: API financeira do iFood (Merchant API, vendas do dia), pelo
  identificador da loja no iFood que fica no cadastro de Empresas do portal.
- **Formas ONLINE VR**: cadastro de formas de pagamento do Maestro
  (\`gia_relatorios.formas_pagamento\`), lido a cada pesquisa.

A consulta é feita na hora do clique. Nada é gravado no portal.
`,
    },
  ],
  qa: [
    {
      category: 'Fechamento',
      items: [
        {
          q: 'Por que um pedido entregue aparece como Cancelado?',
          a: 'O Cancelamento vem do iFood: só é OK quando a API financeira do iFood diz que o pedido foi concluído (CONCLUDED) e não há origem de cancelamento. Se o pedido não foi achado no iFood (o Nº parceiro do DW não bateu com nenhuma venda), ele fica como Cancelado. Nesses pedidos a coluna Restaurante no iFood fica vazia.',
        },
        {
          q: 'Por que um pedido OK não entrou em iFood online nem em iFood adquirentes?',
          a: 'Porque ele tem formas de pagamento de mais de um tipo (Status com "; ", como "ONLINE; OFFLINE"). Os cards de tipo só somam pedidos com um tipo só, como a planilha do financeiro. Ele entra só no Desconto copart.',
        },
        {
          q: 'O que é o Desconto copart?',
          a: 'É o incentivo promocional do iFood menos a taxa de serviço do pedido. O card soma o de todos os pedidos OK, de qualquer tipo.',
        },
        {
          q: 'O que significa iFood reembolsa?',
          a: 'Olha o incentivo promocional da loja: 0 → N/A (não há o que reembolsar), 12 → SIM, até 10 → NÃO, qualquer outro valor → VERIFICAR (confira o pedido no portal do iFood).',
        },
        {
          q: 'Por que o Total do pedido é diferente do total pago no DW?',
          a: 'Porque ele é calculado: Taxa de entrega + Valor dos itens − Incentivo promocional da loja. É a regra da planilha do financeiro.',
        },
        {
          q: 'Apareceu valor em "Valor sem classificação". O que faço?',
          a: 'Alguma forma de pagamento veio sem nome ou como DESCONHECIDO. Clique no card Pagamentos sem classificação para ver esses pedidos e confira no DW ou no iFood. A lista das formas fica embaixo dos cards.',
        },
        {
          q: 'Um vale-refeição entrou como ONLINE ou OFFLINE em vez de ONLINE VR. Por quê?',
          a: 'O nome dele não está no cadastro de formas ONLINE VR do Maestro. Peça ao time de TI/Sistemas para incluir a forma no cadastro; a próxima pesquisa já classifica certo.',
        },
        {
          q: 'Posso cadastrar ou mudar a classificação de uma forma de pagamento aqui?',
          a: 'Não. Esta tela só consulta. O cadastro de formas de pagamento é do Maestro e é mantido pelo time de TI/Sistemas.',
        },
      ],
    },
    {
      category: 'Operações',
      items: [
        {
          q: 'Posso ver mais de um dia de uma vez?',
          a: 'Não: o fechamento é de um dia por vez. Pesquise cada dia.',
        },
        {
          q: 'Os cards não mudaram quando filtrei a tabela. Está certo?',
          a: 'Sim. Os cards são sempre do dia inteiro. O filtro (card, funil ou busca) muda só a tabela e o Excel.',
        },
        {
          q: 'Como vejo quais pedidos formam um card?',
          a: 'Clique (ou toque) no card. A tabela mostra só os pedidos que somaram nele. Clique de novo no card, ou no botão com o nome dele, para ver todos.',
        },
        {
          q: 'No celular a barra da loja e do dia sumiu depois de pesquisar. Como faço outra pesquisa?',
          a: 'Ela se recolhe para a tela ficar para o resultado. Toque na seta do cabeçalho para abrir de novo.',
        },
        {
          q: 'Mudei a loja ou o dia, mas a tabela continua igual. Por quê?',
          a: 'A tela só troca o resultado quando você clica em Pesquisar. Se nada mudou desde a última pesquisa, o botão fica desativado.',
        },
      ],
    },
    {
      category: 'Permissões',
      items: [
        {
          q: 'Por que não vejo o botão Exportar?',
          a: 'Exportar pede a permissão "Exportar o fechamento e os pedidos iFood em Excel" (fechamento-ifood-diario.exportar). Peça ao gestor do seu grupo.',
        },
        {
          q: 'Por que minha loja não aparece no seletor?',
          a: 'O seletor lista todas as operações do seu escopo no portal. Se a sua loja não aparece, a operação dela não está no seu escopo — peça ao gestor para conferir.',
        },
      ],
    },
    {
      category: 'Erros comuns',
      items: [
        {
          q: 'Apareceu "A Empresa desta operação não tem a integração com o iFood no cadastro". O que faço?',
          a: 'A Empresa dona da operação não tem o identificador da loja no iFood (merchant) no cadastro de Empresas. Sem ele não dá para cruzar com o iFood, e todos os pedidos ficam como Cancelado. Peça ao time do Portal GIA para cadastrar a integração iFood da loja.',
        },
        {
          q: 'Apareceu um aviso de que a API do iFood respondeu com erro. Os números valem?',
          a: 'Não confie nos cards desse dia: os pedidos que não vieram do iFood ficam como Cancelado e saem dos cards. Pesquise de novo em alguns minutos. Se o aviso falar de credencial (403/503), avise o administrador do portal.',
        },
        {
          q: 'A tela mostrou "Não foi possível consultar os dados". O que faço?',
          a: 'Leia a mensagem: ela diz o motivo. "Demorou demais" ou "respondeu 5xx" é instabilidade da API do DW; "cadastro de formas de pagamento" é falha no banco do Maestro. Nos dois casos, clique em Tentar de novo em alguns minutos.',
        },
        {
          q: 'Apareceu "A operação não tem número de loja no código". O que faço?',
          a: 'O DW identifica a loja pelo número (ex.: "54"), que sai do começo do código da operação ("54 cb"). Se o código não começa por um número, peça ao time do Portal GIA para corrigir o cadastro da operação.',
        },
        {
          q: 'A pesquisa voltou sem nenhum pedido. Está certo?',
          a: 'Pode estar: a loja pode não ter tido pedido iFood no dia. Se você esperava pedidos, confira a loja e o dia e avise o suporte.',
        },
      ],
    },
  ],
}
