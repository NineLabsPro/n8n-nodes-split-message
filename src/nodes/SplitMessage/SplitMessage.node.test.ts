import { SplitMessage } from './SplitMessage.node';

interface ItemParams {
  text: string;
  maxLength: number;
  strategy?: string;
  outputField?: string;
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
        outputField: 'parts',
      };
      return p[name] ?? defaults[name];
    },
    continueOnFail: () => false,
    getNode: () => ({ name: 'Split Message' }),
  } as any;
}

describe('SplitMessage node - execute', () => {
  const node = new SplitMessage();

  it('outputs parts array and count', async () => {
    const ctx = makeContext(
      [{ json: { id: 1 } }],
      [{ text: 'one two three four', maxLength: 8 }],
    );

    const result = await node.execute.call(ctx);
    const out = result[0];

    expect(out).toHaveLength(1);
    expect(Array.isArray(out[0].json.parts)).toBe(true);
    expect(out[0].json.count).toBe((out[0].json.parts as string[]).length);
    // Original item data is preserved.
    expect(out[0].json.id).toBe(1);
    for (const part of out[0].json.parts as string[]) {
      expect(part.length).toBeLessThanOrEqual(8);
    }
  });

  it('honors a custom output field name', async () => {
    const ctx = makeContext(
      [{ json: {} }],
      [{ text: 'hello world', maxLength: 50, outputField: 'messages' }],
    );

    const result = await node.execute.call(ctx);
    expect(result[0][0].json.messages).toEqual(['hello world']);
  });

  it('processes each input item independently', async () => {
    const ctx = makeContext(
      [{ json: { i: 0 } }, { json: { i: 1 } }],
      [
        { text: 'short', maxLength: 50 },
        { text: 'alpha beta gamma', maxLength: 9 },
      ],
    );

    const result = await node.execute.call(ctx);
    const out = result[0];

    expect(out).toHaveLength(2);
    expect(out[0].json.parts).toEqual(['short']);
    expect((out[1].json.parts as string[]).length).toBeGreaterThan(1);
  });

  it('throws a NodeOperationError for an invalid maxLength', async () => {
    const ctx = makeContext([{ json: {} }], [{ text: 'hello', maxLength: 0 }]);
    await expect(node.execute.call(ctx)).rejects.toThrow();
  });
});
