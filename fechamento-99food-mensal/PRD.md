# PRD — Fechamento 99Food Mensal

## Metadata (obrigatório)

| Campo                  | Valor                                     |
| ---------------------- | ----------------------------------------- |
| **module_id**          | `fechamento-99food-mensal`                |
| **Label visível**      | Fechamento 99Food Mensal                  |
| **Categoria**          | `vendas`                                  |
| **Autor**              | Iago Pereira (iago.pereira@cocobambu.com) |
| **Versão do PRD**      | `1.0`                                     |
| **Status**             | `em-dev`                                  |
| **Última atualização** | 2026-11-17                                |
| **SDK version mínima** | `@gia-cb/sdk@0.1.0-alpha.71`              |

---

## 1. Problema / Contexto (obrigatório)

### 1.1 Qual o problema?

O financeiro fecha o mês da 99Food loja a loja, como faz com o iFood: conferir o que a
99Food registrou (vendas, cancelamentos, comissões, taxas, promoções, ajustes) contra
o que a loja lançou no caixa (o **borderô**), montar o DRE do mês, conferir o repasse
com o extrato bancário e registrar os cancelados pós-entrega. Hoje não há tela para
isso: a conferência da 99 é manual, pelo relatório do painel da 99Food.

### 1.2 Como é feito hoje?

Não existe tela da 99 no GIA legado. O caixa lança a 99 no borderô em **campos
livres** (`bordero.fields`), com o nome que cada loja escolheu (`99food_online`,
`99_food`, `99_online`, `desconto_99`, `99food_adquirentes`…) — o borderô não tem
colunas próprias da 99 como tem para o iFood (`din_ifood_online`,
`din_desconto_ifood`, `ent_ifood_adquirentes`). Levantamento de 17/11/2026: 52 lojas
lançaram campos da 99 em novembro de 2026, com mais de 50 nomes diferentes.

### 1.3 Por que vale a pena resolver?

- Mesmo fechamento do iFood para a 99, na mesma tela que o financeiro já usa
  (decisão do usuário em 17/11/2026: módulo **idêntico** ao Fechamento iFood Mensal).
- O acesso à 99Food é server-side (Edge Function), com a credencial no hub.
- Os campos da 99 no borderô, hoje espalhados em nomes livres, passam a ser lidos e
  classificados; o que não se encaixa fica visível na tela.

---

## 2. Personas e cenários (obrigatório)

### 2.1 Personas

| Persona                       | Permissões         | Frequência de uso | Conhecimento técnico |
| ----------------------------- | ------------------ | ----------------- | -------------------- |
| Analista do financeiro        | `.ler` + `.editar` | Mensal (por loja) | Médio                |
| Gerente / coordenador de loja | `.ler`             | Mensal            | Baixo                |
| Auditoria / controladoria     | `.ler`             | Eventual          | Médio                |

### 2.2 Cenários primários

- **C1**: Como analista do financeiro, quero consultar o mês de uma loja e ver as
  diferenças 99Food × caixa dia a dia (Online e Adquirentes) pra saber o que conferir.
- **C2**: Como analista, quero preencher previsões, CB Desc. LOJA, comentários, o
  breakdown da Conferência, o extrato e os cancelados pós e salvar pra fechar o mês.
- **C3**: Como gerente de loja, quero consultar o fechamento das minhas lojas sem
  poder alterar nada.
- **C4**: Como analista, quero ver quais campos da 99 no borderô ficaram fora da
  conferência, pra corrigir o lançamento da loja.

### 2.3 Edge cases / Cenários secundários

- **Sem `.editar`**: campos como texto; sem Nova linha, lápis, lixeira nem Salvar; o
  handler `salvar` responde 403.
- **Loja fora do escopo**: todos os handlers respondem 403 (`requireEmpresa`).
- **Loja sem 99Food** (nenhuma operação com vínculo 99FOOD no cadastro): aparece
  "Sem 99Food" e Consultar é recusado.
- **Mês com mais de 3 meses**: a 99Food recusa (errno 110004) → 422 com a mensagem.
- **Loja sem autorização da Financial API** (403 da 99): fica de fora com aviso; as
  outras lojas da 99 da Empresa seguem.
- **Credencial recusada** (401 ou errno 10101/10102/14105/14106): 424, sem nova
  tentativa.
- **Schema `fechamento_99food` ainda não criado**: a consulta mostra a 99 e o borderô
  (sem nada gravado); Salvar e Histórico respondem 503 "o banco do Maestro ainda não
  está preparado".
