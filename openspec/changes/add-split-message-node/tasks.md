## 1. Project & package scaffold

- [x] 1.1 Initialize the package `n8n-nodes-split-message` (TypeScript) with `tsconfig.json`, `src/`, and build output to `dist/`
- [x] 1.2 Add `package.json` with the `n8n` section (`nodes` array pointing to the compiled node) and the `n8n-community-node-package` keyword
- [x] 1.3 Add dev tooling: `n8n-workflow` peer dependency, Jest (or Vitest), ESLint, and `build`/`test`/`lint` scripts
- [x] 1.4 Add a node icon (`splitMessage.svg`) and wire it into the node description

## 2. Core splitter (pure logic)

- [x] 2.1 Implement `splitMessage(text, maxLength, options)` in `src/splitter.ts` returning `string[]`
- [x] 2.2 Tokenize text preserving separators and implement greedy packing within `maxLength`
- [x] 2.3 Implement boundary preference order: newline/paragraph → sentence → word
- [x] 2.4 Implement oversized-word strategy (`hard-split` default, `keep-word` opt-in)
- [x] 2.5 Implement input validation (invalid/zero/negative `maxLength` throws) and empty/whitespace handling (returns `[]`, trims parts)

## 3. n8n node wrapper

- [x] 3.1 Implement `src/nodes/SplitMessage/SplitMessage.node.ts` as an `INodeType` with display name "Split Message", description, and icon
- [x] 3.2 Define parameters: `Text` (string, expression-enabled), `Max Length` (number, default), and oversized-word strategy (options)
- [x] 3.3 Implement `execute` with per-item processing, calling `splitMessage` and outputting `parts` (array) and `count`
- [x] 3.4 Surface validation errors as `NodeOperationError` with descriptive messages

## 4. Tests

- [x] 4.1 Unit tests for `splitMessage`: short text, long text, word-boundary preservation, never-cut-words
- [x] 4.2 Unit tests for edge cases: oversized word (both strategies), invalid `maxLength`, empty/whitespace input, newline/sentence preference
- [x] 4.3 Test the node `execute` mapping: parameters → output shape (`parts`, `count`) and multi-item input

## 5. Docs & publish readiness

- [x] 5.1 Write `README.md` with install instructions (Community Nodes), parameters, examples, and limitations (character-count basis, whitespace normalization)
- [x] 5.2 Verify `npm run build` and `npm test` pass; lint clean
- [x] 5.3 Validate the change with `openspec validate add-split-message-node` and confirm metadata is publish-ready (LICENSE, repository, version)
