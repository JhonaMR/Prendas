# Design Document: Fix Batch Delivery Persistence

## Overview

The current batch delivery dates system fails catastrophically when any validation error occurs in a single record, rolling back the entire transaction and losing all data. This design implements a robust partial persistence system that saves valid records while providing detailed error reporting for invalid ones. The solution includes frontend validation to catch errors early, improved error messages, and a transaction strategy that preserves valid data.

## Architecture

### Backend Architecture Changes

#### Current Problem
- `saveDeliveryDatesBatch()` validates all records
- If ANY record fails validation, it executes `ROLLBACK` on the entire transaction
- All valid records are lost along with invalid ones
- Error reporting is minimal

#### New Approach: Partial Persistence Strategy

**Transaction Strategy**:
1. Validate each record independently
2. Separate records into valid and invalid groups
3. Save valid records in a single atomic transaction
4. Return detailed error information for invalid records
5. Never rollback valid records due to invalid ones

**Service Layer Changes** (`deliveryDatesService.js`):
- Modify `saveDeliveryDatesBatch()` to implement partial persistence
- Collect validation errors without stopping processing
- Execute single transaction only for valid records
- Return comprehensive response with success and failure details

**Validator Layer Changes** (`deliveryDatesValidator.js`):
- Enhance error messages with specific field information
- Add duplicate detection logic
- Improve foreign key validation error messages
- Add record index tracking for error reporting

#### New Response Format
```javascript
{
  success: true,
  summary: {
    total: 12,
    saved: 10,
    failed: 2
  },
  saved: [
    { id: "uuid1", confeccionistaId: "conf1", ... },
    { id: "uuid2", confeccionistaId: "conf2", ... }
  ],
  errors: [
    {
      index: 3,
      record: { confeccionistaId: "invalid", ... },
      errors: {
        confeccionistaId: "Confeccionista not found: invalid",
        referenceId: "Reference not found: REF999"
      }
    },
    {
      index: 7,
      record: { quantity: -5, ... },
      errors: {
        quantity: "Quantity must be greater than 0"
      }
    }
  ]
}
```

### Frontend Architecture Changes

#### Validation Layer
**New Component**: `DeliveryDateValidator.ts`
- Real-time field validation
- Batch validation before submission
- Error state management
- Visual error indicators

**Validation Rules**:
- Required fields: confeccionistaId, referenceId, quantity, sendDate, expectedDate
- Date format: YYYY-MM-DD
- Quantity: positive integer
- Dates: valid ISO dates with sendDate ≤ expectedDate

#### Error Display Component
**New Component**: `BatchOperationResult.tsx`
- Shows summary of saved/failed records
- Displays detailed error list
- Allows editing failed records
- Provides retry functionality

#### Updated DeliveryDatesView
- Add frontend validation before submission
- Display validation errors inline
- Show batch operation results
- Allow retry of failed records
- Prevent submission of invalid data

### Data Flow

#### Save Flow (New)
1. User clicks Save button
2. Frontend validates all changed records
3. If validation fails:
   - Display inline errors
   - Prevent submission
   - Allow user to correct
4. If validation passes:
   - Send batch to backend
5. Backend validates each record independently
6. Backend saves valid records in transaction
7. Backend returns detailed response
8. Frontend displays results:
   - Success message with count
   - Error list with details
   - Option to retry failed records
9. User can edit failed records and retry

#### Retry Flow
1. User sees failed records with errors
2. User edits failed records to correct errors
3. User clicks Retry
4. Frontend validates corrected records
5. Backend processes retry batch
6. Results updated in UI

## Components and Interfaces

### Backend Components

#### DeliveryDatesService
```javascript
saveDeliveryDatesBatch(dates, userId) -> {
  success: boolean,
  summary: { total, saved, failed },
  saved: DeliveryDate[],
  errors: ValidationError[]
}
```

**Key Changes**:
- Separate validation from persistence
- Collect all errors before transaction
- Execute single transaction for valid records
- Return comprehensive response

