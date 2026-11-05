# Reports Maestro — changelog da sessão de 04/11/2026

Tudo o que foi feito no módulo `reports-maestro` nesta sessão, na ordem em que
aconteceu. Versão do pacote: **0.2.0 → 0.3.0**. Nada foi commitado nem empacotado
(`gia pack`) ainda.

Estado final: `gia validate` **57/57, 0 erros, 0 avisos**.

---

## 1. Seletor de loja: todas as lojas com CNPJ

**Antes:** o seletor listava só as Empresas com número de loja no cadastro
(no vínculo `locRefs.BIAPI` ou no começo do nome).

**Agora:** lista **todas as Empresas do escopo com `tipoRegistro === 'empresa'`**
(a loja, com CNPJ), como manda a doc do SDK (alpha.68). Propriedades (escritório,
centro de distribuição, sem CNPJ próprio) ficam de fora.

- Loja com CNPJ e **sem número de loja** aparece no seletor; ao pesquisar, o
  handler responde 422 avisando que falta o número no cadastro.
- `locRef` passou a ser `string | null` na resposta do handler `lojas`.

Arquivos: `src/server/lojas.ts`, `src/types.ts`, `src/faq.ts` (seção _De onde vêm
os dados_ + 1 pergunta nova), `PRD.md` (v1.3), `INTEGRATION.md`.

## 2. Análises (sem mudança de código)

- **Comparação com o `dashboard-contas`**: lá o seletor é de **operações**
  (`ctx.operacoes()`, um `loc_ref` por item, com RPC de rede para `ler-rede`); aqui
  é de **Empresas**. Conclusão: para "lojas com CNPJ", o padrão do reports-maestro
  é o recomendado pelo SDK.
- **Nome da empresa 64**: a diferença entre os módulos vinha dos **dados simulados**
  do `gia.config.ts` (o do reports-maestro foi escrito à mão, com `id` = número da
  loja; o do dashboard-contas foi copiado do cadastro de homologação). Em produção
  o nome vem do cadastro real. _Pendente:_ trocar a lista `empresas` do
  `gia.config.ts` pela de homologação.

## 3. Análise dos gargalos operacionais

Documento: [`docs/gargalos-operacionais-delivery.md`](gargalos-operacionais-delivery.md).

1. **Primeira versão:** feita com as amostras sem histórico (lojas 08 e 54). Achado
   principal: a _Data ação_ é sempre igual à _Data criação_ — sem histórico não dá
   para medir tempo.
2. **Segunda versão:** a API foi consultada de novo com `incluir_historico=true`.
   Cada pedido passou a trazer `historico_status` (status, horário, quem fez,
   sistema de origem), e a análise foi refeita com o tempo de cada etapa.
   Achados: o preparo é o principal gargalo de tempo; ~20% das entregas nunca
   entram no app de entrega; o status atual engana (baixas fora de ordem e em lote);
   o histórico mostra quem cancelou (`CONSUMER` × `STORE`).

> A primeira versão foi **sobrescrita** pela segunda e não estava no git — só a
> versão com histórico existe. Foi isso que motivou a regra do item 4.

## 4. AGENTS.md — regra para documentos Markdown

Nova seção **4. Documentos Markdown pedidos pelo usuário**:

- Nome `<ano><mes><dia><hora><minuto><segundo>-<modulo>-<tema>.md`, na pasta
  `docs/`.
- **Nunca sobrescrever** um documento — nova versão vira arquivo novo.
- Não vale para os arquivos de nome fixo (`PRD.md`, `README.md`, `AGENTS.md`,
  `INTEGRATION.md`).

_Pendente:_ `docs/gargalos-operacionais-delivery.md` é anterior à regra e ainda
está com o nome antigo.

## 5. Dashboard Operacional (pacote 0.3.0)

