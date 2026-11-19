# PRD — Fechamento Maestro

## Metadata (obrigatório)

| Campo                  | Valor                                     |
| ---------------------- | ----------------------------------------- |
| **module_id**          | `fechamento-maestro`                      |
| **Label visível**      | Fechamento Maestro                        |
| **Categoria**          | `operacional`                             |
| **Autor**              | Iago Pereira (iago.pereira@cocobambu.com) |
| **Versão do PRD**      | `1.4`                                     |
| **Status**             | `em-dev`                                  |
| **Última atualização** | 2026-11-17                                |
| **SDK version mínima** | `@gia-cb/sdk@0.1.0-alpha.71`              |

---

## 1. Problema / Contexto (obrigatório)

### 1.1 Qual o problema?

O financeiro e as lojas precisam fechar o caixa do delivery: saber, por dia, quanto
dos pedidos do Maestro (App Coco Bambu, iFood, 99Food e pedidos manuais) foi pago
**online** (no app ou no parceiro), quanto entrou pelas **adquirentes** (cartão na
maquininha na entrega) e quanto em **dinheiro**, e achar os pedidos cuja conta não
fecha (formas de pagamento que não somam o total pago, descontos que não somam o
desconto total).

### 1.2 Como é feito hoje?

Pela tela **Fechamento Diário Maestro** do GIA legado (UniGUI/Delphi,
`TfrmFechamentoMaestro` + `TDmFechamentoMaestro`): um frontend React embutido num
`UniHTMLFrame` busca os pedidos da API do DW (`/Delivery/`) e cruza as formas de
pagamento com um cadastro de classificações (`gia_relatorios.formas_pagamento`, no
banco do Maestro), editável na própria tela. O token da API é obtido com
usuário/senha fixos no servidor Delphi.

O frontend React (onde fica a conta do fechamento, em
`src/utils/paymentClassification.ts` e `src/App.tsx`) chegou em 2026-11-03, em
`legacy-gia/fechamento-maestro/fechamento-maestro`.

### 1.3 Por que vale a pena resolver?

A migração para o GIA tira a credencial do código (hub de Credenciais), aplica o
escopo de lojas no servidor, funciona no celular e exporta em Excel. O tipo das
formas de pagamento segue a regra do legado (RN-4), lendo o mesmo cadastro
`gia_relatorios.formas_pagamento` — só leitura; a edição continua fora (§8).

---

## 2. Personas e cenários (obrigatório)

### 2.1 Personas

| Persona                 | Permissões                                              | Frequência de uso | Conhecimento técnico |
| ----------------------- | ------------------------------------------------------- | ----------------- | -------------------- |
| Gerente de loja         | `fechamento-maestro.ler`                                | Diário            | Baixo                |
| Financeiro / tesouraria | `fechamento-maestro.ler`, `fechamento-maestro.exportar` | Diário            | Médio                |
| Analista de delivery    | `fechamento-maestro.ler`, `fechamento-maestro.exportar` | Semanal           | Médio                |

### 2.2 Cenários primários

- **C1**: Como financeiro, quero o fechamento de ontem da loja dividido em Online,
  Adquirentes e Offline para conciliar com o extrato das adquirentes e o caixa.
- **C2**: Como financeiro, quero ver só os pedidos com divergência e o motivo de
  cada uma para corrigir antes de fechar o mês.
- **C3**: Como gerente, quero ver o fechamento de um dia específico e o detalhe de
  pagamento de um pedido.
- **C4**: Como financeiro, quero exportar o fechamento do mês em Excel (por dia e
  por pedido).

### 2.3 Edge cases / Cenários secundários

- Usuário sem `fechamento-maestro.ler`: tela mostra acesso negado; handlers respondem 403.
- Loja fora do escopo do usuário (body adulterado): `ctx.requireEmpresa` → 403.
- Empresa com CNPJ sem número (nem no vínculo BIAPI, nem no nome): aparece no seletor;
  a pesquisa responde 422 "não tem número de loja no cadastro".
- Propriedade (sem CNPJ): não aparece no seletor; a pesquisa responde 404.
- Período > 31 dias, data final < inicial ou data futura: recusado com mensagem.
- API demora mais de 90 s: 504 com a sugestão de reduzir o período.
- API fora do ar ou integração não liberada: mensagem de erro padrão (`MensagemErro`, padrão 11 do AGENTS.md, desde a 0.4.4) no lugar da tabela, no alto e centrada como o estado vazio: tipo do problema (sem conexão, sistema que não respondeu, revise a pesquisa, acesso, falha do serviço), de onde veio ("Lista de lojas" ou "Pedidos do delivery (Maestro)"), a frase do servidor, "Tentar de novo" e "Ver detalhes técnicos" (Copiar tudo, Baixar diagnóstico só deste módulo, sem senha, token nem dado pessoal).
- Vale novo fora do cadastro ONLINE VR: entra como ONLINE (pré-pago) ou OFFLINE, como no legado.
- Forma de pagamento sem nome ou `DESCONHECIDO`: SEM CLASSIFICAÇÃO e o pedido fica divergente.
- Banco do Maestro fora do ar: 502 "Não foi possível ler o cadastro de formas de pagamento".
- Forma de pagamento ou desconto sem valor entre parênteses: pedido divergente, com o item citado.
- Loja sem delivery no período: estado vazio "Nenhum pedido".

