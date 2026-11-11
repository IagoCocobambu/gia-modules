import { useLayoutEffect, useRef, useState } from 'react'
import { fmtBRL, fmtInteiro, fmtPct, fmtPontos, fmtValor, TRACO } from '../../formato'
import { useTamanho } from '../../hooks/use-tamanho'
import type { Celula, Formato, Planilha } from '../../planilha'

// A tabela que acompanha o gráfico EM TELA CHEIA: os mesmos números do desenho,
// escritos.
//
// ── POR QUE SÓ EM TELA CHEIA ────────────────────────────────────────────────
//
// Pedido do João (21/09/2026): expandido, o cartão sobra espaço e o leitor
// continua tendo que passar o ponteiro ponto a ponto para saber os valores. Na
// página, a tabela empurraria os outros blocos para baixo sem necessidade — ali
// a dica dá conta, e quem quer a tabela inteira tem as abas Plano de contas e
// Comparativos.
//
// ── A FONTE É A MESMA DO ARQUIVO ────────────────────────────────────────────
//
// Vem da `Planilha` que o cartão já monta para o botão de baixar. Uma fonte, três
// saídas: o desenho, a tabela e o `.xlsx` — sem chance de um dizer um número e o
// outro dizer outro.
//
// ── A TABELA LARGA ROLA SOZINHA ─────────────────────────────────────────────
//
// No celular, a série mensal (oito colunas) pede ~660 px num cartão de 317. Sem
// contenção, quem rolava de lado era o corpo inteiro do cartão, e o gráfico
// deslizava junto com a tabela (29/09/2026). Agora a rolagem lateral fica na
// tabela — mas SÓ quando ela não cabe: um contêiner que rola vira a referência
// do `sticky`, e o cabeçalho das listas longas deixaria de ficar no topo. No
// desktop elas cabem, e o cabeçalho continua preso.

const FORMATAR: Record<Formato, (v: number) => string> = {
  texto: (v) => String(v),
  inteiro: fmtInteiro,
  decimal: fmtValor,
  pct: fmtPct,
  pp: fmtPontos,
  brl: fmtBRL,
}

function texto(valor: Celula, formato: Formato): string {
  if (valor == null) return TRACO
  if (typeof valor === 'number') return FORMATAR[formato](valor)
  return valor
}

export function TabelaDaPlanilha({ dados }: { dados: Planilha | null }) {
  const { ref: caixa, largura } = useTamanho<HTMLDivElement>()
  const tabela = useRef<HTMLTableElement>(null)
  const [transborda, setTransborda] = useState(false)
  // Medido depois do desenho: a largura que a tabela PEDE só existe com ela na
  // tela. Mede de novo quando a caixa muda de largura ou chegam outros dados.
  useLayoutEffect(() => {
    const t = tabela.current
    if (t && largura > 0) setTransborda(t.scrollWidth > largura + 1)
  }, [largura, dados])

  if (!dados || dados.linhas.length === 0) return null
  return (
    <div className="mt-4 flex flex-col gap-2">
      <div ref={caixa} className={transborda ? 'overflow-x-auto' : undefined}>
        <table ref={tabela} className="w-full text-xs">
          <thead>
            <tr>
              {dados.colunas.map((c) => (
                <th
                  key={c.titulo}
                  scope="col"
                  // `sticky`: em tela cheia o corpo do cartão rola, e o cabeçalho
                  // de uma tabela de 86 lojas some antes da metade da lista.
                  //
                  // O título QUEBRA LINHA quando falta largura: os da série mensal
                  // são longos — "FATURAMENTO · VS. MÊS ANTERIOR (LOJAS DE CADA
                  // MÊS)" —, e presos numa linha só eles empurravam a tabela para
                  // fora do cartão a 1440 px, com a última coluna cortada
                  // (29/09/2026). `align-bottom` alinha os de uma linha com os de
                  // duas pela base, junto dos números.
                  className={`sticky top-0 z-10 border-b border-border bg-surface px-2 py-1.5 align-bottom text-[10px] font-semibold uppercase leading-snug tracking-wide text-muted-foreground ${
                    c.formato === 'texto' ? 'text-left' : 'text-right'
                  }`}
                >
                  {c.titulo}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dados.linhas.map((linha, i) => (
              <tr key={i} className="border-b border-border/50 last:border-b-0">
                {linha.map((valor, j) => {
                  const formato = dados.colunas[j]?.formato ?? 'texto'
                  return (
                    <td
                      key={j}
                      className={`px-2 py-1 ${
                        formato === 'texto'
                          ? 'text-foreground'
                          : 'whitespace-nowrap text-right tabular-nums text-foreground'
                      }`}
                    >
                      {texto(valor, formato)}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(dados.notas ?? []).length > 0 && (
        <div className="flex flex-col gap-0.5">
          {dados.notas!.map((nota) => (
            <p key={nota} className="text-[11px] leading-snug text-muted-foreground">
              {nota}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
