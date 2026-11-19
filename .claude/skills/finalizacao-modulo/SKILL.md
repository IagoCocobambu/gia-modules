---
name: finalizacao-modulo
description: Revisa um módulo do portal GIA (SDK @gia-cb) contra as regras do SDK instalado e dos AGENTS.md do workspace — lidas na hora, das próprias fontes —, corrige as incongruências, roda o gia validate, sobe a versão, empacota (gia pack) e escreve o resumo da entrega em docs/<timestamp>-<modulo>-resumo-entrega.txt. Use quando o usuário chamar /finalizacao-modulo <modulo> ou pedir "finaliza o módulo X", "revisa o X contra a SDK e empacota", "confere e empacota o X".
argument-hint: <modulo>
---

# Finalização de um módulo GIA

O módulo vem no comando: **$ARGUMENTS**. Pode ser o id (`fechamento-maestro`), o
nome do menu (`Fechamento Maestro`) ou um pedaço (`maestro`). Sem argumento, use o
módulo em que a conversa está trabalhando; se não houver um claro, liste e pergunte.

Fale e pergunte sempre em **português**. O resultado são três coisas: o módulo
corrigido, o `.tgz` novo e o resumo `.txt`.

## Princípio: as regras vêm das fontes, não desta skill

Esta skill **não traz regra nenhuma** do SDK nem dos padrões do workspace. O SDK
muda de versão e os padrões crescem; o que vale é o que está escrito **agora**:

1. **Docs do SDK instalado no módulo** — `<modulo>/node_modules/@gia-cb/dev-shell/docs/*.md`
   (da versão que o módulo usa, não de outro módulo).
2. **`AGENTS.md` da raiz** do repositório (padrões do workspace) e **`AGENTS.md`
   do módulo**. Em conflito, valem o do módulo e as docs do SDK.
3. **Memória do projeto** — decisões de negócio do módulo. Decisão registrada
   **não é incongruência**.
4. **`gia validate`** — o que ele cobra é o mínimo.

Nunca aponte uma incongruência sem citar a fonte (arquivo e seção/linha). Se a
lembrança de uma regra não estiver escrita nas fontes, ela não vale.

## Arquivos da skill

Na pasta desta skill (o diretório-base mostrado quando ela carrega):

- `scripts/levantar.mjs <modulo>` — roda da **raiz do repositório dos módulos**.
  Resolve o módulo e mostra o estado dele (versões em cada arquivo e se divergem,
  se a versão atual já foi empacotada, avisos de entrega, resumos anteriores,
  versão do `@gia-cb/*` pedida × instalada × dos outros módulos) e o **índice das
  fontes das regras**: cada doc do SDK instalado e cada `AGENTS.md`, com linhas e
  títulos de seção. Sem argumento, lista os módulos; com mais de um candidato, sai
  com código 2 e a lista — pergunte qual.
- `references/resumo-modelo.md` — o formato do resumo `.txt`.

## Roteiro

### 1. Levantar

1. `node "<pasta da skill>/scripts/levantar.mjs" <modulo>` na raiz do repositório.
   Se as docs do SDK não aparecerem, rode `npm install` na pasta do módulo antes.
2. Se a versão do `@gia-cb/*` do módulo diferir da instalada ou da dos outros
   módulos, anote. **Não** atualize o SDK por conta própria — pergunte.
3. Leia o `CHANGELOG.md`, o `PRD.md`, o `INTEGRATION.md`, o **último resumo** em
   `docs/` (tom e pendências que já existiam) e as memórias do módulo.

### 2. Montar a lista de regras a partir das fontes

Pelo índice do levantamento, leia as fontes e monte **nesta conversa** a lista de
conferência, cada item com a sua fonte (`conventions.md §X`, `AGENTS.md padrão N`…):

- leia **inteiros** os docs que se apresentam como contrato e checklist de entrega
  (pelos títulos no índice) e os dois `AGENTS.md`;
