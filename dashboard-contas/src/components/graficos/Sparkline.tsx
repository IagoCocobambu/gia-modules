import { COR, caminhoDeLinha, escala } from '../../graficos'
import { useAnimarMarcas } from '../../hooks/use-entrada'
import { useTamanho } from '../../hooks/use-tamanho'

/**
 * Sparkline: a série do cartão, do tamanho dele e sem eixo.
 *
 * Ela não responde "quanto" — responde "para onde vinha". O número grande do
 * cartão já deu o "quanto", e repetir eixo e marca ali roubaria a leitura.
 * (Mesmo desenho do Dashboard de RH.)
 */
export function Sparkline({ valores }: { valores: Array<number | null> }) {
  const { ref, largura, altura } = useTamanho<HTMLDivElement>()
  const preenchidos = valores.filter((v): v is number => v != null)
  // Só na montagem: a série do cartão chega recriada a cada render do painel.
  useAnimarMarcas(ref, largura > 0 && altura > 0 && preenchidos.length > 1, null)
  const max = Math.max(...preenchidos, Number.EPSILON)
  const min = Math.min(...preenchidos, max)
  const px = escala(0, Math.max(valores.length - 1, 1), 1, Math.max(largura - 1, 2))
  const py = escala(min, max, Math.max(altura - 2, 2), 2)
  const coords = valores.map((v, i) => ({ x: px(i), y: v == null ? null : py(v) }))
  const ultimo = [...coords].reverse().find((c) => c.y !== null)

  return (
    <div ref={ref} className="h-full w-full">
      {largura > 0 && altura > 0 && preenchidos.length > 1 && (
        <svg width={largura} height={altura} aria-hidden className="block">
          <path
            data-marca="linha"
            d={caminhoDeLinha(coords)}
            fill="none"
            stroke={COR.apagada}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {ultimo && (
            <circle
              data-marca="ponto"
              cx={ultimo.x}
              cy={ultimo.y as number}
              r={2.5}
              fill={COR.serie}
            />
          )}
        </svg>
      )}
    </div>
  )
}
