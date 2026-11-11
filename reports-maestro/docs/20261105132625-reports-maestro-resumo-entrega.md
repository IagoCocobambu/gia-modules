# Reports Maestro 0.3.0 — resumo da entrega

Módulo: **Reports Maestro** (Plataformas › Maestro) · Versão **0.3.0** · Entregue em
**05/11/2026** · Ambiente: **Homologação** · Responsável: **Iago Pereira** · Branch
`feat/reports-maestro-0.3.0`.

Base: [changelog de 04/11](20261104170308-reports-maestro-changelog.md) e
[changelog de 05/11](20261105113442-reports-maestro-changelog.md).

| #   | Data  | Área         | Entrega                                    | Resumo                                                                                               |
| --- | ----- | ------------ | ------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| 1   | 04/11 | Pesquisa     | Seletor de lojas                           | Lista todas as lojas com CNPJ do acesso da pessoa; loja sem número no cadastro avisa ao pesquisar.   |
| 2   | 04/11 | Análise      | Gargalos operacionais do delivery          | Estudo com o histórico de status dos pedidos: preparo é o maior gargalo; base do dashboard.          |
| 3   | 04/11 | Processo     | Regra de documentos                        | Documentos em `docs/` com data e hora no nome, sem sobrescrever versões.                             |
| 4   | 04/11 | Operacional  | Nova aba Operacional                       | Dashboard da loja e período: tempo na loja, preparo, cancelados, tempo por etapa e dia × hora.       |
| 5   | 04/11 | Operacional  | Só o que toda loja tem                     | Dados de entrega só aparecem quando existem (sem cartão vazio); retiradas fora dos tempos.           |
| 6   | 05/11 | Operacional  | Tempo por etapa em cartões                 | Um cartão por etapa, média em destaque, barra em pedaços (mín., mediana, média, máx.) que se enche.  |
| 7   | 05/11 | Operacional  | Quem cancelou em rosca                     | Total no centro, fatia por grupo, valor dos pedidos cancelados e média até cancelar.                 |
| 8   | 05/11 | Operacional  | Dia × hora                                 | Por dia da semana: linhas coloridas com destaque. Por dia: mapa de calor com números e pior horário. |
| 9   | 05/11 | Operacional  | Média como número principal                | Cartões, mapa, linhas e quem cancelou passam a destacar a média; dica com mínimo, mediana e máximo.  |
| 10  | 05/11 | Operacional  | Aba padrão                                 | A tela abre no Operacional (na primeira visita, em Pedidos, para o tour).                            |
| 11  | 05/11 | Desempenho   | Uma consulta para as duas abas             | Uma chamada à API serve a Pedidos e Operacional; trocar de aba não pesquisa de novo.                 |
| 12  | 05/11 | Pedidos      | Barra de totais                            | Os 4 totais em R$ numa barra compacta, no desenho do Fechamento Diário Maestro.                      |
| 13  | 05/11 | Visual       | Formato dos tempos                         | `0m 00s`, com a hora só quando há (`1h 54m 42s`), alinhados em coluna.                               |
| 14  | 05/11 | Visual       | Paleta de cores                            | Primárias, depois secundárias, depois terciárias em todos os gráficos.                               |
| 15  | 05/11 | Visual       | Efeitos de entrada                         | Números contam do zero e gráficos crescem ao aparecer (não no hover).                                |
| 16  | 05/11 | Mobile       | Toque longo no mapa de calor               | No celular, tocar e segurar a célula abre a dica com os números.                                     |
| 17  | 05/11 | Documentação | FAQ, tour, PRD e INTEGRATION               | Atualizados a cada mudança.                                                                          |
| 18  | 05/11 | Entrega      | Changelog, apresentação e aviso de entrega | Changelog da sessão, apresentação em PowerPoint e aviso de entrega (PDF) com as permissões.          |
| 19  | 05/11 | Entrega      | Pacote e versionamento                     | `gia validate` 57/57, pacote 0.3.0 gerado, commit e push no branch.                                  |

## Permissões (do aviso de entrega)

| Chave                               | O que libera                                                       | Sugerido para                                              |
| ----------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------- |
| `reports-maestro.ler`               | Consultar os pedidos (dados do cliente mascarados) e o Operacional | Diretores, Gerentes, Suporte, Auditoria, Administração/GIA |
| `reports-maestro.exportar`          | Baixar em Excel os pedidos filtrados                               | Diretores, Gerentes, Auditoria, Administração/GIA          |
| `reports-maestro.ver-dados-cliente` | Ver CPF, e-mail, telefone e endereço completos                     | Diretores, Suporte, Auditoria, Administração/GIA           |

## Pendências

- Conferir as telas no dev-shell em celular, tablet e desktop.
- Pesquisar 31 dias para confirmar o tempo da consulta única (até ~45 s esperado).
- Abrir o pull request para o `main`.
