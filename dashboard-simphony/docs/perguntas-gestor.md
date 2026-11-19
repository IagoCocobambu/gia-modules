# Dashboard Simphony 0.1.0 — perguntas para o gestor

Levantadas em 19/11/2026, na migração do Dashboard (SIMDASH) do GIA antigo.
Enquanto não houver resposta, o módulo segue com a opção **provisória** marcada
em cada pergunta. Ao responder, atualizar o `PRD.md` (seção "Perguntas em aberto")
e o código.

## 1. Nome e lugar no menu

Qual o nome do módulo no menu e em que grupo ele fica?

- **Provisório**: “Dashboard Simphony”, id `dashboard-simphony`, grupo **Simphony**
  (o mesmo da Validação Fiscal).
- Outras opções: “Dashboard de Vendas” no grupo **Dashboards** (o do Dashboard de
  Contas); “Dashboard Simphony” no grupo Dashboards.
- Obs.: o id (`dashboard-simphony`) é difícil de mudar depois da 1ª instalação; o
  nome e o grupo, não.

## 2. Credencial da BI do Simphony

No GIA antigo o token da BI do Simphony era lido de uma tabela do banco Simphony.
No portal, a credencial vem do **hub de Credenciais**. Já existe a integração da BI
do Simphony cadastrada no hub? Qual o id dela?

- **Provisório**: integração `simphony-bi`; a org (`GCB`) em `parametros.org`, com
  `GCB` de reserva quando não vier.
- Quem administra o hub precisa cadastrar/liberar a integração para o módulo.

## 3. Nome dos itens do Mix de vendas

A BI devolve só o número do item; o nome vinha de uma tabela do banco do GIA antigo
(`mistatus.menuitems`). De onde buscar?

- **Provisório**: da própria BI do Simphony (`getMenuItemDimensions`), sem banco
  externo — uma chamada a mais por pesquisa.
- Outra opção: o mesmo banco do GIA antigo, via `GIA_SERVER_DATABASE_URL`.

## 4. Data da pesquisa

O GIA antigo mostra sempre o **último dia de negócio fechado**, sem escolher data.

- **Provisório**: seletor de data que abre no último dia de negócio, permitindo
  escolher outro dia.
- Outra opção: igual ao GIA antigo, sem seletor.
