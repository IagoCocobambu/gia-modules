import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, ChevronRight, Store } from 'lucide-react'
import { Badge, Button, Checkbox, Input, SegmentedControl, Switch, Tooltip } from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'
import { fmtInteiro, plural } from '../formato'
import { ehDeTeste } from '../unidades'

// Seletor de operações da barra do topo — quais lojas entram no painel.
//
// Porte do seletor do Dashboard de RH, com as correções de tela que foram pagas
// lá (largura fixa do botão, `min-w-0` para o `truncate` funcionar, painel por
// portal, altura pela sobra da tela), inclusive o interruptor de **Consolidar
// matriz e filiais** (pedido do João, 21/09/2026).
//
// ── O GRUPO CONSOLIDADO É INDIVISÍVEL ───────────────────────────────────────
//
// Com a consolidação ligada, a linha da lista é o GRUPO: a caixa é dele, e as
// operações de dentro aparecem só para dizer quem o compõe, sem caixa própria.
// Marcar meia matriz pediria meia loja — o número sairia sem a filial e ninguém
// saberia. Para olhar uma operação sozinha, desligue a consolidação.
//
// ── OPERAÇÃO, E NÃO EMPRESA ─────────────────────────────────────────────────
//
// O Plano de Contas é gravado por OPERAÇÃO (o `loc_ref`). A lista é a do
// `ctx.operacoes()` — o escopo do usuário.
//
// ── POR OPERAÇÃO, POR ESTADO, POR REGIÃO ────────────────────────────────────
//
// Nos modos agrupados, cada estado (ou região da rede) é uma linha com caixa
// própria: marcar a caixa marca todas as operações do grupo, e a contagem "3 de
// 12" mostra quando o grupo está só em parte. A seleção continua sendo de
// OPERAÇÕES — o grupo é um atalho para marcar várias de uma vez.
//
// A região é a da REDE (`regiao_cb`: NCO, NE, SPC, SPISE, SUL), a do HTML que
// especifica o módulo — não a do IBGE.
//
// ── NADA AQUI CONSULTA ──────────────────────────────────────────────────────
//
// Cada clique escreve no RASCUNHO do recorte; quem busca no banco é o botão
// **Consultar**, no topo.

export interface OperacaoDoSeletor {
  ref: string
  nome: string
  /** Sigla do estado; vazio quando o cadastro não informa. */
  estado?: string
  /** Região da rede; vazio quando o cadastro não informa. */
  regiao?: string
  /**
   * Os nomes das operações que a linha SOMA, quando ela é um grupo de matriz e
   * filiais — em ordem de número de loja. Vazio numa operação solta.
   */
  membros?: string[]
}

interface Props {
  operacoes: OperacaoDoSeletor[]
  marcadas: Record<string, boolean>
  onChange: (marcadas: Record<string, boolean>) => void
  consolidar: boolean
  onConsolidarChange: (ligado: boolean) => void
}

type Modo = 'OPERACAO' | 'ESTADO' | 'REGIAO'

const LARGURA = 340
const SEM_ESTADO = 'Sem estado'
const SEM_REGIAO = 'Sem região'

// O código comercial vive dentro do nome ("01.CB GOIANIA"); só a comparação
// numérica põe a `999.` depois da `99.`.
const ORDEM = new Intl.Collator('pt-BR', { numeric: true })

function chaveDoGrupo(o: OperacaoDoSeletor, modo: Modo): string {
  if (modo === 'ESTADO') return o.estado || SEM_ESTADO
  return o.regiao || SEM_REGIAO
}

/** Agrupa mantendo "Sem estado"/"Sem região" por último. */
function agrupar(ops: OperacaoDoSeletor[], modo: Modo) {
  const mapa = new Map<string, OperacaoDoSeletor[]>()
  for (const o of ops) {
    const chave = chaveDoGrupo(o, modo)
    const lista = mapa.get(chave)
    if (lista) lista.push(o)
    else mapa.set(chave, [o])
  }
  return [...mapa.entries()]
    .map(([nome, membros]) => ({ nome, membros }))
    .sort((a, b) => {
      const semA = a.nome === SEM_ESTADO || a.nome === SEM_REGIAO
      const semB = b.nome === SEM_ESTADO || b.nome === SEM_REGIAO
      if (semA !== semB) return semA ? 1 : -1
      return ORDEM.compare(a.nome, b.nome)
    })
}

