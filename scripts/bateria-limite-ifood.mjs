#!/usr/bin/env node
// Bateria de teste do LIMITE DE REQUISIÇÕES da API financeira do iFood (SÓ LEITURA).
//
// Mede em que número de chamadas simultâneas o iFood começa a devolver 429 ("muitas
// requisições"), para escolher o teto de trabalhadores do Fechamento iFood Mensal
// (`CONCORRENCIA` em `fechamento-ifood-mensal/src/hooks/use-consulta-mensal.ts`).
//
// ⚠️ Usa a credencial REAL do `.env` (GIA_DEV_CRED_IFOOD_*). O limite é da
// credencial: enquanto uma rodada estoura, outros sistemas que usam a mesma
// credencial podem levar 429 por alguns segundos. Rode em horário de pouco
// movimento. Nada é gravado em lugar nenhum — só GET em /sales.
//
// Como funciona:
//  1. Descoberta (2 chamadas por vez, com nova tentativa): a página 1 de cada
//     período de 8 dias de cada restaurante da loja, para saber quantas páginas há.
//  2. Rodadas: para cada nível de concorrência (padrão 3,4,5,6,8,10,12), dispara a
//     MESMA lista de páginas com N chamadas ao mesmo tempo, SEM nova tentativa — cada
//     429 aparece. Pausa entre rodadas para o limite esvaziar. Para sozinha quando
//     uma rodada passa do teto de 429.
//  3. Imprime a tabela e grava `bateria-limite-ifood-<data>.json` na pasta atual.
//
// Uso (na pasta do módulo, onde está o .env):
//   node ../scripts/bateria-limite-ifood.mjs --loja 17 --mes 2026-10
// Opções:
//   --loja <número>       número da loja (os restaurantes vêm do gia.config.ts)
//   --mes AAAA-MM         mês consultado (padrão: mês anterior)
//   --niveis 3,4,5,6,8    chamadas simultâneas a testar (padrão 3,4,5,6,8,10,12)
//   --paginas 150         máximo de páginas por rodada (padrão 150)
//   --pausa 90            segundos de pausa entre rodadas (padrão 90)
//   --parar 5             para quando o 429 passar desta % numa rodada (padrão 5)
//   --so-plano 1          só mostra o que seria testado e sai, SEM chamar a API

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, arr) => {
    if (a.startsWith('--')) acc.push([a.slice(2), arr[i + 1]])
    return acc
  }, [])
)
const sair = (msg) => {
  console.error(`[bateria] ${msg}`)
  process.exit(1)
}

// ── .env e gia.config.ts da pasta atual ─────────────────────────────────────
const envPath = resolve(process.cwd(), '.env')
if (!existsSync(envPath)) sair(`sem .env em ${process.cwd()} — rode na pasta do módulo.`)
const env = Object.fromEntries(
  readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .filter((l) => /^[A-Z0-9_]+=/.test(l))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim()])
)
const BASE = (env.GIA_DEV_CRED_IFOOD_BASE_URL || 'https://merchant-api.ifood.com.br').replace(/\/+$/, '')
const TOKEN = env.GIA_DEV_CRED_IFOOD_TOKEN
const SO_PLANO = Boolean(args['so-plano'])

const loja = String(Number(args.loja || '')).padStart(2, '0')
if (!args.loja) sair('informe --loja <número> (ex.: --loja 17).')
const cfgPath = resolve(process.cwd(), 'gia.config.ts')
if (!existsSync(cfgPath)) sair('sem gia.config.ts na pasta atual.')
const restaurantes = []
for (const m of readFileSync(cfgPath, 'utf8').matchAll(/operacao_ref: '([^']+)'[^\n]*?integracoes: \[(.*?)\]/g)) {
  const num = /^\s*(\d+)/.exec(m[1])
  if (!num || String(Number(num[1])).padStart(2, '0') !== loja) continue
  for (const r of m[2].matchAll(/tipo: 'IFOOD', locRef: '([^']+)'/g))
    restaurantes.push({ operacao: m[1], merchant: r[1].trim().toLowerCase() })
}
if (restaurantes.length === 0) sair(`nenhum restaurante iFood da loja ${loja} no gia.config.ts.`)

