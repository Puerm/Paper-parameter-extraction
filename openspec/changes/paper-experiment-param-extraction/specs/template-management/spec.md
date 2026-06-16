## ADDED Requirements

### Requirement: Create template
The system SHALL allow administrators to create parameter templates with a name and YAML definition.

#### Scenario: Create valid template
- **WHEN** admin provides a template name and valid YAML definition
- **THEN** the template is created and available for use

#### Scenario: Create template with invalid YAML
- **WHEN** admin provides an invalid YAML definition
- **THEN** the system rejects the template with a validation error

### Requirement: Edit template
The system SHALL allow administrators to edit an existing template's name and YAML definition.

#### Scenario: Edit template
- **WHEN** admin modifies a template's name or YAML
- **THEN** the template is updated with the new values

### Requirement: Delete template
The system SHALL allow administrators to delete templates that are not referenced by any paper.

#### Scenario: Delete unreferenced template
- **WHEN** admin attempts to delete a template not referenced by any paper
- **THEN** the template is deleted

#### Scenario: Delete referenced template
- **WHEN** admin attempts to delete a template that is referenced by existing papers
- **THEN** the system rejects the deletion with a message indicating the template is in use

### Requirement: Clone template
The system SHALL allow administrators to clone an existing template as a starting point for a new template.

#### Scenario: Clone template
- **WHEN** admin clones an existing template
- **THEN** a new template is created with the same YAML definition and a name indicating it is a copy

### Requirement: List templates
The system SHALL display all available templates with their names and creation time.

#### Scenario: View template list
- **WHEN** user navigates to the template management page
- **THEN** all templates are listed with name, creation time, and available actions
