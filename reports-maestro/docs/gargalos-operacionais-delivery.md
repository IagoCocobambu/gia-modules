# Gargalos operacionais do delivery — análise dos dados do Reports Maestro

> Análise de 04/11/2026 sobre a API do DW (consulta `/Delivery/`), a mesma que
> alimenta a tabela do Reports Maestro, **com o parâmetro `incluir_historico=true`**.
> Serve de base para o desenho de um dashboard de gargalos. **Não é regra de
> negócio validada**: os pontos marcados como _hipótese_ precisam ser confirmados
> com o time do Maestro/DW ou com a operação.

## 1. Base analisada

| Amostra | Loja                | Período                 | Pedidos | Resposta da API |
| ------- | ------------------- | ----------------------- | ------- | --------------- |
| A       | 08 (Teresina)       | 01/05/2026 a 31/05/2026 | 3.107   | 5,3 MB em 42 s  |
| B       | 54 (Minas Shopping) | 01/10/2026 a 30/10/2026 | 1.693   | 2,9 MB em 26 s  |

Total: **4.800 pedidos**, todos com histórico.

São só **duas lojas**. Os números mostram padrões dessas lojas, não da rede.
Antes de fechar o desenho do dashboard, vale repetir a análise com mais lojas e
meses (ver §8).

A análise trabalhou só com contagens, somas e tempos. Nenhum dado pessoal do
cliente foi usado, e os logins de quem fez cada etapa aparecem anonimizados.

**Definições usadas:**

- **Minutos:** os tempos são em minutos. "p50" é a mediana (metade dos pedidos
  leva menos que isso); "p90" é o valor que 90% dos pedidos não passam.
- **"Atrasado":** total do recebimento até a entrega **acima de 60 min**. É um
  limite de exemplo, **não** um prazo definido pela operação (ver §8).

## 2. O que o `incluir_historico=true` acrescenta

Cada pedido passa a trazer `historico_status`: a lista de **todas as mudanças de
status**, com horário, quem fez e de qual sistema veio.

```json
{
  "status": "PACKED",
  "data_horario_sp": "2026-10-18 12:01:32",
  "feito_por": "<login>",
  "origem": "DELIVERY_INTEGRATION"
}
```

Com isso dá para medir **o tempo de cada etapa**. Sem o histórico, isso era
impossível: a _Data ação_ é sempre igual à _Data criação_, nos 4.800 pedidos.

### Fluxo do pedido e quem registra cada etapa

| Etapa                             | Status no Maestro                                       | Quem registra (`origem` do evento)                                   |
| --------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------- |
| Pedido recebido                   | `RECEIVED`                                              | `DELIVERY_INTEGRATION` (integração do Maestro)                       |
| Aceite pela loja                  | `CONFIRMED`                                             | `DELIVERY_INTEGRATION`, com login da loja                            |
| Embalado (fim do preparo)         | `PACKED`                                                | `DELIVERY_INTEGRATION`, com login da loja                            |
| Despachado (saiu da loja)         | `DISPATCHED`                                            | `DELIVERY_INTEGRATION`                                               |
| A caminho / retornando / entregue | `GOING_TO_DESTINATION`, `RETURN_TO_ORIGIN`, `DELIVERED` | **App de entrega**: `agilizone` (loja 08), `gugs_delivery` (loja 54) |
| Cancelado                         | `CANCELLED`                                             | `CONSUMER` (cliente/plataforma) ou `STORE` (loja)                    |

A partir do _Despachado_, quem atualiza o pedido é o **app de entrega**, e não a
loja.

### Etapas medidas

| Etapa         | De → até              | O que representa                                            |
| ------------- | --------------------- | ----------------------------------------------------------- |
| **Aceite**    | Recebido → Confirmado | quanto a loja demora para aceitar o pedido                  |
| **Preparo**   | Confirmado → Embalado | cozinha + embalagem                                         |
| **Expedição** | Embalado → Despachado | espera até o pedido sair (_hipótese_: espera do entregador) |
| **Rota**      | Despachado → Entregue | deslocamento até o cliente                                  |
| **Total**     | Recebido → Entregue   | o tempo que o cliente percebe                               |

## 3. Desfecho real dos pedidos

