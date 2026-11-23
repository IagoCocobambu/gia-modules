# Couvert — conceito

> Módulo `couvert` · SDK `0.1.0-alpha.72` · template `rich-api`
> Situação: **confirmado e implementado — 0.1.0** (19/11/2026)
> Marque com **(suposição)** tudo que não veio do usuário.

Base: a tela **Couvert** de `legacy-gia/dashboard-e-couvert`
(`view.simphony.simdash.couvert` + `model.simphony.simdash` + `uCardHTML`), lida em
19/11/2026, e o **desenho da tela trazido pelo usuário** em 19/11/2026
(`docs/artefatos/mesas-referencia-usuario.png`). A tela **Dashboard** do mesmo pacote
fica fora (já é o módulo `dashboard-simphony`).

## 1. Para que serve

O couvert aqui é o **couvert artístico** (a programação artística da casa), cobrado
por pessoa. O módulo mostra, **durante o turno**, as mesas abertas de um salão e onde
o couvert lançado no Simphony está diferente do número de pessoas, para o gerente
corrigir no PDV **antes de fechar a conta**. Mesa com 4 pessoas e 2 couverts são 2
couverts que deixaram de ser cobrados; mesa aberta com 0 pessoas não deixa conferir.

O **buffet não entra** (decidido em 19/11/2026): no legado a tela também contava o
buffet; o módulo confere só o couvert artístico.

## 2. Quem usa

| Perfil                                    | Para quê                                | Onde                                  |
| ----------------------------------------- | --------------------------------------- | ------------------------------------- |
| Gerente / maître do salão **(suposição)** | conferir as mesas do seu salão no turno | celular, tablet e computador do caixa |
| Supervisão de operações **(suposição)**   | olhar várias lojas                      | computador                            |

## 3. Fluxo de uso

1. Abre o módulo em **Simphony › Couvert**. A tela vem com a **loja 01** e o 1º RVC dela
   já escolhidos (decidido em 23/11/2026), mas **não pesquisa sozinha**. Quem não tem a
   01 no escopo vê a **última loja e o último RVC** que consultou (19/11/2026; §9, Q-02);
   se essa loja saiu do escopo, vem sem loja.
2. Escolhe a **loja** (só as que têm vínculo com a BI do Simphony) e o **RVC** (o
   salão). O 1º RVC da loja vem escolhido.
3. Pesquisa: clica no botão **Atualizar** (↻). Trocar a loja ou o RVC já pesquisa
   **(suposição — trocar é um clique do usuário)**.
4. Vê as mesas abertas, uma por card, e os **chips** com quantas estão em cada
   situação (Todas, Divergentes, Sem lançamento, Tudo lançado). Clica num chip para
   ver só aquelas mesas.
5. Procura uma mesa pelo número, ou ordena por **Mesa** (número) ou **Atenção**
   (as que precisam de ajuste primeiro).
6. Pede o ajuste no PDV e clica em **Atualizar** para conferir de novo. Ao lado do
   botão, “atualizado há N min”.
7. Pode pôr a tela em **tela cheia** (no tablet do caixa, por exemplo).

No celular: a barra quebra em duas linhas (loja/RVC em cima, ações embaixo) e recolhe
ao pesquisar (padrão 1); os chips rolam na horizontal; os cards ficam em 2 colunas.

## 4. Dados

Fontes do legado (19/11/2026): banco do GIA (lojas e configuração), banco do Simphony
(token da BI, `auth.token_bi`) e API da BI do Simphony (`getGuestChecks`). No módulo:

| Dado                                 | Fonte                                                                                                                                                                                                                            | Chave e período                         | Lê ou grava |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ----------- |
| Lojas com a BI do Simphony           | portal — `ctx.empresas()`, `locRefs.BIAPI` (igual ao `dashboard-simphony`)                                                                                                                                                       | Empresa                                 | lê          |
| Contas abertas                       | API de BI do Simphony — `getGuestChecks`, credencial do hub `simphony-bi` (a mesma do `dashboard-simphony`; o token não vem mais do banco do Simphony)                                                                           | `locRef` da loja + dia de negócio + RVC | lê          |
| Itens de couvert e RVCs de cada loja | banco do GIA (`GIA_SERVER_DATABASE_URL`), campos `couv_progr` e `couv_rvc` de `gia.empresas`, como no legado. **Até chegarem as credenciais do banco, dados mockados** (19/11/2026). O portal não tem esses campos: ver §9, Q-01 | Empresa                                 | lê          |