const hoje = new Date()
const mesPadrao = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1)
const mes = args.mes || `${mesPadrao.getFullYear()}-${String(mesPadrao.getMonth() + 1).padStart(2, '0')}`
const [ano, mesNum] = mes.split('-').map(Number)
const diasNoMes = new Date(ano, mesNum, 0).getDate()
const janelas = []
for (let d = 1; d <= diasNoMes; d += 8) {
  const fim = Math.min(d + 7, diasNoMes)
  const dd = (n) => `${mes}-${String(n).padStart(2, '0')}`
  janelas.push([dd(d), dd(fim)])
}
const niveis = (args.niveis || '3,4,5,6,8,10,12').split(',').map(Number).filter((n) => n > 0)
const MAX_PAGINAS = Number(args.paginas || 150)
const PAUSA_S = Number(args.pausa || 90)
const PARAR_PCT = Number(args.parar || 5)

const esperar = (ms) => new Promise((ok) => setTimeout(ok, ms))
const url = (merchant, ini, fim, pagina) =>
  `${BASE}/financial/v3.0/merchants/${encodeURIComponent(merchant)}/sales?beginSalesDate=${ini}&endSalesDate=${fim}&page=${pagina}`

/** Uma chamada, SEM nova tentativa. Devolve status, tempo e cabeçalhos de limite. */
async function chamar(u) {
  const t0 = performance.now()
  try {
    const r = await fetch(u, {
      headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(30_000),
    })
    const ms = performance.now() - t0
    const limite = {}
    for (const [k, v] of r.headers) if (/rate|limit|retry/i.test(k)) limite[k] = v
    let corpo = null
    if (r.ok && r.status !== 204) corpo = await r.json().catch(() => null)
    else await r.arrayBuffer().catch(() => null)
    return { status: r.status, ms, limite, corpo }
  } catch (e) {
    return { status: e?.name === 'TimeoutError' ? 'timeout' : 'rede', ms: performance.now() - t0, limite: {} }
  }
}

console.log(`[bateria] loja ${loja} · ${mes} · ${restaurantes.length} restaurantes: ${restaurantes.map((r) => r.operacao).join(', ')}`)
console.log(`[bateria] períodos: ${janelas.map(([a, b]) => `${a.slice(8)}–${b.slice(8)}`).join(', ')} · níveis: ${niveis.join(', ')} · até ${MAX_PAGINAS} páginas/rodada · pausa ${PAUSA_S} s · para acima de ${PARAR_PCT}% de 429`)
if (SO_PLANO) {
  console.log('[bateria] --so-plano: nenhuma chamada feita.')
  process.exit(0)
}
if (!TOKEN) sair('GIA_DEV_CRED_IFOOD_TOKEN vazio — rode `npm run token:ifood`.')
if (env.GIA_DEV_CRED_IFOOD_EXPIRES_AT && Date.parse(env.GIA_DEV_CRED_IFOOD_EXPIRES_AT) < Date.now() + 30 * 60_000)
  sair('o token do iFood vence em menos de 30 min — rode `npm run token:ifood` antes.')

// ── 1. Descoberta ───────────────────────────────────────────────────────────
console.log(`[bateria] descobrindo as páginas (2 chamadas por vez, com nova tentativa)…`)
const paginas = []
const itensDescoberta = restaurantes.flatMap((r) => janelas.map(([ini, fim]) => ({ ...r, ini, fim })))
for (let i = 0; i < itensDescoberta.length; i += 2) {
  await Promise.all(
    itensDescoberta.slice(i, i + 2).map(async (it) => {
      for (let t = 0; t < 5; t++) {
        const r = await chamar(url(it.merchant, it.ini, it.fim, 1))
        if (r.status === 429) {
          await esperar((Number(r.limite['retry-after']) || 2) * 1000)
          continue
        }
        const total = r.status === 200 ? Number(r.corpo?.pageCount) || 1 : 0
        for (let p = 1; p <= total; p++) paginas.push({ ...it, pagina: p })
        return
      }
    })
  )
}
const lista = paginas.slice(0, MAX_PAGINAS)
console.log(`[bateria] ${paginas.length} páginas no mês; cada rodada usa ${lista.length}.`)
if (lista.length === 0) sair('a loja não tem vendas no mês — escolha outra loja ou mês.')

