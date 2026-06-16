## ADDED Requirements

### Requirement: Side-by-side review interface
The system SHALL display the original paper text on the left and the extracted parameters on the right for manual review.

#### Scenario: Review page layout
- **WHEN** a reviewer opens the review page for an extraction
- **THEN** the original paper text is displayed on the left and extracted parameters on the right

### Requirement: Modify extracted parameters
The system SHALL allow reviewers to modify extracted parameter values during review.

#### Scenario: Edit parameter value
- **WHEN** reviewer edits a parameter value and saves
- **THEN** the new value is stored and a new version record is created

### Requirement: Delete extracted parameters
The system SHALL allow reviewers to delete individual extracted parameters.

#### Scenario: Delete parameter
- **WHEN** reviewer deletes a parameter entry
- **THEN** the parameter is removed from the extraction result

### Requirement: Add new parameters
The system SHALL allow reviewers to add new parameters not captured by the AI.

#### Scenario: Add missing parameter
- **WHEN** reviewer adds a new parameter with key and value
- **THEN** the parameter is added to the extraction result

### Requirement: Submit for approval
The system SHALL allow reviewers to submit reviewed parameters for final approval.

#### Scenario: Submit reviewed parameters
- **WHEN** reviewer clicks "提交审核"
- **THEN** the parameter status changes to "待审核" and the result is queued for final approval

### Requirement: Approve or reject
The system SHALL allow senior reviewers to approve or reject reviewed parameters.

#### Scenario: Approve parameters
- **WHEN** reviewer clicks "审核通过"
- **THEN** the parameters are moved to the parameter library and marked as approved

#### Scenario: Reject parameters
- **WHEN** reviewer clicks "审核拒绝"
- **THEN** the parameters are returned to extraction state with rejection reason

### Requirement: Concurrent edit conflict detection
The system SHALL detect when two reviewers edit the same parameters simultaneously and prompt the later user to refresh.

#### Scenario: Conflict detected
- **WHEN** a reviewer tries to save changes to parameters that have been modified by another reviewer since loading
- **THEN** the system rejects the save and prompts the user to refresh with the latest version
