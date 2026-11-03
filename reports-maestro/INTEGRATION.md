# INTEGRATION.md — handoff de `Reports Maestro` (`reports-maestro`)

## 1. Identificação

- **Módulo**: `reports-maestro` — Reports Maestro
- **Versão do pacote**: 0.2.0
- **Autor / contato**: Iago Pereira <iago.pereira@cocobambu.com>
- **Versão do SDK usada**: `@gia-cb/*` 0.1.0-alpha.67 (fixada)

## 2. Fontes de dados externas

Módulo **read-only** — não cria tabela nem migration no portal.

| Handler (`src/server/`) | Fonte                                                                  | Acesso                    |
| ----------------------- | ---------------------------------------------------------------------- | ------------------------- |
| `lojas.ts`              | `ctx.empresas()` (nº da loja do `locRefs.BIAPI`, nome de reserva)      | —                         |
| `pedidos.ts`            | `api-dw.cocobambu.com/Delivery/?loc_ref=<nº loja>&start_date&end_date` | `ctx.credencial('apidw')` |

### 2.1 Credenciais / integrações

- [ ] **Hub de Credenciais**: a `api-dw.cocobambu.com` já está cadastrada com id
      **`apidw`** (a mesma da Validação Fiscal). Falta liberar este módulo nela —
      o handler `pedidos` declara `integracoes: ['apidw']`.
- Nenhum secret de Edge Function.

## 3. Posição no menu

- **Grupo**: `cardapio` (Plataformas) › subgrupo **Maestro** › Reports Maestro.
- [ ] O subgrupo **Maestro** é criado pelo time GIA na instalação.

| Tela      | path               | label           | ícone (lucide) | permissão             | faqId             |
| --------- | ------------------ | --------------- | -------------- | --------------------- | ----------------- |
| Principal | `/reports-maestro` | Reports Maestro | `Bike`         | `reports-maestro.ler` | `reports-maestro` |

## 4. Permissões

| Chave                               | O que libera                                                       |
| ----------------------------------- | ------------------------------------------------------------------ |
| `reports-maestro.ler`               | consultar os pedidos (dados pessoais do cliente mascarados)        |
| `reports-maestro.exportar`          | exportar em Excel                                                  |
| `reports-maestro.ver-dados-cliente` | ver CPF, e-mail, telefone e endereço completos, na tela e no Excel |

- [ ] Na instalação, as **três** chaves vão **só para o grupo Admin**. Os demais
      acessos são dados pelos gestores, pela tela de Grupos/Papéis.

## 5. Observações

- **Substitui** a tela Reports Maestro do legado (`TfrmMaestroReports`). A outra
  tela da mesma pasta do legado, **Fechamento Diário Maestro**, não está neste pacote.
- **Número da loja**: sai primeiro do vínculo da Empresa com a BI do Simphony
  (`locRefs.BIAPI`, que começa sempre pelo número: `'01 CB Go'`, `'17. CB R'`,
  `'13CBMa'`, `'65'`); o nome da Empresa (`"01.CB GOIANIA"`) fica de reserva. A mesma
  função `numeroDaLoja` está nos dois handlers. Empresa do escopo sem número em
  nenhum dos dois fica fora do seletor, sem aviso (são de grupos que ainda não têm
  CNPJ).
- **Dados pessoais**: sem `reports-maestro.ver-dados-cliente`, o handler `pedidos`
  devolve CPF (`***.456.789-**`), e-mail (`jo***@gmail.com`), telefone
  (`(11) *****-4321`), número e complemento do endereço (`***`) já **mascarados** —
  o dado completo não chega ao navegador; o Excel sai do mesmo dado. Nome do
  cliente e nome da rua ficam visíveis. Permissão + escopo de Empresa são checados
  no handler.
- **Campos adicionais da API** (0.1.1): tipo de entrega, entrega pela plataforma,
  entregue por, parceiro, taxa de entrega, taxa extra do parceiro, incentivos da
  loja e do parceiro, nº da loja e criação (UTC). Na tabela nascem **ocultos**
  (botão de colunas); no Excel vão no fim, depois das 26 colunas do legado. Nulo
  sai vazio, não zero.
- **Volume/latência**: uma loja × até 31 dias. Medido em 2026-10-29: 1 dia ≈ 2 s;
  31 dias da loja 01 ≈ 25 s / 2,8 MB / 2.578 pedidos. Acima de ~2 min a borda da API
  devolve 524 — por isso o limite de 31 dias e o timeout de 90 s no handler.
