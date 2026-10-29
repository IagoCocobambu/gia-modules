import type { ModuleFaq } from '@gia-cb/sdk/modules'

export const faq: ModuleFaq = {
  summary:
    'A **Validação Fiscal** cruza, para uma loja e um período, as **contas fechadas no PDV (Simphony)** com as **notas fiscais (NFC-e)** emitidas, e aponta cada conta sem nota, nota sem conta, nota duplicada e diferença de valor. As contas vêm do DW (BI do Simphony) e as notas da API de notas do DW; nada é gravado — cada pesquisa lê as fontes na hora.',
  sections: [
    {
      id: 'primeiros-passos',
      title: 'Primeiros passos',
      content: `
## Fazendo uma validação

1. Escolha a **Loja** no seletor (dá para digitar parte do nome).
2. Informe a **Data inicial** e a **Data final** — as duas começam em *ontem*.
3. Clique em **Pesquisar**.

Em alguns segundos aparecem os **cards de totais** e a **tabela** com uma linha por
conta (e uma linha por nota que ficou sem conta). Clique numa linha para ver o
detalhe completo da conta e das notas ligadas a ela.

## Limites do período

- As datas **não podem ser futuras**.
- A data inicial **não pode ser maior** que a final.
- O intervalo é de **no máximo 31 dias**.

Se você mudar a loja, as datas ou as janelas depois de pesquisar, a tela continua
mostrando a pesquisa anterior até você clicar em **Pesquisar** de novo.

O **Pesquisar** só busca dados quando algo mudou:

- **Nada mudou** — o botão fica desativado (o resultado na tela já é desta pesquisa).
- **Só as janelas mudaram** — a conciliação é refeita na hora com os dados já
  carregados, sem nova busca.
- **Loja ou período mudaram** — busca os dados (se essa mesma loja e período foram
  pesquisados há pouco, o resultado volta na hora, sem nova busca).

## Sair e voltar para a tela

A tela **lembra a última pesquisa**: se você for para outra tela do portal e voltar,
a loja, o período, as janelas, o filtro de status e o resultado continuam lá. O
resultado **não se atualiza sozinho** (nem ao trocar de aba). Ao recarregar a
página (F5) ou sair do portal, a tela começa limpa — e a próxima pesquisa traz os
dados atualizados.
      `,
    },
    {
      id: 'status',
      title: 'O que significa cada status',
      content: `
| Status | Quando acontece |
|---|---|
| **Conciliado** | a conta tem exatamente uma nota na janela de tempo, com o mesmo valor (diferença de até R$ 0,02) |
| **Conta sem XML** | a conta foi paga, mas nenhuma nota foi emitida para ela na janela de tempo |
| **XML sem Conta** | existe uma nota emitida no período que não casou com nenhuma conta |
| **Duplicidade** | mais de uma nota para a mesma conta, e uma delas tem o valor certo |
| **Divergência R$** | nenhuma nota da conta bate com o valor pago (diferença maior que R$ 0,02) |

Nos cards, **Erros** reúne *Conta sem XML*, *XML sem Conta* e *Divergência R$*;
**Alertas** são as *Duplicidades*.

Quando uma conta tem divergência **e** mais de uma nota, o status mostrado é
*Divergência R$* — as notas extras continuam listadas no detalhe.
      `,
    },
    {
      id: 'regras-casamento',
      title: 'Como a nota é ligada à conta',
      content: `
## Número da conta + janela de tempo

A nota é ligada à conta pelo **número da conta** (o *Check Number* impresso na
nota) **da mesma loja** **e** pelo horário: a nota precisa ter sido emitida entre
**12 horas antes** e **12 horas depois** do fechamento da conta. Essas são as
*janelas de tempo*. Contas e notas são sempre buscadas pela mesma loja, então uma
conta nunca é comparada com a nota de outra loja.

Contas com valor pago igual a zero e contas canceladas não entram na validação.

## Nota principal quando há mais de uma

Se várias notas caem na janela da mesma conta, a **principal** é a **mais recente
cujo valor bate** com a conta. Se nenhuma bate, é a mais recente de todas. Assim,
uma reemissão nova com valor errado não esconde a nota que concilia. As outras
viram *duplicadas* (selo **+N** na coluna **Ações**).

## A janela fiscal das 08:00

Uma nota só é apontada como **XML sem Conta** se foi emitida entre **08:00 da data
inicial** e **08:00 do dia seguinte à data final**. Notas da madrugada do primeiro
dia pertencem ao dia fiscal anterior e, por isso, não aparecem como sem conta.

Para não perder notas emitidas perto da meia-noite, a busca de notas pega **um dia
a mais em cada lado** do período — elas servem só para casar com as contas.
      `,
    },
    {
      id: 'janelas',
      title: 'Janelas de tempo (cadeado)',
      content: `
As caixas **Janela Antes (h)** e **Janela Após (h)** vêm **bloqueadas** com o padrão
de 12 h. Para alterar, clique no **cadeado** ao lado delas e confirme — as duas
ficam editáveis. Clique no cadeado de novo para **bloquear** — os valores que você
digitou são mantidos. Passe o mouse no cadeado para ver o que cada janela significa.

- O valor vai de **0 a 24 horas**: **24 h é o máximo** em cada janela. Um valor
  maior digitado volta sozinho para 24.
- **Ampliar** a janela pode ligar uma nota a outra conta com o mesmo número (o
  número da conta se repete com o tempo).
- **Reduzir** pode gerar falsos *Conta sem XML* para notas emitidas com atraso.

A janela usada na pesquisa aparece no subtítulo da tabela.
      `,
    },
    {
      id: 'totais',
      title: 'Totais e diferença',
      content: `
| Card | Cálculo |
|---|---|
| **Total Sistema (PDV)** | soma do valor pago das contas consideradas |
| **Total Fiscal (XML)** | soma das notas ligadas a contas (principais **e** duplicadas) mais as notas sem conta |
| **Diferença** | Total Sistema − Total Fiscal; fica **verde** quando a diferença é menor que R$ 0,05 |
| **Status dos registros** | quantidade de OK, Erros e Alertas — clique para filtrar a tabela |

A coluna **Dif.** de cada linha é **V. Conta − V. Nota** da nota principal (só
aparece quando passa de R$ 0,01). O seletor de status mostra a quantidade e o total
em R$ de cada opção; esse total desconta também as notas duplicadas, então o total
de *Status: Todos* bate com o card **Diferença**.
      `,
    },
    {
      id: 'tabela',
      title: 'Tabela, filtros e detalhe',
      content: `
As colunas são as mesmas do sistema anterior:

| Coluna | O que mostra |
|---|---|
| **Status** | o resultado da validação |
| **Loja / Check** | o nome da loja e o número da conta (*Check #*) |
| **Bus Date** | o dia operacional da conta no Simphony |
| **Data Ref.** | o fechamento da conta (ou a emissão, na nota sem conta) |
| **V. Conta** | o valor pago da conta |
| **Nota Fiscal (XML)** | o número da NF e a chave de acesso (ou *Não encontrada*) |
| **Data Nota** / **V. Nota** | emissão e valor da nota principal |
| **Dif.** | V. Conta − V. Nota |
| **Ações** | o olho abre o detalhe; o selo **+N** indica notas duplicadas |

- **Filtrar por coluna** (computador): pelo filtro no cabeçalho da coluna. Ex.: *Loja /
  Check* para o número da conta, *Nota Fiscal (XML)* para o número da NF ou a chave
  de acesso. No celular, use a **busca** no topo da lista (procura em todos os campos).
- **Filtro de status**: o seletor acima da tabela mostra só um status (ou apenas os erros).
- **Ordenação**: clique no cabeçalho da coluna.
- **Detalhe**: clique em qualquer linha (ou no olho) para ver todos os campos da
  conta, da nota principal e de cada duplicada.

No celular a tabela vira uma lista de cards — veja *Usando no celular*.
      `,
    },
    {
      id: 'celular',
      title: 'Usando no celular',
      content: `
Todas as funções da tela funcionam no celular, num layout enxuto:

- **Filtros** — fica fechado mostrando a loja e o período escolhidos; toque para
  abrir e trocar a loja, as datas ou pesquisar. Depois de **Pesquisar** ele **fecha
  sozinho** para o resultado aparecer logo abaixo.
- **Janelas de tempo** — dentro dos filtros, numa linha que mostra as janelas em uso
  (ex.: *−12 h / +12 h*); toque para abrir e alterar.
- **Busca** — um campo no topo da lista procura em **todos os campos** dos registros:
  número da conta, Check ID, loja, status, Revenue Center, tipo de pedido, datas,
  valores (escreva *153,80* ou *153.8*), NF, série, status Sefaz e chave de acesso —
  inclusive das notas duplicadas. Não diferencia acentos nem maiúsculas; com várias
  palavras, o registro precisa ter todas (ex.: *delivery 153,80*). O **×** limpa a
  busca, e a exportação para Excel leva só os registros encontrados.
- **Resumo** — a **Diferença** em destaque, os totais do Sistema e do Fiscal numa
  linha e os botões **OK**, **Erros** e **Alertas**, que filtram a lista (toque de
  novo para voltar a mostrar tudo). Os totais completos estão nos cards do computador
  e na planilha exportada.

Cada registro é um card com as **mesmas informações das colunas do computador**:
o **status** e a **Dif.** (em vermelho quando existe) no topo; a **loja**, o número
da conta (*Check #*) e o **Bus Date**; lado a lado, a **conta** (V. Conta e data do
fechamento) e a **nota** (V. Nota, data de emissão e NF); a **chave de acesso**; e,
no rodapé, o selo de **duplicidades** e **Ver detalhes**. Toque no card ou em *Ver
detalhes* para abrir todos os campos. O filtro de
status e o **Exportar** ficam no topo da lista.
      `,
    },
    {
      id: 'exportar',
      title: 'Exportando para Excel',
      content: `
O botão **Exportar** da tabela gera um arquivo **.xlsx** só com as linhas que
passam nos **filtros da tela** (status e filtros de coluna, de todas as páginas),
em ordem de data/hora, no modelo de planilha do GIA, com o nome
\`GIA-Validação Fiscal-<Loja>-<período>.xlsx\` (ex.:
\`GIA-Validação Fiscal-01.CB GOIANIA-20.10.2026 a 26.10.2026.xlsx\`).

- No topo: título com loja e período, e uma linha com o filtro de status, as
  janelas usadas, a quantidade de linhas e a hora em que o arquivo foi gerado.
- O cabeçalho fica **congelado** e com **filtro** em cada coluna.
- Valores em **R$** e datas já saem formatados.
- A **última linha (Total)** soma cada coluna de valor **só das linhas exportadas**.
  Se você filtrar a planilha no Excel, o total passa a somar só as linhas visíveis.

- Cada nota vira uma linha: a principal sai como *CONCILIADO/PRINCIPAL (status)*
  quando há duplicadas, e cada duplicada como *DUPLICIDADE (n)*.
- Contas sem nota saem como *CONTA SEM XML*; notas sem conta como *XML SEM CONTA*.
- Algumas células de valor saem **vazias de propósito** (não zero) — "Vl. Pagamento"
  nas linhas de duplicada e de nota sem conta, "Vl. Nota" nas contas sem nota —
  para que **somar a coluna inteira** dê o mesmo valor dos cards.

O botão só aparece para quem tem a permissão \`validacao-fiscal.exportar\`.
      `,
    },
    {
      id: 'origem',
      title: 'De onde vêm os dados',
      content: `
- **Contas**: DW, a partir da BI do Simphony, pelo **dia operacional do
  fechamento** da conta. O dia operacional só termina quando a loja roda o fim do
  dia; até lá os dados são provisórios, e a tela avisa.
- **Notas**: API de notas fiscais do DW, buscadas pela **mesma referência da loja
  no Simphony** usada nas contas — por isso as duas listas são sempre da mesma loja.
  O nome da loja exibido na tabela é o que vem nas notas.
- O **status Sefaz** da nota (autorizada, cancelada…) é mostrado, mas **não** entra
  na validação.
      `,
    },
  ],
  qa: [
    {
      category: 'Permissões',
      items: [
        {
          q: 'Por que não vejo o botão Exportar?',
          a: 'Ele exige a permissão `validacao-fiscal.exportar`. Com apenas `validacao-fiscal.ler` você consulta a validação, mas não exporta. Peça ao administrador do portal.',
        },
        {
          q: 'Por que minha loja não aparece no seletor?',
          a: 'O seletor mostra só as lojas do **seu escopo** que têm vínculo com a **BI do Simphony** no cadastro da Empresa. Se a loja está no seu escopo e não aparece, peça ao administrador para conferir a integração BIAPI da Empresa.',
        },
        {
          q: 'Recebi "fora do seu escopo". O que significa?',
          a: 'Seu usuário não tem acesso à Empresa dessa loja. O administrador do portal pode ampliar seu escopo.',
        },
      ],
    },
    {
      category: 'Resultados',
      items: [
        {
          q: 'Uma nota cancelada na Sefaz aparece como conciliada. Por quê?',
          a: 'A validação compara número da conta, horário e valor — o status Sefaz é só exibido (como no sistema anterior). Confira o campo **Status Sefaz** no detalhe da linha.',
        },
        {
          q: 'Apareceu o aviso de "dia operacional não fechado". E agora?',
          a: 'A loja ainda não rodou o fim do dia em alguma data do período, então as contas podem mudar. Refaça a pesquisa depois do fechamento para ter o resultado definitivo.',
        },
        {
          q: 'Apareceu "sem movimento na BI" para a loja.',
          a: 'A BI do Simphony não tem dados dessa loja no período. Confira as datas; se o período está certo, o vínculo BIAPI da Empresa pode estar errado — avise o administrador.',
        },
        {
          q: 'Uma nota foi ligada à conta errada. Como pode?',
          a: 'O número da conta se repete com o tempo. Se duas contas com o mesmo número fecharem dentro da janela de tempo, a mesma nota pode casar com as duas. Evite ampliar as janelas além do necessário.',
        },
      ],
    },
    {
      category: 'Erros comuns',
      items: [
        {
          q: 'A tela mostrou erro de credencial ou de integração.',
          a: 'A mensagem diz o caso: módulo não liberado na integração (403), integração não cadastrada ou inativa (503) ou provedor fora do ar (502). Os três são resolvidos pelo administrador do portal — repasse a mensagem como está.',
        },
        {
          q: 'Apareceu "sem vínculo com a BI do Simphony".',
          a: 'Contas e notas são buscadas pela referência da loja no Simphony, cadastrada na Empresa (integração BIAPI). Peça ao administrador para conferir esse vínculo.',
        },
        {
          q: 'Falha ao carregar os dados. O que faço?',
          a: 'Clique em **Tentar de novo**. Se persistir, a fonte (DW ou API de notas) pode estar indisponível — tente novamente em alguns minutos.',
        },
      ],
    },
  ],
}
