// Monta a seção "Permissões por perfil" de um aviso de entrega a partir da tabela de
// permissões dele: a mesma informação, ao contrário — cada perfil (Diretores,
// Gerentes…) com todas as chaves que deve receber. Pedido do João em 23/10/2026: "uma
// versão reversa do que a gente já faz, só para ter outro tipo de visualização".
//
//   node perfis.mjs "<aviso>.html"
//
// A seção NÃO se escreve à mão: ela sai da tabela, para as duas nunca divergirem. O
// script grava entre os marcadores PERFIS:INICIO e PERFIS:FIM (do modelo); sem eles,
// põe a seção logo depois da seção Permissões. Também acrescenta o estilo da seção,
// se o aviso foi montado com um modelo anterior a ela. O conferir.mjs acusa quando a
// seção não bate com a tabela.
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

export const INICIO = '<!-- PERFIS:INICIO — gerado pelo perfis.mjs a partir da tabela de permissões; não edite à mão -->'
export const FIM = '<!-- PERFIS:FIM -->'
const MARCA_INICIO = /<!-- PERFIS:INICIO[\s\S]*?-->/
const MARCA_FIM = /<!-- PERFIS:FIM -->/

export const ESTILO = `
  /* ── permissões por perfil (gerado pelo perfis.mjs) ────────────────── */
  /* O título, a abertura e o primeiro perfil ficam juntos: sem isso, o título caía
     sozinho no pé da página (aviso do App CB, 23/10/2026). */
  .perfis-abertura { break-inside: avoid; }
  .perfil { border-top: 0.75pt solid var(--rule); padding: 10pt 0 4pt; break-inside: avoid; }
  .perfil:first-of-type { border-top: 0; padding-top: 2pt; }
  .perfil-cab { display: flex; align-items: center; gap: 8pt; margin: 0 0 7pt; }
  .perfil-cab .chip { font-size: 10pt; padding: 2pt 8pt; margin: 0; }
  .perfil-conta {
    font-family: 'IBM Plex Sans', 'Segoe UI', system-ui, sans-serif;
    font-size: 9.2pt;
    color: var(--muted);
  }
  /* Uma coluna por módulo, a mesma em todos os perfis: o módulo sem chave fica "—". */
  .perfil-modulos {
    display: grid;
    grid-template-columns: repeat(var(--colunas, 3), minmax(0, 1fr));
    gap: 2pt 20pt;
  }
  .perfil-rotulo {
    font-family: 'IBM Plex Sans', 'Segoe UI', system-ui, sans-serif;
    font-weight: 600;
    font-size: 8.2pt;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--roxo);
    margin: 0 0 3pt;
  }
  .perfil-chaves { list-style: none; margin: 0 0 6pt; padding: 0; }
  .perfil-chaves li { margin: 0 0 2pt; line-height: 1.35; }
  .perfil-chaves code { font-size: 9.4pt; }
  .perfil-nenhuma { color: var(--muted); }
  /* ── fim das permissões por perfil ── */
`

const semTags = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()

/**
 * Lê a tabela de permissões: os módulos (as linhas de grupo), as chaves e os perfis
 * de cada chave (os chips da última coluna), na ordem em que aparecem.
 */
export function lerTabela(html) {
  const tabela = html.match(/<table[\s\S]*?<\/table>/i)?.[0]
  if (!tabela) return null
  const linhas = tabela.match(/<tr[\s\S]*?<\/tr>/gi) ?? []
  const modulos = []
  let atual = null
  for (const tr of linhas) {
    if (/<tr[^>]*class="[^"]*\bgrupo\b/i.test(tr)) {
      const rotulo = semTags(tr.match(/class="grupo-rotulo"[^>]*>([\s\S]*?)<\/span>/i)?.[1] ?? '')
      atual = { rotulo, chaves: [] }
      modulos.push(atual)
      continue
    }
    const chave = tr.match(/<td[^>]*>\s*<code>([^<]+)<\/code>/i)?.[1]?.trim()
    if (!chave) continue
    const celulas = tr.match(/<td[\s\S]*?<\/td>/gi) ?? []
    const ultima = celulas[celulas.length - 1] ?? ''
    const perfis = [...ultima.matchAll(/<span class="chip ([^"]+)">([\s\S]*?)<\/span>/gi)].map((m) => ({
      classe: m[1].trim(),
      nome: semTags(m[2]),
    }))
    if (!atual) {
      atual = { rotulo: '', chaves: [] }
      modulos.push(atual)
    }
    atual.chaves.push({ chave, perfis })
  }
  return modulos
}

/** Cada perfil com as chaves dele, módulo a módulo. A Administração/GIA vai por último. */
export function perfisDaTabela(modulos) {
  const porNome = new Map()
  for (const m of modulos) {
    for (const { chave, perfis } of m.chaves) {
      for (const p of perfis) {
        if (!porNome.has(p.nome)) porNome.set(p.nome, { ...p, modulos: new Map() })
        const perfil = porNome.get(p.nome)
        if (!perfil.modulos.has(m.rotulo)) perfil.modulos.set(m.rotulo, [])
        perfil.modulos.get(m.rotulo).push(chave)
      }
    }
  }
  const lista = [...porNome.values()]
  const ehAdmin = (p) => p.classe.includes('p-admin')
  return [...lista.filter((p) => !ehAdmin(p)), ...lista.filter(ehAdmin)]
}

