# PRD — Couvert (`couvert`)

| Campo                  | Valor                                                     |
| ---------------------- | --------------------------------------------------------- |
| **Versão do módulo**   | 0.1.1                                                     |
| **SDK version mínima** | `@gia-cb/*` 0.1.0-alpha.72 (fixada; `GiaEmpresa.couvert`) |
| **Menu**               | Simphony › Couvert (`navGroup: 'simphony'`)               |
| **Autor**              | Iago Pereira                                              |
| **Status**             | em homologação — 24/11/2026                               |

O detalhe das regras, das decisões e dos componentes está em
[`docs/conceito.md`](docs/conceito.md); este PRD resume.

## 1. Resumo executivo

Tela que mostra, durante o turno, as **mesas abertas** de um salão (RVC) de uma loja e
confere o **couvert artístico** — e o **buffet**, na loja que tem — lançado no Simphony
contra o **número de pessoas** de cada mesa, para o gerente corrigir no PDV antes de
fechar a conta. Só leitura.

## 2. Problema / oportunidade

Couvert artístico é cobrado por pessoa. Mesa com 4 pessoas e 2 couverts são 2 couverts
que deixaram de ser cobrados; mesa aberta com 0 pessoas impede a conferência. A tela
Couvert do GIA antigo faz essa conferência e precisa ir para o portal novo.

## 3. Solução proposta

Um card por mesa aberta (desenho do usuário), com chips que contam e filtram as mesas
por situação, busca por mesa, ordem por mesa ou por atenção, Atualizar manual, tela
cheia. Dados: `ctx.empresas()` (lojas, vínculo `BIAPI` e
configuração de couvert) e a BI do Simphony (`getLatestBusDt` + `getGuestChecks`; nomes
por `getMenuItemDimensions` e `getEmployeeDimensions`) pela credencial `simphony-bi`. Tocar
num card abre o detalhe da conta da mesa.

## 4. Personas

- **Gerente / maître do salão** (suposição) — confere o próprio salão no celular, tablet
  ou computador do caixa.
- **Supervisão de operações** (suposição) — consulta várias lojas no computador.

## 5. Telas / fluxos

### 5.1 Mapa de telas

| Tela    | path       | Permissão     |
| ------- | ---------- | ------------- |
| Couvert | `/couvert` | `couvert.ler` |

### 5.2 Fluxos críticos

1. Abre a tela: vem com a loja 01 e o 1º RVC dela, sem pesquisar (quem não tem a 01 no
   escopo vê a última loja e RVC que pesquisou).
2. Escolhe loja e RVC → Pesquisar → cards das mesas abertas do dia de negócio.
3. Clica num chip (ex.: Divergentes) → só aquelas mesas; ordem Atenção põe as
   divergentes primeiro.
4. Toca num card → detalhe da conta: contadores, garçom, rodadas, último lançamento,
   pré-conta, valores e itens com assento, rodada e hora.
5. Corrige no PDV → Atualizar.
6. No celular: a barra recolhe ao pesquisar (padrão 1); situações numa lista; Atualizar e
   tela cheia acima das mesas.

## 6. Permissões

| Chave              | O que libera                                          |
| ------------------ | ----------------------------------------------------- |
| `couvert.ler`      | abrir a tela e consultar as mesas das lojas do escopo |
| `couvert.exportar` | nada — reservada, não atribuir (Q-03)                 |

Público sugerido (23/11/2026): `couvert.ler` para Gerentes, Diretores, Auditoria e
Administração/GIA; `couvert.exportar` para ninguém.

## 7. Dados

Só leitura; sem tabela, migration ou banco externo.

- **Lojas**: `ctx.empresas()` do escopo, ativas, loja, com `locRefs.BIAPI`.
- **Configuração**: `empresa.couvert` — `programacao` (itens de couvert artístico),
  `buffet` (itens de buffet; vazio = sem buffet), `rvcs` (salões, o 1º é o padrão).
- **Mesas**: contas abertas do RVC no dia de negócio da loja; mesa = `tblName`,
  grupo = `tblNum`, pessoas = `gstCnt`, couvert/buffet = soma de `dspQty` dos itens
  configurados.
- **Detalhe da conta**: `chkNum`, `opnLcl`, `lastTransLcl`, `empNum`, `numSrvcRd`,
  `numChkPrntd`, totais e `detailLines` com `menuItem`. O garçom vai como "Nome S.".
- **Regras de situação** (por contador): igual às pessoas = Tudo lançado; 0 = Sem
  lançamento; diferente = Divergente; mesa com 0 pessoas = Divergente se há lançamento,
  Sem pessoas (neutra) se não há. A mesa fica com a pior entre couvert e buffet
  (suposição R14); na loja sem buffet configurado, o buffet não conta.
- **Ordem Atenção**: Divergentes, Sem lançamento, Sem pessoas, Tudo lançado; dentro do
  grupo, o maior número de divergências (soma das diferenças dos contadores vermelhos);
  no empate, quem tem mais a lançar; por último, a mesa.

## 8. Integrações

- BI do Simphony (Oracle Reporting & Analytics), credencial `simphony-bi` do hub —
  `getLatestBusDt` (limite de 20 s) e `getGuestChecks` (120 s; a orientação era 60 s, ver
  INTEGRATION §5), uma loja e um RVC por pesquisa; `getMenuItemDimensions` e
  `getEmployeeDimensions` (120 s) só ao abrir o detalhe. Nenhum outro domínio é chamado.

## 9. Riscos / dependências

