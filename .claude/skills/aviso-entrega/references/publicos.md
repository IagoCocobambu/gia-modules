# Públicos do Portal GIA — registro

Os grupos que já apareceram na coluna **Sugerido para** dos avisos, com a cor de
cada um. Use estes nomes, escritos assim, como opções ao perguntar a quem pediu o aviso quem
recebe cada chave — e a mesma classe de cor em todo aviso, para o gestor
reconhecer o público de relance.

| Público | Classe | Quem é | Avisos em que apareceu |
|---|---|---|---|
| Diretores | `p-diretores` | Diretoria das lojas: conduz, valida, acompanha a loja | Dashboards (Contas, RH), GED |
| Auditoria | `p-auditoria` | Auditoria interna: confere e audita, lê a rede | Dashboards (Contas, RH), GED |
| Assistentes | `p-assistentes` | Quem monta e envia o trabalho do dia a dia na loja | GED (Trâmites) |
| Padrinhos | `p-padrinhos` | Validam os dossiês em que foram escolhidos | GED (Dossiês) |
| Fundadores | `p-fundadores` | Aprovação final dos dossiês | GED (Dossiês) |
| Administração/GIA | `p-admin` | Quem administra o portal: parâmetros, exclusão, cadastro; na Gestão de Apoio, acesso total | GED, Gestão de Apoio |
| Gerentes | `p-gerentes` | Gerente da loja: lança o dia a dia (contratos, cadastros, quadro) e não aprova — o "gestor" do sistema antigo | Gestão de Apoio |
| Auxiliar RH | `p-auxiliarrh` | RH da rede: cadastros, cargos, uniformes, modelos e metas (o que o "suporte" do sistema antigo fazia, sem o acesso total) | Gestão de Apoio |
| Suporte | `p-suporte` | Atendimento ao cliente do aplicativo: acha o pedido ou a compra, confere e acerta | App CB (Pedidos, Vouchers, Definições) |
| Financeiro | `p-financeiro` | Analistas do financeiro: fecham o mês (conciliação do iFood com o caixa) e gravam o fechamento | Fechamento iFood Mensal |

Cores livres para público novo: nenhuma (a `p-cor10` virou `p-financeiro` em 12/11/2026).
Para um público novo, crie a classe `p-<publico>` no `assets/modelo.html`, com uma cor que
ainda não esteja em uso, e acrescente a linha aqui.

## Como sugerir, antes de perguntar

Quem entrega decide; a sugestão só poupa clique. Na ordem:

1. **A mesma chave num aviso anterior** — repita o público de lá.
2. **A mesma família** — um painel novo segue os Dashboards; um módulo de
   documento segue o GED.
3. **O verbo da chave**:
   - `.ler`, `.ler-rede`, `.exportar` → quem consulta (Diretores, Auditoria);
   - `.enviar`, `.criar`, `.cadastrar` → quem monta (Assistentes, Diretores);
   - `.editar`, `.validar`, `.aprovar` → quem decide (Diretores, ou o papel que
     aprova naquele fluxo);
   - `.auditar` → Auditoria;
   - `.excluir`, `.parametrizar`, configurações → Administração/GIA.

Público citado na conversa que não estiver aqui entra no registro na mesma sessão,
com uma cor livre.
