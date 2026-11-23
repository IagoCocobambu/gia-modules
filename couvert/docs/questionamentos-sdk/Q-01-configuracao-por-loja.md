# Q-01 — Configuração de um módulo por loja (Empresa)

|                    |                                               |
| ------------------ | --------------------------------------------- |
| Módulo             | `couvert` — Couvert                           |
| SDK usado          | `@gia-cb/*` `0.1.0-alpha.71`                  |
| Data               | 19/11/2026                                    |
| Para               | Equipe de desenvolvimento do SDK / Portal GIA |
| Situação           | resolvido — SDK 0.1.0-alpha.72                |
| Bloqueia o módulo? | não — há solução provisória (seção 6)         |

## 1. Contexto

O Couvert mostra as mesas abertas de um salão e compara o número de pessoas com o
couvert artístico lançado no PDV. Para contar, o módulo precisa saber, **por loja**,
quais itens do cardápio são couvert e quais salões (centros de receita) a loja tem.
Hoje essa configuração fica em colunas da tabela de
Empresas do sistema anterior. É uma tela só de leitura.

## 2. O que precisamos

Ler no servidor, para a Empresa do pedido, uma configuração simples do módulo:

- lista de números de itens que contam como **couvert**;
- lista de **salões**: nome e número de cada um, numa ordem (o 1º é o padrão).

E que alguém do cadastro (não o módulo) mantenha esses valores quando a loja muda o
cardápio ou abre um salão.

## 3. Onde procuramos

| Onde                                                                     | O que encontramos                                                                                              | Por que não serve                                        |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `@gia-cb/sdk` `0.1.0-alpha.71` — `dist/server/index.d.ts` (`GiaEmpresa`) | `{ id, nome, razaoSocial, cnpj, tipoRegistro, icmsVinho, ativo, locRefs, ecs }`                                | não há campo livre nem configuração por módulo           |
| `GiaOperacao.integracoes` (`{ tipo, locRef, descricao }`)                | vínculo da operação por plataforma                                                                             | um identificador por vínculo; não guarda listas de itens |
| `ctx.credencial()` → `parametros`                                        | parâmetros da **integração**, iguais para todas as lojas                                                       | a configuração muda de loja para loja                    |
| `dev-shell/docs/api-reference.md`, `dados-externos.md`                   | `ctx.empresas()` "com a configuração do cadastro"; orientação de não manter tabela loja × plataforma no módulo | não cobre configuração própria de um módulo              |
| Outros módulos do workspace                                              | nenhum lê configuração por loja além de `locRefs`                                                              | —                                                        |

## 4. Impacto

Sem um lugar no portal, cada módulo com configuração por loja tem de ler o banco do
sistema anterior (dependência que deveria sumir com a migração) ou criar a própria
tabela e uma tela de edição, o que obriga a gravar dado, exige trava de teste e
espalha o mesmo cadastro por vários módulos.

## 5. Propostas

- **A** — Campos de configuração por Empresa declarados pelo módulo (no
  `defineModule`, com tipo e rótulo), editados no cadastro de Empresas do portal e
  lidos em `ctx.empresas()` → `empresa.config['couvert']`.
- **B** — Um campo `parametros` por vínculo de integração (`BIAPI`), editado no
  cadastro do vínculo, como já existe para a credencial.
- **C** — O portal migra essas colunas atuais para a sua tabela de Empresas e as
  expõe em `GiaEmpresa` (resolve só este caso).

## 6. Solução provisória no módulo

O handler lê `couv_progr` e `couv_rvc` do banco do GIA pelo helper
`sql` (`GIA_SERVER_DATABASE_URL`), só leitura, por Empresa. Até a credencial desse
banco chegar, usa uma configuração mockada no `gia dev`. A leitura fica numa função só
(`configuracaoDaLoja`), então trocar a origem quando o portal tiver a peça custa mudar
essa função.

## 7. Perguntas

1. O portal vai oferecer configuração por loja para módulos? (sim / não / previsão)
2. Se sim, o formato seria parecido com a proposta **A**, **B** ou **C**?
3. Até lá, ler essas colunas do banco do GIA em modo só leitura é aceitável?
4. Quem mantém hoje essas colunas quando a loja muda o cardápio, e esse time passa a
   manter no portal?

## 8. Resposta

19/11/2026 — time do Portal GIA: a alpha.72 traz `GiaEmpresa.couvert` (`programacao`,
`buffet`, `rvcs`), lido da aba Configurações do cadastro de Empresas (próximo da
proposta **C**). O módulo passou a usar esse campo e deixou de ler o banco do GIA.
