#!/usr/bin/env node
// Levantamento de um módulo GIA para a finalização (/finalizacao-modulo). Roda da raiz do repositório:
//   node <skill>/scripts/levantar.mjs <modulo>
// Sem argumento, lista os módulos. Só lê — não altera nada.
//
// Este script NÃO carrega regra nenhuma do SDK nem dos padrões do workspace. Ele
// diz o estado do módulo (versões, pacotes, SDK) e ONDE estão as fontes das
// regras (docs do SDK instalado, AGENTS.md), com o índice de cada uma, para que
// as regras sejam lidas de lá a cada revisão.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

const raiz = resolve(process.cwd())
const semAcento = (s) =>
  s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim()
const campo = (t, nome) => {
  const m = t.match(new RegExp(`\\b${nome}:\\s*(['"\`])([\\s\\S]*?)\\1`))
  return m ? m[2].replace(/\s+/g, ' ').trim() : null
}
const ler = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : null)
const json = (p) => JSON.parse(ler(p) ?? '{}')

function modulos() {
  const achados = []
  for (const nome of readdirSync(raiz)) {
    if (nome.startsWith('.') || nome === 'node_modules') continue
    const pasta = join(raiz, nome)
    const man = join(pasta, 'src', 'module.ts')
    if (!statSync(pasta).isDirectory() || !existsSync(man)) continue
    const t = readFileSync(man, 'utf8')
    achados.push({ pasta, nome, id: campo(t, 'id') ?? nome, rotulo: campo(t, 'label') ?? '' })
  }
  return achados
}

const pedido = process.argv.slice(2).join(' ').trim()
const todos = modulos()
if (!pedido) {
  console.log('Módulos do repositório:')
  for (const m of todos) console.log(`- ${m.id} (${m.rotulo}) → ${relative(raiz, m.pasta)}/`)
  process.exit(0)
}
const q = semAcento(pedido)
let cand = todos.filter((m) => [m.id, m.nome, m.rotulo].some((x) => semAcento(x) === q))
if (!cand.length)
  cand = todos.filter((m) => [m.id, m.nome, m.rotulo].some((x) => semAcento(x).includes(q)))
if (cand.length !== 1) {
  console.log(cand.length ? `Mais de um módulo serve para "${pedido}":` : `Nenhum módulo serve para "${pedido}". Módulos:`)
  for (const m of cand.length ? cand : todos) console.log(`- ${m.id} (${m.rotulo})`)
  process.exit(2)
}
const mod = cand[0]
const P = (...p) => join(mod.pasta, ...p)
const r = (p) => relative(raiz, p)

