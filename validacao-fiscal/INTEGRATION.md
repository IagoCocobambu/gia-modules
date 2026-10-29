# INTEGRATION.md — handoff de `Validação Fiscal` (`validacao-fiscal`)

## 1. Identificação

- **Módulo**: `validacao-fiscal` — Validação Fiscal
- **Versão do pacote**: 0.1.1
- **Autor / contato**: Iago Pereira <iago.pereira@cocobambu.com>
- **Versão do SDK usada**: `@gia-cb/*` 0.1.0-alpha.66 (fixada)

## 2. Fontes de dados externas

Módulo **read-only** — não cria tabela nem migration no portal.

| Handler (`src/server/`) | Fonte                                                                                                     | Acesso                                               |
| ----------------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `lojas.ts`              | `ctx.empresas()` (Empresas com `locRefs.BIAPI`)                                                           | —                                                    |
| `contas.ts`             | DW, schema `simphony_api_bi` (`guest_check`, `revenue_centers`, `order_types`, `operations_daily_totals`) | `sql` do SDK (`GIA_SERVER_DATABASE_URL`), só leitura |
| `notas.ts`              | `api-dw.cocobambu.com/invoices/?loc_ref=` (o mesmo `locRefs.BIAPI` das contas)                            | `ctx.credencial('apidw')`                            |

### 2.1 Credenciais / integrações

- [ ] **Hub de Credenciais**: a `api-dw.cocobambu.com` já está cadastrada com id
      **`apidw`** (o handler declara `integracoes: ['apidw']`). Falta liberar este
      módulo nela — feito pelo time GIA na instalação.
- [ ] `GIA_SERVER_DATABASE_URL` — DW (já conectado no portal, segundo o time de infra).

## 3. Posição no menu

- **Grupo sugerido**: `simphony`

| Tela      | path                | label            | ícone (lucide) | permissão              | faqId              |
| --------- | ------------------- | ---------------- | -------------- | ---------------------- | ------------------ |
| Principal | `/validacao-fiscal` | Validação Fiscal | `FileCheck`    | `validacao-fiscal.ler` | `validacao-fiscal` |

## 4. Permissões

- `validacao-fiscal.ler` — consultar a validação.
- `validacao-fiscal.exportar` — exportar em Excel.

Na instalação, as duas chaves vão só para o grupo **Admin**; os demais acessos são
dados pelos gestores, pela tela.

## 5. Observações

- Volume: uma loja × até 31 dias. A query usa o índice `(loc_ref, closed_bus_date)`.
- A API de notas é chamada **por `loc_ref`** (o mesmo `locRefs.BIAPI` usado nas
  contas do DW), uma vez por consulta. Contas e notas vêm da mesma loja por
  construção. Paridade com o legado conferida em 2026-10-28 (01 CB Go e 13 CB Ma).
- **Paridade** com a API legada `/checks/` deve ser registrada antes de liberar
  (ver `validacao-fiscal-v2/docs/infra-dw.md` §7).
