# PRD — Fechamento iFood Diário

## Metadata (obrigatório)

| Campo                  | Valor                                     |
| ---------------------- | ----------------------------------------- |
| **module_id**          | `fechamento-ifood-diario`                 |
| **Label visível**      | Fechamento iFood Diário                   |
| **Categoria**          | `vendas`                                  |
| **Autor**              | Iago Pereira (iago.pereira@cocobambu.com) |
| **Versão do PRD**      | `1.0`                                     |
| **Status**             | `em-dev`                                  |
| **Última atualização** | 2026-11-06                                |
| **SDK version mínima** | `@gia-cb/sdk@0.1.0-alpha.70`              |

---

## 1. Problema / Contexto (obrigatório)

### 1.1 Qual o problema?

O financeiro precisa fechar, por loja e por dia, o que entrou pelo **iFood**:
quanto foi pago online no iFood, quanto entrou por vale-refeição e benefícios
(**adquirentes**), quanto do desconto foi da loja e quanto foi do iFood, e qual é
o **desconto copart**. Para isso é preciso cruzar os pedidos do delivery (DW) com
o que o iFood reconhece como venda concluída ou cancelada.

### 1.2 Como é feito hoje?

Pela tela **Fechamento iFood Diário** do GIA legado (UniGUI/Delphi,
`TfrmFechamentoDiarioIfood` + `TDmFechamentoDiarioIfood`, pacote
`legacy-gia/unpack/entrega-ifood`). Um front React num `TUniHTMLFrame` pede ao
Delphi o fechamento (`searchData`). O Delphi:

1. busca os pedidos da loja no dia na API do DW (`/Delivery/`);
2. busca as vendas do dia na API financeira do iFood
   (`financial/v3.0/merchants/{merchant}/sales`, paginada), com OAuth
   `client_credentials` e `client_id`/`client_secret` **no código**;
3. cruza as duas (`MergeIfoodData`) e manda junto o cadastro de classificações
   `gia_relatorios.formas_pagamento`.

As contas (Total, Desconto copart, iFood reembolsa?, Cancelamento, tipo de
pagamento e os cards) ficam no `App.tsx` do front. A mesma tela tem uma janela
(Admin/TI) para editar o cadastro de formas de pagamento.

### 1.3 Por que vale a pena resolver?

A migração tira as credenciais do código (hub de Credenciais), aplica o escopo de
lojas no servidor, funciona no celular e mantém as contas iguais às do legado
(conferidas pedido a pedido, §7).

---

## 2. Personas e cenários (obrigatório)

### 2.1 Personas

| Persona                 | Permissões                                                        | Frequência de uso | Conhecimento técnico |
| ----------------------- | ----------------------------------------------------------------- | ----------------- | -------------------- |
| Financeiro / tesouraria | `fechamento-ifood-diario.ler`, `fechamento-ifood-diario.exportar` | Diário            | Médio                |
| Gerente de loja         | `fechamento-ifood-diario.ler`                                     | Diário            | Baixo                |
| Analista de delivery    | `fechamento-ifood-diario.ler`, `fechamento-ifood-diario.exportar` | Semanal           | Médio                |

### 2.2 Cenários primários

1. O financeiro escolhe a loja e o dia, pesquisa e lança os cards no fechamento.
2. O analista filtra os pedidos de um card (ex.: iFood adquirentes) para conferir
   pedido a pedido e exporta em Excel.
3. O gerente confere os pedidos **Cancelado** do dia, com origem, motivo e prazo de
   contestação.

### 2.3 Edge cases / Cenários secundários

- Loja **sem a integração iFood** no cadastro: os pedidos não cruzam e ficam
  Cancelado (regra do legado); a tela avisa em amarelo.
- **API do iFood fora do ar** ou credencial recusada: o fechamento sai com o DW e
  um aviso (o legado seguia em silêncio).
- Pedido do DW **não achado** no iFood: fica Cancelado, sem aviso (como no legado).
- Venda do iFood **sem pedido no DW**: fica fora, sem aviso (o legado só gravava em
  log de debug).
- Pedido com formas de **mais de um tipo**: não entra nos cards de tipo (RN-8).
- Forma de pagamento sem nome ou `DESCONHECIDO`: vira "sem classificação".
- Loja sem número no cadastro: 422 com o motivo.

