# Reports Maestro — changelog da sessão de 04 e 05/11/2026

Continuação do [changelog de 04/11/2026](20261104170308-reports-maestro-changelog.md).
Tudo o que foi feito no módulo `reports-maestro` nesta sessão, na ordem em que
aconteceu. A versão do pacote continua **0.3.0** (não foi alterada). Nada foi
commitado nem empacotado (`gia pack`) ainda.

Estado final: `gia validate` **57/57, 0 erros, 0 avisos**.

Ao longo da sessão, as propostas visuais foram feitas como páginas de comparação
em [`docs/artefatos/`](artefatos/), e o usuário escolheu uma delas antes de cada
implementação.

---

## 1. Tempo por etapa — um cartão por etapa

**Antes:** barras numa régua única (mediana em barra, média em traço, mínimo →
máximo em linha), com o aceite (segundos) espremido ao lado do preparo (minutos).

**Propostas:** cinco formas comparadas em
[`artefatos/tempo-por-etapa-propostas.html`](artefatos/tempo-por-etapa-propostas.html)
(escala logarítmica, mediana × média, jornada empilhada, cartões, box plot). O
usuário escolheu **um cartão por etapa**.

**Evolução, a pedido do usuário:**

1. Cartão com o número grande, os demais valores escritos e uma régua própria por
   cartão. Sem selo de "média muito acima da mediana" (o usuário preferiu sem aviso).
2. O número grande passou a ser a **média** (antes, a mediana); mediana, mínimo e
   máximo ficam escritos embaixo.
3. A régua virou uma **barra fina em pedaços**, no formato da barra de uso de
   contexto do Claude Desktop: do zero ao mínimo, até a mediana, até a média e o
   resto até o máximo. Só a barra mudou; a lista de valores ficou igual.
4. Alinhamento: os pedaços passaram a ser uma linha flex com fresta igual entre
   todos, ocupando a largura exata do cartão.
5. A barra **se enche da esquerda para a direita** a cada mudança dos dados (nova
   animação `revelar` no `useAnimarMarcas`: recorte em vez de escala, sem deformar
   os pedaços).
6. O trecho até o máximo deixou de ser cinza e ganhou cor própria.
7. A régua continua indo até 3× a maior entre média e mediana da etapa; o máximo
   além disso fica só escrito.

Arquivos: novo `src/components/graficos/CartoesEtapas.tsx`; removido
`BarrasEtapas.tsx`; `src/hooks/use-entrada.ts` (marca `revelar`); `src/graficos.ts`.

## 2. Formato dos tempos

1. Primeiro: `0h 0m 0s` em todos os tempos do Tempo por etapa (função
   `fmtDuracao`, no lugar de `fmtMinPreciso`).
2. Depois: `0m 0s`, com a hora só quando há; se **um** valor do grupo tivesse
   hora, **todos** do grupo mostrariam a hora.
3. **Final:** cada valor na sua própria forma — a hora só aparece no registro que
   tem hora. Para alinhar, os segundos (e os minutos, quando há hora) têm sempre
   dois dígitos: `0m 06s`, `22m 34s`, `1h 54m 42s`. Com o número à direita e
   dígitos de largura fixa, o `m` e o `s` ficam na mesma coluna.

Vale para o Tempo por etapa, o Quem cancelou e as dicas dos cartões do topo. Os
cartões do topo, o mapa e as linhas seguem em `min` (`fmtMin`).

Arquivo: `src/operacional.ts` (`fmtDuracao`).

## 3. Quem cancelou — rosca com o total no meio

**Antes:** barras horizontais (todas azuis), num card com muito espaço vazio.

**Propostas:** cinco formas em
[`artefatos/quem-cancelou-propostas.html`](artefatos/quem-cancelou-propostas.html)
(barra de participação, cartões, rosca, quando cada um cancela, tabela). O usuário
escolheu a **rosca**.

- Total de cancelamentos no centro, uma fatia por grupo (cliente ou plataforma,
  loja, cliente e loja, não identificado), com fresta entre fatias.
- As fatias **se desenham** a cada mudança dos dados (cada fatia é um arco com
  traço, animado como `linha`).
- Passar o mouse (ou o foco do teclado) numa fatia ou num grupo da lista destaca o
  grupo; a dica repete os números.
- **Valor dos pedidos cancelados por grupo** — número novo, somado no
  `cancelamentosPorQuem`.
- A legenda virou uma **tabela alinhada** (Quem · Qtd. · Do total · Valor · Média
  até cancelar), com as colunas alinhadas entre as linhas (`subgrid`); no cartão
  estreito, cada grupo vira duas linhas.
- A tabela da tela cheia ganhou as colunas Do total e Valor.

