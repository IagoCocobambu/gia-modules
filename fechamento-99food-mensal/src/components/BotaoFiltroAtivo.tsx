import { X } from 'lucide-react'
import { Button } from '@gia-cb/ui'
import { Dica } from './Dica'

interface Props {
  /** Nome do indicador que está filtrando a tabela. */
  nome: string
  onLimpar: () => void
}

/** Na barra da tabela: qual card está filtrando, e o X para tirar o filtro. */
export function BotaoFiltroAtivo({ nome, onLimpar }: Props) {
  return (
    <Dica content="Tirar o filtro e voltar a ver todas as linhas">
      <Button
        variant="default"
        className="max-w-full"
        aria-label={`Filtro: ${nome}. Tirar o filtro`}
        onClick={onLimpar}
      >
        <span className="truncate">{nome}</span>
        <X className="h-4 w-4 shrink-0" />
      </Button>
    </Dica>
  )
}
