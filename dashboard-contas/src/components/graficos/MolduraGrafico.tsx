import { useContext, useRef, useState, type ReactNode } from 'react'
import { Button, TelaCheia, Tooltip, toast } from '@gia-cb/ui'
import { cn } from '@gia-cb/ui/cn'
import { useCanAccess } from '@gia-cb/sdk/permissions'
import { Download, Loader2, Maximize2, Minimize2 } from 'lucide-react'
import { baixarPlanilha, graficoDoCartao } from '../../baixar-planilha'
import type { Planilha } from '../../planilha'
import { useCortado } from '../../hooks/use-cortado'
import { useTamanho } from '../../hooks/use-tamanho'
import { entrada, revelarJa } from '../../hooks/use-entrada'
import { AlturaDoCorpoDoGrafico, PeriodoDoArquivo, TelaCheiaDoGrafico } from './contexto-grafico'
import { TabelaDaPlanilha } from './TabelaDaPlanilha'

// A moldura de um gráfico: título, subtítulo, ação à direita e o corpo.
//
// Existe para que os seis gráficos do painel tenham o mesmo cabeçalho, a mesma
// altura de respiro e a mesma superfície. Sem ela, cada gráfico ganharia o seu
// espaçamento e o painel viraria uma colcha de retalhos — que é exatamente o
// que separa um painel analítico de uma pilha de gráficos.
//
// ── TELA CHEIA E PLANILHA, EM TODO CARTÃO ───────────────────────────────────
//
// Pedido do João (21/09/2026), como no Dashboard de RH: todo cartão de gráfico
// expande para a tela inteira e baixa os dados em Excel. Os dois botões moram
// AQUI, e não em cada gráfico, justamente para valerem em todos.
//
// - É a `TelaCheia` da SDK, a mesma do `DataReport`: inativa ela é
//   `display: contents` e não muda o layout; ativa, cobre o portal, e o Esc sai.
//   O estado não remonta o gráfico.
// - Em tela cheia a moldura avisa os gráficos de dentro
//   (`TelaCheiaDoGrafico`), e os de lista PARAM DE PAGINAR: a lista inteira
//   aparece e o corpo do cartão rola.
// - A planilha é montada por quem usa a moldura (`planilha`), com os mesmos
//   itens do desenho. O botão só aparece com a permissão de exportar, como o
//   Exportar das grades. EM TELA CHEIA ela também vira TABELA embaixo do
//   desenho: expandido sobra espaço, e ler os valores não deveria depender de
//   passar o ponteiro ponto a ponto (pedido do João, 21/09/2026). A tabela não
//   pede permissão — é a informação do gráfico, escrita.
// - Os botões aparecem ao passar o ponteiro no cartão, para não somar ruído a
//   sete cabeçalhos. Em tela de toque — onde não existe "passar o ponteiro" —
//   ficam sempre à vista.

interface Props {
  /**
   * Âncora do tour guiado.
   *
   * O tour precisa de um elemento com CAIXA REAL para destacar; a moldura é a
   * caixa certa, porque o destaque tem que envolver título, subtítulo e desenho
   * juntos — destacar só o SVG deixaria o balão explicando um gráfico sem o
   * leitor ver de qual se trata.
   */
  tourId?: string
  titulo: string
  /** A frase que explica a conta. O leitor não deve ter que adivinhar a régua. */
  subtitulo?: ReactNode
  acao?: ReactNode
  /** Ao lado do título — um selo ou uma dica de leitura. */
  origem?: ReactNode
  children: ReactNode
  className?: string
  /** Posição na cascata de entrada da Visão geral, em ms. Sem ele, não anima. */
  atraso?: number
  /**
   * Os dados do cartão para a planilha. Função, e não valor: o cartão redesenha
   * a cada ponteiro que passa por uma marca, e a planilha só é montada no
   * clique. Sem ela (ou com o gráfico vazio), o botão de baixar não aparece.
   */
  planilha?: () => Planilha | null
  /**
   * O título no NOME do arquivo, quando o do cartão já traz o período — o
   * período entra no nome de qualquer jeito, e sairia duas vezes.
   */
  tituloDoArquivo?: string
  /**
   * Mostrar a planilha como tabela em tela cheia. `false` no cartão que JÁ É uma
   * tabela (a composição), onde ela repetiria o conteúdo linha por linha.
   */
  tabelaEmTelaCheia?: boolean
}

