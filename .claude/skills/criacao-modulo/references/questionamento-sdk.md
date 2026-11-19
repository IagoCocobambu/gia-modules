# Q-<nn> — <tema em uma linha>

| | |
| --- | --- |
| Módulo | `<id>` — <Nome do menu> |
| SDK usado | `@gia-cb/*` `<versão>` |
| Data | dd/mm/aaaa |
| Para | Equipe de desenvolvimento do SDK / Portal GIA |
| Situação | aberto |
| Bloqueia o módulo? | não — há solução provisória (seção 6) / **sim** — por quê |

## 1. Contexto

O que o módulo faz e em que tela/fluxo o tema aparece (2–4 frases, sem dado de
loja, credencial ou nome interno de terceiros).

## 2. O que precisamos

A necessidade, descrita pelo comportamento (o que o usuário vê/faz), não pela
implementação.

## 3. Onde procuramos

| Onde | O que encontramos | Por que não serve |
| --- | --- | --- |
| `@gia-cb/ui` `<versão>` — `dist/<componente>/*.d.ts` | | |
| `@gia-cb/sdk` `<versão>` — `dist/index.d.ts` | | |
| `dev-shell/docs/<arquivo>.md` §… | | |
| Outros módulos do workspace | | |

## 4. Impacto

O que acontece com o módulo (e com outros módulos que têm a mesma necessidade)
sem uma resposta: componente copiado em cada módulo, comportamento diferente
entre telas, risco de segurança, etc.

## 5. Propostas

Artefato com as opções: `docs/artefatos/<peca>-propostas.html` (se houver).

- **A** — …
- **B** — …

## 6. Solução provisória no módulo

O que faremos até a resposta, onde fica no código e quanto custa trocar quando o
SDK tiver a peça.

## 7. Perguntas

1. O SDK vai oferecer … ? (sim / não / previsão)
2. Se sim, a API seria parecida com a proposta **A** ou **B**?
3. Até lá, a solução provisória (seção 6) é aceitável?

## 8. Resposta

_(preencher quando a equipe responder: data, quem respondeu, decisão, versão do
SDK que resolve)_
