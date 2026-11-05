import { useMemo, useRef, useState, type ReactNode } from 'react'
import { AlertTriangle, Gauge, Info, RefreshCw } from 'lucide-react'
import { Button, EmptyState, SegmentedControl, Select, Skeleton } from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'
import { useEntradaEmCascata } from '../../hooks/use-entrada'
import {
  MIN_PEDIDOS_CELULA,
  MIN_PEDIDOS_CELULA_DIA,
  QUEM_CANCELOU,
  TRACO,
  canaisDosPedidos,
  cancelamentosPorQuem,
  chaveDaCelula,
  estatisticasDasEtapas,
  filtrarCanal,
  fmtBRLCompacto,
  fmtInt,
  fmtMin,
  fmtDuracao,
  fmtPct,
  fracao,
  mapaDeCalor,
  plural,
  resumoOperacional,
} from '../../operacional'
import type { Consulta, PedidoOperacional } from '../../types'
import type { Faixa } from '../../operacional'
import { RoscaCancelamentos } from '../graficos/RoscaCancelamentos'
import { CartaoIndicador } from '../graficos/CartaoIndicador'
import { COR, COR_DIA_DA_SEMANA } from '../../graficos'
import { MapaDeCalor } from '../graficos/MapaDeCalor'
import { LinhasPorDiaDaSemana, type SerieDoDia } from '../graficos/LinhasPorDiaDaSemana'
import { MolduraGrafico } from '../graficos/MolduraGrafico'
import { CartoesEtapas } from '../graficos/CartoesEtapas'
import { NumeroAnimado } from '../graficos/NumeroAnimado'

// O dashboard Operacional: quanto tempo o pedido leva dentro da loja, em que dias
// e horários trava, e quem cancela. Base: docs/gargalos-operacionais-delivery.md;
// as contas estão em `operacional.ts`.
//
// ── SÓ O QUE TODA LOJA TEM ──────────────────────────────────────────────────
//
// As etapas da loja (aceite, preparo, expedição) existem em toda loja. Rota e
// tempo até a entrega dependem do app de entrega registrar a entrega no Maestro,
// e há loja em que ele não registra nada (a 01 em outubro/2026). Os cartões de
// entrega só aparecem quando há o dado; sem ele, uma linha diz por quê — cartão
// vazio seria lido como defeito.
//
// O desenho segue o Dashboard do Plano de Contas: cartões de indicador no topo,
// gráficos em molduras com tela cheia (e a tabela dos números), e o filtro de
// canal acima de tudo o que ele muda.

/** Mínimo, mediana e máximo de um tempo, para a dica dos cartões do topo. */
const extremos = (f: Faixa) => [
  { rotulo: 'Mínimo', valor: fmtDuracao(f.minimo) },
  { rotulo: 'Mediana', valor: fmtDuracao(f.mediana) },
  { rotulo: 'Máximo', valor: fmtDuracao(f.maximo) },
]

/** `fmtInt` que aceita `null` (o formato do `NumeroAnimado`). */
const fmtIntOuTraco = (v: number | null) => (v == null ? TRACO : fmtInt(v))

type MetricaDoMapa = 'naLoja' | 'preparo' | 'pedidos'
type LeituraDoMapa = 'semana' | 'dia'

const LEITURAS_DO_MAPA: Array<{ value: LeituraDoMapa; label: string; tooltip: string }> = [
  {
    value: 'semana',
    label: 'Por dia da semana',
    tooltip: 'Junta todas as segundas do período numa linha, todas as terças na outra…',
  },
  { value: 'dia', label: 'Por dia', tooltip: 'Uma linha para cada dia do período pesquisado' },
]

const METRICAS_DO_MAPA: Array<{ value: MetricaDoMapa; label: string }> = [
  { value: 'naLoja', label: 'Tempo na loja' },
  { value: 'preparo', label: 'Preparo' },
  { value: 'pedidos', label: 'Pedidos' },
]

const TODOS = '__todos'

interface Props {
  consulta: Consulta | null
  pedidos: PedidoOperacional[] | null
  carregando: boolean
  erro: Error | null
  onTentarDeNovo: () => void
  /** Celular: a página rola inteira, e a aba não rola por dentro. */
  compacto: boolean
  className?: string
}