export function MolduraGrafico({
  tourId,
  titulo,
  subtitulo,
  acao,
  origem,
  children,
  className,
  atraso,
  planilha,
  tituloDoArquivo,
  tabelaEmTelaCheia = true,
}: Props) {
  const [cheia, setCheia] = useState(false)
  const [baixando, setBaixando] = useState(false)
  const cartao = useRef<HTMLElement>(null)
  // O corpo é MEDIDO: é dele que o ranking tira quantas barras cabem (ver
  // `useLinhasQueCabem`). O `ref` do `useTamanho` serve aos dois usos.
  const { ref: corpo, altura: alturaDoCorpo } = useTamanho<HTMLDivElement>()
  // O título corta quando o cartão é estreito ("Rentabilidade m…"). A dica só
  // aparece quando ele está cortado de verdade — ver `useCortado`.
  const tituloRef = useRef<HTMLHeadingElement>(null)
  const tituloCortado = useCortado(tituloRef, titulo)
  const podeExportar = useCanAccess('dashboard-contas.exportar')
  const periodo = useContext(PeriodoDoArquivo)

  async function baixar() {
    const dados = planilha?.()
    if (!dados) {
      toast.info('Não há dados neste gráfico para baixar.')
      return
    }
    setBaixando(true)
    try {
      await baixarPlanilha(dados, {
        titulo,
        tituloDoArquivo,
        periodo,
        grafico: graficoDoCartao(corpo.current),
      })
    } catch {
      toast.error('Falha ao gerar a planilha. Tente novamente.')
    } finally {
      setBaixando(false)
    }
  }

  return (
    <TelaCheia ativa={cheia} onSair={() => setCheia(false)} className="p-3 md:p-6">
      <TelaCheiaDoGrafico.Provider value={cheia}>
        <section
          ref={cartao}
          data-tour={tourId}
          {...(atraso != null ? entrada(atraso) : {})}
          className={cn(
            // `min-w-0` não é detalhe: item de grid e de flex nasce com
            // `min-width: auto` e se recusa a encolher abaixo do próprio conteúdo.
            // Como o SVG lá dentro é dimensionado pela LARGURA MEDIDA do container,
            // isso vira um laço — mede largo, desenha largo, continua largo — e no
            // celular o gráfico saía 483px numa tela de 375px, cortado à direita.
            // `@container`: o que está DENTRO do cartão reage à largura DELE, e não
            // à da tela. As tabelas das Análises adicionais precisam disso — no
            // desktop o cartão é metade da tela, e uma regra por viewport as deixaria
            // no arranjo largo dentro de um cartão estreito.
            'group/cartao @container flex min-h-0 min-w-0 flex-col gap-3 rounded-lg border border-border bg-surface p-4',
            // Em tela cheia a classe de quem usa sai inteira: ela carrega altura e
            // teto pensados para a grade da página, e aqui o cartão só precisa
            // ocupar o espaço que a tela deu.
            cheia ? 'flex-1' : className
          )}
        >
          {/* O cabeçalho QUEBRA LINHA quando não há largura.
          Sem `flex-wrap`, a legenda à direita disputa espaço com o subtítulo e
          o espreme até ele quebrar uma palavra por linha — foi o que acontecia
          no celular no cartão de desvio, que é o único com legenda. O
          `min-w-[11rem]` no bloco de texto é o gatilho: abaixo disso a legenda
          desce para a linha de baixo em vez de continuar comprimindo. */}
          <header className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1.5">
            <div className="min-w-[11rem] flex-1">
              <div className="flex min-w-0 items-center gap-1.5">
                {(() => {
                  const h3 = (
                    <h3
                      ref={tituloRef}
                      className={cn(
                        'truncate text-sm font-semibold text-foreground',
                        tituloCortado && 'cursor-help'
                      )}
                    >
                      {titulo}
                    </h3>
                  )
                  return tituloCortado ? <Tooltip content={titulo}>{h3}</Tooltip> : h3
                })()}
                {origem}
                <div
                  className={cn(
                    'ml-auto flex shrink-0 items-center gap-0.5 transition-opacity duration-fast ease-default',
                    !cheia &&
                      'opacity-0 group-focus-within/cartao:opacity-100 group-hover/cartao:opacity-100 [@media(hover:none)]:opacity-100'
                  )}
                >
                  {planilha && podeExportar && (
                    <Tooltip content="Baixar os dados em Excel">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        aria-label="Baixar os dados em Excel"
                        onClick={baixar}
                        disabled={baixando}
                      >
                        {baixando ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                        ) : (
                          <Download className="h-3.5 w-3.5" aria-hidden />
                        )}
                      </Button>
                    </Tooltip>
                  )}
                  <Tooltip content={cheia ? 'Sair da tela cheia (Esc)' : 'Expandir em tela cheia'}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      aria-label={cheia ? 'Sair da tela cheia' : 'Expandir em tela cheia'}
                      aria-pressed={cheia}
                      onClick={() => {
                        // O cartão que ainda espera a rolagem nasceria invisível na
                        // tela cheia (ver `revelarJa`).
                        if (!cheia) revelarJa(cartao.current)
                        setCheia((v) => !v)
                      }}
                    >
                      {cheia ? (
                        <Minimize2 className="h-3.5 w-3.5" aria-hidden />
                      ) : (
                        <Maximize2 className="h-3.5 w-3.5" aria-hidden />
                      )}
                    </Button>
                  </Tooltip>
                </div>
              </div>
              {subtitulo && (
                <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{subtitulo}</p>
              )}
            </div>
            {/* `max-w-full`: a ação não encolhe na linha do título, mas numa linha só
            dela não pode passar da largura do cartão — senão a legenda de três
            itens (a da faixa) não quebra e vaza no celular. */}
            {acao && <div className="max-w-full shrink-0">{acao}</div>}
          </header>
          {/* COLUNA FLEX, e não um bloco: assim o gráfico lá dentro pode ser um
          filho `min-h-0 flex-1` e encolher quando o cartão bate no teto de
          altura. Com um bloco simples, `h-100%` no filho não resolve — a altura
          deste corpo vem do `flex-1` sobre um pai apenas LIMITADO por `max-h`,
          e porcentagem exige altura definida. Era por isso que o mapa de calor
          desenhava 476px dentro de 437 e vazava para fora da borda arredondada
          (medido em 16/09/2026).

          Em tela cheia o corpo ROLA: os gráficos de lista mostram tudo de uma
          vez, e a lista inteira passa da altura da tela.

          ☠️ E em tela cheia cada filho tem a ALTURA DO CONTEÚDO
          (`[&>*]:flex-none`). O gráfico que se declara `min-h-0 flex-1` — para
          caber num cartão de altura fixa — ficava só com a altura que sobrava ao
          lado da tabela, e o SVG, que tem altura própria, vazava por cima dela:
          no "Indicadores mês a mês" a tabela era desenhada sobre o eixo (visto
          em 29/09/2026). `shrink-0` não bastaria: com base 0 e `min-h-0`, o
          item nasce do tamanho da sobra, sem precisar encolher. Com a altura do
          conteúdo, o corpo passa da tela e rola, que é o que ele já faz. */}
          <div
            ref={corpo}
            className={cn('flex min-h-0 flex-1 flex-col', cheia && 'overflow-auto [&>*]:flex-none')}
          >
            <AlturaDoCorpoDoGrafico.Provider value={alturaDoCorpo}>
              {children}
            </AlturaDoCorpoDoGrafico.Provider>
            {cheia && planilha && tabelaEmTelaCheia && <TabelaDaPlanilha dados={planilha()} />}
          </div>
        </section>
      </TelaCheiaDoGrafico.Provider>
    </TelaCheia>
  )
}