// ── 2. Rodadas ──────────────────────────────────────────────────────────────
const resultados = []
for (const [idx, n] of niveis.entries()) {
  if (idx > 0) {
    console.log(`[bateria] pausa de ${PAUSA_S} s para o limite esvaziar…`)
    await esperar(PAUSA_S * 1000)
  }
  console.log(`[bateria] rodada com ${n} chamadas ao mesmo tempo…`)
  const fila = [...lista]
  const medidas = []
  const t0 = performance.now()
  await Promise.all(
    Array.from({ length: n }, async () => {
      for (let it = fila.shift(); it; it = fila.shift()) {
        const r = await chamar(url(it.merchant, it.ini, it.fim, it.pagina))
        medidas.push({ status: r.status, ms: r.ms, limite: r.limite })
      }
    })
  )
  const totalS = (performance.now() - t0) / 1000
  const n429 = medidas.filter((m) => m.status === 429).length
  const nOk = medidas.filter((m) => m.status === 200 || m.status === 204).length
  const tempos = medidas.filter((m) => m.status === 200).map((m) => m.ms).sort((a, b) => a - b)
  const media = tempos.length ? tempos.reduce((s, x) => s + x, 0) / tempos.length : 0
  const p95 = tempos.length ? tempos[Math.min(tempos.length - 1, Math.floor(tempos.length * 0.95))] : 0
  const retry = [...new Set(medidas.map((m) => m.limite['retry-after']).filter(Boolean))]
  const cab = medidas.find((m) => Object.keys(m.limite).length)?.limite ?? {}
  const pct = (n429 / medidas.length) * 100
  const linha = {
    simultaneas: n,
    chamadas: medidas.length,
    ok: nOk,
    erros429: n429,
    pct429: Math.round(pct * 10) / 10,
    outrosErros: medidas.length - nOk - n429,
    mediaMs: Math.round(media),
    p95Ms: Math.round(p95),
    totalS: Math.round(totalS * 10) / 10,
    paginasPorSegundo: Math.round((nOk / totalS) * 100) / 100,
    retryAfter: retry,
    cabecalhosDeLimite: cab,
  }
  resultados.push(linha)
  console.log(
    `[bateria]   ${n} simultâneas: ${nOk}/${medidas.length} ok · 429: ${n429} (${linha.pct429}%) · ` +
      `média ${linha.mediaMs} ms · p95 ${linha.p95Ms} ms · total ${linha.totalS} s · ${linha.paginasPorSegundo} pág/s`
  )
  if (pct > PARAR_PCT) {
    console.log(`[bateria] 429 acima de ${PARAR_PCT}% — parando aqui (não forço além do limite).`)
    break
  }
}

// ── 3. Resultado ────────────────────────────────────────────────────────────
console.log('\nsimultâneas | chamadas | 429 | % 429 | média ms | p95 ms | total s | pág/s')
for (const r of resultados)
  console.log(
    `${String(r.simultaneas).padStart(11)} | ${String(r.chamadas).padStart(8)} | ${String(r.erros429).padStart(3)} | ${String(r.pct429).padStart(5)} | ${String(r.mediaMs).padStart(8)} | ${String(r.p95Ms).padStart(6)} | ${String(r.totalS).padStart(7)} | ${r.paginasPorSegundo}`
  )
const arquivo = `bateria-limite-ifood-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')}.json`
writeFileSync(arquivo, JSON.stringify({ loja, mes, restaurantes: restaurantes.length, paginasNoMes: paginas.length, paginasPorRodada: lista.length, resultados }, null, 2))
console.log(`\n[bateria] resultado gravado em ${arquivo}`)
