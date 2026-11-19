# Changelog — Reports Maestro

## 0.3.2 — 2026-11-16

Devolutiva da 0.3.1 e revisão contra o SDK e os padrões do workspace.

### Mudado

- **Mapa de calor por dia em verde, amarelo e vermelho** (pedido do usuário): a
  régua é relativa à pesquisa — o intervalo entre o menor e o maior valor do mapa é
  dividido em três partes iguais. Em tempo na loja e preparo, verde é menos tempo e
  vermelho, mais; em **Pedidos** é ao contrário (mais pedidos = verde). A legenda
  mostra o intervalo de cada cor, e o item "Menos de N entregas medidas" só aparece
  quando há célula listrada. Antes era um azul só, do claro ao escuro.
- **Mensagem de erro padrão** (padrão 11 do workspace): erro de consulta nas abas
  Pedidos e Operacional pelo `MensagemErro` (tipo do problema, origem, Tentar de
  novo, Ver detalhes técnicos com Copiar tudo e Baixar diagnóstico), no alto da área.
  Os estados vazios do Operacional sobem para o alto, no mesmo lugar.
- **Totais pela regra das 5 linhas** (padrão 10): fora do celular, os totais da aba
  Pedidos abrem e fecham sozinhos conforme a tabela ainda mostre 5 linhas com eles
  abertos (`useCabemTotais`, mesma conta do Fechamento Maestro 0.4.2), no lugar da
  altura da janela (`innerHeight >= 700`). Depois do clique em Totais vale a escolha
  do usuário até recarregar.
- **Filtros enxutos depois da pesquisa** (padrão 8): fora do celular, com resultado
  na tela, a barra de loja e período vira uma linha só, sem subtítulo nem rótulos
  (campos com `aria-label`). Erro volta à barra completa.
- **Mediana e "90% até" interpolados** (sugestão da devolutiva de 10/11/2026): com
  quantidade par, a mediana é a média dos dois valores do meio, como a FAQ descreve
  — antes pegava o menor dos dois. Os números dos cartões do Tempo por etapa e o
  "90% até" dos cartões de tempo podem mudar alguns segundos.
- SDK `@gia-cb/*` **0.1.0-alpha.71** (era alpha.70); mínima alpha.71.

### Removido

- Código sem uso (sugestão da devolutiva de 10/11/2026): `PaginacaoGrafico.tsx`,
  `paginar.ts` e, em `contexto-grafico.ts`, `usePorPagina`, `useLinhasQueCabem` e
  os contextos de tela cheia e de altura do corpo, que só serviam à paginação.

### Adicionado

- `CHANGELOG.md` (este arquivo).

### Migrations

- Nenhuma (o módulo só lê).

## 0.3.1 — 2026-11-09

Ajustes da devolutiva da 0.3.0: tooltips só com mouse (`Dica`), valores escritos
nos cartões em tela de toque, filtro de canal na linha das abas, alvos de toque com
44 px, tour das abas, FAQ sem comparação com o sistema substituído e, no celular,
Pesquisar recolhe a barra de filtros. Detalhes no `PRD.md` §14 (v1.5).

## 0.3.0 — 2026-11-04

Aba **Operacional** (tempo dentro da loja por etapa, quem cancelou e mapa de calor
dia × hora) e uma consulta só para as duas abas. Detalhes no `PRD.md` §14 (v1.4).

## 0.2.0 — 2026-11-03

Seletor de loja com todas as Empresas com CNPJ, título no card de loja e período,
busca geral só no celular, totais fechados no celular. `PRD.md` §14 (v1.2 e v1.3).

## 0.1.1 — 2026-10-30

Permissão `reports-maestro.ver-dados-cliente` (dados pessoais mascarados no
servidor), menu em Plataformas › Maestro e 10 colunas adicionais. `PRD.md` §14 (v1.1).

## 0.1.0 — 2026-10-29

Primeira versão: relatório de pedidos de delivery do Maestro por loja e período.
