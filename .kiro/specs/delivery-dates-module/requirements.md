# Requirements Document: Delivery Dates Module

## Introduction

The Delivery Dates Module is a comprehensive system for managing and tracking delivery schedules for manufacturing batches. It enables confeccionistas (manufacturers) to record, monitor, and analyze delivery timelines, including expected delivery dates, actual delivery dates, and performance metrics. The module provides administrators with tools to manage batch data, calculate efficiency metrics, and identify delayed shipments.

## Glossary

- **Confeccionista**: A manufacturer or production entity responsible for creating products
- **Reference**: A product reference or SKU identifier
- **Batch**: A collection of items with the same reference produced by a confeccionista
- **Delivery Date**: The actual date when a batch was delivered to the customer
- **Expected Date**: The originally planned delivery date for a batch
- **Send Date**: The date when a batch was shipped from the confeccionista
- **Delay**: The difference between expected delivery date and actual delivery date (in days)
- **Rotation**: A production cycle or batch sequence number
- **Process**: The current status of a batch (e.g., pending, in-process, delivered)
- **Metric**: A calculated performance indicator (e.g., average delay, priority batches)
- **Admin**: A user with elevated permissions to create, edit, and delete delivery date records

## Requirements

### Requirement 1: Create and Store Delivery Date Records

**User Story:** As an administrator, I want to create and store delivery date records for manufacturing batches, so that I can track production and delivery timelines.

#### Acceptance Criteria

1. WHEN an administrator submits a new delivery date record, THE System SHALL validate all required fields and store the record in the delivery_dates table
2. WHEN a delivery date record is created, THE System SHALL automatically set the created_at timestamp and created_by user identifier
3. WHEN a delivery date record is stored, THE System SHALL associate it with the correct confeccionista and product reference
4. WHEN an administrator attempts to create a record with invalid data, THE System SHALL reject the submission and return a descriptive error message

### Requirement 2: Retrieve and Display Delivery Date Records

**User Story:** As a user, I want to view all delivery date records in a table format, so that I can monitor batch delivery status.

#### Acceptance Criteria

1. WHEN a user accesses the Delivery Dates view, THE System SHALL retrieve and display all delivery date records from the database
2. WHEN delivery date records are displayed, THE System SHALL show all relevant columns: confeccionista, reference, quantity, send_date, expected_date, delivery_date, date_difference, initial_rotation, final_rotation, rotation_difference, process, and observation
3. WHEN the table is loaded, THE System SHALL calculate and display the date difference (expected_date - delivery_date) for each record
4. WHEN the table is loaded, THE System SHALL calculate and display the rotation difference (final_rotation - initial_rotation) for each record

### Requirement 3: Update Delivery Date Records

**User Story:** As an administrator, I want to update delivery date records, so that I can correct information or reflect changes in delivery status.

#### Acceptance Criteria

1. WHEN an administrator edits a delivery date record in the table, THE System SHALL allow inline editing of all fields except id and created_at
2. WHEN an administrator clicks the save button, THE System SHALL validate all changes and update the records in the database
3. WHEN multiple records are modified, THE System SHALL save all changes in a single batch operation
4. WHEN a record is updated, THE System SHALL preserve the original created_at and created_by values

### Requirement 4: Delete Delivery Date Records

**User Story:** As an administrator, I want to delete delivery date records, so that I can remove incorrect or obsolete entries.

#### Acceptance Criteria

1. WHEN an administrator clicks the delete button for a record, THE System SHALL remove that record from the database
2. WHEN a record is deleted, THE System SHALL immediately update the table view to reflect the deletion
3. WHEN an administrator attempts to delete a record, THE System SHALL confirm the action before proceeding

### Requirement 5: Filter and Search Delivery Date Records

**User Story:** As a user, I want to filter delivery date records by confeccionista and date range, so that I can focus on specific batches.

#### Acceptance Criteria

1. WHEN a user selects a confeccionista from the filter dropdown, THE System SHALL display only records for that confeccionista
2. WHEN a user selects a date range, THE System SHALL display only records within that date range
3. WHEN a user enables the "hide delivered" option, THE System SHALL exclude records where process equals "delivered"
4. WHEN filters are applied, THE System SHALL update the table view without requiring a page reload

### Requirement 6: Calculate and Display Performance Metrics

