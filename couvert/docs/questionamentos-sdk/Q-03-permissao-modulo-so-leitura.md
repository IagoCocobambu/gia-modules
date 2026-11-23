# Q-03 — Permissão de ação em módulo só de leitura

|                    |                                               |
| ------------------ | --------------------------------------------- |
| Módulo             | `couvert` — Couvert                           |
| SDK usado          | `@gia-cb/*` `0.1.0-alpha.72`                  |
| Data               | 23/11/2026                                    |
| Para               | Equipe de desenvolvimento do SDK / Portal GIA |
| Situação           | aberto                                        |
| Bloqueia o módulo? | não — há solução provisória (seção 6)         |

## 1. Contexto

O Couvert só consulta: mostra as mesas abertas de um salão e confere o couvert. A única
ação que tinha permissão própria era o Exportar, que saiu da tela.

## 2. O que precisamos

Entregar um módulo só de leitura com uma permissão só (`couvert.ler`), sem declarar uma
chave que não libera nada — ela aparece para quem atribui permissões no portal.

## 3. Onde procuramos

| Onde                                                                                                   | O que encontramos                                                                                                                | Por que não serve                      |
| ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| `@gia-cb/cli` `0.1.0-alpha.72` — `gia validate`, "mínimo 2 permissões" e "leitura + escrita separadas" | erro com menos de 2 chaves, ou sem uma terminada em `.editar`, `.criar`, `.salvar`, `.exportar`, `.sincronizar`… (lista fechada) | o módulo não tem nenhuma dessas ações  |
| `dev-shell/docs/delivery-checklists.md` §C.2                                                           | "mín 2 permissões: `.ler` + `.editar`"; permissão monolítica reprova o pacote                                                    | não diz o que fazer em módulo sem ação |
| Outros módulos só de leitura do workspace                                                              | usam `.exportar`, porque exportam                                                                                                | o Couvert não exporta                  |

## 4. Impacto

Sem a chave, o `gia validate` fica vermelho e o módulo não pode ser empacotado. Com uma
chave sem efeito, o gestor pode atribuí-la achando que libera algo.

## 5. Propostas

- **A** — O `gia validate` aceitar só `.ler` em módulo sem handler que grava e sem ação
  (declarado no manifesto, ex.: `somenteLeitura: true`).
- **B** — Aceitar como segunda chave uma leitura mais restrita (ex.:
  `couvert.ver-conta`), para separar quem vê valores e garçom.

## 6. Solução provisória no módulo

`couvert.exportar` continua em `src/permissions.ts`, com a descrição "Reservada — hoje
não libera nada na tela (não precisa atribuir)". Nenhum código a consulta. Trocar ou
tirar é mudar esse arquivo e o INTEGRATION.

## 7. Perguntas

1. Módulo só de leitura pode ser entregue com uma permissão só? (sim / não)
2. Se não, qual chave devemos declarar?
3. Até lá, a solução provisória (seção 6) é aceitável?

## 8. Resposta

_(preencher quando a equipe responder: data, quem respondeu, decisão, versão do SDK
que resolve)_
