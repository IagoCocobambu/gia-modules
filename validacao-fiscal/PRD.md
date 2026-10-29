# PRD — Validação Fiscal

## Metadata (obrigatório)

| Campo                  | Valor                                     |
| ---------------------- | ----------------------------------------- |
| **module_id**          | `validacao-fiscal`                        |
| **Label visível**      | Validação Fiscal                          |
| **Categoria**          | `fiscal`                                  |
| **Autor**              | Iago Pereira (iago.pereira@cocobambu.com) |
| **Versão do PRD**      | `1.2`                                     |
| **Status**             | `em-dev`                                  |
| **Última atualização** | 2026-10-29                                |
| **SDK version mínima** | `@gia-cb/sdk@0.1.0-alpha.66`              |

---

## 1. Problema / Contexto (obrigatório)

### 1.1 Qual o problema?

Toda conta fechada e paga no PDV (Simphony) precisa ter uma nota fiscal (NFC-e)
correspondente, com o mesmo valor. Conta sem nota é risco fiscal; nota sem conta,
nota duplicada ou nota com valor diferente distorcem o faturamento declarado.
Sem um cruzamento automático, essas falhas só aparecem no fechamento, quando já
há semanas de movimento afetado.

### 1.2 Como é feito hoje?

Pela **Validação Fiscal v2**: uma SPA React embutida numa tela UniGUI (Delphi)
que chama a `api-dw.cocobambu.com` direto do navegador (`/checks/` e
`/invoices/`), com um token fixo no código — vencido e com usuário/senha legíveis.

### 1.3 Por que vale a pena resolver?

A migração para o GIA tira o token do navegador (credencial no hub do portal),
passa a ler as contas direto do DW (`simphony_api_bi`), aplica o escopo de lojas
do usuário no servidor e corrige defeitos conhecidos do legado (fuso das datas
padrão, nome do Excel fora do snapshot, rolagem da paginação).

---

## 2. Personas e cenários (obrigatório)

### 2.1 Personas

| Persona                 | Permissões                                          | Frequência de uso | Conhecimento técnico |
| ----------------------- | --------------------------------------------------- | ----------------- | -------------------- |
| Analista fiscal         | `validacao-fiscal.ler`, `validacao-fiscal.exportar` | Diário            | Médio                |
| Gerente de loja         | `validacao-fiscal.ler`                              | Semanal           | Baixo                |
| Auditor / controladoria | `validacao-fiscal.ler`, `validacao-fiscal.exportar` | Mensal            | Médio                |

### 2.2 Cenários primários

- **C1**: Como analista fiscal, quero conciliar as contas e notas de uma loja
  no dia anterior para encontrar contas sem nota antes do fechamento.
- **C2**: Como analista fiscal, quero filtrar só os erros e abrir o detalhe de
  cada um para entender se é nota faltando, duplicada ou com valor errado.
- **C3**: Como auditor, quero exportar o resultado de um mês em Excel para
  somar as colunas e conferir com o faturamento.

### 2.3 Edge cases / Cenários secundários

- Usuário sem `validacao-fiscal.ler`: tela mostra acesso negado; handlers respondem 403.
- Loja fora do escopo do usuário (body adulterado): `ctx.requireEmpresa` → 403.
- Loja sem vínculo BIAPI: não aparece no seletor; handler responde 422.
- Loja sem vínculo BIAPI: handler de notas responde 422 com mensagem clara.
- Período com dia operacional não fechado: aviso de dado provisório.
- BI sem movimento da loja no período: aviso (pode ser vínculo BIAPI errado).
- API de notas fora do ar / integração não liberada: estado de erro com a mensagem do servidor (403/502/503) e "Tentar de novo".

---

## 3. Requisitos funcionais (obrigatório)

### RF-1: Seleção de loja

**Descrição**: o seletor lista só as Empresas do escopo do usuário com vínculo
`BIAPI` (loc_ref da BI do Simphony), em ordem alfabética, com busca.

**Critério de pronto**:

- [ ] Empresas sem `locRefs.BIAPI` não aparecem
- [ ] A primeira loja vem pré-selecionada

**Prioridade**: must-have

### RF-2: Filtro de período e janelas

**Descrição**: data inicial e final (padrão: ontem), janela antes (12 h) e
janela após (12 h), as janelas bloqueadas por cadeado com confirmação.

**Critério de pronto**:

