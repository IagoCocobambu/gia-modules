# Changelog — Fechamento iFood Mensal

## 0.1.2 — 17/11/2026

Devolutiva da 0.1.1 (16/11/2026): trava de teste na gravação.

### Adicionado

- **Trava de teste no `salvar`** — variável opcional
  `FECHAMENTO_IFOOD_MENSAL_EMPRESA_TESTE` (id da Empresa). Homologação e produção
  gravam no mesmo DW (`ifood_fechamento.*`); com a variável definida, o `salvar`
  recusa qualquer outra Empresa com 403 e uma mensagem clara, logo depois do
  `requireEmpresa` e **antes** de abrir a transação (antes, um Salvar sem alteração
  num mês novo ainda criava o cabeçalho do mês). Valor que não é id recusa toda
  gravação (503). Sem a variável (produção), nada muda. Fica fora do
  `config.secrets`, para a instalação em produção não exigi-la.
- Recusa da trava no modal "O fechamento não foi salvo": título **Ambiente de teste**
  e o texto do servidor, sem a orientação "peça ao seu gestor" do tipo acesso (o
  gestor não tem o que liberar). A `MensagemErro` continua igual à dos outros módulos;
  o ajuste é feito pelas props `titulo`/`descricao` na view.
- FAQ: pergunta sobre a recusa "Este ambiente é de teste".
- `.env.example`: a variável, com a Empresa 999 (id 93).

### Documentação

- `INTEGRATION.md`: a variável (§4), a ordem da instalação (trava → tabela de
  histórico → teste na 999) e a data da virada do legado a combinar (§7).
- `PRD.md` v1.4: critério de pronto do RF-5, critério de aceite e risco.

## 0.1.1 — 16/11/2026

Retentativa refeita a partir do comportamento medido do iFood, faixa de progresso
estável e revisão contra o SDK alpha.71.

### Alterado

- **Retentativa pelo comportamento medido do iFood** (testes de 13 e 16/11/2026 em
  `docs/teste-ifood-*`):
  - o handler `ledger` lê `ifood-ratelimit-remaining`/`-reset` em toda resposta e
    devolve o saldo da cota (`cota`) à tela;
  - página com vendas vazias (sem o `FINANCIAL_BILLED_ORDER_ENTRY`) e 429 com saldo de
    cota sobrando: repetição **imediata**, até 3 vezes (esperar 250 ms ou 1 s não
    aumentou o acerto); depois, o handler responde `adiar` e a página volta para o fim
    da fila da tela, até 3 vezes por página; na 4ª, a consulta para com erro;
  - 429 com a cota esgotada (saldo 0) ou com `Retry-After`: o handler responde `adiar`
    na hora e a tela **pausa todas as chamadas** até o `Retry-After` ou o
    `ifood-ratelimit-reset` + 1 s (teto 60 s); com saldo abaixo de 20, a pausa vem
    antes (freio); a mesma página aguenta até 5 pausas, na 6ª a consulta para com erro;
  - **concorrência adaptativa**: até 3 páginas ao mesmo tempo; baixa 1 (no máximo a
    cada 3 s) quando uma página precisa de 2 ou mais repetições ou volta para a fila, e
    sobe 1 a cada 8 páginas seguidas sem repetição, até 3;
  - rede/5xx: 2 novas tentativas (1,5 s e 4 s) com variação aleatória; 504 não repete.
    Antes: no 429 o handler esperava o `Retry-After` ou 1,5/3/6 s, e a página "leve" era
    pedida até 4 vezes e virava erro 502.
- Página que estoura as tentativas vira erro com origem "Lançamentos do iFood", a frase
  do motivo e os detalhes técnicos (a `requisicao` no formato do SDK). Depois de
  Cancelar ou de um erro, nenhum trabalhador pede mais páginas.
- Sem linha de informação embaixo da tabela: o botão **Histórico** foi para a barra de
  filtros, ao lado do Salvar, com a última gravação na dica (loja e mês já estão nos
  filtros, e o total no contador da barra de abas).
- Faixa de progresso estável: frase, barra, andamento e Cancelar, sem cronômetro nem
  aviso de pausa ou de ritmo (a pausa pela cota e o ritmo reduzido só deixam a consulta
  mais lenta).
