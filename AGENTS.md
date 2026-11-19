# Módulos GIA — padrões do workspace (instruções pra IA)

> Vale para **todos** os módulos desta pasta (`fechamento-maestro`,
> `reports-maestro`, `validacao-fiscal`, ...). Cada módulo tem também o seu
> `AGENTS.md`, com o contrato do SDK `@gia-cb` — leia os dois. Em caso de
> conflito, o `AGENTS.md` do módulo e as docs do SDK
> (`node_modules/@gia-cb/dev-shell/docs/`) mandam; este arquivo só **acrescenta**
> padrões de UX combinados para os módulos daqui.

## Regra geral: antes de criar um componente, procure no SDK

Antes de criar **qualquer** componente, hook ou utilitário no módulo, confira se
o SDK já entrega um pronto. Quando não existir, **pergunte ao usuário antes de
criar** — não invente o componente por conta própria.

- **Onde procurar**: `@gia-cb/ui` (componentes visuais — `Button`, `Modal`,
  `ListHeader`, `DataReport`, `GridTabsBar`, `Tooltip`, `cn`...), `@gia-cb/sdk`
  (hooks e lógica do runtime) e as docs em `node_modules/@gia-cb/dev-shell/docs/`
  (`conventions.md`, `api-reference.md`). Para ver o que o `@gia-cb/ui` exporta:

  ```bash
  ls node_modules/@gia-cb/ui/dist
  grep -n "export" node_modules/@gia-cb/ui/dist/index.d.ts
  ```

- **Existe no SDK**: use o do SDK, com as props dele, sem recriar nem imitar o
  visual. Se falta algo, ajuste pelas props ou componha por fora — não copie o
  componente para dentro do módulo.
- **Não existe no SDK**: **pare e pergunte ao usuário** antes de criar. Diga o
  que procurou e onde (pacotes e docs), por que nada serve, e proponha o
  componente (o que faz, onde fica, como fica na tela). Se já existe algo
  parecido em outro módulo do workspace, cite como opção de reaproveitar. Só
  crie no módulo (`src/components/`, `src/hooks/`) depois do **ok** do usuário,
  seguindo os padrões deste arquivo e os tokens do tema.
- **Componente com escolha de visual**: antes de criar, mostre ao usuário **5
  propostas** num HTML em `<modulo>/docs/artefatos/<peca>-propostas.html`
  (cada uma com dados realistas, altura na tela e prós e contras; claro e escuro).
  Se o SDK tem a peça, a proposta **A** é ela como o SDK entrega e as outras só
  variam props e composição — reimplementar componente do SDK não é proposta. A
  escolha fica registrada no `docs/conceito.md` do módulo.
- **Tema que o SDK não contempla** (componente, hook, função do runtime,
  comportamento que a doc não cobre ou deixa ambíguo, conflito entre a doc do SDK
  e este arquivo): além de perguntar ao usuário, escreva um **questionamento à
  equipe do SDK** em `<modulo>/docs/questionamentos-sdk/Q-<nn>-<tema>.md` — o que
  se precisa, onde procurou (pacotes, `.d.ts`, docs, com a versão), impacto,
  propostas, perguntas objetivas e a solução provisória no módulo até a resposta.
  Antes, veja se outro módulo já perguntou (`ls */docs/questionamentos-sdk/`) e
  cite em vez de repetir. Quem escreve é a IA; quem envia é o usuário. Sem dado de
  loja, credencial ou nome interno de terceiros. Os questionamentos em aberto
  entram nos riscos do `PRD.md`. Modelo:
  `.claude/skills/criacao-modulo/references/questionamento-sdk.md`.
- Os padrões abaixo que já trazem componente próprio (`Dica`, `MensagemErro`,
  `BarraIndicadores`...) continuam valendo: foram criados porque o SDK não tinha.
  Se o SDK passar a ter um equivalente, prefira o do SDK.
  Copiar um desses componentes de outro módulo segue o **padrão 16**.

## Padrões de tela

### 1. Celular: a pesquisa recolhe a barra de filtros

Em tela com barra de pesquisa (loja, período e o botão **Pesquisar**), quando o
usuário pesquisa **no celular**, a barra de filtros **se recolhe** e a tela fica
para o resultado. A seta (chevron) do cabeçalho reabre a barra para uma nova
pesquisa.

- Recolhe **só quando a pesquisa começa de fato**. Pesquisa recusada (loja não
  escolhida, período inválido, nada mudou) deixa a barra **aberta**, para o
  usuário corrigir.
- **Só no celular** (onde o `ListHeader` mostra o chevron). Em `sm+` os filtros
  continuam sempre visíveis.
- Use o `ListHeader` do `@gia-cb/ui` para a barra (ele já recolhe e anima). Como
  ele não expõe o estado aberto/fechado, depois de disparar a pesquisa acione o
  botão de recolher dele, só se estiver visível:

  ```tsx
  const raiz = useRef<HTMLDivElement>(null)
  const pesquisarERecolher = () => {
    if (!onPesquisar()) return // onPesquisar devolve false quando recusou
    const recolher = raiz.current?.querySelector<HTMLButtonElement>(
      'button[aria-expanded="true"][aria-label="Recolher filtros"]'
    )
    if (recolher && recolher.offsetParent !== null) recolher.click()
  }
  // <div ref={raiz} className="contents"><ListHeader ...>...</ListHeader></div>
  ```

- Explique na FAQ (seção do celular) que os filtros recolhem ao pesquisar e que
  a seta os reabre, e cubra isso nos critérios de aceite do `PRD.md`.

Referência: `fechamento-maestro/src/components/FiltrosBar.tsx`.

### 2. Tooltip só em aparelho com mouse

Em tela de toque (celular, tablet) o módulo **não renderiza tooltip**. Lá ele
não abre pelo dedo e ainda atrapalha: depois de um toque, o navegador emula um
"mouse" no ponto tocado, e o tooltip do elemento que fica ali (por exemplo, num
diálogo que acabou de abrir) **abre sozinho, fica por cima do vizinho e bloqueia
o toque**.

- Continue usando o `<Tooltip>` do `@gia-cb/ui` (nunca `title=` nativo), mas
  **sempre por um wrapper** que só o renderiza com `(hover: hover)`:

  ```tsx
  import { useState, type ReactElement, type ReactNode } from 'react'
  import { Tooltip } from '@gia-cb/ui'

  function useComHover(): boolean {
    const [comHover] = useState(
      () => typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches
    )
    return comHover
  }

  export function Dica({ content, children }: { content: ReactNode; children: ReactElement }) {
    return useComHover() ? (
      <Tooltip content={content} asChild>
        {children}
      </Tooltip>
    ) : (
      children
    )
  }
  ```

  O `asChild` é obrigatório: o filho do `Dica` é sempre um elemento interativo
  (botão). Sem ele, o Radix envolve o filho num `<button>` extra quando o tooltip
  arma — botão dentro de botão (HTML inválido).

  Não exporte o hook do mesmo arquivo do componente: o ESLint do host
  (`react-refresh/only-export-components`) reprova no `gia validate`.
