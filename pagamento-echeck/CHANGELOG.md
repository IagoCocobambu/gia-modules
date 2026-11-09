# Changelog — Pagamento eCheck

## 0.1.0 — 2026-11-06

- Primeira versão, migrada do Relatório de Pagamentos eCheck do GIA legado.
- Filtros de loja, período (até 31 dias) e faixa de horário (regra do legado).
- Barra de totais no padrão do workspace: valor total, transações e ticket médio
  (do legado) e aprovadas / não aprovadas, que filtram a tabela ao clique.
- Tabela com as 17 colunas do legado (cabeçalho no padrão dos outros módulos, sem
  linha de totais), gráficos por hora e por modalidade, exportação em Excel.
- Barra de filtros em uma linha a partir de ~1280px e em duas linhas alinhadas
  abaixo disso; empilhada no celular.
- API do DW chamada no servidor com a credencial `apidw` do hub de Credenciais.
