// Acha a pasta de cada módulo pedido a partir da pasta de onde o script roda —
// pelo id do manifesto, pelo nome da pasta, pelo nome do menu ou por um pedaço
// dele, sem acento e sem caixa. Serve a um repositório com vários módulos (um por
// subpasta) e a um repositório que é o próprio módulo.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'

export const semAcento = (s) =>
  s
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim()

/** O valor de `nome: '...'` num arquivo de configuração TypeScript. */
export function campo(texto, nome) {
  const m = texto.match(new RegExp(`\\b${nome}:\\s*(['"\`])([\\s\\S]*?)\\1`))
  return m ? m[2].replace(/\s+/g, ' ').trim() : null
}

/** Todo módulo da SDK GIA (pasta com `src/module.ts`) na raiz e até dois níveis abaixo. */
export function modulosEm(raiz) {
  const achados = []
  const olhar = (pasta, fundo) => {
    const manifesto = join(pasta, 'src', 'module.ts')
    if (existsSync(manifesto)) {
      const t = readFileSync(manifesto, 'utf8')
      achados.push({
        pasta,
        id: campo(t, 'id') ?? basename(pasta),
        rotulo: campo(t, 'label'),
        grupo: campo(t, 'navGroup'),
      })
      return
    }
    if (fundo >= 2) return
    let nomes = []
    try {
      nomes = readdirSync(pasta)
    } catch {
      return
    }
    for (const nome of nomes) {
      if (nome === 'node_modules' || nome === 'dist' || nome.startsWith('.')) continue
      const p = join(pasta, nome)
      try {
        if (statSync(p).isDirectory()) olhar(p, fundo + 1)
      } catch {
        // sem acesso: segue
      }
    }
  }
  olhar(raiz, 0)
  return achados
}

/**
 * O módulo de um pedido. `{ modulo }` quando um só serve; `{ candidatos }`
 * quando nenhum ou mais de um serve — aí quem chamou pergunta qual.
 */
export function acharModulo(raiz, pedido) {
  const todos = modulosEm(raiz)
  const direto = resolve(raiz, pedido)
  if (existsSync(join(direto, 'src', 'module.ts'))) {
    const t = readFileSync(join(direto, 'src', 'module.ts'), 'utf8')
    return { modulo: { pasta: direto, id: campo(t, 'id') ?? basename(direto), rotulo: campo(t, 'label') }, candidatos: [] }
  }
  const alvo = semAcento(pedido)
  // O grupo do menu entra também: "ged" acha Trâmites e Dossiês, e aí se pergunta.
  const nomes = (m) => [m.id, basename(m.pasta), m.rotulo ?? '', m.grupo ?? ''].map(semAcento)
  const exatos = todos.filter((m) => nomes(m).includes(alvo))
  if (exatos.length === 1) return { modulo: exatos[0], candidatos: [] }
  if (exatos.length > 1) return { modulo: null, candidatos: exatos }
  const parciais = todos.filter((m) => nomes(m).some((n) => n.includes(alvo)))
  if (parciais.length === 1) return { modulo: parciais[0], candidatos: [] }
  return { modulo: null, candidatos: parciais }
}

/** Resolve todos os pedidos; imprime o que não se resolveu e devolve `null` nesse caso. */
export function resolverPedidos(raiz, pedidos) {
  const modulos = []
  let faltou = false
  for (const pedido of pedidos) {
    const { modulo, candidatos } = acharModulo(raiz, pedido)
    if (modulo) {
      modulos.push(modulo)
      continue
    }
    faltou = true
    if (candidatos.length === 0) {
      console.log(`Nenhum módulo serve para "${pedido}". Rode sem argumentos para ver a lista.`)
    } else {
      console.log(
        `Mais de um módulo serve para "${pedido}" — pergunte qual (ou se são todos):\n` +
          candidatos.map((m) => `  - ${m.id}${m.rotulo ? ` (${m.rotulo})` : ''}`).join('\n')
      )
    }
  }
  return faltou ? null : modulos
}
