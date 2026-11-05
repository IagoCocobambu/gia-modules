import { cn } from '@gia-cb/ui/cn'
import type { TabelaDeDados } from './contexto-grafico'

// Os números de um cartão, escritos: aparece embaixo do desenho em tela cheia.
//
// É a versão acessível do gráfico — todo valor que o desenho mostra por posição,
// comprimento ou cor está aqui em texto, alcançável por teclado e leitor de tela.

export function TabelaDoGrafico({ dados }: { dados: TabelaDeDados | null }) {
  if (!dados || dados.linhas.length === 0) return null
  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full text-xs">
        <thead className="bg-muted/50 text-muted-foreground">
          <tr>
            {dados.colunas.map((c) => (
              <th
                key={c.titulo}
                scope="col"
                className={cn(
                  'whitespace-nowrap px-3 py-2 font-medium',
                  c.numerica ? 'text-right' : 'text-left'
                )}
              >
                {c.titulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dados.linhas.map((linha, i) => (
            <tr key={i} className="border-t border-border">
              {linha.map((celula, j) => (
                <td
                  key={j}
                  className={cn(
                    'whitespace-nowrap px-3 py-1.5 text-foreground',
                    dados.colunas[j]?.numerica && 'text-right tabular-nums'
                  )}
                >
                  {celula}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
