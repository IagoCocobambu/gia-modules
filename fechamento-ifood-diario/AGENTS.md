# Fechamento iFood Diário — instruções pra IA (módulo do portal GIA)

> Este arquivo é lido automaticamente por assistentes de IA (Cursor, GitHub
> Copilot, Claude Code, etc.). Se você é uma IA ajudando a desenvolver este
> módulo, **siga tudo abaixo**.

Você está desenvolvendo um **módulo do portal GIA** com o SDK `@gia-cb`.
Muitas vezes quem te pede isso **não é desenvolvedor** — está fazendo "vibe
coding" e confia inteiramente em você pra escrever código correto, seguir as
convenções do portal e validar o resultado. Assuma essa responsabilidade:
não invente APIs, não pule regras, e não diga que terminou enquanto o
`gia validate` não passar sem erros.

## 1. LEIA A DOCUMENTAÇÃO ANTES DE ESCREVER CÓDIGO (obrigatório)

A documentação completa do SDK fica dentro do próprio pacote (aparece após
`npm install`):

```
node_modules/@gia-cb/dev-shell/docs/*.md
```

Leia **nesta ordem** antes de criar ou alterar qualquer código:

1. `getting-started.md` — o fluxo e o que é um módulo GIA
2. `conventions.md` — o **contrato** (estrutura, naming, imports, UI, mobile,
   FAQ/tour, segundo plano, histórico). É a leitura mais importante.
3. `api-reference.md` — o que importar de `@gia-cb/sdk` (por subpath) e de
   `@gia-cb/ui`, com exemplos. **Use SÓ o que está aqui — não invente
   export nem assinatura.** Na dúvida, confie no autocomplete do editor.
4. `prd-template.md` — o `PRD.md` que este módulo tem que preencher
5. `delivery-checklists.md` — tudo que o `gia validate` cobra
6. `packaging.md` — como o módulo é empacotado e instalado

Regra de negócio do domínio (o que o módulo faz, quais dados, quais
validações) **não está nas docs** — se não estiver claro, **pergunte ao
usuário**. Nunca invente regra de negócio.

## 2. Regras não-negociáveis (resumo — o detalhe está em `conventions.md`)

- **Imports**: componentes de UI vêm de `@gia-cb/ui`; hooks e lógica de
  `@gia-cb/sdk/<área>` — o SDK é **subpath** (`@gia-cb/sdk/permissions`,
  `@gia-cb/sdk/modules`, `@gia-cb/sdk/supabase`, ...); **não existe** barrel
  raiz `@gia-cb/sdk`. `cn` vem de `@gia-cb/ui/cn`. Sempre **named export**,
  nunca `default`.
- **Estilo**: só **tokens semânticos** (`bg-surface`, `text-foreground`,
  `border-border`, ...), nunca cor raw (`bg-blue-500`). Durações via tokens
  de motion (`duration-fast`, ...). Superfícies suspensas usam as utilities
  `glass-*`.
- **UI fluida**: toda abertura/fechamento e exibir/ocultar tem transição
  suave — nada aparece/some abruptamente.
- **Tooltip**: use `<Tooltip>` de `@gia-cb/ui`, **nunca** `title=` nativo.
- **Formatação**: o `.prettierrc` do projeto é o do portal — **não troque**.
  A opção que mais pega é `trailingComma: "es5"`; o default do Prettier 3 é
  `"all"` e reprova o pacote inteiro no CI do host. `npm run format` arruma.
- **Mobile é obrigatório**: TODAS as ações executáveis no celular; listas de
  itens viram **cards** em telas pequenas (o `DataReport`/`DataTable` já
  fazem). Teste no seletor de **Viewport** do dev-shell.
- **FAQ + Tour são o treinamento do usuário** — ele não recebe treinamento
  prévio. Escreva FAQ rica cobrindo **cada** funcionalidade, regra e
  validação; tour cobrindo o caminho da primeira vez. Riqueza proporcional à
  complexidade do módulo (o mínimo de 5/3 é piso de módulo trivial).
- **Histórico**: módulo que **altera dados** registra quem/quando/onde/o quê
  (trigger no banco + `logAudit`), com uma forma de ver o histórico na UI.
- **Segundo plano**: operação pesada ou multi-loja (dados externos via edge
  function, export volumoso) **nunca** trava a UI — dispara um job em
  background e entrega o resultado por **email**.
- **Banco**: toda migration cria tabela com **RLS** + **GRANT** explícito, e
  termina com `notify pgrst, 'reload schema'` quando cria/altera função.
  Migration entregue é **imutável** — correção vem como arquivo novo.

## 3. Ciclo de trabalho

```bash
npm run dev        # gia dev — sobe o dev-shell em http://localhost:6010 (mocks)
npm run validate   # gia validate — RODE ATÉ FICAR VERDE (0 erros)
npm run pack       # gia pack — gera o .tgz de entrega ao time GIA
```

Antes de considerar o módulo pronto:

- [ ] Li os docs em `node_modules/@gia-cb/dev-shell/docs/`
- [ ] Preenchi o `PRD.md` com o domínio real (perguntei ao usuário o que faltava)
- [ ] `faq.ts` e `tour.ts` reais e ricos (não os placeholders)
- [ ] Testei todas as ações em **mobile** no dev-shell
- [ ] `gia validate` passa **sem erros**