---

## 3. Requisitos funcionais (obrigatório)

### RF-1: Seleção de loja

- Lista as Empresas com CNPJ (`tipoRegistro === 'empresa'`) do escopo do usuário, em
  ordem natural. Propriedades ficam de fora. A primeira vem selecionada. O número da
  loja (RN-1) é resolvido na pesquisa.
- Lojas inativas aparecem com a marca "Inativa".

### RF-2: Filtro de período

- Data inicial e final começam em ontem; sem datas futuras; final ≥ inicial; máx. 31 dias.
- "Pesquisar" fica desativado se loja e datas são as da pesquisa na tela.

### RF-3: Leitura e conciliação (API do DW)

- O handler `fechamento` chama `GET /Delivery/?loc_ref&start_date&end_date` com a
  credencial `apidw` e concilia cada pedido no servidor (RN-4 a RN-7).
- Em paralelo, lê do banco do Maestro as formas `ONLINE VR` ativas de
  `gia_relatorios.formas_pagamento` (`sql`, só `SELECT`), a cada pesquisa.

### RF-4: Fechamento por dia

- Na tela, um dia = pesquisar com data inicial = final (a barra de totais
  mostra o dia). O fechamento dia a dia de um período fica na aba "Fechamento
  diário" do Excel (RF-8): Pedidos, Cancelados, Valor pedido, Valor entrega, Total
  pago, Online (já sem o abatimento da RN-10), Adquirentes online, Adquirentes
  offline, Offline, Não classificado, Descontos loja, Descontos parceiro (os dois
  com a regra dos cards, RN-10), Divergências. Na aba "Pedidos", a coluna Online é
  a líquida (RN-10). Sem filtro, o Total de cada aba bate com os cards; com filtro,
  o subtítulo da aba diz "filtrado: X de Y pedidos".

### RF-5: Tabela de pedidos (conciliação)

- Uma linha por pedido. Colunas no padrão do legado (`ALL_COLUMNS` /
  `DEFAULT_SELECTED_COLUMNS` / `isMandatory` de `constants.ts`), nesta ordem — as
  calculadas primeiro, depois as da API:
  - **Calculadas (inativas)**: Data, Total pago online, Total pago adquirentes
    online, Total pago adquirentes offline, Total pago offline, Total de
    descontos, Venda concluída, Check pagamentos, Check descontos.
  - **API**: Nº pedido\*, Data criação\*, Data de ação, **Nº parceiro**, **Nº
    conta**, CPF cliente, Nome cliente\*, Qtd pedidos, Email cliente, Telefone
    cliente, Rua, Número, Referência, Retirada, Confirmado por, Cancelado por,
    Origem\*, Status do pedido\*, Valor do pedido, Valor da entrega, **Total
    pago**, **Desconto total**, Forma de pagamento\*, Tipo\*, Descontos, Tipo de
    entrega, Nome loja.
  - **Ativas** (aparecem de cara): as marcadas com \* e as em negrito — Nº pedido,
    Data criação, Nº parceiro, Nº conta, Nome cliente, Origem, Status do pedido,
    Total pago, Desconto total, Forma de pagamento, Tipo. As demais nascem
    desligadas (`initialColumnVisibility`) e se ligam no menu de colunas, inclusive
    no celular.
  - \* **Obrigatórias**: não saem no menu de colunas (`enableHiding: false`).
  - Não classificado e Incentivo parceiro não existem no legado e saíram da tabela
    (decisão de 2026-11-03); continuam nos totais, no detalhe e no Excel.
- Celular: o card mostra Nº pedido, Data criação, Total pago e Tipo; o resto das
  colunas ligadas vai em "ver mais".
- **Tipo** (coluna TIPO / `tipo_pagamento_calc` do legado): os tipos das formas do
  pedido, sem repetir, na ordem em que aparecem, separados por `; ` — `ONLINE`,
  `ONLINE VR`, `OFFLINE`, `SEM CLASSIFICAÇÃO` (RN-4). Na tela, um badge por tipo;
  busca e filtro da coluna usam o texto. Vai também no Excel.
- Dados pessoais (CPF, e-mail, telefone, número, referência): sem
  `fechamento-maestro.ver-dados-cliente` chegam mascarados do servidor (RN-12).
- Busca genérica (`globalSearch`) só no celular; no desktop, os filtros por
  coluna (`conditionalFilters`).
- Filtro "Só divergências" (com a contagem do período).
- Linha divergente destacada; clicar abre o detalhe (RF-6).

### RF-6: Detalhe do pedido

- Cada forma de pagamento com valor e grupo, cada desconto, os dois checks, os
  totais e as divergências por extenso.

### RF-7: Seção de canais e totais

- Seção acima da tabela, aberta e fechada pelo botão "Totais" (`Recolhivel`), com
  o painel de canais (RF-10) à esquerda (em cima, em seção estreita) e os
  indicadores ao lado. **0.4.0:** também
  no celular, inline acima da lista, começando fechada (padrão 3); o Dashboard
  saiu (RF-9).