- Como no toque não há tooltip, **nada importante pode depender dele**: em tela
  de toque o botão mostra o **rótulo visível** (não só o ícone; use
  `[@media(hover:none)]:inline` no texto), e a explicação de cada número ou regra
  fica também na **FAQ**.
- O mesmo vale para destaque ao passar o mouse (`onMouseEnter`/`onPointerEnter`):
  ligue só com `(hover: hover)` e `pointerType === 'mouse'`; no toque, use
  `onClick`. Senão o "mouse" emulado liga e desliga o destaque sozinho.

Referência: `fechamento-maestro/src/components/Dica.tsx` e, para o destaque só
com mouse, `fechamento-maestro/src/components/PainelCanais.tsx`.

### 3. Cards de totais: barra de indicadores, dica no mouse, clique filtra

Os totais de uma tela de relatório ficam numa **barra de indicadores**, não em
cards grandes soltos:

- **Visual**: um só contêiner (`@container rounded-xl border border-border
  bg-surface p-1.5 shadow-sm`) com uma grade responsiva
  (`grid-cols-1 @sm:grid-cols-2 @2xl:grid-cols-3 @5xl:grid-cols-5`). Cada
  indicador é uma linha compacta: **quadradinho 8×8 com o ícone** (lucide),
  tingido pelo **tom** do indicador, e ao lado o **valor** (`text-base
  font-semibold tabular-nums`, na cor do tom) em cima do **rótulo** curto em
  minúsculas (`text-xs text-muted-foreground`). Tons só por token:
  `neutro | success | info | primary | warning | destructive`. Use cor para dar
  sentido (ex.: o que deveria ser zero fica `warning`/`destructive` quando não é).
- **Dica explicativa**: cada indicador tem a explicação da conta numa dica, que
  aparece **só com mouse** — sempre pelo `Dica` do padrão 2. **No celular não há
  tooltip**: a explicação de cada indicador tem que estar também na **FAQ**.
- **Clique filtra a tabela**: cada indicador que é um recorte das linhas é um
  `<button aria-pressed>`; o clique mostra na tabela **só as linhas que somam
  nele** e marca o indicador (`bg-primary/10 ring-1 ring-inset ring-primary/40`).
  Clicar de novo tira o filtro. Na barra da tabela aparece um botão com o **nome
  do filtro** e um `X` para tirá-lo. Pesquisar de novo também tira o filtro.
  Indicador **zerado** não filtra (`aria-disabled`); indicador que soma tudo
  (ex.: valor total) só informa.
- Os valores da barra são da **pesquisa inteira** — não mudam com o filtro do
  card (senão o clique zeraria os outros cards). O filtro vale para o
  **Exportar**, e o subtítulo da planilha diz qual estava ligado.
- **Recorte que muda os totais é filtro do módulo, fora da grade.** Quando o
  usuário precisa dos totais de uma parte (ex.: só um canal), use um seletor
  próprio na seção de totais (ex.: o anel de **canais**), que recorta totais, tabela e
  Exportar juntos, e mostre na barra o aviso “Totais só de iFood · X de Y
  pedidos”. Os filtros de coluna do `DataReport` **não** chegam aos totais: a
  grade não expõe as linhas filtradas (só pelo `summaryRow`, proibido abaixo).
  Referência: `fechamento-maestro` (`PainelCanais.tsx`, 0.4.0: anel com a fatia
  de cada canal, sem legenda — dica no mouse e clique na fatia escolhe —, à
  esquerda dos indicadores, na mesma
  seção — o lugar do antigo Dashboard).
- Um botão **Totais** na barra da tabela abre e fecha a barra (com `Recolhivel`).
  Fora do celular ela abre e fecha sozinha pela regra das **5 linhas** (padrão 10);
  no celular começa fechada, para sobrar espaço para a lista.

- **Total nunca dentro da tabela**: nada de linha de totais no cabeçalho ou no
  rodapé da grade (`summaryRow` do `DataReport`). Toda coluna que somaria vira
  um **card** na barra de indicadores — se a tabela tinha o total, a barra tem o
  card.
- **Muitos indicadores (mais de ~5): os principais à vista, o resto num botão.**
  Ficam sempre à vista os **4 mais relevantes** — em geral as diferenças/
  divergências que precisam ser conferidas e o total geral —, e o 5º lugar da
  grade é um botão **“Ver todos os totais (+N)”** (`aria-expanded`, chevron que
  gira) que abre os demais **logo abaixo**, separados por uma linha, com a mesma
  animação do `Recolhivel` (grid-rows `0fr ↔ 1fr` + fade); aberto, vira
  “Ocultar os demais totais”. Fechada, a barra ocupa uma linha só — é o que
  sobra de altura para a tabela em monitor pequeno. Se um card **escondido** está
  filtrando a tabela, a parte de baixo **abre sozinha** e o botão fica desativado
  até o filtro sair (o card marcado nunca some). Barra com até 5 cards cabe numa
  linha: não leva o botão. A FAQ diz quais cards ficam
  à vista e explica também os escondidos.

Referência: `fechamento-ifood-diario/src/components/ResumoCards.tsx`,
`pagamento-echeck/src/components/ResumoCards.tsx` e, para os principais + “Ver
todos”, `fechamento-ifood-mensal/src/components/BarraIndicadores.tsx` (prop
`principais`, usada em `AbaOnline.tsx` e `AbaAdquirentes.tsx`).

## Padrões de conteúdo

### 4. FAQ e tour sem menção ao sistema antigo

A FAQ e o tour são o treinamento de quem usa o módulo **no portal novo**. Eles
explicam a tela e as regras **como são**, sem comparar com o GIA antigo.

- **Não cite** o sistema anterior: nada de "tela antiga", "GIA antigo", "legado",
  "portal antigo", "como era antes", UniGUI ou Delphi — nem no `summary`, nas
  `sections`, no `qa` ou no `body` dos passos do tour.
- A regra se explica sozinha. Em vez de "fica Cancelado — é a regra da tela
  antiga", escreva só "fica Cancelado" e diga **por quê** ou **como ver** os casos.
