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
