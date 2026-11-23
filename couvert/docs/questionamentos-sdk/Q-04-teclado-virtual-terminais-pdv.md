# Q-04 — Teclado virtual nos terminais de PDV (Oracle MICROS)

|                    |                                                                   |
| ------------------ | ----------------------------------------------------------------- |
| Módulo             | `couvert` — Couvert                                               |
| SDK usado          | `@gia-cb/*` `0.1.0-alpha.72`                                      |
| Data               | 23/11/2026                                                        |
| Para               | Equipe de desenvolvimento do SDK / Portal GIA                     |
| Situação           | aberto                                                            |
| Bloqueia o módulo? | não — os campos são de texto comuns; falta conferir nos aparelhos |

## 1. Contexto

O Couvert é usado no salão, em terminais de toque sem teclado físico (Oracle MICROS
Workstation 610, 625 e 8). Nos filtros há três lugares de digitar: a busca dentro da
lista de Loja, a busca dentro da lista de RVC (`SearchableSelect`) e a busca Mesa
(`IconInput`).

## 2. O que precisamos

Ao tocar num campo de digitar, o teclado na tela aparece, nos três modelos.

## 3. Onde procuramos

| Onde                          | O que encontramos                                                                | Por que não serve                                                                                                                                                     |
| ----------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@gia-cb/ui` `0.1.0-alpha.72` | nenhum teclado na tela; o `IconInput` repassa as props do campo                  | depende do teclado do sistema                                                                                                                                         |
| `SearchableSelect`            | não repassa props à busca interna; com `(pointer: coarse)` desliga o `autoFocus` | mesmo assim o popover (Radix) põe o foco na busca ao abrir, por script (conferido com toque emulado): o sistema pode não abrir o teclado até o usuário tocar no campo |
| `dev-shell/docs/*.md`         | nada sobre teclado virtual nem sobre terminais de PDV                            | —                                                                                                                                                                     |
| Outros módulos do workspace   | nenhum trata o tema                                                              | —                                                                                                                                                                     |

Os terminais podem ter Windows IoT Enterprise ou Oracle Linux. No Windows, quem abre o
teclado é o sistema, conforme a configuração dele e o navegador; a página não o força.

## 4. Impacto

Todo módulo do portal usado nesses terminais tem o mesmo problema.

## 5. Propostas

- **A** — `SearchableSelect` sem foco automático na busca em tela de toque
  (`onOpenAutoFocus` com `preventDefault`), para o toque do usuário abrir o teclado.
- **B** — Repassar `inputMode` e `virtualKeyboardPolicy` à busca do `SearchableSelect`.
- **C** — Um teclado na tela do portal, para aparelhos em que o do sistema não abre.

## 6. Solução provisória no módulo

Nenhuma mudança: aguarda o teste nos aparelhos. A busca não é obrigatória para escolher
loja ou RVC (a lista rola).

## 7. Perguntas

1. O portal é usado hoje nesses terminais? Com que sistema e navegador?
2. O SDK vai adotar **A** e **B**?
3. Um teclado na tela (**C**) seria do portal ou de cada módulo?

## 8. Resposta

_(preencher quando a equipe responder: data, quem respondeu, decisão, versão do SDK
que resolve)_