- Os 12 indicadores do Fechamento Diário do legado em produção, nesta ordem.
  Aberta enquanto, com ela aberta, a tabela ainda mostra 5 linhas, e fechada
  abaixo disso (segue o resize; **0.4.2:** mede o espaço da tela em vez do
  `min-height: 700px`, que no Chrome fechava a seção com a tabela ainda folgada
  e variava entre navegadores); depois que o usuário usa o botão "Totais", vale a escolha dele
  até recarregar:
  1. Online (RN-10), Adquirentes online, Adquirentes offline, Offline — pedidos
     não cancelados (RN-4).
  2. Cancelado online, Cancelado adquirentes online, Cancelado adquirentes
     offline, Cancelado offline (RN-8).
  3. Descontos loja, Descontos parceiro (RN-10), Valor sem classificação e
     Pagamentos sem classificação (quantidade).
- Cada indicador: ícone num quadradinho tingido + valor em negrito colorido +
  rótulo em minúsculas embaixo. Grade de largura total com colunas que dividem
  12 (container query: 1 → 2 → 3 → 4 → 6; 1 no celular), pra as linhas fecharem
  cheias. **0.3.0 — padrão 3 do workspace:** grade de até 5 colunas; à vista os 4
  grupos de pagamento (Online, Adquirentes online/offline, Offline) e o botão
  "Ver todos os totais (+8)" com os demais logo abaixo (cancelados, descontos,
  sem classificação). **0.4.3:** sai o "Ver todos os totais" — ao lado do anel de
  canais, as 3 linhas de 5 indicadores cabem na altura do anel, então esconder
  8 deles não deixava a seção mais baixa; os 12 ficam sempre à vista. **0.4.4:** no celular a
  grade fica com **2 colunas** (antes 1): os 12 indicadores ocupavam a tela inteira
  quando a seção abria; em 2, metade da altura. Abaixo de `@sm` o item fica compacto
  (ícone 7×7, valor `text-sm`; abaixo de `@xs` — tela de até ~375 px —, sem o ícone) e o rótulo quebra em vez de cortar (sem dica no toque). Tooltip com a explicação da conta no hover (fecha no clique).
- **Cada indicador é um filtro da tabela** (pedido de 2026-11-06): o clique mostra
  só os pedidos que somaram nele (`pedidosDoTotal`, mesma regra de
  `resumirTotais`, valor ≠ 0 no grupo); o indicador fica marcado (`aria-pressed`)
  e a toolbar ganha um botão com o nome dele, que tira o filtro. Clicar de novo
  também tira; nova pesquisa zera. Os totais seguem do período inteiro do canal
  escolhido (RF-10) — o indicador não recalcula a barra (zeraria os outros).
  Indicador zerado não filtra. Combina com "Só divergências" (E) e vale para o
  Exportar (subtítulo "filtrado (Indicador): X de Y pedidos").
- Cores (tokens semânticos): Online `info`, Adquirentes online/offline `primary`,
  Offline `warning`; cancelados `destructive` só se > 0; Sem classificação
  (valor) `warning` só se ≠ 0; o resto neutro.
- O indicador "Pagamentos sem classificação" fica vermelho quando > 0 e filtra a
  tabela pelos pedidos com forma não reconhecida, como os outros (substitui a
  janela com a lista agrupada).
- Conferido contra o print do legado em produção (loja 01, 02/11/2026): os 12
  valores batem centavo a centavo. Revoga a decisão de 2026-10-30 de não adotar
  Adquirentes Online/Offline.

### RF-8: Exportar Excel

- Permissão `fechamento-maestro.exportar`. Arquivo `.xlsx` com 3 abas:
  Fechamento diário, Pedidos (sem cancelados) e Cancelados; linhas Total com
  SUBTOTAL(109). Segue os pedidos que estão na tabela (filtros incluídos). Com
  canal e/ou indicador ligados, o subtítulo diz "filtrado (iFood · Online): X de
  Y pedidos".
- **0.4.1:** as abas Pedidos e Cancelados levam **todas** as colunas da tabela
  (ligadas ou não), mais as da conciliação: Nº parceiro, Nº conta, Data de
  ação, dados do cliente (mascarados sem `ver-dados-cliente`, como na tela),
  endereço, Retirada, Confirmado/Cancelado por, Nome loja, Online bruto e
  líquido, Total de descontos. Nº parceiro e Nº conta vão como texto (o Excel
  arredondaria ids com mais de 15 dígitos).

### RF-8a: PDF de totais por canal (0.4.5)

- Pedido da diretoria (17/11/2026): os painéis da seção de totais separados por
  canal, num PDF. Botão **PDF por canal** (`ghost`, `FileText`) na barra da
  tabela, logo antes do Exportar;
  permissão `fechamento-maestro.exportar` (a mesma do Excel). **Oculto** até os
  pedidos carregarem: não aparece antes da 1ª pesquisa, durante uma pesquisa nem
  quando ela não traz pedidos.
- Botão próprio, fora do Exportar: o SDK (alpha.71) não tem padrão de PDF, o
  Exportar do `DataReport` baixa as linhas da tabela, e o `PlanilhaMenu` só tem
  ações fixas. Decisão do usuário em 17/11/2026.
- A4 retrato: cabeçalho "Fechamento Maestro" com loja, período e data/hora da
  geração; uma seção por canal (ordem do anel, maior venda primeiro, inclusive
  canal só com cancelados) com o anel (fatia do canal acesa, as outras apagadas),
  total pago, % e pedidos no miolo, "Totais só de <canal> · X de Y pedidos" e os
  12 indicadores do canal (mesmos rótulos e tons da tela, `src/indicadores.ts`).
  Até 4 canais por página; faixa e painel do canal nunca se separam.
