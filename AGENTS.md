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
    return useComHover() ? <Tooltip content={content}>{children}</Tooltip> : children
  }
  ```

  Não exporte o hook do mesmo arquivo do componente: o ESLint do host
  (`react-refresh/only-export-components`) reprova no `gia validate`.
- Como no toque não há tooltip, **nada importante pode depender dele**: em tela
  de toque o botão mostra o **rótulo visível** (não só o ícone; use
  `[@media(hover:none)]:inline` no texto), e a explicação de cada número ou regra
  fica também na **FAQ**.
- O mesmo vale para destaque ao passar o mouse (`onMouseEnter`/`onPointerEnter`):
  ligue só com `(hover: hover)` e `pointerType === 'mouse'`; no toque, use
  `onClick`. Senão o "mouse" emulado liga e desliga o destaque sozinho.

Referência: `fechamento-maestro/src/components/Dica.tsx` e
`fechamento-maestro/src/components/VendasPorCanal.tsx`.

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
- Os valores da barra são da **pesquisa inteira** — não mudam com o filtro. O
  filtro vale para o **Exportar**, e o subtítulo da planilha diz qual estava ligado.
- Um botão **Totais** na barra da tabela abre e fecha a barra (com `Recolhivel`).
  Ela abre sozinha em tela alta (`min-height: 700px`) fora do celular; no celular
  começa fechada, para sobrar espaço para a lista.

Referência: `fechamento-ifood-diario/src/components/ResumoCards.tsx` e
`pagamento-echeck/src/components/ResumoCards.tsx`.