---

## 3. Requisitos funcionais (obrigatório)

### RF-1: Seleção de loja

Seletor com **todas as operações** do escopo do usuário (`ctx.operacoes()`) —
**exceção** deste módulo, que busca por operação e não por Empresa (decisão de
2026-11-09). A pesquisa manda o `operacao_ref` e o servidor confere com
`ctx.requireOperacao`. A primeira já vem selecionada, como no legado. Operação cuja
Empresa não tem merchant do iFood aparece com a marca **Sem iFood**.

### RF-2: Dia

Um dia por pesquisa (o legado só tinha um campo de data), começando em **ontem** (o legado começava em hoje; mudado a pedido em 2026-11-09), sem
datas futuras.

### RF-3: Leitura e cruzamento

Handler `fechamento`: DW + API do iFood + cadastro de formas ONLINE VR, cruzados
e calculados no servidor (RN-1 a RN-7). Devolve só os pedidos do canal iFood.

### RF-4: Cards do dia

Os 9 cards do legado (RN-8), numa barra que o botão **Totais** mostra e esconde.
Cada card é um filtro da tabela (os pedidos que somaram nele). Abaixo da barra, a
lista das formas não mapeadas (no legado ficava num tooltip).

### RF-5: Tabela de pedidos

As colunas do `ALL_COLUMNS` do legado, na mesma ordem, sem as repetidas. Ligadas
por padrão as do `DEFAULT_SELECTED_COLUMNS`; obrigatórias (sempre visíveis) as
`isMandatory`. Filtro e ordenação por coluna no computador, busca no celular.
Pedido Cancelado com fundo vermelho claro.

### RF-6: Avisos do iFood

Faixa amarela com: loja sem integração iFood, falha de credencial ou da API do
iFood. Como no legado, o cruzamento **não** gera aviso (pedido do usuário,
2026-11-09): pedido do DW não achado no iFood fica só como Cancelado na tabela, e
venda do iFood sem pedido no DW fica fora (o legado só a registrava em log de debug).

### RF-7: Exportar Excel

Com `fechamento-ifood-diario.exportar`: aba **Resumo** (os cards do dia e as
formas sem classificação) e aba **Pedidos** (os pedidos da tela, com todas as
colunas e linha Total). O legado exportava só as colunas visíveis, numa aba.

---

## 4. Telas e fluxos (obrigatório)

### 4.1 Mapa de telas

| Tela       | Rota                       | Permissão                     |
| ---------- | -------------------------- | ----------------------------- |
| Fechamento | `/fechamento-ifood-diario` | `fechamento-ifood-diario.ler` |

### 4.2 Fluxos principais

1. Abrir → escolher loja e dia → **Pesquisar** → avisos (se houver), cards e
   tabela.
2. Clicar num card → tabela filtrada → **Exportar**.
3. No celular, a pesquisa recolhe a barra de filtros; a seta do cabeçalho reabre.

---

## 5. Requisitos técnicos

### 5.1 Schema de banco

Não cria tabela nem migration e não grava nada. Só lê, do banco do Maestro (o
`UniConnMaestro` do legado):

```sql
select descricao, origem
from gia_relatorios.formas_pagamento
where coalesce(is_deleted, false) = false and tipo = 'ONLINE VR'
```

### 5.2 Permissões (obrigatório)

| Key                                | Descrição                                        | Granularidade     |
| ---------------------------------- | ------------------------------------------------ | ----------------- |
| `fechamento-ifood-diario.ler`      | Consultar o fechamento iFood das lojas do escopo | Leitura           |
| `fechamento-ifood-diario.exportar` | Exportar o fechamento e os pedidos em Excel      | Operação especial |

O módulo não tem escrita. No legado, a tela ficava atrás de `gia /
relfechamentoifood` e o Excel era livre.

### 5.3 Integrações externas

