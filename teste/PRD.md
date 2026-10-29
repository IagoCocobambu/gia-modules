# PRD — Teste

> Versão preenchida pra demonstrar o shape esperado. Substitua os
> exemplos pelo conteúdo real do seu módulo antes de `gia validate`.

---

## 1. Resumo executivo

**Teste** é um módulo de CRUD genérico que mantém uma lista de items
com nome, descrição e status (ativo/inativo). Serve como ponto de
partida pra módulos onde a regra principal é "lista + cadastro + edição".

A view principal exibe a lista com busca em tempo real, ordenação por
data de criação descendente, e ações inline por linha (editar/excluir)
gated por permissão. Cadastro e edição acontecem em modal com formulário
validado por Zod.

Substitua este resumo pela descrição do seu domínio real.

## 2. Problema / oportunidade

**Hoje** o time precisa manter uma lista de [DOMÍNIO] em planilha
compartilhada, com risco de divergência e sem controle de quem alterou
o quê.

**Teste** centraliza esse cadastro no portal, com permissões
granulares e auditoria via Supabase.

## 3. Solução proposta

- Lista única por user (filtrada por RLS do Supabase)
- CRUD básico: criar, editar, ativar/desativar, excluir
- Busca por nome em tempo real
- Validação de schema em escrita (Zod no front, constraints no DB)
- Permissões separadas pra ler/criar/editar/excluir

Out of scope na v1: import/export de planilha, histórico de alterações,
notificações realtime de mudanças.

## 4. Personas

| Persona         | Acesso típico                                 |
| --------------- | --------------------------------------------- |
| Visitante       | nada (módulo não aparece na sidebar)          |
| Leitor          | `teste.ler` — vê a lista                      |
| Editor          | adicionalmente `teste.criar` + `teste.editar` |
| Admin do módulo | tudo, incluindo `teste.excluir`               |

## 5. Telas / fluxos

### 5.1 Mapa de telas

- `/teste` — lista principal (DataReport com busca + ações inline)
- Modal de criar/editar (FormModal sobre a lista)
- Diálogo de confirmação de exclusão (ConfirmDialog)

### 5.2 Fluxos críticos

**Criar item:**

1. Botão "Novo" no header → modal abre vazio
2. Preenche **Nome** (obrigatório, 2-120 chars) e **Descrição** (opcional, até 500 chars)
3. Switch "Ativo" liga/desliga
4. Salvar → mutation cria → toast de sucesso → modal fecha → lista refresh

**Editar item:**

1. Ícone de lápis na linha → mesmo modal pré-populado
2. Mudanças válidas → salvar → toast → modal fecha → lista refresh

**Excluir item:**

1. Ícone de lixeira → ConfirmDialog com nome do item
2. Confirmar → mutation delete → toast → linha some

## 6. Permissões

| Chave           | Descrição                   | Grupo padrão    |
| --------------- | --------------------------- | --------------- |
| `teste.ler`     | Ver a lista                 | Teste › Leitura |
| `teste.criar`   | Criar novos registros       | Teste › Escrita |
| `teste.editar`  | Editar registros existentes | Teste › Escrita |
| `teste.excluir` | Remover registros           | Teste › Escrita |

Editor típico recebe `.ler`+`.criar`+`.editar`. Excluir é restrito a
poucos pra evitar perda de dados acidental.

## 7. Dados

**Tabela:** `teste_items`

| Coluna      | Tipo                               | Notas              |
| ----------- | ---------------------------------- | ------------------ |
| `id`        | int8 PK                            | identity           |
| `nome`      | text not null                      | mín 2, máx 120     |
| `descricao` | text                               | opcional, máx 500  |
| `ativo`     | bool not null default true         |                    |
| `criado_em` | timestamptz not null default now() | índice descendente |

RLS necessária:

- SELECT: `teste.ler` na permissão efetiva
- INSERT: `teste.criar`
- UPDATE: `teste.editar`
- DELETE: `teste.excluir`

## 8. Integrações

Nenhuma na v1. Em fases futuras pode integrar com outros módulos via
FK ou eventos.

## 9. Riscos / dependências

- Sem confirmação no excluir → mitigado pelo ConfirmDialog
- Validação só no front → mitigado pelas constraints da tabela
- RLS mal configurada → leak de dados; testar com 2+ usuários

## 10. Métricas de sucesso

- Adoção: 80% dos usuários do grupo X usaram pelo menos uma vez em 30 dias
- Erros: zero exceptions reportadas no Sentry no fluxo principal
- Latência: P95 < 300ms na listagem

## 11. Out-of-scope

- Import/export (.xlsx)
- Histórico de alterações
- Realtime de mudanças
- Filtros por status/data adicionais

## 12. Insumos pra FAQ

Perguntas que o usuário real provavelmente fará:

1. "Como crio um item?" — Botão Novo no canto direito
2. "Como edito?" — Ícone de lápis na linha; precisa de `teste.editar`
3. "Como removo um item por engano?" — Ícone de lixeira; cuidado, não tem desfazer
4. "Como desativar sem perder o histórico?" — Switch Ativo no modal de edição
5. "A busca pesquisa em quais campos?" — Apenas no Nome, case-insensitive
6. "Vejo apenas alguns items, faltam vários" — Pode ser RLS — peça revisão do escopo
7. "Quem pode editar?" — Quem tem `teste.editar` no grupo dele

## 13. Insumos pra tour

3 elementos-chave da UI pra destacar na primeira visita:

1. **Header** — onde está o botão Novo (saber que existe)
2. **Botão Novo** — o gateway pra criar o primeiro item
3. **Lista com busca** — entender que ações inline existem (lápis/lixeira)

Esses 3 alvos já estão como `data-tour="teste-header"`, `data-tour="teste-novo"`,
`data-tour="teste-lista"` no JSX.

## 14. Roadmap futuro

- v0.2: filtro por status (ativo/inativo) na busca
- v0.3: histórico de alterações por item
- v0.4: import .xlsx
- v1.0: realtime — outros usuários veem novos items aparecendo
