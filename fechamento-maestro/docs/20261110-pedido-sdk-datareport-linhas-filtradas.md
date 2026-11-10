# Pedido ao time do SDK — `DataReport`: avisar o módulo das linhas filtradas

**De:** módulo Fechamento Maestro · **Pacote:** `@gia-cb/ui` 0.1.0-alpha.70 · **Data:** 10/11/2026

## Contexto

Nas telas de relatório, os totais ficam numa barra de indicadores acima do
`DataReport` (padrão dos módulos). Na devolutiva do Fechamento Maestro, o cliente
pediu que os totais **acompanhem os filtros condicionais das colunas**: ao filtrar
Origem = iFood, os indicadores deveriam passar a somar só o iFood.

Hoje o módulo não tem como saber quais linhas sobraram depois dos filtros. As
linhas filtradas só chegam ao módulo:

- no `onExport(visibleRows)`, e só no clique do botão Exportar;
- no `summaryRow(filteredRows)`, que desenha uma linha de totais na grade, não é
  chamado com 0 linhas nem no modo cards (celular), e roda durante a renderização
  da tabela (não dá para chamar `setState` do módulo dali).

## Pedido

Uma prop de callback no `DataReport`:

```ts
/**
 * Chamada sempre que o conjunto de linhas filtradas muda (filtros de coluna,
 * busca geral), inclusive quando fica vazio e no modo cards. Recebe TODAS as
 * linhas filtradas (não só a página atual), já como `TData`.
 */
onFilteredRowsChange?: (filteredRows: TData[]) => void
```

Requisitos:

1. Chamada **depois** do commit (num `useEffect`), não durante a renderização.
2. Chamada também com `[]` (filtro sem resultado) e no modo cards.
3. Só chamada quando o conjunto muda (comparar ids/referências), para não
   recalcular os totais a cada renderização.
4. Opcional: indicar se há filtro ativo (`(rows, { filtrado: boolean })`), para o
   módulo mostrar o aviso "Totais filtrados · X de Y".

## Uso previsto

```tsx
const [linhasFiltradas, setLinhasFiltradas] = useState<PedidoFechamento[] | null>(null)
const totais = useMemo(() => resumirTotais(linhasFiltradas ?? pedidos), [linhasFiltradas, pedidos])

<DataReport onFilteredRowsChange={setLinhasFiltradas} ... />
```

Enquanto o recurso não sai, o Fechamento Maestro 0.3.0 resolve o caso mais pedido
com um seletor de **Canal** próprio, fora da grade, que recorta totais, tabela e
Exportar.
