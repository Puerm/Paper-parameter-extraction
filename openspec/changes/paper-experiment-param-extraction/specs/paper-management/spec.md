## ADDED Requirements

### Requirement: Paper list display
The system SHALL display a list of uploaded papers with columns: 文件名, 上传时间, 作者, DOI, 状态, 提取参数数.

#### Scenario: Papers listed
- **WHEN** user navigates to the paper management page
- **THEN** a table is displayed with all accessible papers and the specified columns

### Requirement: Search papers
The system SHALL allow users to search papers by filename, author, or DOI.

#### Scenario: Search by filename
- **WHEN** user enters a keyword in the search box and submits
- **THEN** the paper list is filtered to papers whose filename contains the keyword

#### Scenario: Search by author
- **WHEN** user enters an author name in the search box
- **THEN** the paper list is filtered to papers matching that author

### Requirement: Filter papers
The system SHALL allow users to filter papers by status.

#### Scenario: Filter by status
- **WHEN** user selects a status filter (e.g., "解析成功")
- **THEN** only papers with the selected status are displayed

### Requirement: Sort papers
The system SHALL allow users to sort the paper list by upload time or parameter count.

#### Scenario: Sort by upload time
- **WHEN** user clicks the "上传时间" column header
- **THEN** the paper list is sorted by upload time in ascending or descending order

#### Scenario: Sort by parameter count
- **WHEN** user clicks the "提取参数数" column header
- **THEN** the paper list is sorted by parameter count
