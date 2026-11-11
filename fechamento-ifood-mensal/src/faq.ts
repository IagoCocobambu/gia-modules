import type { ModuleFaq } from '@gia-cb/sdk/modules'

export const faq: ModuleFaq = {
  summary:
    'O Fechamento iFood Mensal monta a conciliação do mês de uma loja com o iFood. Ele busca no iFood todos os lançamentos financeiros do mês (vendas, comissões, taxas, promoções, ocorrências) e compara com o que a loja lançou no caixa (borderô): vendas online, vale-refeição pago no iFood (adquirentes), descontos, o DRE de conferência, o repasse × extrato bancário e os cancelados pós-entrega. Você escolhe a loja e o mês, clica em Consultar, confere as abas e, se tiver permissão, preenche os campos manuais e clica em Salvar.',

  sections: [
    {
      id: 'primeiros-passos',
      title: 'Primeiros passos',
      content: `
## Consultando um mês

1. Em **Loja**, escolha a loja. A lista é das **operações** do seu escopo — a mesma do Fechamento iFood Diário (por exemplo, **08.CB TERESINA** e **08.VST TERESINA** aparecem separadas). Embaixo do nome aparece **Inativa** ou **Sem iFood** quando for o caso; loja sem iFood não pode ser consultada. Operações com o mesmo número de loja (o CB e o Vasto da mesma loja) dividem o mesmo fechamento gravado.
2. Em **Mês de referência**, escolha o mês (o padrão é o mês anterior, que é o que normalmente se fecha). As setas mudam o mês de um em um.
3. Clique em **Consultar**.

A consulta busca no iFood os lançamentos do mês **em partes de até 8 dias** (é um limite da API do iFood), e as partes são buscadas **ao mesmo tempo**. Desde o clique, uma faixa acima da tabela mostra o andamento, e a tabela de **Lançamentos** fica carregando. Assim que o caixa da loja (borderô) chega, as abas já abrem e os lançamentos vão aparecendo conforme chegam, e nas abas **Online** e **Adquirentes** os dias que ainda podem mudar aparecem **apagados**, com o selo **Aguardando iFood** no lugar das diferenças (#). Até a consulta terminar, os **cards de totais** ficam carregando e não filtram a tabela, a **Conferência** mostra **Aguardando iFood** nos valores calculados (o breakdown já pode ser digitado), o **Recebimento** fica carregando e o **Salvar** só libera no fim — assim nenhum número pela metade é confundido com o do mês — dá para ir preenchendo enquanto isso. Em meses de muito movimento pode levar alguns minutos; dá para continuar usando o portal, só não feche a aba. O botão **Cancelar** interrompe e descarta o que veio pela metade.

No computador, depois da consulta a barra de filtros vira **uma linha só** — o título, a loja, o mês e os botões — para sobrar altura para a tabela; os rótulos acima dos campos somem, mas os campos são os mesmos. Se a consulta der erro ou for cancelada, a barra completa volta.

Assim que as abas abrem, no **rodapé** da tela (embaixo da barra de abas) aparece uma linha com a loja, o mês, quantos lançamentos vieram do iFood, quantos dias têm borderô lançado e quando o fechamento foi gravado pela última vez. As **abas** ficam **embaixo da tabela**, numa barra que mostra também o **Total** de registros da aba aberta (com um card filtrando, quantos o filtro mostra) e quantos itens estão **Alterados** (ainda não salvos). Em tela estreita, as abas que não cabem aparecem pelas setas nas pontas da barra.

## As abas

| Aba | O que mostra |
|---|---|
| **Lançamentos** | Cada lançamento financeiro do iFood no mês — a base de todas as outras abas |
| **Online** | Por dia: vendas pagas online no iFood × o que a loja lançou no caixa |
| **Adquirentes** | Por dia: vendas com vale-refeição pago no iFood × caixa de adquirentes |
| **Conferência** | O DRE do mês: recebido, incentivos, taxas, outros lançamentos e o valor a depositar |
| **Extrato** | As linhas do extrato bancário (malote) digitadas no mês |
| **Recebimento** | Repasse previsto pelo iFood por data de pagamento × extrato |
| **Cancelados pós** | Pedidos entregues e cancelados depois — contestação e reembolso |

## No celular

No celular, ao clicar em **Consultar** a barra de filtros **recolhe sozinha** para sobrar tela para o resultado. Para trocar a loja ou o mês, toque na **seta** ao lado do título para reabrir os filtros. As abas rolam para o lado (use as setas nas pontas). As grades viram **cartões**: nas abas Online e Adquirentes, toque no cartão do dia para ver todos os números e preencher os campos do dia.

Em tela de toque (celular e tablet) não há dicas ao passar o dedo: os botões mostram o nome ao lado do ícone (**Ver o dia**, **Editar**, **Remover**), e a explicação de cada card e de cada coluna está nesta FAQ.
      `,
    },
    {
      id: 'lancamentos',
      title: 'Aba Lançamentos — o que vem do iFood',
      content: `
Cada linha é um lançamento da API Financial do iFood. Um pedido normalmente gera várias linhas (o pagamento, a comissão, a taxa de transação, promoções…).

- **Data**: dia do pedido. Pedido feito **antes das 6h** conta no **dia anterior** (o movimento da madrugada pertence ao dia que começou na véspera). Lançamento sem pedido (ocorrência avulsa, mensalidade…) aparece como **Ocorrências**.
- **Descrição do lançamento**: o tipo do lançamento em português (Entrada Financeira, Comissão do iFood, Taxa de transação, Promoção custeada pelo iFood, pela rede, pela loja…).
- **Valor**: o valor do lançamento (negativo = desconto/cobrança).
- **TOTAL**: o valor que conta como venda — só para vendas e só para Entrada Financeira, promoções custeadas pelo iFood/rede/indústria, taxa de serviço e taxa de conveniência. Nas outras linhas é zero.
- **Status**:
  - **ONLINE** — pago no iFood (cartão, Pix, carteira…);
  - **ONLINE VR** — pago no iFood com vale-refeição de outra bandeira (não o iFood Benefícios);
  - **OFFLINE** — pago na entrega/na loja.
- **Impacto no repasse**: SIM quando o lançamento entra no valor que o iFood deposita.

O botão de **colunas** liga as que nascem escondidas (competência, data de repasse, tipo, bandeira, base de cálculo, % da taxa, ID do pedido). A **busca** filtra por qualquer coluna. Os totais ficam nos cards acima da tabela (veja **Barra de totais do mês**).

Se o último dia com lançamento for anterior ao fim do mês, um aviso amarelo mostra até onde os dados vão — é o esperado num mês que ainda não terminou.
      `,
    },
    {
      id: 'online-adquirentes',
      title: 'Abas Online e Adquirentes — a conferência diária',
      content: `
As duas abas têm **uma linha por dia do mês**. Os números vêm de duas fontes:

- **SD** = o que o **iFood** registrou (somado da aba Lançamentos);
- **CB** = o que a **loja lançou no caixa**, lido do **borderô** (só leitura aqui — corrige-se no borderô).

As colunas com **#** são a **diferença** (SD − CB): zero fica cinza; diferente de zero fica em destaque. Enquanto os lançamentos de um dia ainda estão chegando, o dia fica apagado e as colunas # mostram **Aguardando iFood**.

### Online

- **iFood Online** e **SD Online**: soma do TOTAL dos lançamentos ONLINE do dia.
Nas colunas de descontos e cancelamentos, antes do valor em R$ aparece um selo com a **quantidade** de lançamentos (ex.: **3×** R$ 30,00 = 3 lançamentos somando R$ 30,00); sem lançamento, não há selo. A **Previsão** de pagamento fica perto do fim da linha, junto do **Comentário**.

- **Descontos iFood**: promoções custeadas pelo iFood em pedidos ONLINE.
- **Cancel. total / parcial**: lançamentos de cancelamento.
- **Promo rede**: promoções custeadas pela rede em pedidos ONLINE.
- **CB Online**: valor iFood online do borderô. **# Online** = SD Online − CB Online.
- **Desc. OFF / Desc. VR**: promoções do iFood em pedidos OFFLINE e ONLINE VR. **SD Desc. iFood** = a soma dos dois; **CB Desc. iFood** vem do borderô; **# Desc. iFood** = diferença.
- **Desc. LOJA On / Off**: promoções custeadas pela loja. **SD Desc. LOJA** = soma; **CB Desc. LOJA** é **digitado** por você; **# Desc. LOJA** = diferença.
- **# Total** = # Online + # Desc. iFood (o # Desc. LOJA não entra — ele tem a sua própria coluna).

### Adquirentes

- **iFood ONLINE VR**: soma do TOTAL dos lançamentos ONLINE VR do dia.
- **SD ONLINE VR** = iFood ONLINE VR − Descontos iFood.
- **Caixa (borderô)**: o caixa de adquirentes do iFood lançado pela loja.
- **# Total** = SD ONLINE VR − Caixa.

### O que você preenche (com permissão de edição)

- **Previsão** de pagamento do dia;
- **CB Desc. LOJA** (só na aba Online), em reais — vazio quer dizer "não informado";
- **Comentário** do dia.

No computador, digite direto na grade (o valor entra quando você sai do campo ou aperta Enter; Esc desfaz). O lápis no fim da linha (**Ver o dia**) abre o dia completo num diálogo — é o mesmo diálogo que o celular abre ao tocar no cartão. Ali as quantidades aparecem do mesmo jeito que na grade (**3×** R$ 30,00). Nada é gravado até você clicar em **Salvar**.
      `,
    },
    {
      id: 'totais',
      title: 'Barra de totais do mês',
      content: `
Todas as abas com números têm, acima da tabela, uma barra de **cards com os totais do mês** — as tabelas não têm linha de total. O botão **Totais**, na barra da tabela, abre e fecha os cards: eles abrem sozinhos em tela alta e começam fechados em tela baixa e no celular. No computador, passar o mouse num card mostra a conta. As cores: azul/roxo = valores do iFood; **verde** = diferença zerada (o esperado); **laranja** = há diferença a conferir. Enquanto a consulta não termina, os cards ficam **carregando** e não filtram: o número só aparece quando é o do mês inteiro.

**Lançamentos** — à vista ficam **repasse previsto**, **total (vendas)**, **taxas e comissões** e **valor líquido**; o botão **Ver todos os totais** abre os demais (se um deles estiver filtrando a tabela, eles ficam abertos até você tirar o filtro). Aqui os cards **filtram a tabela**: clique num card para ver só os lançamentos que somam nele (o card fica marcado e aparece um botão com o nome do filtro e um **X** na barra da tabela); clique de novo, ou no X, para tirar. Card zerado não filtra. Os valores dos cards são sempre do mês inteiro.
- **repasse previsto**: soma do valor dos lançamentos com impacto no repasse — o que o iFood vai depositar.
- **vendas online** / **vendas online VR**: soma do TOTAL dos lançamentos ONLINE / ONLINE VR.
- **offline**: soma do valor dos lançamentos OFFLINE (pagos na entrega ou na loja).
- **taxas e comissões**: lançamentos do tipo Cobrança e Retenção (comissão, taxa de transação, taxa de serviço).
- **promoções**: lançamentos do tipo Subsídio (promoções custeadas pelo iFood, pela rede, pela indústria ou pela loja).
- **ocorrências**: lançamentos sem pedido (mensalidade, ajustes, saldo de períodos anteriores).
- **total (vendas)**: soma da coluna TOTAL — o valor de venda dos pedidos (só informa).
- **valor líquido**: soma do valor de todos os lançamentos (só informa).

**Online** — à vista ficam os 4 cards mais relevantes (**# online**, **# desc. iFood**, **# desc. loja** e **# total**); o botão **Ver todos os totais** abre os demais logo abaixo, um card para cada coluna com total:
- **iFood online** e **SD online**: soma do TOTAL dos lançamentos ONLINE (os dois mostram o mesmo valor, como as colunas).
- **descontos iFood**: promoções custeadas pelo iFood em pedidos ONLINE.
- **cancelamento total** e **cancelamento parcial**: lançamentos de cancelamento.
- **promoção rede**: promoções custeadas pela rede em pedidos ONLINE.
- **CB online (borderô)** e **# online**: o caixa da loja e a diferença SD − CB.
- **desc. offline** e **desc. VR**: promoções do iFood em pedidos OFFLINE e ONLINE VR; **SD desc. iFood** é a soma dos dois; **CB desc. iFood (borderô)** e **# desc. iFood**: o caixa e a diferença.
- **desc. loja online** e **desc. loja offline**: promoções custeadas pela loja; **SD desc. loja** é a soma; **CB desc. loja (digitado)** e **# desc. loja**: o digitado e a diferença.
- **# total**: # online + # desc. iFood (o # desc. loja não entra — ele tem o seu próprio card).

**Adquirentes** — à vista ficam **# total**, **divergência (soma absoluta)**, **SD online VR** e **caixa adquirentes**; o botão **Ver todos os totais** abre os demais, um card para cada coluna com total:
- **iFood online VR**: soma do TOTAL dos lançamentos ONLINE VR.
- **descontos iFood**, **cancelamento total**, **cancelamento parcial**, **desc. loja VR** e **promoção rede**: as mesmas contas da grade, só em ONLINE VR.
- **SD online VR**: iFood online VR − descontos iFood.
- **caixa adquirentes (borderô)**: o caixa de adquirentes do iFood lançado pela loja.
- **# total**: SD online VR − caixa.
- **divergência (soma absoluta)**: soma das diferenças de cada dia sem o sinal — mostra diferenças que se anulam entre dias.

**Conferência**
- **valor a depositar**: Recebido + Incentivos da loja + Taxas e comissões + Outros lançamentos.
- **breakdown (valor site)**: soma do valor site digitado nos centros de custo.
- **diferença**: valor a depositar − breakdown.
- **comissão iFood (média)** e **taxa de transação (média)**: média do percentual cobrado (o contrato é 7% e 3%).

**Extrato**: **linhas no extrato** e a soma do **malote**.

**Recebimento**: **site restaurante** (repasse previsto), **extrato** (malote casado com as datas), **diferença** (site − extrato) e **datas com diferença**.

**Cancelados pós**: **casos**, **valor (pedido + taxa)** e **reembolsado**.

Nas outras abas, filtram a tabela os cards que apontam linhas a conferir — o resto só informa:
- **Online**: **# online**, **# desc. iFood**, **# desc. loja** e **# total** mostram só os **dias com diferença** naquela coluna;
- **Adquirentes**: **# total** e **divergência (soma absoluta)** mostram só os dias em que o # Total não é zero;
- **Recebimento**: **datas com diferença** mostra só as datas de pagamento em que o site e o extrato não batem;
- **Cancelados pós**: **reembolsado** mostra só os casos com reembolso.

O filtro funciona como na aba Lançamentos: o card fica marcado, aparece o botão com o nome do filtro e o **X**, e consultar de novo tira o filtro. Card que não tem linha para mostrar (por exemplo, nenhum dia com diferença) não filtra.
      `,
    },
    {
      id: 'conferencia',
      title: 'Aba Conferência — o DRE do mês',
      content: `
Soma os lançamentos **da competência do mês** por descrição, em blocos:

- **Recebido Via iFood**: pedidos pagos via iFood (Entrada Financeira), promoções custeadas pelo iFood, pela rede e pela indústria, e taxa de serviço cobrada do cliente.
- **Incentivos Promocionais Loja**: promoções custeadas pela loja (as que **não** têm impacto no repasse).
- **Taxas e Comissões**: comissão do iFood (7%), taxas de transação (3%), fretes de entrega parceira, taxa de entrega iFood, pacote de anúncios, mensalidade e afins.
- **Outros Lançamentos**: ressarcimentos, reembolsos, estornos e cancelamentos de pedido via loja (VR/VA), ajustes de taxa de entrega, saldo devedor de períodos anteriores e afins.
- **Valor a depositar** = Recebido + Incentivos + Taxas + Outros.
- **Checks**: a **média** do percentual cobrado na comissão (deveria ser 7%) e na taxa de transação (deveria ser 3%).
- **Breakdown loja**: o valor do site por centro de custo, **digitado** (até 4 centros; o primeiro leva o nome da loja).
- **Diferença** = Valor a depositar − soma do breakdown.

Cada linha mostra, embaixo do nome, a descrição exata do lançamento do iFood que ela soma. Só entram lançamentos com o "impacto no repasse" esperado para a categoria (SIM nas receitas/taxas, NÃO nos incentivos da loja).
      `,
    },
    {
      id: 'extrato-recebimento-cancelados',
      title: 'Abas Extrato, Recebimento e Cancelados pós',
      content: `
## Extrato

Lista do extrato bancário do mês (o **malote** recebido do iFood). Com permissão de edição:

- **Nova linha** abre o formulário (data do movimento e malote são obrigatórios);
- o **lápis** edita e a **lixeira** remove a linha (pede confirmação);
- a **competência** acompanha a data do movimento e o **Mês / Ano** já vem preenchido com o mês consultado.

## Recebimento

Agrupa os lançamentos com **impacto no repasse** pela **data de pagamento** prevista pelo iFood e soma o **Site restaurante** (o que o iFood vai depositar). A coluna **Extrato** soma o malote do extrato num raio de 1 dia da data de pagamento; **Diferença** = Site − Extrato. Quando a mesma data de pagamento aparece em duas linhas, o Site da linha vizinha é descontado do Extrato para o malote não contar em dobro.

## Cancelados pós

Pedidos que foram entregues e cancelados depois. Registre data do pedido, valor (pedido + taxa), reembolso, cliente, nº do pedido, ID iFood, centro de venda, origem do cancelamento, justificativa, andamento, protocolo, se o valor veio para o cofre e as datas de anulação e reembolso. Inclusão, edição e remoção funcionam como no Extrato.
      `,
    },
    {
      id: 'salvar',
      title: 'Salvar e histórico',
      content: `
O botão **Salvar** (ao lado de Consultar) grava de uma vez tudo o que é digitado no mês da loja: previsões, CB Desc. LOJA, comentários, breakdown da Conferência, extrato e cancelados pós.

- Ele só se acende quando há **alteração não salva**; nesse caso aparece um ponto laranja no botão, o aviso "Alterações não salvas" no rodapé da tela e o contador **Alterados** da barra de abas fica destacado.
- Consultar outra loja ou outro mês com alteração pendente pede confirmação antes de descartar.
- Fechar ou recarregar a aba do navegador com alteração pendente também pede confirmação.
- Depois de salvar, o rodapé da tela mostra a **última gravação** (data e hora).
- Apagar um comentário ou uma previsão e salvar **limpa** o valor gravado.

## Histórico

Depois de consultar, o botão **Histórico** (no rodapé da tela, embaixo da barra de abas, ao lado da última gravação) mostra as gravações do mês daquela loja, da mais recente para a primeira (as 100 últimas; o diálogo avisa quando há mais). Cada uma diz **quem salvou**, **quando**, em qual **operação** (CB e Vasto da mesma loja dividem o fechamento) e **o que mudou**, separado por aba:

- campo alterado: o dia (ou o centro de custo, ou a linha do extrato/cancelado editada) e o campo, com o valor **antes** riscado → o valor **depois** (∅ = vazio);
- linha do Extrato ou dos Cancelados pós **incluída (+)** ou **removida (−)**, com a data, o valor e a descrição.

Só entra no histórico o Salvar que mudou alguma coisa. Quem consulta o fechamento vê o histórico; ele não é editado nem apagado pela tela. Gravações feitas antes do histórico existir não têm detalhe — o histórico mostra só quando o fechamento foi criado.

O extrato e os cancelados são regravados por inteiro: as linhas anteriores ficam marcadas como excluídas, não somem do banco.
      `,
    },
  ],

  qa: [
    {
      category: 'Permissões',
      items: [
        {
          q: 'Por que não vejo o botão Salvar nem os campos para digitar?',
          a: 'Eles exigem a permissão `fechamento-ifood-mensal.editar`. Só com `fechamento-ifood-mensal.ler` você consulta todas as abas, mas os campos aparecem como texto e não há Nova linha, lápis, lixeira nem Salvar.',
        },
        {
          q: 'Por que a loja que eu queria não aparece no seletor?',
          a: 'O seletor lista as operações (lojas) das Empresas do seu escopo de acesso. Se a loja aparece com "Sem iFood", ela não tem o merchant do iFood cadastrado — peça ao time GIA para vincular a integração iFood no cadastro da Empresa.',
        },
        {
          q: 'Apareceu "fora do escopo" ao consultar. O que é?',
          a: 'Seu usuário não tem acesso àquela operação (loja). O administrador do portal precisa incluir a Empresa dona dela no seu escopo.',
        },
      ],
    },
    {
      category: 'Consulta e números',
      items: [
        {
          q: 'Por que a consulta demora?',
          a: 'O iFood só devolve os lançamentos em partes de até 8 dias e em páginas. Um mês tem 4 partes e cada parte pode ter várias páginas; elas são buscadas ao mesmo tempo, mas meses de muito movimento ainda levam alguns minutos. As abas abrem antes do fim e os lançamentos vão entrando; a faixa acima da tabela mostra o andamento.',
        },
        {
          q: 'A consulta deu erro no meio. Perdi alguma coisa?',
          a: 'Não: nada é gravado na consulta. Cada página que falha por instabilidade (o iFood ou a rede oscilando, limite de requisições) é tentada de novo automaticamente até duas vezes; se continuar falhando, a consulta para e mostra o erro. Página que demora mais de 30 segundos para responder não é repetida: a consulta para na hora e mostra o erro, para você não ficar minutos esperando. Se o iFood devolver uma página incompleta (as vendas sem os lançamentos financeiros, o que acontece às vezes) ou limitar as consultas por excesso de pedidos, a página é pedida de novo sozinha; o mês nunca é mostrado com lançamentos faltando. Erro que não passa sozinho — sem acesso à loja, loja sem iFood, iFood recusando a credencial — aparece na hora. Clique em Tentar de novo depois de resolver.',
        },
        {
          q: 'Apareceu "o iFood não conseguiu responder agora" ou "falha no banco de dados". O que faço?',
          a: 'É uma instabilidade do iFood ou do banco do fechamento, não do que você digitou. Espere alguns minutos e consulte (ou salve) de novo — o que você preencheu continua na tela. Se o erro continuar, avise o suporte com a loja, o mês e o horário.',
        },
        {
          q: 'Por que um pedido da madrugada aparece no dia anterior?',
          a: 'Pedidos feitos antes das 6h contam no dia anterior, porque pertencem ao movimento do dia que começou na véspera.',
        },
        {
          q: 'O CB Online / Caixa está zerado num dia. Por quê?',
          a: 'Esses valores vêm do borderô da loja. Zero quer dizer que o borderô daquele dia não tem o valor lançado (ou ainda não foi feito). Corrija no borderô e consulte de novo.',
        },
        {
          q: 'O # Total da aba Online não inclui o desconto da loja?',
          a: 'Não. Ele soma # Online + # Desc. iFood. A diferença do desconto da loja fica na sua própria coluna, # Desc. LOJA.',
        },
        {
          q: 'Por que a coluna Extrato da aba Recebimento está zerada?',
          a: 'O cálculo só reconhece a data do movimento escrita como DD/MM/AAAA, e o extrato é gravado com a data no formato AAAA-MM-DD; por isso, na prática, a coluna fica zerada. A regra está em revisão com o financeiro.',
        },
        {
          q: 'O aviso "Os lançamentos do iFood vão só até…" é um erro?',
          a: 'Não necessariamente: num mês que ainda não terminou, o iFood só tem os lançamentos até hoje. Num mês já fechado, consulte de novo; se continuar, avise o suporte.',
        },
      ],
    },
    {
      category: 'Gravação',
      items: [
        {
          q: 'Preenchi os campos e troquei de loja. Perdi o que digitei?',
          a: 'Se você confirmou o aviso "Descartar as alterações não salvas?", sim. Sem clicar em Salvar nada vai para o banco.',
        },
        {
          q: 'Como sei quem alterou um valor do fechamento?',
          a: 'Consulte a loja e o mês e clique em Histórico, no rodapé da tela (embaixo da barra de abas). Cada gravação mostra quem salvou, quando e o antes → depois de cada campo, e as linhas do Extrato e dos Cancelados pós incluídas ou removidas.',
        },
        {
          q: 'Recebi um erro dizendo "no máximo N caracteres" ao salvar.',
          a: 'Algum campo do extrato ou dos cancelados passou do tamanho que o banco aceita. A mensagem diz a linha e o campo; edite a linha, encurte o texto e salve de novo.',
        },
      ],
    },
  ],
}
