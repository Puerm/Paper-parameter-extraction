## ADDED Requirements

### Requirement: File format support
The system SHALL support uploading files in PDF, DOCX, and Markdown formats.

#### Scenario: Upload valid PDF file
- **WHEN** user uploads a .pdf file
- **THEN** the file is accepted and parsing begins

#### Scenario: Upload valid DOCX file
- **WHEN** user uploads a .docx file
- **THEN** the file is accepted and parsing begins

#### Scenario: Upload valid Markdown file
- **WHEN** user uploads a .md file
- **THEN** the file is accepted and parsing begins

#### Scenario: Reject unsupported format
- **WHEN** user uploads a file with an unsupported extension
- **THEN** the system rejects the upload with an error message indicating supported formats

### Requirement: Automatic parsing after upload
The system SHALL automatically begin parsing a paper after successful upload.

#### Scenario: Parsing starts automatically
- **WHEN** a file is successfully uploaded
- **THEN** the paper status is set to "待解析" and parsing begins immediately

### Requirement: Paper status lifecycle
The system SHALL track paper processing status through states: 待解析, 解析中, 解析成功, 解析失败.

#### Scenario: Status transitions to parsing
- **WHEN** parsing begins
- **THEN** paper status is updated to "解析中"

#### Scenario: Status transitions to success
- **WHEN** parsing completes successfully
- **THEN** paper status is updated to "解析成功"

#### Scenario: Status transitions to failure
- **WHEN** parsing encounters an unrecoverable error
- **THEN** paper status is updated to "解析失败"

### Requirement: Metadata extraction
The system SHALL automatically extract author and DOI metadata from uploaded papers during parsing.

#### Scenario: Author extracted
- **WHEN** a paper is parsed and author information is found
- **THEN** the author field is populated from the paper content

#### Scenario: DOI extracted
- **WHEN** a paper is parsed and a DOI is found
- **THEN** the DOI field is populated from the paper content

### Requirement: Duplicate filename handling
The system SHALL automatically rename files when a file with the same name already exists.

#### Scenario: First duplicate
- **WHEN** user uploads "paper.pdf" and a file named "paper.pdf" already exists
- **THEN** the new file is saved as "paper(1).pdf"

#### Scenario: Second duplicate
- **WHEN** user uploads "paper.pdf" and both "paper.pdf" and "paper(1).pdf" exist
- **THEN** the new file is saved as "paper(2).pdf"
