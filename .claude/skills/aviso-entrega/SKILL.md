---
name: aviso-entrega
description: Gera o AVISO DE ENTREGA (HTML + PDF A4) de um ou mais módulos do portal GIA (SDK @gia-cb) — o documento para os gestores e o time do Portal GIA com o que o módulo é, onde fica no menu, o que mudou, a tabela de permissões com o público sugerido para cada chave e como atribuir. Use quando o usuário pedir o aviso — pelo comando /aviso-entrega <modulo> ou com palavras como "gera o aviso de entrega", "documento de entrega com as permissões", "quem recebe cada permissão desse módulo". Não ofereça nem gere o aviso por conta própria (depois de um pack, por exemplo): ele é feito só quando pedido.
argument-hint: <modulo> [<modulo> ...]
---

# Aviso de entrega

O aviso é o documento que acompanha uma entrega: o gestor lê para saber o que
chegou e **a quem dar cada permissão**; o time do Portal GIA lê para saber o que
conferir no ambiente. Ele sai em PDF A4, no visual dos avisos de setembro/2026, e
fica junto do pacote da entrega.

Quem lê **não conhece o código, nem as planilhas internas, nem o repositório**.
Tudo o que estiver no aviso tem de se entender sozinho.

**Os módulos do aviso** vêm no comando: $ARGUMENTS. Quem pede não precisa
escrever o id do manifesto — pode vir o id (`dashboard-contas`), o nome do menu
(`Dashboard de Contas`), um pedaço (`contas`, `GED`, `rh`) ou nada. O
`levantar.mjs` resolve os três primeiros; se ele disser que mais de um módulo
serve, pergunte qual (ou se são todos). Sem nada, use o módulo em que a conversa
está trabalhando; se não houver um claro, rode `levantar.mjs` sem argumentos para
listar os módulos e pergunte.

## Os arquivos da skill

Ficam na pasta desta skill — o diretório-base que aparece quando ela é carregada.
Os scripts rodam com Node 22+ **a partir da raiz do repositório dos módulos**:
`node "<pasta da skill>/scripts/<script>.mjs" ...`

- `scripts/levantar.mjs [<modulo>...]` — tira do código o que não pode ser copiado
  de memória: rótulo, versão, menu, permissões (chave, descrição, árvore), versões
  do CHANGELOG, os documentos a ler e os avisos anteriores do módulo, com o
  responsável de cada um. Sem argumentos, lista os módulos do repositório.
- `assets/modelo.html` — o modelo, com os blocos de **primeira entrega** e de
  **atualização** marcados. Copie e preencha; não reescreva o estilo.
- `references/publicos.md` — os públicos já usados (Diretores, Auditoria…), a cor
  de cada um e como sugerir antes de perguntar.
- `references/exemplos/` — os dois avisos de setembro/2026 (Dashboards de Planos,
  GED). Leia um antes de escrever o primeiro aviso da conversa: é deles que vem o
  tom.
- `scripts/perfis.mjs <aviso.html>` — escreve a seção **Permissões por perfil** a
  partir da tabela de permissões: cada perfil com todas as chaves que recebe (a
  tabela "ao contrário"). Nunca se escreve essa seção à mão.
- `scripts/conferir.mjs <aviso.html> <modulo>...` — confere o aviso contra o
  código (chave faltando, chave inventada, marcador esquecido, primeira pessoa,
  nome de arquivo, jargão) e a seção por perfil contra a tabela.
- `scripts/gerar-pdf.mjs <aviso.html>` — gera o PDF ao lado do HTML com o Edge ou
  o Chrome, esperando as fontes carregarem.

## O roteiro

### 1. Levantar

Rode `levantar.mjs` com os módulos do aviso. Depois leia, de cada um:

- **CHANGELOG** — o que entrou. Numa atualização, as versões desde o último aviso
  (ou desde a última versão enviada); na primeira, a 0.1.0.
- **PRD** — o problema, quem usa, como se fazia antes (sistema antigo, planilha)
  e os números reais (acervo, volume, lojas).
- **INTEGRATION** — o que o ambiente precisa ter para o módulo funcionar
  (funções, secrets, leituras). É daí que sai a caixa de atenção das permissões.
- **`src/faq.ts`** — o nome exato de cada tela, aba e botão. O aviso usa o nome
  que o usuário vê.
- **O aviso anterior**, se o levantamento achou um — uma atualização parte dele.

**Primeira entrega ou atualização?** Sem aviso anterior para o módulo, é a
primeira. Com aviso anterior, é atualização: abre com **O que muda nesta versão**
e não repete o que o anterior já explicou.

Vários módulos da mesma família (Contas + RH, Trâmites + Dossiês) vão num aviso
só, com um título de família ("Dashboards de Planos", "GED — Trâmites e Dossiês").

### 2. Perguntar — só o que o código não diz

Pergunte a quem pediu o aviso. Use a ferramenta de perguntas, se houver (até 4
perguntas por vez, cada uma com até 4 opções; a pessoa sempre pode escrever
outra); sem ela, pergunte em texto, numerado. Não pergunte o que o levantamento já
respondeu.

- **Quem recebe cada chave** — a pergunta que importa. Monte a sugestão primeiro
  (`references/publicos.md`): se um aviso anterior já deu público às mesmas
  chaves, pergunte uma vez só — "manter os públicos do aviso anterior?" — e
  pergunte chave a chave apenas as novas. Sem aviso anterior, uma pergunta por
  chave, `multiSelect`, com os públicos mais prováveis como opções e o sugerido
  primeiro, marcado "(Sugerido)". Chave que não deve ser atribuída a ninguém (a
  restrita, a de transição) também é resposta válida — vira caixa de atenção.
