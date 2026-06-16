## ADDED Requirements

### Requirement: Natural language query
The system SHALL allow users to query the parameter library using natural language and return matching results.

#### Scenario: Simple query
- **WHEN** user types "所有催化剂实验中温度超过100℃的实验" and submits
- **THEN** the system uses AI to parse the query, queries the parameter library, and returns matching experiments

#### Scenario: Multi-condition query
- **WHEN** user types "近三年所有催化剂实验中温度超过100℃且收率大于90%的有哪些"
- **THEN** the system parses multiple conditions (time range, experiment type, temperature threshold, yield threshold) and returns filtered results

#### Scenario: Query with no results
- **WHEN** user submits a natural language query that matches no parameters
- **THEN** the system responds with "未找到匹配结果" and suggests broadening the query

### Requirement: Query result display
The system SHALL display natural language query results in a structured table format with source paper references.

#### Scenario: Results displayed with source
- **WHEN** a natural language query returns results
- **THEN** each result row includes parameter values and a link to the source paper

### Requirement: Query history
The system SHALL save recent natural language queries for the user.

#### Scenario: Recent queries listed
- **WHEN** user opens the AI Q&A page
- **THEN** recent queries are displayed for quick re-submission
