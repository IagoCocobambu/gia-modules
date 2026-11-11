# Reports Maestro 0.3.1 — resumo da entrega

Módulo: **Reports Maestro** (Plataformas › Maestro) · Versão **0.3.1** · Entregue em
**09/11/2026** · Ambiente: **Homologação** · Responsável: **Iago Pereira** · Branch
`feat/reports-maestro-0.3.1` (commit `37e024c`), com pull request para
`feat/reports-maestro-0.3.0`.

Base: devolutiva da 0.3.0 (05/11/2026), que liberou a instalação e pediu uma 0.3.1
com os ajustes de 1 a 8.

## Entrega

| Item       | Valor                                                                                  |
| ---------- | -------------------------------------------------------------------------------------- |
| Versão     | 0.3.1 (`package.json`, `module.ts`, `INTEGRATION.md`, PRD 1.5)                         |
| Pacote     | `modules-reports-maestro-0.3.1.tgz` (124,6 kB)                                         |
| Validação  | `gia validate` 57/57, 0 erros, 0 avisos                                                |
| SDK        | `@gia-cb/*` 0.1.0-alpha.70 (mínima: alpha.68)                                          |
| Banco      | Sem mudança (nenhuma migration)                                                        |
| Permissões | Sem mudança (`.ler`, `.exportar`, `.ver-dados-cliente`)                                |
| Commit     | `37e024c` no branch `feat/reports-maestro-0.3.1`, PR para `feat/reports-maestro-0.3.0` |

## Ajustes da devolutiva

| #   | Ajuste pedido                                   | O que foi feito                                                                                                                                     |
| --- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `aria-label` da rosca lia código                | O leitor de tela lê os números: "3 cancelamentos: Loja 2, Cliente ou plataforma 1".                                                                 |
| 2   | Mínimo, mediana e máximo só no hover            | Em tela de toque, os três vêm escritos no cartão; com mouse, seguem na dica. Todo tooltip do módulo passa pelo `Dica` (só com mouse).               |
| 3   | Filtro de canal numa linha só para ele          | Seletor na linha das abas, à direita, só com o Operacional aberto. "N entregas medidas" no cartão Tempo na loja e "X de N pedidos" em Cancelados.   |
| 4   | Alvos de toque menores que 44 px                | Legenda dos dias, seletor de canal, tela cheia e seletores do mapa com 44 px no toque. Destaque por hover só com mouse; no toque, o toque fixa.     |
| 5   | Tabela da tela cheia mostrava médias escondidas | Coluna "Entregas medidas" e "—" nas médias abaixo do piso (5 por dia da semana, 3 por dia), como o gráfico.                                         |
| 6   | Tour não mostrava a aba Operacional             | Tour das abas (`reports-maestro:abas`, com `useTourTabSync`): 6 passos no Operacional e 4 em Pedidos, trocando de aba sozinho. Ver abaixo.          |
| 7   | FAQ comparava com o relatório antigo            | 11 trechos reescritos dizendo o que a tela faz; a pergunta "o dashboard demora mais" virou "a pesquisa demora em períodos longos".                  |
| 8   | PRD e `gia.config.ts` desatualizados            | SDK mínima alpha.68; histórico v1.4 corrigido; referências a documentos fora do pacote retiradas (PRD e 7 arquivos); Escritório como `propriedade`. |

### Tour (item 6)

O tour da tela (`tour.ts`) é montado pelo portal, que não avisa o módulo quando o passo
muda — por isso um passo dele não troca a aba, e o `useTourTabSync` não funciona ali. A
saída foi dividir em dois:

- **Tour da tela** (3 passos): loja e período, Pesquisar e as abas — o que aparece nas
  duas abas.
- **Tour das abas** (10 passos), montado pelo módulo: dashboard, canal, cartões, tempo por
  etapa, quem cancelou e dia × hora; depois filtros, totais, barra da tabela e lista.

