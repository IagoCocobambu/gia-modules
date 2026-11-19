# Q-01 — StatCard do SDK × barra de indicadores dos módulos

| | |
| --- | --- |
| Módulo | `dashboard-simphony` — Dashboard Simphony |
| SDK usado | `@gia-cb/*` `0.1.0-alpha.71` |
| Data | 19/11/2026 |
| Para | Equipe de desenvolvimento do SDK / Portal GIA |
| Situação | aberto |
| Bloqueia o módulo? | não — há solução provisória (seção 6) |

## 1. Contexto

O Dashboard Simphony mostra, para uma loja e um dia de negócio, seis totais do dia
(venda líquida, pessoas, contas, descontos, estornos e cancelamentos) acima de uma
tabela (mix de vendas e funcionários). É uma tela só de leitura.

## 2. O que precisamos

Uma faixa de totais no alto da tela que:

- mostre de 4 a 8 números (R$ e quantidades) com ícone, valor e rótulo curto;
- ocupe pouca altura, para sobrar espaço para a tabela em monitor de 1366 × 768;
- explique a conta de cada número (dica com mouse; no toque, sem dica);
- em telas de relatório, filtre a tabela ao clicar num total (não é o caso deste
  módulo, mas é o dos fechamentos);
- com muitos totais, mostre os principais e abra o resto por um botão.

## 3. Onde procuramos

| Onde | O que encontramos | Por que não serve (ou a dúvida) |
| --- | --- | --- |
| `@gia-cb/ui` `0.1.0-alpha.71` — `dist/stat-card/index.d.ts` | `StatCard` (`icon`, `iconColor`, `value`, `label`), “card de estatística pro Dashboard” | Serve para este módulo, mas: ocupa ~96 px por card no desktop; `iconColor` em cores fixas (`blue`, `amber`, `rose`…), não nos tons do tema (`success`, `warning`, `destructive`); sem dica, sem estado de filtro (`aria-pressed`), sem carregamento por card. |
| `@gia-cb/ui` — `dist/index.d.ts` | Nenhuma “barra de indicadores” ou grupo de `StatCard` | — |
| `dev-shell/docs/conventions.md` e `api-reference.md` | Nada sobre quando usar `StatCard` em tela de relatório | A doc não diz se o `StatCard` é para todo total de tela ou só para a home/dashboard. |
| Outros módulos do workspace | `BarraIndicadores` (padrão 3 do `AGENTS.md` do workspace) em `fechamento-ifood-mensal` e `fechamento-99food-mensal`; o mesmo visual em `ResumoCards` no `fechamento-ifood-diario`, `fechamento-maestro` e `pagamento-echeck` | Componente próprio dos módulos porque o SDK não tinha a barra; o padrão manda trocar pelo do SDK quando houver equivalente. As cópias já divergem entre si. |

## 4. Impacto

- Sem uma direção, cada módulo escolhe: uns com `StatCard`, outros com a barra
  copiada. As telas de totais ficam diferentes entre si.
- A barra copiada vive em vários módulos; correção numa cópia não chega às outras.
- Se o `StatCard` for o caminho para tudo, as telas de fechamento perdem altura
  para a tabela e o filtro pelo card.

## 5. Propostas

Artefato com as opções para este módulo:
`docs/artefatos/totais-propostas.html`.

- **A** — `StatCard` como o SDK entrega, 6 cards em grade (~210 px).
- **B** — `StatCard`, 4 à vista + “Ver todos” montado no módulo (~100 px).
- **C** — `StatCard`, os 6 numa linha (~100 px, só em tela larga).
- **D** — barra de indicadores do workspace, 4 à vista + “Ver todos os totais” (~58 px).
- **E** — barra de indicadores, os 6 à vista (~100 px).

## 6. Solução provisória no módulo

A proposta escolhida pelo usuário em `totais-propostas.html` (registrada no
`docs/conceito.md`, seção 8). Se for a barra (D/E), é a cópia idêntica da
referência (`fechamento-ifood-mensal/src/components/BarraIndicadores.tsx`); trocar
depois por um componente do SDK custa um arquivo e as props da tela. Se for o
`StatCard` (A/B/C), não há o que trocar.

## 7. Perguntas

1. O `StatCard` é o componente indicado para os totais de **toda** tela (inclusive
   relatório e fechamento), ou só para a página inicial/dashboards? (toda tela / só
   dashboard)
2. O SDK vai ter uma **barra de indicadores** compacta (vários totais num contêiner
   só, com dica, filtro por clique e “ver todos”)? (sim, com previsão / não)
3. Se não: o `StatCard` pode ganhar `tom` pelos tokens do tema (`success`,
   `warning`, `destructive`…), um tamanho compacto e `onClick`/`pressed` para
   filtrar? (sim / não)
4. Até a resposta, a barra copiada (padrão 3) é aceitável nos módulos novos?
   (sim / não)

## 8. Resposta

_(preencher quando a equipe responder: data, quem respondeu, decisão, versão do
SDK que resolve)_
