import { useEffect, useRef, useState, type ComponentType } from 'react'
import {
  Check,
  Clock,
  CloudOff,
  Copy,
  Download,
  Info,
  Lock,
  RefreshCw,
  WifiOff,
} from 'lucide-react'
import { Button, Modal } from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'
import { ultimasFalhas, type FalhaDeChamada } from '@gia-cb/sdk/server-client'

/**
 * Mensagem de erro padrão (proposta para virar componente do portal).
 *
 * O módulo passa o erro como veio; o componente decide pelo **tipo** o ícone, a cor, o
 * texto padrão e as ações. O texto técnico não fica na frente: vai para o modal
 * "Detalhes técnicos", com o que foi enviado (o `.requisicao` que o server-client do
 * SDK anexa ao erro) e o que voltou.
 *
 * - `conexao` (sem resposta: internet caiu, portal fora do alcance): refaz sozinho
 *   quando a conexão volta.
 * - `temporario` (408, 429, 503, 504): um sistema demorou ou está fora do ar; tentar de
 *   novo resolve. O servidor responde 503 quando não conseguiu conectar a um banco ou API.
 * - `ajuste` (400, 404, 422): a pesquisa precisa mudar.
 * - `acesso` (401, 403): só o gestor resolve.
 * - `servico` (500, 502 e o resto): configuração ou resposta inesperada; tentar de novo
 *   e, se continuar, suporte.
 *
 * O texto é a primeira frase da mensagem do servidor (que diz QUAL sistema falhou) mais a
 * orientação do tipo. A mensagem inteira fica no modal.
 */
export type TipoErro = 'conexao' | 'temporario' | 'ajuste' | 'acesso' | 'servico'

interface Props {
  erro: unknown
  /** De onde veio, em palavras ("Pedidos do delivery"). Opcional. */
  origem?: string
  /** Sobrescreve o título padrão do tipo. */
  titulo?: string
  /** Sobrescreve o texto. Sem ele: a mensagem do servidor (ajuste/acesso) ou o padrão do tipo. */
  descricao?: string
  /** Aparece só nos tipos em que tentar de novo pode resolver. */
  onTentarDeNovo?: () => void
  className?: string
}

const TIPOS: Record<
  TipoErro,
  {
    rotulo: string
    titulo: string
    /** O que fazer, depois da frase do servidor. */
    texto: string
    icone: ComponentType<{ className?: string }>
    caixa: string
    selo: string
    tentar: boolean
  }
> = {
  conexao: {
    rotulo: 'sem conexão',
    titulo: 'Sem conexão com o portal',
    texto:
      'Verifique a internet (ou a VPN). Assim que a conexão voltar, a pesquisa é refeita sozinha.',
    icone: WifiOff,
    caixa: 'bg-warning/10 border-warning/30 text-warning',
    selo: 'bg-warning/10 border-warning/30 text-warning',
    tentar: true,
  },
  temporario: {
    rotulo: 'temporário',
    titulo: 'Um sistema não respondeu agora',
    texto: 'Costuma passar em alguns minutos. Tente de novo.',
    icone: Clock,
    caixa: 'bg-warning/10 border-warning/30 text-warning',
    selo: 'bg-warning/10 border-warning/30 text-warning',
    tentar: true,
  },
  ajuste: {
    rotulo: 'ajuste na pesquisa',
    titulo: 'Revise a pesquisa',
    texto: 'Ajuste a pesquisa e tente de novo.',
    icone: Info,
    caixa: 'bg-info/10 border-info/30 text-info',
    selo: 'bg-info/10 border-info/30 text-info',
    tentar: false,
  },
  acesso: {
    rotulo: 'acesso',
    titulo: 'Você não tem acesso a isso',
    texto: 'Peça ao seu gestor para liberar no seu cadastro do portal.',
    icone: Lock,
    caixa: 'bg-muted border-border text-muted-foreground',
    selo: 'bg-muted border-border text-muted-foreground',
    tentar: false,
  },
  servico: {
    rotulo: 'falha de serviço',
    titulo: 'Algo deu errado do nosso lado',
    texto: 'Se continuar depois de tentar de novo, avise o suporte com os detalhes técnicos.',
    icone: CloudOff,
    caixa: 'bg-destructive/10 border-destructive/30 text-destructive',
    selo: 'bg-destructive/10 border-destructive/30 text-destructive',
    tentar: true,
  },
}

function falhaDe(erro: unknown): FalhaDeChamada | null {
  const r = (erro as { requisicao?: FalhaDeChamada } | null)?.requisicao
  return r && typeof r === 'object' ? r : null
}

function mensagemDe(erro: unknown): string {
  if (erro instanceof Error) return erro.message
  if (typeof erro === 'string') return erro
  // O cliente do Supabase devolve um objeto simples ({ message, code, details, hint }).
  const m = (erro as { message?: unknown } | null)?.message
  return typeof m === 'string' && m ? m : 'Erro sem mensagem.'
}