O _Status pedido_ da tabela é o **último evento registrado**, o que engana em
dois casos (§5.3). Classificando pelo histórico:

| Desfecho                                        | Loja 08         | Loja 54         |
| ----------------------------------------------- | --------------- | --------------- |
| Entregue                                        | 2.176 (70,0%)   | 1.320 (78,0%)   |
| Entregue, mas o status ficou _Despachado_       | —               | 17 (1,0%)       |
| **Despachado e nunca confirmado como entregue** | **650 (20,9%)** | **309 (18,3%)** |
| Retirada sem baixa                              | 229 (7,4%)      | 17 (1,0%)       |
| Cancelado                                       | 52 (1,7%)       | 17 (1,0%)       |
| Entregue e depois cancelado                     | —               | 13 (0,8%)       |

## 4. Tempos por etapa

### 4.1 Visão geral (pedidos entregues)

| Etapa       | Loja 08 p50 | Loja 08 p90 | Loja 54 p50 | Loja 54 p90 |
| ----------- | ----------- | ----------- | ----------- | ----------- |
| Aceite      | 0,4         | 2,5         | 0,5         | 3,8         |
| **Preparo** | **32,5**    | **58,6**    | **27,8**    | **53,0**    |
| Expedição   | 0,5         | 4,4         | **5,8**     | **23,6**    |
| Rota        | 13,0        | 51,9 ¹      | 19,9        | 52,9        |
| **Total**   | **49,3**    | 100,7 ¹     | **62,7**    | 108,3       |

¹ A loja 08 tem uma baixa em lote no Dia das Mães que infla a rota (§5.2). Sem
as rotas acima de 2h, o total fica em **47,5 (p50) e 77,2 (p90)**.

### 4.2 Pedidos atrasados (total acima de 60 min)

Considerando só entregas com rota de até 2h, para tirar as baixas tardias:

|                 | Loja 08   | Loja 54   |
| --------------- | --------- | --------- |
| Acima de 60 min | **26,7%** | **53,9%** |
| Acima de 90 min | 5,5%      | 16,7%     |

**Em que etapa o atrasado perdeu mais tempo:**

| Etapa que mais consumiu tempo | Loja 08       | Loja 54       |
| ----------------------------- | ------------- | ------------- |
| **Preparo**                   | **410 (76%)** | **390 (55%)** |
| Rota                          | 125 (23%)     | 261 (37%)     |
| Expedição                     | 4 (1%)        | 60 (8%)       |

**Média por etapa, no prazo × atrasados (min):**

| Etapa     | Loja 08 no prazo | Loja 08 atrasados | Loja 54 no prazo | Loja 54 atrasados |
| --------- | ---------------- | ----------------- | ---------------- | ----------------- |
| Aceite    | 0,7              | 1,5               | 1,1              | 1,6               |
| Preparo   | 28,9             | **50,6**          | 23,0             | **38,2**          |
| Expedição | 1,1              | 3,9               | 7,2              | **14,2**          |
| Rota      | 11,1             | **30,8**          | 14,0             | **31,2**          |

## 5. Gargalos encontrados

### 5.1 Preparo — o principal gargalo de tempo

O preparo é a etapa mais longa e a que mais explica os atrasos nas duas lojas.

**Loja 08 — o preparo trava nos dias e horários de pico:**

| Recorte                               | Preparo p50 | Preparo p90 |
| ------------------------------------- | ----------- | ----------- |
| Almoço (11h–13h, sem o Dia das Mães)  | 38,8        | 61,8        |
| Jantar (18h–21h)                      | 30,2        | 50,0        |
| Domingos (sem o Dia das Mães)         | 37,5        | 60,5        |
| **Dia das Mães (10/05, 316 pedidos)** | **83**      | **175**     |

No Dia das Mães, até o **aceite** travou: p90 de **23 min**, contra menos de 3
min nos outros dias. É o retrato de uma loja acima da capacidade.

**Loja 54 — o preparo trava nos dias de pouco movimento:**

- Os piores dias são **terças e quartas** com 27–39 pedidos: 14, 15, 20, 21, 22
  e 27/10, com preparo **p50 de 52 a 62 min**.
- Por dia da semana, a mediana vai de **21–24 min (domingo e segunda)** a **34–41
  min (terça a quinta)**.
