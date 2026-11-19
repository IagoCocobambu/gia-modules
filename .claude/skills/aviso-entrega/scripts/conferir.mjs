// Confere um aviso de entrega contra o código dos módulos que ele cobre.
//
//   node conferir.mjs "<aviso>.html" <modulo> [<modulo> ...]
//
// Rode na raiz do repositório dos módulos. O módulo pode vir pelo id, pela pasta
// ou pelo nome do menu, como no levantar.mjs.
//
// ERRO (sai com código 1): chave de permissão do módulo que falta no aviso, chave
// citada no aviso que o módulo não declara, marcador do modelo esquecido, seção
// "Permissões por perfil" que não bate com a tabela.
// ATENÇÃO (não bloqueia, mas leia): primeira pessoa, caminho de arquivo, jargão
// técnico, versão do pacote ausente, aviso sem a seção "Permissões por perfil".
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { resolverPedidos } from './modulos.mjs'
import { montarSecao, secaoAtual } from './perfis.mjs'

const [arquivo, ...pedidos] = process.argv.slice(2)
if (!arquivo || pedidos.length === 0 || !existsSync(arquivo)) {
  console.error('Uso: node conferir.mjs "<aviso>.html" <modulo> [<modulo> ...]')
  process.exit(1)
}
const modulos = resolverPedidos(process.cwd(), pedidos)
if (!modulos) process.exit(2)
const html = readFileSync(arquivo, 'utf8')
// O texto que o leitor vê: sem estilo, sem marcação, sem comentários.
const texto = html
  .replace(/<!--[\s\S]*?-->/g, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ')
  .replace(/\s+/g, ' ')

const erros = []
const atencao = []

for (const { id, pasta } of modulos) {
  const perms = existsSync(join(pasta, 'src', 'permissions.ts'))
    ? [...readFileSync(join(pasta, 'src', 'permissions.ts'), 'utf8').matchAll(/key:\s*['"]([^'"]+)['"]/g)].map((m) => m[1])
    : []
  if (perms.length === 0) atencao.push(`${id}: nenhuma permissão encontrada em src/permissions.ts`)
  for (const chave of perms) {
    if (!texto.includes(chave)) erros.push(`${id}: a chave ${chave} não aparece no aviso`)
  }
  // Chave citada no aviso com o prefixo do módulo, mas que ele não declara.
  const prefixo = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const citadas = new Set(texto.match(new RegExp(`\\b${prefixo}\\.[a-z0-9.-]*[a-z0-9]`, 'g')) ?? [])
  for (const c of citadas) {
    if (!perms.includes(c)) erros.push(`${id}: o aviso cita ${c}, que o módulo não declara`)
  }
  const pacote = existsSync(join(pasta, 'package.json')) ? JSON.parse(readFileSync(join(pasta, 'package.json'), 'utf8')) : {}
  if (pacote.version && !texto.includes(pacote.version)) {
    atencao.push(`${id}: a versão ${pacote.version} do pacote não aparece no aviso (numa atualização, ela deve aparecer)`)
  }
}

// "Permissões por perfil": sai da tabela pelo perfis.mjs, e tem de bater com ela.
{
  const atual = secaoAtual(html)
  const esperada = montarSecao(html)
  if (!atual) {
    atencao.push('o aviso não tem a seção "Permissões por perfil" — rode o perfis.mjs')
  } else if (!esperada || atual.trim() !== esperada.trim()) {
    erros.push('a seção "Permissões por perfil" não bate com a tabela — rode o perfis.mjs de novo')
  }
}

// Marcadores do modelo que ficaram para trás.
for (const m of html.match(/\{\{[^}]*\}\}|\bTODO\b|\bPREENCHER\b|\bXXX\b/g) ?? []) {
  erros.push(`marcador do modelo esquecido: ${m}`)
}

// Primeira pessoa: o aviso fala do módulo, não de quem o escreveu.
const primeiraPessoa = /\b(eu|fiz|fizemos|li|vou|vamos|achei|encontrei|consegui|acho que|não sei|nosso|nossa)\b/gi
for (const m of new Set(texto.match(primeiraPessoa) ?? [])) atencao.push(`primeira pessoa? "${m}"`)

// Caminho de arquivo e nome de código: quem lê o aviso não abre o repositório.
for (const m of new Set(texto.match(/\b[\w-]+\.(tsx?|mjs|md|sql|json)\b|\bsrc\/[\w/.-]+/g) ?? [])) {
  atencao.push(`nome de arquivo no texto: "${m}"`)
}
// Jargão que o gestor não precisa: só passa se for preciso para agir (diga por quê).
for (const m of new Set(texto.match(/\b(handler|endpoint|API|RPC|BFF|DataReport|schema|hook|commit|deploy|tgz)\b/gi) ?? [])) {
  atencao.push(`jargão técnico: "${m}" — mantenha só se o leitor precisar dele para agir`)
}
// Plural montado por concatenação ("1 lojas", "1 alteracaos").
for (const m of new Set(texto.match(/\b1 [a-zçãõé]+s\b/gi) ?? [])) atencao.push(`plural com 1? "${m}"`)

for (const e of erros) console.log(`ERRO     ${e}`)
for (const a of atencao) console.log(`ATENÇÃO  ${a}`)
console.log(erros.length === 0 ? `\nOK: ${modulos.length} módulo(s) conferido(s), ${atencao.length} ponto(s) de atenção.` : `\n${erros.length} erro(s).`)
process.exit(erros.length ? 1 : 0)
