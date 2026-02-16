# Implementation Plan: Fix Batch Delivery Persistence

## Overview

This implementation plan fixes the critical data loss issue in batch delivery date operations. The solution implements partial persistence (saving valid records even when some fail), detailed error reporting, and frontend validation. The work is organized into logical phases: backend service refactoring, validator improvements, frontend validation, error display components, and comprehensive testing.

## Tasks

- [x] 1. Refactor Backend Service for Partial Persistence
  - [x] 1.1 Modify saveDeliveryDatesBatch to separate validation from persistence
    - Collect all validation errors without stopping at first error
    - Separate records into valid and invalid groups
    - Execute single transaction only for valid records
    - Return comprehensive response with success/failure details
    - _Requirements: 1.1, 1.2, 1.3, 1.6, 8.1, 8.2, 8.3_
  
  - [ ]* 1.2 Write property test for partial persistence invariant
    - **Property 1: Partial Persistence Invariant**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.6**
  
  - [x] 1.3 Implement new response format with saved and errors arrays
    - Create BatchOperationResponse interface
    - Include summary with total, saved, failed counts
    - Include detailed error information for each failed record
    - _Requirements: 1.4, 2.1, 2.2_
  
  - [ ]* 1.4 Write property test for error reporting completeness
    - **Property 2: Error Reporting Completeness**
    - **Validates: Requirements 2.1, 2.2, 2.7**

- [x] 2. Enhance Validator with Better Error Messages
  - [x] 2.1 Update deliveryDatesValidator to provide specific error messages
    - Add error message for non-existent confeccionista with ID value
    - Add error message for non-existent reference with ID value
    - Add error message for missing required fields
    - Add error message for invalid date formats
    - _Requirements: 2.3, 2.4, 2.5, 2.6_
  
  - [x] 2.2 Implement duplicate detection logic
    - Create function to detect duplicate records in batch
    - Compare confeccionistaId, referenceId, and sendDate
    - Return specific error message for duplicates
    - _Requirements: 7.1, 7.2, 7.3_
  
  - [ ]* 2.3 Write property test for foreign key validation
    - **Property 5: Foreign Key Validation Accuracy**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**
  
  - [ ]* 2.4 Write property test for duplicate detection
    - **Property 6: Duplicate Detection and Handling**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4**

- [x] 3. Implement Frontend Validation Layer
  - [x] 3.1 Create DeliveryDateValidator utility
    - Implement validateField() for individual field validation
    - Implement validateRecord() for single record validation
    - Implement validateBatch() for batch validation
    - Support all field types: text, number, date
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [x] 3.2 Update DeliveryDatesView to use frontend validation
    - Add validation state management
    - Validate on field change (real-time)
    - Validate on save (full batch validation)
    - Prevent submission if validation fails
    - _Requirements: 3.5, 3.6, 3.7_
  
  - [ ]* 3.3 Write property test for frontend validation
    - **Property 4: Frontend Validation Prevents Invalid Submission**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7**

- [ ] 4. Create Error Display Components
  - [ ] 4.1 Create BatchOperationResult component
    - Display summary of saved/failed records
    - Show detailed error list with record indices
    - Display error reasons for each failed record
    - Provide visual distinction between success and failure
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  
  - [ ] 4.2 Add inline error display in table rows
    - Show error indicators for invalid fields
    - Display error messages below fields
    - Clear errors when field is corrected
    - _Requirements: 3.2, 3.3, 3.4_
  
  - [ ]* 4.3 Write property test for batch result display
    - **Property 8: Batch Result Display Accuracy**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6**

- [ ] 5. Implement Retry Logic
  - [ ] 5.1 Add retry functionality to BatchOperationResult
    - Allow editing of failed records
    - Clear error indicators when record is edited
    - Provide retry button to resubmit corrected records
    - _Requirements: 10.1, 10.2, 10.3_
  
  - [ ] 5.2 Update handleSave to support retry batches
    - Detect if batch contains previously failed records
    - Process retry batch with same partial persistence logic
    - Update UI with new results
    - _Requirements: 10.4, 10.5_
  
  - [ ]* 5.3 Write property test for retry idempotence
    - **Property 9: Retry Idempotence**
    - **Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5**

- [ ] 6. Implement Data Persistence Verification
  - [ ] 6.1 Ensure saved records persist in database
    - Verify created_at and created_by are set correctly
    - Verify all fields are stored with correct values
    - _Requirements: 4.1, 4.3, 4.4, 4.5_
  
  - [ ] 6.2 Implement page reload verification
    - Fetch records after save
    - Verify records are retrievable after page reload
    - _Requirements: 4.2_
  
  - [ ]* 6.3 Write property test for data persistence round trip
    - **Property 3: Data Persistence Round Trip**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**

- [ ] 7. Implement Transaction Consistency
  - [ ] 7.1 Ensure valid records are committed atomically
    - All valid records in batch committed together
    - Invalid records do not affect transaction
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [ ] 7.2 Add error handling for database failures
    - Rollback only failed transaction, not entire batch
    - Log errors with timestamp and user identifier
    - _Requirements: 8.4, 8.5, 8.6_
  
  - [ ]* 7.3 Write property test for transaction consistency
    - **Property 7: Transaction Consistency and Atomicity**
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 8.6**

- [x] 8. Checkpoint - Verify Core Functionality
  - Ensure all backend changes work correctly
  - Ensure frontend validation prevents invalid submissions
  - Ensure partial persistence saves valid records
  - Ensure error reporting is accurate
  - Ask the user if questions arise

- [ ] 9. Implement File Upload Support (Optional)
  - [ ] 9.1 Create file upload component
    - Accept CSV and Excel files
    - Parse file and extract delivery date records
    - Validate file format and column headers
    - _Requirements: 9.1, 9.2, 9.3_
  
  - [ ] 9.2 Integrate file upload with batch persistence
    - Use same batch persistence logic for uploaded records
    - Report invalid rows with reasons
    - Populate table with valid records
    - _Requirements: 9.4, 9.5, 9.6_
  
  - [ ]* 9.3 Write property test for file upload batch processing
    - **Property 10: File Upload Batch Processing**
    - **Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5, 9.6**

- [ ] 10. Final Checkpoint - Ensure All Tests Pass
  - Ensure all property tests pass (100+ iterations each)
  - Ensure all unit tests pass
  - Ensure no regressions in existing functionality
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Checkpoints ensure incremental validation
- The core fix (partial persistence) is in tasks 1-2
- Frontend improvements are in tasks 3-5
- Verification and testing are in tasks 6-10
