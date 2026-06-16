## ADDED Requirements

### Requirement: Parameter library storage
The system SHALL store all approved parameters in a searchable parameter library.

#### Scenario: Parameter enters library on approval
- **WHEN** parameters are approved during review
- **THEN** the parameters are automatically added to the parameter library

### Requirement: Search parameter library
The system SHALL allow users to search the parameter library by parameter key, value, paper title, or template name.

#### Scenario: Search by parameter key
- **WHEN** user searches for "Temperature" in the parameter library
- **THEN** all parameters with "Temperature" as a key are returned

#### Scenario: Search by value
- **WHEN** user searches for "80°C" in the parameter library
- **THEN** all parameters with values containing "80°C" are returned

### Requirement: Tag management
The system SHALL allow users to add tags to parameters for categorization.

#### Scenario: Add tag to parameter
- **WHEN** user adds a tag to a parameter entry
- **THEN** the tag is saved and the parameter can be filtered by that tag

#### Scenario: Filter by tag
- **WHEN** user filters the library by a specific tag
- **THEN** only parameters with that tag are displayed

### Requirement: Export to Excel
The system SHALL allow users to export parameter library data to Excel (.xlsx) format.

#### Scenario: Export all to Excel
- **WHEN** user clicks "导出Excel" with no filters active
- **THEN** an .xlsx file containing all library parameters is downloaded

#### Scenario: Export filtered to Excel
- **WHEN** user applies filters then clicks "导出Excel"
- **THEN** the exported .xlsx file contains only the filtered results

### Requirement: Export to CSV
The system SHALL allow users to export parameter library data to CSV format.

#### Scenario: Export to CSV
- **WHEN** user clicks "导出CSV"
- **THEN** a .csv file containing the current view's parameters is downloaded

### Requirement: Archive instead of delete
The system SHALL prevent direct deletion of approved parameters and support archiving instead.

#### Scenario: Delete approved parameter blocked
- **WHEN** user attempts to directly delete an approved parameter
- **THEN** the system rejects the deletion and offers the archive option

#### Scenario: Archive parameter
- **WHEN** user archives a parameter
- **THEN** the parameter is marked as archived and hidden from default views but retained in the database