- Visual do padrão 17 do `../AGENTS.md`: margem 12,7 mm, título 15 pt no acento
  `#3783FF` + subtítulo, linha de contexto (loja · período · pedidos · gerado em),
  linha de acento de 1,2 pt; faixa `#DBE8FF` com o canal em maiúsculas; páginas
  seguintes só com a linha de continuação; rodapé `GIA · Fechamento Maestro ·
<loja> · <período>` + "Página X de Y". **Exceção (pedido em 17/11/2026):** o
  anel segue as cores da tela — cada canal na cor do `PainelCanais` (iFood rosa,
  App Coco Bambu azul, 99Food âmbar, outros cinza), o da seção aceso e os outros a
  30%. Testado com loja de nome longo, 7 canais e canal de nome longo.
- Sempre da pesquisa inteira: canal escolhido, filtro de indicador, Só
  divergências e filtros de coluna não entram.
- Gerado no navegador com o jsPDF (vetor, `import()` dinâmico), baixado direto —
  funciona no celular (conventions §11). Nome por `nomeArquivoExport`
  (`GIA - Fechamento Maestro - <loja> - Totais por canal - <período>.pdf`).

### RF-9: Dashboard (removido na 0.4.0)

- Até a 0.3.0, botão "Dashboard" com dialog de duas abas (anel Vendas por canal e
  Totais). Na 0.4.0 o anel foi para a seção de totais (RF-10,
  opção A validada em 2026-11-11) e o dialog saiu.

### RF-10: Painel de canais (devolutivas de 2026-11-10 e 2026-11-11)

- Pedido do cliente: os totais estavam "consolidados" — filtrar a coluna Origem
  (ex.: só iFood) mudava a tabela, mas não os 12 indicadores.
- 0.3.0: seletor Canal na toolbar. **0.4.0** (pedido de unificar totais e
  dashboard; opção A do canvas de validação — a B, faixa de botões, foi
  implementada e trocada pela A): **painel de canais** à esquerda dos
  indicadores (`PainelCanais`; em cima em seção < @4xl): anel (donut SVG) com a
  fatia de cada `origem` no total pago ("Sem origem" quando vazia;
  `vendasPorCanal`, sem cancelados), **sem legenda** (pedido de 2026-11-11).
  Tooltip por fatia só com mouse (`Dica`): canal, valor, % e pedidos. Clicar na
  fatia escolhe o canal; clicar nela de novo, ou no miolo ("ver todos", botão
  quando há canal escolhido), volta a todos. Miolo: o canal escolhido (nome,
  valor, %, pedidos) ou o total — é o que o toque mostra, sem tooltip. Fatia sob
  o mouse acende (padrão 2). Cores = `BadgeOrigemPedido`. Anel = pesquisa
  inteira (não muda com o canal). Canal só com cancelados não tem fatia: escolhe-se
  pelo seletor Canal, que também é o caminho pelo teclado.
- **Barra de filtros enxuta** (0.4.2, padrão 8 do AGENTS.md): com resultado na
  tela e área com 1040 px ou mais de largura, a barra vira uma linha só (~60 px,
  em vez de ~140), sem subtítulo nem rótulos (os campos levam `aria-label`). Em
  área mais estreita a linha não cabe (as datas e o Pesquisar cortavam) e fica a
  barra completa. No celular vale o recolher do padrão 1.
- O seletor **Canal** (0.3.0, na toolbar) fica na **barra de filtros**, à esquerda
  do Pesquisar (0.4.0), ligado ao mesmo estado do anel (escolher num muda o
  outro): dá para trocar de canal com a seção de totais fechada, pelo teclado ou
  para um canal sem fatia. Vale na hora, sem Pesquisar. Desativado antes da
  primeira pesquisa e com menos de 2 canais.
- O canal recorta **tudo**: os 12 indicadores, a tabela,
  o contador do "Só divergências" e o Exportar. A seção mostra "Totais só de
  iFood · X de Y pedidos" e o anel apaga os outros canais. O canal escolhido
  continua entre pesquisas (como a loja e o período); se a pesquisa nova não tem
  aquele canal, volta a todos.
- **Filtros de coluna não mudam os totais.** O `DataReport` (`@gia-cb/ui`
  0.1.0-alpha.70) não expõe as linhas filtradas ao módulo — só no `onExport` e no
  `summaryRow`, que desenha uma linha na grade (proibido pelo padrão 3 do
  `../AGENTS.md`) e não é chamado com 0 linhas nem no modo cards. Contorno
  descartado; pedido ao time do SDK um `onFilteredRowsChange` (§11). Quando
  sair, os totais passam a seguir também os filtros de coluna.

---

## 4. Telas e fluxos (obrigatório)

### 4.1 Mapa de telas

| Rota                  | Tela               | Permissão                |
| --------------------- | ------------------ | ------------------------ |
| `/fechamento-maestro` | Fechamento Maestro | `fechamento-maestro.ler` |

### 4.2 Fluxos principais

1. **Fechar o dia**: loja + data inicial = final → Pesquisar → barra de totais.
2. **Investigar divergência**: Só divergências → clicar no pedido → detalhe.
3. **Forma não classificada**: card Pagamentos sem classificação → lista → pedido → detalhe.
4. **Exportar**: Exportar → `.xlsx` de 3 abas.
   **PDF por canal** → `.pdf` com o painel de totais de cada canal.
