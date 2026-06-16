## ADDED Requirements

### Requirement: Version creation on modification
The system SHALL automatically create a new version record each time parameters are modified.

#### Scenario: First modification creates Version 2
- **WHEN** parameters are modified for the first time after extraction
- **THEN** the original extraction is saved as Version 1 and the new values as Version 2

#### Scenario: Sequential versioning
- **WHEN** parameters are modified multiple times
- **THEN** each modification creates a new sequentially numbered version

### Requirement: Version list display
The system SHALL display all versions of a parameter set with version number, timestamp, and modifier.

#### Scenario: View version history
- **WHEN** user opens version history for a parameter set
- **THEN** all versions are listed with version number, creation time, and modifier username

### Requirement: Version diff comparison
The system SHALL support side-by-side diff comparison between any two versions, similar to Git Diff.

#### Scenario: Compare two versions
- **WHEN** user selects two versions and clicks "对比"
- **THEN** the differences between the two JSON payloads are highlighted in a diff view

#### Scenario: Compare with previous version
- **WHEN** user clicks "查看差异" on a version
- **THEN** the system shows the diff between that version and its immediate predecessor

### Requirement: View specific version content
The system SHALL allow users to view the full JSON content of any specific version.

#### Scenario: View version detail
- **WHEN** user clicks on a specific version
- **THEN** the full JSON parameter content of that version is displayed
