## Context

O método `execute` do nó (`src/nodes/SplitMessage/SplitMessage.node.ts`) hoje produz, por item de entrada, **um** `INodeExecutionData` cujo `json` contém o objeto de entrada acrescido de `[outputField]: parts` e `count`. A lógica de divisão vive em `src/splitter.ts` (`splitMessage(text, maxLength, { strategy }): string[]`) e permanece adequada — a mudança é apenas na forma como o nó projeta esse `string[]` na saída do n8n.

A decisão de produto (já confirmada) é fazer **fan-out**: um item de saída por parte, com o texto em um campo fixo `message`, sem `count` e sem campo configurável.

## Goals / Non-Goals

**Goals:**
- Emitir um item de saída por parte resultante.
- Texto da parte em um campo fixo `message`.
- Preservar a origem de cada item via `pairedItem`.
- Remover o parâmetro `outputField` e o campo `count`.

**Non-Goals:**
- Alterar a lógica de `splitter.ts` (algoritmo de divisão, estratégias, validação de `maxLength`).
- Alterar os parâmetros `text`, `maxLength` e `strategy`.
- Adicionar múltiplas saídas/branches no nó (continua uma única saída Main).

## Decisions

**1. Fan-out via push por parte, mantendo o loop por item de entrada.**
Para cada item de entrada `i`, iterar sobre `parts` e dar `returnData.push({ json: { message: part }, pairedItem: { item: i } })`. Alternativa considerada: usar `this.helpers.constructExecutionMetaData` / `returnJsonArray`. Rejeitada por simplicidade — o push manual com `pairedItem` já é o padrão usado no arquivo e cobre o caso.

**2. Campo fixo `message` e descarte dos dados de entrada no `json`.**
Cada item de saída representa uma mensagem, então o `json` carrega apenas `{ message }`. A rastreabilidade até o item de origem é mantida por `pairedItem`, não por cópia de `...items[i].json`. Alternativa: espalhar `...items[i].json` em cada item. Rejeitada porque duplicaria os dados de entrada em N itens e poluiria o payload de cada mensagem; quem precisar dos dados originais pode usar o `pairedItem`.

**3. Texto vazio não emite item.**
`splitMessage` retorna `[]` para texto vazio; o loop naturalmente não empurra nada para aquele item de entrada. Mantém o comportamento de "zero partes = zero itens".

**4. `continueOnFail` mantém um item de erro.**
No catch, continuar empurrando um único item `{ json: { ...items[i].json, error } }` com `pairedItem`, como hoje, para não perder o sinal de falha por item.

## Risks / Trade-offs

- [BREAKING para workflows existentes] Consumidores que liam `json.parts`/`json.count` quebram → documentar no proposal/README e na migração do spec; bump de versão.
- [Perda dos dados de entrada no `json` de cada parte] → mitigado por `pairedItem`, que permite recuperar o item original em nós downstream.
- [Número de itens de saída cresce] um texto longo gera muitos itens → comportamento esperado e desejado para o caso de uso (enviar uma mensagem por vez).

## Migration Plan

1. Ajustar `execute` para fan-out e remover a leitura de `outputField`.
2. Remover a propriedade `outputField` de `description.properties`.
3. Atualizar testes para asserir N itens com `message` e `pairedItem`.
4. Rebuild (`dist/`) e bump de versão (mudança BREAKING).

Rollback: reverter o commit; nenhuma migração de dados envolvida.