- [ ] Datas futuras, inicial > final e intervalo > 31 dias são recusados com mensagem
- [ ] Janelas aceitam 0–24 h (máximo 24 h), só após desbloquear
- [ ] A consulta usa o snapshot do clique em Pesquisar

**Prioridade**: must-have

### RF-3: Leitura das contas (DW)

**Descrição**: handler `contas` lê `simphony_api_bi.guest_check` da loja por
`closed_bus_date`, sem contas canceladas, com horário em hora local como texto.

**Critério de pronto**:

- [ ] `requirePermission` + `requireEmpresa`
- [ ] `loc_ref` resolvido em `operations_daily_totals` (sem `lower()` na guest_check)
- [ ] Informa se o período tem dia não fechado

**Prioridade**: must-have

### RF-4: Leitura das notas (API)

**Descrição**: handler `notas` busca `/invoices/?loc_ref=<locRefs.BIAPI>` (o
mesmo `loc_ref` das contas do DW), de D−1 a D+1, com token do hub de Credenciais.
Devolve também o nome da loja que vem nas notas ("01. CB Goiania"), exibido na
coluna "Loja / Check" como no legado.

**Critério de pronto**:

- [ ] Deduplica as notas por chave de acesso
- [ ] Erros de credencial repassam a mensagem do portal

**Prioridade**: must-have

### RF-5: Conciliação e totais

**Descrição**: aplica as regras RN-1 a RN-8 e mostra os cards Total Sistema,
Total Fiscal, Diferença e Status (OK/Erros/Alertas clicáveis).

**Prioridade**: must-have

### RF-6: Tabela, filtro por status e detalhe

**Descrição**: tabela com filtro por coluna, ordenação, filtro por status (com contagem e R$
de cada opção) e modal de detalhes ao clicar na linha. **Colunas com os mesmos
nomes e conteúdos do legado**: Status · Loja / Check · Bus Date · Data Ref. ·
V. Conta · Nota Fiscal (XML) · Data Nota · V. Nota · Dif. · Ações. "Dif." é
Valor da Conta − Valor da Nota principal (como no legado).

**Prioridade**: must-have

### RF-7: Exportar Excel

**Descrição**: com `validacao-fiscal.exportar`, gera `.xlsx` das linhas
filtradas, uma linha por nota, colunas do legado, no **template de exportação do
GIA** (título na linha 1, subtítulo cinza na 2, cabeçalho `#DBE9FF` na 4,
congelado e com autofiltro). Valores em R$ (`"R$" #,##0.00`), datas como data.
Última linha **Total** com `SUBTOTAL(109)` de cada coluna monetária — soma só os
registros exportados (e só os visíveis se filtrar no Excel). Nome
`GIA - <módulo> - <loja> - <período do filtro>.xlsx`, ex.
`GIA - Validação Fiscal - 01.CB GOIANIA - 20.10.2026 a 26.10.2026.xlsx`.

**Prioridade**: must-have

---

## 4. Telas e fluxos (obrigatório)

### 4.1 Mapa de telas

| View            | Rota                | Permissão mínima       | Descrição em uma frase                           |
| --------------- | ------------------- | ---------------------- | ------------------------------------------------ |
| Validação       | `/validacao-fiscal` | `validacao-fiscal.ler` | Filtros, cards de totais e tabela de conciliação |
| Detalhe (modal) | overlay             | `validacao-fiscal.ler` | Conta, nota principal e duplicadas               |

### 4.2 Fluxos principais

**Fluxo C1 — Conciliar**:

1. Abre `/validacao-fiscal` → escolhe loja e período → Pesquisar.
2. Handlers `contas` e `notas` rodam em paralelo; a regra roda no navegador.
3. Cards e tabela aparecem.

**Fluxo C2 — Investigar erro**: clica em "Erros" no card → clica na linha → modal.

**Fluxo C3 — Exportar**: botão Exportar da tabela → `.xlsx` das linhas filtradas.

---

## 5. Requisitos técnicos

### 5.1 Schema de banco

Não se aplica — o módulo não grava nada. Lê o DW (somente leitura; o DW não tem
homologação: hom e prod leem o mesmo armazém).

### 5.2 Permissões (obrigatório)

| Key                         | Descrição                                 | Granularidade     |
| --------------------------- | ----------------------------------------- | ----------------- |
| `validacao-fiscal.ler`      | Consultar a validação das lojas do escopo | Leitura           |
| `validacao-fiscal.exportar` | Exportar o resultado em Excel             | Operação especial |

