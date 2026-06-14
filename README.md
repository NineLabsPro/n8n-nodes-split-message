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
| **Nome do Campo de Saída** | string | `parts` | Campo que conterá o array resultante. |

**Estratégia para Palavra Maior que o Limite**
- **Dividir a Palavra** — uma palavra maior que o limite é fatiada para que nenhuma parte ultrapasse o máximo (ideal para URLs longas).
- **Manter a Palavra** — a palavra maior que o limite é entregue como uma parte própria, intacta (pode ultrapassar o limite).

### Saída

Cada item de entrada gera um item de saída com:

```json
{
  "parts": ["primeiro pedaço ...", "segundo pedaço ...", "..."],
  "count": 3
}
```

Os campos originais do item são preservados. Use o nó **Split Out** ou um loop para iterar sobre `parts`.

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
