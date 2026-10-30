# INTEGRATION.md — handoff de `Fechamento Maestro` (`fechamento-maestro`)

## 1. Identificação

- **Módulo**: `fechamento-maestro` — Fechamento Maestro
- **Versão do pacote**: 0.1.0
- **Autor / contato**: Iago Pereira <iago.pereira@cocobambu.com>
- **Versão do SDK usada**: `@gia-cb/*` 0.1.0-alpha.66 (fixada)

## 2. Fontes de dados externas

Módulo **read-only** e **só API** — não cria tabela nem migration no portal e não
consulta nenhum banco.

| Handler (`src/server/`) | Fonte                                                                  | Acesso                    |
| ----------------------- | ---------------------------------------------------------------------- | ------------------------- |
| `lojas.ts`              | `ctx.empresas()` (Empresas do escopo com o nº da loja no nome)         | —                         |
| `fechamento.ts`         | `api-dw.cocobambu.com/Delivery/?loc_ref=<nº loja>&start_date&end_date` | `ctx.credencial('apidw')` |

### 2.1 Credenciais / integrações

- [ ] **Hub de Credenciais**: a `api-dw.cocobambu.com` já está cadastrada com id
      **`apidw`** (a mesma do Reports Maestro e da Validação Fiscal). Falta liberar
      este módulo nela — o handler `fechamento` declara `integracoes: ['apidw']`.
- Nenhum secret de Edge Function.

## 3. Posição no menu

- **Grupo sugerido**: `relatorios`

| Tela      | path                  | label              | ícone (lucide) | permissão                | faqId                |
| --------- | --------------------- | ------------------ | -------------- | ------------------------ | -------------------- |
| Principal | `/fechamento-maestro` | Fechamento Maestro | `ReceiptText`  | `fechamento-maestro.ler` | `fechamento-maestro` |

## 4. Permissões

- `fechamento-maestro.ler` — consultar o fechamento.
- `fechamento-maestro.exportar` — exportar em Excel.

## 5. Observações

- **Substitui** a tela Fechamento Diário Maestro do legado (`TfrmFechamentoMaestro`).
- **Sem cadastro de classificações**: o legado lia/gravava
  `gia_relatorios.formas_pagamento` no banco do Maestro. Por decisão do negócio o
  módulo usa só a API; a classificação Online/Adquirente/Offline é a regra fixa
  `REGRAS_PAGAMENTO` em `src/server/fechamento.ts` (PRD RN-4).
- **Número da loja**: vem do nome da Empresa (`"01.CB GOIANIA"` → `loc_ref=01`).
- **Volume/latência**: uma loja × até 31 dias (≈ 25 s / 3 MB no pior caso medido).
