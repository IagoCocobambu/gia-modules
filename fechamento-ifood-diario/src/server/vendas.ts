import { defineHandler, envOptional, HttpError } from '@gia-cb/sdk/server'

// UMA página (20 vendas, fixo) das vendas do dia de UM restaurante da loja na API
// financeira do iFood (`financial/v3.0/merchants/{id}/sales`) — a `BuscarVendasIfood`
// do legado, quebrada em páginas para a tela buscar várias ao mesmo tempo (até 4, como
// o Fechamento iFood Mensal) e mostrar o progresso. Cada venda volta só com os campos
// que o cruzamento usa (a `MergeIfoodData` do legado), já extraídos.
//
// A loja (Empresa) tem um restaurante no iFood por operação (Coco Bambu, Express,
// Pizzaria, Dani, Vasto…), na tabela abaixo; a tela pede as páginas de cada um. O
// restaurante chega no body, mas só vale se for da loja — o servidor confere na tabela.
// Falha do iFood não derruba o fechamento (como no legado): o que é definitivo
// (credencial, 401/403) volta como `aviso`; o que é passageiro (5xx, demora) volta como
// erro, e a tela tenta de novo.
//
// REGRA: handler auto-contido — só importa de @gia-cb/sdk/server.

interface Body {
  empresaId: number
  data: string
  /** UUID do restaurante no iFood — um dos da loja (conferido aqui). */
  merchant: string
  pagina: number
}

/**
 * Uma página leva 0,4–4 s; acima de 20 s é conexão travada (visto em dev: ETIMEDOUT ao
 * conectar no iFood, ~47 s até desistir). Melhor desistir cedo: a tela tenta de novo.
 */
const TIMEOUT_IFOOD_MS = 20_000
/** Proteção contra laço: um dia de uma loja nunca chega perto disto. */
const MAX_PAGINAS_IFOOD = 200
const DATA_RE = /^\d{4}-\d{2}-\d{2}$/