- **Campo da 99 no borderô fora das regras**: fica fora do CB e aparece no quadro
  "campos da 99 no borderô ficaram fora da conferência".
- **Troca de loja/mês ou fechar a aba com alteração pendente**: pede confirmação.

---

## 3. Requisitos funcionais (obrigatório)

### RF-1: Consultar o mês de uma loja

**Descrição**: escolher a loja (Empresa) e o mês e buscar os lançamentos da 99Food
do mês, os campos da 99 no borderô e o que já foi gravado.

**Critério de pronto**:

- [ ] O seletor lista as Empresas do escopo, com as operações na 99Food embaixo do
      nome; o fechamento junta **todas as lojas da 99 da Empresa** (vínculos 99FOOD
      das operações), com a coluna **Operação**.
- [ ] O padrão é o mês anterior; o seletor não passa do mês atual.
- [ ] O mês inteiro numa consulta (a API aceita até 31 dias), em páginas de 200, com
      faixa de progresso e Cancelar (padrão 9).
- [ ] As abas abrem quando o borderô chega e os lançamentos entram aos poucos; Salvar
      só libera no fim.

**Prioridade**: must-have

### RF-2: Conferência diária Online e Adquirentes

**Descrição**: uma linha por dia com SD (99Food), CB (borderô) e # (diferença), e os
campos digitáveis do dia — as mesmas colunas e contas do Fechamento iFood Mensal.

**Critério de pronto**:

- [ ] Colunas e contas da §6 (RN-4 a RN-7), iguais às do iFood Mensal.
- [ ] Quantidade e valor na mesma coluna, com o selo `3×` (padrão 6).
- [ ] CB vindo de `bordero.fields` pela regra da RN-3.

**Prioridade**: must-have

### RF-3: Conferência (DRE), Extrato, Recebimento e Cancelados pós

**Descrição**: DRE do mês por categoria, extrato bancário e cancelados pós com
inclusão/edição/remoção, recebimento por data de repasse × extrato.

**Critério de pronto**:

- [ ] Categorias da RN-8; check da comissão média da 99.
- [ ] Extrato e Cancelados com formulário validado e remoção com confirmação.

**Prioridade**: must-have

### RF-4: Barra de totais por aba

**Descrição**: totais em cards acima da tabela (padrão 3), com dica no mouse e filtro
por clique, iguais aos do iFood Mensal.

**Prioridade**: should-have

### RF-5: Salvar o fechamento

**Descrição**: gravar de uma vez o que é digitado no mês da loja (padrão 13).

**Critério de pronto**:

- [ ] Uma transação só; cabeçalho com `FOR UPDATE`; apagar um valor e salvar limpa.
- [ ] Extrato e cancelados regravados por inteiro, com exclusão lógica.
- [ ] Autor e data nas colunas + `logAudit` + linha em `fechamento_99food.historico`.
- [ ] Aviso de alteração não salva (ponto no botão, contador Alterados, confirmação).
- [ ] **Trava de teste**: com `FECHAMENTO_99FOOD_MENSAL_EMPRESA_TESTE` definida
      (homologação), o `salvar` recusa com 403 qualquer outra Empresa antes de tocar
      no banco; valor que não é id recusa toda gravação (503). Sem a variável
      (produção), nada muda.

**Prioridade**: must-have

### RF-6: Campos da 99 fora da conferência

**Descrição**: quadro recolhível acima da tabela com cada campo da 99 no borderô que
não entrou no CB (nome, grupo, motivo, valor do mês e dias).

**Prioridade**: must-have (decisão de 17/11/2026)

### RF-7: Celular, tela estreita e histórico

Iguais ao Fechamento iFood Mensal (padrões 1, 2, 7, 8, 10 e 11; botão Histórico).

**Prioridade**: should-have

---

## 4. Telas e fluxos (obrigatório)

Uma tela, `/fechamento-99food-mensal`, com a mesma estrutura do Fechamento iFood
Mensal: barra de filtros (loja, mês, Consultar, Histórico, Salvar) → faixa de
progresso → avisos (lojas da 99 de fora; campos do borderô fora da conferência) →
barra de totais → tabela → barra de abas embaixo (Lançamentos, Online, Adquirentes,
Conferência, Extrato, Recebimento, Cancelados pós).

---

## 5. Requisitos técnicos

| Fonte                                        | Acesso           | Uso                                       |
| -------------------------------------------- | ---------------- | ----------------------------------------- |
| Financial API da 99 (`getShopBillDetail`)    | leitura          | lançamentos do mês (handler `bill`)       |
| `bordero.borderos` + `bordero.fields`        | leitura          | CB Online, CB Desc. 99, Caixa adquirentes |
| `fechamento_99food.*` (Maestro, schema novo) | leitura/gravação | o que é digitado + histórico              |
| `ctx.empresas()` / `ctx.operacoes()`         | leitura          | lojas e vínculos 99FOOD (`app_shop_id`)   |

