# PRD — Couvert

## Metadata

| Campo | Valor |
|---|---|
| **module_id** | `couvert` (provisório — ver §11, P1) |
| **Label visível** | "Couvert" (provisório) |
| **Categoria** | `operacional` · menu: grupo **Simphony** (`navGroup: 'simphony'`, provisório) |
| **Autor** | Iago Pereira |
| **Versão do PRD** | `0.1` |
| **Status** | `rascunho` — aguardando respostas do gestor (§11) |
| **Última atualização** | 2026-11-19 |
| **SDK version mínima** | `@gia-cb/sdk@0.1.0-alpha.71` (fixada) |

---

## 1. Problema / Contexto

### 1.1 Qual o problema?

No salão, o couvert e o buffet são lançados por pessoa. Mesa com 4 pessoas e 3
couverts é couvert que deixou de ser cobrado; mesa aberta com 0 pessoas impede a
conferência. O gerente precisa ver, **durante o turno**, quais mesas abertas
estão com o couvert ou o buffet diferente do número de pessoas, para corrigir
antes de fechar a conta.

### 1.2 Como é feito hoje?

Tela "Couvert" do GIA antigo (UniGUI/Delphi — `legacy-gia/dashboard-e-couvert`,
`view.simphony.simdash.couvert` + `model.simphony.simdash`):

1. Lista as lojas do usuário com integração `BIAPI` (`gia.empresas_integracoes`)
   e, por loja, as colunas `couv_progr`, `couv_buffet` e `couv_rvc` de
   `gia.empresas`.
2. O usuário escolhe a loja e o **RVC** (centro de receita/salão). Os RVCs vêm de
   `couv_rvc` no formato `Nome=Número,Nome2=Número2`; o primeiro é o padrão.
3. Ao abrir, pesquisa sozinha uma vez (timer `RunOnce`) com a 1ª loja e o 1º RVC.
4. Pesquisar chama a BI do Simphony:
   `POST https://mtu5-ohra.oracleindustry.com/bi/v1/GCB/getGuestChecks` com
   `{ locRef, busDt: <hoje>, searchCriteria: "where equals(guestChecks.clsdFlag,false) AND equals(guestChecks.rvcNum,<RVC>)" }`,
   token Bearer lido de `auth.token_bi` no banco do Simphony, timeout 180 s.
5. Monta um card por conta aberta (regras no §6) numa grade HTML.

### 1.3 Por que vale a pena resolver?

Migração da tela para o portal novo (desligamento do GIA antigo) e conferência
de receita de couvert/buffet no próprio turno.

## 2. Personas e cenários

- **Gerente / maître do salão** — abre a tela no celular ou no computador do
  caixa durante o turno, escolhe o salão (RVC) e confere as mesas.
- **Supervisão de operações** — consulta várias lojas.

Cenário principal: gerente abre a tela, vê as mesas abertas do salão, identifica
as amarelas/vermelhas e pede o ajuste no PDV.

Edge cases: loja sem RVC configurado; loja sem vínculo BIAPI; nenhuma mesa
aberta; BI fora do ar ou lenta (até 180 s no legado).

## 3. Requisitos funcionais (provisórios até §11)

- **RF-1** — Seletor de loja (Empresas do escopo com vínculo `BIAPI`).
- **RF-2** — Seletor de RVC da loja escolhida; o 1º é o padrão.
- **RF-3** — Pesquisar: contas abertas do dia de negócio no RVC, uma por mesa,
  com mesa/grupo, pessoas, couvert e buffet.
- **RF-4** — Destaque por situação (§6) e indicadores de totais (padrão 3 do
  workspace) que filtram as mesas.
- **RF-5** — Atualizar (nova pesquisa) sem sair da tela.

## 4. Telas e fluxos

Uma tela (`/couvert`): barra de filtros (loja, RVC, Pesquisar — padrões 1 e 8)
→ barra de indicadores → mesas abertas. Formato da lista (cards × tabela) em
aberto (§11, P4).

## 5. Requisitos técnicos

- **Fonte**: API externa (BI do Simphony), handler em `src/server/` — uma
  chamada por pesquisa (padrão 14), `AbortSignal.timeout` abaixo do limite da
  Edge Function.
- **Grava?** Não, na proposta atual. Se a configuração por loja (P3) ficar numa
  tabela do módulo, passa a gravar e entra a trava de teste (padrão 12).
