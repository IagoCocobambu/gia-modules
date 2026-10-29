# INTEGRATION.md — handoff de `Reports Maestro` (`reports-maestro`)

## 1. Identificação

- **Módulo**: `reports-maestro` — Reports Maestro
- **Versão do pacote**: 0.1.0
- **Autor / contato**: Iago Pereira <iago.pereira@cocobambu.com>
- **Versão do SDK usada**: `@gia-cb/*` 0.1.0-alpha.66 (fixada)

## 2. Fontes de dados externas

Módulo **read-only** — não cria tabela nem migration no portal.

| Handler (`src/server/`) | Fonte                                                                  | Acesso                    |
| ----------------------- | ---------------------------------------------------------------------- | ------------------------- |
| `lojas.ts`              | `ctx.empresas()` (Empresas do escopo com o nº da loja no nome)         | —                         |
| `pedidos.ts`            | `api-dw.cocobambu.com/Delivery/?loc_ref=<nº loja>&start_date&end_date` | `ctx.credencial('apidw')` |

### 2.1 Credenciais / integrações

- [ ] **Hub de Credenciais**: a `api-dw.cocobambu.com` já está cadastrada com id
      **`apidw`** (a mesma da Validação Fiscal). Falta liberar este módulo nela —
      o handler `pedidos` declara `integracoes: ['apidw']`.
- Nenhum secret de Edge Function.

## 3. Posição no menu

- **Grupo sugerido**: `relatorios`

| Tela      | path               | label           | ícone (lucide) | permissão             | faqId             |
| --------- | ------------------ | --------------- | -------------- | --------------------- | ----------------- |
| Principal | `/reports-maestro` | Reports Maestro | `Bike`         | `reports-maestro.ler` | `reports-maestro` |

## 4. Permissões

- `reports-maestro.ler` — consultar os pedidos.
- `reports-maestro.exportar` — exportar em Excel.

## 5. Observações

- **Substitui** a tela Reports Maestro do legado (`TfrmMaestroReports`). A outra
  tela da mesma pasta do legado, **Fechamento Diário Maestro**, não está neste pacote.
- **Número da loja**: vem do nome da Empresa (`"01.CB GOIANIA"` → `loc_ref=01`),
  como no legado. Empresa sem número no começo do nome não aparece.
- **Volume/latência**: uma loja × até 31 dias. Medido em 2026-10-29: 1 dia ≈ 2 s;
  31 dias da loja 01 ≈ 25 s / 2,8 MB / 2.578 pedidos. Acima de ~2 min a borda da API
  devolve 524 — por isso o limite de 31 dias e o timeout de 90 s no handler.
- **Dados pessoais**: a resposta traz CPF, email, telefone e endereço do cliente
  (como o legado). O acesso é por permissão + escopo de Empresa, checados no handler.