/** Hoje em São Paulo, `AAAA-MM-DD`. */
function hojeSp(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

function validarData(data: unknown): string {
  if (typeof data !== 'string' || !DATA_RE.test(data)) {
    throw new HttpError(422, 'Informe a data no formato AAAA-MM-DD.')
  }
  // Date.parse aceita "2026-02-30" (vira 02/03); a volta para texto tem que bater.
  const t = Date.parse(`${data}T00:00:00Z`)
  if (Number.isNaN(t) || new Date(t).toISOString().slice(0, 10) !== data) {
    throw new HttpError(422, 'Data inválida.')
  }
  if (data > hojeSp()) throw new HttpError(422, 'A data não pode ser futura.')
  return data
}

/**
 * Número da loja com 2 dígitos — o `loc_ref` do DW e a chave de `RESTAURANTES_IFOOD`.
 * Sai primeiro do nome da Empresa ("01.CB GOIANIA" → "01"; todas as lojas do cadastro
 * têm o número no nome) e, na falta, do vínculo com a BI do Simphony (`locRefs.BIAPI`
 * começa pelo número: "01 CB Go", "17. CB R"). O nome vem antes porque o BIAPI pode
 * divergir: na 999.CB TECH HOMOLOG ele é "995 CB L".
 */
function numeroDaLoja(e: { nome: string; locRefs: Record<string, string> }): string | null {
  const m = /^\s*(\d{1,4})\s*\./.exec(e.nome) ?? /^\s*(\d{1,4})/.exec(e.locRefs?.BIAPI ?? '')
  return m ? String(Number(m[1])).padStart(2, '0') : null
}

/**
 * Restaurantes do iFood de cada loja, por número de loja: um par `[operação, merchant]`
 * para cada integração IFOOD ativa das operações da Empresa (cb, cbx, pzcb, dani, vst,
 * adgcb…). A consulta junta todos: a loja vê o dia de todas as operações.
 *
 * Fonte: planilha "GIA - Empresas - Cadastro - 2026-11-09" (aba Integrações das
 * operações, tipo IFOOD), entregue pelo time em 11/11/2026. PROVISÓRIO até o SDK expor
 * `locRefs` em `GiaOperacao` — hoje o vínculo iFood só chega por Empresa
 * (`locRefs.IFOOD`, um por Empresa), que fica de reserva para loja fora da tabela.
 * Removido da planilha: o 2º vínculo de `43 cbx` (`ca22641e-…-2dc803a3bd3`, UUID com
 * um caractere a menos — o outro vínculo da mesma operação é o certo).
 *
 * A MESMA tabela está em `lojas.ts` e `vendas.ts` (handler auto-contido): mude as duas.
 */
const RESTAURANTES_IFOOD: Record<string, [operacao: string, merchant: string][]> = agruparPorLoja(`
10 cb 522324f5-3265-46b9-b1ec-615a624ae961
10 cbx 33f8f2a0-0623-49f2-b07e-ae43ce051f7a
10 dani d12c24af-fa36-471b-9098-ddcca05f7881
10 pzcb f0de8a20-b1f5-44f5-a0d1-1beaef6bd63f
11 burger 4ec6d143-5dca-488c-a38b-907ba2e38249
11 cb 4096a52f-abcc-40e7-b012-1f4daed847f3
11 cb 4453af4d-dd58-4991-8845-f90e0e299479
11 cbx 45380039-67df-4d00-a9ce-cb75fddd2481
11 dani 4299af92-8ff7-4c98-9398-5c470621ca05
11 pzcb a4307595-8c9f-48fa-8837-78ba09cde4c4
12 cb 1fe11723-7d1e-4637-976d-5369c5a03521
12 danicc 055e05e1-fb85-42b6-92ac-056eeda092a4
13 cb 45db57a0-5231-414f-97bd-223fd6382fc3
13 cbx 2543d7d2-acf8-4ae6-95fe-94bb52769cd9
14 cb 0d290869-87e6-456c-a409-e69c295202bf
15 adgcb 3502f72d-47c5-42a2-bf50-2c6ed8058f79
15 cb 33f533c7-1f14-42c1-8f07-25411a654d12
15 cbx 388b421f-dabb-46ad-841d-ab96339ce401
15 dani 526ef21d-0626-4fb7-a510-f47339bad80d
16 adgcb 0a7b3bbe-92da-465c-ae68-493d4d42412f
16 cb e3526d9b-c0fa-4b8e-a336-287bcb2fc612
16 pzcb bf924a87-bb76-4641-81d7-160bd3145694
17 adgcb 01e8d0c0-677f-49b8-9976-3d23315471e7
17 burger acec867f-8fb6-49b1-a648-f709be981adf
17 cb 14baa9b6-5c6c-429b-8a5e-cc4092c098c6
17 cbx ceed5df7-a242-4f55-b893-9212a65716eb
17 cftcb 6802ef48-dec5-426e-81d6-a6f654100f0a
17 dani 0c781bcf-a53b-4d05-8881-f74476abae96
17 pzx 196290ea-537b-4caf-938d-c2f57e68011d
17 vst aa5dcb37-dfaf-4442-b5dc-ef69637f73ad
17 vstss e717a3d0-6e30-46f1-a259-9fcc13db206f
18 cbx 396b505c-7956-4e65-a4b0-0bdfbf2ae67d
18 vst 0fdc42e7-e686-416a-9578-c85b7bbd4897
18 vst 5b7b3163-c04e-4e6a-9f04-5051a2c6f2a4
19 adgcb a5fa98db-dc8b-4136-8308-f9b80ede9578
19 cb 11ac6a47-0bcb-4aa2-8e0f-2181bb73f643
19 cbx 1d806aef-a8fc-4d9e-ab34-ed4e23ee35e8
20 adgcb 907cf660-d2df-4ac0-9a5c-401be9e4b97a
20 cb 94aaf166-84cc-4ebf-a35d-d223be34d01f
20 cbx d057e161-82de-448e-b551-42061cc88e92
20 dani ebd7ad07-c0ed-41a0-ab4d-6bbd381bad27
20 plus 85c56f2a-6058-48a5-98f2-a7b691c2794b
21 cb 049a748b-2e0f-40e2-8d14-423dc9464a2b
21 dani 512f39d9-2799-4a6c-a7db-b6ce617b3566
21 pzcb b4769bba-8a7e-4240-871a-f48ba8a3d9e0
22 cb 6961d89e-633c-4ae3-b397-febc391491dc
22 cbx 613901e5-822d-43bf-866c-5fdfbaff80e8
22 dani cc4d6843-d80a-4e55-8291-729501e82292
22 pzcb cc598aed-8457-4a03-a939-d2045c1c770e
23 adgcb 5df0bd67-7f9c-4956-99e5-f99637ebd0fa
23 cb 28c8b15d-d9b0-4042-9a25-de58c152b00a
23 pzcb 7b53f647-c75b-4fcd-8ecf-1a4da4a1514e
24 adgcb 89b80dad-be81-4313-b908-203cbdb09902
24 cb d9f40432-96bc-4350-a173-dbc5a10f6438
24 cbx 351ad797-b8ee-49a4-bc4e-1d7c4bcf7c1a
24 dani 4218b715-1a2e-4c33-a7ca-0266baab37fb
25 adgcb d8b4e2bb-3a4e-4528-8b5d-2cdd2f0a1c42
25 cb ce4d2434-2289-411a-a10d-ff4ca3a04daa
25 cbx e0a60c4a-bbc5-4cf2-899c-e783800219a2
25 pzcb ce7eb22b-3787-4f8a-b8f5-b82d7e0aa56e
25 vst 591659a8-f40b-4b65-bca7-0999638782ee
25 vstss 8e8c6920-c399-4c01-ac49-ef642464b581
26 adgcb 2c064f45-d86e-4415-a60c-614b76541f37
26 burger 7a3c8fac-0d68-4744-b7c2-00217d01bcaf
26 cb 800df102-e34d-48a2-8882-06fc5de807fc
26 cbx 876e54b2-5081-4721-b245-a0f06ebde900
27 adgcb f90f8adc-b3e5-48da-a622-db12a82649ec
27 cb eb467fdf-2e48-443a-a74d-3daed256cc96
27 cbx 8441dae3-c720-4787-9ea9-877b83b7eb86
27 dani b20f6f41-71d0-4555-a859-e34b6d6a9d9d
28 adgcb 01249bac-dbca-414c-937a-f3d4998f0e2d
28 burger c104c127-0b10-4b5e-8383-ba6c20fe5fb9
28 cb 638adfdb-fc41-4f64-9b81-6f8ccbe53702
28 cbx 4fdec965-2c9a-45ce-91fb-434f7d1cb58a
28 dani 33441be2-7ec1-4568-8b4a-fb208103e9c3
28 pzcb 6da14b86-4864-497a-a0a0-5d8ae7469c13
29 adgcb 03a00581-273d-4e25-8794-945ff1d7fefd
29 cb d1bfcf40-77dd-47f0-9545-9c637cda711a
29 dani 92c52f36-d382-4e1b-b17d-2e0193fb3b36
31 adgcb ee787f89-2d66-4040-a965-6def3b2c1345
31 cb 45158825-29f7-47f9-acbf-6b7ccd87cb9c
31 cbx fc59eaa0-2299-4708-87df-249ec6f8b6bd
31 dani e82dc65f-1482-424b-b62e-6520e2345fc0
32 adgcb 962f1fd4-1ef3-4e6c-9495-ed2d270138f5
32 cb 5fb97d98-aeca-4366-9395-8e7b9f264cda
33 conc 09b98558-965e-459c-b5c0-ad2ad3fb9ea2
34 adgcb 57cedbe4-595d-4291-85df-13c65924c182
34 cb 6b6d1eec-8ce9-497e-bcc7-7de47785215a
34 cb a271d1f0-15cc-4bcb-ac9b-af28c35864a7
34 cbx f2616d18-10e1-4587-9c13-2c649547ddfd
34 dani 08e580d7-aa8a-4a05-b5be-ac5ec375fef4
35 adgcb 9bc443dc-66c5-4b05-b96a-2b5708309ecd
35 burger efbc2719-6c3e-429d-94ae-c6aeea5f2a41
35 cb 9e669251-5eb4-4d35-9584-f2637138eb62
35 cbx 29c9e9f0-bf91-46d8-999f-dda1428edbfb
35 dani 69abf81c-ee7e-48f9-89c4-e20c33cc57b6
36 conc a6e1c79f-d289-4783-92b1-73b4ea6e9110
37 cb e44daa76-9e8e-48b0-94ad-4ae3ffe84301
37 cb e7a26830-a452-4056-80cb-ad39ffcb4a90
38 cbx 42dab45c-0e7f-47c6-8575-b5bb05667457
38 conc 1bb61fc7-5e9b-42a6-8eb5-3f4f7aa47989
39 cb f269c678-d72c-439a-b724-ae3abca56f47
39 cbx 7c3053a8-216e-4aa4-b207-ff55a8e3395f
40 cb c6b22931-202a-422f-a577-0ff82bca9a9a
40 cbx 8c709fd7-ba05-4bb0-a1eb-352138e49adc
40 dani 37d2f132-7722-4e80-9451-9bd9bb918cc9
41 cb e64f537f-a89b-4637-b001-6225714e7c46
41 cbx f63e38c6-f525-494c-9b81-a02c35d5bd71
41 dani 157a7fa2-b560-4f0a-82fe-3a5add56f5ef
42 conc e8fc3553-f373-4bec-b181-4fa2ffa5275f
43 cbx ca22641e-8cfb-43a4-ba8f-2dc803a3bd3d
43 conc feca97d0-7745-4229-b431-de4032d94156
44 adgcb e5c59e60-dd44-460b-a954-f784e024c53a
44 burger eea4d0c6-e7c7-446a-b52d-0a58bc04b99e
44 cb 35d8679b-47d7-407c-8df8-a0c8f615ac10
44 pzcb 89e02151-feda-496d-a076-c5fcef802a04
46 cb 9c21131e-b5a7-4477-ba42-452510eedfbf
47 cb 1389d438-1ea1-433c-b362-8d1a341ec7a0
47 cbx a0664e0c-40f8-43e8-8855-09bf93c04b5e
47 dani 33c108d2-f918-4c7f-8d7b-7b5867110715
48 adgcb d9ebc797-4430-41df-a1a6-25b6174fdaff
48 dani 1661ad7a-9d1c-4360-bcf4-818dd7ddc964
48 vst 54d72d12-1c15-4aa0-983e-e73d5d1b8c1f
48 vstss 356cec4b-532a-4d2b-810a-fb80e115a8d0
49 conc 7a988ce4-8dbc-4f2a-a8f3-268bea69b499
50 cbx 7d7b9997-883f-4b90-ae9b-5c190217ea18
50 conc c43a5fbf-07dd-4561-8f0e-822e052427c6
50 dani 8e7d9761-1a20-4d43-b785-4eb8ac69d58c
51 cb 25677a36-35e2-4e24-b25b-57ab21e74a27
51 cb 7ed4e4b5-dbdf-4ee1-934d-5e24a8d8a880
51 cbx 8232b439-6fd3-4a0e-a28e-345f5352b224
51 dani 08185bbe-8dd2-471b-b6a0-aa58fa3edf73
51 pzcb b481abf7-865f-4644-a079-56c0095ee891
54 cb 26d87001-a3d0-42f6-94e8-f5a1f90b1de0
54 pzcb a3b813c1-47b6-41dd-891f-94d8121fd7a2
55 cbx a4fecec8-88b7-4797-b17f-a0bcdb2dfa36
55 conc 97e52009-25cd-4bb9-a219-4e9bf5026c07
55 dani b7926e99-101e-4d05-b3e2-ae0ebff491c6
56 conc 9612fa2c-2165-459f-bfb6-b21546bbbd83
58 cbx 3f68efe2-b096-4ecc-b46a-b54d3fba8bff
58 conc 8b90a206-499f-4379-af72-7bad9cef7aa2
59 cb a90e304f-3c7d-4400-9233-b11a258869b0
59 pzcb de956786-bbdf-40ba-9426-27521fac1368
60 vst c8a0ee8d-b4cd-4772-9ca2-b40885a2b1ba
60 vstss 00fcf802-f1f2-4d27-81c6-5bd898e4c765
61 cbx 3e29960a-f8af-43c9-b8e5-2a88ea667f50
61 conc 2cf3705d-e46d-437b-9391-2bb571ef5251
62 conc 35ee53d4-be93-428f-a925-250831ee566c
63 cb 30519297-2816-435a-b6ca-927af5d6c479
63 dani 67074270-d447-4349-baec-e0b1d824970a
64 conc 14383a07-7f71-4472-b57f-71bdf5138340
65 cb 0d53e34e-c41b-49bb-81d7-069ab6e34bfe
65 cbx c42b83cc-6fea-4951-a686-56a62e8b3742
66 conc 1ac51bb7-562b-4366-94ea-25b2249e68c8
67 cb bd1ef470-6299-463f-9c8e-91ffa900b43f
67 cbx f60c70cb-7daa-41fb-ac78-8eb459814c64
67 dani 66417875-70ab-4e7d-a2d1-aa850af8008d
69 cb c5ee54d8-6e4f-4e6e-bccc-58d3a4125f43
69 cbx eacb4c4e-0d15-4e90-9bae-b946ba5785d7
69 dani de654b6d-c2d3-4b32-a98a-001f536d9771
69 vst 6293b97f-48d6-4325-8d47-d43e970760b0
71 cb 24fb11f7-9946-478d-9624-7d73add5dedc
71 cb d2ddf885-4070-48bc-b084-3aab543f89a4
71 cbx 9f0d7cb3-3b7b-4b78-bea4-4ce85bb766df
71 dani e8f0e232-fe22-4c21-826d-a292a8d5707c
71 pzcb 768bf98f-0303-4952-b74c-048b90271904
72 conc 8c6d7108-975d-4d1b-820e-004075cddf2a
73 plus 5002b7a5-56ea-4184-80ac-8fc8005817a8
73 plus cbc2f522-9c36-4d90-a48a-bddbb3f599bb
73 plus d413a8fb-e014-4d9b-848e-0c035b512dfe
74 conc 1755c969-a069-44db-a556-467de0889719
74 pzcb cb6d4871-cd34-442c-9692-fd58c84efc41
75 conc 2d3a4f10-c90d-4994-ba44-b8fa5f161b32
76 cbx a1f227eb-09e9-48fb-821c-073764dbaade
76 conc 7a234dfb-5507-4c2d-8b98-2206ec44a6e7
77 cbx 5bfb1339-3a0b-42f3-b532-25f7101069cc
77 conc e639beb0-eea4-4895-89bc-44fb807083b7
77 dani 66f9b8c9-092d-4f9a-8c3c-21f309dea4c5
78 conc 0aadf6fd-56b1-44c8-87ba-b65704278f8f
79 conc 37fb96ce-aa86-46c5-87f7-a7335666550c
80 conc 16d9c28b-1726-4959-8688-14efc11b680a
80 conc f7ecf372-2252-43b0-b142-2020df87b3e2
81 conc 925c09d9-09c1-4eb8-b29f-9c0fe03fc527
82 conc e008d7b3-cf8a-48d0-b33c-23246511379f
83 conc 06acb504-e1a8-4dea-acaa-35b0eb74eca4
84 cbx 89e93dae-1dcc-4b82-a6c5-e5213d187f2e
84 conc 6793d3b4-d76e-4de6-a342-4fc4c64307c0
84 dani 272751f7-9d7b-4e85-a667-d4086cab0d5c
85 conc 606672e4-9d71-4040-a50a-10f6d7342ea9
86 cb dff2f9af-ce73-4da2-a23a-cabc170d6d88
86 vst c5671839-c503-4032-80cb-e5c4ebb58ac9
87 cb 7d43e2c1-ca7b-4682-b5bf-afe9d0d99733
88 cbx 33e61dad-38cc-4832-86b2-855c63fe37e4
88 conc 4d55b155-9a7c-4781-bab0-4ff141a5968d
89 cb 06b3af58-e016-4e71-aa35-13e4790a2701
90 cb 014b8f9c-3ec9-40f9-9250-21e15e6cc2ab
91 cb 41f29353-af89-426a-8374-1528b3f369b7
91 cbx bdd2e166-a6a4-4755-983b-d633205bca2e
92 cbx e7d4cf11-6d0a-4283-ba74-b01f84490b60
92 conc 93063509-4305-4b90-9ecc-e20b99fcde7c
93 cb 75700bd9-bcf1-43c0-9197-328a55c58c23
94 cb b3c1d338-0669-49c5-88ec-993671144873
95 cb 74eb01bb-e572-40aa-a4c4-6f228b7e6d6d
96 conc e739f071-b9c8-4f5c-ac1b-9731ea686c85
97 conc 0549e898-b496-4aaa-a9cc-d16d21a0aba6
98 cb 738db850-bff2-42fd-b765-d28223e9fe0f
999 cb 2d51a9f5-d220-48de-9c77-7c92c5183830
999 cb 97c45983-2958-4596-b6d3-e8f28add503b
01 burger 74ca73d1-548a-4fd0-b349-9813d6a30127
01 cb 522a4fee-4314-4404-968f-d36e5225086e
01 cbx e93aa8cc-b8db-4f17-bb75-a402d28d6ace
02 adgcb 0d8a01ef-d757-4d8e-9bd4-def52888fc54
02 cb 4cdd2e7d-36b6-47e3-b435-428a77a7d967
03 adgcb 1f4fd975-1bca-4512-abb3-300f096752d9
03 cb a0474ddc-7b99-44eb-9a3d-21680f5ef80d
03 cb ff4b30a1-8a8f-4000-a1f6-588e6e68aa15
03 plus 25c9a097-48c5-43d2-b25f-1f89ff4b37af
03 pzcb f7cffa3a-d736-434a-8a0a-bf88cb1cffc6
04 cb 69aeb8ff-1481-434b-bac8-9b1c85982770
04 cbx 123bfeaa-20af-4ef4-b3b3-477bc0235ae8
04 pzcb 88281272-0f33-4d90-9b03-329bfdeef9ef
05 adgcb b5922be7-a24e-4bf3-9c02-bbad40b0bb02
05 cb 6dd21a52-d4ea-4203-974a-aa76b9d207fd
05 cbx 038a71e9-8547-4092-8196-7e425664d44d
06 adgcb 8cef8dcb-2be2-4344-88dc-dbbb66b80f7c
06 cb 930ca986-b0c3-4f5a-8da5-c95b2d89d960
06 dani 34e2116f-7309-4de7-8d93-1909e2cd9921
07 adgcb 16fffce8-4ade-42b5-8eb7-48053f72ae6c
07 cb b7ad98a6-3008-4a2e-a3a6-7ce63aee9c60
07 pzcb 6d087e90-4c46-496f-b244-da3bb4f7bf7a
08 cb a7613879-2e7e-4fd6-a969-3c15ce8ab80b
08 pzcb ede42d38-79e1-4ba6-a8f1-a410754b315d
08 vst 60a90e35-3568-4ecd-a4b5-8261e5a19c08
09 adgcb a275df9b-35dd-4099-8c28-154012814f3e
09 cb 2725b1f4-980c-46d1-9d20-960d38e4eb2f
09 cbx 204423dc-21a9-4048-9729-accfdb837bfe
`)

/** Uma linha "<operação> <merchant>" por restaurante → restaurantes por número da loja. */
function agruparPorLoja(texto: string): Record<string, [operacao: string, merchant: string][]> {
  const porLoja: Record<string, [operacao: string, merchant: string][]> = {}
  for (const linha of texto.split('\n')) {
    const m = /^(\d+) (\S+) (\S+)$/.exec(linha.trim())
    if (m) (porLoja[m[1]] ??= []).push([`${m[1]} ${m[2]}`, m[3]])
  }
  return porLoja
}

/** Merchants do iFood da loja: os da tabela; fora dela, o vínculo da Empresa. */
function merchantsDaLoja(locRef: string | null, e: { locRefs: Record<string, string> }): string[] {
  const daTabela = locRef ? RESTAURANTES_IFOOD[locRef] : undefined
  if (daTabela) return daTabela.map(([, merchant]) => merchant)
  const daEmpresa = e.locRefs?.IFOOD?.trim().toLowerCase()
  return daEmpresa ? [daEmpresa] : []
}

type Json = Record<string, unknown>

function obj(v: unknown): Json | null {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Json) : null
}