/** Código do erro do banco (PostgREST `PGRST…` ou SQLSTATE), quando a tela lê o banco direto. */
function codigoDe(erro: unknown): string {
  const c = (erro as { code?: unknown } | null)?.code
  return typeof c === 'string' ? c : ''
}

/**
 * Erros do PostgREST de quando o BANCO do portal não atende (a API respondeu, o banco
 * não). A mensagem vem em inglês, então a frase é nossa.
 */
const BANCO_FORA: Record<string, string> = {
  PGRST000: 'Não conseguimos conectar ao banco do portal.',
  PGRST001: 'Não conseguimos conectar ao banco do portal.',
  PGRST002: 'O banco do portal está reiniciando.',
  PGRST003: 'O banco do portal está ocupado e não atendeu a tempo.',
}

/** O tipo pelo status HTTP (e pela mensagem, quando o status não diz o bastante). */
function classificarErro(erro: unknown): TipoErro {
  const falha = falhaDe(erro)
  const status = falha?.status ?? (erro as { status?: number } | null)?.status
  const msg = mensagemDe(erro).toLowerCase()
  if (BANCO_FORA[codigoDe(erro)]) return 'temporario'
  // Sem status = a resposta nem chegou: internet do usuário ou portal fora do alcance.
  if (
    status == null &&
    ((typeof navigator !== 'undefined' && navigator.onLine === false) ||
      /failed to fetch|fetch failed|networkerror|load failed|network request failed/.test(msg))
  ) {
    return 'conexao'
  }
  if (
    status === 408 ||
    status === 429 ||
    status === 503 ||
    status === 504 ||
    /demorou|timeout|tempo esgotado/.test(msg)
  ) {
    return 'temporario'
  }
  if (status === 401 || status === 403) return 'acesso'
  if (status === 400 || status === 404 || status === 422) return 'ajuste'
  return 'servico'
}

const json = (v: unknown) => JSON.stringify(v, null, 2)

/**
 * Proteção de dado sensível: o que a tela mostra, copia ou baixa passa por aqui.
 *
 * - campo com nome de segredo ou de dado pessoal tem o valor trocado por `OCULTO`;
 * - em texto solto (mensagem, consulta), somem token `Bearer`/`Basic`, JWT e
 *   `usuário:senha@` de URL (connection string).
 *
 * É uma segunda barreira: o servidor já não manda segredo para o navegador.
 */
const OCULTO = '••• oculto'
const CAMPO_SENSIVEL =
  /token|senha|password|passwd|secret|segredo|authorization|api[-_]?key|cookie|credencial|cpf|e-?mail|telefone|celular|phone/i

function ocultarTexto(s: string): string {
  return s
    .replace(/\b(Bearer|Basic)\s+[A-Za-z0-9._~+/=-]+/gi, `$1 ${OCULTO}`)
    .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, OCULTO)
    .replace(/\b([a-z][a-z0-9+.-]*:\/\/)[^\s:/@]+:[^\s/]+@/gi, `$1${OCULTO}@`)
}

function ocultar(v: unknown): unknown {
  if (typeof v === 'string') return ocultarTexto(v)
  if (Array.isArray(v)) return v.map(ocultar)
  if (v && typeof v === 'object') {
    return Object.fromEntries(
      Object.entries(v).map(([k, x]) => [k, CAMPO_SENSIVEL.test(k) ? OCULTO : ocultar(x)])
    )
  }
  return v
}

/** O corpo enviado (JSON serializado) já sem os campos sensíveis. */
function ocultarCorpo(corpo: string): string {
  try {
    return JSON.stringify(ocultar(JSON.parse(corpo)))
  } catch {
    return ocultarTexto(corpo)
  }
}

/**
 * Baixa o diagnóstico só com as falhas DESTE módulo, já sem dado sensível. O
 * `baixarFalhas()` do SDK leva o diário inteiro da sessão, com o corpo das chamadas de
 * outras telas — que podem ter dado de outras pessoas.
 */