- **Permissões**: `couvert.ler`.
- **Integração**: credencial da BI do Simphony pelo hub (`ctx.credencial`) — id
  em aberto (P2).
- **Loja → `locRef`**: `empresa.locRefs.BIAPI` de `ctx.empresas()` (o legado usa
  a integração `BIAPI` da Empresa).

## 6. Regras de negócio (do legado — confirmar com o gestor)

- Entram as contas com `guestCheckId > 0`, **não fechadas** (`clsdFlag = false`)
  e **não canceladas** (`cancelFlag = false`) do RVC escolhido.
- **Dia de negócio** = data de hoje. (O legado tem `getLatestBusDt`, mas na tela
  do Couvert ele não roda — ver P5.)
- **Mesa** = `tblName` / `tblNum` (exibido como `tblName/tblNum`).
- **Pessoas** = `gstCnt`.
- **Couvert** = soma de `dspQty` das linhas cujo `menuItem.miNum` está na lista
  de itens de couvert da loja (`couv_progr`).
- **Buffet** = soma de `dspQty` das linhas cujo `menuItem.miNum` está na lista de
  itens de buffet da loja (`couv_buffet`).
- Situação de cada contador (couvert e buffet, separados):
  - **verde** — igual ao número de pessoas;
  - **amarelo** — diferente do número de pessoas;
  - **vermelho** (os dois) — mesa com **0 pessoas**.

## 7. Critérios de aceite

A definir depois das respostas do §11.

## 8. Fora de escopo

- A tela "Dashboard" do mesmo pacote legado (`view.simphony.simdash.dashboard`)
  — fica para um módulo próprio.
- Qualquer alteração na conta do Simphony (o módulo só lê).

## 9. Métricas

Uso por loja/turno; tempo de resposta da BI.

## 10. Riscos e mitigações

| Risco | Mitigação |
|---|---|
| BI do Simphony lenta (legado espera até 180 s) | tempo limite + `MensagemErro` com Tentar de novo (padrões 11 e 14) |
| Configuração de itens/RVCs fora do cadastro do portal | depende de P3 |
| Token da BI fora do hub | depende de P2 |

## 11. Dependências

### Decisões pendentes — perguntar ao gestor

- **P1 — Nome, id e menu.** Proposta: "Couvert", id `couvert`, grupo Simphony.
  Alternativas: "Conferência de Couvert" / grupo Operacional.
- **P2 — Credencial da BI do Simphony.** Proposta: hub de credenciais do portal
  (`ctx.credencial('<id>')`). Qual o id da integração no hub? Ela já existe? (No
  legado o token vem da tabela `auth.token_bi` do banco do Simphony.)
- **P3 — Configuração por loja** (itens de couvert, itens de buffet e RVCs — no
  legado, `couv_progr`, `couv_buffet` e `couv_rvc` de `gia.empresas`). Opções:
  (a) o time GIA expõe esses campos no cadastro do portal; (b) tabela própria do
  módulo com tela de edição (o módulo passa a gravar → trava de teste); (c) ler do
  banco do legado até migrar.
- **P4 — Visual.** Proposta: cards por mesa (como hoje) + barra de indicadores
  (mesas abertas, pessoas, divergentes de couvert, divergentes de buffet, mesas
  sem pessoas) que filtra os cards. Alternativas: tabela (`DataReport`) com
  Exportar, ou os dois modos.
- **P5 — Dia de negócio.** Usar a data de hoje (como o legado faz na prática) ou
  o `getLatestBusDt` da BI (casa com turno que passa da meia-noite)?
- **P6 — Atualização.** Só pelo botão, ou atualizar sozinho a cada N minutos?
- **P7 — Regras.** Confirmar as cores do §6. Mesa com mais couvert que pessoas é
  amarelo igual à com menos? Loja sem buffet: esconder o contador de buffet?
- **P8 — Público.** Quem recebe `couvert.ler` (gerentes de loja, maîtres,
  supervisão)?

## 12. Insumo pra FAQ

O que significa cada cor; de onde vêm pessoas, couvert e buffet; por que uma
mesa não aparece (conta fechada ou cancelada, outro salão); o que fazer com mesa
vermelha.

## 13. Insumo pra Tour

Loja → salão → Pesquisar → indicadores → mesas.

## 14. Histórico

### 2026-11-19 — 0.1 rascunho

Levantamento do legado e perguntas para o gestor.
