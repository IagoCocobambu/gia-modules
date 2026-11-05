import { useContagem, type Formatar } from '../../hooks/use-contagem'

// Número que CONTA do zero até o valor quando aparece na tela (pedido do usuário
// em 05/11/2026) — a mesma ideia das barras que crescem: o número chega junto
// com o dado. Vale para todo número de destaque dos dashboards e dos totais.
//
// ── COMO, SEM RENDER A CADA QUADRO ──────────────────────────────────────────
//
// O React renderiza o texto FINAL (é o que leitor de tela, cópia e impressão
// veem). Antes da pintura, o efeito troca o conteúdo do MESMO nó de texto pelo
// zero e, quadro a quadro, pelo valor intermediário, já formatado — sem
// `setState`, então a tela não re-renderiza 60 vezes por segundo. Mexer no
// `nodeValue` (e não no `textContent`) mantém o nó que o React conhece.
//
// - Começa quando o número entra na área visível (o que está abaixo da dobra
//   conta quando a rolagem chega nele) e conta de novo quando o valor muda
//   (outro canal, outra pesquisa).
// - Valor inteiro conta de inteiro em inteiro (`1, 2, 3…`, nunca `1,37`).
// - Duração: duas vezes o token `--duration-slow`, com saída suave.
// - Movimento reduzido: o número aparece pronto, sem contar.

interface Props {
  valor: number | null | undefined
  formatar: Formatar
  className?: string
}

/** O número animado num `<span>` — para HTML. No SVG, use `useContagem` num `<text>`. */
export function NumeroAnimado({ valor, formatar, className }: Props) {
  const { ref, texto } = useContagem<HTMLSpanElement>(valor, formatar)
  return (
    <span ref={ref} className={className}>
      {texto}
    </span>
  )
}