#### DeliveryDatesValidator
```javascript
validateDeliveryDate(data) -> {
  isValid: boolean,
  errors: { [field]: string }
}

validateBatch(dates) -> {
  valid: DeliveryDate[],
  invalid: { index, record, errors }[]
}

detectDuplicates(dates) -> {
  duplicates: { index, reason }[]
}
```

### Frontend Components

#### DeliveryDateValidator
```typescript
validateField(field: string, value: any) -> {
  isValid: boolean,
  error?: string
}

validateRecord(record: DeliveryDate) -> {
  isValid: boolean,
  errors: { [field]: string }
}

validateBatch(records: DeliveryDate[]) -> {
  isValid: boolean,
  errors: { [index]: { [field]: string } }
}
```

#### BatchOperationResult
```typescript
interface BatchResult {
  success: boolean,
  summary: { total, saved, failed },
  saved: DeliveryDate[],
  errors: {
    index: number,
    record: DeliveryDate,
    errors: { [field]: string }
  }[]
}

<BatchOperationResult result={result} onRetry={handleRetry} />
```

#### Updated DeliveryDatesView
- Add validation state management
- Add error display for each field
- Add batch result display
- Add retry functionality
- Prevent submission of invalid data

## Data Models

### DeliveryDate (unchanged)
```typescript
interface DeliveryDate {
  id: string,
  confeccionistaId: string,
  referenceId: string,
  quantity: number,
  sendDate: string,
  expectedDate: string,
  deliveryDate: string | null,
  process: string,
  observation: string,
  createdAt: string,
  createdBy: string
}
```

### ValidationError
```typescript
interface ValidationError {
  index: number,
  record: DeliveryDate,
  errors: {
    [field: string]: string
  }
}
```

### BatchOperationResponse
```typescript
interface BatchOperationResponse {
  success: boolean,
  summary: {
    total: number,
    saved: number,
    failed: number
  },
  saved: DeliveryDate[],
  errors: ValidationError[]
}
```

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Partial Persistence Invariant
**Validates: Requirements 1.1, 1.2, 1.3, 1.6**

*For any* batch of delivery date records where some are valid and some are invalid, after the batch operation completes, exactly the valid records must be persisted in the database. Specifically: if a batch contains N records where V are valid and I are invalid, then exactly V records must exist in the database after the operation, and the response must report exactly I errors with no valid records lost.

### Property 2: Error Reporting Completeness
**Validates: Requirements 2.1, 2.2, 2.7**

*For any* batch operation that results in validation errors, the response must contain an error entry for each invalid record with the correct index and specific error messages for each invalid field. The number of errors in the response must equal the number of invalid records, with no errors lost or duplicated.

### Property 3: Data Persistence Round Trip
**Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**

*For any* delivery date record that is successfully saved in a batch operation, querying the database immediately after must return the same record with identical field values. Reloading the page must retrieve the same records from the database with all fields intact.

### Property 4: Frontend Validation Prevents Invalid Submission
**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7**

*For any* batch of records where at least one record fails frontend validation, the API call must not be made and error messages must be displayed for all invalid fields. When all records pass validation, the API call must be made.

### Property 5: Foreign Key Validation Accuracy
**Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6**

*For any* record submitted with a confeccionistaId or referenceId, if that ID does not exist in the corresponding table, the record must be rejected with a specific error message. If the ID exists, the record must not be rejected for that reason.

### Property 6: Duplicate Detection and Handling
**Validates: Requirements 7.1, 7.2, 7.3, 7.4**

*For any* batch containing duplicate records (same confeccionistaId, referenceId, and sendDate), only the first occurrence must be saved, and subsequent duplicates must be rejected. Records that match existing database records must be treated as updates, not duplicates.

### Property 7: Transaction Consistency and Atomicity
**Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 8.6**

*For any* batch operation, if all records are valid, they must all be committed in a single atomic transaction. If some records are invalid, valid records must still be committed atomically, and invalid records must not affect the transaction. Database consistency must be maintained in all cases.

### Property 8: Batch Result Display Accuracy
**Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6**

*For any* batch operation result, the UI must display a summary showing the number of records saved and failed. For operations with failures, the UI must display a detailed list of failed records with their error reasons. Saved records must remain in the table after the result message is dismissed.

