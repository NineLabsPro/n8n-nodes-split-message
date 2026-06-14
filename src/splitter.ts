/**
 * Lógica pura de divisão de mensagens. Sem dependência do n8n, para que possa
 * ser testada e reutilizada de forma isolada.
 *
 * Desenvolvido por zanini · ninelabs.
 */

/** Como tratar um único token (palavra/URL) maior que `maxLength`. */
export type OversizedWordStrategy = 'hard-split' | 'keep-word';

export interface SplitMessageOptions {
  /** Padrão: `'hard-split'`. */
  strategy?: OversizedWordStrategy;
}

const DEFAULT_OPTIONS: Required<SplitMessageOptions> = {
  strategy: 'hard-split',
};

/**
 * Divide `text` em um array ordenado de partes, cada uma com no máximo
 * `maxLength` caracteres, quebrando apenas em fronteiras de palavra para que
 * nenhuma palavra seja cortada (a menos que uma única palavra exceda
 * `maxLength` e a estratégia seja `hard-split`).
 *
 * Ordem de preferência das quebras: parágrafo/quebra de linha -> frase -> palavra.
 *
 * @throws se `maxLength` estiver ausente, não for um número, for zero ou negativo.
 */
export function splitMessage(
  text: string,
  maxLength: number,
  options: SplitMessageOptions = {},
): string[] {
  if (typeof maxLength !== 'number' || !Number.isFinite(maxLength) || maxLength < 1) {
    throw new Error(
      `"maxLength" deve ser um número positivo, recebido: ${JSON.stringify(maxLength)}`,
    );
  }

  const { strategy } = { ...DEFAULT_OPTIONS, ...options };

  if (typeof text !== 'string' || text.trim() === '') {
    return [];
  }

  const max = Math.floor(maxLength);

  // Nível 1: parágrafos (a quebra de linha é a fronteira preferida mais forte).
  const paragraphs = text
    .split(/\r?\n/)
    .map((p) => p.replace(/[^\S\n]+/g, ' ').trim())
    .filter((p) => p.length > 0);

  return packTokens(paragraphs, '\n', max, (paragraph) =>
    packSentences(paragraph, max, strategy),
  );
}

/** Nível 2: quebra um parágrafo em fronteiras de frase e, depois, de palavra. */
function packSentences(
  paragraph: string,
  max: number,
  strategy: OversizedWordStrategy,
): string[] {
  if (paragraph.length <= max) {
    return [paragraph];
  }
  const sentences = paragraph
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  return packTokens(sentences, ' ', max, (sentence) =>
    packWords(sentence, max, strategy),
  );
}

/** Nível 3: quebra uma frase em fronteiras de palavra; trata palavras grandes. */
function packWords(
  sentence: string,
  max: number,
  strategy: OversizedWordStrategy,
): string[] {
  const words = sentence.split(/\s+/).filter((w) => w.length > 0);
  return packTokens(words, ' ', max, (word) =>
    strategy === 'hard-split' ? hardSplit(word, max) : [word],
  );
}

/** Fatia um token grande em pedaços de no máximo `max` caracteres. */
function hardSplit(token: string, max: number): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < token.length; i += max) {
    chunks.push(token.slice(i, i + max));
  }
  return chunks;
}

/**
 * Empacotador guloso: acumula `tokens` unidos por `sep` em partes de no máximo
 * `max` caracteres. Um token maior que `max` é delegado a `onOversized`.
 */
function packTokens(
  tokens: string[],
  sep: string,
  max: number,
  onOversized: (token: string) => string[],
): string[] {
  const parts: string[] = [];
  let current = '';

  const flush = () => {
    if (current.length > 0) {
      parts.push(current);
      current = '';
    }
  };

  for (const token of tokens) {
    if (token.length > max) {
      flush();
      for (const chunk of onOversized(token)) {
        parts.push(chunk);
      }
      continue;
    }

    const candidate = current.length > 0 ? current + sep + token : token;
    if (candidate.length <= max) {
      current = candidate;
    } else {
      flush();
      current = token;
    }
  }

  flush();
  return parts;
}