- **Grava?** Não. Só leitura — decidido com o usuário em 19/11/2026. Sem trava de
  teste. Se a configuração por loja virar uma tela de edição no módulo, isso muda
  (volta à pergunta do ambiente de teste).

## 5. Regras de negócio

| #   | Regra                                                                                                                                                                              | Exemplo                                                                                | Origem                                                                                                                  |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| R1  | Entram as contas **abertas** (não fechadas) e **não canceladas** do RVC escolhido, com id de conta válido.                                                                         | Conta fechada às 21h não aparece.                                                      | legado (`SimphonyGetChecks`)                                                                                            |
| R2  | Dia de negócio = **hoje** (data de São Paulo), como no legado.                                                                                                                     | Às 00h40, hoje vira o dia seguinte e as mesas do turno que passou da meia-noite somem. | usuário, 19/11/2026                                                                                                     |
| R3  | Mesa = **nome da mesa / número do grupo**, com o nome em destaque.                                                                                                                 | `45/2`                                                                                 | legado + desenho do usuário                                                                                             |
| R4  | **Pessoas** = número de convidados da conta.                                                                                                                                       | 3                                                                                      | legado                                                                                                                  |
| R5  | **Couvert** = soma das quantidades dos itens da conta que estão na lista de itens de couvert artístico da loja.                                                                    | 2 linhas de couvert com qtd 2 → 4                                                      | legado                                                                                                                  |
| R6  | **Tudo lançado**: couvert = pessoas (e pessoas > 0). Card neutro.                                                                                                                  | 2 pessoas, 2 couverts                                                                  | desenho do usuário                                                                                                      |
| R7  | **Sem lançamento**: couvert = 0 e pessoas > 0. Card amarelo.                                                                                                                       | 1 pessoa, 0 couvert                                                                    | desenho do usuário                                                                                                      |
| R8  | **Divergente**: couvert > 0 e diferente de pessoas. Card vermelho, com o selo da diferença (couvert − pessoas).                                                                    | 4 pessoas, 2 couverts → **−2**; 3 pessoas, 4 couverts → **+1**                         | desenho do usuário                                                                                                      |
| R9  | Mesa com **0 pessoas**: com **couvert ou buffet lançado** é **Divergente** (vermelha); **sem lançamento** é **Sem pessoas** (cinza, chip próprio). Nas duas, o selo “sem pessoas”. | 0 pessoas e 2 couverts → Divergente; 0 pessoas e nada lançado → Sem pessoas            | usuário, 23/11/2026 (em 19/11 era sempre Divergente); o chip próprio foi a recomendação, o usuário não teve preferência |
| R10 | A lista só muda pelo botão **Atualizar** (ou trocando loja/RVC); nada de atualização automática. Mostra há quanto tempo foi a última atualização, sem “Ao vivo”.                   | “atualizado há 1 min”                                                                  | usuário, 19/11/2026                                                                                                     |
| R11 | Os chips contam as mesas de cada situação na pesquisa inteira; o clique filtra os cards (não muda as contagens). **Todas** tira o filtro.                                          | Todas 21 · Divergentes 3 · Sem lançamento 6 · Tudo lançado 12                          | desenho do usuário                                                                                                      |
| R12 | Ordem **Mesa**: pelo nome da mesa, número crescente. Ordem **Atenção**: Divergentes, depois Sem lançamento, depois Tudo lançado; dentro de cada grupo, pela mesa **(suposição)**.  | —                                                                                      | desenho do usuário + suposição                                                                                          |
| R13 | A busca “Mesa” filtra os cards pelo nome da mesa (contém o texto digitado).                                                                                                        | “3” mostra 3, 31, 303…                                                                 | suposição                                                                                                               |

## 6. Permissões

