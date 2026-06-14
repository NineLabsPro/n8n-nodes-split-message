import { splitMessage } from './splitter';

const wordsOf = (parts: string[]) => parts.join(' ').split(/\s+/).filter(Boolean);

describe('splitMessage - basic behavior', () => {
  it('returns a single trimmed part when text fits within the limit', () => {
    expect(splitMessage('hello world', 50)).toEqual(['hello world']);
    expect(splitMessage('  hello world  ', 50)).toEqual(['hello world']);
  });

  it('splits a long text into multiple parts within the limit', () => {
    const text = 'one two three four five six seven eight nine ten';
    const parts = splitMessage(text, 12);
    expect(parts.length).toBeGreaterThan(1);
    for (const part of parts) {
      expect(part.length).toBeLessThanOrEqual(12);
    }
  });

  it('preserves the original word sequence across parts', () => {
    const text = 'alpha beta gamma delta epsilon zeta eta theta';
    const parts = splitMessage(text, 15);
    expect(wordsOf(parts)).toEqual(text.split(' '));
  });
});

describe('splitMessage - never cut words', () => {
  it('breaks at word boundaries, never mid-word', () => {
    const text = 'internationalization globalization localization';
    const parts = splitMessage(text, 25);
    for (const part of parts) {
      expect(part.length).toBeLessThanOrEqual(25);
    }
    // Each original word appears intact in exactly one part.
    for (const word of text.split(' ')) {
      const occurrences = parts.filter((p) => p.split(/\s+/).includes(word)).length;
      expect(occurrences).toBe(1);
    }
  });
});

describe('splitMessage - oversized word strategy', () => {
  const longWord = 'a'.repeat(25);

  it('hard-splits an oversized word by default so no part exceeds the limit', () => {
    const parts = splitMessage(longWord, 10);
    expect(parts).toEqual(['aaaaaaaaaa', 'aaaaaaaaaa', 'aaaaa']);
    for (const part of parts) {
      expect(part.length).toBeLessThanOrEqual(10);
    }
  });

  it('keeps an oversized word intact with the keep-word strategy', () => {
    const parts = splitMessage(longWord, 10, { strategy: 'keep-word' });
    expect(parts).toEqual([longWord]);
  });

  it('keeps surrounding words intact around an oversized word', () => {
    const parts = splitMessage(`start ${longWord} end`, 10);
    expect(parts[0]).toBe('start');
    expect(parts[parts.length - 1]).toBe('end');
  });
});

describe('splitMessage - boundary preference', () => {
  it('prefers breaking on newline boundaries (paragraphs stay separate)', () => {
    const parts = splitMessage('first line\nsecond line', 11);
    expect(parts).toEqual(['first line', 'second line']);
  });

  it('merges short consecutive lines when they fit, breaking at the newline', () => {
    const parts = splitMessage('a\nb\nc', 5);
    expect(parts).toEqual(['a\nb\nc']);
  });

  it('prefers sentence boundaries within a long paragraph', () => {
    const parts = splitMessage('Hello there. How are you?', 14);
    expect(parts).toEqual(['Hello there.', 'How are you?']);
  });
});

describe('splitMessage - validation and edge cases', () => {
  it.each([0, -1, NaN, undefined, null, 'x'])(
    'throws for invalid maxLength: %p',
    (bad) => {
      expect(() => splitMessage('hello', bad as unknown as number)).toThrow(
        /maxLength/,
      );
    },
  );

  it('returns an empty array for empty or whitespace-only text', () => {
    expect(splitMessage('', 10)).toEqual([]);
    expect(splitMessage('    ', 10)).toEqual([]);
    expect(splitMessage('\n\n', 10)).toEqual([]);
  });

  it('trims and collapses whitespace in output parts', () => {
    const parts = splitMessage('  hello    world  ', 50);
    expect(parts).toEqual(['hello world']);
  });
});