O módulo não tem escrita.

### 5.3 Integrações externas

| Integração                          | Propósito          | Camada                   | Credencial                                         |
| ----------------------------------- | ------------------ | ------------------------ | -------------------------------------------------- |
| DW (`simphony_api_bi`)              | Contas do Simphony | handler `contas` (`sql`) | `GIA_SERVER_DATABASE_URL` (já conectado no portal) |
| `api-dw.cocobambu.com` `/invoices/` | Notas fiscais      | handler `notas`          | hub de Credenciais, integração `apidw`             |

### 5.4 BFF / processamento em segundo plano

Nenhum. A consulta é de **uma loja** e no máximo 31 dias, com leitura indexada
(`loc_ref, closed_bus_date`) — responde em segundos, então é síncrona. O Excel é
gerado no navegador a partir do que já está na tela (por `import()` dinâmico do
`exceljs`).

### 5.5 Realtime

Não usa.

---

## 6. Regras de negócio (obrigatório)

- **RN-1**: Só entram contas com `Total_Pagamento > 0`, fechadas no período (por
  `closed_bus_date`, o dia operacional do fechamento) e não canceladas.
- **RN-2**: Conta e nota casam pelo `Check_Number` **da mesma loja**: contas (DW) e
  notas (`/invoices/?loc_ref=`) são lidas pelo mesmo `loc_ref` do Simphony — o
  equivalente ao `Check_Number + Loja` do legado. O nome da loja exibido é o que vem
  nas notas ("01. CB Goiania").
- **RN-3**: A nota precisa ter sido emitida entre `janelaAntes` horas antes e
  `janelaApos` horas depois do fechamento da conta (padrão 12 h / 12 h; 0–24 h — **máximo 24 h** em cada janela).
- **RN-4**: Com mais de uma nota na janela, a principal é a **mais recente cujo
  valor bate** (tolerância R$ 0,02); se nenhuma bate, a mais recente. As demais
  são duplicadas.
- **RN-5**: Status: nenhuma nota → `Conta sem XML`; principal com valor diferente
  (> R$ 0,02) → `Divergência R$` (prioridade sobre duplicidade); mais de uma nota
  → `Duplicidade`; senão `Conciliado`.
- **RN-6**: Nota não usada por nenhuma conta é `XML sem conta` só se emitida entre
  08:00 da data inicial e 08:00 do dia seguinte à data final (janela fiscal).
- **RN-7**: As notas são buscadas de D−1 a D+1 do período (candidatas ao
  cruzamento); fora da janela fiscal não viram `XML sem conta`.
- **RN-8**: Totais: Total Fiscal soma principal + duplicadas + notas sem conta;
  Diferença = Sistema − Fiscal, verde se |dif| < R$ 0,05. A "Diferença" de cada
  linha desconta as duplicadas, de modo que a soma das linhas = card Diferença.
- **RN-9**: O status Sefaz da nota é exibido mas **não** entra na validação (igual ao legado).
- **RN-10**: Horários de conta e nota são hora local da loja sem fuso, comparados como tal.

Histórico: o módulo não altera dados, então não há trilha de mutação.

---

## 7. Critérios de aceite (obrigatório)

- [ ] Analista executa C1, C2 e C3 do início ao fim
- [ ] Leitor sem `validacao-fiscal.exportar` não vê o botão Exportar
- [ ] Handler recusa (403) empresa fora do escopo
- [ ] Paridade com `/checks/` registrada em ao menos 3 lojas × 2 dias (infra-dw §7)
- [ ] Soma das colunas do Excel bate com os cards
- [ ] Mobile (375x667), tablet (768x1024), desktop (1280x720) funcionam; tabela vira cards
- [ ] Tema light/dark coerentes
- [ ] axe-core sem violation Critical/Serious
- [ ] FAQ cobre todas as funcionalidades e regras
- [ ] `gia validate` passa sem erros

---

## 8. Fora de escopo

- Considerar o status Sefaz (cancelada/rejeitada) na validação — mantido como no legado.
- Conciliação multi-loja numa só consulta.
- Gravar resultado/justificativa por divergência.

---

## 9. Métricas / Telemetria

