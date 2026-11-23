# INTEGRATION.md — handoff de `Couvert` (`couvert`)

## 1. Identificação

- **Módulo**: `couvert` — Couvert
- **Versão do pacote**: 0.1.0
- **Autor / contato**: Iago Pereira <iago.pereira@cocobambu.com>
- **Versão do SDK usada**: `@gia-cb/*` 0.1.0-alpha.72 (fixada; mínimo para
  `GiaEmpresa.couvert`)
- **Substitui**: a tela Couvert do GIA antigo (`dashboard-e-couvert`,
  `view.simphony.simdash.couvert`). Só leitura: não há virada de gravação a combinar.

## 2. Fontes de dados

Módulo **read-only** — não cria tabela nem migration e não grava nada, nem no portal
nem no Simphony.

| Handler (`src/server/`) | Fonte                                                                                                                                                                                  | Acesso                          |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| `lojas.ts`              | `ctx.empresas()`: Empresas do escopo, ativas, `tipoRegistro = 'empresa'`, com `locRefs.BIAPI`; RVCs e buffet de `empresa.couvert`                                                      | —                               |
| `mesas.ts`              | BI do Simphony (Oracle Reporting & Analytics): `getLatestBusDt` `{ locRef }` e `getGuestChecks` `{ locRef, busDt, searchCriteria: contas abertas do RVC }`; itens de `empresa.couvert` | `ctx.credencial('simphony-bi')` |

Diferenças para o legado (para quem instala):

- O legado lia `couv_progr`, `couv_buffet` e `couv_rvc` de `gia.empresas` pelo banco do
  GIA e o token de `auth.token_bi` no banco do Simphony. Aqui a configuração vem de
  `empresa.couvert` (cadastro de Empresas do portal, aba Configurações) e o token do
  hub de Credenciais. **Nenhum banco externo** — sem `GIA_SERVER_DATABASE_URL`.
- O dia de negócio vem do `getLatestBusDt` (o legado usava a data do servidor e perdia
  as mesas do turno que passa da meia-noite).

### 2.1 Credencial e cadastro

- [ ] **Hub de Credenciais — `simphony-bi`**: já existe. Depois do `gia install`,
      liberar o módulo `couvert` nela. Até lá, `ctx.credencial` responde **403** e a
      tela mostra a falha de acesso.
- [ ] **Cadastro de Empresas**: cada loja que vai usar o Couvert precisa do vínculo
      `BIAPI` e da configuração de couvert (itens de programação artística, itens de
      buffet e RVCs). Loja sem RVC aparece no seletor como "Sem RVC configurado"; sem
      itens de programação, a pesquisa responde 422.
- [ ] **Sem secrets**: o módulo não lê variável de ambiente em produção.

### 2.2 Ambiente de teste

Não há BI de homologação: em homologação e no `gia dev` o dado é o real. O módulo só
lê, então não há trava de teste (padrão 12 não se aplica).

## 3. Posição no menu

- **Caminho**: Simphony › Couvert.
- **Grupo**: `simphony` (`navGroup` do manifest).

| Tela      | path       | label   | ícone (lucide) | permissão     | faqId     |
| --------- | ---------- | ------- | -------------- | ------------- | --------- |
| Principal | `/couvert` | Couvert | `music`        | `couvert.ler` | `couvert` |

## 4. Permissões e erros

- `couvert.ler` — consultar as mesas abertas e o couvert lançado em cada uma.
- `couvert.exportar` — baixar a planilha Excel das mesas da tela.
- `groupPath`: `['Simphony', 'Couvert']`. Público sugerido: **a definir** pelo gestor.

Status que o handler `mesas` devolve (a `MensagemErro` decide o texto por eles):

| Status | Quando                                                                             |
| ------ | ---------------------------------------------------------------------------------- |
| 403    | sem `couvert.ler`, Empresa fora do escopo, ou módulo não liberado na `simphony-bi` |
| 422    | loja sem `BIAPI`, RVC que não é da loja, loja sem itens de programação artística   |
| 424    | a BI recusou o token (401/403)                                                     |
| 502    | a BI respondeu com erro, não respondeu ou devolveu algo ilegível                   |
| 503    | credencial `simphony-bi` inativa ou indisponível no portal                         |
| 504    | a BI passou de 120 s (cada chamada)                                                |

Os detalhes técnicos (corpo da BI, stack) vão para o log com o prefixo `[couvert]`;
o token nunca vai para log, resposta ou navegador.

## 5. Observações

- **Volume na BI**: uma loja e um RVC por pesquisa, só contas abertas; sem atualização
  automática (só o botão Atualizar), conforme o time do Portal GIA (19/11/2026).
- [ ] **Tempo da Edge Function `couvert-mesas`**: o `getGuestChecks` levou de 2 s a
      89 s em 19/11/2026 (89 s, 77 s e 8,5 s seguidos às 17h, um RVC de Campinas). O
      handler espera até **120 s** por chamada (a orientação era 60 s, que reprovava a
      maioria das pesquisas no horário de movimento). Confirmar que a função aceita
      ~125 s (limite da plataforma: 150 s). Passou disso: 504 e Tentar de novo.
- **Última loja pesquisada**: guardada no navegador por usuário via
  `createPersistedStore` do SDK (só ids de loja e RVC) — questionamento Q-02 em aberto.
- **Pendências com o time do Portal GIA**: regra de cor (desenho do usuário em
  `docs/conceito.md` §5), estorno (se `dspQty` vem negativo na linha estornada — ainda
  não houve conta com estorno para conferir), público das permissões.
