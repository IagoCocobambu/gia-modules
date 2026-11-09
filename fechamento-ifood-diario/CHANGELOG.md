# Changelog — Fechamento iFood Diário

## 0.1.0 — 09/11/2026

Primeira versão. Porte da tela **Fechamento iFood Diário** do GIA legado.

- Loja e dia; pedidos do DW cruzados com a API financeira do iFood pelo Nº
  parceiro; só os pedidos do canal iFood.
- Colunas da grade do legado (Total do pedido, Desconto copart, iFood
  reembolsa?, Cancelamento, Status...), com as mesmas regras.
- Os 9 cards do legado; cada card filtra a tabela.
- Avisos quando a parte do iFood falha ou não cruza.
- Excel com as abas Resumo e Pedidos.
- Permissões `fechamento-ifood-diario.ler` e `fechamento-ifood-diario.exportar`.
- FAQ e tour sem menção ao sistema antigo (padrão 4 do `AGENTS.md` do workspace).
- Seletor de loja por **operação** (todas as operações do escopo), exceção aos
  demais módulos. Cada operação traz só os seus pedidos: CB pelo canal "iFood",
  Vasto na loja do CB pelo canal "iFood Vasto" e o restaurante do Vasto.
- Coluna Restaurante no iFood. Como no legado, só o restaurante da operação entra
  no cruzamento: pedidos de Express/Pizzaria/Dani da loja ficam como Cancelado.
- API do iFood: 204 (dia sem vendas) e 429 (limite de requisições, com nova
  tentativa) tratados; páginas de vendas buscadas 3 por vez.
