import type { ModuleFaq } from '@gia-cb/sdk/modules'

export const faq: ModuleFaq = {
  summary:
    'O **Couvert** mostra, durante o turno, as **mesas abertas** de um salão e confere se o **couvert artístico** e o **buffet** lançado no Simphony bate com o **número de pessoas** de cada mesa. Assim dá para corrigir no PDV **antes de fechar a conta**. A tela só consulta: nada é alterado no Simphony.',
  sections: [
    {
      id: 'pesquisar',
      title: 'Como pesquisar',
      content: `
## Loja e RVC

1. Escolha a **loja**. Só aparecem as lojas com vínculo com a BI do Simphony.
2. Escolha o **RVC** — o salão (Restaurante, Varanda…). O primeiro salão da loja já
   vem escolhido.
3. Clique em **Pesquisar**.

A tela abre com a **última loja e o último salão** que você pesquisou já escolhidos,
mas só busca as mesas quando você clicar.

Com as mesas na tela, a barra fica numa linha só. Se você não mudou a loja nem o RVC,
o botão vira **Atualizar** e busca as mesas de novo; trocando a loja ou o RVC, ele
volta a ser **Pesquisar**.

## O dia

A pesquisa traz as contas **abertas agora**, do **dia de negócio aberto** na loja —
o que o Simphony informa. Depois da meia-noite, as mesas do turno que ainda não
fechou continuam aparecendo. Conta fechada ou cancelada não aparece. O dia aparece na
dica do botão Atualizar.
      `,
    },
    {
      id: 'card',
      title: 'Como ler o card da mesa',
      content: `
Cada mesa aberta é um card:

- **à esquerda**, o quadrinho com a **nota musical** e o número de **couverts
  artísticos** lançados na conta;
- **à direita**, a **mesa** em destaque e, depois da barra, o **grupo** da mesa
  (\`45/2\` = mesa 45, grupo 2);
- embaixo, o ícone de pessoas com o **número de pessoas** da conta;
- **à direita**, o quadrinho do **buffet** (tampa de travessa), com o número de buffets lançados. Ele
  aparece em toda loja; na loja sem itens de buffet configurados fica sempre em 0 (e
  amarelo, porque nada foi lançado), mas aí ele **não conta** para a situação da mesa
  nem para os chips.

Couvert e buffet são a soma das quantidades dos itens configurados para a loja como
programação artística e como buffet.

## As cores

| Card | Situação | Quando |
| --- | --- | --- |
| neutro | **Tudo lançado** | couvert (e buffet) igual ao número de pessoas |
| amarelo | **Sem lançamento** | mesa com pessoas e nenhum couvert (ou buffet) lançado |
| vermelho | **Divergente** | couvert (ou buffet) diferente do número de pessoas, ou lançado numa mesa com 0 pessoas |
| neutro, com o selo "sem pessoas" | **Sem pessoas** | mesa com 0 pessoas e nenhum couvert ou buffet lançado |

Cada quadrinho tem a cor da situação dele; a borda do card fica com a **pior** das
duas (vermelho antes de amarelo). No quadrinho vermelho, o **selo** no alto diz a
diferença:

- **−2**: faltam 2 couverts (ex.: 4 pessoas e 2 couverts);
- **+1**: há 1 couvert a mais (ex.: 3 pessoas e 4 couverts);
A mesa com o selo **sem pessoas** está com 0 pessoas na conta. Selo cinza: nada foi
lançado. Selo vermelho: já há couvert ou buffet lançado. Nos dois casos, lance o número de
pessoas no PDV para conferir o couvert.
      `,
    },
    {
      id: 'detalhe',
      title: 'Detalhe da conta da mesa',
      content: `
Toque num card para ver a **conta aberta** da mesa:

- **à esquerda**: couvert, pessoas e buffet; o **garçom**, as **rodadas** de pedido, a
  hora do **último lançamento** e se a **pré-conta** já foi impressa; e os valores
  (subtotal, desconto, taxa de serviço, total, pago e **saldo a pagar**);
- **à direita**: o aviso do que falta (ex.: "Faltam 2 couverts") e **todos os itens**
  da conta, com quantidade, **assento**, rodada, hora e valor. Os itens de couvert e
  de buffet aparecem em destaque.

O assento mostra quem pediu o quê: se o couvert foi lançado só nos assentos 1 e 2 de
uma mesa com 4 pessoas, faltam os assentos 3 e 4. Os nomes dos itens e do garçom
podem levar alguns segundos para aparecer; até lá aparecem os códigos. A conta é a da
última busca: para ver o que mudou no PDV, feche e clique em **Atualizar**.
      `,
    },
    {
      id: 'chips',
      title: 'Filtrar, buscar e ordenar',
      content: `
## Chips de situação

Acima das mesas, os chips contam quantas mesas há em cada situação:
**Todas**, **Divergentes**, **Sem lançamento**, **Sem pessoas** e **Tudo lançado**. Clique num chip
para ver **só aquelas mesas**; clique de novo (ou em **Todas**) para ver todas. Chip
com 0 mesas fica apagado e não filtra.

Os números dos chips são do salão inteiro: não mudam com o filtro nem com a busca.
Pesquisar outro salão volta para **Todas**.

## Busca

O campo **Mesa** mostra só as mesas cujo nome tem o que você digitou: "3" mostra as
mesas 3, 31, 303…

## Ordem

- **Mesa**: pelo número da mesa.
- **Atenção**: primeiro as **divergentes**, depois as **sem lançamento** e as **sem pessoas**, por último
  as que estão com **tudo lançado**.
      `,
    },
    {
      id: 'atualizar',
      title: 'Atualizar, exportar e tela cheia',
      content: `
## Atualizar

As mesas **não se atualizam sozinhas**. Depois de corrigir no PDV, clique em
**Atualizar** no alto para buscar de novo. Na linha dos chips aparece há quanto tempo
foi a última busca ("atualizado há 3 min"); com o mouse sobre o botão Atualizar, o dia
de negócio e a hora exata.

## Exportar

O botão **Exportar** baixa uma planilha Excel com as mesas **que estão na tela** —
com o chip e a busca que estiverem ligados: mesa, grupo, pessoas, couvert artístico,
buffet e situação. O subtítulo da planilha diz o dia de negócio, a
hora das mesas e o filtro usado. Aparece só para quem tem a permissão
\`couvert.exportar\`.

## Tela cheia

O botão ao lado do Atualizar põe a tela em **tela cheia**, escondendo o menu do
portal — bom para deixar aberta num tablet ou monitor do salão. **Esc** ou o mesmo
botão saem dela.
      `,
    },
    {
      id: 'celular',
      title: 'No celular',
      content: `
- Ao pesquisar, a barra de filtros **se recolhe** e a tela fica para as mesas. A
  **seta** no cabeçalho abre a barra de novo para trocar de loja ou de salão.
- Os cards ficam em **duas colunas**; os chips rolam para o lado.
- Os botões **Atualizar** (com o tempo desde a última busca) e **Exportar** ficam
  acima das mesas.
- A tela cheia só aparece no computador e no tablet.
      `,
    },
  ],
  qa: [
    {
      category: 'Mesas e cores',
      items: [
        {
          q: 'Por que uma mesa não aparece?',
          a: 'A tela mostra só as contas **abertas** do salão escolhido, no dia de negócio aberto na loja. Conta já fechada, cancelada, ou de outro salão (RVC) não aparece. Confira o RVC no alto e clique em **Atualizar**.',
        },
        {
          q: 'O que faço com uma mesa vermelha?',
          a: 'Veja o selo: **−N** quer dizer que faltam N couverts — lance no PDV; **+N**, que há couvert a mais que pessoas — confira o número de pessoas ou estorne o couvert. Depois clique em **Atualizar**.',
        },
        {
          q: 'O que é a mesa com o selo "sem pessoas"?',
          a: 'É uma conta aberta com **0 pessoas**. **Sem couvert nem buffet lançado**, ela fica neutra e entra no chip **Sem pessoas**. **Com couvert ou buffet lançado**, fica vermelha e entra em **Divergentes**: lance o número de pessoas no PDV ou estorne o lançamento, e clique em **Atualizar**.',
        },
        {
          q: 'E uma mesa amarela?',
          a: 'É uma mesa com pessoas e **nenhum couvert artístico lançado**. Lance o couvert no PDV, se a mesa deve pagar, e clique em **Atualizar**.',
        },
        {
          q: 'Os cards mudam sozinhos?',
          a: 'Não. A tela é uma foto do momento da busca. Para ver o que mudou no PDV, clique em **Atualizar**. O "atualizado há N min" no alto diz há quanto tempo foi a busca.',
        },
        {
          q: 'Quais itens contam como couvert e como buffet?',
          a: 'Os itens do cardápio configurados no cadastro da loja como **programação artística** (couvert) e como **buffet**. O couvert da mesa é a soma das quantidades desses itens na conta; o buffet, o mesmo com os itens de buffet. Item que falta nessa configuração não é contado: avise o time do Portal GIA.',
        },
        {
          q: 'O buffet da minha loja fica sempre em 0. Por quê?',
          a: 'A loja não tem itens de buffet configurados no cadastro, então nada é contado como buffet. Nesse caso o buffet não entra na situação da mesa nem nos chips: a tela confere só o couvert artístico. Se a loja tem buffet, avise o time do Portal GIA para configurar os itens.',
        },
      ],
    },
    {
      category: 'Lojas e configuração',
      items: [
        {
          q: 'Por que a tela já abriu com uma loja escolhida?',
          a: 'Ela guarda a **última loja e o último salão** que você pesquisou, para você só clicar em Pesquisar. Se a loja não estiver mais liberada para você, a tela abre sem loja.',
        },
        {
          q: 'Minha loja não aparece na lista.',
          a: 'Só aparecem as lojas ativas, liberadas para o seu usuário e com vínculo com a BI do Simphony no cadastro do portal. Se falta alguma, peça ao time do Portal GIA.',
        },
        {
          q: 'Aparece "Loja sem RVC configurado" ou "sem itens de couvert configurados".',
          a: 'Os salões (RVCs) e os itens que contam como couvert artístico são configurados por loja. Enquanto a loja não tem essa configuração, a tela não consegue conferir. Avise o time do Portal GIA.',
        },
      ],
    },
    {
      category: 'Erros',
      items: [
        {
          q: 'Apareceu uma mensagem de erro. E agora?',
          a: 'A mensagem diz o tipo do problema e de onde veio (lista de lojas ou mesas da BI do Simphony). A BI às vezes demora mais de um minuto para responder; se foi isso (ou se ela não respondeu), **Tentar de novo** costuma resolver. Se a mensagem fala da credencial ou do cadastro, avise o time do Portal GIA — em **Ver detalhes técnicos** dá para copiar ou baixar o diagnóstico.',
        },
      ],
    },
  ],
}