| Integração                                                  | Propósito        | Camada                              | Credencial                                    |
| ----------------------------------------------------------- | ---------------- | ----------------------------------- | --------------------------------------------- |
| `api-dw.cocobambu.com` `/Delivery/`                         | Pedidos do dia   | handler `fechamento`                | hub de Credenciais, integração `apidw`        |
| Merchant API do iFood `financial/v3.0/merchants/{id}/sales` | Vendas do dia    | handler `fechamento`                | hub de Credenciais, integração `ifood`        |
| Banco do Maestro (`gia_relatorios.formas_pagamento`)        | Formas ONLINE VR | handler `fechamento` (`sql`)        | secret `GIA_SERVER_DATABASE_URL` (só leitura) |
| Operações do escopo e Empresa da operação (`locRefs.IFOOD`) | Lojas e merchant | `ctx.operacoes()`, `ctx.empresas()` | —                                             |

### 5.4 BFF / processamento em segundo plano

Nenhum: uma loja × um dia, síncrono (~4 s medidos no DW). Excel no navegador.

### 5.5 Realtime

Não usa.

---

## 6. Regras de negócio (obrigatório)

As regras são as do legado e foram conferidas contra uma cópia literal do código
antigo (§7). Onde o front publicado (bundle de 05/05/2026) e o fonte (03/06/2026)
divergiam, vale o fonte; nas contas abaixo os dois são iguais. O
`DOCS/mapeamento_dados_ifood.md` do pacote está desatualizado (traz fórmulas que o
código não usa, como `× 0,965`) e não foi seguido.

- **RN-1 — loja**: a loja é a **operação**, e cada operação tem os seus pedidos,
  mesmo duas do mesmo número (`08 cb` e `08 vst`). `loc_ref` do DW = número do
  começo do `operacao_ref` ("54 cb" → `54`); o DW junta as operações do número e as
  separa pela `origem` do pedido: **"iFood"** é a operação principal e **"iFood
  Vasto"** a do Vasto na loja do CB. Os pedidos são separados pelo canal **antes**
  do cruzamento.
  - Operação principal: canal "iFood"; restaurante principal = `locRefs.IFOOD` da
    Empresa dona da operação (o `gia.empresas_integracoes` tipo `IFOOD` do legado).
  - Operação Vasto na loja do CB (`08 vst`, `17 vst`, `25 vst`, `69 vst`, `86 vst`):
    canal "iFood Vasto" e o restaurante do Vasto, numa tabela do módulo
    (`OPERACOES_IFOOD_PROPRIO`) — provisória: o SDK não tem vínculo iFood por
    operação (§11). Operação nova nessa situação entra na tabela.
- **RN-1a — só o restaurante da operação** (decisão de 2026-11-09): o canal "iFood"
  de uma loja no DW traz os pedidos de **todas as marcas** dela no iFood (Coco
  Bambu, Express, Pizzaria, Dani…), que são restaurantes diferentes. Como no legado,
  o cruzamento usa **só o restaurante da operação**: os pedidos das outras marcas
  não são achados e ficam como **Cancelado** (fora dos cards). Foi testado cruzar
  também com os restaurantes de mesma razão social (22 lojas em 08/11/2026: 1.777
  de 1.777 achados, contra 1.486), mas os cards deixavam de bater com a tela antiga
  — ex.: 01 Goiânia, iFood online R$ 17.364,90 × R$ 12.574,79 do legado — e o
  usuário escolheu manter a regra do legado. A coluna **Restaurante no iFood**
  mostra o restaurante em que o pedido foi achado.
- **RN-2 — pedido do DW** (`MapApiItemToTransaction`): `total_pago` do DW,
  `valor_do_pedido` (na falta, o total pago), `valor_da_entrega`,
  `desconto_total`, `incentivo_parceiro`, `incentivo_loja`,
  `taxa_extra_parceiro` (ausente = 0); **Agendado** = SIM quando `retirada` é
  SIM; **Data** = o dia pesquisado. Confirmado e os campos do iFood começam vazios.
- **RN-3 — cruzamento** (`MergeIfoodData`): `n_parceiro` do DW = `shortId` da
  venda. Do iFood: ID do restaurante (`merchant.shortId`), Total do parceiro (soma
  de `payments.methods[].value`), Confirmado (SIM se `currentStatus = CONCLUDED`,
  senão NÃO), Tipo de pedido (`type`), Canal de venda (`salesChannel`), Tem
  cancelamento parcial (`PARTIAL_CANCELLATION_ORDER` no histórico), e — só se o
  status é `CANCELLED` — data, origem e motivo do cancelamento, contestável e
  motivos da disputa; data limite de contestação = `period.endDate` do 1º
  lançamento do evento `FINANCIAL_BILLED_ORDER_ENTRY`. Uma venda cruza com um
  pedido só (o primeiro).
