# Changelog — Fechamento iFood Mensal

## 0.1.0 — não publicado

Primeira versão. Porte da tela **Fechamento Mensal iFood** do GIA legado, lendo e
gravando nas mesmas tabelas (`ifood_fechamento.*` no banco do Maestro).

### Adicionado

- Seletor de loja por **operação** (exceção aos demais módulos), igual ao do
  Fechamento iFood Diário; o número do `operacao_ref` é a chave da loja no banco.
- Sete abas: Lançamentos, Online, Adquirentes, Conferência, Extrato, Recebimento e
  Cancelados pós, com as regras do legado sem alteração (pendências no PRD §11).
- Consulta ao iFood em janelas de 8 dias, **4 páginas ao mesmo tempo**, com
  progresso, Cancelar e exibição aos poucos (dias em espera apagados).
- Edição com `fechamento-ifood-mensal.editar`: previsão, CB Desc. LOJA e comentário
  por dia, breakdown da Conferência, extrato e cancelados pós; Salvar numa transação,
  com aviso de alteração pendente.
- Barra de totais em cards (nenhum total dentro das tabelas), com 4 principais +
  "Ver todos os totais"; cards que são recorte filtram a tabela — em Lançamentos,
  Online (# por coluna), Adquirentes (# total e divergência), Recebimento (datas com
  diferença) e Cancelados pós (reembolsado).
- Quantidade e valor na mesma coluna com o selo `3×`, também no diálogo do dia.
- Abas embaixo da tabela (`GridTabsBar` compacta) e filtros em uma linha depois da
  consulta, para monitor estreito.
- Celular: filtros recolhem ao consultar, grades em cartões, diálogo do dia; em tela
  de toque os botões de ícone mostram o rótulo (Ver o dia, Editar, Remover).
- Empresa `999.CB TECH HOMOLOG` (operações `999 cb` e `999 vst`) no `gia.config.ts`
  para testes de gravação.

- **Histórico** das gravações: botão Histórico (depois da consulta) com quem salvou,
  quando e o antes → depois de cada campo e das linhas incluídas/removidas. Tabela
  nova `ifood_fechamento.historico` no banco do Maestro
  (`sql-maestro/001_historico.sql`), gravada pelo Salvar na mesma transação.

- Carregamento no padrão 9 do workspace: até a consulta terminar, os cards ficam
  carregando e não filtram, Conferência e dias em espera de Online/Adquirentes
  mostram "Aguardando iFood" no lugar do valor final, e o Recebimento fica carregando.
- Barra de abas: o Total acompanha o filtro do card; o Alterados conta cada linha
  do Extrato/Cancelados uma vez (não muda mais com a posição).
- Linha de informação (loja, mês, última gravação, Histórico) no rodapé, embaixo da
  barra de abas.

### Corrigido (divergência com o sistema antigo)

- **Lançamentos faltando**: o iFood às vezes devolve a página "leve" — as vendas
  sem os eventos financeiros, que viravam zero lançamento. Medido na loja 01 em
  out/2026: 19 de 49 páginas vieram assim na 1ª chamada, e o mês saía com cerca de
  metade dos lançamentos (2.427 de ~4.600). Agora a página é pedida de novo até vir
  completa; se não vier, a consulta dá erro em vez de mostrar números incompletos.
- **Limite do iFood (429)**: o handler espera o `Retry-After` (ou 1,5/3/6 s) e tenta
  de novo; a tela busca 3 páginas ao mesmo tempo (eram 4).

### Segurança / robustez

- Erro do iFood e do banco sem detalhe técnico na tela (detalhe no log do servidor
  com o prefixo `[fechamento-ifood-mensal]`).
- Recusa do iFood (credencial ou loja não autorizada) volta 424 e não é tentada de
  novo; instabilidade (429, 5xx, rede) tem até 2 novas tentativas; página que passa
  de 30 s (504) não é repetida.
- Modo de demonstração renomeado para `GIA_DEV_IFOOD_MENSAL_DEMO` (só `gia dev`).

### Corrigido em relação ao legado (perda de dado)

- Dia que ficou vazio é limpo no banco ao salvar.
- "Vale no cofre?" dos cancelados lido e gravado no mesmo campo.
- Falha ao ler o banco interrompe a consulta (não mostra a tela zerada).