| Risco                                                                      | Mitigação                                                                               |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| BI lenta (2 s a 89 s medidos em 19/11/2026)                                | tempo limite de 120 s, 504 com Tentar de novo, sem repetição automática                 |
| Módulo não liberado na `simphony-bi` depois de instalar                    | INTEGRATION §2.1; a tela mostra a falha de acesso (403)                                 |
| Loja sem configuração de couvert no cadastro                               | seletor mostra "Sem RVC configurado"; pesquisa responde 422 com o motivo                |
| Estorno com `dspQty` negativo não conferido                                | conferir na primeira conta com estorno (pendência com o time do Portal GIA)             |
| Regra de cor ainda a confirmar pelo time do Portal GIA                     | regra do desenho do usuário (conceito §5); trocar em `src/regras.ts`                    |
| Q-02 aberto: lembrar a última loja com `createPersistedStore`              | só ids de loja e RVC; troca concentrada em `src/hooks/use-ultima-pesquisa.ts`           |
| Q-03 aberto: módulo só de leitura precisa de uma chave de ação             | `couvert.exportar` declarada como reservada, sem efeito; trocar ou tirar com a resposta |
| Q-04 aberto: teclado virtual nos terminais Oracle MICROS (WS 610, 625 e 8) | conferir nos aparelhos; escolher loja e RVC não exige digitar                           |
| Pré-conta (`numChkPrntd`) não vista numa conta real impressa               | campo vazio aparece como "não impressa"; conferir no salão                              |
| Valores e garçom visíveis com `couvert.ler`                                | permissão própria em aberto com o gestor                                                |
| Dia de negócio só na dica do mouse                                         | em tela de toque não aparece (decidido em 23/11/2026)                                   |
| Não há BI de homologação                                                   | módulo só lê; dado real em todos os ambientes                                           |

## 10. Métricas de sucesso

Uso por loja e turno; mesas divergentes encontradas antes do fechamento; tempo de
resposta da BI.

## 11. Out-of-scope

- A tela Dashboard do mesmo pacote legado (é o módulo `dashboard-simphony`).
- Alterar conta no Simphony; editar a configuração de couvert (fica no cadastro de
  Empresas do portal).
- Atualização automática (só com o time do Portal GIA, pelo volume na BI).

## 12. Insumos pra FAQ

1. Como pesquiso as mesas de um salão?
2. De que dia são as mesas? E depois da meia-noite?
3. Como leio o card (couvert, mesa/grupo, pessoas, buffet)?
4. O que querem dizer as cores e os selos −2, +1 e "sem pessoas"?
5. O que faço com uma mesa vermelha? E com uma amarela?
6. O que aparece no detalhe da conta? Por que às vezes vêm códigos no lugar dos nomes?
7. Como filtro por situação, busco uma mesa e ordeno por Atenção?
8. As mesas se atualizam sozinhas?
9. Por que uma mesa não aparece?
10. Quais itens contam como couvert e como buffet? Por que o buffet fica em 0?
11. Por que a tela já abre com uma loja escolhida?
12. Minha loja não aparece, ou aparece sem RVC ou sem itens de couvert. O que faço?
13. Como uso no celular e em tela cheia?
14. Apareceu um erro da BI. E agora?

## 13. Insumos pra tour

| #   | Tela    | Target            | Mensagem                                                |
| --- | ------- | ----------------- | ------------------------------------------------------- |
| 1   | Couvert | `couvert-filtros` | Escolha loja e RVC e clique em Pesquisar                |
| 2   | Couvert | `couvert-mesa`    | Como ler o card e as cores (espera as mesas aparecerem) |
| 3   | Couvert | `couvert-chips`   | Filtrar, buscar, ordenar por Atenção e Atualizar        |

## 14. Critérios de aceite

- [ ] Só aparecem lojas do escopo com `BIAPI`; trocar de loja escolhe o 1º RVC dela.
- [ ] Pesquisar mostra as contas abertas do RVC no dia do `getLatestBusDt`.
- [ ] Card com cores e selos pelas regras do §7; o buffet aparece sempre, mas só conta para a
      situação na loja com buffet configurado.
- [ ] Tocar no card abre o detalhe da conta; sem os nomes, aparecem os códigos.
- [ ] Filtro, busca e ordem reorganizam os cards com animação; com "reduzir movimento" no
      sistema, só esmaecem.
- [ ] Tela cheia no computador e no celular, com a saída sempre à vista.
- [ ] Layout sem quebra de 320 a 1440 px, antes e depois de pesquisar (padrão 19).
- [ ] A tela usa a largura toda, sem os botões de expandir das bordas.
- [ ] Chips contam a pesquisa inteira e filtram; zerado não filtra; Todas tira o filtro.
      No celular, o mesmo numa lista suspensa.
- [ ] Busca e ordem Mesa/Atenção funcionam juntas com o chip; Atenção põe primeiro as
      divergentes com mais divergências e desempata pela mesa.
- [ ] Atualizar busca de novo e o "atualizado há" acompanha; nada se atualiza sozinho.
- [ ] A tela não tem Exportar.
- [ ] A tela abre com a loja 01 e o 1º RVC dela, sem pesquisar; sem a 01 no escopo, com a
      última loja e RVC do usuário.
- [ ] No celular, a barra recolhe ao pesquisar e a seta reabre (padrão 1).
- [ ] Erro da BI mostra a `MensagemErro` com Tentar de novo, no lugar dos cards, e a barra
      de filtros volta à completa.
- [ ] `gia validate` sem erros.

## 15. Histórico

### 23/11/2026 — 0.1.0

- Primeira entrega.

### 24/11/2026 — 0.1.1

- A tela usa sempre a largura toda, sem os botões de expandir das bordas.
- Público das permissões definido.