5. **Ver um canal**: Totais → clicar na fatia do canal no anel, ou seletor Canal (totais, tabela e Excel só dele).

---

## 5. Requisitos técnicos

### 5.1 Schema de banco

O módulo não cria tabela nem migration e não grava nada. Só lê, do banco do
Maestro (o `UniConnMaestro` do legado), via `sql` de `@gia-cb/sdk/server`:

```sql
select descricao, origem
from gia_relatorios.formas_pagamento
where coalesce(is_deleted, false) = false and tipo = 'ONLINE VR'
```

### 5.2 Permissões (obrigatório)

| Key                                    | Descrição                                                 | Granularidade     |
| -------------------------------------- | --------------------------------------------------------- | ----------------- |
| `fechamento-maestro.ler`               | Consultar o fechamento das lojas do escopo                | Leitura           |
| `fechamento-maestro.exportar`          | Exportar o fechamento e os pedidos em Excel               | Operação especial |
| `fechamento-maestro.ver-dados-cliente` | Ver CPF, e-mail, telefone e endereço completos do cliente | Dado sensível     |

O módulo não tem escrita.

### 5.3 Integrações externas

| Integração                                           | Propósito          | Camada                             | Credencial                                    |
| ---------------------------------------------------- | ------------------ | ---------------------------------- | --------------------------------------------- |
| `api-dw.cocobambu.com` `/Delivery/`                  | Pedidos do Maestro | handler `fechamento`               | hub de Credenciais, integração `apidw`        |
| Banco do Maestro (`gia_relatorios.formas_pagamento`) | Formas ONLINE VR   | handler `fechamento` (`sql`)       | secret `GIA_SERVER_DATABASE_URL` (só leitura) |
| Cadastro de Empresas do portal                       | Lojas do escopo    | handler `lojas` (`ctx.empresas()`) | —                                             |

### 5.4 BFF / processamento em segundo plano

Nenhum. Uma loja × no máximo 31 dias (~25 s, ~3 MB no pior caso medido no Reports
Maestro) — síncrono, com o botão em carregamento. Excel gerado no navegador.

### 5.5 Realtime

Não usa.

---

## 6. Regras de negócio (obrigatório)

- **RN-1**: O `loc_ref` da API é o número da loja com 2 dígitos. Sai primeiro do
  vínculo da Empresa com a BI do Simphony — `locRefs.BIAPI`, que começa sempre pelo
  número (`'01 CB Go'` → `01`, `'17. CB R'` → `17`, `'13CBMa'` → `13`, `'65'` → `65`).
  Sem o vínculo, vale o número antes do primeiro ponto no nome da Empresa
  ("01.CB GOIANIA" → `01`; "48. VASTO SUL" → `48`), porte do `ExtrairNumeroLoja` do
  legado. A mesma função (`numeroDaLoja`) está nos handlers `lojas` e `fechamento`.
  Sem número, a loja não é consultável e a pesquisa responde 422 com o motivo.
- **RN-2**: Período de 1 a 31 dias, sem datas futuras, data final ≥ inicial.
- **RN-3**: Pedidos da API do DW; a lista de formas `ONLINE VR` do cadastro
  `gia_relatorios.formas_pagamento` do banco do Maestro, como no legado (decisão de
  2026-11-03; revoga o "só API" de 2026-10-30). Só leitura — sem edição (§8).
- **RN-4**: Tipo de cada forma de pagamento — a `classifyPaymentSegment` do legado.
  Sobre o texto antes do `(valor)`, sem o cartão mascarado (`**** 1234 - `), em
  maiúsculas; a primeira que casar vence:
  1. Vazio ou `DESCONHECIDO` → **SEM CLASSIFICAÇÃO** (soma em "Sem classificação").
  2. O texto sem o sufixo ` - PRE PAGO` **contém** a descrição de uma forma
     `ONLINE VR` ativa do cadastro cuja `origem` é vazia ou igual à do pedido
     (comparadas normalizadas: minúsculas, espaços → `_`, `APP CB` = `App Coco
Bambu`, `99 Food` = `99Food`) → **ONLINE VR** (soma em **Adquirentes**).
  3. Termina em ` - PRE PAGO` → **ONLINE** (soma em **Online**).
  4. Qualquer outra → **OFFLINE** (soma em **Offline**), inclusive `CREDIT
OFFLINE`/`DEBIT OFFLINE` da maquininha e formas novas.
     As linhas do cadastro com tipo `ONLINE` ou `OFFLINE` não mudam o resultado,
     como no legado. Linha `ONLINE VR` com descrição vazia é ignorada (casaria com tudo).
- **RN-5**: Check pagamentos OK ⇔ todas as formas têm valor e classificação e a soma
  delas = `total_pago`, centavo a centavo.
- **RN-6**: Check descontos OK ⇔ todos os descontos têm valor e a soma = `desconto_total`.
- **RN-7**: Venda concluída ⇔ status `DISPATCHED` ou `DELIVERED` (o pedido saiu
  da loja). `COMPLETED` é o prato pronto na cozinha, ainda não despachado, e não
  conta (decisão de 2026-11-03; o legado só aceitava `DISPATCHED`).