- Fonte de negócio que o usuário conhece pode ser citada (ex.: "a planilha do
  financeiro"), porque não é o sistema antigo.
- A comparação com o legado vale **só para quem desenvolve e instala**: fica no
  `PRD.md`, no `INTEGRATION.md`, no `CHANGELOG.md` e nos comentários do código.
- Antes de empacotar, confira:

  ```bash
  grep -n -i -E "legado|antig|UniGUI|Delphi" src/faq.ts src/tour.ts
  ```

  Não pode sobrar nenhuma ocorrência sobre o sistema anterior.

Referência: `fechamento-ifood-diario/src/faq.ts` e `src/tour.ts`.

## Padrões de teste

### 5. Escrita, edição e exclusão só na loja e nas operações 999

Teste que **grava, altera ou exclui** dado (Salvar, Nova linha, editar, remover,
importar, chamada direta a um handler que muta) é feito **somente na Empresa
`999.CB TECH HOMOLOG` e nas operações `999`** (`999 cb`, `999 vst`) — a loja de
teste da tecnologia. Nunca numa loja real, nem em homologação: o banco de
homologação pode ser o mesmo que o sistema antigo usa, e o que se grava ali aparece
para quem trabalha com a loja.

- **Leitura** (consultar, filtrar, exportar) pode ser em qualquer loja.
- Antes de testar escrita, confira no seletor que a loja escolhida é a **999**. Ao
  rodar um handler na mão (`curl`, script), mande `operacaoRef`/`empresaId` da 999.
- Operações com o mesmo número **dividem os dados** quando o módulo grava pelo número
  da loja (ex.: `999 cb` e `999 vst` no Fechamento iFood Mensal) — o teste numa
  afeta a outra, e tudo bem, porque as duas são de teste.
- Todo módulo que grava dados traz a 999 no `gia.config.ts` (Empresa
  `999.CB TECH HOMOLOG` + operações `999 cb` e `999 vst`, com `operacao_ref` igual
  ao do cadastro), para o teste no `gia dev` usar a mesma chave da homologação.
- Mude o `.env` para um banco de verdade (`GIA_SERVER_DATABASE_URL`) só para testar
  escrita na 999, e **nunca** com o banco de produção.
- Quando homologação grava no mesmo banco da produção, a regra vira **trava no
  servidor**: ver o padrão 12.

Referência: `fechamento-ifood-mensal/gia.config.ts` (Empresa 999) e
`dashboard-contas/gia.config.ts`.

## Padrões de tabela

### 6. Quantidade e valor na mesma coluna: selo `3×` antes do R$

Quando a tabela mostra, para o mesmo item, a **quantidade** e o **valor**
(ex.: quantos descontos e quanto somaram), use **uma coluna só**, não um par
`Qtd` / `R$` com cabeçalho de grupo. A quantidade vai num **selo antes do
valor**: **`3×` R$ 30,00** = 3 lançamentos somando R$ 30,00.

- Selo: pílula pequena (`rounded-full bg-muted px-1.5 text-[11px] font-semibold
  text-muted-foreground`, `min-w` para os números não pularem), com o “×” — é ele
  que diz que o número é uma **contagem**. Nada de “R$ 30,00 · 3”: o número solto
  depois do valor não diz o que é e foi reprovado na validação com o usuário.
- **Quantidade zero: sem selo** — a célula mostra só o valor.
- O selo entra por **CSS** (`before:content-[attr(data-qtd)]`, com `data-qtd="3×"`
  na célula), **fora do texto** da célula: a calculadora do `DataReport` lê o
  número que a célula mostra, e o selo no texto viraria parte do valor. Declare
  `meta: { calculadora: 'moeda' }` na coluna.
- O ganho: a linha de grupos do cabeçalho some (uma linha a menos de altura) e
  cada par vira uma coluna (a grade fica bem mais estreita — os números que
  importam aparecem sem rolar para o lado em monitor estreito).
- Explique o selo na FAQ (“**3×** R$ 30,00 = 3 lançamentos somando R$ 30,00;
  sem lançamento, não há selo”).

Referência: `fechamento-ifood-mensal/src/components/AbaOnline.tsx` e
`AbaAdquirentes.tsx` (helper `comQtd`).

### 7. Telas com abas: barra de abas embaixo da tabela, no padrão do SDK

Tela de relatório com várias abas (uma tabela por aba) põe as abas **embaixo da
tabela**, na barra inferior do portal — o **`GridTabsBar`** do `@gia-cb/ui` —, e
não em cima. Em cima, as abas empurram a tabela para baixo; embaixo, a tabela
ganha a altura, e em monitor estreito as abas que não cabem rolam pelas setas (o
botão de lista à esquerda mostra todas).

- **Contadores** da barra: `totalRegistros` = linhas da aba aberta;
  `itensAlterados` = itens ainda não salvos (0 em tela só de leitura). Fica
  destacado quando passa de zero.
- **Não use `dirty` nas abas** quando a gravação é única para a tela toda: o
  `GridTabsBar` trava as abas limpas enquanto houver uma suja. O aviso de
  alteração pendente fica no botão Salvar e no contador **Alterados**.
- **Use o `GridTabsBar` como o SDK entrega**: sem classes que mudem o formato
  (altura das abas, contadores empilhados, espaçamento). O formato — aba larga em
  maiúsculas, setas de rolagem, contadores à direita — é o padrão do portal, e cada
  tela com abas tem de parecer igual. Envolva a barra só com
  `<div className="shrink-0" data-tour="…-abas">`. Use as props dele (`readOnly`,
  `loading`, `disabled`, `dirty` — ver o item acima) em vez de imitar estados.
- A tela fica: barra de filtros → linha de informação → (cards de totais,
  padrão 3) → tabela (`flex-1 min-h-0`) → barra de abas (`shrink-0`).
- **Sem linha de informação quando ela só repete a tela**: loja e período já estão nos
  filtros e o total no contador da barra de abas, então a linha pode sair. O que só ela
  tinha muda de lugar: o botão **Histórico** vai para a **barra de filtros, ao lado do
  Salvar** (aparece depois da pesquisa; `ghost`, ícone `History` + rótulo, `h-11` no
  celular), com a **última gravação** na dica; o aviso de alteração pendente fica no
  ponto do Salvar e no contador **Alterados**.
  Referência: `fechamento-ifood-mensal/src/components/FiltrosBar.tsx` (`onHistorico`).
- **Total da barra acompanha o filtro**: com um card filtrando a tabela (padrão 3),
  `totalRegistros` mostra as linhas que o filtro deixa (a aba avisa a tela por um
  callback); sem filtro, todas as linhas da aba. **Alterados** conta cada item uma
  vez — numa lista, compare as linhas como conjunto, não pela posição (excluir a 1ª
  de 10 linhas conta 1, não 10).
- Tour e FAQ dizem que as abas ficam **embaixo** e o que são os contadores.

Referência: `fechamento-ifood-mensal/src/views/FechamentoIfoodMensalView.tsx`
(`GridTabsBar`).

### 8. Filtros enxutos depois da pesquisa (complementa o padrão 1)

Fora do celular, **depois da primeira pesquisa**, a barra de filtros vira **uma
linha só**: título do módulo (com o botão do tour), os campos e os botões
(Pesquisar/Consultar, Salvar…). Some o **subtítulo** e somem os **rótulos acima dos
campos** — de ~140 px para ~56 px de altura, que vão para a tabela.

- **Antes da pesquisa**, a barra completa de sempre (`ListHeader` com subtítulo e
  rótulos): é ela que orienta quem chega.
- **No celular, nada muda**: vale o padrão 1 (a barra recolhe ao pesquisar).
- **Pesquisa cancelada ou com erro**: volta à barra completa (enxuta só com
  resultado na tela).
- Os campos perdem o rótulo visível, então levam **`aria-label`** (`Loja`,
  `Mês de referência`, `Data inicial`…). O `data-tour` dos filtros vai para o
  contêiner da linha enxuta, para o tour continuar encontrando a barra.
- **Uma linha de verdade**: os campos e botões num `flex` **sem** `flex-wrap`, com
  largura fixa (`w-56` na loja, `w-44` no período, `shrink-0` onde não pode
  encolher). Cuidado com invólucros `w-full` — o `<span>` que leva a dica do botão
  desativado, por exemplo — que empurram os botões para a linha de baixo; no modo
  enxuto ele fica sem `w-full`.
- Implementação: o componente da barra recebe `enxuto` (= há resultado na tela) e,
  com `enxuto && !compacto`, devolve a linha em vez do `ListHeader`, reaproveitando
  os mesmos campos e botões:

  ```tsx
  if (enxuto && !compacto) {
    return (
      <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-border bg-surface px-3 py-2"
        data-tour="…-filtros">
        <div className="flex min-w-0 items-center gap-1">
          <h1 className="truncate text-sm font-semibold text-foreground">{NOME_MODULO}</h1>
          {tituloExtra /* botão do tour */}
        </div>
        <div className="ml-auto flex min-w-0 items-center gap-2">
          <div className="w-56 min-w-0 shrink">{seletorLoja({ 'aria-label': 'Loja' })}</div>
          <div className="w-44 shrink-0">{seletorPeriodo({ 'aria-label': 'Mês de referência' })}</div>
          {botaoPesquisar}
          {botaoSalvar}
        </div>
      </div>
    )
  }
  ```

Referência: `fechamento-ifood-mensal/src/components/FiltrosBar.tsx` (prop
`enxuto`) e a view, que passa `enxuto={resultado !== null}`.

### 9. (Opcional) Carregamento massivo: faixa discreta sobre a tabela, e os dados entram conforme chegam

> **Opcional — só para carregamento massivo**: consulta que busca muitas páginas ou
> várias fontes e leva de dezenas de segundos a minutos (ex.: os lançamentos do mês no
> iFood). Consulta comum — uma chamada que volta em poucos segundos — usa o
> carregamento normal da tabela (`loading` do `DataReport`) e não precisa deste padrão.
> Quando o módulo adotar, siga as regras abaixo.

Consulta demorada (API externa, várias páginas, mais de uma fonte) **não troca a
tela por um painel de carregamento**. A tabela fica no lugar dela o tempo todo, e o
andamento vai numa **faixa fina acima da tabela**; os dados **entram na tabela
conforme chegam**.

- **A faixa**: uma linha só, acima da tabela (`shrink-0 rounded-lg border
  border-border bg-surface px-3 py-2`, `role="status"` + `aria-live="polite"`):
  spinner + frase do momento, uma **barra fina** (`h-1.5`, `role="progressbar"`,
  largura com `transition-[width] duration-slow`), o **detalhe de cada parte** em
  `text-xs tabular-nums` (ex.: “Vendas no iFood: 3 de 9 páginas · Pedidos do
  delivery: aguardando”) e o botão **Cancelar** à direita. Some quando a consulta
  termina. Nada de painel ocupando o lugar da tabela, nem modal.
- **Cronômetro da consulta**: logo **à direita do spinner**, antes da frase, o tempo
  correndo desde o clique em Pesquisar/Consultar, em `mm:ss.mmm` (ex.: `00:05.854`).
  Tom acinzentado e números que não “pulam”:
  `shrink-0 font-mono text-sm tabular-nums text-muted-foreground`. Conta direto entre
  as etapas e some com a faixa. O hook guarda `inicio: number` (`Date.now()` no começo
  da pesquisa) no progresso, em todo `setProgresso`; o componente atualiza com
  `setInterval` de ~47 ms dentro de um `useEffect` (o `setState` vai no callback do
  intervalo, nunca no corpo do effect — o ESLint do host reprova). Fica com
  `aria-hidden`: a faixa é `aria-live` e o leitor de tela anunciaria cada atualização.
  Referência: `fechamento-ifood-mensal/src/components/ProgressoConsulta.tsx`
  (`Cronometro`, `formatarTempo`).
- **Antes do primeiro dado**: a tabela aparece no carregamento dela (o `loading` do
  `DataReport`, com as colunas), sob a faixa.
- **Conforme chega**: cada parte que termina já atualiza a tabela. Linha que ainda
  depende de uma parte que não chegou fica **apagada** (`opacity-60`) e com um selo
  **“Aguardando …”** no lugar do valor final — **nunca** com um valor que só vale no
  fim (ex.: não mostrar “Cancelado” antes de todas as vendas chegarem).
- **Número só completo**: os **cards de totais** (padrão 3) ficam em carregamento,
  e o **filtro pelos cards** e o **Exportar** ficam desligados, até a consulta
  terminar. Total parcial é confundido com o do dia.
- **Como buscar**: a tela conduz a consulta em partes (um hook com `geracao` para
  cancelar, fila de páginas com até **4 chamadas ao mesmo tempo** e nova tentativa
  com espera crescente, como o `use-consulta-mensal`). Chamada lenta que pode levar
  mais de ~30 s **não** é repetida automaticamente. Cancelar ou pesquisar de novo
  abandona a consulta anterior; erro numa parte obrigatória vira o estado de erro da
  tabela (com **Tentar de novo**).
- **Cálculo no navegador só em tela de leitura**: juntar as partes na tela vale
  quando o módulo só lê. Nada calculado na tela volta ao servidor para ser gravado
  (`conventions §17`: entrada de cálculo nunca vem do `body`).
- A **FAQ** explica a faixa, o selo “Aguardando …”, por que os totais e o Excel
  esperam o fim, e o **Cancelar**.

Referência: `fechamento-ifood-diario/src/components/ProgressoConsulta.tsx`,
`src/hooks/use-consulta-diaria.ts` e `src/regras.ts` (`montarFechamento` com
`completo: false`); a fila de páginas segue
`fechamento-ifood-mensal/src/hooks/use-consulta-mensal.ts`.

### 10. A tabela mostra pelo menos 5 linhas: senão, as seções acima dela recolhem

Fora do celular, a tabela tem que mostrar **pelo menos 5 linhas** de dados. Quando
uma seção recolhível **acima da tabela** (cards de totais do padrão 3, painel de
canais, resumo…) deixaria a tabela com menos que isso, ela **recolhe sozinha**; volta
a abrir sozinha quando o espaço volta. O comportamento é **o mesmo em todos os
navegadores** (Chrome, Edge, Safari, Firefox).

- **Meça a tela, não a janela.** Nada de `matchMedia('(min-height: …)')`,
  `innerHeight` ou `100vh` para decidir: cada navegador conta a altura da janela de
  um jeito (barras, zoom, área útil) e o corte cai em lugares diferentes — no Chrome
  a seção fechava com a tabela folgada, no Safari não. Use `ResizeObserver` nos
  elementos e conte em linhas da tabela.
- **A conta não pode depender de a seção estar aberta.** Parta do corpo da tabela
  como está agora e troque o espaço que a seção ocupa agora pelo que ela ocuparia
  aberta:

  ```ts
  // rolagem = pai da <table> do DataReport; secao = o Recolhivel; painel = o conteúdo dele
  const margem = parseFloat(getComputedStyle(secao).marginBottom) || 0 // -mb-3 fechado, anima
  const corpoSeAberta =
    rolagem.clientHeight + (secao.offsetHeight + GAP + margem) - (painel.offsetHeight + GAP)
  const precisa = thead.offsetHeight + 5 * alturaDaLinha // linha medida no <tbody tr>
  ```

  Assim o resultado é o mesmo com a seção aberta, fechada ou no meio da animação.
  Não some alturas de `FiltrosBar` nem do card do `DataReport`: os dois ficam em
  invólucros `display: contents`, com `offsetHeight` **0** — a conta sai errada e a
  seção abre e fecha sem parar.
- **Trava contra o pisca-pisca.** Ao recolher sozinha, guarde o espaço **abaixo da
  barra de filtros** (`area.bottom − secao.top`, pelo `getBoundingClientRect`); só
  reabra sozinha quando ele crescer **24 px** além disso. Esse espaço só muda quando a
  janela ou a barra de filtros muda (ex.: a barra enxuta do padrão 8) — nunca porque
  a seção abriu ou fechou —, então uma troca nunca provoca outra, mesmo que um
  navegador meça a tabela diferente nos dois estados.
- **A escolha do usuário manda.** Depois que ele usa o botão da seção (ex.:
  **Totais**), vale a escolha dele até recarregar a página.
- **Expandir dentro da seção não a recolhe**: a parte aberta por “Ver todos os
  totais” (padrão 3) fica fora da conta.
- **No celular, nada muda**: a seção começa fechada e abre pelo botão (padrão 3).
- **Teste** no `gia dev`, diminuindo e aumentando a altura da janela aos poucos: a
  seção troca **uma vez** ao passar das 5 linhas e, com a janela parada, não se
  mexe. Confira no Chrome **e** no Safari (ou WebKit).
- A FAQ diz que a seção fica aberta enquanto a tabela ainda mostra umas 5 linhas e
  que o botão a abre ou fecha a qualquer momento.

Referência: `fechamento-maestro/src/hooks/use-medidas-tela.ts` (`useCabemTotais`) e
o uso em `src/views/FechamentoMaestroView.tsx` (0.4.2).

### 11. Mensagem de erro: `MensagemErro`, no lugar dos estados vazios

Erro de consulta, de gravação ou de um diálogo (ex.: Histórico) usa sempre a
**mensagem padrão** `MensagemErro`, e não um `EmptyState` ou `toast` com o texto cru.
Ela mostra o **tipo** do problema (sem conexão, sistema que não respondeu, ajuste na
pesquisa, falta de acesso, falha do serviço), **de onde veio** (`origem`, ex.:
“Lançamentos do iFood”), a primeira frase do servidor, **Tentar de novo** e **Ver
detalhes técnicos** (Copiar tudo, Baixar diagnóstico só deste módulo, sem senha,
token nem dado pessoal).

- **Posição: a mesma dos estados vazios da tela** (o `EmptyState` do `@gia-cb/ui`,
  que usa `py-12`): no **alto** da área da tabela, **centrada na horizontal**, com o
  mesmo espaço em cima. **Não** centralize na vertical — o erro e o “Escolha a loja e
  o mês” têm de aparecer no mesmo lugar.

  ```tsx
  <div className="flex min-h-0 flex-1 justify-center overflow-y-auto px-4 py-12">
    <MensagemErro erro={erro} origem={origem} onTentarDeNovo={tentarDeNovo} />
  </div>
  ```

  Dentro do `emptyState` do `DataReport`, o mesmo: `justify-center` + `py-12`, com
  `overflow-y-auto` para a mensagem rolar se não couber.
- **Erro ao gravar** (Salvar): a mensagem abre num `Modal` (“… não foi salvo”), e o
  que o usuário preencheu continua na tela.
- O componente é um só arquivo, copiado igual entre os módulos (padrão 16; proposta
  para virar componente do portal); o módulo guarda o **erro inteiro** (com a `requisicao` que o
  server-client do SDK anexa), nunca só a `message`.

Referência: `fechamento-ifood-mensal/src/components/MensagemErro.tsx` e o uso em
`src/views/FechamentoIfoodMensalView.tsx` (consulta, modal do Salvar) e
`src/components/HistoricoDialog.tsx`.

## Padrões de gravação

### 12. Trava de teste: `<NOME_DO_MODULO>_EMPRESA_TESTE` nos handlers que gravam

Módulo que **cria, atualiza ou exclui** dado (Salvar, Nova linha, editar, remover,
importar, chamada a API que muda algo do outro lado) num banco que **homologação e
produção dividem** (ex.: o DW, `GIA_SERVER_DATABASE_URL`) leva uma trava no servidor.
Sem ela, um teste em homologação altera o dado real, e o padrão 5 depende só de
cuidado de quem testa.

- **Quando vale**: o módulo grava **e** não há ambiente de teste com banco próprio. Na
  dúvida, vale. Com banco de homologação separado (ex.: só o Supabase do portal), não
  precisa — diga no `INTEGRATION.md` qual é o banco de teste.
- **Nome da variável**: o id do módulo em maiúsculas, `-` vira `_`, mais
  `_EMPRESA_TESTE`. Ex.: `fechamento-ifood-mensal` →
  `FECHAMENTO_IFOOD_MENSAL_EMPRESA_TESTE`.
- **Valor**: o id numérico da Empresa de teste no portal (`999.CB TECH HOMOLOG`).
- **Comportamento**, em **todo** handler `src/server/*.ts` que grava:
  - variável **ausente ou vazia** (produção): nada muda;
  - **definida e a Empresa do pedido é outra**: **403**, com mensagem que começa por
    “Este ambiente é de teste” e diz que as outras lojas podem ser consultadas, mas
    não alteradas;
  - **definida com valor que não é id**: recusa **toda** gravação (**503**, motivo no
    `console.error`) — erro de configuração não abre a trava.
- **Onde**: logo depois do `requirePermission` e da checagem de escopo
  (`requireEmpresa`/`requireOperacao`), **antes de qualquer acesso ao banco** — nada de
  criar cabeçalho, ler com `FOR UPDATE` ou abrir transação antes dela. Com a chave
  pela operação, a Empresa que vale é a da operação (`op.empresaId`).
- **Lida com `envOptional`**, **fora** do `config.secrets`: lá ela viraria
  `secrets_required` e a instalação em produção passaria a exigi-la. A função vai
  dentro de cada handler que grava (handler é auto-contido).
- **Na tela**: a `MensagemErro` (padrão 11) mostraria o 403 como falta de acesso
  (“peça ao seu gestor”), e o gestor não tem o que liberar. No erro de gravação,
  troque título e texto pelas props `titulo` (“Ambiente de teste”) e `descricao` (a
  mensagem do servidor), sem mexer no componente.
- **Escrita sem handler** (direto no Supabase pelo navegador): a variável não protege
  nada. Passe a escrita para um handler ou confirme que o banco de homologação é
  separado.
- **Documentos**:
  - `.env.example`: a variável com o id da 999 do `gia.config.ts`;
  - `INTEGRATION.md`: a variável (o que definir em homologação; **não** definir em
    produção) e a ordem da instalação: trava no ar → só então criar tabela ou dar o
    GRANT de escrita → teste na 999;
  - `PRD.md`: critério de pronto, critério de aceite e o risco “teste em homologação
    grava no banco real”;
  - FAQ (`qa`): a pergunta sobre a recusa “Este ambiente é de teste”.
- No `.env` local, deixe a variável com a 999 sempre que o banco for de verdade.

Referência: `fechamento-ifood-mensal` 0.1.2 — `src/server/salvar.ts` (`travaDeTeste`),
`src/helpers.ts` (`ehRecusaDeAmbienteDeTeste`) e o modal do Salvar em
`src/views/FechamentoIfoodMensalView.tsx`.

### 13. Gravação: transação única, SQL de banco externo no pacote e virada da tela antiga

Vale para todo handler que cria, atualiza ou exclui, junto com a trava do padrão 12.

- **Uma gravação = uma transação.** Valide **todo** o corpo antes de abrir a transação
  (422 com a linha e o campo; o navegador não é confiável) e grave tudo dentro dela
  (`getDbClient()` → `begin`). Nada parcial: se uma parte falha, nada fica gravado.
- **Lock no registro-pai.** O primeiro comando da transação lê o registro-pai (o
  cabeçalho do mês, o documento) com **`FOR UPDATE`**: duas gravações da mesma loja e
  período ficam em fila, e o histórico de uma não mistura com o da outra. Sem pai,
  crie-o ali mesmo, ainda dentro da transação.
- **Entrada de cálculo nunca vem do corpo** (`conventions §17`): o que o servidor
  pode buscar (número da loja, configuração da Empresa) ele busca.
- **SQL para banco fora do portal** (DW, Maestro…) **não é migration**: vai numa pasta
  `sql-<banco>/` (ex.: `sql-maestro/001_historico.sql`), listada no `files` do
  `package.json`, para ir no pacote. Cada arquivo:
  - diz no topo em que banco roda, quem roda (o time GIA ou o DBA) e quando;
  - é **idempotente** (`IF NOT EXISTS`), pode rodar de novo sem efeito;
  - traz os **GRANTs** do usuário do módulo, só os necessários (histórico: `SELECT,
    INSERT`, sem `UPDATE`/`DELETE`);
  - é **imutável** depois de entregue — correção vem num arquivo novo, como migration.
- **Falta da tabela tratada.** Enquanto o SQL não roda, o handler responde com
  mensagem clara ("o banco … ainda não está preparado …", 503), nunca com o erro do
  Postgres. O `INTEGRATION.md` §2 diz o arquivo, o banco, os GRANTs e a **ordem**
  (trava do padrão 12 no ar → SQL → teste na 999).
- **Tela que substitui uma tela antiga gravando nas mesmas tabelas**: desde a 1ª
  entrega, o `INTEGRATION.md` §7 e os riscos do `PRD.md` trazem a pendência "combinar
  a data da virada; até lá, se as duas telas gravarem o mesmo registro, vale a última
  gravação; depois, desligar a tela antiga". Gravação da tela antiga não entra no
  histórico do módulo — diga isso também.

Referência: `fechamento-ifood-mensal/src/server/salvar.ts` (validação → `db.begin` →
`FOR UPDATE` no cabeçalho, `erroDeBanco`) e `sql-maestro/001_historico.sql`.

## Padrões de servidor

### 14. Handler com fonte externa: erro técnico só no log, uma parte por chamada

Handler que fala com API ou banco fora do portal (`conventions §17`).

- **Detalhe técnico fica no log do servidor.** Corpo da resposta da API, erro do
  Postgres, stack: `console.error('[<id do módulo>] <o que falhou>:', e)` — o prefixo
  com o id é o que se procura no log da Edge Function. O usuário recebe um
  `HttpError` com **status certo** e **uma frase curta** que diz qual sistema falhou
  ("o iFood não conseguiu responder agora (código 502)", "falha no banco de dados").
  `HttpError` de validação passa como está.
- **Status com sentido** (a `MensagemErro`, padrão 11, decide o que mostrar por ele):
  422 entrada a ajustar; 403 escopo, permissão ou trava (padrão 12); 424 credencial
  recusada pela fonte (não adianta tentar de novo); 502 fonte fora; 503 banco ou
  serviço indisponível; 504 fonte passou do tempo limite. Liste os usados no
  `INTEGRATION.md` §4.
- **Uma parte por chamada.** O handler faz **uma** unidade de trabalho (uma página,
  um período, uma loja) e volta; a tela conduz a fila (padrão 9). Nada de laço de
  páginas dentro de um handler: ele não pode passar do tempo da Edge Function.
- **Tempo limite em toda chamada externa** (`AbortSignal.timeout`), abaixo do tempo
  da Edge Function (a referência usa 30 s). Estourou: 504, sem nova tentativa
  automática (padrão 9).
- **Segredo e credencial** só pelo hub (`ctx.credencial`) ou secret; nunca no log nem
  na resposta.

Referência: `fechamento-ifood-mensal/src/server/ledger.ts` (`TIMEOUT_MS`,
`AbortSignal.timeout`, `console.error` com prefixo, 424/502/504) e o `INTEGRATION.md`
§4 ("Erros").

## Padrões de projeto

### 15. SDK fixada: versão exata do `@gia-cb`, subir é decisão

- No `package.json`, os quatro pacotes — `@gia-cb/sdk`, `@gia-cb/ui`,
  `@gia-cb/dev-shell` e `@gia-cb/cli` — com a **versão exata** e a **mesma** nos quatro
  (`"0.1.0-alpha.71"`, sem `^` nem `~`). Com `^`, uma instalação nova pode trazer um
  SDK que o módulo nunca rodou.
- **Módulo novo**: a versão mais nova em uso no workspace
  (`grep '"@gia-cb/' */package.json`).
- **Módulo existente**: subir o SDK é decisão — pergunte. Quando subir: leia o que
  mudou nas docs do SDK novo, rode `npm install`, `gia validate` e teste no `gia dev`;
  vai numa versão nova do módulo, com a linha no `CHANGELOG.md` e a versão atualizada
  no `INTEGRATION.md` ("Versão do SDK usada") e no `PRD.md` ("SDK version mínima").
- O `package-lock.json` vai junto e bate com o `package.json`.

Referência: `fechamento-ifood-mensal/package.json` e `INTEGRATION.md` §1.

### 16. Componente copiado de outro módulo: cópia idêntica, ajuste só por props

Componentes que o SDK não tem e que os módulos repetem (`MensagemErro`,
`ProgressoConsulta`, `Recolhivel`, `Dica`…) são **cópias do mesmo arquivo**, até
virarem componente do SDK.

- **Copie da referência**, não de um módulo qualquer: a do padrão que traz o
  componente (ex.: `MensagemErro` → padrão 11). Antes, compare as cópias
  (`md5sum */src/components/<Nome>.tsx`); se divergem, a referência manda.
- **Não altere a cópia.** O que o módulo precisa de diferente entra pelas **props**
  (ex.: `titulo`/`descricao` da `MensagemErro` na recusa da trava, padrão 12) ou por
  fora. Melhoria que vale para todos vai **primeiro na referência** e depois é
  copiada para os demais módulos, na próxima versão de cada um.
- **Mesmo nome, mesmo componente.** Componente diferente com o nome de uma cópia
  (ex.: um acordeão chamado `Recolhivel`) ganha outro nome.
- **Origem no topo**: um comentário com o módulo e o arquivo de referência e "cópia —
  não altere; ajuste por props".
- **Saiu no SDK**: troque a cópia pelo componente do SDK na próxima versão do
  módulo, ajustando as props, e apague o arquivo.

Referência: `fechamento-ifood-mensal/src/components/MensagemErro.tsx` (a mesma do
`fechamento-maestro` e do `reports-maestro`).

## Padrões de documento

### 17. PDF gerado pelo módulo: um só visual para todos

Todo PDF que um módulo gera (ficha, relatório, pesquisa, comprovante…) segue o mesmo
visual, tirado de dois PDFs aprovados: a **ficha da Agenda de Recrutamento**
(formulário, A4 retrato) e o **Plano de Eventos — Pesquisa de concorrência**
(comparativo em tabela, A4 paisagem). O visual base é o da ficha; as tabelas seguem
o Plano de Eventos, nas cores da ficha e sem os defeitos dele (listados abaixo).

**Como gerar**

- O SDK não tem PDF (`@gia-cb/ui` só dá o `nomeArquivoExport`): use o **jsPDF**,
  com **`jspdf-autotable`** para tabelas, por `import()` dinâmico (fora do bundle
  inicial, como o exceljs). Desenho em **vetor**, com texto selecionável. Nada de
  `html2canvas` nem print da tela.
- Baixa direto (`doc.save`), com nome pelo **`nomeArquivoExport`** do SDK (`extensao:
  'pdf'`). Funciona igual no celular (`conventions §11`).
- `doc.setProperties({ title, creator: NOME_MODULO })`.
- Fonte só **Helvetica** (`normal`/`bold`). Ela não tem espaço fino: troque
  ` `/` ` (que o `Intl` põe em `R$ 1,00`) por espaço comum antes de
  escrever. Texto que não cabe corta com “…” ou quebra (`splitTextToSize`), nunca
  passa da margem.
- O PDF é sempre **claro**, mesmo com o portal no escuro: ele vai para impressão.

**Página**

- **A4**, unidade `mm`, margem **12,7 mm** nos quatro lados.
- **Retrato** por padrão (ficha, documento, cards). **Paisagem** quando a tabela tem
  colunas de texto lado a lado que não cabem em retrato (ex.: comparativo com 3+
  concorrentes).

**Cores** (rgb, usar só estas)

| Uso | Cor |
| --- | --- |
| Acento: título, linha do cabeçalho, título de seção, cabeçalho de tabela | `#3783FF` |
| Faixa da seção | `#DBE8FF` |
| Faixa escura (área “para uso da empresa”, destaque) | `#384052` (texto branco) |
| Texto principal, valores | `#1F2937` |
| Rótulos | `#374151` |
| Texto secundário: contexto, rodapé, termos, legendas | `#6B7280` |
| Linhas de preencher, bordas de tabela e caixas | `#D1D6DB` |
| Linha zebrada da tabela | `#F5F7FA` |

Cor de sentido (positivo, alerta, erro) só quando o dado pede, com os tons do tema
claro do `@gia-cb/ui` (`success #3AA85B`, `warning #DC8900`, `destructive #E62B34`).

**Estrutura**

1. **Cabeçalho da 1ª página**
   - Título do documento: **15 pt, negrito, acento**, à esquerda (em formulário, em
     maiúsculas: “FICHA DE SOLICITAÇÃO DE EMPREGO”). Subtítulo, se houver, 10 pt
     `#6B7280` logo abaixo (“Pesquisa de concorrência”).
   - À direita, na linha do título, o **identificador**: 12 pt negrito `#1F2937`
     (“Nº Candidato: 4”, “Nº 86”).
   - Linha de contexto: 9 pt `#6B7280`, itens separados por ` · ` — loja, data do
     fato, responsável, situação, “Gerado em dd/mm/aaaa, hh:mm” (horário de São Paulo).
     Com mais de 4 itens, vira uma grade de duas colunas de `Rótulo: valor` (rótulo
     negrito `#374151`).
   - **Linha de acento** de 1,2 pt na largura toda, fechando o cabeçalho.
2. **Páginas seguintes**: no topo, só uma linha de continuação 8 pt `#6B7280`
   (“Ficha nº 4 - Maria Candidata Teste (continuação)”), sem repetir o cabeçalho.
3. **Seção**: faixa `#DBE8FF` na largura toda, ~7 mm de altura, com o título em
   **9 pt negrito, acento, maiúsculas**, recuado 2 mm. Documento com seções
   numeradas usa “1 — MENU E ITENS OFERECIDOS”. 5 mm de respiro antes da faixa.
4. **Campos (`Rótulo: valor`)**: rótulo **8,5 pt negrito `#374151`**, valor 9 pt
   normal `#1F2937` logo depois, em **duas colunas**; pergunta longa ocupa a linha
   inteira. Campo **vazio** em documento para preencher à mão: linha 0,5 pt
   `#D1D6DB` do fim do rótulo até o fim da coluna. Em relatório (não vai ser
   preenchido), campo vazio mostra `—`.
5. **Texto corrido** (termos, observações): 7,5 pt `#6B7280`, entrelinha ~1,3.
6. **Tabela** (`autoTable`):
   - cabeçalho **negrito branco sobre o acento**, repetido em **toda página**
     (`showHead: 'everyPage'`);
   - corpo 8 pt `#1F2937`, `cellPadding` 2 mm, linhas zebradas `#F5F7FA`, borda
     0,2 pt `#D1D6DB`;
   - 1ª coluna, quando é o rótulo da linha (“Subtópico”), em negrito `#374151` e com
     largura fixa; as outras dividem o resto **por igual**;
   - quebras de linha do dado ficam; tabulação e espaços repetidos viram um espaço;
   - **coluna sem nenhum dado sai** (não deixar coluna vazia espremida no canto).
   Tabela de formulário (ex.: entrevistas da ficha) pode ter cabeçalho branco com
   texto negrito `#374151` e grade `#D1D6DB` — é a área para escrever à mão.
7. **Faixa escura** (`#384052`, texto branco negrito 9 pt maiúsculas): separa o
   que é **para uso da empresa** (“NÃO ESCREVER NO ESPAÇO ABAIXO…”).
8. **Assinaturas**: linha 0,6 pt `#1F2937`, legenda 8 pt `#6B7280` embaixo
   (“Assinatura do candidato”), duas por linha. Opções de marcar:
   `( ) APROVADO   ( ) AGUARDAR` em 10 pt negrito.
9. **Rodapé em todas as páginas**, a ~6 mm da borda, 7,5 pt `#6B7280`: à esquerda
   **`GIA · <Nome do módulo> · <Loja>`** (mais o período, se o documento for de um
   período); à direita **`Página X de Y`**. Desenhe no fim, depois de todas as
   páginas, para ter o total.

**Quebra de página**

- **Título de seção nunca fica sozinho no pé da página**: se não cabem a faixa e
  ao menos a primeira linha do conteúdo (ou o cabeçalho e a 1ª linha da tabela), a
  seção começa na página seguinte. (No Plano de Eventos o “2 — Horários e Duração”
  ficou no fim da página 1 e a tabela na 2.)
- Linha de tabela não se divide entre páginas quando cabe numa página
  (`rowPageBreak: 'avoid'`).
- Blocos que se leem juntos não se dividem: assinaturas, aprovação, caixa de pontos
  positivos/negativos.

**Na tela e na documentação**

- O botão **PDF** fica ao lado do **Exportar** (`ghost`, ícone `FileText` + rótulo,
  `h-11` no celular), aparece depois da pesquisa e fica desligado durante o
  carregamento (padrão 9). O PDF segue a mesma permissão da tela.
- A **FAQ** diz o que vai no PDF e se ele respeita os filtros da tela.
- Antes de entregar, gere um PDF de teste com dado longo (texto grande, muitas
  linhas, nome de loja comprido) e confira: nada passa da margem, nenhum título
  órfão, rodapé com o total certo de páginas.

Referência visual: ficha da Agenda de Recrutamento
(`GIA_Agenda_de_Recrutamento_…_Fichas_do_dia_….pdf`) e Plano de Eventos
(`Plano-Eventos-86-….pdf`). Código: `fechamento-maestro/src/pdf-canais.ts`
(0.4.5: import dinâmico, `limpo`, `caber`, cabeçalho com linha de acento, faixa de
seção, linha de continuação, seção que não cabe vai inteira para a página seguinte,
rodapé pós-geração). Exceção combinada: o anel de canais mantém as cores de cada
canal da tela (`PainelCanais`), fora da tabela de cores acima.

## Padrões de versionamento

### 18. Uma branch por módulo e versão: `feat/<modulo>-<versão>`

Cada versão de cada módulo tem a **sua branch**, e a branch leva **só os arquivos
daquele módulo**. Nada de commitar um módulo na branch de outro (ex.: a 0.2.5 do
`fechamento-ifood-diario` dentro da `feat/fechamento-ifood-mensal-0.1.0`): o PR de
um módulo passa a arrastar o outro, e não dá para entregar um sem o outro.

- **Nome**: `feat/<id do módulo>-<versão do package.json>`, a versão sem `v`
  (ex.: `feat/fechamento-maestro-0.4.5`, `feat/fechamento-99food-mensal-0.1.0`).
- **Versão nova = branch nova.** Subiu a versão (padrão 15, `/finalizacao-modulo`)?
  Abra a branch da versão nova; não continue na da versão anterior.
- **Só o módulo**: `git add <id do módulo>/` — nunca `git add -A` na raiz. Antes
  do commit, `git diff --cached --stat` não pode mostrar arquivo de outra pasta.
- **O que não é de um módulo** fica em branch própria, nunca junto com um módulo:
  - padrões e ferramentas do workspace (`AGENTS.md`, `.claude/skills/`,
    `package.json` da raiz, `scripts/`, `docs/` da raiz) → `chore/<tema>`
    (ex.: `chore/padroes-workspace`);
  - só documento de entrega, sem versão nova do módulo (ex.: o aviso de entrega
    gerado de novo) → `docs/<id do módulo>-<o quê>-<aaaa-mm-dd>`.
- **Base**: a branch nasce da `main` atualizada, para o PR trazer só o módulo.
  Se depender de algo ainda não integrado (ex.: um padrão novo do workspace), diga
  isso no PR.
- **Dados de teste** fora do git: respostas cruas de API, planilhas com dado de
  loja e arquivos grandes de teste vão no `.gitignore` do módulo.
- **Toda alteração pedida pelo usuário gera um commit**, ao fim de cada pedido,
  na branch a que ela pertence (as regras acima) — sem esperar ele pedir o commit.
  Pedido que mexe em mais de um módulo gera um commit em cada branch. O **push**
  só quando o usuário pedir. Mensagem no formato
  `feat(<id do módulo>): v<versão> <o que mudou>` (no workspace,
  `chore: <o que mudou>`), terminando com o `Co-Authored-By` da IA.

Referência: as branches de 19/11/2026 (`feat/fechamento-ifood-mensal-0.1.2`,
`feat/fechamento-maestro-0.4.5`, `chore/padroes-workspace`…).
