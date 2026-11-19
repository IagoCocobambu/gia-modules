// Levanta, do código, o que o aviso de entrega precisa de cada módulo — para não
// copiar nome, versão, chave ou caminho de menu de memória.
//
//   node levantar.mjs                       → lista os módulos do repositório
//   node levantar.mjs <modulo> [<modulo>...] → o levantamento de cada um
//
// Rode na raiz do repositório dos módulos. O módulo pode vir pelo id do
// manifesto, pelo nome da pasta, pelo nome do menu ou por um pedaço dele.
// Imprime, por módulo: rótulo, versão, menu, permissões (chave, descrição,
// árvore), versões do CHANGELOG, os documentos a ler e os avisos anteriores — com
// o responsável que aparece neles.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { basename, join, relative } from 'node:path'
import { campo, modulosEm, resolverPedidos } from './modulos.mjs'

const raiz = process.cwd()
const ler = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : '')
const pedidos = process.argv.slice(2)

if (pedidos.length === 0) {
  const todos = modulosEm(raiz)
  console.log(
    todos.length
      ? `Módulos em ${raiz}:\n` + todos.map((m) => `  - ${m.id}${m.rotulo ? ` — ${m.rotulo}` : ''}`).join('\n')
      : `Nenhum módulo (pasta com src/module.ts) em ${raiz} nem até dois níveis abaixo.`
  )
  process.exit(0)
}

const modulos = resolverPedidos(raiz, pedidos)
if (!modulos) process.exit(2)

