import type { ModuleFaq } from '@gia-cb/sdk/modules'

export const faq: ModuleFaq = {
  summary:
    'O **Pagamento eCheck** mostra os **pagamentos eCheck** de uma loja num período e numa faixa de horário: cada transação, com data e hora, modalidade, bandeira, status e valor. Mostra também o **valor total**, o número de **transações** e o **ticket médio**, os **gráficos** por hora e por método de pagamento, e exporta a lista em Excel. Os dados vêm da API do DW na hora da pesquisa; nada é gravado no portal.',
  sections: [
    {
      id: 'primeiros-passos',
      title: 'Primeiros passos',
      content: `
## Fazendo uma pesquisa

1. Escolha a **Loja** no seletor (dá para digitar parte do nome). A primeira loja
   da lista já vem selecionada.
2. Informe a **Data inicial** e a **Data final** — as duas começam em *ontem*.
3. Ajuste a **Hora inicial** e a **Hora final** — começam em **08:00** e **23:59**.
4. Clique em **Pesquisar**.

Depois de pesquisar, a tela mostra, de cima para baixo:

- a **barra de totais**, com 5 indicadores (no celular, ela abre pelo botão **Totais**);
- a **tabela de transações**, das mais recentes para as mais antigas.

Enquanto nenhum filtro muda, o botão **Pesquisar** fica desativado — o resultado
na tela já é o da pesquisa. Mude a loja, uma data ou uma hora para pesquisar de
novo.

## Como a faixa de horário funciona

A faixa de horário vale para o **período inteiro**, não para cada dia: a hora
inicial vale para a **data inicial** e a hora final, para a **data final**. Por
exemplo, de 01/10 a 03/10, das 08:00 às 23:59, a pesquisa traz tudo **de 01/10 às
08:00 até 03/10 às 23:59** — inclusive a madrugada de 02/10 e de 03/10.

A hora final **23** vale até **23:59:59**; as outras valem até a hora cheia (hora
final 18 = até 18:00:00). A hora final precisa ser maior que a inicial.

## Limites da pesquisa

| Regra | Por quê |
|---|---|
| Período de no máximo **31 dias** | Acima disso a API de pagamentos fica lenta demais ou falha |
| Datas **não podem ser futuras** | Não há transação no futuro |
| Data final **não pode ser menor** que a inicial | O período ficaria vazio |
| Hora final **maior** que a inicial | A faixa de horário não pode ficar vazia |
| No máximo **30 mil transações** | Mais do que isso não cabe na tela; escolha um período menor |

Uma pesquisa de 31 dias de uma loja movimentada leva cerca de **10 segundos**.
      `,
    },
    {
      id: 'resumo',
      title: 'Barra de totais',
      content: `
## Os indicadores

Depois de pesquisar, a barra de totais mostra 5 indicadores, cada um com um
ícone, o **valor** em destaque e o nome embaixo. Os valores são da **pesquisa
inteira** — nem os filtros das colunas nem o filtro de um indicador mudam a barra.
No computador, **passe o mouse** sobre um indicador para ver a explicação da conta
(a tabela abaixo traz a mesma explicação).

| Indicador | O que soma |
|---|---|
| **Valor total** | Soma do valor de todas as transações da pesquisa, de qualquer status |
| **Transações** | Quantas transações a pesquisa trouxe; ao lado, quantas estão **aprovadas** (status PAGO) |
| **Ticket médio** | Valor total dividido pelo número de transações |
| **Aprovadas** | Valor (e quantidade) das transações com status PAGO |
| **Não aprovadas** | Valor das transações com outro status — o normal é zero; fica vermelho quando não é |

O valor total e o ticket médio somam **todas** as transações, inclusive as que
não estão com status PAGO.

## Filtrar a tabela por um indicador

Os indicadores **Aprovadas** e **Não aprovadas** são **filtros**: clique (ou toque) num
deles e a tabela passa a mostrar **só as transações que entram naquela conta**. O
indicador fica marcado e aparece, na barra da tabela, um botão com o nome dele:
clique nele (ou no indicador de novo) para voltar a ver todas. Pesquisar de novo
também tira o filtro. Indicador zerado não tem transação para mostrar e não filtra;
Valor total, Transações e Ticket médio só informam.

O filtro combina com os filtros das colunas e vale para o **Exportar**: o Excel
sai com as transações filtradas, e o subtítulo da planilha diz qual filtro estava
ligado.

## Abrir e fechar a barra

O botão **Totais** da barra da tabela abre e fecha a barra de totais. No
computador ela abre sozinha (em telas baixas, começa fechada para sobrar espaço
para a tabela); no celular começa fechada.
      `,
    },
    {
      id: 'tabela',
      title: 'Tabela de transações',
      content: `
## Colunas

A tabela abre com as colunas **Data/Hora**, **Loja**, **Modalidade**, **Bandeira**,
**Status** e **Valor**. As outras se ligam no botão de **colunas** da barra da
tabela:

| Coluna | O que é |
|---|---|
| **Cód. Aut.** | Código de autorização da transação |
| **Cód. Cielo** | Código da transação na Cielo |
| **Descrição** | Cartão mascarado (ex.: ************9104) |
| **Terminal** | Número da maquineta |
| **Conta** | Número da conta (comanda) no PDV |
| **Mesa**, **Grupo mesa**, **Abertura mesa** | Mesa da conta, quando a transação veio de uma |
| **Tipo** | Tipo da transação como vem da API (ex.: *lio*, *todo_cartoes*, *cb_app*, *unknown*) |
| **Tipo ADHOC**, **Descrição ADHOC** | Campos de lançamentos avulsos, quando houver |

A **Modalidade** aparece como veio da API, com o sublinhado trocado por espaço
(CREDITO_AVISTA → CREDITO AVISTA). O **Status** fica verde quando é PAGO e
vermelho nos outros casos.

## Ordenar, filtrar e buscar

- Clique no **cabeçalho** de uma coluna para ordenar; clique de novo para inverter.
- No computador, use o **funil** de cada coluna para filtrar (ex.: só VISA em
  Bandeira).
- No celular, use o campo de **busca**, que procura em todas as colunas.

O rodapé da tabela mostra quantas transações ficaram depois dos filtros. Para
somar o valor só das filtradas, exporte em Excel: a linha **Total** da planilha
soma o Valor das linhas exportadas.
      `,
    },
    {
      id: 'graficos',
      title: 'Gráficos',
      content: `
## Abrindo os gráficos

Depois de pesquisar, clique em **Gráficos** na barra da tabela. Abrem dois
gráficos, da **pesquisa inteira** (os filtros das colunas não valem aqui):

- **Volume de vendas por hora** — uma barra por hora do dia com a soma do valor
  das transações naquela hora. Em cima do gráfico aparecem os números da hora
  **de pico**; passe o mouse (ou toque) numa barra para ver os números dela: valor,
  quantas transações e a parte do total.
- **Métodos de pagamento** — um anel com a parte de cada **modalidade** no valor
  total. A legenda ao lado traz o nome, o valor, o número de transações e a
  porcentagem. Passe o mouse (ou toque) numa modalidade para destacá-la.

Num período de vários dias, as horas se somam: a barra das 12:00 é a soma de
todas as transações entre 12:00 e 12:59 de todos os dias.
      `,
    },
    {
      id: 'exportar',
      title: 'Exportar em Excel',
      content: `
## Gerando o Excel

Com a permissão de exportação, o botão **Exportar** da barra da tabela gera um
arquivo **.xlsx** com:

- todas as **17 colunas** (mesmo as que estão desligadas na tela);
- as transações **que estão na tabela** — com filtro de coluna ou busca, só as
  filtradas, e o subtítulo da planilha avisa "filtrado: X de Y";
- uma linha **Total** no fim, com a soma do Valor (fórmula que acompanha o
  filtro do próprio Excel).

O nome do arquivo traz o módulo, a loja e o período. Data/Hora e Valor saem como
data e número de verdade — dá para ordenar e somar no Excel.
      `,
    },
    {
      id: 'celular',
      title: 'No celular',
      content: `
## Usando no celular

- Os filtros ficam embaixo do título. Ao tocar em **Pesquisar**, a barra de
  filtros **se recolhe** para a tela ficar para o resultado; toque na **seta** do
  cabeçalho para reabrir e fazer outra pesquisa. Se a pesquisa for recusada (loja
  não escolhida ou período inválido), a barra continua aberta para você corrigir.
- A tabela vira uma **lista de cartões**: a face mostra Data/Hora, Modalidade,
  Status e Valor; toque em "ver mais" para os outros campos.
- Use o campo de **busca** no lugar dos filtros por coluna.
- Toque em **Totais** para abrir a barra de totais. No celular não há dica ao
  tocar num indicador: a explicação de cada um está na seção **Barra de totais**
  desta FAQ. Tocar num indicador de filtro filtra a lista, como no computador.
- Os botões mostram o **nome** ao lado do ícone (no celular não há dica ao passar
  o mouse).
- Nos gráficos, **toque** numa barra ou numa modalidade para ver os números dela.
      `,
    },
    {
      id: 'permissoes',
      title: 'Permissões e acessos',
      content: `
## Quem pode o quê

| Permissão | O que libera | Quem normalmente recebe |
|---|---|---|
| \`pagamento-echeck.ler\` | Abrir a tela, pesquisar, ver a barra de totais, a tabela e os gráficos | Financeiro, gerentes e quem confere os pagamentos da loja |
| \`pagamento-echeck.exportar\` | O botão **Exportar** (Excel) | Financeiro e quem precisa da planilha |

Você só vê as **lojas do seu escopo** (as Empresas liberadas para você). Lojas
sem o código da loja no cadastro (vínculo BIAPI ou TS2) não aparecem — sem ele não
há o que pesquisar.

Este módulo é **só de consulta**: não altera nenhum dado.
      `,
    },
  ],
  qa: [
    {
      category: 'Pesquisa',
      items: [
        {
          q: 'Pesquisei de 01/10 a 03/10 das 08:00 às 18:00 e vieram transações da madrugada. Por quê?',
          a: 'Porque a faixa de horário vale para o período inteiro: começa na data inicial às 08:00 e termina na data final às 18:00. Tudo o que está entre esses dois momentos entra, inclusive a noite de 01/10 e a madrugada de 02/10. Para ver só um horário de um dia, pesquise com a data inicial e a final iguais.',
        },
        {
          q: 'Por que o período é de no máximo 31 dias?',
          a: 'Porque a API de pagamentos não aguenta períodos longos: em testes, 6 meses de uma loja dava erro na API e 3 meses levava mais de um minuto. Com 31 dias a pesquisa leva cerca de 10 segundos. Para períodos maiores, pesquise mês a mês e exporte cada um.',
        },
        {
          q: 'A pesquisa disse que há transações demais. O que faço?',
          a: 'A tela comporta até 30 mil transações por pesquisa. Escolha um período menor ou uma faixa de horário mais curta.',
        },
        {
          q: 'Minha loja não aparece no seletor. Por quê?',
          a: 'Ou a loja não está no seu escopo (as Empresas liberadas para o seu usuário), ou ela não tem o código da loja no cadastro de Empresas (vínculo BIAPI com a BI do Simphony, ou a integração TS2). Peça ao administrador do portal para conferir.',
        },
        {
          q: 'Pesquisei e não veio nenhuma transação. Está certo?',
          a: 'Pode estar: a loja pode não ter tido pagamentos eCheck no período e horário escolhidos. Confira as datas e a faixa de horário (lembre que a hora final 18 vai só até 18:00). Se a loja teve movimento e mesmo assim não veio nada, o código da loja no cadastro de Empresas pode estar errado — avise o administrador do portal.',
        },
        {
          q: 'Por que o botão Pesquisar está desativado?',
          a: 'Porque nenhum filtro mudou desde a última pesquisa — o resultado na tela já é esse. Mude a loja, uma data ou uma hora para pesquisar de novo. Ele também fica desativado enquanto as lojas carregam.',
        },
        {
          q: 'A pesquisa deu erro. O que faço?',
          a: 'Clique em "Tentar de novo". Se o erro diz que a API demorou demais, pesquise um período menor. Se o erro continuar, avise o time de TI com a mensagem que apareceu.',
        },
      ],
    },
    {
      category: 'Valores e gráficos',
      items: [
        {
          q: 'O Valor total inclui transações que não estão com status PAGO?',
          a: 'Sim. O Valor total e o Ticket médio somam todas as transações da pesquisa, de qualquer status. O indicador Transações mostra ao lado quantas estão aprovadas (PAGO). O valor só das aprovadas está no indicador Aprovadas, na barra de totais; clique nele para ver na tabela só essas transações.',
        },
        {
          q: 'Filtrei a tabela, mas a barra de totais e os gráficos não mudaram. Por quê?',
          a: 'A barra de totais e os gráficos são sempre da pesquisa inteira. O que acompanha o filtro é a contagem no rodapé da tabela e o Excel exportado (com a linha Total das filtradas).',
        },
        {
          q: 'Por que aparecem modalidades parecidas separadas, como "CREDITO A VISTA" e "CREDITO AVISTA"?',
          a: 'Porque a modalidade aparece como veio da API, só com o sublinhado trocado por espaço. Origens diferentes (campo Tipo) escrevem a mesma modalidade de jeitos diferentes, e o módulo não junta os nomes.',
        },
        {
          q: 'O que é a coluna Tipo?',
          a: 'É o tipo da transação como vem da API do DW — por exemplo lio, todo_cartoes, cb_app ou unknown. O módulo mostra o valor como veio, sem interpretar.',
        },
        {
          q: 'Em que fuso estão as horas?',
          a: 'No horário de Brasília (São Paulo), na tela, nos gráficos e no Excel.',
        },
        {
          q: 'Apareceu valor em "Não aprovadas". O que faço?',
          a: 'O normal é zero. Clique no indicador para ver na tabela só essas transações e confira o Status delas — é qualquer status diferente de PAGO.',
        },
      ],
    },
    {
      category: 'Exportar',
      items: [
        {
          q: 'Não vejo o botão Exportar. Por quê?',
          a: 'Ele aparece só para quem tem a permissão pagamento-echeck.exportar e depois de uma pesquisa. Peça a permissão ao administrador do portal.',
        },
        {
          q: 'O Excel sai só com as colunas que estão na tela?',
          a: 'Não: sai sempre com as 17 colunas, para não faltar dado na planilha. As linhas, sim, são as que estão na tabela (com os filtros de coluna e a busca aplicados).',
        },
      ],
    },
  ],
}
