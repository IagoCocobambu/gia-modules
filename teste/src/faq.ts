import type { ModuleFaq } from '@gia-cb/sdk/modules'

export const faq: ModuleFaq = {
  summary:
    '**Teste** mantém uma lista de itens **por loja** com sincronização sob demanda. Selecione a loja no seletor, veja os itens na tabela, sincronize quando precisar atualizar (botão **Sincronizar**), consulte o histórico de execuções e exporte os dados em CSV. As permissões são separadas: leitura (`teste.ler`), sincronização (`teste.sincronizar`) e exportação (`teste.exportar`).',
  sections: [
    {
      id: 'primeiros-passos',
      title: 'Primeiros passos',
      content: `
## Selecionando uma loja

Os dados de Teste vivem **por loja** — você precisa escolher uma antes
de ver itens. Abra o seletor no canto superior direito, busque pelo nome
(case-insensitive, match parcial) e clique. A tabela carrega os itens
daquela loja imediatamente.

## Quando sincronizar

A sincronização traz os dados **da fonte externa** (Simphony, ERP, etc) pro
banco do portal. Clique em **Sincronizar** se você suspeita que tem
divergência ou precisa refletir uma mudança recente. O botão fica
animado durante a execução e mostra um toast no fim.

## Exportando

**Exportar** gera um CSV com os itens da loja atualmente selecionada.
O arquivo respeita a filtragem da grid — se você está com algum filtro
aplicado, só as linhas visíveis entram.
      `,
    },
    {
      id: 'permissoes',
      title: 'Permissões e acessos',
      content: `
Quem pode fazer o quê:

- \`teste.ler\` — vê a lista, troca de loja, exporta
- \`teste.sincronizar\` — botão **Sincronizar** aparece
- \`teste.exportar\` — botão **Exportar** aparece

Sem **.ler** o módulo não aparece na sidebar. Os botões somem
dinamicamente se você remover a permissão correspondente (testável no
painel do dev-shell, lado direito).
      `,
    },
    {
      id: 'sincronizacao',
      title: 'Como funciona a sincronização',
      content: `
A sincronização **NÃO** é em tempo real. Quando você clica em
**Sincronizar**, o portal dispara um job que pode levar de segundos a
minutos dependendo do volume de itens da loja.

Durante a execução:
- O botão fica desabilitado e mostra "Sincronizando…" com ícone girando
- A subtitle do header muda pra "Sincronizando…"
- Outros usuários da mesma loja **NÃO** veem essa execução em tempo
  real — só quando recarregam (limitação atual, vai melhorar com
  realtime)

Após a sincronização:
- Toast verde no canto superior direito
- Subtitle volta pra "Última sincronização <data>"
- A tabela recarrega automaticamente

No template, a sincronização é **simulada** (1.8s de delay, sem chamar
nada real). Implementar a versão real fica no caller — chamar o BFF
ou Edge Function que dispara o job.
      `,
    },
    {
      id: 'historico',
      title: 'Histórico de execuções',
      content: `
O botão de **histórico** (ícone de relógio entre Sincronizar e Exportar)
abre um modal listando todas as execuções de sincronização anteriores:
quando rodou, quanto tempo, qual loja, status, contadores de
inseridos/atualizados/deletados.

No template, este histórico é vazio (mensagem informativa). Implementar
contra a tabela de jobs do seu domínio fica como exercício — o portal
real usa o componente \`SyncHistoryButton\` do \`@gia-cb/ui\` que cobre o
padrão de polling no \`sync_runs\`.
      `,
    },
    {
      id: 'erros-comuns',
      title: 'Erros comuns',
      content: `
**"Selecione uma loja"** ao tentar exportar — o exportar precisa de
loja selecionada (o CSV é da loja, não global). Selecione no seletor
do topo.

**Tabela vazia mesmo após sincronizar** — pode ser que a sincronização
não trouxe nenhuma linha. Confira no histórico se a execução completou
com contadores zerados.

**Sincronização não dispara** — geralmente é a permissão
\`teste.sincronizar\` faltando. Confirme no painel do dev-shell que
o botão "Sincronizar" está visível.

**Botões somem após mudar persona no painel** — comportamento correto:
os botões respondem ao permission gate. Volte pra **Admin** ou liga a
permissão correspondente.
      `,
    },
  ],

  // Q&A — OBRIGATÓRIO. É a 3ª parte da FAQ do portal: um acordeão no final,
  // agrupado por categoria, para as perguntas rápidas que o manual (sections)
  // não responde. Mínimo de 3 perguntas; o `gia validate` reprova sem isto.
  // Escreva perguntas REAIS que o usuário faria — não invente enchimento.
  qa: [
    {
      category: 'Permissões',
      items: [
        {
          q: 'Por que o botão "Sincronizar" não aparece pra mim?',
          a: 'Ele exige a permissão `teste.sincronizar`. Quem tem apenas `teste.ler` vê a listagem, mas não dispara sincronização. Peça a permissão ao administrador do portal.',
        },
        {
          q: 'Quem consegue abrir esta tela?',
          a: 'Qualquer usuário com `teste.ler`. Essa permissão vem de um **Grupo** ou **Papel** atribuído ao usuário.',
        },
      ],
    },
    {
      category: 'Operações',
      items: [
        {
          q: 'A sincronização rodou mas não trouxe nenhuma linha. É erro?',
          a: 'Não necessariamente. Confira o **histórico de sincronização**: se a execução terminou com contadores zerados, a origem não tinha registros novos no período. Um erro real aparece com status de falha e mensagem.',
        },
        {
          q: 'Com que frequência os dados são atualizados?',
          a: 'A tela mostra o resultado da **última sincronização**. Use o botão **Sincronizar** para forçar uma atualização e acompanhe o progresso pelo próprio botão.',
        },
      ],
    },
  ],
}