- **Tela sem pulos durante a consulta** (medido quadro a quadro em 1440, 1024 e 390 px):
  - a barra de filtros fica enxuta desde o clique em Consultar (antes trocava no meio da
    consulta, quando o caixa da loja chegava, e tudo pulava ~100 px), sem a transição que
    a fazia escorregar mais 18 px; o botão Histórico aparece desde o clique, desativado
    até o caixa chegar, para a barra não quebrar de linha no meio;
  - a tela de carregamento tem a mesma estrutura da tela com dados: a tabela não é
    remontada (sumia e voltava em fade) e a barra de totais já aparece carregando;
  - enquanto nenhuma página do iFood chegou, a tabela continua carregando (antes mostrava
    "O iFood não devolveu lançamentos" por um instante);
  - a faixa de progresso tem altura fixa (uma linha de texto; no celular só a frase
    principal) e, no fim, recolhe com animação em vez de sumir de uma vez.
- Barra de abas (`GridTabsBar`) exatamente no formato do SDK, sem classes próprias.
- Mensagem de erro na mesma posição do estado "Escolha a loja e o mês" (no alto da
  área da tabela, `py-12`).

### Adicionado (só `gia dev`)

- `GIA_DEV_IFOOD_MENSAL_DEMO_LIMITE` (% das páginas): o modo de demonstração simula
  repetições, páginas adiadas, cota esgotada e saldo baixo; `sempre` e `cota` forçam a
  falha para testar a mensagem de erro.
- `GIA_DEV_IFOOD_MENSAL_POR_OPERACAO=1`: seletor "Operação (teste)" para consultar uma
  operação só da loja (comparar com o legado); com operação escolhida não salva.

### Corrigido (revisão contra o SDK alpha.71)

- `manual`, `salvar` e `historico` recusam (422) o registro do escopo que não é
  Empresa: uma "propriedade" com número no nome apontaria para o fechamento da loja de
  mesmo número (`dados-externos.md`, "Escopo de loja"; `delivery-checklists.md` N).
- A tela mostra um carregando enquanto as permissões chegam, em vez de piscar "Sem
  acesso" (`useCanAccessState`, `api-reference.md` §1.2).
- Diálogo do dia (previsão, CB Desc. LOJA, comentário) com `useGiaForm` + Zod
  (`diaSchema` em `schemas.ts`), como os de Extrato e Cancelados (`conventions.md` §9).
- FAQ, PRD, INTEGRATION, README e `.env.example` atualizados com o que a tela faz hoje
  (FAQ do Histórico não fala mais em operação; o 424 é só a credencial recusada).

## 0.1.0 — 12/11/2026

Primeira versão. Porte da tela **Fechamento Mensal iFood** do GIA legado, lendo e
gravando nas mesmas tabelas (`ifood_fechamento.*` no banco do Maestro).

### Adicionado

