import { useContext, useState } from 'react'
import { Button, Tooltip, toast } from '@gia-cb/ui'
import { useCanAccess } from '@gia-cb/sdk/permissions'
import { Download, Loader2 } from 'lucide-react'
import { baixarPlanilha } from '../baixar-planilha'
import { PeriodoDoArquivo } from './graficos/contexto-grafico'
import type { Planilha } from '../planilha'

// O Exportar das GRADES — em Excel, como o dos cartões de gráfico.
//
// ── POR QUE NÃO O EXPORTAR DO `DataReport` ──────────────────────────────────
//
// O da SDK baixa CSV, e CSV chega ao Excel sem formato: percentual vira texto,
// real vira número solto, e quem recebe refaz a formatação à mão. Todo Exportar
// deste painel entrega **.xlsx** (decisão do João, 22/09/2026) — o mesmo arquivo
// que os cartões de gráfico já baixavam, com a coluna no formato da conta, o
// cabeçalho congelado e o recorte escrito em cima.
//
// A planilha é montada NO CLIQUE: `exceljs` só é carregado aqui dentro, e a
// grade não paga nada por existir com o botão.

interface Props {
  /** Monta a planilha no clique. `null` = não há o que baixar. */
  planilha: () => Planilha | null
  /** O título dentro do arquivo e no nome dele. */
  titulo: string
  /** O nome no arquivo, quando o título já traz o período. */
  tituloDoArquivo?: string
}

export function BotaoExportar({ planilha, titulo, tituloDoArquivo }: Props) {
  const [baixando, setBaixando] = useState(false)
  const podeExportar = useCanAccess('dashboard-contas.exportar')
  const periodo = useContext(PeriodoDoArquivo)

  if (!podeExportar) return null

  async function baixar() {
    const dados = planilha()
    if (!dados || dados.linhas.length === 0) {
      toast.info('Não há linhas para baixar.')
      return
    }
    setBaixando(true)
    try {
      await baixarPlanilha(dados, { titulo, tituloDoArquivo, periodo, grafico: null })
    } catch {
      toast.error('Falha ao gerar a planilha. Tente novamente.')
    } finally {
      setBaixando(false)
    }
  }

  return (
    <Tooltip content="Baixar a tabela em Excel">
      <Button variant="ghost" size="sm" onClick={baixar} disabled={baixando} className="gap-1.5">
        {baixando ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Download className="h-4 w-4" aria-hidden />
        )}
        Exportar
      </Button>
    </Tooltip>
  )
}
