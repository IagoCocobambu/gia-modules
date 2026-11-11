import { Badge, Tooltip } from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'
import type { Catalogo } from '../catalogo'
import { aFavor, NOME_DA_REFERENCIA, NOME_POR_MES, type Referencia } from '../comparacao'
import {
  INDICADORES_DO_RESUMO,
  pctDoResumo,
  type IndicadorDoResumo,
  type ItemDeComparacao,
} from '../comparativos'
import { fmtBRLCompacto, fmtPct, fmtPontos, plural } from '../formato'

// O resumo de cada coluna da comparação — os cartões do desenho do designer
// ("BI — Plano de Contas", página 2).
//
// ── O QUE SAIU DAQUI, E NÃO DEVE VOLTAR SEM PEDIDO ──────────────────────────
//
// O HTML de especificação acrescentava aos cartões uma faixa **Semelhantes ·
// fat. ±10%**: as seis lojas fora da comparação com faturamento entre 90% e
// 110% do da coluna, cada uma um botão que a punha na comparação num clique.
// Foi entregue na 0.1.0 e retirada em 24/09/2026, a pedido do João: ninguém
// sabia que existia, e ela pesava a faixa de cartões — até seis botões por
// coluna, numa faixa que já rola de lado com uma coluna por loja.
//
// Quem quiser acrescentar uma loja usa o seletor de operações, que é onde todo
// mundo já procura.
//
// Uma faixa que rola de lado, e não uma grade de cartões: com 30 colunas, uma
// grade empurraria a tabela para fora da tela. A faixa tem altura fixa e a tabela
// fica com o resto.

interface Props {
  cat: Catalogo
  itens: ItemDeComparacao[]
  /** A referência escolhida, para a diferença de cada percentual. */
  referencia: Referencia
  /** Média, melhor e pior das LOJAS em cada percentual do resumo — e o grupo, se escolhido. */
  referencias: Record<
    IndicadorDoResumo,
    { media: number | null; melhor: number | null; pior: number | null; grupo?: number | null }
  >
  /** A régua é dos MESES — uma loja só na seleção (ver `reguaDaComparacao`). */
  porMeses: boolean
}

export function ResumoDasColunas({ cat, itens, referencia, referencias, porMeses }: Props) {
  const comFaturamento = itens.filter((i) => i.faturamento != null)
  const maior =
    comFaturamento.length > 1 ? Math.max(...comFaturamento.map((i) => i.faturamento!)) : null
  const menor =
    comFaturamento.length > 1 ? Math.min(...comFaturamento.map((i) => i.faturamento!)) : null

  return (
    <div
      className="flex shrink-0 snap-x gap-2 overflow-x-auto pb-1"
      data-tour="resumo-colunas"
      aria-label="Resumo das colunas da comparação"
    >
      {itens.map((it) => {
        const lojas = it.refs.length
        return (
          <article
            key={it.chave}
            className="flex w-60 shrink-0 snap-start flex-col gap-2 rounded-lg border border-border bg-surface p-3"
          >
            <header className="flex min-w-0 items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-foreground">{it.nome}</p>
                {lojas > 1 && (
                  <Tooltip
                    content={
                      <span className="block max-w-[16rem] text-left">{it.nomes.join(', ')}</span>
                    }
                  >
                    <span className="cursor-help text-[11px] text-muted-foreground underline decoration-dotted">
                      {plural(lojas, 'loja', 'lojas')}
                    </span>
                  </Tooltip>
                )}
              </div>
              {it.faturamento != null && it.faturamento === maior && (
                <Badge variant="success" className="shrink-0 px-1.5 py-0 text-[10px]">
                  Maior fat.
                </Badge>
              )}
              {it.faturamento != null && it.faturamento === menor && (
                <Badge variant="secondary" className="shrink-0 px-1.5 py-0 text-[10px]">
                  Menor fat.
                </Badge>
              )}
            </header>
            <p className="text-lg font-semibold leading-none text-foreground">
              {it.ag ? fmtBRLCompacto(it.faturamento) : 'Sem plano'}
            </p>
            {it.ag && (
              <dl className="grid grid-cols-3 gap-1">
                {INDICADORES_DO_RESUMO.map((ind) => {
                  const p = pctDoResumo(it.ag!, cat, ind.id)
                  const r = referencias[ind.id][referencia] ?? null
                  const d = p != null && r != null ? p - r : null
                  const favor = d != null && Math.abs(d) >= 0.00005 ? aFavor(d, ind.direcao) : null
                  return (
                    <div key={ind.id} className="flex min-w-0 flex-col">
                      <dt className="truncate text-[10px] uppercase tracking-wide text-muted-foreground">
                        {ind.rotulo}
                      </dt>
                      <dd className="text-sm font-medium tabular-nums text-foreground">
                        {fmtPct(p)}
                      </dd>
                      <dd
                        className={cn(
                          'text-[10px] tabular-nums',
                          favor === null && 'text-muted-foreground',
                          favor === true && 'text-success',
                          favor === false && 'text-destructive'
                        )}
                      >
                        {d == null ? '—' : fmtPontos(d)}
                      </dd>
                    </div>
                  )
                })}
              </dl>
            )}
            {it.ag && (
              <p className="text-[10px] text-muted-foreground">
                Diferença para {(porMeses ? NOME_POR_MES : NOME_DA_REFERENCIA)[referencia]}.
              </p>
            )}
          </article>
        )
      })}
    </div>
  )
}
