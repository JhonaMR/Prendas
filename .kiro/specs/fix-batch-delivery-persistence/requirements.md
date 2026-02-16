# Requirements Document: Fix Batch Delivery Persistence

## Introduction

The batch delivery dates loading system currently fails to persist data when any validation error occurs in a single record. When an administrator uploads 12 delivery date records, if one record has invalid data (non-existent confeccionista or reference), the entire batch is rolled back and all records are lost. This critical issue prevents administrators from loading delivery data and causes data loss. This specification addresses the root cause by implementing partial batch persistence, clear error reporting, and frontend validation.

## Glossary

- **Batch Operation**: A single API request containing multiple delivery date records to be saved
- **Partial Persistence**: Saving valid records while rejecting invalid ones, rather than all-or-nothing
- **Validation Error**: A record that fails validation due to missing, invalid, or non-existent data
- **Rollback**: Database transaction rollback that discards all changes
- **Confeccionista**: A manufacturer or production entity
- **Reference**: A product reference or SKU identifier
- **Delivery Date Record**: A single row of delivery date data with all required fields
- **Error Report**: Detailed feedback about which records failed and why
- **Frontend Validation**: Pre-submission validation of data before sending to backend
- **Transactional Integrity**: Ensuring database consistency while allowing partial success

## Requirements

### Requirement 1: Implement Partial Batch Persistence

**User Story:** As an administrator, I want to upload multiple delivery date records and have valid records saved even if some records have errors, so that I don't lose all data when one record is invalid.

#### Acceptance Criteria

1. WHEN an administrator submits a batch of delivery date records, THE System SHALL validate each record independently
2. WHEN a batch contains both valid and invalid records, THE System SHALL save all valid records to the database
3. WHEN a batch contains both valid and invalid records, THE System SHALL NOT rollback valid records due to invalid ones
4. WHEN a batch operation completes, THE System SHALL return a response indicating which records succeeded and which failed
5. WHEN all records in a batch are valid, THE System SHALL save all records in a single transaction
6. WHEN some records in a batch are invalid, THE System SHALL save valid records and report errors for invalid ones

### Requirement 2: Provide Detailed Error Reporting for Failed Records

**User Story:** As an administrator, I want to know exactly which records failed and why, so that I can correct the data and retry.

#### Acceptance Criteria

1. WHEN a record fails validation, THE System SHALL return the record index or identifier in the error response
2. WHEN a record fails validation, THE System SHALL return a specific error message describing what is invalid
3. WHEN a record fails due to non-existent confeccionista, THE System SHALL return error message "Confeccionista not found: [value]"
4. WHEN a record fails due to non-existent reference, THE System SHALL return error message "Reference not found: [value]"
5. WHEN a record fails due to missing required field, THE System SHALL return error message "Missing required field: [field_name]"
6. WHEN a record fails due to invalid date format, THE System SHALL return error message "Invalid date format for [field_name]: [value]"
7. WHEN a batch operation completes, THE System SHALL display all error messages to the administrator in the UI

### Requirement 3: Validate Data on Frontend Before Submission

**User Story:** As an administrator, I want the system to validate data before sending to the backend, so that I can catch errors immediately without waiting for server response.

#### Acceptance Criteria

1. WHEN an administrator adds or edits a delivery date record in the table, THE System SHALL validate required fields in real-time
2. WHEN a required field is empty, THE System SHALL display a visual indicator (red border or error message) on that field
3. WHEN a date field contains an invalid date, THE System SHALL display an error message below the field
4. WHEN a quantity field contains a non-positive number, THE System SHALL display an error message
5. WHEN the administrator clicks save, THE System SHALL perform full validation before sending to backend
6. WHEN validation fails on the frontend, THE System SHALL prevent submission and display all errors
7. WHEN all frontend validation passes, THE System SHALL send the batch to the backend

### Requirement 4: Ensure Data Persistence After Successful Save

**User Story:** As an administrator, I want to verify that saved delivery date records persist in the database, so that I can trust the system to store my data.

#### Acceptance Criteria

1. WHEN a delivery date record is successfully saved, THE System SHALL persist it in the delivery_dates table
2. WHEN the page is reloaded after a successful save, THE System SHALL retrieve and display the same records
3. WHEN multiple records are saved in a batch, THE System SHALL persist all of them with the same created_at timestamp
4. WHEN a record is saved, THE System SHALL set the created_by field to the current user identifier
5. WHEN a record is saved, THE System SHALL NOT modify created_at or created_by on subsequent updates

