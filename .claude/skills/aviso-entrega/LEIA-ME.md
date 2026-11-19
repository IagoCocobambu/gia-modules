# Skill `aviso-entrega` — versão 3 (23/10/2026)

Gera o **aviso de entrega** de um módulo do portal GIA: o PDF que vai aos gestores
e ao time do Portal GIA com o que o módulo é, onde fica no menu, o que mudou, a
tabela de permissões com o público sugerido para cada chave, as permissões por
perfil e como atribuir.

## Instalar

Descompacte a pasta `aviso-entrega` em um destes lugares:

- **No repositório dos módulos** — `<repositório>/.claude/skills/aviso-entrega/`.
  O comando aparece quando o Claude Code é aberto na raiz desse repositório, e
  vale para todos que trabalham nele.
- **Só para você, em qualquer projeto** — `C:\Users\<você>\.claude\skills\aviso-entrega\`
  (no Mac ou Linux, `~/.claude/skills/aviso-entrega/`).

Recebeu uma versão anterior? Apague a pasta antiga e ponha esta no lugar.

Abra uma conversa nova no Claude Code: o `/aviso-entrega` aparece no menu de
comandos.

## Precisa ter

- **Claude Code** (terminal ou o app).
- **Node 22** ou mais novo.
- **Edge ou Chrome** instalado — é com ele que o PDF é gerado. Em outro lugar que
  não o de sempre, aponte o executável na variável `AVISO_NAVEGADOR`.
- **Internet** na hora de gerar o PDF, por causa das fontes.
- Módulos da SDK do portal GIA (`@gia-cb`): uma pasta por módulo, com
  `src/module.ts`, `src/permissions.ts` e, de preferência, `CHANGELOG.md`, `PRD.md`
  e `INTEGRATION.md`.

## Usar

```text
/aviso-entrega dashboard-contas
/aviso-entrega Dashboard de Contas
/aviso-entrega tramites dossies
/aviso-entrega
```

O módulo pode vir pelo id, pelo nome do menu ou por um pedaço dele; sem nada, vale
o módulo da conversa. A skill lê o código, **pergunta quem recebe cada
permissão** (sugerindo os públicos já usados) e salva HTML e PDF em
`entregas/<data>/`, na raiz do repositório. Ela só age quando chamada.

## O que mudou da versão 2

- Seção nova **Permissões por perfil**, logo depois da tabela de permissões: cada
  perfil (Diretores, Gerentes, Suporte…) com todas as chaves que deve receber,
  módulo a módulo — a tabela vista ao contrário, para quem marca as chaves de um
  grupo de uma vez. Ela sai da tabela pelo script novo `perfis.mjs`, e o
  `conferir.mjs` acusa quando as duas não batem.
- Público novo no registro: **Suporte**.

## O que mudou da versão 1

- Pergunta a quem está usando, e não a uma pessoa fixa.
- O responsável vem do aviso anterior do módulo; sem aviso anterior, é perguntado.
- Acha o módulo em qualquer repositório de módulos da SDK, inclusive num
  repositório que é o próprio módulo, e pelo nome do menu.
- O caminho do menu vem da tabela do `AGENTS.md`, do `INTEGRATION.md` ou do
  manifesto, nessa ordem.
- O PDF sai também no Mac e no Linux.