Arquivos: novo `src/components/graficos/RoscaCancelamentos.tsx`; removido
`BarrasRanking.tsx` (sem outro uso); `src/operacional.ts`; `src/graficos.ts`.

## 4. Dia × hora do pedido — linhas e mapa de calor

**Propostas:** cinco formas em
[`artefatos/mapa-de-calor-propostas.html`](artefatos/mapa-de-calor-propostas.html).
O usuário escolheu:

- **Por dia da semana → gráfico de linhas** (proposta D): horas no eixo horizontal,
  a métrica no vertical, uma linha por dia da semana e uma linha grossa neutra com
  o dia típico. A legenda é de botões: passar o mouse destaca o dia, clicar fixa. A
  dica, na hora apontada, lista todos os dias. Título do cartão: "Hora do pedido,
  por dia da semana".
- **Por dia → mapa de calor com o número na célula** (proposta A), com os números
  **discretos** (fonte pequena, sem negrito, com transparência). O pior horário
  ganha contorno e é citado na legenda; horário com poucas entregas fica
  **listrado** (antes, cinza liso). Célula estreita demais fica sem número.

**Ajustes no gráfico de linhas, a pedido do usuário:**

1. Hora sem medida **desce até a base** do gráfico, em vez de quebrar a linha; no
   dia destacado, o ponto dessa hora fica vazado e a dica diz "sem medida".
2. **Cada dia com uma cor**; o dia selecionado fica por cima, mais grosso, com um
   halo da própria cor e os pontos, e os outros recuam (com transição).

Arquivos: novo `src/components/graficos/LinhasPorDiaDaSemana.tsx`;
`src/components/graficos/MapaDeCalor.tsx`; `src/graficos.ts`
(`COR_DIA_DA_SEMANA`).

## 5. Uma consulta para as duas abas

**Problema relatado:** pesquisar no Operacional e trocar para Pedidos fazia uma
nova consulta à API.

**Causa:** eram dois handlers (`pedidos` e `operacional`) chamando a mesma API do
DW, e cada aba só buscava quando era aberta.

**Agora:** o handler `pedidos` chama a API **uma vez**, com
`incluir_historico=true`, e devolve a lista de pedidos (com o mascaramento) **e**
o resumo do Operacional (`operacional`). As duas abas leem o mesmo resultado, que
fica 30 min em cache; trocar de aba não busca de novo. O histórico bruto continua
no servidor.

- Removido o handler `src/server/operacional.ts` (a lógica foi para o `pedidos.ts`).
- Efeito no tempo: a aba Pedidos passou a esperar a busca com histórico (até ~45 s
  para 31 dias, antes ~25 s); em troca, a outra aba abre na hora.

Arquivos: `src/server/pedidos.ts`, `src/api/reports-maestro.ts`, `src/types.ts`,
`src/views/ReportsMaestroView.tsx`, `src/components/AbasDoReports.tsx`.

## 6. Operacional como aba principal

- A aba **Operacional** passou a ser a primeira e a que abre por padrão.
- **Exceção:** na primeira visita, com o tour ainda pendente, a tela abre em
  **Pedidos** — os passos do tour apontam para a lista, e o tour do portal some
  quando o alvo não está na tela. Depois de concluir ou pular o tour, sempre abre
  no Operacional. A decisão é tomada uma vez, quando o progresso do tour chega
  (`useTourProgress` + `getPendingStepsForScreen`).
- O passo das abas no tour foi reescrito (Operacional primeiro).

Arquivos: `src/views/ReportsMaestroView.tsx`, `src/components/AbasDoReports.tsx`,
`src/tour.ts`.

## 7. Barra de totais (aba Pedidos)

Os quatro cartões grandes de totais viraram **uma barra só**, no desenho dos
indicadores do Fechamento Diário Maestro (`fechamento-maestro/src/components/ResumoCards.tsx`):
ícone num quadradinho tingido, valor em negrito e rótulo discreto.

- Cores: valor pedido (cor principal), valor entrega (âmbar), total pago (verde),
  desconto total (vermelho só quando há desconto).
- Dica com a conta de cada total; 4 por linha com espaço, 2 no estreito.

Arquivo: `src/components/TotaisCards.tsx`.

## 8. A média como número principal do Operacional

Antes o número de destaque de cada tempo era a mediana. Agora é a **média** em
todo o Operacional:

| Onde            | Agora                                                           |
| --------------- | --------------------------------------------------------------- |
| Cartões do topo | Tempo na loja / Preparo / Até a entrega **(média)** + "90% até" |
| Quem cancelou   | Média até cancelar                                              |
| Mapa "Por dia"  | Média da hora                                                   |
| Linhas por dia  | Média de cada dia; linha grossa = **média dos dias**            |
| Tempo por etapa | Já era a média (a mediana fica como detalhe)                    |

