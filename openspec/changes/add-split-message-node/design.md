## Context

n8n community nodes are TypeScript packages published to npm that follow a fixed structure: a node class implementing `INodeType` from `n8n-workflow`, an icon, and a `package.json` with an `n8n` section. They are installed into an instance via the "Community Nodes" UI.

This change builds a single-purpose node, **Split Message**, that fatia um texto longo em um array de mensagens respeitando um limite máximo de caracteres, sem cortar palavras ao meio. The core splitting logic is pure (no n8n dependency) so it can be unit-tested in isolation and reused.

Constraints:
- Must run inside n8n's Node.js runtime (no DOM, no browser APIs).
- Splitting must be deterministic and side-effect free.
- The node has exactly one job — no I/O, no credentials, no external calls.

## Goals / Non-Goals

**Goals:**
- A reusable, well-tested pure function `splitMessage(text, maxLength, options)` that returns `string[]`.
- An n8n node wrapping that function with clear parameters (Text, Max Length, oversized-word strategy).
- Break preference order: paragraph/newline → sentence → word, always respecting `maxLength`.
- Never cut a word that fits within `maxLength`.
- Publishable as `n8n-nodes-split-message` community package.

**Non-Goals:**
- No support for splitting by tokens/bytes (only character count in this version).
- No platform-specific presets (e.g. "WhatsApp = 4096"); the user passes the limit explicitly.
- No markdown-aware splitting (not breaking inside code fences/links) — noted as a future extension.
- No streaming/very-large-document optimization beyond a single in-memory pass.

## Decisions

**Decision: Separate pure splitter from the n8n node.**
Logic lives in `src/splitter.ts`; the node in `src/nodes/SplitMessage/SplitMessage.node.ts` only maps parameters → function call → output. Rationale: testability and reuse. Alternative (logic inside the node `execute`) rejected — couples business rules to n8n runtime and is hard to test.

**Decision: Greedy line-packing algorithm with a boundary hierarchy.**
Tokenize the text preserving separators. Greedily accumulate units into the current part; when adding the next unit would exceed `maxLength`, flush the part and start a new one. Prefer flushing at the strongest available boundary (newline, then sentence-ending punctuation, then space). Rationale: O(n), deterministic, easy to reason about. Alternative (balanced/min-parts DP) rejected as overkill for chat-message splitting.

**Decision: Oversized-word strategy is configurable, default "hard split".**
A single token longer than `maxLength` cannot satisfy the limit otherwise. Default hard-splits the token into `maxLength` chunks; an opt-in "keep word" emits it as an oversized part. Rationale: most chat platforms reject over-limit messages, so the safe default is to never exceed the limit. Alternative (always throw) rejected as too brittle for real text containing long URLs.

**Decision: Output both `parts` (array) and `count`.**
Downstream nodes typically need the array to fan out (e.g. via Split Out / loop) and the count for logging/conditioning. Each input item is processed independently (per-item execution).

**Decision: TypeScript + Jest, build with `tsc`.**
Matches the n8n community-node starter conventions, keeping the package familiar to maintainers and compatible with n8n's loader.

## Risks / Trade-offs

- **Character count vs. grapheme/emoji width** → Counting UTF-16 code units can miscount emoji/combining characters relative to a platform's own limit. Mitigation: document that the limit is character-based; consider a future `[...text]` (code-point) or grapheme-aware mode.
- **Whitespace normalization changes the text** → Trimming/collapsing whitespace means reassembled parts may not be byte-identical to input. Mitigation: document the normalization rules; keep them minimal (trim parts, single space between joined words).
- **n8n API version drift** → `INodeType`/`n8n-workflow` interfaces evolve. Mitigation: pin a peer-dependency range and run against a recent n8n version in CI.
- **Sentence-boundary detection is heuristic** → Abbreviations ("Dr.") may cause early sentence breaks, but never violate `maxLength` or split words. Mitigation: sentence boundary is only a *preference*, correctness (limit + word integrity) is always preserved.

## Open Questions

- Should we ship platform presets (Telegram 4096, WhatsApp, SMS 160/70) as a convenience dropdown in a later version?
- Should overlap/continuation markers (e.g. "(1/3)") be an optional feature of the node?