function lista(v: unknown): unknown[] {
  return Array.isArray(v) ? v : []
}

/**
 * Texto de um campo — a `GetJsonStr` do legado: número vira inteiro em texto
 * (`n_pedido`/`shortId` vêm como número), `null`/ausente/outro tipo = `null`.
 */
function texto(v: unknown): string | null {
  if (typeof v === 'string') return v
  if (typeof v === 'number' && Number.isFinite(v)) return String(Math.trunc(v))
  return null
}

/** Número de um campo — a `GetJsonNum` do legado: `null`/ausente/inválido = `null`. */
function numero(v: unknown): number | null {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v)
    return Number.isFinite(n) ? n : null
  }
  return null
}

/** Soma em centavos e devolve em reais — sem acumular erro de ponto flutuante. */
function somar(valores: number[]): number {
  return valores.reduce((acc, v) => acc + Math.round(v * 100), 0) / 100
}

/** `true`/`false` do iFood como SIM/NÃO; texto como veio. */
function simNao(v: unknown): string {
  if (typeof v === 'boolean') return v ? 'SIM' : 'NÃO'
  return texto(v) ?? ''
}

/** O que a venda do iFood traz para o pedido do DW — a `MergeIfoodData` do legado. */
interface VendaIfood {
  shortId: string
  /** Restaurante do iFood em que a venda está (UUID). */
  merchant: string
  /** `createdAt` da venda (UTC): desempata o mesmo código em dois restaurantes. */
  criadoEm: string
  /** `merchant.shortId` (vira o ID DO RESTAURANTE); `null` sem merchant na venda. */
  idLoja: string | null
  totalParceiro: number
  confirmado: 'SIM' | 'NÃO'
  tipoPedido: string
  canal: string
  dataCancelamento: string
  origemCancelamento: string
  motivoCancelamento: string
  cancelamentoContestavel: string
  motivoImpossibilidade: string
  dataLimiteContestacao: string
  cancelamentoParcial: 'SIM' | 'NÃO'
}

