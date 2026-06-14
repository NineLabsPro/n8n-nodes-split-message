# n8n-nodes-split-message

Nó da comunidade [n8n](https://n8n.io) com um único objetivo: **dividir uma mensagem longa em um array de mensagens menores** respeitando um limite máximo de caracteres — **sem cortar palavras ao meio**.

Útil para enviar textos longos a canais com limite de caracteres (WhatsApp, Telegram, SMS, Discord, …).

> Desenvolvido por **zanini · ninelabs**.

## Instalação

Na sua instância do n8n, vá em **Configurações → Nós da Comunidade → Instalar** e informe:

```
n8n-nodes-split-message
```

Ou instale manualmente:

```bash
npm install n8n-nodes-split-message
```

## Nó: Dividir Mensagem

### Parâmetros

| Parâmetro | Tipo | Padrão | Descrição |
|---|---|---|---|
| **Texto** | string (aceita expressão) | — | A mensagem longa a ser dividida. |
| **Limite Máximo** | número | `4096` | Máximo de caracteres por mensagem. |
| **Estratégia para Palavra Maior que o Limite** | opções | `Dividir a Palavra` | Como tratar uma palavra maior que o limite. |

**Estratégia para Palavra Maior que o Limite**
- **Dividir a Palavra** — uma palavra maior que o limite é fatiada para que nenhuma parte ultrapasse o máximo (ideal para URLs longas).
- **Manter a Palavra** — a palavra maior que o limite é entregue como uma parte própria, intacta (pode ultrapassar o limite).

### Saída

O nó faz **fan-out**: cada item de entrada gera **um item de saída por mensagem dividida**. Cada item de saída tem o texto da parte no campo `message`:

```json
[
  { "message": "primeiro pedaço ..." },
  { "message": "segundo pedaço ..." },
  { "message": "..." }
]
```

As mensagens já saem separadas — não é preciso um nó **Split Out** nem um loop. A origem de cada parte é mantida via `pairedItem`, então você pode recuperar os dados do item de entrada em nós downstream. Texto vazio não gera itens.

> **Mudança em 0.2.0 (BREAKING):** versões anteriores devolviam um único item por entrada com o array em `parts` e um campo `count`, além de permitir configurar o "Nome do Campo de Saída". Agora a saída é um item por mensagem no campo `message`, sem `count` e sem campo configurável. Workflows que liam `parts`/`count` precisam ser ajustados para iterar sobre os itens.

### Como a divisão funciona

As quebras são preferidas nesta ordem, sempre respeitando o **Limite Máximo**:

1. Fronteiras de **parágrafo / quebra de linha**
2. Fronteiras de **frase** (`.`, `!`, `?`)
3. Fronteiras de **palavra**

As palavras nunca são cortadas, a menos que uma única palavra exceda o limite (veja a estratégia acima).

## Uso programático

```ts
import { splitMessage } from 'n8n-nodes-split-message';

splitMessage('uma mensagem muito longa ...', 4096, { strategy: 'hard-split' });
// => string[]
```

## Limitações

- **Baseado em contagem de caracteres**: o comprimento é medido em caracteres (unidades de código UTF-16). Emojis e caracteres combinados podem contar de forma diferente do limite real da plataforma de destino.
- **O espaço em branco é normalizado**: cada parte é "trimada" e espaços separadores repetidos são colapsados, então as partes reunidas não são idênticas byte a byte à entrada.
- A detecção de frases é heurística (ela nunca viola o limite nem corta palavras — apenas influencia *onde* ocorrem as quebras preferidas).

## Licença

[MIT](./LICENSE) — © 2026 zanini · ninelabs
