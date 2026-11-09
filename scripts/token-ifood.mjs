#!/usr/bin/env node
// Renova o token da Merchant API do iFood no `.env` do módulo (SÓ PARA O `gia dev`).
//
// Em produção nada disto existe: o hub de Credenciais do portal guarda o client
// id/secret, faz o OAuth `client_credentials` e entrega o token já válido em
// `ctx.credencial('ifood')`. No dev-shell o token é estático (GIA_DEV_CRED_IFOOD_TOKEN)
// e vence em ~6 h — este script gera outro com o client id/secret do `.env`.
//
// Uso (na pasta do módulo — fechamento-ifood-diario, fechamento-ifood-mensal):
//   npm run token:ifood            # gera um token novo agora
//   node ../scripts/token-ifood.mjs --se-vencido   # só se faltar < 30 min (o `predev`)
//
// Lê do `.env`:  GIA_DEV_IFOOD_CLIENT_ID, GIA_DEV_IFOOD_CLIENT_SECRET,
//                GIA_DEV_CRED_IFOOD_BASE_URL (padrão https://merchant-api.ifood.com.br)
// Grava no `.env`: GIA_DEV_CRED_IFOOD_TOKEN e GIA_DEV_CRED_IFOOD_EXPIRES_AT
// Nunca imprime o client secret nem o token.
//
// O `gia dev` lê o `.env` só ao subir: depois de renovar com ele rodando, reinicie.

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const SE_VENCIDO = process.argv.includes('--se-vencido')
const FOLGA_MS = 30 * 60_000
const ENV = resolve(process.cwd(), '.env')

function sair(msg, codigo) {
  console[codigo ? 'error' : 'log'](`[token-ifood] ${msg}`)
  // No `predev` a falha não pode impedir o `gia dev` de subir.
  process.exit(SE_VENCIDO ? 0 : codigo)
}

if (!existsSync(ENV)) sair(`sem .env em ${process.cwd()} — copie o .env.example.`, 1)
let texto = readFileSync(ENV, 'utf8')
const valor = (k) => new RegExp(`^${k}=(.*)$`, 'm').exec(texto)?.[1]?.trim() ?? ''

const expira = Date.parse(valor('GIA_DEV_CRED_IFOOD_EXPIRES_AT'))
if (SE_VENCIDO && valor('GIA_DEV_CRED_IFOOD_TOKEN') && expira - Date.now() > FOLGA_MS) {
  const min = Math.round((expira - Date.now()) / 60_000)
  sair(`token do iFood ainda vale ${Math.floor(min / 60)} h ${min % 60} min.`, 0)
}

const clientId = valor('GIA_DEV_IFOOD_CLIENT_ID')
const clientSecret = valor('GIA_DEV_IFOOD_CLIENT_SECRET')
if (!clientId || !clientSecret) {
  sair('preencha GIA_DEV_IFOOD_CLIENT_ID e GIA_DEV_IFOOD_CLIENT_SECRET no .env.', 1)
}
const base = (valor('GIA_DEV_CRED_IFOOD_BASE_URL') || 'https://merchant-api.ifood.com.br').replace(
  /\/+$/,
  ''
)

let r
try {
  r = await fetch(`${base}/authentication/v1.0/oauth/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grantType: 'client_credentials', clientId, clientSecret }),
    signal: AbortSignal.timeout(30_000),
  })
} catch (e) {
  sair(`não foi possível falar com o iFood: ${e instanceof Error ? e.message : e}`, 1)
}
const corpo = await r.json().catch(() => ({}))
if (!r.ok || !corpo.accessToken) {
  sair(`o iFood recusou o client id/secret (HTTP ${r.status}): ${corpo.message ?? ''}`, 1)
}

const venceEm = new Date(Date.now() + (Number(corpo.expiresIn) || 21_600) * 1000)
const gravar = (k, v) => {
  texto = new RegExp(`^${k}=.*$`, 'm').test(texto)
    ? texto.replace(new RegExp(`^${k}=.*$`, 'm'), `${k}=${v}`)
    : `${texto.replace(/\n*$/, '\n')}${k}=${v}\n`
}
gravar('GIA_DEV_CRED_IFOOD_TOKEN', corpo.accessToken)
gravar('GIA_DEV_CRED_IFOOD_EXPIRES_AT', venceEm.toISOString())
writeFileSync(ENV, texto)

const hora = venceEm.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
console.log(`[token-ifood] token novo gravado no .env — vale até ${hora}.`)
if (!SE_VENCIDO) console.log('[token-ifood] se o gia dev já está rodando, reinicie-o.')