- O jantar (p50 34,4, p90 77,4) é mais lento que o almoço (p50 29,3, p90 56,2).

**Leitura (_hipótese_):** na loja 08, falta de capacidade no pico; na loja 54,
equipe reduzida nos dias fracos. As duas pedem cruzar com a escala da cozinha.

### 5.2 Pedidos que saem da loja e nunca têm entrega confirmada

**20,9% (loja 08) e 18,3% (loja 54)** dos pedidos são despachados e nunca recebem
_Entregue_. **Nenhum deles tem evento _A caminho_**: o app de entrega nunca
registrou o pedido.

| Canal          | Loja 08              | Loja 54            |
| -------------- | -------------------- | ------------------ |
| Pedido manual  | **149 de 274 (54%)** | —                  |
| App Coco Bambu | 158 de 718 (22%)     | 95 de 514 (18,5%)  |
| iFood          | 319 de 1.732 (18%)   | 162 de 923 (17,6%) |
| iFood Vasto    | 24 de 151 (16%)      | —                  |
| 99Food         | —                    | 50 de 234 (21,4%)  |
| **Valor**      | **R$ 126,9 mil**     | **R$ 55,8 mil**    |

**Leitura (_hipótese_):** a entrega acontece fora do app de entrega (entregador
que não usa o app, motoboy terceiro, entrega da plataforma) ou a integração com o
app falha. Em qualquer caso, esses pedidos **não têm tempo de rota nem
comprovação de entrega**. Confirmar com a operação.

**Retirada** é um caso à parte: 229 de 232 (loja 08) e 17 de 17 (loja 54)
terminam em _Despachado_. O fluxo de retirada **não tem etapa de fechamento** —
é lacuna de processo, não atraso. No dashboard, a retirada deve ficar fora dos
indicadores de entrega.

### 5.3 Baixas fora de hora no app de entrega e na loja

- **Baixa em lote (loja 08):** no Dia das Mães, por volta das 16h, **145 pedidos
  foram marcados como entregues em lote**, até 15 no mesmo minuto. Eram 145 das
  153 "rotas acima de 2h" do mês. A rota desse dia não reflete o tempo real.
- **Baixa no dia seguinte (loja 54):** 14 entregas registradas só no dia
  seguinte.
- **Loja registra embalado/despachado depois da entrega:** **103 pedidos (6,1%)
  na loja 54** e 17 (0,5%) na loja 08. Como o _Status pedido_ é o último evento,
  **17 pedidos entregues da loja 54 aparecem como _Despachado_**.
- **O status muda dias depois.** Na loja 54, a mesma consulta feita em 30/10 e
  em 04/11 deu resultados diferentes: 126 pedidos em _Confirmado_ passaram a
  _Entregue_ (93) ou _Despachado_ (33), e 33 que estavam _Entregue_ voltaram a
  _Despachado_. Um dashboard deve calcular pelo histórico, nunca pelo status
  atual.

### 5.4 Expedição — espera para sair (loja 54)

Na loja 54, o pedido fica embalado em média **5,8 min (p50) e até 23,6 min (p90)**
antes de sair. No sábado, o p90 chega a **39 min**; às 11h, a mediana é de
**9,4 min**. Nos atrasados, a expedição dobra (7,2 → 14,2 min).

Na loja 08, o pedido sai praticamente ao ser embalado (0,5 min).

**Leitura (_hipótese_):** espera por entregador disponível. Confirmar com a
operação.

### 5.5 Rota

| Canal          | Loja 08 rota p50 (p90) | Loja 54 rota p50 (p90) |
| -------------- | ---------------------- | ---------------------- |
| iFood          | 13,1 (43)              | 18,6 (46,7)            |
| App Coco Bambu | 13,8 (132) ¹           | 20,3 (56)              |
| 99Food         | —                      | **26,3 (64,4)**        |
| iFood Vasto    | 7,5 (21)               | —                      |
| Pedido manual  | 23,6 (61)              | —                      |

¹ Inflado pela baixa em lote do Dia das Mães (§5.3).

Na loja 08, 43 pedidos (1,4%) **voltaram para a loja** (`RETURN_TO_ORIGIN`) antes
de serem entregues.

### 5.6 Cancelamentos