| Chave         | O que libera                                          |
| ------------- | ----------------------------------------------------- |
| `couvert.ler` | abrir a tela e consultar as mesas das lojas do escopo |

Menu: grupo **Simphony** (`navGroup: 'simphony'`, de fábrica no portal) › **Couvert**
— confirmado pelo usuário em 19/11/2026. Permissões no mesmo lugar:
`groupPath: ['Simphony', 'Couvert']`.

Sem Exportar: a tela é de cards. Público de `couvert.ler`: o usuário decide depois.

## 7. Fora do escopo

- A tela Dashboard do mesmo pacote legado (já é o `dashboard-simphony`).
- **Buffet** (decidido em 19/11/2026).
- Qualquer alteração na conta do Simphony.
- Editar a configuração de couvert/RVCs da loja (enquanto não houver decisão em
  contrário).

## 8. Componentes

Inventário contra `@gia-cb/ui` / `@gia-cb/sdk` `0.1.0-alpha.71` e o `AGENTS.md` da
raiz, em 19/11/2026, já com o desenho do usuário.

| Peça                                                                      | Onde existe                                                                                                              | Decisão                                                                                                                                                                                                                                                          | Artefato                       |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| Barra do alto (título, loja, RVC, “atualizado há”, Atualizar, tela cheia) | SDK — `SearchableSelect`, `Button`; workspace — padrões 1 e 8                                                            | uma linha, como no desenho (padrão 8 desde o início); no celular recolhe ao pesquisar (padrão 1)                                                                                                                                                                 | `mesas-referencia-usuario.png` |
| Tela cheia                                                                | SDK — `TelaCheia`                                                                                                        | usar do SDK                                                                                                                                                                                                                                                      | —                              |
| Chips de situação com contagem                                            | SDK — `Button` (variante + `aria-pressed`) com ícones `lucide-react` (`TriangleAlert`, círculo tracejado, `CircleCheck`) | composição no módulo, **no lugar da barra de indicadores do padrão 3** (exceção pedida pelo usuário: o desenho dele)                                                                                                                                             | `mesas-referencia-usuario.png` |
| Busca por mesa                                                            | SDK — `IconInput` (ícone `Search`)                                                                                       | usar do SDK                                                                                                                                                                                                                                                      | —                              |
| Ordem Mesa / Atenção                                                      | SDK — `SegmentedControl`                                                                                                 | usar do SDK                                                                                                                                                                                                                                                      | —                              |
| Ajuda (i)                                                                 | SDK — `FaqButton`                                                                                                        | usar do SDK                                                                                                                                                                                                                                                      | —                              |
| Card da mesa                                                              | **não existe** no SDK                                                                                                    | componente `CartaoMesa` no módulo, **no desenho do usuário** (aprovado em 19/11/2026): quadrinho à esquerda com o couvert e o ícone de nota musical, nome da mesa grande com “/grupo”, pessoas com ícone `Users`, cor pela situação e selo da diferença no canto | `mesas-referencia-usuario.png` |
| Lembrar a última loja e RVC                                               | SDK — `createPersistedStore` (`@gia-cb/sdk/state`); `localStorage` direto é reprovado pelo `gia validate`                | usar o do SDK, por usuário; ver Q-02                                                                                                                                                                                                                             | —                              |
| Dica no mouse (botões só com ícone)                                       | workspace — padrão 2 (`Dica`)                                                                                            | cópia da referência                                                                                                                                                                                                                                              | —                              |
| Mensagem de erro                                                          | workspace — padrão 11 (`MensagemErro`); SDK tem `OperationFailure`                                                       | cópia da referência                                                                                                                                                                                                                                              | —                              |
| Estado vazio (“Escolha a loja”, “Nenhuma mesa aberta”)                    | SDK — `EmptyState`                                                                                                       | usar do SDK                                                                                                                                                                                                                                                      | —                              |
| Tour                                                                      | SDK — `TourGuide`                                                                                                        | usar do SDK                                                                                                                                                                                                                                                      | —                              |

Escolhas:

