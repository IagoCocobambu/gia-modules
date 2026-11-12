# Fechamento iFood Diário — cálculo dos totais e chaves das APIs

Versão **0.2.4** · 11/11/2026

Este documento explica:

- como a tela chega aos números de cada pedido e de cada card;
- quais endpoints e campos (chaves JSON) o módulo lê da API do DW, da API do iFood e do cadastro do Maestro.

O módulo só lê: nada é gravado.

Referências no código: `src/server/pedidos.ts` e `src/server/vendas.ts` (leitura das APIs), `src/regras.ts` (cruzamento e colunas calculadas) e `src/helpers.ts` (cards).

---

## 1. Visão geral do fluxo

1. O usuário escolhe a **loja (Empresa)** e o **dia**.
2. **Pedidos do DW**: chegam numa chamada só, com todos os pedidos da loja no dia. Ficam só os dos canais **iFood** e **iFood Vasto**.
3. **Vendas do iFood**: a tela busca as vendas do dia de **cada restaurante da loja no iFood** (um por operação com integração iFood: cb, cbx, pzcb, dani, adgcb, burger, vst, vstss…). Vêm em páginas de 20, até 4 páginas ao mesmo tempo.
4. **Cruzamento**: cada pedido do DW é ligado à venda do iFood correspondente (seção 4).
5. **Colunas calculadas**: Total do pedido, Desconto copart, Status, Cancelamento… (seção 5).
6. **Cards**: os 9 totais do dia (seção 6). Saem só depois que todas as partes chegaram.

---

## 2. API de delivery do DW

**Endpoint**

```
GET {base apidw}/Delivery/?loc_ref={nº da loja}&start_date={AAAA-MM-DD}&end_date={AAAA-MM-DD}
Authorization: Bearer {token}
```

- **Credencial**: integração `apidw` do hub de Credenciais.
- **`loc_ref`**: número da loja com 2 dígitos. Sai do nome da Empresa ("17.CB RECIFE" → `17`) e, na falta, do vínculo BIAPI.
- **`start_date` = `end_date`**: o dia pesquisado.
- **Tempo limite**: 90 s.

**Resposta:** a lista de pedidos vem na raiz ou em `results`, `data` ou `orders`.

**Canais usados (`origem`):** só `iFood` e `iFood Vasto`. App Coco Bambu, 99Food, Rappi e Pedido manual ficam de fora.

### Chaves lidas de cada pedido

| Chave do DW | Chave reserva | Uso na tela |
|---|---|---|
| `id` | `order_id` | ID do pedido |
| `n_pedido` | `order_id` | Nº pedido |
| `n_parceiro` | — | **Chave do cruzamento** com o `shortId` do iFood |
| `data_de_criacao_horario_sp` | `data_de_criacao_utc` | Data hora pedido |
| `data_de_criacao_utc` | — | **Desempate do cruzamento** (comparada com o `createdAt` do iFood) |
| `origem` | `channel` | Canal do pedido (filtro iFood / iFood Vasto) |
| `valor_do_pedido` | `order_value`, depois o total pago | Valor dos itens |
| `valor_da_entrega` | `delivery_fee` | Taxa de entrega |
| `total_pago` | `total`, `amount` | Total pago no DW (informativo; usado no trecho sem valor, seção 5.2) |
| `desconto_total` | `discount` | Total descontos (DW) |
| `forma_de_pagamentos` | `payment_method` | Formas de pagamento (texto que é classificado) |
| `incentivo_parceiro` | — | Incentivo promocional do iFood |
| `incentivo_loja` | — | Incentivo promocional da loja |
| `taxa_extra_parceiro` | — | Taxa de serviço |
| `retirada` | — | Agendado (SIM/NÃO) |
| `nome_loja` | — | Restaurante |
| `id_loja` | — | ID do restaurante (trocado pelo do iFood quando cruza) |

Número ausente ou inválido vale **0**. Texto ausente vale **vazio**.

Exemplo de `forma_de_pagamentos`:

```
BENEFICIO IFOOD ENTREGA - PRE PAGO (7.01), BENEFICIO IFOOD - PRE PAGO (5.0), PIX ONLINE PIX - PRE PAGO (203.9)
```

Cada trecho separado por vírgula ou ponto e vírgula é uma forma. O número entre parênteses é o valor dela.

---

## 3. API do iFood (Merchant API)

**Credencial:** integração `ifood` do hub de Credenciais (OAuth `client_credentials`, token válido por 6 h, renovado pelo hub).

### 3.1 Vendas do dia de um restaurante

```
GET {base ifood}/financial/v3.0/merchants/{merchantId}/sales?beginSalesDate={dia}&endSalesDate={dia}&page={n}
Authorization: Bearer {token}
```