- **RN-4 — só iFood**: entram os pedidos cujo canal (o do iFood, se cruzado; senão
  o do DW) normalizado é `ifood` (`normalizeOrigemKey`). `IFOOD_SHOP` e outros
  ficam fora, como no legado.
- **RN-5 — formas de pagamento**: `forma_de_pagamentos` separada em toda `,` ou
  `;`; valor = número entre parênteses no fim. Trecho sem valor: vale o total do
  pedido se for o único trecho, senão 0.
- **RN-6 — tipo** (`classifyPaymentSegment`), sobre o texto sem o cartão mascarado,
  em maiúsculas: vazio ou `DESCONHECIDO` → SEM CLASSIFICAÇÃO; contém (sem o
  ` - PRE PAGO`) uma forma ONLINE VR do cadastro da mesma origem ou sem origem →
  ONLINE VR; termina em ` - PRE PAGO` → ONLINE; senão OFFLINE. Coluna **Status** =
  os tipos do pedido, sem repetir, separados por `; `.
- **RN-7 — colunas calculadas**: Total do pedido = entrega + itens − incentivo da
  loja; Desconto copart = incentivo do iFood − taxa de serviço; iFood reembolsa? =
  N/A (incentivo da loja 0), SIM (12), NÃO (≤ 10), VERIFICAR (outro);
  Cancelamento = OK quando não há origem de cancelamento e Confirmado = SIM.
- **RN-8 — cards** (`calculateSummary`), só pedidos com Cancelamento OK e Status
  de um tipo só:
  - iFood online = Σ (Total − Desconto copart) dos ONLINE;
  - Descontos offline e VR = Σ incentivo do iFood dos OFFLINE e dos ONLINE VR;
  - iFood adquirentes = Σ (Total − incentivo do iFood − Desconto copart) dos ONLINE VR;
  - Descontos loja online / offline / VR = Σ incentivo da loja de cada tipo;
  - Desconto copart = Σ Desconto copart de todos os OK (qualquer Status);
  - Valor e quantidade sem classificação = trechos sem classificação de **todos**
    os pedidos (OK ou não).
- **RN-9 — somas** em centavos inteiros (o legado somava em ponto flutuante; o
  resultado em 2 casas é o mesmo).
- **RN-10 — avisos** (novo): a falha na parte do iFood não derruba a pesquisa
  (como no legado), mas vira aviso na tela.

---

## 7. Critérios de aceite (obrigatório)

- [x] Mesma loja e dia: pedidos, colunas calculadas e os 9 cards iguais aos do
      legado — conferido contra uma cópia literal do `App.tsx` + `MergeIfoodData`
      sobre os pedidos reais do DW (loja 54, 01/11/2026, 68 pedidos), com iFood
      simulado (concluído, cancelado, não confirmado, não achado, `IFOOD_SHOP`,
      paginação) e formas VR, DESCONHECIDO, sem valor e cartão mascarado
- [ ] Mesma conferência com a API real do iFood (pendente: credencial `ifood`)
- [ ] Seletor com todas as operações do escopo; operação sem merchant marcada "Sem iFood"
- [ ] Operação fora do escopo enviada na mão: 403 (`requireOperacao`)
- [ ] Loja sem integração iFood: aviso amarelo e pedidos como Cancelado
- [ ] Erro na API do iFood: aviso amarelo, pesquisa não falha
- [ ] Clicar num card filtra a tabela pelos pedidos dele; clicar de novo tira
- [ ] Com o filtro de um card, a soma da coluna correspondente bate com o card
- [ ] Colunas obrigatórias não podem ser ocultadas; as de cancelamento nascem ocultas
- [ ] Excel: aba Resumo igual aos cards; aba Pedidos com os pedidos filtrados
- [ ] Sem `.exportar`, o botão Exportar não aparece
- [ ] No celular, a barra de filtros recolhe quando a pesquisa começa (recusada:
      fica aberta) e a seta reabre
