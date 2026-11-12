import type { ModuleFaq } from '@gia-cb/sdk/modules'

export const faq: ModuleFaq = {
  summary:
    'O **Fechamento iFood Diário** monta o fechamento dos **pedidos iFood** de uma loja num dia, juntando **todas as operações da loja** (Coco Bambu, Express, Pizzaria, Dani, Vasto…). Ele junta duas fontes: os pedidos de delivery do **DW** (valores, incentivos, formas de pagamento) e as vendas de **todos os restaurantes da loja** na **API financeira do iFood** (se o pedido foi concluído ou cancelado, quem cancelou, total do parceiro, prazo de contestação). Cada forma de pagamento é classificada em **ONLINE**, **ONLINE VR** (vale-refeição e benefícios) ou **OFFLINE**, e os **cards** somam o que o financeiro precisa para fechar o dia: iFood online, iFood adquirentes, descontos da loja e do iFood e o desconto copart. Nada é gravado: a tela só consulta.',
  sections: [
    {
      id: 'primeiros-passos',
      title: 'Primeiros passos',
      content: `
## Montando o fechamento do dia

1. Escolha a **Loja** no seletor (dá para digitar parte do nome). O seletor lista
   as **lojas** do seu escopo, uma vez cada; a pesquisa junta **todas as operações**
   da loja (por exemplo, em *08.CB TERESINA*: Coco Bambu, Pizzaria e Vasto). Embaixo
   do nome aparecem as **operações da loja no iFood** (ex.: *3 operações no iFood: cb,
   pzcb, vst*); dá para buscar por elas também. A primeira da lista já vem
   selecionada. Loja marcada **Sem iFood** não tem restaurante do iFood no
   cadastro (veja *Erros comuns*).
2. Escolha o **Dia**. Ele já vem com *ontem* selecionado e não aceita datas futuras.
3. Clique em **Pesquisar**.

## Enquanto a pesquisa roda

Durante a busca, uma **faixa acima da tabela** mostra o andamento das duas etapas,
com a barra das páginas do iFood e o botão **Cancelar**:

- **Vendas no iFood** — as vendas do dia de **cada restaurante da loja no iFood**
  vêm em páginas de 20, várias ao mesmo tempo; a faixa mostra quantos restaurantes
  são, quantas páginas já chegaram (o total cresce à medida que cada restaurante diz
  quantas páginas tem) e quantas vendas;
- **Pedidos do delivery** — os pedidos da loja no dia vêm de uma vez só. Em loja
  grande é a parte mais demorada: pode levar até 1 minuto.

Até os **pedidos do delivery** chegarem, a tabela fica carregando. Assim que eles
chegam, a **tabela já aparece**, mesmo com vendas do iFood ainda chegando:

- o pedido que ainda não foi achado nas vendas do iFood fica **apagado**, com
  **Cancelamento = Aguardando iFood** — ele ainda não é OK nem Cancelado;
- a cada página do iFood que chega, os pedidos achados viram **OK** ou **Cancelado**;
- os **valores do dia** (os cards), o filtro pelos cards e o **Exportar** ficam
  esperando: só aparecem com as duas etapas completas, para nenhum número parcial
  ser tomado pelo fechamento do dia.

Dá para continuar usando o portal enquanto isso. **Cancelar** interrompe a pesquisa
e volta a tela para o começo.

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

Na barra ficam **sempre à vista 4 cards**: **iFood online**, **iFood adquirentes**,
**desconto copart** e **pagamentos sem classificação** (o que deveria ser zero). Os
outros 5 — **descontos offline e VR**, **descontos loja — online**, **descontos loja
— offline**, **descontos loja — VR** e **valor sem classificação** — abrem logo
abaixo pelo botão **Ver todos os totais (+5)**; aberto, ele vira **Ocultar os demais
totais**. Se um desses cards escondidos estiver filtrando a tabela, a parte de baixo
abre sozinha e só fecha quando o filtro sai. A conta de cada card está na tabela
acima.
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
| **Cancelamento** | **OK** quando o iFood diz que o pedido foi **concluído** (CONCLUDED) e não há origem de cancelamento; senão **Cancelado**. Durante a pesquisa, **Aguardando iFood** enquanto o pedido não foi achado nas vendas que já chegaram |
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
código curto do pedido no iFood, procurado em **todos os restaurantes da loja** no
iFood. O código curto pode se repetir entre restaurantes (e até no mesmo restaurante,
em horas diferentes): por isso o pedido e a venda também têm que ter a **mesma hora
de criação**. A coluna **Restaurante no iFood** mostra o restaurante em que o pedido
foi achado, e a coluna **Operação**, a operação dona dele (ex.: *17 cbx*). Do iFood
vêm: Confirmado (SIM quando concluído),
Total do parceiro (soma dos pagamentos no iFood), Tipo de pedido, Canal de venda,
ID do restaurante, os campos de cancelamento, a data limite de contestação e se
houve cancelamento parcial.

Pedido do DW que **não foi achado** no iFood fica com esses campos vazios e,
como não está confirmado, com **Cancelamento = Cancelado**. Para ver esses pedidos, filtre a coluna **Restaurante no iFood** pelos vazios
ou a coluna **Cancelamento** por *Cancelado*.

Os pedidos de **todas as marcas da loja no iFood** (Coco Bambu, Express, Pizzaria,
Dani, Vasto...) entram no fechamento e nos cards. Um pedido só fica sem cruzar
quando foi de fato cancelado antes de virar venda, ou quando é de um restaurante do
iFood que não está no cadastro da loja (nesse caso, avise o time do Portal GIA).

## Só pedidos do iFood

A tela mostra só os pedidos cujo **canal de venda** é o iFood: o canal que o
iFood informou, quando o pedido foi cruzado, ou o do DW, quando não foi. Pedidos
do App Coco Bambu, 99Food e outros canais ficam de fora. Os canais **iFood** e
**iFood Vasto** do DW entram os dois: a loja vê o dia de todas as operações juntas.
Para ver uma operação só, filtre a coluna **Operação** ou **Restaurante no iFood**.
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
- **Vendas do iFood**: API financeira do iFood (Merchant API, vendas do dia) de cada
  restaurante da loja no iFood — um por operação com integração iFood no cadastro
  (Coco Bambu, Express, Pizzaria, Dani, Vasto…).
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
          a: 'O Cancelamento vem do iFood: só é OK quando a API financeira do iFood diz que o pedido foi concluído (CONCLUDED) e não há origem de cancelamento. Se o pedido não foi achado em nenhum restaurante da loja no iFood (o Nº parceiro e a hora do DW não bateram com nenhuma venda), ele fica como Cancelado. Nesses pedidos as colunas Restaurante no iFood e Operação ficam vazias.',
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
          q: 'Por que a pesquisa demora em algumas lojas?',
          a: 'O tempo é quase todo da etapa Pedidos do delivery, que traz todos os pedidos da loja no dia de uma vez — numa loja grande, até 1 minuto. As vendas do iFood de cada restaurante da loja vêm em paralelo, várias páginas ao mesmo tempo, e costumam terminar antes. O andamento de cada etapa aparece na faixa acima da tabela; se precisar, use Cancelar.',
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
          a: 'O seletor lista as lojas (Empresas) do seu escopo no portal. Se a sua loja não aparece, ela não está no seu escopo — peça ao gestor para conferir.',
        },
        {
          q: 'Quero ver só o Vasto (ou só o Express) da loja. Como faço?',
          a: 'A pesquisa traz todas as operações da loja juntas. Filtre a coluna Operação (ex.: 08 vst) ou Restaurante no iFood pelo funil, no computador, ou use a busca, no celular. Os cards continuam sendo do dia inteiro da loja.',
        },
      ],
    },
    {
      category: 'Erros comuns',
      items: [
        {
          q: 'Apareceu "A loja não tem restaurante do iFood no cadastro". O que faço?',
          a: 'Nenhuma operação da loja tem a integração iFood (o identificador do restaurante no iFood) no cadastro. Sem ela não dá para cruzar com o iFood, e todos os pedidos ficam como Cancelado. Peça ao time do Portal GIA para cadastrar a integração iFood das operações da loja.',
        },
        {
          q: 'O aviso amarelo começa com o nome de um restaurante (ex.: "Coco Bambu Express (17 cbx): …"). O que quer dizer?',
          a: 'Que a falha foi só na parte do iFood daquele restaurante. Os pedidos dele que não vieram ficam como Cancelado; os dos outros restaurantes da loja estão certos. Pesquise de novo em alguns minutos. Se o aviso for 403, o restaurante não autorizou o aplicativo da Coco Bambu no Portal do Parceiro do iFood: avise o time do Portal GIA.',
        },
        {
          q: 'Apareceu um aviso de que a API do iFood respondeu com erro. Os números valem?',
          a: 'Não confie nos cards desse dia: os pedidos que não vieram do iFood ficam como Cancelado e saem dos cards. Pesquise de novo em alguns minutos. Se o aviso falar de credencial (403/503), avise o administrador do portal.',
        },
        {
          q: 'A tabela mostrou uma mensagem de erro no lugar dos pedidos. O que faço?',
          a: 'O título diz o tipo do problema e a primeira frase diz qual sistema falhou (a API de delivery do DW, a API do iFood ou o banco do Maestro). "Um sistema não respondeu agora" costuma passar em alguns minutos: clique em Tentar de novo. "Sem conexão com o portal" é a sua internet ou a VPN: a pesquisa é refeita sozinha quando a conexão volta. "Algo deu errado do nosso lado" é configuração ou resposta inesperada: tente de novo e, se continuar, avise o suporte. "Você não tem acesso a isso" só o gestor resolve.',
        },
        {
          q: 'Para que serve "Ver detalhes técnicos"?',
          a: 'Mostra o que a tela pediu e o que voltou, com a hora e o ID da chamada, para o suporte achar o problema. Use Copiar tudo para colar no chamado ou Baixar diagnóstico para anexar o arquivo. Senhas e tokens nunca aparecem, campos de dado pessoal ficam ocultos e o arquivo traz só as falhas desta tela.',
        },
        {
          q: 'Apareceu "A loja não tem número de loja no cadastro". O que faço?',
          a: 'O DW identifica a loja pelo número (ex.: "54"), que sai do vínculo com a BI da loja ou do começo do nome dela ("54.CB MINAS SHOPPING"). Se a loja não tem nenhum dos dois, peça ao time do Portal GIA para corrigir o cadastro.',
        },
        {
          q: 'A pesquisa voltou sem nenhum pedido. Está certo?',
          a: 'Pode estar: a loja pode não ter tido pedido iFood no dia. Se você esperava pedidos, confira a loja e o dia e avise o suporte.',
        },
      ],
    },
  ],
}
