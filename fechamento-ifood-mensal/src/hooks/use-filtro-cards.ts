import { useEffect, useState } from 'react'

/**
 * Card da barra de totais que está filtrando a tabela (`null` = sem filtro).
 * Consulta nova (outra loja/mês — `contexto` muda) tira o filtro. Enquanto a
 * consulta não termina (`ativo` = false) não há filtro: os cards ainda não têm o
 * número do mês inteiro (padrão 9 do AGENTS.md do workspace).
 */
export function useFiltroCards(contexto: string, ativo = true) {
  const [filtro, setFiltro] = useState<string | null>(null)
  const [contextoDoFiltro, setContextoDoFiltro] = useState(contexto)
  if (contexto !== contextoDoFiltro) {
    setContextoDoFiltro(contexto)
    setFiltro(null)
  }
  return [ativo ? filtro : null, setFiltro] as const
}

/**
 * Avisa a tela quantas linhas a tabela mostra com o filtro de card ligado (`null` =
 * sem filtro), para o Total da barra de abas acompanhar o filtro.
 */
export function useInformarVisiveis(
  visiveis: number | null,
  onVisiveisChange?: (visiveis: number | null) => void
) {
  useEffect(() => {
    onVisiveisChange?.(visiveis)
  }, [visiveis, onVisiveisChange])
}

/** Diferença que conta como "tem diferença" (meio centavo para cima). */
export const temDiferenca = (v: number) => Math.abs(v) >= 0.005
