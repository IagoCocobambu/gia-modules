import { useRef, useState, type ReactNode } from 'react'
import { Button, TelaCheia } from '@gia-cb/ui'
import { Dica } from '../Dica'
import { cn } from '@gia-cb/ui/cn'
import { Maximize2, Minimize2 } from 'lucide-react'
import { useCortado } from '../../hooks/use-cortado'
import { useTamanho } from '../../hooks/use-tamanho'
import { entrada, revelarJa } from '../../hooks/use-entrada'
import { AlturaDoCorpoDoGrafico, TelaCheiaDoGrafico, type TabelaDeDados } from './contexto-grafico'
import { TabelaDoGrafico } from './TabelaDoGrafico'

// A moldura de um gráfico: título, subtítulo, ação à direita e o corpo.
//
// Adaptada do Dashboard do Plano de Contas (`dashboard-contas`), para os cartões
// do Operacional terem o mesmo cabeçalho, o mesmo respiro e a mesma superfície
// que os painéis do portal.
//
// - TELA CHEIA em todo cartão: é a `TelaCheia` da SDK, a mesma do `DataReport`
//   (inativa é `display: contents` e não muda o layout; ativa, cobre o portal, e
//   o Esc sai). Em tela cheia os gráficos de lista param de paginar.
// - TABELA em tela cheia: os mesmos números do desenho, escritos — ler os
//   valores não depende de passar o ponteiro marca a marca, nem de distinguir
//   cor (é a versão acessível de cada gráfico).
// - Os botões aparecem ao passar o ponteiro no cartão; em tela de toque, onde
//   não existe "passar o ponteiro", ficam sempre à vista.

interface Props {
  /** Âncora do tour: destaca título, subtítulo e desenho juntos. */
  tourId?: string
  titulo: string
  /** A frase que explica a conta. O leitor não deve ter que adivinhar a régua. */
  subtitulo?: ReactNode
  acao?: ReactNode
  children: ReactNode
  className?: string
  /** Posição na cascata de entrada, em ms. Sem ele, não anima. */
  atraso?: number
  /**
   * Os números do cartão, para a tabela da tela cheia. Função, e não valor: o
   * cartão redesenha a cada ponteiro que passa por uma marca, e a tabela só é
   * montada em tela cheia.
   */
  tabela?: () => TabelaDeDados | null
}

export function MolduraGrafico({
  tourId,
  titulo,
  subtitulo,
  acao,
  children,
  className,
  atraso,
  tabela,
}: Props) {
  const [cheia, setCheia] = useState(false)
  const cartao = useRef<HTMLElement>(null)
  const { ref: corpo, altura: alturaDoCorpo } = useTamanho<HTMLDivElement>()
  const tituloRef = useRef<HTMLHeadingElement>(null)
  const tituloCortado = useCortado(tituloRef, titulo)

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

  return (
    <TelaCheia ativa={cheia} onSair={() => setCheia(false)} className="p-3 md:p-6">
      <TelaCheiaDoGrafico.Provider value={cheia}>
        <section
          ref={cartao}
          data-tour={tourId}
          {...(atraso != null ? entrada(atraso) : {})}
          className={cn(
            // `min-w-0`: item de grid nasce com `min-width: auto` e não encolhe
            // abaixo do próprio conteúdo — o SVG, medido pela largura, entraria
            // num laço e vazaria no celular. `@container`: o de dentro reage à
            // largura do CARTÃO, não à da tela.
            'group/cartao @container flex min-h-0 min-w-0 flex-col gap-3 rounded-lg border border-border bg-surface p-4',
            cheia ? 'flex-1' : className
          )}
        >
          <header className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1.5">
            <div className="min-w-[11rem] flex-1">
              <div className="flex min-w-0 items-center gap-1.5">
                {tituloCortado ? <Dica content={titulo}>{h3}</Dica> : h3}
                <div
                  className={cn(
                    'ml-auto flex shrink-0 items-center gap-0.5 transition-opacity duration-fast ease-default',
                    !cheia &&
                      'opacity-0 group-focus-within/cartao:opacity-100 group-hover/cartao:opacity-100 [@media(hover:none)]:opacity-100'
                  )}
                >
                  <Dica content={cheia ? 'Sair da tela cheia (Esc)' : 'Expandir em tela cheia'}>
                    <Button
                      variant="ghost"
                      size="icon"
                      // 44 px no toque: alvo mínimo para o dedo.
                      className="h-7 w-7 [@media(hover:none)]:h-11 [@media(hover:none)]:w-11"
                      aria-label={cheia ? 'Sair da tela cheia' : 'Expandir em tela cheia'}
                      aria-pressed={cheia}
                      onClick={() => {
                        // O cartão que ainda espera a rolagem nasceria invisível
                        // na tela cheia (ver `revelarJa`).
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
                  </Dica>
                </div>
              </div>
              {subtitulo && (
                <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{subtitulo}</p>
              )}
            </div>
            {acao && <div className="max-w-full shrink-0">{acao}</div>}
          </header>
          {/* Coluna flex: o gráfico de dentro pode ser `min-h-0 flex-1`. Em tela
              cheia o corpo rola e cada filho tem a altura do próprio conteúdo
              (`[&>*]:flex-none`) — senão o SVG vazaria por cima da tabela. */}
          <div
            ref={corpo}
            className={cn(
              'flex min-h-0 flex-1 flex-col',
              cheia && 'gap-4 overflow-auto [&>*]:flex-none'
            )}
          >
            <AlturaDoCorpoDoGrafico.Provider value={alturaDoCorpo}>
              {children}
            </AlturaDoCorpoDoGrafico.Provider>
            {cheia && tabela && <TabelaDoGrafico dados={tabela()} />}
          </div>
        </section>
      </TelaCheiaDoGrafico.Provider>
    </TelaCheia>
  )
}