O histórico mostra **quem** cancelou: `CONSUMER` (cliente ou plataforma) ou
`STORE` (loja). Isso confirma que o _Cancelado por_ vazio na tabela é
cancelamento do cliente/plataforma.

|                         | Loja 08                                   | Loja 54                                     |
| ----------------------- | ----------------------------------------- | ------------------------------------------- |
| Cancelamentos           | 52                                        | 30                                          |
| Pelo cliente/plataforma | 30                                        | 24                                          |
| Pela loja               | 13                                        | 2                                           |
| Pelos dois              | 9                                         | 4                                           |
| Etapa antes de cancelar | Confirmado 21, Despachado 16, Recebido 13 | **Entregue 13**, Confirmado 8, Despachado 5 |

- **O cliente desiste depois de muito tempo.** Mediana de **106 min (loja 08) e
  87 min (loja 54)** entre o recebimento e o cancelamento do cliente. Quando a
  loja cancela, é rápido (7–10 min). _Hipótese_: o cliente cancela por atraso —
  o que liga este gargalo ao preparo (§5.1).
- **Cancelado depois de entregue (loja 54):** 13 pedidos, **R$ 2,4 mil**, todos
  iFood/99Food cancelados pelo cliente, cerca de **20 min depois da entrega**
  (mediana). _Hipótese_: reclamação pós-entrega (pedido errado, frio, faltando
  item).
- Taxa de cancelamento: 1,7% (loja 08) e 1,8% (loja 54). Na loja 08, a semana do
  Dia das Mães teve 4,8%.

### 5.7 Não dá para saber quem fez cada etapa

Aceite, embalagem e despacho são feitos por **2 ou 3 logins por loja**:

- Loja 54: **um único login faz mais de 99%** dos aceites e das embalagens.
- Loja 54: 49% dos despachos não têm login nenhum.
- Loja 08: três logins fazem tudo.

São logins compartilhados (provavelmente o do equipamento da expedição). Não dá
para medir desempenho por pessoa nem por turno — só por loja e horário.

### 5.8 Concentração de demanda e custo por canal

Estes dois pontos vêm da análise sem histórico (amostra da loja 54 com 1.641
pedidos, tirada em 30/10) e seguem válidos.

**Demanda:**

|                  | Loja 08                                                   | Loja 54                 |
| ---------------- | --------------------------------------------------------- | ----------------------- |
| Picos de horário | **11h** (23% dos pedidos do mês, só nessa hora) e 18h–20h | 11h–12h e 19h–20h       |
| Fim de semana    | **domingo 37%**, sábado 22%                               | domingo 23%, sábado 24% |

**Custo por canal:**

| Loja | Canal          | Pedidos | Ticket médio | Desconto sobre o pedido | Incentivo pago pela loja          |
| ---- | -------------- | ------- | ------------ | ----------------------- | --------------------------------- |
| 08   | iFood          | 1.732   | R$ 205       | 8,4%                    | **R$ 25,5 mil**                   |
| 08   | iFood Vasto    | 151     | R$ 205       | 4,0%                    | R$ 0,9 mil                        |
| 08   | App Coco Bambu | 718     | R$ 191       | 0,7%                    | —                                 |
| 08   | Pedido manual  | 506     | R$ 201       | 0,0%                    | —                                 |
| 54   | iFood          | 906     | R$ 190       | 12,3%                   | R$ 18,1 mil                       |
| 54   | **99Food**     | 224     | R$ 239       | **39,7%**               | **R$ 20 mil** (~R$ 89 por pedido) |
| 54   | App Coco Bambu | 505     | R$ 161       | 1,0%                    | —                                 |

Na loja 54, 22% dos pedidos do App Coco Bambu têm frete de R$ 0,01.

## 6. Dados a confirmar antes de mostrar no dashboard

