## ADDED Requirements

### Requirement: Audit log recording
The system SHALL record audit log entries containing: who, when, target type, target ID, and what changed.

#### Scenario: Modification logged
- **WHEN** any user modifies a parameter, paper, template, or user record
- **THEN** an audit log entry is created with user ID, timestamp, target type, target ID, and change description

#### Scenario: Deletion logged
- **WHEN** any user deletes a record (template or user)
- **THEN** an audit log entry is created recording the deletion

### Requirement: Audit log query
The system SHALL allow administrators to query audit logs by user, time range, or target type.

#### Scenario: Filter by user
- **WHEN** admin filters audit logs by a specific user
- **THEN** only log entries for that user are displayed

#### Scenario: Filter by time range
- **WHEN** admin specifies a start and end date
- **THEN** only log entries within that time range are displayed

#### Scenario: Filter by target type
- **WHEN** admin filters by target type (e.g., "parameters")
- **THEN** only log entries for that target type are displayed

### Requirement: Audit log display
The system SHALL display audit log entries in a paginated table with columns: 操作者, 时间, 操作类型, 目标, 变更内容.

#### Scenario: Audit log page
- **WHEN** admin navigates to the audit log page
- **THEN** a paginated table of audit log entries is displayed with the specified columns