const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`
const escapar = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** O HTML da seção, entre os marcadores. */
export function montarSecao(html) {
  const modulos = (lerTabela(html) ?? []).filter((m) => m.chaves.length > 0)
  if (modulos.length === 0) return null
  const perfis = perfisDaTabela(modulos)
  const variosModulos = modulos.length > 1
  const colunas = Math.min(modulos.length, 3)
  const blocos = perfis.map((p) => {
    const total = [...p.modulos.values()].reduce((s, l) => s + l.length, 0)
    // Todos os módulos, na ordem da tabela: o que o perfil não recebe fica "—", para
    // as colunas baterem de um perfil para o outro.
    const grupos = modulos
      .map(({ rotulo }) => {
        const chaves = p.modulos.get(rotulo) ?? []
        return (
          `        <div class="perfil-modulo">\n` +
          (variosModulos && rotulo ? `          <p class="perfil-rotulo">${escapar(rotulo)}</p>\n` : '') +
          `          <ul class="perfil-chaves">\n` +
          (chaves.length
            ? chaves.map((c) => `            <li><code>${escapar(c)}</code></li>`).join('\n')
            : `            <li class="perfil-nenhuma">—</li>`) +
          `\n          </ul>\n        </div>`
        )
      })
      .join('\n')
    return (
      `    <div class="perfil">\n` +
      `      <p class="perfil-cab"><span class="chip ${p.classe}">${escapar(p.nome)}</span><span class="perfil-conta">${plural(total, 'chave', 'chaves')}</span></p>\n` +
      `      <div class="perfil-modulos">\n${grupos}\n      </div>\n` +
      `    </div>`
    )
  })
  // O título, a abertura e o primeiro perfil numa caixa que não se parte.
  const [primeiro, ...resto] = blocos
  return (
    `${INICIO}\n` +
    `<section class="perfis" style="--colunas: ${colunas}">\n` +
    `  <div class="perfis-abertura">\n` +
    `  <h2>Permissões por perfil</h2>\n` +
    `  <p>A mesma tabela, vista ao contrário: cada perfil com todas as chaves que deve receber. É a lista para marcar no grupo de cada um no portal.</p>\n` +
    `${primeiro}\n` +
    `  </div>\n` +
    (resto.length ? `${resto.join('\n')}\n` : '') +
    `</section>\n` +
    `${FIM}`
  )
}

/** O aviso com a seção no lugar (e o estilo, se faltar). */
export function aplicar(html) {
  const secao = montarSecao(html)
  if (!secao) throw new Error('A tabela de permissões não foi encontrada no aviso.')
  let saida = html
  if (MARCA_INICIO.test(saida) && MARCA_FIM.test(saida)) {
    saida = saida.replace(/<!-- PERFIS:INICIO[\s\S]*?<!-- PERFIS:FIM -->/, () => secao)
  } else {
    // Logo depois da seção que tem o título Permissões.
    const titulo = saida.search(/<h2>\s*Permissões\s*<\/h2>/i)
    if (titulo < 0) throw new Error('A seção Permissões não foi encontrada no aviso.')
    const fimDaSecao = saida.indexOf('</section>', titulo) + '</section>'.length
    saida = saida.slice(0, fimDaSecao) + '\n\n' + secao + saida.slice(fimDaSecao)
  }
  // O estilo da seção: troca o que o aviso já tem (de uma versão anterior do script
  // ou do modelo) pelo atual, ou acrescenta, se faltar.
  const bloco = /  \/\* ── permissões por perfil \(gerado pelo perfis\.mjs\)[\s\S]*?(?:\/\* ── fim das permissões por perfil ── \*\/\n|\.perfil-chaves code \{[^}]*\}\n)/
  if (bloco.test(saida)) saida = saida.replace(bloco, () => ESTILO.replace(/^\n/, ''))
  else saida = saida.replace(/<\/style>/i, `${ESTILO}</style>`)
  return saida
}

/** A seção que está no aviso hoje (para o conferir.mjs comparar). */
export function secaoAtual(html) {
  return html.match(/<!-- PERFIS:INICIO[\s\S]*?<!-- PERFIS:FIM -->/)?.[0] ?? null
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const arquivo = process.argv[2]
  if (!arquivo || !existsSync(arquivo)) {
    console.error('Uso: node perfis.mjs "<aviso>.html"')
    process.exit(1)
  }
  const html = readFileSync(arquivo, 'utf8')
  const saida = aplicar(html)
  writeFileSync(arquivo, saida, 'utf8')
  for (const p of perfisDaTabela(lerTabela(saida))) {
    const total = [...p.modulos.values()].reduce((s, l) => s + l.length, 0)
    console.log(`${p.nome.padEnd(22)} ${plural(total, 'chave', 'chaves')}`)
  }
  console.log('\nSeção "Permissões por perfil" gravada no aviso.')
}