// ---------- estado do módulo ----------
const pkg = json(P('package.json'))
const lock = json(P('package-lock.json'))
const integ = ler(P('INTEGRATION.md')) ?? ''
const changelog = ler(P('CHANGELOG.md')) ?? ''
const versoes = {
  'package.json': pkg.version,
  'package-lock.json (raiz)': lock.version,
  'package-lock.json (packages[""])': lock.packages?.['']?.version,
  'src/module.ts': campo(ler(P('src', 'module.ts')) ?? '', 'version'),
  'INTEGRATION.md ("Versão do pacote")': integ.match(/Versão do pacote\*{0,2}:\s*([0-9][^\s<]*)/)?.[1],
  'CHANGELOG.md (1ª entrada)': changelog.match(/^##\s+\[?([0-9]+\.[0-9]+\.[0-9]+[^\s\]]*)/m)?.[1],
}
const pacotes = readdirSync(mod.pasta)
  .filter((f) => f.endsWith('.tgz'))
  .sort((a, b) => statSync(P(a)).mtimeMs - statSync(P(b)).mtimeMs)
const resumos = existsSync(P('docs')) ? readdirSync(P('docs')).filter((f) => /resumo.*\.txt$/.test(f)).sort() : []
const entregas = existsSync(P('entregas')) ? readdirSync(P('entregas')).sort() : []

console.log(`# ${mod.rotulo} (${mod.id}) — ${r(mod.pasta)}/\n`)
console.log('## Versões do módulo')
for (const [k, v] of Object.entries(versoes)) console.log(`- ${k}: ${v ?? '(não achei)'}`)
if (new Set(Object.values(versoes).filter(Boolean)).size > 1) console.log('  ⚠ versões diferentes entre os arquivos')
const empacotada = pkg.version && pacotes.find((f) => f.endsWith(`-${pkg.version}.tgz`))
console.log(`- Versão atual já empacotada: ${empacotada ? `sim (${empacotada})` : 'não'}`)
console.log(`- Pacotes na pasta: ${pacotes.join(', ') || 'nenhum'}`)
console.log(`- Avisos de entrega (entregas/): ${entregas.join(', ') || 'nenhum — pode ser a primeira entrega'}`)
console.log(`- Resumos anteriores (docs/): ${resumos.slice(-3).join(', ') || 'nenhum'}`)
console.log(`- Último resumo: ${resumos.length ? r(P('docs', resumos.at(-1))) : '—'}`)

// ---------- SDK ----------
const depsGia = Object.entries({ ...pkg.dependencies, ...pkg.devDependencies }).filter(([k]) => k.startsWith('@gia-cb/'))
const instalada = (nome) => json(P('node_modules', ...nome.split('/'), 'package.json')).version ?? '(não instalado — rode npm install)'
console.log('\n## SDK')
for (const [k, v] of depsGia) console.log(`- ${k}: pedido ${v}, instalado ${instalada(k)}`)
const outros = todos
  .filter((m) => m.id !== mod.id)
  .map((m) => `${m.id}: ${json(join(m.pasta, 'package.json')).dependencies?.['@gia-cb/sdk'] ?? '?'}`)
console.log(`- Outros módulos (@gia-cb/sdk): ${outros.join(' · ')}`)

// ---------- fontes das regras (só o índice; o conteúdo se lê lá) ----------
const indice = (arquivo, nivel) => {
  const t = ler(arquivo)
  if (!t) return null
  let emCodigo = false
  const titulos = t
    .split('\n')
    .map((l, i) => ({ l, i: i + 1 }))
    .filter(({ l }) => {
      if (/^\s*(```|~~~)/.test(l)) emCodigo = !emCodigo
      return !emCodigo && new RegExp(`^#{1,${nivel}}\\s`).test(l)
    })
    .map(({ l, i }) => `    ${i}: ${l.trim()}`)
  return { linhas: t.split('\n').length, titulos }
}
const mostrar = (arquivo, nivel) => {
  const ix = indice(arquivo, nivel)
  if (!ix) return console.log(`- ${r(arquivo)} (não existe)`)
  console.log(`- ${r(arquivo)} (${ix.linhas} linhas)`)
  for (const t of ix.titulos) console.log(t)
}

console.log('\n## Fontes das regras — leia daqui, não de memória')
const docs = P('node_modules', '@gia-cb', 'dev-shell', 'docs')
if (existsSync(docs)) {
  console.log(`\n### Docs do SDK instalado (${r(docs)}/)`)
  for (const f of readdirSync(docs).filter((f) => f.endsWith('.md')).sort()) mostrar(join(docs, f), 2)
} else {
  console.log('\n### Docs do SDK: não achei — rode npm install na pasta do módulo')
}
console.log('\n### Instruções do workspace e do módulo')
mostrar(join(raiz, 'AGENTS.md'), 3)
mostrar(P('AGENTS.md'), 2)
for (const extra of ['GIA-SDK-DOC.md']) if (existsSync(join(raiz, extra))) mostrar(join(raiz, extra), 2)
console.log('\n### Documentos do módulo')
for (const f of ['PRD.md', 'INTEGRATION.md', 'CHANGELOG.md', 'README.md', 'src/faq.ts', 'src/tour.ts']) {
  const t = ler(P(f))
  console.log(`- ${r(P(f))}${t ? ` (${t.split('\n').length} linhas)` : ' (não existe)'}`)
}
