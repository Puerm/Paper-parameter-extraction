## ADDED Requirements

### Requirement: Event-driven notifications
The system SHALL generate notifications for the following events: 解析完成, 提取完成, 审核通过, 审核拒绝.

#### Scenario: Notification on parsing complete
- **WHEN** a paper finishes parsing (success or failure)
- **THEN** a notification is created for the uploader with the result

#### Scenario: Notification on extraction complete
- **WHEN** AI parameter extraction completes
- **THEN** a notification is created for the requester

#### Scenario: Notification on review approval
- **WHEN** a reviewer approves parameters
- **THEN** a notification is created for the original submitter

#### Scenario: Notification on review rejection
- **WHEN** a reviewer rejects parameters
- **THEN** a notification is created for the original submitter with the rejection reason

### Requirement: Unread count
The system SHALL display an unread notification count badge.

#### Scenario: Unread count updates
- **WHEN** a new notification is generated
- **THEN** the unread count badge increments

#### Scenario: Unread count resets
- **WHEN** user opens the notification center
- **THEN** all displayed notifications are marked as read and the badge resets

### Requirement: Notification center page
The system SHALL provide a notification center page listing all notifications in reverse chronological order.

#### Scenario: View all notifications
- **WHEN** user opens the notification center
- **THEN** all notifications are displayed with type, message, timestamp, and read status, most recent first
