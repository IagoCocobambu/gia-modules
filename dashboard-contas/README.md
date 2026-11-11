# Dashboard de Contas — `dashboard-contas`

No menu do portal: **Dashboards > Planos > Dashboard de Contas**.

Painel comparativo do **Plano de Contas**, somente leitura, sobre as operações do
escopo do usuário. Junta num mês — ou num período de até 12 meses — o resultado
que cada loja registra no Plano de Contas e mostra o consolidado contra o período
anterior, o plano inteiro em árvore e cada loja contra a média, a melhor e a pior
da seleção.

É o irmão do [`dashboard-rh`](../dashboard-rh), com a mesma arquitetura. O
desenho partiu do protótipo do designer ("BI — Plano de Contas") e as análises,
do HTML de especificação (`dashboard_plano_de_contas_cb.html`) — o PRD diz o que
veio de cada um e o que mudou.

> **O domínio, as regras e as fórmulas estão no [`PRD.md`](PRD.md).** Este
> arquivo é só o mapa do repositório. O que muda a cada versão está no
> [`CHANGELOG.md`](CHANGELOG.md), e o que o time GIA precisa conectar para
> instalar está no [`INTEGRATION.md`](INTEGRATION.md).

## O que a tela tem

Três abas, todas sobre o mesmo recorte escolhido na barra do topo:

| Aba | O que responde |
|---|---|
| **Visão geral** | Qual foi o resultado, como evoluiu, do que é feito e quem o faz |
| **Plano de contas** | O plano inteiro, somado — ou mês a mês num período |
| **Comparativos** | Cada loja (ou região, estado, matriz) contra a média, a melhor e a pior |

A barra do topo monta o recorte (operações, mês ou período, status do plano e
mesmas lojas). **Nada é consultado enquanto o recorte é montado:** quem busca é o
botão **Consultar**.

## Desenvolver

```bash
npm install
npm run dev          # gia dev — sobe o dev-shell (a porta está em .claude/launch.json)
npm test             # vitest — as regras de cálculo que quebram em silêncio
npm run validate     # gia validate — tem que passar sem erros antes de empacotar
npm run pack         # gia pack — gera o .tgz de entrega ao time GIA
```

O dev-shell lê o data-warehouse pelo `GIA_SERVER_DATABASE_URL` do `.env` (banco
local) ou do `.env.local` (DW de produção, que prevalece). Os dois ficam fora do
pacote; o `.env.example` mostra o nome da variável.

## Estrutura

```
src/
├── module.ts            manifesto (navGroup: 'dashboards')
├── permissions.ts       2 permissões — ver e exportar
├── routes.tsx           1 rota: /dashboard-contas
├── faq.ts  tour.ts      o treinamento do usuário; a FAQ alimenta a IA do portal
├── context-tours.ts     o tour "Conhecer as abas"
├── server/              3 handlers que leem o data-warehouse (BFF)
│   ├── contas.ts        a matriz de um mês: catálogo × lojas
│   ├── serie.ts         20 contas em 12 meses, para a evolução
│   └── operacoes.ts     a lista do escopo, sem consulta ao DW
├── api/                 os hooks de dados (TanStack Query) e o cadastro de empresas
├── types.ts             o contrato de fio entre handler e cliente
├── catalogo.ts          ⟵ a natureza de cada conta, as razões e as recalculadas
├── matriz.ts            ⟵ agregar o período, somar lojas, derivar as razões
├── recorte.ts           ⟵ filtros, período anterior e as lojas nas duas pontas
├── indicadores.ts       ⟵ os cinco indicadores calculados pelo painel
├── grade.ts             ⟵ as linhas da árvore e a medida de cada uma
├── comparacao.ts        ⟵ média, melhor, pior e oportunidade em R$
├── comparativos.ts      ⟵ as colunas da aba Comparativos
├── visao.ts lojas.ts    ⟵ os cartões, a composição e o desempenho por loja
├── periodo.ts           ⟵ a janela de meses e o período anterior
├── formato.ts           os formatadores (criados uma vez por módulo)
├── planilha.ts          ⟵ os números de cada cartão de gráfico, em colunas
├── baixar-planilha.ts   o .xlsx do cartão (exceljs, carregado só no clique)
├── components/          as abas, os seletores e os gráficos
└── views/               a view única: a barra de recorte e as abas
tests/                   os testes de cálculo (não viajam no pacote)
```

Os arquivos marcados com ⟵ são **cálculo puro, sem React**: é onde mora a regra
de negócio, e é o que os testes cobrem. As quatro abas leem pelas mesmas funções —
regra que morasse num componente divergiria entre as abas, e divergência de conta
num painel comparativo não aparece na tela.

## Dados

- **Data-warehouse** (`plano_conta.indices`, `planos`, `resumo`), só leitura,
  pelo secret `GIA_SERVER_DATABASE_URL`, sempre por handler — nunca do navegador.
- **`gia.empresas`** do portal, para estado, região da rede (`regiao_cb`) e o
  vínculo de matriz.
- **Nenhuma migration, nenhum schema próprio.** O módulo não grava nada, em banco
  nenhum.