| Ponto                  | O que foi visto                                                          | O que confirmar                                                   |
| ---------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| Despachado sem entrega | ~20% dos pedidos nunca entram no app de entrega                          | Como esses pedidos são entregues e por que não passam pelo app    |
| Origem dos eventos     | `agilizone` e `gugs_delivery` registram as etapas finais                 | Se são os apps de entrega/logística de cada loja                  |
| Expedição              | Loja 54 espera ~6 min (até 39 min no sábado) entre embalado e despachado | Se é espera de entregador                                         |
| _Total pago_           | Em 70–81% dos pedidos, não é igual a _Valor pedido + entrega − desconto_ | A fórmula. Sem isso, não mostrar faturamento a partir desse campo |
| _Data ação_            | Sempre igual à _Data criação_; o 1º evento vem ~20 s depois              | Se o campo tem uso. O histórico já substitui                      |
| Prazo                  | Usado 60 min como exemplo                                                | O prazo real da operação, e se muda por canal                     |
| Frete R$ 0,01          | 22% do App Coco Bambu na loja 54                                         | Se é promoção ou erro de cadastro                                 |

## 7. Proposta de dashboard

Sempre calculado **pelo histórico** (`historico_status`), nunca pelo _Status
pedido_ atual (§5.3).

1. **Cards principais:**
   - tempo total p50 e p90, e % de atrasados
   - preparo p50 e p90
   - % de pedidos despachados sem entrega confirmada, e o valor
   - % de cancelamento, separado por cliente × loja, e R$ cancelado
2. **Tempo por etapa** (aceite, preparo, expedição, rota) em barras empilhadas,
   por loja — mostra onde cada loja perde tempo.
3. **Mapa de calor dia da semana × hora** com o preparo p50 e a quantidade de
   pedidos — mostra se o gargalo é pico (loja 08) ou equipe reduzida (loja 54).
4. **Evolução diária** do tempo total e do preparo, com marcação de datas
   especiais (Dia das Mães).
5. **Despachados sem entrega confirmada** por canal.
6. **Cancelamentos:** quem cancelou, em que etapa e quanto tempo depois do
   recebimento; destaque para cancelado depois de entregue.
7. **Qualidade da baixa:** baixas em lote, baixas no dia seguinte, embalado
   registrado depois da entrega.
8. **Custo por canal:** desconto, incentivo da loja e ticket médio.
9. **Comparação entre lojas**, com o mesmo indicador lado a lado.

**Peso da consulta:** com o histórico, um mês de uma loja grande pesa ~5 MB e
leva até ~40 s na API. Um painel de rede (várias lojas e meses) precisa de
processamento em segundo plano ou de dados pré-agregados, e não de uma busca na
hora por loja.

## 8. Próximos passos

- [ ] Repetir a análise com mais lojas e meses, para separar o que é padrão da
      rede do que é particular das lojas 08 e 54.
- [ ] Confirmar com o time do Maestro/DW e com a operação os pontos da §6.
- [ ] Definir o prazo de entrega da operação (substitui o limite de 60 min usado
      aqui).
- [ ] Definir o público do dashboard (gerente de loja, regional, diretoria).
- [ ] Decidir se o Reports Maestro passa a buscar com `incluir_historico=true`
      (hoje não busca; ver abaixo).

**Sobre o módulo:** o handler `src/server/pedidos.ts` **não** usa
`incluir_historico=true` hoje. Ligar o parâmetro sozinho não muda nada na tela:
o handler descarta os campos que não conhece, então o `historico_status` não
chegaria à tabela. E deixaria cada consulta mais pesada e mais lenta. Só vale
ligar junto com uma funcionalidade que use o histórico (por exemplo, a linha do
tempo do pedido ou as colunas de tempo por etapa).

## Apêndice — como reproduzir

Consulta usada:

```
GET /Delivery/?loc_ref=<loja>&start_date=<AAAA-MM-DD>&end_date=<AAAA-MM-DD>&incluir_historico=true
```

Regras de cálculo:

- **Tempo de cada etapa:** do **primeiro** evento de um status até o **primeiro**
  evento do status seguinte. Os eventos são ordenados por `data_horario_sp`.
- **Desfecho (§3):** pelo histórico.
  - tem `CANCELLED` → cancelado (ou "entregue e depois cancelado", se o
    `DELIVERED` veio antes);
  - tem `DELIVERED` → entregue;
  - senão, retirada sem baixa (retirada = SIM) ou despachado sem entrega
    confirmada.
- **Atraso (§4.2):** só pedidos entregues com rota de até 2h, para tirar as
  baixas tardias.
- **Baixa em lote:** 4 ou mais pedidos marcados como _Entregue_ no mesmo minuto.