- **Tela das mesas — desenho do usuário, 19/11/2026.** Duas rodadas de propostas
  (`mesas-propostas.html`, recusada: o usuário queria algo ilustrativo;
  `mesas-ilustradas-propostas.html`, escolhida a D com violão no couvert) foram
  substituídas pelo desenho que o usuário trouxe (`mesas-referencia-usuario.png`).
  Ficam no `docs/` como registro.
- **Chips no lugar da barra de indicadores (padrão 3).** O desenho do usuário põe as
  contagens em chips que filtram; o padrão 3 não se aplica a esta tela. A explicação
  de cada chip vai na FAQ.

## 9. Questionamentos ao SDK

| Nº   | Tema                                                                                                      | Situação                                                          | Solução provisória                                                 |
| ---- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------ |
| Q-01 | Configuração do módulo por loja (itens de couvert e RVCs)                                                 | aberto — `docs/questionamentos-sdk/Q-01-configuracao-por-loja.md` | ler do banco do GIA (`gia.empresas`); mock até as credenciais      |
| Q-02 | Lembrar a última loja/RVC do usuário entre acessos (`createPersistedStore` diz "só theme persiste no v1") | aberto — `docs/questionamentos-sdk/Q-02-lembrar-ultima-loja.md`   | `createPersistedStore` com chave por usuário, só ids de loja e RVC |

## 10. Perguntas em aberto

- [x] Configuração por loja: banco do GIA, mock até as credenciais (19/11/2026).
- [x] Dia de negócio: hoje (19/11/2026).
- [x] Atualização: só pelo botão, sem “Ao vivo” (19/11/2026).
- [x] Buffet: sai do módulo (19/11/2026).
- [x] Mesa com 0 pessoas: vermelha com couvert ou buffet lançado, neutra (chip Sem pessoas) sem lançamento (23/11/2026).
- [x] Nome: “Couvert” no menu e no título da tela (19/11/2026).
- [x] Ao abrir: espera o clique; vem com a loja 01 (23/11/2026; em 19/11 era a última loja consultada, que ficou só para quem não tem a 01 no escopo).
- [x] Tela das mesas: desenho do usuário (19/11/2026).
- [ ] Trocar loja/RVC já pesquisa? (R10, suposição)
- [ ] Ordem “Atenção” e busca por mesa (R12, R13, suposição).
- [ ] Dá para tirar o banco do GIA? Só se os itens de couvert forem achados pela BI do Simphony (grupo com o mesmo nome em todas as lojas, ou o mesmo número de item) e os RVCs vierem da BI (`getRevenueCenterDimensions`, a confirmar). O vínculo `BIAPI` do cadastro só traz o código da loja na BI. O usuário vai confirmar como o couvert está cadastrado (19/11/2026); até lá, banco do GIA.
- [ ] Credenciais do banco do GIA (`GIA_SERVER_DATABASE_URL`) — o usuário vai receber.
- [ ] Quem recebe `couvert.ler` — o usuário decide depois.

## 11. Atualização de 19/11/2026 — orientação do time do Portal GIA

O documento do time do Portal GIA (`acesso-bi-e-couvert`, 19/11/2026) e as respostas
do usuário mudaram estas decisões; elas valem sobre o que está acima:

- **SDK `0.1.0-alpha.72`**: `empresa.couvert` traz `programacao` (itens de couvert
  artístico), `buffet` e `rvcs` do cadastro de Empresas. **Sem banco do GIA** — saem
  `GIA_SERVER_DATABASE_URL` e os dados de demonstração. **Q-01 resolvido.**
- **Dia de negócio**: `getLatestBusDt` da BI (não mais a data de hoje). R2 muda.
- **Buffet volta**: na loja com itens de buffet, o card ganha o quadrinho do buffet à
  direita (ícone tampa de travessa, `ConciergeBell`), com as mesmas regras; a mesa fica com a pior situação entre
  couvert e buffet (**R14, suposição**). Loja sem buffet: só couvert.
- **Exportar em Excel** (`couvert.exportar`): as mesas da tela, com chip e busca; o
  `gia validate` exige a 2ª permissão.
