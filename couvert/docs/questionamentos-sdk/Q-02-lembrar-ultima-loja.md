# Q-02 — Lembrar a última loja escolhida pelo usuário entre acessos

|                    |                                               |
| ------------------ | --------------------------------------------- |
| Módulo             | `couvert` — Couvert                           |
| SDK usado          | `@gia-cb/*` `0.1.0-alpha.71`                  |
| Data               | 19/11/2026                                    |
| Para               | Equipe de desenvolvimento do SDK / Portal GIA |
| Situação           | aberto                                        |
| Bloqueia o módulo? | não — há solução provisória (seção 6)         |

## 1. Contexto

No Couvert, o gerente abre a tela várias vezes por turno para conferir as mesas do
mesmo salão. A tela não pesquisa sozinha; ela deve abrir com a loja e o salão que o
usuário consultou da última vez já escolhidos, para ele só clicar em Pesquisar.

## 2. O que precisamos

Guardar, **por usuário**, a última loja (id da Empresa) e o último salão consultados,
e ler esses valores ao abrir a tela, inclusive depois de recarregar a página ou entrar
em outro dia. É preferência de tela: nenhum dado de negócio; se a loja saiu do escopo
do usuário, a tela ignora o valor guardado.

## 3. Onde procuramos

| Onde                                                     | O que encontramos                                                                                                     | Por que não serve (ou a dúvida)                                                                         |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `dev-shell/docs/conventions.md` §"Persistência"          | `localStorage` proibido para estado de negócio; permitido para preferências de UI "via `@gia-cb/ui` quando aplicável" | não diz se "última loja" é preferência de UI                                                            |
| `@gia-cb/cli` `0.1.0-alpha.71` — regra do `gia validate` | qualquer `localStorage.` / `sessionStorage.` em `src/` é **erro**                                                     | não há como usar direto, nem para preferência                                                           |
| `@gia-cb/sdk` `0.1.0-alpha.71` — `dist/state/index.d.ts` | `createPersistedStore` (Zustand + localStorage), "para preferências do usuário que devem sobreviver a refresh"        | o comentário diz "Default na decisão G.6: SÓ theme persiste no v1" — não fica claro se módulo pode usar |
| Outros módulos do workspace                              | `validacao-fiscal/src/hooks/memoriaDaPesquisa.ts` guarda a pesquisa **só em memória** (F5 limpa)                      | não atende "ao acessar a página" depois de recarregar                                                   |

## 4. Impacto

Sem uma resposta, cada módulo resolve de um jeito: só em memória (o usuário perde a
escolha ao recarregar), `createPersistedStore` (que talvez não seja liberado) ou uma
tabela própria de preferências (o módulo passa a gravar só por isso).

## 5. Propostas

- **A** — Liberar o `createPersistedStore` para preferências de tela dos módulos, com
  a regra de prefixar a chave com o id do módulo e do usuário.
- **B** — Um hook do SDK de preferência por usuário guardada no banco do portal
  (ex.: `usePreferencia('couvert', 'ultimaLoja')`), que vale em qualquer aparelho.
- **C** — Uma "loja ativa" do portal, escolhida no shell e lida por todos os módulos.

## 6. Solução provisória no módulo

`createPersistedStore` do `@gia-cb/sdk/state`, com nome `couvert:ultima-pesquisa:<id
do usuário>`, guardando só `{ empresaId, rvc }`. Ao abrir, a tela confere se a Empresa
continua no escopo; senão, abre sem loja. Fica num arquivo só (`src/hooks/`); trocar
pela resposta custa mudar esse arquivo.

## 7. Perguntas

1. Módulo pode usar `createPersistedStore` para preferência de tela como esta? (sim / não)
2. Se não, o SDK vai oferecer a **B** ou a **C**? (previsão)
3. Até lá, a solução provisória (seção 6) é aceitável?

## 8. Resposta

_(preencher quando a equipe responder: data, quem respondeu, decisão, versão do SDK
que resolve)_