Nova aba **Operacional** ao lado de **Pedidos**, com a mesma loja e o mesmo
período da pesquisa. Decisões tomadas com o usuário: aba na tela atual; permissão
`reports-maestro.ler`; uma loja por vez.

### 5.1 Servidor

- **Handler novo `src/server/operacional.ts`**: chama `/Delivery/` com
  `incluir_historico=true` e devolve **um resumo por pedido, sem dado do cliente**
  (canal, retirada, hora de criação, valor, desfecho, minutos de cada etapa, quem
  cancelou). Checa `reports-maestro.ler` e o escopo da Empresa; timeout de 90 s.
- Desfecho calculado **pelo histórico**, não pelo status atual (que é só o último
  evento).
- Medido no `gia dev`: loja 54 (out/26) em 27 s; loja 01 (out/26) em 42 s; loja
  08 (mai/26) em 42–53 s. Resposta de ~460 a ~690 KB.
- Testado: sem permissão → 403; loja fora do escopo → 403; período acima de 31
  dias → 422.

### 5.2 Tela

- `src/components/AbasDoReports.tsx` — abas Pedidos | Operacional.
- `src/views/ReportsMaestroView.tsx` — **cada aba só busca quando está aberta**
  (a lista de pedidos também passou a buscar só com a aba Pedidos aberta), troca
  de aba com transição de fade, e o botão de rever o tour volta para Pedidos.
- `src/api/reports-maestro.ts` — hook `useOperacionalReportsMaestro`; o
  `usePedidosReportsMaestro` ganhou o parâmetro `enabled`.

### 5.3 Base visual copiada do `dashboard-contas`

Gráficos em SVG próprio com os tokens do tema (sem biblioteca de gráfico).
Copiados e adaptados:

- `src/graficos.ts` (só cores, escala e desenho de barra)
- `src/hooks/use-tamanho.ts`, `use-entrada.ts`, `use-cortado.ts`
- `src/components/graficos/`: `DicaGrafico`, `BarrasRanking`, `PaginacaoGrafico`,
  `paginar`, `contexto-grafico`, `MolduraGrafico` (tela cheia + **tabela dos
  números** em tela cheia, no lugar do download em Excel)

Novos: `CartaoIndicador`, `TabelaDoGrafico`, `BarrasEtapas`, `MapaDeCalor`.

### 5.4 Primeira versão (substituída)

Tinha filtro de prazo (45/60/90 min), seis cartões e as seções Onde o tempo vai,
Quando trava (com Dia a dia), Canais, Cancelamentos (quem e em que etapa) e
Qualidade da baixa. Números conferidos contra a análise das lojas 08 e 54.

## 6. Dashboard enxuto (correção)

**Problema relatado:** na loja **01 (01 a 31/10/2026)** muitos componentes vinham
vazios.

**Causa:** a loja 01 não teve **nenhum** pedido com o registro _Entregue_ —
2.743 pedidos param em _Despachado_; o app de entrega dela não registra no
Maestro. Quase tudo dependia desse registro.

**Correção — só o necessário, e só o que toda loja tem:**

- **Ficou:** filtro de canal; cartões de tempo na loja (Recebido → Despachado),
  preparo e cancelados; tempo por etapa; quem cancelou; mapa de calor.
- **Só quando a loja tem entrega registrada:** cartão de tempo até a entrega, rota
  no tempo por etapa e a linha de "entregas sem entrega registrada". Sem o dado, uma
  linha explica que o Maestro da loja para em _Despachado_ — nenhum cartão vazio.
- **Saiu:** seletor de prazo e "O que atrasou" (dependiam do tempo até a entrega),
  Dia a dia, os dois gráficos por canal, "Em que etapa foi cancelado" e a seção
  Qualidade da baixa.
- **Retiradas ficam fora dos tempos** (outro fluxo: na loja 01, preparo de 8 min
  contra 19 min da entrega).
