import { Landmark, Percent, Scale, Store } from 'lucide-react'
import { cn } from '@gia-cb/ui/cn'
import { classeDivergencia, formatBRL, formatPct } from '../helpers'
import type { LinhaConferencia } from '../types'
import { BotaoTotais } from './BotaoTotais'
import { Recolhivel } from './Recolhivel'
import { BarraIndicadores } from './BarraIndicadores'
import { CampoValor } from './CamposCelula'
import { CONFERENCIA_BREAKDOWN_IDS } from '../conferencia'
import { Aguardando } from './Aguardando'

interface Props {
  linhas: LinhaConferencia[]
  competenciaLabel: string
  podeEditar: boolean
  onEditar: (id: string, valor: number) => void
  /** Barra de totais aberta (estado da tela, igual nas abas). */
  totaisAbertos: boolean
  onTotaisAbertosChange: (abertos: boolean) => void
  /**
   * Consulta terminou. Antes disso o DRE soma só as páginas que já chegaram: os
   * valores calculados mostram "Aguardando iFood" e os cards ficam em carregamento
   * (o breakdown digitado continua editável).
   */
  completo?: boolean
}

const DESTAQUE = new Set(['subtotal', 'total_depositar', 'difference'])

/**
 * DRE do mês por categoria. É uma lista curta de 3 colunas (grupo, categoria,
 * valor), então serve do mesmo jeito no celular — no lugar do grupo em coluna, o
 * grupo vira o título de cada bloco.
 */
export function AbaConferencia({
  linhas,
  competenciaLabel,
  podeEditar,
  onEditar,
  totaisAbertos,
  onTotaisAbertosChange,
  completo = true,
}: Props) {
  const valorDe = (id: string) => linhas.find((l) => l.id === id)?.valor ?? 0
  const breakdown = CONFERENCIA_BREAKDOWN_IDS.reduce((s, id) => s + valorDe(id), 0)
  const grupos: Array<{ grupo: string; itens: LinhaConferencia[] }> = []
  for (const l of linhas) {
    const ultimo = grupos[grupos.length - 1]
    if (ultimo && ultimo.grupo === l.grupo) ultimo.itens.push(l)
    else grupos.push({ grupo: l.grupo, itens: [l] })
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
      <Recolhivel className="shrink-0" visivel={totaisAbertos}>
        <BarraIndicadores
          rotulo="Totais da Conferência"
          carregando={!completo}
          itens={[
            {
              id: 'depositar',
              rotulo: 'valor a depositar',
              dica: 'Recebido + Incentivos da loja + Taxas e comissões + Outros lançamentos',
              icone: Landmark,
              tom: 'info',
              valor: formatBRL(valorDe('valor_depositar')),
            },
            {
              id: 'breakdown',
              rotulo: 'breakdown (valor site)',
              dica: 'Soma do valor site digitado nos centros de custo',
              icone: Store,
              tom: 'neutro',
              valor: formatBRL(breakdown),
            },
            {
              id: 'diferenca',
              rotulo: 'diferença',
              dica: 'Valor a depositar − breakdown. O normal é zero',
              icone: Scale,
              tom: Math.abs(valorDe('diferenca')) < 0.005 ? 'success' : 'warning',
              valor: formatBRL(valorDe('diferenca')),
            },
            {
              id: 'comissao',
              rotulo: 'comissão iFood (média)',
              dica: 'Média do percentual cobrado na comissão do iFood (entrega própria) — o contrato é 7%',
              icone: Percent,
              tom: 'neutro',
              valor: formatPct(valorDe('check_comissao_ifood')),
            },
            {
              id: 'transacao',
              rotulo: 'taxa de transação (média)',
              dica: 'Média do percentual cobrado na taxa de transação — o contrato é 3%',
              icone: Percent,
              tom: 'neutro',
              valor: formatPct(valorDe('check_taxa_transacao')),
            },
          ]}
        />
      </Recolhivel>
      <section
        className="rounded-lg border border-border bg-surface"
        data-tour="fechamento-ifood-mensal-conferencia"
      >
        <header className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-foreground">Conferência</h2>
            <p className="text-xs text-muted-foreground">
              Soma dos lançamentos da competência {competenciaLabel || '—'} por descrição. O
              breakdown por centro de custo é digitado.
            </p>
          </div>
          <BotaoTotais abertos={totaisAbertos} onAbertosChange={onTotaisAbertosChange} />
        </header>
        {grupos.map(({ grupo, itens }, gi) => (
          <div key={`${grupo}-${gi}`} className="border-b border-border last:border-b-0">
            <p className="glass-subtle px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {grupo}
            </p>
            <ul>
              {itens.map((l) => (
                <li
                  key={l.id}
                  className={cn(
                    'flex min-h-11 items-center justify-between gap-3 px-4 py-1.5 text-sm',
                    DESTAQUE.has(l.tipo) && 'font-semibold'
                  )}
                >
                  <span className="min-w-0">
                    {l.label}
                    {l.descricao && l.descricao !== l.label && (
                      <span className="block truncate text-xs font-normal text-muted-foreground">
                        {l.descricao}
                      </span>
                    )}
                  </span>
                  {l.tipo === 'manual' ? (
                    <CampoValor
                      aria-label={l.label}
                      className="w-36"
                      value={l.valor}
                      disabled={!podeEditar}
                      onCommit={(v) => onEditar(l.id, v ?? 0)}
                    />
                  ) : !completo ? (
                    <Aguardando className="shrink-0" />
                  ) : (
                    <span
                      className={cn(
                        'shrink-0 whitespace-nowrap tabular-nums',
                        l.tipo === 'difference' && classeDivergencia(l.valor)
                      )}
                    >
                      {l.tipo === 'avg_percent' ? formatPct(l.valor) : formatBRL(l.valor)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  )
}