/** Extrai da venda os campos do cruzamento, com as mesmas regras da `MergeIfoodData`. */
function extrair(venda: Json, merchantId: string): VendaIfood | null {
  const shortId = texto(venda.shortId)
  if (!shortId) return null
  const merchant = obj(venda.merchant)
  const status = texto(venda.currentStatus) ?? ''
  const v: VendaIfood = {
    shortId,
    merchant: merchantId,
    criadoEm: texto(venda.createdAt) ?? '',
    idLoja: merchant ? String(Math.trunc(numero(merchant.shortId) ?? 0)) : null,
    totalParceiro: somar(
      lista(obj(venda.payments)?.methods).map((m) => numero(obj(m)?.value) ?? 0)
    ),
    confirmado: status === 'CONCLUDED' ? 'SIM' : 'NÃO',
    tipoPedido: texto(venda.type) ?? '',
    canal: texto(venda.salesChannel) ?? '',
    dataCancelamento: '',
    origemCancelamento: '',
    motivoCancelamento: '',
    cancelamentoContestavel: '',
    motivoImpossibilidade: '',
    dataLimiteContestacao: '',
    cancelamentoParcial: 'NÃO',
  }
  for (const item of lista(venda.orderStatusHistory)) {
    const h = obj(item)
    if (!h) continue
    const valor = texto(h.value)
    if (valor === 'PARTIAL_CANCELLATION_ORDER') v.cancelamentoParcial = 'SIM'
    if (status === 'CANCELLED' && valor === 'CANCELLED') {
      v.dataCancelamento = texto(h.createdAt) ?? ''
      const meta = obj(h.metadata)
      if (meta) {
        v.origemCancelamento = texto(meta.cancelOrigin) ?? ''
        v.motivoCancelamento = texto(meta.cancelCodeDescription) ?? ''
        const disputa = obj(meta.cancellationDispute)
        if (disputa) {
          v.cancelamentoContestavel = simNao(disputa.isContestable)
          if (Array.isArray(disputa.reasons)) {
            v.motivoImpossibilidade = disputa.reasons
              .map((r) => (typeof r === 'string' ? r : JSON.stringify(r)))
              .join(', ')
          }
        }
      }
    }
  }
  // Data limite de contestação: 1º lançamento do evento financeiro FBOE.
  for (const item of lista(venda.orderEvents)) {
    const ev = obj(item)
    if (texto(ev?.fullCode) !== 'FINANCIAL_BILLED_ORDER_ENTRY') continue
    const entrada = obj(lista(obj(ev?.metadata)?.entries)[0])
    v.dataLimiteContestacao = texto(obj(entrada?.period)?.endDate) ?? ''
    break
  }
  return v
}

