# GIA SDK — Comece aqui

> **O único documento que você precisa pra começar.** Ele te leva de "nada
> instalado" até o ambiente de desenvolvimento rodando com a **documentação
> completa aberta**. Do `gia dev` em diante, tudo o que você precisa saber
> vive **dentro da própria ferramenta** — este guia é só a ponte até lá.

> 🤖 **Não é desenvolvedor? Vai construir com IA?** Perfeito — este guia foi
> feito pra isso. Abra a IA da sua IDE (Cursor, GitHub Copilot, Claude Code…),
> deixe este arquivo na pasta do projeto e peça: **"leia este arquivo e me
> ajude a começar, seguindo cada passo"**. A IA cuida da instalação e do
> código; você só precisa fazer **2 coisas manuais** (que a IA não consegue):
> criar o token no GitHub (passo 1) e confirmar com o time GIA que sua conta
> tem acesso aos pacotes. Quando o módulo for criado, ele já vem com um
> arquivo `AGENTS.md` que a IA lê sozinha e passa a seguir as regras do SDK.

---

## Pré-requisitos

- **Node.js 22+** e npm — confira com `node -v`
- Uma conta **GitHub** com **acesso de leitura concedido aos pacotes
  `@gia-cb`** (o time GIA concede isso pra sua conta)

---

## 1. Autenticar no registry (uma vez só)

Os pacotes do SDK são privados (GitHub Packages). Você precisa de um token de
leitura:

1. No GitHub: **Settings → Developer settings → Personal access tokens →
   Tokens (classic) → Generate new token (classic)**. Marque **apenas** o
   escopo `read:packages`. Copie o token gerado.
2. Crie um arquivo **`.npmrc`** na sua pasta de usuário com estas duas linhas
   (troque `SEU_TOKEN` pelo token):

   ```
   @gia-cb:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=SEU_TOKEN
   ```

   - **Windows**: `C:\Users\<voce>\.npmrc`
   - **macOS / Linux**: `~/.npmrc`

3. Teste a autenticação (o comando não imprime o token):

   ```
   npm view @gia-cb/cli@alpha version --registry=https://npm.pkg.github.com
   ```

   Se aparecer um número de versão, está tudo certo. Se der `401`/`404`,
   revise o token e o `.npmrc`.

---

## 2. Instalar a CLI e criar seu primeiro módulo

Numa pasta de trabalho qualquer (fora de outros projetos):

```
npm install -g @gia-cb/cli@alpha
gia create-module meu-modulo --template rich
cd meu-modulo
npm install
gia dev
```

Abra **http://localhost:6010**. O dev-shell sobe com um módulo de exemplo
completo (seletor de loja, tabela, ações com feedback) e um painel pra
simular personas, permissões e estados de dados.

> `--template rich` gera um exemplo realista e navegável. Use
> `--template basic` se preferir um esqueleto mínimo.

> 🤖 **Pra IA**: o módulo criado tem um **`AGENTS.md` na raiz** (leia-o
> primeiro) e, após o `npm install`, a documentação completa do SDK fica em
> **`node_modules/@gia-cb/dev-shell/docs/*.md`** — leia todos esses arquivos
> antes de implementar qualquer coisa. São o contrato do SDK.

---

## 3. Daqui em diante, a documentação está na ferramenta

No dev-shell, abra o menu **Documentação** (rota `/_docs`) — os documentos
viajam dentro do SDK e funcionam **offline**. Leia **nesta ordem** (a mesma
numeração aparece no índice do dev-shell):

1. **Começando** — o fluxo completo do zero ao módulo (você já fez o começo).
2. **Convenções** — o **contrato**: estrutura de pastas, naming, imports e
   padrões de UI. É o que o `gia validate` cobra. A leitura mais importante.
3. **Comandos da CLI** — o que `create-module` / `dev` / `validate` / `pack` fazem.
4. **Template de PRD** — o documento de produto obrigatório; planeje o módulo
   **antes** de escrever código.
5. **Referência de API** — o que importar de `@gia-cb/sdk` (por subpath) e
   `@gia-cb/ui`, com exemplos. Use só o que está aqui.
6. **Dados externos (API/DB)** — *se* seu módulo consome uma **API ou banco
   externo** (fora do portal): você escreve um handler que roda no seu Node em
   dev (sem Supabase) e vira Edge Function no deploy. Tem um **template pronto**
   (`gia create-module <id> --template rich-api`) que já faz isso, ponta a ponta.
7. **Checklist de entrega** — tudo que o `gia validate` reprova antes do pack.
8. **Empacotamento** — como gerar o `.tgz` e o que ele leva.

---

## 4. Ciclo de trabalho

| Comando | O que faz |
|---|---|
| `gia dev` | Sobe o dev-shell com hot reload + painel de personas/permissões/estados |
| `gia validate` | Roda o checklist de entrega — reprova o que não passa |
| `gia pack` | Gera o `.tgz` do módulo pra entrega ao time GIA |

> **Atualizar o SDK depois?** Seu módulo é seu código — não se perde. Atualizar
> é só trocar a versão da dependência (`npm install @gia-cb/sdk@alpha @gia-cb/ui@alpha @gia-cb/dev-shell@alpha`).
> Detalhes na seção **"Atualizando o SDK"** do doc **Começando** (no `/_docs`).

Pronto — o resto você descobre pela documentação embutida, sem depender de
mais ninguém.
