---
name: criacao-modulo
description: Cria um módulo novo do portal GIA (SDK @gia-cb) a partir do nome e de uma descrição — pergunta o que falta (fonte dos dados, se grava, ambiente de teste), fecha o conceito do módulo antes de programar (documento de conceito, inventário de componentes contra o SDK, 5 propostas em artefato para cada componente a decidir e questionamentos à equipe do SDK sobre o que ele não contempla), scaffolda com o gia create-module na versão do SDK do workspace, aplica os padrões dos AGENTS.md e, quando o módulo cria, altera ou exclui dados sem um ambiente de teste separado, a trava de teste <NOME_DO_MODULO>_EMPRESA_TESTE. Use quando o usuário chamar /criacao-modulo <nome do modulo> <descrição> ou pedir "cria um módulo novo", "começa o módulo X".
argument-hint: <nome do modulo> <descrição para criação>
---

# Criação de um módulo GIA

O comando traz: **$ARGUMENTS**.

- **1ª palavra = nome do módulo.** Pode vir como id (`conciliacao-pix`) ou como
  nome do menu entre aspas (`"Conciliação Pix"`). O **id** é kebab-case, sem
  acento, começando com letra (regra do `gia create-module`); o **nome** é o rótulo
  do menu, com acento. Tire um do outro e confirme na primeira pergunta.
- **O resto = descrição** do que o módulo faz. É o insumo do `PRD.md`.
- Sem nome ou sem descrição, pergunte antes de qualquer coisa.

Fale e pergunte sempre em **português**. O resultado é o módulo criado, rodando
no `gia dev`, com `gia validate` verde — e, **antes** de qualquer código de
negócio, o conceito do módulo fechado com o usuário (passo 4). **Não** empacota (isso é da
`/finalizacao-modulo`), **não** gera aviso de entrega e **não** faz commit.

## Princípio: as regras vêm das fontes

Como na `/finalizacao-modulo`, esta skill só traz **o roteiro** — inclusive a
pergunta do ambiente de teste. As regras vêm do que está escrito **agora**:

1. Docs do SDK instalado — `<modulo>/node_modules/@gia-cb/dev-shell/docs/*.md`
   (`getting-started`, `conventions`, `api-reference`, `dados-externos`,
   `prd-template`, `delivery-checklists`, `packaging`).
2. `AGENTS.md` da raiz do repositório (padrões do workspace) e o `AGENTS.md` que o
   scaffold cria no módulo. A regra "antes de criar um componente, procure no SDK"
   vale desde o primeiro arquivo. A trava de teste é o **padrão 12** dele.
3. Memória do projeto — decisões que se repetem entre módulos (ex.: busca por
   Empresa, restaurantes de `ctx.operacoes()`).

Regra de negócio **não está nas fontes**: o que a descrição não diz, pergunte.
Nunca invente cálculo, campo ou validação.

## Roteiro

### 1. Levantar

1. Na raiz do repositório dos módulos: `ls` — o id não pode existir ainda. Se
   existir, pare e pergunte (é outro módulo ou uma versão nova desse?).
2. Versão do SDK: veja o `@gia-cb/*` dos módulos mais recentes
   (`grep '"@gia-cb/' */package.json`). Use a **mesma versão, fixada** (sem `^`). Se
   os módulos divergirem, use a mais nova e diga qual.
3. Leia o `AGENTS.md` da raiz e o `MEMORY.md`. Se a descrição lembra um módulo que
   já existe (mesma fonte de dados, mesma tela), leia o `PRD.md`/`INTEGRATION.md`
   dele: é a implementação de referência e o lugar para reaproveitar.

### 2. Perguntar (AskUserQuestion, até 4 por vez, recomendada primeiro)

Só o que a descrição não responde. Na ordem:

1. **Nome e id** — confirme o rótulo do menu, o id e o lugar no menu (categoria e
   grupo, ex.: Plataformas › iFood).
2. **De onde vêm e para onde vão os dados** — Supabase do portal (migrations no
   módulo), banco externo (DW/Maestro, `GIA_SERVER_DATABASE_URL`, handler em
   `src/server/`) ou API externa (credencial do hub, `ctx.credencial`). Isso
   escolhe o template: `rich-api` para dado externo, `rich` para CRUD/relatório no
   portal, `basic` só se o usuário pedir.
