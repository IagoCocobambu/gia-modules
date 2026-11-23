# Couvert

Módulo do portal GIA (SDK `@gia-cb` `0.1.0-alpha.72`): as mesas abertas de um salão e
o couvert artístico (e o buffet, na loja que tem) lançado em cada uma, contra o número
de pessoas. Menu **Simphony › Couvert**. Só leitura.

- Conceito, regras e decisões: [`docs/conceito.md`](docs/conceito.md)
- Produto: [`PRD.md`](PRD.md) · Instalação: [`INTEGRATION.md`](INTEGRATION.md) ·
  Versões: [`CHANGELOG.md`](CHANGELOG.md)
- Questionamentos ao time do SDK: [`docs/questionamentos-sdk/`](docs/questionamentos-sdk/)

## Desenvolver

```bash
npm install
cp .env.example .env   # e coloque o token da BI (peça ao time do Portal GIA)
npm run dev            # gia dev — http://localhost:6010
npm run validate       # gia validate — tem de ficar sem erros
```

- **Não existe BI de homologação**: no `gia dev` as mesas são as reais. O token do
  `.env` dá leitura de vendas da rede inteira — nunca faça commit do `.env`.
- O token vale até 14 dias; quando vencer, a tela mostra a recusa da BI (424). Troque
  no `.env` e reinicie o `gia dev`.
- As lojas de teste (com `locRefs.BIAPI` e `couvert`) ficam no `gia.config.ts`.

## Arquivos

| Arquivo                            | O quê                                                           |
| ---------------------------------- | --------------------------------------------------------------- |
| `src/server/lojas.ts`              | lojas do escopo com a BI, RVCs e se têm buffet                  |
| `src/server/mesas.ts`              | `getLatestBusDt` + `getGuestChecks` de uma loja e RVC → mesas   |
| `src/regras.ts`                    | situação de cada mesa, selo, contagem dos chips, filtro e ordem |
| `src/views/CouvertView.tsx`        | a tela                                                          |
| `src/components/CartaoMesa.tsx`    | o card da mesa                                                  |
| `src/exportar.ts`                  | planilha Excel das mesas da tela                                |
| `src/hooks/use-ultima-pesquisa.ts` | última loja e RVC do usuário, sem a 01 no escopo (Q-02)         |