- **Onde o módulo já está** (Produção, Homologação, as duas, ou ainda não
  instalado) e **a data da entrega**, se não for hoje. É detalhe: uma pergunta,
  junto das outras, e aceite "tanto faz" — aí vale hoje e o que o CHANGELOG
  sugerir.
- **O menu**, se o levantamento não achou o caminho completo (a fonte "navGroup
  do manifesto" não traz sub-grupo) ou se a fonte diz "a definir".
- **O responsável**, só se nenhum aviso anterior do módulo trouxer um. Sugira o
  nome do aviso anterior de outro módulo do mesmo repositório, se houver.

Por que perguntar em vez de deduzir: quem recebe acesso é decisão de quem
entrega, e uma sugestão errada impressa num PDF vira concessão errada no portal.

### 3. Escrever

Copie `assets/modelo.html` para o destino (passo 4), preencha e **apague** os
blocos que não se aplicam a este tipo de aviso.

O que torna o aviso bom — e por quê:

- **Escreva para o gestor.** Ele quer saber o que muda para quem usa e a quem dar
  acesso. Abra cada item pelo resultado ("A comparação com a rede, sem
  planilha."), em negrito, e explique depois.
- **Nada que dependa do repositório.** Sem nome de arquivo, caminho, componente,
  handler, API, schema ou "aba X da planilha Y". O leitor não tem como abrir nada
  disso. A exceção é o que o leitor precisa **fazer**: o nome da chave de
  permissão, e a função que o time do Portal GIA tem de criar no banco — sempre
  com o porquê e o sintoma de quando falta.
- **O nome da tela é o da tela.** Aba, botão e coluna exatamente como aparecem
  (do `faq.ts`), em negrito.
- **"O que libera" é o que a pessoa passa a poder fazer**, com verbo e do ponto de
  vista dela ("Baixar as grades e os gráficos em Excel"). A `description` do
  código é ponto de partida, não texto pronto.
- **Diga o que pode dar errado na atribuição.** Chaves que só funcionam juntas,
  chave que recorta a leitura (sem ela a tela abre vazia), chave que não deve ser
  atribuída, dependência do ambiente — tudo isso vai numa caixa `.atencao`, com o
  sintoma. É o que poupa o chamado de "o módulo não funciona".
- **Números de verdade, ou nenhum.** Só os que estão no PRD, no CHANGELOG ou no
  código. Nunca estime.
- **Voz:** o aviso descreve o módulo — sem primeira pessoa ("fizemos", "vamos").
  Plural explícito ("1 loja", "2 lojas"), nunca montado com "s".
- **Atualização sem chave nova:** diga isso na primeira frase de Permissões, e
  mantenha a tabela completa — o aviso precisa servir sozinho. Chave nova leva
  `<span class="nova">nova</span>`.
- **Públicos:** o mesmo nome e a mesma classe de cor do registro, na tabela e em
  "Quem usa".
- **Permissões por perfil** vem logo depois de Permissões, nos dois tipos de aviso:
  cada perfil da tabela (Diretores, Gerentes, Suporte…) com todas as chaves que deve
  receber, módulo a módulo, e a Administração/GIA por último. É a mesma informação
  da tabela, para quem vai marcar as chaves de um grupo de uma vez (pedido do João em
  23/10/2026). Ela sai da tabela pelo `perfis.mjs` — feche a tabela primeiro; mudou
  um público depois, rode o script de novo.

### 4. Salvar, conferir e gerar o PDF

- Destino: `entregas/<AAAA-MM-DD>/` na raiz do repositório (a data da entrega) —
  ou, se o repositório já guarda os pacotes `.tgz` entregues em outra pasta, ao
  lado deles. Crie a pasta se não existir.
- Nome: `GIA - <Título> - Aviso de entrega - <AAAA-MM-DD>.html`. Numa
  atualização de um módulo só, o título leva a versão: `Dashboard de Contas 0.1.4`.

Depois:

1. `perfis.mjs` — escreve a seção **Permissões por perfil** a partir da tabela.
   Rode de novo sempre que um público da tabela mudar.
2. `conferir.mjs` — corrija todo **ERRO**. Leia cada **ATENÇÃO** e decida: o
   aviso dos Dashboards de setembro deixou escapar um "handler", por exemplo.
3. `gerar-pdf.mjs` — se ele avisar que as fontes não carregaram, gere de novo (é
   rede).
4. Olhe as páginas do PDF: tabela partida no meio de uma linha, caixa órfã no
   topo de página, título no pé da página, perfil partido entre duas páginas.
   Corrija no HTML (`break-inside`, ordem dos blocos) e gere de novo. Sem o
   `pdftoppm`, as páginas viram imagem com o `pypdfium2` do Python
   (`PdfDocument(pdf)[i].render(scale=0.9).to_pil().save(...)`).

### 5. Entregar

Mostre o PDF a quem pediu (mande o arquivo, se houver ferramenta para isso; senão,
diga onde ele ficou) e diga em poucas linhas o que decidiu sem perguntar — o tipo
do aviso, as versões cobertas, o que ficou de fora. Público novo citado na
conversa entra em `references/publicos.md`.

Se o repositório registra o trabalho num gestor de tarefas (as instruções dele, no
`AGENTS.md` ou no `CLAUDE.md`, dizem), lance o tempo como elas mandam.