function permissoes(texto) {
  const lista = []
  for (const m of texto.matchAll(/\{[^{}]*?key:\s*(['"])([^'"]+)\1[^{}]*?\}/g)) {
    const bloco = m[0]
    const descricao = bloco.match(/description:\s*(?:\n\s*)?(['"`])([\s\S]*?)\1/)
    const grupo = bloco.match(/groupPath:\s*\[([^\]]*)\]/)
    lista.push({
      chave: m[2],
      descricao: descricao ? descricao[2].replace(/\s+/g, ' ').trim() : null,
      groupPath: grupo
        ? grupo[1]
            .split(',')
            .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
            .filter(Boolean)
            .join(' › ')
        : null,
    })
  }
  return lista
}

// Um caminho de menu: nomes separados por " > " ou " › ". O nome são palavras com
// UM espaço entre elas e nenhum no fim — senão ele come o espaço de que a próxima
// seta precisa, e o caminho para no segundo nível. Cada nível começa com
// maiúscula, para a frase antes do caminho ("posição combinada em") não entrar.
const NOME = String.raw`\p{Lu}[\p{L}\p{N}_-]*(?: [\p{L}\p{N}_-]+)*`
const CAMINHO = new RegExp(String.raw`${NOME}(?:\s[>›]\s${NOME})+`, 'u')

/**
 * O caminho do menu, da fonte mais confiável para a menos: a tabela de mapa do
 * AGENTS.md (convenção do GiaModules), uma linha do INTEGRATION.md com "a > b",
 * ou o navGroup do manifesto com o rótulo — este último sem o sub-grupo.
 */
function menu(modulo, manifesto) {
  const agentes = ler(join(raiz, 'AGENTS.md'))
  const linha = agentes.split('\n').find((l) => l.startsWith(`| \`${modulo.id}\` `))
  if (linha) return { caminho: linha.split('|')[3].trim(), fonte: 'tabela de mapa do AGENTS.md' }
  // A linha que fala de menu e a seguinte ("O caminho no menu é\n**A > B > C**").
  const linhas = ler(join(modulo.pasta, 'INTEGRATION.md')).split('\n')
  const trecho = linhas
    .map((l, i) => (/menu/i.test(l) ? `${l} ${linhas[i + 1] ?? ''}`.match(CAMINHO) : null))
    .find(Boolean)
  if (trecho) {
    const completo = modulo.rotulo && trecho[0].endsWith(modulo.rotulo)
    return {
      caminho: trecho[0],
      fonte: completo ? 'INTEGRATION.md' : 'INTEGRATION.md — não termina no rótulo do módulo: confirme o caminho inteiro',
    }
  }
  const grupo = campo(manifesto, 'navGroup')
  if (grupo) {
    const rotuloDoGrupo = grupo
      .split('-')
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(' ')
    return { caminho: `${rotuloDoGrupo} > ${modulo.rotulo}`, fonte: 'navGroup do manifesto — o sub-grupo, se houver, não aparece: confirme' }
  }
  return { caminho: null, fonte: 'nenhuma — pergunte' }
}

/** Avisos (HTML com "aviso" no nome) que citam o módulo, em qualquer pasta do repositório. */
function avisosAnteriores(modulo) {
  const achados = []
  const olhar = (pasta, fundo) => {
    if (fundo > 4) return
    let nomes = []
    try {
      nomes = readdirSync(pasta)
    } catch {
      return
    }
    for (const nome of nomes) {
      if (nome === 'node_modules' || nome === 'dist' || nome.startsWith('.')) continue
      const p = join(pasta, nome)
      let st
      try {
        st = statSync(p)
      } catch {
        continue
      }
      if (st.isDirectory()) olhar(p, fundo + 1)
      else if (/aviso/i.test(nome) && /\.html?$/i.test(nome)) {
        const t = ler(p)
        if (t.includes(modulo.id) || (modulo.rotulo && t.includes(modulo.rotulo))) {
          const resp = t.match(/Respons[áa]vel<\/dt>\s*<dd>([^<]+)</)
          achados.push({ arquivo: relative(raiz, p), data: st.mtime, responsavel: resp ? resp[1].trim() : null })
        }
      }
    }
  }
  olhar(raiz, 0)
  return achados.sort((a, b) => b.data - a.data)
}

for (const modulo of modulos) {
  const manifesto = ler(join(modulo.pasta, 'src', 'module.ts'))
  const pacote = JSON.parse(ler(join(modulo.pasta, 'package.json')) || '{}')
  console.log(`\n══ ${modulo.id} ═══════════════════════════════════════════════`)
  console.log(`Pasta: ${relative(raiz, modulo.pasta) || '.'}`)
  console.log(`Rótulo (folha do menu): ${modulo.rotulo}`)
  console.log(`Versão: ${campo(manifesto, 'version')} (package.json: ${pacote.version})`)
  console.log(`Descrição no manifesto: ${campo(manifesto, 'description')}`)
  const m = menu(modulo, manifesto)
  console.log(`Menu: ${m.caminho ?? '(desconhecido)'}  [fonte: ${m.fonte}]`)

  const perms = permissoes(ler(join(modulo.pasta, 'src', 'permissions.ts')))
  console.log(`\nPermissões (${perms.length}):`)
  for (const p of perms) {
    console.log(`  - ${p.chave}\n      ${p.descricao ?? '(sem descrição)'}${p.groupPath ? `\n      árvore: ${p.groupPath}` : ''}`)
  }

  const versoes = (ler(join(modulo.pasta, 'CHANGELOG.md')).match(/^## .+$/gm) ?? []).slice(0, 8)
  console.log(`\nCHANGELOG (mais recentes primeiro):\n  ${versoes.join('\n  ') || '(sem CHANGELOG)'}`)

  const docs = ['PRD.md', 'INTEGRATION.md', 'README.md', 'src/faq.ts'].filter((d) => existsSync(join(modulo.pasta, d)))
  console.log(`\nPara ler: ${docs.map((d) => join(relative(raiz, modulo.pasta), d)).join(', ') || '(nenhum)'}`)

  const avisos = avisosAnteriores(modulo)
  console.log(
    `Avisos anteriores que citam o módulo: ${
      avisos.length
        ? '\n' +
          avisos
            .map((a) => `  ${a.arquivo}  (${a.data.toISOString().slice(0, 10)}${a.responsavel ? `, responsável: ${a.responsavel}` : ''})`)
            .join('\n')
        : 'nenhum — primeira entrega'
    }`
  )
  if (basename(modulo.pasta) !== modulo.id) console.log(`(a pasta se chama ${basename(modulo.pasta)}; o id é ${modulo.id})`)
}
