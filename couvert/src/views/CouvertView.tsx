import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { Download, Lock, Music, RefreshCw, Search, SearchX, Store } from 'lucide-react'
import {
  Button,
  EmptyState,
  IconInput,
  SegmentedControl,
  Spinner,
  TelaCheia,
  TourReplayButton,
  WidthFrame,
} from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'
import { useUser } from '@gia-cb/sdk/auth'
import { useTourReplayTrigger } from '@gia-cb/sdk/modules'
import { useCanAccess, useCanAccessState } from '@gia-cb/sdk/permissions'
import { useLojasCouvert, useMesas } from '../api/couvert'
import { CartaoMesa } from '../components/CartaoMesa'
import { DetalheMesa } from '../components/DetalheMesa'
import { ChipsSituacao } from '../components/ChipsSituacao'
import { FiltrosBar, type FiltrosValor } from '../components/FiltrosBar'
import { MensagemErro } from '../components/MensagemErro'
import { exportarMesas } from '../exportar'
import { formatData, formatHora, haQuantoTempo, MODULE_ID } from '../helpers'
import { useUltimaPesquisa } from '../hooks/use-ultima-pesquisa'
import { contar, mesasVisiveis, ROTULO_SITUACAO } from '../regras'
import type { Consulta, FiltroSituacao, LojaCouvert, Ordem } from '../types'

/** Abaixo desta largura (px) a tela usa o layout de celular. */
const LARGURA_COMPACTA = 768

/** De onde veio o erro, em palavras (a mensagem padrão mostra embaixo do título). */
const ORIGEM_HANDLER: Record<string, string> = {
  lojas: 'Lista de lojas',
  mesas: 'Mesas da BI do Simphony',
}

/** `true` quando a ÁREA do módulo é estreita (mede o elemento, não a janela). */
function useModoCompacto(el: HTMLElement | null): boolean {
  const [compacto, setCompacto] = useState(false)
  useLayoutEffect(() => {
    if (!el || typeof ResizeObserver === 'undefined') return
    const medir = (largura: number) => setCompacto(largura > 0 && largura < LARGURA_COMPACTA)
    medir(el.getBoundingClientRect().width)
    const ro = new ResizeObserver((entries) => medir(entries[0]?.contentRect.width ?? 0))
    ro.observe(el)
    return () => ro.disconnect()
  }, [el])
  return compacto
}

/** Relógio da tela, para o "atualizado há N min" andar sozinho (sem pesquisar). */
function useAgora(intervaloMs: number): number {
  const [agora, setAgora] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setAgora(Date.now()), intervaloMs)
    return () => clearInterval(id)
  }, [intervaloMs])
  return agora
}

/** Loja 01 da rede, pelo número no começo do nome do cadastro ("01.CB ..."). */
const ehLoja01 = (l: LojaCouvert) => /^\s*0*1\D/.test(l.nome)

/**
 * Loja e RVC com que a tela abre: a loja 01 no 1º RVC. Quem não tem a 01 no escopo vê a
 * última loja/RVC que pesquisou, se ela ainda está no escopo (Q-02).
 */
function sugestao(lojas: LojaCouvert[], ultima: Consulta | undefined): FiltrosValor {
  const loja01 = lojas.find(ehLoja01)
  if (loja01) return { empresaId: loja01.empresaId, rvc: loja01.rvcs[0]?.numero ?? null }
  const loja = ultima && lojas.find((l) => l.empresaId === ultima.empresaId)
  if (!loja) return { empresaId: null, rvc: null }
  const rvc = loja.rvcs.some((r) => r.numero === ultima.rvc) ? ultima.rvc : loja.rvcs[0]?.numero
  return { empresaId: loja.empresaId, rvc: rvc ?? null }
}

const mesma = (a: Consulta | null, b: Consulta) =>
  a !== null && a.empresaId === b.empresaId && a.rvc === b.rvc

