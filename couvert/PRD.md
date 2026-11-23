# PRD — Couvert (`couvert`)

| Campo                  | Valor                                                     |
| ---------------------- | --------------------------------------------------------- |
| **Versão do módulo**   | 0.1.0                                                     |
| **SDK version mínima** | `@gia-cb/*` 0.1.0-alpha.72 (fixada; `GiaEmpresa.couvert`) |
| **Menu**               | Simphony › Couvert (`navGroup: 'simphony'`)               |
| **Autor**              | Iago Pereira                                              |
| **Status**             | em homologação — 19/11/2026                               |

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
cheia e Exportar em Excel. Dados: `ctx.empresas()` (lojas, vínculo `BIAPI` e
configuração de couvert) e a BI do Simphony (`getLatestBusDt` + `getGuestChecks`) pela
credencial `simphony-bi`.

## 4. Personas

- **Gerente / maître do salão** (suposição) — confere o próprio salão no celular, tablet
  ou computador do caixa.
- **Supervisão de operações** (suposição) — consulta várias lojas no computador.

## 5. Telas / fluxos

### 5.1 Mapa de telas

| Tela    | path       | Permissão                                    |
| ------- | ---------- | -------------------------------------------- |
| Couvert | `/couvert` | `couvert.ler` (Exportar: `couvert.exportar`) |

### 5.2 Fluxos críticos

1. Abre a tela: vem com a última loja e RVC do usuário, sem pesquisar.
2. Escolhe loja e RVC → Pesquisar → cards das mesas abertas do dia de negócio.
3. Clica num chip (ex.: Divergentes) → só aquelas mesas; ordem Atenção põe as
   divergentes primeiro.
4. Corrige no PDV → Atualizar.
5. Exportar → planilha das mesas da tela, com o filtro ligado.
6. No celular: a barra recolhe ao pesquisar (padrão 1); Atualizar e Exportar acima das
   mesas.

## 6. Permissões

| Chave              | O que libera                                          |
| ------------------ | ----------------------------------------------------- |
| `couvert.ler`      | abrir a tela e consultar as mesas das lojas do escopo |
| `couvert.exportar` | baixar a planilha Excel das mesas da tela             |

Público sugerido: a definir pelo gestor.

## 7. Dados

Só leitura; sem tabela, migration ou banco externo.

- **Lojas**: `ctx.empresas()` do escopo, ativas, loja, com `locRefs.BIAPI`.
- **Configuração**: `empresa.couvert` — `programacao` (itens de couvert artístico),
  `buffet` (itens de buffet; vazio = sem buffet), `rvcs` (salões, o 1º é o padrão).
- **Mesas**: contas abertas do RVC no dia de negócio da loja; mesa = `tblName`,
  grupo = `tblNum`, pessoas = `gstCnt`, couvert/buffet = soma de `dspQty` dos itens
  configurados.
- **Regras de situação** (por contador): igual às pessoas = Tudo lançado; 0 = Sem
  lançamento; diferente ou mesa com 0 pessoas = Divergente. A mesa fica com a pior das
  duas (suposição R14).

## 8. Integrações

- BI do Simphony (Oracle Reporting & Analytics), credencial `simphony-bi` do hub —
  `getLatestBusDt` e `getGuestChecks`, uma loja e um RVC por pesquisa, tempo limite de
  120 s por chamada (a orientação era 60 s; ver INTEGRATION §5).

## 9. Riscos / dependências

| Risco                                                         | Mitigação                                                                     |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| BI lenta (2 s a 89 s medidos em 19/11/2026)                   | tempo limite de 120 s, 504 com Tentar de novo, sem repetição automática       |
| Módulo não liberado na `simphony-bi` depois de instalar       | INTEGRATION §2.1; a tela mostra a falha de acesso (403)                       |
| Loja sem configuração de couvert no cadastro                  | seletor mostra "Sem RVC configurado"; pesquisa responde 422 com o motivo      |
| Estorno com `dspQty` negativo não conferido                   | conferir na primeira conta com estorno (pendência com o time do Portal GIA)   |
| Regra de cor ainda a confirmar pelo time do Portal GIA        | regra do desenho do usuário (conceito §5); trocar em `src/regras.ts`          |
| Q-02 aberto: lembrar a última loja com `createPersistedStore` | só ids de loja e RVC; troca concentrada em `src/hooks/use-ultima-pesquisa.ts` |
| Não há BI de homologação                                      | módulo só lê; dado real em todos os ambientes                                 |

## 10. Métricas de sucesso

Uso por loja e turno; mesas divergentes encontradas antes do fechamento; tempo de
resposta da BI.

## 11. Out-of-scope

- A tela Dashboard do mesmo pacote legado (é o módulo `dashboard-simphony`).
- Alterar conta no Simphony; editar a configuração de couvert (fica no cadastro de
  Empresas do portal).
- Atualização automática (só com o time do Portal GIA, pelo volume na BI).

## 12. Insumos pra FAQ

Como pesquisar e o dia de negócio; como ler o card (couvert, mesa/grupo, pessoas,
buffet); cores e selos; chips, busca e ordem; Atualizar, Exportar e tela cheia;
celular; por que uma mesa não aparece; loja sem configuração; erros da BI.

## 13. Insumos pra tour

Loja e RVC → cards das mesas e cores → chips, busca, ordem, Atualizar e Exportar.

## 14. Critérios de aceite

- [ ] Só aparecem lojas do escopo com `BIAPI`; trocar de loja escolhe o 1º RVC dela.
- [ ] Pesquisar mostra as contas abertas do RVC no dia do `getLatestBusDt`.
- [ ] Card com cores e selos pelas regras do conceito §5; buffet só na loja com buffet.
- [ ] Chips contam a pesquisa inteira e filtram; zerado não filtra; Todas tira o filtro.
- [ ] Busca e ordem Mesa/Atenção funcionam juntas com o chip.
- [ ] Atualizar busca de novo e o "atualizado há" acompanha; nada se atualiza sozinho.
- [ ] Exportar baixa o Excel das mesas da tela, com o filtro no subtítulo; só com
      `couvert.exportar`.
- [ ] A tela abre com a última loja e RVC do usuário, sem pesquisar.
- [ ] No celular, a barra recolhe ao pesquisar e a seta reabre (padrão 1).
- [ ] Erro da BI mostra a `MensagemErro` com Tentar de novo, no lugar dos cards.
- [ ] `gia validate` sem erros.