- **Loja = Empresa, com todas as operações juntas** (como o Fechamento iFood Diário
  0.2.4): o seletor lista as Empresas do escopo ("3 operações no iFood: cb, pzcb,
  vst" embaixo do nome) e o fechamento soma os lançamentos de **todos os restaurantes
  da loja** no iFood. Os restaurantes são os vínculos **IFOOD** das operações da
  Empresa no cadastro do portal (`ctx.operacoes()` → `integracoes`, SDK **alpha.71**),
  lidos a cada consulta — nenhum merchant fica no código (como no Diário 0.2.5). O
  `ledger` pede uma página de **um restaurante** e confere que ele é da loja. Nova
  coluna **Operação** em Lançamentos. Restaurante negado pelo iFood (403) ou que o
  iFood não reconhece (404, identificador errado no cadastro — caso do 2º vínculo da
  `43 cbx`) fica de fora com aviso; os outros seguem. A chave no banco é o número da
  loja (do nome da Empresa ou do vínculo BIAPI), então o fechamento já gravado continua
  aparecendo. Conferido com o iFood real na loja 01 (out/2026): cb 5.090, cbx 3.781 e
  burger 0 lançamentos.
- **Mensagem padrão de erro** (`MensagemErro`, a mesma do Diário) na consulta, no
  Salvar (num modal; o preenchido continua na tela) e no Histórico: tipo do problema,
  a frase do servidor e "Ver detalhes técnicos" (Copiar tudo, Baixar diagnóstico), sem
  senha, token nem dado pessoal.
- Sete abas: Lançamentos, Online, Adquirentes, Conferência, Extrato, Recebimento e
  Cancelados pós, com as regras do legado sem alteração (pendências no PRD §11).
- Consulta ao iFood em janelas de 8 dias, **3 páginas ao mesmo tempo**, com
  progresso, Cancelar e exibição aos poucos (dias em espera apagados).
- Edição com `fechamento-ifood-mensal.editar`: previsão, CB Desc. LOJA e comentário
  por dia, breakdown da Conferência, extrato e cancelados pós; Salvar numa transação,
  com aviso de alteração pendente.
- Barra de totais em cards (nenhum total dentro das tabelas), com 4 principais +
  "Ver todos os totais"; cards que são recorte filtram a tabela — em Lançamentos,
  Online (# por coluna), Adquirentes (# total e divergência), Recebimento (datas com
  diferença) e Cancelados pós (reembolsado).
- Quantidade e valor na mesma coluna com o selo `3×`, também no diálogo do dia.
- Abas embaixo da tabela (`GridTabsBar`) e filtros em uma linha depois da consulta,
  para monitor estreito.
- Celular: filtros recolhem ao consultar, grades em cartões, diálogo do dia; em tela
  de toque os botões de ícone mostram o rótulo (Ver o dia, Editar, Remover).
- Empresa `999.CB TECH HOMOLOG` (operações `999 cb` e `999 vst`) no `gia.config.ts`
  para testes de gravação.
- **Histórico** das gravações: botão Histórico (no rodapé, depois da consulta) com quem
  salvou, quando e o antes → depois de cada campo e das linhas incluídas/removidas.
  Tabela nova `ifood_fechamento.historico` no banco do Maestro
  (`sql-maestro/001_historico.sql`), gravada pelo Salvar na mesma transação.
- Carregamento no padrão 9 do workspace: até a consulta terminar, os cards ficam
  carregando e não filtram, Conferência e dias em espera de Online/Adquirentes
  mostram "Aguardando iFood" no lugar do valor final, e o Recebimento fica carregando.
- Barra de abas: o Total acompanha o filtro do card; o Alterados conta cada linha
  do Extrato/Cancelados uma vez (não muda mais com a posição).

### Corrigido (divergência com o sistema antigo)

- **Lançamentos faltando**: o iFood às vezes devolve a página "leve" — as vendas
  sem os eventos financeiros, que viravam zero lançamento. Medido na loja 01 em
  out/2026: 19 de 49 páginas vieram assim na 1ª chamada, e o mês saía com cerca de
  metade dos lançamentos (2.427 de ~4.600). A página é pedida de novo (até 4 vezes);
  se não vier completa, a consulta dá erro em vez de mostrar números incompletos.
- **Limite do iFood (429)**: o handler espera o `Retry-After` (ou 1,5/3/6 s) e tenta
  de novo; a tela busca 3 páginas ao mesmo tempo (eram 4).

### Segurança / robustez

- Erro do iFood e do banco sem detalhe técnico na tela (detalhe no log do servidor
  com o prefixo `[fechamento-ifood-mensal]`).
- Credencial recusada pelo iFood (401) volta 424 e não é tentada de novo; restaurante
  negado (403) ou não encontrado (404) fica de fora com aviso; instabilidade (429, 5xx,
  rede) tem até 2 novas tentativas; página que passa de 30 s (504) não é repetida.
- Modo de demonstração renomeado para `GIA_DEV_IFOOD_MENSAL_DEMO` (só `gia dev`).

### Corrigido em relação ao legado (perda de dado)

- Dia que ficou vazio é limpo no banco ao salvar.
- "Vale no cofre?" dos cancelados lido e gravado no mesmo campo.
- Falha ao ler o banco interrompe a consulta (não mostra a tela zerada).
