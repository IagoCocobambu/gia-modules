import { Tooltip } from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'
import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react'
import { fmtBRL, fmtCompacto, fmtPct, fmtValor, fmtVariacao } from '../../formato'
import { planilhaDeComposicao } from '../../planilha'
import type { LinhaDaComposicao } from '../../visao'
import { MolduraGrafico } from '../graficos/MolduraGrafico'

// A composição do faturamento (por área) ou das despesas (pelos indicadores
// gerenciais): o valor, a participação no total e a variação contra o período
// anterior, em ordem do maior para o menor.
//
// ── UMA TABELA, NÃO UM GRÁFICO DE PIZZA ─────────────────────────────────────
//
// São 8 a 9 partes que precisam ser LIDAS (quanto, e quanto mudou). A barra de
// participação dá a proporção de relance, e o número ao lado dá a leitura exata.
//
// ── A GRADE ENCOLHE PELO CARTÃO, NÃO PELA TELA ──────────────────────────────
//
// Colunas fixas somando mais que o cartão fazem as células se sobreporem em vez
// de truncar (o defeito das tabelas das Análises do RH no celular, 16/09/2026).
// Aqui o nome é a coluna elástica (`minmax(0,1fr)`), e abaixo de `@md` de CARTÃO
// a barra sai e o valor ABREVIA ("104,5 mi"): por extenso, com centavos, ele
// tomava o cartão de 327 px e o nome virava "Rest…" (18/09/2026).

function Valor({ v }: { v: number }) {
  return (
    <>
      <span className="@md:hidden">{fmtCompacto(v)}</span>
      <span className="hidden @md:inline">{fmtValor(v)}</span>
    </>
  )
}

interface Props {
  tourId: string
  titulo: string
  subtitulo: string
  linhas: LinhaDaComposicao[]
  total: number
  variacaoTotal: number | null
  /** Para que lado a variação é boa — receita subir é bom, despesa subir não. */
  melhorQuando: 'maior' | 'menor'
  rotuloVariacao: string
  atraso?: number
}

function Variacao({ v, melhorQuando }: { v: number | null; melhorQuando: 'maior' | 'menor' }) {
  if (v == null) return <span className="text-muted-foreground">—</span>
  const subiu = v > 0.0005
  const desceu = v < -0.0005
  const bom = subiu ? melhorQuando === 'maior' : desceu ? melhorQuando === 'menor' : null
  const Icone = subiu ? ArrowUpRight : desceu ? ArrowDownRight : ArrowRight
  // ── ACIMA DE 999%, O TETO ────────────────────────────────────────────────
  // Conta que sai de quase zero varia "+222.319,9%" (as despesas corporativas
  // de ago/26), e o número não cabia na coluna: encostava na borda do cartão
  // (29/09/2026). Alargar a coluna só por ele desalinharia a linha — cada linha
  // é uma grade própria. Nessa faixa o número exato não se lê de qualquer jeito:
  // a célula diz "> +999%" e a dica dá o valor.
  const extremo = Math.abs(v) >= 10
  const conteudo = (
    <span
      className={cn(
        'inline-flex items-center justify-end gap-0.5 whitespace-nowrap font-medium tabular-nums',
        bom === null && 'text-muted-foreground',
        bom === true && 'text-success',
        bom === false && 'text-destructive',
        extremo && 'cursor-help'
      )}
    >
      <Icone className="h-3.5 w-3.5 shrink-0" aria-hidden />
      {extremo ? (v > 0 ? '> +999%' : '< −999%') : fmtVariacao(v)}
    </span>
  )
  return extremo ? (
    <Tooltip content={`Variação de ${fmtVariacao(v)}`}>{conteudo}</Tooltip>
  ) : (
    conteudo
  )
}