**User Story:** As a user, I want to see key performance metrics, so that I can understand delivery efficiency and identify problem areas.

#### Acceptance Criteria

1. WHEN the Delivery Dates view is loaded, THE System SHALL calculate and display the following metrics:
   - Priority batches: count of batches with delay > 20 days
   - Batches in process: count of batches where process is not "delivered"
   - Average delay: mean of all date differences (in days)
   - Delivery efficiency: percentage of batches delivered on or before expected date
2. WHEN filters are applied, THE System SHALL recalculate metrics based on filtered data
3. WHEN a record is added or deleted, THE System SHALL update metrics in real-time

### Requirement 7: Manage User Permissions

**User Story:** As a system administrator, I want to restrict editing capabilities to authorized users, so that data integrity is maintained.

#### Acceptance Criteria

1. WHEN a non-admin user accesses the Delivery Dates view, THE System SHALL display the table in read-only mode
2. WHEN a non-admin user accesses the Delivery Dates view, THE System SHALL hide the add row, save, and delete buttons
3. WHEN an admin user accesses the Delivery Dates view, THE System SHALL display all editing controls
4. WHEN a non-admin user attempts to modify data through the API, THE System SHALL reject the request with a 403 Forbidden response

### Requirement 8: Validate Delivery Date Data

**User Story:** As a system administrator, I want data validation to ensure consistency, so that invalid records cannot be stored.

#### Acceptance Criteria

1. WHEN a delivery date record is submitted, THE System SHALL validate that all required fields are present and non-empty
2. WHEN a delivery date record is submitted, THE System SHALL validate that date fields contain valid date values
3. WHEN a delivery date record is submitted, THE System SHALL validate that quantity is a positive integer
4. WHEN a delivery date record is submitted, THE System SHALL validate that confeccionista_id and reference_id reference existing entities
5. IF invalid data is detected, THEN THE System SHALL return specific error messages for each invalid field

### Requirement 9: Handle Unsaved Changes

**User Story:** As a user, I want to be warned about unsaved changes, so that I don't accidentally lose data.

#### Acceptance Criteria

1. WHEN a user modifies a record in the table, THE System SHALL track that changes have been made
2. WHEN a user attempts to navigate away with unsaved changes, THE System SHALL display a confirmation dialog
3. WHEN a user clicks the save button, THE System SHALL clear the unsaved changes flag
4. WHEN a user clicks cancel or closes the dialog, THE System SHALL preserve the unsaved changes in the table

### Requirement 10: Integrate Delivery Dates Module into Application Navigation

**User Story:** As a user, I want the Delivery Dates module to be accessible from the main application menu, so that I can easily navigate to it.

#### Acceptance Criteria

1. WHEN the application loads, THE System SHALL display a "Delivery Dates" menu item in the main navigation
2. WHEN the menu item is positioned, THE System SHALL place it between "Comercial" and "Reportes" menu items
3. WHEN a user clicks the "Delivery Dates" menu item, THE System SHALL navigate to the Delivery Dates view
4. WHEN the Delivery Dates view is active, THE System SHALL highlight the corresponding menu item

### Requirement 11: Autocomplete Confeccionista Selection

**User Story:** As an administrator, I want to select confeccionistas using an autocomplete field, so that I can quickly find and select the correct manufacturer.

#### Acceptance Criteria

1. WHEN an administrator adds a new row or edits the confeccionista field, THE System SHALL display an autocomplete dropdown
2. WHEN the administrator types in the autocomplete field, THE System SHALL filter confeccionistas by name or identifier
3. WHEN the administrator selects a confeccionista from the dropdown, THE System SHALL populate the confeccionista_id field
4. WHEN no matching confeccionistas are found, THE System SHALL display a "no results" message

### Requirement 12: Add New Delivery Date Rows

**User Story:** As an administrator, I want to add new rows to the delivery dates table, so that I can enter new batch records.

#### Acceptance Criteria

1. WHEN an administrator clicks the "Add Row" button, THE System SHALL insert a new empty row at the end of the table
2. WHEN a new row is added, THE System SHALL allow the administrator to edit all fields
3. WHEN a new row is added, THE System SHALL not save it to the database until the save button is clicked
4. WHEN multiple rows are added, THE System SHALL allow editing all rows before saving

