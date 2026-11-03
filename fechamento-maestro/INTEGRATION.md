# INTEGRATION.md — handoff de `Fechamento Maestro` (`fechamento-maestro`)

## 1. Identificação

- **Módulo**: `fechamento-maestro` — Fechamento Maestro
- **Versão do pacote**: 0.2.1
- **Autor / contato**: Iago Pereira <iago.pereira@cocobambu.com>
- **Versão do SDK usada**: `@gia-cb/*` 0.1.0-alpha.67 (fixada)

## 2. Fontes de dados externas

Módulo **read-only** — não cria tabela nem migration no portal e não grava nada.

| Handler (`src/server/`) | Fonte                                                                  | Acesso                            |
| ----------------------- | ---------------------------------------------------------------------- | --------------------------------- |
| `lojas.ts`              | `ctx.empresas()` (Empresas do escopo com o nº da loja no nome)         | —                                 |
| `fechamento.ts`         | `api-dw.cocobambu.com/Delivery/?loc_ref=<nº loja>&start_date&end_date` | `ctx.credencial('apidw')`         |
| `fechamento.ts`         | banco do Maestro: `SELECT` em `gia_relatorios.formas_pagamento`        | `sql` (`GIA_SERVER_DATABASE_URL`) |

### 2.1 Credenciais / integrações

- [ ] **Hub de Credenciais**: a `api-dw.cocobambu.com` já está cadastrada com id
      **`apidw`** (a mesma do Reports Maestro e da Validação Fiscal). Falta liberar
      este módulo nela — o handler `fechamento` declara `integracoes: ['apidw']`.
- [ ] **Secret `GIA_SERVER_DATABASE_URL`** da Edge Function: connection string
      do **banco do Maestro** (o mesmo `UniConnMaestro` do legado, onde fica o
      schema `gia_relatorios`). Use um usuário **só leitura** com `SELECT` em
      `gia_relatorios.formas_pagamento` — é a única tabela consultada.

## 3. Posição no menu

- **Grupo sugerido**: `relatorios`

| Tela      | path                  | label              | ícone (lucide) | permissão                | faqId                |
| --------- | --------------------- | ------------------ | -------------- | ------------------------ | -------------------- |
| Principal | `/fechamento-maestro` | Fechamento Maestro | `ReceiptText`  | `fechamento-maestro.ler` | `fechamento-maestro` |

## 4. Permissões

- `fechamento-maestro.ler` — consultar o fechamento.
- `fechamento-maestro.exportar` — exportar em Excel.
- `fechamento-maestro.ver-dados-cliente` — ver CPF, e-mail, telefone e endereço
  completos do cliente. Sem ela, esses campos chegam mascarados do servidor.
  Dado sensível: conceder só a quem precisa (ex.: atendimento).

## 5. Observações

- **Substitui** a tela Fechamento Diário Maestro do legado (`TfrmFechamentoMaestro`).
- **Cadastro de classificações só leitura**: o tipo de cada forma de pagamento
  (ONLINE / ONLINE VR / OFFLINE) segue a regra do legado (PRD RN-4), com a lista
  ONLINE VR lida de `gia_relatorios.formas_pagamento` a cada pesquisa. A tela de
  edição do cadastro (Admin/TI) não foi portada; o cadastro é mantido no banco.
- **Número da loja**: vem do nome da Empresa (`"01.CB GOIANIA"` → `loc_ref=01`).
- **Volume/latência**: uma loja × até 31 dias (≈ 25 s / 3 MB no pior caso medido).