function baixarDiagnostico(moduleId: string): boolean {
  const lista = ultimasFalhas()
    .filter((f) => f.moduleId === moduleId)
    .map((f) => ({
      ...(ocultar({ ...f, corpoEnviado: null }) as FalhaDeChamada),
      corpoEnviado: f.corpoEnviado === null ? null : ocultarCorpo(f.corpoEnviado),
    }))
  if (typeof document === 'undefined' || lista.length === 0) return false
  const url = URL.createObjectURL(new Blob([json(lista)], { type: 'application/json' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `gia-falhas-${moduleId}-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.json`
  a.click()
  URL.revokeObjectURL(url)
  return true
}

/** A primeira frase da mensagem do servidor — o resto (detalhe técnico) fica no modal. */
function primeiraFrase(msg: string): string {
  const m = /^(.+?[.!?])(\s|$)/.exec(msg.trim())
  return (m ? m[1] : msg).trim()
}

function corpoEnviado(falha: FalhaDeChamada): string {
  if (falha.corpoEnviado === null) {
    return json({
      aviso: 'Corpo grande demais para guardar inteiro.',
      resumo: ocultar(falha.resumo),
      amostra: ocultar(falha.amostra),
    })
  }
  try {
    return json(ocultar(JSON.parse(falha.corpoEnviado)))
  } catch {
    return ocultarTexto(falha.corpoEnviado)
  }
}

function quando(iso: string | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString('pt-BR')
}

export function MensagemErro({
  erro,
  origem,
  titulo,
  descricao,
  onTentarDeNovo,
  className,
}: Props) {
  const [aberto, setAberto] = useState(false)
  const [copiado, setCopiado] = useState(false)
  // Sem resposta, o SDK não registra a chamada: hora e tela vêm do navegador.
  const [momento] = useState(() => new Date().toISOString())
  const tipo = classificarErro(erro)
  const t = TIPOS[tipo]
  const Icone = t.icone
  const mensagem = ocultarTexto(mensagemDe(erro))
  const falha = falhaDe(erro)
  // A frase do servidor diz o que houve (e em qual sistema); o tipo diz o que fazer.
  // Sem conexão, a mensagem é a do navegador ("Failed to fetch"): só o texto do tipo.
  // Erro do banco do portal vem em inglês: a frase é a da tabela `BANCO_FORA`.
  const codigo = codigoDe(erro)
  const frase =
    BANCO_FORA[codigo] ?? (tipo !== 'conexao' && falha?.status ? primeiraFrase(mensagem) : null)
  const texto = descricao ?? (frase ? `${frase} ${t.texto}` : t.texto)
  const statusErro = falha?.status ?? (erro as { status?: number } | null)?.status
  const consulta = (erro as { consulta?: unknown } | null)?.consulta

  // Sem conexão: refaz sozinho quando o navegador avisa que a internet voltou.
  const raiz = useRef<HTMLDivElement>(null)
  const tentarRef = useRef(onTentarDeNovo)
  useEffect(() => {
    tentarRef.current = onTentarDeNovo
  })
  useEffect(() => {
    if (tipo !== 'conexao') return
    // A tabela pode desenhar o estado vazio duas vezes (tabela e cards, um escondido):
    // só a mensagem visível refaz, senão a pesquisa sairia em dobro.
    const aoVoltar = () => {
      if (raiz.current?.offsetParent != null) tentarRef.current?.()
    }
    window.addEventListener('online', aoVoltar)
    return () => window.removeEventListener('online', aoVoltar)
  }, [tipo])

  const resumo: [string, string][] = [
    ['Status', statusErro != null ? String(statusErro) : 'sem resposta'],
    ...(codigo ? ([['Código', codigo]] as [string, string][]) : []),
    ['Quando', quando(falha?.quando ?? momento)],
    ['Tela', falha?.tela ?? (typeof location !== 'undefined' ? location.pathname : '—')],
    // Módulo, handler e id só existem quando a chamada foi a um handler do servidor.
    ...(falha
      ? ([
          ['Módulo', falha.moduleId],
          ['Handler', falha.handler],
          ['ID da chamada', falha.idChamada ?? '—'],
        ] as [string, string][])
      : []),
  ]
  const linhaRequisicao = falha
    ? `POST /__gia/bff/${falha.moduleId}/${falha.handler}`
    : typeof consulta === 'string'
      ? ocultarTexto(consulta)
      : ''
  const corpo = falha ? corpoEnviado(falha) : ''
  // Do banco direto, a resposta é o próprio erro do cliente (code, message, details, hint).
  const resposta =
    !falha && codigo !== ''
      ? json({
          code: codigo,
          message: mensagem,
          details: ocultar((erro as { details?: unknown }).details ?? null),
          hint: ocultar((erro as { hint?: unknown }).hint ?? null),
        })
      : json({ error: mensagem })
  const textoCopia = [
    `${t.titulo} (${tipo})`,
    ...resumo.map(([k, v]) => `${k}: ${v}`),
    '',
    ...(falha ? [`Requisição: ${linhaRequisicao}`, corpo, ''] : []),
    ...(!falha && linhaRequisicao ? [`Consulta: ${linhaRequisicao}`, ''] : []),
    `Resposta: ${statusErro ?? 'sem resposta'}`,
    resposta,
  ].join('\n')

  async function copiar() {
    try {
      await navigator.clipboard.writeText(textoCopia)
      setCopiado(true)
    } catch {
      setCopiado(false)
    }
  }

  return (
    <div
      ref={raiz}
      role="alert"
      className={cn(
        'flex w-full max-w-xl flex-col gap-3 whitespace-normal text-left sm:gap-4',
        className
      )}
    >
      <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-start sm:gap-4 sm:text-left">
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border [@media(max-height:640px)]:hidden',
            t.caixa
          )}
        >
          <Icone className="h-5 w-5" />
        </div>
        <div className="flex min-w-0 flex-col items-center gap-1.5 sm:items-start">
          <span className={cn('rounded-full border px-2 py-0.5 text-[11px] font-semibold', t.selo)}>
            {origem ? `${origem} · ${t.rotulo}` : t.rotulo}
          </span>
          <h2 className="text-lg font-bold leading-snug text-foreground [@media(max-height:640px)]:text-base">
            {titulo ?? t.titulo}
          </h2>
          <p className="break-words text-sm leading-relaxed text-muted-foreground">{texto}</p>
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:ml-[60px] sm:flex-row sm:flex-wrap [@media(max-height:640px)]:sm:ml-0">
        {t.tentar && onTentarDeNovo && (
          <Button onClick={onTentarDeNovo} className="min-h-11 w-full sm:min-h-10 sm:w-auto">
            <RefreshCw className="h-4 w-4" /> Tentar de novo
          </Button>
        )}
        <Button
          variant="outline"
          className="min-h-11 w-full sm:min-h-10 sm:w-auto"
          aria-haspopup="dialog"
          onClick={() => {
            setCopiado(false)
            setAberto(true)
          }}
        >
          Ver detalhes técnicos
        </Button>
      </div>

      <Modal open={aberto} onOpenChange={setAberto}>
        <Modal.Content size="lg">
          <Modal.Header>
            <Modal.Title>Detalhes técnicos</Modal.Title>
            <Modal.Description>{titulo ?? t.titulo}</Modal.Description>
          </Modal.Header>
          <Modal.Body className="flex flex-col gap-4">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-3">
              {resumo.map(([k, v]) => (
                <div key={k} className="flex min-w-0 flex-col gap-0.5">
                  <dt className="text-[11px] font-semibold text-muted-foreground">{k}</dt>
                  <dd className="break-all font-mono text-xs text-foreground">{v}</dd>
                </div>
              ))}
            </dl>

            {!falha && linhaRequisicao && (
              <section className="flex flex-col gap-1.5">
                <h3 className="text-xs font-bold text-foreground">Consulta ao banco</h3>
                <pre className="overflow-auto whitespace-pre-wrap break-all rounded-lg border border-border bg-muted p-3 font-mono text-xs leading-relaxed text-foreground">
                  {linhaRequisicao}
                </pre>
              </section>
            )}

            {falha && (
              <section className="flex flex-col gap-1.5">
                <div className="flex flex-wrap items-baseline gap-2">
                  <h3 className="text-xs font-bold text-foreground">Requisição</h3>
                  <span className="break-all font-mono text-xs text-muted-foreground">
                    {linhaRequisicao}
                  </span>
                </div>
                <pre className="max-h-56 overflow-auto rounded-lg border border-border bg-muted p-3 font-mono text-xs leading-relaxed text-foreground">
                  {corpo}
                </pre>
              </section>
            )}

            <section className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xs font-bold text-foreground">Resposta</h3>
                <span
                  className={cn(
                    'rounded-full border px-2 py-0.5 font-mono text-[11px] font-semibold',
                    t.selo
                  )}
                >
                  {statusErro ?? 'sem resposta'}
                </span>
              </div>
              <pre className="max-h-56 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-border bg-muted p-3 font-mono text-xs leading-relaxed text-foreground">
                {resposta}
              </pre>
            </section>

            <p className="text-xs leading-relaxed text-muted-foreground">
              Esses dados ficam só neste navegador. Senhas e tokens não chegam ao navegador, e
              campos de senha, token e dado pessoal (CPF, e-mail, telefone) aparecem ocultos. O
              diagnóstico baixado traz só as falhas desta tela.
            </p>
          </Modal.Body>
          <Modal.Footer className="flex-wrap gap-2">
            {falha && (
              <Button
                variant="outline"
                className="min-h-11 sm:min-h-10"
                onClick={() => {
                  baixarDiagnostico(falha.moduleId)
                }}
              >
                <Download className="h-4 w-4" /> Baixar diagnóstico
              </Button>
            )}
            <Button
              variant="outline"
              className="min-h-11 sm:min-h-10"
              onClick={() => void copiar()}
            >
              {copiado ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copiado ? 'Copiado' : 'Copiar tudo'}
            </Button>
            <Button className="min-h-11 sm:min-h-10" onClick={() => setAberto(false)}>
              Fechar
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </div>
  )
}