Arquivos: `src/operacional.ts` (função `media`; campos `naLojaMedia`,
`preparoMedia`, `mediaMin`), `AbaOperacional.tsx`, `RoscaCancelamentos.tsx`,
`LinhasPorDiaDaSemana.tsx`, `MapaDeCalor.tsx`.

## 9. Paleta de cores dos dashboards

Uma paleta categórica única, em ordem de uso (`PALETA` em `src/graficos.ts`):
**primárias** (azul, vermelho, amarelo), depois **secundárias** (verde, laranja,
violeta), depois **terciárias** (vermelho-alaranjado, amarelo-alaranjado,
amarelo-esverdeado, azul-esverdeado, azul-violeta, vermelho-violeta). Um gráfico
com N séries usa as N primeiras.

- Tempo por etapa: média azul, mediana vermelho, mínimo amarelo, máximo verde.
- Quem cancelou: cliente azul, loja vermelho, cliente e loja amarelo, não
  identificado verde.
- Dias da semana: segunda azul … domingo vermelho-alaranjado.
- O mapa de calor continua com um tom só (intensidade), em azul.
- A barra de totais e os selos de status/canal da aba Pedidos ficaram fora (cores
  de significado: sucesso, alerta, erro).

## 10. Efeitos de entrada

- **Números contam do zero até o valor** quando aparecem na tela e a cada mudança
  do valor: cartões do topo, Tempo por etapa, Quem cancelou (total no centro e
  legenda) e barra de totais. Inteiros contam de inteiro em inteiro; R$, tempos e %
  passam pelos intermediários já formatados. Duração de ~0,7 s (2× o token
  `--duration-slow`). Com "reduzir movimento", o número aparece pronto. O texto é
  atualizado direto no nó, sem re-render a cada quadro.
- **Mapa de calor:** as células crescem do centro, numa onda da esquerda para a
  direita. Os outros gráficos já cresciam ao aparecer.
- **Correção:** o número voltava a contar ao passar o mouse nos cartões do topo e
  na barra de totais — o `Tooltip` do portal remonta o que embrulha no primeiro
  hover. A dica passou para uma camada invisível por cima do cartão, separada do
  conteúdo.

Arquivos: novos `src/hooks/use-contagem.ts` e
`src/components/graficos/NumeroAnimado.tsx`; `CartaoIndicador.tsx`,
`TotaisCards.tsx`, `CartoesEtapas.tsx`, `RoscaCancelamentos.tsx`,
`MapaDeCalor.tsx`, `AbaOperacional.tsx`.

## 11. Dica dos cartões de tempo

A dica dos cartões Tempo na loja, Preparo e Até a entrega mostra, além da
explicação, o **mínimo**, a **mediana** e o **máximo** (em `0m 00s`). Pedidos e
Cancelados ficam só com a explicação (não são tempos).

Arquivos: `src/operacional.ts` (`Faixa` com mínimo, mediana e máximo),
`CartaoIndicador.tsx` (`valoresDaDica`), `AbaOperacional.tsx`.

## 12. Documentação do módulo

Mantida em dia a cada mudança:

- `src/faq.ts`: textos de cada gráfico, da barra de totais, da aba inicial, da
  consulta única, da média como número principal e das cores.
- `src/tour.ts`: passo das abas (Operacional primeiro, consulta única) e tempo de
  busca corrigido para ~45 s.
- `PRD.md`: descrição de cada gráfico, cores, aba inicial, consulta única e
  integração.
- `INTEGRATION.md`: um handler só (`pedidos`, com histórico), tempos medidos.
- `docs/gargalos-operacionais-delivery.md` **não** foi alterado (documento
  entregue; ainda cita medianas).

---

## Pendências

- [ ] Ver no dev-shell, em **mobile, tablet e desktop**, tudo o que mudou nesta
      sessão — nenhuma tela foi vista renderizada.
- [ ] Pesquisar 31 dias no `npm run dev` e trocar de aba, para confirmar o tempo
      da consulta única e que nenhuma busca nova sai.
- [ ] Decidir a versão do pacote (continua 0.3.0; as mudanças desta sessão
      justificariam uma nova).
- [ ] `gia pack` (regenera a Edge Function, que ainda lista os handlers antigos).
- [ ] Commit das mudanças.
- [ ] Pendências herdadas: trocar a lista `empresas` do `gia.config.ts` pela de
      homologação; renomear `docs/gargalos-operacionais-delivery.md` no padrão de
      data.
