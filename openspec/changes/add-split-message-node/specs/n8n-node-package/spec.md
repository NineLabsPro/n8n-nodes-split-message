## ADDED Requirements

### Requirement: Installable n8n community node package
The package SHALL be structured as an n8n community node so it can be published to npm and installed through the n8n "Community Nodes" feature.

#### Scenario: Package declares n8n node metadata
- **WHEN** the package is built
- **THEN** its `package.json` includes an `n8n` section listing the compiled node file under `nodes`, and the keyword `n8n-community-node-package`

#### Scenario: Node is discoverable in the editor
- **WHEN** the package is installed in an n8n instance
- **THEN** a node named "Split Message" appears in the nodes panel with a display name, description, and icon

### Requirement: Node input parameters
The Split Message node SHALL expose parameters for the source text and the maximum message length, plus the oversized-word strategy.

#### Scenario: Configure text and max length
- **WHEN** a user adds the node to a workflow
- **THEN** the node shows a "Text" string parameter (expression-enabled) and a "Max Length" number parameter with a sensible default

#### Scenario: Select oversized-word strategy
- **WHEN** a user opens the node parameters
- **THEN** an option lets the user choose how to handle a single word longer than the limit (hard split vs. keep word), defaulting to hard split

### Requirement: Node output shape
The node SHALL output the resulting message parts as an array for consumption by downstream nodes.

#### Scenario: Output array of parts
- **WHEN** the node executes on an input item with a long text
- **THEN** the node output exposes the parts as an array field (e.g. `parts`) and includes the part count, so downstream nodes can iterate over the messages

#### Scenario: Per-item execution
- **WHEN** multiple input items are passed to the node
- **THEN** the node processes each input item independently and produces output for each