/**
 * Registra no log do servidor a mensagem que a API devolveu no corpo do erro. Ela NÃO vai
 * para a tela: é texto de terceiro, sem controle do que traz (ids, caminhos, eco da
 * requisição). A tela recebe só o status; o suporte acha o detalhe pelo ID da chamada.
 */
async function registrarDetalheDoErro(r: Response): Promise<void> {
  try {
    const corpo = (await r.json()) as { detail?: unknown; message?: unknown }
    const msg = corpo.detail ?? corpo.message
    if (typeof msg === 'string')
      console.error('[fechamento-ifood-diario] %s respondeu %d:', 'iFood', r.status, msg)
  } catch {
    // corpo não é JSON: nada a registrar
  }
}

/**
 * Mensagem para a recusa do iFood. 401 = token vencido ou inválido (quem renova é o
 * hub de Credenciais do portal; no `gia dev`, o script `npm run token:ifood`). 403 =
 * a loja não autorizou o aplicativo de vocês no Portal do Parceiro do iFood.
 */
function recusaIfood(status: number): string | null {
  const dev = envOptional('GIA_DEV_CRED_IFOOD_TOKEN') !== undefined
  if (status === 401) {
    return dev
      ? 'O token do iFood venceu ou é inválido (401). Rode `npm run token:ifood` e reinicie o gia dev.'
      : 'O iFood recusou a credencial (401: token vencido ou inválido). Avise o administrador do portal (hub de Credenciais, integração ifood).'
  }
  if (status === 403) {
    return 'O iFood negou o acesso a este restaurante (403): ele não autorizou o aplicativo da Coco Bambu no Portal do Parceiro do iFood.'
  }
  return null
}

