## Why

Hoje o nó "Dividir Mensagem" devolve um único item de saída contendo o array de partes aninhado em um campo (`parts`/`outputField`) mais um `count`. Para enviar cada mensagem em sequência (ex.: disparar uma mensagem por vez em um chat), o usuário precisa adicionar um nó extra ("Split Out"/loop) para desmembrar o array. O nó deveria já liberar as mensagens prontas para consumo, uma por item.

## What Changes

- O nó passa a fazer **fan-out**: emite um item de saída por parte resultante, em vez de um único item com o array aninhado. **BREAKING**
- Cada item de saída carrega o texto da parte em um campo fixo (`message`), preservando os dados do item de entrada via `pairedItem`.
- **BREAKING**: removido o parâmetro "Nome do Campo de Saída" (`outputField`) — não há mais nome configurável para a saída.
- **BREAKING**: removido o campo `count` do payload de saída (a contagem passa a ser implícita no número de itens emitidos).
- Entrada cujo texto resulta em zero partes (texto vazio) não emite itens para aquela entrada.

## Capabilities

### New Capabilities
<!-- Nenhuma capability nova; é uma mudança de comportamento de saída. -->

### Modified Capabilities
- `n8n-node-package`: o requisito "Node output shape" muda de "array aninhado em um campo + count em um único item" para "um item de saída por parte (fan-out), texto em campo fixo `message`"; o parâmetro de entrada `outputField` deixa de existir.

## Impact

- Código: `src/nodes/SplitMessage/SplitMessage.node.ts` (método `execute` e remoção da propriedade `outputField`).
- Testes: `src/nodes/SplitMessage/SplitMessage.node.test.ts` (asserções de saída e mock de parâmetros).
- Lógica pura `src/splitter.ts`: inalterada (continua retornando `string[]`).
- Consumidores downstream em workflows existentes que liam `json.parts`/`json.count` precisarão ser ajustados para iterar sobre os itens.