### Requirement 5: Handle Confeccionista and Reference Validation

**User Story:** As an administrator, I want the system to validate that confeccionista and reference values exist before saving, so that I don't create orphaned records.

#### Acceptance Criteria

1. WHEN a record is submitted with a confeccionista_id, THE System SHALL verify that the confeccionista exists in the database
2. WHEN a record is submitted with a reference_id, THE System SHALL verify that the reference exists in the database
3. WHEN a confeccionista does not exist, THE System SHALL reject the record and return a specific error
4. WHEN a reference does not exist, THE System SHALL reject the record and return a specific error
5. WHEN the frontend displays the confeccionista autocomplete, THE System SHALL only show existing confeccionistas
6. WHEN the frontend displays the reference autocomplete, THE System SHALL only show existing references

### Requirement 6: Provide Clear User Feedback on Batch Operation Results

**User Story:** As an administrator, I want to see a clear summary of what was saved and what failed, so that I understand the outcome of my batch operation.

#### Acceptance Criteria

1. WHEN a batch operation completes, THE System SHALL display a summary message showing number of records saved
2. WHEN a batch operation has failures, THE System SHALL display a summary message showing number of records failed
3. WHEN a batch operation completes, THE System SHALL display a detailed list of failed records with reasons
4. WHEN a batch operation is successful, THE System SHALL display a success message and refresh the table
5. WHEN a batch operation has partial failures, THE System SHALL display both success and failure information
6. WHEN the user dismisses the result message, THE System SHALL keep the table updated with saved records

### Requirement 7: Prevent Duplicate Records in Batch Operations

**User Story:** As an administrator, I want to ensure that duplicate records are not created when I upload a batch, so that my data remains clean.

#### Acceptance Criteria

1. WHEN a batch contains duplicate records (same confeccionista, reference, and send_date), THE System SHALL identify the duplicates
2. WHEN duplicates are detected, THE System SHALL keep the first occurrence and reject subsequent duplicates
3. WHEN a duplicate is rejected, THE System SHALL return error message "Duplicate record: [confeccionista] - [reference] - [send_date]"
4. WHEN a record matches an existing record in the database, THE System SHALL treat it as an update, not a duplicate

### Requirement 8: Maintain Transaction Consistency for Valid Records

**User Story:** As a system administrator, I want the database to remain consistent even when batch operations fail, so that data integrity is never compromised.

#### Acceptance Criteria

1. WHEN a batch operation begins, THE System SHALL start a database transaction
2. WHEN all records in a batch are valid, THE System SHALL commit the transaction atomically
3. WHEN some records are invalid, THE System SHALL save valid records and commit the transaction
4. WHEN a database error occurs during save, THE System SHALL rollback only the failed record, not the entire batch
5. WHEN a transaction completes, THE System SHALL log the operation with timestamp and user identifier
6. WHEN a transaction fails, THE System SHALL log the error with details for debugging

### Requirement 9: Support Batch Upload from File

**User Story:** As an administrator, I want to upload delivery date records from a CSV or Excel file, so that I can load large batches efficiently.

#### Acceptance Criteria

1. WHEN an administrator clicks the upload button, THE System SHALL open a file picker dialog
2. WHEN a CSV or Excel file is selected, THE System SHALL parse the file and extract delivery date records
3. WHEN the file is parsed, THE System SHALL validate the file format and column headers
4. WHEN the file contains invalid rows, THE System SHALL skip invalid rows and report which rows failed
5. WHEN the file is successfully parsed, THE System SHALL populate the table with the records
6. WHEN the administrator clicks save, THE System SHALL save all records using the batch persistence logic

### Requirement 10: Implement Retry Logic for Failed Records

**User Story:** As an administrator, I want to retry saving failed records after correcting the data, so that I can complete the batch operation.

#### Acceptance Criteria

1. WHEN a batch operation has failures, THE System SHALL allow the administrator to edit the failed records
2. WHEN the administrator corrects a failed record, THE System SHALL clear the error indicator
3. WHEN the administrator clicks save again, THE System SHALL retry saving the corrected records
4. WHEN a retry is successful, THE System SHALL remove the record from the failed list and add it to the saved list
5. WHEN a retry fails, THE System SHALL update the error message with the new failure reason