- [ ] Em tela de toque, os botões mostram o rótulo e não há tooltip
- [ ] Data futura recusada; sem loja, "Não é possível consultar sem ter selecionado uma loja."

---

## 8. Fora de escopo

- **Edição do cadastro de formas de pagamento** (janela Admin/TI do legado:
  `saveClassification`, `getFormasPagamentoMgmt`, `saveFormasPagamentoBatch`).
  O cadastro é do Maestro e é lido só para leitura, como no Fechamento Maestro.
- Mais de um dia por pesquisa (o legado tinha o modo período no código, mas a
  tela só mostrava um dia).
- Filtro de horário na coluna Data hora pedido (o funil de texto da coluna cobre
  a busca).
- O **Fechamento iFood Mensal** (outro módulo).

## 9. Métricas / Telemetria

- Pesquisas por dia e tempo de resposta do handler `fechamento`.
- Quantidade de avisos de iFood por pesquisa (integração ausente, API fora).

## 10. Riscos e mitigações

| Risco                                        | Mitigação                                           |
| -------------------------------------------- | --------------------------------------------------- |
| Integração `ifood` ainda não existe no hub   | Aviso claro na tela; pendência no INTEGRATION.md    |
| Merchant (`locRefs.IFOOD`) faltando em lojas | Marca "Sem iFood" no seletor e aviso na pesquisa    |
| API do iFood instável                        | Aviso na tela; timeout de 60 s por página           |
| Cadastro de formas ONLINE VR desatualizado   | FAQ orienta pedir a inclusão ao time de TI/Sistemas |

## 11. Dependências

### Outros módulos do GIA

Nenhum. Mesma regra de loja e de classificação do Fechamento Maestro.

### Serviços externos

API do DW, Merchant API do iFood, banco do Maestro.

### Decisões pendentes

- Posição no menu (hoje `navGroup: 'cardapio'`, Plataformas).
- Vínculo iFood por operação: o SDK só tem um por Empresa. As operações Vasto na
  loja do CB estão numa tabela do módulo (RN-1) até o SDK expor `locRefs` em
  `GiaOperacao`.
- Se a edição do cadastro de formas de pagamento deve ser portada.

---

## 12. Insumo pra FAQ (obrigatório)

1. Como monto o fechamento do dia?
2. O que soma cada card?
3. Por que um pedido OK não entrou em iFood online nem em iFood adquirentes?
4. Por que um pedido entregue aparece como Cancelado?
5. O que é o Desconto copart? E o iFood reembolsa?
6. Por que o Total do pedido difere do total pago do DW?
7. Como uma forma de pagamento vira ONLINE, ONLINE VR ou OFFLINE?
8. O que faço com valor sem classificação?
9. Como vejo os pedidos de um card?
10. No celular, como reabro a barra de filtros?
11. Por que não vejo Exportar? Por que minha loja não aparece?
12. Loja sem integração iFood / API do iFood com erro.

---

## 13. Insumo pra Tour (obrigatório)

| #   | Tela       | Target                                            | Mensagem        |
| --- | ---------- | ------------------------------------------------- | --------------- |
| 1   | Fechamento | `[data-tour="fechamento-ifood-diario-filtros"]`   | Loja e dia      |
| 2   | Fechamento | `[data-tour="fechamento-ifood-diario-pesquisar"]` | Pesquisar       |
| 3   | Fechamento | `[data-tour="fechamento-ifood-diario-totais"]`    | Cards do dia    |
| 4   | Fechamento | `[data-tour="fechamento-ifood-diario-toolbar"]`   | Colunas e Excel |

---

## 14. Histórico

### 2026-11-06 — v1.0 inicial

- Criado por Iago Pereira a partir do Fechamento iFood Diário do GIA legado
  (`legacy-gia/unpack/entrega-ifood`: `model.ifood.fechamentoDiario.pas`,
  `view.ifood.fechamentoDiario.pas`, `REACT/fechamento-ifood-diario`).
- Regras do legado no servidor (RN-1 a RN-8), conferidas contra o código antigo.
- Novos: avisos da parte do iFood (RN-10), cards como filtro, aba Resumo no Excel.