function ehTimeout(e: unknown): boolean {
  return e instanceof Error && (e.name === 'TimeoutError' || e.name === 'AbortError')
}

/** Espera `ms` milissegundos. */
function esperar(ms: number): Promise<void> {
  return new Promise((ok) => setTimeout(ok, ms))
}

/**
 * GET na API do iFood. No 429 (limite de requisições) espera o `Retry-After` — ou
 * 1,5 s, 3 s, 6 s — e tenta de novo, até 3 vezes.
 */
async function getIfood(url: string, token: string): Promise<Response> {
  for (let tentativa = 0; ; tentativa++) {
    const r = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(TIMEOUT_IFOOD_MS),
    })
    if (r.status !== 429 || tentativa >= 3) return r
    const retry = Number(r.headers.get('retry-after'))
    await esperar(Number.isFinite(retry) && retry > 0 ? retry * 1000 : 1500 * 2 ** tentativa)
  }
}

/** Restaurantes da conta do iFood (id → nome) — mudam pouco: 30 min por instância. */
let cacheNomes: { em: number; nomes: Map<string, string> } | null = null
const CACHE_NOMES_MS = 30 * 60_000

/**
 * Nome do restaurante no iFood, para a coluna "Restaurante no iFood". Só informativo:
 * se a lista da conta falhar, volta `null` (a tela mostra a operação), sem aviso.
 */
