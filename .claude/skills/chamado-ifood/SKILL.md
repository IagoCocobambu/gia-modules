---
name: chamado-ifood
description: Monta o chamado para o chat do suporte do iFood (Portal do Desenvolvedor) sobre uma falha da API do iFood — o texto dos campos (tipo de solicitação, assunto, descrição, informações de impacto, aplicativo) e o PDF de evidências com os prints, sem IDs de merchant e sem nomes internos. Use quando o usuário chamar /chamado-ifood ou pedir "abre um chamado no iFood", "monta o texto pro suporte do iFood", "relatório da falha da API do iFood pro suporte".
argument-hint: [descrição curta da falha]
---

# Chamado no suporte do iFood

O chamado vai para **fora da empresa** (suporte do iFood). Quem lê é o time técnico do
iFood: quer **o erro deles, com evidência**, e nada sobre os nossos sistemas.

A falha vem em: $ARGUMENTS, e nos prints e mensagens da conversa. Responda sempre em
português.

## Os arquivos da skill

- `assets/modelo-evidencias.html` — modelo do PDF de evidências (placeholders `{{...}}`).
- `assets/exemplo-2026-11-17.html` — o chamado real de 17/11/2026 (503 "no healthy
  upstream"), como referência de tom e tamanho.
- `scripts/recorte.sh <print.png> <x> <y>` — mostra a região ampliada com régua, para
  achar onde está o ID no print.
- `scripts/tarja.sh <entrada.png> <saida.png> "x,y,w,h[,cor[,texto]]" ...` — tapa o ID
  com uma tarja **gravada na imagem**.
- `scripts/gerar-pdf.sh <arquivo.html>` — gera o PDF (Chromium do playwright) e recusa se
  sobrou UUID no texto.

## Passo a passo

1. **Levantar os fatos** (dos prints, do log, do usuário). Precisa de: data e hora
   (Brasília), API e endpoint, método, status, corpo da resposta, tempo de resposta,
   lojas e datas testadas, e se a chamada foi repetida **direto na API, fora do nosso
   sistema**.
   - Sem a chamada direta, peça ao usuário que a faça (Postman/Insomnia) e mande o
     print: é a prova de que o erro é do iFood.
   - **Refaça a chamada com `curl`** para pegar os cabeçalhos da resposta (o iFood rastreia
     pelo `x-request-id` / `x-ifood-request-id`). Token do `.env` de
     `fechamento-ifood-diario` ou `-mensal` (`node ../scripts/token-ifood.mjs --se-vencido`
     antes), lido para uma variável — **nunca** imprima o token. Use
     `curl -sS -o corpo.txt -D cab.txt -w 'status=%{http_code} tempo=%{time_total}s' --max-time 30`.
     Salve na pasta do chamado `requisicao-curl.txt`: o curl com `{merchantId}` e
     `<TOKEN>`, a hora (Brasília) e a resposta com os cabeçalhos úteis (`date`,
     `ifood-ratelimit-*`, `x-request-id`, `x-ifood-request-id`, `x-kong-*`, `cf-ray`) e o
     corpo. Exemplo: `docs/falha-api-ifood-2026-11-17/requisicao-curl.txt`.
   - Não invente o que não está nos prints. Horário que o print não mostra fica
     "no mesmo período".
2. **Separar o que é do iFood.** Só entra o erro deles:
   - entra: **5xx**; **401/403** com token recém-gerado; **429** com saldo de cota
     sobrando (cabeçalho `ifood-ratelimit-remaining`); resposta 200 com dado faltando.
   - não entra: **204** (período sem vendas, é o esperado), **401** com token que pode
     ter vencido do nosso lado (gerar outro e repetir antes), erros do portal (422, 424
     do módulo...). Se a conversa misturar casos, **pergunte** quais entram.
3. **Pasta do chamado**: `docs/falha-api-ifood-<aaaa-mm-dd>/` na raiz do workspace
   (se já existir no dia, sufixo `-2`). Copie o modelo para
   `falha-api-ifood-<aaaa-mm-dd>.html` e os prints como `print-1.png`, `print-2.png`...
   Os prints da conversa ficam em `<scratchpad>/../images/` (ver o caminho
   `source:` de cada imagem).
4. **Tirar os IDs dos merchants** — do texto e dos prints:
   - texto: na URL, `{merchantId}`; nas linhas de chamada, tire o merchant.
   - prints: `recorte.sh` para achar x/y (veja o PNG com Read e ajuste até a tarja
     cobrir o ID inteiro sem comer o caractere vizinho), depois `tarja.sh`. Cor da
     tarja = fundo do campo (tema escuro do cliente de API: `#1b1b1b`; JSON nos
     Detalhes técnicos do portal: `#1a2230`). Confira o resultado com `recorte.sh`.
   - ID só vai para o iFood se o suporte pedir — diga isso ao usuário.
5. **Preencher o HTML** (sem nenhum `{{` sobrando):
   - **Sem nomes internos**: nada de GIA, portal, módulo, handler, `/__gia/bff/...`,
     nomes de tela. Para o iFood é "nosso sistema". Print da nossa tela pode ir (é
     evidência), mas o texto em volta não explica a tela.
   - **Sem "o que fazer" nosso** (tentar de novo, abrir chamado, renovar token): é
     interno.
   - Só o que foi testado: "as consultas que testamos", não "todas".
   - Remova as seções do modelo que não têm evidência; acrescente uma por evidência
     extra.
6. **Gerar e conferir**: `gerar-pdf.sh <html>`. Veja o resultado (screenshot do HTML
   com o Chromium e Read) — nenhum ID, nenhum placeholder, prints legíveis, seção sem
   quebra no meio. Envie o PDF ao usuário (SendUserFile, `render`).
7. **Texto do chat** — entregue os campos abaixo, cada texto num bloco de código
   (para copiar).

## Campos do chat

**Tipo de solicitação:** `Incidente` para falha/erro da API. `Dúvidas` para
comportamento que não sabemos se é erro.

**Assunto** — uma linha: API, endpoint e erro.
```
API Financial v3 (/sales) retornando 503 "no healthy upstream"
```

**Descrição** — nesta ordem:
1. quando começou e o que acontece (status + corpo);
2. endpoint (com `{merchantId}`);
3. resposta: status, corpo, tempo, cabeçalhos relevantes (`ifood-ratelimit-*`,
   `x-request-id`, `x-ifood-request-id`, `cf-ray`, com a hora da chamada) e o `curl`
   (com `<TOKEN>` e `{merchantId}`);
4. "Fizemos a mesma chamada diretamente na API, fora do nosso sistema, e o retorno foi
   o mesmo." + por que entendemos que é do lado do iFood;
5. alcance testado (lojas, datas, páginas);
6. "Segue em anexo um PDF com os prints e os detalhes das chamadas."

**Informações de impacto** — o que deixamos de conseguir fazer e o processo parado
("o fechamento financeiro dos pedidos iFood das nossas lojas"), e o alcance do que foi
testado.

**Aplicativo** — o nome do aplicativo no Portal do Desenvolvedor iFood. Se não souber,
deixe `<nome do aplicativo no Portal do Desenvolvedor iFood>` e avise o usuário.

Depois dos campos, lembre em 1–2 linhas: anexar o PDF, guardar o número do chamado e a
resposta do iFood na pasta do chamado, e o que ficou para o usuário completar.

## Exemplo (17/11/2026)

**Descrição:**
```
Em 17/11/2026, por volta das 18h06 (horário de Brasília), as chamadas ao endpoint de vendas da API Financial v3 passaram a retornar 503 Service Unavailable, com o corpo "no healthy upstream".

Endpoint:
GET /financial/v3.0/merchants/{merchantId}/sales?beginSalesDate=2026-11-08&endSalesDate=2026-11-08&page=1

Resposta:
- Status: 503 Service Unavailable
- Corpo: no healthy upstream
- Tempo de resposta: 156 ms

Fizemos a mesma chamada diretamente na API, fora do nosso sistema, e o retorno foi o mesmo. Por isso entendemos que a falha está no gateway do iFood, que não encontrou um serviço disponível para atender. A resposta rápida (156 ms) indica que a requisição foi recusada na entrada, sem chegar a ser processada.

O erro aconteceu em mais de uma loja e em datas de venda diferentes (08/11/2026 e 16/11/2026), sempre na página 1.

Segue em anexo um PDF com os prints e os detalhes das chamadas.
```

**Informações de impacto:**
```
Não conseguimos consultar as vendas pela API Financial e, por isso, o fechamento financeiro dos pedidos iFood das nossas lojas fica parado enquanto o erro continuar. As consultas que testamos retornaram 503, independentemente da loja e do período.
```

Referência do que já se sabe da API (cota, 429, vendas sem `orderEvents`): memória
`ifood-financial-api-instabilidade`.
