# Changelog — Fechamento Maestro

## 0.2.0 — 06/11/2026

Ajustes da devolutiva da 0.1.0 e novos recursos. Sem mudança de banco nem de
permissões (continua `.ler`, `.exportar` e `.ver-dados-cliente`).

### Devolutiva

- **Loja (bloqueante 2):** o número da loja (`loc_ref`) vem primeiro do vínculo
  da Empresa com a BI do Simphony (`locRefs.BIAPI`) e, na falta, do nome — mesma
  função `numeroDaLoja` do Reports Maestro. Loja com CNPJ sem número aparece no
  seletor e a pesquisa responde 422 com o motivo; Propriedade continua fora.
- **Bloqueante 1 (cadastro ONLINE VR no portal): não aplicado**, por decisão do
  responsável. O módulo é só leitura e continua lendo
  `gia_relatorios.formas_pagamento` do banco do Maestro; sem migrations.
- **Menu:** Plataformas › Maestro, ao lado do Reports (`navGroup: 'maestro'`).
- **FAQ e tour** sem menções ao sistema antigo; "Erros comuns" com 3 perguntas.
- **Excel:** a aba Pedidos usa o Online líquido e a aba Fechamento diário traz
  Descontos loja e Descontos parceiro com a regra dos cards — o Total de cada
  aba bate com os cards. Com filtro ligado, o subtítulo da aba diz
  "filtrado (…): X de Y pedidos".
- **Formas de pagamento:** a vírgula só separa itens depois do parêntese do
  valor (descrição com vírgula não quebra mais).
- **Celular:** botão Totais abre o Dashboard na aba Totais; filtros no
  `ListHeader`, recolhíveis, e que se recolhem sozinhos ao pesquisar; botões da
  barra com rótulo visível em tela de toque; indicadores em uma coluna.
- **Toque:** legenda e anel do Dashboard alternam o destaque no toque; hover e
  tooltip só em aparelho com mouse (no toque, o "mouse" emulado do navegador
  abria tooltip e destaque sozinhos).
- **Sugestões:** data inexistente recusada; "gerado em" e "hoje" no fuso de São
  Paulo; passo "Divergências" do tour aponta para o botão.
- **Online negativo:** mantido — é a regra do legado (o incentivo do parceiro
  sai inteiro do Online). Com a coluna Online (líquido), o pedido em que o
  incentivo passa da parte online aparece negativo na aba Pedidos do Excel
  (ex.: loja 82, pedido 8294 de 24/10/2026: −R$ 6,99).

### Novo

- **Totais como filtro:** clicar num dos 12 indicadores filtra a tabela pelos
  pedidos que entram naquela conta (mesma regra da soma do card). Botão com o
  nome do indicador na barra da tabela tira o filtro. Combina com "Só
  divergências" e vale para o Exportar. Substitui a janela "pagamentos sem
  classificação", que passa a filtrar como os outros.

## 0.1.1 — 05/11/2026

- Seletor só com lojas com CNPJ (`tipoRegistro === 'empresa'`); o servidor
  recusa operação sem CNPJ.
- Descrição do módulo conforme a devolutiva da entrega.

## 0.1.0 — 03/11/2026

- Primeira entrega: fechamento diário do delivery do Maestro por loja e período,
  com conciliação das formas de pagamento, divergências, totais, Dashboard de
  vendas por canal e Excel.
