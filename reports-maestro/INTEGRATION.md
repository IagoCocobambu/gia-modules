# INTEGRATION.md — handoff de `Reports Maestro` (`reports-maestro`)

## 1. Identificação

- **Módulo**: `reports-maestro` — Reports Maestro
- **Versão do pacote**: 0.3.1
- **Autor / contato**: Iago Pereira <iago.pereira@cocobambu.com>
- **Versão do SDK usada**: `@gia-cb/*` 0.1.0-alpha.70 (fixada)

## 2. Fontes de dados externas

Módulo **read-only** — não cria tabela nem migration no portal.

| Handler (`src/server/`) | Fonte                                                                                                                                                                    | Acesso                    |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------- |
| `lojas.ts`              | `ctx.empresas()` (nº da loja do `locRefs.BIAPI`, nome de reserva)                                                                                                        | —                         |
| `pedidos.ts`            | `api-dw.cocobambu.com/Delivery/?loc_ref=<nº loja>&start_date&end_date&incluir_historico=true` — a lista de pedidos **e** o resumo do dashboard Operacional, numa chamada | `ctx.credencial('apidw')` |

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
  função `numeroDaLoja` está no handler `pedidos`. O seletor lista
  todas as Empresas do escopo com `tipoRegistro = 'empresa'` (com CNPJ); loja sem
  número aparece, e a pesquisa responde 422 avisando que falta o número no cadastro.
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
  31 dias da loja 01 ≈ 25 s / 2,8 MB / 2.578 pedidos sem o histórico — com ele
  (desde a 0.3.0, ver abaixo), ~42 s / 5,3 MB no pior caso medido. Acima de ~2 min a
  borda da API devolve 524 — por isso o limite de 31 dias e o timeout de 90 s no handler.
- **Dashboard Operacional** (0.3.0): aba ao lado de Pedidos, mesma loja e período.
  Não há handler próprio: o `pedidos` busca com `incluir_historico=true` (medido:
  loja 08, maio/26, 3.107 pedidos, ~42 s / 5,3 MB da API) e devolve, além da lista,
  um resumo por pedido (~700 KB), **sem dado pessoal do cliente**. Uma chamada só
  serve às duas abas: trocar de aba não busca de novo. Os gráficos são SVG com
  tokens do tema (base copiada do Dashboard do Plano de Contas); nenhuma
  dependência nova.
- **Tour das abas** (0.3.1): além do tour da tela (`tour.ts`, `module_id`
  `reports-maestro`, montado pelo portal), o módulo monta um segundo tour com
  `useTourGuide` + `useTourTabSync`, que troca de aba sozinho. Ele grava o
  progresso em `user_tour_progress` com **`module_id = 'reports-maestro:abas'`**
  (mesmo formato do exemplo `onboarding:editor` do SDK). Se o `mark_tour_step` do
  portal só aceitar id de módulo registrado, esse tour reaparece a cada visita —
  confirmar na instalação.