### Property 9: Retry Idempotence
**Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5**

*For any* failed record that is corrected and retried, if the corrected record is now valid, it must be saved successfully. Retrying the same corrected record multiple times must result in the same outcome (either success or the same error if still invalid).

### Property 10: File Upload Batch Processing
**Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5, 9.6**

*For any* CSV or Excel file uploaded with delivery date records, the file must be parsed correctly, invalid rows must be identified and reported, and valid rows must be saved using the same batch persistence logic as manual entry. The number of saved records must equal the number of valid rows in the file.

## Error Handling

### Backend Error Handling

**Validation Errors**:
- Collect all validation errors for each record
- Return detailed error response with index and field-specific messages
- Never throw exception for validation errors
- Always return 200 OK with error details in response body

**Database Errors**:
- If database error occurs during transaction, rollback only that transaction
- Log error with timestamp and details
- Return 500 error with generic message
- Do not expose database internals to client

**Foreign Key Errors**:
- Check foreign keys before attempting insert
- Return specific error message with invalid ID value
- Do not attempt insert if foreign key validation fails

### Frontend Error Handling

**Validation Errors**:
- Display inline error messages below each field
- Highlight invalid fields with red border
- Disable submit button if any field is invalid
- Show summary of all errors

**Network Errors**:
- Display alert with connection error message
- Allow user to retry
- Preserve unsaved changes

**Batch Operation Errors**:
- Display summary of saved and failed records
- Show detailed error list for each failed record
- Allow user to edit failed records
- Provide retry button

## Testing Strategy

### Unit Tests

**Backend Service Tests**:
- Test partial persistence with mixed valid/invalid records
- Test error message generation for each validation type
- Test foreign key validation
- Test duplicate detection
- Test transaction rollback on database error
- Test response format correctness

**Frontend Validation Tests**:
- Test field validation for each field type
- Test batch validation with mixed valid/invalid records
- Test error message display
- Test submit button disable/enable logic

**Component Tests**:
- Test BatchOperationResult display
- Test retry functionality
- Test error list rendering

### Property-Based Tests

**Property 1: Partial Persistence**
- Generate random batches with 50% valid, 50% invalid records
- Verify exactly the valid records are saved
- Verify error count matches invalid record count
- Run 100+ iterations with varying batch sizes

**Property 2: Error Reporting**
- Generate random invalid records with various error types
- Verify each error is reported with correct index and field
- Verify no errors are lost or duplicated
- Run 100+ iterations

**Property 3: Data Persistence Round Trip**
- Generate random valid records
- Save them in batch
- Query database immediately
- Verify all fields match
- Reload page and verify again
- Run 100+ iterations

**Property 4: Frontend Validation**
- Generate random records with various invalid fields
- Verify submit is prevented
- Verify error messages appear
- Correct one field at a time
- Verify submit becomes enabled when all valid
- Run 100+ iterations

**Property 5: Foreign Key Validation**
- Generate records with random confeccionistaId/referenceId
- Verify invalid IDs are rejected
- Verify valid IDs are accepted
- Run 100+ iterations with known valid/invalid IDs

**Property 6: Duplicate Detection**
- Generate batches with duplicate records
- Verify only first occurrence is saved
- Verify duplicates are rejected with correct message
- Run 100+ iterations

**Property 7: Transaction Consistency**
- Generate batches with all valid records
- Verify all are committed atomically
- Generate batches with mixed valid/invalid
- Verify valid records are committed despite invalid ones
- Run 100+ iterations

**Property 8: Retry Idempotence**
- Generate failed records
- Correct them
- Retry multiple times
- Verify same outcome each time
- Run 100+ iterations

## Security Considerations

- Input validation on both frontend and backend
- SQL injection prevention through parameterized queries
- Role-based access control (admin only for modifications)
- Error messages do not expose database internals
- Transaction isolation prevents race conditions
- Audit logging of all batch operations

## Performance Considerations

- Batch operations processed in single transaction for valid records
- Validation errors collected without database queries
- Foreign key validation uses indexed lookups
- Response includes only necessary data
- Frontend validation prevents unnecessary server requests
- Duplicate detection uses efficient set-based comparison