- **RN-8**: Pedidos `CANCELLED` ficam fora dos valores de venda e da contagem de
  divergências; o total pago deles aparece nos cards "Cancelado" (divididos como
  os de venda: online, adquirentes online, adquirentes offline, offline) e vai
  numa aba própria do Excel.
- **RN-4a**: Adquirentes online = ONLINE VR cuja forma termina em ` - PRE PAGO`;
  Adquirentes offline = ONLINE VR sem esse sufixo (ex.: `VR Refeição`). Vale para
  os cards de venda e de cancelados.
- **RN-9**: O dia do fechamento é a data de criação do pedido (horário de São Paulo).
- **RN-10**: Descontos, como o `calculateSummary` do legado:
  - **Descontos parceiro** = Σ `incentivo_parceiro` dos pedidos não cancelados
    que **não são 99Food** e têm alguma forma ONLINE VR ou OFFLINE.
  - Esse incentivo **sai do Online** do pedido quando ele tem parte ONLINE (vale
    também para Cancelado online). Por isso Online + Adquirentes + Offline + Sem
    classificação = total pago − o incentivo abatido.
  - **Descontos loja** = Σ `desconto_total` dos pedidos com venda concluída
    (RN-7: `DISPATCHED` ou `DELIVERED`). O legado usava só `DISPATCHED`, o que
    zerava o desconto das lojas que marcam `DELIVERED` (03.CB JK em 02/11:
    R$ 181,39 contra R$ 9.550,36); `DELIVERED` foi incluído (decisão de 2026-11-03).
- **RN-11**: Vendas por canal = Σ `total_pago` dos pedidos não cancelados, agrupado
  pela `origem` da API (vazia → "Sem origem").
- **RN-12**: Dados pessoais do cliente completos só com
  `fechamento-maestro.ver-dados-cliente`. Sem ela, o handler devolve os campos
  **já mascarados** (o dado completo não chega ao navegador), com a regra do
  Reports Maestro: CPF `***.456.789-**` (fora de 11 dígitos: `***`); e-mail
  `jo***@gmail.com`; telefone `(11) *****-4321` (sem DDD reconhecível:
  `*****-4321`; menos de 8 dígitos: `***`); número e referência `***`. Nome do
  cliente e rua ficam visíveis.

> **Origem das regras**: RN-4, RN-4a e RN-10 são as do legado em produção,
> conferidas contra o print dele (loja 01, 02/11/2026). RN-7 segue o legado com
> `DELIVERED` incluído, por decisão de 2026-11-03. RN-8 e RN-9 seguem a validar.
> A única diferença conhecida que sobra é a divisão dos itens (o legado quebra em
> `,`/`;`; o módulo só separa na vírgula seguida de um item com valor).

---

## 7. Critérios de aceite (obrigatório)

- [ ] Seletor mostra só lojas com CNPJ do escopo; Propriedade não aparece
- [ ] Loja sem número (nem BIAPI, nem no nome) mostra "não tem número de loja no cadastro"
- [ ] Loja renomeada sem número, com vínculo BIAPI, consulta a loja certa
- [ ] Período inválido é recusado com mensagem
- [ ] Mesma loja e dia: os 12 indicadores iguais aos do Fechamento Diário do legado
- [ ] Online + Adquirentes online + Adquirentes offline + Offline + Valor sem classificação = total pago − incentivo abatido do Online (RN-10)
- [ ] No celular, a seção de canais e totais começa fechada e abre pelo botão Totais, acima da lista
- [ ] Erro na consulta mostra a mensagem padrão (tipo, origem, frase do servidor, Tentar de novo quando ajuda e Ver detalhes técnicos), no alto da área da tabela, na mesma posição do "Escolha a loja e o período" (padrão 11 do AGENTS.md)
- [ ] No celular (inclusive 320 px), os 12 indicadores ficam em 2 colunas, sem corte de valor e com o rótulo inteiro (quebra em 2 linhas se precisar)
- [ ] No computador, diminuindo a altura da janela, a seção de totais fecha sozinha só quando a tabela ficaria com menos de 5 linhas — igual no Chrome, no Safari e no Edge
- [ ] Ao lado do anel, os 12 indicadores ficam sempre à vista (sem o botão "Ver todos os totais"), sem a seção ficar mais alta que o anel
- [ ] Clicar num indicador filtra a tabela pelos pedidos dele; clicar de novo (ou no botão do filtro) tira o filtro
- [ ] Com o filtro, a soma da coluna do grupo na tabela bate com o valor do indicador
- [ ] Painel de canais: escolher iFood muda os 12 indicadores, a tabela, o contador do Só divergências e o Exportar; a barra avisa "Totais só de iFood · X de Y pedidos"
- [ ] Soma dos indicadores por canal = totais com Todos os canais; nova pesquisa mantém o canal (ou volta a Todos se ele não estiver na pesquisa)
- [ ] No celular, os filtros recolhem pelo chevron do cabeçalho (ListHeader) e recolhem sozinhos quando a pesquisa começa (recusada: ficam abertos)
- [ ] Fora do celular, com resultado na tela, a barra de filtros vira uma linha só (título, Loja, Data inicial, Data final, Canal e Pesquisar), sem subtítulo nem rótulos, com `aria-label` nos campos; antes da pesquisa, durante uma pesquisa nova, com erro ou em área com menos de 1040 px de largura, a barra completa (padrão 8 do AGENTS.md)
- [ ] Em tela de toque, os botões da barra mostram o nome (não só o ícone)
- [ ] Clicar no canal escolhido (ou em Todos os canais) volta à pesquisa inteira; o anel apaga os outros canais
- [ ] Busca genérica só no celular; título do módulo à esquerda e filtros à direita
- [ ] Indicador de pagamentos sem classificação filtra os pedidos com forma sem nome quando > 0
- [ ] Painel de canais: soma dos canais = total do miolo do anel; % somam ~100%
- [ ] Aba Fechamento diário do Excel soma por data de criação, sem cancelados
- [ ] "Só divergências" mostra só pedidos não cancelados com check divergente
- [ ] Detalhe do pedido mostra grupo de cada forma e o motivo das divergências
- [ ] Coluna Tipo mostra os tipos do pedido (ex.: `ONLINE; ONLINE VR`), filtra e vai no Excel
- [ ] Mesmo dia/loja: Online, Adquirentes e Offline iguais aos do Fechamento Diário legado
- [ ] Excel com 3 abas e totais que batem com a tela
- [ ] Abas Pedidos e Cancelados do Excel com todas as colunas da tabela, inclusive Nº parceiro (texto, sem arredondar)
- [ ] Sem `fechamento-maestro.exportar` não há botão Exportar nem PDF por canal
- [ ] PDF por canal: uma seção por canal da pesquisa, os 12 indicadores de cada uma iguais aos da tela com aquele canal escolhido; o canal escolhido e os filtros da tela não mudam o arquivo
- [ ] PDF por canal baixa também no celular, com cabeçalho Fechamento Maestro, loja e período
- [ ] Colunas na ordem do legado; de cara só as 11 ativas; obrigatórias fora do menu de colunas
- [ ] Sem `fechamento-maestro.ver-dados-cliente`, a resposta do handler (DevTools → Rede) já traz CPF/e-mail/telefone/número/referência mascarados; com ela, completos
- [ ] Mobile (375x667), tablet (768x1024), desktop (1280x720) funcionam; tabelas viram cards
- [ ] Tema light/dark coerentes
- [ ] FAQ cobre todas as funcionalidades e regras
- [ ] `gia validate` passa sem erros

