import type { SegmentedControlOption } from '@gia-cb/ui'
import type { Catalogo } from '../catalogo'
import { abertasAteNivel, type Nivel } from '../grade'
import { Escolha } from './Escolha'

// "Abrir até 1 | 2 | 3" — abre a árvore inteira até o nível, nas duas grades.
//
// O nível ATIVO é o que reproduz EXATAMENTE as contas abertas; aberta uma conta
// a conta, nenhum fica marcado (o mesmo comportamento do HTML de especificação).
//
// A pílula mostra só o número: o nome do controle já está à esquerda, e repetir
// "Nível" três vezes custava ~90 px de cabeçalho. O que cada nível contém está
// na dica de cada pílula — a pergunta chegou do João em 21/09/2026, e a resposta
// que era só do FAQ agora fica onde o controle está.

const NIVEIS: SegmentedControlOption<Nivel | 0>[] = [
  {
    value: 1,
    label: '1',
    tooltip:
      'Nível 1 — as 7 contas raiz: faturamento, matéria-prima, impostos, custos operacionais, investimentos e os dois lucros',
  },
  {
    value: 2,
    label: '2',
    tooltip:
      'Nível 2 — as 37 contas de um ponto, que dividem cada raiz por assunto (1.1 restaurante, 4.1 folha…)',
  },
  {
    value: 3,
    label: '3',
    tooltip:
      'Nível 3 — as 94 contas de dois pontos, o detalhe de cada assunto (1.1.1 comidas, 4.10.1 motoboys…)',
  },
]

interface Props {
  cat: Catalogo
  abertas: ReadonlySet<string>
  onAbertasChange: (abertas: ReadonlySet<string>) => void
}

export function AbrirAte({ cat, abertas, onAbertasChange }: Props) {
  const nivelAtual = ([1, 2, 3] as const).find((n) => {
    const alvo = abertasAteNivel(cat, n)
    return alvo.size === abertas.size && [...alvo].every((c) => abertas.has(c))
  })

  return (
    <Escolha<Nivel | 0>
      value={nivelAtual ?? 0}
      onChange={(n) => {
        if (n) onAbertasChange(abertasAteNivel(cat, n))
      }}
      ariaLabel="Abrir a árvore até o nível"
      rotulo="Abrir até"
      rotuloVisivel
      options={NIVEIS}
    />
  )
}
