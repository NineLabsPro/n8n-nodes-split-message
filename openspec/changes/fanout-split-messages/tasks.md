## 1. Node implementation

- [x] 1.1 Em `SplitMessage.node.ts`, remover a propriedade `outputField` de `description.properties`
- [x] 1.2 No `execute`, remover a leitura de `outputField` e fazer fan-out: para cada item de entrada, dar push de um item por parte com `{ json: { message: part }, pairedItem: { item: i } }`
- [x] 1.3 Remover o campo `count` da saída; texto vazio (`parts` vazio) não empurra itens
- [x] 1.4 Manter o comportamento de `continueOnFail` (um item de erro por item de entrada com `pairedItem`)

## 2. Tests

- [x] 2.1 Atualizar `SplitMessage.node.test.ts`: remover `outputField` do mock de parâmetros e da interface `ItemParams`
- [x] 2.2 Asserir que um texto que divide em N partes emite N itens, cada um com `json.message` (≤ maxLength) e `pairedItem.item` correto
- [x] 2.3 Asserir que múltiplos itens de entrada produzem fan-out combinado; e que texto vazio não emite itens
- [x] 2.4 Manter o teste de `maxLength` inválido lançando `NodeOperationError`

## 3. Build & release

- [x] 3.1 Rodar `npm run build` (regenerar `dist/`) e `npm test`
- [x] 3.2 Bump de versão em `package.json` (mudança BREAKING) e atualizar README com a nova forma de saída