async function nomeDoRestaurante(base: string, token: string, id: string): Promise<string | null> {
  try {
    if (!cacheNomes || Date.now() - cacheNomes.em > CACHE_NOMES_MS) {
      const nomes = new Map<string, string>()
      for (let p = 1; p <= 20; p++) {
        const r = await fetch(`${base}/merchant/v1.0/merchants?page=${p}&size=100`, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
          signal: AbortSignal.timeout(TIMEOUT_IFOOD_MS),
        })
        if (r.status === 204) break
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        const itens = lista(await r.json())
        for (const i of itens) {
          const m = obj(i)
          const mid = m && texto(m.id)
          if (m && mid) nomes.set(mid.toLowerCase(), texto(m.name) ?? mid)
        }
        if (itens.length < 100) break
      }
      cacheNomes = { em: Date.now(), nomes }
    }
    return cacheNomes.nomes.get(id) ?? null
  } catch (e) {
    console.error('[fechamento-ifood-diario] lista de restaurantes do iFood:', e)
    return null
  }
}

interface Resposta {
  vendas: VendaIfood[]
  /** Nome do restaurante no iFood (só na página 1; `null` se a lista falhar). */
  restaurante: string | null
  /** Páginas do dia (a página 1 é que diz); 0 = sem vendas ou sem consulta. */
  totalPaginas: number
  /** Problema definitivo da parte do iFood (sem integração, credencial, 401/403). */
  aviso: string | null
}

function lerCorpo(bruto: string): Json | null {
  try {
    return obj(JSON.parse(bruto))
  } catch {
    return null
  }
}

/** Vendas da página que vieram sem os pagamentos (a resposta "leve" do iFood). */
function vendasLeves(corpo: Json): number {
  return lista(corpo.sales)
    .map(obj)
    .filter((v) => lista(obj(v?.payments)?.methods).length === 0).length
}

const vazio = (aviso: string | null, restaurante: string | null = null): Resposta => ({
  vendas: [],
  restaurante,
  totalPaginas: 0,
  aviso,
})