| Métrica                      | Como medir                       | Onde olhar            |
| ---------------------------- | -------------------------------- | --------------------- |
| Consultas por dia            | invocações do handler `contas`   | Logs da Edge Function |
| Taxa de erro da API de notas | respostas 5xx do handler `notas` | Logs da Edge Function |

---

## 10. Riscos e mitigações

| Risco                                                            | Probabilidade | Impacto | Mitigação                              |
| ---------------------------------------------------------------- | ------------- | ------- | -------------------------------------- |
| Contas do DW diferentes da API legada                            | Médio         | Alto    | Paridade com `/checks/` antes de ligar |
| Uma nota casar com duas contas de mesmo número na janela de 24 h | Baixo         | Médio   | Herdado do legado; documentado na FAQ  |
| Dia ainda não fechado                                            | Alto          | Baixo   | Aviso na tela                          |

---

## 11. Dependências

### Outros módulos do GIA

- Cadastro de Empresas (`locRefs.BIAPI`).

### Serviços externos

- DW, schema `simphony_api_bi`.
- `api-dw.cocobambu.com` `/invoices/`.

### Decisões pendentes

- [x] `api-dw.cocobambu.com` no hub de Credenciais — já cadastrada com o id `apidw` (confirmado pelo time GIA na revisão da 0.1.0). Liberação do módulo na integração: time GIA, na instalação.

---

## 12. Insumo pra FAQ (obrigatório)

1. Como faço uma validação?
2. De onde vêm as contas e as notas?
3. O que significa cada status (Conciliado, Conta sem XML, XML sem conta, Duplicidade, Divergência R$)?
4. Como a nota é ligada à conta?
5. O que são as janelas antes/após e por que estão bloqueadas?
6. Por que uma nota emitida de madrugada não aparece como "XML sem conta"?
7. Qual nota é a "principal" quando há duplicidade?
8. Como os totais e a diferença são calculados?
9. Por que o período é limitado a 31 dias e não aceita datas futuras?
10. Como exporto para Excel e por que algumas células saem vazias?
11. Por que minha loja não aparece no seletor?
12. O que significa o aviso de "dia operacional não fechado"?
13. Uma nota cancelada na Sefaz aparece como conciliada — por quê?
14. Por que não vejo o botão Exportar?
15. A tela mostrou erro de credencial/integração. O que faço?

---

## 13. Insumo pra Tour (obrigatório)

| #   | Tela      | Target                                     | Mensagem                      |
| --- | --------- | ------------------------------------------ | ----------------------------- |
| 1   | Validação | `[data-tour="validacao-fiscal-filtros"]`   | Escolha loja e período        |
| 2   | Validação | `[data-tour="validacao-fiscal-janelas"]`   | Janelas de tempo (bloqueadas) |
| 3   | Validação | `[data-tour="validacao-fiscal-pesquisar"]` | Pesquisar                     |
| 4   | Validação | `[data-tour="validacao-fiscal-toolbar"]`   | Filtro de status e exportação |
| 5   | Validação | `[data-tour="validacao-fiscal-frame"]`     | Linhas clicáveis com detalhe  |

---

## 14. Histórico

### 2026-10-28 — v1.2 (responsivo)

- Layout de celular decidido pela **largura do container** (ResizeObserver, corte de
  768 px igual ao `DataReport`), não por media query — funciona no seletor de
  Viewport do dev-shell e em painel estreito.
- Celular: **acordeões** para Filtros (recolhe após Pesquisar), Janelas de tempo
  (fechado por padrão) e Resumo (totais em lista); card próprio por registro
  (`renderCard`); uma só rolagem (sem `fillHeight`). Desktop inalterado.

### 2026-10-28 — v1.1

- Notas passam a ser buscadas por `loc_ref` (o mesmo `locRefs.BIAPI` das contas), no
  lugar do `store_id` APP_CB — o `store_id` errado trazia notas de outra loja e o
  Total Fiscal não batia com o legado.
- Colunas da tabela, rótulos do filtro de status e do detalhe iguais ao legado
  (inclui "Loja / Check" e "Bus Date").
- Janelas antes/após limitadas a 24 h (padrão continua 12 h), num bloco com um
  cadeado único; seletor de lojas mostra o nome da Empresa; botões laterais de
  expandir/retrair largura do `WidthFrame` voltaram a aparecer.

### 2026-10-27 — v1.0 inicial

- Criado por Iago Pereira, a partir da Validação Fiscal v2 (UniGUI) e do doc de infra do DW.
