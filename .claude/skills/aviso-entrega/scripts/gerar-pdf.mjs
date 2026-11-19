// Gera o PDF A4 de um aviso de entrega a partir do HTML, com o Edge (ou o Chrome)
// sem janela. O tamanho e as margens vêm do `@page` do próprio HTML.
//
//   node gerar-pdf.mjs "<caminho do aviso>.html"
//
// O PDF sai ao lado do HTML, com o mesmo nome.
//
// ── POR QUE PELO PROTOCOLO DE DEPURAÇÃO, E NÃO `--print-to-pdf` ─────────────
//
// O `--print-to-pdf` da linha de comando imprime quando a página carrega, sem
// garantia de que as fontes do Google Fonts já chegaram — com rede lenta, o PDF
// sai na fonte de reserva e ninguém percebe. Aqui o script abre a página, espera
// `document.fonts.ready` e só então imprime (`Page.printToPDF` com
// `preferCSSPageSize`), e avisa se IBM Plex Sans e Source Serif 4 não carregaram.
//
// Para conferir um PDF pronto, leia `/FontName` (e não `/BaseFont`): o Chromium
// embute as fontes da web como Type3, e só o `/FontName` traz o nome delas.
// Segoe UI e Times aparecendo junto é normal — são os poucos símbolos (setas)
// que as fontes do modelo não têm.
import { spawn } from 'node:child_process'
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const html = process.argv[2]
if (!html || !existsSync(html)) {
  console.error('Uso: node gerar-pdf.mjs "<aviso>.html" — arquivo não encontrado:', html)
  process.exit(1)
}
const entrada = resolve(html)
const saida = entrada.replace(/\.html?$/i, '.pdf')

if (typeof WebSocket === 'undefined') {
  console.error(`É preciso Node 22 ou mais novo (este é o ${process.version}).`)
  process.exit(1)
}

// Edge ou Chrome, onde costumam estar no Windows, no Mac e no Linux. Instalado em
// outro lugar: AVISO_NAVEGADOR=<caminho do executável>.
const navegador = [
  process.env.AVISO_NAVEGADOR,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  process.env.LOCALAPPDATA && join(process.env.LOCALAPPDATA, 'Google/Chrome/Application/chrome.exe'),
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/microsoft-edge',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].find((c) => c && existsSync(c))
if (!navegador) {
  console.error(
    'Nem o Edge nem o Chrome foram encontrados. Instale um dos dois, ou aponte o executável em AVISO_NAVEGADOR.'
  )
  process.exit(1)
}

const esperar = (ms) => new Promise((r) => setTimeout(r, ms))
const porta = 9500 + Math.floor(Math.random() * 400)
// Perfil descartável: com o perfil normal, um Edge já aberto pelo usuário
// "absorve" o comando e nada acontece.
const perfil = mkdtempSync(join(tmpdir(), 'aviso-pdf-'))
const processo = spawn(
  navegador,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    `--remote-debugging-port=${porta}`,
    `--user-data-dir=${perfil}`,
    'about:blank',
  ],
  { stdio: 'ignore' }
)

async function alvo() {
  for (let i = 0; i < 60; i++) {
    try {
      const lista = await (await fetch(`http://127.0.0.1:${porta}/json/list`)).json()
      const pagina = lista.find((t) => t.type === 'page')
      if (pagina) return pagina.webSocketDebuggerUrl
    } catch {
      // ainda subindo
    }
    await esperar(250)
  }
  throw new Error('O navegador sem janela não respondeu em 15 s.')
}

let ws
try {
  ws = new WebSocket(await alvo())
  await new Promise((ok, erro) => {
    ws.onopen = ok
    ws.onerror = erro
  })
  let id = 0
  const pendentes = new Map()
  const eventos = new Map()
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data)
    if (m.id && pendentes.has(m.id)) {
      const { ok, erro } = pendentes.get(m.id)
      pendentes.delete(m.id)
      m.error ? erro(new Error(m.error.message)) : ok(m.result)
    } else if (m.method && eventos.has(m.method)) {
      eventos.get(m.method)()
      eventos.delete(m.method)
    }
  }
  const enviar = (method, params = {}) =>
    new Promise((ok, erro) => {
      const n = ++id
      pendentes.set(n, { ok, erro })
      ws.send(JSON.stringify({ id: n, method, params }))
    })
  const quando = (evento) => new Promise((ok) => eventos.set(evento, ok))

  const inicio = Date.now()
  await enviar('Page.enable')
  const carregou = quando('Page.loadEventFired')
  await enviar('Page.navigate', { url: pathToFileURL(entrada).href })
  await Promise.race([carregou, esperar(20000)])
  if (process.env.AVISO_DEBUG) console.log('carregou em', Date.now() - inicio, 'ms')
  const { result } = await enviar('Runtime.evaluate', {
    expression: `Promise.race([
      document.fonts.ready.then(() => [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family)),
      new Promise(r => setTimeout(() => r(null), 15000)),
    ]).then(f => JSON.stringify(f ? [...new Set(f)] : null))`,
    awaitPromise: true,
    returnByValue: true,
  })
  const fontes = JSON.parse(result.value)
  if (process.env.AVISO_DEBUG) console.log('fontes prontas em', Date.now() - inicio, 'ms')
  const { data } = await enviar('Page.printToPDF', {
    preferCSSPageSize: true,
    printBackground: true,
    displayHeaderFooter: false,
  })
  const pdf = Buffer.from(data, 'base64')
  writeFileSync(saida, pdf)
  const paginas = (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) ?? []).length
  console.log(`PDF: ${saida}\n${paginas} página(s), ${(pdf.length / 1024).toFixed(0)} kB`)
  if (!fontes || !fontes.some((f) => /IBM Plex|Source Serif/i.test(f))) {
    console.log(
      'ATENÇÃO: as fontes do modelo (IBM Plex Sans, Source Serif 4) não carregaram — o PDF saiu com a fonte de reserva. Confira a internet e gere de novo.'
    )
  } else {
    console.log(`Fontes carregadas: ${fontes.join(', ')}`)
  }
  await Promise.race([enviar('Browser.close').catch(() => {}), esperar(2000)])
} catch (e) {
  console.error('O PDF não foi gerado:', e.message)
  process.exitCode = 1
} finally {
  try {
    ws?.close()
  } catch {
    // já fechado
  }
  processo.kill()
  await esperar(300)
  try {
    rmSync(perfil, { recursive: true, force: true })
  } catch {
    // o navegador pode ainda segurar o perfil; é pasta temporária
  }
  // Sem isto o Node fica preso às conexões abertas com o navegador por ~20 s.
  process.exit(process.exitCode ?? 0)
}
