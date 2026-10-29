# INTEGRATION.md — handoff de `Meu Modulo` (`meu-modulo`)

> **Preenchido pelo parceiro, consumido pelo time GIA.** É o checklist do que
> falta pra "plugar" o módulo no portal real depois do `gia install`. Sem isto,
> os pontos de conexão (fontes de dados, posição no menu, secrets) ficam
> implícitos e a integração trava. Preencha antes de rodar `gia pack` — ele
> viaja dentro do `.tgz`.

## 1. Identificação

- **Módulo**: `meu-modulo` — Meu Modulo
- **Versão do pacote**: <!-- ex: 0.1.0 -->
- **Autor / contato**: TBD
- **Versão do SDK usada**: `@gia-cb/*` <!-- ex: 0.1.0-alpha.7 -->

## 2. Banco de dados

### 2.1 Migrations incluídas (o parceiro entrega)

Liste os arquivos em `migrations/` e o que cada um cria (schema, tabelas, RLS,
triggers). O host renumera pra sequência global ao instalar.

- [ ] `migrations/0001_init.sql` — <!-- schema `mod_meu-modulo`, tabela `...`, RLS, trigger de histórico -->

### 2.2 Tabelas do HOST a conectar (o parceiro NÃO controla)

Se a UI consome dados que já existem no portal (catálogo de itens, lojas,
usuários…), aponte **de onde** vêm. A UI já está pronta, mas a **fonte** precisa
ser ligada pelo time GIA.

- [ ] <!-- ex: seletor de operação lê de `public.operacoes` — confirmar -->
- [ ] <!-- ex: catálogo de itens deve vir de `<fonte>` — A DEFINIR com o time GIA -->

## 3. Menu / navegação

- **Grupo pretendido**: <!-- ex: `operacional`. Se for grupo NOVO, diga o rótulo desejado. O host posiciona na NAV_TREE. -->

**Telas do módulo** (o host wira cada uma na NAV_TREE). Módulo de 1 tela = 1 linha;
módulo com **várias telas agrupadas** = 1 linha por tela (ver conventions §18):

| Tela | path | label | ícone (lucide) | permissão | faqId |
|---|---|---|---|---|---|
| Principal | `/meu-modulo` | Meu Modulo | `box` | `meu-modulo.ler` | `meu-modulo` |
<!-- | Config | /meu-modulo/config | Config | Settings | meu-modulo.config.ler | meu-modulo-config | -->

## 4. Edge functions & secrets

- [ ] Funções em `edge-functions/` (se houver) — nome + o que fazem
- [ ] Secrets necessários (**nomes**, nunca os valores): <!-- ex: `PARCEIRO_API_TOKEN` -->

## 5. Permissões declaradas

Confirme as chaves de `src/permissions.ts` (o host reconcilia a partir do
manifest). <!-- ex: `meu-modulo.ler`, `meu-modulo.editar` -->

## 6. Realtime (se usar)

- [ ] Canais subscritos + payloads esperados

## 7. Pendências / decisões abertas pro time GIA

- [ ] <!-- ex: RLS das tabelas está `using (true)` (gate no app) — validar se é aceitável ou se deve checar a permissão efetiva server-side. -->
- [ ] <!-- ex: colunas monetárias em `real` vs `numeric(10,2)`. -->