---

## 8. Fora de escopo

- Cadastro/edição de classificações das formas de pagamento (a modal de
  Admin/TI do legado). O módulo só lê o cadastro (RN-3); a manutenção dele fica
  com o TI.
- Consulta multi-loja e períodos acima de 31 dias.
- Conciliação com extrato de adquirente ou com o Simphony.

---

## 9. Métricas / Telemetria

| Métrica                     | Como medir                            | Onde olhar            |
| --------------------------- | ------------------------------------- | --------------------- |
| Consultas por dia           | invocações do handler `fechamento`    | Logs da Edge Function |
| Taxa de erro/timeout da API | respostas 5xx do handler `fechamento` | Logs da Edge Function |

---

## 10. Riscos e mitigações

| Risco                                 | Mitigação                                                                                      |
| ------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Vale novo fora do cadastro ONLINE VR  | Entra em Online/Offline, igual ao legado; FAQ explica e manda pedir ao TI                      |
| Banco do Maestro indisponível         | 502 com mensagem clara e "Tentar de novo"; nada é gravado                                      |
| API lenta em períodos longos          | Limite de 31 dias e timeout de 90 s com mensagem clara                                         |
| Dados pessoais do cliente na resposta | Mascarados no servidor sem `ver-dados-cliente` (RN-12); permissão + escopo checados no handler |

---

## 11. Dependências

### Outros módulos do GIA

- Cadastro de Empresas (vínculo BIAPI com a BI do Simphony, ou nome com o número da loja).

### Serviços externos

- `api-dw.cocobambu.com` `/Delivery/`.
- Banco do Maestro — tabela `gia_relatorios.formas_pagamento` (só leitura).

### Bibliotecas

- `exceljs` (Excel) e `jspdf` (PDF por canal, 0.4.5), as duas por `import()` dinâmico.

### Decisões pendentes

- [ ] Validar RN-8 e RN-9 com o financeiro.
- [ ] Time do SDK: `onFilteredRowsChange(linhas)` no `DataReport`, para os
      totais seguirem também os filtros de coluna (RF-10).
- [ ] Liberação deste módulo na integração `apidw` do hub de Credenciais — time GIA, na instalação.
- [ ] Secret `GIA_SERVER_DATABASE_URL` da Edge Function apontando para o banco do
      Maestro, com usuário só-leitura (`SELECT` em `gia_relatorios.formas_pagamento`) — time GIA.

---

## 12. Insumo pra FAQ (obrigatório)

1. Como monto o fechamento de uma loja?
2. O que soma cada card de totais (cancelados, descontos loja/parceiro, sem classificação)?
3. Como uma forma de pagamento vira Online, Adquirentes ou Offline? O que é a coluna Tipo?
   Por que um vale entrou em Online/Offline?
