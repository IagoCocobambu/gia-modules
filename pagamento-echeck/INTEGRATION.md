# INTEGRATION.md — handoff de `Pagamento eCheck` (`pagamento-echeck`)

## 1. Identificação

- **Módulo**: `pagamento-echeck` — Pagamento eCheck
- **Versão do pacote**: 0.1.2
- **Autor / contato**: Iago Pereira <iago.pereira@cocobambu.com>
- **Versão do SDK usada**: `@gia-cb/*` 0.1.0-alpha.70 (fixada)

## 2. Fontes de dados externas

Módulo **read-only** — não cria tabela nem migration no portal e não grava nada.

| Handler (`src/server/`) | Fonte                                                                           | Acesso                    |
| ----------------------- | ------------------------------------------------------------------------------- | ------------------------- |
| `lojas.ts`              | `ctx.empresas()` (Empresas com CNPJ do escopo que têm `locRefs.BIAPI` ou `TS2`) | —                         |
| `pagamentos.ts`         | `api-dw.cocobambu.com/payments/?loc_ref&start_date&end_date&limit=500&offset`   | `ctx.credencial('apidw')` |

### 2.1 Credenciais / integrações

- [ ] **Hub de Credenciais**: a `api-dw.cocobambu.com` já está cadastrada com id
      **`apidw`** (a mesma do Fechamento Maestro, do Reports Maestro e da Validação
      Fiscal). Falta liberar este módulo nela — o handler `pagamentos` declara
      `integracoes: ['apidw']`.
- Nenhum secret de Edge Function.

## 3. Posição no menu

- **Grupo**: `relatorios` (no legado a tela ficava em Relatórios).

| Tela      | path                | label            | ícone (lucide) | permissão              | faqId              |
| --------- | ------------------- | ---------------- | -------------- | ---------------------- | ------------------ |
| Principal | `/pagamento-echeck` | Pagamento eCheck | `CreditCard`   | `pagamento-echeck.ler` | `pagamento-echeck` |

## 4. Permissões

- `pagamento-echeck.ler` — consultar as transações, o resumo e os gráficos.
- `pagamento-echeck.exportar` — exportar em Excel.

## 5. Observações

- **Substitui** a tela Relatório de Pagamentos eCheck do legado
  (`TfrmRelECheckPayments`, que carregava o frontend `rel_echeck_payments` num
  `UniHTMLFrame`).
- **Segurança — token do legado**: o `view.relatorios.echeck.payments.pas` do
  legado tem um JWT da API do DW **escrito no código** e injetado no navegador
  (`window.__API_TOKEN`), com usuário e senha da API legíveis no payload. Este
  módulo não usa esse token (a credencial vem do hub, no servidor). Recomenda-se
  trocar a senha desse usuário da API e remover o token do código legado.
- **Código da loja** (PRD RN-1): o legado lia o `locref` da integração `TS2` em
  `gia.empresas_integracoes`. Aqui vale primeiro `locRefs.BIAPI` (os códigos BIAPI
  `'01 CB Go'`, `'13CBMa'`, `'17. CB R'`, `'27 CB Ma'`, `'54 cb mi'`, `'71 CB De'`
  foram conferidos na API) e, na falta, `locRefs.TS2`.
  - [ ] Confirmar que o BIAPI das Empresas tem o mesmo código que o TS2 do legado.
- **Período máximo**: 31 dias (o legado aceitava 6 meses, mas a API responde 500
  nesse volume). Uma loja × 31 dias ≈ 7 mil transações, ~10 s, ~3 MB.
- **Fora do escopo**: as telas de Fechamento iFood que vieram na mesma pasta do
  legado (`FECHAMENTO_IFOOD`) não fazem parte deste módulo.
