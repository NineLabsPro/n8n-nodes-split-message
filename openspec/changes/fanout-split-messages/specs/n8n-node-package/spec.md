## MODIFIED Requirements

### Requirement: Node output shape
The node SHALL emit one output item per resulting message part (fan-out), so downstream nodes receive the messages already separated without needing an extra split/loop step. The node SHALL NOT wrap the parts in a configurable named field and SHALL NOT emit a separate `count` field.

#### Scenario: Fan-out of parts
- **WHEN** the node executes on an input item whose text splits into N parts
- **THEN** the node emits N output items, each carrying one part's text in a fixed `message` field
- **AND** each output item preserves its origin via `pairedItem` pointing to the source input item

#### Scenario: Empty result emits no items
- **WHEN** the node executes on an input item whose text is empty (zero parts)
- **THEN** the node emits no output items for that input item

#### Scenario: Per-item execution
- **WHEN** multiple input items are passed to the node
- **THEN** the node processes each input item independently and the combined output contains the fan-out items for every input item

#### Scenario: No output field parameter
- **WHEN** a user opens the node parameters
- **THEN** there is no "Nome do Campo de Saída" (`outputField`) parameter, because the part text is always emitted in the fixed `message` field