4. O que significa um pedido "Divergente"?
5. O que faço com valor em "Não classificado"?
6. Por que os benefícios do iFood contam como Online?
7. Pedidos cancelados entram no fechamento?
8. Em que dia cai um pedido entregue depois da meia-noite?
9. O que é "Venda concluída"?
10. Como vejo o fechamento de um dia específico?
11. Por que os totais não mudam com os filtros de coluna? Como vejo os totais só do iFood? (Canal)
12. Como exporto e o que vai no Excel? E o PDF por canal?
13. Posso cadastrar a classificação de uma forma de pagamento?
14. Por que não vejo o botão Exportar?
15. Por que minha loja não aparece no seletor?
16. Por que a consulta demora e o período é limitado a 31 dias?
17. Quanto cada canal vendeu? (painel de canais) E por que a soma deve bater com o total do anel?
18. Apareceu "A loja não tem número de loja no cadastro". O que faço? (Erros comuns)
19. Como vejo quais pedidos formam um total? (clique no indicador filtra a tabela)

---

## 13. Insumo pra Tour (obrigatório)

| #   | Tela       | Target                                                | Mensagem                             |
| --- | ---------- | ----------------------------------------------------- | ------------------------------------ |
| 1   | Fechamento | `[data-tour="fechamento-maestro-filtros"]`            | Loja e período                       |
| 2   | Fechamento | `[data-tour="fechamento-maestro-pesquisar"]`          | Pesquisar                            |
| 3   | Fechamento | `[data-tour="fechamento-maestro-totais-canais"]`      | Vendas por canal (espera a pesquisa) |
| 4   | Fechamento | `[data-tour="fechamento-maestro-totais-indicadores"]` | Totais do fechamento                 |
| 5   | Fechamento | `[data-tour="fechamento-maestro-totais-toggle"]`      | Mostrar e esconder os totais         |
| 6   | Fechamento | `[data-tour="fechamento-maestro-toolbar"]`            | Colunas e Excel                      |
| 7   | Fechamento | `[data-tour="fechamento-maestro-divergencias"]`       | Divergências                         |
| 8   | Fechamento | `[data-tour="fechamento-maestro-pdf"]`                | PDF por canal (espera a pesquisa)    |

---

## 14. Histórico

### 2026-10-30 — v1.0 inicial

- Criado por Iago Pereira a partir do Fechamento Diário Maestro legado (UniGUI,
  `view.relatorios.maestro.fechamentoDiario` + `model.relatorios.maestro.fechamentoMaestro`).
- Só API (sem banco); classificação de pagamentos como regra fixa (RN-4).
- A tabela "Por dia" saiu da tela (fica no Excel); a tela ficou com uma tabela só,
  a de pedidos. Os totais viraram uma barra de 12 indicadores:
  venda, cancelados por grupo, descontos loja/parceiro (RN-10) e sem classificação.
- Dashboard em dialog com o gráfico Vendas por canal (RF-9, RN-11).

### 2026-11-03 — v1.1 coluna Tipo e regra do legado

- Com o frontend do legado em mãos, a RN-4 passou a ser a `classifyPaymentSegment`
  dele: ONLINE VR pelo cadastro `gia_relatorios.formas_pagamento` (lido do banco do
  Maestro, RN-3), ONLINE por ` - PRE PAGO`, OFFLINE no resto. Muda, por exemplo:
  `CREDIT OFFLINE` passa de Adquirente para Offline; vales pré-pagos
  (`MEAL_VOUCHER ...`, `PLUXEE`) passam de Online para Adquirentes.
- Nova coluna **Tipo** (TIPO do legado) na tabela e no Excel; rótulos do legado.
- Colunas da tabela na ordem, ativas/inativas e obrigatórias do legado (RF-5),
  com os campos que faltavam (Nº parceiro, Nº conta, Data de ação, dados do
  cliente, endereço, confirmado/cancelado por, Nome loja). Saíram Não classificado
  e Incentivo parceiro. Permissão nova `fechamento-maestro.ver-dados-cliente`
  (RN-12), com o mascaramento do Reports Maestro.
- Totais iguais ao legado em produção (conferido com o print da loja 01 em
  02/11): Adquirentes online/offline (RN-4a), Descontos parceiro com abatimento
  do Online (RN-10), Descontos loja dos pedidos com venda concluída e venda
  concluída = `DISPATCHED`/`DELIVERED` (RN-7). Barra com os 12 indicadores do
  legado (saíram Total pago e Cancelado), só no desktop.
- Layout: título do módulo à esquerda e filtros à direita, na mesma barra; busca
  genérica da tabela só no celular.

### 2026-11-10 — v1.2 filtro de canal

- Devolutiva: totais "consolidados", sem acompanhar o filtro da coluna Origem.
  Novo seletor Canal (RF-10) que recorta totais, tabela, divergências e Excel.
  Totais por filtro de coluna dependem do SDK (pendência em §11).

### 2026-11-11 — v1.3 canais e totais na mesma seção

- Devolutiva: unificar os totais com o dashboard. Opção A do canvas de
  validação (a B, faixa de botões, foi trocada pela A no mesmo dia): anel e
  anel de canais à esquerda dos indicadores, na mesma seção, sem legenda (dica
  no mouse); clicar na fatia escolhe o canal e recorta os 12 indicadores, a
  tabela e o Excel. Sai o
  Dashboard (RF-9); o seletor Canal vai para a barra de filtros, ligado ao anel; no
  celular a seção abre inline pelo botão Totais.

### 2026-11-17 — v1.4 PDF de totais por canal

- Pedido da diretoria: PDF com os painéis de totais separados por canal
  (RF-8a). Botão próprio na barra da tabela, fora do Exportar (o SDK não tem
  padrão de PDF); jsPDF no navegador; cabeçalho "Fechamento Maestro" com loja e
  período.