export function SeletorDeOperacoes({
  operacoes,
  marcadas,
  onChange,
  consolidar,
  onConsolidarChange,
}: Props) {
  const [aberto, setAberto] = useState(false)
  const [busca, setBusca] = useState('')
  const [modo, setModo] = useState<Modo>('OPERACAO')
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set())
  const gatilho = useRef<HTMLButtonElement>(null)
  const painel = useRef<HTMLDivElement>(null)
  const [caixa, setCaixa] = useState<{ top: number; left: number; altura: number } | null>(null)

  const marcadasAgora = operacoes.filter((o) => marcadas[o.ref])
  const rascunho = new Set(marcadasAgora.map((o) => o.ref))
  // ── O LOTE NUNCA MARCA LOJA DE TESTE ──────────────────────────────────────
  //
  // A regra e o porquê estão em `unidades.ts`. Aqui a consequência é uma só: o
  // "todas" do painel é o das operações de VERDADE. Sem isto, a caixa de
  // "Selecionar todas" nunca chegaria a marcada, o rodapé diria "102 de 104"
  // depois de marcar tudo e o botão do topo nunca mostraria "Todas as
  // operações" — três lugares acusando uma seleção incompleta que é a certa.
  const deVerdade = operacoes.filter((o) => !ehDeTeste(o))
  const todas = deVerdade.length > 0 && deVerdade.every((o) => rascunho.has(o.ref))

  function escrever(refs: Set<string>) {
    onChange(Object.fromEntries(operacoes.map((o) => [o.ref, refs.has(o.ref)])))
  }

  function abrir() {
    setBusca('')
    setExpandidos(new Set())
    setAberto(true)
  }

  useLayoutEffect(() => {
    if (!aberto) return
    const r = gatilho.current?.getBoundingClientRect()
    if (!r) return
    const top = r.bottom + 8
    setCaixa({
      top,
      left: Math.max(8, Math.min(r.left, window.innerWidth - LARGURA - 8)),
      // A altura é a que SOBRA abaixo do botão — no celular, com altura fixa, o
      // rodapé caía para fora da tela.
      altura: Math.max(260, window.innerHeight - top - 8),
    })
  }, [aberto])

  useEffect(() => {
    if (!aberto) return
    function foraDaqui(e: MouseEvent) {
      const alvo = e.target as Node
      if (painel.current?.contains(alvo) || gatilho.current?.contains(alvo)) return
      setAberto(false)
    }
    function escape(e: KeyboardEvent) {
      if (e.key === 'Escape') setAberto(false)
    }
    // A posição é medida ao abrir: girar o celular com ele aberto o deixaria no
    // lugar antigo, cortado — fecha.
    function fechar() {
      setAberto(false)
    }
    document.addEventListener('mousedown', foraDaqui, true)
    document.addEventListener('keydown', escape, true)
    window.addEventListener('resize', fechar)
    return () => {
      document.removeEventListener('mousedown', foraDaqui, true)
      document.removeEventListener('keydown', escape, true)
      window.removeEventListener('resize', fechar)
    }
  }, [aberto])

  const ordenadas = [...operacoes].sort((a, b) => ORDEM.compare(a.nome, b.nome))
  const termo = busca.trim().toLocaleLowerCase('pt-BR')
  const visiveis = termo
    ? ordenadas.filter((o) =>
        `${o.nome} ${o.ref} ${o.estado ?? ''} ${o.regiao ?? ''}`
          .toLocaleLowerCase('pt-BR')
          .includes(termo)
      )
    : ordenadas
  const grupos = modo === 'OPERACAO' ? [] : agrupar(visiveis, modo)
  const rascunhoTodas = todas

  function alternar(ref: string) {
    const proximo = new Set(rascunho)
    if (proximo.has(ref)) proximo.delete(ref)
    else proximo.add(ref)
    escrever(proximo)
  }

  /**
   * Marca o grupo inteiro — ou desmarca, se já estava todo marcado.
   *
   * Marcar pega só as operações de verdade; desmarcar tira todas, inclusive a
   * de teste que tenha sido marcada uma a uma. Grupo formado SÓ por loja de
   * teste marca normalmente: ali não há lote nenhum a proteger, e a caixa
   * precisa fazer alguma coisa.
   */
  function alternarGrupo(membros: OperacaoDoSeletor[]) {
    const proximo = new Set(rascunho)
    const deVerdadeNoGrupo = membros.filter((m) => !ehDeTeste(m))
    const alvos = deVerdadeNoGrupo.length > 0 ? deVerdadeNoGrupo : membros
    const cheio = alvos.every((m) => proximo.has(m.ref))
    if (cheio) {
      for (const m of membros) proximo.delete(m.ref)
    } else {
      for (const m of alvos) proximo.add(m.ref)
    }
    escrever(proximo)
  }

  function alternarExpansao(nome: string) {
    setExpandidos((atual) => {
      const proximo = new Set(atual)
      if (proximo.has(nome)) proximo.delete(nome)
      else proximo.add(nome)
      return proximo
    })
  }

  // Quando a seleção é exatamente um estado (ou uma região) inteiro, o botão diz
  // qual — "SPC · 20 operações" lê melhor que "20 operações".
  const refsMarcadas = new Set(marcadasAgora.map((o) => o.ref))
  const grupoInteiro = (campo: 'estado' | 'regiao') => {
    const valores = new Set(marcadasAgora.map((o) => o[campo] ?? ''))
    if (valores.size !== 1) return null
    const [valor] = valores
    if (!valor) return null
    const doGrupo = operacoes.filter((o) => (o[campo] ?? '') === valor)
    return doGrupo.length === refsMarcadas.size && doGrupo.every((o) => refsMarcadas.has(o.ref))
      ? valor
      : null
  }
  const regiaoInteira = marcadasAgora.length > 1 ? grupoInteiro('regiao') : null
  const estadoInteiro = marcadasAgora.length > 1 && !regiaoInteira ? grupoInteiro('estado') : null

  // ── O RÓTULO TEM DUAS MEDIDAS ─────────────────────────────────────────────
  //
  // "Todas as operações · consolidado" são 175 px de texto num botão de 192 px,
  // e na faixa estreita ele empurrava o período para outra linha (22/09/2026).
  // O rótulo CURTO entra só onde o espaço aperta — entre `@md` e `@xl` da faixa
  // —, e a dica do botão traz sempre a frase inteira.
  const quantas = plural(marcadasAgora.length, 'operação', 'operações')
  const grupo = regiaoInteira ?? estadoInteiro
  const rotulo =
    operacoes.length === 0
      ? 'Operações'
      : marcadasAgora.length === 0
        ? 'Selecionar operações'
        : todas
          ? 'Todas as operações'
          : marcadasAgora.length === 1
            ? marcadasAgora[0]!.nome
            : grupo
              ? `${grupo} · ${quantas}`
              : quantas
  const rotuloCurto =
    operacoes.length === 0
      ? 'Operações'
      : marcadasAgora.length === 0
        ? 'Selecionar'
        : todas
          ? 'Todas'
          : marcadasAgora.length === 1
            ? marcadasAgora[0]!.nome
            : grupo
              ? `${grupo} · ${fmtInteiro(marcadasAgora.length)}`
              : quantas
  // Com a consolidação ligada, o rótulo LONGO cede: "Todas as operações ·
  // consolidado" pede 175 px de texto em 144 px de caixa, e o que ficava de fora
  // era justamente o "consolidado" (22/09/2026). Nessa hora vale a base curta.
  const consolidado = consolidar && marcadasAgora.length > 0
  const sufixo = consolidado ? ' · consolidado' : ''
  const rotuloCompleto = `${consolidado ? rotuloCurto : rotulo}${sufixo}`
  const rotuloEnxuto = `${rotuloCurto}${sufixo}`

  // Função de render, e não componente declarado aqui dentro: componente criado a
  // cada render remonta as linhas (e o ESLint do host reprova).
  function linhaOperacao(o: OperacaoDoSeletor, recuo = false, semSeta = false) {
    return (
      // A linha é o `<label>` do próprio Checkbox: o Checkbox da SDK JÁ é um
      // `<button>`, e botão dentro de botão é HTML inválido.
      <div
        key={o.ref}
        className={cn(
          'flex items-center rounded-md px-2 transition-colors duration-fast ease-default hover:bg-muted',
          // Dentro do grupo, a caixa da operação fica sob o NOME do grupo (4 de
          // respiro + 28 da seta + 4 de vão + 18 da caixa = 54 px), não sob a caixa
          // dele — a medida do RH.
          recuo && 'ml-[3.375rem]',
          // ☠️ LOJA SEM FILIAL, com a consolidação ligada: ela não tem seta, e
          // sem este recuo a caixa dela ficava 24 px à ESQUERDA das linhas de
          // grupo — a lista saía com duas colunas de caixas (relato do João,
          // 22/09/2026). 24 px é a seta: 20 do botão (16 do ícone + 2+2 de
          // recuo) mais os 4 do `mr-1`.
          semSeta && 'ml-6'
        )}
      >
        <Checkbox
          checked={rascunho.has(o.ref)}
          onCheckedChange={() => alternar(o.ref)}
          className="min-w-0 flex-1 py-2"
          // Sem o código (`loc_ref`): é chave técnica, e quem escolhe loja a
          // reconhece pelo nome. A busca continua achando pelo código.
          label={<span className="min-w-0 truncate">{o.nome}</span>}
        />
        {/* O selo fica FORA do rótulo do Checkbox: o rótulo da SDK dimensiona pelo
            conteúdo, e dentro dele o selo grudava no nome. */}
        {!recuo && (o.regiao || o.estado) && (
          <Badge variant="secondary" className="ml-2 shrink-0 px-1.5 py-0 text-[10px]">
            {modo === 'ESTADO' ? o.estado || o.regiao : o.regiao || o.estado}
          </Badge>
        )}
      </div>
    )
  }

  /**
   * A linha de um GRUPO consolidado: a caixa é do grupo, e as operações de
   * dentro aparecem sem caixa — elas não se marcam sozinhas. A ordem dos membros
   * é a do número da loja (ver `unidades.ts`).
   */
  function linhaDeGrupo(o: OperacaoDoSeletor) {
    const membros = o.membros ?? []
    const aberto = expandidos.has(o.ref)
    return (
      <div key={o.ref}>
        <div className="flex items-center rounded-md px-2 transition-colors duration-fast ease-default hover:bg-muted">
          <button
            type="button"
            onClick={() => alternarExpansao(o.ref)}
            aria-expanded={aberto}
            aria-label={`${aberto ? 'Recolher' : 'Ver'} as operações de ${o.nome}`}
            className="mr-1 shrink-0 rounded p-0.5 text-muted-foreground transition-colors duration-fast ease-default hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronRight
              className={cn(
                'h-4 w-4 transition-transform duration-fast ease-default',
                aberto && 'rotate-90'
              )}
              aria-hidden
            />
          </button>
          <Checkbox
            checked={rascunho.has(o.ref)}
            onCheckedChange={() => alternar(o.ref)}
            className="min-w-0 flex-1 py-2"
            label={<span className="min-w-0 truncate">{o.nome}</span>}
          />
          <Tooltip content={membros.join(', ')}>
            <Badge
              variant="secondary"
              className="ml-2 shrink-0 cursor-help px-1.5 py-0 text-[10px]"
            >
              {membros.length}
            </Badge>
          </Tooltip>
        </div>
        {aberto && (
          <ul className="ml-[3.375rem] flex flex-col gap-0.5 py-1">
            {membros.map((nome) => (
              <li key={nome} className="truncate text-xs text-muted-foreground">
                {nome}
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }

  return (
    <>
      {/* A dica repete a seleção por extenso: é o que o rótulo curto (e o
          `truncate` de um nome comprido) deixa de mostrar. */}
      <Tooltip content={consolidado ? `${rotulo} · matriz e filiais consolidadas` : rotulo}>
        <Button
          ref={gatilho}
          // Sem nada marcado o botão é o de destaque: é o próximo passo da tela.
          variant={marcadasAgora.length === 0 ? 'default' : todas ? 'ghost' : 'secondary'}
          size="sm"
          // ☠️ Nada de `sm:w-auto`: `sm:` é viewport, e a faixa que contém o botão é
          // container query. Com `w-full`, quem manda na largura é a faixa, e o
          // `truncate` corta o nome em vez de empurrar o vizinho (RH, 16/09/2026).
          //
          // ☠️ CONTORNO QUE ALCANÇA O DOM INTERNO DA SDK: o `Button` embrulha os
          // filhos num `<span class="inline-flex …">` com `min-width: auto`, que
          // nunca é espremido — e o `truncate` do rótulo nunca age. `[&>span]:min-w-0`
          // alcança esse filho direto. Se a SDK trocar a estrutura, o rótulo volta
          // a transbordar (o `overflow-hidden` segura o estrago, sem reticências).
          // Devolutiva ao time da SDK: `devolutivas/para-sdk/alpha60-export-testes-e-truncate-do-button.md`.
          className="w-full justify-between gap-2 overflow-hidden [&>span]:min-w-0"
          onClick={() => (aberto ? setAberto(false) : abrir())}
          disabled={operacoes.length === 0}
          aria-expanded={aberto}
          aria-label="Escolher as operações do painel"
          data-tour="filtro-operacoes"
        >
          <Store className="h-4 w-4 shrink-0" />
          {/* `min-w-0` é o que FAZ o `truncate` funcionar num filho de flex, e o
              par abaixo troca o rótulo pela largura DA FAIXA: `block`/`hidden`, e
              nunca `inline` — `truncate` não age em elemento inline. */}
          <span className="block min-w-0 truncate @md:hidden @xl:block">{rotuloCompleto}</span>
          <span className="hidden min-w-0 truncate @md:block @xl:hidden">{rotuloEnxuto}</span>
          <ChevronDown
            className={cn(
              'h-4 w-4 shrink-0 transition-transform duration-fast ease-default',
              aberto && 'rotate-180'
            )}
          />
        </Button>
      </Tooltip>

      {aberto &&
        caixa &&
        createPortal(
          <div
            ref={painel}
            style={{ top: caixa.top, left: caixa.left, width: LARGURA, maxHeight: caixa.altura }}
            className="fixed z-[70] flex flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-lg"
          >
            <div className="flex shrink-0 flex-col gap-2 border-b border-border p-2">
              <Input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por nome, código, estado ou região…"
                aria-label="Buscar operação"
              />
              <SegmentedControl<Modo>
                value={modo}
                onChange={setModo}
                ariaLabel="Agrupar operações"
                className="grid w-full grid-cols-3 *:justify-center"
                options={[
                  { value: 'OPERACAO', label: 'Por operação' },
                  { value: 'ESTADO', label: 'Por estado' },
                  { value: 'REGIAO', label: 'Por região' },
                ]}
              />
            </div>

            {/* Rótulo em UMA linha, sem a explicação embaixo: com ela o bloco
                ficava mais alto que a busca e o interruptor parecia o assunto
                do seletor (o mesmo ajuste do Dashboard de RH). O que ele faz
                está na FAQ. */}
            <div className="flex shrink-0 flex-col border-b border-border px-3 py-2">
              <Switch
                checked={consolidar}
                onCheckedChange={onConsolidarChange}
                label={<span className="text-xs">Consolidar matriz e filiais</span>}
                labelSide="right"
                className="px-1"
              />
            </div>

            <div className="shrink-0 border-b border-border px-4">
              <Checkbox
                checked={rascunhoTodas ? true : rascunho.size > 0 ? 'indeterminate' : false}
                onCheckedChange={() =>
                  escrever(
                    rascunhoTodas
                      ? new Set()
                      : // A de teste já marcada uma a uma CONTINUA marcada: marcar as
                        // outras não é motivo para desfazer uma escolha da pessoa.
                        new Set([
                          ...deVerdade.map((o) => o.ref),
                          ...operacoes.filter((o) => rascunho.has(o.ref)).map((o) => o.ref),
                        ])
                  )
                }
                className="w-full py-2.5"
                label={<span className="font-medium">Selecionar todas</span>}
              />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-2">
              {visiveis.length === 0 && (
                <p className="px-2 py-3 text-sm text-muted-foreground">
                  Nenhuma operação encontrada.
                </p>
              )}

              {modo === 'OPERACAO' &&
                visiveis.map((o) =>
                  (o.membros?.length ?? 0) > 1
                    ? linhaDeGrupo(o)
                    : // Com a consolidação ligada há linhas de grupo na lista, e a
                      // loja sem filial precisa do recuo da seta para alinhar com
                      // elas. Desligada, nenhuma linha tem seta e o recuo sobraria.
                      linhaOperacao(o, false, consolidar)
                )}

              {modo !== 'OPERACAO' &&
                grupos.map((g) => {
                  const marcadosNoGrupo = g.membros.filter((m) => rascunho.has(m.ref)).length
                  const estadoDoGrupo =
                    marcadosNoGrupo === 0
                      ? false
                      : marcadosNoGrupo === g.membros.length
                        ? true
                        : ('indeterminate' as const)
                  // Com busca, o grupo abre sozinho: quem procurou quer ver quem
                  // casou, não descobrir que precisa clicar na seta.
                  const expandido = termo !== '' || expandidos.has(g.nome)
                  return (
                    <div key={g.nome} className="flex flex-col">
                      <div className="flex items-center gap-1 rounded-md px-1 transition-colors duration-fast ease-default hover:bg-muted">
                        <button
                          type="button"
                          onClick={() => alternarExpansao(g.nome)}
                          aria-expanded={expandido}
                          aria-label={`${expandido ? 'Recolher' : 'Ver'} as operações de ${g.nome}`}
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-muted-foreground hover:text-foreground"
                        >
                          <ChevronRight
                            className={cn(
                              'h-4 w-4 transition-transform duration-fast ease-default',
                              expandido && 'rotate-90'
                            )}
                          />
                        </button>
                        <Checkbox
                          checked={estadoDoGrupo}
                          onCheckedChange={() => alternarGrupo(g.membros)}
                          className="min-w-0 flex-1 py-2"
                          label={<span className="min-w-0 truncate font-medium">{g.nome}</span>}
                        />
                        {/* A contagem fica FORA do rótulo do Checkbox, alinhada na
                            borda direita. */}
                        <span className="ml-auto shrink-0 pr-2 text-xs tabular-nums text-muted-foreground">
                          {marcadosNoGrupo} de {g.membros.length}
                        </span>
                      </div>
                      {expandido && g.membros.map((o) => linhaOperacao(o, true))}
                    </div>
                  )
                })}
            </div>

            <div className="flex shrink-0 items-center justify-between gap-2 border-t border-border bg-muted/40 p-2">
              <span className="text-xs text-muted-foreground">
                {rascunho.size === 0
                  ? 'Marque ao menos uma operação'
                  : rascunhoTodas
                    ? 'Todas marcadas'
                    : // O total é o da LISTA, e não o das de verdade: com uma de teste
                      // marcada a mão, "de 102" daria um numerador maior que o total.
                      `${rascunho.size} de ${operacoes.length}`}
              </span>
              <span className="text-xs text-muted-foreground">
                Use Consultar, no topo, para buscar os números.
              </span>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
