## Why

Fluxos no n8n que enviam mensagens para canais com limite de caracteres (WhatsApp, Telegram, SMS, Discord, etc.) frequentemente precisam fatiar textos longos antes do envio. Hoje isso exige nós de código (`Function`/`Code`) escritos manualmente em cada workflow, com lógica frágil que costuma cortar palavras ao meio. Um nó dedicado da comunidade resolve esse problema de forma reutilizável e confiável.

## What Changes

- Adicionar um pacote de nó da comunidade para n8n (`n8n-nodes-*`) publicável no npm e instalável via "Community Nodes".
- Introduzir um nó **Split Message** cujo objetivo único é dividir uma mensagem longa em várias mensagens menores.
- O nó recebe como entrada o **texto** e o **limite máximo de caracteres** por mensagem.
- O resultado é entregue como um **array** de mensagens, cada uma respeitando o limite informado.
- A divisão **nunca corta palavras ao meio**: as quebras ocorrem em fronteiras de palavra (e, quando possível, de parágrafo/linha/sentença).
- Tratar casos de borda: palavra isolada maior que o limite, limite inválido/zero, texto vazio e espaços em excesso.

## Capabilities

### New Capabilities
- `message-splitting`: regras de como uma mensagem longa é dividida em um array de mensagens respeitando um limite máximo de caracteres sem cortar palavras.
- `n8n-node-package`: estrutura e empacotamento do nó da comunidade (metadados, parâmetros de UI, entrada/saída e publicação) conforme as convenções do n8n.

### Modified Capabilities
<!-- Nenhuma capability existente é alterada (projeto greenfield). -->

## Impact

- **Novo repositório/pacote**: estrutura `n8n-nodes-split-message` (TypeScript), com `package.json` declarando a seção `n8n`.
- **Dependências**: `n8n-workflow` (peer), toolchain de build TypeScript, lint e testes (Jest/Vitest).
- **Sistemas afetados**: nenhum sistema existente; o nó é uma adição isolada consumida por workflows do n8n.
- **Publicação**: distribuição via npm para instalação como Community Node.