export function TabelaDeComposicao({
  tourId,
  titulo,
  subtitulo,
  linhas,
  total,
  variacaoTotal,
  melhorQuando,
  rotuloVariacao,
  atraso,
}: Props) {
  const maior = Math.max(...linhas.map((l) => l.participacao ?? 0), Number.EPSILON)
  // (#) · conta · valor · (barra) · % · variação — a posição e a barra só no
  // cartão largo: no estreito, os 28 px do "#" são o que faz "Estacionamento"
  // caber sem partir no meio da palavra.
  //
  // No cartão MUITO largo (a tela cheia, ou o cartão de meia tela num monitor
  // grande) a barra divide a sobra com o nome. Com 4rem fixos, a tela cheia
  // abria um vão de 900 px entre o nome e o valor, e a barra continuava um
  // risquinho do tamanho do da página (29/09/2026).
  const colunas =
    'grid grid-cols-[minmax(0,1fr)_auto_3.5rem_4.25rem] items-center gap-x-2 @md:grid-cols-[1.5rem_minmax(0,1fr)_auto_4rem_3.75rem_4.5rem] @4xl:grid-cols-[1.5rem_minmax(0,1fr)_auto_minmax(4rem,1fr)_3.75rem_4.5rem] @4xl:gap-x-4'

  return (
    <MolduraGrafico
      tourId={tourId}
      titulo={titulo}
      subtitulo={subtitulo}
      atraso={atraso}
      // O corpo deste cartão já é a tabela: em tela cheia ela cresce, e repetir
      // os mesmos números embaixo seria a mesma lista duas vezes.
      tabelaEmTelaCheia={false}
      planilha={() =>
        planilhaDeComposicao(linhas, {
          rotuloItem: 'Conta',
          rotuloVariacao,
          notas: [
            `Total: ${fmtBRL(total)}${
              variacaoTotal == null
                ? ''
                : ` · variação ${rotuloVariacao}: ${fmtVariacao(variacaoTotal)}`
            }.`,
            'A variação compara só as lojas com plano nos dois períodos.',
          ],
        })
      }
    >
      <div className="flex flex-col text-xs" role="table" aria-label={titulo}>
        <div
          role="row"
          className={cn(
            colunas,
            'border-b border-border pb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground'
          )}
        >
          <span role="columnheader" className="hidden @md:block">
            #
          </span>
          <span role="columnheader">Conta</span>
          <span role="columnheader" className="text-right">
            Valor (R$)
          </span>
          <span role="columnheader" className="hidden @md:block">
            <span className="sr-only">Participação</span>
          </span>
          <span role="columnheader" className="text-right">
            Part.
          </span>
          <Tooltip content={`Variação do valor ${rotuloVariacao}, nas mesmas lojas.`}>
            <span role="columnheader" className="cursor-help text-right">
              Var.
            </span>
          </Tooltip>
        </div>
        {linhas.map((l, i) => (
          <div
            key={l.indice}
            role="row"
            className={cn(colunas, 'border-b border-border/60 py-2 last:border-b-0')}
          >
            <span role="cell" className="hidden tabular-nums text-muted-foreground @md:block">
              {i + 1}º
            </span>
            {/* No cartão estreito o nome QUEBRA em vez de cortar: no celular não há
                ponteiro para uma dica, e "Outras re…" não diz qual conta é. */}
            <span
              role="cell"
              className="min-w-0 break-words font-medium leading-snug text-foreground @md:truncate"
            >
              {l.nome}
            </span>
            <span role="cell" className="text-right tabular-nums text-foreground">
              <Valor v={l.valor} />
            </span>
            <span
              role="cell"
              className="hidden h-1.5 overflow-hidden rounded-full bg-muted @md:block"
            >
              <span
                className="block h-full rounded-full bg-primary"
                style={{ width: `${Math.max(((l.participacao ?? 0) / maior) * 100, 0)}%` }}
              />
            </span>
            <span role="cell" className="text-right tabular-nums text-muted-foreground">
              {fmtPct(l.participacao)}
            </span>
            <span role="cell" className="text-right">
              <Variacao v={l.variacao} melhorQuando={melhorQuando} />
            </span>
          </div>
        ))}
        <div
          role="row"
          className={cn(colunas, 'border-t border-border pt-2 font-semibold text-foreground')}
        >
          <span role="cell" className="hidden @md:block" />
          <span role="cell">Total</span>
          <span role="cell" className="text-right tabular-nums">
            <Valor v={total} />
          </span>
          <span role="cell" className="hidden @md:block" />
          <span role="cell" className="text-right tabular-nums">
            {fmtPct(Math.abs(total) < 1e-9 ? null : 1)}
          </span>
          <span role="cell" className="text-right">
            <Variacao v={variacaoTotal} melhorQuando={melhorQuando} />
          </span>
        </div>
      </div>
    </MolduraGrafico>
  )
}