export default defineHandler<Body, Resposta>(async (ctx) => {
  await ctx.requirePermission('fechamento-ifood-diario.ler')
  const empresaId = Number(ctx.body.empresaId)
  if (!Number.isInteger(empresaId) || empresaId <= 0) throw new HttpError(422, 'Informe a loja.')
  // 403 se a Empresa está fora do escopo do usuário.
  await ctx.requireEmpresa(empresaId)
  const data = validarData(ctx.body.data)
  const pagina = Number(ctx.body.pagina)
  if (!Number.isInteger(pagina) || pagina < 1 || pagina > MAX_PAGINAS_IFOOD) {
    throw new HttpError(422, 'Página inválida.')
  }
  const empresa = (await ctx.empresas()).find((e) => e.id === empresaId)
  if (!empresa) throw new HttpError(404, 'Loja não encontrada.')
  // O restaurante do body só vale se for um dos da loja.
  const merchantId =
    typeof ctx.body.merchant === 'string' ? ctx.body.merchant.trim().toLowerCase() : ''
  if (!merchantsDaLoja(numeroDaLoja(empresa), empresa).includes(merchantId)) {
    throw new HttpError(422, 'Este restaurante do iFood não é desta loja.')
  }

  let cred: { baseUrl: string; token: string }
  try {
    cred = await ctx.credencial('ifood')
  } catch (e) {
    console.error('[fechamento-ifood-diario] credencial do iFood:', e)
    // A mensagem do hub fica só no log: pode trazer detalhe da integração.
    return vazio(
      'Não foi possível obter a credencial da API do iFood. Avise o administrador do portal (hub de Credenciais, integração ifood).'
    )
  }
  const base = cred.baseUrl.replace(/\/+$/, '')
  const qs = new URLSearchParams({
    beginSalesDate: data,
    endSalesDate: data,
    page: String(pagina),
  })
  const url = `${base}/financial/v3.0/merchants/${encodeURIComponent(merchantId)}/sales?${qs}`
  const pedir = () =>
    getIfood(url, cred.token).catch((e: unknown) => {
      console.error('[fechamento-ifood-diario] API do iFood:', e)
      // O `fetch` só lança sem resposta: tempo esgotado (504) ou não conectou (503).
      throw new HttpError(
        ehTimeout(e) ? 504 : 503,
        ehTimeout(e)
          ? `A API do iFood demorou demais para responder (página ${pagina}).`
          : `Não conseguimos conectar à API do iFood (página ${pagina}).`
      )
    })
  // O nome do restaurante só na página 1 (lista da conta em cache), junto com ela.
  const nomePromise =
    pagina === 1 ? nomeDoRestaurante(base, cred.token, merchantId) : Promise.resolve(null)
  const r = await pedir()
  const restaurante = await nomePromise
  // 204 = restaurante sem vendas no dia.
  if (r.status === 204) return vazio(null, restaurante)
  if (!r.ok) {
    const recusa = recusaIfood(r.status)
    if (recusa) return vazio(recusa, restaurante)
    if (r.status === 502 || r.status === 503 || r.status === 504) {
      throw new HttpError(
        503,
        `A API do iFood está fora do ar (respondeu ${r.status}, página ${pagina}).`
      )
    }
    await registrarDetalheDoErro(r)
    throw new HttpError(502, `A API do iFood respondeu ${r.status} (página ${pagina}).`)
  }
  const bruto = await r.text()
  if (!bruto.trim()) return vazio(null, restaurante)
  let corpo = lerCorpo(bruto)
  // O iFood às vezes devolve a página "leve": vendas sem pagamentos nem eventos
  // financeiros, todas ou parte delas (medido em 10/11/2026: 2 de 6 pedidos seguidos da
  // mesma página). O status vem igual — os valores do fechamento não mudam —, mas Total
  // do parceiro e Data limite de contestação sairiam vazios. Pede de novo, até 2 vezes,
  // e fica com a resposta mais completa.
  for (let tentativa = 0; tentativa < 2 && corpo && vendasLeves(corpo) > 0; tentativa++) {
    try {
      const r2 = await pedir()
      if (!r2.ok) break
      const outro = lerCorpo(await r2.text())
      if (outro && vendasLeves(outro) < vendasLeves(corpo)) corpo = outro
    } catch {
      break
    }
  }
  if (!corpo) {
    throw new HttpError(502, `A API do iFood devolveu um formato inesperado (página ${pagina}).`)
  }
  const vendas = lista(corpo.sales)
    .map(obj)
    .filter((v): v is Json => v !== null)
    .map((v) => extrair(v, merchantId))
    .filter((v): v is VendaIfood => v !== null)
  return {
    vendas,
    restaurante,
    totalPaginas: Math.max(1, Math.trunc(numero(corpo.pageCount) ?? 1)),
    aviso: null,
  }
})

export const config = {
  integracoes: ['ifood'],
  secrets: [],
}