- Handlers: `lojas`, `bill`, `manual`, `salvar`, `historico` (auto-contidos).
- Credencial `99food` no hub (token do `POST /v3/auth/authtoken/signIn`, 6 h).
- SQL do schema em `sql-maestro/001_schema.sql` (vai no pacote; **ainda não rodado**).
- Os ids da 99 têm 19 dígitos: lidos como texto (o `JSON.parse` os arredondaria).

---

## 6. Regras de negócio (obrigatório)

> ⚠️ **Provisórias, a validar pelo financeiro** (decisão de 17/11/2026). Não há tela
> antiga da 99 para copiar: as contas espelham as do Fechamento iFood Mensal sobre os
> lançamentos que o `bill` monta. Nada é entregue antes da validação (§11).

- **RN-1 — Lançamentos**: cada linha do `getShopBillDetail` (valores em centavos) vira
  lançamentos no formato do iFood:
  - **Entrada Financeira** = `mealOriginalAmount + shopDeliveryAmount +
shopActivityOutcome + freeDeliveryOutcome` (o que o cliente pagou);
  - **Promoção custeada pela 99** = `shopActivitySubsidy + freeDeliverySubsidy`;
  - **Promoção custeada pela loja** = `shopActivityOutcome + shopActivitySubsidy +
freeDeliveryOutcome + freeDeliverySubsidy` (informativo, impacto NÃO);
  - **Comissão da 99** (`commissionAmount`, base `commissionBaseAmount`, % =
    `commissionRate`/100), **Subsídio de comissão da 99**, **Taxa de pagamento**
    (`payCommissionAmount`), **Entrega da 99** (`b2pDeliveryAmount`), **Gorjeta
    antecipada**, **Complemento de pedido mínimo**;
  - **Ajustes do repasse** = `settlementAmount` − a soma dos anteriores com impacto;
  - `orderType` 5 → **Lançamento avulso** = `settlementAmount`, data "Ocorrências".
  - A soma dos lançamentos com impacto = `settlementAmount` (conferido nos exemplos).
- **RN-2 — Fato, status, data**: `orderType` 1 Venda, 2 Cancelamento Total, 3
  Cancelamento Parcial, 4 Estorno pós-venda, 5 Ocorrência Avulsa. Status ONLINE VR se
  `mealVoucherAmount ≠ 0`, senão ONLINE (OFFLINE quando houver a tabela dos códigos).
  Data = `businessDateTime`; antes das 6h, o dia anterior. Repasse = `expectSettleDate`.
- **RN-3 — CB do borderô** (`bordero.fields`, grupos `din`/`ent`, "99" isolado no
  nome, borderô vigente: original ou a última alteração). Nome normalizado
  (minúsculas, não-alfanumérico → `_`), regras nesta ordem:
  1. `cancel|canc|estorno` → fora (cancelado);
  2. `off` → fora (offline);
  3. `adquirente` → **Caixa adquirentes**;
  4. começa com `desc` (ou `_desc`) → **CB Desc. 99**;
  5. `online` → **CB Online**;
  6. `99`, `99food`, `99_food`, `99_foods` → fora (sem sufixo, pendente);
  7. o resto → fora (não reconhecido, pendente).
- **RN-4 a RN-7 — Online, # Total, Adquirentes**: as do Fechamento iFood Mensal
  (`src/regras.ts`), com "Promoção custeada pela 99" no lugar da do iFood. Promo rede
  fica zero (a 99 não tem).
- **RN-8 — Conferência**: Recebido (Entrada Financeira + Promoção 99), Incentivos da
  loja (promoção da loja, impacto NÃO, com o espelho em Recebido), Taxas (comissão,
  subsídio de comissão, taxa de pagamento, entrega da 99), Outros (gorjeta, pedido
  mínimo, ajustes, avulso); Valor a depositar = soma; check: média da comissão.
- **RN-9 — Recebimento**: como no iFood, pela data de repasse prevista.
- **RN-10 — Chave da loja**: o número da loja (nome da Empresa ou BIAPI) é o `loc_ref`
  do fechamento e o `property_number` do borderô.
- **RN-11 — Gravação e histórico**: iguais ao Fechamento iFood Mensal (RN-13/14 de lá),
  no schema `fechamento_99food`.

