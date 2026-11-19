# PRD — Dashboard Simphony (`dashboard-simphony`)

> Exemplo preenchido (template **rich-api**). Substitua pelo seu domínio antes
> de `gia pack`. Este PRD descreve o módulo de exemplo que consome uma API pública.

## 1. Resumo executivo

Dashboard Simphony é um módulo **read-only** que lista países vindos de uma **API pública
externa** (Banco Mundial) numa tabela com busca e exportação em CSV. Serve como
referência do padrão de **consumo de dados externos** do SDK.

## 2. Problema / oportunidade

Módulos frequentemente precisam de dados que **não** vivem no Postgres do portal
(APIs de terceiro, ERPs, DWs). Este módulo demonstra como fazer isso de forma
segura (segredo no servidor, sem CORS) e testável em dev.

## 3. Solução proposta

Um **handler server-side** (`src/server/paises.ts`) consome a API e devolve a
lista já pronta; a tela consome via `createServerClient().call()`. Em dev o
handler roda no Node; no deploy vira Edge Function.

## 4. Personas

- **Leitor** (`dashboard-simphony.ler`) — consulta a lista.
- **Exportador** (`dashboard-simphony.ler` + `dashboard-simphony.exportar`) — baixa o CSV.

## 5. Telas / fluxos

### 5.1 Mapa de telas

- `/dashboard-simphony` — tabela de países (busca, ordenação, export, estados loading/erro/vazio).

### 5.2 Fluxos críticos

1. **Listar**: abre a tela → handler busca a API → tabela popula.
2. **Buscar**: digita na busca → filtra país/região/capital em tempo real.
3. **Exportar**: clica em exportar → baixa CSV das linhas visíveis (se tem permissão).
4. **Erro**: API fora → estado de erro + "tentar de novo".

## 6. Permissões

| Chave | Descrição |
|---|---|
| `dashboard-simphony.ler` | Ver a lista de países |
| `dashboard-simphony.exportar` | Baixar o CSV |

## 7. Dados

Fonte: **API do Banco Mundial** (`GET https://api.worldbank.org/v2/country?format=json&per_page=300`).
Campos usados: nome, capital, região, nível de renda; a bandeira (emoji) é derivada
do ISO-2. Sem persistência no portal — o dado é lido a cada visita (cache de 5 min).

## 8. Integrações

- Handler `src/server/paises.ts` → Edge Function `dashboard-simphony-paises` (gerada no pack).
- **Sem segredo** (API pública). Se trocar por uma fonte com chave, ver `dados-externos.md`.

## 9. Riscos / dependências

- Disponibilidade da API externa (comunitária) — mitigado pelo estado de erro na UI.

## 10. Métricas de sucesso

- N/A (módulo de exemplo). Num módulo real: acessos/dia, taxa de erro da fonte.

## 11. Out-of-scope

- Cadastro/edição (é read-only). Combinar com dados do portal (é fonte 100% externa).

## 12. Insumos pra FAQ

Padrão de dados externos; busca; export; permissões; comportamento em erro. (Ver `src/faq.ts`.)

## 13. Insumos pra tour

Lista (frame), busca (toolbar), export (toolbar). (Ver `src/tour.ts`.)

## 14. Roadmap futuro

- Paginação server-side se a fonte crescer; múltiplas fontes; filtros por região.
