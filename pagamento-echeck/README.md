# Pagamento eCheck

Módulo GIA — categoria: vendas. Substitui a tela **Relatório de Pagamentos eCheck**
do GIA legado.

Mostra os pagamentos eCheck de uma loja num período (até 31 dias) e faixa de
horário: barra de totais (valor total, transações, ticket médio, aprovadas e não
aprovadas, que filtram a tabela), gráficos por hora e por modalidade e a lista
detalhada, com exportação em Excel.
Só leitura — os dados vêm da API do DW (`/payments/`) na hora da pesquisa.

> 🤖 Este projeto tem um **`AGENTS.md`** na raiz com o contexto pra IA da sua
> IDE — e a doc completa do SDK fica em `node_modules/@gia-cb/dev-shell/docs/`
> após o `npm install`. Siga também o `../AGENTS.md` do workspace.

## Desenvolver

```bash
cp .env.example .env   # preencha a credencial da API do DW (apidw)
npm install
npm run dev            # gia dev — dev-shell em http://localhost:6010
npm run validate       # gia validate
npm run pack           # gia pack — gera o .tgz
```

## Estrutura

```
src/
├── module.ts            defineModule — id, navGroup 'relatorios', versão
├── permissions.ts       pagamento-echeck.ler / .exportar
├── faq.ts, tour.ts      treinamento do usuário
├── routes.tsx           rota /pagamento-echeck
├── helpers.ts           datas, formatos, resumo, gráficos, colunas e Excel
├── graficos.ts          paleta dos gráficos (tokens do tema)
├── server/
│   ├── lojas.ts         lojas do escopo com código BIAPI/TS2
│   └── pagamentos.ts    lê /payments/ (paginado) com a credencial apidw
├── api/                 hooks React Query dos handlers
├── components/          filtros, resumo, gráficos, Dica (tooltip só com mouse)
└── views/               PagamentoEcheckView
```

Regras de negócio e decisões: [`PRD.md`](PRD.md). Handoff para o time GIA:
[`INTEGRATION.md`](INTEGRATION.md).
