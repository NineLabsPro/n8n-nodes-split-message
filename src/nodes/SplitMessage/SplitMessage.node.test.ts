import { SplitMessage } from './SplitMessage.node';

interface ItemParams {
  text: string;
  maxLength: number;
  strategy?: string;
}

/**
 * Build a minimal IExecuteFunctions-like mock that serves the given input
 * items and per-item parameters.
 */
function makeContext(items: Array<{ json: Record<string, unknown> }>, params: ItemParams[]) {
  return {
    getInputData: () => items,
    getNodeParameter: (name: string, itemIndex: number) => {
      const p = params[itemIndex] as unknown as Record<string, unknown>;
      const defaults: Record<string, unknown> = {
        strategy: 'hard-split',
      };
      return p[name] ?? defaults[name];
    },
    continueOnFail: () => false,
    getNode: () => ({ name: 'Split Message' }),
  } as any;
}

describe('SplitMessage node - execute', () => {
  const node = new SplitMessage();

  it('fans out one output item per part', async () => {
    const ctx = makeContext(
      [{ json: { id: 1 } }],
      [{ text: 'one two three four', maxLength: 8 }],
    );

    const result = await node.execute.call(ctx);
    const out = result[0];

    expect(out.length).toBeGreaterThan(1);
    for (const item of out) {
      expect(typeof item.json.message).toBe('string');
      expect((item.json.message as string).length).toBeLessThanOrEqual(8);
      // No nested array, count, or original item data leaks into the part item.
      expect(item.json.parts).toBeUndefined();
      expect(item.json.count).toBeUndefined();
      expect(item.json.id).toBeUndefined();
      // Origin is preserved via pairedItem.
      expect(item.pairedItem).toEqual({ item: 0 });
    }
  });

  it('emits a single item when the text fits the limit', async () => {
    const ctx = makeContext([{ json: {} }], [{ text: 'hello world', maxLength: 50 }]);

    const result = await node.execute.call(ctx);
    const out = result[0];

    expect(out).toHaveLength(1);
    expect(out[0].json.message).toBe('hello world');
    expect(out[0].pairedItem).toEqual({ item: 0 });
  });

  it('fans out across multiple input items and emits nothing for empty text', async () => {
    const ctx = makeContext(
      [{ json: { i: 0 } }, { json: { i: 1 } }, { json: { i: 2 } }],
      [
        { text: 'short', maxLength: 50 },
        { text: 'alpha beta gamma', maxLength: 9 },
        { text: '', maxLength: 50 },
      ],
    );

    const result = await node.execute.call(ctx);
    const out = result[0];

    // Item 0 -> 1 part, item 1 -> >1 part, item 2 (empty) -> 0 parts.
    const fromItem0 = out.filter((o) => o.pairedItem && (o.pairedItem as any).item === 0);
    const fromItem1 = out.filter((o) => o.pairedItem && (o.pairedItem as any).item === 1);
    const fromItem2 = out.filter((o) => o.pairedItem && (o.pairedItem as any).item === 2);

    expect(fromItem0).toHaveLength(1);
    expect(fromItem0[0].json.message).toBe('short');
    expect(fromItem1.length).toBeGreaterThan(1);
    expect(fromItem2).toHaveLength(0);
    expect(out).toHaveLength(fromItem0.length + fromItem1.length);
  });

  it('throws a NodeOperationError for an invalid maxLength', async () => {
    const ctx = makeContext([{ json: {} }], [{ text: 'hello', maxLength: 0 }]);
    await expect(node.execute.call(ctx)).rejects.toThrow();
  });
});
