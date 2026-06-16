## ADDED Requirements

### Requirement: Summary statistics
The system SHALL display summary statistics on the dashboard: 论文总数, 模板总数, 参数总数, 成功率.

#### Scenario: Dashboard loads with stats
- **WHEN** user navigates to the dashboard
- **THEN** the four summary statistic cards are displayed with current values

### Requirement: Upload trend chart
The system SHALL display a chart showing paper upload trends over time.

#### Scenario: Upload trend displayed
- **WHEN** user views the dashboard
- **THEN** a line or bar chart shows the number of paper uploads per time period

### Requirement: Extraction success rate chart
The system SHALL display a chart showing AI parameter extraction success rate over time.

#### Scenario: Success rate chart displayed
- **WHEN** user views the dashboard
- **THEN** a chart shows the percentage of successful AI extractions over time

### Requirement: Template usage ranking
The system SHALL display a chart ranking templates by usage frequency.

#### Scenario: Template ranking displayed
- **WHEN** user views the dashboard
- **THEN** a bar chart shows templates ranked by how many papers have used each
