# Modelo do resumo da entrega (.txt)

Arquivo: `<modulo>/docs/<AAAAMMDDhhmmss>-<id>-resumo-entrega.txt`.
Exemplos reais: `fechamento-ifood-diario/docs/20261112101604-...` e
`fechamento-maestro/docs/20261112113420-...` — leia o último do módulo antes de
escrever.

Regras:

- Texto puro. Títulos de seção numa linha sozinha, sem marcador; itens com `- `;
  passos ou mudanças numeradas `1.`, `2.`; subitens com 3 espaços + `- `.
- Português, frases curtas, nome que o usuário vê na tela (da FAQ).
- Datas `dd/mm/aaaa`; números no formato brasileiro (`110,6 kB`).
- **Nada de git.** Nada de "eu"; use o impessoal.
- Pode citar o sistema antigo (é documento de quem desenvolve e instala), mas sem
  necessidade.
- Seção sem conteúdo não entra (ex.: sem pendência com outros times, tire a seção).

```
<Nome do módulo> <versão> - revisão SDK <e o tema principal, se houver> - <dd/mm/aaaa>

Entrega
- Módulo: <id> ("<rótulo>")
- Versão: <anterior> → <nova>
- Pacote: modules-<id>-<versão>.tgz (<tamanho> kB, <n> arquivos, sem .env nem segredos)
- Menu: <caminho no menu>
- Permissões: <chaves> (<sem chave nova | chave nova: ...>)
- Validação SDK: gia validate <passou>/<total>, <e> erros, <a> avisos (ESLint do host e tsc sem erros)
- SDK: @gia-cb <versão> (<a mesma dos outros módulos | diferente: ...>)
- Tipo: <só leitura | grava em ...>

Incongruências encontradas e corrigidas
1. <o que estava fora do SDK/padrão> → <o que foi feito>. <Por quê, em uma frase>. Fonte: <doc do SDK e seção, ou AGENTS.md e padrão>.
2. ...

Conferido e já de acordo
- <regras da lista conferidas sem nada a corrigir, numa linha cada, com a fonte>
- Fontes lidas: docs do @gia-cb <versão> (<quais>), AGENTS.md da raiz e do módulo.

Não corrigido (decisão ou fora do escopo)
- <incongruência> - <motivo: decisão registrada, depende do time GIA, pedido para ficar para depois>.

Testes
- gia validate: ...
- gia dev: <o que foi testado, em qual viewport e loja>.
- Falta conferir: <o que não deu para testar no navegador>.

Arquivos alterados
- <caminhos relativos ao módulo, agrupados quando fizer sentido>

Pendências com outros times
- Time GIA: ...
- Time do SDK: ...
- Enviar modules-<id>-<versão>.tgz ao time do Portal GIA pelo canal combinado.
```