---

## 7. Critérios de aceite (obrigatório)

- [ ] Um mês fechado à mão pelo financeiro (2 ou 3 lojas) bate com a tela.
- [ ] Os campos da 99 de cada loja caem no grupo certo ou no quadro de fora.
- [ ] Salvar só na 999 em homologação (403 nas outras, sem tocar no banco).
- [ ] Salvar e Histórico com o schema ausente: 503 com a mensagem clara.
- [ ] No celular, a barra de filtros recolhe ao consultar e a seta a reabre.
- [ ] Os totais abrem/fecham pela regra das 5 linhas; o mesmo no Chrome e no Safari.

---

## 8. Fora de escopo

- Repasse semanal da 99 (`getShopBillWeek`) — o Recebimento usa a data prevista de
  cada lançamento, como no iFood.
- Fechamento diário da 99 (módulo à parte).
- Editar o borderô ou padronizar os nomes dos campos (fica com o dono do borderô).

---

## 9. Métricas / Telemetria

- `logAudit` `fechamento-99food-mensal.fechamento.salvo` (com o número de alterações).

---

## 10. Riscos e mitigações

| Risco                                                       | Mitigação                                                    |
| ----------------------------------------------------------- | ------------------------------------------------------------ |
| Contas provisórias divergirem do que o financeiro espera    | Validação com mês fechado à mão antes de entregar (§7, §11)  |
| Nome livre no borderô cair no grupo errado ou ficar de fora | Quadro de campos fora da conferência; padronizar nomes (§11) |
| Teste em homologação gravar no banco real (Maestro é um só) | Trava `FECHAMENTO_99FOOD_MENSAL_EMPRESA_TESTE` (padrão 12)   |
| Financial API sem autorização / sem cota documentada        | Aviso por loja (403); fila adaptativa herdada do iFood       |
| `app_shop_id` não cadastrado nas operações                  | "Sem 99Food" no seletor; pendência com o time GIA            |

---

## 11. Dependências

### Outros módulos do GIA

- Fechamento iFood Mensal (referência de código e regras).

### Serviços externos

- Financial API da 99Food (autorização especial, pedida por e-mail à 99).
- Banco do Maestro (`bordero.*` e o schema novo `fechamento_99food`).

### Decisões pendentes

1. **Campos duvidosos fora por enquanto**: `99pay`, `f.o_delivery_99`, `f.o_99food`,
   `f.o.99food`, `vale_99food`, `vales_99food`, `99_ifood`, `99-`, `despesa_99food`.
2. **Nomes sem sufixo** (`99food`, `99_food`, `99_foods`, `99`): online ou offline?
   Fora até a decisão — são o nome principal em ~20 lojas (o CB Online delas sai zero).
3. **`desconto_99food_off`**: desconto offline? Fora.
4. **Padronizar os nomes** no borderô ou criar colunas da 99 (com o dono do borderô).
5. **Financial API**: liberação pela 99, `app_id`/`app_secret` no hub, tabela dos
   códigos `paymentMethod`/`paymentChannel`/`paymentMethodDetail` (OFFLINE), fuso do
   `businessDateTime` e limite de chamadas.
6. **Regras do lado 99 (RN-1, RN-2, RN-8)** validadas pelo financeiro com um mês
   fechado à mão, inclusive o percentual esperado da comissão.
7. **`locRef` do vínculo 99FOOD = `app_shop_id`?** Confirmar com o time GIA e
   cadastrar nas operações (o `gia.config.ts` usa vínculos fictícios).
8. **Rodar o `sql-maestro/001_schema.sql`** no Maestro (decisão de 17/11/2026: depois),
   na ordem do INTEGRATION.md §7.

---

## 12. Insumo pra FAQ (obrigatório)

- Como consultar; limite de 3 meses da 99Food.
- O que é cada lançamento montado da linha da 99 e o TOTAL.
- De onde vem o CB e o quadro de campos fora da conferência.
- Por que não há OFFLINE ainda.
- Cards de cada aba (padrão 3), Salvar, Histórico, trava de teste.

---

## 13. Insumo pra Tour (obrigatório)

Loja e mês → Consultar → abas embaixo → campos do borderô fora da conferência →
conferindo e preenchendo → Histórico → Salvar.

---

## 14. Histórico

### 2026-11-17 — v1.0 inicial (módulo 0.1.0)

- Criado com `/criacao-modulo` como espelho do Fechamento iFood Mensal 0.1.2.
- CB do borderô por `bordero.fields` com regra por regex; campos fora da conferência
  num quadro; contas do lado 99 provisórias.