function Aviso({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-lg border border-border bg-surface p-6',
        className
      )}
    >
      {children}
    </div>
  )
}

export function AbaOperacional({
  consulta,
  pedidos,
  carregando,
  erro,
  onTentarDeNovo,
  compacto,
  className,
}: Props) {
  if (erro) {
    return (
      <Aviso className={className}>
        <EmptyState
          icon={AlertTriangle}
          title="Não foi possível montar o dashboard"
          description={erro.message}
          action={
            <Button onClick={onTentarDeNovo}>
              <RefreshCw className="h-4 w-4" /> Tentar de novo
            </Button>
          }
        />
      </Aviso>
    )
  }
  if (!consulta) {
    return (
      <Aviso className={className}>
        <EmptyState
          icon={Gauge}
          title="Escolha a loja e o período"
          description="Selecione a loja, as datas e clique em Pesquisar para ver os tempos e os gargalos do delivery."
        />
      </Aviso>
    )
  }
  if (carregando || !pedidos) return <EsqueletoOperacional className={className} />
  if (pedidos.length === 0) {
    return (
      <Aviso className={className}>
        <EmptyState
          icon={Gauge}
          title="Nenhum pedido"
          description="Nenhum pedido de delivery encontrado para a loja no período."
        />
      </Aviso>
    )
  }
  // `key`: outra pesquisa monta o painel de novo — o canal volta para "todos" e
  // a entrada em cascata roda outra vez, com os dados novos.
  return (
    <PainelOperacional
      key={`${consulta.empresaId}|${consulta.de}|${consulta.ate}`}
      de={consulta.de}
      ate={consulta.ate}
      pedidos={pedidos}
      compacto={compacto}
      className={className}
    />
  )
}

function EsqueletoOperacional({ className }: { className?: string }) {
  return (
    <div
      className={cn('@container flex flex-col gap-3 overflow-hidden', className)}
      aria-busy="true"
      aria-label="Carregando o dashboard operacional"
    >
      <p className="text-xs text-muted-foreground">
        Buscando o histórico de status de cada pedido — 31 dias de uma loja movimentada levam até
        ~45 segundos.
      </p>
      <Skeleton className="h-8 w-72 max-w-full" />
      <div className="grid grid-cols-2 gap-2 @4xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-[5.25rem] rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 @4xl:grid-cols-2">
        <Skeleton className="h-48 rounded-lg" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
      <Skeleton className="h-72 rounded-lg" />
    </div>
  )
}

function SemDados({ children }: { children: ReactNode }) {
  return (
    <p className="flex min-h-24 items-center justify-center text-center text-xs text-muted-foreground">
      {children}
    </p>
  )
}

