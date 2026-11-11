# Módulos GIA — padrões do workspace (instruções pra IA)

> Vale para **todos** os módulos desta pasta (`fechamento-maestro`,
> `reports-maestro`, `validacao-fiscal`, ...). Cada módulo tem também o seu
> `AGENTS.md`, com o contrato do SDK `@gia-cb` — leia os dois. Em caso de
> conflito, o `AGENTS.md` do módulo e as docs do SDK
> (`node_modules/@gia-cb/dev-shell/docs/`) mandam; este arquivo só **acrescenta**
> padrões de UX combinados para os módulos daqui.

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
  Ela abre sozinha em tela alta (`min-height: 700px`) fora do celular; no celular
  começa fechada, para sobrar espaço para a lista.

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

### 7. Telas com abas: barra de abas embaixo da tabela, compacta

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
- **Compacta a partir de `md`**: o componente usa `py-3` nas abas e empilha
  rótulo e valor dos contadores (~64 px). No invólucro da barra, aplique só
  classes — nenhum componente próprio — para deixar ~29 px:

  ```tsx
  const BARRA_ABAS_COMPACTA = [
    'md:[&_[role=tab]]:py-1.5',
    'md:[&_footer>div:last-child]:py-1',
    'md:[&_footer>div:last-child_.flex-col]:flex-row',
    'md:[&_footer>div:last-child_.flex-col]:items-baseline',
    'md:[&_footer>div:last-child_.flex-col]:gap-1.5',
  ].join(' ')
  // <div className={cn('shrink-0', BARRA_ABAS_COMPACTA)} data-tour="…-abas">
  //   <GridTabsBar tabs={…} activeId={aba} onChange={…} totalRegistros={…} itensAlterados={…} />
  // </div>
  ```

  **No celular, tamanho original** (alvo de toque ≥ 44 px) — por isso o `md:`.
  Se o `GridTabsBar` mudar a estrutura interna, a barra só volta ao tamanho
  original; nada quebra.
- A tela fica: barra de filtros → linha de informação → (cards de totais,
  padrão 3) → tabela (`flex-1 min-h-0`) → barra de abas (`shrink-0`).
- **Variação aceita — linha de informação no rodapé**: a linha com loja, período,
  última gravação e o botão **Histórico** pode ir **embaixo da barra de abas**, como
  última linha da tela (`shrink-0 flex-wrap text-xs`), para a tabela começar logo
  abaixo dos filtros e dos cards. No celular ela quebra em duas linhas (o nome da
  loja não pode sumir) e o botão Histórico tem alvo de toque `min-h-11`. FAQ e tour
  dizem que essas informações ficam **no rodapé**.
  Referência: `fechamento-ifood-mensal/src/views/FechamentoIfoodMensalView.tsx`.
- **Total da barra acompanha o filtro**: com um card filtrando a tabela (padrão 3),
  `totalRegistros` mostra as linhas que o filtro deixa (a aba avisa a tela por um
  callback); sem filtro, todas as linhas da aba. **Alterados** conta cada item uma
  vez — numa lista, compare as linhas como conjunto, não pela posição (excluir a 1ª
  de 10 linhas conta 1, não 10).
- Tour e FAQ dizem que as abas ficam **embaixo** e o que são os contadores.

Referência: `fechamento-ifood-mensal/src/views/FechamentoIfoodMensalView.tsx`
(`BARRA_ABAS_COMPACTA`).

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

### 9. Carregamento: faixa discreta sobre a tabela, e os dados entram conforme chegam

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