- **Ícone do couvert**: nota musical (`Music`), como no desenho do usuário.
- **Ajuda (i)**: o `FaqButton` é montado pelo portal em toda tela; a tela não repete.
- **Tempo limite**: 120 s por chamada à BI. A orientação do time era 60 s, mas o
  `getGuestChecks` levou 89 s, 77 s e 8,5 s seguidos às 17h (19/11/2026) e a tela
  dava 504 — combinar com o time o tempo da Edge Function.
- **Testado no `gia dev` contra a BI real** (Campinas, `14 CB Ca`, RVC 101): 10 mesas
  em ~2 s; 403 sem permissão e fora do escopo; 422 com RVC fora da configuração.
- **Em aberto com o time do Portal GIA**: regra de cor, estorno (`dspQty` negativo
  ainda não visto), atualização automática (hoje não há), público das permissões.
- **Barra enxuta no padrão 8** (pedido do usuário, 19/11/2026: "seguir o padrão do
  GIA"): título e tour à esquerda; loja, RVC, botão primário e tela cheia juntos à
  direita. O botão é **Pesquisar** e vira **Atualizar** quando loja e RVC são os das
  mesas na tela. Trocar loja/RVC **não pesquisa mais sozinho** (R3 do fluxo e R10
  mudam). O "atualizado há N min" foi para a linha dos chips.
- **Buffet sempre à vista** (pedido do usuário, 23/11/2026, "como no legado"): o
  quadrinho do buffet aparece em toda loja, também na Exportação. Na loja sem itens de
  buffet configurados ele fica em 0 e amarelo, mas não entra na situação da mesa nem
  nos chips (R14). O ícone está em escolha (`docs/artefatos/icone-buffet-propostas.html`).
- **Ícone do buffet: opção A, tampa de travessa (`ConciergeBell`)** — escolhida pelo
  usuário em 23/11/2026 entre as 6 de `docs/artefatos/icone-buffet-propostas.html`;
  é a mais parecida com o ícone do legado.
- **Detalhe da mesa — escolhida a combinação B+A (23/11/2026)**: tocar no card abre o
  `Modal` do SDK (size `xl`) em duas colunas, como a proposta B (à esquerda contadores,
  fatos e valores), com a lista única de itens da proposta A à direita (qtd, item,
  assento, rodada, hora, valor; couvert e buffet em destaque — o couvert em ciano pouco saturado, que só identifica o item; pedido do usuário em 23/11/2026, antes era vermelho fixo) e o aviso do que falta
  acima dela. Propostas em `docs/artefatos/detalhe-mesa-propostas.html` (a recomendação
  era a A). Em aberto: permissão própria para valores e garçom (ex.: `couvert.ver-conta`).
- **Detalhe da mesa implementado (23/11/2026)**: `DetalheMesa` (`Modal` xl, B+A). O
  handler `mesas` passou a devolver a conta de cada mesa; o handler novo `nomes` traz
  os nomes dos itens (`getMenuItemDimensions`) e do garçom (`getEmployeeDimensions`,
  como "Nome S.") só ao abrir o detalhe. Valores e garçom com `couvert.ler` até a
  decisão da permissão própria.
- **Loja de demonstração no `gia dev`** (pedido do usuário, 23/11/2026): "999.LOJA
  DEMONSTRAÇÃO (gia dev)", vínculo BIAPI `DEMO`, com `GIA_DEV_COUVERT_DEMO=1` — mesas,
  contas e nomes fictícios, sem chamar a BI; tem buffet configurado.
- **Demonstração cobre todos os casos (23/11/2026)**: 18 mesas (cada situação de couvert
  e buffet, mesa sem pessoas, estorno, pré-conta impressa, desconto e pagamento parcial,
  conta sem itens, item sem assento ou sem nome, falha nos nomes, sem garçom, nome longo),
  RVCs que simulam nenhuma mesa, 504, 424 e 502, e lojas sem buffet, sem RVC e sem itens
  de couvert. As horas acompanham o relógio. Conferido na tela (1440 e 390 px): no
  celular o card tem blocos mais estreitos e o detalhe segue a ordem contadores, aviso,
  fatos, itens e valores.