function PainelOperacional({
  de,
  ate,
  pedidos: todos,
  compacto,
  className,
}: {
  de: string
  ate: string
  pedidos: PedidoOperacional[]
  compacto: boolean
  className?: string
}) {
  const raiz = useRef<HTMLDivElement>(null)
  useEntradaEmCascata(raiz, true)
  const [canal, setCanal] = useState<string | null>(null)
  const [metricaMapa, setMetricaMapa] = useState<MetricaDoMapa>('naLoja')
  const [leituraMapa, setLeituraMapa] = useState<LeituraDoMapa>('semana')

  const canais = useMemo(() => canaisDosPedidos(todos), [todos])
  const pedidos = useMemo(() => filtrarCanal(todos, canal), [todos, canal])
  const r = useMemo(() => resumoOperacional(pedidos), [pedidos])
  const mapa = useMemo(() => mapaDeCalor(pedidos, de, ate), [pedidos, de, ate])
  const quem = useMemo(() => cancelamentosPorQuem(pedidos), [pedidos])

  const etapas = useMemo(() => estatisticasDasEtapas(pedidos), [pedidos])

  // "Por dia da semana": uma série por dia, um valor por hora. Memo, porque
  // mudar a série redesenha as linhas (`useAnimarMarcas`).
  const seriesDaSemana = useMemo<SerieDoDia[]>(
    () =>
      mapa.semana.linhas.map((d) => ({
        chave: d.chave,
        rotulo: d.rotulo,
        cor: COR_DIA_DA_SEMANA[d.chave] ?? COR.serie,
        valores: mapa.horas.map((h) => {
          const c = mapa.semana.celulas.get(chaveDaCelula(d.chave, h))
          if (metricaMapa === 'pedidos') return c?.pedidos ?? 0
          if (!c || c.medidos < MIN_PEDIDOS_CELULA) return null
          return metricaMapa === 'preparo' ? c.preparoMedia : c.naLojaMedia
        }),
      })),
    [mapa, metricaMapa]
  )

  const nomeDaMetrica =
    metricaMapa === 'pedidos'
      ? 'Pedidos'
      : metricaMapa === 'preparo'
        ? 'Preparo (média)'
        : 'Tempo na loja (média)'
  const grade = leituraMapa === 'dia' ? mapa.dias : mapa.semana
  const piso = leituraMapa === 'dia' ? MIN_PEDIDOS_CELULA_DIA : MIN_PEDIDOS_CELULA
  const formatarMapa = (v: number | null) =>
    metricaMapa === 'pedidos' ? (v == null ? TRACO : fmtInt(v)) : fmtMin(v)

  return (
    <div
      ref={raiz}
      className={cn(
        // `relative`: os `absolute` de dentro (âncora da dica) não podem tomar a
        // moldura da página como referência. No desktop a rolagem é desta div;
        // no celular a página inteira rola, e ela não.
        '@container relative',
        !compacto && 'overflow-y-auto pr-1',
        className
      )}
    >
      <div className="flex flex-col gap-4 pb-4">
        <div
          className="flex flex-wrap items-center gap-x-4 gap-y-2"
          data-tour="reports-maestro-operacional-filtros"
        >
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="whitespace-nowrap text-xs text-muted-foreground">Canal</span>
            <Select value={canal ?? TODOS} onValueChange={(v) => setCanal(v === TODOS ? null : v)}>
              <Select.Trigger className="h-8 w-52 max-w-full text-xs" aria-label="Canal">
                <span className="truncate">{canal ?? 'Todos os canais'}</span>
              </Select.Trigger>
              <Select.Content>
                <Select.Item value={TODOS}>Todos os canais</Select.Item>
                {canais.map((c) => (
                  <Select.Item key={c} value={c}>
                    {c}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
          <span className="text-xs text-muted-foreground">
            {plural(r.pedidos, 'pedido', 'pedidos')} · tempos de{' '}
            {plural(r.medidos, 'entrega', 'entregas')} (sem retiradas e cancelados)
          </span>
        </div>

        <div
          className="grid grid-cols-2 gap-2 @4xl:grid-cols-4"
          data-tour="reports-maestro-operacional-resumo"
        >
          <CartaoIndicador
            atraso={0}
            rotulo="Tempo na loja (média)"
            valor={<NumeroAnimado valor={r.naLoja.media} formatar={fmtMin} />}
            detalhe={`90% até ${fmtMin(r.naLoja.p90)}`}
            valoresDaDica={extremos(r.naLoja)}
            ajuda="Do pedido recebido até o despachado: aceite, preparo e expedição. O número grande é a média das entregas; 90% levam até o segundo número."
          />
          <CartaoIndicador
            atraso={40}
            rotulo="Preparo (média)"
            valor={<NumeroAnimado valor={r.preparo.media} formatar={fmtMin} />}
            detalhe={`90% até ${fmtMin(r.preparo.p90)}`}
            valoresDaDica={extremos(r.preparo)}
            ajuda="Do pedido confirmado até o embalado: cozinha e embalagem."
          />
          {r.entrega ? (
            <CartaoIndicador
              atraso={80}
              rotulo="Até a entrega (média)"
              valor={<NumeroAnimado valor={r.entrega.total.media} formatar={fmtMin} />}
              detalhe={`90% até ${fmtMin(r.entrega.total.p90)}`}
              valoresDaDica={extremos(r.entrega.total)}
              ajuda={`Do pedido recebido até a entrega registrada pelo app de entrega. Medido em ${plural(r.entrega.medidas, 'entrega', 'entregas')}.`}
            />
          ) : (
            <CartaoIndicador
              atraso={80}
              rotulo="Pedidos"
              valor={<NumeroAnimado valor={r.pedidos} formatar={fmtIntOuTraco} />}
              detalhe={canal ?? 'todos os canais'}
              ajuda="Todos os pedidos de delivery do período no canal escolhido, incluindo retiradas e cancelados."
            />
          )}
          <CartaoIndicador
            atraso={120}
            rotulo="Cancelados"
            valor={<NumeroAnimado valor={fracao(r.cancelados, r.pedidos)} formatar={fmtPct} />}
            detalhe={`${fmtInt(r.cancelados)} · ${fmtBRLCompacto(r.canceladosValor)}`}
            ajuda="Pedidos cancelados, pelo cliente, pela plataforma ou pela loja."
          />
        </div>

        {r.entrega ? (
          r.entrega.semEntrega > 0 && (
            <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <Info className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
              <span>
                {plural(r.entrega.semEntrega, 'entrega saiu', 'entregas saíram')} da loja sem a
                entrega registrada pelo app de entrega (
                {fmtPct(fracao(r.entrega.semEntrega, r.entrega.entregas))} das entregas,{' '}
                {fmtBRLCompacto(r.entrega.semEntregaValor)}) — sem tempo de rota.
              </span>
            </p>
          )
        ) : (
          <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <Info className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>
              Nenhuma entrega registrada pelo app de entrega no período: o Maestro desta loja para
              em <strong className="font-medium text-foreground">Despachado</strong>. Por isso a
              rota e o tempo até a entrega não aparecem — só os tempos dentro da loja.
            </span>
          </p>
        )}

        <div className="grid grid-cols-1 gap-3 @4xl:grid-cols-2">
          <MolduraGrafico
            atraso={160}
            tourId="reports-maestro-operacional-etapas"
            titulo="Tempo por etapa"
            subtitulo={`Mínimo, média, mediana e máximo de cada etapa, nas ${plural(r.medidos, 'entrega medida', 'entregas medidas')}. Cada cartão tem a sua régua.`}
            tabela={() => ({
              colunas: [
                { titulo: 'Etapa' },
                { titulo: 'De → até' },
                { titulo: 'Mínimo', numerica: true },
                { titulo: 'Média', numerica: true },
                { titulo: 'Mediana', numerica: true },
                { titulo: 'Máximo', numerica: true },
              ],
              linhas: etapas.map((e) => [
                e.rotulo,
                e.descricao,
                fmtDuracao(e.minimo),
                fmtDuracao(e.media),
                fmtDuracao(e.mediana),
                fmtDuracao(e.maximo),
              ]),
            })}
          >
            {r.medidos > 0 ? (
              <CartoesEtapas etapas={etapas} formatar={fmtDuracao} />
            ) : (
              <SemDados>Nenhuma entrega com as etapas registradas no período.</SemDados>
            )}
          </MolduraGrafico>

          <MolduraGrafico
            atraso={200}
            tourId="reports-maestro-operacional-cancelamentos"
            titulo="Quem cancelou"
            subtitulo="Pelo registro do cancelamento no Maestro, com o valor dos pedidos e a média do tempo entre o pedido chegar e ser cancelado."
            tabela={() => ({
              colunas: [
                { titulo: 'Quem' },
                { titulo: 'Cancelamentos', numerica: true },
                { titulo: 'Do total', numerica: true },
                { titulo: 'Valor', numerica: true },
                { titulo: 'Média até cancelar', numerica: true },
              ],
              linhas: quem.map((q) => [
                QUEM_CANCELOU[q.por],
                fmtInt(q.pedidos),
                fmtPct(q.pedidos / Math.max(r.cancelados, 1)),
                fmtBRLCompacto(q.valor),
                fmtDuracao(q.mediaMin),
              ]),
            })}
          >
            {quem.length > 0 ? (
              <RoscaCancelamentos grupos={quem} />
            ) : (
              <SemDados>Nenhum cancelamento no período.</SemDados>
            )}
          </MolduraGrafico>
        </div>

        <MolduraGrafico
          atraso={240}
          tourId="reports-maestro-operacional-mapa"
          titulo={
            leituraMapa === 'dia' ? 'Dia × hora do pedido' : 'Hora do pedido, por dia da semana'
          }
          subtitulo={
            <>
              {leituraMapa === 'semana'
                ? 'Uma linha por dia da semana; a linha grossa é a média dos dias.'
                : `Cor mais forte = ${metricaMapa === 'pedidos' ? 'mais pedidos' : 'mais tempo'}.`}
              {metricaMapa !== 'pedidos' &&
                (leituraMapa === 'semana'
                  ? ` Horários com menos de ${piso} entregas medidas descem até a base (sem medida).`
                  : ` Horários com menos de ${piso} entregas medidas ficam listrados.`)}
              {mapa.foraDasHoras > 0 &&
                ` ${plural(mapa.foraDasHoras, 'pedido avulso', 'pedidos avulsos')} fora destes horários não aparece${mapa.foraDasHoras === 1 ? '' : 'm'}.`}
            </>
          }
          acao={
            <div className="flex flex-wrap items-center gap-2">
              <SegmentedControl<LeituraDoMapa>
                value={leituraMapa}
                onChange={setLeituraMapa}
                ariaLabel="Como o mapa agrupa os dias"
                options={LEITURAS_DO_MAPA}
              />
              <SegmentedControl<MetricaDoMapa>
                value={metricaMapa}
                onChange={setMetricaMapa}
                ariaLabel="O que o mapa mostra"
                options={METRICAS_DO_MAPA}
              />
            </div>
          }
          tabela={() => ({
            colunas: [
              { titulo: 'Dia' },
              { titulo: 'Hora', numerica: true },
              { titulo: 'Pedidos', numerica: true },
              { titulo: 'Tempo na loja (média)', numerica: true },
              { titulo: 'Preparo (média)', numerica: true },
            ],
            linhas: grade.linhas.flatMap((d) =>
              mapa.horas.flatMap((h) => {
                const c = grade.celulas.get(chaveDaCelula(d.chave, h))
                return c
                  ? [
                      [
                        d.rotulo,
                        `${h}h`,
                        fmtInt(c.pedidos),
                        fmtMin(c.naLojaMedia),
                        fmtMin(c.preparoMedia),
                      ],
                    ]
                  : []
              })
            ),
          })}
        >
          {leituraMapa === 'semana' ? (
            <LinhasPorDiaDaSemana
              series={seriesDaSemana}
              horas={mapa.horas}
              metrica={nomeDaMetrica}
              formatar={formatarMapa}
              unidade={metricaMapa === 'pedidos' ? 'pedidos' : 'min'}
              doZero={metricaMapa === 'pedidos'}
            />
          ) : (
            <MapaDeCalor
              linhas={grade.linhas}
              horas={mapa.horas}
              metrica={nomeDaMetrica}
              formatar={formatarMapa}
              rotuloPoucos={`Menos de ${piso} entregas medidas`}
              formatarNaCelula={(v) =>
                metricaMapa === 'pedidos' ? fmtInt(v) : Math.round(v).toLocaleString('pt-BR')
              }
              destacarMaior={metricaMapa !== 'pedidos'}
              celula={(linha, hora) => {
                const c = grade.celulas.get(chaveDaCelula(linha, hora))
                if (!c) return null
                const medido = c.medidos >= piso
                return {
                  pedidos: c.pedidos,
                  valor:
                    metricaMapa === 'pedidos'
                      ? c.pedidos
                      : !medido
                        ? null
                        : metricaMapa === 'preparo'
                          ? c.preparoMedia
                          : c.naLojaMedia,
                  detalhes:
                    metricaMapa === 'pedidos'
                      ? [
                          {
                            rotulo: 'Tempo na loja (média)',
                            valor: medido ? fmtMin(c.naLojaMedia) : TRACO,
                          },
                        ]
                      : undefined,
                }
              }}
            />
          )}
        </MolduraGrafico>
      </div>
    </div>
  )
}
