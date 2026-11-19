import type { ModuleFaq } from '@gia-cb/sdk/modules'

export const faq: ModuleFaq = {
  summary:
    'O Fechamento 99Food Mensal monta a conciliação do mês de uma loja com a 99Food, juntando todas as operações da loja. Ele busca na 99Food todos os lançamentos financeiros do mês (vendas, cancelamentos, comissões, taxas, promoções e ajustes do repasse) e compara com o que a loja lançou no caixa (os campos da 99 no borderô): vendas online, vale-refeição pago na 99Food (adquirentes), descontos, o DRE de conferência, o repasse × extrato bancário e os cancelados pós-entrega. Você escolhe a loja e o mês, clica em Consultar, confere as abas e, se tiver permissão, preenche os campos manuais e clica em Salvar. As contas desta tela estão em validação com o financeiro.',

  sections: [
    {
      id: 'primeiros-passos',
      title: 'Primeiros passos',
      content: `
## Consultando um mês

1. Em **Loja**, escolha a loja. A lista é das **lojas** do seu escopo, e o fechamento junta **todas as operações** da loja. Embaixo do nome aparecem as operações dela na 99Food (por exemplo, **2 lojas na 99Food: cb, vst**), **Inativa** quando a loja está inativa, ou **Sem 99Food** — loja sem vínculo com a 99Food no cadastro não pode ser consultada.
2. Em **Mês de referência**, escolha o mês (o padrão é o mês anterior, que é o que normalmente se fecha). As setas mudam o mês de um em um. A 99Food só devolve os lançamentos dos **últimos 3 meses**.
3. Clique em **Consultar**.

A consulta busca na 99Food os lançamentos do mês inteiro, em páginas de até 200 lançamentos, algumas ao mesmo tempo. Desde o clique, uma faixa acima da tabela mostra o andamento, e a tabela de **Lançamentos** fica carregando. Assim que o caixa da loja (borderô) chega, as abas já abrem e os lançamentos vão aparecendo conforme chegam, e nas abas **Online** e **Adquirentes** os dias que ainda podem mudar aparecem **apagados**, com o selo **Aguardando 99Food** no lugar das diferenças (#). Até a consulta terminar, os **cards de totais** ficam carregando e não filtram a tabela, a **Conferência** mostra **Aguardando 99Food** nos valores calculados (o breakdown já pode ser digitado), o **Recebimento** fica carregando e o **Salvar** só libera no fim — assim nenhum número pela metade é confundido com o do mês. O botão **Cancelar** interrompe e descarta o que veio pela metade.

No computador, depois da consulta a barra de filtros vira **uma linha só** — o título, a loja, o mês e os botões — para sobrar altura para a tabela; os rótulos acima dos campos somem, mas os campos são os mesmos. Se a consulta der erro ou for cancelada, a barra completa volta.

As **abas** ficam **embaixo da tabela**, numa barra que mostra também o **Total** de registros da aba aberta (com um card filtrando, quantos o filtro mostra) e quantos itens estão **Alterados** (ainda não salvos). Em tela estreita, as abas que não cabem aparecem pelas setas nas pontas da barra.

## As abas

| Aba | O que mostra |
|---|---|
| **Lançamentos** | Cada lançamento financeiro da 99Food no mês — a base de todas as outras abas |
| **Online** | Por dia: vendas pagas online na 99Food × o que a loja lançou no caixa |
| **Adquirentes** | Por dia: vendas com vale-refeição pago na 99Food × caixa de adquirentes |
| **Conferência** | O DRE do mês: recebido, incentivos, taxas, outros lançamentos e o valor a depositar |
| **Extrato** | As linhas do extrato bancário (malote) digitadas no mês |
| **Recebimento** | Repasse previsto pela 99Food por data de pagamento × extrato |
| **Cancelados pós** | Pedidos entregues e cancelados depois — contestação e reembolso |

## No celular

No celular, ao clicar em **Consultar** a barra de filtros **recolhe sozinha** para sobrar tela para o resultado. Para trocar a loja ou o mês, toque na **seta** ao lado do título para reabrir os filtros. As abas rolam para o lado (use as setas nas pontas). As grades viram **cartões**: nas abas Online e Adquirentes, toque no cartão do dia para ver todos os números e preencher os campos do dia.

Em tela de toque (celular e tablet) não há dicas ao passar o dedo: os botões mostram o nome ao lado do ícone (**Ver o dia**, **Editar**, **Remover**), e a explicação de cada card e de cada coluna está nesta FAQ.
      `,
    },
    {
      id: 'lancamentos',
      title: 'Aba Lançamentos — o que vem da 99Food',
      content: `
A 99Food manda uma linha por pedido (ou por estorno, ou por lançamento avulso), com todos os valores juntos. A tela separa cada linha em **lançamentos**, um por valor, para as contas ficarem claras. A soma dos lançamentos com impacto no repasse é o valor que a 99Food vai depositar por aquele pedido. A aba junta os lançamentos de **todas as lojas da 99Food da Empresa**; a coluna **Operação** diz de qual delas veio cada lançamento — use a busca com o nome da operação para ver só uma.

Se a 99Food negar o acesso aos lançamentos de uma das lojas, uma faixa amarela acima da tabela diz qual ficou de fora; as outras entram normalmente. Avise o time do Portal GIA, que pede a liberação à 99Food.

- **Data**: dia do pedido. Pedido feito **antes das 6h** conta no **dia anterior** (o movimento da madrugada pertence ao dia que começou na véspera). Lançamento sem pedido (lançamento avulso da 99Food) aparece como **Ocorrências**.
- **Fato gerador**: **Venda**, **Cancelamento Total**, **Cancelamento Parcial**, **Estorno pós-venda** ou **Ocorrência Avulsa**.
- **Descrição do lançamento**:
  - **Entrada Financeira** — o que o cliente pagou (itens + entrega, já com todos os descontos);
  - **Promoção custeada pela 99** — a parte do desconto (e do frete grátis) que a 99Food devolve à loja;
  - **Promoção custeada pela loja** — a parte do desconto que a loja bancou. Só informa: ela já está dentro da Entrada Financeira, por isso não tem impacto no repasse;
  - **Comissão da 99**, **Subsídio de comissão da 99**, **Taxa de pagamento** e **Entrega da 99** — as cobranças da 99Food;
  - **Gorjeta antecipada** e **Complemento de pedido mínimo**;
  - **Ajustes do repasse** — o que falta para fechar com o valor que a 99Food vai depositar (estorno pós-venda, contestação, imposto e afins);
  - **Lançamento avulso** — lançamento da 99Food sem pedido.
- **Valor**: o valor do lançamento (negativo = desconto/cobrança).
- **TOTAL**: o valor que conta como venda — só para vendas e cancelamentos totais e só para Entrada Financeira e Promoção custeada pela 99. Nas outras linhas é zero.
- **Status**:
  - **ONLINE VR** — pago na 99Food com vale-refeição;
  - **ONLINE** — os demais pagamentos na 99Food;
  - **OFFLINE** — ainda não aparece: a 99Food não informou como identificar o pagamento na entrega.
- **Método de pagamento**: **Vale refeição** ou o código que a 99Food manda (ex.: **Código 1/150/102**), até a 99Food passar a tabela dos códigos.
- **Impacto no repasse**: SIM quando o lançamento entra no valor que a 99Food deposita.

O botão de **colunas** liga as que nascem escondidas (competência, data de repasse, tipo, bandeira, base de cálculo, % da taxa, ID do pedido). A **busca** filtra por qualquer coluna. Os totais ficam nos cards acima da tabela (veja **Barra de totais do mês**).

Se o último dia com lançamento for anterior ao fim do mês, um aviso amarelo mostra até onde os dados vão — é o esperado num mês que ainda não terminou.
      `,
    },
    {
      id: 'online-adquirentes',
      title: 'Abas Online e Adquirentes — a conferência diária',
      content: `
As duas abas têm **uma linha por dia do mês**. Os números vêm de duas fontes:

- **SD** = o que a **99Food** registrou (somado da aba Lançamentos);
- **CB** = o que a **loja lançou no caixa**, lido dos **campos da 99 no borderô** (só leitura aqui — corrige-se no borderô).

As colunas com **#** são a **diferença** (SD − CB): zero fica cinza; diferente de zero fica em destaque. Enquanto os lançamentos de um dia ainda estão chegando, o dia fica apagado e as colunas # mostram **Aguardando 99Food**.

### De onde vem o CB (campos da 99 no borderô)

Cada loja dá um nome ao campo da 99 no borderô (por exemplo, \`99food_online\`, \`99_online\`, \`desconto_99\`). A tela reconhece o campo pelo nome:

- **CB Online**: campos com **online** no nome (ex.: \`99food_online\`, \`99_online\`, \`99_food_online\`);
- **CB Desc. 99Food**: campos de **desconto** (ex.: \`desconto_99food\`, \`desconto_99\`, \`desc._99food\`, \`99_desc\`);
- **Caixa (adquirentes)**: campos de **adquirentes** (ex.: \`99food_adquirentes\`, \`99_adquirentes\`).

Ficam **fora da conferência** os campos de **cancelamento** (ex.: \`vale_99food_cancel\`), de **offline** (ex.: \`99food_offline\`), os **sem "online" no nome** (\`99food\`, \`99_food\`, \`99\`: ainda não foi decidido se são online ou offline) e os que a tela não reconhece (ex.: \`99pay\`, \`f.o_delivery_99\`, \`vale_99food\`). Eles aparecem no quadro **"campos da 99 no borderô ficaram fora da conferência"**, acima da tabela, com o valor do mês e em quantos dias — clique nele para ver a lista. Numa loja que lança a 99 só como \`99food\`, o CB Online fica zerado até essa decisão.

### Online

- **99Food Online** e **SD Online**: soma do TOTAL dos lançamentos ONLINE do dia.
Nas colunas de descontos e cancelamentos, antes do valor em R$ aparece um selo com a **quantidade** de lançamentos (ex.: **3×** R$ 30,00 = 3 lançamentos somando R$ 30,00); sem lançamento, não há selo. A **Previsão** de pagamento fica perto do fim da linha, junto do **Comentário**.

- **Descontos 99Food**: promoções custeadas pela 99 em pedidos ONLINE.
- **Cancel. total / parcial**: lançamentos de cancelamento.
- **Promo rede**: a 99Food não tem promoção da rede; fica zerada.
- **CB Online**: online da 99Food no borderô. **# Online** = SD Online − CB Online.
- **Desc. OFF / Desc. VR**: promoções da 99 em pedidos OFFLINE e ONLINE VR. **SD Desc. 99Food** = a soma dos dois; **CB Desc. 99Food** vem do borderô; **# Desc. 99Food** = diferença.
- **Desc. LOJA On / Off**: promoções custeadas pela loja. **SD Desc. LOJA** = soma; **CB Desc. LOJA** é **digitado** por você; **# Desc. LOJA** = diferença.
- **# Total** = # Online + # Desc. 99Food (o # Desc. LOJA não entra — ele tem a sua própria coluna).

### Adquirentes

- **99Food ONLINE VR**: soma do TOTAL dos lançamentos ONLINE VR do dia.
- **SD ONLINE VR** = 99Food ONLINE VR − Descontos 99Food.
- **Caixa (borderô)**: o caixa de adquirentes da 99 lançado pela loja.
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
Todas as abas com números têm, acima da tabela, uma barra de **cards com os totais do mês** — as tabelas não têm linha de total. O botão **Totais**, na barra da tabela, abre e fecha os cards: eles abrem sozinhos em tela alta e começam fechados em tela baixa e no celular. No computador, passar o mouse num card mostra a conta. As cores: azul/roxo = valores da 99Food; **verde** = diferença zerada (o esperado); **laranja** = há diferença a conferir. Enquanto a consulta não termina, os cards ficam **carregando** e não filtram: o número só aparece quando é o do mês inteiro.

**Lançamentos** — à vista ficam **repasse previsto**, **total (vendas)**, **taxas e comissões** e **valor líquido**; o botão **Ver todos os totais** abre os demais (se um deles estiver filtrando a tabela, eles ficam abertos até você tirar o filtro). Aqui os cards **filtram a tabela**: clique num card para ver só os lançamentos que somam nele (o card fica marcado e aparece um botão com o nome do filtro e um **X** na barra da tabela); clique de novo, ou no X, para tirar. Card zerado não filtra. Os valores dos cards são sempre do mês inteiro.
- **repasse previsto**: soma do valor dos lançamentos com impacto no repasse — o que a 99Food vai depositar.
- **vendas online** / **vendas online VR**: soma do TOTAL dos lançamentos ONLINE / ONLINE VR.
- **offline**: soma do valor dos lançamentos OFFLINE (por enquanto zero — veja Status, na aba Lançamentos).
- **taxas e comissões**: lançamentos do tipo Cobrança (comissão, taxa de pagamento, entrega da 99).
- **promoções**: lançamentos do tipo Subsídio (promoções custeadas pela 99 ou pela loja e subsídio de comissão).
- **ocorrências**: lançamentos sem pedido (lançamento avulso).
- **total (vendas)**: soma da coluna TOTAL — o valor de venda dos pedidos (só informa).
- **valor líquido**: soma do valor de todos os lançamentos (só informa).

**Online** — à vista ficam os 4 cards mais relevantes (**# online**, **# desc. 99Food**, **# desc. loja** e **# total**); o botão **Ver todos os totais** abre os demais logo abaixo, um card para cada coluna com total:
- **99Food online** e **SD online**: soma do TOTAL dos lançamentos ONLINE (os dois mostram o mesmo valor, como as colunas).
- **descontos 99Food**: promoções custeadas pela 99 em pedidos ONLINE.
- **cancelamento total** e **cancelamento parcial**: lançamentos de cancelamento.
- **promoção rede**: zerada (a 99Food não tem promoção da rede).
- **CB online (borderô)** e **# online**: o caixa da loja e a diferença SD − CB.
- **desc. offline** e **desc. VR**: promoções da 99 em pedidos OFFLINE e ONLINE VR; **SD desc. 99Food** é a soma dos dois; **CB desc. 99Food (borderô)** e **# desc. 99Food**: o caixa e a diferença.
- **desc. loja online** e **desc. loja offline**: promoções custeadas pela loja; **SD desc. loja** é a soma; **CB desc. loja (digitado)** e **# desc. loja**: o digitado e a diferença.
- **# total**: # online + # desc. 99Food (o # desc. loja não entra — ele tem o seu próprio card).

**Adquirentes** — à vista ficam **# total**, **divergência (soma absoluta)**, **SD online VR** e **caixa adquirentes**; o botão **Ver todos os totais** abre os demais, um card para cada coluna com total:
- **99Food online VR**: soma do TOTAL dos lançamentos ONLINE VR.
- **descontos 99Food**, **cancelamento total**, **cancelamento parcial**, **desc. loja VR** e **promoção rede**: as mesmas contas da grade, só em ONLINE VR.
- **SD online VR**: 99Food online VR − descontos 99Food.
- **caixa adquirentes (borderô)**: o caixa de adquirentes da 99 lançado pela loja.
- **# total**: SD online VR − caixa.
- **divergência (soma absoluta)**: soma das diferenças de cada dia sem o sinal — mostra diferenças que se anulam entre dias.

**Conferência**
- **valor a depositar**: Recebido + Incentivos da loja + Taxas e comissões + Outros lançamentos.
- **breakdown (valor site)**: soma do valor site digitado nos centros de custo.
- **diferença**: valor a depositar − breakdown.
- **comissão da 99 (média)**: média do percentual cobrado na comissão da 99 (o percentual esperado ainda não foi definido).

**Extrato**: **linhas no extrato** e a soma do **malote**.

**Recebimento**: **site restaurante** (repasse previsto), **extrato** (malote casado com as datas), **diferença** (site − extrato) e **datas com diferença**.

**Cancelados pós**: **casos**, **valor (pedido + taxa)** e **reembolsado**.

Nas outras abas, filtram a tabela os cards que apontam linhas a conferir — o resto só informa:
- **Online**: **# online**, **# desc. 99Food**, **# desc. loja** e **# total** mostram só os **dias com diferença** naquela coluna;
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

- **Recebido via 99Food**: pedidos pagos via 99Food (Entrada Financeira) e promoções custeadas pela 99.
- **Incentivos Promocionais Loja**: promoções custeadas pela loja (sem impacto no repasse: já estão dentro da Entrada Financeira). Aparecem em Recebido com o sinal trocado e se anulam no valor a depositar.
- **Taxas e Comissões**: comissão da 99, subsídio de comissão, taxa de pagamento e entrega da 99.
- **Outros Lançamentos**: gorjeta antecipada, complemento de pedido mínimo, ajustes do repasse e lançamentos avulsos.
- **Valor a depositar** = a soma dos blocos — o que a 99Food vai depositar.
- **Checks**: a **média** do percentual cobrado na comissão da 99.
- **Breakdown loja**: o valor do site por centro de custo, **digitado** (até 4 centros; o primeiro leva o nome da loja).
- **Diferença** = Valor a depositar − soma do breakdown.

Cada linha mostra, embaixo do nome, a descrição exata do lançamento que ela soma. Só entram lançamentos com o "impacto no repasse" esperado para a categoria (SIM nas receitas/taxas, NÃO nos incentivos da loja).
      `,
    },
    {
      id: 'extrato-recebimento-cancelados',
      title: 'Abas Extrato, Recebimento e Cancelados pós',
      content: `
## Extrato

Lista do extrato bancário do mês (o **malote** recebido da 99Food). Com permissão de edição:

- **Nova linha** abre o formulário (data do movimento e malote são obrigatórios);
- o **lápis** edita e a **lixeira** remove a linha (pede confirmação);
- a **competência** acompanha a data do movimento e o **Mês / Ano** já vem preenchido com o mês consultado.

## Recebimento

Agrupa os lançamentos com **impacto no repasse** pela **data de repasse prevista** pela 99Food e soma o **Site restaurante** (o que a 99Food vai depositar). A coluna **Extrato** soma o malote do extrato num raio de 1 dia da data de pagamento; **Diferença** = Site − Extrato. Quando a mesma data de pagamento aparece em duas linhas, o Site da linha vizinha é descontado do Extrato para o malote não contar em dobro.

## Cancelados pós

Pedidos que foram entregues e cancelados depois. Registre data do pedido, valor (pedido + taxa), reembolso, cliente, nº do pedido, ID 99Food, centro de venda, origem do cancelamento, justificativa, andamento, protocolo, se o valor veio para o cofre e as datas de anulação e reembolso. Inclusão, edição e remoção funcionam como no Extrato.
      `,
    },
    {
      id: 'salvar',
      title: 'Salvar e histórico',
      content: `
O botão **Salvar** (ao lado de Consultar) grava de uma vez tudo o que é digitado no mês da loja: previsões, CB Desc. LOJA, comentários, breakdown da Conferência, extrato e cancelados pós.

- Ele só se acende quando há **alteração não salva**; nesse caso aparece um ponto laranja no botão, e o contador **Alterados** da barra de abas fica destacado.
- Consultar outra loja ou outro mês com alteração pendente pede confirmação antes de descartar.
- Fechar ou recarregar a aba do navegador com alteração pendente também pede confirmação.
- A data e a hora da **última gravação** aparecem ao passar o mouse no botão **Histórico**, e no próprio histórico.
- Apagar um comentário ou uma previsão e salvar **limpa** o valor gravado.

## Histórico

Depois de consultar, o botão **Histórico** (na barra de filtros, ao lado do Salvar) mostra as gravações do mês daquela loja, da mais recente para a primeira (as 100 últimas; o diálogo avisa quando há mais). Cada uma diz **quem salvou**, **quando** e **o que mudou**, separado por aba (o fechamento é da loja inteira, com todas as operações):

- campo alterado: o dia (ou o centro de custo, ou a linha do extrato/cancelado editada) e o campo, com o valor **antes** riscado → o valor **depois** (∅ = vazio);
- linha do Extrato ou dos Cancelados pós **incluída (+)** ou **removida (−)**, com a data, o valor e a descrição.

Só entra no histórico o Salvar que mudou alguma coisa. Quem consulta o fechamento vê o histórico; ele não é editado nem apagado pela tela.

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
          a: 'Eles exigem a permissão `fechamento-99food-mensal.editar`. Só com `fechamento-99food-mensal.ler` você consulta todas as abas, mas os campos aparecem como texto e não há Nova linha, lápis, lixeira nem Salvar.',
        },
        {
          q: 'Por que a loja que eu queria não aparece no seletor, ou aparece "Sem 99Food"?',
          a: 'O seletor lista as lojas (Empresas) do seu escopo de acesso. "Sem 99Food" quer dizer que nenhuma operação da loja tem o vínculo com a 99Food no cadastro — peça ao time GIA para cadastrar o vínculo 99Food nas operações.',
        },
        {
          q: 'Apareceu "fora do escopo" ao consultar. O que é?',
          a: 'Seu usuário não tem acesso àquela loja. O administrador do portal precisa incluir a Empresa no seu escopo.',
        },
      ],
    },
    {
      category: 'Consulta e números',
      items: [
        {
          q: 'Por que não consigo consultar um mês mais antigo?',
          a: 'A 99Food só devolve os lançamentos dos últimos 3 meses. Para um mês mais antigo, a consulta avisa e não traz os lançamentos.',
        },
        {
          q: 'O que é o quadro "campos da 99 no borderô ficaram fora da conferência"?',
          a: 'São campos da 99 que a loja lançou no borderô mas que não entram no CB: cancelamentos, offline, campos sem "online" no nome (como 99food, ainda sem decisão se são online ou offline) e nomes que a tela não reconhece (como 99pay). O quadro mostra o nome, o valor do mês e em quantos dias apareceu, para nenhum lançamento passar despercebido. Clique nele para ver a lista.',
        },
        {
          q: 'O CB Online / Caixa está zerado num dia. Por quê?',
          a: 'Esses valores vêm dos campos da 99 no borderô da loja. Zero quer dizer que o borderô daquele dia não tem o campo lançado, ou que a loja usou um nome que fica fora da conferência (veja o quadro de campos fora da conferência acima da tabela). Corrija no borderô e consulte de novo.',
        },
        {
          q: 'Por que a consulta demora?',
          a: 'A 99Food devolve os lançamentos em páginas de até 200, e meses de muito movimento têm várias páginas. Elas são buscadas algumas ao mesmo tempo; as abas abrem antes do fim e os lançamentos vão entrando. A faixa acima da tabela mostra o andamento.',
        },
        {
          q: 'Apareceu uma mensagem de erro. Como leio?',
          a: 'O topo da mensagem diz de onde veio (por exemplo, "Lançamentos da 99Food" ou "Salvar o fechamento") e o tipo do problema: sem conexão (a consulta refaz sozinha quando a internet volta), um sistema que não respondeu (tente de novo em alguns minutos), algo a ajustar na pesquisa, falta de acesso (fale com o gestor) ou falha do serviço (tente de novo e, se continuar, avise o suporte). Em "Ver detalhes técnicos" estão o que foi pedido e o que voltou, com os botões Copiar tudo e Baixar diagnóstico — mande isso ao suporte. Senhas, tokens e dados pessoais não aparecem ali. Se o erro for ao Salvar, a mensagem abre numa janela e o que você preencheu continua na tela.',
        },
        {
          q: 'A consulta deu erro no meio. Perdi alguma coisa?',
          a: 'Não: nada é gravado na consulta. Falha da rede ou do servidor é tentada de novo até duas vezes; só se a mesma página continuar falhando a consulta para e mostra o erro. Página que demora mais de 30 segundos para responder não é repetida: a consulta para na hora, para você não ficar minutos esperando. Erro que não passa sozinho — sem acesso à loja, loja sem 99Food, 99Food recusando a credencial, mês com mais de 3 meses — aparece na hora. Clique em Tentar de novo depois de resolver.',
        },
        {
          q: 'Apareceu "a 99Food não conseguiu responder agora" ou "falha no banco de dados". O que faço?',
          a: 'É uma instabilidade da 99Food ou do banco do fechamento, não do que você digitou. Espere alguns minutos e consulte (ou salve) de novo — o que você preencheu continua na tela. Se o erro continuar, avise o suporte com a loja, o mês e o horário.',
        },
        {
          q: 'Por que um pedido da madrugada aparece no dia anterior?',
          a: 'Pedidos feitos antes das 6h contam no dia anterior, porque pertencem ao movimento do dia que começou na véspera.',
        },
        {
          q: 'Por que não aparece nada como OFFLINE?',
          a: 'A 99Food manda a forma de pagamento como um código numérico, e a tabela que diz qual código é pagamento na entrega ainda não foi passada pela 99Food. Até lá, os pedidos com vale-refeição aparecem como ONLINE VR e todos os outros como ONLINE. A coluna Método de pagamento mostra o código que veio.',
        },
        {
          q: 'O # Total da aba Online não inclui o desconto da loja?',
          a: 'Não. Ele soma # Online + # Desc. 99Food. A diferença do desconto da loja fica na sua própria coluna, # Desc. LOJA.',
        },
        {
          q: 'Por que a coluna Extrato da aba Recebimento está zerada?',
          a: 'O cálculo só reconhece a data do movimento escrita como DD/MM/AAAA, e o extrato é gravado com a data no formato AAAA-MM-DD; por isso, na prática, a coluna fica zerada. A regra está em revisão com o financeiro.',
        },
        {
          q: 'O aviso "Os lançamentos da 99Food vão só até…" é um erro?',
          a: 'Não necessariamente: num mês que ainda não terminou, a 99Food só tem os lançamentos até hoje. Num mês já fechado, consulte de novo; se continuar, avise o suporte.',
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
          a: 'Consulte a loja e o mês e clique em Histórico, na barra de filtros, ao lado do Salvar. Cada gravação mostra quem salvou, quando e o antes → depois de cada campo, e as linhas do Extrato e dos Cancelados pós incluídas ou removidas.',
        },
        {
          q: 'Ao salvar apareceu "Este ambiente é de teste". O que é?',
          a: 'Você está no ambiente de teste do portal, e nele o Salvar só grava na loja de teste — os dados das outras lojas são os reais e não podem ser alterados por um teste. Consultar e ver o histórico de qualquer loja funciona normalmente. Para salvar o fechamento de verdade, use o portal oficial.',
        },
        {
          q: 'Recebi um erro dizendo "no máximo N caracteres" ao salvar.',
          a: 'Algum campo do extrato ou dos cancelados passou do tamanho que o banco aceita. A mensagem diz a linha e o campo; edite a linha, encurte o texto e salve de novo.',
        },
      ],
    },
  ],
}