export function CouvertView() {
  // Com o estado de carregamento: sem ele, a tela piscaria "Sem acesso" até as
  // permissões chegarem (api-reference §1.2, `useCanAccessState`).
  const { allowed: canView, loading: carregandoAcesso } = useCanAccessState('couvert.ler')
  const canExport = useCanAccess('couvert.exportar')
  const replayTour = useTourReplayTrigger(MODULE_ID)
  const { user } = useUser()
  const usuarioId = user?.id ?? null
  const ultima = useUltimaPesquisa((s) => (usuarioId ? s.porUsuario[usuarioId] : undefined))
  const gravarUltima = useUltimaPesquisa((s) => s.gravar)

  const [area, setArea] = useState<HTMLDivElement | null>(null)
  const compacto = useModoCompacto(area)
  const agora = useAgora(30_000)

  const lojasQuery = useLojasCouvert(canView)
  const lojas = useMemo(() => lojasQuery.data ?? [], [lojasQuery.data])

  // Até o usuário mexer, os filtros são a sugestão (sem pesquisar).
  const [escolha, setEscolha] = useState<FiltrosValor | null>(null)
  const filtros = escolha ?? sugestao(lojas, ultima)

  const [consulta, setConsulta] = useState<Consulta | null>(null)
  const mesasQuery = useMesas(consulta)
  const resposta = mesasQuery.data

  const [filtro, setFiltro] = useState<FiltroSituacao>('todas')
  const [busca, setBusca] = useState('')
  const [ordem, setOrdem] = useState<Ordem>('mesa')
  const [telaCheia, setTelaCheia] = useState(false)
  const [mesaAberta, setMesaAberta] = useState<string | null>(null)

  const mesas = useMemo(() => resposta?.mesas ?? [], [resposta])
  const temBuffet = resposta?.temBuffet ?? false
  const contagem = useMemo(() => contar(mesas, temBuffet), [mesas, temBuffet])
  const visiveis = useMemo(
    () => mesasVisiveis(mesas, temBuffet, filtro, busca, ordem),
    [mesas, temBuffet, filtro, busca, ordem]
  )
  const [exportando, setExportando] = useState(false)

  /** Começa a pesquisa; `false` quando falta loja ou RVC (a barra fica aberta). */
  function pesquisar(valor: FiltrosValor): boolean {
    if (valor.empresaId === null || valor.rvc === null) return false
    const nova: Consulta = { empresaId: valor.empresaId, rvc: valor.rvc }
    if (mesma(consulta, nova)) {
      void mesasQuery.refetch()
    } else {
      setConsulta(nova)
      setFiltro('todas')
    }
    if (usuarioId) gravarUltima(usuarioId, nova)
    return true
  }

  if (carregandoAcesso) {
    return (
      <WidthFrame className="flex h-64 items-center justify-center">
        <Spinner />
      </WidthFrame>
    )
  }
  if (!canView) {
    return (
      <WidthFrame className="h-[calc(100vh-6.5rem)] md:h-[calc(100vh-7.5rem)]">
        <EmptyState
          icon={Lock}
          title="Sem acesso"
          description="Você não tem a permissão para consultar o Couvert."
        />
      </WidthFrame>
    )
  }

  const consultando = mesasQuery.isFetching
  const lojaDaTela = lojas.find((l) => l.empresaId === filtros.empresaId)
  const erro = lojasQuery.error ?? (consulta ? mesasQuery.error : null)
  const atualizado = resposta ? haQuantoTempo(resposta.consultadoEm, agora) : undefined
  const dicaAtualizado = resposta
    ? `Dia de negócio ${formatData(resposta.dia)} · mesas de ${formatHora(resposta.consultadoEm)}. Clique para buscar de novo na BI do Simphony.`
    : undefined

  let conteudo
  if (erro && !consultando) {
    const handler = (erro as { requisicao?: { handler?: string } } | null)?.requisicao?.handler
    conteudo = (
      // Mesma posição dos estados vazios (EmptyState): no alto, centrada, py-12.
      <div className="flex min-h-0 flex-1 justify-center overflow-y-auto px-4 py-12">
        <MensagemErro
          erro={erro}
          origem={handler ? ORIGEM_HANDLER[handler] : undefined}
          onTentarDeNovo={() => {
            if (lojasQuery.error) void lojasQuery.refetch()
            else void mesasQuery.refetch()
          }}
        />
      </div>
    )
  } else if (!consulta) {
    const semLojas = !lojasQuery.isLoading && lojas.length === 0
    const semRvc = lojaDaTela !== undefined && lojaDaTela.rvcs.length === 0
    conteudo = (
      <EmptyState
        icon={Store}
        title={
          semLojas
            ? 'Nenhuma loja com a BI do Simphony'
            : semRvc
              ? 'Loja sem RVC configurado'
              : 'Escolha a loja e o RVC'
        }
        description={
          semLojas
            ? 'Seu usuário não tem nenhuma loja com vínculo com a BI do Simphony. Peça acesso ao administrador.'
            : semRvc
              ? 'Esta loja ainda não tem salões (RVCs) configurados para o couvert. Avise o time do Portal GIA.'
              : 'Selecione a loja e o salão e clique em Pesquisar para ver as mesas abertas agora.'
        }
      />
    )
  } else if (!resposta) {
    conteudo = (
      <div
        className="flex flex-1 flex-col items-center justify-start gap-3 py-12 text-center"
        role="status"
      >
        <Spinner />
        <p className="max-w-sm text-sm text-muted-foreground">
          Buscando as mesas abertas na BI do Simphony. Nos horários de movimento ela pode levar até
          2 minutos.
        </p>
      </div>
    )
  } else {
    const atualizar = compacto && (
      <Button
        variant="ghost"
        className="h-11 shrink-0"
        onClick={() => pesquisar(filtros)}
        loading={consultando}
        data-tour="couvert-atualizar"
      >
        <RefreshCw className="h-4 w-4" /> Atualizar
        {atualizado && <span className="text-muted-foreground">· {atualizado}</span>}
      </Button>
    )
    const lojaConsultada = lojas.find((l) => l.empresaId === consulta.empresaId)
    const exportar = canExport && (
      // Mesmo visual do Exportar do `DataReport` do SDK (secondary + Download).
      <Button
        variant="secondary"
        className={cn('shrink-0', compacto && 'h-11')}
        disabled={consultando || exportando || visiveis.length === 0}
        loading={exportando}
        data-tour="couvert-exportar"
        onClick={() => {
          setExportando(true)
          const partes = [
            filtro !== 'todas' ? ROTULO_SITUACAO[filtro] : null,
            busca.trim() ? `mesa "${busca.trim()}"` : null,
          ].filter(Boolean)
          exportarMesas(visiveis, {
            lojaNome: lojaConsultada?.nome ?? `Loja ${consulta.empresaId}`,
            rvcNome:
              lojaConsultada?.rvcs.find((r) => r.numero === consulta.rvc)?.nome ??
              `RVC ${consulta.rvc}`,
            dia: resposta.dia,
            consultadoEm: resposta.consultadoEm,
            temBuffet,
            filtro: partes.length > 0 ? partes.join(' · ') : null,
            total: mesas.length,
          })
            .catch((e) => console.error('[couvert] falha ao gerar a planilha:', e))
            .finally(() => setExportando(false))
        }}
      >
        <Download className="h-4 w-4" /> Exportar
      </Button>
    )
    conteudo = (
      <>
        <div
          className={cn(
            'flex shrink-0 gap-2',
            compacto ? 'flex-col items-stretch' : 'flex-wrap items-center justify-between'
          )}
        >
          <ChipsSituacao
            contagem={contagem}
            filtro={filtro}
            onFiltro={setFiltro}
            compacto={compacto}
          />
          <div className={cn('flex items-center gap-2', compacto && 'justify-between')}>
            <div className={cn('min-w-0', compacto ? 'flex-1' : 'w-28')} data-tour="couvert-busca">
              <IconInput
                icon={Search}
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Mesa"
                aria-label="Buscar mesa"
                inputMode="search"
              />
            </div>
            <div className="shrink-0" data-tour="couvert-ordem">
              <SegmentedControl<Ordem>
                value={ordem}
                onChange={setOrdem}
                ariaLabel="Ordem das mesas"
                options={[
                  { value: 'mesa', label: 'Mesa', tooltip: 'Pelo número da mesa' },
                  {
                    value: 'atencao',
                    label: 'Atenção',
                    tooltip: 'Maior número de divergências primeiro',
                  },
                ]}
              />
            </div>
            {!compacto && atualizado && (
              <span className="whitespace-nowrap text-xs text-muted-foreground tabular-nums">
                atualizado {atualizado}
              </span>
            )}
            {!compacto && exportar}
          </div>
          {compacto ? (
            <div className="flex items-center justify-between gap-2">
              {atualizar}
              {exportar}
            </div>
          ) : null}
        </div>
        {visiveis.length === 0 ? (
          <EmptyState
            icon={mesas.length === 0 ? Music : SearchX}
            title={mesas.length === 0 ? 'Nenhuma mesa aberta' : 'Nenhuma mesa encontrada'}
            description={
              mesas.length === 0
                ? 'Não há conta aberta neste salão agora. Clique em Atualizar para conferir de novo.'
                : 'Nenhuma mesa com esse número ou nessa situação. Limpe a busca ou clique em Todas.'
            }
          />
        ) : (
          <ul
            className={cn(
              'grid min-h-0 flex-1 auto-rows-min gap-2 overflow-y-auto px-0.5 pb-1 pt-2.5',
              'grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(12.5rem,1fr))]',
              'transition-opacity duration-fast',
              consultando && 'opacity-60'
            )}
            aria-busy={consultando}
            aria-label="Mesas abertas"
          >
            {visiveis.map((m) => (
              <CartaoMesa
                key={m.id}
                mesa={m}
                temBuffet={temBuffet}
                onAbrir={() => setMesaAberta(m.id)}
              />
            ))}
          </ul>
        )}
      </>
    )
  }

  return (
    <WidthFrame className="flex h-[calc(100vh-6.5rem)] flex-col md:h-[calc(100vh-7.5rem)]">
      <TelaCheia ativa={telaCheia} onSair={() => setTelaCheia(false)} className="gap-3 p-4">
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <FiltrosBar
            value={filtros}
            onValueChange={setEscolha}
            lojas={lojas}
            lojasLoading={lojasQuery.isLoading}
            consultando={consultando}
            onPesquisar={() => pesquisar(filtros)}
            compacto={compacto}
            enxuto={consulta !== null}
            mesmaPesquisa={
              consulta?.empresaId === filtros.empresaId && consulta?.rvc === filtros.rvc
            }
            dicaPesquisar={dicaAtualizado}
            telaCheia={telaCheia}
            onTelaCheia={() => setTelaCheia((v) => !v)}
            tituloExtra={<TourReplayButton onClick={replayTour} />}
          />
          <div
            ref={setArea}
            className="flex min-h-0 flex-1 flex-col gap-3"
            data-tour="couvert-conteudo"
          >
            {conteudo}
          </div>
        </div>
        <DetalheMesa
          mesa={mesas.find((m) => m.id === mesaAberta) ?? null}
          empresaId={consulta?.empresaId ?? null}
          temBuffet={temBuffet}
          agora={agora}
          onFechar={() => setMesaAberta(null)}
        />
      </TelaCheia>
    </WidthFrame>
  )
}
