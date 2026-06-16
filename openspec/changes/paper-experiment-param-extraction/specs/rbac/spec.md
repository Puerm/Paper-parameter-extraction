## ADDED Requirements

### Requirement: Three-tier role system
The system SHALL support three roles: 普通用户 (normal user), 审核员 (reviewer), 管理员 (admin).

#### Scenario: User has single role
- **WHEN** a user account is created
- **THEN** the user is assigned exactly one of the three roles

### Requirement: Normal user permissions
Normal users SHALL be able to upload papers, view their own papers, and submit reviews. They SHALL NOT be able to delete templates.

#### Scenario: Normal user uploads paper
- **WHEN** a normal user uploads a paper
- **THEN** the upload succeeds

#### Scenario: Normal user views own papers
- **WHEN** a normal user views the paper list
- **THEN** only papers uploaded by that user are displayed

#### Scenario: Normal user cannot delete template
- **WHEN** a normal user attempts to delete a template
- **THEN** the system returns a 403 Forbidden error

### Requirement: Reviewer permissions
Reviewers SHALL be able to review and modify extraction results, and view all papers. They SHALL NOT have template management or user management rights.

#### Scenario: Reviewer views all papers
- **WHEN** a reviewer views the paper list
- **THEN** all papers from all users are displayed

#### Scenario: Reviewer approves parameters
- **WHEN** a reviewer approves extracted parameters
- **THEN** the approval succeeds and parameters enter the library

#### Scenario: Reviewer cannot manage users
- **WHEN** a reviewer attempts to access user management
- **THEN** the system returns a 403 Forbidden error

### Requirement: Admin permissions
Administrators SHALL have full access to all features including template management, user management, and audit logs.

#### Scenario: Admin manages users
- **WHEN** admin accesses user management
- **THEN** admin can create, edit, and disable user accounts

#### Scenario: Admin manages templates
- **WHEN** admin creates, edits, or deletes a template
- **THEN** the operation succeeds

#### Scenario: Admin views audit logs
- **WHEN** admin accesses audit logs
- **THEN** all audit log entries are displayed

### Requirement: Permission enforcement
The system SHALL enforce permissions at the API level via middleware for every protected endpoint.

#### Scenario: Unauthenticated access denied
- **WHEN** an unauthenticated request is made to any protected endpoint
- **THEN** the system returns a 401 Unauthorized error

#### Scenario: Unauthorized access denied
- **WHEN** a user with insufficient permissions accesses a restricted endpoint
- **THEN** the system returns a 403 Forbidden error