3. **O módulo grava?** — só leitura, ou **cria, atualiza ou exclui** dado (inclui
   importar planilha e chamar API que muda algo do outro lado).
4. **Ambiente de teste** — só se grava. Pergunte:

   > "Vamos ter um ambiente de teste separado, com banco só de teste? Ou
   > homologação grava no mesmo banco da produção?"

   - **Não há ambiente separado** (ou o usuário não sabe; ex.: o DW, que
     homologação e produção dividem) → **trava de teste obrigatória**, com a
     variável `<NOME_DO_MODULO>_EMPRESA_TESTE` (seção abaixo). Opção recomendada.
   - **Há ambiente separado** (ex.: só o Supabase do portal, que tem homologação
     própria) → sem trava; anote no `INTEGRATION.md` qual é o banco de teste.

Depois, as perguntas de negócio que a descrição deixou abertas (filtros, colunas,
totais, permissões além de `.ler`/`.editar`, quem usa). Pode levar mais de uma
rodada; não comece o código de uma regra sem resposta.

### 3. Criar (só o esqueleto)

Na raiz do repositório:

```bash
npx @gia-cb/cli@<versão> create-module <id> --template <template> -y \
  --name "<Nome do menu>" --category <categoria> --author "<git user.name> <git user.email>" --icon <lucide>
cd <id> && npm install
```

- Fixe `@gia-cb/sdk`, `@gia-cb/ui`, `@gia-cb/dev-shell` e `@gia-cb/cli` na versão
  do passo 1 (sem `^`) e rode `npm install` de novo.
- Versão do módulo: **0.1.0**.
- `gia.config.ts`: as Empresas e operações de que o `gia dev` precisa. Se o módulo
  grava, inclua **sempre** a `999.CB TECH HOMOLOG` e as operações `999 cb` e
  `999 vst`, copiadas de um módulo que já as tem (`AGENTS.md` da raiz, padrão 5).
- `.env.example` com cada variável, comentada (o que é, dev × produção).

Neste passo entra **só o que o scaffold gera** e a configuração acima — nada de
tela, handler ou regra. O scaffold vem antes do conceito porque os documentos do
passo 4 moram em `<id>/docs/` e precisam do `node_modules` do SDK para o
inventário. Se o conceito mudar o template (ex.: descobriu-se uma API externa),
apague o esqueleto, crie de novo e devolva o `docs/` ao lugar.

### 4. Conceito e componentes — antes de programar

Nenhum código de negócio (tela, handler, regra, migration) antes de o usuário
aprovar este passo. Tudo fica em `<id>/docs/`, que vai no repositório.

#### 4.1 Documento de conceito — `docs/conceito.md`

Modelo: `references/conceito.md`. Escreva o que **entendeu** do módulo, com as
palavras do negócio: para que serve e para quem, o problema que resolve, o fluxo
de uso (passo a passo, inclusive no celular), os dados (de onde vêm, chave,
período, o que grava), as regras de cálculo **como o usuário disse**, permissões,
o que fica fora e as perguntas em aberto. Onde você supôs algo, marque
**(suposição)** — é o que o usuário precisa corrigir.

Mostre o documento e pergunte se está certo. Corrija até o usuário confirmar; as
respostas vão para o próprio documento (não só para a conversa).

#### 4.2 Inventário de componentes — antes de desenhar qualquer coisa

Liste **cada peça** que a tela precisa (barra de filtros, seletor de loja e
período, tabela, totais, abas, diálogo, gráfico, mensagem de erro, estado vazio,
exportar, PDF, carregamento…) e, para cada uma, procure **nesta ordem**:

1. **SDK** — o que o `@gia-cb/ui` e o `@gia-cb/sdk` exportam e o que as docs
   dizem:

   ```bash
   ls node_modules/@gia-cb/ui/dist | grep -v -E '^chunk|\.map$'
   grep -n "export" node_modules/@gia-cb/ui/dist/index.d.ts
   grep -n "export" node_modules/@gia-cb/sdk/dist/index.d.ts
   grep -n -i "<termo>" node_modules/@gia-cb/dev-shell/docs/*.md
   ```

   Abra o `.d.ts` do componente candidato (props, variantes) — o nome engana
   (ex.: `stat-card`, `operation-failure`, `empty-state`, `segmented-control`,
   `seletor-de-lojas`, `competencia`, `data-report`, `grid-tabs-bar`).