- Removidos: `LinhasNoTempo.tsx`, funções de eixo sem uso, e os campos
  `entregueEm`, `retornou` e `etapaAnterior` da resposta do handler.

Resultado na loja 01: tempo na loja com mediana de 31 min, e 90% até 54 min;
preparo com mediana de 19 min, e 90% até 33 min; 46 cancelados (R$ 8,9 mil).

## 7. Tempo por etapa — mínimo, média, mediana e máximo

1. Primeiro virou **tabela** com os quatro valores e uma barra da mediana.
2. A pedido do usuário, **voltou o desenho em barras**, com os quatro valores em
   cores e formas próprias:
   - **mediana** = barra azul;
   - **média** = traço vertical laranja;
   - **mínimo → máximo** = linha verde-azulada com uma bolinha em cada ponta.
   - Números escritos à direita ("19 min · média 21 min" / "mín 0,6 min · máx
     13h 02").
   - A régua vai até 3× a maior média/mediana; máximo além dela termina em
     **seta** (o máximo é quase sempre um pedido esquecido — 13 h de preparo na
     loja 01).
   - Cores validadas com o `validate_palette.js` nos temas claro e escuro (pior
     par sob daltonismo ΔE 14,8; contraste ≥ 3:1).
   - Valores abaixo de 10 min com uma casa (`0,6 min`).

Arquivos: `src/components/graficos/BarrasEtapas.tsx`, `src/graficos.ts`,
`src/operacional.ts` (`estatisticasDasEtapas`, `fmtMinPreciso`). Removido:
`TempoPorEtapa.tsx`.

## 8. Mapa de calor — por dia da semana ou por dia

- Seletor novo **Por dia da semana | Por dia**, ao lado de Tempo na loja | Preparo
  | Pedidos.
- **Por dia da semana:** só os dias da semana que existem no período (04 a 06/10 →
  Seg, Ter, Dom).
- **Por dia:** uma linha por data do período pesquisado (Dom 04/10, Seg 05/10…),
  nunca o mês inteiro.
- Mínimo de entregas medidas para a célula mostrar tempo: 5 por dia da semana, **3
  por dia**.
- A coluna de rótulos acompanha o maior nome.

Arquivos: `src/operacional.ts`, `src/components/graficos/MapaDeCalor.tsx`,
`src/components/operacional/AbaOperacional.tsx`.

## 9. Documentação do módulo

Mantida em dia a cada etapa:

- `src/faq.ts`: seção **Dashboard Operacional**, categoria de perguntas própria
  (10 perguntas, incluindo média × mediana, loja sem entrega registrada, retiradas e
  mapa por dia) e resumo atualizado.
- `src/tour.ts`: passo novo nas abas.
- `PRD.md`: v1.4 — RF-6, RN-8, tela, fluxo C5, integração e histórico.
- `INTEGRATION.md`: versão 0.3.0, SDK alpha.68, handler `operacional` e regra do
  seletor de lojas.
- `src/module.ts` e `package.json`: versão 0.3.0.

---

## Pendências

- [ ] Conferir a aba Operacional no dev-shell em **mobile, tablet e desktop** — a
      tela não foi vista renderizada nesta sessão.
- [ ] `gia pack` para gerar o pacote 0.3.0 (regenera a Edge Function).
- [ ] Commit das mudanças.
- [ ] Trocar a lista `empresas` do `gia.config.ts` pela do cadastro de homologação.
- [ ] Renomear `docs/gargalos-operacionais-delivery.md` para o padrão do AGENTS.md.
- [ ] Confirmar com o time do Maestro/DW e a operação os pontos abertos da análise
      (por que ~20% das entregas não entram no app de entrega; se a loja 01 deveria
      registrar a entrega).
- [ ] Decidir se o prazo de entrega volta (só para lojas com entrega registrada).

> Observação: o `gia.config.ts` já estava modificado antes desta sessão (alteração
> de comentário) e não foi mexido aqui.
