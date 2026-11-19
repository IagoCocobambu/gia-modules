import type { ModuleFaq } from '@gia-cb/sdk/modules'

export const faq: ModuleFaq = {
  summary:
    '**Dashboard Simphony** é um exemplo de **consumo de API externa**: lista países vindos da API pública **Banco Mundial** numa tabela com busca e exportação. Não há cadastro nem banco no portal — o dado vem de fora, através de um **handler server-side** (`src/server/paises.ts`) que roda no Node em dev e vira Edge Function no deploy. As permissões são separadas: leitura (`dashboard-simphony.ler`) e exportação (`dashboard-simphony.exportar`).',
  sections: [
    {
      id: 'o-que-e',
      title: 'O que este módulo demonstra',
      content: `
## Consumir dado externo do jeito certo

Este módulo existe pra mostrar o padrão de **dados externos** do SDK: em vez de
um \`fetch\` direto no browser (que vaza segredo e esbarra em CORS), o módulo tem
um **handler** em \`src/server/paises.ts\` que roda no servidor. A tela chama esse
handler com \`createServerClient(...).call('paises')\`.

Em **dev** (\`gia dev\`) o handler roda na sua máquina e bate na API real — você vê
os países de verdade na hora, sem Supabase nem Docker. No **deploy**, o \`gia pack\`
transforma o handler numa Edge Function automaticamente.
      `,
    },
    {
      id: 'usando',
      title: 'Navegando pela lista',
      content: `
## Busca

Use a busca no topo da tabela pra filtrar por **país, região ou capital** — o
filtro é em tempo real e case-insensitive. Os filtros por coluna (ícone de funil)
aceitam operadores (igual, contém, vazio, etc).

## Ordenação e largura

Clique no cabeçalho de uma coluna pra ordenar. Em telas largas, os botões
\`<\` \`>\` nas laterais **expandem** a largura da tabela.
      `,
    },
    {
      id: 'exportar',
      title: 'Exportando em CSV',
      content: `
## Exportar

O botão de **exportar** (barra de ferramentas) baixa um CSV com a lista atual —
respeitando a **busca/filtro** aplicado (só as linhas visíveis entram). O botão
só aparece se você tem a permissão \`dashboard-simphony.exportar\`.
      `,
    },
    {
      id: 'permissoes',
      title: 'Permissões',
      content: `
## Leitura e exportação

- \`dashboard-simphony.ler\` — ver a lista de países.
- \`dashboard-simphony.exportar\` — baixar o CSV.

Sem \`dashboard-simphony.ler\` a tela mostra um aviso de acesso negado. Sem \`dashboard-simphony.exportar\`
o botão de export não aparece. Troque de persona no painel do dev-shell pra testar.
      `,
    },
    {
      id: 'erros',
      title: 'E se a API estiver fora?',
      content: `
## Estado de erro

A API do Banco Mundial é pública e muito estável — mas qualquer fonte externa
pode, eventualmente, ficar indisponível (rede, manutenção). Quando isso acontece,
a tela mostra um **estado de erro** com um botão
**Tentar de novo** (que refaz a chamada). É o comportamento esperado de qualquer
módulo que depende de uma fonte externa: falhar de forma clara, não em silêncio.
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
          q: 'Por que não vejo o botão de exportar?',
          a: 'O botão de **Exportar CSV** exige a permissão `dashboard-simphony.exportar`. Quem tem só `dashboard-simphony.ler` enxerga a lista, mas não exporta. No dev-shell, troque a persona no painel para testar cada recorte.',
        },
        {
          q: 'Quem consegue abrir esta tela?',
          a: 'Qualquer usuário com `dashboard-simphony.ler`. Essa permissão vem de um **Grupo** ou **Papel** atribuído ao usuário — peça ao administrador do portal se você não a tem.',
        },
      ],
    },
    {
      category: 'Dados e erros',
      items: [
        {
          q: 'De onde vêm os dados desta tela?',
          a: 'De uma **API externa** (Banco Mundial), consultada por um handler server-side do módulo. Os dados não ficam no banco do portal — cada abertura da tela busca a informação atualizada na fonte.',
        },
        {
          q: 'A lista apareceu vazia ou com erro. O que faço?',
          a: 'Use o botão **Tentar de novo** no estado de erro. Se persistir, a fonte externa provavelmente está indisponível no momento — não é preciso abrir chamado antes de tentar novamente em alguns minutos.',
        },
      ],
    },
  ],
}