- dos demais docs (referência de API, empacotamento, dados externos…), leia as
  seções que tocam no que o módulo usa — veja os imports e a estrutura do módulo
  para saber quais;
- descarte o que não se aplica ao módulo (ex.: regra de migration num módulo sem
  banco; padrão de abas numa tela sem abas) e diga por quê;
- os `AGENTS.md` costumam apontar uma **implementação de referência** para cada
  padrão — use-a para comparar.

Para um módulo grande, a leitura do código pode ser dividida em subagentes
`Explore` por área (telas, server, docs), passando a eles a lista montada com as
fontes. A decisão de corrigir é sua.

### 3. Revisar

1. `npm run validate` na pasta do módulo, para ter a base.
2. Confira o código, a FAQ, o tour e os documentos do módulo contra cada item da
   lista. Confirme cada achado no código antes de tratá-lo como erro.
3. Confira também a coerência interna: as versões em todos os arquivos (o
   levantamento mostra), e FAQ/tour/PRD/INTEGRATION descrevendo o que a tela faz
   hoje.

### 4. Separar: corrigir sozinho × perguntar

**Corrija sem perguntar** o que é forma ou contrato e não muda o que o usuário vê
nem o resultado (estilo, import, tipagem, documentação desatualizada, versão
divergente entre arquivos…).

**Pergunte antes** (AskUserQuestion, até 4 perguntas, opção recomendada primeiro)
quando a correção:

- muda regra de negócio, número, total ou o que a tela mostra de forma visível;
- mexe em banco, migration, permissão ou versão do SDK;
- contraria uma decisão registrada na memória ou no PRD;
- é grande (refatoração de várias telas) — ofereça fazer agora ou deixar como
  pendência no resumo.

Se nada precisar de correção, diga e pergunte se ainda quer empacotar (sem
mudança não há motivo para versão nova).

### 5. Corrigir e validar

1. Aplique as correções, seguindo as implementações de referência das fontes.
2. Atualize FAQ, tour, PRD e INTEGRATION quando a correção mudar algo que eles
   descrevem, respeitando o que as fontes dizem sobre o conteúdo deles.
3. `npm run format` e `npm run validate` na pasta do módulo, **até 0 erros**
   (avisos: corrija ou explique no resumo).
4. Teste no `gia dev` o que a correção tocou, se der, seguindo as regras de teste
   das fontes (onde se pode gravar dado, viewports). O que não foi testado vai no
   resumo como "falta conferir".

### 6. Versão

Siga a memória do projeto sobre versão antes de empacotar e a regra de SemVer do
doc de empacotamento do SDK. Em resumo do fluxo combinado: versão já empacotada →
sobe; módulo ainda não entregue → **pergunte** se sobe ou regera. Atualize todos os
arquivos que o levantamento lista com versão e crie a entrada nova no
`CHANGELOG.md`, no formato das anteriores. Rode o `levantar.mjs` de novo: as
versões têm de bater.

### 7. Empacotar

Na pasta do módulo: `npm run pack`, com a validação ligada. Depois confira o pacote
contra o que o doc de empacotamento diz que entra e que não entra, e anote tamanho
(kB, com vírgula) e número de arquivos:

```bash
ls -l modules-<id>-<versão>.tgz
tar tzf modules-<id>-<versão>.tgz | wc -l
tar tzf modules-<id>-<versão>.tgz
```

### 8. Resumo `.txt`

Siga `references/resumo-modelo.md`. Arquivo:
`<modulo>/docs/$(date +%Y%m%d%H%M%S)-<id>-resumo-entrega.txt`. Cada incongruência
corrigida leva a fonte da regra.

### 9. Fechar

Responda curto: a versão nova, a versão do SDK e as fontes lidas, as
incongruências achadas e corrigidas (as principais), o que ficou como pendência ou
pergunta, o resultado do validate e os links para o `.tgz` e o resumo. **Não**
gere o aviso de entrega (só quando o usuário pedir `/aviso-entrega`) e **não**
faça commit.
