# INTEGRATION.md — handoff de `Couvert` (`couvert`)

> **Preenchido pelo parceiro, consumido pelo time GIA.** É o checklist do que
> falta pra "plugar" o módulo no portal real depois do `gia install`. Preencha
> antes de rodar `gia pack` — ele viaja dentro do `.tgz`.

## 1. Identificação

- **Módulo**: `couvert` — Couvert
- **Versão do pacote**: <!-- ex: 0.1.0 -->
- **Autor / contato**: Iago Pereira <iago.pereira@cocobambu.com>
- **Versão do SDK usada**: `@gia-cb/*` <!-- ex: 0.1.0-alpha.18 -->

## 2. Fonte de dados externa

Este módulo é **read-only sobre uma fonte externa** — não cria tabela nem
migration no portal.

- **Fonte**: <!-- ex: API do Banco Mundial (https://api.worldbank.org) / API interna / DW -->
- **Handler(s)** em `src/server/`: <!-- ex: paises.ts -->
- **Edge Function(s) gerada(s)** pelo `gia pack`: `edge-functions/couvert-<nome>/`
  (o `_meta.json` lista os `secrets_required`).

### 2.1 Secrets a configurar (o time GIA seta na Edge Function)

Liste os nomes que o handler lê via `env(...)`. Neste template (Banco Mundial)
**não há segredo**. Se sua fonte exigir:

- [ ] `MINHA_API_KEY` — <!-- pra que serve, como obter -->
- [ ] `GIA_SERVER_DATABASE_URL` — <!-- se for DB externo -->

## 3. Posição no menu

- **Grupo sugerido**: <!-- ex: 'relatorios' | 'integracoes' | grupo novo -->

**Telas** (o host wira cada uma na NAV_TREE). Este template tem 1 tela; um módulo
com **várias telas agrupadas** lista 1 linha por tela (ver conventions §18):

| Tela | path | label | ícone (lucide) | permissão | faqId |
|---|---|---|---|---|---|
| Principal | `/couvert` | Couvert | `utensils` | `couvert.ler` | `couvert` |

## 4. Permissões

- `couvert.ler` — ver a lista.
- `couvert.exportar` — baixar CSV.

O host seeda as chaves do manifest em `public.permissoes` no install.

## 5. Observações

<!-- Rate limit da API? Latência esperada? Volume? Qualquer coisa que o time GIA
precise saber pra operar a Edge Function em produção. -->
