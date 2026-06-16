## ADDED Requirements

### Requirement: Template-based extraction
The system SHALL allow users to select a paper and a template, then invoke AI to extract parameters matching the template schema.

#### Scenario: Successful extraction
- **WHEN** user selects a parsed paper and a template, then clicks "开始提取"
- **THEN** the system sends the paper text and template YAML to the LLM and returns a JSON object with extracted parameter values

#### Scenario: Extraction with no paper selected
- **WHEN** user clicks "开始提取" without selecting a paper
- **THEN** the system prompts the user to select a paper

#### Scenario: Extraction with no template selected
- **WHEN** user clicks "开始提取" without selecting a template
- **THEN** the system prompts the user to select a template

### Requirement: JSON validation and retry
The system SHALL validate that the AI response is valid JSON and matches the template schema. If the response is invalid, the system SHALL retry up to 3 times.

#### Scenario: Valid JSON on first attempt
- **WHEN** the LLM returns valid JSON matching the template schema
- **THEN** the extraction is marked as successful

#### Scenario: Invalid JSON triggers retry
- **WHEN** the LLM returns malformed JSON
- **THEN** the system retries the extraction, sending the error to the LLM for correction

#### Scenario: Maximum retries exceeded
- **WHEN** the LLM returns invalid JSON for 3 consecutive attempts
- **THEN** the extraction is marked as failed and the user is notified

#### Scenario: Valid JSON but missing fields
- **WHEN** the LLM returns valid JSON that is missing required template fields
- **THEN** the system retries with guidance about the missing fields

### Requirement: Extraction status tracking
The system SHALL update the paper status and display progress during extraction.

#### Scenario: Extraction in progress
- **WHEN** an extraction is running
- **THEN** the UI shows an in-progress indicator and the paper status reflects the extraction state