Sem dados, o tour para depois do tour da tela e **continua sozinho** quando a pesquisa
trouxer pedidos, do passo em que parou. Com os dados na tela, segue direto do começo ao
fim. **Pular** em qualquer um encerra tudo. A tela abre **sempre no Operacional**.

## Além da devolutiva

| Área    | Entrega                       | Resumo                                                                                                            |
| ------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Celular | Filtros recolhem ao pesquisar | Padrão 1 do workspace: a barra recolhe quando a pesquisa começa; recusada, fica aberta; a seta reabre.            |
| Celular | Seletor de canal em 375 px    | Cabe na mesma linha das abas ("Todos" no estreito); em 320 px desce para baixo das abas, sem rolagem horizontal.  |
| Toque   | Rótulos da barra da tabela    | Filtros e Totais mostram o nome escrito em tela de toque.                                                         |
| PRD     | Critérios de aceite           | Novos: recolhimento no celular, tela de toque e propriedade fora do seletor; corrigido o de "empresa sem número". |

## Sugestões da devolutiva (não bloqueantes) — não aplicadas

Ficaram para uma próxima versão, como a devolutiva permitiu:

- aviso quando a resposta chega sem o resumo operacional;
- linha interrompida na hora sem medida, no gráfico de linhas;
- código sem uso (`PaginacaoGrafico`, `paginar.ts` e outros) e comentários herdados;
- contraste da paleta (amarelo; terça e quinta para quem não distingue vermelho e verde);
- mediana interpolada com quantidade par;
- legenda "Menos de N entregas medidas" na métrica Pedidos;
- loja com pedido depois da meia-noite no mapa.

## Testes no dev-shell

Dados reais: loja 01.CB GOIANIA em 08/11/2026, 140 pedidos.

| Bateria                      | Resultado | Destaques                                                                                       |
| ---------------------------- | --------- | ----------------------------------------------------------------------------------------------- |
| Computador 1400 px (mouse)   | 19/19     | Dica com mínimo/mediana/máximo; canal muda cartões (3 de 140 → 0 de 74, iFood); tabela com "—". |
| Celular 375 e 320 px (toque) | 31/31     | Valores escritos no cartão; nenhum tooltip ao tocar; todos os alvos com 44 px; sem rolagem.     |
| Tour                         | 11/11     | Continua ao chegar os dados; 13 passos seguidos com dados; pular encerra tudo.                  |
| Recolhimento dos filtros     | ok        | Recolhe ao pesquisar, fica aberto se recusada, a seta reabre; no computador sempre visível.     |
| Lojas                        | ok        | 96 lojas; Escritório (`propriedade`) fora do seletor.                                           |

Console sem erros em todos os fluxos.

## Permissões

Sem mudança desde a 0.3.0.

| Chave                               | O que libera                                                       | Sugerido para                                              |
| ----------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------- |
| `reports-maestro.ler`               | Consultar os pedidos (dados do cliente mascarados) e o Operacional | Diretores, Gerentes, Suporte, Auditoria, Administração/GIA |
| `reports-maestro.exportar`          | Baixar em Excel os pedidos filtrados                               | Diretores, Gerentes, Auditoria, Administração/GIA          |
| `reports-maestro.ver-dados-cliente` | Ver CPF, e-mail, telefone e endereço completos                     | Diretores, Suporte, Auditoria, Administração/GIA           |

## Pendências (confirmar na instalação)

- O tour das abas grava o progresso com `module_id = 'reports-maestro:abas'`. Se o portal
  só aceitar id de módulo registrado, esse tour reaparece a cada visita.
- No dev-shell, o tour da tela volta depois de recarregar a página: o `useTourProgress`
  do SDK só busca o progresso depois de carregar o usuário, e o tour começa antes.
  Verificar se acontece no portal; se acontecer, a correção é no SDK.
- A 0.3.0 ainda não está na `main`: o PR da 0.3.1 foi aberto contra
  `feat/reports-maestro-0.3.0`.