2. **Padrões do workspace** — o `AGENTS.md` da raiz já decide várias peças (barra
   de indicadores, `Dica`, `MensagemErro`, abas embaixo, filtros enxutos, PDF…).
   Se o padrão traz componente próprio, a fonte é o arquivo de referência dele
   (padrão 16) — e, se o SDK passou a ter um equivalente, o SDK ganha.
3. **Outros módulos** — algo parecido já feito (`ls */src/components/`), para
   citar como opção de reaproveitar.

Registre o resultado na seção **Componentes** do `conceito.md`, uma linha por
peça:

| Peça | Onde existe | Decisão | Artefato |
| --- | --- | --- | --- |
| Tabela do relatório | SDK — `DataReport` | usar do SDK, como entregue | — |
| Totais | Workspace — padrão 3 (`BarraIndicadores`) | cópia da referência | `totais-propostas.html` |
| Gráfico por hora | não existe | propor + questionar o SDK | `grafico-hora-propostas.html` + Q-01 |

- **Existe no SDK**: use o do SDK. Não há proposta de visual novo para ele — no
  máximo variações das **props e da composição** dele.
- **Padrão do workspace decide**: siga o padrão; artefato só se houver escolha de
  verdade dentro dele (ex.: quais 4 cards ficam à vista).
- **Não existe em lugar nenhum**: é lacuna do SDK → artefato com propostas
  (4.3) **e** questionamento à equipe do SDK (4.4). Pela regra geral do `AGENTS.md`,
  o componente só é criado no módulo com o ok do usuário.

#### 4.3 Artefatos: 5 propostas para cada componente a decidir

Para cada peça em que há escolha (lacuna do SDK, ou variação de uso que muda a
tela), gere **um** HTML com **5 propostas lado a lado**:
`docs/artefatos/<peca>-propostas.html` (ex.: `totais-propostas.html`). Modelo
visual já aprovado: `reports-maestro/docs/artefatos/*-propostas.html` e
`fechamento-ifood-mensal/docs/layouts-totais-online.html`.

- Cada proposta: letra e título curto (“A — Cards densos, 5 por linha”), uma frase
  do que é, o desenho com **dados realistas** do módulo (nomes de loja, valores em
  R$, datas no formato do portal), a altura aproximada que ocupa na tela e uma
  linha de **prós e contras**.
- Quando o SDK **tem** o componente, a proposta **A** é sempre ele **como o SDK
  entrega** (diga o nome e as props) e é a recomendada; as outras quatro são
  variações de props/composição dele. Proposta que reimplementa um componente do
  SDK não entra.
- Quando é lacuna, as 5 são caminhos diferentes de verdade (não 5 tons do mesmo
  desenho), e pelo menos uma resolve **compondo peças do SDK**, sem componente
  novo.
- Desenhe com as cores do tema do portal (tokens em
  `node_modules/@gia-cb/ui/dist/styles.css`), claro **e** escuro, e mostre também
  a largura de celular quando a peça muda nele. HTML único, sem build, sem CDN
  além do permitido pelo `artifact-design`.
- Entregue ao usuário: mostre o arquivo (`SendUserFile`, `display: 'render'`) ou,
  se ele quiser compartilhar com o gestor, publique como Artifact a partir do
  mesmo arquivo. Ao final, um quadro na página e no `conceito.md` com a sua
  **recomendação** e o porquê.
- A escolha do usuário volta para o `conceito.md` (coluna **Decisão**), com a
  data. O artefato fica no `docs/` como registro — não o apague.

Pergunte a escolha com `AskUserQuestion` (uma pergunta por peça, até 4 por vez,
recomendada primeiro; as opções são as letras das propostas).

#### 4.4 Questionamentos à equipe do SDK

Toda vez que um tema **não está contemplado no SDK** — componente que falta (4.2),
hook ou função do runtime, comportamento que a doc não cobre ou deixa ambíguo
(ex.: job agendado, upload, permissão por linha, PDF, limite da Edge Function),
ou conflito entre a doc do SDK e o padrão do workspace —, escreva um documento de
questionamento:

`docs/questionamentos-sdk/Q-<nn>-<tema>.md` — modelo em
`references/questionamento-sdk.md`.

- Antes, procure se já foi perguntado: `ls */docs/questionamentos-sdk/` e
  `grep -ril "<tema>" */docs/questionamentos-sdk/`. Se já existe, **cite** o
  documento do outro módulo (e a resposta, se houver) em vez de abrir outro.
