## ADDED Requirements

### Requirement: Split text into messages within a maximum length
The system SHALL accept an input text and a maximum length (in characters) and SHALL return an ordered array of message parts where each part's length is less than or equal to the maximum length.

#### Scenario: Text shorter than the limit
- **WHEN** the input text length is less than or equal to the maximum length
- **THEN** the system returns an array containing exactly one element equal to the original (trimmed) text

#### Scenario: Text longer than the limit
- **WHEN** the input text length is greater than the maximum length
- **THEN** the system returns an array with two or more parts, each part having length less than or equal to the maximum length, and concatenating the parts (with word separators) reproduces the original word sequence

### Requirement: Never split words in the middle
The system SHALL break the text only at word boundaries (whitespace) and SHALL NOT cut a word across two parts when the word fits within the maximum length.

#### Scenario: Break occurs at a word boundary
- **WHEN** a part would exceed the maximum length by including the next word
- **THEN** the system closes the current part before that word and starts a new part with that word, so no word is split

#### Scenario: Preserve word integrity
- **GIVEN** a text whose words all fit within the maximum length
- **WHEN** the text is split
- **THEN** every word from the input appears intact in exactly one output part

### Requirement: Handle words longer than the maximum length
The system SHALL define deterministic behavior for a single token longer than the maximum length, controlled by a configurable strategy.

#### Scenario: Hard-split an oversized word (default)
- **WHEN** a single word is longer than the maximum length and the strategy is "hard split"
- **THEN** the system splits that word into chunks of at most the maximum length so that no part exceeds the limit

#### Scenario: Keep an oversized word intact
- **WHEN** a single word is longer than the maximum length and the strategy is "keep word"
- **THEN** the system emits that word as its own part even though it exceeds the maximum length

### Requirement: Prefer natural break boundaries
The system SHALL prefer breaking on paragraph/newline boundaries first, then sentence boundaries, then word boundaries, while still respecting the maximum length.

#### Scenario: Break on newline before word boundary
- **GIVEN** a text containing newlines where a paragraph fits within the maximum length
- **WHEN** the text is split
- **THEN** the system prefers ending a part at the newline boundary rather than mid-paragraph when both options stay within the limit

### Requirement: Validate inputs
The system SHALL validate the maximum length and SHALL handle empty input gracefully.

#### Scenario: Invalid maximum length
- **WHEN** the maximum length is missing, not a number, zero, or negative
- **THEN** the system raises a descriptive error and does not produce output

#### Scenario: Empty or whitespace-only text
- **WHEN** the input text is empty or contains only whitespace
- **THEN** the system returns an empty array

#### Scenario: Collapse surrounding whitespace
- **WHEN** the input text contains leading, trailing, or repeated separating whitespace
- **THEN** each output part is trimmed and contains no leading or trailing whitespace