- **`merchantId`**: UUID do restaurante no iFood. Os restaurantes de cada loja estão na tabela `RESTAURANTES_IFOOD` do módulo, gerada da planilha "GIA - Empresas - Cadastro - 2026-11-09" (aba Integrações das operações, tipo IFOOD).
- **`page`**: começa em 1. A página 1 diz o total em `pageCount`; cada página traz 20 vendas.
- **Respostas tratadas:**
  - `204` (ou corpo vazio): o restaurante não teve vendas.
  - `401`: token vencido → aviso.
  - `403`: o restaurante não autorizou o aplicativo → aviso.
  - `429`: limite de requisições → espera e tenta de novo.
- **Tempo limite**: 20 s por página.
- **Página "leve"**: o iFood às vezes devolve vendas sem `payments`. Nesse caso a página é pedida de novo até 2 vezes, e fica a resposta mais completa.

#### Chaves lidas de cada venda (`sales[]`)

| Chave do iFood | Uso |
|---|---|
| `shortId` | **Chave do cruzamento** (= `n_parceiro` do DW) |
| `createdAt` | **Desempate do cruzamento** (= `data_de_criacao_utc` do DW) |
| `merchant.shortId` | ID do restaurante |
| `currentStatus` | `CONCLUDED` → Confirmado = SIM; outro → NÃO |
| `type` | Tipo de pedido |
| `salesChannel` | Canal de venda (tem que ser `IFOOD` para o pedido ficar na tela) |
| `payments.methods[].value` | Somados → Total do parceiro |
| `orderStatusHistory[].value` | `PARTIAL_CANCELLATION_ORDER` → Tem cancelamento parcial = SIM |
| `orderStatusHistory[]` com `value = CANCELLED` (só se `currentStatus = CANCELLED`) → `createdAt` | Data do cancelamento |
| ↳ `metadata.cancelOrigin` | **Origem do cancelamento** (se preenchida, o pedido é Cancelado) |
| ↳ `metadata.cancelCodeDescription` | Motivo do cancelamento |
| ↳ `metadata.cancellationDispute.isContestable` | Cancelamento é contestável (SIM/NÃO) |
| ↳ `metadata.cancellationDispute.reasons[]` | Motivo da impossibilidade de contestar |
| `orderEvents[]` com `fullCode = FINANCIAL_BILLED_ORDER_ENTRY` → `metadata.entries[0].period.endDate` | Data limite de contestação |
| `pageCount` (raiz da resposta) | Total de páginas do restaurante no dia |

### 3.2 Lista de restaurantes da conta (só o nome)

```
GET {base ifood}/merchant/v1.0/merchants?page={n}&size=100
```

Chaves usadas: `id` (UUID) e `name`. Servem só para mostrar o nome na coluna **Restaurante no iFood**. A lista fica guardada por 30 min; se falhar, aparece o código da operação no lugar do nome.

---

## 4. Cruzamento DW × iFood

1. **Par candidato**: o `n_parceiro` do DW é igual ao `shortId` do iFood **e** as horas de criação (`data_de_criacao_utc` × `createdAt`) diferem no máximo **10 minutos**. Se uma das horas faltar, vale só o código.
2. **Escolha**: com mais de um candidato, fica o par de horas mais próximas. Cada venda cruza com um pedido só, e cada pedido com uma venda só.
   - O desempate é necessário porque o `shortId` tem 4 dígitos e se repete entre restaurantes da mesma loja, e até no mesmo restaurante em horas diferentes do dia.
   - Nos pares certos, as duas horas são **idênticas**. Conferido em 08/11/2026 nas lojas 03, 08, 17 e 25: 100% dos pedidos cruzados.
3. **O que o pedido recebe do iFood**:
   - Confirmado, Total do parceiro, Tipo de pedido;
   - Canal de venda (`salesChannel`) e ID do restaurante;
   - campos de cancelamento, data limite de contestação e cancelamento parcial;
   - nome do restaurante e operação (colunas **Restaurante no iFood** e **Operação**).
4. **Filtro final**: o pedido cruzado fica na tela só se o canal do iFood for `IFOOD` (sai, por exemplo, o `IFOOD_SHOP`). O não cruzado fica, porque o DW já veio filtrado nos canais iFood e iFood Vasto.

---

## 5. Colunas calculadas (por pedido)

### 5.1 Valores

| Coluna | Fórmula |
|---|---|
| **Total do pedido** | `valor_da_entrega` + `valor_do_pedido` − `incentivo_loja` |
| **Desconto copart** | `incentivo_parceiro` − `taxa_extra_parceiro` |
| **iFood reembolsa?** | `incentivo_loja` = 0 → N/A; = 12 → SIM; ≤ 10 → NÃO; outro valor → VERIFICAR |
| **Cancelamento** | **OK** quando Confirmado = SIM (`currentStatus = CONCLUDED`) **e** não há origem de cancelamento; senão **Cancelado**. Durante a busca, o pedido ainda não achado fica **Aguardando iFood** |

O **Total do pedido** é calculado. Ele **não** é o `total_pago` do DW.

### 5.2 Tipo de cada forma de pagamento (coluna Status)

Cada trecho de `forma_de_pagamentos` é classificado, nesta ordem:

1. Trecho vazio ou `DESCONHECIDO` → **sem classificação**.
2. Trecho que contém uma descrição do cadastro **ONLINE VR** (seção 7) da mesma origem do pedido, ou sem origem → **ONLINE VR**.
3. Trecho que termina em `- PRE PAGO` → **ONLINE**.
4. Qualquer outro → **OFFLINE**.

Antes de comparar, o cartão mascarado (`**** 1234 - `) é retirado do texto.

**Valor do trecho:** é o número entre parênteses. Sem parênteses, o trecho vale o total do pedido se for a única forma do pedido; senão vale 0.

**Status do pedido:** os tipos distintos das formas dele (ex.: `ONLINE; OFFLINE`).

**Tipo único:** quando todas as formas do pedido são do mesmo tipo. Pedido misto não entra nos cards de tipo.

---

## 6. Os cards (totais do dia)

Regras comuns:

- Os cards contam **só pedidos com Cancelamento = OK**, menos os dois de "sem classificação", que contam todos os pedidos.
- Os cards "só ONLINE", "só OFFLINE" e "só ONLINE VR" exigem **tipo único**.
- As somas são feitas em centavos.

| Card | Pedidos que entram | Soma de cada pedido |
|---|---|---|
| **iFood online** | OK e só ONLINE | Total do pedido − Desconto copart |
| **iFood adquirentes** | OK e só ONLINE VR | Total do pedido − `incentivo_parceiro` − Desconto copart |
| **Descontos offline e VR** | OK e só OFFLINE ou só ONLINE VR | `incentivo_parceiro` |
| **Descontos loja — online** | OK e só ONLINE | `incentivo_loja` |
| **Descontos loja — offline** | OK e só OFFLINE | `incentivo_loja` |
| **Descontos loja — VR** | OK e só ONLINE VR | `incentivo_loja` |
| **Desconto copart** | OK (qualquer tipo, inclusive misto) | Desconto copart |
| **Valor sem classificação** | todos | soma dos trechos sem classificação (trecho sem valor: Total do pedido, se for a única forma) |
| **Pagamentos sem classificação** | todos | quantidade de trechos sem classificação |

À vista ficam iFood online, iFood adquirentes, Desconto copart e Pagamentos sem classificação. Os outros 5 abrem em **Ver todos os totais**.

**Clique no card:** a tabela mostra só os pedidos com parcela diferente de zero naquele card. Em "Pagamentos sem classificação", mostra os pedidos com algum trecho sem classificação.

**Valores dos cards:** são sempre do dia inteiro da loja, com todas as operações juntas. Não mudam com o filtro da tabela.

### Exemplo (loja 17, 08/11/2026, pedido 9878)

| Campo do DW | Valor |
|---|---|
| `valor_do_pedido` | 213,90 |
| `valor_da_entrega` | 13,99 |
| `incentivo_loja` | 11,98 |
| `incentivo_parceiro` | 12,01 |
| `taxa_extra_parceiro` | 3,99 |
| `forma_de_pagamentos` | três trechos, todos `- PRE PAGO` → ONLINE (supondo nenhum no cadastro ONLINE VR) |

- Total do pedido = 13,99 + 213,90 − 11,98 = **215,91**
- Desconto copart = 12,01 − 3,99 = **8,02**
- iFood reembolsa? = VERIFICAR (`incentivo_loja` 11,98 não é 0, 12 nem ≤ 10)
- Com Cancelamento = OK, entra em:
  - **iFood online**: 215,91 − 8,02 = **207,89**
  - **Descontos loja — online**: **11,98**
  - **Desconto copart**: **8,02**

---

## 7. Cadastro de formas ONLINE VR (banco do Maestro)

```sql
select descricao, origem
from gia_relatorios.formas_pagamento
where coalesce(is_deleted, false) = false and tipo = 'ONLINE VR'
```

- **Acesso**: secret `GIA_SERVER_DATABASE_URL`, usuário só leitura. É lido a cada pesquisa.
- **`descricao`**: trecho procurado dentro da forma de pagamento, em maiúsculas. As descrições mais longas são testadas primeiro.
- **`origem`**: canal a que a forma vale (ex.: iFood). Vazio vale para todos os canais.

---

## 8. API do próprio módulo (handlers)

| Handler | Body | Devolve |
|---|---|---|
| `lojas` | — | Empresas do escopo: `empresaId`, `nome`, `locRef`, `restaurantes[]` (`operacao`, `merchant`), `ativo` |
| `pedidos` | `empresaId`, `data` | `pedidos[]` (DW, canais iFood e iFood Vasto) e `formasVr[]` |
| `vendas` | `empresaId`, `data`, `merchant`, `pagina` | `vendas[]`, `totalPaginas`, `restaurante` (nome, na página 1) e `aviso` |

Todos os handlers exigem a permissão `fechamento-ifood-diario.ler`. Os que recebem loja conferem o escopo com `requireEmpresa`. O `vendas` recusa (422) um `merchant` que não seja da loja.