- Cada documento tem: contexto (módulo, versão do SDK), o que se precisa, **onde
  procurou** (pacotes, arquivos `.d.ts`, docs, com a versão), por que nada serve,
  impacto no módulo, as propostas (pode apontar o artefato do 4.3), **perguntas
  numeradas e objetivas** que a equipe responde com sim/não ou uma escolha, e a
  **solução provisória** no módulo enquanto não há resposta (com o que custa
  trocar depois).
- Sem nome interno de sistema de terceiros, sem dado de loja, sem credencial.
- A skill **escreve**; quem envia é o usuário. Diga a ele quais documentos foram
  criados. O índice fica no `conceito.md` (seção **Questionamentos ao SDK**,
  com situação: aberto / respondido / resolvido pelo SDK x.y.z).
- Questionamento aberto **não bloqueia** o módulo se houver solução provisória
  aceita pelo usuário; bloqueia se a peça não tem como ser feita sem o SDK — diga
  isso.

#### 4.5 Aprovação

Feche com um resumo curto: conceito confirmado, tabela de componentes com a
decisão de cada um, artefatos gerados, questionamentos abertos. Peça o **ok para
começar a implementar**. Só depois dele, o passo 5.

### 5. Implementar

Implemente o que o `docs/conceito.md` aprovou — as peças e as propostas
escolhidas no passo 4. Peça nova que aparecer no caminho volta ao passo 4.2 antes
de ser criada. Siga as fontes do passo "Princípio" e os padrões do `AGENTS.md` da raiz que se
aplicam — os de tela (filtros, dica, barra de indicadores, abas, mensagem de
erro…) e, desde o primeiro arquivo, os de gravação, servidor e projeto (trava,
transação e SQL externo, erro técnico só no log, SDK fixada, componente copiado
igual à referência) —, comparando com as implementações de referência que ele
aponta. Preencha
`PRD.md`, `INTEGRATION.md`, `README.md`, `CHANGELOG.md` (entrada 0.1.0), `faq.ts`
e `tour.ts` com o conteúdo real. O `PRD.md` parte do `conceito.md` (não copie:
resuma e aponte para ele) e lista os questionamentos ao SDK em aberto nos riscos.

Se o passo 2 decidiu pela trava, implemente-a **junto com o primeiro handler que
grava**, não no fim.

### 6. Validar

1. `npm run format` e `npm run validate` até **0 erros** (avisos: corrija ou
   explique).
2. `gia dev`: a tela abre, consulta e, no celular, funciona. Teste de gravação
   **só na 999** (padrão 5); com o `.env` apontando para um banco de verdade,
   confirme com o usuário antes de qualquer chamada que grava.
3. Com trava: Salvar em outra Empresa tem de voltar 403 com a mensagem de
   ambiente de teste e não tocar no banco.

### 7. Fechar

1. Grave na memória do projeto as decisões de negócio do módulo (uma memória por
   módulo, como as que já existem) e a decisão sobre o ambiente de teste.
2. Responda curto: id, nome e lugar no menu, versão do SDK, template, fonte dos
   dados, se grava e como fica o teste (trava com o nome da variável, ou banco de
   teste separado), as peças decididas no conceito (SDK × workspace × nova), os
   questionamentos ao SDK em aberto, o que o `gia validate` deu, o que ficou para perguntar e o
   próximo passo (`/finalizacao-modulo <id>` para empacotar).

## Trava de teste — `<NOME_DO_MODULO>_EMPRESA_TESTE`

A regra completa (quando vale, nome, comportamento, onde, tela, documentos) é o
**padrão 12 do `AGENTS.md` da raiz** — leia de lá, não desta skill. Combinada com o
usuário em 17/11/2026, a partir da devolutiva do Fechamento iFood Mensal 0.1.1.

Em resumo, para não esquecer na hora de criar:

- nome: id do módulo em maiúsculas, `-` → `_`, mais `_EMPRESA_TESTE`
  (`conciliacao-pix` → `CONCILIACAO_PIX_EMPRESA_TESTE`);
- em **todo** handler que cria, atualiza ou exclui, antes de qualquer acesso ao
  banco; `envOptional`, fora do `config.secrets`;
- implemente junto com o **primeiro** handler que grava, não no fim.

Código pronto para copiar: `references/trava-teste.md`.
